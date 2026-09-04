import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/layouts/AppLayout'
import Landing from '@/pages/Landing'
import { Login, Signup } from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import Workouts from '@/pages/Workouts'
import Exercises from '@/pages/Exercises'
import Progress from '@/pages/Progress'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"       element={<Landing />} />
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* App routes — wrapped in AppLayout (sidebar + mobile nav) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts"  element={<Workouts />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/progress"  element={<Progress />} />
            <Route path="/profile"   element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
