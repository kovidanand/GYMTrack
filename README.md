<div align="center">

# ⚡ GYMTrack
### Next-Generation Fitness Intelligence & Offline-First Strength Tracking

*Log what you trained. Zero friction. Zero data loss in the gym basement.*

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

Most workout apps fall into one of two traps:
1. **They fail in underground basements**: When cell signals drop between concrete walls, cloud-dependent trackers freeze, spin indefinitely, or lose entire workout sessions.
2. **They feel like bloated spreadsheets**: Convoluted menu hierarchies, mandatory stopwatch modes, and clunky sidebars turn what should be a 5-second log into a workout interruption.

**GYMTrack re-imagines the fitness tracking workflow:**
```
  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
  │  OPEN APP   │  ──▶  │  SEE TODAY  │  ──▶  │    TAP +    │  ──▶  │ CONFIRM LOG │
  └─────────────┘       └─────────────┘       └─────────────┘       └─────────────┘
                                                                           │
                                                                           ▼
                                                               ┌──────────────────────┐
                                                               │  DASHBOARD UPDATES   │
                                                               │  (VOLUME & 1RM PRs)  │
                                                               └──────────────────────┘
```

Built with modern consumer UX principles—a clean top navigation bar, glassmorphism design tokens, instant one-tap exercise logging, set-accurate volume aggregation, and an evidence-grounded AI coach that never hallucinates.

---

## ✨ Core Feature Highlights

### 1. ⚡ Consumer-Grade Frictionless Logging
- **Instant Top-Level Action**: Direct access to `+ Log Training` without navigating nested submenus.
- **Accurate Set Analytics**: Daily volume calculated directly from completed sets ($\text{weight} \times \text{reps}$) with dynamic session aggregations.
- **Interactive Daily Stream**: Click any exercise row to inspect history, tap metric tiles (Exercises, Sets, Volume, Duration) to jump directly into deep progress analytics, and select weekly calendar days for instant logs.
- **Contextual Daily Insights**: Grounded coaching summaries that analyze actual training deltas against prior sessions.

### 2. 📶 "Basement Mode" — Zero-Loss Offline Resilience
- **Persistent IndexedDB Engine**: Operates independently of network availability via local `sync_queue`, `cached_workouts`, and `active_sessions`.
- **Automatic Network Reconnection**: Detects network transitions with an interactive sync indicator badge.
- **Idempotent Queue Replay**: Retries pending mutations sequentially upon reconnection, deduplicating inflight payloads to ensure zero duplicate sessions.
- **Session Continuity**: Active workouts persist seamlessly across tab refreshes, background suspensions, and accidental closures.

### 3. 📈 Precision 1RM & Overload Analytics
- **Standardized Epley Progression Formula**:
  $$\text{1RM} = \text{weight} \times \left(1 + \frac{\text{reps}}{30}\right)$$
- **Transparent Velocity Metrics**: Real math-backed estimations rather than arbitrary proprietary fatigue scores.
- **Differentiated Movement Classification**: Distinguishes weighted barbell/dumbbell movements from bodyweight, assisted, and duration-based exercises.
- **All-Time PR Celebrations**: Automatically flags, archives, and displays Personal Records by weight, volume, and estimated 1RM.

### 4. 🧠 Grounded AI Coach & Structured UI Renderer
- **Dual-Engine Architecture**: Powered by **Google Gemini 1.5 Flash** (via Supabase Edge Functions) with a robust, rule-based **Deterministic Local Engine** fallback when offline.
- **Strict Guardrails**: Operates strictly on authentic user log data. No fabricated recovery stats or synthetic HRV claims.
- **Native `AiResponseRenderer`**: Completely eliminates raw markdown formatting (`###`, `**`, `*`) and decorative sparkles in favor of native, responsive UI components:
  - Clean typographic hierarchy (`h3`, `h4`, styled lists, parameter chips)
  - Interactive exercise cards with anatomical target badges and visual guides
  - Biomechanical cues and structured progression tables
- **Dual Form Factor**: Available as an unobtrusive **Floating Mobile Drawer** across all screens or as a dedicated **Full-Page Intelligence Workspace**.

### 5. 🛡️ Enterprise Security & Multi-Tenant Privacy
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
│  - PKCE / OTP     │  - 1RM Epley Analytics        │   - Sync Queue Replay   │
│  - Protected Route│  - AiResponseRenderer         │   - Network Listeners   │
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
| **Frontend Framework** | [React 18.3](https://react.dev) | High-performance component model with functional hooks |
| **Language** | [TypeScript 5.5](https://www.typescriptlang.org) | End-to-end type safety, strict compile checks, zero-lint debt |
| **Build & Dev Server** | [Vite 5.4](https://vitejs.dev) | Lightning-fast HMR and optimized production Rollup bundling |
| **Styling & Design** | [Tailwind CSS 3.4](https://tailwindcss.com) | Curated dark-mode theme, glassmorphism, responsive grid system |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com) & [Lucide Icons](https://lucide.dev) | Accessible, unstyled UI primitives and consistent iconography |
| **Charts & Visuals** | [Recharts](https://recharts.org) | SVG-rendered volume loads, frequency trends, and PR progression curves |
| **Offline Persistence** | [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Low-level browser database for offline logging & sync queue |
| **Cloud Database** | [Supabase PostgreSQL 15](https://supabase.com) | Enterprise relational storage with Row Level Security (RLS) policies |
| **Authentication** | [Supabase GoTrue](https://supabase.com/docs/guides/auth) | Google OAuth (PKCE flow), Email OTP, and automatic session refresh |
| **Serverless AI** | [Supabase Edge Functions](https://supabase.com/docs/guides/functions) | Deno-based secure proxy communicating with Google Gemini 1.5 Flash |
| **Deployment** | [Vercel](https://vercel.com) | Automated CI/CD pipeline, global CDN edge distribution, SPA routing |

---

## 📁 Repository Structure

```
GYMTrack/
├── public/                     # Static assets & web manifest
├── src/
│   ├── components/
│   │   ├── ai/                 # AI Assistant components
│   │   │   ├── AiResponseRenderer.tsx  # Structured UI Markdown transformer
│   │   │   └── FloatingAiCoach.tsx     # Contextual mobile/desktop floating panel
│   │   ├── auth/               # Authentication modals & forms (OTP, Google)
│   │   ├── common/             # Reusable UI primitives (Buttons, Cards, Modals)
│   │   ├── navigation/         # Responsive Top Navigation & Mobile Bar
│   │   └── workouts/           # Training Logger, Set Inputs, Exercise Selector
│   ├── hooks/                  # Custom React hooks (useAuth, useProgress, useAiCoach)
│   ├── lib/                    # Core application libraries
│   │   ├── coachProvider.ts    # Dual-mode AI Coach & deterministic heuristics
│   │   ├── indexedDb.ts        # Offline storage & sync queue management
│   │   ├── supabase.ts         # Supabase client singleton & auth helpers
│   │   └── utils.ts            # Formatting, calculations (Epley 1RM, volume)
│   ├── pages/                  # Main route pages
│   │   ├── Dashboard.tsx       # Primary action dashboard & daily activity stream
│   │   ├── AiCoach.tsx         # Full-page interactive AI intelligence portal
│   │   ├── Workouts.tsx        # Workout routine builder & exercise library
│   │   ├── Progress.tsx        # In-depth analytics, PR timelines & charts
│   │   └── Profile.tsx         # Account settings & data export
│   ├── types/                  # TypeScript domain declarations
│   ├── App.tsx                 # Route declarations & global providers
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

## 🧪 Quality Assurance & Build Checks

To verify code integrity, strict type contracts, and production assets:

```bash
# TypeScript strict type checking
npx tsc --noEmit

# Production bundle compilation
npm run build

# Preview optimized production bundle
npm run preview
```

---

## 🔒 Security & Data Integrity

- **Row Level Security (RLS)**: No client can read, update, or delete records belonging to another `user_id`. PostgreSQL verifies `auth.uid() = user_id` at the database kernel level.
- **Edge Function Secrets**: Client bundles only contain the public anon key. The `GEMINI_API_KEY` is securely injected in the edge runtime and never exposed to browser memory.
- **Sanitized Inputs**: All user inputs undergo client and schema-level validation to prevent injection or invalid numeric formats.

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

**Built with passion for strength athletes and lifters worldwide.**  
[Live App](https://gymtrack-fitness-kovid.vercel.app) • [Report Issue](https://github.com/kovidanand/GYMTrack/issues)

</div>
