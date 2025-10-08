"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User } from "./api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  // ---------------------------
  // Safe JSON parser - handles HTML comments before JSON
  // ---------------------------
  async function safeJson(res: Response) {
    const text = await res.text()
    console.log('Raw response text:', text)
    
    try {
      // Remove HTML comments and any other non-JSON content
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return null
    } catch (error) {
      console.error('Failed to parse JSON response:', error)
      console.error('Response text was:', text)
      return null
    }
  }

  // ---------------------------
  // Fetch CSRF cookie
  // ---------------------------
  async function fetchCsrf() {
    try {
      const response = await fetch(`${API_URL}/sanctum/csrf-cookie`, { 
        credentials: "include",
        headers: {
          'Accept': 'application/json',
        }
      })
      console.log('CSRF fetch status:', response.status)
      return response
    } catch (error) {
      console.error('CSRF fetch failed:', error)
      throw error
    }
  }

  // ---------------------------
  // Get XSRF token from cookie
  // ---------------------------
  function getXsrfToken(): string | null {
    if (typeof document === 'undefined') return null
    
    const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'))
    const token = match ? decodeURIComponent(match[2]) : null
    console.log('XSRF Token found:', !!token)
    return token
  }

  // ---------------------------
  // Refresh user silently
  // ---------------------------
  async function refreshUser() {
    setLoading(true)
    try {
      await fetchCsrf()
      const res = await fetch(`${API_URL}/api/user`, {
        credentials: "include",
        headers: { 
          'Accept': 'application/json',
        },
      })

      console.log('Refresh user status:', res.status)

      if (!res.ok) {
        setUser(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        return
      }

      const data = await safeJson(res)
      console.log('Refresh user response:', data)
      
      if (data?.user) {
        setUser(data.user)
        localStorage.setItem("user", JSON.stringify(data.user))
      } else {
        setUser(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------
  // Login
  // ---------------------------
  async function login(email: string, password: string) {
    setLoading(true)
    try {
      // First, get CSRF token
      console.log('Starting login process...')
      await fetchCsrf()
      const xsrfToken = getXsrfToken()
      
      if (!xsrfToken) {
        console.warn('CSRF token not found, proceeding without it')
      }

      const loginData = { 
        email: email.trim(), 
        password: password 
      }
      
      console.log('Sending login request:', { email: loginData.email, password: '***' })

      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        },
        body: JSON.stringify(loginData),
      })

      console.log('Login response status:', res.status)

      const data = await safeJson(res)
      console.log('Login response data:', data)

      if (!res.ok) {
        // Handle validation errors
        if (res.status === 422 && data?.errors) {
          const errorMessage = Object.values(data.errors).flat().join(', ')
          throw new Error(errorMessage || 'Validation failed')
        }
        
        const message = data?.message || data?.error || `Login failed with status ${res.status}`
        throw new Error(message)
      }

      // Check for user data - your response has both user and access_token
      if (!data?.user) {
        console.error('No user data found in response. Response structure:', data)
        throw new Error("Login failed: invalid response format - no user data")
      }
      
      // Store the access token if provided
      if (data.access_token) {
        localStorage.setItem("token", data.access_token)
        console.log('Access token stored')
      }
      
      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))
      console.log('Login successful, user stored:', data.user)
      return data.user
    } catch (error) {
      console.error('Login error:', error)
      throw error instanceof Error ? error : new Error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------
  // Register
  // ---------------------------
  async function register(name: string, email: string, password: string) {
    setLoading(true)
    try {
      await fetchCsrf()
      const xsrfToken = getXsrfToken()
      
      if (!xsrfToken) {
        console.warn('CSRF token not found, proceeding without it')
      }

      const registerData = { 
        name: name.trim(), 
        email: email.trim(), 
        password: password,
        password_confirmation: password 
      }
      
      console.log('Sending register request:', { name: registerData.name, email: registerData.email, password: '***' })

      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        },
        body: JSON.stringify(registerData),
      })

      console.log('Register response status:', res.status)
      
      const data = await safeJson(res)
      console.log('Register response data:', data)

      if (!res.ok) {
        // Handle validation errors
        if (res.status === 422 && data?.errors) {
          const errorMessage = Object.values(data.errors).flat().join(', ')
          throw new Error(errorMessage || 'Validation failed')
        }
        
        const message = data?.message || data?.error || `Registration failed with status ${res.status}`
        throw new Error(message)
      }

      // Check for user data
      if (!data?.user) {
        console.error('No user data found in response. Response structure:', data)
        throw new Error("Registration failed: invalid response format - no user data")
      }
      
      // Store the access token if provided
      if (data.access_token) {
        localStorage.setItem("token", data.access_token)
      }
      
      setUser(data.user)
      localStorage.setItem("user", JSON.stringify(data.user))
      return data.user
    } catch (error) {
      console.error('Registration error:', error)
      throw error instanceof Error ? error : new Error("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------
  // Logout
  // ---------------------------
  async function logout() {
    setLoading(true)
    try {
      await fetchCsrf()
      const xsrfToken = getXsrfToken()

      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
        },
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      setLoading(false)
    }
  }

  // ---------------------------
  // Initialize user from localStorage or API silently
  // ---------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        setLoading(false)
      } catch {
        // If stored user is invalid, clear it and refresh
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        refreshUser()
      }
    } else {
      refreshUser()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}