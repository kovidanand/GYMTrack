import { cn, formatTagLabel } from '@/lib/utils'
import { Link } from 'react-router-dom'

// ─── Logo ──────────────────────────────────────────────────────────────────────

export function GYMTrackLogo({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7', md: 'h-8', lg: 'h-10' }
  const textSizes = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }
  const iconSizes = { sm: 'w-6 h-6', md: 'w-7 h-7', lg: 'w-9 h-9' }

  return (
    <Link to="/" className={cn('flex items-center gap-2 select-none', className)} aria-label="GYMTrack home">
      <div className={cn('rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0', iconSizes[size])}>
        <svg viewBox="0 0 20 20" fill="none" className="w-4/5 h-4/5" aria-hidden="true">
          <path d="M3 10h2M15 10h2M5 10V7.5M5 10v2.5M15 10V7.5M15 10v2.5M5 7.5h10M5 12.5h10" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
        </svg>
      </div>
      <span className={cn('font-bold tracking-tight text-surface-900', textSizes[size], sizes[size])}>
        GYMTrack
      </span>
    </Link>
  )
}

// ─── Badge ─────────────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-100 text-surface-700',
    brand: 'bg-brand-50 text-brand-700 border border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    outline: 'border border-surface-200 text-surface-600',
  }
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  )
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className={cn('rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 overflow-hidden', sizes[size], className)}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-brand-700">{initials}</span>
      )}
    </div>
  )
}

// ─── StatCard ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export function StatCard({ label, value, unit, icon, trend, trendValue, className }: StatCardProps) {
  return (
    <div className={cn('card p-5 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <span className="label-sm">{label}</span>
        {icon && <div className="text-brand-500">{icon}</div>}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold text-surface-900 leading-none">{value}</span>
        {unit && <span className="text-sm text-surface-500 mb-0.5">{unit}</span>}
      </div>
      {trend && trendValue && (
        <div className={cn('flex items-center gap-1 text-xs font-medium', {
          'text-emerald-600': trend === 'up',
          'text-red-500': trend === 'down',
          'text-surface-500': trend === 'neutral',
        })}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trendValue}
        </div>
      )}
    </div>
  )
}

// ─── SearchInput ───────────────────────────────────────────────────────────────

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
  id?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className, id }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn('input-base pl-9')}
        aria-label={placeholder}
      />
    </div>
  )
}

// ─── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
      {icon && <div className="text-surface-300 mb-4">{icon}</div>}
      <h3 className="font-semibold text-surface-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-500 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  )
}

// ─── PageHeader ────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6', className)}>
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="mt-1 text-surface-500 text-sm">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4', className)}>
      <h2 className="section-title">{title}</h2>
      {action}
    </div>
  )
}

// ─── Button ────────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  asChild?: boolean
}

export function Button({ variant = 'primary', size = 'md', children, className, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg'
  const variants = {
    primary: 'bg-brand-500 text-white shadow-sm hover:bg-brand-600 hover:shadow-md',
    secondary: 'bg-white text-surface-700 border border-surface-200 shadow-sm hover:bg-surface-50 hover:border-surface-300',
    ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-900',
    danger: 'bg-red-500 text-white shadow-sm hover:bg-red-600',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

// ─── Card ──────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
}

export function Card({ children, className, hoverable, onClick }: CardProps) {
  return (
    <div
      className={cn('card p-5', hoverable && 'card-hover cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}

// ─── MuscleGroupIcon ───────────────────────────────────────────────────────────

const muscleColors: Record<string, string> = {
  chest: 'bg-rose-100 text-rose-600',
  back: 'bg-blue-100 text-blue-600',
  shoulders: 'bg-violet-100 text-violet-600',
  biceps: 'bg-sky-100 text-sky-600',
  triceps: 'bg-indigo-100 text-indigo-600',
  legs: 'bg-amber-100 text-amber-600',
  quads: 'bg-amber-100 text-amber-600',
  hamstrings: 'bg-orange-100 text-orange-600',
  glutes: 'bg-pink-100 text-pink-600',
  calves: 'bg-yellow-100 text-yellow-600',
  core: 'bg-teal-100 text-teal-600',
  full_body: 'bg-emerald-100 text-emerald-600',
  forearms: 'bg-cyan-100 text-cyan-600',
  traps: 'bg-purple-100 text-purple-600',
}

export function MuscleGroupBadge({ group, className }: { group: string; className?: string }) {
  const normKey = group ? group.toLowerCase().replace(/[-\s]+/g, '_') : ''
  const color = muscleColors[normKey] ?? 'bg-surface-100 text-surface-600'
  return (
    <span className={cn('badge border-0 text-[10px] font-semibold px-2 py-0.5 rounded-full', color, className)}>
      {formatTagLabel(group)}
    </span>
  )
}
