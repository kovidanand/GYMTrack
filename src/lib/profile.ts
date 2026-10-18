import { supabase } from '@/lib/supabase'
import type { Profile, ProfileInsert, ProfileUpdate } from '@/types/supabase'

// ─── Fetch a user's profile ───────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    // PGRST116 = no rows found — normal for new users before profile is created
    if (error.code !== 'PGRST116') {
      console.error('[GYMTrack] getProfile error:', error.message)
    }
    return null
  }

  const profile = data as Profile
  if (profile && !profile.sex) {
    try {
      const storedSex = localStorage.getItem(`gymtrack_sex_${userId}`)
      if (storedSex) profile.sex = storedSex
    } catch {}
  }

  return profile
}

// ─── Create a profile (on signup) ────────────────────────────────────────────

export async function createProfile(profile: ProfileInsert): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
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
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    // Graceful fallback if database column 'sex' is missing in schema cache
    if (error.message && error.message.includes('column') && 'sex' in updates) {
      const { sex, ...restUpdates } = updates
      const retry = await supabase.from('profiles').update(restUpdates).eq('id', userId).select().single()
      if (!retry.error) {
        if (sex) {
          try { localStorage.setItem(`gymtrack_sex_${userId}`, sex) } catch {}
        }
        return { data: { ...(retry.data as Profile), sex: sex ?? null }, error: null }
      }
    }
    console.error('[GYMTrack] updateProfile error:', error.message)
    return { data: null, error: 'Failed to save changes. Please try again.' }
  }

  if (data && 'sex' in updates && updates.sex) {
    try { localStorage.setItem(`gymtrack_sex_${userId}`, updates.sex) } catch {}
  }

  return { data: data as Profile, error: null }
}

// ─── Upsert a profile (create-or-update) ─────────────────────────────────────

export async function upsertProfile(profile: ProfileInsert): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    console.error('[GYMTrack] upsertProfile error:', error.message)
    return null
  }

  return data as Profile
}
