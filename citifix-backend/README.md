# citiFix Backend API

Laravel 11 REST API for the citiFix crowdsourced issues tracking platform.

## Setup

See [SETUP.md](SETUP.md) for detailed installation instructions.

## Quick Start

\`\`\`bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
\`\`\`

## API Documentation

See [TODO.md](TODO.md) for complete API endpoint documentation.

## Environment Variables

\`\`\`env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=citifix
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
\`\`\`

## Testing

\`\`\`bash
php artisan test
\`\`\`

## Default Users

- Admin: `admin@citifix.com` / `password`
- Officer: `officer@citifix.com` / `password`
- Citizen: `citizen@citifix.com` / `password`
