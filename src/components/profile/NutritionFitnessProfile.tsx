import React, { useState, useEffect, useMemo } from 'react'
import {
  Target,
  Salad,
  Sparkles,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Dumbbell,
  User,
  Scale,
  Calendar,
  AlertCircle,
  Sliders,
  Utensils,
  Clock,
  Heart,
  ChevronRight,
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

const fitnessGoalLabel: Record<string, string> = {
  build_muscle:       'Muscle Gain',
  lose_weight:        'Weight Loss / Fat Loss',
  recomposition:      'Body Recomposition',
  improve_strength:   'Strength & Power',
  maintain_fitness:   'General Fitness',
  weight_maintenance: 'Maintenance',
  increase_endurance: 'Athletic Endurance',
}

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
  'Continental / Western',
  'Middle Eastern',
]

export function NutritionFitnessProfile() {
  const { user, profile, updateUserProfile } = useAuth()
  const userId = user?.id || 'guest_user'

  // Nutrition goals & modal
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_NUTRITION_GOALS)
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)
  const [activePlanName, setActivePlanName] = useState<string | null>(null)

  // Feedback states
  const [saving, setSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  // ─── 1. PERSONAL INFORMATION ───
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState<string>('')
  const [height, setHeight] = useState<string>('')
  const [weight, setWeight] = useState<string>('')
  const [sex, setSex] = useState<string>('')
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')

  // ─── 2. FITNESS GOALS ───
  const [primaryGoal, setPrimaryGoal] = useState<string>('build_muscle')
  const [secondaryGoal, setSecondaryGoal] = useState<string>('')
  const [targetWeight, setTargetWeight] = useState<string>('')
  const [targetDate, setTargetDate] = useState<string>('')
  const [experienceLevel, setExperienceLevel] = useState<string>('intermediate')
  const [trainingFrequency, setTrainingFrequency] = useState<number>(4)
  const [sessionDuration, setSessionDuration] = useState<number>(60)

  // ─── 3. NUTRITION PREFERENCES ───
  const [dietaryPref, setDietaryPref] = useState<DietaryPreference>('non_vegetarian')
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [customAllergyInput, setCustomAllergyInput] = useState('')
  const [dislikedFoodsInput, setDislikedFoodsInput] = useState('')
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [mealsPerDay, setMealsPerDay] = useState<number>(3)

  // ─── 4. AI PERSONALIZATION ───
  const [foodBudget, setFoodBudget] = useState<FoodBudget>('moderate')
  const [cookingAccess, setCookingAccess] = useState<CookingAccess>('full_kitchen')
  const [cookingSkill, setCookingSkill] = useState<CookingSkill>('intermediate')
  const [mealPrepTime, setMealPrepTime] = useState<MealPrepTime>('moderate')
  const [selectedProteins, setSelectedProteins] = useState<string[]>([])
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
      setSessionDuration(profile.session_duration || 60)

      setDietaryPref(profile.dietary_preference || 'non_vegetarian')
      setSelectedAllergies(profile.allergies || [])
      setDislikedFoodsInput(profile.disliked_foods?.join(', ') || '')
      setSelectedCuisines(profile.preferred_cuisines || [])
      setMealsPerDay(profile.meals_per_day || 3)

      setFoodBudget(profile.food_budget || 'moderate')
      setCookingAccess(profile.cooking_access || 'full_kitchen')
      setCookingSkill(profile.cooking_skill || 'intermediate')
      setMealPrepTime(profile.meal_prep_time || 'moderate')
      setSelectedProteins(profile.preferred_protein_sources || [])
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

  // Calculate actual completeness & missing information
  const { completeness, missingFields } = useMemo(() => {
    const missing: string[] = []
    if (!firstName.trim()) missing.push('First Name')
    if (!age) missing.push('Age')
    if (!height) missing.push('Height')
    if (!weight) missing.push('Weight')
    if (!sex) missing.push('Sex')
    if (!primaryGoal) missing.push('Primary Goal')
    if (!targetWeight) missing.push('Target Weight')
    if (!dietaryPref) missing.push('Dietary Preference')
    if (goals.calorie_target <= 0) missing.push('Calorie Target')

    const totalFields = 9
    const completedCount = totalFields - missing.length
    const score = Math.round((completedCount / totalFields) * 100)
    return { completeness: score, missingFields: missing }
  }, [firstName, age, height, weight, sex, primaryGoal, targetWeight, dietaryPref, goals])

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

    // Boundaries validation
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
      session_duration: sessionDuration || null,
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
      // Dispatch shared event for real-time coach and nutrition context updates
      window.dispatchEvent(new CustomEvent('gymtrack:profile_updated', { detail: updates }))
      setTimeout(() => setToastMessage(null), 3000)
    } else {
      setValidationError(error || 'Failed to save changes. Please try again.')
    }
  }

  const handleSaveGoals = async (updated: Partial<NutritionGoals>) => {
    const saved = await saveNutritionGoals(userId, updated)
    setGoals(saved)
    setToastMessage('Nutrition targets updated!')
    setTimeout(() => setToastMessage(null), 3000)
  }

  // User display name kept on one line
  const fullName = `${firstName} ${lastName}`.trim() || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Athlete'

  return (
    <div className="space-y-5 pb-16 sm:pb-8 w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-50 bg-surface-900 text-white text-xs sm:text-sm px-4 py-3 rounded-xl shadow-xl border border-surface-700 animate-slide-up flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Validation Alert */}
      {validationError && (
        <div
          role="alert"
          className="bg-red-50 text-red-700 p-3.5 rounded-2xl border border-red-200 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in"
        >
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ─── B. COMPACT PROFILE SUMMARY CARD ─── */}
      <div className="p-4 sm:p-5 bg-white border border-surface-200/90 rounded-2xl shadow-2xs space-y-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar name={fullName} size="lg" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
              <h2 className="text-base sm:text-lg font-bold text-surface-900 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                {fullName}
              </h2>
              {fitnessGoalLabel[primaryGoal] && (
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  {fitnessGoalLabel[primaryGoal]}
                </span>
              )}
            </div>
            <p className="text-xs text-surface-500 truncate mt-0.5 font-medium">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Compact Completeness */}
        <div className="pt-2.5 border-t border-surface-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-surface-600 gap-2">
            <span className="truncate">
              Profile completeness: <strong className="text-surface-900 font-bold">{completeness}%</strong>
              {missingFields.length > 0 && (
                <span className="text-surface-400 font-normal ml-1 hidden sm:inline">
                  • Missing: {missingFields.slice(0, 2).join(', ')}{missingFields.length > 2 ? ` +${missingFields.length - 2} more` : ''}
                </span>
              )}
            </span>
            {missingFields.length > 0 ? (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0 font-medium">
                {missingFields.length} {missingFields.length === 1 ? 'field' : 'fields'} to complete
              </span>
            ) : (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0 font-medium flex items-center gap-1">
                <CheckCircle2 size={10} />
                <span>Complete</span>
              </span>
            )}
          </div>
          <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── D. UNIFIED FORM SECTIONS ─── */}
      <div className="bg-white border border-surface-200/90 rounded-2xl shadow-2xs divide-y divide-surface-100 overflow-hidden">
        {/* ── 1. PERSONAL INFORMATION ── */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-surface-900 pb-1">
            <User size={16} className="text-brand-600" />
            <h3 className="text-sm font-bold tracking-tight text-surface-900 uppercase tracking-wider text-[11px]">
              1. Personal Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">First Name</label>
              <input
                type="text"
                placeholder="e.g. John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Last Name</label>
              <input
                type="text"
                placeholder="e.g. Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Age (Years)</label>
              <input
                type="number"
                placeholder="e.g. 26"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
                min="10"
                max="120"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Biological / Metabolic Sex</label>
              <select
                value={sex}
                onChange={e => setSex(e.target.value)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              >
                <option value="">Select (Optional)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Height (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 175"
                value={height}
                onChange={e => setHeight(e.target.value)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
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
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* ── 2. FITNESS GOALS ── */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2 text-surface-900">
              <Target size={16} className="text-brand-600" />
              <h3 className="text-sm font-bold tracking-tight text-surface-900 uppercase tracking-wider text-[11px]">
                2. Fitness Goals
              </h3>
            </div>
            {activePlanName && (
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Dumbbell size={11} />
                <span>Active: {activePlanName}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Primary Fitness Goal</label>
              <select
                value={primaryGoal}
                onChange={e => setPrimaryGoal(e.target.value)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
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
              <label className="block text-xs font-bold text-surface-700 mb-1">Target Body Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 70.0 (Optional)"
                value={targetWeight}
                onChange={e => setTargetWeight(e.target.value)}
                className="input-base text-xs w-full min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Training Experience Level</label>
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              >
                <option value="beginner">Beginner (&lt; 1 year training)</option>
                <option value="intermediate">Intermediate (1–3 years training)</option>
                <option value="advanced">Advanced (3+ years structured training)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Weekly Training Frequency</label>
              <select
                value={trainingFrequency}
                onChange={e => setTrainingFrequency(parseInt(e.target.value, 10))}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(n => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'day' : 'days'} per week
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Preferred Workout Duration</label>
              <select
                value={sessionDuration}
                onChange={e => setSessionDuration(parseInt(e.target.value, 10))}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={75}>75 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Target Goal Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="input-base text-xs w-full min-h-[44px]"
              />
            </div>
          </div>
        </div>

        {/* ── 3. NUTRITION PREFERENCES ── */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-surface-900 pb-1">
            <Salad size={16} className="text-emerald-600" />
            <h3 className="text-sm font-bold tracking-tight text-surface-900 uppercase tracking-wider text-[11px]">
              3. Nutrition Preferences & Targets
            </h3>
          </div>

          {/* Dietary Preference Buttons */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-surface-700">Dietary Classification</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'vegetarian', label: 'Vegetarian' },
                { id: 'eggetarian', label: 'Eggetarian' },
                { id: 'non_vegetarian', label: 'Non-Veg' },
                { id: 'vegan', label: 'Vegan' },
                { id: 'other', label: 'Other' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDietaryPref(item.id as DietaryPreference)}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all min-h-[40px] ${
                    dietaryPref === item.id
                      ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold ring-1 ring-brand-500'
                      : 'border-surface-200 hover:border-surface-300 bg-white text-surface-700'
                  }`}
                >
                  <span className="text-xs font-bold block">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Food Allergies */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-surface-700 flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-rose-500" />
              <span>Food Allergies & Restrictions (Excluded from AI recommendations)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ALLERGIES.map(allergy => {
                const active = selectedAllergies.includes(allergy)
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border min-h-[36px] ${
                      active
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-surface-50 hover:bg-surface-100 text-surface-700 border-surface-200'
                    }`}
                  >
                    {allergy}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 max-w-sm pt-1">
              <input
                type="text"
                placeholder="Add other restriction (e.g. Mushroom)"
                value={customAllergyInput}
                onChange={e => setCustomAllergyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomAllergy())}
                className="input-base text-xs py-1.5 min-h-[38px] flex-1"
              />
              <button
                type="button"
                onClick={addCustomAllergy}
                className="px-3.5 py-1.5 bg-surface-100 hover:bg-surface-200 text-surface-800 rounded-xl text-xs font-bold border border-surface-200 min-h-[38px]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Foods to Avoid / Dislike</label>
              <input
                type="text"
                placeholder="e.g. Bitter gourd, Eggplant"
                value={dislikedFoodsInput}
                onChange={e => setDislikedFoodsInput(e.target.value)}
                className="input-base text-xs w-full min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Preferred Meals Per Day</label>
              <select
                value={mealsPerDay}
                onChange={e => setMealsPerDay(parseInt(e.target.value, 10))}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              >
                <option value={2}>2 Meals (Intermittent Fasting)</option>
                <option value={3}>3 Main Meals</option>
                <option value={4}>3 Meals + 1 Snack</option>
                <option value={5}>4 Meals + 1 Snack</option>
                <option value={6}>6 Frequent Smaller Meals</option>
              </select>
            </div>
          </div>

          {/* Daily Nutrition Targets Card */}
          <div className="p-4 rounded-2xl bg-surface-50 border border-surface-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-surface-900 block">
                  Daily Nutrition Targets
                </span>
                <span className="text-[11px] text-surface-500">
                  Calorie and macro targets for NutriTrack and AI Coach
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsGoalsModalOpen(true)}
                id="profile-adjust-targets-btn"
                className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100/80 border border-brand-200 px-3 py-1.5 rounded-xl transition-colors min-h-[36px]"
              >
                Adjust Targets
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-surface-200/80">
                <span className="text-[10px] text-surface-400 font-bold block uppercase">Calories</span>
                <span className="text-base font-bold text-surface-900">{goals.calorie_target} <span className="text-xs font-normal">kcal</span></span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-surface-200/80">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase">Protein</span>
                <span className="text-base font-bold text-surface-900">{goals.protein_target}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-surface-200/80">
                <span className="text-[10px] text-amber-700 font-bold block uppercase">Carbs</span>
                <span className="text-base font-bold text-surface-900">{goals.carb_target}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-surface-200/80">
                <span className="text-[10px] text-rose-600 font-bold block uppercase">Fat</span>
                <span className="text-base font-bold text-surface-900">{goals.fat_target}g</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-surface-200/80 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-brand-600 font-bold block uppercase">Fiber</span>
                <span className="text-base font-bold text-surface-900">{goals.fiber_target}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. AI PERSONALIZATION (OPTIONAL) ── */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-surface-900 pb-1">
            <Sparkles size={16} className="text-brand-600" />
            <div>
              <h3 className="text-sm font-bold tracking-tight text-surface-900 uppercase tracking-wider text-[11px]">
                4. AI Personalization (Optional)
              </h3>
              <p className="text-xs text-surface-500 font-medium mt-0.5">
                Helps AI Coach suggest meals tailored to your kitchen access, budget, and cooking time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Food Budget Preference</label>
              <select
                value={foodBudget}
                onChange={e => setFoodBudget(e.target.value as FoodBudget)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              >
                <option value="budget">Budget-Friendly (Eggs, Dal, Oats, Rice)</option>
                <option value="moderate">Moderate / Standard Groceries</option>
                <option value="flexible">Flexible / Premium (Salmon, Greek yogurt, berries)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Kitchen & Food Access</label>
              <select
                value={cookingAccess}
                onChange={e => setCookingAccess(e.target.value as CookingAccess)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              >
                <option value="full_kitchen">Full Kitchen (Cook own meals)</option>
                <option value="hostel_mess">Hostel / Mess / Cafeteria</option>
                <option value="cafeteria">Office Cafeteria / Meal Tiffin</option>
                <option value="minimal">Minimal (Kettle / Microwave only)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">Cooking Prep Time</label>
              <select
                value={mealPrepTime}
                onChange={e => setMealPrepTime(e.target.value as MealPrepTime)}
                className="input-base text-xs font-semibold w-full min-h-[44px]"
              >
                <option value="quick">Quick (&lt; 15 mins)</option>
                <option value="moderate">Moderate (15–30 mins)</option>
                <option value="extended">Extended (30+ mins)</option>
              </select>
            </div>
          </div>

          {/* Preferred Protein Sources */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-surface-700">Preferred Protein Staples</label>
            <div className="flex flex-wrap gap-1.5">
              {PROTEIN_SOURCES.map(source => {
                const active = selectedProteins.includes(source)
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleProtein(source)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border min-h-[36px] ${
                      active
                        ? 'bg-brand-600 text-white border-brand-700'
                        : 'bg-surface-50 hover:bg-surface-100 text-surface-700 border-surface-200'
                    }`}
                  >
                    {source}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-700 mb-1">Favorite Foods (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Oatmeal, Yellow Dal, Chicken, Paneer"
              value={favoriteFoodsInput}
              onChange={e => setFavoriteFoodsInput(e.target.value)}
              className="input-base text-xs w-full min-h-[44px]"
            />
          </div>
        </div>
      </div>

      {/* ─── F. SAVE EXPERIENCE: DESKTOP & MOBILE ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <span className="text-xs text-surface-500 font-medium hidden sm:inline">
          {completeness === 100 ? 'All essential details completed.' : `${missingFields.length} optional fields remaining.`}
        </span>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          id="profile-save-btn-bottom"
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs sm:text-sm bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 min-h-[44px] active:scale-[0.99]"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          <span>{saving ? 'Saving Changes…' : 'Save Changes'}</span>
        </button>
      </div>

      {/* ─── F. STICKY MOBILE SAVE BAR (ABOVE BOTTOM NAVIGATION) ─── */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-surface-200 px-4 py-2.5 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="min-w-0 pr-3">
          <p className="text-xs font-bold text-surface-900 truncate">
            {completeness}% Complete
          </p>
          <p className="text-[10px] text-surface-500 truncate">
            Tap to save preferences
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={saving}
          id="profile-save-mobile-sticky-btn"
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-60 min-h-[42px] active:scale-95 shrink-0"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          <span>{saving ? 'Saving…' : 'Save Changes'}</span>
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
