import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { GYMTrackLogo } from '@/components/shared'
import { useAuth } from '@/context/AuthContext'
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateName,
} from '@/lib/authErrors'
import { OtpVerification } from '@/components/auth/OtpVerification'
import { getPostAuthRedirect } from '@/lib/authRedirect'

// ─── Shared field components ──────────────────────────────────────────────────

interface FieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  error?: string | null
  placeholder?: string
  autoComplete?: string
  required?: boolean
}

function Field({ id, label, type = 'text', value, onChange, error, placeholder, autoComplete, required }: FieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-700 mb-1.5">
          {label} {required && <span className="text-brand-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`input-base ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''} ${isPassword ? 'pr-10' : ''}`}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div role="status" className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
      <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

function GoogleAuthButton({ disabled }: { disabled: boolean }) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error)
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={disabled || loading}
        className="btn-secondary w-full justify-center bg-white hover:bg-surface-50 text-surface-900 border-surface-200 shadow-sm"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin mr-2 text-surface-500" aria-hidden="true" />
        ) : (
          <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        {loading ? 'Connecting to Google...' : 'Continue with Google'}
      </button>

      <div className="relative mt-6 mb-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-surface-500 text-xs font-medium uppercase tracking-wider">or email</span>
        </div>
      </div>
    </div>
  )
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export function Login() {
  const { signIn, signInAsDemo, isAuthenticated, profile, initialized } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [flow, setFlow] = useState<'form' | 'verification'>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // If already authenticated and initialized, redirect to appropriate page
  useEffect(() => {
    if (initialized && isAuthenticated) {
      const state = location.state as { from?: { pathname?: string } } | null
      const from = state?.from?.pathname
      const dest = from && from !== '/login' && from !== '/signup' ? from : getPostAuthRedirect(profile)
      navigate(dest, { replace: true })
    }
  }, [initialized, isAuthenticated, profile, navigate, location])

  const validate = () => {
    const e: Record<string, string> = {}
    const emailErr = validateEmail(email)
    const passErr  = validatePassword(password)
    if (emailErr) e.email    = emailErr
    if (passErr)  e.password = passErr
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    setGlobalError(null)
    if (!validate()) return

    setSubmitting(true)
    const { error, needsEmailVerification } = await signIn(email, password)
    setSubmitting(false)

    if (needsEmailVerification) {
      setFlow('verification')
      return
    }

    if (error) {
      setGlobalError(error)
      return
    }

    const state = location.state as { from?: { pathname?: string } } | null
    const from = state?.from?.pathname
    const dest = from && from !== '/login' && from !== '/signup' ? from : getPostAuthRedirect(profile)
    navigate(dest, { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <p className="text-surface-500 text-sm">Welcome back. Sign in to continue.</p>
        </div>

        {flow === 'verification' ? (
          <OtpVerification
            email={email}
            onBackToSignIn={() => setFlow('form')}
            onSuccess={() => {
              const dest = getPostAuthRedirect(profile)
              navigate(dest, { replace: true })
            }}
          />
        ) : (
          <>
            <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-4">
              {globalError && <ErrorBanner message={globalError} />}

              <GoogleAuthButton disabled={submitting} />

              <Field
                id="login-email"
                label="Email"
                type="email"
                value={email}
                onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: '' })) }}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-surface-700">
                    Password <span className="text-brand-500">*</span>
                  </label>
                  <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Field
                  id="login-password"
                  label=""
                  type="password"
                  value={password}
                  onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })) }}
                  error={errors.password}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                id="login-submit"
                disabled={submitting}
                className="btn-primary w-full justify-center mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-surface-400 font-medium uppercase tracking-wider">or preview</span>
                </div>
              </div>

              <button
                type="button"
                id="demo-access-btn"
                onClick={() => {
                  signInAsDemo()
                  navigate('/dashboard', { replace: true })
                }}
                className="btn-secondary w-full justify-center text-xs py-2.5 font-medium border-brand-200 text-brand-700 hover:bg-brand-50 hover:border-brand-300 transition-colors"
              >
                Instant Demo Access (Explore GYMTrack)
              </button>
            </form>

            <p className="text-center text-sm text-surface-500 mt-5">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-600 font-semibold hover:underline">
                Get started
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Signup Page ──────────────────────────────────────────────────────────────

export function Signup() {
  const { signUp, isAuthenticated, profile, initialized } = useAuth()
  const navigate = useNavigate()

  const [flow, setFlow]             = useState<'form' | 'verification'>('form')
  const [firstName, setFirstName]   = useState('')
  const [lastName, setLastName]     = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting]   = useState(false)

  // If already authenticated and initialized, redirect
  useEffect(() => {
    if (initialized && isAuthenticated) {
      const dest = getPostAuthRedirect(profile)
      navigate(dest, { replace: true })
    }
  }, [initialized, isAuthenticated, profile, navigate])

  const validate = () => {
    const e: Record<string, string> = {}
    const fnErr   = validateName(firstName, 'First name')
    const lnErr   = validateName(lastName, 'Last name')
    const emailErr = validateEmail(email)
    const passErr  = validatePassword(password)
    const confErr  = validateConfirmPassword(password, confirm)
    if (fnErr)    e.firstName = fnErr
    if (lnErr)    e.lastName  = lnErr
    if (emailErr) e.email     = emailErr
    if (passErr)  e.password  = passErr
    if (confErr)  e.confirm   = confErr
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    setGlobalError(null)
    if (!validate()) return

    setSubmitting(true)
    const { error, needsEmailVerification } = await signUp(email, password, firstName, lastName)
    setSubmitting(false)

    if (error) {
      setGlobalError(error)
      return
    }

    if (needsEmailVerification) {
      setFlow('verification')
      return
    }

    // Directly authenticated
    navigate('/onboarding', { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold text-surface-900 mb-1">Create your account</h1>
          <p className="text-surface-500 text-sm">Start training smarter today.</p>
        </div>

        {flow === 'verification' ? (
          <OtpVerification
            email={email}
            onBackToSignIn={() => setFlow('form')}
            onSuccess={() => {
              navigate('/onboarding', { replace: true })
            }}
          />
        ) : (
          <>
            <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-4">
              {globalError && <ErrorBanner message={globalError} />}

              <GoogleAuthButton disabled={submitting} />

              <div className="grid grid-cols-2 gap-3">
                <Field
                  id="signup-first-name"
                  label="First name"
                  value={firstName}
                  onChange={v => { setFirstName(v); setErrors(e => ({ ...e, firstName: '' })) }}
                  error={errors.firstName}
                  placeholder="Kovid"
                  autoComplete="given-name"
                  required
                />
                <Field
                  id="signup-last-name"
                  label="Last name"
                  value={lastName}
                  onChange={v => { setLastName(v); setErrors(e => ({ ...e, lastName: '' })) }}
                  error={errors.lastName}
                  placeholder="Anand"
                  autoComplete="family-name"
                  required
                />
              </div>

              <Field
                id="signup-email"
                label="Email"
                type="email"
                value={email}
                onChange={v => { setEmail(v); setErrors(e => ({ ...e, email: '' })) }}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <Field
                id="signup-password"
                label="Password"
                type="password"
                value={password}
                onChange={v => { setPassword(v); setErrors(e => ({ ...e, password: '' })) }}
                error={errors.password}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />

              <Field
                id="signup-confirm"
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={v => { setConfirm(v); setErrors(e => ({ ...e, confirm: '' })) }}
                error={errors.confirm}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />

              <button
                type="submit"
                id="signup-submit"
                disabled={submitting}
                className="btn-primary w-full justify-center mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
                    Creating account…
                  </>
                ) : (
                  'Create account'
                )}
              </button>

              <p className="text-xs text-surface-400 text-center">
                By creating an account you agree to our terms of service.
              </p>
            </form>

            <p className="text-center text-sm text-surface-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
