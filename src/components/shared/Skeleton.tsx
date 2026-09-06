import { cn } from '@/lib/utils'

// ─── Base Skeleton ────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-surface-200/60', className)}
      aria-hidden="true"
    />
  )
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

// ─── Card Skeleton ────────────────────────────────────────────────────────────

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: `${Math.max(40, 100 - i * 20)}%` }}
        />
      ))}
    </div>
  )
}

// ─── Workout Card Skeleton ────────────────────────────────────────────────────

export function WorkoutCardSkeleton() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

// ─── List Skeleton ────────────────────────────────────────────────────────────

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  )
}

// ─── Chart Skeleton ───────────────────────────────────────────────────────────

export function ChartSkeleton() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-40 rounded-lg" />
      </div>
      <div className="flex items-end gap-2 h-[200px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex items-end">
            <Skeleton
              className="w-full rounded-t"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard Skeleton ───────────────────────────────────────────────────────

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Today's Workout */}
      <Skeleton className="h-40 w-full rounded-2xl" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Two column section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
    </div>
  )
}
