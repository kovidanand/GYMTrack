import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, BookOpen, Calendar, TrendingUp, User, LogOut, Plus, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { GYMTrackLogo, Avatar } from '@/components/shared'
import { ConnectionStatusBadge } from '@/components/shared/ConnectionStatusBadge'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/exercises', label: 'Library', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: User },
]

export function Sidebar({ onOpenTimer }: { onOpenTimer?: () => void }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (signOut) await signOut()
    navigate('/')
  }

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : (user?.email?.split('@')[0] || 'Athlete')

  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 min-h-screen bg-white border-r border-surface-200 fixed top-0 left-0 z-30">
      {/* Logo & Connection Status */}
      <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
        <GYMTrackLogo size="md" />
        <div className="flex items-center gap-1.5">
          {onOpenTimer && (
            <button
              onClick={onOpenTimer}
              className="p-1.5 rounded-lg text-surface-500 hover:text-brand-600 hover:bg-surface-100 transition-colors"
              title="Open Workout Timer / Stopwatch"
              aria-label="Open Workout Timer"
            >
              <Timer size={17} />
            </button>
          )}
          <ConnectionStatusBadge />
        </div>
      </div>

      {/* Start Workout CTA */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={() => navigate('/workouts/quick')}
          className="btn-primary w-full text-sm py-2.5 shadow-sm hover:shadow-brand-500/20"
          id="sidebar-start-workout"
          aria-label="Start today's workout"
        >
          <Plus size={15} />
          Start Workout
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-0.5" role="list">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                className={({ isActive }) =>
                  cn(isActive ? 'nav-link-active' : 'nav-link', 'w-full')
                }
              >
                <item.icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User profile at bottom */}
      {user && (
        <div className="border-t border-surface-100 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={fullName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">{fullName}</p>
              <p className="text-xs text-surface-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-ghost p-1.5 rounded-md text-surface-400 hover:text-surface-700"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

// ─── Mobile Bottom Navigation ──────────────────────────────────────────────────

const mobileNavItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/exercises', label: 'Library', icon: BookOpen },
  { to: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-surface-200 safe-area-inset-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.04)]"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-center" role="list">
        {mobileNavItems.map(item => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              id={`mobile-nav-${item.label.toLowerCase()}`}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 py-2.5 px-1 text-xs font-medium transition-colors w-full',
                  isActive ? 'text-brand-600 font-bold' : 'text-surface-500 hover:text-surface-800'
                )
              }
              aria-label={item.label}
            >
              <item.icon size={20} aria-hidden="true" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// ─── Mobile Top Bar ────────────────────────────────────────────────────────────

export function MobileTopBar({ onOpenTimer }: { onOpenTimer?: () => void }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-surface-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
      <GYMTrackLogo size="sm" />
      <div className="flex items-center gap-2">
        {onOpenTimer && (
          <button
            onClick={onOpenTimer}
            className="p-1.5 rounded-lg text-surface-600 hover:text-brand-600 hover:bg-surface-100 transition-colors"
            title="Open Workout Timer / Stopwatch"
            aria-label="Open Workout Timer"
          >
            <Timer size={18} />
          </button>
        )}
        <ConnectionStatusBadge />
      </div>
    </div>
  )
}

