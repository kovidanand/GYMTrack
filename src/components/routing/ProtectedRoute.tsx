import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { GYMTrackLogo } from '@/components/shared'

interface ProtectedRouteProps {
  requireOnboarding?: boolean
}

/**
 * Wraps protected routes.
 * - While auth is resolving/loading → show branded loading state (prevents redirect flash)
 * - If not authenticated → redirect to /login (preserve intended destination in location.state)
 * - If authenticated and requireOnboarding=true, but onboarding incomplete → redirect to /onboarding
 * - If authenticated and on /onboarding, but onboarding already complete → redirect to /dashboard
 */
export function ProtectedRoute({ requireOnboarding = false }: ProtectedRouteProps) {
  const { isAuthenticated, loading, initialized, profile } = useAuth()
  const location = useLocation()

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <GYMTrackLogo size="md" />
          <Loader2 size={24} className="animate-spin text-brand-500" aria-label="Loading" />
          <p className="text-xs text-surface-500 font-medium">Verifying access…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Preserve the URL the user was trying to visit
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If this route specifically requires completed onboarding, check profile
  if (requireOnboarding && profile && profile.onboarding_complete === false) {
    return <Navigate to="/onboarding" replace />
  }

  // If user is accessing /onboarding but already finished onboarding, send to dashboard
  if (location.pathname === '/onboarding' && profile?.onboarding_complete === true) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
