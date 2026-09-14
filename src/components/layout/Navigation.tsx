import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, TrendingUp, User, LogOut, Timer, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { GYMTrackLogo, Avatar } from '@/components/shared'

interface TopNavigationProps {
  onOpenTimer?: () => void
}

const primaryNavItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
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
                      'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-surface-100 text-surface-900 font-semibold shadow-2xs'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                    )
                  }
                >
                  <item.icon size={17} aria-hidden="true" className="text-surface-500" />
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
  { to: '/exercises', label: 'Library', icon: BookOpen },
  { to: '/plans', label: 'Plans', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-surface-200 safe-area-inset-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.05)]"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center h-14" role="list">
        {mobileNavItems.map(item => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              id={`mobile-nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-1 text-xs font-medium transition-colors w-full',
                  isActive
                    ? 'text-brand-600 font-bold'
                    : 'text-surface-500 hover:text-surface-800'
                )
              }
              aria-label={item.label}
            >
              <item.icon size={19} aria-hidden="true" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
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

