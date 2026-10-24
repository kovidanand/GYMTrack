import React, { useState, useEffect } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X, Check, Trash2, Loader2, AlertCircle } from 'lucide-react'
import type { FoodEntry, MealType } from '@/types/nutrition'
import { FoodQuantityInput } from './FoodQuantityInput'

interface EditFoodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: FoodEntry | null
  onUpdateEntry: (entryId: string, updates: Partial<FoodEntry>) => Promise<void>
  onDeleteEntry: (entryId: string) => Promise<void>
}

export function EditFoodModal({
  open,
  onOpenChange,
  entry,
  onUpdateEntry,
  onDeleteEntry,
}: EditFoodModalProps) {
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [foodName, setFoodName] = useState('')
  const [quantity, setQuantity] = useState<number>(1)
  const [unitLabel, setUnitLabel] = useState<string>('g')
  const [isMetricTotal, setIsMetricTotal] = useState<boolean>(true)
  const [perUnitRates, setPerUnitRates] = useState<{
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }>({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
  const [calories, setCalories] = useState<number>(0)
  const [protein, setProtein] = useState<number>(0)
  const [carbs, setCarbs] = useState<number>(0)
  const [fat, setFat] = useState<number>(0)
  const [fiber, setFiber] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Load entry data when modal opens
  useEffect(() => {
    if (entry) {
      setMealType(entry.meal_type)
      setFoodName(entry.food_name)
      setSaveError(null)

      const rawUnit = entry.serving_unit || 'g'
      setUnitLabel(rawUnit)

      // Determine if entry was logged as a total metric amount (g / ml) or item count
      const isMetric =
        rawUnit.toLowerCase() === 'g' ||
        rawUnit.toLowerCase() === 'grams' ||
        rawUnit.toLowerCase() === 'ml' ||
        (entry.serving_size > 1 && entry.servings_logged === 1)

      setIsMetricTotal(isMetric)

      const activeAmount = isMetric
        ? entry.serving_size || 100
        : entry.servings_logged || 1

      setQuantity(activeAmount)

      // Store base rates per 1 unit of quantity for live recalculation
      const safeAmount = Math.max(0.01, activeAmount)
      setPerUnitRates({
        calories: (entry.calories || 0) / safeAmount,
        protein: (entry.protein || 0) / safeAmount,
        carbs: (entry.carbs || 0) / safeAmount,
        fat: (entry.fat || 0) / safeAmount,
        fiber: (entry.fiber || 0) / safeAmount,
      })

      setCalories(entry.calories || 0)
      setProtein(entry.protein || 0)
      setCarbs(entry.carbs || 0)
      setFat(entry.fat || 0)
      setFiber(entry.fiber || 0)
    }
  }, [entry, open])

  if (!entry) return null

  // Live recalculation when quantity changes
  const handleQuantityChange = (newQty: number) => {
    const valid = Math.max(0.01, newQty)
    setQuantity(valid)
    setCalories(Math.round(perUnitRates.calories * valid))
    setProtein(Math.round(perUnitRates.protein * valid * 10) / 10)
    setCarbs(Math.round(perUnitRates.carbs * valid * 10) / 10)
    setFat(Math.round(perUnitRates.fat * valid * 10) / 10)
    setFiber(Math.round(perUnitRates.fiber * valid * 10) / 10)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !entry) return
    setIsSubmitting(true)
    setSaveError(null)

    try {
      const finalServingSize = isMetricTotal ? quantity : 1
      const finalServingsLogged = isMetricTotal ? 1 : quantity

      await onUpdateEntry(entry.id, {
        meal_type: mealType,
        food_name: foodName.trim(),
        serving_size: finalServingSize,
        serving_unit: unitLabel,
        servings_logged: finalServingsLogged,
        calories,
        protein,
        carbs,
        fat,
        fiber,
      })
      onOpenChange(false)
    } catch (err: unknown) {
      console.error('Failed to update food entry:', err)
      setSaveError(
        err instanceof Error ? err.message : 'Failed to update entry. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (isSubmitting || !entry) return
    if (!window.confirm(`Delete "${entry.food_name}" from your diary?`)) return
    setIsSubmitting(true)
    try {
      await onDeleteEntry(entry.id)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs animate-fade-in" />
        <RadixDialog.Content
          className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-5 animate-scale-in focus:outline-none"
          aria-describedby="edit-food-description"
        >
          <div className="flex items-center justify-between pb-3 border-b border-surface-200">
            <div>
              <RadixDialog.Title className="text-base font-black text-surface-900 tracking-tight">
                Edit Food Entry
              </RadixDialog.Title>
              <p id="edit-food-description" className="text-xs text-surface-400">
                Adjust amount, meal category, or nutrition values.
              </p>
            </div>
            <RadixDialog.Close asChild>
              <button className="p-1 rounded-lg text-surface-400 hover:text-surface-700">
                <X size={18} />
              </button>
            </RadixDialog.Close>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-4">
            {/* Meal Category */}
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">
                Meal Category
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMealType(m)}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      mealType === m
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Name */}
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">
                Food Name
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
                className="input-base text-sm font-semibold"
              />
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1" htmlFor="edit-entry-quantity-input">
                Amount ({unitLabel})
              </label>
              <FoodQuantityInput
                id="edit-entry-quantity-input"
                value={quantity}
                onChange={handleQuantityChange}
                unitLabel={unitLabel}
                unitType={isMetricTotal ? 'g' : 'serving'}
                className="w-full"
              />
            </div>

            {/* Nutritional Breakdown with direct-edit capability */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-surface-500 mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={e => setCalories(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-base text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-blue-600 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={e => setProtein(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="input-base text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-700 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={carbs}
                  onChange={e => setCarbs(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="input-base text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-rose-600 mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fat}
                  onChange={e => setFat(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="input-base text-xs font-bold text-center"
                />
              </div>
            </div>

            {/* Error banner */}
            {saveError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                id="delete-entry-modal-btn"
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                id="save-edit-entry-btn"
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
