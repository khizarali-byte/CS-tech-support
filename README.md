# Product & Tech Support Portal

Internal support operations hub for the Product & Tech team. Manage tickets, schedule Zoom sessions, track recordings, and monitor team activity — all in one place.

---

## Features

- **Tickets** — View, edit, delete, and sync tickets from Freshdesk
- **Sessions** — Create and manage Zoom support sessions with full history
- **Calendar** — Book and view scheduled sessions
- **Recordings** — Link and manage Google Drive / Zoom recordings
- **Users** — Manage student/user profiles with timezone support
- **Activity Log** — Full audit trail of every action with who is online now
- **Auth** — Google OAuth (Gmail) login + email/password fallback

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | SQLite via Prisma + libSQL |
| Auth | NextAuth v4 (Google + Credentials) |
| Styling | Tailwind CSS + inline styles |
| Forms | React Hook Form + Zod |
| Data fetching | SWR |
| Integrations | Freshdesk API, Zoom |

---

## Team

| Name | Role |
|---|---|
| Khizar Ali | Support Agent |
| Pradeep | Support Agent |
| Srijan | Support Agent |
| Yashika | Support Agent |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

See [Environment Variables](#environment-variables) below for details.

### 3. Set up the database

```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the root with the following:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here_min_32_chars

# Google OAuth
# Get from https://console.cloud.google.com → APIs & Services → Credentials
# Authorised redirect URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Team Gmail Addresses (must match each person's actual Gmail)
AGENT_GMAIL_KHIZAR=khizar@gmail.com
AGENT_GMAIL_PRADEEP=pradeep@gmail.com
AGENT_GMAIL_SRIJAN=srijan@gmail.com
AGENT_GMAIL_YASHIKA=yashika@gmail.com

# Freshdesk
FRESHDESK_DOMAIN=yourcompany.freshdesk.com
FRESHDESK_API_KEY=your_api_key

# Zoom Account 1
ZOOM_ACCOUNT1_NAME="Zoom Room 1"
ZOOM_ACCOUNT1_MEETING_ID="123 456 7890"
ZOOM_ACCOUNT1_PASSCODE="abc123"
ZOOM_ACCOUNT1_JOIN_URL="https://zoom.us/j/..."

# Zoom Account 2
ZOOM_ACCOUNT2_NAME="Zoom Room 2"
ZOOM_ACCOUNT2_MEETING_ID="098 765 4321"
ZOOM_ACCOUNT2_PASSCODE="xyz789"
ZOOM_ACCOUNT2_JOIN_URL="https://zoom.us/j/..."
```

---

## Login

### Google (recommended)
Click **Continue with Google** on the login page. Only the 4 team Gmail addresses set in `.env.local` are allowed in.

### Email & Password (fallback)
Use your `@support.com` email with the default password `Support@123`.  
Change this after first login.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/         # Main dashboard
│   │   ├── tickets/           # Ticket management
│   │   ├── sessions/          # Session management
│   │   ├── calendar/          # Calendar bookings
│   │   ├── recordings/        # Recording links
│   │   ├── users/             # User profiles
│   │   ├── activity/          # Activity & audit log
│   │   └── timezone/          # Timezone converter
│   └── api/                   # API routes
├── components/
│   ├── layout/                # Sidebar, TopBar, Heartbeat
│   └── shared/                # StatusBadge, etc.
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── prisma.ts              # Prisma client
│   ├── activity.ts            # Activity logger
│   └── utils.ts               # Helpers
prisma/
├── schema.prisma              # Database schema
└── seed.ts                    # Seed 4 agents
```

---

## Database Models

| Model | Description |
|---|---|
| `Agent` | The 4 support team members |
| `User` | Students / customers |
| `Ticket` | Support tickets (synced from Freshdesk) |
| `Session` | Zoom support sessions |
| `CalendarBooking` | Scheduled session bookings |
| `Recording` | Linked Drive / Zoom recordings |
| `ActivityLog` | Audit log of all actions |
| `LoginSession` | Login & online presence tracking |
| `SyncLog` | Freshdesk sync history |

---

## Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
npm run seed      # Seed the database with 4 agents
```

---

## Activity Log

Every action in the portal is automatically recorded:
- Who logged in and when
- Every ticket / session / recording / user created, edited, or deleted
- Online presence tracked via heartbeat (updates every 2 minutes)

View the full log at `/activity` in the sidebar.
