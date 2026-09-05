import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, BookOpen, TrendingUp, User, LogOut, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { GYMTrackLogo, Avatar } from '@/components/shared'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/exercises', label: 'Exercise Library', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/ai-coach', label: 'AI Coach', icon: Sparkles },
  { to: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (signOut) await signOut()
    navigate('/')
  }

  const fullName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : (user?.email?.split('@')[0] || 'Athlete')

  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 min-h-screen bg-white border-r border-surface-200 fixed top-0 left-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-100">
        <GYMTrackLogo size="md" />
      </div>

      {/* Start Workout CTA */}
      <div className="px-4 pt-5 pb-2">
        <button
          onClick={() => navigate('/workouts')}
          className="btn-primary w-full text-sm py-2.5"
          id="sidebar-start-workout"
          aria-label="Start a workout"
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
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/ai-coach', label: 'AI Coach', icon: Sparkles },
  { to: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-surface-200 safe-area-inset-bottom"
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
                  isActive ? 'text-brand-600' : 'text-surface-500'
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

export function MobileTopBar() {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b border-surface-200 px-4 py-3">
      <GYMTrackLogo size="sm" />
    </div>
  )
}
