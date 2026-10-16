import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, TrendingUp, User, LogOut, Timer, CalendarDays, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { GYMTrackLogo, Avatar } from '@/components/shared'

interface TopNavigationProps {
  onOpenTimer?: () => void
}

const primaryNavItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/nutrition', label: 'NutriTrack', icon: UtensilsCrossed },
  { to: '/exercises', label: 'Library', icon: BookOpen },
  { to: '/plans', label: 'Plans', icon: CalendarDays },
]

// ─── Desktop Top Navigation ──────────────────────────────────────────────────
export function TopNavigation({ onOpenTimer }: TopNavigationProps) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    if (signOut) await signOut()
    navigate('/')
  }

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : (user?.email?.split('@')[0] || 'Athlete')

  const isProfileActive = location.pathname === '/profile'

  return (
    <header className="hidden lg:block fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-surface-200 shadow-2xs">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LEFT: Logo + Brand */}
        <div className="flex items-center gap-8">
          <GYMTrackLogo size="md" />
        </div>

        {/* CENTER: Clean Navigation Links (Home, Progress, Library) */}
        <nav aria-label="Desktop primary navigation">
          <ul className="flex items-center gap-1.5" role="list">
            {primaryNavItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  id={`top-nav-${item.label.toLowerCase()}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all',
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-2xs ring-1 ring-brand-200'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100/70'
                    )
                  }
                >
                  <item.icon size={16} aria-hidden="true" className={cn('transition-colors', 'text-current')} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* RIGHT: Timer Utility + Profile / Avatar */}
        <div className="flex items-center gap-3">
          {/* Primary Top Nav Timer Utility */}
          {onOpenTimer && (
            <button
              onClick={onOpenTimer}
              id="top-nav-timer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-surface-700 bg-surface-50 hover:bg-surface-100 hover:text-brand-600 border border-surface-200 transition-colors shadow-2xs"
              title="Open Workout Timer / Stopwatch"
              aria-label="Open Workout Timer"
            >
              <Timer size={16} className="text-brand-600" />
              <span>Timer</span>
            </button>
          )}

          {/* Divider */}
          <div className="h-5 w-px bg-surface-200 mx-1" aria-hidden="true" />

          {/* Profile & Avatar */}
          {user && (
            <div className="flex items-center gap-2">
              <NavLink
                to="/profile"
                id="top-nav-profile"
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1 rounded-lg transition-colors',
                  isProfileActive
                    ? 'bg-surface-100 text-surface-900 ring-1 ring-surface-300'
                    : 'text-surface-700 hover:bg-surface-50'
                )}
                title={`Profile: ${fullName}`}
                aria-label={`View profile for ${fullName}`}
              >
                <Avatar name={fullName} size="sm" />
                <span className="text-xs font-semibold max-w-[110px] truncate">
                  {fullName}
                </span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Mobile Bottom Navigation ──────────────────────────────────────────────────
const mobileNavItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/nutrition', label: 'NutriTrack', icon: UtensilsCrossed },
  { to: '/exercises', label: 'Library', icon: BookOpen },
  { to: '/plans', label: 'Plans', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-surface-200 safe-area-inset-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center h-16 px-1" role="list">
        {mobileNavItems.map(item => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              id={`mobile-nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-1.5 text-xs font-semibold transition-all w-full rounded-lg select-none',
                  isActive
                    ? 'text-brand-600 font-bold'
                    : 'text-surface-500 hover:text-surface-800'
                )
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <div className={cn('relative flex items-center justify-center p-0.5 rounded-full transition-colors', isActive && 'bg-brand-50')}>
                    <item.icon size={18} aria-hidden="true" className={isActive ? 'text-brand-600 stroke-[2.5]' : 'text-surface-500'} />
                  </div>
                  <span className={cn('text-[9.5px] sm:text-[10px] tracking-tight leading-none text-center truncate max-w-full', isActive ? 'font-bold text-brand-700' : 'text-surface-500')}>{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ─── Mobile Top Bar ────────────────────────────────────────────────────────────
export function MobileTopBar({ onOpenTimer }: TopNavigationProps) {
  const { user, profile } = useAuth()
  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : (user?.email?.split('@')[0] || 'Athlete')

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-b border-surface-200 px-4 h-14 flex items-center justify-between shadow-2xs">
      <GYMTrackLogo size="sm" />

      <div className="flex items-center gap-2">
        {onOpenTimer && (
          <button
            onClick={onOpenTimer}
            id="mobile-header-timer"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-surface-700 bg-surface-100 hover:bg-surface-200 transition-colors border border-surface-200"
            title="Open Workout Timer / Stopwatch"
            aria-label="Open Workout Timer"
          >
            <Timer size={15} className="text-brand-600" />
            <span>Timer</span>
          </button>
        )}

        {user && (
          <NavLink
            to="/profile"
            className="p-1 rounded-full hover:ring-2 hover:ring-brand-500 transition-all"
            aria-label="View profile"
          >
            <Avatar name={fullName} size="sm" />
          </NavLink>
        )}
      </div>
    </header>
  )
}

