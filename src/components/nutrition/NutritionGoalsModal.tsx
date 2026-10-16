import React, { useState, useEffect } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X, Check, Wand2, Loader2, Info } from 'lucide-react'
import type { NutritionGoals } from '@/types/nutrition'
import { calculateEstimatedGoalsFromProfile } from '@/lib/nutritionService'
import { useAuth } from '@/context/AuthContext'

interface NutritionGoalsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentGoals: NutritionGoals
  onSaveGoals: (updated: Partial<NutritionGoals>) => Promise<void>
}

export function NutritionGoalsModal({
  open,
  onOpenChange,
  currentGoals,
  onSaveGoals,
}: NutritionGoalsModalProps) {
  const { profile } = useAuth()
  const [calorieTarget, setCalorieTarget] = useState<number>(currentGoals.calorie_target)
  const [proteinTarget, setProteinTarget] = useState<number>(currentGoals.protein_target)
  const [carbTarget, setCarbTarget] = useState<number>(currentGoals.carb_target)
  const [fatTarget, setFatTarget] = useState<number>(currentGoals.fat_target)
  const [fiberTarget, setFiberTarget] = useState<number>(currentGoals.fiber_target)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setCalorieTarget(currentGoals.calorie_target)
      setProteinTarget(currentGoals.protein_target)
      setCarbTarget(currentGoals.carb_target)
      setFatTarget(currentGoals.fat_target)
      setFiberTarget(currentGoals.fiber_target)
      setInfoMessage(null)
    }
  }, [open, currentGoals])

  const handleAutoCalculate = () => {
    if (!profile) return
    const calculated = calculateEstimatedGoalsFromProfile(profile)
    setCalorieTarget(calculated.calorie_target)
    setProteinTarget(calculated.protein_target)
    setCarbTarget(calculated.carb_target)
    setFatTarget(calculated.fat_target)
    setFiberTarget(calculated.fiber_target)
    setInfoMessage(
      `Calculated from your profile (${profile.fitness_goal?.replace('_', ' ') || 'maintenance'}, ${profile.weight || 75}kg). You can customize any value below.`
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSaveGoals({
        calorie_target: Math.max(800, calorieTarget),
        protein_target: Math.max(20, proteinTarget),
        carb_target: Math.max(20, carbTarget),
        fat_target: Math.max(10, fatTarget),
        fiber_target: Math.max(5, fiberTarget),
        water_target: currentGoals.water_target,
      })
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
          className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg bg-white rounded-2xl shadow-2xl p-5 sm:p-6 animate-scale-in focus:outline-none"
          aria-describedby="goals-modal-description"
        >
          <div className="flex items-center justify-between pb-3 border-b border-surface-200">
            <div>
              <RadixDialog.Title className="text-base font-black text-surface-900 tracking-tight">
                Daily Nutrition Targets
              </RadixDialog.Title>
              <p id="goals-modal-description" className="text-xs text-surface-400">
                Personalize daily calories and macronutrient targets.
              </p>
            </div>
            <RadixDialog.Close asChild>
              <button className="p-1 rounded-lg text-surface-400 hover:text-surface-700">
                <X size={18} />
              </button>
            </RadixDialog.Close>
          </div>

          <form onSubmit={handleSave} className="space-y-4 pt-4">
            {/* Auto Calculator Prompt */}
            {profile && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-brand-50 border border-brand-200 gap-3">
                <div className="flex items-center gap-2 text-xs text-brand-900">
                  <Wand2 size={16} className="text-brand-600 flex-shrink-0" />
                  <span>Calculate targets automatically from your weight & fitness goal.</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoCalculate}
                  id="auto-calc-goals-btn"
                  className="px-2.5 py-1 text-xs font-bold bg-white text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-lg shadow-2xs whitespace-nowrap"
                >
                  Auto-Fill
                </button>
              </div>
            )}

            {infoMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-600">
                <Info size={14} className="text-brand-600 flex-shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-surface-700 mb-1">
                Daily Calorie Target (kcal)
              </label>
              <input
                type="number"
                required
                min="800"
                max="6000"
                step="50"
                value={calorieTarget}
                onChange={e => setCalorieTarget(parseInt(e.target.value) || 2000)}
                className="input-base text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-blue-700 mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  required
                  min="20"
                  max="400"
                  value={proteinTarget}
                  onChange={e => setProteinTarget(parseInt(e.target.value) || 150)}
                  className="input-base text-sm font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-amber-800 mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  required
                  min="20"
                  max="800"
                  value={carbTarget}
                  onChange={e => setCarbTarget(parseInt(e.target.value) || 200)}
                  className="input-base text-sm font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-700 mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max="250"
                  value={fatTarget}
                  onChange={e => setFatTarget(parseInt(e.target.value) || 65)}
                  className="input-base text-sm font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  max="100"
                  value={fiberTarget}
                  onChange={e => setFiberTarget(parseInt(e.target.value) || 30)}
                  className="input-base text-sm font-bold text-center"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                id="save-nutrition-goals-btn"
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                <span>Save Nutrition Goals</span>
              </button>
            </div>
          </form>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
