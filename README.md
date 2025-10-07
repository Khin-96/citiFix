# citiFix Backend

A comprehensive Laravel 11 backend API for a crowdsourced civic issues tracking system.

## Features

- **Authentication**: Laravel Sanctum-based JWT authentication
- **Role-Based Access Control**: Citizen, Officer, and Admin roles using Spatie Laravel Permission
- **Issues Management**: Full CRUD operations with media uploads (photos/videos)
- **Duplicate Detection**: Automatic detection of similar issues based on location and category
- **Crowdsourced Verification**: Citizens can upvote issues to verify them
- **Comments System**: Threaded discussions with media attachments
- **Notifications**: Email and database notifications for status changes and comments
- **Gamification**: Points system and leaderboard for active contributors
- **Dashboard & Analytics**: Comprehensive statistics, trends, and reports for officers/admins
- **Location-Based Features**: Heatmaps, nearby issues, and location hotspots

## Tech Stack

- Laravel 11
- MySQL
- Laravel Sanctum (API Authentication)
- Spatie Laravel Permission (Role Management)
- File Storage (Local/Public disk, S3-ready)

## Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   composer install
   \`\`\`

3. Copy environment file:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Generate application key:
   \`\`\`bash
   php artisan key:generate
   \`\`\`

5. Configure database in `.env`:
   \`\`\`
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=citifix
   DB_USERNAME=root
   DB_PASSWORD=
   \`\`\`

6. Run migrations and seeders:
   \`\`\`bash
   php artisan migrate --seed
   \`\`\`

7. Create storage symlink:
   \`\`\`bash
   php artisan storage:link
   \`\`\`

8. Start the development server:
   \`\`\`bash
   php artisan serve
   \`\`\`

9. (Optional) Start queue worker for notifications:
   \`\`\`bash
   php artisan queue:work
   \`\`\`

## Default Users

After seeding, you can login with:

- **Admin**: admin@example.com / password
- **Officer**: officer@example.com / password
- **Citizen**: john@example.com / password
- **Citizen**: jane@example.com / password

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Get current user

### Issues
- `GET /api/issues` - List all issues (with filters)
- `POST /api/issues` - Create new issue
- `GET /api/issues/{id}` - Get single issue
- `PATCH /api/issues/{id}` - Update issue
- `DELETE /api/issues/{id}` - Delete issue
- `GET /api/issues/categories` - Get issue categories
- `GET /api/issues/my-issues` - Get current user's issues
- `GET /api/issues/heatmap` - Get heatmap data

### Voting
- `POST /api/issues/{id}/vote` - Vote for an issue
- `DELETE /api/issues/{id}/vote` - Remove vote
- `GET /api/issues/{id}/voters` - Get issue voters
- `GET /api/votes/my-votes` - Get current user's votes

### Comments
- `GET /api/issues/{id}/comments` - Get issue comments
- `POST /api/issues/{id}/comments` - Add comment
- `PATCH /api/issues/{issueId}/comments/{commentId}` - Update comment
- `DELETE /api/issues/{issueId}/comments/{commentId}` - Delete comment
- `GET /api/comments/my-comments` - Get current user's comments

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/my-rank` - Get current user's rank
- `GET /api/leaderboard/stats` - Get platform statistics

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread` - Get unread notifications
- `POST /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification
- `DELETE /api/notifications` - Delete all notifications

### Dashboard (Officer/Admin only)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/issues-trend` - Get issues trend
- `GET /api/dashboard/category-breakdown` - Get category breakdown
- `GET /api/dashboard/top-reporters` - Get top reporters
- `GET /api/dashboard/location-hotspots` - Get location hotspots
- `GET /api/dashboard/officer-performance` - Get officer performance
- `GET /api/dashboard/recent-activity` - Get recent activity
- `POST /api/dashboard/export` - Export data (JSON/CSV)

## Issue Categories

- Pothole
- Broken Street Light
- Illegal Dumping
- Water Leak
- Pollution
- Graffiti
- Road Damage
- Other

## Issue Lifecycle

1. **Reported** - Initial state when citizen reports an issue
2. **Verified** - Auto-verified when reaches vote threshold or manually by officer
3. **In Progress** - Officer is working on the issue
4. **Resolved** - Issue has been fixed
5. **Closed** - Issue is closed (resolved or rejected)

## Gamification Points

- Report issue: +10 points
- Issue verified: +15 bonus points
- Issue resolved: +25 bonus points
- Receive vote on issue: +5 points
- Add comment: +2 points

## File Uploads

- Supported formats: JPEG, JPG, PNG, GIF, MP4, MOV, AVI
- Max file size: 10MB per file
- Max files per issue: 5
- Storage: `storage/app/public/issues/{issue_id}/`
- Storage: `storage/app/public/comments/{comment_id}/`

## Testing

Test the API using tools like Postman, Insomnia, or cURL.

Example login request:
\`\`\`bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
\`\`\`

Use the returned `access_token` in subsequent requests:
\`\`\`bash
curl -X GET http://localhost:8000/api/issues \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
\`\`\`

## License

MIT License
