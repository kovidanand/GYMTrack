<div align="center">

# ⚡ GYMTrack
### Full-Stack Fitness Intelligence, High-Performance Video Demonstrations & Offline-First Strength Tracking

*Log every set. Perfect your form with continuous video demos. Zero data loss in the gym basement.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-gymtrack--fitness--kovid.vercel.app-00E599?style=for-the-badge&logo=vercel&logoColor=black)](https://gymtrack-fitness-kovid.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015%20%2B%20RLS-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB%20Sync%20Engine-FFA116?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-8E75B2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

</div>

---

## 💡 The Problem & The GYMTrack Vision

Most fitness applications fail lifters in two critical ways:
1. **The Gym Basement Failure**: Underground strength facilities and gym basements have poor or nonexistent cellular connectivity. Cloud-dependent apps freeze, spin endlessly, or drop workout logs when network connectivity drops.
2. **The Spreadsheet Friction & Placeholder Problem**: Clunky menu hierarchies turn a 5-second set log into a chore, while exercise libraries rely on static illustrations or broken image placeholders instead of real, fluid movement demonstrations.

**GYMTrack eliminates both bottlenecks:**

```
  ┌────────────────┐       ┌────────────────┐       ┌────────────────┐       ┌────────────────┐
  │  OPEN DASHBOARD│  ──▶  │ SEE TODAY'S LOG│  ──▶  │   TAP 1-STEP   │  ──▶  │ RECORD SET/REPS│
  └────────────────┘       └────────────────┘       └────────────────┘       └────────────────┘
                                                                                      │
                                                                                      ▼
  ┌────────────────┐       ┌────────────────┐       ┌────────────────┐       ┌────────────────┐
  │  AI COACH TIPS │  ◀──  │ MUSCLE BALANCE │  ◀──  │ PERIOD METRICS │  ◀──  │ REAL-TIME EVENT│
  │  & FORM ADVICE │       │  DISTRIBUTION  │       │  & PR TRACKING │       │  BUS DISPATCH  │
  └────────────────┘       └────────────────┘       └────────────────┘       └────────────────┘
```

Built with modern consumer UX principles: a clean top navigation bar, glassmorphism design tokens, full-motion continuous video demonstrations, set-accurate volume analytics, and an evidence-grounded AI coach that never hallucinates.

---

## ✨ Core Pillars & Architectural Highlights

### 1. 🎥 Real Exercise Video Demonstrations (100% Coverage)
- **Continuous Demonstration Playback**: Every single exercise in the library features an authentic, continuously looping video demonstration showing a lifter executing the exact movement with proper biomechanics.
- **Dual-Angle Perspectives**: Instant toggle between male and female movement models with zero playback interruption.
- **Clean Aesthetic**: Zero distracting video badges or "HD" stickers; clean, focused viewports designed for learning proper form.
- **Smart Viewport Streaming**: Cards utilize `IntersectionObserver` to trigger playback only when scrolled into the active viewport, conserving mobile bandwidth and battery life while enabling instantaneous hover previews on desktop.
- **Strict 16:9 Media Architecture**: Eliminates awkward letterboxing, container overflow, and cropped titles across both mobile and multi-column desktop grids.
- **Zero-Placeholder Guarantee**: No purple fallback blocks or generic dummy illustrations—comprehensive biomechanical instructions, primary & secondary target muscles, and common mistake warnings for every movement.

### 2. ⚡ Unified Home Dashboard Live Aggregation Layer
- **Strict Local Calendar Boundaries**: Bounded to the user's local day with automatic midnight reset (`00:00:00`), preventing UTC boundary skew.
- **Single Source of Truth**: Unique exercises, completed sets, total volume ($\sum \text{weight} \times \text{reps}$), and active duration are derived in unison from actual persisted session records.
- **Instant Reactive Updates**: Modals dispatch reactive events (`gymtrack:session_completed`, `gymtrack:sets_logged`) so the Home dashboard updates immediately upon confirmation without a page refresh or manual sync.
- **Zero-Drop Metric Safeguards**: Guarantees that completed sets never display `0 exercises` or `0 kg volume` for weighted movements, while handling bodyweight exercises correctly.
- **Flexible Logging Inputs**: Fast manual set incrementers, quick voice logging with natural expression parsing (e.g. *"Bench press 50 kilos, 3 sets of 10"*), and 1-tap `+ Add` queuing from the Exercise Library.

### 3. 📶 "Basement Mode" — Zero-Loss Offline Resilience
- **Persistent IndexedDB Engine**: Operates independently of network availability via local stores: `sync_queue`, `cached_workouts`, and `active_sessions`.
- **Automatic Network Reconnection**: Interactive connection badge reflects network transitions in real time.
- **Idempotent Queue Replay**: Retries pending mutations sequentially upon reconnection, deduplicating inflight payloads to ensure zero duplicate sessions.
- **Session Continuity**: Active workouts persist seamlessly across tab refreshes, background suspensions, and accidental closures.

### 4. 📊 Multi-Period Analytics & Volume Intelligence
- **Unified Period Filtering**: Toggle between **7 Days**, **30 Days**, and **All Time** with instantaneous, synchronous recalculation across all charts and statistical summaries.
- **Period Comparison Engine**: Side-by-side comparative analysis of current vs. previous training cycles:
  - Total Training Volume ($\sum \text{weight} \times \text{reps}$) with color-coded percentage delta badges ($\pm \% \Delta$).
  - Training Frequency (completed session counts and consistency indicators).
  - First-period baseline handling that gracefully adapts when previous historical records are not yet logged.
- **Target Muscle Group Distribution**: Interactive horizontal breakdown measuring set allocation percentages across chest, back, shoulders, arms, legs, and core to identify neglected muscle groups.
- **Volume Progression AreaChart**: SVG-rendered volume trajectory charting progressive overload over chosen training periods.
- **Precision 1RM Calculation (Epley Formula)**:
  $$\text{1RM} = \text{weight} \times \left(1 + \frac{\text{reps}}{30}\right)$$
  Tracks all-time Personal Records (PRs) per exercise with instant badge indicators.

### 5. 🧠 Grounded AI Coach & Structured UI Renderer
- **Dual-Engine Intelligence**: Powered by **Google Gemini 1.5 Flash** (via Supabase Edge Functions) with a robust, rule-based **Deterministic Local Engine** fallback when offline.
- **Strict Data Grounding**: The AI Coach operates exclusively on authentic logged workouts, volume differentials, and muscle distributions. No synthetic recovery estimates or hallucinated metrics.
- **Native `AiResponseRenderer`**: Completely eliminates raw markdown clutter (`###`, `**`, `*`) and decorative sparkles in favor of native UI components:
  - Clean typographic hierarchy and parameter chips.
  - Interactive exercise recommendation cards with demonstration video previews and 1-tap `+ Add` actions.
  - Biomechanical cues and structured progression guidelines.
- **Dual Form Factor**: Available as an unobtrusive **Floating Mobile Drawer** across all screens or as a dedicated **Full-Page Intelligence Workspace**.

### 6. 🛡️ Enterprise Security & Multi-Tenant Privacy
- **Row Level Security (RLS)**: PostgreSQL enforces strict user isolation (`auth.uid() = user_id`) across all tables.
- **RFC 7636 PKCE OAuth**: Hardened authorization code exchange for Google Sign-In and passwordless Email OTP verification.
- **Zero Token Leakage**: Tokens and secrets are never cached inside IndexedDB. API keys remain securely vaulted inside Supabase Edge Function environment variables.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GYMTrack Web App (React 18 + Vite)                │
├───────────────────┬───────────────────────────────┬─────────────────────────┤
│    Auth Layer     │      State & UI Engine        │   Local Offline Engine  │
│  - Supabase Auth  │  - Top Navigation & Dashboard │   - IndexedDB Storage   │
│  - PKCE / OTP     │  - 16:9 Video Player Engine   │   - Sync Queue Replay   │
│  - Protected Route│  - Dashboard Aggregation Layer│   - Network Listeners   │
│                   │  - Reactive Event Bus         │   - Queued Exercises    │
│                   │  - 1RM & Period Analytics     │                         │
│                   │  - AiResponseRenderer         │                         │
└─────────┬─────────┴───────────────┬───────────────┴────────────┬────────────┘
          │                         │                            │
          ▼                         ▼                            ▼
┌──────────────────┐      ┌──────────────────┐      ┌─────────────────────────┐
│  Supabase Auth   │      │ Supabase PostgREST│     │ Supabase Edge Functions │
│ - Token Refresh  │      │ - PostgreSQL 15  │      │ - ai-coach (Gemini 1.5) │
│ - Session Guard  │      │ - Multi-Tenant RLS│     │ - Server Secret Vault   │
└──────────────────┘      └──────────────────┘      └─────────────────────────┘
```

---

## 💻 Tech Stack

| Domain | Technology | Purpose & Implementation |
|---|---|---|
| **Frontend Framework** | [React 18.3](https://react.dev) | High-performance component model with functional hooks & memoization |
| **Language** | [TypeScript 5.5](https://www.typescriptlang.org) | End-to-end strict type safety, zero compile errors, robust domain models |
| **Build & Tooling** | [Vite 5.4](https://vitejs.dev) | Lightning-fast HMR and optimized production Rollup bundling |
| **Styling & Tokens** | [Tailwind CSS 3.4](https://tailwindcss.com) | Curated dark/light theme tokens, glassmorphism, responsive grid architecture |
| **Exercise Media** | [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) | 593 Full-HD demonstration videos with male/female angles and high-res posters |
| **Charts & Visuals** | [Recharts](https://recharts.org) | SVG-rendered volume progression curves, frequency trends, and period graphs |
| **Offline Persistence** | [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Low-level browser database for offline logging & sync queue replay |
| **Cloud Database** | [Supabase PostgreSQL 15](https://supabase.com) | Relational storage with Row Level Security (RLS) policies |
| **Authentication** | [Supabase GoTrue](https://supabase.com/docs/guides/auth) | Google OAuth (PKCE flow), Email OTP, and session refresh |
| **Serverless AI** | [Supabase Edge Functions](https://supabase.com/docs/guides/functions) | Deno-based secure proxy communicating with Google Gemini 1.5 Flash |
| **Deployment** | [Vercel](https://vercel.com) | Automated CI/CD pipeline, global CDN edge distribution, SPA routing |

---

## 📁 Repository Structure

```
GYMTrack/
├── public/                     # Static assets, web manifest, exercise video references
├── src/
│   ├── components/
│   │   ├── ai/                 # AI Assistant components
│   │   │   ├── AiResponseRenderer.tsx  # Structured UI Markdown transformer
│   │   │   └── FloatingAiCoach.tsx     # Contextual floating AI assistant
│   │   ├── auth/               # Authentication modals & forms (OTP, Google, demo)
│   │   ├── exercise/           # Exercise Library & Video demonstration components
│   │   │   ├── ExerciseComponents.tsx  # 16:9 cards, responsive grid, visual badges
│   │   │   ├── ExerciseDetailModal.tsx # Full modal inspection with video demo
│   │   │   └── ExerciseVideoPlayer.tsx # Autoplay, looped, dual-angle video player
│   │   ├── navigation/         # Top Navigation, mobile drawer, and sync badges
│   │   ├── progress/           # Advanced analytics components
│   │   │   ├── AiCoachInsightsPanel.tsx   # Grounded AI analytics summaries
│   │   │   ├── MuscleDistributionChart.tsx# Target muscle breakdown bars
│   │   │   └── PeriodComparison.tsx       # Current vs. previous period volume & sessions
│   │   ├── shared/             # Reusable UI primitives (StatCards, Badges, Modals)
│   │   └── workout/            # Training Logger, Set inputs, live session modals
│   ├── context/                # React Contexts (AuthContext, OfflineContext)
│   ├── data/                   # Default exercises catalog & movement metadata
│   ├── hooks/                  # Custom React hooks (useProgress, useWorkouts, useAuth)
│   ├── lib/                    # Core engineering modules
│   │   ├── ai.ts               # Edge function client for Gemini AI Coach
│   │   ├── coachAnalysis.ts    # Biomechanical rules & deterministic fallbacks
│   │   ├── dashboardData.ts    # Home dashboard aggregation & local day boundaries
│   │   ├── events.ts           # In-memory reactive pub/sub event bus
│   │   ├── exerciseMedia.ts    # Video demonstration resolver & media audit
│   │   ├── exercises.ts        # Catalog filters & favorite management
│   │   ├── offline/            # IndexedDB sync queue & storage engine
│   │   ├── progress.ts         # Volume, 1RM Epley, PR detection, history queries
│   │   ├── supabase.ts         # Supabase client singleton & auth helpers
│   │   └── utils.ts            # Formatting, calculations, style helpers
│   ├── pages/                  # Top-level view routes
│   │   ├── Dashboard.tsx       # Daily live training overview & quick action hub
│   │   ├── ExerciseDetail.tsx  # Dedicated exercise page with hero video player
│   │   ├── Exercises.tsx       # Searchable, filterable exercise library
│   │   ├── Progress.tsx        # Period comparison, volume charts, muscle distribution
│   │   └── Workouts.tsx        # Workout routine builder & starter routines
│   ├── types/                  # TypeScript domain models and Supabase schemas
│   ├── App.tsx                 # Route declarations & global layout wrapper
│   └── main.tsx                # Application mount point
├── supabase/
│   ├── functions/ai-coach/     # Deno edge function integrating Google Gemini
│   └── migrations/             # Incremental SQL migrations with RLS policies
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- A free [Supabase](https://supabase.com) account

### 1. Clone the Repository
```bash
git clone https://github.com/kovidanand/GYMTrack.git
cd GYMTrack
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database Setup
Execute the SQL migrations located in `supabase/migrations/` inside your Supabase SQL Editor:
1. `001_profiles.sql` — User profiles, settings, and update triggers
2. `002_exercises.sql` — Exercise dictionary with biomechanics and target muscles
3. `003_workouts.sql` — Workout routines, splits, and exercise orders
4. `004_progress.sql` — Workout sessions, sets, volume, and 1RM calculation helpers
5. `005_ai_coach.sql` — Chat history and conversation thread isolation

### 5. Start Local Development
```bash
npm run dev
```
Visit `http://localhost:5173` to explore GYMTrack locally.

---

## 🧪 Quality Assurance & Build Verification

To verify code integrity, strict type contracts, and production assets:

```bash
# TypeScript strict type checking (0 errors)
npx tsc --noEmit

# Production bundle compilation
npm run build

# Preview optimized production bundle
npm run preview
```

---

## 🔒 Security & Data Integrity

- **Row Level Security (RLS)**: No client can read, update, or delete records belonging to another `user_id`. PostgreSQL verifies `auth.uid() = user_id` at the database kernel level.
- **Edge Function Secrets**: Client bundles only contain the public anon key. The `GEMINI_API_KEY` is securely injected into the edge runtime and never exposed to browser memory.
- **Sanitized Inputs**: All user inputs undergo client and schema-level validation to prevent injection or invalid numeric formats.
- **Idempotent Sync Mutations**: IndexedDB sync queue requests are tagged with UUIDs to guarantee that retrying network operations never creates duplicate sessions or sets.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open an issue or submit a Pull Request following standard GitHub workflows:

1. Fork the Project (`gh repo fork kovidanand/GYMTrack`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<div align="center">

**Built for strength athletes, lifters, and fitness enthusiasts worldwide.**  
[Live App](https://gymtrack-fitness-kovid.vercel.app) • [Report Issue](https://github.com/kovidanand/GYMTrack/issues)

</div>
