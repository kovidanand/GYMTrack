import React, { useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Utensils,
  Plus,
  Check,
  Flame,
  HelpCircle,
} from 'lucide-react'
import type { FoodEntry, MealType } from '@/types/nutrition'
import { queryNutritionAssistant } from '@/lib/nutritionService'

interface SuggestedFoodItem {
  name: string
  portion: string
  calories: number
  protein: number
  carbs: number
  fat: number
  category: string
}

interface NutritionAssistantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  selectedDate: string
  todayTotals: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  goals: {
    calorie_target: number
    protein_target: number
    carb_target: number
    fat_target: number
  }
  entries: FoodEntry[]
  onLogRecommendedFood: (entry: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

const QUICK_QUESTIONS = [
  'How much protein have I consumed today?',
  'How many calories remain in my budget?',
  'Which foods have I logged today?',
  'Suggest a high-protein meal to reach my target',
  'Compare my intake over the last 7 days',
]

export function NutritionAssistantModal({
  open,
  onOpenChange,
  userId,
  selectedDate,
  todayTotals,
  goals,
  entries,
  onLogRecommendedFood,
}: NutritionAssistantModalProps) {
  const [inputQuery, setInputQuery] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; foods?: SuggestedFoodItem[] }>>([
    {
      role: 'assistant',
      text: `Hello! I am your NutriTrack Assistant. Today you have consumed ${todayTotals.calories} / ${goals.calorie_target} kcal and ${todayTotals.protein}g / ${goals.protein_target}g protein. How can I help with your nutrition today?`,
    },
  ])
  const [isAnswering, setIsAnswering] = useState(false)
  const [loggingFoodId, setLoggingFoodId] = useState<string | null>(null)
  const [loggedFoodNames, setLoggedFoodNames] = useState<Set<string>>(new Set())

  const handleAsk = async (queryText: string) => {
    const q = queryText.trim()
    if (!q || isAnswering) return

    setMessages(prev => [...prev, { role: 'user', text: q }])
    setInputQuery('')
    setIsAnswering(true)

    try {
      const result = await queryNutritionAssistant(q, {
        todayCalories: todayTotals.calories,
        targetCalories: goals.calorie_target,
        todayProtein: todayTotals.protein,
        targetProtein: goals.protein_target,
        todayCarbs: todayTotals.carbs,
        targetCarbs: goals.carb_target,
        todayFat: todayTotals.fat,
        targetFat: goals.fat_target,
        loggedFoods: entries.map(e => ({
          name: e.food_name,
          meal: e.meal_type,
          calories: e.calories,
          protein: e.protein,
        })),
      })

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: result.answer,
          foods: result.suggestedFoods,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Unable to process your question right now. You can check your daily totals or search the Food Library directly.',
        },
      ])
    } finally {
      setIsAnswering(false)
    }
  }

  const handleLogSuggested = async (food: SuggestedFoodItem, meal: MealType = 'snack') => {
    setLoggingFoodId(food.name)
    try {
      await onLogRecommendedFood({
        user_id: userId,
        date: selectedDate,
        meal_type: meal,
        food_name: food.name,
        serving_size: 1,
        serving_unit: food.portion,
        servings_logged: 1,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: 0,
        logged_at: new Date().toISOString(),
      })
      setLoggedFoodNames(prev => new Set(prev).add(food.name))
    } finally {
      setLoggingFoodId(null)
    }
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs animate-fade-in" />
        <RadixDialog.Content
          className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-scale-in focus:outline-none overflow-hidden"
          aria-describedby="assistant-modal-desc"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-200 bg-gradient-to-r from-emerald-50/60 to-teal-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles size={16} />
              </div>
              <div>
                <RadixDialog.Title className="text-sm font-black text-surface-900 tracking-tight flex items-center gap-1.5">
                  <span>NutriTrack AI Assistant</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                    Context-Aware
                  </span>
                </RadixDialog.Title>
                <p id="assistant-modal-desc" className="text-[11px] text-surface-500 font-medium">
                  Grounded in your authentic daily food logs & energy goals.
                </p>
              </div>
            </div>

            <RadixDialog.Close asChild>
              <button className="p-1 rounded-lg text-surface-400 hover:text-surface-700">
                <X size={18} />
              </button>
            </RadixDialog.Close>
          </div>

          {/* Quick Questions Strip */}
          <div className="p-2.5 bg-surface-50 border-b border-surface-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] font-bold text-surface-400 whitespace-nowrap pl-1 flex items-center gap-1">
              <HelpCircle size={12} />
              <span>Ask:</span>
            </span>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(q)}
                disabled={isAnswering}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-900 bg-white hover:bg-emerald-50 border border-emerald-200/80 whitespace-nowrap shadow-2xs active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[50vh]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white shadow-xs rounded-br-xs'
                      : 'bg-surface-100 text-surface-800 rounded-bl-xs whitespace-pre-line'
                  }`}
                >
                  {m.text}
                </div>

                {/* Recommended Food Cards if any */}
                {m.foods && m.foods.length > 0 && (
                  <div className="mt-2 w-full space-y-2 max-w-[90%]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                      Recommended High-Protein Foods
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {m.foods.map((food, fIdx) => {
                        const isLogged = loggedFoodNames.has(food.name)
                        return (
                          <div
                            key={fIdx}
                            className="p-2.5 rounded-xl bg-white border border-emerald-200/90 shadow-2xs flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-surface-900 truncate">
                                {food.name}
                              </h5>
                              <p className="text-[10px] text-surface-500">
                                {food.portion} • {food.calories} kcal • <span className="font-bold text-emerald-700">{food.protein}g protein</span>
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleLogSuggested(food, 'snack')}
                              disabled={isLogged || loggingFoodId === food.name}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all flex-shrink-0 ${
                                isLogged
                                  ? 'bg-surface-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                              }`}
                            >
                              {loggingFoodId === food.name ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : isLogged ? (
                                <>
                                  <Check size={12} />
                                  <span>Logged</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={12} />
                                  <span>Log Food</span>
                                </>
                              )}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isAnswering && (
              <div className="flex items-center gap-2 text-xs text-surface-400 p-2">
                <Loader2 size={14} className="animate-spin text-emerald-600" />
                <span>Checking your food logs and nutrition context...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault()
              handleAsk(inputQuery)
            }}
            className="p-3 border-t border-surface-200 bg-surface-50 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask anything about today's nutrition, macros, or foods..."
              className="flex-1 input-base text-xs py-2 bg-white"
              disabled={isAnswering}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isAnswering}
              className="p-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs disabled:opacity-50"
              aria-label="Send query"
            >
              <Send size={15} />
            </button>
          </form>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
