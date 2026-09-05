import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

/**
 * Wraps protected routes.
 * - While auth is loading → show a spinner (prevents flash of redirect)
 * - If not authenticated → redirect to /login (preserve intended URL)
 * - If authenticated → render the route
 */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-brand-500" aria-label="Loading" />
          <p className="text-sm text-surface-500">Loading GYMTrack…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Preserve the URL the user was trying to visit so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
