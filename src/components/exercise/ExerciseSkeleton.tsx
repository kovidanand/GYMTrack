import { cn } from '@/lib/utils'

export function ExerciseSkeleton({ className }: { className?: string }) {
  return (
    <article className={cn("card overflow-hidden animate-pulse", className)}>
      {/* Illustration Area Skeleton */}
      <div className="h-28 mb-4 -mx-5 -mt-5 bg-surface-200 rounded-t-xl" />

      <div className="space-y-3">
        {/* Title Skeleton */}
        <div className="h-4 bg-surface-200 rounded w-3/4" />

        {/* Tags Skeleton */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-surface-200 rounded-full" />
          <div className="h-5 w-20 bg-surface-200 rounded-full" />
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-14 bg-surface-200 rounded-full" />
          <div className="h-3 w-12 bg-surface-200 rounded" />
        </div>
      </div>
    </article>
  )
}
