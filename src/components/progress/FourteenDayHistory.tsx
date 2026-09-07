import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Dumbbell, 
  Info, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { formatDuration } from '@/lib/utils'
import { calculate1RM } from '@/lib/exerciseIntelligence'
import type { WorkoutSession, WorkoutPlan, Workout, WorkoutSessionSet } from '@/types'

interface FourteenDayHistoryProps {
  sessions: WorkoutSession[]
  activePlan?: WorkoutPlan | null
  workouts?: Workout[]
  className?: string
}

export type DayStatus = 
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'PLANNED'
  | 'REST_DAY'
  | 'NO_ACTIVITY'

interface DayExerciseSummary {
  exerciseName: string
  setsCount: number
  repsSummary: string
  weightSummary: string
  estimated1RM: number | null
  isPR: boolean
}

interface DayTrainingRecord {
  date: Date
  dateKey: string // YYYY-MM-DD
  dayOfWeek: string // MON, TUE...
  dayOfMonth: string // SEP 7
  isToday: boolean
  isFuture: boolean
  status: DayStatus
  session?: WorkoutSession
  exercises?: DayExerciseSummary[]
  plannedWorkoutName?: string
}

export function FourteenDayHistory({ 
  sessions, 
  activePlan, 
  workouts = [],
  className = '' 
}: FourteenDayHistoryProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  // 0 means current 14 days (today and preceding 13 days)
  const [offset14, setOffset14] = useState<number>(0)
  const [expandedDateKey, setExpandedDateKey] = useState<string | null>(null)
  const [sessionSetsMap, setSessionSetsMap] = useState<Record<string, WorkoutSessionSet[]>>({})
  const [loadingSets, setLoadingSets] = useState<boolean>(false)

  // Fetch sets for all sessions in this 14-day window to show set breakdown
  useEffect(() => {
    if (!user || sessions.length === 0) return

    async function loadSetsForSessions() {
      const sessionIds = sessions.map(s => s.id)
      if (sessionIds.length === 0) return

      try {
        setLoadingSets(true)
        const { data, error } = await supabase
          .from('workout_session_sets')
          .select('*')
          .in('session_id', sessionIds)
          .order('set_number', { ascending: true })

        if (!error && data) {
          const grouped: Record<string, WorkoutSessionSet[]> = {}
          data.forEach(set => {
            if (!grouped[set.session_id]) {
              grouped[set.session_id] = []
            }
            grouped[set.session_id].push(set)
          })
          setSessionSetsMap(grouped)
        }
      } catch (err) {
        console.error('[GYMTrack FourteenDayHistory] Failed to load sets:', err)
      } finally {
        setLoadingSets(false)
      }
    }

    loadSetsForSessions()
  }, [sessions, user])

  // Build the 14-day sequence
  const days: DayTrainingRecord[] = useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Base end date shifted by offset14 * 14 days
    const endDate = new Date(today)
    endDate.setDate(endDate.getDate() - (offset14 * 14))

    const records: DayTrainingRecord[] = []

    // Index sessions by local YYYY-MM-DD
    const sessionsByDate: Record<string, WorkoutSession[]> = {}
    sessions.forEach(s => {
      const d = new Date(s.started_at)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (!sessionsByDate[key]) sessionsByDate[key] = []
      sessionsByDate[key].push(s)
    })

    const now = new Date()
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    for (let i = 0; i < 14; i++) {
      const targetDate = new Date(endDate)
      targetDate.setDate(targetDate.getDate() - i)

      const year = targetDate.getFullYear()
      const month = String(targetDate.getMonth() + 1).padStart(2, '0')
      const day = String(targetDate.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`

      const dayOfWeek = targetDate.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()
      const dayOfMonth = targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const isToday = dateKey === todayKey
      const isFuture = targetDate.getTime() > now.getTime() && !isToday

      const daySessions = sessionsByDate[dateKey] || []
      const completedSession = daySessions.find(s => s.status === 'completed') || daySessions[0]

      let status: DayStatus = 'NO_ACTIVITY'
      let exercisesSummary: DayExerciseSummary[] | undefined = undefined

      if (completedSession) {
        status = 'COMPLETED'

        // Group sets by exercise
        const sets = sessionSetsMap[completedSession.id] || []
        const exMap: Record<string, WorkoutSessionSet[]> = {}
        sets.forEach(s => {
          if (!exMap[s.exercise_name]) exMap[s.exercise_name] = []
          exMap[s.exercise_name].push(s)
        })

        exercisesSummary = Object.entries(exMap).map(([exName, exSets]) => {
          const completedOnly = exSets.filter(s => s.completed)
          const validSet = completedOnly.find(s => s.weight && s.reps) || completedOnly[0]
          
          let est1RM: number | null = null
          if (validSet?.weight && validSet?.reps) {
            est1RM = calculate1RM(validSet.weight, validSet.reps)
          }

          const weights = completedOnly.map(s => s.weight).filter((w): w is number => w !== null && w !== undefined)
          const reps = completedOnly.map(s => s.reps).filter((r): r is number => r !== null && r !== undefined)

          const weightStr = weights.length > 0 ? `${Math.min(...weights) === Math.max(...weights) ? weights[0] : `${Math.min(...weights)}-${Math.max(...weights)}`} kg` : 'Bodyweight'
          const repsStr = reps.length > 0 ? `${Math.min(...reps) === Math.max(...reps) ? reps[0] : `${Math.min(...reps)}-${Math.max(...reps)}`}` : 'Reps'

          return {
            exerciseName: exName,
            setsCount: completedOnly.length || exSets.length,
            repsSummary: repsStr,
            weightSummary: weightStr,
            estimated1RM: est1RM,
            isPR: exSets.some(s => s.is_personal_record)
          }
        })
      } else if (activePlan) {
        // Evaluate planned or rest day based on plan frequency
        const dayIdx = (targetDate.getDay() + 6) % 7 // 0 = Mon, 6 = Sun
        const plannedWorkout = workouts.find(w => w.plan_id === activePlan.id && w.day_number === (dayIdx + 1))

        if (plannedWorkout) {
          status = isFuture || isToday ? 'PLANNED' : 'NO_ACTIVITY'
        } else if (activePlan.days_per_week && activePlan.days_per_week < 7) {
          // If unassigned in active plan, designate as Rest Day
          status = 'REST_DAY'
        }
      }

      records.push({
        date: targetDate,
        dateKey,
        dayOfWeek,
        dayOfMonth,
        isToday,
        isFuture,
        status,
        session: completedSession,
        exercises: exercisesSummary
      })
    }

    return records
  }, [sessions, activePlan, workouts, offset14, sessionSetsMap])

  // Aggregate statistics for this 14-day slice
  const summary = useMemo(() => {
    const completed = days.filter(d => d.status === 'COMPLETED')
    const totalVolume = completed.reduce((acc, d) => acc + (d.session?.total_volume || 0), 0)
    const totalSeconds = completed.reduce((acc, d) => acc + (d.session?.duration_seconds || 0), 0)
    return {
      completedCount: completed.length,
      totalVolumeKg: totalVolume,
      totalMinutes: Math.round(totalSeconds / 60)
    }
  }, [days])

  return (
    <section className={`card p-5 sm:p-7 space-y-6 ${className}`} aria-label="14-Day Training History">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-brand-50 text-brand-600">
              <Calendar size={18} />
            </span>
            <h2 className="text-xl font-bold text-surface-900 tracking-tight">
              14-Day Training History
            </h2>
          </div>
          <p className="text-xs text-surface-500">
            {offset14 === 0 
              ? 'Showing current 14 days of real workout telemetry.' 
              : `Showing past window (${offset14 * 14} days ago).`}
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {offset14 > 0 && (
            <button
              onClick={() => setOffset14(0)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-700 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={12} /> Today
            </button>
          )}

          <div className="flex items-center bg-surface-100 rounded-lg p-0.5 border border-surface-200">
            <button
              onClick={() => setOffset14(prev => prev + 1)}
              className="p-1.5 text-surface-600 hover:text-surface-900 hover:bg-white rounded transition-colors"
              title="Previous 14 Days"
              aria-label="Previous 14 Days"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-bold text-surface-600 select-none">
              {offset14 === 0 ? 'Current 14D' : `-${offset14 * 14}d`}
            </span>
            <button
              onClick={() => setOffset14(prev => Math.max(0, prev - 1))}
              disabled={offset14 === 0}
              className="p-1.5 text-surface-600 hover:text-surface-900 hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next 14 Days"
              aria-label="Next 14 Days"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 14-Day Performance Snapshot */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3.5 bg-gradient-to-br from-brand-50/70 to-white border-brand-100 text-center sm:text-left">
          <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wider mb-0.5">Sessions</p>
          <p className="text-2xl font-extrabold text-surface-900">{summary.completedCount} / 14</p>
          <p className="text-[10px] text-surface-500 mt-0.5">Completed Workouts</p>
        </div>

        <div className="card p-3.5 bg-gradient-to-br from-emerald-50/70 to-white border-emerald-100 text-center sm:text-left">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Total Load</p>
          <p className="text-2xl font-extrabold text-surface-900">
            {summary.totalVolumeKg > 1000 
              ? `${(summary.totalVolumeKg / 1000).toFixed(1)}k` 
              : summary.totalVolumeKg} <span className="text-xs font-medium text-surface-500">kg</span>
          </p>
          <p className="text-[10px] text-surface-500 mt-0.5">Logged Volume</p>
        </div>

        <div className="card p-3.5 bg-gradient-to-br from-amber-50/70 to-white border-amber-100 text-center sm:text-left">
          <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Time Trained</p>
          <p className="text-2xl font-extrabold text-surface-900">
            {formatDuration(summary.totalMinutes * 60)}
          </p>
          <p className="text-[10px] text-surface-500 mt-0.5">Active Duration</p>
        </div>
      </div>

      {/* 14-Day Timeline Grid / List */}
      <div className="space-y-2.5">
        {days.map(d => {
          const isExpanded = expandedDateKey === d.dateKey
          const hasSession = d.status === 'COMPLETED' && d.session

          return (
            <div
              key={d.dateKey}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                d.isToday 
                  ? 'border-brand-300 bg-brand-50/20 shadow-sm' 
                  : d.status === 'COMPLETED'
                  ? 'border-surface-200 hover:border-surface-300 bg-white'
                  : d.status === 'REST_DAY'
                  ? 'border-surface-100 bg-surface-50/60 opacity-80'
                  : 'border-surface-100 bg-white'
              }`}
            >
              {/* Day Header Row */}
              <div 
                className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 ${hasSession ? 'cursor-pointer select-none' : ''}`}
                onClick={() => hasSession && setExpandedDateKey(isExpanded ? null : d.dateKey)}
              >
                {/* Date & Weekday */}
                <div className="flex items-center gap-3 min-w-[120px]">
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-center font-bold flex-shrink-0 ${
                    d.isToday 
                      ? 'bg-brand-500 text-white shadow-sm' 
                      : d.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-surface-100 text-surface-600'
                  }`}>
                    <span className="text-[10px] uppercase leading-none font-bold">{d.dayOfWeek}</span>
                    <span className="text-sm leading-tight font-extrabold">{d.date.getDate()}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-surface-900 text-sm">{d.dayOfMonth}</span>
                      {d.isToday && (
                        <span className="badge bg-brand-100 text-brand-700 text-[10px] py-0.5 px-1.5">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 font-medium line-clamp-1">
                      {d.session?.workout_name || (d.status === 'REST_DAY' ? 'Rest Day' : d.status === 'PLANNED' ? 'Scheduled Training' : 'No Activity')}
                    </p>
                  </div>
                </div>

                {/* Status Badge & Metrics */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {d.status === 'COMPLETED' ? (
                    <div className="flex items-center gap-3">
                      {d.session?.total_volume ? (
                        <span className="text-xs font-bold text-surface-700 hidden sm:inline">
                          {d.session.total_volume.toLocaleString()} kg
                        </span>
                      ) : null}

                      <span className="inline-flex items-center gap-1 badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold py-1 px-2">
                        <CheckCircle2 size={13} /> Completed
                      </span>

                      <button 
                        type="button" 
                        className="text-surface-400 hover:text-surface-600 p-1"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  ) : d.status === 'REST_DAY' ? (
                    <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
                      Rest Day
                    </span>
                  ) : d.status === 'PLANNED' ? (
                    <span className="badge bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold">
                      Planned
                    </span>
                  ) : (
                    <span className="text-xs text-surface-400 font-medium">
                      No Activity
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Session Detail View */}
              {isExpanded && d.session && (
                <div className="px-4 pb-4 pt-1 border-t border-surface-100 bg-surface-50/50 animate-fade-in space-y-3">
                  {/* Session Metrics Bar */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-surface-600 pt-2">
                    {d.session.duration_seconds ? (
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock size={13} className="text-surface-400" />
                        {formatDuration(d.session.duration_seconds)}
                      </span>
                    ) : null}

                    <span className="flex items-center gap-1 font-semibold">
                      <Dumbbell size={13} className="text-surface-400" />
                      {d.session.completed_sets} sets completed
                    </span>

                    {d.session.total_volume ? (
                      <span className="flex items-center gap-1 font-semibold">
                        <Flame size={13} className="text-amber-500" />
                        {d.session.total_volume.toLocaleString()} kg total volume
                      </span>
                    ) : null}

                    <button
                      onClick={() => navigate(`/history/${d.session?.id}`)}
                      className="ml-auto text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      View Full Record →
                    </button>
                  </div>

                  {/* Exercise Set Breakdown */}
                  {d.exercises && d.exercises.length > 0 ? (
                    <div className="bg-white rounded-lg border border-surface-200 divide-y divide-surface-100 overflow-hidden mt-2">
                      {d.exercises.map((ex, idx) => (
                        <div key={idx} className="p-2.5 px-3.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-surface-800">{ex.exerciseName}</span>
                            {ex.isPR && (
                              <span className="badge bg-amber-50 text-amber-700 border border-amber-200 text-[10px] py-0 px-1 font-bold flex items-center gap-0.5">
                                <Sparkles size={9} /> PR
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-surface-600 font-mono text-[11px]">
                            <span>{ex.setsCount} × {ex.repsSummary}</span>
                            <span className="font-bold text-surface-800">@ {ex.weightSummary}</span>
                            {ex.estimated1RM && (
                              <span className="badge bg-brand-50 text-brand-700 border-0 text-[10px] hidden sm:inline">
                                1RM: {ex.estimated1RM}kg
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : loadingSets ? (
                    <p className="text-xs text-surface-400 italic py-2">Loading detailed set logs...</p>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
