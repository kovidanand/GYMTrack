import { TrendingUp, AlertTriangle, Flame, BarChart2, Award, Info } from 'lucide-react'
import type { StructuredWorkoutAnalysis } from '@/lib/coachAnalysis'

interface CoachSummaryProps {
  analysis: StructuredWorkoutAnalysis
}

export function CoachSummary({ analysis }: CoachSummaryProps) {
  const {
    totalWorkouts,
    recentSessionsCount,
    volumeChangePct,
    currentStreakDays,
    biggestImprovement,
    potentialPlateau
  } = analysis

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Overall Progression / Leading Lift */}
        <div className="card p-4 bg-gradient-to-br from-brand-50/50 to-white border-brand-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1">
              <Award size={14} className="text-brand-600" /> Progression Status
            </span>
            {biggestImprovement && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active Gains
              </span>
            )}
          </div>
          <p className="font-bold text-surface-900 text-lg line-clamp-1">
            {biggestImprovement ? biggestImprovement.exerciseName : totalWorkouts > 0 ? 'Baseline Phase' : 'No Workouts'}
          </p>
          <p className="text-xs text-surface-500 mt-0.5">
            {biggestImprovement?.oneRMChangePct
              ? `Est. 1RM advanced +${biggestImprovement.oneRMChangePct}%`
              : totalWorkouts > 0
              ? `${totalWorkouts} sessions tracked`
              : 'Log sets to begin'}
          </p>
        </div>

        {/* 2. Biggest Improvement */}
        <div className="card p-4 bg-gradient-to-br from-emerald-50/40 to-white border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-600" /> Best Advance
            </span>
          </div>
          <p className="font-bold text-surface-900 text-lg line-clamp-1">
            {biggestImprovement ? biggestImprovement.exerciseName : 'Establishing'}
          </p>
          <p className="text-xs text-surface-500 mt-0.5 font-mono">
            {biggestImprovement?.supportingData || 'Requires 2+ sessions per lift'}
          </p>
        </div>

        {/* 3. Potential Plateau */}
        <div className="card p-4 bg-gradient-to-br from-amber-50/40 to-white border-amber-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <AlertTriangle size={14} className="text-amber-600" /> Plateau Signal
            </span>
            {potentialPlateau ? (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Action Needed
              </span>
            ) : (
              <span className="text-[10px] font-bold text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">
                Clear
              </span>
            )}
          </div>
          <p className="font-bold text-surface-900 text-lg line-clamp-1">
            {potentialPlateau ? potentialPlateau.exerciseName : 'No Plateaus'}
          </p>
          <p className="text-xs text-surface-500 mt-0.5">
            {potentialPlateau?.plateauReason || 'All tracked lifts progressing normally'}
          </p>
        </div>

        {/* 4. Training Consistency & Volume */}
        <div className="card p-4 bg-gradient-to-br from-sky-50/40 to-white border-sky-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1">
              <Flame size={14} className="text-orange-500" /> Consistency
            </span>
            {currentStreakDays > 0 && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                {currentStreakDays}d streak
              </span>
            )}
          </div>
          <p className="font-bold text-surface-900 text-lg">
            {recentSessionsCount} workouts / 14d
          </p>
          <p className="text-xs text-surface-500 mt-0.5">
            {volumeChangePct != null
              ? `Volume: ${volumeChangePct >= 0 ? `+${volumeChangePct}%` : `${volumeChangePct}%`} vs prior period`
              : `${totalWorkouts} total completed sessions`}
          </p>
        </div>
      </div>
    </div>
  )
}
