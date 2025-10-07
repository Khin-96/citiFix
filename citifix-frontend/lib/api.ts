const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
const BASE_URL = API_URL.replace("/api", "")

export interface User {
  id: number
  name: string
  email: string
  role: string
  points?: number
  avatar_url?: string
}

export interface Issue {
  id: number
  title: string
  description: string
  category: string
  status: string
  priority: string
  latitude: number
  longitude: number
  address: string
  votes_count: number
  comments_count: number
  user_voted?: boolean
  media: IssueMedia[]
  user: User
  assigned_to?: User
  created_at: string
  updated_at: string
}

export interface IssueMedia {
  id: number
  file_path: string
  file_type: string
  file_size: number
}

export interface Comment {
  id: number
  content: string
  user: User
  media: CommentMedia[]
  created_at: string
}

export interface CommentMedia {
  id: number
  file_path: string
  file_type: string
}

export interface Notification {
  id: string
  type: string
  data: {
    message: string
    issue_id?: number
    issue_title?: string
  }
  read_at: string | null
  created_at: string
}

export interface DashboardStats {
  total_issues: number
  pending_issues: number
  in_progress_issues: number
  resolved_issues: number
  verified_issues: number
  total_votes: number
  total_comments: number
  active_users: number
}

class ApiClient {
  private token: string | null = null
  private csrfToken: string | null = null
  private isInitialized = false

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
      this.csrfToken = this.getCsrfTokenFromCookie()
    }
  }

  private getCsrfTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null
    
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    if (match) {
      return decodeURIComponent(match[1])
    }
    return null
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  clearToken() {
    this.token = null
    this.csrfToken = null
    this.isInitialized = false
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  private async ensureInitialized() {
    if (this.isInitialized) return

    try {
      await this.fetchCsrfCookie()
      this.isInitialized = true
    } catch (error) {
      console.error("Failed to initialize API client:", error)
      throw new Error("Failed to initialize authentication. Please try again.")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      Accept: "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    // Add CSRF token for state-changing requests
    const csrfToken = this.getCsrfTokenFromCookie()
    if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method || "GET")) {
      headers["X-XSRF-TOKEN"] = csrfToken
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      })

      // Handle empty responses
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return null
      }

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }
        return null
      }

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.message || data.error || `Request failed with status ${response.status}`
        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        console.error(`API Error [${options.method || "GET"} ${endpoint}]:`, error.message)
        throw error
      }
      console.error(`API Error [${options.method || "GET"} ${endpoint}]:`, error)
      throw new Error("An unexpected error occurred. Please try again.")
    }
  }

  // Auth
  async fetchCsrfCookie() {
    try {
      const response = await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF cookie: ${response.status}`)
      }

      // Extract and store CSRF token
      this.csrfToken = this.getCsrfTokenFromCookie()
    } catch (error) {
      console.error("CSRF cookie fetch error:", error)
      throw new Error("Failed to initialize security tokens. Please check your connection.")
    }
  }

  async login(email: string, password: string) {
    try {
      await this.ensureInitialized()

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(this.csrfToken && { "X-XSRF-TOKEN": this.csrfToken }),
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.")
      }

      if (data.token) {
        this.setToken(data.token)
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        console.error("Login error:", error.message)
        throw error
      }
      console.error("Login error:", error)
      throw new Error("Login failed. Please try again.")
    }
  }

  async register(name: string, email: string, password: string, role = "citizen") {
    try {
      await this.ensureInitialized()

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(this.csrfToken && { "X-XSRF-TOKEN": this.csrfToken }),
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          password_confirmation: password, 
          role 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.")
      }

      if (data.token) {
        this.setToken(data.token)
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        console.error("Registration error:", error.message)
        throw error
      }
      console.error("Registration error:", error)
      throw new Error("Registration failed. Please try again.")
    }
  }

  async logout() {
    try {
      await this.request("/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.clearToken()
    }
  }

  async getUser() {
    return this.request("/user")
  }

  // Issues
  async getIssues(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request(`/issues${query}`)
  }

  async getIssue(id: number) {
    return this.request(`/issues/${id}`)
  }

  async createIssue(formData: FormData) {
    try {
      const headers: HeadersInit = {
        Accept: "application/json",
      }

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`
      }

      const csrfToken = this.getCsrfTokenFromCookie()
      if (csrfToken) {
        headers["X-XSRF-TOKEN"] = csrfToken
      }

      const response = await fetch(`${API_URL}/issues`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: "Failed to create issue" 
        }))
        throw new Error(errorData.message || "Failed to create issue")
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        console.error("Create issue error:", error.message)
        throw error
      }
      console.error("Create issue error:", error)
      throw new Error("Failed to create issue. Please try again.")
    }
  }

  async updateIssue(id: number, data: Partial<Issue>) {
    return this.request(`/issues/${id}`, { 
      method: "PUT", 
      body: JSON.stringify(data) 
    })
  }

  async deleteIssue(id: number) {
    return this.request(`/issues/${id}`, { method: "DELETE" })
  }

  async voteIssue(id: number) {
    return this.request(`/issues/${id}/vote`, { method: "POST" })
  }

  async unvoteIssue(id: number) {
    return this.request(`/issues/${id}/unvote`, { method: "DELETE" })
  }

  // Comments
  async getComments(issueId: number) {
    return this.request(`/issues/${issueId}/comments`)
  }

  async createComment(issueId: number, formData: FormData) {
    try {
      const headers: HeadersInit = {
        Accept: "application/json",
      }

      if (this.token) {
        headers["Authorization"] = `Bearer ${this.token}`
      }

      const csrfToken = this.getCsrfTokenFromCookie()
      if (csrfToken) {
        headers["X-XSRF-TOKEN"] = csrfToken
      }

      const response = await fetch(`${API_URL}/issues/${issueId}/comments`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: "Failed to create comment" 
        }))
        throw new Error(errorData.message || "Failed to create comment")
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        console.error("Create comment error:", error.message)
        throw error
      }
      console.error("Create comment error:", error)
      throw new Error("Failed to create comment. Please try again.")
    }
  }

  async deleteComment(issueId: number, commentId: number) {
    return this.request(`/issues/${issueId}/comments/${commentId}`, { 
      method: "DELETE" 
    })
  }

  // Dashboard & Leaderboard
  async getDashboardStats() {
    return this.request("/dashboard/stats")
  }

  async getDashboardTrends(period = "7days") {
    return this.request(`/dashboard/trends?period=${period}`)
  }

  async getDashboardCategories() {
    return this.request("/dashboard/categories")
  }

  async exportData(format = "json") {
    return this.request(`/dashboard/export?format=${format}`)
  }

  async getLeaderboard(period = "all") {
    return this.request(`/leaderboard?period=${period}`)
  }

  // Notifications
  async getNotifications() {
    return this.request("/notifications")
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: "POST" })
  }

  async markAllNotificationsRead() {
    return this.request("/notifications/read-all", { method: "POST" })
  }
}

export const api = new ApiClient()