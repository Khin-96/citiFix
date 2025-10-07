# citiFix - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **PHP 8.2 or higher**
- **Composer** (latest version)
- **MySQL 8.0+** or **PostgreSQL 13+**
- **Node.js & NPM** (for asset compilation, if needed)
- **Git** (for version control)

## Installation Steps

### 1. Clone or Download the Project

If you received this as a ZIP file, extract it. If using Git:

\`\`\`bash
git clone <repository-url>
cd citifix
\`\`\`

### 2. Install PHP Dependencies

\`\`\`bash
composer install
\`\`\`

This will install:
- Laravel 11 framework
- Laravel Sanctum (API authentication)
- Spatie Laravel Permission (role-based access)
- All other required packages

### 3. Environment Configuration

Copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit the `.env` file and configure the following:

#### Database Configuration

\`\`\`env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=citifix
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
\`\`\`

#### Application Configuration

\`\`\`env
APP_NAME="citiFix"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
\`\`\`

#### Mail Configuration (for notifications)

For local development, use Mailtrap or log driver:

\`\`\`env
MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@citifix.com
MAIL_FROM_NAME="${APP_NAME}"
\`\`\`

For production, configure your SMTP settings:

\`\`\`env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
\`\`\`

#### Queue Configuration

\`\`\`env
QUEUE_CONNECTION=database
\`\`\`

#### File Storage

\`\`\`env
FILESYSTEM_DISK=public
\`\`\`

### 4. Generate Application Key

\`\`\`bash
php artisan key:generate
\`\`\`

### 5. Create Database

Create a new database in MySQL/PostgreSQL:

\`\`\`sql
CREATE DATABASE citifix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

### 6. Run Migrations

Create all database tables:

\`\`\`bash
php artisan migrate
\`\`\`

This will create:
- Users table
- Roles and permissions tables
- Issues and related tables
- Notifications table
- Queue jobs table

### 7. Seed the Database

Populate the database with roles, permissions, and test users:

\`\`\`bash
php artisan db:seed
\`\`\`

This creates:
- **3 roles**: citizen, officer, admin
- **Test users**:
  - Admin: `admin@example.com` / `password`
  - Officer: `officer@example.com` / `password`
  - Citizen: `citizen@example.com` / `password`

### 8. Create Storage Symlink

Link the public storage directory:

\`\`\`bash
php artisan storage:link
\`\`\`

This allows uploaded media files to be accessible via URL.

### 9. Set Permissions (Linux/Mac)

Ensure the web server can write to storage and cache:

\`\`\`bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
\`\`\`

Replace `www-data` with your web server user if different.

## Running the Application

### Development Server

Start the Laravel development server:

\`\`\`bash
php artisan serve
\`\`\`

The API will be available at: `http://localhost:8000`

### Queue Worker (Required for Notifications)

In a separate terminal, start the queue worker:

\`\`\`bash
php artisan queue:work
\`\`\`

This processes email notifications and other queued jobs.

### Optional: Schedule Runner (for future scheduled tasks)

If you add scheduled tasks later, run:

\`\`\`bash
php artisan schedule:work
\`\`\`

## Testing the API

### 1. Register a New User

\`\`\`bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password",
    "password_confirmation": "password"
  }'
\`\`\`

### 2. Login

\`\`\`bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@example.com",
    "password": "password"
  }'
\`\`\`

Save the returned `token` for authenticated requests.

### 3. Create an Issue (Authenticated)

\`\`\`bash
curl -X POST http://localhost:8000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Broken streetlight on Main St",
    "description": "The streetlight has been out for 3 days",
    "category": "streetlight",
    "priority": "medium",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, New York, NY"
  }'
\`\`\`

### 4. List All Issues

\`\`\`bash
curl -X GET http://localhost:8000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
\`\`\`

### 5. Vote on an Issue

\`\`\`bash
curl -X POST http://localhost:8000/api/issues/1/vote \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
\`\`\`

### 6. Add a Comment

\`\`\`bash
curl -X POST http://localhost:8000/api/issues/1/comments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I can confirm this issue, I live nearby."
  }'
\`\`\`

## API Documentation

### Base URL

\`\`\`
http://localhost:8000/api
\`\`\`

### Authentication

All protected endpoints require a Bearer token in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_TOKEN_HERE
\`\`\`

### Response Format

All responses are in JSON format:

**Success Response:**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
\`\`\`

### Available Endpoints

See `TODO.md` for a complete list of API endpoints.

## File Upload Testing

To test file uploads with media:

\`\`\`bash
curl -X POST http://localhost:8000/api/issues \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "title=Pothole on 5th Avenue" \
  -F "description=Large pothole causing damage" \
  -F "category=pothole" \
  -F "priority=high" \
  -F "latitude=40.7589" \
  -F "longitude=-73.9851" \
  -F "address=5th Avenue, New York, NY" \
  -F "media[]=@/path/to/photo1.jpg" \
  -F "media[]=@/path/to/photo2.jpg"
\`\`\`

## Configuration Options

### Vote Threshold for Verification

To change the number of votes required for automatic verification, modify the `IssueObserver`:

\`\`\`php
// app/Observers/IssueObserver.php
if ($issue->votes_count >= 3) { // Change this number
    $issue->status = 'verified';
}
\`\`\`

### Points System

To adjust points awarded for actions, modify the observers:

\`\`\`php
// app/Observers/IssueObserver.php
$issue->user->increment('points', 10); // Issue creation points

// app/Observers/IssueVoteController.php
$user->increment('points', 2); // Vote points

// app/Observers/IssueCommentObserver.php
$comment->user->increment('points', 5); // Comment points
\`\`\`

### File Upload Limits

Edit `config/filesystems.php` or `.env`:

\`\`\`env
# Maximum file size in KB (default: 10MB)
MAX_FILE_SIZE=10240
\`\`\`

## Troubleshooting

### Database Connection Error

- Verify database credentials in `.env`
- Ensure database server is running
- Check if database exists

### Storage Permission Error

\`\`\`bash
chmod -R 775 storage
php artisan storage:link
\`\`\`

### Queue Not Processing

- Ensure queue worker is running: `php artisan queue:work`
- Check `QUEUE_CONNECTION=database` in `.env`
- Verify `jobs` table exists in database

### CORS Issues

If accessing from a frontend app, configure CORS in `config/cors.php`:

\`\`\`php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'], // Your frontend URL
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
\`\`\`

### Email Not Sending

- Check mail configuration in `.env`
- Ensure queue worker is running
- For testing, use `MAIL_MAILER=log` and check `storage/logs/laravel.log`

## Production Deployment

### Additional Steps for Production

1. **Set environment to production:**
   \`\`\`env
   APP_ENV=production
   APP_DEBUG=false
   \`\`\`

2. **Optimize application:**
   \`\`\`bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   composer install --optimize-autoloader --no-dev
   \`\`\`

3. **Set up proper queue worker:**
   Use Supervisor or systemd to keep queue worker running

4. **Configure proper mail service:**
   Use services like SendGrid, Mailgun, or AWS SES

5. **Set up HTTPS:**
   Use Let's Encrypt or your hosting provider's SSL

6. **Database backups:**
   Set up automated database backups

7. **Monitoring:**
   Consider using Laravel Telescope or external monitoring tools

## Support

For issues or questions:
- Check `TODO.md` for implemented features
- Review Laravel documentation: https://laravel.com/docs
- Check Sanctum docs: https://laravel.com/docs/sanctum
- Check Spatie Permission docs: https://spatie.be/docs/laravel-permission

## License

This project is built with Laravel 11 and follows the MIT License.
