import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Target,
  Salad,
  Wallet,
  Flame,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Dumbbell,
  User,
  Scale,
  Calendar,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Avatar } from '@/components/shared'
import type {
  DietaryPreference,
  FoodBudget,
  CookingAccess,
  CookingSkill,
  MealPrepTime,
  FitnessGoal,
  ExperienceLevel
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

  // Form states & feedback
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // ─── SECTION A: PERSONAL INFORMATION ───
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [sex, setSex] = useState<string>('')

  // ─── SECTION B: FITNESS GOALS ───
  const [primaryGoal, setPrimaryGoal] = useState<string>('build_muscle')
  const [secondaryGoal, setSecondaryGoal] = useState<string>('')
  const [targetWeight, setTargetWeight] = useState<string>('')
  const [targetDate, setTargetDate] = useState<string>('')
  const [experienceLevel, setExperienceLevel] = useState<string>('intermediate')
  const [trainingFrequency, setTrainingFrequency] = useState<number>(4)

  // ─── SECTION C: NUTRITION PREFERENCES ───
  const [dietaryPref, setDietaryPref] = useState<DietaryPreference>('non_vegetarian')
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [customAllergyInput, setCustomAllergyInput] = useState('')
  const [selectedProteins, setSelectedProteins] = useState<string[]>([])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [foodBudget, setFoodBudget] = useState<FoodBudget>('moderate')
  const [cookingAccess, setCookingAccess] = useState<CookingAccess>('full_kitchen')
  const [cookingSkill, setCookingSkill] = useState<CookingSkill>('intermediate')
  const [mealPrepTime, setMealPrepTime] = useState<MealPrepTime>('moderate')
  const [mealsPerDay, setMealsPerDay] = useState<number>(3)
  const [dislikedFoodsInput, setDislikedFoodsInput] = useState('')
  const [favoriteFoodsInput, setFavoriteFoodsInput] = useState('')

  // Initialize from authenticated profile
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setAge(profile.age ? String(profile.age) : '')
      setHeight(profile.height ? String(profile.height) : '')
      setWeight(profile.weight ? String(profile.weight) : '')
      setSex(profile.sex || '')

      setPrimaryGoal(profile.fitness_goal || 'build_muscle')
      setSecondaryGoal(profile.secondary_goal || '')
      setTargetWeight(profile.target_weight ? String(profile.target_weight) : '')
      setTargetDate(profile.target_date || '')
      setExperienceLevel(profile.experience_level || 'intermediate')
      setTrainingFrequency(profile.training_frequency || 4)

      setDietaryPref(profile.dietary_preference || 'non_vegetarian')
      setSelectedAllergies(profile.allergies || [])
      setSelectedProteins(profile.preferred_protein_sources || [])
      setSelectedCuisines(profile.preferred_cuisines || [])
      setFoodBudget(profile.food_budget || 'moderate')
      setCookingAccess(profile.cooking_access || 'full_kitchen')
      setCookingSkill(profile.cooking_skill || 'intermediate')
      setMealPrepTime(profile.meal_prep_time || 'moderate')
      setMealsPerDay(profile.meals_per_day || 3)
      setDislikedFoodsInput(profile.disliked_foods?.join(', ') || '')
      setFavoriteFoodsInput(profile.favorite_foods?.join(', ') || '')
    }
  }, [profile])

  // Load goals & active workout plan
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

  // Profile completeness score
  const completeness = React.useMemo(() => {
    let filled = 0
    const total = 9
    if (firstName.trim()) filled++
    if (age) filled++
    if (height) filled++
    if (weight) filled++
    if (sex) filled++
    if (primaryGoal) filled++
    if (dietaryPref) filled++
    if (goals.calorie_target > 0) filled++
    if (foodBudget) filled++
    return Math.round((filled / total) * 100)
  }, [firstName, age, height, weight, sex, primaryGoal, dietaryPref, goals, foodBudget])

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
    setValidationError(null)

    // Validation
    const parsedAge = age ? parseInt(age, 10) : null
    const parsedHeight = height ? parseFloat(height) : null
    const parsedWeight = weight ? parseFloat(weight) : null
    const parsedTargetWeight = targetWeight ? parseFloat(targetWeight) : null

    if (parsedAge !== null && (isNaN(parsedAge) || parsedAge < 10 || parsedAge > 120)) {
      setValidationError('Please enter a valid age between 10 and 120 years.')
      return
    }
    if (parsedHeight !== null && (isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 260)) {
      setValidationError('Please enter a realistic height between 50 cm and 260 cm.')
      return
    }
    if (parsedWeight !== null && (isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 350)) {
      setValidationError('Please enter a realistic weight between 20 kg and 350 kg.')
      return
    }

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
      first_name: firstName.trim() || profile?.first_name || '',
      last_name: lastName.trim() || profile?.last_name || '',
      age: parsedAge,
      height: parsedHeight,
      weight: parsedWeight,
      sex: sex || null,
      fitness_goal: (primaryGoal as FitnessGoal) || null,
      secondary_goal: (secondaryGoal as FitnessGoal) || null,
      target_weight: parsedTargetWeight,
      target_date: targetDate || null,
      experience_level: (experienceLevel as ExperienceLevel) || null,
      training_frequency: trainingFrequency || null,
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
      setToastMessage('Profile updated successfully!')
      setTimeout(() => setToastMessage(null), 3000)
    } else {
      setToastMessage('Error saving profile changes. Please try again.')
      setTimeout(() => setToastMessage(null), 3500)
    }
  }

  const handleSaveGoals = async (updated: Partial<NutritionGoals>) => {
    const saved = await saveNutritionGoals(userId, updated)
    setGoals(saved)
    setToastMessage('Daily nutrition targets updated successfully!')
    setTimeout(() => setToastMessage(null), 3000)
  }

  const fullName = `${firstName} ${lastName}`.trim() || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Athlete'

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-4 sm:right-6 z-50 bg-surface-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-xl border border-surface-700 animate-slide-up flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div
          role="alert"
          className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in"
        >
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ─── Profile Header & Completeness Overview ─── */}
      <div className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar name={fullName} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-surface-900 leading-tight">
                  {fullName}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-100 text-surface-600 border border-surface-200">
                  {user?.email}
                </span>
              </div>
              <p className="text-xs text-surface-500 font-medium mt-0.5">
                Personalized fitness goals, dietary preferences, and daily nutrition targets.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            id="profile-save-btn-top"
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            <span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Completeness Bar */}
        <div className="pt-2 border-t border-surface-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-surface-700">
            <span className="flex items-center gap-1.5">
              <span>Profile Completeness</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                {completeness}%
              </span>
            </span>
            <span className="text-[11px] text-surface-400 font-normal">
              Used by GYMTrack & AI Coach for personalized guidance
            </span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── SECTION A: PERSONAL INFORMATION ─── */}
      <section aria-label="Personal Information" className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-surface-900 pb-3 border-b border-surface-100">
          <User size={18} className="text-brand-600" />
          <h3 className="text-sm font-bold tracking-tight text-surface-900">
            Section A: Personal Information
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">First Name</label>
            <input
              type="text"
              placeholder="e.g. John"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="input-base text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Last Name</label>
            <input
              type="text"
              placeholder="e.g. Doe"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="input-base text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Sex (Biological / Metabolic)</label>
            <select
              value={sex}
              onChange={e => setSex(e.target.value)}
              className="input-base text-xs font-semibold"
            >
              <option value="">Select (Optional)</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Age (Years)</label>
            <input
              type="number"
              placeholder="e.g. 26"
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
              step="0.1"
              placeholder="e.g. 175"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="input-base text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Current Body Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 74.5"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="input-base text-xs font-semibold"
            />
          </div>
        </div>
      </section>

      {/* ─── SECTION B: FITNESS GOALS ─── */}
      <section aria-label="Fitness Goals" className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <div className="flex items-center gap-2 text-surface-900">
            <Target size={18} className="text-brand-600" />
            <h3 className="text-sm font-bold tracking-tight text-surface-900">
              Section B: Fitness Goals
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
              Primary Goal
            </label>
            <select
              value={primaryGoal}
              onChange={e => setPrimaryGoal(e.target.value)}
              className="input-base text-xs font-semibold"
            >
              <option value="build_muscle">Muscle Gain (Hypertrophy)</option>
              <option value="lose_weight">Weight Loss & Fat Loss</option>
              <option value="recomposition">Body Recomposition</option>
              <option value="improve_strength">Strength & Power</option>
              <option value="maintain_fitness">General Fitness & Health</option>
              <option value="weight_maintenance">Maintenance</option>
              <option value="increase_endurance">Athletic Endurance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Secondary Goal (Optional)
            </label>
            <select
              value={secondaryGoal}
              onChange={e => setSecondaryGoal(e.target.value)}
              className="input-base text-xs"
            >
              <option value="">None</option>
              <option value="improve_strength">Build Core Strength</option>
              <option value="increase_endurance">Cardiovascular Health</option>
              <option value="improve_flexibility">Mobility & Joint Flexibility</option>
              <option value="lose_weight">Gradual Fat Reduction</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Activity & Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={e => setExperienceLevel(e.target.value)}
              className="input-base text-xs font-semibold"
            >
              <option value="beginner">Beginner (&lt; 1 year training)</option>
              <option value="intermediate">Intermediate (1–3 years training)</option>
              <option value="advanced">Advanced (3+ years structured training)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Training Frequency
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

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Target Body Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 70.0 (Optional)"
              value={targetWeight}
              onChange={e => setTargetWeight(e.target.value)}
              className="input-base text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Target Goal Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="input-base text-xs"
            />
          </div>
        </div>
      </section>

      {/* ─── SECTION C: NUTRITION PREFERENCES ─── */}
      <section aria-label="Nutrition Preferences" className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-5">
        <div className="flex items-center gap-2 text-surface-900 pb-3 border-b border-surface-100">
          <Salad size={18} className="text-emerald-600" />
          <h3 className="text-sm font-bold tracking-tight text-surface-900">
            Section C: Nutrition Preferences & Restrictions
          </h3>
        </div>

        {/* Dietary Preference Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-surface-700">
            Dietary Preference
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'vegetarian', label: 'Vegetarian', desc: 'Plant foods + dairy, no meat' },
              { id: 'eggetarian', label: 'Eggetarian', desc: 'Vegetarian + Eggs' },
              { id: 'non_vegetarian', label: 'Non-Vegetarian', desc: 'Meat, poultry, fish' },
              { id: 'vegan', label: 'Vegan', desc: '100% plant-based, no dairy' },
              { id: 'other', label: 'Other / Custom', desc: 'Flexible dietary pattern' },
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

        {/* Food Allergies or Restrictions */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-surface-700">
            <ShieldAlert size={14} className="text-rose-500" />
            <span>Food Allergies & Restrictions (Never suggested in meals)</span>
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
              placeholder="Add other restriction (e.g. Mushrooms)"
              value={customAllergyInput}
              onChange={e => setCustomAllergyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
              className="input-base text-xs py-1.5"
            />
            <button
              type="button"
              onClick={addCustomAllergy}
              className="px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-surface-800 rounded-xl text-xs font-bold border border-surface-200 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Preferred Protein Sources */}
        <div className="space-y-2 pt-1">
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

        {/* Preferred Meal Pattern & Access Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Preferred Meal Pattern
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
              <option value={6}>6 Frequent Smaller Meals</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Food Budget
            </label>
            <select
              value={foodBudget}
              onChange={e => setFoodBudget(e.target.value as FoodBudget)}
              className="input-base text-xs font-semibold"
            >
              <option value="budget">Budget-Friendly (Eggs, Dal, Oats, Rice)</option>
              <option value="moderate">Moderate / Standard Groceries</option>
              <option value="flexible">Flexible / Premium (Salmon, Greek yogurt, berries)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Kitchen & Cooking Access
            </label>
            <select
              value={cookingAccess}
              onChange={e => setCookingAccess(e.target.value as CookingAccess)}
              className="input-base text-xs font-semibold"
            >
              <option value="full_kitchen">Full Kitchen (Cook own meals)</option>
              <option value="hostel_mess">Hostel / College Mess</option>
              <option value="cafeteria">Office Cafeteria / Meal Tiffin</option>
              <option value="minimal">Minimal (Microwave / Kettle only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Meal Prep Time
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
        </div>

        {/* Disliked & Favorite Foods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">
              Foods You Dislike (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Bitter gourd, Eggplant"
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
              placeholder="e.g. Oatmeal, Yellow Dal, Chicken"
              value={favoriteFoodsInput}
              onChange={e => setFavoriteFoodsInput(e.target.value)}
              className="input-base text-xs"
            />
          </div>
        </div>
      </section>

      {/* ─── SECTION D: DAILY TARGETS ─── */}
      <section aria-label="Daily Nutrition Targets" className="card p-5 sm:p-6 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-100">
          <div className="flex items-center gap-2 text-surface-900">
            <Flame size={18} className="text-emerald-600" />
            <h3 className="text-sm font-bold tracking-tight text-surface-900">
              Section D: Daily Targets
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsGoalsModalOpen(true)}
            id="profile-adjust-targets-btn"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs"
          >
            Adjust Targets
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] text-surface-500 font-bold block uppercase tracking-wider">
              Calorie Target
            </span>
            <span className="text-base sm:text-lg font-black text-surface-900 mt-0.5 block">
              {goals.calorie_target} <span className="text-xs font-medium text-surface-500">kcal</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider">
              Protein
            </span>
            <span className="text-base sm:text-lg font-black text-surface-900 mt-0.5 block">
              {goals.protein_target} <span className="text-xs font-medium text-surface-500">g</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">
              Carbohydrates
            </span>
            <span className="text-base sm:text-lg font-black text-surface-900 mt-0.5 block">
              {goals.carb_target} <span className="text-xs font-medium text-surface-500">g</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
            <span className="text-[10px] text-rose-700 font-bold block uppercase tracking-wider">
              Fat
            </span>
            <span className="text-base sm:text-lg font-black text-surface-900 mt-0.5 block">
              {goals.fat_target} <span className="text-xs font-medium text-surface-500">g</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-indigo-700 font-bold block uppercase tracking-wider">
              Dietary Fiber
            </span>
            <span className="text-base sm:text-lg font-black text-surface-900 mt-0.5 block">
              {goals.fiber_target} <span className="text-xs font-medium text-surface-500">g</span>
            </span>
          </div>
        </div>
      </section>

      {/* ─── Bottom Save Action Bar ─── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          id="profile-save-btn-bottom"
          className="px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          <span>{saving ? 'Saving Profile…' : 'Save All Preferences'}</span>
        </button>
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
