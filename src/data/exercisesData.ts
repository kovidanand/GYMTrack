import type { Exercise } from '@/types'

export const DEFAULT_EXERCISES: Exercise[] = [
  // ═════════════════════════════════════════════════════════════════════════════
  // CHEST (10)
  // ═════════════════════════════════════════════════════════════════════════════
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
    description: 'A variation of the bench press performed on an incline bench, emphasizing the clavicular head of the chest.',
    instructions: [
      'Set an incline bench to 30–45 degrees.',
      'Grip the bar slightly wider than shoulder-width.',
      'Lower the bar smoothly to your upper chest.',
      'Press back up in a straight vertical path to lockout.'
    ],
    tips: [
      'Avoid setting the incline too high (above 45 degrees) to prevent shoulder takeover.',
      'Control the descent and pause briefly above the chest.'
    ],
    common_mistakes: [
      'Arching excessively to flatten the chest angle.',
      'Bouncing the bar off the upper sternum.'
    ],
    primary_muscle: 'Upper Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid', 'Triceps Brachii'],
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
    id: 'ex-decline-bench-press',
    name: 'Decline Bench Press',
    slug: 'decline-bench-press',
    description: 'A bench press performed on a decline angle, emphasizing the lower pectoral muscle fibers.',
    instructions: [
      'Secure your legs in the decline bench supports and lie back.',
      'Grip the barbell with an overhand medium grip.',
      'Lower the bar with control to your lower chest.',
      'Press up powerfully to full arm extension.'
    ],
    tips: [
      'Have a spotter assist with the unrack.',
      'Keep shoulder blades packed against the pad.'
    ],
    common_mistakes: [
      'Lifting your head off the bench.',
      'Dropping the weight too fast.'
    ],
    primary_muscle: 'Lower Pectoralis Major',
    secondary_muscles: ['Triceps Brachii', 'Anterior Deltoid'],
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
    name: 'Dumbbell Press',
    slug: 'dumbbell-press',
    description: 'A dumbbell chest press allowing greater range of motion and unilateral muscle balance.',
    instructions: [
      'Sit on a flat bench with dumbbells resting on your thighs.',
      'Kick the dumbbells up as you lie back on the bench.',
      'Press the dumbbells up until arms are fully extended.',
      'Lower with control until you feel a comfortable chest stretch.'
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
    secondary_muscles: ['Anterior Deltoid', 'Triceps Brachii'],
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
    id: 'ex-incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    slug: 'incline-dumbbell-press',
    description: 'Incline press with dumbbells that targets the upper chest while accommodating natural wrist rotation.',
    instructions: [
      'Set bench to 30-45 degrees. Kick dumbbells up to shoulder level.',
      'Press both dumbbells upward along a slight converging arc.',
      'Lower under control to deep pectoral stretch.'
    ],
    tips: [
      'Maintain continuous tension by avoiding resting at lockout.',
      'Drive your heels into the ground for stability.'
    ],
    common_mistakes: [
      'Flaring elbows out to 90 degrees.',
      'Setting the bench too steep.'
    ],
    primary_muscle: 'Upper Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid', 'Triceps Brachii'],
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
    id: 'ex-cable-crossover',
    name: 'Cable Fly',
    slug: 'cable-fly',
    description: 'An isolation exercise providing constant tension throughout horizontal pectoral adduction.',
    instructions: [
      'Set pulleys at chest or shoulder height and step forward in a staggered stance.',
      'With elbows slightly bent, sweep hands forward in a wide hugging arc.',
      'Squeeze the chest hard at peak contraction, then reverse smoothly.'
    ],
    tips: [
      'Lock your elbow angle throughout the entire movement.',
      'Focus on bringing bicep to chest.'
    ],
    common_mistakes: [
      'Pressing with triceps instead of flying.',
      'Using torso momentum to rock back and forth.'
    ],
    primary_muscle: 'Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid'],
    muscle_group: 'chest',
    equipment: ['cable'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_fly',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-dumbbell-fly',
    name: 'Dumbbell Fly',
    slug: 'dumbbell-fly',
    description: 'Free weight isolation exercise creating a deep pectoral stretch across a flat bench.',
    instructions: [
      'Lie flat holding dumbbells extended above your chest with palms facing each other.',
      'Lower weights out to the sides in a wide arc until chest is stretched.',
      'Contract chest to pull weights back to the start.'
    ],
    tips: [
      'Imagine hugging a large barrel.',
      'Do not overstretch past comfortable shoulder mobility.'
    ],
    common_mistakes: [
      'Bending elbows too much and turning it into a press.',
      'Using excessively heavy weights.'
    ],
    primary_muscle: 'Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid'],
    muscle_group: 'chest',
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_fly',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-push-up',
    name: 'Push Up',
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
    secondary_muscles: ['Anterior Deltoid', 'Triceps Brachii', 'Core'],
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
    id: 'ex-chest-press',
    name: 'Chest Press',
    slug: 'chest-press',
    description: 'Guided machine horizontal press allowing high intensity pectoral overload with minimal joint shear.',
    instructions: [
      'Adjust seat height so handles align with mid-chest.',
      'Plant feet flat and press handles forward to lockout.',
      'Lower under control until handles return to chest depth.'
    ],
    tips: [
      'Keep back flat against the pad throughout.',
      'Focus on mind-muscle connection with the chest.'
    ],
    common_mistakes: [
      'Shrugging shoulders forward at full extension.',
      'Bouncing weight off the stack.'
    ],
    primary_muscle: 'Pectoralis Major',
    secondary_muscles: ['Anterior Deltoid', 'Triceps Brachii'],
    muscle_group: 'chest',
    equipment: ['machine'],
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
    id: 'ex-dips-chest',
    name: 'Dips',
    slug: 'dips',
    description: 'Bodyweight compound movement emphasizing the lower pectoral fibers and triceps.',
    instructions: [
      'Mount dip bars and lean torso slightly forward (~15-30 degrees).',
      'Lower until elbows form a 90-degree angle.',
      'Press back up to lock out arms.'
    ],
    tips: [
      'Leaning forward shifts emphasis to chest; staying upright targets triceps.',
      'Control the descent to protect the shoulders.'
    ],
    common_mistakes: [
      'Descending too deep without adequate shoulder mobility.',
      'Swinging the legs.'
    ],
    primary_muscle: 'Lower Pectoralis Major',
    secondary_muscles: ['Triceps Brachii', 'Anterior Deltoid'],
    muscle_group: 'chest',
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

  // ═════════════════════════════════════════════════════════════════════════════
  // BACK (8)
  // ═════════════════════════════════════════════════════════════════════════════
  {
    id: 'ex-pull-up',
    name: 'Pull Up',
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
    secondary_muscles: ['Biceps Brachii', 'Rhomboids', 'Rear Deltoids'],
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
    secondary_muscles: ['Rhomboids', 'Trapezius', 'Biceps Brachii', 'Erector Spinae'],
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
    id: 'ex-dumbbell-row',
    name: 'Dumbbell Row',
    slug: 'dumbbell-row',
    description: 'Unilateral single-arm row building thick lats, rhomboids, and correcting muscular asymmetries.',
    instructions: [
      'Place one knee and one hand on a flat bench, holding a dumbbell in opposite hand.',
      'Pull dumbbell up toward your hip pocket, keeping elbow tight.',
      'Lower slowly to full lat stretch.'
    ],
    tips: [
      'Pull through the elbow, not the hand.',
      'Avoid rotating torso.'
    ],
    common_mistakes: [
      'Yanking with shoulder and rotating spine.',
      'Short-changing the bottom stretch.'
    ],
    primary_muscle: 'Latissimus Dorsi',
    secondary_muscles: ['Rhomboids', 'Biceps Brachii', 'Rear Deltoids'],
    muscle_group: 'back',
    equipment: ['dumbbell'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'horizontal_pull',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-seated-cable-row',
    name: 'Seated Cable Row',
    slug: 'seated-cable-row',
    description: 'Horizontal cable row targeting the middle back, rhomboids, and latissimus dorsi.',
    instructions: [
      'Sit facing low pulley with knees softly bent and feet braced.',
      'Grip the handle, sit upright with shoulders back.',
      'Pull handle to lower abdomen while driving elbows back.',
      'Extend arms forward under control.'
    ],
    tips: [
      'Keep chest tall and maintain neutral spine.',
      'Pause for a beat at peak contraction.'
    ],
    common_mistakes: [
      'Leaning excessively forward and back.',
      'Rounding the shoulders.'
    ],
    primary_muscle: 'Rhomboids',
    secondary_muscles: ['Latissimus Dorsi', 'Trapezius', 'Biceps Brachii'],
    muscle_group: 'back',
    equipment: ['cable', 'machine'],
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
  {
    id: 'ex-t-bar-row',
    name: 'T-Bar Row',
    slug: 't-bar-row',
    description: 'Heavy compound rowing movement supporting massive mid-back thickness and grip strength.',
    instructions: [
      'Straddle the T-bar apparatus, hinge hips at 45 degrees, and grip handles.',
      'Pull the weight towards your sternum while retracting shoulder blades.',
      'Lower smoothly to full extension.'
    ],
    tips: [
      'Brace abs firmly to protect the lower back.',
      'Do not jerk the weight with your legs.'
    ],
    common_mistakes: [
      'Standing too upright.',
      'Rounding the spine under heavy load.'
    ],
    primary_muscle: 'Latissimus Dorsi',
    secondary_muscles: ['Rhomboids', 'Trapezius', 'Biceps Brachii'],
    muscle_group: 'back',
    equipment: ['barbell', 'machine'],
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
    id: 'ex-face-pull',
    name: 'Face Pull',
    slug: 'face-pull',
    description: 'Vital movement for rear deltoids, external rotators, and upper back postural strength.',
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
    secondary_muscles: ['Rhomboids', 'Trapezius', 'Rotator Cuff'],
    muscle_group: 'back',
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
  {
    id: 'ex-straight-arm-pulldown',
    name: 'Straight Arm Pulldown',
    slug: 'straight-arm-pulldown',
    description: 'Lat isolation exercise providing intense stretch and contraction without bicep fatigue.',
    instructions: [
      'Stand facing high cable with a straight or lat bar.',
      'With arms almost straight, push bar downward in a wide arc until it touches your thighs.',
      'Pause and squeeze lats, then let bar return to eye level.'
    ],
    tips: [
      'Lock elbows with just a soft micro-bend.',
      'Hinge hips slightly for optimal lat stretch.'
    ],
    common_mistakes: [
      'Bending elbows into a tricep pushdown.',
      'Swinging the torso for momentum.'
    ],
    primary_muscle: 'Latissimus Dorsi',
    secondary_muscles: ['Teres Major', 'Core'],
    muscle_group: 'back',
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

  // ═════════════════════════════════════════════════════════════════════════════
  // SHOULDERS (7)
  // ═════════════════════════════════════════════════════════════════════════════
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
    secondary_muscles: ['Lateral Deltoid', 'Triceps Brachii', 'Upper Trapezius'],
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
    id: 'ex-dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    slug: 'dumbbell-shoulder-press',
    description: 'Seated or standing overhead press utilizing dumbbells for independent arm overload and rotator cuff freedom.',
    instructions: [
      'Hold dumbbells at shoulder height with palms forward or neutral.',
      'Press both weights smoothly overhead until arms extend.',
      'Lower weights under control back to ear level.'
    ],
    tips: [
      'Keep back flat against the bench pad.',
      'Avoid clanking dumbbells at the top.'
    ],
    common_mistakes: [
      'Arching lower back off the bench.',
      'Flaring elbows out too far backward.'
    ],
    primary_muscle: 'Anterior Deltoid',
    secondary_muscles: ['Lateral Deltoid', 'Triceps Brachii'],
    muscle_group: 'shoulders',
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'vertical_push',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-arnold-press',
    name: 'Arnold Press',
    slug: 'arnold-press',
    description: 'Rotational dumbbell press invented by Arnold Schwarzenegger to recruit all three deltoid heads.',
    instructions: [
      'Start with dumbbells at chin level, palms facing your face.',
      'As you press upward, rotate wrists so palms face forward at the top.',
      'Reverse rotation as you lower back to starting position.'
    ],
    tips: [
      'Keep the rotation continuous and fluid throughout the press.',
      'Use slightly lighter weight than standard dumbbell press.'
    ],
    common_mistakes: [
      'Rushing the wrist rotation at the bottom.',
      'Leaning back into the bench.'
    ],
    primary_muscle: 'Anterior Deltoid',
    secondary_muscles: ['Lateral Deltoid', 'Triceps Brachii'],
    muscle_group: 'shoulders',
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'vertical_push',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: true,
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
    id: 'ex-front-raise',
    name: 'Front Raise',
    slug: 'front-raise',
    description: 'Isolation movement targeting the anterior deltoid head.',
    instructions: [
      'Stand holding dumbbells against front of thighs.',
      'Raise one or both arms straight forward to shoulder height.',
      'Pause briefly, then lower with control.'
    ],
    tips: [
      'Keep wrists firm and elbows slightly soft.',
      'Do not lean back to elevate the weight.'
    ],
    common_mistakes: [
      'Swinging weights up using lower back.',
      'Lifting way above eye level.'
    ],
    primary_muscle: 'Anterior Deltoid',
    secondary_muscles: ['Lateral Deltoid', 'Upper Pectoralis Major'],
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
    id: 'ex-rear-delt-fly',
    name: 'Rear Delt Fly',
    slug: 'rear-delt-fly',
    description: 'Bent-over dumbbell fly isolating the posterior deltoid and scapular retractors.',
    instructions: [
      'Hinge at hips until torso is nearly parallel to floor.',
      'Raise dumbbells out to sides, leading with rear delts.',
      'Squeeze shoulder blades and lower smoothly.'
    ],
    tips: [
      'Keep your gaze directed at the floor to maintain neutral neck.',
      'Focus on pulling weights outward rather than straight up.'
    ],
    common_mistakes: [
      'Using momentum by standing up during the rep.',
      'Bending elbows into a row.'
    ],
    primary_muscle: 'Posterior Deltoid',
    secondary_muscles: ['Rhomboids', 'Trapezius'],
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
    id: 'ex-reverse-pec-deck',
    name: 'Reverse Pec Deck',
    slug: 'reverse-pec-deck',
    description: 'Machine isolation exercise targeting rear deltoids and mid-back with fixed trajectory.',
    instructions: [
      'Sit facing the machine pad with chest supported.',
      'Grip vertical handles with arms parallel to floor.',
      'Sweep arms backward until rear delts contract fully.',
      'Return slowly to the starting position.'
    ],
    tips: [
      'Keep chest firmly pressed against pad.',
      'Lead movement through elbows.'
    ],
    common_mistakes: [
      'Shrugging traps up toward ears.',
      'Letting the weight stack slam.'
    ],
    primary_muscle: 'Posterior Deltoid',
    secondary_muscles: ['Rhomboids', 'Trapezius'],
    muscle_group: 'shoulders',
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

  // ═════════════════════════════════════════════════════════════════════════════
  // LEGS (10)
  // ═════════════════════════════════════════════════════════════════════════════
  {
    id: 'ex-barbell-squat',
    name: 'Squat',
    slug: 'squat',
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
    id: 'ex-front-squat',
    name: 'Front Squat',
    slug: 'front-squat',
    description: 'Barbell squat with anterior bar placement, emphasizing quadriceps development and upright torso posture.',
    instructions: [
      'Rest barbell across anterior deltoids in clean grip or cross-arm grip.',
      'Keep elbows elevated high and chest tall.',
      'Squat down deeply between your hips.',
      'Drive upward through heels and mid-foot.'
    ],
    tips: [
      'Keep elbows pointing forward to prevent bar rolling.',
      'Requires strong upper thoracic extension.'
    ],
    common_mistakes: [
      'Dropping elbows, causing bar to roll forward.',
      'Rounding upper back.'
    ],
    primary_muscle: 'Quadriceps',
    secondary_muscles: ['Gluteus Maximus', 'Core', 'Upper Back'],
    muscle_group: 'legs',
    equipment: ['barbell'],
    difficulty: 'advanced',
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
    secondary_muscles: ['Gluteus Maximus', 'Hamstrings'],
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
  {
    id: 'ex-leg-curl',
    name: 'Leg Curl',
    slug: 'leg-curl',
    description: 'Isolation exercise targeting hamstring knee flexion across prone or seated machines.',
    instructions: [
      'Lie face down on machine with roller pad against lower calves.',
      'Curl heels toward glutes in a smooth arc.',
      'Squeeze hamstrings at contraction, then lower slowly.'
    ],
    tips: [
      'Keep hips pressed into bench.',
      'Do not jerk weight off starting point.'
    ],
    common_mistakes: [
      'Hyperextending lower back to assist lift.',
      'Swinging weights.'
    ],
    primary_muscle: 'Hamstrings',
    secondary_muscles: ['Calves'],
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
    id: 'ex-lunges',
    name: 'Lunges',
    slug: 'lunges',
    description: 'Dynamic unilateral leg exercise building quad, glute, and stabilizing balance.',
    instructions: [
      'Take a long step forward with one leg.',
      'Lower hips until front thigh is parallel to floor and back knee taps near floor.',
      'Drive off front heel to step forward into next stride.'
    ],
    tips: [
      'Keep torso upright and core engaged.',
      'Avoid letting front knee cave inward.'
    ],
    common_mistakes: [
      'Taking too short a step, crowding front knee.',
      'Banging back knee on floor.'
    ],
    primary_muscle: 'Quadriceps',
    secondary_muscles: ['Gluteus Maximus', 'Hamstrings', 'Calves'],
    muscle_group: 'legs',
    equipment: ['dumbbell', 'bodyweight'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'lunge',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    slug: 'bulgarian-split-squat',
    description: 'Rear foot elevated split squat providing extreme quad and glute hypertrophy and hip mobility.',
    instructions: [
      'Place top of rear foot on a bench behind you.',
      'Lower until front thigh is parallel to floor.',
      'Drive through front mid-foot to stand up tall.'
    ],
    tips: [
      'Lean torso slightly forward to bias glutes, or remain upright for quads.',
      '90% of your weight should be on the front foot.'
    ],
    common_mistakes: [
      'Front foot placed too close to bench.',
      'Losing balance due to narrow foot path.'
    ],
    primary_muscle: 'Quadriceps',
    secondary_muscles: ['Gluteus Maximus', 'Hamstrings'],
    muscle_group: 'legs',
    equipment: ['dumbbell', 'bodyweight'],
    difficulty: 'intermediate',
    exercise_type: 'strength',
    movement_pattern: 'squat',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-hack-squat',
    name: 'Hack Squat',
    slug: 'hack-squat',
    description: 'Machine squat on an angled slide targeting pure quad overload with solid back support.',
    instructions: [
      'Position shoulders under pads with back firmly against pad.',
      'Release safety handles and descend to 90 degrees knee flexion.',
      'Drive sled up smoothly through mid-foot.'
    ],
    tips: [
      'Position feet lower on platform to emphasize quads.',
      'Avoid locking knees abruptly at top.'
    ],
    common_mistakes: [
      'Letting heels lift off platform.',
      'Rounding hips off pad at deep depth.'
    ],
    primary_muscle: 'Quadriceps',
    secondary_muscles: ['Gluteus Maximus'],
    muscle_group: 'legs',
    equipment: ['machine'],
    difficulty: 'intermediate',
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
    id: 'ex-calf-raise',
    name: 'Calf Raise',
    slug: 'calf-raise',
    description: 'Standing or seated calf exercise isolating the gastrocnemius and soleus.',
    instructions: [
      'Place balls of feet on block with heels hanging off.',
      'Lower heels into full deep calf stretch.',
      'Explode upward onto toes, squeezing calves at apex.'
    ],
    tips: [
      'Hold the bottom stretch for 1-2 seconds to eliminate Achilles bounce.',
      'Keep knees softly locked.'
    ],
    common_mistakes: [
      'Bouncing fast with zero stretch.',
      'Short range of motion.'
    ],
    primary_muscle: 'Gastrocnemius',
    secondary_muscles: ['Soleus'],
    muscle_group: 'legs',
    equipment: ['machine', 'dumbbell', 'bodyweight'],
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

  // ═════════════════════════════════════════════════════════════════════════════
  // ARMS (8)
  // ═════════════════════════════════════════════════════════════════════════════
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
    id: 'ex-dumbbell-curl',
    name: 'Dumbbell Curl',
    slug: 'dumbbell-curl',
    description: 'Classic bicep exercise permitting natural forearm supination for peak biceps peak contraction.',
    instructions: [
      'Hold dumbbells at sides with palms neutral.',
      'Curl dumbbells up while rotating palms toward ceiling at the top.',
      'Squeeze biceps, then lower with control.'
    ],
    tips: [
      'Supinate wrists early during the ascent.',
      'Can be performed alternating or bilateral.'
    ],
    common_mistakes: [
      'Swinging upper body.',
      'Allowing elbows to flare outward.'
    ],
    primary_muscle: 'Biceps Brachii',
    secondary_muscles: ['Brachialis', 'Forearms'],
    muscle_group: 'biceps',
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
    id: 'ex-hammer-curl',
    name: 'Hammer Curl',
    slug: 'hammer-curl',
    description: 'Neutral-grip curl targeting the brachialis and brachioradialis for arm thickness.',
    instructions: [
      'Hold dumbbells at sides with palms facing each other (neutral grip).',
      'Curl weights upward without rotating wrists.',
      'Squeeze forearms and brachialis, then lower slowly.'
    ],
    tips: [
      'Keep wrists rigid throughout the rep.',
      'Pinned elbows ensure pure arm recruitment.'
    ],
    common_mistakes: [
      'Rocking body back and forth.',
      'Dropping weights abruptly.'
    ],
    primary_muscle: 'Brachialis',
    secondary_muscles: ['Biceps Brachii', 'Brachioradialis'],
    muscle_group: 'biceps',
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
    id: 'ex-preacher-curl',
    name: 'Preacher Curl',
    slug: 'preacher-curl',
    description: 'Arm curl performed against angled preacher bench eliminating all body momentum.',
    instructions: [
      'Sit at preacher bench with upper arms resting flat against the incline pad.',
      'Curl barbell or EZ-bar upward toward shoulders.',
      'Lower under control to full arm stretch.'
    ],
    tips: [
      'Keep armpits snug against the top of pad.',
      'Avoid hyperextending elbows abruptly at the bottom.'
    ],
    common_mistakes: [
      'Lifting elbows off the pad.',
      'Using excessive weight and dropping into lockout.'
    ],
    primary_muscle: 'Biceps Brachii',
    secondary_muscles: ['Brachialis'],
    muscle_group: 'biceps',
    equipment: ['barbell', 'dumbbell'],
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
  {
    id: 'ex-tricep-pushdown',
    name: 'Tricep Pushdown',
    slug: 'tricep-pushdown',
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
    id: 'ex-skull-crusher',
    name: 'Skull Crusher',
    slug: 'skull-crusher',
    description: 'Lying triceps extension building tremendous long and lateral triceps head strength.',
    instructions: [
      'Lie on flat bench holding EZ-bar with arms vertical.',
      'Hinge at elbows to lower bar toward forehead or slightly behind crown.',
      'Extend arms back to starting position.'
    ],
    tips: [
      'Keep elbows pointing straight up, not flaring out.',
      'Lowering slightly behind head keeps continuous triceps tension.'
    ],
    common_mistakes: [
      'Flaring elbows outward excessively.',
      'Moving upper arms back and forth like a pullover.'
    ],
    primary_muscle: 'Triceps Brachii',
    secondary_muscles: [],
    muscle_group: 'triceps',
    equipment: ['barbell'],
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
  {
    id: 'ex-overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    slug: 'overhead-tricep-extension',
    description: 'Overhead extension that places the long head of the triceps in a deep, loaded stretch.',
    instructions: [
      'Hold dumbbell or cable overhead with both hands.',
      'Lower weight behind head by bending elbows.',
      'Contract triceps to extend weight back overhead.'
    ],
    tips: [
      'Keep ribcage tucked down and core braced.',
      'Keep elbows pointing forward as much as possible.'
    ],
    common_mistakes: [
      'Arching lower back.',
      'Flaring elbows out sideways.'
    ],
    primary_muscle: 'Triceps Brachii',
    secondary_muscles: [],
    muscle_group: 'triceps',
    equipment: ['dumbbell', 'cable'],
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
    id: 'ex-close-grip-bench-press',
    name: 'Close Grip Bench Press',
    slug: 'close-grip-bench-press',
    description: 'Compound bench press with hands shoulder-width apart to overload triceps with heavy weight.',
    instructions: [
      'Lie on bench and grip bar shoulder-width apart.',
      'Lower bar to lower chest while keeping elbows tucked close to sides.',
      'Press up powerfully focusing on tricep drive.'
    ],
    tips: [
      'Hands should be shoulder-width; do not place hands too close together to save wrists.',
      'Maintain stable shoulder blade retraction.'
    ],
    common_mistakes: [
      'Placing hands too close (touching thumbs), straining wrists.',
      'Flaring elbows outward.'
    ],
    primary_muscle: 'Triceps Brachii',
    secondary_muscles: ['Pectoralis Major', 'Anterior Deltoid'],
    muscle_group: 'triceps',
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

  // ═════════════════════════════════════════════════════════════════════════════
  // CORE (7)
  // ═════════════════════════════════════════════════════════════════════════════
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
    secondary_muscles: ['Rectus Abdominis', 'Gluteus Maximus'],
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
    id: 'ex-crunch',
    name: 'Crunch',
    slug: 'crunch',
    description: 'Classic abdominal flexion exercise targeting the upper rectus abdominis.',
    instructions: [
      'Lie on back with knees bent and feet flat on floor.',
      'Place fingertips lightly behind ears or across chest.',
      'Curl shoulders off floor by contracting abs.',
      'Lower with control without neck straining.'
    ],
    tips: [
      'Exhale on the way up to achieve full abdominal contraction.',
      'Keep chin away from chest.'
    ],
    common_mistakes: [
      'Yanking on the neck with hands.',
      'Lifting entire lower back (turning it into a sit-up).'
    ],
    primary_muscle: 'Rectus Abdominis',
    secondary_muscles: [],
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
      'Arching back to generate momentum.',
      'Using only hip flexors without posterior pelvic tilt.'
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
  {
    id: 'ex-leg-raise',
    name: 'Leg Raise',
    slug: 'leg-raise',
    description: 'Floor-based leg raise targeting lower abdominal wall strength.',
    instructions: [
      'Lie flat on back with hands underneath glutes for lumbar support.',
      'Raise legs together to 90 degrees.',
      'Lower legs slowly until heels are 1 inch above floor, then repeat.'
    ],
    tips: [
      'Keep lower back pressed firmly into floor.',
      'Control the descent.'
    ],
    common_mistakes: [
      'Arching lower back off floor.',
      'Letting feet touch floor between reps.'
    ],
    primary_muscle: 'Rectus Abdominis',
    secondary_muscles: ['Hip Flexors'],
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
    id: 'ex-russian-twist',
    name: 'Russian Twist',
    slug: 'russian-twist',
    description: 'Rotational core exercise strengthening the internal and external obliques.',
    instructions: [
      'Sit on floor with knees bent, leaning back 45 degrees.',
      'Hold hands or a weight in front of chest.',
      'Rotate torso side to side, tapping floor on each side.'
    ],
    tips: [
      'Move from the ribs/torso, not just arms.',
      'Elevate feet for greater challenge.'
    ],
    common_mistakes: [
      'Rounding the spine excessively.',
      'Moving hands without rotating torso.'
    ],
    primary_muscle: 'Obliques',
    secondary_muscles: ['Rectus Abdominis'],
    muscle_group: 'core',
    equipment: ['bodyweight', 'dumbbell'],
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
    id: 'ex-cable-crunch',
    name: 'Cable Crunch',
    slug: 'cable-crunch',
    description: 'Kneeling cable crunch enabling progressive resistance overload for abdominal hypertrophy.',
    instructions: [
      'Kneel below high pulley holding rope attachment at sides of head.',
      'Flex spine to curl elbows toward knees.',
      'Squeeze abs hard at bottom, then return slowly.'
    ],
    tips: [
      'Hips stay stationary; motion comes strictly from spinal flexion.',
      'Exhale completely at bottom.'
    ],
    common_mistakes: [
      'Sitting back on heels (using hip hinge instead of ab crunch).',
      'Pulling with arms.'
    ],
    primary_muscle: 'Rectus Abdominis',
    secondary_muscles: [],
    muscle_group: 'core',
    equipment: ['cable'],
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
  {
    id: 'ex-ab-wheel',
    name: 'Ab Wheel',
    slug: 'ab-wheel',
    description: 'Extreme anti-extension core challenge building superhuman anterior core stability.',
    instructions: [
      'Kneel on floor holding ab wheel handles below shoulders.',
      'Roll wheel forward while keeping core braced and hips aligned.',
      'Pull wheel back to starting position using your abs.'
    ],
    tips: [
      'Maintain slight posterior pelvic tilt (tucked tailbone).',
      'Do not extend further than your core can support without back sagging.'
    ],
    common_mistakes: [
      'Letting lumbar spine arch/sag downward.',
      'Pulling back with hips first.'
    ],
    primary_muscle: 'Rectus Abdominis',
    secondary_muscles: ['Latissimus Dorsi', 'Shoulders'],
    muscle_group: 'core',
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    exercise_type: 'strength',
    movement_pattern: 'isolation',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // GLUTES (4)
  // ═════════════════════════════════════════════════════════════════════════════
  {
    id: 'ex-barbell-hip-thrust',
    name: 'Hip Thrust',
    slug: 'hip-thrust',
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
  },
  {
    id: 'ex-glute-bridge',
    name: 'Glute Bridge',
    slug: 'glute-bridge',
    description: 'Floor-based hip extension movement isolating glute activation and hip stability.',
    instructions: [
      'Lie on back with knees bent, feet flat on floor hip-width apart.',
      'Drive through heels to raise hips until straight line forms from shoulders to knees.',
      'Hold peak squeeze for 2 seconds, then lower.'
    ],
    tips: [
      'Squeeze glutes at top without arching lower back.',
      'Can be loaded with a dumbbell or barbell across hips.'
    ],
    common_mistakes: [
      'Pushing through toes instead of heels.',
      'Overextending lumbar spine.'
    ],
    primary_muscle: 'Gluteus Maximus',
    secondary_muscles: ['Hamstrings'],
    muscle_group: 'glutes',
    equipment: ['bodyweight', 'dumbbell'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'hinge',
    image_url: null,
    video_url: null,
    is_compound: false,
    is_unilateral: false,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'ex-cable-kickback',
    name: 'Cable Kickback',
    slug: 'cable-kickback',
    description: 'Isolation cable exercise targeting the gluteus maximus through terminal hip extension.',
    instructions: [
      'Attach ankle cuff to low cable pulley.',
      'Face machine, hinge slightly at hips, and kick leg straight backward.',
      'Squeeze glute at full extension, then return under control.'
    ],
    tips: [
      'Keep pelvis square to machine.',
      'Movement comes from hip extension, not lower back bending.'
    ],
    common_mistakes: [
      'Arching lower back on every rep.',
      'Swinging the leg with momentum.'
    ],
    primary_muscle: 'Gluteus Maximus',
    secondary_muscles: ['Hamstrings'],
    muscle_group: 'glutes',
    equipment: ['cable'],
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
    id: 'ex-step-up',
    name: 'Step Up',
    slug: 'step-up',
    description: 'Unilateral movement targeting glute strength, quadriceps drive, and pelvic stability.',
    instructions: [
      'Stand facing a sturdy box or bench.',
      'Place one foot flat on box and drive through heel to step onto box.',
      'Lower trailing foot back down under control.'
    ],
    tips: [
      'Do not push off the floor with trailing foot; make leading leg do the work.',
      'Keep torso proud.'
    ],
    common_mistakes: [
      'Jumping off the back foot.',
      'Leading knee collapsing inward.'
    ],
    primary_muscle: 'Gluteus Maximus',
    secondary_muscles: ['Quadriceps', 'Hamstrings', 'Calves'],
    muscle_group: 'glutes',
    equipment: ['dumbbell', 'bodyweight'],
    difficulty: 'beginner',
    exercise_type: 'strength',
    movement_pattern: 'lunge',
    image_url: null,
    video_url: null,
    is_compound: true,
    is_unilateral: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  }
]
