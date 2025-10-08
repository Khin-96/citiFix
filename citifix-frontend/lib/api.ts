const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE_URL = API_URL;

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  points?: number;
  avatar_url?: string;
  email_verified_at?: string;
  created_at?: string;
  updated_at?: string;
  roles?: Array<{
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    pivot: {
      model_type: string;
      model_id: number;
      role_id: number;
    };
  }>;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  address: string;
  votes_count: number;
  comments_count: number;
  user_voted?: boolean;
  media: IssueMedia[];
  user: User;
  assigned_to?: User;
  created_at: string;
  updated_at: string;
}

export interface IssueMedia {
  id: number;
  file_path: string;
  file_type: string;
  file_size: number;
}

export interface Comment {
  id: number;
  content: string;
  user: User;
  media: CommentMedia[];
  created_at: string;
}

export interface CommentMedia {
  id: number;
  file_path: string;
  file_type: string;
}

export interface Notification {
  id: string;
  type: string;
  data: {
    message: string;
    issue_id?: number;
    issue_title?: string;
  };
  read_at: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_issues: number;
  pending_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  verified_issues: number;
  total_votes: number;
  total_comments: number;
  active_users: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private token: string | null = null;
  private csrfToken: string | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
      this.csrfToken = this.getCsrfTokenFromCookie();
    }
  }

  private getCsrfTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  clearToken() {
    this.token = null;
    this.csrfToken = null;
    this.isInitialized = false;
    this.initializationPromise = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize();
    }

    return this.initializationPromise;
  }

  private async initialize(): Promise<void> {
    try {
      await this.fetchCsrfCookie();
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize API client:", error);
      this.initializationPromise = null;
      throw new Error("Failed to initialize authentication. Please try again.");
    }
  }

  private async fetchCsrfCookie(): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF cookie: ${response.status}`);
      }

      // Update CSRF token from cookie
      this.csrfToken = this.getCsrfTokenFromCookie();
    } catch (error) {
      console.error("CSRF cookie fetch error:", error);
      throw new Error("Failed to initialize security tokens. Please check your connection.");
    }
  }

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    await this.ensureInitialized();

    const headers: HeadersInit = {
      Accept: "application/json",
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    // Add CSRF token for state-changing requests
    const csrfToken = this.getCsrfTokenFromCookie();
    if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method || "GET")) {
      headers["X-XSRF-TOKEN"] = csrfToken;
    }

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData) && options.body) {
      headers["Content-Type"] = "application/json";
    }

    try {
      const response = await fetch(`${API_URL}/api${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      // Handle empty responses (like 204 No Content)
      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return null as T;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return null as T;
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.error || `Request failed with status ${response.status}`;
        
        // Handle authentication errors
        if (response.status === 401) {
          this.clearToken();
          throw new Error("Authentication failed. Please login again.");
        }
        
        // Handle validation errors
        if (response.status === 422 && data.errors) {
          const validationErrors = Object.values(data.errors).flat().join(", ");
          throw new Error(validationErrors || "Validation failed");
        }
        
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`API Error [${options.method || "GET"} ${endpoint}]:`, error.message);
        throw error;
      }
      console.error(`API Error [${options.method || "GET"} ${endpoint}]:`, error);
      throw new Error("An unexpected error occurred. Please try again.");
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ user: User; access_token?: string; message?: string }> {
    try {
      await this.ensureInitialized();

      const data = await this.request<{ 
        user: User; 
        access_token?: string; 
        message?: string;
        token_type?: string;
      }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.access_token) {
        this.setToken(data.access_token);
      }

      // Store user data in localStorage for persistence
      if (typeof window !== "undefined" && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Login error:", error.message);
        throw error;
      }
      throw new Error("Login failed. Please try again.");
    }
  }

  async register(
    name: string, 
    email: string, 
    password: string, 
    role = "citizen"
  ): Promise<{ user: User; access_token?: string; message?: string }> {
    try {
      await this.ensureInitialized();

      const data = await this.request<{ 
        user: User; 
        access_token?: string; 
        message?: string;
        token_type?: string;
      }>("/register", {
        method: "POST",
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          password_confirmation: password, 
          role 
        }),
      });

      if (data.access_token) {
        this.setToken(data.access_token);
      }

      // Store user data in localStorage for persistence
      if (typeof window !== "undefined" && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Registration error:", error.message);
        throw error;
      }
      throw new Error("Registration failed. Please try again.");
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request("/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearToken();
    }
  }

  async getUser(): Promise<{ user: User }> {
    const data = await this.request<{ user: User }>("/user");
    
    // Update localStorage with fresh user data
    if (typeof window !== "undefined" && data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    
    return data;
  }

  // Helper to get stored user from localStorage
  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Issues
  async getIssues(params?: Record<string, string>): Promise<{ data: Issue[] }> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<{ data: Issue[] }>(`/issues${query}`);
  }

  async getIssue(id: number): Promise<{ data: Issue }> {
    return this.request<{ data: Issue }>(`/issues/${id}`);
  }

  async createIssue(formData: FormData): Promise<{ data: Issue }> {
    return this.request<{ data: Issue }>("/issues", {
      method: "POST",
      body: formData,
    });
  }

  async updateIssue(id: number, data: Partial<Issue>): Promise<{ data: Issue }> {
    return this.request<{ data: Issue }>(`/issues/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteIssue(id: number): Promise<void> {
    return this.request(`/issues/${id}`, { method: "DELETE" });
  }

  async voteIssue(id: number): Promise<{ data: Issue }> {
    return this.request<{ data: Issue }>(`/issues/${id}/vote`, { method: "POST" });
  }

  async unvoteIssue(id: number): Promise<{ data: Issue }> {
    return this.request<{ data: Issue }>(`/issues/${id}/vote`, { method: "DELETE" });
  }

  // Comments
  async getComments(issueId: number): Promise<{ data: Comment[] }> {
    return this.request<{ data: Comment[] }>(`/issues/${issueId}/comments`);
  }

  async createComment(issueId: number, formData: FormData): Promise<{ data: Comment }> {
    return this.request<{ data: Comment }>(`/issues/${issueId}/comments`, {
      method: "POST",
      body: formData,
    });
  }

  async deleteComment(issueId: number, commentId: number): Promise<void> {
    return this.request(`/issues/${issueId}/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  // Dashboard & Leaderboard
  async getDashboardStats(): Promise<{ data: DashboardStats }> {
    return this.request<{ data: DashboardStats }>("/dashboard/stats");
  }

  async getLeaderboard(period = "all"): Promise<any> {
    return this.request(`/leaderboard?period=${period}`);
  }

  // Notifications
  async getNotifications(): Promise<{ data: Notification[] }> {
    return this.request<{ data: Notification[] }>("/notifications");
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request(`/notifications/${id}/read`, { method: "POST" });
  }

  async markAllNotificationsRead(): Promise<void> {
    return this.request("/notifications/read-all", { method: "POST" });
  }
}

export const api = new ApiClient();