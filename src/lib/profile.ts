import { supabase } from '@/lib/supabase'
import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/supabase'

// ─── Valid Database Columns for public.profiles ──────────────────────────────
// Confirmed against the active Supabase PostgreSQL schema.
// Non-column attributes (like session_duration and sex) are cleanly stored in client storage
// to prevent PostgREST 400 schema cache errors.
export const VALID_PROFILE_DB_COLUMNS = new Set([
  'id',
  'first_name',
  'last_name',
  'avatar_url',
  'fitness_goal',
  'secondary_goal',
  'experience_level',
  'training_frequency',
  'height',
  'weight',
  'target_weight',
  'target_date',
  'age',
  'preferred_equipment',
  'onboarding_complete',
  'created_at',
  'updated_at',
  'dietary_preference',
  'allergies',
  'food_restrictions',
  'preferred_cuisines',
  'preferred_protein_sources',
  'favorite_foods',
  'disliked_foods',
  'food_budget',
  'cooking_access',
  'cooking_skill',
  'meal_prep_time',
  'meals_per_day',
])

export function sanitizeProfilePayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  const clean: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(payload)) {
    if (VALID_PROFILE_DB_COLUMNS.has(key) && val !== undefined) {
      clean[key] = val
    }
  }
  return clean as Partial<T>
}

// ─── Fetch a user's profile ───────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    // PGRST116 = no rows found — normal for new users before profile is created
    if (error.code !== 'PGRST116') {
      console.error('[GYMTrack] getProfile error:', error.message)
    }
    return null
  }

  if (!data) return null

  const profile = data as Profile

  // Merge locally stored client preferences if not in DB
  try {
    if (!profile.sex) {
      const storedSex = localStorage.getItem(`gymtrack_sex_${userId}`)
      if (storedSex) profile.sex = storedSex
    }
    if (profile.session_duration == null) {
      const storedDuration = localStorage.getItem(`gymtrack_session_duration_${userId}`)
      if (storedDuration) profile.session_duration = Number(storedDuration) || 60
    }
  } catch {
    // ignore storage access errors
  }

  return profile
}

// ─── Create a profile (on signup) ────────────────────────────────────────────

export async function createProfile(profile: ProfileInsert): Promise<Profile | null> {
  const cleanProfile = sanitizeProfilePayload(profile as Record<string, unknown>) as ProfileInsert

  // Retain client-stored preferences
  if (profile.id) {
    if ('sex' in profile && profile.sex) {
      try { localStorage.setItem(`gymtrack_sex_${profile.id}`, String(profile.sex)) } catch { /* ignore storage error */ }
    }
    if ('session_duration' in profile && profile.session_duration) {
      try { localStorage.setItem(`gymtrack_session_duration_${profile.id}`, String(profile.session_duration)) } catch { /* ignore storage error */ }
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(cleanProfile)
    .select()
    .single()

  if (error) {
    // If profile already exists (e.g. concurrent race condition), fetch and return it
    if (error.code === '23505') {
      return getProfile(profile.id)
    }
    console.error('[GYMTrack] createProfile error:', error.message)
    return null
  }

  return data as Profile
}

// ─── Update a profile ─────────────────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<{ data: Profile | null; error: string | null }> {
  if (!userId) return { data: null, error: 'User ID is required to save profile.' }

  // Persist locally tracked preferences
  if ('sex' in updates && updates.sex) {
    try { localStorage.setItem(`gymtrack_sex_${userId}`, String(updates.sex)) } catch { /* ignore storage error */ }
  }
  if ('session_duration' in updates && updates.session_duration != null) {
    try { localStorage.setItem(`gymtrack_session_duration_${userId}`, String(updates.session_duration)) } catch { /* ignore storage error */ }
  }

  // Filter out non-existent database columns to avoid PGRST204 schema cache errors
  const cleanUpdates = sanitizeProfilePayload(updates as Record<string, unknown>)

  // 1. Try update first
  let { data, error } = await supabase
    .from('profiles')
    .update(cleanUpdates)
    .eq('id', userId)
    .select()
    .maybeSingle()

  // 2. If row does not exist yet (data is null or PGRST116), upsert record
  if (!data && (!error || error.code === 'PGRST116')) {
    const upsertRes = await supabase
      .from('profiles')
      .upsert({ id: userId, ...cleanUpdates }, { onConflict: 'id' })
      .select()
      .maybeSingle()
    data = upsertRes.data
    error = upsertRes.error
  }

  // 3. Dynamic schema-cache error recovery:
  // If PostgREST reports any missing column, remove that key and retry immediately
  if (error && error.message && error.message.toLowerCase().includes('column')) {
    const match = error.message.match(/column (?:profiles\.)?['"]?([a-zA-Z0-9_]+)['"]? does not exist/i) ||
                  error.message.match(/Could not find the '([a-zA-Z0-9_]+)' column/i)
    if (match && match[1] && match[1] in cleanUpdates) {
      delete (cleanUpdates as Record<string, unknown>)[match[1]]
      const retry = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('id', userId)
        .select()
        .maybeSingle()
      data = retry.data
      error = retry.error
    }
  }

  if (error) {
    console.error('[GYMTrack] updateProfile error:', error.message)
    return { data: null, error: error.message || 'Failed to save changes. Please try again.' }
  }

  if (!data) {
    return { data: null, error: 'Failed to save profile. Please verify your connection and try again.' }
  }

  // Merge back any non-DB stored preferences
  const profile = data as Profile
  try {
    profile.sex = updates.sex ?? profile.sex ?? localStorage.getItem(`gymtrack_sex_${userId}`) ?? null
    profile.session_duration = updates.session_duration ?? profile.session_duration ?? (Number(localStorage.getItem(`gymtrack_session_duration_${userId}`)) || 60)
  } catch {
    // ignore storage access errors
  }

  return { data: profile, error: null }
}

// ─── Upsert a profile (create-or-update) ─────────────────────────────────────

export async function upsertProfile(profile: ProfileInsert): Promise<Profile | null> {
  const cleanProfile = sanitizeProfilePayload(profile as Record<string, unknown>) as ProfileInsert

  const { data, error } = await supabase
    .from('profiles')
    .upsert(cleanProfile, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('[GYMTrack] upsertProfile error:', error.message)
    return null
  }

  return data as Profile
}
