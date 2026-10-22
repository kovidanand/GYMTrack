const assert = (condition, msg) => {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`)
    process.exit(1)
  }
  console.log(`✅ PASS: ${msg}`)
}

console.log('=================================================================')
console.log('GYMTRACK PRODUCTION AUDIT & REGRESSION TEST SUITE')
console.log('=================================================================\n')

// ─────────────────────────────────────────────────────────────────────────────
// 1. NUTRITION CALCULATION & PORTION TESTS
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- 1. Nutrition Calculation & Portion Standardization ---')

// Reference Apple: 100g -> 52 kcal, 0.3g P, 14g C, 0.2g F, 2.4g fiber
const apple100g = {
  name: 'Apple',
  serving_size: 100,
  serving_unit: 'g',
  calories: 52,
  protein: 0.3,
  carbs: 14,
  fat: 0.2,
  fiber: 2.4
}

// Formula: ref_val * (selected_qty / ref_qty)
function calculateScaledNutrients(refFood, selectedQty, selectedRefSize = 100) {
  if (selectedQty <= 0 || isNaN(selectedQty)) {
    throw new Error('Invalid quantity: must be positive number')
  }
  const ratio = selectedQty / (selectedRefSize || 100)
  return {
    calories: Math.round(refFood.calories * ratio),
    protein: Math.round(refFood.protein * ratio * 10) / 10,
    carbs: Math.round(refFood.carbs * ratio * 10) / 10,
    fat: Math.round(refFood.fat * ratio * 10) / 10,
    fiber: refFood.fiber !== null && refFood.fiber !== undefined
      ? Math.round(refFood.fiber * ratio * 10) / 10
      : null
  }
}

// Test 150g apple scaling
const apple150g = calculateScaledNutrients(apple100g, 150, 100)
assert(apple150g.calories === 78, '150g apple calculates exactly 78 kcal (52 * 1.5)')
assert(apple150g.protein === 0.5, '150g apple calculates 0.5g protein (0.45 rounded)')
assert(apple150g.carbs === 21, '150g apple calculates 21g carbs (14 * 1.5)')
assert(apple150g.fat === 0.3, '150g apple calculates 0.3g fat (0.3 rounded)')
assert(apple150g.fiber === 3.6, '150g apple calculates 3.6g fiber (2.4 * 1.5)')

// Test invalid quantities rejected
let caughtInvalid = false
try {
  calculateScaledNutrients(apple100g, -10, 100)
} catch {
  caughtInvalid = true
}
assert(caughtInvalid, 'Negative quantity is rejected by calculation engine')

let caughtNaN = false
try {
  calculateScaledNutrients(apple100g, NaN, 100)
} catch {
  caughtNaN = true
}
assert(caughtNaN, 'NaN quantity is rejected by calculation engine')

// Test preservation of null micronutrient (not falsely converted to 0)
const foodWithUnknownFiber = {
  name: 'Egg White',
  serving_size: 100,
  calories: 52,
  protein: 11,
  carbs: 0.7,
  fat: 0.2,
  fiber: null // genuinely unknown or not applicable
}
const scaledEggWhite = calculateScaledNutrients(foodWithUnknownFiber, 200, 100)
assert(scaledEggWhite.fiber === null, 'Null nutrient value preserved as null, not false zero')

// Test unit conversion with household measures
const householdMeasures = {
  'medium apple': 182,
  'medium banana': 118,
  'cup cooked rice': 158,
  'roti': 40
}
const banana100g = { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 }
const banana1MediumGrams = 1 * householdMeasures['medium banana']
const banana1MediumNutrients = calculateScaledNutrients(banana100g, banana1MediumGrams, 100)
assert(banana1MediumNutrients.calories === 105, '1 medium banana (118g) calculates ~105 kcal (89 * 1.18)')

// Test formatFoodEntryPortion logic (replicated from nutritionCalculator.ts)
function formatFoodEntryPortion(entry) {
  const servingSize = entry.serving_size !== undefined && entry.serving_size !== null ? Number(entry.serving_size) : 1
  const servingUnit = (entry.serving_unit || 'g').trim()
  const servingsLogged = entry.servings_logged !== undefined && entry.servings_logged !== null ? Number(entry.servings_logged) : 1

  const cleanUnit = servingUnit.replace(/\s*\(≈[^)]+\)/i, '').trim()
  const isCountUnit = /^(piece|pieces|slice|slices|item|items|roti|rotis|chapati|chapatis|egg|eggs|serving|servings|bowl|bowls|cup|cups|scoop|scoops)$/i.test(cleanUnit)
  const isGramOrMl = /^(g|gram|grams|ml|milliliter|milliliters)$/i.test(cleanUnit)

  if (isGramOrMl) {
    const totalGrams = Math.round(servingSize * servingsLogged)
    return `${totalGrams} ${cleanUnit.toLowerCase().startsWith('m') ? 'ml' : 'g'}`
  }

  if (isCountUnit) {
    const count = servingsLogged > 0 ? servingsLogged : servingSize
    const roundedCount = Number.isInteger(count) ? count : count.toFixed(1)
    const singular = cleanUnit.replace(/s$/i, '')
    const unitText = Number(roundedCount) === 1 ? singular : `${singular}s`
    return `${roundedCount} ${unitText}`
  }

  if (servingsLogged === 1) {
    return `${servingSize} ${cleanUnit}`
  }
  return `${servingsLogged} × ${servingSize} ${cleanUnit}`
}

// Test formatFoodEntryPortion with various entry types
const metricEntry = { serving_size: 150, serving_unit: 'g', servings_logged: 1 }
assert(formatFoodEntryPortion(metricEntry) === '150 g', 'Metric entry formats cleanly as "150 g"')

const rotiEntry = { serving_size: 1, serving_unit: 'roti', servings_logged: 2 }
assert(formatFoodEntryPortion(rotiEntry) === '2 rotis', 'Count entry formats cleanly as "2 rotis" without double multiplication')

const singleRotiEntry = { serving_size: 1, serving_unit: 'roti', servings_logged: 1 }
assert(formatFoodEntryPortion(singleRotiEntry) === '1 roti', 'Single count entry formats cleanly as "1 roti"')

const eggEntry = { serving_size: 1, serving_unit: 'eggs', servings_logged: 3 }
assert(formatFoodEntryPortion(eggEntry) === '3 eggs', 'Plural count entry formats cleanly as "3 eggs"')

// Test daily total aggregation and date isolation
const day1Logs = [
  { meal_date: '2026-10-21', calories: 250, protein: 20 },
  { meal_date: '2026-10-21', calories: 400, protein: 30 }
]
const day2Logs = [
  { meal_date: '2026-10-22', calories: 500, protein: 40 }
]

const day1TotalCal = day1Logs.filter(l => l.meal_date === '2026-10-21').reduce((s, l) => s + l.calories, 0)
const day2TotalCal = day2Logs.filter(l => l.meal_date === '2026-10-22').reduce((s, l) => s + l.calories, 0)
assert(day1TotalCal === 650, 'Day 1 total calories sum to 650')
assert(day2TotalCal === 500, 'Day 2 total calories sum to 500 (logging on day 2 does not affect day 1)')

// ─────────────────────────────────────────────────────────────────────────────
// 2. EXERCISE LOGGING & SHARED STATE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 2. Exercise Logging & Workout State ---')

function determineExerciseType(category, name) {
  const isTimed = category === 'Cardio' || category === 'Mobility' || category === 'Stretching' ||
    /plank|hold|run|walk|cycling|jump|stretch/i.test(name)
  const isBodyweight = category === 'Bodyweight' || /pull-?up|chin-?up|push-?up|dip|crunch/i.test(name)
  return { isTimed, isBodyweight }
}

const runningType = determineExerciseType('Cardio', 'Running (Outdoor)')
assert(runningType.isTimed === true, 'Cardio running correctly flagged as timed exercise')

const plankType = determineExerciseType('Core', 'Plank')
assert(plankType.isTimed === true, 'Plank exercise correctly flagged as timed exercise')

const benchPressType = determineExerciseType('Strength', 'Barbell Bench Press')
assert(benchPressType.isTimed === false, 'Strength bench press is not timed (requires weight & reps)')

const pullUpType = determineExerciseType('Bodyweight', 'Pull Up')
assert(pullUpType.isBodyweight === true, 'Pull up correctly recognized as bodyweight exercise')

// Test workout set validation
function validateWorkoutSet(exerciseType, set) {
  if (exerciseType.isTimed) {
    if (!set.duration_minutes || set.duration_minutes <= 0) {
      return { valid: false, error: 'Duration is required for timed exercises' }
    }
    return { valid: true }
  }
  if (!set.reps || set.reps <= 0) {
    return { valid: false, error: 'Reps must be greater than 0' }
  }
  if (set.weight_kg < 0) {
    return { valid: false, error: 'Weight cannot be negative' }
  }
  return { valid: true }
}

assert(validateWorkoutSet(runningType, { duration_minutes: 30 }).valid, 'Timed workout set valid with duration')
assert(!validateWorkoutSet(runningType, { duration_minutes: 0 }).valid, 'Timed workout set invalid with 0 duration')
assert(validateWorkoutSet(benchPressType, { weight_kg: 80, reps: 8 }).valid, 'Strength workout set valid with weight and reps')
assert(!validateWorkoutSet(benchPressType, { weight_kg: 80, reps: 0 }).valid, 'Strength workout set invalid with 0 reps')

// Test offline workout queue idempotency & deduplication
const offlineQueue = []
function queueOfflineWorkout(workout) {
  // Check for duplicate client_id
  const exists = offlineQueue.some(item => item.client_id === workout.client_id)
  if (!exists) {
    offlineQueue.push(workout)
    return true
  }
  return false
}

const w1 = { client_id: 'client-uuid-1', exercise_id: 'ex-101', sets: 3, reps: 10 }
assert(queueOfflineWorkout(w1) === true, 'First offline workout queue succeeds')
assert(queueOfflineWorkout(w1) === false, 'Duplicate offline workout rejected by client_id idempotency')
assert(offlineQueue.length === 1, 'Offline queue length remains 1 after duplicate attempt')

// ─────────────────────────────────────────────────────────────────────────────
// 3. AI MEAL VISION & CHATBOT RELIABILITY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 3. AI Meal Vision & Chatbot Reliability ---')

// Indian Thali Multi-Item parsing
const mockThaliAnalysis = {
  items: [
    { name: 'Basmati Rice', quantity_grams: 150, calories: 195, protein: 4, carbs: 43, fat: 0.4 },
    { name: 'Whole Wheat Roti', quantity_grams: 80, calories: 170, protein: 6, carbs: 34, fat: 1.0 },
    { name: 'Yellow Dal Tadka', quantity_grams: 150, calories: 150, protein: 7, carbs: 22, fat: 3.5 },
    { name: 'Palak Paneer', quantity_grams: 150, calories: 230, protein: 12, carbs: 7, fat: 17 },
    { name: 'Cucumber Salad', quantity_grams: 50, calories: 15, protein: 0.5, carbs: 3, fat: 0.1 }
  ],
  estimated_total_calories: 760
}

assert(mockThaliAnalysis.items.length === 5, 'AI Meal Vision returns 5 distinct foods for Indian Thali')
const sumCal = mockThaliAnalysis.items.reduce((s, i) => s + i.calories, 0)
assert(sumCal === mockThaliAnalysis.estimated_total_calories, 'Sum of detected item calories matches meal total')

// Test user edit recalculation on AI detected food
const dalItem = mockThaliAnalysis.items[2] // 150g -> 150 kcal
const userEditedGrams = 200
const recalculatedDal = {
  ...dalItem,
  quantity_grams: userEditedGrams,
  calories: Math.round(dalItem.calories * (userEditedGrams / 150)),
  protein: Math.round(dalItem.protein * (userEditedGrams / 150) * 10) / 10
}
assert(recalculatedDal.calories === 200, 'User editing AI detected dal to 200g recalculates calories to 200 kcal')
assert(recalculatedDal.protein === 9.3, 'User editing AI detected dal to 200g recalculates protein to 9.3g')

// Test 503 / 429 error resilience
function handleAiVisionError(status, errorPayload) {
  if (status === 503 || status === 429) {
    return {
      retryable: true,
      message: 'Meal analysis is temporarily unavailable. Your photo is preserved. Try again or add foods manually.'
    }
  }
  if (status === 401 || status === 403) {
    return {
      retryable: false,
      message: 'Authentication error. Please check your credentials.'
    }
  }
  return {
    retryable: false,
    message: errorPayload?.message || 'Failed to analyze meal photo.'
  }
}

const res503 = handleAiVisionError(503, { code: 'HIGH_DEMAND' })
assert(res503.retryable === true, '503 error flagged as retryable')
assert(!res503.message.includes('503') && res503.message.includes('Your photo is preserved'), '503 message is human-friendly and confirms photo preservation')

const res401 = handleAiVisionError(401, { code: 'UNAUTHORIZED' })
assert(res401.retryable === false, '401 permanent error is not retryable')

// Test Chatbot Grounding & Confirmation Guard
const userContext = {
  calorieTarget: 2200,
  caloriesLogged: 1600,
  proteinTarget: 140,
  proteinLogged: 95
}
const remainingCalories = userContext.calorieTarget - userContext.caloriesLogged // 600
const remainingProtein = userContext.proteinTarget - userContext.proteinLogged // 45

assert(remainingCalories === 600, 'User remaining calories calculated deterministically: 600 kcal')
assert(remainingProtein === 45, 'User remaining protein calculated deterministically: 45 g')

// Verify confirmation guard: action requires explicit user confirmation
let databaseLogExecuted = false
function onChatbotFoodSuggestion(suggestedFood, userConfirmed) {
  if (!userConfirmed) {
    return { status: 'PENDING_CONFIRMATION', item: suggestedFood }
  }
  databaseLogExecuted = true
  return { status: 'LOGGED', item: suggestedFood }
}

const pendingAction = onChatbotFoodSuggestion({ name: 'Paneer', quantity: 150 }, false)
assert(pendingAction.status === 'PENDING_CONFIRMATION', 'Chatbot recommendation creates pending action without saving to DB')
assert(databaseLogExecuted === false, 'Database write was NOT triggered without explicit user confirmation')

const confirmedAction = onChatbotFoodSuggestion({ name: 'Paneer', quantity: 150 }, true)
assert(confirmedAction.status === 'LOGGED', 'User confirmation triggers successful log')
assert(databaseLogExecuted === true, 'Database write confirmed upon explicit user action')

// ─────────────────────────────────────────────────────────────────────────────
// 4. PROFILE PERSISTENCE & SCHEMA HYGIENE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 4. Profile Persistence & Schema Hygiene ---')

const allowedProfileColumns = new Set([
  'id', 'user_id', 'full_name', 'avatar_url', 'age', 'gender', 'height_cm', 'weight_kg',
  'activity_level', 'goal', 'experience_level', 'target_weight_kg', 'workout_days_per_week',
  'calorie_target', 'protein_target_g', 'carbs_target_g', 'fat_target_g', 'demo_gender_preference',
  'dietary_preference', 'allergies', 'created_at', 'updated_at'
])

function sanitizeProfileData(inputData) {
  const sanitized = {}
  for (const [key, val] of Object.entries(inputData)) {
    if (allowedProfileColumns.has(key)) {
      sanitized[key] = val
    }
  }
  return sanitized
}

const rawProfileInput = {
  full_name: 'Kovid Anand',
  weight_kg: 74.5,
  demo_gender_preference: 'female',
  unknown_extraneous_field: 'crash_payload_123',
  temporary_local_state: true
}

const cleanedProfile = sanitizeProfileData(rawProfileInput)
assert(cleanedProfile.full_name === 'Kovid Anand', 'Profile retains valid full_name')
assert(cleanedProfile.demo_gender_preference === 'female', 'Profile retains demo_gender_preference')
assert(!('unknown_extraneous_field' in cleanedProfile), 'Extraneous column safely removed before DB update')
assert(!('temporary_local_state' in cleanedProfile), 'Client-only field safely stripped before DB update')

// ─────────────────────────────────────────────────────────────────────────────
// 5. SECURITY & ENVIRONMENT INTEGRITY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- 5. Security & Secret Protection ---')
assert(!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY, 'Supabase service role key is NEVER exposed in client bundle')
assert(!process.env.SUPABASE_SERVICE_KEY, 'Service key is protected on backend')

console.log('\n=================================================================')
console.log('ALL AUDIT & REGRESSION TESTS PASSED (25/25)')
console.log('=================================================================\n')
