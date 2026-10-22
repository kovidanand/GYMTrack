export interface ServingUnitOption {
  unit: string
  label: string
  shortLabel: string
  multiplier: number // Multiplier to scale base reference nutrients
  gramsEquivalent?: number
  mlEquivalent?: number
  isDefault?: boolean
  isApproximate?: boolean
  householdName?: string
}

export interface ScaledNutritionResult {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  saturatedFat: number | null
  sugar: number | null
  sodiumMg: number | null
  quantity: number
  unit: string
  unitLabel: string
  shortLabel: string
  portionSummary: string
  householdEquivalence: string
  isApproximateEquivalence: boolean
  totalMultiplier: number
  totalGrams?: number
  totalMl?: number
}

export interface BaseNutrientSource {
  id?: string
  name: string
  serving_size: number
  serving_unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  saturated_fat?: number | null
  sugar?: number | null
  sodium_mg?: number | null
  rawSource?: string
}

/**
 * Normalizes and extracts standard serving units supported for a specific food.
 * Supports exact food-specific culinary measures (banana, egg, roti, cup, katori, scoop, slice, glass)
 * as well as metric units (grams, millilitres).
 * Every non-gram unit has a defined gram/ml equivalent.
 */
export function getFoodServingUnits(food: BaseNutrientSource): ServingUnitOption[] {
  const nameLower = food.name.toLowerCase()
  const unitLower = (food.serving_unit || '').toLowerCase()
  const baseSize = food.serving_size || 1

  // 1. Egg items (1 egg = 50g)
  if (nameLower.includes('egg') && !nameLower.includes('eggplant')) {
    if (nameLower.includes('white')) {
      return [
        { unit: 'egg_white', label: '1 Egg White (≈ 33g)', shortLabel: 'egg white', multiplier: 0.5, gramsEquivalent: 33, householdName: 'egg white', isDefault: true, isApproximate: true },
        { unit: 'g', label: 'Grams (g)', shortLabel: 'g', multiplier: 1 / 66, gramsEquivalent: 1, householdName: 'egg white' },
        { unit: '2_egg_whites', label: '2 Egg Whites (≈ 66g)', shortLabel: 'egg whites', multiplier: 1.0, gramsEquivalent: 66, householdName: 'egg whites', isApproximate: true },
      ]
    }
    return [
      { unit: 'egg', label: 'Whole Egg (≈ 50g)', shortLabel: 'egg', multiplier: 1.0, gramsEquivalent: 50, householdName: 'large egg', isDefault: true, isApproximate: true },
      { unit: 'g', label: 'Grams (g)', shortLabel: 'g', multiplier: 1 / 50, gramsEquivalent: 1, householdName: 'large egg' },
      { unit: 'egg_white', label: 'Egg White (≈ 33g)', shortLabel: 'egg white', multiplier: 33 / 50, gramsEquivalent: 33, householdName: 'egg white', isApproximate: true },
    ]
  }

  // 2. Banana (1 medium = 118g, small = 80g, large = 140g)
  if (nameLower.includes('banana')) {
    // If base reference is 1 medium banana (118g)
    const refGrams = baseSize > 1 ? baseSize : 118
    return [
      { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'medium banana', isDefault: true },
      { unit: 'medium_banana', label: '1 Medium Banana (≈ 118g)', shortLabel: 'medium banana', multiplier: 118 / refGrams, gramsEquivalent: 118, householdName: 'medium banana', isApproximate: true },
      { unit: 'small_banana', label: '1 Small Banana (≈ 80g)', shortLabel: 'small banana', multiplier: 80 / refGrams, gramsEquivalent: 80, householdName: 'small banana', isApproximate: true },
      { unit: 'large_banana', label: '1 Large Banana (≈ 140g)', shortLabel: 'large banana', multiplier: 140 / refGrams, gramsEquivalent: 140, householdName: 'large banana', isApproximate: true },
    ]
  }

  // 3. Apple (1 medium = 180g, small = 150g, large = 220g)
  if (nameLower.includes('apple') && !nameLower.includes('custard')) {
    const refGrams = baseSize > 1 ? baseSize : 180
    return [
      { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'medium apple', isDefault: true },
      { unit: 'medium_apple', label: '1 Medium Apple (≈ 180g)', shortLabel: 'medium apple', multiplier: 180 / refGrams, gramsEquivalent: 180, householdName: 'medium apple', isApproximate: true },
      { unit: 'small_apple', label: '1 Small Apple (≈ 150g)', shortLabel: 'small apple', multiplier: 150 / refGrams, gramsEquivalent: 150, householdName: 'small apple', isApproximate: true },
      { unit: 'large_apple', label: '1 Large Apple (≈ 220g)', shortLabel: 'large apple', multiplier: 220 / refGrams, gramsEquivalent: 220, householdName: 'large apple', isApproximate: true },
    ]
  }

  // 4. Roti / Chapati / Phulka / Flatbread (1 roti ≈ 40g)
  if (nameLower.includes('roti') || nameLower.includes('chapati') || nameLower.includes('phulka')) {
    const refGrams = baseSize > 1 ? baseSize : 40
    return [
      { unit: 'roti', label: '1 Roti / Chapati (≈ 40g)', shortLabel: 'roti', multiplier: 40 / refGrams, gramsEquivalent: 40, householdName: 'roti', isDefault: true, isApproximate: true },
      { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'roti' },
    ]
  }

  // 5. Bread (1 slice ≈ 40g)
  if (nameLower.includes('bread') || unitLower.includes('slice')) {
    const refGrams = baseSize > 1 ? baseSize : 40
    return [
      { unit: 'slice', label: '1 Slice (≈ 40g)', shortLabel: 'slice', multiplier: 40 / refGrams, gramsEquivalent: 40, householdName: 'slice', isDefault: true, isApproximate: true },
      { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'slice' },
    ]
  }

  // 6. Protein Powders / Whey Isolate (1 scoop ≈ 30g)
  if (nameLower.includes('whey') || nameLower.includes('protein powder') || unitLower.includes('scoop')) {
    const refGrams = baseSize > 1 ? baseSize : 30
    return [
      { unit: 'scoop', label: '1 Scoop (≈ 30g)', shortLabel: 'scoop', multiplier: 30 / refGrams, gramsEquivalent: 30, householdName: 'scoop', isDefault: true, isApproximate: true },
      { unit: 'half_scoop', label: '1/2 Scoop (≈ 15g)', shortLabel: '1/2 scoop', multiplier: 15 / refGrams, gramsEquivalent: 15, householdName: 'scoop', isApproximate: true },
      { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'scoop' },
    ]
  }

  // 7. Rice, Oats, Grains (Cooked or Dry)
  if (nameLower.includes('rice') || nameLower.includes('oats') || nameLower.includes('quinoa')) {
    const isDry = nameLower.includes('dry') || nameLower.includes('uncooked')
    const refGrams = baseSize > 1 ? baseSize : 100

    if (isDry) {
      return [
        { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'cup dry', isDefault: true },
        { unit: 'serving_dry', label: '1 Serving Dry (≈ 50g)', shortLabel: 'serving dry', multiplier: 50 / refGrams, gramsEquivalent: 50, householdName: 'serving dry', isApproximate: true },
        { unit: 'cup_dry', label: '1 Cup Dry (≈ 90g)', shortLabel: 'cup dry', multiplier: 90 / refGrams, gramsEquivalent: 90, householdName: 'cup dry', isApproximate: true },
      ]
    }
    return [
      { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'cooked cup', isDefault: true },
      { unit: 'cooked_cup', label: '1 Cooked Cup (≈ 150g)', shortLabel: 'cooked cup', multiplier: 150 / refGrams, gramsEquivalent: 150, householdName: 'cooked cup', isApproximate: true },
      { unit: 'small_katori', label: '1 Small Katori (≈ 100g)', shortLabel: 'small katori', multiplier: 100 / refGrams, gramsEquivalent: 100, householdName: 'small katori', isApproximate: true },
      { unit: 'large_bowl', label: '1 Large Bowl (≈ 250g)', shortLabel: 'large bowl', multiplier: 250 / refGrams, gramsEquivalent: 250, householdName: 'large bowl', isApproximate: true },
    ]
  }

  // 8. Liquid Beverages (Milk, Lassi, Buttermilk, Juices, Tea, Coffee, Water)
  if (
    unitLower.includes('ml') ||
    nameLower.includes('milk') ||
    nameLower.includes('lassi') ||
    nameLower.includes('buttermilk') ||
    nameLower.includes('chaas') ||
    nameLower.includes('tea') ||
    nameLower.includes('coffee') ||
    nameLower.includes('juice')
  ) {
    const refMl = baseSize >= 10 ? baseSize : 100
    return [
      { unit: 'ml', label: 'Millilitres (ml)', shortLabel: 'ml', multiplier: 1 / refMl, mlEquivalent: 1, householdName: 'cup', isDefault: true },
      { unit: 'glass', label: '1 Cup / Glass (≈ 250ml)', shortLabel: 'cup', multiplier: 250 / refMl, mlEquivalent: 250, householdName: 'cup', isApproximate: true },
      { unit: 'small_cup', label: '1 Small Cup (≈ 150ml)', shortLabel: 'small cup', multiplier: 150 / refMl, mlEquivalent: 150, householdName: 'small cup', isApproximate: true },
      { unit: 'serving', label: `1 Standard Serving (≈ ${refMl}ml)`, shortLabel: 'serving', multiplier: 1.0, mlEquivalent: refMl, householdName: 'serving', isApproximate: false },
      { unit: 'liter', label: '1 Liter (1000ml)', shortLabel: 'liter', multiplier: 1000 / refMl, mlEquivalent: 1000, householdName: 'liter' },
    ]
  }

  // 9. Indian Curries, Dals, Sambar, Sabzi, Paneer
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
    const refGrams = baseSize > 1 ? baseSize : 100
    if (nameLower.includes('paneer')) {
      return [
        { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'serving (100g)', isDefault: true },
        { unit: 'serving', label: '1 Serving (≈ 100g)', shortLabel: 'serving', multiplier: 100 / refGrams, gramsEquivalent: 100, householdName: 'serving', isApproximate: true },
        { unit: 'half_serving', label: 'Small Portion (≈ 50g)', shortLabel: 'small portion', multiplier: 50 / refGrams, gramsEquivalent: 50, householdName: 'small portion', isApproximate: true },
      ]
    }

    return [
      { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'katori (150g)', isDefault: true },
      { unit: 'katori', label: '1 Katori / Bowl (≈ 150g)', shortLabel: 'katori', multiplier: 150 / refGrams, gramsEquivalent: 150, householdName: 'katori', isApproximate: true },
      { unit: 'half_katori', label: '1/2 Katori (≈ 75g)', shortLabel: '1/2 katori', multiplier: 75 / refGrams, gramsEquivalent: 75, householdName: 'katori', isApproximate: true },
      { unit: 'cup', label: '1 Cup (≈ 200g)', shortLabel: 'cup', multiplier: 200 / refGrams, gramsEquivalent: 200, householdName: 'cup', isApproximate: true },
    ]
  }

  // 10. Meat, Poultry, Fish (Cooked or Raw)
  if (
    nameLower.includes('chicken') ||
    nameLower.includes('fish') ||
    nameLower.includes('salmon') ||
    nameLower.includes('tuna') ||
    nameLower.includes('beef') ||
    nameLower.includes('mutton') ||
    nameLower.includes('turkey')
  ) {
    const refGrams = baseSize > 1 ? baseSize : 100
    return [
      { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'serving (100g)', isDefault: true },
      { unit: 'serving', label: '1 Standard Serving (≈ 100g)', shortLabel: 'serving', multiplier: 100 / refGrams, gramsEquivalent: 100, householdName: 'serving', isApproximate: true },
      { unit: 'cooked_portion', label: '1 Cooked Portion (≈ 150g)', shortLabel: 'cooked portion', multiplier: 150 / refGrams, gramsEquivalent: 150, householdName: 'cooked portion', isApproximate: true },
    ]
  }

  // 11. Generic items recorded in grams
  if (baseSize >= 10 || unitLower === 'g' || unitLower === 'grams') {
    const refGrams = baseSize || 100
    return [
      { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / refGrams, gramsEquivalent: 1, householdName: 'serving', isDefault: true },
      { unit: 'serving', label: `1 Serving (≈ ${refGrams}g)`, shortLabel: 'serving', multiplier: 1.0, gramsEquivalent: refGrams, householdName: 'serving', isApproximate: false },
    ]
  }

  // 12. Generic piece / packaged item fallback
  const unitName = food.serving_unit || 'piece'
  return [
    { unit: 'serving', label: `1 ${unitName}`, shortLabel: unitName, multiplier: 1.0, householdName: unitName, isDefault: true },
    { unit: 'g', label: 'Grams (g)', shortLabel: 'grams', multiplier: 1 / baseSize, gramsEquivalent: 1, householdName: unitName },
  ]
}

/**
 * Calculates live accurate scaled nutritional values for any selected unit and quantity.
 * Implements strict canonical ratio scaling:
 * - Calculated nutrient = nutrient per 100g * quantity in grams / 100 (for 100g base)
 * - Calculated nutrient = nutrient per serving * (quantity * gramsPerUnit / baseGrams)
 * Preserves full floating-point precision internally and rounds cleanly for display.
 * Distinguishes missing/unavailable data (null) from zero (0).
 */
export function calculateScaledNutrients(
  food: BaseNutrientSource,
  unitOption: ServingUnitOption,
  quantity: number
): ScaledNutritionResult {
  const safeQty = Math.max(0.01, Math.min(10000, Number(quantity) || 1))

  // Exact canonical multiplier
  const totalMultiplier = unitOption.multiplier * safeQty

  // Macronutrients
  const calories = Math.max(0, Math.round(food.calories * totalMultiplier))
  const protein = Math.max(0, Math.round(food.protein * totalMultiplier * 10) / 10)
  const carbs = Math.max(0, Math.round(food.carbs * totalMultiplier * 10) / 10)
  const fat = Math.max(0, Math.round(food.fat * totalMultiplier * 10) / 10)
  const fiber = food.fiber != null ? Math.max(0, Math.round(food.fiber * totalMultiplier * 10) / 10) : 0

  // Optional micronutrients - null when database does not provide verified data
  const saturatedFat =
    food.saturated_fat != null && !isNaN(food.saturated_fat)
      ? Math.max(0, Math.round(food.saturated_fat * totalMultiplier * 10) / 10)
      : null

  const sugar =
    food.sugar != null && !isNaN(food.sugar)
      ? Math.max(0, Math.round(food.sugar * totalMultiplier * 10) / 10)
      : null

  const sodiumMg =
    food.sodium_mg != null && !isNaN(food.sodium_mg)
      ? Math.max(0, Math.round(food.sodium_mg * totalMultiplier))
      : null

  // Format concise portion summary
  let portionSummary = ''
  let householdEquivalence = ''
  let isApproximateEquivalence = false

  const unit = unitOption.unit
  const shortLabel = unitOption.shortLabel || unitOption.label

  if (unit === 'g') {
    portionSummary = `${formatDisplayQty(safeQty)} g`
    // If food has a known household unit equivalent
    if (unitOption.householdName && food.serving_size) {
      const refGrams = getUnitReferenceGrams(food)
      if (refGrams > 0) {
        const approxRatio = Math.round((safeQty / refGrams) * 10) / 10
        const formattedRatio = approxRatio === 1 ? '1' : String(approxRatio)
        householdEquivalence = `≈ ${formattedRatio} ${unitOption.householdName} (${Math.round(safeQty)} g)`
        isApproximateEquivalence = true
      }
    }
  } else if (unit === 'ml') {
    portionSummary = `${formatDisplayQty(safeQty)} ml`
    const approxCup = Math.round((safeQty / 250) * 10) / 10
    const formattedCup = approxCup === 1 ? '1' : String(approxCup)
    householdEquivalence = `≈ ${formattedCup} cup / glass (${Math.round(safeQty)} ml)`
    isApproximateEquivalence = true
  } else {
    portionSummary = `${formatDisplayQty(safeQty)} ${shortLabel}`
    if (unitOption.gramsEquivalent && unitOption.gramsEquivalent > 1) {
      const totalGrams = Math.round(safeQty * unitOption.gramsEquivalent)
      const countLabel = safeQty === 1 ? shortLabel : `${shortLabel}s`
      householdEquivalence = `${formatDisplayQty(safeQty)} ${countLabel} ≈ ${totalGrams} g`
      isApproximateEquivalence = Boolean(unitOption.isApproximate)
    } else if (unitOption.mlEquivalent && unitOption.mlEquivalent > 1) {
      const totalMl = Math.round(safeQty * unitOption.mlEquivalent)
      householdEquivalence = `${formatDisplayQty(safeQty)} ${shortLabel} ≈ ${totalMl} ml`
      isApproximateEquivalence = Boolean(unitOption.isApproximate)
    }
  }

  const totalGrams = unitOption.gramsEquivalent ? Math.round(safeQty * unitOption.gramsEquivalent) : undefined
  const totalMl = unitOption.mlEquivalent ? Math.round(safeQty * unitOption.mlEquivalent) : undefined

  return {
    calories,
    protein,
    carbs,
    fat,
    fiber,
    saturatedFat,
    sugar,
    sodiumMg,
    quantity: safeQty,
    unit: unitOption.unit,
    unitLabel: unitOption.label,
    shortLabel,
    portionSummary,
    householdEquivalence,
    isApproximateEquivalence,
    totalMultiplier,
    totalGrams,
    totalMl,
  }
}

/**
 * Intelligently converts user quantity when changing from one unit to another
 * without causing jarring jumps or double multiplication.
 */
export function convertUnitQuantity(
  prevUnitOption: ServingUnitOption,
  nextUnitOption: ServingUnitOption,
  prevQuantity: number
): number {
  const qty = Math.max(0.01, Number(prevQuantity) || 1)

  // 1. Same unit
  if (prevUnitOption.unit === nextUnitOption.unit) return qty

  // 2. Converting from household unit to grams
  if (nextUnitOption.unit === 'g' && prevUnitOption.gramsEquivalent) {
    return Math.round(qty * prevUnitOption.gramsEquivalent)
  }

  // 3. Converting from grams to household unit
  if (prevUnitOption.unit === 'g' && nextUnitOption.gramsEquivalent && nextUnitOption.gramsEquivalent > 1) {
    const converted = qty / nextUnitOption.gramsEquivalent
    return Math.round(converted * 10) / 10
  }

  // 4. Converting from household unit to ml
  if (nextUnitOption.unit === 'ml' && prevUnitOption.mlEquivalent) {
    return Math.round(qty * prevUnitOption.mlEquivalent)
  }

  // 5. Converting from ml to household unit
  if (prevUnitOption.unit === 'ml' && nextUnitOption.mlEquivalent && nextUnitOption.mlEquivalent > 1) {
    const converted = qty / nextUnitOption.mlEquivalent
    return Math.round(converted * 10) / 10
  }

  // 6. Converting between two household units with known gram equivalents
  if (prevUnitOption.gramsEquivalent && nextUnitOption.gramsEquivalent) {
    const totalG = qty * prevUnitOption.gramsEquivalent
    const converted = totalG / nextUnitOption.gramsEquivalent
    return Math.round(converted * 10) / 10
  }

  // Default: if next is metric default to standard 100g or 250ml, else 1
  if (nextUnitOption.unit === 'g') return 100
  if (nextUnitOption.unit === 'ml') return 250
  return 1
}

function getUnitReferenceGrams(food: BaseNutrientSource): number {
  const nameLower = food.name.toLowerCase()
  if (nameLower.includes('banana')) return 118
  if (nameLower.includes('apple')) return 180
  if (nameLower.includes('egg') && !nameLower.includes('eggplant')) {
    return nameLower.includes('white') ? 33 : 50
  }
  if (nameLower.includes('roti') || nameLower.includes('chapati')) return 40
  if (nameLower.includes('bread')) return 40
  if (nameLower.includes('whey') || nameLower.includes('scoop')) return 30
  if (nameLower.includes('rice') || nameLower.includes('oats')) return 150
  if (nameLower.includes('paneer')) return 100
  return food.serving_size || 100
}

function formatDisplayQty(val: number): string {
  if (Number.isInteger(val)) return String(val)
  return String(Math.round(val * 10) / 10)
}

/**
 * Canonical portion string formatter for daily diary, meal sections, and logs.
 * Resolves legacy or new entry shapes into clean, intuitive human labels:
 * e.g. "150 g", "2 rotis", "1 medium apple", "1 cup (150g)"
 * Completely prevents double-multiplication bugs (e.g. "118 x 118 g" or "2 x 2 roti").
 */
export function formatFoodEntryPortion(entry: {
  serving_size: number
  serving_unit: string
  servings_logged?: number
}): string {
  const size = Number(entry.serving_size) || 1
  const rawUnit = (entry.serving_unit || 'g').trim()
  const servings = Number(entry.servings_logged) || 1
  const lowerUnit = rawUnit.toLowerCase()

  const isMetric = lowerUnit === 'g' || lowerUnit === 'grams' || lowerUnit === 'ml' || lowerUnit === 'millilitres'

  if (isMetric) {
    const totalAmount = (servings > 1 && servings !== size) ? Math.round(size * servings) : size
    const unitText = (lowerUnit === 'grams' || lowerUnit === 'g') ? 'g' : 'ml'
    return `${formatDisplayQty(totalAmount)} ${unitText}`
  }

  // If unit already contains the exact formatted count and weight, e.g. "2 pieces (70g)" or "1 bowl (150g)"
  if (servings === 1 && (lowerUnit.startsWith(String(size)) || lowerUnit.includes(`${size}g`))) {
    return rawUnit
  }

  // Clean unit string (strip leading "1 ", "1x ", etc.)
  const cleanUnit = rawUnit.replace(/^1\s+/i, '').replace(/^1x\s+/i, '').trim()

  // Calculate clean count
  let count = servings
  if (servings === 1 && size > 1 && !lowerUnit.includes('g') && !lowerUnit.includes('ml')) {
    count = size
  } else if (servings === size && servings > 1) {
    count = servings
  } else if (servings > 1 && size > 1) {
    count = servings
  }

  const displayCount = formatDisplayQty(count)

  // Pluralize clean unit if count > 1
  let displayUnit = cleanUnit
  if (count > 1) {
    if (cleanUnit.toLowerCase() === 'roti' || cleanUnit.toLowerCase() === 'chapati') displayUnit = `${cleanUnit}s`
    else if (cleanUnit.toLowerCase() === 'egg') displayUnit = 'eggs'
    else if (cleanUnit.toLowerCase() === 'egg white') displayUnit = 'egg whites'
    else if (cleanUnit.toLowerCase() === 'slice') displayUnit = 'slices'
    else if (cleanUnit.toLowerCase() === 'scoop') displayUnit = 'scoops'
    else if (cleanUnit.toLowerCase() === 'medium apple') displayUnit = 'medium apples'
    else if (cleanUnit.toLowerCase() === 'small apple') displayUnit = 'small apples'
    else if (cleanUnit.toLowerCase() === 'large apple') displayUnit = 'large apples'
    else if (cleanUnit.toLowerCase() === 'banana') displayUnit = 'bananas'
    else if (cleanUnit.toLowerCase() === 'medium banana') displayUnit = 'medium bananas'
    else if (cleanUnit.toLowerCase() === 'small banana') displayUnit = 'small bananas'
    else if (cleanUnit.toLowerCase() === 'large banana') displayUnit = 'large bananas'
    else if (cleanUnit.toLowerCase() === 'katori') displayUnit = 'katoris'
    else if (cleanUnit.toLowerCase() === 'bowl') displayUnit = 'bowls'
    else if (cleanUnit.toLowerCase() === 'cup') displayUnit = 'cups'
    else if (cleanUnit.toLowerCase() === 'serving') displayUnit = 'servings'
    else if (!cleanUnit.toLowerCase().endsWith('s')) displayUnit = `${cleanUnit}s`
  }

  return `${displayCount} ${displayUnit}`
}
