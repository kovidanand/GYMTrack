import React, { useState, useEffect } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X, Check, Trash2, Loader2 } from 'lucide-react'
import type { FoodEntry, MealType } from '@/types/nutrition'

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
  const [servingSize, setServingSize] = useState<number>(100)
  const [servingUnit, setServingUnit] = useState('g')
  const [servingsLogged, setServingsLogged] = useState<number>(1)
  const [calories, setCalories] = useState<number>(0)
  const [protein, setProtein] = useState<number>(0)
  const [carbs, setCarbs] = useState<number>(0)
  const [fat, setFat] = useState<number>(0)
  const [fiber, setFiber] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load entry data when modal opens
  useEffect(() => {
    if (entry) {
      setMealType(entry.meal_type)
      setFoodName(entry.food_name)
      setServingSize(entry.serving_size || 100)
      setServingUnit(entry.serving_unit || 'g')
      setServingsLogged(entry.servings_logged || 1)
      setCalories(entry.calories || 0)
      setProtein(entry.protein || 0)
      setCarbs(entry.carbs || 0)
      setFat(entry.fat || 0)
      setFiber(entry.fiber || 0)
    }
  }, [entry, open])

  if (!entry) return null

  // Proportionally adjust calories & macros if servings change
  const handleServingsChange = (newServings: number) => {
    const valid = Math.max(0.1, newServings)
    const ratio = valid / (servingsLogged || 1)
    setServingsLogged(valid)
    setCalories(Math.round(calories * ratio))
    setProtein(Math.round(protein * ratio * 10) / 10)
    setCarbs(Math.round(carbs * ratio * 10) / 10)
    setFat(Math.round(fat * ratio * 10) / 10)
    setFiber(Math.round(fiber * ratio * 10) / 10)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onUpdateEntry(entry.id, {
        meal_type: mealType,
        food_name: foodName.trim(),
        serving_size: servingSize,
        serving_unit: servingUnit,
        servings_logged: servingsLogged,
        calories,
        protein,
        carbs,
        fat,
        fiber,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (isSubmitting) return
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
                Adjust serving size, meal category, or nutrition values.
              </p>
            </div>
            <RadixDialog.Close asChild>
              <button className="p-1 rounded-lg text-surface-400 hover:text-surface-700">
                <X size={18} />
              </button>
            </RadixDialog.Close>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-4">
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
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">
                Food Name
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={e => setFoodName(e.target.value)}
                className="input-base text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1">
                  Servings Count
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={servingsLogged}
                  onChange={e => handleServingsChange(parseFloat(e.target.value) || 1)}
                  className="input-base text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-700 mb-1">
                  Serving Size ({servingUnit})
                </label>
                <input
                  type="number"
                  value={servingSize}
                  onChange={e => setServingSize(parseFloat(e.target.value) || 100)}
                  className="input-base text-sm"
                />
              </div>
            </div>

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
                className="btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
