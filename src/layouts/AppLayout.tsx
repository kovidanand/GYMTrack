import { useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { TopNavigation, MobileNav, MobileTopBar } from '@/components/layout/Navigation'
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
    <div className="min-h-screen bg-surface-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Desktop Top Navigation (NO left sidebar) */}
      <TopNavigation onOpenTimer={() => setIsTimerOpen(true)} />

      {/* Mobile Top Bar */}
      <MobileTopBar onOpenTimer={() => setIsTimerOpen(true)} />

      {/* Main Content Area: Centered, spacious professional dashboard */}
      <main className="flex-1 w-full pt-16 lg:pt-20 pb-28 lg:pb-12 max-w-[100vw] overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Workout Timer / Stopwatch Modal */}
      <WorkoutTimerModal isOpen={isTimerOpen} onOpenChange={setIsTimerOpen} />

      {/* Floating AI Coach Assistant (anchored at bottom-right) */}
      <FloatingAiCoach />
    </div>
  )
}
