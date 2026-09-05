/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const rawUrl  = import.meta.env.VITE_SUPABASE_URL  as string | undefined
const rawKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Sanitize URL to remove trailing slashes and /rest/v1 suffixes which break OAuth routing
const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '') : undefined
const supabaseKey = rawKey ? rawKey.trim() : undefined

// ─── Configuration guard ──────────────────────────────────────────────────────
// Provide a clear developer-facing message if env vars are missing,
// rather than a cryptic Supabase error deep in the call stack.

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[GYMTrack] Supabase environment variables are not configured.\n\n' +
    'Create a file named .env.local in the project root with:\n\n' +
    '  VITE_SUPABASE_URL=https://your-project-id.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key-here\n\n' +
    'You can find these values in your Supabase project at:\n' +
    '  Settings → API → Project URL / anon public key\n'
  )
}

// Even with missing vars we create the client so the app doesn't crash on
// import — the missing-vars guard above will alert the developer.
export const supabase = createClient(
  supabaseUrl  ?? 'https://placeholder.supabase.co',
  supabaseKey  ?? 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey)
