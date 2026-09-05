import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { GYMTrackLogo } from '@/components/shared'
import { useAuth } from '@/context/AuthContext'
import { validateEmail } from '@/lib/authErrors'
import { ErrorBanner } from '@/pages/Auth'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()

  const [email, setEmail]           = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    setGlobalError(null)
    setEmailError(null)

    const emailErr = validateEmail(email)
    if (emailErr) { setEmailError(emailErr); return }

    setSubmitting(true)
    const { error } = await resetPassword(email)
    setSubmitting(false)

    if (error) {
      setGlobalError(error)
      return
    }

    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold text-surface-900 mb-1">Reset your password</h1>
          <p className="text-surface-500 text-sm">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="card p-6 space-y-4">
          {success ? (
            <div className="text-center py-4 space-y-3">
              <div className="text-4xl">📧</div>
              <h2 className="font-semibold text-surface-900">Check your inbox</h2>
              <p className="text-sm text-surface-500">
                If an account exists for <span className="font-medium text-surface-700">{email}</span>,
                we've sent a password reset link.
              </p>
              <p className="text-xs text-surface-400">
                Didn't receive it? Check your spam folder.
              </p>
              <Link to="/login" className="btn-secondary w-full justify-center mt-2 block text-center">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {globalError && <ErrorBanner message={globalError} />}

              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(null) }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`input-base ${emailError ? 'border-red-400' : ''}`}
                  aria-describedby={emailError ? 'forgot-email-error' : undefined}
                  aria-invalid={!!emailError}
                />
                {emailError && (
                  <p id="forgot-email-error" role="alert" className="mt-1.5 text-xs text-red-600">
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                id="forgot-submit"
                disabled={submitting}
                className="btn-primary w-full justify-center"
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Sending…</>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          )}
        </div>

        {!success && (
          <p className="text-center text-sm text-surface-500 mt-5">
            Remember your password?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
