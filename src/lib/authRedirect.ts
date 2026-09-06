/**
 * Authentication redirect utilities for GYMTrack
 * Ensures unified and reliable redirect URLs for local development and production.
 */

const PRODUCTION_ORIGIN = 'https://gymtrack-fitness-kovid.vercel.app'

/**
 * Returns the sanitized base origin of the current application.
 * In browser environments, uses window.location.origin.
 * Strips any trailing slashes.
 */
export function getAppOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '')
  }
  return PRODUCTION_ORIGIN
}

/**
 * Returns the OAuth & Email redirect URL for Supabase Auth.
 * Default callback path is '/auth/callback'.
 */
export function getAuthRedirectUrl(subpath = '/auth/callback'): string {
  const origin = getAppOrigin()
  const cleanPath = subpath.startsWith('/') ? subpath : `/${subpath}`
  return `${origin}${cleanPath}`
}

/**
 * Returns the password reset redirect URL.
 */
export function getPasswordResetRedirectUrl(): string {
  return getAuthRedirectUrl('/reset-password')
}

/**
 * Determines the post-authentication destination based on profile state.
 * If onboarding is completed, sends to /dashboard.
 * Otherwise, sends to /onboarding.
 */
export function getPostAuthRedirect(profile?: { onboarding_complete?: boolean | null } | null): string {
  if (profile && profile.onboarding_complete === true) {
    return '/dashboard'
  }
  return '/onboarding'
}
