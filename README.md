<div align="center">

#  GYMTrack — Production Fitness Intelligence & Offline Tracking Platform

**Intelligent. Resilient. Data-Grounded.**

An enterprise-grade, full-stack fitness tracking application engineered for high reliability, offline resilience in connection-poor environments, transparent 1RM progression analytics, and evidence-grounded AI coaching.

[![Live Demo](https://img.shields.io/badge/Live_Demo-gymtrack--fitness--kovid.vercel.app-00C853?style=for-the-badge&logo=vercel&logoColor=white)](https://gymtrack-fitness-kovid.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres%20%2B%20RLS-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB%20Offline%20Engine-FFA116?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Edge%20Coach-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel%20SPA-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 📌 Executive Product Overview

GYMTrack solves a major real-world fitness software dilemma: **gym basements have notoriously poor cellular reception**, yet lifters need real-time workout logging, progressive overload tracking, and personalized coaching without data loss or lagging UIs.

GYMTrack combines a **zero-loss IndexedDB local caching engine** with an **asynchronous reconciliation queue** to allow seamless logging even in total airplane mode. On top of this rock-solid offline-first foundation, GYMTrack implements transparent **Epley 1RM progression analytics**, rigorous **Row Level Security (RLS)** user isolation, and a **data-grounded AI Fitness Coach** powered by Google Gemini and Supabase Edge Functions with a deterministic fallback engine.

---

## 🎯 Key Architectural Pillars & Features

### 1. 🛡️ Bulletproof Authentication & Security
- **Email OTP & Magic Codes**: Secure passwordless verification codes and standard credentials.
- **Google OAuth with PKCE**: RFC 7636 Proof Key for Code Exchange preventing authorization code injection attacks.
- **Session Persistence & Auto-Refresh**: Seamless token lifecycle management with automatic refresh in local storage.
- **Multi-Tenant Row Level Security (RLS)**: Strict database-level isolation where `auth.uid() = user_id` enforces complete privacy across all tables (`profiles`, `workouts`, `workout_sessions`, `workout_session_sets`, `ai_conversations`).
- **Zero Token Leakage in Cache**: IndexedDB explicitly stores only non-sensitive workout definitions, session queue state, and exercise metadata. Passwords, auth tokens, OTP codes, and API secrets are never persisted in IndexedDB or client state.

### 2. ⚡ Offline Sync & Local-First Resilience (Basement Mode)
- **IndexedDB Sync Engine**: Local IndexedDB database managing `sync_queue`, `active_sessions`, and `cached_workouts`.
- **Automatic Network Reconnection Listener**: Real-time detection of online/offline status with an interactive sync indicator badge.
- **Idempotent Queue Replay**: Retries pending workout writes sequentially upon reconnection, deduplicating inflight requests to prevent duplicate session records.
- **Survives Refresh & Interruption**: Active workouts persist in IndexedDB across browser reloads, accidental tab closures, or phone screen timeouts.

### 3. 📈 Exercise Intelligence & 1RM Overload Tracking
- **Standardized Epley Formula**: Evaluates dynamic One-Rep Max (1RM):
  $$\text{1RM} = \text{weight} \times \left(1 + \frac{\text{reps}}{30}\right)$$
- **Transparent Progression Metrics**: Displays estimated maxes and overload velocity with mathematical explanations rather than opaque scores.
- **Differentiated Exercise Types**: Safely distinguishes weighted barbell/dumbbell movements from bodyweight, assisted, and time-based exercises, preventing inaccurate 1RM estimations.
- **Volume & PR Tracking**: Automatic detection and celebration of all-time Personal Records (PRs) by weight and calculated 1RM.

### 4. 🤖 Grounded AI Coach & Deterministic Fallback Engine
- **Strict Data Grounding**: The AI Coach operates solely on the user's authentic logged workout sessions, actual volume trends, real rest days, and calculated PRs.
- **Zero Hallucination Guardrails**: Prohibits fabricating biometric recovery stats (e.g., HRV, sleep stages) unless explicitly provided, and includes an explicit transparency disclosure.
- **Medical Safety Filtering**: Automatically screens prompt queries for medical advice or injury treatment requests, returning responsible medical disclaimers.
- **Deterministic Offline Fallback**: If the Google Gemini Edge Function is unreachable or network is offline, a deterministic heuristic engine analyzes the user's local volume and frequency patterns to supply instantaneous, rule-based training guidance.

### 5. ⏱️ Live Workout Runner
- Set-by-set execution interface with previous session benchmarks displayed inline.
- Integrated rest timer with audio-visual notifications.
- Dynamic exercise re-ordering and ad-hoc set additions during live training.
- Instant session breakdown and volume summary upon completion.

---

## 🛠️ Technology Stack

| Domain | Technology | Implementation Details |
|---|---|---|
| **Frontend Framework** | React 18.3 | TypeScript 5.5, Vite 5 build system with tree-shaking |
| **Styling & UI** | Tailwind CSS 3, Radix UI | Headless accessible UI primitives (Dialog, Tabs, Avatar, Tooltip) |
| **State & Storage** | React Context + IndexedDB | Dual-layer persistence with local-first sync queue |
| **Data Visualization**| Recharts | Responsive volume load trends, PR timelines, and frequency heatmaps |
| **Backend & Auth** | Supabase (PostgreSQL 15) | Row Level Security (RLS), GoTrue Auth (PKCE & Email OTP) |
| **Serverless AI** | Supabase Edge Functions | Deno runtime, Google Gemini 1.5 Flash API with server-side secrets |
| **Error Handling** | React ErrorBoundary | Global crash resilience with graceful recovery and reload actions |
| **Hosting & CI/CD** | Vercel | Single-Page Application rewrites and automated production builds |

---

## 🏗️ System Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GYMTrack Client (Vite + React)                  │
├───────────────────┬───────────────────────────────┬─────────────────────────┤
│    Auth Layer     │      State & Components       │   Local Offline Engine  │
│  - Supabase Auth  │  - Dashboard & Workout Runner │   - IndexedDB Storage   │
│  - PKCE / OTP     │  - 1RM Epley Analytics        │   - Sync Queue Manager  │
│  - Protected Route│  - ErrorBoundary Protection   │   - Network Listeners   │
└─────────┬─────────┴───────────────┬───────────────┴────────────┬────────────┘
          │                         │                            │
          ▼                         ▼                            ▼
┌──────────────────┐      ┌──────────────────┐      ┌─────────────────────────┐
│ Supabase Auth API│      │ Supabase PostgREST│     │ Supabase Edge Functions │
│ - Token Refresh  │      │ - RLS Enforced   │      │ - ai-coach (Gemini 1.5) │
│ - User Session   │      │ - PostgreSQL DB  │      │ - Server Secret Guard   │
└──────────────────┘      └──────────────────┘      └─────────────────────────┘
```

---

## 🔒 Security & Row Level Security (RLS) Policies

All tables are protected by PostgreSQL Row Level Security to prevent unauthorized access across tenants:

- **`profiles`**: `auth.uid() = id` (Users manage their own fitness profile).
- **`workout_plans`**: `auth.uid() = user_id` (Private training routines).
- **`workouts`**: `auth.uid() = user_id` (Custom workout definitions).
- **`workout_exercises`**: Inherits workout ownership via foreign key constraints.
- **`workout_sessions`**: `auth.uid() = user_id` (Full session logs).
- **`workout_session_sets`**: Inherits session ownership via `workout_sessions.user_id = auth.uid()`.
- **`ai_conversations` & `ai_messages`**: `auth.uid() = user_id` (Private coaching history).

> **API Key Safety Notice**: Frontend bundles contain only public `VITE_SUPABASE_ANON_KEY`. All Gemini AI API secrets remain isolated inside Supabase Edge Function environment vaults.

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A [Supabase](https://supabase.com) project with PostgreSQL instance
- (Optional) [Google AI Studio API Key](https://aistudio.google.com) for Gemini Edge Function

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kovidanand/GYMTrack.git
cd GYMTrack
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Database Migrations
Apply the migrations sequentially in your Supabase SQL Editor:
1. `supabase/migrations/001_profiles.sql` — User profiles and triggers
2. `supabase/migrations/002_exercises.sql` — Exercise reference library
3. `supabase/migrations/003_workouts.sql` — Workouts, plans, exercises
4. `supabase/migrations/004_progress.sql` — Workout session tracking
5. `supabase/migrations/005_ai_coach.sql` — AI Coach conversation tables

### 4. Deploy AI Edge Function (Optional)
```bash
supabase functions deploy ai-coach
supabase secrets set GEMINI_API_KEY=your-gemini-key
```

### 5. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Verification & Production Build

To validate code quality, strict typing, and build integrity:

```bash
# Run strict TypeScript validation
npx tsc --noEmit

# Compile production bundle with Vite
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Production Deployment

GYMTrack is configured for continuous zero-downtime deployment on **Vercel**:

1. Link the repository to your Vercel project.
2. In Vercel Project Settings → **Environment Variables**, provide:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. In Supabase Dashboard → **Authentication** → **URL Configuration**:
   - Add your production domain: `https://gymtrack-fitness-kovid.vercel.app`
   - Add OAuth Redirect URL: `https://gymtrack-fitness-kovid.vercel.app/`
4. Deploy — `vercel.json` ensures client-side routing rewrites are respected.

---

## 🔮 Future Enhancements
- **Wearable Device Integration**: Apple HealthKit and Google Health Connect sync.
- **Plate Calculator & Barbell Loader**: Visual rack and plate configuration helper during live sets.
- **Social Workout Sharing**: Shareable deep links for community routines with read-only previews.
- **Camera Form Check**: On-device lightweight pose detection for squat and deadlift path tracking.

---

<div align="center">
</div>
