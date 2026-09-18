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
    <header className="hidden lg:block fixed top-0 left-0 right-0 z-30 bg-[#0D1017]/95 backdrop-blur-md border-b border-[#1F2633] shadow-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LEFT: Logo + Brand */}
        <div className="flex items-center gap-8">
          <GYMTrackLogo size="md" />
        </div>

        {/* CENTER: Clean Navigation Links (Home, Progress, Library, Plans) */}
        <nav aria-label="Desktop primary navigation">
          <ul className="flex items-center gap-1.5" role="list">
            {primaryNavItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  id={`top-nav-${item.label.toLowerCase()}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                      isActive
                        ? 'bg-brand-500/15 text-brand-300 shadow-2xs ring-1 ring-brand-500/30'
                        : 'text-surface-400 hover:text-white hover:bg-[#151A23]'
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
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-surface-300 bg-[#151A23] hover:bg-[#1A202B] hover:text-white border border-[#242D3C] transition-colors shadow-2xs"
              title="Open Workout Timer / Stopwatch"
              aria-label="Open Workout Timer"
            >
              <Timer size={16} className="text-brand-400" />
              <span>Timer</span>
            </button>
          )}

          {/* Divider */}
          <div className="h-5 w-px bg-[#1F2633] mx-1" aria-hidden="true" />

          {/* Profile & Avatar */}
          {user && (
            <div className="flex items-center gap-2">
              <NavLink
                to="/profile"
                id="top-nav-profile"
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1 rounded-xl transition-colors',
                  isProfileActive
                    ? 'bg-[#151A23] text-white ring-1 ring-[#2E3848]'
                    : 'text-surface-400 hover:text-white hover:bg-[#151A23]'
                )}
                title={`Profile: ${fullName}`}
                aria-label={`View profile for ${fullName}`}
              >
                <Avatar name={fullName} size="sm" />
                <span className="text-xs font-semibold max-w-[110px] truncate text-surface-200">
                  {fullName}
                </span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-[#151A23] transition-colors"
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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0D1017]/95 backdrop-blur-md border-t border-[#1F2633] safe-area-inset-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
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
                  'flex flex-col items-center justify-center gap-1 py-1 text-xs font-semibold transition-all w-full rounded-lg select-none',
                  isActive
                    ? 'text-brand-400 font-bold'
                    : 'text-surface-500 hover:text-surface-300'
                )
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <div className={cn('relative flex items-center justify-center p-1 rounded-full transition-colors', isActive && 'bg-brand-500/15')}>
                    <item.icon size={20} aria-hidden="true" className={isActive ? 'text-brand-400 stroke-[2.5]' : 'text-surface-500'} />
                  </div>
                  <span className={cn('text-[10px] tracking-tight leading-none', isActive ? 'font-bold text-brand-300' : 'text-surface-500')}>{item.label}</span>
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
    <header className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-[#0D1017]/95 backdrop-blur-md border-b border-[#1F2633] px-4 h-14 flex items-center justify-between shadow-sm">
      <GYMTrackLogo size="sm" />

      <div className="flex items-center gap-2">
        {onOpenTimer && (
          <button
            onClick={onOpenTimer}
            id="mobile-header-timer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-surface-300 bg-[#151A23] hover:bg-[#1A202B] hover:text-white transition-colors border border-[#242D3C]"
            title="Open Workout Timer / Stopwatch"
            aria-label="Open Workout Timer"
          >
            <Timer size={15} className="text-brand-400" />
            <span>Timer</span>
          </button>
        )}

        {user && (
          <NavLink
            to="/profile"
            className="p-0.5 rounded-full hover:ring-2 hover:ring-brand-500 transition-all"
            aria-label="View profile"
          >
            <Avatar name={fullName} size="sm" />
          </NavLink>
        )}
      </div>
    </header>
  )
}

