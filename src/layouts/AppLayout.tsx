import { Outlet } from 'react-router-dom'
import { Sidebar, MobileNav, MobileTopBar } from '@/components/layout/Navigation'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile top bar */}
      <MobileTopBar />

      {/* Main content */}
      <main
        className="lg:ml-60 xl:ml-64 min-h-screen
                   pt-[57px] lg:pt-0
                   pb-[72px] lg:pb-0"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
