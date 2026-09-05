<div align="center">

# 🏋️ GYMTrack

**Train. Track. Improve.**

A full-stack AI-powered fitness tracking application built with React, Supabase, and Google Gemini.

[![Live Demo](https://img.shields.io/badge/Live-gymtrack--fitness--kovid.vercel.app-00C853?style=for-the-badge&logo=vercel&logoColor=white)](https://gymtrack-fitness-kovid.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Gemini](https://img.shields.io/badge/Gemini-AI%20Coach-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)

</div>

---

## ✨ Features

### 🔐 Authentication
- Email/password signup and login
- **Google OAuth** (one-click Continue with Google)
- Password reset via email
- Persistent sessions with automatic token refresh
- Protected routes with auth guards

### 🏠 Dashboard
- Today's workout suggestions
- Weekly training streak tracker
- Quick-access stats (workouts completed, total volume, active streak)
- Recent workout history at a glance

### 💪 Exercise Library
- **50+ exercises** across 8 muscle groups — Chest, Back, Shoulders, Biceps, Triceps, Legs, Core, Full Body
- Advanced search with real-time filtering by muscle group, equipment, and difficulty
- Detailed exercise pages with instructions, tips, and common mistakes
- Personal favorites system

### 📋 Workout System
- **Workout Builder** — create custom workouts with drag-and-drop exercise ordering
- Configure sets, reps, weight, and rest periods per exercise
- **Workout Plans** — organize workouts into multi-day training plans
- Duplicate and edit existing workouts
- **Live Workout Runner** — execute workouts in real time with:
  - Set-by-set logging
  - Built-in rest timer
  - Auto-progression through exercises
  - Session summary on completion

### 📊 Progress & Analytics
- **Workout history** with detailed session breakdowns
- **Personal records** (PRs) tracked automatically
- Training volume charts over time
- Workout frequency and consistency metrics
- **Streak tracking** — consecutive training day counter
- Per-exercise performance history

### 🤖 AI Fitness Coach
- Powered by **Google Gemini** via a secure Supabase Edge Function
- Context-aware — the AI reads your profile, workout history, PRs, and active plan
- Ask questions like:
  - *"What should I train today?"*
  - *"How am I progressing?"*
  - *"Create a push day workout for me"*
- **Structured workout proposals** — the AI can generate full workouts you can save directly
- Conversation history is persisted per user
- Safety guardrails prevent medical advice and fabricated statistics

### 👤 Profile & Onboarding
- Guided onboarding flow for new users (goals, experience, body metrics, equipment)
- Editable profile with fitness preferences
- Avatar support (including Google profile pictures)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript 5, Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **Routing** | React Router v6 |
| **UI Components** | Radix UI (Dialog, Select, Tabs, Tooltip, Switch, Avatar, Progress) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Auth & Database** | Supabase (Auth + PostgreSQL + Row Level Security) |
| **AI** | Google Gemini 1.5 Flash via Supabase Edge Functions (Deno) |
| **Deployment** | Vercel |

---

## 🏗️ Architecture

```
GYMTrack/
├── src/
│   ├── components/
│   │   ├── ai/            # ChatInterface, message bubbles
│   │   ├── exercise/      # ExerciseCard, ExerciseSelector, FilterChips
│   │   ├── layout/        # Sidebar, MobileNav, MobileTopBar
│   │   ├── progress/      # Charts, PRCard, ConsistencyCalendar
│   │   ├── routing/       # ProtectedRoute
│   │   ├── shared/        # Logo, Badge, Avatar, StatCard, SearchInput
│   │   └── workout/       # WorkoutCard, SessionCard, DayActivity
│   ├── context/           # AuthContext (Supabase auth state management)
│   ├── hooks/             # useExercises, useWorkouts, useProgress, useWorkoutExecution
│   ├── layouts/           # AppLayout (sidebar + mobile nav wrapper)
│   ├── lib/
│   │   ├── supabase.ts    # Singleton Supabase client
│   │   ├── ai.ts          # Edge Function invocation + context builder
│   │   ├── exercises.ts   # Exercise CRUD + favorites
│   │   ├── workouts.ts    # Workout/plan CRUD + set logging
│   │   ├── progress.ts    # Session saving, PR detection, streak calc
│   │   ├── profile.ts     # Profile CRUD
│   │   └── authErrors.ts  # Auth error mapping + validation
│   ├── pages/             # 18 page components
│   ├── types/             # TypeScript interfaces and Supabase types
│   ├── App.tsx            # Route definitions
│   └── main.tsx           # Entry point
├── supabase/
│   ├── functions/
│   │   └── ai-coach/      # Gemini Edge Function (Deno)
│   └── migrations/        # 5 SQL migrations (profiles → exercises → workouts → progress → ai)
├── vercel.json            # SPA routing configuration
└── .env.example           # Required environment variables
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A [Supabase](https://supabase.com) project
- A [Google Cloud](https://console.cloud.google.com) project with OAuth 2.0 configured (for Google login)
- A [Google AI Studio](https://aistudio.google.com) API key (for the AI Coach)

### 1. Clone and install

```bash
git clone https://github.com/yourusername/GYMTrack.git
cd GYMTrack
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Note:** The Gemini API key (`GEMINI_API_KEY`) is configured as a Supabase Edge Function secret — it is **never** exposed to the frontend.

### 3. Set up the database

Run the SQL migrations in order in your Supabase SQL Editor:

1. `supabase/migrations/001_profiles.sql` — User profiles + RLS
2. `supabase/migrations/002_exercises.sql` — Exercise library (50+ seeded exercises) + favorites
3. `supabase/migrations/003_workouts.sql` — Workout plans, workouts, workout exercises + RLS
4. `supabase/migrations/004_progress.sql` — Workout sessions, session sets + RLS
5. `supabase/migrations/005_ai_coach.sql` — AI conversations and messages + RLS

### 4. Configure authentication

In your Supabase Dashboard:

1. **Authentication → Providers → Google** — Enable and add your Google OAuth Client ID and Secret
2. **Authentication → URL Configuration** — Add your redirect URLs:
   - `http://localhost:5173` (development)
   - `https://your-production-domain.vercel.app` (production)

### 5. Deploy the AI Coach Edge Function

```bash
supabase functions deploy ai-coach
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
```

### 6. Start development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 🗺️ Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Email/password + Google login |
| `/signup` | Public | Account creation + Google signup |
| `/forgot-password` | Public | Password reset request |
| `/onboarding` | Protected | New user fitness profile setup |
| `/dashboard` | Protected | Main dashboard with stats and suggestions |
| `/exercises` | Protected | Searchable exercise library |
| `/exercises/:slug` | Protected | Exercise detail page |
| `/workouts` | Protected | User's workout list |
| `/workouts/new` | Protected | Workout builder |
| `/workouts/:id` | Protected | Workout detail |
| `/workouts/:id/edit` | Protected | Edit existing workout |
| `/workouts/:id/run` | Protected | Live workout execution |
| `/plans` | Protected | Workout plans |
| `/plans/new` | Protected | Plan builder |
| `/history` | Protected | Workout session history |
| `/history/:id` | Protected | Session detail breakdown |
| `/progress` | Protected | Analytics, charts, PRs, streaks |
| `/ai-coach` | Protected | AI fitness coach chat |
| `/profile` | Protected | User profile and settings |

---

## 🔒 Security

- **Row Level Security (RLS)** is enabled on every table — users can only access their own data
- **Supabase anon key** (publishable) is the only key used in the frontend
- **Service role key** is never exposed to the client
- **Gemini API key** is stored as a Supabase Edge Function secret (server-side only)
- **Google OAuth client secret** remains in the Supabase Dashboard (server-side only)
- Environment files (`.env.local`) are git-ignored

---

## 🌐 Deployment

GYMTrack is deployed on **Vercel** with SPA routing configured via `vercel.json`.

### Production checklist

1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Environment Variables
2. Set the **Site URL** in Supabase Dashboard → Authentication → URL Configuration to your Vercel domain
3. Add your Vercel domain to **Supabase Redirect URLs**
4. Add your Vercel domain to **Google Cloud Console → Authorized redirect URIs**
5. Ensure the `ai-coach` Edge Function is deployed with `GEMINI_API_KEY` set

---

## 📐 Database Schema

```
profiles              ← 1:1 with auth.users
exercises             ← Global exercise library (50+ seeded)
user_favorite_exercises ← User ↔ Exercise favorites
workout_plans         ← Multi-day training plans
workouts              ← Individual workouts (optionally linked to plans)
workout_exercises     ← Exercises within a workout (ordered, with sets/reps/weight config)
workout_sessions      ← Completed workout records
workout_session_sets  ← Individual set logs within a session
ai_conversations      ← AI Coach chat threads
ai_messages           ← Messages within AI conversations
```

All tables enforce **RLS** — users can only read, write, update, and delete their own rows.

---

## 📄 License

This project is private and not open-source.

---

<div align="center">
  <sub>Built by <strong>Kovid Anand</strong></sub>
</div>
