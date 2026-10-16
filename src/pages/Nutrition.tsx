import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  Settings,
  Plus,
  Loader2,
  UtensilsCrossed,
  Camera,
  Upload,
  Flame,
  Lightbulb,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  getNutritionGoals,
  saveNutritionGoals,
  getFoodEntriesForDate,
  addFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
  getWaterEntriesForDate,
  addWaterEntry,
  deleteWaterEntry,
  calculateNutritionStreak,
  generateNutritionInsights,
  DEFAULT_NUTRITION_GOALS,
} from '@/lib/nutritionService'
import type {
  FoodEntry,
  WaterEntry,
  MealType,
  NutritionGoals,
} from '@/types/nutrition'

import { DateNavigator } from '@/components/nutrition/DateNavigator'
import { CalorieProgressCard } from '@/components/nutrition/CalorieProgressCard'
import { MacroSummaryCards } from '@/components/nutrition/MacroSummaryCards'
import { WaterTrackerCard } from '@/components/nutrition/WaterTrackerCard'
import { MealSection } from '@/components/nutrition/MealSection'
import { AddFoodModal } from '@/components/nutrition/AddFoodModal'
import { EditFoodModal } from '@/components/nutrition/EditFoodModal'
import { NutritionGoalsModal } from '@/components/nutrition/NutritionGoalsModal'
import { NutritionAnalyticsView } from '@/components/nutrition/NutritionAnalyticsView'
import { FoodLibraryView } from '@/components/nutrition/FoodLibraryView'
import { FoodCameraModal } from '@/components/nutrition/FoodCameraModal'

export default function Nutrition() {
  const { user } = useAuth()
  const userId = user?.id || 'guest_user'

  // Primary Subview: 'dashboard' | 'library' | 'analytics'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'analytics'>('dashboard')

  // Selected Date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])

  // Data States
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_NUTRITION_GOALS)
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([])
  const [streak, setStreak] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast')
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)

  // Camera / AI Photo Modal
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)
  const [cameraMode, setCameraMode] = useState<'camera' | 'upload'>('camera')

  // Fetch Goals
  const loadGoals = useCallback(async () => {
    if (!userId) return
    try {
      const g = await getNutritionGoals(userId)
      setGoals(g)
    } catch (err) {
      console.error('Failed to load nutrition goals:', err)
    }
  }, [userId])

  // Fetch Streak
  const loadStreak = useCallback(async () => {
    if (!userId) return
    try {
      const s = await calculateNutritionStreak(userId)
      setStreak(s)
    } catch (err) {
      console.error('Failed to calculate nutrition streak:', err)
    }
  }, [userId])

  // Fetch Entries for Selected Date
  const loadDateEntries = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [fEntries, wEntries] = await Promise.all([
        getFoodEntriesForDate(userId, selectedDate),
        getWaterEntriesForDate(userId, selectedDate),
      ])
      setEntries(fEntries)
      setWaterEntries(wEntries)
    } catch (err) {
      console.error('Failed to load date entries:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, selectedDate])

  useEffect(() => {
    loadGoals()
    loadStreak()
  }, [loadGoals, loadStreak])

  useEffect(() => {
    loadDateEntries()
  }, [loadDateEntries])

  // Aggregated Daily Totals
  const dailyTotals = useMemo(() => {
    let calories = 0
    let protein = 0
    let carbs = 0
    let fat = 0
    let fiber = 0

    for (const e of entries) {
      calories += e.calories || 0
      protein += e.protein || 0
      carbs += e.carbs || 0
      fat += e.fat || 0
      fiber += e.fiber || 0
    }

    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      fiber: Math.round(fiber * 10) / 10,
    }
  }, [entries])

  // Personalized Insights
  const insights = useMemo(() => {
    return generateNutritionInsights(dailyTotals, goals, streak)
  }, [dailyTotals, goals, streak])

  // Group Entries by Meal
  const mealEntries = useMemo(() => {
    const grouped: Record<MealType, FoodEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    }
    for (const e of entries) {
      if (grouped[e.meal_type]) {
        grouped[e.meal_type].push(e)
      } else {
        grouped.snack.push(e)
      }
    }
    return grouped
  }, [entries])

  // Handlers
  const handleOpenAdd = (mealType: MealType = 'breakfast') => {
    setActiveMealType(mealType)
    setIsAddModalOpen(true)
  }

  const handleOpenEdit = (entry: FoodEntry) => {
    setEditingEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleOpenCamera = (mode: 'camera' | 'upload') => {
    setCameraMode(mode)
    setIsCameraModalOpen(true)
  }

  const handleAddFoodEntry = async (
    entry: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await addFoodEntry(userId, entry)
    setEntries(prev => [...prev, created])
    loadStreak()
  }

  const handleBatchLogItems = async (
    items: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>[]
  ) => {
    for (const item of items) {
      const created = await addFoodEntry(userId, item)
      setEntries(prev => [...prev, created])
    }
    loadStreak()
  }

  const handleUpdateFoodEntry = async (entryId: string, updates: Partial<FoodEntry>) => {
    const updated = await updateFoodEntry(userId, entryId, selectedDate, updates)
    if (updated) {
      setEntries(prev => prev.map(e => (e.id === entryId ? updated : e)))
    }
    loadStreak()
  }

  const handleDeleteFoodEntry = async (entryId: string) => {
    await deleteFoodEntry(userId, entryId, selectedDate)
    setEntries(prev => prev.filter(e => e.id !== entryId))
    loadStreak()
  }

  const handleAddWater = async (amountMl: number) => {
    const created = await addWaterEntry(userId, selectedDate, amountMl)
    setWaterEntries(prev => [...prev, created])
  }

  const handleDeleteWater = async (id: string) => {
    await deleteWaterEntry(userId, id, selectedDate)
    setWaterEntries(prev => prev.filter(w => w.id !== id))
  }

  const handleSaveGoals = async (updated: Partial<NutritionGoals>) => {
    const saved = await saveNutritionGoals(userId, updated)
    setGoals(saved)
  }

  return (
    <div className="animate-fade-in space-y-6 pb-12 max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* ─── 1. NUTRITRACK HEADER & SUB-NAVIGATION ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight flex items-center gap-2">
              <span>NutriTrack</span>
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              Nutrition System
            </span>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-0.5">
            Track daily calories, macros, hydration, and smart meal photo estimates.
          </p>
        </div>

        {/* Navigation Tabs & Settings */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center bg-surface-100 p-1 rounded-xl border border-surface-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              id="nutritrack-tab-dashboard"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-surface-900 shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <LayoutDashboard size={14} className={activeTab === 'dashboard' ? 'text-emerald-600' : ''} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              id="nutritrack-tab-library"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'library'
                  ? 'bg-white text-surface-900 shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <BookOpen size={14} className={activeTab === 'library' ? 'text-emerald-600' : ''} />
              <span>Food Library</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              id="nutritrack-tab-analytics"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-white text-surface-900 shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <LineChart size={14} className={activeTab === 'analytics' ? 'text-emerald-600' : ''} />
              <span>History</span>
            </button>
          </div>

          <button
            onClick={() => setIsGoalsModalOpen(true)}
            id="open-goals-modal-btn"
            className="p-2 rounded-xl text-surface-600 hover:text-surface-900 bg-white border border-surface-200 hover:bg-surface-50 transition-colors shadow-2xs"
            title="Configure Nutrition Goals"
            aria-label="Configure Nutrition Goals"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* ─── 2. TAB: DASHBOARD ─── */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Bar: Streak Card + Date Navigator */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Nutrition Streak Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                <Flame size={16} />
              </div>
              <div>
                <div className="text-xs font-black text-emerald-950 leading-none">
                  {streak > 0 ? `${streak}-Day Nutrition Streak` : '0-Day Logging Streak'}
                </div>
                <div className="text-[10.5px] text-emerald-700 font-medium mt-0.5 leading-none">
                  {streak > 0
                    ? 'Consistency fuels athletic transformation!'
                    : 'Log today to ignite your streak!'}
                </div>
              </div>
            </div>

            {/* Date Navigator */}
            <DateNavigator
              selectedDate={selectedDate}
              onSelectDate={d => setSelectedDate(d)}
            />
          </div>

          {loading ? (
            <div className="py-20 text-center text-surface-400 flex flex-col items-center justify-center gap-2">
              <Loader2 size={28} className="animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">Loading daily nutrition entries...</p>
            </div>
          ) : (
            <>
              {/* Today's Progress Card (Calorie Ring) */}
              <CalorieProgressCard
                consumed={dailyTotals.calories}
                target={goals.calorie_target}
                onEditGoals={() => setIsGoalsModalOpen(true)}
              />

              {/* Macronutrient Summary Cards (Protein, Carbs, Fat, Fiber) */}
              <MacroSummaryCards
                protein={dailyTotals.protein}
                proteinTarget={goals.protein_target}
                carbs={dailyTotals.carbs}
                carbsTarget={goals.carb_target}
                fat={dailyTotals.fat}
                fatTarget={goals.fat_target}
                fiber={dailyTotals.fiber}
                fiberTarget={goals.fiber_target}
              />

              {/* Nutrition Insights Strip */}
              {insights.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/60 border border-emerald-200/80 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb size={15} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                        NutriTrack Daily Insights
                      </h4>
                      <ul className="mt-1 space-y-1">
                        {insights.map((item, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-surface-700 flex items-center gap-1.5 font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── QUICK ACTION CARDS (Log Meal & Photo Camera) ─── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Card 1: Log Meal */}
                <div className="p-4 rounded-2xl bg-white border border-surface-200/80 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                      <UtensilsCrossed size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-surface-900">Log Food</h3>
                      <p className="text-xs text-surface-500 mt-0.5">
                        Search verified items, customize portions, or enter quick calories.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenAdd('breakfast')}
                      id="card-quick-log-btn"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
                    >
                      <Plus size={14} />
                      <span>Quick Log</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('library')}
                      id="card-browse-library-btn"
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-surface-700 bg-surface-100 hover:bg-surface-200 transition-colors"
                    >
                      <BookOpen size={14} />
                      <span>Library</span>
                    </button>
                  </div>
                </div>

                {/* Card 2: Meal Photo Scanner (AI Food Analysis) */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-white to-surface-50 border border-emerald-200/80 shadow-2xs hover:border-emerald-400 transition-all flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Camera size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-surface-900">Meal Photo AI</h3>
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                          Vision
                        </span>
                      </div>
                      <p className="text-xs text-surface-500 mt-0.5">
                        Snap or upload a meal image to identify items and estimate macros with AI.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleOpenCamera('camera')}
                      id="card-take-photo-btn"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-colors"
                    >
                      <Camera size={14} />
                      <span>Take Photo</span>
                    </button>
                    <button
                      onClick={() => handleOpenCamera('upload')}
                      id="card-upload-photo-btn"
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-surface-700 bg-surface-100 hover:bg-surface-200 transition-colors"
                    >
                      <Upload size={14} />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Water Tracker Card */}
              <WaterTrackerCard
                entries={waterEntries}
                targetMl={goals.water_target}
                onAddWater={handleAddWater}
                onDeleteWater={handleDeleteWater}
              />

              {/* Daily Meal Diary Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-surface-900 tracking-tight">
                      Daily Meal Diary
                    </h2>
                    <p className="text-xs text-surface-500 font-medium">
                      Review foods logged for {selectedDate}.
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenAdd('breakfast')}
                    id="quick-log-food-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Log Food</span>
                  </button>
                </div>

                <MealSection
                  mealType="breakfast"
                  entries={mealEntries.breakfast}
                  onOpenAddModal={handleOpenAdd}
                  onOpenEditModal={handleOpenEdit}
                  onDeleteEntry={handleDeleteFoodEntry}
                />

                <MealSection
                  mealType="lunch"
                  entries={mealEntries.lunch}
                  onOpenAddModal={handleOpenAdd}
                  onOpenEditModal={handleOpenEdit}
                  onDeleteEntry={handleDeleteFoodEntry}
                />

                <MealSection
                  mealType="dinner"
                  entries={mealEntries.dinner}
                  onOpenAddModal={handleOpenAdd}
                  onOpenEditModal={handleOpenEdit}
                  onDeleteEntry={handleDeleteFoodEntry}
                />

                <MealSection
                  mealType="snack"
                  entries={mealEntries.snack}
                  onOpenAddModal={handleOpenAdd}
                  onOpenEditModal={handleOpenEdit}
                  onDeleteEntry={handleDeleteFoodEntry}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── 3. TAB: FOOD LIBRARY ─── */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <FoodLibraryView
            userId={userId}
            selectedDate={selectedDate}
            onLogFood={handleAddFoodEntry}
            onOpenCreateCustomFood={() => {
              setActiveMealType('breakfast')
              setIsAddModalOpen(true)
            }}
          />
        </div>
      )}

      {/* ─── 4. TAB: HISTORY & TRENDS ─── */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <NutritionAnalyticsView userId={userId} goals={goals} />
        </div>
      )}

      {/* ─── 5. MODALS ─── */}
      {/* Add Food Modal (Search, Quick Calories, Custom Food) */}
      <AddFoodModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        userId={userId}
        dateStr={selectedDate}
        initialMealType={activeMealType}
        onAddEntry={handleAddFoodEntry}
      />

      {/* Edit Food Modal */}
      <EditFoodModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        entry={editingEntry}
        onUpdateEntry={handleUpdateFoodEntry}
        onDeleteEntry={handleDeleteFoodEntry}
      />

      {/* Nutrition Goals Modal */}
      <NutritionGoalsModal
        open={isGoalsModalOpen}
        onOpenChange={setIsGoalsModalOpen}
        currentGoals={goals}
        onSaveGoals={handleSaveGoals}
      />

      {/* AI Food Camera & Photo Scanner Modal */}
      <FoodCameraModal
        open={isCameraModalOpen}
        onOpenChange={setIsCameraModalOpen}
        userId={userId}
        selectedDate={selectedDate}
        defaultMode={cameraMode}
        onLogMealItems={handleBatchLogItems}
      />
    </div>
  )
}
