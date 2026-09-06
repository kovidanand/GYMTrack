import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { GYMTrackLogo } from '@/components/shared'
import { supabase } from '@/lib/supabase'
import { validatePassword, validateConfirmPassword } from '@/lib/authErrors'
import { ErrorBanner } from '@/pages/Auth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isRecoverySession, setIsRecoverySession] = useState(false)

  // Listen for the RECOVERY event which fires when user clicks the reset link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true)
      }
    })

    // Also check if we already have a session (user might have just clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsRecoverySession(true)
      }
    })

    return () => subscription.unsubscribe()
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
      setGlobalError(error.message || 'Failed to reset password. Please try again.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <div className="card p-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-emerald-600" />
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

  if (!isRecoverySession) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <div className="card p-8 space-y-4">
            <Loader2 size={32} className="animate-spin text-brand-500 mx-auto" />
            <p className="text-sm text-surface-500">Verifying your reset link...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
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
            <input
              id="reset-password"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(e2 => ({ ...e2, password: '' })) }}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className={`input-base ${errors.password ? 'border-red-400' : ''}`}
              aria-invalid={!!errors.password}
            />
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
              type="password"
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
              <><Loader2 size={16} className="animate-spin" /> Updating…</>
            ) : (
              'Update password'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
