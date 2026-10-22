import React, { useState, useEffect, useRef, useMemo } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {
  X,
  Search,
  Sparkles,
  Plus,
  Loader2,
  Camera,
  Check,
  BookmarkPlus,
  ChevronRight,
  Info,
  AlertTriangle,
} from 'lucide-react'
import type { FoodEntry, MealType, FoodSearchResult } from '@/types/nutrition'
import {
  searchFoods,
  addCustomFood,
  getFoodServingUnits,
  calculateScaledNutrients,
  convertUnitQuantity,
  processFoodImage,
  analyzeMealPhoto,
  type ServingUnitOption,
} from '@/lib/nutritionService'
import { emitGymtrackEvent } from '@/lib/events'

interface AddFoodModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  dateStr: string
  initialMealType: MealType
  onAddEntry: (entry: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

type TabType = 'search' | 'quick' | 'custom' | 'scanner'

export function AddFoodModal({
  open,
  onOpenChange,
  userId,
  dateStr,
  initialMealType,
  onAddEntry,
}: AddFoodModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('search')
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMealType)

  // Sync initial meal type when modal opens
  useEffect(() => {
    if (open) {
      setSelectedMeal(initialMealType)
      setActiveTab('search')
      setSelectedFood(null)
      setSearchQuery('')
    }
  }, [open, initialMealType])

  // ─── Tab 1: Search State ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<string>('')
  const [servingQuantity, setServingQuantity] = useState<number>(1)
  const [isAdding, setIsAdding] = useState(false)

  // Debounced search
  useEffect(() => {
    let active = true
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await searchFoods(searchQuery, userId)
        if (active) setSearchResults(res)
      } catch (err) {
        console.error(err)
      } finally {
        if (active) setIsSearching(false)
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [searchQuery, userId])

  const servingUnits = useMemo(
    () => (selectedFood ? getFoodServingUnits(selectedFood) : []),
    [selectedFood]
  )

  const activeUnitOption: ServingUnitOption = useMemo(() => {
    if (servingUnits.length === 0) {
      return {
        unit: 'serving',
        label: '1 Serving',
        shortLabel: 'serving',
        multiplier: 1,
        isDefault: true,
      }
    }
    return servingUnits.find(u => u.unit === selectedUnit) || servingUnits[0]
  }, [servingUnits, selectedUnit])

  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSelectFood = (food: FoodSearchResult) => {
    setSelectedFood(food)
    setSaveError(null)
    const units = getFoodServingUnits(food)
    const def = units.find(u => u.isDefault) || units[0]
    const unitKey = def?.unit || 'serving'
    setSelectedUnit(unitKey)

    // Set sensible default amount
    const nameLower = food.name.toLowerCase()
    if (unitKey === 'g') {
      if (nameLower.includes('banana')) setServingQuantity(118)
      else if (nameLower.includes('rice')) setServingQuantity(150)
      else if (nameLower.includes('oats')) setServingQuantity(50)
      else if (nameLower.includes('chicken') || nameLower.includes('fish') || nameLower.includes('paneer')) setServingQuantity(100)
      else if (food.serving_size && food.serving_size > 0 && food.serving_unit.toLowerCase() === 'g') setServingQuantity(food.serving_size)
      else setServingQuantity(100)
    } else if (unitKey === 'ml') {
      setServingQuantity(250)
    } else {
      setServingQuantity(1)
    }
  }

  const handleUnitChange = (newUnit: string) => {
    const nextOption = servingUnits.find(u => u.unit === newUnit)
    if (!nextOption) return
    const converted = convertUnitQuantity(activeUnitOption, nextOption, servingQuantity)
    setSelectedUnit(newUnit)
    setServingQuantity(converted)
  }

  const scaledSearchNutrients = useMemo(() => {
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
        unitLabel: 'serving',
        shortLabel: 'serving',
        portionSummary: '',
        householdEquivalence: '',
        isApproximateEquivalence: false,
        totalMultiplier: 1,
      }
    }
    return calculateScaledNutrients(selectedFood, activeUnitOption, servingQuantity)
  }, [selectedFood, activeUnitOption, servingQuantity])

  const handleConfirmSearchAdd = async () => {
    if (!selectedFood || isAdding) return
    setIsAdding(true)
    setSaveError(null)
    try {
      const isMetric = activeUnitOption.unit === 'g' || activeUnitOption.unit === 'ml'
      await onAddEntry({
        user_id: userId,
        date: dateStr,
        meal_type: selectedMeal,
        food_name: selectedFood.name,
        brand: selectedFood.brand,
        serving_size: isMetric ? scaledSearchNutrients.quantity : 1,
        serving_unit: activeUnitOption.shortLabel || activeUnitOption.label,
        servings_logged: isMetric ? 1 : scaledSearchNutrients.quantity,
        calories: scaledSearchNutrients.calories,
        protein: scaledSearchNutrients.protein,
        carbs: scaledSearchNutrients.carbs,
        fat: scaledSearchNutrients.fat,
        fiber: scaledSearchNutrients.fiber,
        saturated_fat: scaledSearchNutrients.saturatedFat,
        sugar: scaledSearchNutrients.sugar,
        sodium_mg: scaledSearchNutrients.sodiumMg,
        logged_at: new Date().toISOString(),
      })
      emitGymtrackEvent('gymtrack:food_logged', { date: dateStr, calories: scaledSearchNutrients.calories })
      window.dispatchEvent(new CustomEvent('gymtrack:food_logged', { detail: { date: dateStr } }))
      setSelectedFood(null)
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save food log entry. Please check your connection and try again.'
      setSaveError(msg)
    } finally {
      setIsAdding(false)
    }
  }

  // ─── Tab 2: Quick Add State ────────────────────────────────────────────────
  const [quickName, setQuickName] = useState('')
  const [quickCalories, setQuickCalories] = useState('')
  const [quickProtein, setQuickProtein] = useState('')
  const [quickCarbs, setQuickCarbs] = useState('')
  const [quickFat, setQuickFat] = useState('')
  const [quickFiber, setQuickFiber] = useState('')

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickName.trim() || !quickCalories || isAdding) return
    setIsAdding(true)
    try {
      await onAddEntry({
        user_id: userId,
        date: dateStr,
        meal_type: selectedMeal,
        food_name: quickName.trim(),
        brand: 'Quick Add',
        serving_size: 1,
        serving_unit: 'serving',
        servings_logged: 1,
        calories: Math.max(0, parseInt(quickCalories, 10) || 0),
        protein: Math.max(0, parseFloat(quickProtein) || 0),
        carbs: Math.max(0, parseFloat(quickCarbs) || 0),
        fat: Math.max(0, parseFloat(quickFat) || 0),
        fiber: Math.max(0, parseFloat(quickFiber) || 0),
        logged_at: new Date().toISOString(),
      })
      setQuickName('')
      setQuickCalories('')
      setQuickProtein('')
      setQuickCarbs('')
      setQuickFat('')
      setQuickFiber('')
      onOpenChange(false)
    } finally {
      setIsAdding(false)
    }
  }

  // ─── Tab 3: Custom Food State ──────────────────────────────────────────────
  const [customName, setCustomName] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [customServingSize, setCustomServingSize] = useState('100')
  const [customServingUnit, setCustomServingUnit] = useState('g')
  const [customCalories, setCustomCalories] = useState('')
  const [customProtein, setCustomProtein] = useState('')
  const [customCarbs, setCustomCarbs] = useState('')
  const [customFat, setCustomFat] = useState('')
  const [customFiber, setCustomFiber] = useState('')
  const [saveAndLog, setSaveAndLog] = useState(true)

  const handleCustomFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim() || !customCalories || isAdding) return
    setIsAdding(true)
    try {
      const createdFood = await addCustomFood(userId, {
        user_id: userId,
        name: customName.trim(),
        brand: customBrand.trim() || null,
        serving_size: parseFloat(customServingSize) || 100,
        serving_unit: customServingUnit.trim() || 'g',
        calories: Math.max(0, parseFloat(customCalories) || 0),
        protein: Math.max(0, parseFloat(customProtein) || 0),
        carbs: Math.max(0, parseFloat(customCarbs) || 0),
        fat: Math.max(0, parseFloat(customFat) || 0),
        fiber: Math.max(0, parseFloat(customFiber) || 0),
      })

      if (saveAndLog) {
        await onAddEntry({
          user_id: userId,
          date: dateStr,
          meal_type: selectedMeal,
          food_name: createdFood.name,
          brand: createdFood.brand,
          serving_size: createdFood.serving_size,
          serving_unit: createdFood.serving_unit,
          servings_logged: 1,
          calories: createdFood.calories,
          protein: createdFood.protein,
          carbs: createdFood.carbs,
          fat: createdFood.fat,
          fiber: createdFood.fiber,
          logged_at: new Date().toISOString(),
        })
      }

      setCustomName('')
      setCustomBrand('')
      setCustomCalories('')
      setCustomProtein('')
      setCustomCarbs('')
      setCustomFat('')
      setCustomFiber('')
      onOpenChange(false)
    } finally {
      setIsAdding(false)
    }
  }

  // ─── Tab 4: AI Food Scanner State ──────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  interface ScannedMealItem {
    id: string
    name: string
    portion: string
    servingSize: number
    servingUnit: string
    quantity: number
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    confidence: 'high' | 'medium' | 'low'
    notes: string
    baseCalories: number
    baseProtein: number
    baseCarbs: number
    baseFat: number
    baseFiber: number
    isCatalogMatch?: boolean
  }
  const [scanItems, setScanItems] = useState<ScannedMealItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setScanError(null)
    setScanItems([])

    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRunAiScan = async () => {
    if (!imageFile || isScanning) return
    setIsScanning(true)
    setScanError(null)

    try {
      const { base64, mimeType } = await processFoodImage(imageFile)
      const res = await analyzeMealPhoto(base64, mimeType)

      if (!res.isFood || !res.items || res.items.length === 0) {
        setScanError(
          res.overallNotes ||
            'No recognizable food was detected in this photo. Please upload a clear photo of your meal.'
        )
        return
      }

      const validated: ScannedMealItem[] = res.items.map((it, idx) => {
        const qty = it.quantity || 1
        return {
          id: it.id || `scanned_${idx}`,
          name: it.name,
          portion: it.portion || `${it.servingSize} ${it.servingUnit}`,
          servingSize: it.servingSize || 100,
          servingUnit: it.servingUnit || 'g',
          quantity: qty,
          calories: it.calories,
          protein: it.protein,
          carbs: it.carbs,
          fat: it.fat,
          fiber: it.fiber || 0,
          confidence: it.confidence || 'medium',
          notes: it.notes || res.overallNotes || 'Portion estimated from visual analysis.',
          baseCalories: it.calories / qty,
          baseProtein: it.protein / qty,
          baseCarbs: it.carbs / qty,
          baseFat: it.fat / qty,
          baseFiber: (it.fiber || 0) / qty,
          isCatalogMatch: it.isCatalogMatch,
        }
      })

      setScanItems(validated)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Meal analysis is temporarily unavailable.'
      setScanError(msg)
    } finally {
      setIsScanning(false)
    }
  }

  const handleUpdateScanItem = (id: string, updates: Partial<ScannedMealItem>) => {
    setScanItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it
        const updated = { ...it, ...updates }
        if (updates.quantity !== undefined) {
          const q = Math.max(0.1, Number(updates.quantity) || 1)
          updated.quantity = q
          updated.calories = Math.max(0, Math.round(it.baseCalories * q))
          updated.protein = Math.max(0, Math.round(it.baseProtein * q * 10) / 10)
          updated.carbs = Math.max(0, Math.round(it.baseCarbs * q * 10) / 10)
          updated.fat = Math.max(0, Math.round(it.baseFat * q * 10) / 10)
          updated.fiber = Math.max(0, Math.round(it.baseFiber * q * 10) / 10)
        }
        return updated
      })
    )
  }

  const handleDeleteScanItem = (id: string) => {
    setScanItems(prev => prev.filter(it => it.id !== id))
  }

  const scanMealTotals = useMemo(() => {
    let calories = 0
    let protein = 0
    let carbs = 0
    let fat = 0
    let fiber = 0
    for (const it of scanItems) {
      calories += it.calories || 0
      protein += it.protein || 0
      carbs += it.carbs || 0
      fat += it.fat || 0
      fiber += it.fiber || 0
    }
    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
    }
  }, [scanItems])

  const handleConfirmAiAdd = async () => {
    if (scanItems.length === 0 || isAdding) return
    setIsAdding(true)
    try {
      const now = new Date().toISOString()
      for (const item of scanItems) {
        await onAddEntry({
          user_id: userId,
          date: dateStr,
          meal_type: selectedMeal,
          food_name: item.name,
          brand: item.isCatalogMatch ? 'Verified Database' : 'AI Vision Estimate',
          serving_size: item.servingSize,
          serving_unit: item.portion || item.servingUnit,
          servings_logged: item.quantity,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
          logged_at: now,
        })
      }
      window.dispatchEvent(new CustomEvent('gymtrack:food_logged'))
      setImageFile(null)
      setImagePreview(null)
      setScanItems([])
      onOpenChange(false)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs animate-fade-in" />
        <RadixDialog.Content
          className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-scale-in p-0 overflow-hidden focus:outline-none"
          aria-describedby="add-food-modal-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
            <div>
              <RadixDialog.Title className="text-lg font-black text-surface-900 tracking-tight">
                Log Food to Diary
              </RadixDialog.Title>
              <p id="add-food-modal-description" className="text-xs text-surface-500 font-medium">
                Add real food items, quick values, custom recipes, or scan photos.
              </p>
            </div>
            <RadixDialog.Close asChild>
              <button
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </RadixDialog.Close>
          </div>

          {/* Meal Category Selector */}
          <div className="px-5 pt-3 pb-2 bg-surface-50/70 border-b border-surface-200 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-surface-600">Select Meal:</span>
            <div className="flex items-center gap-1">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(meal => (
                <button
                  key={meal}
                  type="button"
                  onClick={() => setSelectedMeal(meal)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    selectedMeal === meal
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-100'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Tabs */}
          <div className="flex border-b border-surface-200 bg-surface-50/40 text-xs font-bold">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                activeTab === 'search'
                  ? 'border-brand-600 text-brand-700 bg-white'
                  : 'border-transparent text-surface-500 hover:text-surface-800'
              }`}
            >
              Search
            </button>
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                activeTab === 'quick'
                  ? 'border-brand-600 text-brand-700 bg-white'
                  : 'border-transparent text-surface-500 hover:text-surface-800'
              }`}
            >
              Quick Add
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                activeTab === 'custom'
                  ? 'border-brand-600 text-brand-700 bg-white'
                  : 'border-transparent text-surface-500 hover:text-surface-800'
              }`}
            >
              Custom Food
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1 ${
                activeTab === 'scanner'
                  ? 'border-brand-600 text-brand-700 bg-white'
                  : 'border-transparent text-surface-500 hover:text-surface-800'
              }`}
            >
              <Sparkles size={13} className="text-brand-500" />
              <span>AI Scan</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5 max-h-[60vh]">
            {/* ─── TAB 1: SEARCH FOOD ─── */}
            {activeTab === 'search' && (
              <div className="space-y-4">
                {selectedFood ? (
                  /* Food Detail & Portion Adjustment */
                  <div className="space-y-4 animate-scale-in">
                    <button
                      onClick={() => setSelectedFood(null)}
                      className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                    >
                      ← Back to search results
                    </button>

                    <div className="p-4 rounded-xl border border-surface-200 bg-surface-50/60">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-black text-surface-900 leading-tight">
                            {selectedFood.name}
                          </h4>
                          {selectedFood.brand && (
                            <p className="text-xs text-surface-500 font-medium mt-0.5">
                              Brand: {selectedFood.brand}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-200 text-surface-700">
                          {selectedFood.isCustom ? 'My Food' : 'Verified'}
                        </span>
                      </div>

                      {/* 1. Unified Amount & Unit Control */}
                      <div className="space-y-2 mt-4 pt-4 border-t border-surface-200">
                        <label className="block text-xs font-bold text-surface-700" htmlFor="food-quantity-input">
                          Amount
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <input
                              id="food-quantity-input"
                              type="number"
                              min="0.1"
                              step={activeUnitOption.unit === 'g' || activeUnitOption.unit === 'ml' ? '1' : '0.1'}
                              value={servingQuantity || ''}
                              onChange={e => {
                                const val = parseFloat(e.target.value)
                                setServingQuantity(isNaN(val) ? 0 : Math.max(0.01, val))
                              }}
                              className="input-base text-base sm:text-sm font-bold min-h-[44px] px-3.5 w-full bg-white shadow-2xs"
                              placeholder="e.g. 118"
                              aria-label="Food amount"
                            />
                          </div>
                          <div className="w-[145px] sm:w-[180px] flex-shrink-0">
                            <select
                              id="food-unit-select"
                              value={selectedUnit}
                              onChange={e => handleUnitChange(e.target.value)}
                              className="input-base text-xs sm:text-sm font-bold min-h-[44px] px-2.5 bg-white cursor-pointer w-full shadow-2xs"
                              aria-label="Unit of measure"
                            >
                              {servingUnits.map(u => (
                                <option key={u.unit} value={u.unit}>
                                  {u.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Equivalent Household Measure Line */}
                        {scaledSearchNutrients.householdEquivalence && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/90 px-3 py-1.5 rounded-lg border border-emerald-200/80 shadow-2xs">
                            <Info size={14} className="flex-shrink-0 text-emerald-600" />
                            <span className="truncate">{scaledSearchNutrients.householdEquivalence}</span>
                            {scaledSearchNutrients.isApproximateEquivalence && (
                              <span className="text-[10px] text-emerald-600 font-normal ml-auto flex-shrink-0">
                                (approximate)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. Live Recalculated Nutrition Breakdown */}
                      <div className="mt-4 space-y-2">
                        {/* Primary Macronutrient Cards */}
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 p-3 rounded-xl bg-white border border-surface-200 text-center shadow-2xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-surface-500 block">Calories</span>
                            <p className="text-sm sm:text-base font-black text-surface-900">{scaledSearchNutrients.calories}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-blue-600 block">Protein</span>
                            <p className="text-sm sm:text-base font-black text-surface-900">{scaledSearchNutrients.protein}g</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-700 block">Carbs</span>
                            <p className="text-sm sm:text-base font-black text-surface-900">{scaledSearchNutrients.carbs}g</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-rose-600 block">Fat</span>
                            <p className="text-sm sm:text-base font-black text-surface-900">{scaledSearchNutrients.fat}g</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Fiber</span>
                            <p className="text-sm sm:text-base font-black text-surface-900">{scaledSearchNutrients.fiber}g</p>
                          </div>
                        </div>

                        {/* Secondary Nutrient Details (Sat Fat, Sugar, Sodium) */}
                        <div className="flex items-center justify-around py-1.5 px-3 bg-surface-100/70 rounded-lg text-[11px] font-medium text-surface-600 flex-wrap gap-x-3 gap-y-1">
                          <span>
                            Sat Fat:{' '}
                            <strong className="text-surface-800">
                              {scaledSearchNutrients.saturatedFat != null ? `${scaledSearchNutrients.saturatedFat}g` : '—'}
                            </strong>
                          </span>
                          <span>·</span>
                          <span>
                            Sugar:{' '}
                            <strong className="text-surface-800">
                              {scaledSearchNutrients.sugar != null ? `${scaledSearchNutrients.sugar}g` : '—'}
                            </strong>
                          </span>
                          <span>·</span>
                          <span>
                            Sodium:{' '}
                            <strong className="text-surface-800">
                              {scaledSearchNutrients.sodiumMg != null ? `${scaledSearchNutrients.sodiumMg}mg` : '—'}
                            </strong>
                          </span>
                        </div>
                        <p className="text-[10px] text-surface-400 text-center font-medium">
                          Values with '—' denote unverified/unavailable nutrient data from reference.
                        </p>
                      </div>

                      {/* 3. Meal Selector */}
                      <div className="mt-4 pt-3 border-t border-surface-200 flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-surface-700">Meal Destination:</span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(meal => (
                            <button
                              key={meal}
                              type="button"
                              onClick={() => setSelectedMeal(meal)}
                              className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                selectedMeal === meal
                                  ? 'bg-brand-600 text-white shadow-xs'
                                  : 'bg-white text-surface-600 border border-surface-200 hover:bg-surface-100'
                              }`}
                            >
                              {meal}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Error Banner */}
                    {saveError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                        <AlertTriangle size={15} className="flex-shrink-0" />
                        <span>{saveError}</span>
                      </div>
                    )}

                    <button
                      onClick={handleConfirmSearchAdd}
                      disabled={isAdding || servingQuantity <= 0}
                      id="confirm-add-food-btn"
                      className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 min-h-[44px]"
                    >
                      {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      <span>Log Food to {selectedMeal.toUpperCase()}</span>
                    </button>
                  </div>
                ) : (
                  /* Search List View */
                  <div className="space-y-3">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search food by name (e.g. Chicken breast, Oats, Eggs, Apple)..."
                        className="input-base pl-10 py-2.5 text-sm"
                        autoFocus
                      />
                      {isSearching && (
                        <Loader2
                          size={16}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 animate-spin"
                        />
                      )}
                    </div>

                    {/* Results List */}
                    <div className="divide-y divide-surface-100 max-h-80 overflow-y-auto">
                      {searchResults.length === 0 && !isSearching && (
                        <div className="py-8 text-center text-surface-400 text-xs">
                          No foods found for "{searchQuery}". Try a different search or use Quick Add!
                        </div>
                      )}

                      {searchResults.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectFood(item)}
                          className="py-2.5 px-2 flex items-center justify-between cursor-pointer rounded-xl hover:bg-surface-50 transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-surface-900 truncate">
                                {item.name}
                              </h5>
                              {item.isCustom && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 border border-brand-200">
                                  Custom
                                </span>
                              )}
                              {item.brand && (
                                <span className="text-[10px] text-surface-400 truncate">
                                  {item.brand}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-surface-500 mt-0.5">
                              {item.calories} kcal · {item.serving_size} {item.serving_unit} ·{' '}
                              <span className="text-blue-600">{item.protein}g P</span> ·{' '}
                              <span className="text-amber-700">{item.carbs}g C</span> ·{' '}
                              <span className="text-rose-600">{item.fat}g F</span>
                            </p>
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-surface-300 group-hover:text-surface-600 group-hover:translate-x-0.5 transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: QUICK ADD ─── */}
            {activeTab === 'quick' && (
              <form onSubmit={handleQuickAddSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-600 flex items-start gap-2">
                  <Info size={16} className="text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Quick Add is ideal when you already know the nutritional values from a food label.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    Food Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quickName}
                    onChange={e => setQuickName(e.target.value)}
                    placeholder="e.g. Protein Bar, Greek Salad, Smoothie"
                    className="input-base text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Calories (kcal) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={quickCalories}
                      onChange={e => setQuickCalories(e.target.value)}
                      placeholder="0"
                      className="input-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-700 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={quickProtein}
                      onChange={e => setQuickProtein(e.target.value)}
                      placeholder="0"
                      className="input-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={quickCarbs}
                      onChange={e => setQuickCarbs(e.target.value)}
                      placeholder="0"
                      className="input-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-700 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={quickFat}
                      onChange={e => setQuickFat(e.target.value)}
                      placeholder="0"
                      className="input-base text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Fiber (g) (optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={quickFiber}
                    onChange={e => setQuickFiber(e.target.value)}
                    placeholder="0"
                    className="input-base text-sm sm:w-1/2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAdding || !quickName.trim() || !quickCalories}
                  id="submit-quick-add-btn"
                  className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  <span>Log to {selectedMeal.toUpperCase()}</span>
                </button>
              </form>
            )}

            {/* ─── TAB 3: CUSTOM FOOD ─── */}
            {activeTab === 'custom' && (
              <form onSubmit={handleCustomFoodSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-surface-50 border border-surface-200 text-xs text-surface-600 flex items-start gap-2">
                  <BookmarkPlus size={16} className="text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Create custom foods saved to your profile so you can reuse them anytime from Search.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Food Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      placeholder="e.g. My Favorite Protein Shake"
                      className="input-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Brand / Source (optional)
                    </label>
                    <input
                      type="text"
                      value={customBrand}
                      onChange={e => setCustomBrand(e.target.value)}
                      placeholder="e.g. Homemade, Optimum Nutrition"
                      className="input-base text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Serving Size Amount
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={customServingSize}
                      onChange={e => setCustomServingSize(e.target.value)}
                      className="input-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Serving Unit
                    </label>
                    <input
                      type="text"
                      required
                      value={customServingUnit}
                      onChange={e => setCustomServingUnit(e.target.value)}
                      placeholder="g, ml, scoop, piece, cup"
                      className="input-base text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-surface-700 mb-1">
                      Calories (kcal) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={customCalories}
                      onChange={e => setCustomCalories(e.target.value)}
                      placeholder="0"
                      className="input-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-700 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={customProtein}
                      onChange={e => setCustomProtein(e.target.value)}
                      placeholder="0"
                      className="input-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-800 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={customCarbs}
                      onChange={e => setCustomCarbs(e.target.value)}
                      placeholder="0"
                      className="input-base text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-rose-700 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={customFat}
                      onChange={e => setCustomFat(e.target.value)}
                      placeholder="0"
                      className="input-base text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="saveAndLogCheck"
                    checked={saveAndLog}
                    onChange={e => setSaveAndLog(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="saveAndLogCheck" className="text-xs font-semibold text-surface-700">
                    Also log this food to {selectedMeal.toUpperCase()} immediately
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isAdding || !customName.trim() || !customCalories}
                  id="submit-custom-food-btn"
                  className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  {isAdding ? <Loader2 size={16} className="animate-spin" /> : <BookmarkPlus size={16} />}
                  <span>Save Custom Food</span>
                </button>
              </form>
            )}

            {/* ─── TAB 4: AI SCANNER ─── */}
            {activeTab === 'scanner' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-900 flex items-start gap-2">
                  <Sparkles size={16} className="text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>AI Food Vision:</strong> Upload or snap a photo of your meal. The AI will
                    estimate portions and macronutrients. You will have full opportunity to review
                    and edit every value before confirming.
                  </div>
                </div>

                {/* Upload or Camera Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="sr-only"
                />

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-surface-300 hover:border-brand-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-surface-50/50 hover:bg-surface-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3">
                      <Camera size={24} />
                    </div>
                    <h5 className="text-sm font-bold text-surface-900 mb-1">
                      Choose Photo or Take Picture
                    </h5>
                    <p className="text-xs text-surface-400">
                      Supports PNG, JPG, WebP image formats
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="relative rounded-xl overflow-hidden border border-surface-200 max-h-48 flex items-center justify-center bg-black/5">
                      <img
                        src={imagePreview}
                        alt="Food preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => {
                          setImagePreview(null)
                          setImageFile(null)
                          setScanItems([])
                          setScanError(null)
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                        title="Remove image"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Error Banner if analysis failed - preserves photo & offers alternatives */}
                    {scanError && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col gap-2.5 animate-fade-in">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-bold text-amber-950">Meal Analysis Notice</p>
                            <p className="mt-0.5 text-amber-800 leading-relaxed">{scanError}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                          <button
                            type="button"
                            onClick={handleRunAiScan}
                            disabled={isScanning}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-2xs"
                          >
                            Retry AI Analysis
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('search')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 shadow-2xs"
                          >
                            Search Food Library
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('quick')}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 shadow-2xs"
                          >
                            Quick Add
                          </button>
                        </div>
                      </div>
                    )}

                    {scanItems.length === 0 ? (
                      <button
                        onClick={handleRunAiScan}
                        disabled={isScanning}
                        id="run-ai-scan-btn"
                        className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                      >
                        {isScanning ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Analyzing meal with AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            <span>{scanError ? 'Retry AI Analysis' : 'Analyze Food Photo'}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      /* Multi-Food Scan Results Review */
                      <div className="space-y-3 animate-scale-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                            Identified {scanItems.length} Food {scanItems.length === 1 ? 'Item' : 'Items'}
                          </span>
                          <span className="text-[10px] text-surface-400 font-medium">
                            Review & edit items before logging
                          </span>
                        </div>

                        {/* List of detected items */}
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {scanItems.map(item => (
                            <div
                              key={item.id}
                              className="p-3 rounded-xl border border-surface-200 bg-white shadow-2xs space-y-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={e => handleUpdateScanItem(item.id, { name: e.target.value })}
                                  className="font-bold text-xs text-surface-900 bg-transparent border-b border-transparent hover:border-surface-300 focus:border-brand-500 px-1 py-0.5 rounded flex-1 truncate"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleDeleteScanItem(item.id)}
                                  className="text-surface-400 hover:text-rose-600 p-1 rounded-lg"
                                  title="Remove item"
                                >
                                  <X size={14} />
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-surface-400 font-bold">Qty:</span>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={item.quantity}
                                    onChange={e => handleUpdateScanItem(item.id, { quantity: parseFloat(e.target.value) || 1 })}
                                    className="w-14 px-1.5 py-0.5 text-center text-xs font-bold rounded border border-surface-200 bg-surface-50"
                                  />
                                  <span className="text-[11px] text-surface-500">{item.portion}</span>
                                </div>

                                <div className="flex items-center gap-2 font-semibold">
                                  <span className="font-bold text-surface-900">{item.calories} kcal</span>
                                  <span className="text-blue-600">{item.protein}g P</span>
                                  <span className="text-amber-700">{item.carbs}g C</span>
                                  <span className="text-rose-600">{item.fat}g F</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Combined meal totals */}
                        <div className="p-3 rounded-xl bg-brand-50/60 border border-brand-200 flex items-center justify-between text-xs">
                          <span className="font-bold text-brand-950">Total Meal:</span>
                          <div className="flex items-center gap-2.5 font-bold">
                            <span className="text-surface-900">{scanMealTotals.calories} kcal</span>
                            <span className="text-blue-700">{scanMealTotals.protein}g P</span>
                            <span className="text-amber-700">{scanMealTotals.carbs}g C</span>
                            <span className="text-rose-700">{scanMealTotals.fat}g F</span>
                          </div>
                        </div>

                        <button
                          onClick={handleConfirmAiAdd}
                          disabled={isAdding || scanItems.length === 0}
                          id="confirm-ai-food-btn"
                          className="btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                        >
                          {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                          <span>Confirm & Log {scanItems.length} {scanItems.length === 1 ? 'Food' : 'Foods'} to {selectedMeal.toUpperCase()}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
