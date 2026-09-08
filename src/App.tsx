import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import Landing from '@/pages/Landing'
import { Login, Signup } from '@/pages/Auth'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import AuthCallback from '@/pages/AuthCallback'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import Workouts from '@/pages/Workouts'
import Exercises from '@/pages/Exercises'
import ExerciseDetail from '@/pages/ExerciseDetail'
import WorkoutBuilder from '@/pages/WorkoutBuilder'
import WorkoutDetail from '@/pages/WorkoutDetail'
import WorkoutRunner from '@/pages/WorkoutRunner'
import Plans from '@/pages/Plans'
import PlanBuilder from '@/pages/PlanBuilder'
import Progress from '@/pages/Progress'
import Profile from '@/pages/Profile'
import History from '@/pages/History'
import SessionDetail from '@/pages/SessionDetail'
import AiCoach from '@/pages/AiCoach'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"                element={<Landing />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/signup"          element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/auth/callback"   element={<AuthCallback />} />

          {/* Protected standalone routes (No sidebar, onboarding permitted) */}
          <Route element={<ProtectedRoute requireOnboarding={false} />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/workouts/:id/run" element={<WorkoutRunner />} />
            <Route path="/workouts/quick" element={<WorkoutRunner />} />
          </Route>

          {/* Protected app routes — require completed onboarding */}
          <Route element={<ProtectedRoute requireOnboarding={true} />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workouts"  element={<Navigate to="/dashboard" replace />} />
              <Route path="/workouts/new" element={<WorkoutBuilder />} />
              <Route path="/workouts/:id" element={<WorkoutDetail />} />
              <Route path="/workouts/:id/edit" element={<WorkoutBuilder />} />
              <Route path="/plans" element={<Navigate to="/dashboard" replace />} />
              <Route path="/plans/new" element={<PlanBuilder />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/exercises/:slug" element={<ExerciseDetail />} />
              <Route path="/history" element={<Navigate to="/progress" replace />} />
              <Route path="/history/:id" element={<SessionDetail />} />
              <Route path="/progress"  element={<Progress />} />
              <Route path="/ai-coach"  element={<Navigate to="/dashboard" replace />} />
              <Route path="/profile"   element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
