-- =============================================================================
-- GYMTrack — Phase 3 Database Migration: Exercises & Favorites
-- =============================================================================

-- ─── 1. exercises table ──────────────────────────────────────────────────────
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  instructions text[] not null default '{}',
  tips text[] not null default '{}',
  common_mistakes text[] not null default '{}',
  primary_muscle text not null,
  secondary_muscles text[] not null default '{}',
  muscle_group text not null,
  equipment text[] not null default '{}',
  difficulty text not null,
  exercise_type text not null,
  movement_pattern text not null,
  image_url text,
  video_url text,
  is_compound boolean not null default false,
  is_unilateral boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast searching and filtering
create index if not exists exercises_name_idx on public.exercises(name);
create index if not exists exercises_muscle_group_idx on public.exercises(muscle_group);
create index if not exists exercises_primary_muscle_idx on public.exercises(primary_muscle);
create index if not exists exercises_equipment_idx on public.exercises using gin (equipment);
create index if not exists exercises_difficulty_idx on public.exercises(difficulty);
create index if not exists exercises_exercise_type_idx on public.exercises(exercise_type);

-- Trigger for updated_at
drop trigger if exists set_exercises_updated_at on public.exercises;
create trigger set_exercises_updated_at
  before update on public.exercises
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.exercises enable row level security;

-- Authenticated users can read exercises
create policy "exercises: select all"
  on public.exercises for select
  to authenticated
  using (true);

-- ─── 2. user_favorite_exercises table ─────────────────────────────────────────
create table if not exists public.user_favorite_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, exercise_id) -- Prevent duplicate favorites
);

-- Index for querying a user's favorites
create index if not exists user_favorite_exercises_user_id_idx on public.user_favorite_exercises(user_id);

-- RLS
alter table public.user_favorite_exercises enable row level security;

create policy "favorites: select own"
  on public.user_favorite_exercises for select
  using (auth.uid() = user_id);

create policy "favorites: insert own"
  on public.user_favorite_exercises for insert
  with check (auth.uid() = user_id);

create policy "favorites: delete own"
  on public.user_favorite_exercises for delete
  using (auth.uid() = user_id);

-- Grants
grant all on public.exercises to authenticated;
grant all on public.user_favorite_exercises to authenticated;

-- ─── 3. Seed Data ────────────────────────────────────────────────────────────

-- Clear existing data (optional, but good for idempotency if rerunning)
-- TRUNCATE public.exercises CASCADE;

INSERT INTO public.exercises (
  name, slug, description, instructions, tips, common_mistakes, primary_muscle, secondary_muscles, muscle_group, equipment, difficulty, exercise_type, movement_pattern, is_compound, is_unilateral
) VALUES
-- CHEST (8)
('Bench Press', 'bench-press', 'A classic compound exercise that builds strength and size in the chest, shoulders, and triceps.', 
 '{"Lie flat on a bench, gripping the bar slightly wider than shoulder-width.", "Unrack the bar and hold it straight over your chest.", "Lower the bar slowly to your mid-chest.", "Press the bar back up to the starting position."}', 
 '{"Keep your feet flat on the floor.", "Squeeze your shoulder blades together.", "Maintain a slight arch in your lower back."}', 
 '{"Bouncing the bar off the chest.", "Flaring elbows too much.", "Lifting the glutes off the bench."}', 
 'Pectoralis Major', '{"Anterior Deltoid", "Triceps Brachii"}', 'chest', '{"barbell", "bench"}', 'intermediate', 'strength', 'horizontal_push', true, false),

('Incline Bench Press', 'incline-bench-press', 'A variation of the bench press performed on an incline bench, targeting the upper portion of the chest.', 
 '{"Set an incline bench to 30-45 degrees.", "Grip the bar slightly wider than shoulder-width.", "Lower the bar to your upper chest.", "Press back up to the starting position."}', 
 '{"Don''t set the incline too high, or it becomes a shoulder press.", "Control the descent."}', 
 '{"Arching the back excessively to flatten the chest angle.", "Bouncing the bar."}', 
 'Upper Pectoralis Major', '{"Anterior Deltoid", "Triceps"}', 'chest', '{"barbell", "bench"}', 'intermediate', 'strength', 'horizontal_push', true, false),

('Dumbbell Bench Press', 'dumbbell-bench-press', 'A chest press using dumbbells, allowing for a greater range of motion and independent arm movement.', 
 '{"Sit on a bench with dumbbells on your thighs.", "Kick the weights up as you lie back.", "Press the dumbbells up until your arms are extended.", "Lower them slowly until you feel a stretch in your chest."}', 
 '{"Keep your wrists straight.", "Tuck your elbows to about 45 degrees."}', 
 '{"Dropping the weights ungraciously.", "Not going deep enough."}', 
 'Pectoralis Major', '{"Anterior Deltoid", "Triceps"}', 'chest', '{"dumbbell", "bench"}', 'intermediate', 'strength', 'horizontal_push', true, true),

('Incline Dumbbell Press', 'incline-dumbbell-press', 'Targets the upper chest and shoulders using dumbbells on an incline bench.', 
 '{"Set an incline bench to 30-45 degrees.", "Kick the dumbbells up to shoulder height.", "Press the weights straight up.", "Lower under control."}', 
 '{"Keep a slight bend in the elbows at the top to maintain tension.", "Squeeze the chest at the top."}', 
 '{"Using momentum.", "Flaring elbows to 90 degrees."}', 
 'Upper Pectoralis Major', '{"Anterior Deltoid", "Triceps"}', 'chest', '{"dumbbell", "bench"}', 'intermediate', 'strength', 'horizontal_push', true, true),

('Push-Up', 'push-up', 'A fundamental bodyweight exercise for the chest, shoulders, and triceps, requiring core stability.', 
 '{"Start in a high plank position with hands slightly wider than shoulder-width.", "Lower your body until your chest nearly touches the floor.", "Push back up to the starting position."}', 
 '{"Keep your core braced and body in a straight line.", "Tuck elbows to 45 degrees."}', 
 '{"Sagging the hips.", "Flaring the elbows.", "Half reps."}', 
 'Pectoralis Major', '{"Anterior Deltoid", "Triceps", "Core"}', 'chest', '{"bodyweight"}', 'beginner', 'strength', 'horizontal_push', true, false),

('Cable Crossover', 'cable-crossover', 'An isolation movement for the chest, providing constant tension throughout the range of motion.', 
 '{"Set the pulleys to a high position.", "Grab the handles and step forward slightly.", "Bring your hands together in front of your chest in a hugging motion.", "Slowly return to the start."}', 
 '{"Keep a slight bend in your elbows.", "Focus on squeezing the chest."}', 
 '{"Pressing the weight instead of flying.", "Using too much weight and using momentum."}', 
 'Pectoralis Major', '{"Anterior Deltoid"}', 'chest', '{"cable"}', 'intermediate', 'hypertrophy', 'horizontal_fly', false, false),

('Chest Fly', 'chest-fly', 'An isolation exercise using dumbbells to stretch and contract the pectoral muscles.', 
 '{"Lie on a flat bench with dumbbells held above your chest.", "With a slight bend in your elbows, lower the weights out to the sides in a wide arc.", "Squeeze your chest to bring the weights back together."}', 
 '{"Don''t go too deep; stop when you feel a good stretch.", "Imagine hugging a large barrel."}', 
 '{"Bending the elbows too much (turning it into a press).", "Going too heavy."}', 
 'Pectoralis Major', '{"Anterior Deltoid"}', 'chest', '{"dumbbell", "bench"}', 'intermediate', 'hypertrophy', 'horizontal_fly', false, false),

('Decline Bench Press', 'decline-bench-press', 'A pressing movement on a decline bench, focusing on the lower portion of the chest.', 
 '{"Secure your feet on a decline bench and lie back.", "Unrack the bar and lower it to your lower chest.", "Press back up to the top."}', 
 '{"Ensure you have a spotter.", "Control the weight on the way down."}', 
 '{"Bouncing the bar.", "Lifting the head off the bench."}', 
 'Lower Pectoralis Major', '{"Anterior Deltoid", "Triceps"}', 'chest', '{"barbell", "bench"}', 'intermediate', 'strength', 'horizontal_push', true, false),


-- BACK (8)
('Pull-Up', 'pull-up', 'A classic bodyweight exercise that builds upper body strength, primarily targeting the lats and biceps.', 
 '{"Grab the pull-up bar with an overhand grip slightly wider than shoulder-width.", "Hang freely with arms fully extended.", "Pull yourself up until your chin clears the bar.", "Lower yourself slowly back to the starting position."}', 
 '{"Keep your core engaged to prevent swinging.", "Focus on pulling your elbows down to your sides.", "Squeeze your shoulder blades together at the top."}', 
 '{"Using momentum (kipping) instead of strict form.", "Not completing the full range of motion (half reps).", "Shrugging the shoulders towards the ears."}', 
 'Latissimus Dorsi', '{"Biceps Brachii", "Rhomboids", "Lower Trapezius", "Core"}', 'back', '{"pull_up_bar", "bodyweight"}', 'intermediate', 'strength', 'vertical_pull', true, false),

('Lat Pulldown', 'lat-pulldown', 'A machine-based exercise mimicking the pull-up, excellent for developing back width.', 
 '{"Sit at the pulldown machine and adjust the knee pad.", "Grip the bar slightly wider than shoulder-width.", "Pull the bar down to your upper chest.", "Slowly return the bar to the top."}', 
 '{"Lean back slightly.", "Initiate the pull with your lats, not your biceps."}', 
 '{"Pulling the bar behind the neck.", "Using momentum to jerk the weight down."}', 
 'Latissimus Dorsi', '{"Biceps", "Rear Deltoids", "Rhomboids"}', 'back', '{"cable", "machine"}', 'beginner', 'hypertrophy', 'vertical_pull', true, false),

('Barbell Row', 'barbell-row', 'A heavy compound movement for building overall back thickness and strength.', 
 '{"Stand over a barbell with feet shoulder-width apart.", "Hinge at the hips, keeping your back straight, and grip the bar.", "Pull the bar to your lower ribcage.", "Lower the bar back to the floor."}', 
 '{"Keep your torso nearly parallel to the floor.", "Squeeze your shoulder blades together at the top."}', 
 '{"Rounding the lower back.", "Using too much momentum (jerking).", "Standing too upright."}', 
 'Latissimus Dorsi', '{"Rhomboids", "Trapezius", "Biceps", "Erector Spinae"}', 'back', '{"barbell"}', 'intermediate', 'strength', 'horizontal_pull', true, false),

('Seated Cable Row', 'seated-cable-row', 'A horizontal pulling movement that targets the mid-back.', 
 '{"Sit at a low pulley machine with a V-bar attachment.", "Keep your back straight and knees slightly bent.", "Pull the handle to your abdomen.", "Slowly extend your arms back out."}', 
 '{"Keep your chest up and shoulders back.", "Don''t lean too far forward or back."}', 
 '{"Using the lower back to heave the weight.", "Rounding the shoulders forward."}', 
 'Rhomboids', '{"Latissimus Dorsi", "Trapezius", "Biceps"}', 'back', '{"cable", "machine"}', 'beginner', 'hypertrophy', 'horizontal_pull', true, false),

('One-Arm Dumbbell Row', 'one-arm-dumbbell-row', 'A unilateral row that helps correct imbalances and builds back thickness.', 
 '{"Place one knee and one hand on a flat bench.", "Hold a dumbbell in the free hand.", "Pull the dumbbell up to your hip.", "Lower it back down fully."}', 
 '{"Keep your back flat.", "Pull with your elbow, not your hand."}', 
 '{"Twisting the torso to lift the weight.", "Pulling straight up instead of towards the hip."}', 
 'Latissimus Dorsi', '{"Rhomboids", "Biceps", "Rear Deltoids"}', 'back', '{"dumbbell", "bench"}', 'intermediate', 'hypertrophy', 'horizontal_pull', true, true),

('T-Bar Row', 't-bar-row', 'A rowing variation that allows for heavy loads and targets the mid-back and lats.', 
 '{"Stand over the T-bar apparatus.", "Hinge at the hips and grab the handles.", "Pull the weight to your chest.", "Lower under control."}', 
 '{"Keep your lower back straight and core braced.", "Use a full range of motion."}', 
 '{"Rounding the back.", "Using too much momentum."}', 
 'Latissimus Dorsi', '{"Rhomboids", "Trapezius", "Biceps"}', 'back', '{"machine"}', 'intermediate', 'strength', 'horizontal_pull', true, false),

('Straight-Arm Pulldown', 'straight-arm-pulldown', 'An isolation exercise for the lats, great for learning lat engagement.', 
 '{"Attach a straight bar to a high cable pulley.", "Stand facing the machine, grab the bar with straight arms.", "Push the bar down in an arc to your thighs.", "Slowly let it back up."}', 
 '{"Keep a slight bend in the elbows but lock them in position.", "Focus on the lat stretch."}', 
 '{"Bending the elbows (turning it into a tricep pushdown).", "Using the shoulders too much."}', 
 'Latissimus Dorsi', '{"Teres Major"}', 'back', '{"cable"}', 'beginner', 'hypertrophy', 'isolation', false, false),

('Deadlift', 'deadlift', 'The ultimate test of total body strength, targeting the posterior chain from calves to traps.', 
 '{"Stand with feet hip-width apart, bar over mid-foot.", "Hinge at the hips and grab the bar just outside your legs.", "Drop your hips slightly, lift your chest, and flatten your back.", "Drive through your legs and stand up straight.", "Lower the bar by hinging at the hips first, then bending the knees."}', 
 '{"Keep the bar close to your body throughout the lift.", "Brace your core heavily.", "Think about pushing the floor away."}', 
 '{"Rounding the lower back (cat back).", "Starting with hips too low (squatting the weight).", "Jerking the bar off the floor."}', 
 'Erector Spinae', '{"Glutes", "Hamstrings", "Quadriceps", "Trapezius", "Core"}', 'back', '{"barbell"}', 'advanced', 'strength', 'hinge', true, false),


-- SHOULDERS (7)
('Overhead Press', 'overhead-press', 'A strict standing press that builds overall shoulder and tricep strength.', 
 '{"Stand with feet shoulder-width apart.", "Hold the bar at shoulder level with a grip slightly wider than shoulders.", "Press the bar overhead until arms are locked.", "Lower the bar back to the shoulders."}', 
 '{"Squeeze your glutes and brace your core.", "Keep your elbows slightly in front of the bar."}', 
 '{"Leaning back excessively.", "Using leg drive (making it a push press)."}', 
 'Anterior Deltoid', '{"Medial Deltoid", "Triceps", "Upper Trapezius"}', 'shoulders', '{"barbell"}', 'intermediate', 'strength', 'vertical_push', true, false),

('Dumbbell Shoulder Press', 'dumbbell-shoulder-press', 'A seated or standing overhead press using dumbbells for greater range of motion.', 
 '{"Sit on a bench with back support.", "Hold dumbbells at shoulder height.", "Press them overhead until they nearly touch.", "Lower them back to the start."}', 
 '{"Don''t let the dumbbells clank together at the top.", "Keep wrists stacked."}', 
 '{"Arching the lower back off the pad.", "Flaring elbows too far back."}', 
 'Anterior Deltoid', '{"Medial Deltoid", "Triceps"}', 'shoulders', '{"dumbbell", "bench"}', 'intermediate', 'hypertrophy', 'vertical_push', true, true),

('Lateral Raise', 'lateral-raise', 'The premier isolation exercise for the medial delts, essential for shoulder width.', 
 '{"Stand holding dumbbells at your sides.", "Raise your arms straight out to the sides until they are parallel to the floor.", "Slowly lower them back down."}', 
 '{"Lead with your elbows, keeping them slightly higher than your wrists.", "Use a light weight and focus on the muscle."}', 
 '{"Swinging the weight using momentum.", "Shrugging the shoulders."}', 
 'Medial Deltoid', '{"Anterior Deltoid"}', 'shoulders', '{"dumbbell"}', 'beginner', 'hypertrophy', 'isolation', false, true),

('Front Raise', 'front-raise', 'An isolation movement for the anterior (front) deltoids.', 
 '{"Stand holding a dumbbell in each hand in front of your thighs.", "Raise one or both arms straight forward to shoulder level.", "Lower under control."}', 
 '{"Keep a slight bend in the elbow.", "Don''t lean back to lift the weight."}', 
 '{"Using momentum.", "Lifting above shoulder height."}', 
 'Anterior Deltoid', '{"Medial Deltoid"}', 'shoulders', '{"dumbbell"}', 'beginner', 'hypertrophy', 'isolation', false, true),

('Rear Delt Fly', 'rear-delt-fly', 'Targets the posterior (rear) deltoids, crucial for shoulder health and posture.', 
 '{"Bend over at the hips or sit on a bench leaning forward.", "Hold dumbbells hanging down.", "Raise your arms out to the sides in a reverse fly motion.", "Squeeze your rear delts and lower."}', 
 '{"Keep your torso stable.", "Focus on pulling the weight apart, not just up."}', 
 '{"Using the upper back (rhomboids) instead of the rear delts.", "Using too much momentum."}', 
 'Posterior Deltoid', '{"Rhomboids", "Trapezius"}', 'shoulders', '{"dumbbell"}', 'intermediate', 'hypertrophy', 'isolation', false, true),

('Face Pull', 'face-pull', 'Excellent for rear delts and external rotators, promoting healthy shoulders.', 
 '{"Attach a rope to a high cable pulley.", "Grip the rope from underneath and step back.", "Pull the rope towards your face, flaring your elbows out.", "Squeeze your upper back and slowly return."}', 
 '{"Pull your hands apart as they approach your face.", "Keep your chest up."}', 
 '{"Using too much weight.", "Pulling to the neck instead of the face."}', 
 'Posterior Deltoid', '{"Rhomboids", "Trapezius", "Rotator Cuff"}', 'shoulders', '{"cable"}', 'beginner', 'hypertrophy', 'horizontal_pull', true, false),

('Arnold Press', 'arnold-press', 'A variation of the dumbbell press that involves rotation, hitting all heads of the deltoid.', 
 '{"Sit on a bench, holding dumbbells in front of your face, palms facing you.", "As you press up, rotate your wrists outward.", "Finish the press with palms facing forward.", "Reverse the motion on the way down."}', 
 '{"Use a smooth, continuous motion.", "Don''t go too heavy initially."}', 
 '{"Rushing the rotation.", "Arching the back excessively."}', 
 'Anterior Deltoid', '{"Medial Deltoid", "Triceps"}', 'shoulders', '{"dumbbell", "bench"}', 'intermediate', 'hypertrophy', 'vertical_push', true, true),


-- ARMS (9)
('Barbell Curl', 'barbell-curl', 'The standard mass-builder for the biceps.', 
 '{"Stand holding a barbell with a shoulder-width underhand grip.", "Curl the bar up towards your chest.", "Squeeze at the top.", "Lower it slowly to the starting position."}', 
 '{"Keep your elbows pinned to your sides.", "Don''t use momentum from your hips."}', 
 '{"Swinging the weight.", "Letting elbows drift forward at the top."}', 
 'Biceps Brachii', '{"Brachialis", "Forearms"}', 'biceps', '{"barbell"}', 'beginner', 'hypertrophy', 'isolation', false, false),

('Dumbbell Curl', 'dumbbell-curl', 'A classic bicep isolation exercise that allows for independent arm movement and wrist rotation.', 
 '{"Stand holding a dumbbell in each hand, palms facing forward.", "Keep your upper arms stationary and curl the weights.", "Squeeze your biceps at the top.", "Lower the weights under control."}', 
 '{"You can curl both arms simultaneously or alternate.", "Supinate (twist) your wrist slightly at the top for maximum contraction."}', 
 '{"Swinging the torso to lift the weight.", "Letting the elbows travel forward."}', 
 'Biceps Brachii', '{"Brachialis", "Forearms"}', 'biceps', '{"dumbbell"}', 'beginner', 'hypertrophy', 'isolation', false, true),

('Hammer Curl', 'hammer-curl', 'Targets the brachialis and brachioradialis, adding thickness to the arms.', 
 '{"Stand holding dumbbells with a neutral grip (palms facing each other).", "Curl the weights up without rotating your wrists.", "Lower slowly."}', 
 '{"Keep elbows locked at your sides.", "Control the eccentric (lowering) phase."}', 
 '{"Using momentum.", "Swinging the weights."}', 
 'Brachialis', '{"Biceps Brachii", "Brachioradialis"}', 'biceps', '{"dumbbell"}', 'beginner', 'hypertrophy', 'isolation', false, true),

('Preacher Curl', 'preacher-curl', 'Isolates the biceps by eliminating momentum from the rest of the body.', 
 '{"Sit at a preacher bench and grab the EZ bar.", "Rest your upper arms flat on the pad.", "Curl the bar up.", "Lower it until your arms are fully extended."}', 
 '{"Don''t lift your elbows off the pad.", "Focus on the stretch at the bottom."}', 
 '{"Using too heavy a weight and straining the biceps tendon.", "Short-changing the range of motion."}', 
 'Biceps Brachii', '{"Brachialis"}', 'biceps', '{"barbell", "machine"}', 'intermediate', 'hypertrophy', 'isolation', false, false),

('Cable Curl', 'cable-curl', 'Provides constant tension on the biceps throughout the curl.', 
 '{"Attach a straight or EZ bar to a low cable pulley.", "Stand up straight, grab the bar, and curl up.", "Lower slowly."}', 
 '{"Stand slightly back from the pulley to keep tension at the bottom.", "Squeeze hard at the top."}', 
 '{"Using the hips to heave the weight.", "Standing too close to the pulley."}', 
 'Biceps Brachii', '{"Brachialis"}', 'biceps', '{"cable"}', 'beginner', 'hypertrophy', 'isolation', false, false),

('Tricep Pushdown', 'tricep-pushdown', 'A staple tricep exercise using a cable machine.', 
 '{"Attach a straight bar or rope to a high pulley.", "Grip the attachment and keep your elbows pinned to your sides.", "Push the weight down until your arms are fully extended.", "Slowly return to the start."}', 
 '{"Only move your forearms; keep the upper arms stationary.", "Squeeze the triceps at the bottom."}', 
 '{"Letting the elbows flare out.", "Using body weight to press the cable down."}', 
 'Triceps Brachii', '{}', 'triceps', '{"cable"}', 'beginner', 'hypertrophy', 'isolation', false, false),

('Skull Crushers', 'skull-crushers', 'An effective exercise for targeting the long head of the triceps.', 
 '{"Lie on a flat bench holding an EZ bar over your chest.", "Keep your upper arms stationary and lower the bar to your forehead.", "Extend your arms back to the starting position."}', 
 '{"Angle your arms slightly back towards your head to keep tension on the triceps.", "Control the weight on the way down."}', 
 '{"Flaring the elbows out too much.", "Moving the upper arms (turning it into a pullover)."}', 
 'Triceps Brachii', '{}', 'triceps', '{"barbell", "bench"}', 'intermediate', 'hypertrophy', 'isolation', false, false),

('Overhead Tricep Extension', 'overhead-tricep-extension', 'Places the triceps in a stretched position, heavily engaging the long head.', 
 '{"Stand or sit holding a dumbbell overhead with both hands.", "Lower the weight behind your head by bending your elbows.", "Extend your arms back to the top."}', 
 '{"Keep your elbows pointing up, not out.", "Maintain a tight core."}', 
 '{"Arching the lower back.", "Flaring the elbows out."}', 
 'Triceps Brachii', '{}', 'triceps', '{"dumbbell"}', 'intermediate', 'hypertrophy', 'isolation', false, false),

('Close-Grip Bench Press', 'close-grip-bench-press', 'A compound movement that shifts focus from the chest to the triceps.', 
 '{"Lie on a bench and grip the bar with hands shoulder-width apart.", "Lower the bar to your lower chest, keeping elbows tucked close to your body.", "Press the bar back up."}', 
 '{"Don''t grip too narrow, as it puts stress on the wrists.", "Keep elbows tucked in."}', 
 '{"Flaring elbows out.", "Bouncing the bar on the chest."}', 
 'Triceps Brachii', '{"Pectoralis Major", "Anterior Deltoid"}', 'triceps', '{"barbell", "bench"}', 'intermediate', 'strength', 'horizontal_push', true, false),


-- LEGS (10)
('Barbell Squat', 'barbell-squat', 'The king of lower body exercises, building massive strength and size in the quads, glutes, and core.', 
 '{"Position a barbell on your upper back.", "Stand with feet shoulder-width apart, toes pointed slightly out.", "Push your hips back and bend your knees to lower into a squat.", "Keep your chest up and back straight.", "Drive through your heels to stand back up."}', 
 '{"Brace your core like you are about to be punched.", "Ensure your knees track over your toes.", "Squat to at least parallel (hips in line with knees)."}', 
 '{"Knees caving inwards (valgus collapse).", "Rounding the lower back (butt wink).", "Lifting the heels off the floor."}', 
 'Quadriceps', '{"Glutes", "Hamstrings", "Core", "Erector Spinae"}', 'legs', '{"barbell"}', 'advanced', 'strength', 'squat', true, false),

('Front Squat', 'front-squat', 'A squat variation that shifts the load to the front of the body, heavily targeting the quads and requiring an upright torso.', 
 '{"Rest the barbell across your front deltoids and clavicles.", "Support the bar with a clean grip or crossed arms.", "Perform a squat, keeping your torso very upright.", "Drive back up."}', 
 '{"Keep your elbows up high throughout the movement.", "Focus on keeping the chest tall."}', 
 '{"Letting the elbows drop.", "Rounding the upper back forward."}', 
 'Quadriceps', '{"Glutes", "Core", "Upper Back"}', 'legs', '{"barbell"}', 'advanced', 'strength', 'squat', true, false),

('Leg Press', 'leg-press', 'A machine-based compound movement for the lower body, reducing stress on the lower back.', 
 '{"Sit in the leg press machine and place feet on the sled.", "Lower the sled until your knees are bent at 90 degrees.", "Press the sled back up."}', 
 '{"Don''t lock out your knees at the top.", "Keep your lower back pressed flat against the pad."}', 
 '{"Locking knees forcefully.", "Letting the lower back round off the pad at the bottom.", "Half reps."}', 
 'Quadriceps', '{"Glutes", "Hamstrings", "Calves"}', 'legs', '{"machine"}', 'beginner', 'hypertrophy', 'squat', true, false),

('Lunges', 'lunges', 'A unilateral leg exercise that builds strength, balance, and coordination.', 
 '{"Stand tall with dumbbells in hand.", "Step forward with one leg and lower your hips.", "Both knees should bend to 90 degrees.", "Push off the front foot to return to the start."}', 
 '{"Keep your chest up and core tight.", "Don''t let the front knee go far past the toes."}', 
 '{"Leaning too far forward.", "Stance too narrow (causing balance issues)."}', 
 'Quadriceps', '{"Glutes", "Hamstrings"}', 'legs', '{"dumbbell", "bodyweight"}', 'intermediate', 'hypertrophy', 'lunge', true, true),

('Bulgarian Split Squat', 'bulgarian-split-squat', 'A grueling unilateral exercise that deeply targets the quads and glutes while requiring balance.', 
 '{"Stand a few feet in front of a bench.", "Rest one foot on the bench behind you.", "Lower your hips until your front thigh is parallel to the floor.", "Push back up."}', 
 '{"Keep your torso relatively upright for quad focus, or lean slightly forward for glute focus.", "Drive through the front heel."}', 
 '{"Front knee collapsing inward.", "Using the back leg too much to push up."}', 
 'Quadriceps', '{"Glutes", "Hamstrings"}', 'legs', '{"dumbbell", "bench"}', 'advanced', 'hypertrophy', 'lunge', true, true),

('Romanian Deadlift', 'romanian-deadlift', 'A hinge movement that heavily targets the hamstrings and glutes without starting from the floor.', 
 '{"Hold a barbell at hip level.", "Keeping legs mostly straight (slight bend in knees), hinge at the hips.", "Push your hips back as far as possible, lowering the bar along your legs.", "Squeeze glutes to return to the top."}', 
 '{"Keep the bar touching or very close to your legs.", "Stop when you feel a deep stretch in the hamstrings."}', 
 '{"Rounding the lower back.", "Bending the knees too much (turning it into a squat)."}', 
 'Hamstrings', '{"Glutes", "Erector Spinae"}', 'legs', '{"barbell"}', 'intermediate', 'hypertrophy', 'hinge', true, false),

('Leg Curl', 'leg-curl', 'An isolation exercise for the hamstrings, usually performed on a machine.', 
 '{"Adjust the machine so the pad sits just above your heels.", "Lie face down (or sit) and curl your legs up towards your glutes.", "Lower slowly."}', 
 '{"Control the eccentric portion (lowering).", "Squeeze hard at the top."}', 
 '{"Using momentum.", "Lifting the hips off the pad."}', 
 'Hamstrings', '{}', 'legs', '{"machine"}', 'beginner', 'hypertrophy', 'isolation', false, false),

('Leg Extension', 'leg-extension', 'An isolation exercise for the quadriceps.', 
 '{"Sit on the machine with the pad against your lower shins.", "Extend your legs fully to lift the weight.", "Slowly lower back to the start."}', 
 '{"Pause briefly at full extension to squeeze the quads.", "Control the weight on the way down."}', 
 '{"Kicking the weight up violently.", "Not completing a full range of motion."}', 
 'Quadriceps', '{}', 'legs', '{"machine"}', 'beginner', 'hypertrophy', 'isolation', false, false),

('Hip Thrust', 'hip-thrust', 'The premier isolation exercise for building glute strength and size.', 
 '{"Place your upper back against a bench.", "Roll a padded barbell over your hips.", "Plant feet flat on the floor, shoulder-width apart.", "Drive hips upward until your torso is parallel to the floor.", "Squeeze glutes at the top."}', 
 '{"Keep your chin tucked and look forward.", "Drive through your heels."}', 
 '{"Overextending the lower back at the top.", "Using the lower back instead of the glutes."}', 
 'Glutes', '{"Hamstrings", "Core"}', 'legs', '{"barbell", "bench"}', 'intermediate', 'hypertrophy', 'hinge', true, false),

('Calf Raise', 'calf-raise', 'Isolates the calf muscles (gastrocnemius and soleus).', 
 '{"Stand on the edge of a step or platform.", "Let your heels drop below the edge to stretch.", "Push up onto your toes as high as possible.", "Lower slowly."}', 
 '{"Pause at the bottom for a deep stretch, and at the top for a hard contraction.", "Perform these slowly to avoid bouncing."}', 
 '{"Bouncing at the bottom.", "Not getting a full stretch or full contraction."}', 
 'Calves', '{}', 'legs', '{"machine", "bodyweight"}', 'beginner', 'hypertrophy', 'isolation', false, false),


-- CORE (8)
('Plank', 'plank', 'A static core exercise that builds stability and endurance.', 
 '{"Get into a push-up position, but rest on your forearms.", "Keep your body in a straight line from head to heels.", "Hold this position, bracing your core tightly."}', 
 '{"Squeeze your glutes and quads.", "Don''t forget to breathe."}', 
 '{"Sagging the hips.", "Piking the hips up into the air."}', 
 'Core', '{"Shoulders", "Glutes"}', 'core', '{"bodyweight"}', 'beginner', 'strength', 'isometric', true, false),

('Side Plank', 'side-plank', 'Targets the obliques and improves lateral core stability.', 
 '{"Lie on your side, propped up on one forearm.", "Stack your feet.", "Lift your hips to form a straight line.", "Hold."}', 
 '{"Keep your elbow directly under your shoulder.", "Don''t let your hips sag."}', 
 '{"Rolling forward or backward.", "Letting the hip drop."}', 
 'Obliques', '{"Core", "Shoulders"}', 'core', '{"bodyweight"}', 'beginner', 'strength', 'isometric', true, true),

('Crunch', 'crunch', 'A basic isolation movement for the rectus abdominis.', 
 '{"Lie on your back with knees bent and feet flat.", "Place hands lightly behind your head.", "Contract your abs to lift your shoulder blades off the floor.", "Lower slowly."}', 
 '{"Focus on contracting the abs, not pulling with the neck.", "Keep your lower back pressed into the floor."}', 
 '{"Pulling on the neck.", "Using momentum."}', 
 'Core', '{}', 'core', '{"bodyweight"}', 'beginner', 'hypertrophy', 'isolation', false, false),

('Bicycle Crunch', 'bicycle-crunch', 'A dynamic core exercise that hits the abs and obliques.', 
 '{"Lie on your back, lift your legs to 90 degrees.", "Bring right elbow to left knee while extending the right leg.", "Switch sides in a pedaling motion."}', 
 '{"Rotate from the core, not just the shoulders.", "Keep the movements slow and controlled."}', 
 '{"Rushing the movement.", "Pulling on the head."}', 
 'Core', '{"Obliques"}', 'core', '{"bodyweight"}', 'beginner', 'hypertrophy', 'isolation', false, true),

('Hanging Leg Raise', 'hanging-leg-raise', 'An advanced core exercise that heavily targets the lower abs and hip flexors.', 
 '{"Hang from a pull-up bar.", "Keeping legs straight, raise them until they are parallel to the floor.", "Lower under control."}', 
 '{"Control the sway of your body.", "Use your abs to lift, not momentum."}', 
 '{"Swinging wildly.", "Bending the knees too much (unless modifying)."}', 
 'Core', '{"Hip Flexors"}', 'core', '{"pull_up_bar"}', 'advanced', 'hypertrophy', 'isolation', false, false),

('Leg Raise', 'leg-raise', 'A floor-based core exercise focusing on the lower abdominals.', 
 '{"Lie on your back with legs straight.", "Keep lower back pressed into the floor.", "Raise your legs until they point at the ceiling.", "Lower them slowly, stopping just before they touch the floor."}', 
 '{"Place hands under your glutes for lower back support if needed.", "Don''t let your lower back arch."}', 
 '{"Arching the lower back.", "Dropping the legs quickly."}', 
 'Core', '{"Hip Flexors"}', 'core', '{"bodyweight"}', 'beginner', 'hypertrophy', 'isolation', false, false),

('Russian Twist', 'russian-twist', 'A rotational movement targeting the obliques.', 
 '{"Sit on the floor, lean back slightly, and lift your feet off the ground.", "Hold a weight or medicine ball.", "Twist your torso to touch the weight to one side, then the other."}', 
 '{"Follow the weight with your eyes.", "Keep your core engaged."}', 
 '{"Just moving the arms without rotating the torso.", "Rounding the back."}', 
 'Obliques', '{"Core"}', 'core', '{"dumbbell", "kettlebell"}', 'intermediate', 'hypertrophy', 'rotation', false, false),

('Mountain Climbers', 'mountain-climbers', 'A dynamic core exercise that elevates the heart rate.', 
 '{"Start in a high plank position.", "Drive one knee towards your chest.", "Quickly switch legs, as if running in place."}', 
 '{"Keep your hips low.", "Maintain a strong plank position."}', 
 '{"Piking the hips in the air.", "Bouncing."}', 
 'Core', '{"Shoulders", "Hip Flexors"}', 'core', '{"bodyweight"}', 'beginner', 'cardio', 'dynamic', false, true),


-- FULL BODY / FUNCTIONAL (4)
('Burpee', 'burpee', 'A full-body conditioning exercise that builds endurance and power.', 
 '{"Start standing.", "Drop into a squat position and place hands on the floor.", "Kick feet back into a plank.", "Perform a push-up.", "Jump feet back to the squat.", "Jump up explosively."}', 
 '{"Pace yourself.", "Maintain form even when tired."}', 
 '{"Sagging the hips in the plank.", "Skipping the push-up."}', 
 'Full Body', '{"Chest", "Quads", "Core", "Cardio"}', 'full_body', '{"bodyweight"}', 'intermediate', 'cardio', 'dynamic', true, false),

('Kettlebell Swing', 'kettlebell-swing', 'A powerful hip hinge movement that builds posterior chain power.', 
 '{"Stand with feet slightly wider than shoulder-width, holding a kettlebell.", "Hinge at the hips, letting the kettlebell swing between your legs.", "Explosively drive your hips forward to swing the bell up to chest height.", "Let it swing back down."}', 
 '{"This is a hip hinge, not a squat. Use your glutes and hamstrings to drive the weight.", "Don''t pull with your arms."}', 
 '{"Squatting the movement.", "Using the shoulders to lift the bell.", "Rounding the lower back."}', 
 'Glutes', '{"Hamstrings", "Core", "Erector Spinae"}', 'full_body', '{"kettlebell"}', 'intermediate', 'functional', 'hinge', true, false),

('Farmer''s Walk', 'farmers-walk', 'A simple but brutal exercise for grip strength, core stability, and overall conditioning.', 
 '{"Pick up a heavy dumbbell or kettlebell in each hand.", "Stand tall with shoulders back and core braced.", "Walk forward with short, quick steps for a set distance or time."}', 
 '{"Keep your chest up and look straight ahead.", "Don''t let the weights rest against your legs."}', 
 '{"Slouching or rounding the shoulders.", "Taking strides that are too long."}', 
 'Full Body', '{"Forearms", "Core", "Trapezius"}', 'full_body', '{"dumbbell", "kettlebell"}', 'intermediate', 'functional', 'carry', true, false),

('Turkish Get-Up', 'turkish-get-up', 'A complex, multi-step movement that builds total body stability and mobility.', 
 '{"Lie on your back holding a kettlebell in one hand straight up.", "Bend the knee on the same side.", "Roll onto your opposite elbow, then hand.", "Bridge your hips up.", "Sweep the straight leg underneath you into a lunge.", "Stand up.", "Reverse the steps to return to the floor."}', 
 '{"Keep your eyes on the kettlebell at all times.", "Take your time; this is not a speed drill."}', 
 '{"Rushing the movement.", "Taking eyes off the weight.", "Poor shoulder stability."}', 
 'Full Body', '{"Core", "Shoulders", "Mobility"}', 'full_body', '{"kettlebell", "dumbbell"}', 'advanced', 'functional', 'complex', true, true);
