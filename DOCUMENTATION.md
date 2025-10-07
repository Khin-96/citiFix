# CitiFix - Frontend to Backend Connection Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Structure (Laravel)](#backend-structure-laravel)
3. [Frontend Structure (Next.js)](#frontend-structure-nextjs)
4. [Database Configuration](#database-configuration)
5. [API Connection Flow](#api-connection-flow)
6. [File-to-File Mapping](#file-to-file-mapping)
7. [Authentication Flow](#authentication-flow)
8. [Feature Implementations](#feature-implementations)

---

## Architecture Overview

CitiFix is a full-stack crowdsourced civic issues tracking system with:

- **Backend**: Laravel 11 REST API
- **Frontend**: Next.js 14+ with TypeScript
- **Database**: MySQL (managed via PHPMyAdmin)
- **Authentication**: Laravel Sanctum (token-based)

\`\`\`
┌─────────────────┐         HTTP/REST API        ┌─────────────────┐
│                 │ ◄──────────────────────────► │                 │
│  Next.js        │    (JSON over HTTPS)         │  Laravel API    │
│  Frontend       │                              │  Backend        │
│                 │                              │                 │
└─────────────────┘                              └────────┬────────┘
                                                          │
                                                          │ Eloquent ORM
                                                          ▼
                                                  ┌─────────────────┐
                                                  │  MySQL Database │
                                                  │  (PHPMyAdmin)   │
                                                  └─────────────────┘
\`\`\`

---

## Backend Structure (Laravel)

### Directory Structure
\`\`\`
citifix-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/          # API Controllers
│   │   │   ├── AuthController.php
│   │   │   ├── IssueController.php
│   │   │   ├── IssueVoteController.php
│   │   │   ├── IssueCommentController.php
│   │   │   ├── LeaderboardController.php
│   │   │   ├── DashboardController.php
│   │   │   └── NotificationController.php
│   │   ├── Requests/                 # Form validation
│   │   │   ├── StoreIssueRequest.php
│   │   │   └── UpdateIssueRequest.php
│   │   └── Middleware/               # Auth middleware
│   ├── Models/                       # Database models
│   │   ├── User.php
│   │   ├── Issue.php
│   │   ├── IssueVote.php
│   │   ├── IssueComment.php
│   │   ├── IssueMedia.php
│   │   └── CommentMedia.php
│   ├── Notifications/                # Email/DB notifications
│   │   ├── IssueAssigned.php
│   │   ├── IssueStatusChanged.php
│   │   └── NewCommentOnIssue.php
│   └── Observers/                    # Model event listeners
│       ├── IssueObserver.php
│       └── IssueCommentObserver.php
├── database/
│   ├── migrations/                   # Database schema
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 2024_01_03_000001_create_issues_table.php
│   │   ├── 2024_01_03_000002_create_issue_media_table.php
│   │   ├── 2024_01_03_000003_create_issue_votes_table.php
│   │   ├── 2024_01_03_000004_create_issue_comments_table.php
│   │   └── 2024_01_04_000001_create_notifications_table.php
│   └── seeders/                      # Sample data
│       ├── RoleSeeder.php
│       └── UserSeeder.php
├── routes/
│   └── api.php                       # API route definitions
├── config/
│   ├── auth.php                      # Authentication config
│   ├── sanctum.php                   # API token config
│   └── database.php                  # Database config
└── .env                              # Environment variables
\`\`\`

### Key Backend Files

#### 1. **routes/api.php** - API Route Definitions
Defines all API endpoints that the frontend can call.

\`\`\`php
// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Issue routes
Route::get('/issues', [IssueController::class, 'index']);
Route::post('/issues', [IssueController::class, 'store'])->middleware('auth:sanctum');
Route::get('/issues/{id}', [IssueController::class, 'show']);
Route::patch('/issues/{id}', [IssueController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/issues/{id}', [IssueController::class, 'destroy'])->middleware('auth:sanctum');

// Vote routes
Route::post('/issues/{id}/vote', [IssueVoteController::class, 'vote'])->middleware('auth:sanctum');
Route::delete('/issues/{id}/vote', [IssueVoteController::class, 'unvote'])->middleware('auth:sanctum');

// Comment routes
Route::get('/issues/{id}/comments', [IssueCommentController::class, 'index']);
Route::post('/issues/{id}/comments', [IssueCommentController::class, 'store'])->middleware('auth:sanctum');
Route::delete('/issues/{issueId}/comments/{commentId}', [IssueCommentController::class, 'destroy'])->middleware('auth:sanctum');

// Dashboard routes
Route::get('/dashboard/stats', [DashboardController::class, 'stats'])->middleware('auth:sanctum');
Route::get('/dashboard/trends', [DashboardController::class, 'trends'])->middleware('auth:sanctum');

// Leaderboard routes
Route::get('/leaderboard', [LeaderboardController::class, 'index']);

// Notification routes
Route::get('/notifications', [NotificationController::class, 'index'])->middleware('auth:sanctum');
Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->middleware('auth:sanctum');
\`\`\`

#### 2. **app/Models/** - Database Models
Laravel Eloquent models that interact with MySQL database tables.

**User.php** - Represents users table
**Issue.php** - Represents issues table
**IssueVote.php** - Represents issue_votes table
**IssueComment.php** - Represents issue_comments table

---

## Frontend Structure (Next.js)

### Directory Structure
\`\`\`
citifix-frontend/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth pages group
│   │   ├── login/
│   │   │   └── page.tsx             # Login page
│   │   └── register/
│   │       └── page.tsx             # Register page
│   ├── issues/                       # Issues pages
│   │   ├── [id]/
│   │   │   └── page.tsx             # Single issue detail
│   │   ├── new/
│   │   │   └── page.tsx             # Create new issue
│   │   └── page.tsx                 # Issues list
│   ├── dashboard/
│   │   └── page.tsx                 # Admin dashboard
│   ├── leaderboard/
│   │   └── page.tsx                 # User leaderboard
│   ├── notifications/
│   │   └── page.tsx                 # Notifications page
│   ├── profile/
│   │   └── page.tsx                 # User profile
│   ├── map/
│   │   └── page.tsx                 # Issues map view
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
├── lib/
│   ├── api.ts                       # API client (connects to backend)
│   └── auth-context.tsx             # Authentication context
├── components/
│   ├── navbar.tsx                   # Navigation bar
│   ├── issue-card.tsx               # Issue display component
│   └── ui/                          # Shadcn UI components
└── .env.local                       # Environment variables
\`\`\`

### Key Frontend Files

#### 1. **lib/api.ts** - API Client (MOST IMPORTANT)
This is the central file that connects the frontend to the backend. It contains all API call functions.

\`\`\`typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Authentication functions
export const api = {
  // Auth
  login: (email: string, password: string) => 
    fetch(`${API_URL}/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
  
  register: (name: string, email: string, password: string, role: string) =>
    fetch(`${API_URL}/register`, { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  
  logout: () =>
    fetch(`${API_URL}/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  
  getUser: () =>
    fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } }),

  // Issues
  getIssues: (params?: object) =>
    fetch(`${API_URL}/issues?${new URLSearchParams(params)}`),
  
  getIssue: (id: number) =>
    fetch(`${API_URL}/issues/${id}`),
  
  createIssue: (data: FormData) =>
    fetch(`${API_URL}/issues`, { method: 'POST', body: data, headers: { Authorization: `Bearer ${token}` } }),
  
  updateIssue: (id: number, data: Partial<Issue>) =>
    fetch(`${API_URL}/issues/${id}`, { method: 'PATCH', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
  
  deleteIssue: (id: number) =>
    fetch(`${API_URL}/issues/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  // Votes
  voteIssue: (id: number) =>
    fetch(`${API_URL}/issues/${id}/vote`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  
  unvoteIssue: (id: number) =>
    fetch(`${API_URL}/issues/${id}/vote`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  // Comments
  getComments: (issueId: number) =>
    fetch(`${API_URL}/issues/${issueId}/comments`),
  
  createComment: (issueId: number, data: FormData) =>
    fetch(`${API_URL}/issues/${issueId}/comments`, { method: 'POST', body: data, headers: { Authorization: `Bearer ${token}` } }),
  
  deleteComment: (issueId: number, commentId: number) =>
    fetch(`${API_URL}/issues/${issueId}/comments/${commentId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  // Dashboard
  getDashboardStats: () =>
    fetch(`${API_URL}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
  
  getDashboardTrends: (period: string) =>
    fetch(`${API_URL}/dashboard/trends?period=${period}`, { headers: { Authorization: `Bearer ${token}` } }),

  // Leaderboard
  getLeaderboard: (period: string) =>
    fetch(`${API_URL}/leaderboard?period=${period}`),

  // Notifications
  getNotifications: () =>
    fetch(`${API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
  
  markNotificationRead: (id: number) =>
    fetch(`${API_URL}/notifications/${id}/read`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
}
\`\`\`

#### 2. **lib/auth-context.tsx** - Authentication State Management
Manages user authentication state across the application.

\`\`\`typescript
import { api } from './api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    const data = await api.register(name, email, password, role)
    setToken(data.token)
    setUser(data.user)
  }

  const logout = async () => {
    await api.logout()
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
\`\`\`

---

## Database Configuration

### Backend Database Setup (.env file)

\`\`\`env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=citifix
DB_USERNAME=root
DB_PASSWORD=your_password
\`\`\`

### Database Tables (Created by Migrations)

1. **users** - User accounts
   - id, name, email, password, role, created_at, updated_at

2. **issues** - Civic issues
   - id, user_id, title, description, category, status, priority, latitude, longitude, address, assigned_to, created_at, updated_at, deleted_at

3. **issue_votes** - User votes on issues
   - id, user_id, issue_id, created_at, updated_at

4. **issue_comments** - Comments on issues
   - id, issue_id, user_id, comment, created_at, updated_at

5. **issue_media** - Images/files attached to issues
   - id, issue_id, file_path, file_type, created_at, updated_at

6. **comment_media** - Images/files attached to comments
   - id, comment_id, file_path, file_type, created_at, updated_at

7. **notifications** - User notifications
   - id, type, notifiable_type, notifiable_id, data, read_at, created_at, updated_at

8. **personal_access_tokens** - API authentication tokens (Laravel Sanctum)
   - id, tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at

### PHPMyAdmin Access

1. Open PHPMyAdmin: `http://localhost/phpmyadmin`
2. Login with MySQL credentials
3. Select `citifix` database
4. View/edit tables directly

---

## API Connection Flow

### Environment Variable Configuration

**Frontend (.env.local)**
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

**Backend (.env)**
\`\`\`env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
\`\`\`

### Request Flow Diagram

\`\`\`
┌──────────────────────────────────────────────────────────────────┐
│                         REQUEST FLOW                              │
└──────────────────────────────────────────────────────────────────┘

1. User Action (Frontend)
   ↓
2. React Component (e.g., app/issues/page.tsx)
   ↓
3. API Client Function (lib/api.ts)
   ↓
4. HTTP Request with Token
   ↓
5. Laravel Route (routes/api.php)
   ↓
6. Middleware (auth:sanctum)
   ↓
7. Controller Method (app/Http/Controllers/Api/*)
   ↓
8. Model/Database Query (app/Models/*)
   ↓
9. MySQL Database (via Eloquent ORM)
   ↓
10. JSON Response
   ↓
11. API Client Receives Data
   ↓
12. React Component Updates State
   ↓
13. UI Re-renders with New Data
\`\`\`

---

## File-to-File Mapping

### Authentication Flow

| Frontend File | Function | Backend File | Endpoint |
|--------------|----------|--------------|----------|
| `app/(auth)/login/page.tsx` | Login form | `app/Http/Controllers/Api/AuthController.php` | `POST /api/login` |
| `app/(auth)/register/page.tsx` | Register form | `app/Http/Controllers/Api/AuthController.php` | `POST /api/register` |
| `lib/auth-context.tsx` | Auth state | `app/Http/Controllers/Api/AuthController.php` | `GET /api/me` |
| `lib/api.ts` → `login()` | API call | `routes/api.php` → `AuthController@login` | `POST /api/login` |
| `lib/api.ts` → `logout()` | API call | `routes/api.php` → `AuthController@logout` | `POST /api/logout` |

**Connection:**
\`\`\`
app/(auth)/login/page.tsx
  → calls lib/auth-context.tsx → login()
    → calls lib/api.ts → api.login()
      → HTTP POST to http://localhost:8000/api/login
        → routes/api.php → Route::post('/login')
          → app/Http/Controllers/Api/AuthController.php → login()
            → app/Models/User.php → database query
              → MySQL users table
\`\`\`

### Issues Management

| Frontend File | Function | Backend File | Endpoint |
|--------------|----------|--------------|----------|
| `app/issues/page.tsx` | List issues | `app/Http/Controllers/Api/IssueController.php` | `GET /api/issues` |
| `app/issues/[id]/page.tsx` | View issue | `app/Http/Controllers/Api/IssueController.php` | `GET /api/issues/{id}` |
| `app/issues/new/page.tsx` | Create issue | `app/Http/Controllers/Api/IssueController.php` | `POST /api/issues` |
| `lib/api.ts` → `getIssues()` | API call | `routes/api.php` → `IssueController@index` | `GET /api/issues` |
| `lib/api.ts` → `createIssue()` | API call | `routes/api.php` → `IssueController@store` | `POST /api/issues` |
| `lib/api.ts` → `updateIssue()` | API call | `routes/api.php` → `IssueController@update` | `PATCH /api/issues/{id}` |
| `lib/api.ts` → `deleteIssue()` | API call | `routes/api.php` → `IssueController@destroy` | `DELETE /api/issues/{id}` |

**Connection:**
\`\`\`
app/issues/page.tsx
  → useEffect() calls fetchIssues()
    → calls lib/api.ts → api.getIssues()
      → HTTP GET to http://localhost:8000/api/issues
        → routes/api.php → Route::get('/issues')
          → app/Http/Controllers/Api/IssueController.php → index()
            → app/Models/Issue.php → Issue::with('user')->paginate()
              → MySQL issues table (JOIN users table)
                → Returns JSON response
                  → app/issues/page.tsx updates state
                    → UI renders issue list
\`\`\`

### Voting System

| Frontend File | Function | Backend File | Endpoint |
|--------------|----------|--------------|----------|
| `app/issues/page.tsx` | Vote button | `app/Http/Controllers/Api/IssueVoteController.php` | `POST /api/issues/{id}/vote` |
| `app/issues/[id]/page.tsx` | Vote button | `app/Http/Controllers/Api/IssueVoteController.php` | `DELETE /api/issues/{id}/vote` |
| `lib/api.ts` → `voteIssue()` | API call | `routes/api.php` → `IssueVoteController@vote` | `POST /api/issues/{id}/vote` |
| `lib/api.ts` → `unvoteIssue()` | API call | `routes/api.php` → `IssueVoteController@unvote` | `DELETE /api/issues/{id}/vote` |

**Connection:**
\`\`\`
app/issues/page.tsx
  → handleVote() function
    → calls lib/api.ts → api.voteIssue(id)
      → HTTP POST to http://localhost:8000/api/issues/{id}/vote
        → routes/api.php → Route::post('/issues/{id}/vote')
          → app/Http/Controllers/Api/IssueVoteController.php → vote()
            → app/Models/IssueVote.php → IssueVote::create()
              → MySQL issue_votes table
                → Returns success response
                  → app/issues/page.tsx calls fetchIssues() to refresh
\`\`\`

### Comments System

| Frontend File | Function | Backend File | Endpoint |
|--------------|----------|--------------|----------|
| `app/issues/[id]/page.tsx` | Comments list | `app/Http/Controllers/Api/IssueCommentController.php` | `GET /api/issues/{id}/comments` |
| `app/issues/[id]/page.tsx` | Add comment | `app/Http/Controllers/Api/IssueCommentController.php` | `POST /api/issues/{id}/comments` |
| `app/issues/[id]/page.tsx` | Delete comment | `app/Http/Controllers/Api/IssueCommentController.php` | `DELETE /api/issues/{issueId}/comments/{commentId}` |
| `lib/api.ts` → `getComments()` | API call | `routes/api.php` → `IssueCommentController@index` | `GET /api/issues/{id}/comments` |
| `lib/api.ts` → `createComment()` | API call | `routes/api.php` → `IssueCommentController@store` | `POST /api/issues/{id}/comments` |

**Connection:**
\`\`\`
app/issues/[id]/page.tsx
  → useEffect() calls fetchComments()
    → calls lib/api.ts → api.getComments(issueId)
      → HTTP GET to http://localhost:8000/api/issues/{id}/comments
        → routes/api.php → Route::get('/issues/{id}/comments')
          → app/Http/Controllers/Api/IssueCommentController.php → index()
            → app/Models/IssueComment.php → IssueComment::where('issue_id', $id)->get()
              → MySQL issue_comments table
                → Returns JSON array of comments
                  → app/issues/[id]/page.tsx updates comments state
                    → UI renders comments list
\`\`\`

### Dashboard Analytics

| Frontend File | Function | Backend File | Endpoint |
|--------------|----------|--------------|----------|
| `app/dashboard/page.tsx` | Dashboard stats | `app/Http/Controllers/Api/DashboardController.php` | `GET /api/dashboard/stats` |
| `app/dashboard/page.tsx` | Trends chart | `app/Http/Controllers/Api/DashboardController.php` | `GET /api/dashboard/trends` |
| `lib/api.ts` → `getDashboardStats()` | API call | `routes/api.php` → `DashboardController@stats` | `GET /api/dashboard/stats` |
| `lib/api.ts` → `getDashboardTrends()` | API call | `routes/api.php` → `DashboardController@trends` | `GET /api/dashboard/trends` |

### Leaderboard

| Frontend File | Function | Backend File | Endpoint |
|--------------|----------|--------------|----------|
| `app/leaderboard/page.tsx` | User rankings | `app/Http/Controllers/Api/LeaderboardController.php` | `GET /api/leaderboard` |
| `lib/api.ts` → `getLeaderboard()` | API call | `routes/api.php` → `LeaderboardController@index` | `GET /api/leaderboard` |

### Notifications

| Frontend File | Function | Backend File | Endpoint |
|--------------|----------|--------------|----------|
| `app/notifications/page.tsx` | Notifications list | `app/Http/Controllers/Api/NotificationController.php` | `GET /api/notifications` |
| `app/notifications/page.tsx` | Mark as read | `app/Http/Controllers/Api/NotificationController.php` | `POST /api/notifications/{id}/read` |
| `lib/api.ts` → `getNotifications()` | API call | `routes/api.php` → `NotificationController@index` | `GET /api/notifications` |
| `lib/api.ts` → `markNotificationRead()` | API call | `routes/api.php` → `NotificationController@markAsRead` | `POST /api/notifications/{id}/read` |

---

## Authentication Flow

### 1. User Registration

\`\`\`
Frontend: app/(auth)/register/page.tsx
  ↓ User fills form and submits
  ↓ Calls: lib/auth-context.tsx → register()
  ↓ Calls: lib/api.ts → api.register(name, email, password, role)
  ↓ HTTP POST: http://localhost:8000/api/register
  ↓
Backend: routes/api.php → Route::post('/register')
  ↓ Calls: app/Http/Controllers/Api/AuthController.php → register()
  ↓ Validates input
  ↓ Creates user: app/Models/User.php → User::create()
  ↓ Saves to: MySQL users table
  ↓ Creates token: $user->createToken('auth_token')
  ↓ Saves to: MySQL personal_access_tokens table
  ↓ Returns: { user: {...}, token: "..." }
  ↓
Frontend: lib/auth-context.tsx
  ↓ Stores token in localStorage
  ↓ Updates user state
  ↓ Redirects to dashboard
\`\`\`

### 2. User Login

\`\`\`
Frontend: app/(auth)/login/page.tsx
  ↓ User enters credentials
  ↓ Calls: lib/auth-context.tsx → login()
  ↓ Calls: lib/api.ts → api.login(email, password)
  ↓ HTTP POST: http://localhost:8000/api/login
  ↓
Backend: routes/api.php → Route::post('/login')
  ↓ Calls: app/Http/Controllers/Api/AuthController.php → login()
  ↓ Validates credentials
  ↓ Queries: app/Models/User.php → User::where('email', $email)->first()
  ↓ Checks: MySQL users table
  ↓ Verifies password: Hash::check($password, $user->password)
  ↓ Creates token: $user->createToken('auth_token')
  ↓ Returns: { user: {...}, token: "..." }
  ↓
Frontend: lib/auth-context.tsx
  ↓ Stores token in localStorage
  ↓ Updates user state
  ↓ Redirects to dashboard
\`\`\`

### 3. Authenticated Requests

\`\`\`
Frontend: Any page (e.g., app/issues/new/page.tsx)
  ↓ User creates new issue
  ↓ Calls: lib/api.ts → api.createIssue(formData)
  ↓ Adds header: Authorization: Bearer {token}
  ↓ HTTP POST: http://localhost:8000/api/issues
  ↓
Backend: routes/api.php → Route::post('/issues')->middleware('auth:sanctum')
  ↓ Middleware: app/Http/Middleware/Authenticate.php
  ↓ Validates token: Checks personal_access_tokens table
  ↓ Loads user: Sets $request->user()
  ↓ Calls: app/Http/Controllers/Api/IssueController.php → store()
  ↓ Validates: app/Http/Requests/StoreIssueRequest.php
  ↓ Creates issue: app/Models/Issue.php → Issue::create()
  ↓ Saves to: MySQL issues table
  ↓ Returns: { issue: {...} }
  ↓
Frontend: app/issues/new/page.tsx
  ↓ Receives response
  ↓ Redirects to issue detail page
\`\`\`

---

## Feature Implementations

### Creating a New Issue (Complete Flow)

**Frontend Files Involved:**
1. `app/issues/new/page.tsx` - Create issue form
2. `lib/api.ts` - API client
3. `lib/auth-context.tsx` - Get auth token

**Backend Files Involved:**
1. `routes/api.php` - Route definition
2. `app/Http/Controllers/Api/IssueController.php` - Controller
3. `app/Http/Requests/StoreIssueRequest.php` - Validation
4. `app/Models/Issue.php` - Model
5. `app/Observers/IssueObserver.php` - Event listener
6. `database/migrations/2024_01_03_000001_create_issues_table.php` - Table schema

**Database Tables Involved:**
- `issues` - Main issue data
- `issue_media` - Attached images
- `users` - Issue creator

**Step-by-Step:**

1. **User fills form** in `app/issues/new/page.tsx`
   \`\`\`tsx
   const handleSubmit = async (e) => {
     const formData = new FormData()
     formData.append('title', title)
     formData.append('description', description)
     formData.append('category', category)
     // ... more fields
   }
   \`\`\`

2. **Form submits** to `lib/api.ts`
   \`\`\`typescript
   const data = await api.createIssue(formData)
   \`\`\`

3. **API client sends request**
   \`\`\`typescript
   createIssue: (data: FormData) =>
     fetch(`${API_URL}/issues`, {
       method: 'POST',
       body: data,
       headers: {
         Authorization: `Bearer ${localStorage.getItem('token')}`
       }
     })
   \`\`\`

4. **Backend receives request** at `routes/api.php`
   \`\`\`php
   Route::post('/issues', [IssueController::class, 'store'])
     ->middleware('auth:sanctum');
   \`\`\`

5. **Middleware authenticates** user
   - Checks `personal_access_tokens` table
   - Loads user from `users` table

6. **Controller validates** in `app/Http/Controllers/Api/IssueController.php`
   \`\`\`php
   public function store(StoreIssueRequest $request) {
     $validated = $request->validated();
     // ...
   }
   \`\`\`

7. **Validation rules** in `app/Http/Requests/StoreIssueRequest.php`
   \`\`\`php
   public function rules() {
     return [
       'title' => 'required|string|max:255',
       'description' => 'required|string',
       'category' => 'required|in:infrastructure,safety,environment,...',
       // ...
     ];
   }
   \`\`\`

8. **Model creates record** in `app/Models/Issue.php`
   \`\`\`php
   $issue = Issue::create([
     'user_id' => auth()->id(),
     'title' => $validated['title'],
     'description' => $validated['description'],
     // ...
   ]);
   \`\`\`

9. **Database saves** to MySQL `issues` table via PHPMyAdmin

10. **Observer triggers** in `app/Observers/IssueObserver.php`
    \`\`\`php
    public function created(Issue $issue) {
      // Send notifications, update stats, etc.
    }
    \`\`\`

11. **Response returns** to frontend
    \`\`\`json
    {
      "issue": {
        "id": 123,
        "title": "Pothole on Main St",
        "description": "...",
        "user": { "id": 1, "name": "John Doe" },
        "votes_count": 0,
        "comments_count": 0
      }
    }
    \`\`\`

12. **Frontend redirects** to issue detail page
    \`\`\`tsx
    router.push(`/issues/${data.issue.id}`)
    \`\`\`

---

## Summary of Key Connections

### Central Connection Point: lib/api.ts

The `lib/api.ts` file is the **single source of truth** for all frontend-backend communication. Every API call goes through this file.

### Authentication Token Flow

1. User logs in → Backend returns token
2. Token stored in `localStorage`
3. Every authenticated request includes: `Authorization: Bearer {token}`
4. Backend validates token via Laravel Sanctum
5. Backend loads user and processes request

### Data Flow Pattern

\`\`\`
Frontend Component
  ↓ (calls)
lib/api.ts function
  ↓ (HTTP request)
routes/api.php route
  ↓ (middleware)
auth:sanctum middleware
  ↓ (calls)
Controller method
  ↓ (uses)
Model
  ↓ (queries)
MySQL Database (via PHPMyAdmin)
  ↓ (returns)
JSON Response
  ↓ (updates)
Frontend State
  ↓ (renders)
UI Component
\`\`\`

### Environment Variables

**Frontend must have:**
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

**Backend must have:**
\`\`\`env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=citifix
DB_USERNAME=root
DB_PASSWORD=your_password

APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
\`\`\`

---

## Quick Reference: File Connections

| Frontend File | → | Backend File | → | Database Table |
|--------------|---|--------------|---|----------------|
| `app/(auth)/login/page.tsx` | → | `AuthController.php` | → | `users`, `personal_access_tokens` |
| `app/issues/page.tsx` | → | `IssueController.php` | → | `issues`, `users`, `issue_votes` |
| `app/issues/[id]/page.tsx` | → | `IssueController.php`, `IssueCommentController.php` | → | `issues`, `issue_comments`, `issue_media` |
| `app/issues/new/page.tsx` | → | `IssueController.php` | → | `issues`, `issue_media` |
| `app/dashboard/page.tsx` | → | `DashboardController.php` | → | `issues`, `users`, `issue_votes` |
| `app/leaderboard/page.tsx` | → | `LeaderboardController.php` | → | `users`, `issues`, `issue_votes` |
| `app/notifications/page.tsx` | → | `NotificationController.php` | → | `notifications` |
| `app/profile/page.tsx` | → | `IssueController.php` | → | `issues`, `users` |

---

## Troubleshooting

### Frontend can't connect to backend

1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Verify backend is running: `php artisan serve`
3. Check CORS settings in `config/cors.php`

### Authentication not working

1. Check token in localStorage: `localStorage.getItem('token')`
2. Verify token in database: `personal_access_tokens` table
3. Check `SANCTUM_STATEFUL_DOMAINS` in backend `.env`

### Database connection failed

1. Verify MySQL is running
2. Check credentials in backend `.env`
3. Test connection: `php artisan migrate`
4. Access PHPMyAdmin: `http://localhost/phpmyadmin`

---

## Conclusion

This documentation shows the complete connection between:
- **Frontend (Next.js)** in `citifix-frontend/`
- **Backend (Laravel)** in `citifix-backend/`
- **Database (MySQL)** managed via PHPMyAdmin

The key connection file is `lib/api.ts` which contains all API functions that communicate with the Laravel backend through REST API endpoints defined in `routes/api.php`.
