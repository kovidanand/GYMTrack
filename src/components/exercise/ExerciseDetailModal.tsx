import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Trophy, 
  Activity, 
  Calendar, 
  Flame, 
  ExternalLink, 
  Layers, 
  ChevronRight,
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useExerciseIntelligence } from '@/hooks/useExerciseIntelligence'
import { ExerciseProgressionGraph } from '@/components/exercise/ExerciseProgressionGraph'
import { formatRelativeDate } from '@/lib/utils'

interface ExerciseDetailModalProps {
  exerciseId: string | null
  exerciseName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExerciseDetailModal({
  exerciseId,
  exerciseName: fallbackName,
  open,
  onOpenChange
}: ExerciseDetailModalProps) {
  const { intelligence, loading, error } = useExerciseIntelligence(exerciseId)
  const [activeTab, setActiveTab] = useState<'analytics' | 'history'>('analytics')

  const displayName = intelligence?.exerciseName || fallbackName || 'Exercise Intelligence'

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm animate-fade-in" />
        <RadixDialog.Content
          className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl max-h-[88vh] bg-white rounded-2xl shadow-2xl animate-scale-in focus:outline-none flex flex-col overflow-hidden"
          aria-describedby="exercise-modal-description"
        >
          {/* ── Modal Header ── */}
          <div className="p-6 pb-4 border-b border-surface-100 flex items-start justify-between bg-surface-50/50">
            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                  <Activity size={18} />
                </span>
                <RadixDialog.Title className="text-xl font-bold text-surface-900">
                  {displayName}
                </RadixDialog.Title>
              </div>
              <p id="exercise-modal-description" className="text-xs text-surface-500">
                Performance analytics, 1RM tracking, and set-by-set workout history.
              </p>
            </div>

            <RadixDialog.Close asChild>
              <button
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </RadixDialog.Close>
          </div>

          {/* ── Modal Body ── */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                <p className="text-sm text-surface-500 font-medium">Analyzing exercise performance...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
                {error}
              </div>
            ) : intelligence ? (
              <>
                {/* ── Metric Highlights ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Current 1RM */}
                  <div className="card p-3.5 bg-gradient-to-br from-brand-50/60 to-white border-brand-100">
                    <p className="text-[11px] font-bold text-brand-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles size={13} className="text-brand-500" /> Current 1RM
                    </p>
                    <p className="text-2xl font-black text-surface-900 tracking-tight">
                      {intelligence.isBodyweightOrTimed
                        ? 'Bodyweight'
                        : intelligence.current1RM
                        ? `${intelligence.current1RM} kg`
                        : '-'}
                    </p>
                    <p className="text-[10px] text-surface-500 mt-0.5">
                      {intelligence.isBodyweightOrTimed ? 'Tracked via Reps' : 'Epley Formula estimate'}
                    </p>
                  </div>

                  {/* Personal Best */}
                  <div className="card p-3.5 bg-gradient-to-br from-amber-50/50 to-white border-amber-100">
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Trophy size={13} className="text-amber-500" /> Personal Best
                    </p>
                    <p className="text-2xl font-black text-surface-900 tracking-tight">
                      {intelligence.best1RM
                        ? `${intelligence.best1RM} kg`
                        : intelligence.bestWeight
                        ? `${intelligence.bestWeight} kg`
                        : '-'}
                    </p>
                    <p className="text-[10px] text-surface-500 mt-0.5">
                      {intelligence.bestWeight ? `Peak weight: ${intelligence.bestWeight} kg` : 'No heavy sets'}
                    </p>
                  </div>

                  {/* Recent Performance */}
                  <div className="card p-3.5">
                    <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Flame size={13} className="text-orange-500" /> Latest Effort
                    </p>
                    <p className="text-2xl font-black text-surface-900 tracking-tight">
                      {intelligence.latestWeight != null && intelligence.latestReps != null
                        ? `${intelligence.latestWeight} × ${intelligence.latestReps}`
                        : intelligence.latestReps != null
                        ? `${intelligence.latestReps} reps`
                        : '-'}
                    </p>
                    <p className="text-[10px] text-surface-500 mt-0.5">
                      {intelligence.lastPerformedDate
                        ? formatRelativeDate(intelligence.lastPerformedDate)
                        : 'Never logged'}
                    </p>
                  </div>

                  {/* Total Sessions */}
                  <div className="card p-3.5">
                    <p className="text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Layers size={13} className="text-indigo-500" /> Sessions
                    </p>
                    <p className="text-2xl font-black text-surface-900 tracking-tight">
                      {intelligence.totalSessions}
                    </p>
                    <p className="text-[10px] text-surface-500 mt-0.5">
                      {intelligence.totalSets} total completed sets
                    </p>
                  </div>
                </div>

                {/* ── Tabs ── */}
                <div className="flex border-b border-surface-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 -mb-px ${
                      activeTab === 'analytics'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-surface-500 hover:text-surface-800'
                    }`}
                  >
                    Progression Graph
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 -mb-px ${
                      activeTab === 'history'
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-surface-500 hover:text-surface-800'
                    }`}
                  >
                    Set-by-Set History ({intelligence.sessions.length} sessions)
                  </button>
                </div>

                {/* ── Tab Content: Graph ── */}
                {activeTab === 'analytics' && (
                  <div className="space-y-4">
                    <ExerciseProgressionGraph
                      points={intelligence.progressionPoints}
                      isBodyweightOrTimed={intelligence.isBodyweightOrTimed}
                      trend={intelligence.trend}
                      trendPercentage={intelligence.trendPercentage}
                    />

                    {/* Progression Highlights Footer */}
                    {intelligence.latestProgressionDate && (
                      <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl text-xs text-surface-600 border border-surface-200/60">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar size={14} className="text-brand-500" />
                          Latest Progression Milestone
                        </span>
                        <span className="font-semibold text-surface-900">
                          {new Date(intelligence.latestProgressionDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Tab Content: History ── */}
                {activeTab === 'history' && (
                  <div className="space-y-4">
                    {intelligence.sessions.length > 0 ? (
                      intelligence.sessions.map((session) => (
                        <div
                          key={session.sessionId}
                          className="card overflow-hidden border border-surface-200/80 bg-white"
                        >
                          <div className="p-3.5 bg-surface-50/70 border-b border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <h5 className="font-bold text-sm text-surface-900">
                                {session.workoutName}
                              </h5>
                              <p className="text-[11px] text-surface-500">
                                {session.formattedDate}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-surface-600">
                              {session.best1RM && !intelligence.isBodyweightOrTimed && (
                                <span className="bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded">
                                  Best 1RM: {session.best1RM} kg
                                </span>
                              )}
                              {session.maxWeight && (
                                <span className="text-surface-700 font-medium">
                                  Top: {session.maxWeight} kg
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-white text-surface-400 font-semibold uppercase border-b border-surface-100">
                                <tr>
                                  <th className="px-4 py-2">Set</th>
                                  <th className="px-4 py-2 text-center">Weight</th>
                                  <th className="px-4 py-2 text-center">Reps</th>
                                  {!intelligence.isBodyweightOrTimed && (
                                    <th className="px-4 py-2 text-center">Est. 1RM</th>
                                  )}
                                  <th className="px-4 py-2 text-right">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-surface-100">
                                {session.sets.map((set) => (
                                  <tr key={set.id} className="hover:bg-surface-50/50">
                                    <td className="px-4 py-2.5 font-bold text-surface-800">
                                      #{set.setNumber}
                                    </td>
                                    <td className="px-4 py-2.5 text-center text-surface-700 font-medium">
                                      {set.weight != null && set.weight > 0 ? `${set.weight} kg` : 'Bodyweight'}
                                    </td>
                                    <td className="px-4 py-2.5 text-center text-surface-700 font-medium">
                                      {set.reps != null ? `${set.reps}` : '-'}
                                    </td>
                                    {!intelligence.isBodyweightOrTimed && (
                                      <td className="px-4 py-2.5 text-center text-brand-600 font-bold">
                                        {set.estimated1RM ? `${set.estimated1RM} kg` : '-'}
                                      </td>
                                    )}
                                    <td className="px-4 py-2.5 text-right">
                                      {set.isPersonalRecord ? (
                                        <span className="inline-block bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                                          PR
                                        </span>
                                      ) : (
                                        <span className="text-surface-400 text-[11px]">Completed</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-surface-500 card bg-surface-50/50">
                        No previous session records found for this exercise.
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* ── Modal Footer ── */}
          <div className="p-4 px-6 border-t border-surface-100 flex items-center justify-between bg-surface-50">
            {intelligence?.slug ? (
              <Link
                to={`/exercises/${intelligence.slug}`}
                onClick={() => onOpenChange(false)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors"
              >
                View Instructions & Form Cues <ExternalLink size={13} />
              </Link>
            ) : (
              <span className="text-xs text-surface-400">GYMTrack Intelligence Engine</span>
            )}

            <button
              type="button"
              className="btn-secondary text-xs py-1.5 px-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </button>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
