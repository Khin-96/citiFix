# citiFix Frontend

Next.js 15 frontend application for the citiFix crowdsourced issues tracking platform.

## Setup

\`\`\`bash
npm install
# or
pnpm install

# Create .env.local
cp .env.local.example .env.local
\`\`\`

## Environment Variables

Create `.env.local`:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
\`\`\`

## Development

\`\`\`bash
npm run dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Features

- **Authentication** - Login/Register with Laravel Sanctum
- **Issue Management** - Create, view, edit, delete issues
- **Media Upload** - Photos and videos for issues/comments
- **Voting System** - Crowdsourced verification
- **Comments** - Threaded discussions
- **Map View** - Geolocation-based issue display
- **Dashboard** - Analytics for officers/admins
- **Notifications** - Real-time updates
- **Leaderboard** - Gamification with points

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Recharts for analytics
- SWR for data fetching

## Default Login

- Admin: `admin@citifix.com` / `password`
- Officer: `officer@citifix.com` / `password`
- Citizen: `citizen@citifix.com` / `password`
\`\`\`

```typescriptreact file="TODO.md" isDeleted="true" isMoved="true" isMovedTo="citifix-backend/TODO.md"
...moved to citifix-backend/TODO.md...
