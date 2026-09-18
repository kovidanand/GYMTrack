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
        <div className="p-4 bg-[#151A23] border border-[#202733] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1">
              <Award size={14} className="text-brand-400" /> Progression Status
            </span>
            {biggestImprovement && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                Active Gains
              </span>
            )}
          </div>
          <p className="font-bold text-white text-lg line-clamp-1">
            {biggestImprovement ? biggestImprovement.exerciseName : totalWorkouts > 0 ? 'Baseline' : 'No Workouts'}
          </p>
          <p className="text-xs text-surface-400 mt-0.5">
            {biggestImprovement?.oneRMChangePct
              ? `Est. 1RM advanced +${biggestImprovement.oneRMChangePct}%`
              : totalWorkouts > 0
              ? `${totalWorkouts} sessions tracked`
              : 'Log sets to begin'}
          </p>
        </div>

        {/* 2. Biggest Improvement */}
        <div className="p-4 bg-[#151A23] border border-[#202733] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-400" /> Best Advance
            </span>
          </div>
          <p className="font-bold text-white text-lg line-clamp-1">
            {biggestImprovement ? biggestImprovement.exerciseName : 'Establishing'}
          </p>
          <p className="text-xs text-surface-400 mt-0.5 font-mono">
            {biggestImprovement?.supportingData || 'Requires 2+ sessions per lift'}
          </p>
        </div>

        {/* 3. Potential Plateau */}
        <div className="p-4 bg-[#151A23] border border-[#202733] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <AlertTriangle size={14} className="text-amber-400" /> Plateau Signal
            </span>
            {potentialPlateau ? (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
                Action Needed
              </span>
            ) : (
              <span className="text-[10px] font-bold text-surface-400 bg-surface-800 px-2 py-0.5 rounded-full">
                Clear
              </span>
            )}
          </div>
          <p className="font-bold text-white text-lg line-clamp-1">
            {potentialPlateau ? potentialPlateau.exerciseName : 'No Plateaus'}
          </p>
          <p className="text-xs text-surface-400 mt-0.5">
            {potentialPlateau?.plateauReason || 'All tracked lifts progressing normally'}
          </p>
        </div>

        {/* 4. Training Consistency & Volume */}
        <div className="p-4 bg-[#151A23] border border-[#202733] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
              <Flame size={14} className="text-orange-400" /> Consistency
            </span>
            {currentStreakDays > 0 && (
              <span className="text-[10px] font-bold text-orange-400 bg-orange-950/60 border border-orange-800/40 px-2 py-0.5 rounded-full">
                {currentStreakDays}d streak
              </span>
            )}
          </div>
          <p className="font-bold text-white text-lg">
            {recentSessionsCount} workouts / 14d
          </p>
          <p className="text-xs text-surface-400 mt-0.5">
            {volumeChangePct != null
              ? `Volume: ${volumeChangePct >= 0 ? `+${volumeChangePct}%` : `${volumeChangePct}%`} vs prior period`
              : `${totalWorkouts} total completed sessions`}
          </p>
        </div>
      </div>
    </div>
  )
}
