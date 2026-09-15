# GYMTrack — Product Requirements Document (PRD)

**An AI-Powered Workout Tracking, Structured Periodization, and Grounded Coaching Application**

- **Author / Product Lead:** Kovid Anand (AI Product Manager / Associate Product Manager)
- **Academic Background:** Data Science & AI
- **Project Status:** Production / Functional & Validated
- **Document Version:** 2.0 — Structured Training Plans & Periodization Edition
- **Date:** September 2026

---

## 1. Executive Product Overview

**GYMTrack** is a modern, high-performance fitness web application engineered to solve the core frictions of gym tracking: reducing set logging time to seconds, organizing long-term progression through structured periodized plans, demystifying exercise mechanics with video demonstrations, and providing honest, data-grounded AI coaching.

### Core Product Philosophy
GYMTrack prioritizes **Speed, Structure, and Truth**:
1. **Speed:** Between heavy sets, lifters have seconds to record their numbers. Logging must take under 10 seconds or a single spoken sentence.
2. **Structure:** Lifters fail when they guess their daily workouts. GYMTrack delivers periodized multi-week plans (2 Months, 3 Months, 6 Months, 1 Year, 2 Years) that schedule exact exercises, sets, reps, and recovery.
3. **Truth (Zero Hallucination):** The application never displays fake stats, fabricated streaks, or generic AI platitudes. All AI coaching and progress metrics are strictly derived from verified historical workout logs.

---

## 2. Problem Statement & Market Friction

Through real-world gym observation and lifter interviews, five critical problems were identified:

1. **The "What Should I Lift Today?" Dilemma:** Lifters arrive at the gym without a structured plan, wasting 10–15 minutes wandering between machines or repeating the same comfortable exercises without progressive overload.
2. **Cumbersome Mobile Interfaces:** Traditional fitness apps require 5–8 taps per set, navigating deep menus with sweaty or chalked hands, causing users to abandon tracking after 2–3 weeks.
3. **Hallucinatory & Generic Fitness AI:** Existing AI fitness chatbots answer in a vacuum, generating generic advice ("drink water and stay consistent") or fabricating personal records when asked about progress.
4. **Static Diagrams & Broken Video Links:** Lifters needing quick technique checks are confronted with confusing static sketches or broken third-party links, forcing them out of the app to search YouTube.
5. **Basement Gym Network Drops:** Basement and concrete-framed fitness centers routinely lose cellular data, causing online-only applications to freeze, fail to save sets, or lose active sessions.

---

## 3. Target User Personas

| Persona | Archetype | Core Frustration | GYMTrack Solution |
| :--- | :--- | :--- | :--- |
| **Rohan** | Beginner Gym Student | Intimidated by machines; unsure of proper exercise form and starting weights. | 100% video-demonstrated exercise library, clear muscle group tagging, and safe progression cues. |
| **Aman** | Consistent Lifter (Push/Pull/Legs) | Hates typing on tiny touchscreens with chalked hands; annoyed when apps drop data offline. | Rapid +/- stepper controls, hands-free voice logging, and local-first offline caching. |
| **Pooja** | Data-Oriented Strength Lifter | Frustrated by fake streaks and apps that lack estimated 1RM curves and volume trends. | Automated Epley 1RM formula, muscle group volume heatmaps, and zero-fabrication metrics. |
| **Vikram** | Long-Term Periodization Lifter | Wants structured multi-month programs that automatically cycle through accumulation, intensification, and peak phases. | Multi-duration Periodized Plans (2M to 2Yrs) with daily workouts, inline exercise logging, and active plan tracking. |

---

## 4. Product Goals & Success Metrics

### Quantitative Goals
- **Workout Logging Duration:** Average time to log an exercise set $\le 10$ seconds.
- **Voice Logging Accuracy:** Spoken entity extraction accuracy $\ge 90\%$ with one-tap editable review.
- **Video Availability:** 100% video demonstration coverage across the entire exercise library with zero broken embeds or watermarks.
- **Offline Reliability:** Zero lost workout records during complete network disconnects via client-side caching and auto-sync.
- **AI Grounding Fidelity:** 100% of AI Coach responses must strictly reference user-specific logged numbers or explicitly state when data is unavailable.

### North Star Product Metrics
- **Weekly Active Lifters (WAL):** Users logging $\ge 2$ sessions per 7-day rolling window.
- **Plan Adherence Rate:** Percentage of scheduled plan workouts marked completed per week.
- **D30 / D90 Retention:** Long-term user retention driven by authentic progress visualization.

---

## 5. Main Features & Capabilities

### 1. Structured Multi-Duration Training Plans & Periodization Engine
- **Program Duration Flexibility:** Users configure plans tailored for **2 Months (~8 weeks)**, **3 Months (~12 weeks)**, **6 Months (~24 weeks)**, **1 Year (~52 weeks)**, or **2 Years (~104 weeks)**.
- **Scientific Periodization:** Automatically divides programs into progressive phases:
  - *Phase 1: Base Accumulation* — High volume, moderate intensity (3–4 sets of 10–12 reps) to build work capacity and hypertrophy.
  - *Phase 2: Intensification & Strength* — Progressive overload (4 sets of 6–8 reps) targeting neuromuscular adaptation.
  - *Phase 3: Peak Performance* — Heavy compound strength (4–5 sets of 3–5 reps).
  - *Phase 4: Deload & Active Recovery* — Fatigue dissipation and joint recovery.
- **Daily Workout Scheduling:** Automatically maps workout days (e.g. Day 1 = Monday ... Day 7 = Sunday) to the user's current calendar day.
- **Active Plan Dashboard:** Prominently displays the current week, progress bar, today's scheduled workout, and completed exercise badges.

### 2. Rapid Multi-Set Workout Logging
- Large +/- steppers pre-filled with last session's weight and reps.
- Direct number inputs for rapid modification.
- Dedicated rest timer with audio cue to enforce disciplined rest periods between sets.

### 3. Hands-Free Voice Workout Logging
- Speech-to-text integration that parses natural gym language: *"Bench press 80 kg for 8 reps across 3 sets"*.
- AI entity extraction maps spoken words to `exercise`, `weight`, `reps`, and `sets`.
- Editable confirmation preview prevents accidental misinterpretations before saving.

### 4. 100% Video Demonstration Library
- Built-in video demonstrations for all 54 exercises in the catalog.
- Clean autoplay loop without external app switching, third-party ads, or distracting "HD" watermarks.
- Direct execution cues, target muscle groups, and primary equipment tags.

### 5. Single-Exercise Plan Logging & Real-Time Checkmarks
- Lifters can tap any scheduled exercise within today's active workout to open the exercise modal, review the demonstration video, and log completed sets.
- Successfully logged exercises immediately display a persistent green **"Done"** checkmark badge.
- Real-time progress updates both the exercise counter (e.g. *"2 / 5 Exercises Completed"*) and the Home Dashboard without requiring a manual page refresh.

### 6. Grounded AI Coach (Zero Hallucination)
- Deterministic context injection pipeline queries the user's verified database records before prompting the LLM:
  - Active training plan, duration, and current week.
  - Today's planned workout and remaining uncompleted exercises.
  - 7-day and 30-day muscle group volume and training frequency.
  - Historical 1RM trajectory on compound movements.
- Strict system prompt guardrails: If a lifter asks about an exercise they have never logged, the AI Coach explicitly admits no data exists rather than inventing numbers.

### 7. Progress Analytics & 1RM Trajectory
- Daily workout volume calculation: $\sum (\text{Weight} \times \text{Reps})$.
- Estimated One-Rep Max (1RM) based on the Epley formula: $\text{1RM} = \text{Weight} \times (1 + \text{Reps} / 30)$.
- Muscle group distribution charts highlight undertrained or overtrained muscle groups.

### 8. Hybrid Offline Resilience & Synchronous Caching
- Local-first caching layer mirrors active plans, workouts, and logged sets to `localStorage` and `IndexedDB`.
- Operates flawlessly in low-signal gym environments or demo mode, queuing sync operations to Supabase once network reconnects.

---

## 6. End-to-End User Flows

### Flow A: Structured Plan Creation & Daily Execution
```
[ Open Plans Page ]
       │
       ▼
[ Select Duration: 2M / 3M / 6M / 1Yr / 2Yr ]
       │
       ▼
[ Choose Goal, Level & Days/Week ]
       │
       ▼
[ Preview Periodized Plan & Phases ]
       │
       ▼
[ Click 'Start This Plan' ]
       │
       ▼
[ Plan Persisted & Activated in Supabase / Local ]
       │
       ▼
[ Home Dashboard & Plans Page Show Today's Workout ]
       │
       ▼
[ Tap Exercise -> Watch Video -> Log Sets ]
       │
       ▼
[ Instant Green Checkmark + Live Telemetry Update ]
```

### Flow B: Rapid Voice Logging Between Sets
```
[ Tap Mic Icon on Log Modal ]
       │
       ▼
[ Speak: 'Incline Dumbbell Press 26 kg 10 reps 3 sets' ]
       │
       ▼
[ Speech-to-Text & AI Entity Extraction ]
       │
       ▼
[ Editable Review Sheet Displays Values ]
       │
       ▼
[ User Taps 'Confirm & Save' ]
       │
       ▼
[ Database & Cache Updated; Metrics Refresh ]
```

---

## 7. Data Architecture & Relational Schema

```
USERS
  │── WORKOUT_PLANS (id, user_id, name, goal, duration_weeks, days_per_week, is_active, started_at)
  │     └── WORKOUTS (id, plan_id, name, day_number, day_of_week, day_type)
  │           └── WORKOUT_EXERCISES (id, workout_id, exercise_id, sets, reps, rest_seconds, order_in_workout)
  │                 └── EXERCISES (id [UUID], name, slug, target_muscle, equipment, video_url)
  │     └── PLAN_DAY_COMPLETIONS (id, plan_id, user_id, day_number, week_number, completed_at, status)
  │
  └── WORKOUT_SESSIONS (id, user_id, started_at, completed_at, total_volume, session_date)
        └── WORKOUT_SESSION_SETS (id, session_id, exercise_id, exercise_name, set_number, weight_kg, reps)
```

---

## 8. Key Product Decisions & Trade-Offs

1. **Decision: Multi-Duration Periodization (2M up to 2Yrs) vs Fixed 4-Week Splits**
   - *Rationale:* Real athletic adaptations and muscle hypertrophy occur over multi-month cycles. Providing structured periodization up to 2 years gives lifters a continuous roadmap without needing to rebuild their routines every month.
2. **Decision: Hybrid Local-First & Supabase Relational Persistence**
   - *Rationale:* Lifters train in basement gyms with spotty connectivity. By coupling Supabase PostgreSQL with local caching, the app guarantees zero data loss, supports instant demo access, and prevents RLS errors from interrupting active training.
3. **Decision: Single-Exercise In-Plan Logging with Visual Checkmarks**
   - *Rationale:* Lifters complete exercises one at a time on the gym floor. Allowing them to tap an exercise card, watch the video cue, log their sets, and see an immediate green "Done" tag provides instant psychological reinforcement.
4. **Decision: Strict Context Grounding over Conversational Generality**
   - *Rationale:* General AI chatbots hallucinate workout records. Injecting actual recent volume, muscle frequency, and active plan schedules ensures the AI Coach provides advice lifters can trust with their physical safety.

---

## 9. Engineering Challenges Solved

- **UUID vs Catalog ID Harmonization:** Client-side exercises utilize string keys (`'ex-bench-press'`), while Supabase tables enforce UUID foreign keys. Resolved by implementing a catalog resolution map that transforms identifiers before persistence while maintaining backward-compatible local fallback.
- **Relational Query Scoping:** Resolved telemetry query issues where `workout_session_sets` was queried for non-existent `user_id`, refactoring queries to join through `workout_sessions`.
- **100% Video Demonstration Coverage:** Audited and resolved video slug mismatches across all 54 exercises in the catalog, ensuring seamless video playback without external redirection or watermarks.

---

## 10. Future Roadmap

- **Smart Apple Watch / Wear OS Companion:** Log sets and trigger rest timers directly from the wrist.
- **Computer Vision Form Analysis:** On-device camera tracking to assess squat and deadlift bar paths.
- **1RM Target Auto-Regulation:** Dynamic weight recommendations based on previous session RPE (Rate of Perceived Exertion).
