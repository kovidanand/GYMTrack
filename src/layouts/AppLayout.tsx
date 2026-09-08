import { useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Sidebar, MobileNav, MobileTopBar } from '@/components/layout/Navigation'
import { FloatingAiCoach } from '@/components/ai/FloatingAiCoach'
import { WorkoutTimerModal } from '@/components/workout/WorkoutTimerModal'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'

export function AppLayout() {
  const { profile, loading } = useAuth()
  const location = useLocation()
  const [isTimerOpen, setIsTimerOpen] = useState(false)

  // Wait until profile is loaded to determine onboarding status
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    )
  }

  // Redirect to onboarding if not complete (and we are not already there)
  if (profile && !profile.onboarding_complete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Desktop sidebar */}
      <Sidebar onOpenTimer={() => setIsTimerOpen(true)} />

      {/* Mobile top bar */}
      <MobileTopBar onOpenTimer={() => setIsTimerOpen(true)} />

      {/* Main content */}
      <main
        className="lg:ml-60 xl:ml-64 min-h-screen
                   pt-[57px] lg:pt-0
                   pb-[88px] lg:pb-8"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Workout Timer / Stopwatch Modal */}
      <WorkoutTimerModal isOpen={isTimerOpen} onOpenChange={setIsTimerOpen} />

      {/* Floating AI Coach Assistant (available across all app pages except full chat) */}
      {location.pathname !== '/ai-coach' && <FloatingAiCoach />}
    </div>
  )
}
