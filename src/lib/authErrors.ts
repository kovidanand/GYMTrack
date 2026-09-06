// ─── Map raw Supabase / network errors to friendly user messages ──────────────

export function mapAuthError(error: unknown): string {
  if (!error) return 'An unknown error occurred. Please try again.'
  const rawMsg = error instanceof Error
    ? error.message
    : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error)
  const msg = rawMsg.toLowerCase()

  // OTP specific errors
  if (msg.includes('token has expired') || msg.includes('otp expired') || msg.includes('token is expired')) {
    return 'That code has expired. Please request a new one.'
  }
  if (msg.includes('token has already been used') || msg.includes('already used')) {
    return 'That code has already been used. Please request a new one.'
  }
  if (msg.includes('invalid token') || msg.includes('token is invalid') || msg.includes('otp has expired or is invalid') || msg.includes('invalid otp')) {
    return 'That verification code is incorrect.'
  }
  if (msg.includes('too many requests') || msg.includes('rate_limit') || msg.includes('rate limit')) {
    return 'Too many attempts. Please wait before trying again.'
  }

  // Credentials & Login
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Incorrect email or password. Please try again.'
  }
  if (msg.includes('email already registered') || msg.includes('user_already_exists') || msg.includes('already registered')) {
    return 'This email is already registered. Try logging in instead.'
  }
  if (msg.includes('password should be at least') || msg.includes('weak_password')) {
    return 'Password must be at least 6 characters long.'
  }
  if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
    return 'Please verify your email with the 6-digit code before signing in.'
  }
  if (msg.includes('user not found') || msg.includes('user_not_found')) {
    return 'No account found with this email address.'
  }

  // Network & OAuth / System
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'We couldn\'t connect to the server. Please check your network and try again.'
  }
  if (msg.includes('no api key found') || msg.includes('apikey') || msg.includes('authapierror') || msg.includes('pkce') || msg.includes('gotrue') || msg.includes('invalid_grant')) {
    return 'Authentication service is temporarily unavailable. Please try again in a moment.'
  }

  // Fallback — log in dev but return clean friendly message to user
  if (import.meta.env.DEV) {
    console.error('[GYMTrack Auth] Unmapped auth error:', error)
  }
  return 'Something went wrong. Please try again.'
}

export function validateOtp(token: string): string | null {
  const clean = token.trim()
  if (!clean) return 'Please enter the 6-digit verification code.'
  if (!/^\d{6}$/.test(clean)) return 'The code must be exactly 6 numeric digits.'
  return null
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.'
  if (password.length < 6) return 'Password must be at least 6 characters.'
  return null
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm) return 'Please confirm your password.'
  if (password !== confirm) return 'Passwords do not match.'
  return null
}

export function validateName(name: string, field: string): string | null {
  if (!name.trim()) return `${field} is required.`
  if (name.trim().length < 2) return `${field} must be at least 2 characters.`
  return null
}
