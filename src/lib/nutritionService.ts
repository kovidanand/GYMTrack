import { supabase } from '@/lib/supabase'
import { FOOD_CATALOG } from '@/data/foodCatalog'
export type { FoodCategory } from '@/data/foodCatalog'
export * from './nutritionCalculator'
export * from './imageUtils'
import type {
  NutritionGoals,
  FoodEntry,
  WaterEntry,
  CustomFood,
  FoodSearchResult,
  MealType,
} from '@/types/nutrition'

// ─── Local Storage Keys for offline fallback & instant responsiveness ────────
const GOALS_KEY_PREFIX = 'gymtrack_nutrition_goals_'
const ENTRIES_KEY_PREFIX = 'gymtrack_food_entries_'
const WATER_KEY_PREFIX = 'gymtrack_water_entries_'
const CUSTOM_FOODS_KEY_PREFIX = 'gymtrack_custom_foods_'

// ─── Verified Fitness Food Staples (USDA standard reference) ──────────────────
export const FITNESS_STAPLES: FoodSearchResult[] = [
  {
    id: 'staple_chicken_breast',
    name: 'Chicken Breast (Cooked, Skinless)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_whole_egg',
    name: 'Whole Large Egg',
    serving_size: 1,
    serving_unit: 'egg (50g)',
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fat: 4.8,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_egg_white',
    name: 'Egg Whites',
    serving_size: 100,
    serving_unit: 'g',
    calories: 52,
    protein: 11,
    carbs: 0.7,
    fat: 0.2,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_rolled_oats',
    name: 'Rolled Oats (Dry)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 389,
    protein: 16.9,
    carbs: 66.3,
    fat: 6.9,
    fiber: 10.6,
    rawSource: 'quick',
  },
  {
    id: 'staple_whey_isolate',
    name: 'Whey Protein Powder',
    serving_size: 1,
    serving_unit: 'scoop (30g)',
    calories: 120,
    protein: 24,
    carbs: 2,
    fat: 1.5,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_white_rice',
    name: 'White Rice (Cooked)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 130,
    protein: 2.7,
    carbs: 28.2,
    fat: 0.3,
    fiber: 0.4,
    rawSource: 'quick',
  },
  {
    id: 'staple_brown_rice',
    name: 'Brown Rice (Cooked)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 112,
    protein: 2.6,
    carbs: 23.5,
    fat: 0.9,
    fiber: 1.8,
    rawSource: 'quick',
  },
  {
    id: 'staple_greek_yogurt',
    name: 'Greek Yogurt (Plain, Non-fat)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 59,
    protein: 10.2,
    carbs: 3.6,
    fat: 0.4,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_salmon',
    name: 'Atlantic Salmon (Cooked)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 206,
    protein: 22.1,
    carbs: 0,
    fat: 12.3,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_canned_tuna',
    name: 'Canned Tuna in Water',
    serving_size: 100,
    serving_unit: 'g',
    calories: 116,
    protein: 25.5,
    carbs: 0,
    fat: 0.8,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_banana',
    name: 'Banana (Medium)',
    serving_size: 1,
    serving_unit: 'medium (118g)',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.3,
    fiber: 3.1,
    rawSource: 'quick',
  },
  {
    id: 'staple_sweet_potato',
    name: 'Sweet Potato (Baked)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 90,
    protein: 2,
    carbs: 20.7,
    fat: 0.1,
    fiber: 3.3,
    rawSource: 'quick',
  },
  {
    id: 'staple_peanut_butter',
    name: 'Peanut Butter (Natural)',
    serving_size: 2,
    serving_unit: 'tbsp (32g)',
    calories: 188,
    protein: 8,
    carbs: 6,
    fat: 16,
    fiber: 2,
    rawSource: 'quick',
  },
  {
    id: 'staple_almonds',
    name: 'Raw Almonds',
    serving_size: 1,
    serving_unit: 'handful (28g)',
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    fiber: 3.5,
    rawSource: 'quick',
  },
  {
    id: 'staple_avocado',
    name: 'Avocado',
    serving_size: 100,
    serving_unit: 'g',
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7,
    rawSource: 'quick',
  },
  {
    id: 'staple_cottage_cheese',
    name: 'Cottage Cheese (Low Fat)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 72,
    protein: 12.4,
    carbs: 2.7,
    fat: 1,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_ground_beef_90',
    name: 'Lean Ground Beef (90/10, Cooked)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 217,
    protein: 26.1,
    carbs: 0,
    fat: 11.8,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_broccoli',
    name: 'Broccoli (Cooked)',
    serving_size: 100,
    serving_unit: 'g',
    calories: 35,
    protein: 2.4,
    carbs: 7.2,
    fat: 0.4,
    fiber: 3.3,
    rawSource: 'quick',
  },
  {
    id: 'staple_whole_milk',
    name: 'Whole Milk',
    serving_size: 1,
    serving_unit: 'cup (240ml)',
    calories: 149,
    protein: 7.7,
    carbs: 11.7,
    fat: 8,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_olive_oil',
    name: 'Extra Virgin Olive Oil',
    serving_size: 1,
    serving_unit: 'tbsp (14g)',
    calories: 119,
    protein: 0,
    carbs: 0,
    fat: 13.5,
    fiber: 0,
    rawSource: 'quick',
  },
  {
    id: 'staple_apple',
    name: 'Apple (Medium)',
    serving_size: 1,
    serving_unit: 'medium (182g)',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    fiber: 4.4,
    rawSource: 'quick',
  },
  {
    id: 'staple_whole_wheat_bread',
    name: 'Whole Wheat Bread',
    serving_size: 1,
    serving_unit: 'slice (43g)',
    calories: 110,
    protein: 5,
    carbs: 20,
    fat: 1.5,
    fiber: 3,
    rawSource: 'quick',
  },
]

// ─── Default Nutrition Goals ──────────────────────────────────────────────────
export const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  calorie_target: 2000,
  protein_target: 150,
  carb_target: 200,
  fat_target: 65,
  fiber_target: 30,
  water_target: 2500,
}

// ─── Goals API ────────────────────────────────────────────────────────────────

export async function getNutritionGoals(userId: string): Promise<NutritionGoals> {
  const localKey = `${GOALS_KEY_PREFIX}${userId}`
  const cached = localStorage.getItem(localKey)
  let initialGoals: NutritionGoals = cached ? JSON.parse(cached) : DEFAULT_NUTRITION_GOALS

  try {
    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (!error && data) {
      initialGoals = {
        id: data.id,
        user_id: data.user_id,
        calorie_target: data.calorie_target ?? DEFAULT_NUTRITION_GOALS.calorie_target,
        protein_target: data.protein_target ?? DEFAULT_NUTRITION_GOALS.protein_target,
        carb_target: data.carb_target ?? DEFAULT_NUTRITION_GOALS.carb_target,
        fat_target: data.fat_target ?? DEFAULT_NUTRITION_GOALS.fat_target,
        fiber_target: data.fiber_target ?? DEFAULT_NUTRITION_GOALS.fiber_target,
        water_target: data.water_target ?? DEFAULT_NUTRITION_GOALS.water_target,
      }
      localStorage.setItem(localKey, JSON.stringify(initialGoals))
    }
  } catch (err) {
    console.warn('[NutritionService] Fallback to cached goals:', err)
  }

  return initialGoals
}

export async function saveNutritionGoals(
  userId: string,
  goals: Partial<NutritionGoals>
): Promise<NutritionGoals> {
  const localKey = `${GOALS_KEY_PREFIX}${userId}`
  const existing = await getNutritionGoals(userId)
  const updated: NutritionGoals = {
    ...existing,
    ...goals,
    user_id: userId,
  }

  localStorage.setItem(localKey, JSON.stringify(updated))

  try {
    const { data, error } = await supabase
      .from('nutrition_goals')
      .upsert(
        {
          user_id: userId,
          calorie_target: Math.round(updated.calorie_target),
          protein_target: Math.round(updated.protein_target),
          carb_target: Math.round(updated.carb_target),
          fat_target: Math.round(updated.fat_target),
          fiber_target: Math.round(updated.fiber_target),
          water_target: Math.round(updated.water_target),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .maybeSingle()

    if (!error && data) {
      updated.id = data.id
      localStorage.setItem(localKey, JSON.stringify(updated))
    }
  } catch (err) {
    console.warn('[NutritionService] Failed to sync goals to Supabase, saved locally:', err)
  }

  return updated
}

// ─── Food Entries API ─────────────────────────────────────────────────────────

export async function getFoodEntriesForDate(
  userId: string,
  dateStr: string
): Promise<FoodEntry[]> {
  const localKey = `${ENTRIES_KEY_PREFIX}${userId}_${dateStr}`
  let entries: FoodEntry[] = []

  try {
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .order('logged_at', { ascending: true })

    if (!error && data) {
      entries = (data as Record<string, unknown>[]).map(d => ({
        id: String(d.id),
        user_id: String(d.user_id),
        date: String(d.date),
        meal_type: d.meal_type as MealType,
        food_name: String(d.food_name),
        brand: d.brand ? String(d.brand) : null,
        serving_size: Number(d.serving_size),
        serving_unit: String(d.serving_unit),
        servings_logged: Number(d.servings_logged),
        calories: Number(d.calories),
        protein: Number(d.protein),
        carbs: Number(d.carbs),
        fat: Number(d.fat),
        fiber: Number(d.fiber),
        logged_at: String(d.logged_at),
        created_at: d.created_at ? String(d.created_at) : undefined,
        updated_at: d.updated_at ? String(d.updated_at) : undefined,
      }))
      localStorage.setItem(localKey, JSON.stringify(entries))
      return entries
    }
  } catch (err) {
    console.warn('[NutritionService] Fallback to cached food entries:', err)
  }

  const cached = localStorage.getItem(localKey)
  if (cached) {
    try {
      entries = JSON.parse(cached)
    } catch {
      entries = []
    }
  }

  return entries
}

export async function addFoodEntry(
  userId: string,
  entry: Omit<FoodEntry, 'id' | 'created_at' | 'updated_at'>
): Promise<FoodEntry> {
  const localKey = `${ENTRIES_KEY_PREFIX}${userId}_${entry.date}`
  const newId = crypto.randomUUID()
  const now = new Date().toISOString()

  const completeEntry: FoodEntry = {
    ...entry,
    id: newId,
    created_at: now,
    updated_at: now,
  }

  // Update local storage immediately for zero-latency UI
  try {
    const cached = localStorage.getItem(localKey)
    const list: FoodEntry[] = cached ? JSON.parse(cached) : []
    list.push(completeEntry)
    localStorage.setItem(localKey, JSON.stringify(list))
  } catch {
    /* ignore storage error */
  }

  // Sync to Supabase
  try {
    const { data, error } = await supabase
      .from('food_entries')
      .insert({
        id: newId,
        user_id: userId,
        date: entry.date,
        meal_type: entry.meal_type,
        food_name: entry.food_name,
        brand: entry.brand || null,
        serving_size: entry.serving_size,
        serving_unit: entry.serving_unit,
        servings_logged: entry.servings_logged,
        calories: Math.round(entry.calories),
        protein: Math.round(entry.protein * 10) / 10,
        carbs: Math.round(entry.carbs * 10) / 10,
        fat: Math.round(entry.fat * 10) / 10,
        fiber: Math.round(entry.fiber * 10) / 10,
        logged_at: entry.logged_at || now,
      })
      .select()
      .maybeSingle()

    if (!error && data) {
      completeEntry.id = data.id
    }
  } catch (err) {
    console.warn('[NutritionService] Saved food entry locally:', err)
  }

  return completeEntry
}

export async function updateFoodEntry(
  userId: string,
  entryId: string,
  dateStr: string,
  updates: Partial<FoodEntry>
): Promise<FoodEntry | null> {
  const localKey = `${ENTRIES_KEY_PREFIX}${userId}_${dateStr}`
  let updatedEntry: FoodEntry | null = null

  try {
    const cached = localStorage.getItem(localKey)
    if (cached) {
      const list: FoodEntry[] = JSON.parse(cached)
      const idx = list.findIndex(e => e.id === entryId)
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() }
        updatedEntry = list[idx]
        localStorage.setItem(localKey, JSON.stringify(list))
      }
    }
  } catch {
    /* ignore storage error */
  }

  try {
    const payload: Record<string, unknown> = {}
    if (updates.meal_type !== undefined) payload.meal_type = updates.meal_type
    if (updates.food_name !== undefined) payload.food_name = updates.food_name
    if (updates.serving_size !== undefined) payload.serving_size = updates.serving_size
    if (updates.serving_unit !== undefined) payload.serving_unit = updates.serving_unit
    if (updates.servings_logged !== undefined) payload.servings_logged = updates.servings_logged
    if (updates.calories !== undefined) payload.calories = Math.round(updates.calories)
    if (updates.protein !== undefined) payload.protein = Math.round(updates.protein * 10) / 10
    if (updates.carbs !== undefined) payload.carbs = Math.round(updates.carbs * 10) / 10
    if (updates.fat !== undefined) payload.fat = Math.round(updates.fat * 10) / 10
    if (updates.fiber !== undefined) payload.fiber = Math.round(updates.fiber * 10) / 10
    payload.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('food_entries')
      .update(payload)
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .maybeSingle()

    if (!error && data) {
      updatedEntry = data as unknown as FoodEntry
    }
  } catch (err) {
    console.warn('[NutritionService] Food entry updated locally only:', err)
  }

  return updatedEntry
}

export async function deleteFoodEntry(
  userId: string,
  entryId: string,
  dateStr: string
): Promise<boolean> {
  const localKey = `${ENTRIES_KEY_PREFIX}${userId}_${dateStr}`

  try {
    const cached = localStorage.getItem(localKey)
    if (cached) {
      const list: FoodEntry[] = JSON.parse(cached)
      const filtered = list.filter(e => e.id !== entryId)
      localStorage.setItem(localKey, JSON.stringify(filtered))
    }
  } catch {
    /* ignore storage error */
  }

  try {
    await supabase
      .from('food_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId)
  } catch (err) {
    console.warn('[NutritionService] Delete food entry failed remotely:', err)
  }

  return true
}

// ─── Water Tracking API ───────────────────────────────────────────────────────

export async function getWaterEntriesForDate(
  userId: string,
  dateStr: string
): Promise<WaterEntry[]> {
  const localKey = `${WATER_KEY_PREFIX}${userId}_${dateStr}`
  let entries: WaterEntry[] = []

  try {
    const { data, error } = await supabase
      .from('water_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .order('logged_at', { ascending: true })

    if (!error && data) {
      entries = (data as Record<string, unknown>[]).map(d => ({
        id: String(d.id),
        user_id: String(d.user_id),
        date: String(d.date),
        amount_ml: Number(d.amount_ml),
        logged_at: String(d.logged_at),
        created_at: d.created_at ? String(d.created_at) : undefined,
      }))
      localStorage.setItem(localKey, JSON.stringify(entries))
      return entries
    }
  } catch (err) {
    console.warn('[NutritionService] Water fallback to cached entries:', err)
  }

  const cached = localStorage.getItem(localKey)
  if (cached) {
    try {
      entries = JSON.parse(cached)
    } catch {
      entries = []
    }
  }

  return entries
}

export async function addWaterEntry(
  userId: string,
  dateStr: string,
  amountMl: number
): Promise<WaterEntry> {
  const localKey = `${WATER_KEY_PREFIX}${userId}_${dateStr}`
  const newId = crypto.randomUUID()
  const now = new Date().toISOString()

  const entry: WaterEntry = {
    id: newId,
    user_id: userId,
    date: dateStr,
    amount_ml: amountMl,
    logged_at: now,
    created_at: now,
  }

  try {
    const cached = localStorage.getItem(localKey)
    const list: WaterEntry[] = cached ? JSON.parse(cached) : []
    list.push(entry)
    localStorage.setItem(localKey, JSON.stringify(list))
  } catch {
    /* ignore storage error */
  }

  try {
    const { data, error } = await supabase
      .from('water_entries')
      .insert({
        id: newId,
        user_id: userId,
        date: dateStr,
        amount_ml: amountMl,
        logged_at: now,
      })
      .select()
      .maybeSingle()

    if (!error && data) {
      entry.id = data.id
    }
  } catch (err) {
    console.warn('[NutritionService] Water logged locally:', err)
  }

  return entry
}

export async function deleteWaterEntry(
  userId: string,
  entryId: string,
  dateStr: string
): Promise<boolean> {
  const localKey = `${WATER_KEY_PREFIX}${userId}_${dateStr}`

  try {
    const cached = localStorage.getItem(localKey)
    if (cached) {
      const list: WaterEntry[] = JSON.parse(cached)
      const filtered = list.filter(e => e.id !== entryId)
      localStorage.setItem(localKey, JSON.stringify(filtered))
    }
  } catch {
    /* ignore storage error */
  }

  try {
    await supabase
      .from('water_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId)
  } catch (err) {
    console.warn('[NutritionService] Delete water entry remote failed:', err)
  }

  return true
}

// ─── Custom Foods API ─────────────────────────────────────────────────────────

export async function getCustomFoods(userId: string): Promise<CustomFood[]> {
  const localKey = `${CUSTOM_FOODS_KEY_PREFIX}${userId}`
  let foods: CustomFood[] = []

  try {
    const { data, error } = await supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (!error && data) {
      foods = (data as Record<string, unknown>[]).map(d => ({
        id: String(d.id),
        user_id: String(d.user_id),
        name: String(d.name),
        brand: d.brand ? String(d.brand) : null,
        serving_size: Number(d.serving_size),
        serving_unit: String(d.serving_unit),
        calories: Number(d.calories),
        protein: Number(d.protein),
        carbs: Number(d.carbs),
        fat: Number(d.fat),
        fiber: Number(d.fiber),
        barcode: d.barcode ? String(d.barcode) : null,
        created_at: d.created_at ? String(d.created_at) : undefined,
        updated_at: d.updated_at ? String(d.updated_at) : undefined,
      }))
      localStorage.setItem(localKey, JSON.stringify(foods))
      return foods
    }
  } catch (err) {
    console.warn('[NutritionService] Custom foods fallback to cache:', err)
  }

  const cached = localStorage.getItem(localKey)
  if (cached) {
    try {
      foods = JSON.parse(cached)
    } catch {
      foods = []
    }
  }

  return foods
}

export async function addCustomFood(
  userId: string,
  food: Omit<CustomFood, 'id' | 'created_at' | 'updated_at'>
): Promise<CustomFood> {
  const localKey = `${CUSTOM_FOODS_KEY_PREFIX}${userId}`
  const newId = crypto.randomUUID()
  const now = new Date().toISOString()

  const completeFood: CustomFood = {
    ...food,
    id: newId,
    created_at: now,
    updated_at: now,
  }

  try {
    const cached = localStorage.getItem(localKey)
    const list: CustomFood[] = cached ? JSON.parse(cached) : []
    list.push(completeFood)
    localStorage.setItem(localKey, JSON.stringify(list))
  } catch {
    /* ignore storage error */
  }

  try {
    const { data, error } = await supabase
      .from('custom_foods')
      .insert({
        id: newId,
        user_id: userId,
        name: food.name,
        brand: food.brand || null,
        serving_size: food.serving_size,
        serving_unit: food.serving_unit,
        calories: Math.round(food.calories),
        protein: Math.round(food.protein * 10) / 10,
        carbs: Math.round(food.carbs * 10) / 10,
        fat: Math.round(food.fat * 10) / 10,
        fiber: Math.round(food.fiber * 10) / 10,
        barcode: food.barcode || null,
      })
      .select()
      .maybeSingle()

    if (!error && data) {
      completeFood.id = data.id
    }
  } catch (err) {
    console.warn('[NutritionService] Saved custom food locally:', err)
  }

  return completeFood
}

export async function deleteCustomFood(userId: string, foodId: string): Promise<boolean> {
  const localKey = `${CUSTOM_FOODS_KEY_PREFIX}${userId}`

  try {
    const cached = localStorage.getItem(localKey)
    if (cached) {
      const list: CustomFood[] = JSON.parse(cached)
      const filtered = list.filter(f => f.id !== foodId)
      localStorage.setItem(localKey, JSON.stringify(filtered))
    }
  } catch {
    /* ignore storage error */
  }

  try {
    await supabase.from('custom_foods').delete().eq('id', foodId).eq('user_id', userId)
  } catch (err) {
    console.warn('[NutritionService] Delete custom food remote error:', err)
  }

  return true
}

// ─── Food Search (Open Food Facts + Staples + Custom Foods) ───────────────────

export async function searchFoods(
  query: string,
  userId: string
): Promise<FoodSearchResult[]> {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) {
    return FITNESS_STAPLES.slice(0, 10)
  }

  const results: FoodSearchResult[] = []
  const seenNames = new Set<string>()

  // 1. Search user's custom foods
  try {
    const customFoods = await getCustomFoods(userId)
    for (const cf of customFoods) {
      if (cf.name.toLowerCase().includes(trimmed) || (cf.brand && cf.brand.toLowerCase().includes(trimmed))) {
        results.push({
          id: `custom_${cf.id}`,
          name: cf.name,
          brand: cf.brand || undefined,
          serving_size: cf.serving_size,
          serving_unit: cf.serving_unit,
          calories: cf.calories,
          protein: cf.protein,
          carbs: cf.carbs,
          fat: cf.fat,
          fiber: cf.fiber,
          isCustom: true,
          rawSource: 'custom',
        })
        seenNames.add(cf.name.toLowerCase())
      }
    }
  } catch (err) {
    console.warn('[NutritionService] Custom food search error:', err)
  }

  // 2. Search built-in Food Catalog (Indian staples, fruits, veggies, proteins, grains, snacks)
  for (const item of FOOD_CATALOG) {
    const matchesName = item.name.toLowerCase().includes(trimmed)
    const matchesAlias = item.aliases.some(a => a.toLowerCase().includes(trimmed))
    const matchesCategory = item.category.toLowerCase().includes(trimmed)

    if ((matchesName || matchesAlias || matchesCategory) && !seenNames.has(item.name.toLowerCase())) {
      results.push({
        id: `catalog_${item.id}`,
        name: item.name,
        brand: undefined,
        serving_size: item.serving_size,
        serving_unit: item.serving_unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        rawSource: 'quick',
      })
      seenNames.add(item.name.toLowerCase())
    }
  }

  // 3. Search fitness staples
  for (const staple of FITNESS_STAPLES) {
    if (staple.name.toLowerCase().includes(trimmed) && !seenNames.has(staple.name.toLowerCase())) {
      results.push(staple)
      seenNames.add(staple.name.toLowerCase())
    }
  }

  // 4. Search Open Food Facts public API (CORS enabled, free, live)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      trimmed
    )}&search_simple=1&action=process&json=1&page_size=16`

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    })
    clearTimeout(timeoutId)

    if (response.ok) {
      const data = await response.json()
      if (Array.isArray(data.products)) {
        for (const prod of data.products) {
          const name = prod.product_name || prod.generic_name
          if (!name || seenNames.has(name.toLowerCase())) continue

          const nutriments = prod.nutriments || {}
          const calories =
            nutriments['energy-kcal_100g'] ??
            nutriments['energy-kcal'] ??
            (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : 0)

          const protein = nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0
          const carbs = nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates'] ?? 0
          const fat = nutriments['fat_100g'] ?? nutriments['fat'] ?? 0
          const fiber = nutriments['fiber_100g'] ?? nutriments['fiber'] ?? 0

          // Only keep items with realistic calorie info
          if (calories > 0 || protein > 0 || carbs > 0 || fat > 0) {
            results.push({
              id: `off_${prod.code || prod.id || Math.random()}`,
              name,
              brand: prod.brands,
              serving_size: 100,
              serving_unit: 'g',
              calories: Math.round(calories),
              protein: Math.round(protein * 10) / 10,
              carbs: Math.round(carbs * 10) / 10,
              fat: Math.round(fat * 10) / 10,
              fiber: Math.round(fiber * 10) / 10,
              imageUrl: prod.image_thumb_url || prod.image_front_thumb_url,
              rawSource: 'openfoodfacts',
            })
            seenNames.add(name.toLowerCase())
          }
        }
      }
    }
  } catch (err) {
    // Gracefully handle network/offline errors; staples & custom foods are already included
    console.info('[NutritionService] OpenFoodFacts search offline or unavailable:', err)
  }

  return results
}

// ─── Nutrition History & Analytics ────────────────────────────────────────────

export interface HistoryDayAggregate {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  water_ml: number
  entry_count: number
}

export async function getNutritionHistory(
  userId: string,
  daysCount: number
): Promise<HistoryDayAggregate[]> {
  const result: Record<string, HistoryDayAggregate> = {}

  // Generate date keys for the window
  const now = new Date()
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    result[dateStr] = {
      date: dateStr,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      water_ml: 0,
      entry_count: 0,
    }
  }

  const startDateStr = Object.keys(result)[0]

  try {
    // Fetch food entries
    const { data: foodData, error: foodErr } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)

    if (!foodErr && foodData) {
      for (const entry of foodData) {
        const d = entry.date
        if (result[d]) {
          result[d].calories += Number(entry.calories) || 0
          result[d].protein += Number(entry.protein) || 0
          result[d].carbs += Number(entry.carbs) || 0
          result[d].fat += Number(entry.fat) || 0
          result[d].fiber += Number(entry.fiber) || 0
          result[d].entry_count += 1
        }
      }
    }
  } catch (err) {
    console.warn('[NutritionService] Remote history query error, checking local:', err)
  }

  // Also query cached dates if offline
  for (const dateStr of Object.keys(result)) {
    if (result[dateStr].entry_count === 0) {
      const localKey = `${ENTRIES_KEY_PREFIX}${userId}_${dateStr}`
      const cached = localStorage.getItem(localKey)
      if (cached) {
        try {
          const list: FoodEntry[] = JSON.parse(cached)
          for (const entry of list) {
            result[dateStr].calories += Number(entry.calories) || 0
            result[dateStr].protein += Number(entry.protein) || 0
            result[dateStr].carbs += Number(entry.carbs) || 0
            result[dateStr].fat += Number(entry.fat) || 0
            result[dateStr].fiber += Number(entry.fiber) || 0
            result[dateStr].entry_count += 1
          }
        } catch {
          /* ignore storage error */
        }
      }
    }
  }

  try {
    // Fetch water entries
    const { data: waterData, error: waterErr } = await supabase
      .from('water_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)

    if (!waterErr && waterData) {
      for (const entry of waterData) {
        const d = entry.date
        if (result[d]) {
          result[d].water_ml += Number(entry.amount_ml) || 0
        }
      }
    }
  } catch {
    /* ignore error */
  }

  // Check water in local storage
  for (const dateStr of Object.keys(result)) {
    if (result[dateStr].water_ml === 0) {
      const waterKey = `${WATER_KEY_PREFIX}${userId}_${dateStr}`
      const cached = localStorage.getItem(waterKey)
      if (cached) {
        try {
          const list: WaterEntry[] = JSON.parse(cached)
          for (const entry of list) {
            result[dateStr].water_ml += Number(entry.amount_ml) || 0
          }
        } catch {
          /* ignore storage error */
        }
      }
    }
  }

  return Object.values(result).sort((a, b) => a.date.localeCompare(b.date))
}

// ─── Profile Target Estimator (Mifflin-St Jeor Formula) ────────────────────────

export function calculateEstimatedGoalsFromProfile(
  profile: {
    weight?: number | null
    height?: number | null
    age?: number | null
    sex?: string | null
    training_frequency?: number | null
    fitness_goal?: string | null
  } | null
): NutritionGoals {
  const weightKg = Number(profile?.weight) || 75
  const heightCm = Number(profile?.height) || 175
  const age = Number(profile?.age) || 28
  const isFemale = profile?.sex === 'female'

  // Mifflin-St Jeor formula for BMR
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (isFemale ? -161 : 5)

  // Activity multiplier based on training frequency
  const freq = Number(profile?.training_frequency) || 4
  const multiplier = freq >= 5 ? 1.55 : freq >= 3 ? 1.4 : 1.25
  const maintenanceTDEE = bmr * multiplier

  let targetCalories = maintenanceTDEE
  const goal = profile?.fitness_goal

  if (goal === 'lose_weight') {
    targetCalories -= 450
  } else if (goal === 'build_muscle' || goal === 'improve_strength') {
    targetCalories += 300
  }

  targetCalories = Math.max(1400, Math.min(4200, Math.round(targetCalories / 50) * 50))

  // Macros
  // High protein for athletes: ~2.0g per kg
  const proteinGrams = Math.round(Math.max(100, Math.min(260, weightKg * 2.0)))
  // Fat: 25-30% of total calories (9 kcal/g)
  const fatGrams = Math.round((targetCalories * 0.28) / 9)
  // Carbs: remainder (4 kcal/g)
  const remainingCalories = targetCalories - (proteinGrams * 4 + fatGrams * 9)
  const carbGrams = Math.round(Math.max(80, remainingCalories / 4))
  // Fiber: ~14g per 1000 kcal
  const fiberGrams = Math.round((targetCalories / 1000) * 14)
  // Water: ~35ml per kg
  const waterTarget = Math.round((weightKg * 35) / 250) * 250

  return {
    calorie_target: targetCalories,
    protein_target: proteinGrams,
    carb_target: carbGrams,
    fat_target: fatGrams,
    fiber_target: fiberGrams,
    water_target: Math.max(2000, waterTarget),
  }
}

// ─── Food Library Catalog Provider ───────────────────────────────────────────

export async function getFoodCatalog(
  categoryFilter: string,
  searchQuery: string,
  userId: string
): Promise<FoodSearchResult[]> {
  const query = searchQuery.trim().toLowerCase()
  const results: FoodSearchResult[] = []

  // Custom foods if category is 'all' or 'custom'
  if (categoryFilter === 'all' || categoryFilter === 'custom') {
    try {
      const custom = await getCustomFoods(userId)
      for (const cf of custom) {
        const matchesQuery =
          !query ||
          cf.name.toLowerCase().includes(query) ||
          (cf.brand && cf.brand.toLowerCase().includes(query))

        if (matchesQuery) {
          results.push({
            id: `custom_${cf.id}`,
            name: cf.name,
            brand: cf.brand || 'Custom Food',
            serving_size: cf.serving_size,
            serving_unit: cf.serving_unit,
            calories: cf.calories,
            protein: cf.protein,
            carbs: cf.carbs,
            fat: cf.fat,
            fiber: cf.fiber,
            isCustom: true,
            rawSource: 'custom',
          })
        }
      }
    } catch {
      /* ignore */
    }
  }

  // Built-in catalog items
  if (categoryFilter !== 'custom') {
    for (const item of FOOD_CATALOG) {
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.aliases.some(a => a.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query)

      if (matchesCategory && matchesQuery) {
        results.push({
          id: `catalog_${item.id}`,
          name: item.name,
          brand: item.category.replace('_', ' ').toUpperCase(),
          serving_size: item.serving_size,
          serving_unit: item.serving_unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber,
          rawSource: 'quick',
        })
      }
    }
  }

  return results
}

// ─── Nutrition Streak Calculation ─────────────────────────────────────────────

export async function calculateNutritionStreak(userId: string): Promise<number> {
  const loggedDates = new Set<string>()

  // Check remote records for the past 60 days
  try {
    const d = new Date()
    d.setDate(d.getDate() - 60)
    const minDateStr = d.toISOString().split('T')[0]

    const { data } = await supabase
      .from('food_entries')
      .select('date')
      .eq('user_id', userId)
      .gte('date', minDateStr)

    if (data) {
      for (const row of data as { date: string }[]) {
        if (row.date) loggedDates.add(row.date)
      }
    }
  } catch {
    /* ignore */
  }

  // Also inspect local storage cache
  for (let i = 0; i < 60; i++) {
    const cur = new Date()
    cur.setDate(cur.getDate() - i)
    const dateStr = cur.toISOString().split('T')[0]
    if (!loggedDates.has(dateStr)) {
      const key = `${ENTRIES_KEY_PREFIX}${userId}_${dateStr}`
      const cached = localStorage.getItem(key)
      if (cached) {
        try {
          const list = JSON.parse(cached)
          if (Array.isArray(list) && list.length > 0) {
            loggedDates.add(dateStr)
          }
        } catch {
          /* ignore */
        }
      }
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  // Streak continues if logged today or yesterday
  if (!loggedDates.has(todayStr) && !loggedDates.has(yesterdayStr)) {
    return 0
  }

  let streak = 0
  const startDay = loggedDates.has(todayStr) ? 0 : 1

  for (let i = startDay; i < 60; i++) {
    const checkDate = new Date()
    checkDate.setDate(checkDate.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    if (loggedDates.has(dateStr)) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// ─── Personalized Nutrition Insights ──────────────────────────────────────────

export function generateNutritionInsights(
  dailyTotals: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  },
  goals: NutritionGoals,
  streak: number
): string[] {
  const insights: string[] = []

  // Check if no meals logged
  if (dailyTotals.calories === 0) {
    insights.push('Log your first meal to track today’s energy and macro targets.')
    if (streak > 0) {
      insights.push(`Keep your ${streak}-day logging streak alive by recording today’s meals.`)
    }
    return insights
  }

  // Protein status
  const proteinDiff = goals.protein_target - dailyTotals.protein
  if (proteinDiff > 10) {
    insights.push(
      `You're ${Math.round(proteinDiff)}g below your daily protein target (${goals.protein_target}g). Consider high-protein staples like eggs, paneer, or chicken.`
    )
  } else if (dailyTotals.protein >= goals.protein_target) {
    insights.push('Excellent! Daily protein target achieved to support muscle recovery.')
  }

  // Calorie status
  const calDiff = goals.calorie_target - dailyTotals.calories
  if (calDiff > 100) {
    insights.push(
      `You have ${Math.round(calDiff).toLocaleString()} kcal remaining in today’s energy budget.`
    )
  } else if (calDiff < -50) {
    insights.push(
      `You've exceeded your daily calorie goal by ${Math.abs(Math.round(calDiff)).toLocaleString()} kcal.`
    )
  }

  // Fiber status
  if (goals.fiber_target > 0 && dailyTotals.fiber > 0 && dailyTotals.fiber < goals.fiber_target * 0.7) {
    insights.push(
      `Add ${(goals.fiber_target - dailyTotals.fiber).toFixed(0)}g more fiber with oats, lentils, or vegetables to support digestion.`
    )
  }

  // Streak insight
  if (streak >= 3) {
    insights.push(`🔥 ${streak}-day logging streak! Consistency is the foundation of body transformation.`)
  }

  return insights.slice(0, 3)
}

// ─── Real AI Food Vision Analysis Engine ──────────────────────────────────────

export interface DetectedFoodAnalysisItem {
  id: string
  name: string
  portion: string
  servingSize: number
  servingUnit: string
  quantity: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  confidence: 'high' | 'medium' | 'low'
  notes?: string
}

export interface MealPhotoAnalysisResult {
  isFood: boolean
  items: DetectedFoodAnalysisItem[]
  overallNotes: string
}

/**
 * Genuinely analyzes an uploaded meal photo using Google Gemini 1.5 Flash Vision.
 * Handles multi-item plate breakdown, portions, and macro estimation.
 * Never fabricates predetermined responses.
 */
export async function analyzeMealPhoto(
  base64Data: string,
  mimeType = 'image/jpeg'
): Promise<MealPhotoAnalysisResult> {
  let remoteError: string | null = null

  // Ensure pure base64 without data URI prefix
  let cleanBase64 = base64Data.trim()
  let cleanMime = mimeType
  if (cleanBase64.startsWith('data:')) {
    const match = cleanBase64.match(/^data:([^;]+);base64,/i)
    if (match) cleanMime = match[1]
    cleanBase64 = cleanBase64.replace(/^data:[^;]+;base64,/i, '').trim()
  }

  // 1. Primary path: Supabase Edge Function (Server-side Gemini 1.5 Flash Vision)
  try {
    const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || ''
    const { data, error } = await supabase.functions.invoke('ai-coach', {
      headers: anonKey ? { apikey: anonKey } : undefined,
      body: {
        task: 'food_multi_item_vision',
        image_base64: cleanBase64,
        mime_type: cleanMime,
      },
    })

    if (!error && data) {
      if (data.is_food === false) {
        return {
          isFood: false,
          items: [],
          overallNotes:
            typeof data.message === 'string'
              ? data.message
              : 'No recognizable food or meal was detected in this photo. Please upload a clear photo of your food.',
        }
      }

      if (Array.isArray(data.items) && data.items.length > 0) {
        const validated: DetectedFoodAnalysisItem[] = data.items.map(
          (it: Record<string, unknown>, idx: number) => {
            const rawServing = Number(it.servingSize) || 100
            const rawQty = Math.max(0.1, Number(it.quantity) || 1)
            const rawCal = Math.max(0, Math.round(Number(it.calories) || 0))
            const rawP = Math.max(0, Math.round((Number(it.protein) || 0) * 10) / 10)
            const rawC = Math.max(0, Math.round((Number(it.carbs) || 0) * 10) / 10)
            const rawF = Math.max(0, Math.round((Number(it.fat) || 0) * 10) / 10)
            const rawFib = Math.max(0, Math.round((Number(it.fiber) || 0) * 10) / 10)

            return {
              id: `detected_${Date.now()}_${idx}`,
              name: typeof it.name === 'string' && it.name.trim() ? it.name.trim() : 'Food Item',
              portion: typeof it.portion === 'string' ? it.portion : `${rawServing}g`,
              servingSize: rawServing,
              servingUnit: typeof it.servingUnit === 'string' ? it.servingUnit : 'g',
              quantity: rawQty,
              calories: rawCal,
              protein: rawP,
              carbs: rawC,
              fat: rawF,
              fiber: rawFib,
              confidence:
                it.confidence === 'high' || it.confidence === 'medium' || it.confidence === 'low'
                  ? it.confidence
                  : 'medium',
              notes: typeof it.notes === 'string' ? it.notes : undefined,
            }
          }
        )

        return {
          isFood: true,
          items: validated,
          overallNotes:
            typeof data.overall_notes === 'string'
              ? data.overall_notes
              : 'Nutritional estimates generated from image analysis. Please review and adjust portions before saving.',
        }
      }
    }

    if (error) {
      let detail = ''
      try {
        if ('context' in error && error.context) {
          const ctx = error.context as Response
          const cloned = ctx.clone ? ctx.clone() : ctx
          const json = await cloned.json().catch(() => null)
          if (json && typeof json === 'object') {
            detail = json.error || json.message || ''
          }
        }
      } catch {
        // ignore
      }
      remoteError = detail || error.message || 'Error communicating with AI Edge Function'
    }
  } catch (err: unknown) {
    remoteError = err instanceof Error ? err.message : 'Network error communicating with AI service'
  }

  // Reject with clear failure reason; never fabricate fake items
  throw new Error(
    remoteError?.includes('GEMINI_API_KEY')
      ? 'AI Vision service requires GEMINI_API_KEY to be configured in Supabase Edge Function secrets.'
      : remoteError ||
        'Unable to analyze image. Please ensure your device is online, or search the verified Food Library.'
  )
}

// ─── Nutrition AI Assistant Context Resolver ──────────────────────────────────

export interface NutritionAssistantContext {
  todayCalories: number
  targetCalories: number
  todayProtein: number
  targetProtein: number
  todayCarbs: number
  targetCarbs: number
  todayFat: number
  targetFat: number
  loggedFoods: { name: string; meal: string; calories: number; protein: number }[]
  avgDailyCalories7d?: number
  avgDailyProtein7d?: number
}

export async function queryNutritionAssistant(
  question: string,
  ctx: NutritionAssistantContext
): Promise<{
  answer: string
  suggestedFoods?: {
    name: string
    portion: string
    calories: number
    protein: number
    carbs: number
    fat: number
    category: string
  }[]
}> {
  const q = question.toLowerCase().trim()

  // 1. Protein consumed / remaining
  if (
    q.includes('how much protein') ||
    q.includes('protein consumed') ||
    q.includes('my protein')
  ) {
    const remaining = Math.max(0, Math.round(ctx.targetProtein - ctx.todayProtein))
    const status =
      ctx.todayProtein >= ctx.targetProtein
        ? 'Target achieved!'
        : `${remaining}g remaining to reach your goal.`
    return {
      answer: `You have consumed ${ctx.todayProtein}g of protein today out of your ${ctx.targetProtein}g daily target. ${status}`,
    }
  }

  // 2. Calories remaining / consumed
  if (
    q.includes('calories remain') ||
    q.includes('remaining calories') ||
    q.includes('calorie budget') ||
    q.includes('how many calories')
  ) {
    const diff = Math.round(ctx.targetCalories - ctx.todayCalories)
    if (diff > 0) {
      return {
        answer: `You have consumed ${ctx.todayCalories.toLocaleString()} kcal today. You have ${diff.toLocaleString()} kcal remaining in your daily energy budget (${ctx.targetCalories.toLocaleString()} kcal target).`,
      }
    } else {
      return {
        answer: `You have consumed ${ctx.todayCalories.toLocaleString()} kcal today, exceeding your daily target of ${ctx.targetCalories.toLocaleString()} kcal by ${Math.abs(diff).toLocaleString()} kcal.`,
      }
    }
  }

  // 3. Which foods have I logged today
  if (
    q.includes('which foods') ||
    q.includes('what foods') ||
    q.includes('what did i eat') ||
    q.includes('logged today')
  ) {
    if (ctx.loggedFoods.length === 0) {
      return {
        answer:
          "You haven't logged any foods yet today. Search the Food Library or snap a meal photo to record your first meal!",
      }
    }
    const list = ctx.loggedFoods
      .map(
        f =>
          `• ${f.name} (${f.meal.toUpperCase()}): ${f.calories} kcal, ${f.protein}g protein`
      )
      .join('\n')
    return {
      answer: `Here are the foods you've logged today (${ctx.loggedFoods.length} items):\n\n${list}\n\nTotal: ${ctx.todayCalories} kcal, ${ctx.todayProtein}g protein.`,
    }
  }

  // 4. Suggest high protein meal / foods to reach remaining target
  if (
    q.includes('suggest') ||
    q.includes('high protein') ||
    q.includes('reach my protein') ||
    q.includes('protein target') ||
    q.includes('snack')
  ) {
    const proteinDeficit = Math.max(15, Math.round(ctx.targetProtein - ctx.todayProtein))
    const suggestions = [
      {
        name: 'Paneer (Cottage Cheese)',
        portion: '100g',
        calories: 265,
        protein: 18.3,
        carbs: 3.4,
        fat: 20.8,
        category: 'proteins',
      },
      {
        name: 'Chicken Breast (Cooked, Boneless)',
        portion: '100g',
        calories: 165,
        protein: 31.0,
        carbs: 0,
        fat: 3.6,
        category: 'proteins',
      },
      {
        name: 'Whole Egg (Boiled)',
        portion: '2 large eggs (100g)',
        calories: 144,
        protein: 12.6,
        carbs: 0.8,
        fat: 9.6,
        category: 'proteins',
      },
      {
        name: 'Greek Yogurt (Plain, Non-fat)',
        portion: '1 cup (170g)',
        calories: 100,
        protein: 17.5,
        carbs: 6.1,
        fat: 0.7,
        category: 'proteins',
      },
      {
        name: 'Soy Chunks (Nutrela, Dry)',
        portion: '50g',
        calories: 172,
        protein: 26.0,
        carbs: 16.5,
        fat: 0.3,
        category: 'proteins',
      },
      {
        name: 'Yellow Dal Tadka (Cooked)',
        portion: '1 bowl (150g)',
        calories: 154,
        protein: 9.2,
        carbs: 22.4,
        fat: 3.6,
        category: 'indian_meals',
      },
    ]

    return {
      answer: `You have approximately ${proteinDeficit}g of protein remaining today. Here are verified high-protein foods from the NutriTrack library that can help you close the gap:`,
      suggestedFoods: suggestions.slice(0, 4),
    }
  }

  // 5. Compare 7-day intake
  if (
    q.includes('7 days') ||
    q.includes('last week') ||
    q.includes('compare') ||
    q.includes('trends')
  ) {
    if (ctx.avgDailyCalories7d && ctx.avgDailyCalories7d > 0) {
      return {
        answer: `Over the past 7 days, your daily average intake has been ${ctx.avgDailyCalories7d.toLocaleString()} kcal and ${ctx.avgDailyProtein7d || 0}g protein per active day. Check the History tab for detailed day-by-day charts!`,
      }
    }
    return {
      answer: `Log meals consistently over a few days to build 7-day nutritional trend averages! Currently tracking ${ctx.todayCalories} kcal today.`,
    }
  }

  // Default answer
  return {
    answer: `Today you have consumed ${ctx.todayCalories.toLocaleString()} / ${ctx.targetCalories.toLocaleString()} kcal and ${ctx.todayProtein}g / ${ctx.targetProtein}g protein. Ask me about remaining macros, logged meals, or high-protein recommendations!`,
  }
}

/**
 * Fetch dates within a range where the authenticated user logged food or completed workouts.
 * Used for subtle, authentic activity dots on the calendar without clutter.
 */
export async function getCalendarActivityIndicators(
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ foodDates: Set<string>; workoutDates: Set<string> }> {
  const foodDates = new Set<string>()
  const workoutDates = new Set<string>()

  if (!userId || userId === 'guest_user') {
    return { foodDates, workoutDates }
  }

  try {
    const [foodRes, workoutRes] = await Promise.all([
      supabase
        .from('food_entries')
        .select('date')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('workout_sessions')
        .select('started_at')
        .eq('user_id', userId)
        .gte('started_at', `${startDate}T00:00:00`)
        .lte('started_at', `${endDate}T23:59:59`),
    ])

    if (foodRes.data) {
      for (const row of foodRes.data) {
        if (row.date) foodDates.add(String(row.date))
      }
    }

    if (workoutRes.data) {
      for (const row of workoutRes.data) {
        if (row.started_at) {
          const dStr = String(row.started_at).split('T')[0]
          workoutDates.add(dStr)
        }
      }
    }
  } catch (err) {
    console.warn('[NutritionService] Failed to load calendar activity indicators:', err)
  }

  // Also check local storage for cached food entries on dates
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`${ENTRIES_KEY_PREFIX}${userId}_`)) {
        const dStr = key.replace(`${ENTRIES_KEY_PREFIX}${userId}_`, '')
        const item = localStorage.getItem(key)
        if (item && item.length > 5) {
          const parsed = JSON.parse(item)
          if (Array.isArray(parsed) && parsed.length > 0) {
            foodDates.add(dStr)
          }
        }
      }
    }
  } catch {}

  return { foodDates, workoutDates }
}
