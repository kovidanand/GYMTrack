import { TrendingUp, AlertTriangle, BarChart2, Calendar, ShieldCheck, Database } from 'lucide-react'
import type { CoachRecommendation } from '@/lib/coachAnalysis'
import { cn } from '@/lib/utils'

interface CoachRecommendationCardProps {
  recommendation: CoachRecommendation
}

export function CoachRecommendationCard({ recommendation }: CoachRecommendationCardProps) {
  const getCategoryConfig = (cat: CoachRecommendation['category']) => {
    switch (cat) {
      case 'PROGRESSION':
        return {
          icon: TrendingUp,
          bg: 'bg-emerald-950/60',
          border: 'border-emerald-800/40',
          text: 'text-emerald-400',
          badgeBg: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
        }
      case 'PLATEAU':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-950/60',
          border: 'border-amber-800/40',
          text: 'text-amber-400',
          badgeBg: 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
        }
      case 'VOLUME':
        return {
          icon: BarChart2,
          bg: 'bg-sky-950/60',
          border: 'border-sky-800/40',
          text: 'text-sky-400',
          badgeBg: 'bg-sky-950/80 text-sky-300 border border-sky-800/40'
        }
      case 'CONSISTENCY':
        return {
          icon: Calendar,
          bg: 'bg-indigo-950/60',
          border: 'border-indigo-800/40',
          text: 'text-indigo-400',
          badgeBg: 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/40'
        }
      case 'RECOVERY':
      default:
        return {
          icon: ShieldCheck,
          bg: 'bg-purple-950/60',
          border: 'border-purple-800/40',
          text: 'text-purple-400',
          badgeBg: 'bg-purple-950/80 text-purple-300 border border-purple-800/40'
        }
    }
  }

  const config = getCategoryConfig(recommendation.category)
  const Icon = config.icon

  return (
    <div className={cn("p-5 rounded-2xl bg-[#151A23] border border-[#202733] shadow-xs transition-all hover:border-surface-600", config.border)}>
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("p-1.5 rounded-lg", config.bg, config.text)}>
            <Icon size={16} />
          </span>
          <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", config.badgeBg)}>
            {recommendation.category}
          </span>
        </div>

        <span className="text-[10px] font-semibold text-surface-400 bg-[#11151D] border border-[#202733] px-2 py-0.5 rounded">
          {recommendation.confidence} CONFIDENCE
        </span>
      </div>

      {/* Title & Recommendation */}
      <h3 className="font-bold text-white text-base mb-1.5">
        {recommendation.title}
      </h3>
      <p className="text-surface-300 text-sm leading-relaxed mb-3">
        {recommendation.recommendation}
      </p>

      {/* Reason */}
      <div className="text-xs text-surface-300 mb-3 bg-[#11151D] p-2.5 rounded-xl border border-[#202733]">
        <span className="font-semibold text-white">Interpretation: </span>
        {recommendation.reason}
      </div>

      {/* Supporting Data (Transparency) */}
      <div className="flex items-start gap-1.5 text-[11px] text-surface-400 pt-2 border-t border-[#202733]">
        <Database size={13} className="text-brand-400 mt-0.5 flex-shrink-0" />
        <span className="font-mono text-surface-400 font-medium">
          Evidence: {recommendation.supportingData}
        </span>
      </div>
    </div>
  )
}
