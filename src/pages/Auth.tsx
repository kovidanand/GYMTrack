import { Link } from 'react-router-dom'
import { GYMTrackLogo } from '@/components/shared'

export function Login() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <p className="text-surface-500 text-sm">Welcome back. Sign in to continue.</p>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-surface-700 mb-1.5">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              className="input-base"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-surface-700 mb-1.5">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              className="input-base"
              autoComplete="current-password"
            />
          </div>

          {/* Phase 1: mock login — links directly to dashboard */}
          <Link
            to="/dashboard"
            id="login-submit"
            className="btn-primary w-full justify-center mt-2"
          >
            Sign in
          </Link>

          <p className="text-center text-xs text-surface-400 pt-1">
            <em>Phase 1 — authentication is mocked. Click Sign in to enter.</em>
          </p>
        </div>

        <p className="text-center text-sm text-surface-500 mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-600 font-semibold hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  )
}

export function Signup() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <p className="text-surface-500 text-sm">Create your account and start training smarter.</p>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-surface-700 mb-1.5">
              Full name
            </label>
            <input id="signup-name" type="text" placeholder="Kovid Anand" className="input-base" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-surface-700 mb-1.5">
              Email
            </label>
            <input id="signup-email" type="email" placeholder="you@example.com" className="input-base" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-surface-700 mb-1.5">
              Password
            </label>
            <input id="signup-password" type="password" placeholder="Create a password" className="input-base" autoComplete="new-password" />
          </div>

          <Link
            to="/dashboard"
            id="signup-submit"
            className="btn-primary w-full justify-center mt-2"
          >
            Create account
          </Link>

          <p className="text-center text-xs text-surface-400 pt-1">
            <em>Phase 1 — authentication is mocked.</em>
          </p>
        </div>

        <p className="text-center text-sm text-surface-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
