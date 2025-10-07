# citiFix - Implementation Summary

## Project Overview
A complete Laravel 11 backend API for citiFix, a crowdsourced civic issues tracking system where citizens can report problems, vote on issues, and government officers can manage and resolve them.

## ✅ Completed Features

### 1. Authentication & Authorization
- **Laravel Sanctum** for API token authentication
- **Spatie Laravel Permission** for role-based access control
- Three user roles: `citizen`, `officer`, `admin`
- Registration, login, logout, and profile management endpoints
- Token-based authentication for all protected routes

### 2. Issues Management System
- Full CRUD operations for issues
- **Issue Lifecycle States**: `pending`, `verified`, `in_progress`, `resolved`, `rejected`
- **Categories**: Pothole, Streetlight, Garbage, Water Supply, Road Damage, Other
- **Priority Levels**: Low, Medium, High, Critical
- Location tracking with latitude/longitude
- Media uploads (photos and videos) with multiple files per issue
- Duplicate detection based on location proximity
- Advanced filtering: status, category, priority, location, date range
- Heatmap data endpoint for geographic visualization
- Role-based permissions for state transitions

### 3. Crowdsourced Voting & Verification
- Citizens can upvote issues to verify legitimacy
- Automatic verification when vote threshold is reached (default: 3 votes)
- Duplicate vote prevention (one vote per user per issue)
- Vote count tracking on each issue
- Automatic status change from `pending` to `verified` upon reaching threshold

### 4. Comments System
- Threaded comments on issues
- Media attachments support (photos/videos)
- Citizens and officers can comment
- Automatic notifications when new comments are added
- Full CRUD operations with proper authorization

### 5. Notifications System
- **Email notifications** (queued for async processing)
- **Database notifications** for in-app display
- Notification types:
  - Issue status changes (to issue creator)
  - New comments on user's issues
  - Issue assignments (to assigned officers)
- Mark as read/unread functionality
- Bulk mark all as read
- Delete notifications

### 6. Dashboard & Analytics
- **Statistics endpoint**: Total issues, by status, by category, by priority
- **Trends endpoint**: Issues over time (daily, weekly, monthly)
- **Category breakdown**: Distribution of issues by category
- **Location hotspots**: Most reported locations
- **Officer performance**: Issues resolved per officer
- **Data export**: JSON and CSV formats
- Role-based access (officers and admins only)

### 7. Gamification System (Optional)
- **Points system**: Users earn points for engagement
  - Report issue: 10 points
  - Vote on issue: 2 points
  - Comment on issue: 5 points
- **Leaderboard endpoint**: Top users by points
- User profile shows total points earned
- Encourages citizen participation

## 📊 Database Schema

### Tables Created
1. **users** - User accounts with roles and points
2. **roles** - User roles (citizen, officer, admin)
3. **permissions** - Granular permissions
4. **model_has_roles** - User-role assignments
5. **issues** - Main issues table with all details
6. **issue_media** - Photos/videos attached to issues
7. **issue_votes** - Crowdsourced votes on issues
8. **issue_comments** - Comments on issues
9. **comment_media** - Media attached to comments
10. **notifications** - In-app notifications
11. **personal_access_tokens** - Sanctum API tokens
12. **jobs** - Queue system for async tasks
13. **cache** - Application cache

### Key Relationships
- User → Issues (one-to-many)
- User → Votes (one-to-many)
- User → Comments (one-to-many)
- Issue → Media (one-to-many)
- Issue → Votes (one-to-many)
- Issue → Comments (one-to-many)
- Comment → Media (one-to-many)

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login and get token
- `POST /api/logout` - Logout (revoke token)
- `GET /api/user` - Get authenticated user profile

### Issues
- `GET /api/issues` - List all issues (with filters)
- `POST /api/issues` - Create new issue
- `GET /api/issues/{id}` - Get single issue
- `PUT /api/issues/{id}` - Update issue
- `DELETE /api/issues/{id}` - Delete issue
- `GET /api/issues/heatmap` - Get heatmap data

### Voting
- `POST /api/issues/{id}/vote` - Vote on an issue
- `DELETE /api/issues/{id}/vote` - Remove vote

### Comments
- `GET /api/issues/{id}/comments` - List comments on issue
- `POST /api/issues/{id}/comments` - Add comment
- `PUT /api/comments/{id}` - Update comment
- `DELETE /api/comments/{id}` - Delete comment

### Dashboard (Officers/Admins)
- `GET /api/dashboard/statistics` - Overall statistics
- `GET /api/dashboard/trends` - Trends over time
- `GET /api/dashboard/categories` - Category breakdown
- `GET /api/dashboard/hotspots` - Location hotspots
- `GET /api/dashboard/officers` - Officer performance
- `GET /api/dashboard/export` - Export data (JSON/CSV)

### Notifications
- `GET /api/notifications` - List user notifications
- `GET /api/notifications/unread` - Unread notifications count
- `POST /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification

### Gamification
- `GET /api/leaderboard` - Top users by points

## 🎯 Key Features Implemented

### Security
- Token-based authentication
- Role-based authorization
- Request validation for all inputs
- CORS configuration
- SQL injection prevention (Eloquent ORM)
- File upload validation (type, size)

### Performance
- Database indexes on frequently queried columns
- Eager loading to prevent N+1 queries
- Queue system for email notifications
- Efficient geospatial queries for location-based features

### Code Quality
- Form Request validation classes
- Model Observers for automatic actions
- Service Provider for dependency injection
- RESTful API design
- Consistent error responses
- Comprehensive seeders for testing

## 🧪 Test Data

### Seeded Users
1. **Admin**: admin@example.com / password
2. **Officer**: officer@example.com / password
3. **Citizen**: citizen@example.com / password

### Seeded Roles & Permissions
- All roles and permissions are automatically created
- Users are assigned appropriate roles
- Ready for immediate testing

## 🚀 Next Steps (Optional Enhancements)

### Potential Future Features
- [ ] Real-time notifications using WebSockets/Pusher
- [ ] Advanced search with Elasticsearch
- [ ] Image optimization and thumbnail generation
- [ ] Rate limiting for API endpoints
- [ ] Two-factor authentication
- [ ] Social media sharing
- [ ] Mobile push notifications
- [ ] Advanced analytics with charts
- [ ] Issue templates for common problems
- [ ] Bulk operations for officers
- [ ] API documentation with Swagger/OpenAPI
- [ ] Automated testing suite
- [ ] CI/CD pipeline setup

## 📝 Notes

- All media uploads are stored in `storage/app/public/issues` and `storage/app/public/comments`
- Email notifications are queued and require queue worker to be running
- The system uses Laravel's built-in queue system (database driver by default)
- Automatic issue verification happens when vote count reaches threshold (configurable)
- Officers can be assigned to issues for accountability
- All timestamps are automatically managed by Laravel
