export interface ServingUnitOption {
  unit: string
  label: string
  multiplier: number // Multiplier to scale base reference nutrients
  gramsEquivalent?: number
  isDefault?: boolean
}

export interface ScaledNutritionResult {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  quantity: number
  unit: string
  unitLabel: string
  portionSummary: string
  totalMultiplier: number
}

export interface BaseNutrientSource {
  name: string
  serving_size: number
  serving_unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

/**
 * Normalizes and extracts standard serving units supported for a specific food.
 * Supports exact food-specific culinary measures (katori, roti, egg, slice, scoop, glass)
 * as well as metric units (grams, milliliters) only where valid.
 */
export function getFoodServingUnits(food: BaseNutrientSource): ServingUnitOption[] {
  const nameLower = food.name.toLowerCase()
  const unitLower = (food.serving_unit || '').toLowerCase()
  const baseSize = food.serving_size || 1

  // 1. Egg items (1 egg = 50g)
  if (nameLower.includes('egg') && !nameLower.includes('eggplant')) {
    if (nameLower.includes('white')) {
      return [
        { unit: 'egg_white', label: '1 Egg White (~33g)', multiplier: 0.5, isDefault: true },
        { unit: '2_egg_whites', label: '2 Egg Whites (~66g)', multiplier: 1.0 },
        { unit: 'g', label: 'Grams (g)', multiplier: 1 / 66 },
        { unit: '100g', label: '100 Grams (100g)', multiplier: 100 / 66 },
      ]
    }
    return [
      { unit: 'egg', label: '1 Large Egg (50g)', multiplier: 1.0, isDefault: true },
      { unit: '2_eggs', label: '2 Large Eggs (100g)', multiplier: 2.0 },
      { unit: 'g', label: 'Grams (g)', multiplier: 1 / 50 },
      { unit: '100g', label: '100 Grams (100g)', multiplier: 2.0 },
    ]
  }

  // 2. Roti / Chapati / Flatbread (1 roti = 40g)
  if (nameLower.includes('roti') || nameLower.includes('chapati') || nameLower.includes('phulka')) {
    return [
      { unit: 'roti', label: '1 Roti / Chapati (40g)', multiplier: 1.0, isDefault: true },
      { unit: '2_rotis', label: '2 Rotis (80g)', multiplier: 2.0 },
      { unit: '3_rotis', label: '3 Rotis (120g)', multiplier: 3.0 },
      { unit: 'g', label: 'Grams (g)', multiplier: 1 / 40 },
      { unit: '100g', label: '100 Grams (100g)', multiplier: 2.5 },
    ]
  }

  // 3. Banana
  if (nameLower.includes('banana')) {
    return [
      { unit: 'medium_banana', label: '1 Medium Banana (118g)', multiplier: 1.0, isDefault: true },
      { unit: 'small_banana', label: '1 Small Banana (80g)', multiplier: 80 / 118 },
      { unit: 'large_banana', label: '1 Large Banana (140g)', multiplier: 140 / 118 },
      { unit: 'g', label: 'Grams (g)', multiplier: 1 / 118 },
      { unit: '100g', label: '100 Grams (100g)', multiplier: 100 / 118 },
    ]
  }

  // 4. Apple
  if (nameLower.includes('apple') && !nameLower.includes('custard')) {
    return [
      { unit: 'medium_apple', label: '1 Medium Apple (180g)', multiplier: 1.0, isDefault: true },
      { unit: 'small_apple', label: '1 Small Apple (150g)', multiplier: 150 / 180 },
      { unit: 'large_apple', label: '1 Large Apple (220g)', multiplier: 220 / 180 },
      { unit: 'g', label: 'Grams (g)', multiplier: 1 / 180 },
      { unit: '100g', label: '100 Grams (100g)', multiplier: 100 / 180 },
    ]
  }

  // 5. Bread
  if (nameLower.includes('bread') || unitLower.includes('slice')) {
    return [
      { unit: 'slice', label: '1 Slice (40g)', multiplier: 1.0, isDefault: true },
      { unit: '2_slices', label: '2 Slices (80g)', multiplier: 2.0 },
      { unit: 'g', label: 'Grams (g)', multiplier: 1 / 40 },
      { unit: '100g', label: '100 Grams (100g)', multiplier: 2.5 },
    ]
  }

  // 6. Protein Powders / Whey
  if (nameLower.includes('whey') || nameLower.includes('protein powder') || unitLower.includes('scoop')) {
    return [
      { unit: 'scoop', label: '1 Scoop (30g)', multiplier: 1.0, isDefault: true },
      { unit: 'half_scoop', label: '1/2 Scoop (15g)', multiplier: 0.5 },
      { unit: 'g', label: 'Grams (g)', multiplier: 1 / 30 },
      { unit: '100g', label: '100 Grams (100g)', multiplier: 100 / 30 },
    ]
  }

  // 7. Liquid Beverages (Milk, Lassi, Buttermilk, Juices, Tea, Coffee)
  if (
    unitLower.includes('ml') ||
    nameLower.includes('milk') ||
    nameLower.includes('lassi') ||
    nameLower.includes('buttermilk') ||
    nameLower.includes('chaas') ||
    nameLower.includes('tea') ||
    nameLower.includes('coffee')
  ) {
    const baseMl = baseSize >= 50 ? baseSize : 250
    return [
      { unit: 'glass', label: '1 Glass / Cup (250ml)', multiplier: 250 / baseMl, isDefault: true },
      { unit: 'small_cup', label: '1 Small Cup (150ml)', multiplier: 150 / baseMl },
      { unit: '100ml', label: '100 Milliliters (100ml)', multiplier: 100 / baseMl },
      { unit: 'ml', label: 'Custom Milliliters (ml)', multiplier: 1 / baseMl },
      { unit: 'liter', label: '1 Liter (1000ml)', multiplier: 1000 / baseMl },
    ]
  }

  // 8. Indian Curries, Dals, Sambar, Sabzi (Katori / Bowl units)
  if (
    nameLower.includes('dal') ||
    nameLower.includes('curry') ||
    nameLower.includes('paneer') ||
    nameLower.includes('chole') ||
    nameLower.includes('rajma') ||
    nameLower.includes('sambar') ||
    nameLower.includes('khichdi') ||
    nameLower.includes('upma') ||
    nameLower.includes('poha') ||
    unitLower.includes('katori') ||
    unitLower.includes('bowl')
  ) {
    // If base is 1 katori (150g)
    const baseG = baseSize > 1 ? baseSize : 150
    return [
      { unit: 'katori', label: '1 Katori / Bowl (150g)', multiplier: 150 / baseG, isDefault: true },
      { unit: 'half_katori', label: '1/2 Katori (75g)', multiplier: 75 / baseG },
      { unit: 'cup', label: '1 Cup (200g)', multiplier: 200 / baseG },
      { unit: 'g', label: 'Grams (g)', multiplier: 1 / baseG },
      { unit: '100g', label: '100 Grams (100g)', multiplier: 100 / baseG },
    ]
  }

  // 9. Rice, Oats, Grains (Cooked or Dry)
  if (nameLower.includes('rice') || nameLower.includes('oats') || nameLower.includes('quinoa')) {
    const isDry = nameLower.includes('dry') || nameLower.includes('uncooked')
    const baseG = baseSize > 1 ? baseSize : 150
    if (isDry) {
      return [
        { unit: 'serving_dry', label: '1 Serving Dry (50g)', multiplier: 50 / baseG, isDefault: true },
        { unit: 'cup_dry', label: '1 Cup Dry (90g)', multiplier: 90 / baseG },
        { unit: 'g', label: 'Grams (g)', multiplier: 1 / baseG },
        { unit: '100g', label: '100 Grams (100g)', multiplier: 100 / baseG },
      ]
    }
    return [
      { unit: 'katori', label: '1 Katori / Cup Cooked (150g)', multiplier: 150 / baseG, isDefault: true },
      { unit: 'small_katori', label: '1 Small Katori (100g)', multiplier: 100 / baseG },
      { unit: 'large_bowl', label: '1 Large Bowl (250g)', multiplier: 250 / baseG },
      { unit: 'g', label: 'Grams (g)', multiplier: 1 / baseG },
      { unit: '100g', label: '100 Grams (100g)', multiplier: 100 / baseG },
    ]
  }

  // 10. Items measured primarily in grams (Meat, Poultry, Fish, Paneer, Tofu, Veggies)
  if (baseSize >= 10 || unitLower === 'g' || unitLower === 'grams') {
    const refG = baseSize || 100
    return [
      { unit: '100g', label: '100 Grams (100g)', multiplier: 100 / refG, isDefault: refG === 100 },
      { unit: 'serving', label: `Standard Serving (${refG}g)`, multiplier: 1.0, isDefault: refG !== 100 },
      { unit: 'g', label: 'Grams (g)', multiplier: 1 / refG },
      { unit: 'portion_small', label: 'Small Portion (50g)', multiplier: 50 / refG },
      { unit: 'portion_large', label: 'Large Portion (200g)', multiplier: 200 / refG },
    ]
  }

  // 11. Generic fallback for piece / item
  return [
    { unit: 'serving', label: `1 Serving (${food.serving_unit || 'piece'})`, multiplier: 1.0, isDefault: true },
    { unit: 'half_serving', label: '0.5 Serving', multiplier: 0.5 },
    { unit: 'double_serving', label: '2 Servings', multiplier: 2.0 },
    { unit: 'g', label: 'Grams (g)', multiplier: 1 / baseSize },
  ]
}

/**
 * Calculates accurate scaled nutritional values for any selected serving unit and quantity.
 * Guarantees zero double-multiplication and strictly immutable calculation from canonical reference.
 */
export function calculateScaledNutrients(
  food: BaseNutrientSource,
  unitOption: ServingUnitOption,
  quantity: number
): ScaledNutritionResult {
  // Validate and clamp quantity to reasonable positive range
  const safeQty = Math.max(0.01, Math.min(10000, Number(quantity) || 1))

  // Base multiplier
  const totalMultiplier = unitOption.multiplier * safeQty

  const calories = Math.round(food.calories * totalMultiplier)
  const protein = Math.round(food.protein * totalMultiplier * 10) / 10
  const carbs = Math.round(food.carbs * totalMultiplier * 10) / 10
  const fat = Math.round(food.fat * totalMultiplier * 10) / 10
  const fiber = Math.round((food.fiber || 0) * totalMultiplier * 10) / 10

  // Format concise portion summary
  let portionSummary = ''
  if (unitOption.unit === 'g') {
    portionSummary = `${Math.round(safeQty)} g`
  } else if (unitOption.unit === 'ml') {
    portionSummary = `${Math.round(safeQty)} ml`
  } else {
    portionSummary = `${safeQty} × ${unitOption.label}`
  }

  return {
    calories: Math.max(0, calories),
    protein: Math.max(0, protein),
    carbs: Math.max(0, carbs),
    fat: Math.max(0, fat),
    fiber: Math.max(0, fiber),
    quantity: safeQty,
    unit: unitOption.unit,
    unitLabel: unitOption.label,
    portionSummary,
    totalMultiplier,
  }
}
