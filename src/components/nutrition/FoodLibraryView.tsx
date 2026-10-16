import React, { useState, useEffect, useMemo } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {
  Search,
  X,
  Plus,
  Check,
  Loader2,
  BookmarkPlus,
  UtensilsCrossed,
} from 'lucide-react'
import type { FoodSearchResult, MealType, FoodEntry } from '@/types/nutrition'
import { getFoodCatalog } from '@/lib/nutritionService'

interface FoodLibraryViewProps {
  userId: string
  selectedDate: string
  onLogFood: (entry: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onOpenCreateCustomFood?: () => void
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'proteins', label: 'Proteins' },
  { id: 'grains', label: 'Grains' },
  { id: 'indian_meals', label: 'Indian Meals' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'beverages', label: 'Beverages' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'custom', label: 'Custom Foods' },
]

export function FoodLibraryView({
  userId,
  selectedDate,
  onLogFood,
  onOpenCreateCustomFood,
}: FoodLibraryViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [foods, setFoods] = useState<FoodSearchResult[]>([])
  const [loading, setLoading] = useState(true)

  // Selected food for portion & logging modal
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [customServingSize, setCustomServingSize] = useState<number>(100)
  const [targetMeal, setTargetMeal] = useState<MealType>('breakfast')
  const [isLogging, setIsLogging] = useState(false)
  const [successToast, setSuccessToast] = useState<string | null>(null)

  // Fetch foods for category and search
  useEffect(() => {
    let isMounted = true
    setLoading(true)

    getFoodCatalog(activeCategory, searchQuery, userId)
      .then(items => {
        if (isMounted) setFoods(items)
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [activeCategory, searchQuery, userId])

  const handleOpenFoodModal = (food: FoodSearchResult) => {
    setSelectedFood(food)
    setQuantity(1)
    setCustomServingSize(food.serving_size || 100)
  }

  // Recalculated values based on quantity and serving size
  const calculatedNutrition = useMemo(() => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    const baseServing = selectedFood.serving_size || 1
    const factor = (quantity * customServingSize) / baseServing

    return {
      calories: Math.round(selectedFood.calories * factor),
      protein: Math.round(selectedFood.protein * factor * 10) / 10,
      carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
      fat: Math.round(selectedFood.fat * factor * 10) / 10,
      fiber: Math.round(selectedFood.fiber * factor * 10) / 10,
    }
  }, [selectedFood, quantity, customServingSize])

  const handleConfirmLog = async () => {
    if (!selectedFood || isLogging) return
    setIsLogging(true)

    try {
      await onLogFood({
        user_id: userId,
        date: selectedDate,
        meal_type: targetMeal,
        food_name: selectedFood.name,
        brand: selectedFood.brand,
        serving_size: customServingSize,
        serving_unit: selectedFood.serving_unit,
        servings_logged: quantity,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fat: calculatedNutrition.fat,
        fiber: calculatedNutrition.fiber,
        logged_at: new Date().toISOString(),
      })

      setSuccessToast(`Logged "${selectedFood.name}" to ${targetMeal.toUpperCase()}`)
      setSelectedFood(null)
      setTimeout(() => setSuccessToast(null), 3000)
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-surface-900 tracking-tight">
            Food Library
          </h2>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-0.5">
            Find a food, adjust your serving, and log it.
          </p>
        </div>

        {onOpenCreateCustomFood && (
          <button
            onClick={onOpenCreateCustomFood}
            id="create-custom-food-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <BookmarkPlus size={15} />
            <span>+ Custom Food</span>
          </button>
        )}
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-slide-up shadow-2xs">
          <Check size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search foods, dishes, or regional staples (e.g. Roti, Dal, Paneer, Apple, Oats)..."
          className="input-base pl-10 pr-10 py-2.5 text-sm rounded-xl"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-surface-400 hover:text-surface-700 rounded-md"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Horizontal Category Filters */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between text-xs text-surface-500 font-semibold px-1">
        <span>Showing {foods.length} {foods.length === 1 ? 'food' : 'foods'}</span>
        <span className="text-[11px] text-surface-400">Click any card to select portion & log</span>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-surface-400 flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
          <p className="text-xs font-medium">Loading food library...</p>
        </div>
      ) : foods.length === 0 ? (
        <div className="card p-12 text-center bg-white border border-surface-200 rounded-2xl space-y-2">
          <UtensilsCrossed size={32} className="mx-auto text-surface-300" />
          <h4 className="text-sm font-bold text-surface-800">No foods found</h4>
          <p className="text-xs text-surface-500 max-w-sm mx-auto">
            We couldn't find any items matching "{searchQuery}" in this category. You can create a custom food item anytime.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {foods.map(food => (
            <div
              key={food.id}
              onClick={() => handleOpenFoodModal(food)}
              className="card p-4 bg-white border border-surface-200 rounded-2xl hover:border-emerald-300 hover:shadow-card cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="text-sm font-bold text-surface-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {food.name}
                  </h4>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                    {food.calories} kcal
                  </span>
                </div>

                <p className="text-[11px] text-surface-500 font-medium">
                  {food.serving_size} {food.serving_unit}
                  {food.brand && (
                    <span className="text-surface-400 ml-1.5">· {food.brand}</span>
                  )}
                </p>
              </div>

              {/* Macro Chips */}
              <div className="grid grid-cols-3 gap-1 pt-3 mt-3 border-t border-surface-100 text-center text-[10px] font-bold">
                <div className="p-1 rounded-lg bg-blue-50 text-blue-700">
                  <span>{food.protein}g P</span>
                </div>
                <div className="p-1 rounded-lg bg-amber-50 text-amber-800">
                  <span>{food.carbs}g C</span>
                </div>
                <div className="p-1 rounded-lg bg-rose-50 text-rose-700">
                  <span>{food.fat}g F</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Serving Selection and Logging Modal */}
      {selectedFood && (
        <RadixDialog.Root open={!!selectedFood} onOpenChange={open => !open && setSelectedFood(null)}>
          <RadixDialog.Portal>
            <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs animate-fade-in" />
            <RadixDialog.Content
              className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md bg-white rounded-2xl shadow-2xl p-5 animate-scale-in focus:outline-none"
              aria-describedby="serving-modal-desc"
            >
              <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                <div>
                  <RadixDialog.Title className="text-base font-black text-surface-900 tracking-tight">
                    {selectedFood.name}
                  </RadixDialog.Title>
                  <p id="serving-modal-desc" className="text-xs text-surface-400">
                    Standard: {selectedFood.serving_size} {selectedFood.serving_unit}
                  </p>
                </div>
                <RadixDialog.Close asChild>
                  <button className="p-1 text-surface-400 hover:text-surface-700 rounded-lg">
                    <X size={18} />
                  </button>
                </RadixDialog.Close>
              </div>

              <div className="space-y-4 pt-4">
                {/* Meal Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    Log To Meal
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTargetMeal(m)}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          targetMeal === m
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Quantity Presets */}
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    Number of Servings
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[0.5, 1, 1.5, 2].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                          quantity === preset
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                        }`}
                      >
                        {preset}x
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-surface-500">Custom Multiplier</span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={quantity}
                        onChange={e => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                        className="input-base text-sm py-1.5"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-surface-500">
                        Serving Size ({selectedFood.serving_unit})
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={customServingSize}
                        onChange={e => setCustomServingSize(Math.max(1, parseFloat(e.target.value) || 100))}
                        className="input-base text-sm py-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Recalculated Nutritional Breakdown */}
                <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200 text-center">
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-surface-400">Calories</span>
                      <p className="text-base font-black text-surface-900">{calculatedNutrition.calories}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-600">Protein</span>
                      <p className="text-base font-black text-surface-900">{calculatedNutrition.protein}g</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-700">Carbs</span>
                      <p className="text-base font-black text-surface-900">{calculatedNutrition.carbs}g</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-rose-600">Fat</span>
                      <p className="text-base font-black text-surface-900">{calculatedNutrition.fat}g</p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleConfirmLog}
                  disabled={isLogging}
                  id="library-log-food-confirm-btn"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isLogging ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  <span>Log Food to {targetMeal.toUpperCase()}</span>
                </button>
              </div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        </RadixDialog.Root>
      )}
    </div>
  )
}
