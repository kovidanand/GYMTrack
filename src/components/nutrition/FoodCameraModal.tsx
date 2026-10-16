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
} from 'lucide-react'
import type { FoodEntry, MealType } from '@/types/nutrition'
import {
  analyzeMealPhoto,
  processFoodImage,
  type DetectedFoodAnalysisItem,
} from '@/lib/nutritionService'

interface FoodCameraModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  selectedDate: string
  defaultMode?: 'camera' | 'upload'
  onLogMealItems: (items: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>
  onSwitchToLibrary?: () => void
}

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
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [overallNotes, setOverallNotes] = useState<string>('')
  const [detectedItems, setDetectedItems] = useState<DetectedFoodAnalysisItem[]>([])
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch')
  const [isSaving, setIsSaving] = useState(false)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const uploadInputRef = useRef<HTMLInputElement>(null)

  const resetState = () => {
    setImagePreview(null)
    setImageBase64(null)
    setImageMeta(null)
    setIsProcessingImage(false)
    setIsAnalyzing(false)
    setAnalysisError(null)
    setOverallNotes('')
    setDetectedItems([])
    setHasAnalyzed(false)
    setIsSaving(false)
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

  // Handle selected file with safe client-side resizing
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
      // reset file input value so selecting the same file triggers change
      e.target.value = ''
    }
  }

  // Real AI Vision analysis using Gemini 1.5 Flash via Edge Function
  const runAnalysis = async () => {
    if (!imageBase64 || isAnalyzing) return
    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      const result = await analyzeMealPhoto(imageBase64, imageMime)

      if (!result.isFood || result.items.length === 0) {
        setAnalysisError(
          result.overallNotes ||
            'No recognizable food items were found in this image. Please take a clearer photo of your meal.'
        )
        setDetectedItems([])
        setHasAnalyzed(false)
        return
      }

      setDetectedItems(result.items)
      setOverallNotes(result.overallNotes)
      setHasAnalyzed(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI Vision analysis failed.'
      setAnalysisError(message)
      setDetectedItems([])
      setHasAnalyzed(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Edit item properties
  const handleUpdateItem = (id: string, updates: Partial<DetectedFoodAnalysisItem>) => {
    setDetectedItems(prev =>
      prev.map(it => {
        if (it.id !== id) return it
        const updated = { ...it, ...updates }
        // If quantity changed, scale nutrients proportionally
        if (updates.quantity !== undefined && it.quantity > 0) {
          const ratio = updates.quantity / it.quantity
          updated.calories = Math.max(0, Math.round(it.calories * ratio))
          updated.protein = Math.max(0, Math.round(it.protein * ratio * 10) / 10)
          updated.carbs = Math.max(0, Math.round(it.carbs * ratio * 10) / 10)
          updated.fat = Math.max(0, Math.round(it.fat * ratio * 10) / 10)
          updated.fiber = Math.max(0, Math.round(it.fiber * ratio * 10) / 10)
        }
        return updated
      })
    )
  }

  const handleDeleteItem = (id: string) => {
    setDetectedItems(prev => prev.filter(it => it.id !== id))
  }

  const handleAddMissingItem = () => {
    const newItem: DetectedFoodAnalysisItem = {
      id: `manual_item_${Date.now()}`,
      name: 'Additional Food',
      portion: '1 serving (100g)',
      servingSize: 100,
      servingUnit: 'g',
      quantity: 1,
      calories: 120,
      protein: 5,
      carbs: 15,
      fat: 3,
      fiber: 1,
      confidence: 'medium',
      notes: 'Added manually to detected meal plate.',
    }
    setDetectedItems(prev => [...prev, newItem])
  }

  // Combined totals across all detected items
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

  // Confirm and log all items to Supabase
  const handleConfirmAndLog = async () => {
    if (detectedItems.length === 0 || isSaving) return
    setIsSaving(true)

    try {
      const now = new Date().toISOString()
      const entriesToLog: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>[] = detectedItems.map(it => ({
        user_id: userId,
        date: selectedDate,
        meal_type: selectedMeal,
        food_name: it.name,
        serving_size: it.servingSize,
        serving_unit: it.portion || it.servingUnit,
        servings_logged: it.quantity,
        calories: it.calories,
        protein: it.protein,
        carbs: it.carbs,
        fat: it.fat,
        fiber: it.fiber,
        logged_at: now,
      }))

      await onLogMealItems(entriesToLog)
      onOpenChange(false)
      resetState()
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
          className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col animate-scale-in focus:outline-none overflow-hidden"
          aria-describedby="camera-modal-desc"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-surface-200 bg-gradient-to-r from-emerald-50/70 to-teal-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
                <Camera size={18} />
              </div>
              <div>
                <RadixDialog.Title className="text-base font-black text-surface-900 tracking-tight flex items-center gap-2">
                  <span>AI Meal Photo Scanner</span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    Vision 1.5
                  </span>
                </RadixDialog.Title>
                <p id="camera-modal-desc" className="text-xs text-surface-500 font-medium">
                  Snap or upload a photo to identify meal items and estimate macros with AI.
                </p>
              </div>
            </div>

            <RadixDialog.Close asChild>
              <button className="p-1 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors">
                <X size={18} />
              </button>
            </RadixDialog.Close>
          </div>

          {/* Hidden Inputs */}
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
              <div className="space-y-4 py-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 border-2 border-dashed border-emerald-300 flex items-center justify-center text-emerald-600">
                  <Camera size={28} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-surface-900">Choose a Food Photo</h4>
                  <p className="text-xs text-surface-500 max-w-sm mx-auto mt-1">
                    Take a live picture of your plate or upload an existing meal photo from your device.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    id="scanner-open-camera-btn"
                    className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-xs transition-all"
                  >
                    <Camera size={16} />
                    <span>Take Meal Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => uploadInputRef.current?.click()}
                    id="scanner-open-upload-btn"
                    className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-surface-700 bg-surface-100 hover:bg-surface-200 active:scale-95 transition-all"
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
                <Loader2 size={24} className="animate-spin text-emerald-600" />
                <p className="text-xs font-semibold">Optimizing meal photo resolution...</p>
              </div>
            )}

            {/* Error Banner */}
            {analysisError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">
                    <span className="font-bold block text-rose-900">Analysis Notice</span>
                    {analysisError}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 pl-6">
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={runAnalysis}
                      disabled={isAnalyzing}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-rose-800 border border-rose-300 hover:bg-rose-100 shadow-2xs"
                    >
                      <RotateCcw size={12} />
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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 shadow-2xs"
                    >
                      <Search size={12} />
                      <span>Search Food Library</span>
                    </button>
                  )}
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
                      className="p-1.5 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition-colors"
                      title="Retake photo"
                    >
                      <Camera size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => uploadInputRef.current?.click()}
                      className="p-1.5 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition-colors"
                      title="Choose another image"
                    >
                      <Upload size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={resetState}
                      className="p-1.5 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs transition-colors"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {imageMeta && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] text-white/90 font-mono">
                      {imageMeta.width}×{imageMeta.height} • {imageMeta.sizeKb} KB
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    id="run-ai-vision-analysis-btn"
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Identifying Food Items with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Analyze Meal with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Analysis Review Screen */}
            {hasAnalyzed && detectedItems.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                {/* Photo thumbnail & quick retake bar */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface-50 border border-surface-200">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-200 flex-shrink-0 border border-surface-200">
                    <img
                      src={imagePreview || ''}
                      alt="Scanned thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
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
                    className="p-1.5 text-surface-500 hover:text-surface-800 rounded-lg hover:bg-surface-200 transition-colors"
                    title="Retake or replace image"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>

                {/* Target Meal Selector */}
                <div>
                  <label className="block text-xs font-bold text-surface-700 mb-1">
                    Log To Meal
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedMeal(m)}
                        className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                          selectedMeal === m
                            ? 'bg-emerald-600 text-white shadow-xs'
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
                    <span className="text-xs font-black uppercase tracking-wider text-surface-700">
                      Detected Food Items
                    </span>
                    <button
                      type="button"
                      onClick={handleAddMissingItem}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      <Plus size={12} />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {detectedItems.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white border border-surface-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Editable Food Name */}
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item.name}
                              onChange={e => handleUpdateItem(item.id, { name: e.target.value })}
                              className="font-bold text-xs sm:text-sm text-surface-900 bg-transparent border-b border-transparent hover:border-surface-300 focus:border-emerald-500 focus:bg-emerald-50/30 px-1 py-0.5 rounded transition-all w-full"
                              title="Click to rename food"
                            />
                            <Edit2 size={12} className="text-surface-400 flex-shrink-0" />
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 px-1">
                            <span className="text-[10px] text-surface-500">
                              Estimated: {item.portion}
                            </span>
                            {item.confidence && (
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                  item.confidence === 'high'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.confidence === 'low'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {item.confidence} confidence
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-surface-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Portion Multipliers */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-100">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-surface-400 mr-1">Portion:</span>
                          {[0.5, 1, 1.5, 2].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleUpdateItem(item.id, { quantity: preset })}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                                item.quantity === preset
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                  : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                              }`}
                            >
                              {preset}x
                            </button>
                          ))}
                        </div>

                        {/* Nutrient Mini Strip */}
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-surface-700">
                          <span className="font-bold text-surface-900">{item.calories} kcal</span>
                          <span className="text-blue-600 font-bold">{item.protein}g P</span>
                          <span className="text-amber-700">{item.carbs}g C</span>
                          <span className="text-rose-600">{item.fat}g F</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Combined Meal Total Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                      Total Estimated Meal
                    </span>
                    <span className="text-[10px] font-medium text-emerald-700">
                      Visual approximation
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-surface-400 block">
                        Calories
                      </span>
                      <span className="text-base font-black text-surface-900">
                        {mealTotals.calories}
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-blue-600 block">
                        Protein
                      </span>
                      <span className="text-base font-black text-surface-900">
                        {mealTotals.protein}g
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-amber-700 block">
                        Carbs
                      </span>
                      <span className="text-base font-black text-surface-900">
                        {mealTotals.carbs}g
                      </span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-rose-600 block">
                        Fat
                      </span>
                      <span className="text-base font-black text-surface-900">
                        {mealTotals.fat}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm and Log Meal Button */}
                <button
                  type="button"
                  onClick={handleConfirmAndLog}
                  disabled={isSaving || detectedItems.length === 0}
                  id="confirm-and-log-meal-btn"
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>
                    Confirm and Log Meal ({detectedItems.length} {detectedItems.length === 1 ? 'item' : 'items'} to {selectedMeal.toUpperCase()})
                  </span>
                </button>
              </div>
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
