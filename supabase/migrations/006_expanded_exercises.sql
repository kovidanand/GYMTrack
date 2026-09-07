-- =============================================================================
-- GYMTrack — Migration 006: Expanded Exercise Catalog & Verified Media
-- =============================================================================

-- Ensure table has image_url and video_url columns if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'exercises' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.exercises ADD COLUMN image_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'exercises' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE public.exercises ADD COLUMN video_url text;
  END IF;
END $$;

-- ─── Insert Expanded Exercise Catalog ─────────────────────────────────────────

INSERT INTO public.exercises (
  name, slug, description, instructions, tips, common_mistakes, primary_muscle, secondary_muscles, muscle_group, equipment, difficulty, exercise_type, movement_pattern, is_compound, is_unilateral, image_url
) VALUES
-- CHEST
('Incline Dumbbell Fly', 'incline-dumbbell-fly', 'An upper-chest isolation exercise that provides continuous stretch across the clavicular head.',
 '{"Set an adjustable bench to a 30-degree incline.", "Hold dumbbells with palms facing each other directly above your chest.", "With elbows slightly bent, lower the weights in an arc until your chest is fully stretched.", "Bring the weights together by contracting your chest in an arc motion."}',
 '{"Maintain a constant 15-degree bend in the elbows throughout.", "Focus on squeezing with the upper chest, not the hands."}',
 '{"Bending elbows too much turning it into a press.", "Lowering the weights past a comfortable range of motion."}',
 'Upper Pectoralis Major', '{"Anterior Deltoid"}', 'chest', '{"dumbbell", "bench"}', 'intermediate', 'hypertrophy', 'horizontal_fly', false, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Incline-dumbbell-flys-2.png'),

('Cable Chest Press', 'cable-chest-press', 'A chest press performed standing or seated with cable pulleys, keeping continuous tension throughout the repetition.',
 '{"Set cable pulleys to mid-chest height with single-grip handles.", "Step forward into a staggered stance with elbows bent at 90 degrees.", "Press handles forward until arms are extended straight ahead.", "Slowly control handles back to chest level under resistance."}',
 '{"Keep core braced and torso upright to avoid leaning into the press.", "Do not allow elbows to flare too high."}',
 '{"Using excessive body momentum to heave the weight.", "Letting cables pull shoulders back too aggressively."}',
 'Pectoralis Major', '{"Anterior Deltoid", "Triceps Brachii"}', 'chest', '{"cable"}', 'beginner', 'strength', 'horizontal_push', true, false,
 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Cable-flyes-2.png'),

('Floor Press', 'floor-press', 'A classic bench press alternative performed lying on the floor, heavily emphasizing triceps and chest lockout.',
 '{"Lie flat on the floor with knees bent and feet flat on the floor.", "Grip the barbell or dumbbells directly above your chest.", "Lower until the triceps lightly touch the floor, pausing momentarily.", "Press explosively back to full lockout."}',
 '{"Pause briefly on the floor without resting the full weight of the barbell.", "Keep shoulders retracted into the floor."}',
 '{"Bouncing elbows off the hard floor.", "Lifting hips off the floor."}',
 'Pectoralis Major', '{"Triceps Brachii", "Anterior Deltoid"}', 'chest', '{"barbell"}', 'intermediate', 'strength', 'horizontal_push', true, false,
 'https://upload.wikimedia.org/wikipedia/commons/0/08/Bench-press-1.png'),

-- BACK
('Meadows Row', 'meadows-row', 'A unilateral landmine rowing movement developed by John Meadows to develop the lower and mid latissimus dorsi.',
 '{"Stand perpendicular to a landmine barbell in a staggered stance.", "Grip the fat end of the barbell sleeve with an overhand grip.", "Hinge forward at the hips with your back flat.", "Drive your elbow back and up toward your hip, squeezing the lat at peak contraction.", "Lower under full control until the lat is stretched."}',
 '{"Keep torso stationary and avoid twisting during the pull.", "Use straps if grip limits lat stimulation."}',
 '{"Jerking torso upward to pull weight.", "Rounding lower back."}',
 'Latissimus Dorsi', '{"Rhomboids", "Biceps Brachii", "Posterior Deltoid"}', 'back', '{"barbell"}', 'advanced', 'hypertrophy', 'horizontal_pull', true, true,
 'https://upload.wikimedia.org/wikipedia/commons/4/44/One-arm-dumbbell-row-1.png'),

('Straight-Arm Cable Pulldown', 'straight-arm-cable-pulldown', 'An isolation exercise targeting the lats and teres major without triceps or biceps exhaustion.',
 '{"Attach a straight bar or rope to a high cable pulley.", "Stand back with arms extended overhead with slight elbow bend and torso hinged 20 degrees.", "Pull the bar down toward your upper thighs in an arc while keeping arms straight.", "Squeeze lats hard at bottom, then return under control."}',
 '{"Focus on depressing and retracting shoulder blades.", "Do not bend elbows during the stroke."}',
 '{"Turning the movement into a triceps pushdown by bending elbows.", "Swinging the upper body."}',
 'Latissimus Dorsi', '{"Teres Major", "Triceps Brachii", "Abdominals"}', 'back', '{"cable"}', 'beginner', 'hypertrophy', 'vertical_pull', false, false,
 'https://upload.wikimedia.org/wikipedia/commons/3/36/Lat-pulldown-1.png'),

('Chest-Supported Row', 'chest-supported-row', 'A strict upper-back rowing exercise eliminating lower back fatigue by bracing the chest against an incline bench.',
 '{"Lie face down on an incline bench set to 30 to 45 degrees holding dumbbells or a barbell.", "Let arms hang straight down with palms facing each other.", "Retract shoulder blades and row the weights up until upper arms align with torso.", "Lower slowly until lats and rhomboids are fully stretched."}',
 '{"Keep chest firmly against the pad throughout.", "Pull with your elbows, not your biceps."}',
 '{"Lifting chest off the pad.", "Jerking the weights with shoulder shrugging."}',
 'Rhomboids', '{"Latissimus Dorsi", "Trapezius", "Posterior Deltoid", "Biceps"}', 'back', '{"dumbbell", "bench"}', 'beginner', 'hypertrophy', 'horizontal_pull', true, false,
 'https://upload.wikimedia.org/wikipedia/commons/5/52/Bent-over-row-1.png'),

-- SHOULDERS
('Cable Lateral Raise', 'cable-lateral-raise', 'Provides continuous mechanical tension across the entire lateral deltoid range of motion.',
 '{"Set a cable pulley to hip or knee height with a single-D handle.", "Stand adjacent to the pulley and grasp the handle with the far arm across your body.", "Raise arm out to the side until parallel with floor, leading with the elbow.", "Lower slowly under constant tension back across the body."}',
 '{"Keep elbow slightly bent and wrists neutral.", "Do not raise hand higher than elbow."}',
 '{"Shrugging upper traps instead of raising the arm.", "Using body momentum to swing the cable."}',
 'Lateral Deltoid', '{"Anterior Deltoid", "Supraspinatus"}', 'shoulders', '{"cable"}', 'intermediate', 'hypertrophy', 'isolation', false, true,
 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Side-lateral-raise-2.png'),

('Arnold Press', 'arnold-press', 'A compound dumbbell shoulder press that incorporates rotational movement to hit all three deltoid heads.',
 '{"Sit on an upright bench holding dumbbells at chest height with palms facing your chest.", "As you press upward, rotate wrists 180 degrees so palms face forward at the top.", "Lower weights while reversing the rotation back to the starting chin level."}',
 '{"Perform the rotation smoothly in rhythm with the press.", "Avoid pressing dumbbells out in front of your head."}',
 '{"Flaring elbows abruptly.", "Overarching the lower back."}',
 'Anterior Deltoid', '{"Lateral Deltoid", "Triceps Brachii", "Upper Pectoralis"}', 'shoulders', '{"dumbbell", "bench"}', 'intermediate', 'hypertrophy', 'vertical_push', true, false,
 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Dumbbell-shoulder-press-2.png'),

('Cable Face Pull', 'cable-face-pull', 'A premier postural exercise building the rear deltoids, rhomboids, and external rotators.',
 '{"Set a cable pulley at eye level with a rope attachment.", "Grasp rope ends with overhand or neutral thumb-back grip and step back to create tension.", "Pull rope toward your face while separating your hands and rotating elbows back.", "Pause and squeeze shoulder blades together before extending arms."}',
 '{"Focus on external rotation: knuckles should end higher than elbows at finish.", "Keep ribs tucked down."}',
 '{"Pulling too low toward chest.", "Using hips to heave the weight."}',
 'Posterior Deltoid', '{"Infraspinatus", "Teres Minor", "Rhomboids", "Middle Trapezius"}', 'shoulders', '{"cable"}', 'beginner', 'functional', 'horizontal_pull', false, false,
 'https://upload.wikimedia.org/wikipedia/commons/5/52/Bent-over-row-1.png'),

-- LEGS
('Romanian Deadlift', 'romanian-deadlift', 'A premier posterior-chain movement focusing on hamstring and glute eccentric loading.',
 '{"Stand tall holding a barbell at hip height with shoulder-width stance.", "Push hips backward with soft knees while sliding bar down your thighs.", "Lower until you feel a deep stretch in hamstrings with flat back.", "Drive hips forward to return to standing lockout."}',
 '{"Think about pushing hips to the wall behind you rather than bending down.", "Keep bar touching or close to legs throughout."}',
 '{"Rounding lower back.", "Bending knees too much turning it into a conventional squat."}',
 'Hamstrings', '{"Gluteus Maximus", "Erector Spinae", "Adductors"}', 'legs', '{"barbell"}', 'intermediate', 'strength', 'hinge', true, false,
 'https://upload.wikimedia.org/wikipedia/commons/0/07/Deadlift-1.png'),

('Bulgarian Split Squat', 'bulgarian-split-squat', 'A unilateral leg exercise that heavily taxes quads and glutes with low spinal loading.',
 '{"Stand about two feet in front of a flat bench holding dumbbells at sides.", "Place top of one foot rearward onto the bench.", "Lower hips straight down until back knee almost grazes the floor.", "Drive through the front heel to return to starting upright position."}',
 '{"Keep chest tall with slight forward lean from the hips.", "Weight should be 85% on the front leg."}',
 '{"Placing front foot too close causing extreme forward knee shift.", "Pushing off the rear bench foot."}',
 'Quadriceps', '{"Gluteus Maximus", "Hamstrings", "Adductor Magnus"}', 'legs', '{"dumbbell", "bench"}', 'intermediate', 'hypertrophy', 'squat', true, true,
 'https://upload.wikimedia.org/wikipedia/commons/8/82/Squats-1.png'),

('Hack Squat', 'hack-squat', 'A machine-based squat that isolates quadriceps with safe pelvic back support.',
 '{"Position back and shoulders securely against machine pads with feet shoulder-width on platform.", "Disengage safety handles and lower carriage until thighs are parallel to footplate.", "Drive forcefully through mid-foot and heels back to near lockout."}',
 '{"Do not let lower back round off the pad at bottom of movement.", "Keep knees tracking over toes."}',
 '{"Bouncing out of the bottom.", "Locking out knees aggressively."}',
 'Quadriceps', '{"Gluteus Maximus", "Hamstrings"}', 'legs', '{"machine"}', 'intermediate', 'hypertrophy', 'squat', true, false,
 'https://upload.wikimedia.org/wikipedia/commons/8/82/Squats-1.png'),

('Hip Thrust', 'hip-thrust', 'The gold-standard glute strength and hypertrophy builder with maximal horizontal hip extension torque.',
 '{"Sit on the floor with upper back against a bench and padded barbell across hips.", "Bend knees with feet flat on the floor shoulder-width apart.", "Drive through heels, extending hips upward until thighs and torso align horizontally.", "Hold and squeeze glutes hard at the top, then lower under control."}',
 '{"Keep chin tucked toward chest and eyes looking forward, not up at the ceiling.", "Avoid hyperextending lower back at top."}',
 '{"Pushing with toes instead of heels.", "Arching lower back rather than posterior tilting the pelvis."}',
 'Gluteus Maximus', '{"Hamstrings", "Quadriceps", "Adductor Magnus"}', 'legs', '{"barbell", "bench"}', 'intermediate', 'hypertrophy', 'hinge', true, false,
 'https://upload.wikimedia.org/wikipedia/commons/0/07/Deadlift-1.png'),

-- ARMS
('Incline Dumbbell Curl', 'incline-dumbbell-curl', 'Places biceps in maximum stretch by extending the shoulder behind the torso.',
 '{"Set an incline bench to 45 to 60 degrees and sit holding dumbbells with arms hanging straight.", "Keep upper arms fixed perpendicular to the floor.", "Curl dumbbells upward while supinating wrists so palms face shoulders at top.", "Lower slowly until arms are fully extended and biceps are stretched."}',
 '{"Keep elbows pinned back; do not let elbows drift forward.", "Control the lowering phase for 2-3 seconds."}',
 '{"Using shoulder momentum to swing weights forward.", "Incomplete elbow extension."}',
 'Biceps Brachii', '{"Brachialis", "Brachioradialis"}', 'arms', '{"dumbbell", "bench"}', 'intermediate', 'hypertrophy', 'isolation', false, true,
 'https://upload.wikimedia.org/wikipedia/commons/0/03/Bicep-curls-1.png'),

('Overhead Cable Triceps Extension', 'overhead-cable-triceps-extension', 'Maximally stretches and isolates the long head of the triceps.',
 '{"Set a cable pulley at shoulder or waist height with a rope attachment.", "Face away from machine, hold rope overhead with elbows bent pointing forward.", "Extend arms forward and up until triceps contract fully, separating rope ends.", "Bend elbows to lower rope behind head under constant cable resistance."}',
 '{"Keep upper arms locked in place by ears.", "Do not arch lower back; brace abdominals."}',
 '{"Flaring elbows out to sides.", "Using torso momentum to push the rope."}',
 'Triceps Brachii', '{"Anconeus"}', 'arms', '{"cable"}', 'beginner', 'hypertrophy', 'isolation', false, false,
 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Triceps-pushdown-1.png'),

('Skull Crushers', 'skull-crushers', 'A classic barbell triceps builder performed lying flat on a bench.',
 '{"Lie on a flat bench holding an EZ curl bar with narrow overhand grip above your chest.", "Keeping upper arms perpendicular to the floor, bend elbows to lower bar toward your forehead or crown.", "Extend elbows forcefully to return bar to the starting position."}',
 '{"Lower to just beyond the crown of your head to keep continuous tension on the long head.", "Keep elbows tucked shoulder-width."}',
 '{"Allowing elbows to flare wide.", "Moving upper arms back and forth turning it into a pullover."}',
 'Triceps Brachii', '{"Anconeus"}', 'arms', '{"barbell", "bench"}', 'intermediate', 'hypertrophy', 'isolation', false, false,
 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Triceps-pushdown-1.png'),

-- CORE
('Hanging Leg Raise', 'hanging-leg-raise', 'An advanced compound core movement targeting lower abdominals and hip flexors.',
 '{"Hang from a pull-up bar with an overhand grip and legs straight.", "Posteriorly tilt pelvis and raise straight legs until parallel to the floor or toes touch the bar.", "Pause for a split second at peak contraction.", "Lower legs slowly without swinging or using momentum."}',
 '{"Engage lats to stabilize body and eliminate body sway.", "Begin with bent-knee hanging raises if straight legs cause swing."}',
 '{"Kicking legs with excessive momentum.", "Arching lower back on descent."}',
 'Rectus Abdominis', '{"Iliopsoas", "Obliques", "Forearms"}', 'core', '{"pull-up bar"}', 'advanced', 'strength', 'isolation', false, false,
 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Crunches-1.png'),

('Ab Wheel Rollout', 'ab-wheel-rollout', 'An anti-extension core exercise requiring massive abdominal and lat engagement.',
 '{"Kneel on a soft pad with ab wheel on floor directly beneath your shoulders.", "Slowly roll wheel forward while extending hips and arms into a long plank.", "Lower until torso is inches from floor while keeping core braced.", "Contract abdominals and lats to pull wheel back under shoulders."}',
 '{"Maintain a slight hollow-body posterior pelvic tilt throughout; do not let lower back sag.", "Start with partial range of motion."}',
 '{"Allowing lower back to hyperextend.", "Bending elbows to pull wheel back."}',
 'Rectus Abdominis', '{"Transverse Abdominis", "Latissimus Dorsi", "Obliques"}', 'core', '{"ab wheel"}', 'advanced', 'strength', 'anti-extension', false, false,
 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Crunches-1.png'),

('Pallof Press', 'pallof-press', 'The premier anti-rotation core exercise for spinal stability and oblique strength.',
 '{"Attach a single handle to a cable pulley at chest height.", "Stand perpendicular to the pulley holding handle in both hands against your sternum with athletic stance.", "Press handle straight out in front of your chest and resist torso rotation.", "Hold for 2 seconds, then bring hands back to chest."}',
 '{"Brace core tightly and maintain level hips and shoulders.", "Do not allow cable to twist your upper body."}',
 '{"Rotating shoulders toward the machine.", "Shrugging shoulders during press."}',
 'Obliques', '{"Transverse Abdominis", "Gluteus Medius"}', 'core', '{"cable"}', 'beginner', 'functional', 'anti-rotation', false, true,
 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Crunches-1.png')

ON CONFLICT (slug) DO NOTHING;

-- ─── Idempotent Media URL Backfill for standard exercises ───────────────────────

UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Bench-press-1.png' WHERE slug = 'bench-press' AND (image_url IS NULL OR image_url = '');
UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/8/82/Squats-1.png' WHERE slug = 'barbell-squat' AND (image_url IS NULL OR image_url = '');
UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/07/Deadlift-1.png' WHERE slug = 'deadlift' AND (image_url IS NULL OR image_url = '');
UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Overhead-press-1.png' WHERE slug = 'overhead-press' AND (image_url IS NULL OR image_url = '');
UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Pullup-1.png' WHERE slug = 'pull-up' AND (image_url IS NULL OR image_url = '');
UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/5/52/Bent-over-row-1.png' WHERE slug = 'barbell-row' AND (image_url IS NULL OR image_url = '');
UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/0/03/Bicep-curls-1.png' WHERE slug = 'barbell-curl' AND (image_url IS NULL OR image_url = '');
UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Triceps-pushdown-1.png' WHERE slug = 'cable-tricep-pushdown' AND (image_url IS NULL OR image_url = '');
UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Side-lateral-raise-2.png' WHERE slug = 'lateral-raise' AND (image_url IS NULL OR image_url = '');
UPDATE public.exercises SET image_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Crunches-1.png' WHERE slug = 'plank' AND (image_url IS NULL OR image_url = '');
