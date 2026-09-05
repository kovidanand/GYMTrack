// ─── Map raw Supabase / network errors to friendly user messages ──────────────

export function mapAuthError(error: unknown): string {
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase()

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
    return 'Please check your email and confirm your account before logging in.'
  }
  if (msg.includes('too many requests') || msg.includes('rate_limit')) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
    return 'Network error. Please check your connection and try again.'
  }
  if (msg.includes('user not found') || msg.includes('user_not_found')) {
    return 'No account found with this email address.'
  }

  // Fallback — never expose raw technical errors
  console.error('[GYMTrack] Unmapped auth error:', error)
  return 'Something went wrong. Please try again.'
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
