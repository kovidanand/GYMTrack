# GYMTrack

> Train. Track. Improve.

GYMTrack is a modern personal fitness and workout-tracking web application built with React, TypeScript, Vite and Tailwind CSS.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 5** — build tool
- **Tailwind CSS v3** — styling
- **React Router v6** — routing
- **Recharts** — charts
- **Lucide React** — icons
- **Radix UI** — accessible UI primitives

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Login page |
| `/signup` | Signup page |
| `/dashboard` | Main dashboard |
| `/workouts` | Workout library + sessions |
| `/exercises` | Exercise library with search/filter |
| `/progress` | Analytics and charts |
| `/profile` | Profile and settings |

## Project Structure

```
src/
├── components/
│   ├── exercise/    # ExerciseCard, ExerciseDetail, FilterChips
│   ├── layout/      # Sidebar, MobileNav, MobileTopBar
│   ├── progress/    # StrengthChart, VolumeChart, ConsistencyCalendar, PRCard
│   ├── shared/      # GYMTrackLogo, Badge, Avatar, StatCard, SearchInput, etc.
│   └── workout/     # WorkoutCard, SessionCard, DayActivity
├── context/         # AuthContext (mock)
├── data/            # Mock data (exercises, workouts, users, progress)
├── hooks/           # useExerciseFilter
├── layouts/         # AppLayout
├── lib/             # utils (cn, formatters, color helpers)
├── pages/           # Landing, Auth, Dashboard, Workouts, Exercises, Progress, Profile
├── types/           # TypeScript interfaces
├── App.tsx
└── main.tsx
```

## Development Notes

- **Phase 1** — Foundation only. No real authentication, no database, no payments.
- All data lives in `src/data/` — structured to be replaced by Supabase in Phase 2.
- Mock user: **Kovid Anand** (`kovid@example.com`)

## Phase Roadmap

- **Phase 1** ✅ Foundation, UI, Mock Data
- **Phase 2** — Supabase auth + database
- **Phase 3** — Workout logging (live sessions)
- **Phase 4** — AI recommendations
- **Phase 5** — Social features + payments
