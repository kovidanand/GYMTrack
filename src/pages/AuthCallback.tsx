import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getProfile, createProfile } from '@/lib/profile'
import { getPostAuthRedirect } from '@/lib/authRedirect'
import { mapAuthError } from '@/lib/authErrors'
import { GYMTrackLogo } from '@/components/shared'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const exchangeAttempted = useRef(false)

  useEffect(() => {
    let active = true

    // Check for explicit error query parameters from Supabase
    const errParam = searchParams.get('error')
    const errDesc = searchParams.get('error_description')
    if (errParam || errDesc) {
      const displayError = mapAuthError(errDesc || errParam)
      setErrorMsg(displayError)
      return
    }

    async function processAuth() {
      try {
        const code = searchParams.get('code')

        // If PKCE authorization code is in URL, exchange it for a session
        if (code && !exchangeAttempted.current) {
          exchangeAttempted.current = true
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error('[GYMTrack Auth] Code exchange error:', exchangeError)
            if (active) setErrorMsg(mapAuthError(exchangeError))
            return
          }
        }

        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          if (active) setErrorMsg(mapAuthError(sessionError))
          return
        }

        if (!session?.user) {
          // Listen briefly in case onAuthStateChange is about to emit SIGNED_IN
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
            if (!active) return
            if (s?.user) {
              subscription.unsubscribe()
              await routeUser(s.user)
            }
          })

          // Safety timeout if no session arrives within 4 seconds
          setTimeout(() => {
            if (active && !exchangeAttempted.current) {
              subscription.unsubscribe()
              navigate('/login', { replace: true })
            }
          }, 4000)

          return
        }

        await routeUser(session.user)
      } catch (err) {
        if (active) {
          console.error('[GYMTrack Auth] Callback processing error:', err)
          setErrorMsg(mapAuthError(err))
        }
      }
    }

    async function routeUser(user: User) {
      try {
        let profile = await getProfile(user.id)

        // If user profile is missing (e.g., first Google sign-in), create default profile
        if (!profile) {
          const meta = user.user_metadata || {}
          const fullName = (meta.full_name || meta.name || '').trim()
          const firstName = (
            meta.first_name ||
            (fullName ? fullName.split(' ')[0] : null) ||
            user.email?.split('@')[0] ||
            'Athlete'
          ).trim()
          const lastName = (
            meta.last_name ||
            (fullName ? fullName.split(' ').slice(1).join(' ') : '') ||
            ''
          ).trim()
          const avatarUrl = meta.avatar_url || meta.picture || null

          profile = await createProfile({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            avatar_url: avatarUrl,
            fitness_goal: null,
            secondary_goal: null,
            experience_level: null,
            training_frequency: null,
            session_duration: null,
            height: null,
            weight: null,
            age: null,
            sex: null,
            preferred_equipment: [],
            training_location: null,
            preferred_split: null,
            preferred_exercises: [],
            disliked_exercises: [],
            health_limitations: null,
            onboarding_complete: false,
            onboarding_step: 1,
          })
        }

        const destination = getPostAuthRedirect(profile)
        if (active) {
          navigate(destination, { replace: true })
        }
      } catch {
        if (active) {
          // Fallback to onboarding for safety
          navigate('/onboarding', { replace: true })
        }
      }
    }

    processAuth()

    return () => {
      active = false
    }
  }, [navigate, searchParams])

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <GYMTrackLogo size="lg" />
          </div>
          <div className="card p-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
              <AlertCircle size={24} />
            </div>
            <h1 className="text-lg font-bold text-surface-900">Authentication Failed</h1>
            <p className="text-sm text-surface-600">{errorMsg}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="btn-primary w-full justify-center"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <GYMTrackLogo size="lg" />
        </div>
        <div className="card p-8 space-y-4">
          <Loader2 size={36} className="animate-spin text-brand-600 mx-auto" />
          <p className="text-base font-medium text-surface-900">Securing your session…</p>
          <p className="text-xs text-surface-500">Preparing your personalized dashboard</p>
        </div>
      </div>
    </div>
  )
}
