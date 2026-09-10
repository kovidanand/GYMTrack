import type { Exercise } from '@/types'

export const DEFAULT_EXERCISES: Exercise[] = [
  // ── CHEST ──
  {
    id: 'ex-bench-press',
    name: 'Bench Press',
    slug: 'bench-press',
    description: 'A classic compound exercise that builds strength and size in the chest, anterior deltoids, and triceps.',
    instructions: [
      'Lie flat on a bench, gripping the bar slightly wider than shoulder-width.',
      'Unrack the bar and hold it straight over your chest with arms locked.',
      'Lower the bar slowly under control to your mid-chest.',
      'Press the bar explosively back up to the starting position.'
    ],
    tips: [
      'Keep your feet flat on the floor for stability.',
      'Squeeze your shoulder blades together throughout the lift.',
      'Maintain a slight natural arch in your lower back.'
    ],
    common_mistakes: [
      'Bouncing the bar off the ribcage.',
      'Flaring elbows out to 90 degrees.',
      'Lifting glutes off the bench.'
    ],
    primary_muscle: 'Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid', 'Triceps Brachii'],
    muscle_group: 'chest',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_push',
    image_url: '/exercises/bench-press.png',
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-incline-bench-press',
    name: 'Incline Bench Press',
    slug: 'incline-bench-press',
    description: 'A variation of the bench press performed on a 30-45 degree incline bench, emphasizing the clavicular head of the chest.',
    instructions: [
      'Set an incline bench to 30–45 degrees.',
      'Grip the bar slightly wider than shoulder-width.',
      'Lower the bar smoothly to your upper chest.',
      'Press back up in a straight line to lockout.'
    ],
    tips: [
      'Avoid setting the incline too high (above 45 degrees) to prevent shoulder takeover.',
      'Control the descent and pause briefly above the chest.'
    ],
    common_mistakes: [
      'Arching excessively to flatten the chest angle.',
      'Bouncing the bar.'
    ],
    primary_muscle: 'Upper Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid', 'Triceps'],
    muscle_group: 'chest',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_push',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-dumbbell-bench-press',
    name: 'Dumbbell Bench Press',
    slug: 'dumbbell-bench-press',
    description: 'A chest press using dumbbells, allowing for a deeper stretch and independent arm control.',
    instructions: [
      'Sit on a bench with dumbbells on your thighs.',
      'Kick the weights up as you lie back on the bench.',
      'Press the dumbbells up until arms are fully extended.',
      'Lower them with control until you feel a comfortable pectoral stretch.'
    ],
    tips: [
      'Keep wrists stacked directly over elbows.',
      'Tuck elbows at ~45 degrees to the torso.'
    ],
    common_mistakes: [
      'Dropping weights abruptly.',
      'Clanking the weights together at the top.'
    ],
    primary_muscle: 'Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid', 'Triceps'],
    muscle_group: 'chest',
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_push',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-push-up',
    name: 'Push-Up',
    slug: 'push-up',
    description: 'A fundamental bodyweight movement strengthening the chest, anterior delts, and core.',
    instructions: [
      'Start in a high plank position with hands slightly wider than shoulder-width.',
      'Lower your chest until it is an inch from the floor.',
      'Push forcefully back up to full arm extension.'
    ],
    tips: [
      'Lock your core and squeeze glutes to keep the spine neutral.',
      'Keep elbows tucked at ~45 degrees.'
    ],
    common_mistakes: [
      'Sagging hips or piking glutes up.',
      'Flaring elbows out sideways.'
    ],
    primary_muscle: 'Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid', 'Triceps', 'Core'],
    muscle_group: 'chest',
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_push',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-cable-crossover',
    name: 'Cable Crossover',
    slug: 'cable-crossover',
    description: 'An isolation exercise that provides constant tension throughout horizontal pectoral adduction.',
    instructions: [
      'Set pulleys at shoulder or high height.',
      'Step forward into a split stance with a slight forward torso lean.',
      'Bring handles together in a hugging motion.',
      'Slowly reverse the arc back to the starting stretch.'
    ],
    tips: [
      'Keep a slight bend in the elbows.',
      'Squeeze chest hard at peak contraction.'
    ],
    common_mistakes: [
      'Pressing with triceps instead of flying.',
      'Swinging the torso for momentum.'
    ],
    primary_muscle: 'Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid'],
    muscle_group: 'chest',
    equipment: ['cable'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_fly',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },

  // ── BACK ──
  {
    id: 'ex-pull-up',
    name: 'Pull-Up',
    slug: 'pull-up',
    description: 'A premier bodyweight compound exercise that builds back width, lats, rhomboids, and biceps.',
    instructions: [
      'Grip the pull-up bar with an overhand grip slightly wider than shoulder-width.',
      'Hang freely with arms fully extended.',
      'Drive elbows down toward your ribs until chin clears the bar.',
      'Lower yourself with full control back to a dead hang.'
    ],
    tips: [
      'Engage core and point toes slightly forward.',
      'Focus on elbow drive rather than hand pulling.'
    ],
    common_mistakes: [
      'Kipping or swinging legs.',
      'Cutting the bottom range of motion short.'
    ],
    primary_muscle: 'Latissimus Dorsi',
    secondary_muscles: ['Biceps Brachii', 'Rhomboids', 'Core'],
    muscle_group: 'back',
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'vertical_pull',
    image_url: '/exercises/pull-up.png',
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown',
    slug: 'lat-pulldown',
    description: 'A machine-based vertical pulling movement targeting the latissimus dorsi and upper back.',
    instructions: [
      'Sit comfortably with thighs secured under the roller pads.',
      'Grip the wide bar slightly wider than shoulder-width.',
      'Pull bar down smoothly to upper chest while arching upper back slightly.',
      'Return bar slowly to full stretch overhead.'
    ],
    tips: [
      'Think of pulling through your pinky fingers and elbows.',
      'Keep chest elevated toward the cable.'
    ],
    common_mistakes: [
      'Pulling the bar behind the neck.',
      'Leaning back excessively to heave the weight.'
    ],
    primary_muscle: 'Latissimus Dorsi',
    secondary_muscles: ['Biceps', 'Rhomboids', 'Rear Deltoids'],
    muscle_group: 'back',
    equipment: ['cable', 'machine'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'vertical_pull',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-barbell-row',
    name: 'Barbell Row',
    slug: 'barbell-row',
    description: 'A heavy compound movement that develops overall back thickness, rear delts, and spinal erectors.',
    instructions: [
      'Hinge at hips with knees softly bent until torso is ~45 degrees.',
      'Grip barbell overhand just outside knee width.',
      'Pull the bar toward your lower ribcage / navel.',
      'Lower under control without rounding lower back.'
    ],
    tips: [
      'Keep neck neutral and core rigidly braced.',
      'Squeeze shoulder blades together at the peak.'
    ],
    common_mistakes: [
      'Rounding the lumbar spine.',
      'Using aggressive hip jerks to move the weight.'
    ],
    primary_muscle: 'Latissimus Dorsi',
    secondary_muscles: ['Rhomboids', 'Trapezius', 'Biceps', 'Erector Spinae'],
    muscle_group: 'back',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_pull',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-deadlift',
    name: 'Deadlift',
    slug: 'deadlift',
    description: 'The premier full posterior chain compound lift targeting erectors, glutes, hamstrings, and upper back.',
    instructions: [
      'Stand with feet hip-width apart, barbell over mid-foot (1 inch from shins).',
      'Hinge hips back and grip bar just outside shins.',
      'Pull chest proud, take the slack out of the barbell, and pack lats.',
      'Drive floor away with your legs to stand up tall without hyperextending.'
    ],
    tips: [
      'Keep the bar in contact with legs throughout the pull.',
      'Think of it as leg pressing the floor away.'
    ],
    common_mistakes: [
      'Rounding lower back.',
      'Squatting the bar instead of hinging.'
    ],
    primary_muscle: 'Erector Spinae',
    secondary_muscles: ['Gluteus Maximus', 'Hamstrings', 'Trapezius', 'Core'],
    muscle_group: 'back',
    equipment: ['barbell'],
    difficulty: 'advanced',
    exercise_type: 'strength',
    movement_pattern: 'hinge',
    image_url: '/exercises/deadlift.png',
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },

  // ── SHOULDERS ──
  {
    id: 'ex-overhead-press',
    name: 'Overhead Press',
    slug: 'overhead-press',
    description: 'Standing barbell overhead press for anterior and lateral deltoid strength and core stabilization.',
    instructions: [
      'Rest barbell across anterior deltoids with hands just outside shoulders.',
      'Brace core and squeeze glutes.',
      'Press barbell straight up overhead, moving head slightly back to clear bar path.',
      'Lock out overhead with bar centered above spine.'
    ],
    tips: [
      'Keep forearms vertical under the bar at the bottom.',
      'Avoid hyperextending lumbar spine.'
    ],
    common_mistakes: [
      'Leaning back excessively.',
      'Using leg drive (which makes it a push press).'
    ],
    primary_muscle: 'Anterior Deltoid',
    secondary_muscles: ['Lateral Deltoid', 'Triceps', 'Upper Trapezius'],
    muscle_group: 'shoulders',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'vertical_push',
    image_url: '/exercises/overhead-press.png',
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-lateral-raise',
    name: 'Lateral Raise',
    slug: 'lateral-raise',
    description: 'Isolation exercise targeting the lateral deltoids to create shoulder width and cap.',
    instructions: [
      'Hold dumbbells at sides with a slight forward lean.',
      'Raise arms out to sides until parallel to the floor.',
      'Lead with elbows and lower slowly.'
    ],
    tips: [
      'Keep a slight bend in the elbows.',
      'Use light weights and focus on muscle contraction.'
    ],
    common_mistakes: [
      'Using body momentum to swing weights up.',
      'Shrugging traps excessively.'
    ],
    primary_muscle: 'Lateral Deltoid',
    secondary_muscles: ['Anterior Deltoid', 'Trapezius'],
    muscle_group: 'shoulders',
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'isolation',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-face-pull',
    name: 'Face Pull',
    slug: 'face-pull',
    description: 'Vital movement for rear deltoids, external rotators, and scapular health.',
    instructions: [
      'Set cable with rope attachment at eye height.',
      'Grip rope thumbs-back and step into balance.',
      'Pull rope towards face while separating hands and rotating forearms up.',
      'Squeeze rear delts and slowly return.'
    ],
    tips: [
      'Think of making a double-biceps flex at the end of each rep.',
      'Keep chest tall and elbows high.'
    ],
    common_mistakes: [
      'Loading too heavy and leaning backward.',
      'Pulling to neck rather than face.'
    ],
    primary_muscle: 'Posterior Deltoid',
    secondary_muscles: ['Rhomboids', 'Rotator Cuff', 'Trapezius'],
    muscle_group: 'shoulders',
    equipment: ['cable'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_pull',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },

  // ── LEGS ──
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Squat',
    slug: 'barbell-squat',
    description: 'The king of lower body exercises, building massive quad, glute, and core strength.',
    instructions: [
      'Rest barbell securely across upper traps with hands gripping bar firmly.',
      'Step back, feet shoulder-width, toes angled slightly out.',
      'Break at hips and knees simultaneously and descend to parallel depth.',
      'Drive powerfully up through mid-foot to starting position.'
    ],
    tips: [
      'Keep knees tracking in line with middle toes.',
      'Maintain strong core pressure and upright torso.'
    ],
    common_mistakes: [
      'Knees caving inward (valgus).',
      'Rising hips first (good morning squat).'
    ],
    primary_muscle: 'Quadriceps',
    secondary_muscles: ['Gluteus Maximus', 'Hamstrings', 'Core'],
    muscle_group: 'legs',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'squat',
    image_url: '/exercises/barbell-squat.png',
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-romanian-deadlift',
    name: 'Romanian Deadlift',
    slug: 'romanian-deadlift',
    description: 'Hip hinge movement emphasizing hamstring and glute elongation under tension.',
    instructions: [
      'Hold bar at hip height with knees slightly unlocked.',
      'Push hips backward as if touching a wall behind you.',
      'Lower bar along thighs until you feel a deep hamstring stretch.',
      'Drive hips forward to return to standing.'
    ],
    tips: [
      'Movement comes from hip hinge, not knee bending.',
      'Keep spine rigid throughout.'
    ],
    common_mistakes: [
      'Squatting the weight down.',
      'Allowing lower back to round.'
    ],
    primary_muscle: 'Hamstrings',
    secondary_muscles: ['Gluteus Maximus', 'Erector Spinae'],
    muscle_group: 'legs',
    equipment: ['barbell', 'dumbbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'hinge',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-leg-press',
    name: 'Leg Press',
    slug: 'leg-press',
    description: 'Machine compound press for quad and glute hypertrophy without spinal loading.',
    instructions: [
      'Sit in machine with back firmly supported and feet shoulder-width on sled.',
      'Release safety handles and lower sled under control.',
      'Press sled back up without locking knees at the peak.'
    ],
    tips: [
      'Keep lower back pressed into seat pad throughout the rep.',
      'Do not lock knees aggressively at top.'
    ],
    common_mistakes: [
      'Letting pelvis lift off pad at bottom.',
      'Half reps.'
    ],
    primary_muscle: 'Quadriceps',
    secondary_muscles: ['Glutes', 'Hamstrings'],
    muscle_group: 'legs',
    equipment: ['machine'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'squat',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-leg-extension',
    name: 'Leg Extension',
    slug: 'leg-extension',
    description: 'Single-joint open chain movement isolating the quadriceps.',
    instructions: [
      'Align knee joints with machine pivot point.',
      'Extend legs upward until quads are fully contracted.',
      'Pause at top for 1 second, then lower slowly.'
    ],
    tips: [
      'Control eccentric phase.',
      'Keep butt firmly in seat.'
    ],
    common_mistakes: [
      'Kicking weight up with momentum.'
    ],
    primary_muscle: 'Quadriceps',
    secondary_muscles: [],
    muscle_group: 'legs',
    equipment: ['machine'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'isolation',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },

  // ── ARMS ──
  {
    id: 'ex-barbell-curl',
    name: 'Barbell Curl',
    slug: 'barbell-curl',
    description: 'Foundational bicep builder allowing maximum overload across both bicep heads.',
    instructions: [
      'Stand holding barbell shoulder-width with underhand grip.',
      'Curl bar up toward chest while keeping upper arms pinned.',
      'Squeeze biceps hard at top.',
      'Lower slowly to full arm extension.'
    ],
    tips: [
      'Keep elbows stationary at sides.',
      'Do not swing torso.'
    ],
    common_mistakes: [
      'Using hip swing to lift bar.',
      'Elbows drifting forward.'
    ],
    primary_muscle: 'Biceps Brachii',
    secondary_muscles: ['Brachialis', 'Forearms'],
    muscle_group: 'biceps',
    equipment: ['barbell'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'isolation',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-triceps-pushdown',
    name: 'Triceps Pushdown',
    slug: 'triceps-pushdown',
    description: 'Cable movement isolating the lateral and medial heads of the triceps.',
    instructions: [
      'Stand facing cable with bar or rope at chest height.',
      'Pin elbows to sides.',
      'Push attachment down until arms are locked out.',
      'Slowly allow attachment to rise to 90 degrees elbow bend.'
    ],
    tips: [
      'Lock upper arms in place; only forearms move.',
      'Squeeze triceps for a full count at lockout.'
    ],
    common_mistakes: [
      'Letting elbows flare forward and back.',
      'Leaning over the weight.'
    ],
    primary_muscle: 'Triceps Brachii',
    secondary_muscles: [],
    muscle_group: 'triceps',
    equipment: ['cable'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'isolation',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-dips',
    name: 'Dips',
    slug: 'dips',
    description: 'Powerful bodyweight compound movement building the lower chest and triceps.',
    instructions: [
      'Mount parallel dip bars and support bodyweight with straight arms.',
      'Lower body until elbows reach 90 degrees.',
      'Push back up to full lockout.'
    ],
    tips: [
      'Lean forward slightly for chest emphasis, or remain upright for triceps.',
      'Keep shoulders depressed down away from ears.'
    ],
    common_mistakes: [
      'Descending too deep if shoulder mobility is restricted.',
      'Swinging legs.'
    ],
    primary_muscle: 'Triceps Brachii',
    secondary_muscles: ['Pectoralis Major', 'Anterior Deltoid'],
    muscle_group: 'triceps',
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'vertical_push',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },

  // ── CORE ──
  {
    id: 'ex-plank',
    name: 'Plank',
    slug: 'plank',
    description: 'Isometric core exercise strengthening the rectus abdominis, obliques, and transverse abdominis.',
    instructions: [
      'Rest on forearms and toes with elbows under shoulders.',
      'Maintain straight line from head to heels.',
      'Hold position while breathing rhythmically.'
    ],
    tips: [
      'Brace abdomen like taking a punch.',
      'Squeeze glutes to protect lower spine.'
    ],
    common_mistakes: [
      'Hips sagging down.',
      'Holding breath.'
    ],
    primary_muscle: 'Transverse Abdominis',
    secondary_muscles: ['Rectus Abdominis', 'Glutes'],
    muscle_group: 'core',
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'isolation',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-hanging-leg-raise',
    name: 'Hanging Leg Raise',
    slug: 'hanging-leg-raise',
    description: 'Dynamic lower abdominal and hip flexor movement performed from a pull-up bar.',
    instructions: [
      'Hang from bar with arms extended.',
      'Engage core and raise legs until parallel to floor or higher.',
      'Lower legs under control without swinging.'
    ],
    tips: [
      'Tilt pelvis up at top of rep to engage abs fully.',
      'Avoid swinging momentum.'
    ],
    common_mistakes: [
      'Arching back to generate momentum.'
    ],
    primary_muscle: 'Rectus Abdominis',
    secondary_muscles: ['Hip Flexors', 'Forearms'],
    muscle_group: 'core',
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'isolation',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },

  // ── GLUTES ──
  {
    id: 'ex-barbell-hip-thrust',
    name: 'Barbell Hip Thrust',
    slug: 'barbell-hip-thrust',
    description: 'Gold-standard exercise for maximum gluteus maximus hypertrophy and hip extension power.',
    instructions: [
      'Sit on floor with upper back against flat bench, padded barbell across hips.',
      'Plant feet flat shoulder-width apart.',
      'Drive through heels to extend hips until thighs and torso are in line.',
      'Squeeze glutes hard at top, then lower with control.'
    ],
    tips: [
      'Keep chin tucked toward chest.',
      'Shins should be vertical at top of thrust.'
    ],
    common_mistakes: [
      'Hyperextending lumbar spine at top.',
      'Feet placed too far forward or back.'
    ],
    primary_muscle: 'Gluteus Maximus',
    secondary_muscles: ['Hamstrings', 'Quadriceps'],
    muscle_group: 'glutes',
    equipment: ['barbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'hinge',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  }
]
