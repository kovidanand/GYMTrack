import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { GYMTrackLogo } from '@/components/shared'
import { supabase } from '@/lib/supabase'
import { validatePassword, validateConfirmPassword, mapAuthError } from '@/lib/authErrors'
import { ErrorBanner } from '@/pages/Auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isRecoverySession, setIsRecoverySession] = useState(false)
  const [verifying, setVerifying] = useState(true)

  // Listen for the PASSWORD_RECOVERY event or detect active recovery session
  useEffect(() => {
    let active = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setIsRecoverySession(true)
        setVerifying(false)
      }
    })

    // Also check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (session) {
        setIsRecoverySession(true)
      }
      setVerifying(false)
    }).catch(() => {
      if (active) setVerifying(false)
    })

    // Safety timeout in case URL has no token
    const timeout = setTimeout(() => {
      if (active) setVerifying(false)
    }, 4000)

    return () => {
      active = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    const passErr = validatePassword(password)
    const confErr = validateConfirmPassword(password, confirm)
    if (passErr) e.password = passErr
    if (confErr) e.confirm = confErr
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    setGlobalError(null)
    if (!validate()) return

    setSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (error) {
      setGlobalError(mapAuthError(error))
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <div className="card p-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="text-xl font-bold text-surface-900">Password updated</h1>
            <p className="text-sm text-surface-500">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full justify-center"
            >
              Continue to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <div className="card p-8 space-y-4">
            <Loader2 size={32} className="animate-spin text-brand-500 mx-auto" />
            <p className="text-sm text-surface-600 font-medium">Verifying reset link…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isRecoverySession) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <div className="card p-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-600">
              <AlertCircle size={24} />
            </div>
            <h1 className="text-lg font-bold text-surface-900">Link Expired or Invalid</h1>
            <p className="text-sm text-surface-500">
              This password reset link has expired or has already been used. Please request a new one.
            </p>
            <Link
              to="/forgot-password"
              className="btn-primary w-full justify-center block text-center"
            >
              Request new reset link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold text-surface-900 mb-1">Set new password</h1>
          <p className="text-surface-500 text-sm">
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="card p-6 space-y-4">
          {globalError && <ErrorBanner message={globalError} />}

          <div>
            <label htmlFor="reset-password" className="block text-sm font-medium text-surface-700 mb-1.5">
              New password <span className="text-brand-500">*</span>
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(e2 => ({ ...e2, password: '' })) }}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                className={`input-base pr-10 ${errors.password ? 'border-red-400' : ''}`}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p role="alert" className="mt-1.5 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="reset-confirm" className="block text-sm font-medium text-surface-700 mb-1.5">
              Confirm password <span className="text-brand-500">*</span>
            </label>
            <input
              id="reset-confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setErrors(e2 => ({ ...e2, confirm: '' })) }}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              className={`input-base ${errors.confirm ? 'border-red-400' : ''}`}
              aria-invalid={!!errors.confirm}
            />
            {errors.confirm && (
              <p role="alert" className="mt-1.5 text-xs text-red-600">{errors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center mt-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Updating…
              </>
            ) : (
              'Update password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
