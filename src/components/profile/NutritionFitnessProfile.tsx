import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Target,
  Salad,
  Wallet,
  Scale,
  Flame,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Dumbbell,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type {
  DietaryPreference,
  FoodBudget,
  CookingAccess,
  CookingSkill,
  MealPrepTime,
} from '@/types/supabase'
import type { NutritionGoals } from '@/types/nutrition'
import { NutritionGoalsModal } from '@/components/nutrition/NutritionGoalsModal'
import { getNutritionGoals, saveNutritionGoals, DEFAULT_NUTRITION_GOALS } from '@/lib/nutritionService'
import { getActiveWorkoutPlan } from '@/lib/workouts'

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Dairy / Lactose',
  'Gluten / Wheat',
  'Eggs',
  'Soy',
  'Fish / Shellfish',
  'Sesame',
]

const PROTEIN_SOURCES = [
  'Chicken Breast',
  'Eggs & Whites',
  'Paneer / Cottage Cheese',
  'Whey Protein',
  'Yellow Dal & Lentils',
  'Soy Chunks',
  'Greek Yogurt',
  'Salmon & Fish',
  'Tofu & Tempeh',
  'Chickpeas & Chole',
]

const CUISINES = [
  'North Indian',
  'South Indian',
  'Mediterranean',
  'Asian',
  'Western / Continental',
  'Middle Eastern',
]

export function NutritionFitnessProfile() {
  const { user, profile, updateUserProfile } = useAuth()
  const userId = user?.id || 'guest_user'

  // Nutrition goals & modal
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_NUTRITION_GOALS)
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)
  const [activePlanName, setActivePlanName] = useState<string | null>(null)


  // Form states
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Section A: Goals
  const [primaryGoal, setPrimaryGoal] = useState<string>('')
  const [secondaryGoal, setSecondaryGoal] = useState<string>('')
  const [trainingFrequency, setTrainingFrequency] = useState<number>(4)

  // Section B: Body
  const [age, setAge] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [targetWeight, setTargetWeight] = useState<string>('')
  const [targetDate, setTargetDate] = useState<string>('')

  // Section C: Diet
  const [dietaryPref, setDietaryPref] = useState<DietaryPreference>('non_vegetarian')
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [customAllergyInput, setCustomAllergyInput] = useState('')
  const [selectedProteins, setSelectedProteins] = useState<string[]>([])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [dislikedFoodsInput, setDislikedFoodsInput] = useState('')
  const [favoriteFoodsInput, setFavoriteFoodsInput] = useState('')

  // Section D: Food Access & Budget
  const [foodBudget, setFoodBudget] = useState<FoodBudget>('moderate')
  const [cookingAccess, setCookingAccess] = useState<CookingAccess>('full_kitchen')
  const [cookingSkill, setCookingSkill] = useState<CookingSkill>('intermediate')
  const [mealPrepTime, setMealPrepTime] = useState<MealPrepTime>('moderate')
  const [mealsPerDay, setMealsPerDay] = useState<number>(3)

  // Initialize from authenticated profile
  useEffect(() => {
    if (profile) {
      setPrimaryGoal(profile.fitness_goal || 'build_muscle')
      setSecondaryGoal(profile.secondary_goal || '')
      setTrainingFrequency(profile.training_frequency || 4)
      setAge(profile.age ? String(profile.age) : '')
      setHeight(profile.height ? String(profile.height) : '')
      setWeight(profile.weight ? String(profile.weight) : '')
      setTargetWeight(profile.target_weight ? String(profile.target_weight) : '')
      setTargetDate(profile.target_date || '')
      setDietaryPref(profile.dietary_preference || 'non_vegetarian')
      setSelectedAllergies(profile.allergies || [])
      setSelectedProteins(profile.preferred_protein_sources || [])
      setSelectedCuisines(profile.preferred_cuisines || [])
      setDislikedFoodsInput(profile.disliked_foods?.join(', ') || '')
      setFavoriteFoodsInput(profile.favorite_foods?.join(', ') || '')
      setFoodBudget(profile.food_budget || 'moderate')
      setCookingAccess(profile.cooking_access || 'full_kitchen')
      setCookingSkill(profile.cooking_skill || 'intermediate')
      setMealPrepTime(profile.meal_prep_time || 'moderate')
      setMealsPerDay(profile.meals_per_day || 3)
    }
  }, [profile])

  // Load goals & active plan
  useEffect(() => {
    if (!userId) return
    getNutritionGoals(userId).then(g => setGoals(g)).catch(() => {})
    getActiveWorkoutPlan(userId).then(res => {
      const plan = (res.data as any)?.plan || res.data
      if (plan?.name) {
        setActivePlanName(plan.name)
      }
    }).catch(() => {})
  }, [userId])

  // Completeness score
  const completeness = React.useMemo(() => {
    let filled = 0
    const total = 8
    if (primaryGoal) filled++
    if (weight) filled++
    if (height) filled++
    if (age) filled++
    if (dietaryPref) filled++
    if (selectedAllergies.length > 0 || profile?.allergies) filled++
    if (foodBudget) filled++
    if (goals.calorie_target > 0) filled++
    return Math.round((filled / total) * 100)
  }, [primaryGoal, weight, height, age, dietaryPref, selectedAllergies, foodBudget, goals, profile])

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    )
  }

  const addCustomAllergy = () => {
    const val = customAllergyInput.trim()
    if (!val || selectedAllergies.includes(val)) return
    setSelectedAllergies(prev => [...prev, val])
    setCustomAllergyInput('')
  }

  const toggleProtein = (protein: string) => {
    setSelectedProteins(prev =>
      prev.includes(protein) ? prev.filter(p => p !== protein) : [...prev, protein]
    )
  }

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    )
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    const dislikedArr = dislikedFoodsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    const favoriteArr = favoriteFoodsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const updates = {
      fitness_goal: primaryGoal || null,
      secondary_goal: secondaryGoal || null,
      training_frequency: trainingFrequency || null,
      age: age ? parseInt(age, 10) : null,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      target_weight: targetWeight ? parseFloat(targetWeight) : null,
      target_date: targetDate || null,
      dietary_preference: dietaryPref,
      allergies: selectedAllergies,
      preferred_protein_sources: selectedProteins,
      preferred_cuisines: selectedCuisines,
      disliked_foods: dislikedArr,
      favorite_foods: favoriteArr,
      food_budget: foodBudget,
      cooking_access: cookingAccess,
      cooking_skill: cookingSkill,
      meal_prep_time: mealPrepTime,
      meals_per_day: mealsPerDay,
    }

    const { error } = await updateUserProfile(updates)
    setSaving(false)

    if (!error) {
      setToastMessage('Nutrition & Fitness Profile saved. AI Coach context updated!')
      setTimeout(() => setToastMessage(null), 3500)
    } else {
      setToastMessage('Error saving profile changes. Please try again.')
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  const handleSaveGoals = async (updated: Partial<NutritionGoals>) => {
    const saved = await saveNutritionGoals(userId, updated)
    setGoals(saved)
    setToastMessage('Nutrition targets updated successfully!')
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-surface-900 text-white text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xl border border-surface-700 animate-slide-up flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── HEADER & PROFILE COMPLETENESS ─── */}
      <div className="card p-5 sm:p-6 bg-gradient-to-br from-white to-surface-50 border border-surface-200/90 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-surface-900 tracking-tight flex items-center gap-2">
                <span>Personal Nutrition & Fitness Profile</span>
              </h2>
              <p className="text-xs text-surface-500 font-medium mt-0.5">
                Powers unified AI recommendations with your authentic dietary constraints, goals, and food access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            <span>Save Profile</span>
          </button>
        </div>

        {/* Completeness Bar */}
        <div className="p-3.5 rounded-xl bg-white border border-surface-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-surface-700">
            <span className="flex items-center gap-1.5">
              <span>Profile Completeness</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {completeness}% Complete
              </span>
            </span>
            <span className="text-[11px] text-surface-400 font-normal">
              More details = more personalized AI coaching
            </span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION A: FITNESS GOALS ─── */}
      <div className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <div className="flex items-center gap-2 text-brand-700">
            <Target size={18} />
            <h3 className="text-sm font-black uppercase tracking-wider text-surface-900">
              Section A: Fitness Goals
            </h3>
          </div>
          {activePlanName && (
            <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Dumbbell size={11} />
              <span>Active Plan: {activePlanName}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Primary Fitness Goal
            </label>
            <select
              value={primaryGoal}
              onChange={e => setPrimaryGoal(e.target.value)}
              className="input-base text-xs font-semibold"
            >
              <option value="build_muscle">Muscle Gain (Hypertrophy)</option>
              <option value="lose_weight">Fat Loss & Leaning</option>
              <option value="recomposition">Body Recomposition</option>
              <option value="improve_strength">Maximum Strength</option>
              <option value="maintain_fitness">General Fitness & Health</option>
              <option value="weight_maintenance">Weight Maintenance</option>
              <option value="increase_endurance">Athletic Endurance</option>
              <option value="custom">Custom Goal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Optional Secondary Goal
            </label>
            <select
              value={secondaryGoal}
              onChange={e => setSecondaryGoal(e.target.value)}
              className="input-base text-xs"
            >
              <option value="">None</option>
              <option value="improve_strength">Build Core Strength</option>
              <option value="increase_endurance">Cardiovascular Health</option>
              <option value="improve_flexibility">Mobility & Joint Health</option>
              <option value="lose_weight">Gradual Fat Reduction</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Current Training Frequency
            </label>
            <select
              value={trainingFrequency}
              onChange={e => setTrainingFrequency(parseInt(e.target.value, 10))}
              className="input-base text-xs font-semibold"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'day' : 'days'} per week
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── SECTION B: BODY INFORMATION ─── */}
      <div className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-emerald-800 pb-3 border-b border-surface-100">
          <Scale size={18} className="text-emerald-600" />
          <h3 className="text-sm font-black uppercase tracking-wider text-surface-900">
            Section B: Body Information
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Age</label>
            <input
              type="number"
              placeholder="e.g. 25"
              value={age}
              onChange={e => setAge(e.target.value)}
              className="input-base text-xs font-semibold"
              min="10"
              max="120"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Height (cm)</label>
            <input
              type="number"
              placeholder="e.g. 175"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="input-base text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Current Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 74.5"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="input-base text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Target Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="Optional target"
              value={targetWeight}
              onChange={e => setTargetWeight(e.target.value)}
              className="input-base text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="input-base text-xs"
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION C: DIETARY PREFERENCES ─── */}
      <div className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-5">
        <div className="flex items-center gap-2 text-emerald-800 pb-3 border-b border-surface-100">
          <Salad size={18} className="text-emerald-600" />
          <h3 className="text-sm font-black uppercase tracking-wider text-surface-900">
            Section C: Dietary Preferences & Allergies
          </h3>
        </div>

        {/* Diet Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-surface-700">
            Primary Diet Classification
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish' },
              { id: 'eggetarian', label: 'Eggetarian', desc: 'Vegetarian + Eggs' },
              { id: 'non_vegetarian', label: 'Non-Vegetarian', desc: 'Chicken, meat, fish' },
              { id: 'vegan', label: 'Vegan', desc: 'Plant-only, no dairy' },
              { id: 'other', label: 'Custom / Other', desc: 'Flexible dietary pattern' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDietaryPref(item.id as DietaryPreference)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  dietaryPref === item.id
                    ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-500'
                    : 'border-surface-200 hover:border-surface-300 bg-white text-surface-700'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[10px] text-surface-500 font-normal mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Allergies & Foods to Avoid */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-surface-700">
            <ShieldAlert size={14} className="text-rose-500" />
            <span>Configured Allergies & Restrictions (Never Recommended by AI)</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {COMMON_ALLERGIES.map(allergy => {
              const active = selectedAllergies.includes(allergy)
              return (
                <button
                  key={allergy}
                  type="button"
                  onClick={() => toggleAllergy(allergy)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                      : 'bg-surface-50 hover:bg-surface-100 text-surface-700 border-surface-200'
                  }`}
                >
                  {allergy}
                </button>
              )
            })}
          </div>

          {/* Add custom restriction */}
          <div className="flex items-center gap-2 max-w-sm pt-1">
            <input
              type="text"
              placeholder="Add other allergen (e.g. Mushroom)"
              value={customAllergyInput}
              onChange={e => setCustomAllergyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
              className="input-base text-xs py-1.5"
            />
            <button
              type="button"
              onClick={addCustomAllergy}
              className="px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-surface-800 rounded-xl text-xs font-bold border border-surface-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Preferred Protein Sources */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-surface-700">
            Preferred Protein Sources
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PROTEIN_SOURCES.map(source => {
              const active = selectedProteins.includes(source)
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => toggleProtein(source)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                      : 'bg-surface-50 hover:bg-surface-100 text-surface-700 border-surface-200'
                  }`}
                >
                  {source}
                </button>
              )
            })}
          </div>
        </div>

        {/* Preferred Cuisines */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-surface-700">
            Preferred Cuisines
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CUISINES.map(c => {
              const active = selectedCuisines.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCuisine(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    active
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-surface-50 hover:bg-surface-100 text-surface-700 border-surface-200'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        {/* Disliked & Favorite Foods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Foods You Dislike (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Karela, Okra, Brinjal"
              value={dislikedFoodsInput}
              onChange={e => setDislikedFoodsInput(e.target.value)}
              className="input-base text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Favorite Foods (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Oatmeal, Yellow Dal, Paneer"
              value={favoriteFoodsInput}
              onChange={e => setFavoriteFoodsInput(e.target.value)}
              className="input-base text-xs"
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION D: FOOD ACCESS & BUDGET ─── */}
      <div className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-brand-700 pb-3 border-b border-surface-100">
          <Wallet size={18} />
          <h3 className="text-sm font-black uppercase tracking-wider text-surface-900">
            Section D: Food Access & Practical Constraints
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Food Budget Preference
            </label>
            <select
              value={foodBudget}
              onChange={e => setFoodBudget(e.target.value as FoodBudget)}
              className="input-base text-xs font-semibold"
            >
              <option value="budget">Affordable & Budget-Friendly (Lentils, Eggs, Oats, Rice)</option>
              <option value="moderate">Moderate / Standard Groceries</option>
              <option value="flexible">Flexible / Premium (Salmon, imported whey, berries)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Kitchen & Food Access
            </label>
            <select
              value={cookingAccess}
              onChange={e => setCookingAccess(e.target.value as CookingAccess)}
              className="input-base text-xs font-semibold"
            >
              <option value="full_kitchen">Full Kitchen (Cook own meals)</option>
              <option value="hostel_mess">Hostel / Mess / Cafeteria</option>
              <option value="cafeteria">Office Cafeteria / Meal Subscriptions</option>
              <option value="minimal">Minimal Cooking (Kettle / Microwave only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Cooking Prep Time
            </label>
            <select
              value={mealPrepTime}
              onChange={e => setMealPrepTime(e.target.value as MealPrepTime)}
              className="input-base text-xs font-semibold"
            >
              <option value="quick">Quick (&lt; 15 mins)</option>
              <option value="moderate">Moderate (15–30 mins)</option>
              <option value="extended">Extended (30+ mins)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Preferred Meals Per Day
            </label>
            <select
              value={mealsPerDay}
              onChange={e => setMealsPerDay(parseInt(e.target.value, 10))}
              className="input-base text-xs font-semibold"
            >
              <option value={2}>2 Meals (Intermittent Fasting)</option>
              <option value={3}>3 Main Meals</option>
              <option value={4}>3 Meals + 1 Snack</option>
              <option value={5}>4 Meals + 1 Snack</option>
              <option value={6}>6 Small Frequent Meals</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── SECTION E: NUTRITION TARGETS ─── */}
      <div className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <div className="flex items-center gap-2 text-emerald-800">
            <Flame size={18} className="text-emerald-600" />
            <h3 className="text-sm font-black uppercase tracking-wider text-surface-900">
              Section E: Configured Nutrition Targets
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsGoalsModalOpen(true)}
            id="profile-adjust-targets-btn"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            Adjust Targets
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] text-surface-400 font-bold block uppercase">
              Daily Calories
            </span>
            <span className="text-base font-black text-surface-900">
              {goals.calorie_target} kcal
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] text-emerald-700 font-bold block uppercase">
              Protein
            </span>
            <span className="text-base font-black text-surface-900">
              {goals.protein_target}g
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] text-amber-800 font-bold block uppercase">
              Carbohydrates
            </span>
            <span className="text-base font-black text-surface-900">
              {goals.carb_target}g
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] text-rose-700 font-bold block uppercase">
              Fat
            </span>
            <span className="text-base font-black text-surface-900">
              {goals.fat_target}g
            </span>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-indigo-700 font-bold block uppercase">
              Fiber
            </span>
            <span className="text-base font-black text-surface-900">
              {goals.fiber_target}g
            </span>
          </div>
        </div>
      </div>

      {/* Nutrition Goals Modal */}
      <NutritionGoalsModal
        open={isGoalsModalOpen}
        onOpenChange={setIsGoalsModalOpen}
        currentGoals={goals}
        onSaveGoals={handleSaveGoals}
      />
    </div>
  )
}
