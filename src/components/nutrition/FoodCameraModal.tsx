import React, { useState, useEffect, useRef, useMemo } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Loader2,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  RotateCcw,
  Edit2,
  Search,
  CheckCircle2,
  BookOpen,
  Info,
} from 'lucide-react'
import type { FoodEntry, MealType } from '@/types/nutrition'
import {
  analyzeMealPhoto,
  processFoodImage,
  type DetectedFoodAnalysisItem,
} from '@/lib/nutritionService'
import { FOOD_CATALOG, type CatalogFoodItem } from '@/data/foodCatalog'

interface FoodCameraModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  selectedDate: string
  defaultMode?: 'camera' | 'upload'
  onLogMealItems: (items: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>
  onSwitchToLibrary?: () => void
}

interface EnrichedAnalysisItem extends DetectedFoodAnalysisItem {
  baseCalories: number
  baseProtein: number
  baseCarbs: number
  baseFat: number
  baseFiber: number
}

const COMMON_ADDITIONS = [
  { name: 'White Rice (Cooked)', portion: '1 cup (150g)', calories: 195, protein: 4.0, carbs: 43.0, fat: 0.4, fiber: 0.6 },
  { name: 'Yellow Dal Tadka', portion: '1 bowl (150g)', calories: 150, protein: 7.0, carbs: 22.0, fat: 3.5, fiber: 4.0 },
  { name: 'Paneer Gravy / Curry', portion: '1 serving (150g)', calories: 240, protein: 12.0, carbs: 8.0, fat: 18.0, fiber: 2.0 },
  { name: 'Chicken Breast (Cooked)', portion: '100g', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, fiber: 0.0 },
  { name: 'Whole Wheat Roti', portion: '1 piece (35g)', calories: 85, protein: 3.0, carbs: 17.0, fat: 0.5, fiber: 2.5 },
  { name: 'Plain Curd / Dahi', portion: '1 bowl (100g)', calories: 60, protein: 3.5, carbs: 4.5, fat: 3.0, fiber: 0.0 },
  { name: 'Boiled Egg', portion: '1 large (50g)', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0.0 },
  { name: 'Mixed Green Salad', portion: '1 plate (100g)', calories: 25, protein: 1.2, carbs: 4.0, fat: 0.2, fiber: 2.0 },
]

export function FoodCameraModal({
  open,
  onOpenChange,
  userId,
  selectedDate,
  defaultMode = 'camera',
  onLogMealItems,
  onSwitchToLibrary,
}: FoodCameraModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMime, setImageMime] = useState<string>('image/jpeg')
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeKb: number } | null>(null)

  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStage, setAnalysisStage] = useState<string>('')
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [overallNotes, setOverallNotes] = useState<string>('')
  const [detectedItems, setDetectedItems] = useState<EnrichedAnalysisItem[]>([])
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [replacingItemId, setReplacingItemId] = useState<string | null>(null)
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('')
  const [showCatalogAddModal, setShowCatalogAddModal] = useState(false)

  // Default meal type based on current time
  const defaultMealType = useMemo<MealType>(() => {
    const hour = new Date().getHours()
    if (hour < 11) return 'breakfast'
    if (hour < 16) return 'lunch'
    if (hour < 21) return 'dinner'
    return 'snack'
  }, [])

  const [selectedMeal, setSelectedMeal] = useState<MealType>(defaultMealType)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setImagePreview(null)
    setImageBase64(null)
    setImageMeta(null)
    setIsProcessingImage(false)
    setIsAnalyzing(false)
    setAnalysisStage('')
    setAnalysisError(null)
    setOverallNotes('')
    setDetectedItems([])
    setHasAnalyzed(false)
    setIsSaving(false)
    setSaveSuccess(false)
    setShowAddMenu(false)
    setReplacingItemId(null)
    setCatalogSearchQuery('')
    setShowCatalogAddModal(false)
  }

  // Auto-focus camera or file dialog if requested on open
  useEffect(() => {
    if (open && !imagePreview && !hasAnalyzed) {
      const timer = setTimeout(() => {
        if (defaultMode === 'camera') {
          cameraInputRef.current?.click()
        } else if (defaultMode === 'upload') {
          uploadInputRef.current?.click()
        }
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [open, defaultMode, imagePreview, hasAnalyzed])

  // Handle selected file with client-side compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessingImage(true)
    setAnalysisError(null)

    try {
      const processed = await processFoodImage(file, 1280, 0.85)
      setImagePreview(processed.dataUrl)
      setImageBase64(processed.base64)
      setImageMime(processed.mimeType)
      setImageMeta({
        width: processed.width,
        height: processed.height,
        sizeKb: Math.round(processed.compressedSize / 1024),
      })
      setHasAnalyzed(false)
      setDetectedItems([])
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to process image.')
    } finally {
      setIsProcessingImage(false)
      e.target.value = ''
    }
  }

  // Real Multi-Food AI Vision analysis with progressive stage feedback
  const runAnalysis = async () => {
    if (!imageBase64 || isAnalyzing) return
    setIsAnalyzing(true)
    setAnalysisError(null)
    setAnalysisStage('Examining meal photograph...')

    const t1 = setTimeout(() => setAnalysisStage('Identifying distinct food items on plate...'), 1200)
    const t2 = setTimeout(() => setAnalysisStage('Estimating portions and nutritional macros...'), 2600)

    try {
      const result = await analyzeMealPhoto(imageBase64, imageMime)

      if (!result.isFood || result.items.length === 0) {
        setAnalysisError(
          result.overallNotes ||
            'No recognizable food items were found in this photo. Please snap a clearer photo of your meal.'
        )
        setDetectedItems([])
        setHasAnalyzed(false)
        return
      }

      // Attach base values for precise multiplier scaling without drift
      const validated: EnrichedAnalysisItem[] = result.items.map(item => {
        const qty = item.quantity || 1
        return {
          ...item,
          baseCalories: item.calories / qty,
          baseProtein: item.protein / qty,
          baseCarbs: item.carbs / qty,
          baseFat: item.fat / qty,
          baseFiber: (item.fiber || 0) / qty,
        }
      })

      setDetectedItems(validated)
      setOverallNotes(result.overallNotes)
      setHasAnalyzed(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Meal analysis is temporarily unavailable.'
      setAnalysisError(message)
      setHasAnalyzed(false)
    } finally {
      clearTimeout(t1)
      clearTimeout(t2)
      setIsAnalyzing(false)
      setAnalysisStage('')
    }
  }

  // Edit item properties with precise nutrient recalculation
  const handleUpdateItem = (
    id: string,
    updates: Partial<EnrichedAnalysisItem>
  ) => {
    setDetectedItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it
        const updated = { ...it, ...updates }

        if (updates.quantity !== undefined) {
          const q = Math.max(0.05, Number(updates.quantity) || 1)
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

  const handleDeleteItem = (id: string) => {
    setDetectedItems(prev => prev.filter(it => it.id !== id))
  }

  // Replace a detected item with a verified item from the Food Catalog
  const handleReplaceItemWithCatalog = (itemId: string, catalogFood: CatalogFoodItem) => {
    setDetectedItems(prev =>
      prev.map(it => {
        if (it.id !== itemId) return it
        const qty = it.quantity || 1
        return {
          ...it,
          name: catalogFood.name,
          portion: `${catalogFood.serving_size} ${catalogFood.serving_unit}`,
          servingSize: catalogFood.serving_size,
          servingUnit: catalogFood.serving_unit,
          isCatalogMatch: true,
          catalogId: catalogFood.id,
          notes: 'Matched to verified food database record.',
          uncertaintyNotes: undefined,
          baseCalories: catalogFood.calories,
          baseProtein: catalogFood.protein,
          baseCarbs: catalogFood.carbs,
          baseFat: catalogFood.fat,
          baseFiber: catalogFood.fiber || 0,
          calories: Math.max(0, Math.round(catalogFood.calories * qty)),
          protein: Math.max(0, Math.round(catalogFood.protein * qty * 10) / 10),
          carbs: Math.max(0, Math.round(catalogFood.carbs * qty * 10) / 10),
          fat: Math.max(0, Math.round(catalogFood.fat * qty * 10) / 10),
          fiber: Math.max(0, Math.round((catalogFood.fiber || 0) * qty * 10) / 10),
          confidence: 'high' as const,
        }
      })
    )
    setReplacingItemId(null)
    setCatalogSearchQuery('')
  }

  const handleAddPresetItem = (preset: typeof COMMON_ADDITIONS[0]) => {
    const newItem: EnrichedAnalysisItem = {
      id: `manual_${Date.now()}`,
      name: preset.name,
      portion: preset.portion,
      servingSize: 100,
      servingUnit: 'serving',
      quantity: 1,
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fat: preset.fat,
      fiber: preset.fiber,
      confidence: 'high',
      notes: 'Added from verified food library.',
      isCatalogMatch: true,
      baseCalories: preset.calories,
      baseProtein: preset.protein,
      baseCarbs: preset.carbs,
      baseFat: preset.fat,
      baseFiber: preset.fiber,
    }
    setDetectedItems(prev => [...prev, newItem])
    setShowAddMenu(false)
  }

  const handleAddCatalogItem = (catalogFood: CatalogFoodItem) => {
    const newItem: EnrichedAnalysisItem = {
      id: `catalog_${Date.now()}`,
      name: catalogFood.name,
      portion: `${catalogFood.serving_size} ${catalogFood.serving_unit}`,
      servingSize: catalogFood.serving_size,
      servingUnit: catalogFood.serving_unit,
      quantity: 1,
      calories: catalogFood.calories,
      protein: catalogFood.protein,
      carbs: catalogFood.carbs,
      fat: catalogFood.fat,
      fiber: catalogFood.fiber || 0,
      confidence: 'high',
      notes: 'Added from verified food database.',
      isCatalogMatch: true,
      catalogId: catalogFood.id,
      baseCalories: catalogFood.calories,
      baseProtein: catalogFood.protein,
      baseCarbs: catalogFood.carbs,
      baseFat: catalogFood.fat,
      baseFiber: catalogFood.fiber || 0,
    }
    setDetectedItems(prev => [...prev, newItem])
    setShowCatalogAddModal(false)
    setShowAddMenu(false)
    setCatalogSearchQuery('')
  }

  const handleAddCustomItem = () => {
    const newItem: EnrichedAnalysisItem = {
      id: `custom_${Date.now()}`,
      name: 'Custom Food Item',
      portion: '1 serving (100g)',
      servingSize: 100,
      servingUnit: 'g',
      quantity: 1,
      calories: 120,
      protein: 5.0,
      carbs: 15.0,
      fat: 3.0,
      fiber: 1.0,
      confidence: 'medium',
      notes: 'Added manually to meal.',
      isCatalogMatch: false,
      baseCalories: 120,
      baseProtein: 5.0,
      baseCarbs: 15.0,
      baseFat: 3.0,
      baseFiber: 1.0,
    }
    setDetectedItems(prev => [...prev, newItem])
    setShowAddMenu(false)
  }

  // Combined totals across all confirmed detected items
  const mealTotals = useMemo(() => {
    let calories = 0
    let protein = 0
    let carbs = 0
    let fat = 0
    let fiber = 0

    for (const it of detectedItems) {
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
  }, [detectedItems])

  // Filter catalog items for searching
  const filteredCatalogItems = useMemo(() => {
    if (!catalogSearchQuery.trim()) return FOOD_CATALOG.slice(0, 20)
    const q = catalogSearchQuery.toLowerCase().trim()
    return FOOD_CATALOG.filter(
      item =>
        item.name.toLowerCase().includes(q) ||
        item.aliases.some(a => a.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    ).slice(0, 25)
  }, [catalogSearchQuery])

  // Confirm and log all items to Supabase with double-click guard
  const handleConfirmAndLog = async () => {
    if (detectedItems.length === 0 || isSaving) return
    setIsSaving(true)

    try {
      const now = new Date().toISOString()
      const entriesToLog: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>[] = detectedItems.map(it => {
        const isMetric = (it.servingUnit || '').toLowerCase() === 'g' || (it.servingUnit || '').toLowerCase() === 'ml'
        return {
          user_id: userId,
          date: selectedDate,
          meal_type: selectedMeal,
          food_name: it.name,
          serving_size: isMetric ? Math.round(it.servingSize * (it.quantity || 1)) : 1,
          serving_unit: it.servingUnit || it.portion || 'serving',
          servings_logged: isMetric ? 1 : (it.quantity || 1),
          calories: it.calories,
          protein: it.protein,
          carbs: it.carbs,
          fat: it.fat,
          fiber: it.fiber,
          logged_at: now,
        }
      })

      await onLogMealItems(entriesToLog)
      // Broadcast event so progress cards, history, and AI coach update
      window.dispatchEvent(new CustomEvent('gymtrack:food_logged'))

      setSaveSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
        resetState()
      }, 700)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={newOpen => {
        if (!newOpen) resetState()
        onOpenChange(newOpen)
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs animate-fade-in" />
        <RadixDialog.Content
          className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col animate-scale-in focus:outline-none overflow-hidden"
          aria-describedby="camera-modal-desc"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-surface-200 bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Camera size={18} />
              </div>
              <div className="min-w-0">
                <RadixDialog.Title className="text-base font-bold text-surface-900 tracking-tight flex items-center gap-2 truncate">
                  <span>AI Meal Photo Scanner</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 shrink-0">
                    Vision AI
                  </span>
                </RadixDialog.Title>
                <p id="camera-modal-desc" className="text-xs text-surface-500 font-medium truncate">
                  Identify multiple meal items and estimate nutrition from photo.
                </p>
              </div>
            </div>

            <RadixDialog.Close asChild>
              <button
                type="button"
                className="p-1.5 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </RadixDialog.Close>
          </div>

          {/* Hidden File / Camera Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Step 1: No Image Selected State */}
            {!imagePreview && (
              <div className="space-y-4 py-8 text-center">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-50 border-2 border-dashed border-brand-300 flex items-center justify-center text-brand-600">
                  <Camera size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-surface-900">Select or Capture Meal Photo</h4>
                  <p className="text-xs text-surface-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Take a live photo of your plate or upload an existing image. AI will detect all distinct foods present.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    id="scanner-open-camera-btn"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 shadow-xs transition-all min-h-[44px]"
                  >
                    <Camera size={16} />
                    <span>Take Photo (Camera)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    id="scanner-open-upload-btn"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-xs font-bold text-surface-700 bg-surface-100 hover:bg-surface-200 active:scale-95 transition-all min-h-[44px]"
                  >
                    <Upload size={16} />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* Processing image loader */}
            {isProcessingImage && (
              <div className="py-10 text-center text-surface-500 flex flex-col items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin text-brand-600" />
                <p className="text-xs font-semibold">Optimizing image for recognition...</p>
              </div>
            )}

            {/* Error Banner - Keeps photo preserved and offers actionable alternatives */}
            {analysisError && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2.5 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">
                    <span className="font-bold block text-amber-950 mb-0.5">Meal Analysis Notice</span>
                    {analysisError}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 pl-7">
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={runAnalysis}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 active:scale-95 shadow-2xs min-h-[36px] disabled:opacity-60"
                    >
                      <RotateCcw size={13} />
                      <span>Retry Analysis</span>
                    </button>
                  )}

                  {onSwitchToLibrary && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false)
                        onSwitchToLibrary()
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 shadow-2xs min-h-[36px]"
                    >
                      <Search size={13} />
                      <span>Search Food Library</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      handleAddCustomItem()
                      setAnalysisError(null)
                      setHasAnalyzed(true)
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 shadow-2xs min-h-[36px]"
                  >
                    <Plus size={13} />
                    <span>Log Foods Manually</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Image Preview & Pre-Analysis */}
            {imagePreview && !hasAnalyzed && !isProcessingImage && (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-surface-200 bg-black aspect-video max-h-60 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Meal preview"
                    className="w-full h-full object-contain"
                  />

                  {/* Actions overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition-colors"
                      title="Retake photo"
                    >
                      <Camera size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition-colors"
                      title="Choose another image"
                    >
                      <Upload size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={resetState}
                      className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition-colors"
                      title="Remove image"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {imageMeta && (
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white/90 font-mono">
                      {imageMeta.width}×{imageMeta.height} • {imageMeta.sizeKb} KB
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    id="run-ai-vision-analysis-btn"
                    className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60 min-h-[44px]"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{analysisStage || 'Analyzing Meal with AI...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Analyze Meal Photo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Analysis Review Screen (Multi-Food Items) */}
            {hasAnalyzed && detectedItems.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                {/* Photo thumbnail & quick retake bar */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-50 border border-surface-200">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-200 flex-shrink-0 border border-surface-200">
                    <img
                      src={imagePreview || ''}
                      alt="Scanned thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                      Identified {detectedItems.length} Food {detectedItems.length === 1 ? 'Item' : 'Items'}
                    </span>
                    <p className="text-xs text-surface-600 truncate mt-0.5">
                      {overallNotes || 'Review and adjust portions before confirming.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHasAnalyzed(false)
                      setDetectedItems([])
                    }}
                    className="p-2 text-surface-500 hover:text-surface-800 rounded-xl hover:bg-surface-200 transition-colors shrink-0"
                    title="Retake or replace image"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                {/* Target Meal Selector */}
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1.5">
                    Log To Meal Category
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMeal(m)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all min-h-[40px] flex items-center justify-center ${
                          selectedMeal === m
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detected Items List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-surface-700">
                      Detected Foods ({detectedItems.length})
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 p-1 rounded-lg"
                      >
                        <Plus size={14} />
                        <span>Add Food</span>
                      </button>

                      {showAddMenu && (
                        <div className="absolute right-0 top-7 z-20 w-64 bg-white rounded-2xl shadow-xl border border-surface-200 p-2 space-y-1 text-xs animate-scale-in">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCatalogAddModal(true)
                              setShowAddMenu(false)
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-xl text-brand-700 font-bold bg-brand-50 hover:bg-brand-100 flex items-center gap-1.5"
                          >
                            <BookOpen size={13} />
                            <span>Search Food Library</span>
                          </button>
                          <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider px-2 pt-1.5 block">
                            Quick Add Common Foods
                          </span>
                          <div className="max-h-44 overflow-y-auto space-y-0.5">
                            {COMMON_ADDITIONS.map(ca => (
                              <button
                                key={ca.name}
                                type="button"
                                onClick={() => handleAddPresetItem(ca)}
                                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-surface-50 text-surface-800 font-semibold flex items-center justify-between"
                              >
                                <span className="truncate">{ca.name}</span>
                                <span className="text-[10px] text-surface-400 shrink-0">{ca.calories} kcal</span>
                              </button>
                            ))}
                          </div>
                          <div className="pt-1 border-t border-surface-100">
                            <button
                              type="button"
                              onClick={handleAddCustomItem}
                              className="w-full text-left px-2 py-1.5 rounded-lg text-surface-700 font-bold hover:bg-surface-50"
                            >
                              + Custom Food Item
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {detectedItems.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Editable Food Name */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item.name}
                              onChange={e => handleUpdateItem(item.id, { name: e.target.value })}
                              className="font-bold text-xs sm:text-sm text-surface-900 bg-transparent border-b border-transparent hover:border-surface-300 focus:border-brand-500 focus:bg-brand-50/30 px-1 py-0.5 rounded transition-all w-full truncate"
                              title="Click to edit name"
                            />
                            <Edit2 size={12} className="text-surface-400 shrink-0" />
                          </div>

                          <div className="flex items-center gap-1.5 mt-1 px-1 flex-wrap">
                            <span className="text-[11px] text-surface-500">
                              Portion: {item.portion}
                            </span>
                            {item.isCatalogMatch ? (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 size={10} />
                                <span>Verified Match</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-100 text-surface-600 border border-surface-200 flex items-center gap-1">
                                <Info size={10} />
                                <span>AI Estimate ({item.confidence || 'Medium'})</span>
                              </span>
                            )}

                            {/* Button to replace with verified catalog item */}
                            <button
                              type="button"
                              onClick={() => {
                                setReplacingItemId(item.id)
                                setCatalogSearchQuery(item.name)
                              }}
                              className="text-[10px] font-bold text-brand-600 hover:text-brand-800 underline ml-1 inline-flex items-center gap-0.5"
                            >
                              <Search size={10} />
                              <span>Match Database</span>
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-surface-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Portion Multipliers, Stepper & Calculated Macros */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-surface-100">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-surface-400">Serving:</span>
                          <div className="flex items-center border border-surface-200 rounded-lg overflow-hidden bg-surface-50">
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(item.id, { quantity: Math.max(0.1, Math.round((item.quantity - 0.25) * 100) / 100) })}
                              className="px-2 py-1 text-xs font-bold text-surface-600 hover:bg-surface-200"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={item.quantity}
                              onChange={e => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 1 })}
                              className="w-12 text-center text-xs font-bold bg-white text-surface-900 border-x border-surface-200 py-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(item.id, { quantity: Math.round((item.quantity + 0.25) * 100) / 100 })}
                              className="px-2 py-1 text-xs font-bold text-surface-600 hover:bg-surface-200"
                            >
                              +
                            </button>
                          </div>

                          {[0.5, 1, 1.5, 2].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleUpdateItem(item.id, { quantity: preset })}
                              className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                                item.quantity === preset
                                  ? 'bg-brand-50 border-brand-300 text-brand-700'
                                  : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                              }`}
                            >
                              {preset}x
                            </button>
                          ))}
                        </div>

                        {/* Nutrient Summary (Real calculated numbers, never literal "estimated") */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-surface-700 flex-wrap">
                          <span className="font-bold text-surface-900">{item.calories} kcal</span>
                          <span className="text-emerald-700 font-bold">{item.protein}g P</span>
                          <span className="text-amber-700">{item.carbs}g C</span>
                          <span className="text-rose-600">{item.fat}g F</span>
                          {item.fiber !== undefined && item.fiber > 0 && (
                            <span className="text-brand-600">{item.fiber}g Fib</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Combined Meal Total Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50/70 to-emerald-50/50 border border-brand-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-surface-900">
                      Total Meal Nutrition
                    </span>
                    <span className="text-[10px] text-surface-500 font-medium">
                      Sum of {detectedItems.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 text-center">
                    <div className="bg-white p-2 rounded-xl border border-surface-100">
                      <span className="text-[10px] font-bold uppercase text-surface-400 block">
                        Calories
                      </span>
                      <span className="text-base font-bold text-surface-900">
                        {mealTotals.calories}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-surface-100">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                        Protein
                      </span>
                      <span className="text-base font-bold text-surface-900">
                        {mealTotals.protein}g
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-surface-100">
                      <span className="text-[10px] font-bold uppercase text-amber-700 block">
                        Carbs
                      </span>
                      <span className="text-base font-bold text-surface-900">
                        {mealTotals.carbs}g
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-surface-100">
                      <span className="text-[10px] font-bold uppercase text-rose-600 block">
                        Fat
                      </span>
                      <span className="text-base font-bold text-surface-900">
                        {mealTotals.fat}g
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-surface-100 col-span-4 sm:col-span-1">
                      <span className="text-[10px] font-bold uppercase text-brand-600 block">
                        Fiber
                      </span>
                      <span className="text-base font-bold text-surface-900">
                        {mealTotals.fiber}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm and Log Meal Button */}
                <button
                  type="button"
                  onClick={handleConfirmAndLog}
                  disabled={isSaving || saveSuccess || detectedItems.length === 0}
                  id="confirm-and-log-meal-btn"
                  className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 min-h-[44px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Logging Meal to Diary...</span>
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check size={16} />
                      <span>Logged Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>
                        Confirm & Log Meal ({detectedItems.length} {detectedItems.length === 1 ? 'item' : 'items'} to {selectedMeal.toUpperCase()})
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sub-Dialog: Replace or Add Item from Verified Food Catalog */}
          {(replacingItemId || showCatalogAddModal) && (
            <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-surface-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-brand-600" />
                    <span className="text-sm font-bold text-surface-900">
                      {replacingItemId ? 'Match with Food Library' : 'Add Food from Library'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReplacingItemId(null)
                      setShowCatalogAddModal(false)
                    }}
                    className="p-1 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-3 border-b border-surface-100">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input
                      type="text"
                      autoFocus
                      value={catalogSearchQuery}
                      onChange={e => setCatalogSearchQuery(e.target.value)}
                      placeholder="Search food database (e.g. Rice, Dal, Roti, Paneer)..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-surface-200 bg-surface-50 focus:bg-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 divide-y divide-surface-100">
                  {filteredCatalogItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-surface-400">
                      No matching verified foods found. Try a different search term.
                    </div>
                  ) : (
                    filteredCatalogItems.map(food => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => {
                          if (replacingItemId) {
                            handleReplaceItemWithCatalog(replacingItemId, food)
                          } else {
                            handleAddCatalogItem(food)
                          }
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-surface-50 transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-surface-900 block truncate group-hover:text-brand-700">
                            {food.name}
                          </span>
                          <span className="text-[10px] text-surface-400 block mt-0.5">
                            {food.serving_size} {food.serving_unit} • {food.calories} kcal • {food.protein}g P
                          </span>
                        </div>
                        <CheckCircle2 size={16} className="text-surface-300 group-hover:text-brand-600 shrink-0 ml-2" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
