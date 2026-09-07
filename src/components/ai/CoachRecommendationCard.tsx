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
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-800'
        }
      case 'PLATEAU':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badgeBg: 'bg-amber-100 text-amber-800'
        }
      case 'VOLUME':
        return {
          icon: BarChart2,
          bg: 'bg-sky-50',
          border: 'border-sky-200',
          text: 'text-sky-700',
          badgeBg: 'bg-sky-100 text-sky-800'
        }
      case 'CONSISTENCY':
        return {
          icon: Calendar,
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-700',
          badgeBg: 'bg-indigo-100 text-indigo-800'
        }
      case 'RECOVERY':
      default:
        return {
          icon: ShieldCheck,
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          badgeBg: 'bg-purple-100 text-purple-800'
        }
    }
  }

  const config = getCategoryConfig(recommendation.category)
  const Icon = config.icon

  return (
    <div className={cn("card p-5 border transition-all hover:shadow-md", config.border)}>
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

        <span className="text-[10px] font-semibold text-surface-400 bg-surface-100 px-2 py-0.5 rounded">
          {recommendation.confidence} CONFIDENCE
        </span>
      </div>

      {/* Title & Recommendation */}
      <h3 className="font-bold text-surface-900 text-base mb-1.5">
        {recommendation.title}
      </h3>
      <p className="text-surface-700 text-sm leading-relaxed mb-3">
        {recommendation.recommendation}
      </p>

      {/* Reason */}
      <div className="text-xs text-surface-600 mb-3 bg-surface-50 p-2.5 rounded-lg border border-surface-200/60">
        <span className="font-semibold text-surface-800">Interpretation: </span>
        {recommendation.reason}
      </div>

      {/* Supporting Data (Transparency) */}
      <div className="flex items-start gap-1.5 text-[11px] text-surface-500 pt-2 border-t border-surface-100">
        <Database size={13} className="text-brand-500 mt-0.5 flex-shrink-0" />
        <span className="font-mono text-surface-600 font-medium">
          Evidence: {recommendation.supportingData}
        </span>
      </div>
    </div>
  )
}
