// ─── Nutrition Types ─────────────────────────────────────────────────────────

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

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
  brand?: string | null
  serving_size: number
  serving_unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  barcode?: string | null
  created_at?: string
  updated_at?: string
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

export interface FoodSearchResult {
  id: string
  name: string
  brand?: string
  serving_size: number
  serving_unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  isCustom?: boolean
  imageUrl?: string
  rawSource?: 'openfoodfacts' | 'custom' | 'quick'
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
