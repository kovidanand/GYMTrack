import React, { useState, useEffect, useMemo } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {
  Search,
  X,
  Plus,
  Loader2,
  BookmarkPlus,
  UtensilsCrossed,
  AlertCircle,
} from 'lucide-react'
import type { FoodSearchResult, MealType, FoodEntry } from '@/types/nutrition'
import {
  getFoodCatalog,
  getFoodServingUnits,
  calculateScaledNutrients,
  convertUnitQuantity,
  type ServingUnitOption,
} from '@/lib/nutritionService'

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
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [targetMeal, setTargetMeal] = useState<MealType>('breakfast')
  const [isLogging, setIsLogging] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
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

  // Get available serving units for the selected food
  const servingUnits: ServingUnitOption[] = useMemo(() => {
    if (!selectedFood) return []
    return getFoodServingUnits(selectedFood)
  }, [selectedFood])

  // Current active unit option
  const activeUnitOption: ServingUnitOption = useMemo(() => {
    if (servingUnits.length === 0) {
      return {
        unit: 'serving',
        label: '1 Serving',
        shortLabel: 'serving',
        multiplier: 1.0,
        isDefault: true,
      }
    }
    return servingUnits.find(u => u.unit === selectedUnit) || servingUnits[0]
  }, [servingUnits, selectedUnit])

  // Open modal handler with clean default unit & quantity initialization
  const handleOpenFoodModal = (food: FoodSearchResult) => {
    setSelectedFood(food)
    setSaveError(null)
    const units = getFoodServingUnits(food)
    const def = units.find(u => u.isDefault) || units[0]
    setSelectedUnit(def?.unit || 'serving')

    // If default unit is grams/ml, set sensible default quantity (e.g. 100)
    if (def?.unit === 'g' || def?.unit === 'ml') {
      setQuantity(food.serving_size && food.serving_size > 1 ? food.serving_size : 100)
    } else {
      setQuantity(1)
    }
  }

  // Smart unit switching preserving exact total quantity
  const handleUnitChange = (newUnit: string) => {
    const nextOption = servingUnits.find(u => u.unit === newUnit)
    if (!nextOption) return
    const converted = convertUnitQuantity(activeUnitOption, nextOption, quantity)
    setSelectedUnit(newUnit)
    setQuantity(converted)
  }

  // Live centralized scaled calculation
  const calculatedNutrition = useMemo(() => {
    if (!selectedFood) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        saturatedFat: null,
        sugar: null,
        sodiumMg: null,
        quantity: 1,
        unit: 'serving',
        unitLabel: '1 Serving',
        shortLabel: 'serving',
        portionSummary: '1 serving',
        householdEquivalence: '',
        isApproximateEquivalence: false,
        totalMultiplier: 1,
      }
    }
    return calculateScaledNutrients(selectedFood, activeUnitOption, quantity)
  }, [selectedFood, activeUnitOption, quantity])

  // Confirm and log to Supabase
  const handleConfirmLog = async () => {
    if (!selectedFood || isLogging) return
    setIsLogging(true)
    setSaveError(null)

    try {
      const isMetricTotal =
        calculatedNutrition.unit === 'g' ||
        calculatedNutrition.unit === 'ml' ||
        activeUnitOption.gramsEquivalent != null

      const servingSize = isMetricTotal ? calculatedNutrition.quantity : 1
      const servingsLogged = isMetricTotal ? 1 : calculatedNutrition.quantity
      const servingUnit = calculatedNutrition.unitLabel

      await onLogFood({
        user_id: userId,
        date: selectedDate,
        meal_type: targetMeal,
        food_name: selectedFood.name,
        brand: selectedFood.brand,
        serving_size: servingSize,
        serving_unit: servingUnit,
        servings_logged: servingsLogged,
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbs: calculatedNutrition.carbs,
        fat: calculatedNutrition.fat,
        fiber: calculatedNutrition.fiber,
        saturated_fat: calculatedNutrition.saturatedFat ?? undefined,
        sugar: calculatedNutrition.sugar ?? undefined,
        sodium_mg: calculatedNutrition.sodiumMg ?? undefined,
        logged_at: new Date().toISOString(),
      })

      setSuccessToast(`Logged "${selectedFood.name}" to ${targetMeal.toUpperCase()}`)
      setSelectedFood(null)
      setTimeout(() => setSuccessToast(null), 3000)
    } catch (err: unknown) {
      console.error('Failed to log food from library:', err)
      setSaveError(
        err instanceof Error ? err.message : 'Failed to log food. Please try again.'
      )
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <BookmarkPlus size={15} />
            <span>Create Custom Food</span>
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by food name, Hindi alias, or category (e.g. apple, dal, paneer, oats)..."
          id="food-library-search-input"
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-surface-200 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 p-0.5"
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Horizontal Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            id={`filter-category-${cat.id}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all select-none ${
              activeCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50 hover:text-surface-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Count & Success Toast */}
      <div className="flex items-center justify-between text-xs text-surface-500 font-medium px-1">
        <span>
          Showing {foods.length} {foods.length === 1 ? 'food' : 'foods'}
        </span>
        {successToast && (
          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 animate-fade-in">
            {successToast}
          </span>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="py-20 text-center text-surface-400 flex flex-col items-center justify-center gap-2">
          <Loader2 size={28} className="animate-spin text-emerald-600" />
          <p className="text-xs font-semibold">Loading verified food catalog...</p>
        </div>
      ) : foods.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center text-surface-400 card p-6 bg-white border border-surface-200 rounded-2xl">
          <UtensilsCrossed size={36} className="mx-auto mb-2 text-surface-300" />
          <p className="text-sm font-bold text-surface-700">No matching foods found</p>
          <p className="text-xs text-surface-400 mt-0.5">
            Try adjusting your search query or create a custom food entry.
          </p>
        </div>
      ) : (
        /* Responsive 3-Column Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {foods.map(food => (
            <div
              key={food.id}
              onClick={() => handleOpenFoodModal(food)}
              className="group p-4 rounded-2xl bg-white border border-surface-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3 text-left"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-surface-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {food.name}
                  </h3>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 whitespace-nowrap">
                    {food.calories} kcal
                  </span>
                </div>

                <p className="text-[11px] text-surface-400 mt-0.5">
                  Standard: {food.serving_size} {food.serving_unit}
                </p>
              </div>

              {/* Macro Indicators */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
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

      {/* ─── Serving Selection and Logging Modal ─── */}
      {selectedFood && (
        <RadixDialog.Root
          open={!!selectedFood}
          onOpenChange={open => !open && setSelectedFood(null)}
        >
          <RadixDialog.Portal>
            <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs animate-fade-in" />
            <RadixDialog.Content
              className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-5 sm:p-6 animate-scale-in focus:outline-none"
              aria-describedby="serving-modal-desc"
            >
              <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                <div>
                  <RadixDialog.Title className="text-base font-black text-surface-900 tracking-tight">
                    {selectedFood.name}
                  </RadixDialog.Title>
                  <p id="serving-modal-desc" className="text-xs text-surface-500 font-medium">
                    Adjust quantity and unit below. Values update live.
                  </p>
                </div>
                <RadixDialog.Close asChild>
                  <button className="p-1 text-surface-400 hover:text-surface-700 rounded-lg">
                    <X size={18} />
                  </button>
                </RadixDialog.Close>
              </div>

              <div className="space-y-4 pt-4">
                {/* 1. Meal Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1.5">
                    Log To Meal
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTargetMeal(m)}
                        className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
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

                {/* 2. Unified Quantity + Unit Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-surface-700">
                      Amount
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-800">
                      {calculatedNutrition.portionSummary}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5 sm:col-span-5 relative">
                      <input
                        type="number"
                        min="0.01"
                        step={activeUnitOption.unit === 'g' || activeUnitOption.unit === 'ml' ? '1' : '0.1'}
                        value={quantity}
                        onChange={e => {
                          const val = parseFloat(e.target.value)
                          setQuantity(isNaN(val) ? 1 : Math.max(0.01, val))
                        }}
                        className="w-full input-base text-base font-bold py-2 px-3 text-surface-900 border-surface-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                        placeholder="1"
                      />
                    </div>
                    <div className="col-span-7 sm:col-span-7 relative">
                      <select
                        value={activeUnitOption.unit}
                        onChange={e => handleUnitChange(e.target.value)}
                        className="w-full input-base text-xs font-bold py-2.5 pl-3 pr-8 bg-white border-surface-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl cursor-pointer truncate"
                      >
                        {servingUnits.map(opt => (
                          <option key={opt.unit} value={opt.unit}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Equivalent household measure */}
                  {calculatedNutrition.householdEquivalence && (
                    <p className="text-[11px] text-surface-500 font-medium flex items-center gap-1.5 pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>
                        {calculatedNutrition.isApproximateEquivalence ? '≈ ' : ''}
                        {calculatedNutrition.householdEquivalence}
                      </span>
                    </p>
                  )}
                </div>

                {/* 3. Live Recalculated Nutritional Breakdown */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50/60 to-teal-50/40 border border-emerald-200/80">
                  <div className="grid grid-cols-5 gap-1.5 text-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-surface-500 block truncate">
                        Calories
                      </span>
                      <p className="text-sm sm:text-base font-black text-surface-900">
                        {calculatedNutrition.calories}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-blue-600 block truncate">
                        Protein
                      </span>
                      <p className="text-sm sm:text-base font-black text-surface-900">
                        {calculatedNutrition.protein}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-700 block truncate">
                        Carbs
                      </span>
                      <p className="text-sm sm:text-base font-black text-surface-900">
                        {calculatedNutrition.carbs}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-rose-600 block truncate">
                        Fat
                      </span>
                      <p className="text-sm sm:text-base font-black text-surface-900">
                        {calculatedNutrition.fat}g
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 block truncate">
                        Fiber
                      </span>
                      <p className="text-sm sm:text-base font-black text-surface-900">
                        {calculatedNutrition.fiber}g
                      </p>
                    </div>
                  </div>

                  {/* Secondary Nutrients when available (or '—' when unavailable) */}
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/60 grid grid-cols-3 gap-2 text-[11px] text-surface-600">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-surface-500">Sat Fat:</span>
                      <span className="font-semibold text-surface-800">
                        {calculatedNutrition.saturatedFat !== null
                          ? `${calculatedNutrition.saturatedFat}g`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-surface-500">Sugar:</span>
                      <span className="font-semibold text-surface-800">
                        {calculatedNutrition.sugar !== null
                          ? `${calculatedNutrition.sugar}g`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-surface-500">Sodium:</span>
                      <span className="font-semibold text-surface-800">
                        {calculatedNutrition.sodiumMg !== null
                          ? `${calculatedNutrition.sodiumMg}mg`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Error Alert */}
                {saveError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* 4. Primary Action Button */}
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
