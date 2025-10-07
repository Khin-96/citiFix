"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { api, type User } from "./api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setLoading(false)
    } else {
      checkAuth()
    }
  }, [])

  async function checkAuth() {
    try {
      const userData = await api.getUser()
      setUser(userData.user)
      localStorage.setItem("user", JSON.stringify(userData.user))
    } catch (error) {
      setUser(null)
      localStorage.removeItem("user")
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const data = await api.login(email, password)
    setUser(data.user)
    localStorage.setItem("user", JSON.stringify(data.user))
  }

  async function register(name: string, email: string, password: string, role = "citizen") {
    const data = await api.register(name, email, password, role)
    setUser(data.user)
    localStorage.setItem("user", JSON.stringify(data.user))
  }

  async function logout() {
    await api.logout()
    setUser(null)
    localStorage.removeItem("user")
  }

  async function refreshUser() {
    try {
      const userData = await api.getUser()
      setUser(userData.user)
      localStorage.setItem("user", JSON.stringify(userData.user))
    } catch (error) {
      setUser(null)
      localStorage.removeItem("user")
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
