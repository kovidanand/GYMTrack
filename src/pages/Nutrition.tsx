import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  CalendarDays,
  LineChart,
  Settings,
  Plus,
  Loader2,
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

export default function Nutrition() {
  const { user } = useAuth()
  const userId = user?.id || 'guest_user'

  // View Mode: 'diary' or 'analytics'
  const [activeView, setActiveView] = useState<'diary' | 'analytics'>('diary')

  // Selected Date (YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])

  // Data States
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_NUTRITION_GOALS)
  const [entries, setEntries] = useState<FoodEntry[]>([])
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast')
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)

  // Fetch Goals
  const loadGoals = useCallback(async () => {
    if (!userId) return
    try {
      const g = await getNutritionGoals(userId)
      setGoals(g)
    } catch (err) {
      console.error(err)
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
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [userId, selectedDate])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

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

  const handleAddFoodEntry = async (
    entry: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await addFoodEntry(userId, entry)
    setEntries(prev => [...prev, created])
  }

  const handleUpdateFoodEntry = async (entryId: string, updates: Partial<FoodEntry>) => {
    const updated = await updateFoodEntry(userId, entryId, selectedDate, updates)
    if (updated) {
      setEntries(prev => prev.map(e => (e.id === entryId ? updated : e)))
    }
  }

  const handleDeleteFoodEntry = async (entryId: string) => {
    await deleteFoodEntry(userId, entryId, selectedDate)
    setEntries(prev => prev.filter(e => e.id !== entryId))
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
    <div className="animate-fade-in space-y-6 pb-6 max-w-4xl mx-auto w-full">
      {/* ─── 1. TOP HEADER & VIEW TOGGLE ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight">
              Nutrition Tracker
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Diary
            </span>
          </div>
          <p className="text-xs sm:text-sm text-surface-500 font-medium mt-0.5">
            Track daily calories, macros, hydration, and evidence-based nutrition goals.
          </p>
        </div>

        {/* View Switcher & Settings */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center bg-surface-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('diary')}
              id="nutrition-view-diary"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'diary'
                  ? 'bg-white text-surface-900 shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <CalendarDays size={14} className="text-brand-600" />
              <span>Diary</span>
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              id="nutrition-view-analytics"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'analytics'
                  ? 'bg-white text-surface-900 shadow-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <LineChart size={14} className="text-brand-600" />
              <span>Trends</span>
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

      {/* ─── 2. ACTIVE VIEW RENDER ─── */}
      {activeView === 'diary' ? (
        <div className="space-y-6">
          {/* Date Navigator */}
          <DateNavigator
            selectedDate={selectedDate}
            onSelectDate={d => setSelectedDate(d)}
          />

          {loading ? (
            <div className="py-20 text-center text-surface-400 flex flex-col items-center justify-center gap-2">
              <Loader2 size={28} className="animate-spin text-brand-600" />
              <p className="text-xs font-semibold">Loading daily nutrition entries...</p>
            </div>
          ) : (
            <>
              {/* Daily Calorie Progress Card */}
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

              {/* Water Tracker Card */}
              <WaterTrackerCard
                entries={waterEntries}
                targetMl={goals.water_target}
                onAddWater={handleAddWater}
                onDeleteWater={handleDeleteWater}
              />

              {/* Meal Sections (Breakfast, Lunch, Dinner, Snacks) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-surface-900 tracking-tight">
                    Food Diary Meals
                  </h2>
                  <button
                    onClick={() => handleOpenAdd('breakfast')}
                    id="quick-log-food-btn"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Quick Log</span>
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
      ) : (
        /* Analytics View */
        <NutritionAnalyticsView userId={userId} goals={goals} />
      )}

      {/* ─── 3. MODALS ─── */}
      <AddFoodModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        userId={userId}
        dateStr={selectedDate}
        initialMealType={activeMealType}
        onAddEntry={handleAddFoodEntry}
      />

      <EditFoodModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        entry={editingEntry}
        onUpdateEntry={handleUpdateFoodEntry}
        onDeleteEntry={handleDeleteFoodEntry}
      />

      <NutritionGoalsModal
        open={isGoalsModalOpen}
        onOpenChange={setIsGoalsModalOpen}
        currentGoals={goals}
        onSaveGoals={handleSaveGoals}
      />
    </div>
  )
}
