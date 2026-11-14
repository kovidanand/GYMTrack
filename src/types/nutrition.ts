// ─── Nutrition Types ─────────────────────────────────────────────────────────

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type CuisineType =
  | 'all'
  | 'indian'
  | 'east_asian'
  | 'southeast_asian'
  | 'european'
  | 'american'
  | 'middle_eastern'
  | 'middle_eastern_african'
  | 'mediterranean'
  | 'global'

export type DietaryClassification =
  | 'all'
  | 'vegetarian'
  | 'vegan'
  | 'eggetarian'
  | 'non_vegetarian'

export interface NutritionGoals {
  id?: string
  user_id?: string
  calorie_target: number
  protein_target: number
  carb_target: number
  fat_target: number
  fiber_target: number
  water_target: number
  created_at?: string
  updated_at?: string
}

export interface CustomFood {
  id: string
  user_id: string
  name: string
  aliases?: string[] | null
  cuisine?: string | null
  category?: string | null
  dietary_classification?: string | null
  brand?: string | null
  serving_size: number
  serving_unit: string
  serving_weight_g?: number | null
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  saturated_fat?: number | null
  sugar?: number | null
  sodium_mg?: number | null
  is_per_100g?: boolean | null
  barcode?: string | null
  image_url?: string | null
  imageUrl?: string | null
  created_at?: string
  updated_at?: string
}

export interface FoodFavorite {
  id: string
  user_id: string
  food_id: string
  food_name: string
  food_data?: Partial<FoodSearchResult> | null
  created_at?: string
}

export interface FoodEntry {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  meal_type: MealType
  food_name: string
  brand?: string | null
  serving_size: number
  serving_unit: string
  servings_logged: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  saturated_fat?: number | null
  sugar?: number | null
  sodium_mg?: number | null
  logged_at: string
  created_at?: string
  updated_at?: string
}

export interface WaterEntry {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  amount_ml: number
  logged_at: string
  created_at?: string
}

export interface ServingUnitOption {
  unit: string
  label: string
  shortLabel: string
  multiplier: number
  gramsEquivalent?: number
  mlEquivalent?: number
  isDefault?: boolean
  isApproximate?: boolean
  householdName?: string
}

export interface FoodSearchResult {
  id: string
  name: string
  brand?: string
  cuisine?: string
  category?: string
  dietary?: string
  aliases?: string[]
  serving_size: number
  serving_unit: string
  serving_weight_g?: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  saturated_fat?: number | null
  sugar?: number | null
  sodium_mg?: number | null
  isCustom?: boolean
  isFavorite?: boolean
  imageUrl?: string
  rawSource?: 'openfoodfacts' | 'custom' | 'quick'
  provenance?: string
  subCategory?: string
  serving_units?: ServingUnitOption[]
  default_unit?: string
}

export interface FoodFilterOptions {
  category?: string
  cuisine?: string
  dietary?: string
  highProtein?: boolean
  lowerCalorie?: boolean
  higherFiber?: boolean
  favoritesOnly?: boolean
  customOnly?: boolean
  sortBy?: 'name' | 'calories_asc' | 'calories_desc' | 'protein_desc' | 'relevance'
}

export interface AIFoodScanResult {
  foodName: string
  estimatedServing: string
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

export interface DailyNutritionTotals {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  water_ml: number
  calorie_target: number
  protein_target: number
  carb_target: number
  fat_target: number
  fiber_target: number
  water_target: number
}
