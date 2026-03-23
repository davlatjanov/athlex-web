# Athlex Web

Frontend for **Athlex** — a dark-themed fitness platform for athletes, trainers, and gym communities.

Built with Next.js 14, TypeScript, SCSS, and Apollo GraphQL.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 |
| Language | TypeScript |
| Styling | SCSS + Material-UI |
| State / Data | Apollo Client + GraphQL |
| Auth | JWT (stored in cookies) |
| Uploads | Cloudinary |
| Animations | Three.js (hero) |

---

## Features

- **Auth** — Sign up / login with JWT session persistence
- **Programs** — Browse, filter, and enroll in training programs
- **Paid Enrollment** — Simulated card checkout flow with order creation
- **Trainer Profiles** — View trainer stats, programs, and enrolled students
- **Member Profiles** — Rank badges, activity timeline, joined programs
- **Workout Builder** — Weekly workout planner with drag-and-drop exercises
- **My Students** — Trainers see enrolled members per program
- **Bookmarks** — Persisted bookmark state across sessions
- **Recently Visited** — Auto-clears every 1 hour
- **Search** — Live member search with admin pinned at top
- **Notifications** — Real-time notification feed
- **AI Coach** — Integrated AI chat widget
- **Dark Theme** — Iron Religion Gym aesthetic (red `#E92C28`, dark `#0F172A`)

---

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- Backend running — see [athlex](https://github.com/davlatjanov/athlex)

### Install

```bash
yarn install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### Run

```bash
yarn dev        # Development
yarn build      # Production build
yarn start      # Start production server
```

---

## Project Structure

```
athlex-web/
├── apollo/             # GraphQL queries & mutations
│   ├── user/           # Member-facing operations
│   └── admin/          # Admin operations
├── libs/
│   ├── components/     # Reusable UI components
│   │   ├── homepage/   # Landing page sections
│   │   ├── layout/     # Header, footer, nav
│   │   ├── member/     # Member profile components
│   │   ├── mypage/     # Dashboard components
│   │   └── common/     # Shared components (modals, search)
│   ├── enums/          # Shared enums
│   └── types/          # TypeScript types
├── pages/              # Next.js pages
│   ├── programs/       # Program listing + detail
│   ├── trainer/        # Trainer profiles
│   ├── member/         # Member profiles
│   ├── mypage/         # User dashboard
│   └── _admin/         # Admin panel
└── scss/               # Global styles
    └── pc/             # Desktop styles
```

---

## Backend

The backend is a separate NestJS + GraphQL API. See [athlex](https://github.com/davlatjanov/athlex) for setup.

---

## License

Private — all rights reserved.
