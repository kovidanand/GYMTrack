import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  LineChart,
  Loader2,
  Flame,
  Lightbulb,
  Target,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  getNutritionGoals,
  saveNutritionGoals,
  getFoodEntriesForDate,
  addFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
  calculateNutritionStreak,
  generateNutritionInsights,
  DEFAULT_NUTRITION_GOALS,
} from '@/lib/nutritionService'
import { toLocalISODate } from '@/lib/dateUtils'
import type {
  FoodEntry,
  MealType,
  NutritionGoals,
} from '@/types/nutrition'

import { DateNavigator } from '@/components/nutrition/DateNavigator'
import { TodaysProgressCard } from '@/components/nutrition/TodaysProgressCard'
import { RecentFoodLog } from '@/components/nutrition/RecentFoodLog'
import { WeeklySummaryCard } from '@/components/nutrition/WeeklySummaryCard'
import { DashboardActionCards } from '@/components/nutrition/DashboardActionCards'
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

  // Selected Date (YYYY-MM-DD in local time)
  const [selectedDate, setSelectedDate] = useState(() => toLocalISODate())

  // Data States
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_NUTRITION_GOALS)
  const [entries, setEntries] = useState<FoodEntry[]>([])
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
      const fEntries = await getFoodEntriesForDate(userId, selectedDate)
      setEntries(fEntries)
    } catch (err) {
      console.error('Failed to load date entries:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, selectedDate])

  const handleDateChange = useCallback((newDate: string) => {
    setSelectedDate(newDate)
    window.dispatchEvent(new CustomEvent('gymtrack:date_selected', { detail: { date: newDate } }))
  }, [])

  useEffect(() => {
    loadGoals()
    loadStreak()
  }, [loadGoals, loadStreak])

  useEffect(() => {
    loadDateEntries()
  }, [loadDateEntries])

  // Sync date selection with AI Coach and listen for remote food log events
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('gymtrack:date_selected', { detail: { date: selectedDate } }))
  }, [selectedDate])

  useEffect(() => {
    const handleFoodLogged = () => {
      loadDateEntries()
      loadStreak()
    }
    window.addEventListener('gymtrack:food_logged', handleFoodLogged)
    return () => window.removeEventListener('gymtrack:food_logged', handleFoodLogged)
  }, [loadDateEntries, loadStreak])

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

  const handleSaveGoals = async (updated: Partial<NutritionGoals>) => {
    const saved = await saveNutritionGoals(userId, updated)
    setGoals(saved)
  }

  return (
    <div className="animate-fade-in space-y-6 pb-6 w-full">
      {/* ─── 1. HEADER & SUB-NAVIGATION ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight flex items-center gap-2">
                <span>NutriTrack</span>
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                Nutrition System
              </span>
            </div>
            <p className="text-xs sm:text-sm text-surface-500 font-medium mt-0.5">
              Track calories, macronutrients, and analyze food photos with intelligent AI.
            </p>
          </div>

          {/* Navigation Tabs, AI Assistant & Settings */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <div className="flex items-center bg-white p-1 rounded-xl border border-surface-200/90 shadow-2xs">
              <button
                onClick={() => setActiveTab('dashboard')}
                id="nutritrack-tab-dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('library')}
                id="nutritrack-tab-library"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'library'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                <BookOpen size={14} />
                <span>Food Library</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                id="nutritrack-tab-analytics"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                <LineChart size={14} />
                <span>History</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── 2. TAB: DASHBOARD ─── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Bar: Streak Badge + Date Navigator */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Nutrition Streak Badge */}
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <Flame size={16} />
                </div>
                <div>
                  <div className="text-xs font-black text-surface-900 leading-none">
                    {streak > 0 ? `${streak}-Day Nutrition Streak` : '0-Day Logging Streak'}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 leading-none">
                    {streak > 0
                      ? 'Consistency fuels athletic transformation!'
                      : 'Log your meals today to ignite your streak!'}
                  </div>
                </div>
              </div>

              {/* Date Navigator */}
              <DateNavigator
                selectedDate={selectedDate}
                onSelectDate={handleDateChange}
                userId={userId}
              />
            </div>

            {loading ? (
              <div className="py-20 text-center text-surface-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={28} className="animate-spin text-emerald-600" />
                <p className="text-xs font-semibold">Loading daily nutrition entries...</p>
              </div>
            ) : (
              /* ─── UNIFIED VERTICAL FLOW (Directly Below Today's Nutrition) ─── */
              <div className="space-y-6">
                {/* Section C: Today's Nutrition Summary Card (Calorie Ring + Macro Bars) */}
                <TodaysProgressCard
                  consumed={dailyTotals.calories}
                  target={goals.calorie_target}
                  protein={dailyTotals.protein}
                  proteinTarget={goals.protein_target}
                  carbs={dailyTotals.carbs}
                  carbsTarget={goals.carb_target}
                  fat={dailyTotals.fat}
                  fatTarget={goals.fat_target}
                  fiber={dailyTotals.fiber}
                  fiberTarget={goals.fiber_target}
                  selectedDate={selectedDate}
                  onEditGoals={() => setIsGoalsModalOpen(true)}
                />

                {/* Section D: Log Food and Analyze Meal Photo (Appearing directly below Today's Nutrition) */}
                <DashboardActionCards
                  onOpenAddModal={handleOpenAdd}
                  onOpenCameraModal={handleOpenCamera}
                />

                {/* Section E: Today's Logged Meals (Recent Food Log, Full Width) */}
                <RecentFoodLog
                  entries={entries}
                  selectedDate={selectedDate}
                  onOpenAddModal={handleOpenAdd}
                  onOpenEditModal={handleOpenEdit}
                  onDeleteEntry={handleDeleteFoodEntry}
                />

                {/* Section F: Useful History, Summary, and Insights */}
                <WeeklySummaryCard
                  userId={userId}
                  calorieTarget={goals.calorie_target}
                  proteinTarget={goals.protein_target}
                />

                {/* Daily Insight & Configured Targets in Balanced 2-Column Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {/* Data-Backed Daily Insight */}
                  <div className="p-5 rounded-2xl bg-white border border-surface-200/90 shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <Lightbulb size={16} className="text-emerald-600" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-surface-900">
                        Daily Insight
                      </h4>
                    </div>

                    <p className="text-xs text-surface-700 font-medium leading-relaxed">
                      {insights[0] || 'Log your meals to reveal data-backed insights comparing your intake to configured targets.'}
                    </p>
                  </div>

                  {/* Daily Goals Summary Card */}
                  <div className="p-5 rounded-2xl bg-white border border-surface-200/90 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-emerald-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-surface-900">
                          Your Configured Targets
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsGoalsModalOpen(true)}
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        Adjust Targets
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-100">
                        <span className="text-[10px] text-surface-400 font-bold block uppercase">
                          Calories
                        </span>
                        <span className="text-xs font-black text-surface-900">
                          {goals.calorie_target} kcal
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-100">
                        <span className="text-[10px] text-emerald-700 font-bold block uppercase">
                          Protein
                        </span>
                        <span className="text-xs font-black text-surface-900">
                          {goals.protein_target}g
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-100">
                        <span className="text-[10px] text-amber-800 font-bold block uppercase">
                          Carbs
                        </span>
                        <span className="text-xs font-black text-surface-900">
                          {goals.carb_target}g
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-100">
                        <span className="text-[10px] text-rose-700 font-bold block uppercase">
                          Fat
                        </span>
                        <span className="text-xs font-black text-surface-900">
                          {goals.fat_target}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
          onSwitchToLibrary={() => setActiveTab('library')}
        />
    </div>
  )
}
