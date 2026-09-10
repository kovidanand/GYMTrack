import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { Loader2, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { validateOtp } from '@/lib/authErrors'
import { getPostAuthRedirect } from '@/lib/authRedirect'
import { useNavigate } from 'react-router-dom'

interface OtpVerificationProps {
  email: string
  onBackToSignIn?: () => void
  onSuccess?: () => void
}

export function OtpVerification({ email, onBackToSignIn, onSuccess }: OtpVerificationProps) {
  const { verifyEmailOtp, resendEmailOtp, signInAsDemo, profile } = useAuth()
  const navigate = useNavigate()

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(60)
  const [resendSuccess, setResendSuccess] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Focus the first empty digit input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // 60-second cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

  const otpCode = digits.join('')

  const handleDigitChange = (index: number, val: string) => {
    setError(null)
    setResendSuccess(false)

    // Accept only numeric characters
    const cleanVal = val.replace(/\D/g, '')

    if (!cleanVal) {
      const nextDigits = [...digits]
      nextDigits[index] = ''
      setDigits(nextDigits)
      return
    }

    // Handle single digit
    const char = cleanVal.slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = char
    setDigits(nextDigits)

    // Advance to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      } else {
        const nextDigits = [...digits]
        nextDigits[index] = ''
        setDigits(nextDigits)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    } else if (e.key === 'Enter') {
      if (otpCode.length === 6) {
        handleVerify()
      }
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const nextDigits = [...digits]
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || ''
    }
    setDigits(nextDigits)

    const focusIndex = Math.min(pasted.length, 5)
    inputRefs.current[focusIndex]?.focus()

    if (pasted.length === 6) {
      triggerVerifyWithCode(pasted)
    }
  }

  const triggerVerifyWithCode = async (code: string) => {
    const formatErr = validateOtp(code)
    if (formatErr) {
      setError(formatErr)
      return
    }

    setSubmitting(true)
    setError(null)

    const { error: verifyErr } = await verifyEmailOtp(email, code)
    setSubmitting(false)

    if (verifyErr) {
      setError(verifyErr)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      if (onSuccess) {
        onSuccess()
      } else {
        const dest = getPostAuthRedirect(profile)
        navigate(dest, { replace: true })
      }
    }, 1200)
  }

  const handleVerify = () => {
    triggerVerifyWithCode(otpCode)
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return

    setResending(true)
    setError(null)
    setResendSuccess(false)

    const { error: resendErr } = await resendEmailOtp(email)
    setResending(false)

    if (resendErr) {
      setError(resendErr)
      return
    }

    setResendSuccess(true)
    setResendCooldown(60)
  }

  // Masked email for display: k****@domain.com
  const formatMaskedEmail = (raw: string) => {
    const parts = raw.split('@')
    if (parts.length !== 2) return raw
    const userPart = parts[0]
    const domainPart = parts[1]
    if (userPart.length <= 2) return `${userPart[0]}*@${domainPart}`
    return `${userPart[0]}${'*'.repeat(Math.min(userPart.length - 2, 4))}${userPart.slice(-1)}@${domainPart}`
  }

  return (
    <div className="card p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-surface-900">Verify your email</h1>
        <p className="text-sm text-surface-500">
          Enter the 6-digit verification code we sent to{' '}
          <span className="font-semibold text-surface-800" title={email}>
            {formatMaskedEmail(email)}
          </span>
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {resendSuccess && (
        <div role="status" className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
          <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>A new 6-digit verification code has been sent.</span>
        </div>
      )}

      {success && (
        <div role="status" className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span className="font-medium">Email verified successfully. Continuing…</span>
        </div>
      )}

      {/* 6 Digit Input Boxes */}
      <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={el => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={e => handleDigitChange(idx, e.target.value)}
            onKeyDown={e => handleKeyDown(idx, e)}
            disabled={submitting || success}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border bg-white text-surface-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : digit
                ? 'border-brand-500 ring-1 ring-brand-100'
                : 'border-surface-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
            aria-label={`Digit ${idx + 1}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-surface-500 px-1">
        <span>Code expires soon</span>
        {resendCooldown > 0 ? (
          <span className="text-surface-400 font-mono">Resend in {resendCooldown}s</span>
        ) : (
          <span className="text-emerald-600 font-medium">Ready to resend</span>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleVerify}
          disabled={otpCode.length !== 6 || submitting || success}
          className="btn-primary w-full justify-center"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Verifying code…
            </>
          ) : (
            'Verify email'
          )}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || resending || submitting || success}
          className="btn-secondary w-full justify-center text-surface-700 disabled:opacity-50"
        >
          {resending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Sending new code…
            </>
          ) : (
            <>
              <RefreshCw size={14} className="mr-2" aria-hidden="true" />
              {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
            </>
          )}
        </button>

        <button
          type="button"
          id="otp-demo-access-btn"
          onClick={() => {
            signInAsDemo()
            navigate('/dashboard', { replace: true })
          }}
          className="btn-secondary w-full justify-center text-xs py-2 font-medium border-brand-200 text-brand-700 hover:bg-brand-50"
        >
          Instant Demo Access (Skip Code)
        </button>

        {onBackToSignIn && (
          <button
            type="button"
            onClick={onBackToSignIn}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-surface-500 hover:text-surface-800 transition-colors py-1.5"
          >
            <ArrowLeft size={14} />
            <span>Change email or back to sign in</span>
          </button>
        )}
      </div>
    </div>
  )
}
