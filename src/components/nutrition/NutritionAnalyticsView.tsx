import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts'
import { TrendingUp, Flame, Award, Loader2 } from 'lucide-react'
import { getNutritionHistory, type HistoryDayAggregate } from '@/lib/nutritionService'
import type { NutritionGoals } from '@/types/nutrition'

interface NutritionAnalyticsViewProps {
  userId: string
  goals: NutritionGoals
}

export function NutritionAnalyticsView({ userId, goals }: NutritionAnalyticsViewProps) {
  const [daysRange, setDaysRange] = useState<7 | 30>(7)
  const [historyData, setHistoryData] = useState<HistoryDayAggregate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    getNutritionHistory(userId, daysRange)
      .then(data => {
        if (active) setHistoryData(data)
      })
      .catch(console.error)
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [userId, daysRange])

  // Aggregate statistics
  const activeDays = historyData.filter(d => d.calories > 0)
  const totalCaloriesAllDays = activeDays.reduce((acc, curr) => acc + curr.calories, 0)
  const totalProteinAllDays = activeDays.reduce((acc, curr) => acc + curr.protein, 0)

  const avgCalories = activeDays.length > 0 ? Math.round(totalCaloriesAllDays / activeDays.length) : 0
  const avgProtein = activeDays.length > 0 ? Math.round(totalProteinAllDays / activeDays.length) : 0
  const daysGoalMet = historyData.filter(
    d => d.calories >= goals.calorie_target * 0.9 && d.calories <= goals.calorie_target * 1.1
  ).length

  // Chart data format
  const chartData = historyData.map(d => {
    const [, month, day] = d.date.split('-')
    return {
      date: `${month}/${day}`,
      calories: Math.round(d.calories),
      protein: Math.round(d.protein),
      carbs: Math.round(d.carbs),
      fat: Math.round(d.fat),
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-surface-900 tracking-tight">
            Nutrition History & Trends
          </h2>
          <p className="text-xs text-surface-500 font-medium">
            Intake trends calculated from your verified food diary logs.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-surface-100 p-1 rounded-xl">
          <button
            onClick={() => setDaysRange(7)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              daysRange === 7
                ? 'bg-white text-surface-900 shadow-xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDaysRange(30)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              daysRange === 30
                ? 'bg-white text-surface-900 shadow-xs'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Aggregate Metric Cards (Water removed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4 bg-white border border-surface-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-surface-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Calories</span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-surface-900 leading-tight">
            {avgCalories}
          </p>
          <span className="text-[10px] text-surface-400 font-semibold">kcal / active day</span>
        </div>

        <div className="card p-4 bg-white border border-surface-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-surface-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Protein</span>
            <TrendingUp size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-surface-900 leading-tight">
            {avgProtein}g
          </p>
          <span className="text-[10px] text-surface-400 font-semibold">Target: {goals.protein_target}g</span>
        </div>

        <div className="card p-4 bg-white border border-surface-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-surface-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Target Met</span>
            <Award size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-surface-900 leading-tight">
            {daysGoalMet}
          </p>
          <span className="text-[10px] text-surface-400 font-semibold">days within target</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-surface-400 flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
          <span className="text-xs font-medium">Loading nutrition trends...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart 1: Daily Calorie Intake vs Target */}
          <div className="card p-5 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-surface-900">
                  Daily Calorie Intake (kcal)
                </h3>
                <p className="text-xs text-surface-400">
                  Target: {goals.calorie_target} kcal / day
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                  <ReferenceLine
                    y={goals.calorie_target}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={{
                      value: `Target: ${goals.calorie_target}`,
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />
                  <Bar dataKey="calories" fill="#10b981" radius={[6, 6, 0, 0]} name="Calories" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Macronutrient Intake Trends */}
          <div className="card p-5 bg-white border border-surface-200 rounded-2xl shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-black text-surface-900">
                Macronutrient Breakdown (Grams)
              </h3>
              <p className="text-xs text-surface-400">
                Daily Protein, Carbs, and Fat progression
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="protein" fill="#3b82f6" name="Protein (g)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="carbs" fill="#f59e0b" name="Carbs (g)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fat" fill="#f43f5e" name="Fat (g)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
