# GYMTrack — User Research & Problem Discovery

**Understanding Lifter Needs, Training Friction, and Grounded AI Opportunities**

- **Author / Product Lead:** Kovid Anand (AI Product Manager / Associate Product Manager)
- **Academic Background:** Data Science & AI
- **Document Purpose:** Portfolio Showcase — Problem Framing, User Empathy, and Product Validation
- **Product Focus:** GYMTrack — Mobile Workout Tracking, Periodized Plans & Grounded AI Coach
- **Document Version:** 2.0 — Structured Training & Periodization Edition
- **Date:** September 2026

---

## 1. Why I Started GYMTrack

The motivation behind GYMTrack came from observing everyday gym behavior, combined with personal training experience. Every day, millions of people walk into gyms with genuine motivation to build strength, improve their health, and stay consistent. Yet, when watching people between sets on the gym floor, a consistent pattern of confusion, friction, and wasted effort emerges:

- **Relying on Memory:** Many lifters try to remember what weight they lifted last week. Because they cannot remember whether they did 50 kg or 55 kg for 8 reps, they end up guessing, leading to stalled strength progress.
- **The "Ad-Hoc Workout" Dilemma:** Lifters frequently walk into the gym without a structured program. They spend 10 to 15 minutes wandering between equipment, choosing exercises randomly, or doing whatever machine happens to be free. Without progressive overload across consecutive weeks, their physical results plateau.
- **Awkward Note-Taking:** Some lifters try writing weights in Apple Notes, Google Keep, or paper diaries. Typing numbers with chalked, sweaty hands between intense sets is tedious and breaks concentration.
- **Bloated Commercial Apps:** Existing fitness applications often feel like social media platforms with complicated setup wizards, paywalls, and lengthy multi-step menus. They prioritize ad revenue over rapid set logging.
- **Generic AI Gimmicks:** Recent fitness apps add AI chatbots that offer generic platitudes (*"drink water and sleep 8 hours"*) or fabricate personal records, offering zero practical utility during an active workout session.

---

## 2. Problem Discovery: The Lifter's Reality

Through direct observation and user conversations on gym floors, eight key pain points were identified:

1. **Forgetting Previous Resistance & Reps:** Lifters frequently forget the exact resistance they used on secondary exercises (e.g., Dumbbell Incline Press or Cable Rows), preventing progressive overload.
2. **Losing Track of Sets & Reps:** During intense workouts with high fatigue, lifters easily lose count of whether they have completed two sets or three sets.
3. **Lack of Structured Long-Term Roadmaps:** Lifters lack clear periodized plans that guide them through progressive training blocks (Accumulation, Intensification, Peak, Deload) over 2 months, 3 months, 6 months, or 1–2 years.
4. **Difficulty Tracking Daily Workouts:** Without a clear summary of today's completed workload, lifters leave the gym uncertain of their total volume.
5. **Inability to See Long-Term Progress:** Gains in strength happen incrementally over weeks and months. Without simple charts showing estimated One-Rep Max (1RM) trends, users lose motivation.
6. **Confusion Around Unfamiliar Exercises:** Beginners and intermediate lifters often avoid unfamiliar machines or compound lifts because static diagrams fail to explain proper joint angles and setup.
7. **Generic, Disconnected Fitness Advice:** When lifters ask for advice on what to train next or how to split their routines, available digital tools provide generic answers unrelated to what the user actually lifted yesterday.
8. **Overly Complicated Logging Experiences:** If logging a set takes more than 15 seconds or requires typing on a tiny keyboard, lifters quickly abandon logging entirely.

---

## 3. Target User Personas (Exploratory Archetypes)

### Persona 1: The Beginner Gym Student ("Rohan")
- **Profile:** College student who started going to the gym 2 months ago. Trains 3 days a week.
- **Mindset:** Motivated but slightly intimidated by crowded weight rooms and unfamiliar equipment.
- **Key Frustrations:** Unsure if exercise posture is correct; forgets what weight was used on machines last session; feels overwhelmed by complicated bodybuilding apps.
- **Core Needs:**
  - Simple exercise discovery with clear, verified video demonstrations right on the exercise card.
  - Fast 1-tap logging without complicated workout setup.
  - Basic guidance from AI Coach on proper exercise form and sensible starting weights.

### Persona 2: The Consistent Lifter ("Aman")
- **Profile:** Working professional who trains 4–5 days a week (Push/Pull/Legs split).
- **Mindset:** Focused on progressive overload. Treats gym time as disciplined personal time.
- **Key Frustrations:** Hates typing numbers on a phone screen with chalked/sweaty hands; annoyed when apps reset past records or lose data when gym Wi-Fi drops.
- **Core Needs:**
  - Immediate memory recall: when selecting "Bench Press", the app should show the last weight used.
  - Rapid +/- stepper controls to log sets in under 10 seconds.
  - Hands-free voice logging option (*"Bench press 70kg, 8 reps, 3 sets"*) for heavy compound days.

### Persona 3: The Data-Oriented Strength Enthusiast ("Pooja")
- **Profile:** Intermediate lifter focused on strength progression on compound lifts (Squat, Bench, Deadlift).
- **Mindset:** Values objective data trends over emotional feeling. Tracks weekly volume and 1RM progression.
- **Key Frustrations:** Fitness apps that display fake motivational streaks or flat numbers without estimated 1RM curves; generic AI that gives the same advice to everyone.
- **Core Needs:**
  - Clean strength progression charts with automated Epley One-Rep Max calculations.
  - Muscle group frequency breakdown to prevent undertraining or overtraining.
  - Context-grounded AI Coach that analyzes her actual logged sets to answer: *"Am I getting stronger?"*

### Persona 4: The Long-Term Periodization Lifter ("Vikram")
- **Profile:** Dedicated lifter with 2+ years of gym experience training for strength and hypertrophy.
- **Mindset:** Understands that lasting physical adaptation requires periodization (cycling volume and intensity across 8 to 52 weeks).
- **Key Frustrations:** Tired of designing complex spreadsheets or subscribing to expensive coaching apps just to plan multi-month training blocks.
- **Core Needs:**
  - Automated generation of structured periodized plans spanning 2 Months, 3 Months, 6 Months, 1 Year, or 2 Years.
  - Daily scheduled workouts showing exact exercises, target sets, and reps for today.
  - One-tap exercise video reviews and instant completion checkmarks on the gym floor.

---

## 4. User Pain Points & Product Response

| User Pain Point | Why It Matters (Impact) | GYMTrack Product Response |
| :--- | :--- | :--- |
| **No Structured Training Direction** | Lifters wander between machines, guessing exercises and stalling progress. | Multi-duration Periodized Plans (2M to 2Yrs) that schedule daily workouts automatically. |
| **Forgetting Previous Weights** | Lifters guess weights, leading to inconsistent progression or accidental overtraining. | Auto-populates last used weight and reps whenever an exercise is selected. |
| **Slow, Tedious Input** | Typing on keyboard with sweaty hands interrupts rest periods; leads to abandoned logging. | Large +/- stepper buttons and a hands-free voice logging review sheet. |
| **Uncertainty on Technique** | Beginners risk injury or skip exercises when unsure of movement mechanics. | 100% video-demonstrated exercise library accessible in 1 tap without leaving the app. |
| **Invisible Progress** | Muscle gains take time; without visual proof of strength gains, lifters lose motivation. | Automated Estimated 1RM trends, daily volume totals, and historical comparison charts. |
| **Generic AI Chatbots** | Chatbots that make up numbers or give generic platitudes destroy user trust. | Deterministic AI context builder injecting actual 7D/30D volume, active plan, and logged weights into prompt. |
| **Gym Network Blackouts** | Basement gyms drop cellular signal; online-only apps lose unsaved sets. | Local client-side caching (IndexedDB/localStorage) with automatic background sync. |

---

## 5. End-to-End User Journey

```
Arrival at Gym (Home Dashboard)
       │
       ▼
Today's Scheduled Workout Displayed (e.g. Lower Body Strength - Day 2)
       │
       ▼
Walk to Station -> Tap Exercise Card
       │
       ▼
Inline Form Video Verification (No external app switching, no HD ads)
       │
       ▼
Perform Set -> Rapid Stepper Log / Voice Input (Under 10 seconds)
       │
       ▼
Rest Interval Timer Running
       │
       ▼
Complete Exercise -> Instant Green "Done" Checkmark on Exercise Card
       │
       ▼
Post-Workout: Home Dashboard & Progress Curves Updated Automatically
       │
       ▼
Evening AI Coaching: Grounded Advice Referencing Today's Actual Workload
```

---

## 6. Usability Testing Plan (5–10 Users)

| Usability Task | Task Instructions | Evaluation Metric |
| :--- | :--- | :--- |
| **Task 1: Search & Find an Exercise** | Locate "Incline Dumbbell Press" in the exercise library and check the video demonstration. | Measures search discoverability and speed of opening exercise details. |
| **Task 2: Configure & Start a Periodized Plan** | Navigate to Plans, configure a 3-Month Hypertrophy plan (4 days/week), review the phases, and click "Start This Plan". | Tests plan generator clarity, periodization comprehension, and plan activation speed. |
| **Task 3: Log a Set from Today's Workout** | On the Plans page, tap today's first exercise, watch the demonstration video, log 3 sets of 50 kg × 10 reps, and verify the green "Done" checkmark appears. | Measures inline plan execution speed, video player usability, and visual feedback clarity. |
| **Task 4: Perform Voice Logging** | Tap the microphone icon and speak: *"Bench press 60 kg for 8 reps, 3 sets"*. | Tests speech extraction clarity and ease of reviewing the confirmation sheet. |
| **Task 5: Check Today's Summary** | Confirm how many sets and total volume were logged today from the Home screen. | Measures clarity of daily aggregation metrics and cross-page real-time synchronization. |
| **Task 6: Review Historical Progress** | Navigate to Progress and locate estimated 1RM curve for Bench Press. | Evaluates chart comprehension and navigation flow. |
| **Task 7: Query the AI Coach** | Ask the AI Coach: *"What should I train next?"* or *"Am I getting stronger?"*. | Tests whether the grounded response accurately references logged sets and active plan. |

---

## 7. What I Learned as a Product Builder

1. **Structured Guidance Beats Blank Canvases:** Lifters do not want an empty text box or an unstructured tracker. Having a structured multi-week plan with today's scheduled workout gives them instant clarity the moment they step into the gym.
2. **Speed is the Ultimate Retention Feature:** Every extra tap or modal between heavy sets increases the likelihood of abandoning logging. Sub-10 second interactions and large thumb-friendly controls are non-negotiable in gym environments.
3. **Visual Confirmation Drives Dopamine:** Seeing an exercise card transform into a green "Done" checkmark provides immediate psychological reward, reinforcing the habit of logging each set as it happens.
4. **AI Must Be Grounded in Truth:** In fitness, AI hallucination is dangerous. An AI coach that creates fake PRs or gives one-size-fits-all advice is worse than no AI at all. Real database context injection is the only way to build lasting user trust.
5. **Offline Reliability is Mandatory:** If an app drops a lifter's active workout because the gym basement lost signal, that user will uninstall the app. Local-first caching with graceful background synchronization is a foundational requirement.
