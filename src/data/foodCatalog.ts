export type FoodCategory =
  | 'fruits'
  | 'vegetables'
  | 'proteins'
  | 'grains'
  | 'indian_meals'
  | 'snacks'
  | 'beverages'
  | 'desserts'
  | 'soups_salads'
  | 'fast_food'
  | 'dairy'

export type CuisineType =
  | 'all'
  | 'indian'
  | 'east_asian'
  | 'southeast_asian'
  | 'european'
  | 'american'
  | 'middle_eastern'
  | 'mediterranean'
  | 'global'

export type DietaryClassification =
  | 'all'
  | 'vegetarian'
  | 'vegan'
  | 'eggetarian'
  | 'non_vegetarian'

export interface ServingUnitOption {
  unit: string
  label: string
  shortLabel: string
  multiplier: number // Multiplier relative to reference item calories & macros
  gramsEquivalent?: number
  mlEquivalent?: number
  isDefault?: boolean
  isApproximate?: boolean
  householdName?: string
}

export interface CatalogFoodItem {
  id: string
  name: string
  category: FoodCategory
  cuisine?: CuisineType
  dietary?: DietaryClassification
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
  aliases: string[]
  serving_units?: ServingUnitOption[]
  imageUrl?: string
}

export const FOOD_CATALOG: CatalogFoodItem[] = [
  {
    "id": "fruit_apple",
    "name": "Apple",
    "imageUrl": "/images/foods/apple.webp",
    "category": "fruits",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (180g)",
    "serving_weight_g": 180,
    "calories": 95,
    "protein": 0.5,
    "carbs": 25.1,
    "fat": 0.3,
    "fiber": 4.4,
    "saturated_fat": 0.1,
    "sugar": 19,
    "sodium_mg": 2,
    "aliases": [
      "seb",
      "red apple",
      "green apple",
      "fresh apple"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Medium Apple (≈ 180g)",
        "shortLabel": "apple",
        "multiplier": 1,
        "gramsEquivalent": 180,
        "householdName": "medium apple",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005555555555555556,
        "gramsEquivalent": 1,
        "householdName": "medium apple"
      },
      {
        "unit": "small_apple",
        "label": "1 Small Apple (≈ 150g)",
        "shortLabel": "small apple",
        "multiplier": 0.8333333333333334,
        "gramsEquivalent": 150,
        "householdName": "small apple",
        "isApproximate": true
      },
      {
        "unit": "large_apple",
        "label": "1 Large Apple (≈ 220g)",
        "shortLabel": "large apple",
        "multiplier": 1.2222222222222223,
        "gramsEquivalent": 220,
        "householdName": "large apple",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "fruit_banana",
    "name": "Banana",
    "imageUrl": "/images/foods/banana.webp",
    "category": "fruits",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (118g)",
    "serving_weight_g": 118,
    "calories": 105,
    "protein": 1.3,
    "carbs": 27,
    "fat": 0.4,
    "fiber": 3.1,
    "saturated_fat": 0.1,
    "sugar": 14.4,
    "sodium_mg": 1,
    "aliases": [
      "kela",
      "ripe banana",
      "yellow banana"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Medium Banana (≈ 118g)",
        "shortLabel": "banana",
        "multiplier": 1,
        "gramsEquivalent": 118,
        "householdName": "medium banana",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.00847457627118644,
        "gramsEquivalent": 1,
        "householdName": "medium banana"
      },
      {
        "unit": "small_banana",
        "label": "1 Small Banana (≈ 80g)",
        "shortLabel": "small banana",
        "multiplier": 0.6779661016949152,
        "gramsEquivalent": 80,
        "householdName": "small banana",
        "isApproximate": true
      },
      {
        "unit": "large_banana",
        "label": "1 Large Banana (≈ 140g)",
        "shortLabel": "large banana",
        "multiplier": 1.1864406779661016,
        "gramsEquivalent": 140,
        "householdName": "large banana",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "fruit_orange",
    "name": "Orange",
    "imageUrl": "/images/foods/orange.webp",
    "category": "fruits",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (130g)",
    "serving_weight_g": 130,
    "calories": 62,
    "protein": 1.2,
    "carbs": 15.4,
    "fat": 0.2,
    "fiber": 3.1,
    "saturated_fat": 0,
    "sugar": 12.2,
    "sodium_mg": 0,
    "aliases": [
      "santra",
      "sweet orange",
      "citrus"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Medium Orange (≈ 130g)",
        "shortLabel": "orange",
        "multiplier": 1,
        "gramsEquivalent": 130,
        "householdName": "medium orange",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.007692307692307693,
        "gramsEquivalent": 1,
        "householdName": "medium orange"
      }
    ]
  },
  {
    "id": "fruit_mango",
    "name": "Mango",
    "imageUrl": "/images/foods/mango.webp",
    "category": "fruits",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup sliced (165g)",
    "serving_weight_g": 165,
    "calories": 99,
    "protein": 1.4,
    "carbs": 24.7,
    "fat": 0.6,
    "fiber": 2.6,
    "aliases": [
      "aam",
      "alphonso",
      "ripe mango",
      "mango slices"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup Sliced (≈ 165g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 165,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "piece",
        "label": "1 Whole Mango (≈ 200g pulp)",
        "shortLabel": "mango",
        "multiplier": 1.2121212121212122,
        "gramsEquivalent": 200,
        "householdName": "whole mango",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006060606060606061,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "fruit_grapes",
    "name": "Grapes",
    "imageUrl": "/images/foods/grapes.webp",
    "category": "fruits",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup (150g)",
    "serving_weight_g": 150,
    "calories": 104,
    "protein": 1.1,
    "carbs": 27.3,
    "fat": 0.2,
    "fiber": 1.4,
    "aliases": [
      "angoor",
      "green grapes",
      "black grapes"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup (≈ 150g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "fruit_papaya",
    "name": "Papaya",
    "imageUrl": "/images/foods/papaya.webp",
    "category": "fruits",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup cubed (145g)",
    "serving_weight_g": 145,
    "calories": 62,
    "protein": 0.7,
    "carbs": 15.7,
    "fat": 0.4,
    "fiber": 2.5,
    "aliases": [
      "papita",
      "pawpaw"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup Cubed (≈ 145g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 145,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006896551724137931,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "fruit_watermelon",
    "name": "Watermelon",
    "imageUrl": "/images/foods/watermelon.webp",
    "category": "fruits",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup diced (152g)",
    "serving_weight_g": 152,
    "calories": 46,
    "protein": 0.9,
    "carbs": 11.5,
    "fat": 0.2,
    "fiber": 0.6,
    "aliases": [
      "tarbooj",
      "melon slice"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup Diced (≈ 152g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 152,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "wedge",
        "label": "1 Wedge (≈ 280g)",
        "shortLabel": "wedge",
        "multiplier": 1.8421052631578947,
        "gramsEquivalent": 280,
        "householdName": "wedge",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006578947368421052,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "fruit_guava",
    "name": "Guava",
    "imageUrl": "/images/foods/guava.webp",
    "category": "fruits",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (100g)",
    "serving_weight_g": 100,
    "calories": 68,
    "protein": 2.6,
    "carbs": 14.3,
    "fat": 1,
    "fiber": 5.4,
    "aliases": [
      "amrood",
      "peru",
      "guayaba"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Medium Guava (≈ 100g)",
        "shortLabel": "guava",
        "multiplier": 1,
        "gramsEquivalent": 100,
        "householdName": "medium guava",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "medium guava"
      }
    ]
  },
  {
    "id": "fruit_pomegranate",
    "name": "Pomegranate",
    "imageUrl": "/images/foods/pomegranate.webp",
    "category": "fruits",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup arils (174g)",
    "serving_weight_g": 174,
    "calories": 144,
    "protein": 3,
    "carbs": 32.7,
    "fat": 2.1,
    "fiber": 7,
    "aliases": [
      "anaar",
      "anar seeds",
      "pomegranate seeds"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup Arils (≈ 174g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 174,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "half_cup",
        "label": "1/2 Cup Arils (≈ 87g)",
        "shortLabel": "1/2 cup",
        "multiplier": 0.5,
        "gramsEquivalent": 87,
        "householdName": "half cup",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005747126436781609,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "veg_potato_boiled",
    "name": "Potato (Boiled)",
    "imageUrl": "/images/foods/boiled-potato.webp",
    "category": "vegetables",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "medium (150g)",
    "serving_weight_g": 150,
    "calories": 130,
    "protein": 2.9,
    "carbs": 29.8,
    "fat": 0.2,
    "fiber": 2.6,
    "aliases": [
      "aloo",
      "boiled aloo",
      "boiled potato"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Medium Potato (≈ 150g)",
        "shortLabel": "potato",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "medium potato",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "medium potato"
      }
    ]
  },
  {
    "id": "veg_sweet_potato",
    "name": "Sweet Potato (Baked/Boiled)",
    "imageUrl": "/images/foods/sweet-potato.webp",
    "category": "vegetables",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "medium (150g)",
    "serving_weight_g": 150,
    "calories": 135,
    "protein": 3,
    "carbs": 31,
    "fat": 0.2,
    "fiber": 4.5,
    "aliases": [
      "shakarkandi",
      "baked sweet potato",
      "yam"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Medium Sweet Potato (≈ 150g)",
        "shortLabel": "sweet potato",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "medium sweet potato",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "medium sweet potato"
      }
    ]
  },
  {
    "id": "veg_tomato_fresh",
    "name": "Tomato (Fresh)",
    "imageUrl": "/images/foods/fresh-tomato.webp",
    "category": "vegetables",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "medium (123g)",
    "serving_weight_g": 123,
    "calories": 22,
    "protein": 1.1,
    "carbs": 4.8,
    "fat": 0.2,
    "fiber": 1.5,
    "aliases": [
      "tamatar",
      "red tomato"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Medium Tomato (≈ 123g)",
        "shortLabel": "tomato",
        "multiplier": 1,
        "gramsEquivalent": 123,
        "householdName": "medium tomato",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.008130081300813009,
        "gramsEquivalent": 1,
        "householdName": "medium tomato"
      }
    ]
  },
  {
    "id": "veg_spinach_cooked",
    "name": "Spinach (Cooked/Palak)",
    "imageUrl": "/images/foods/cooked-spinach.webp",
    "category": "vegetables",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup cooked (180g)",
    "serving_weight_g": 180,
    "calories": 41,
    "protein": 5.3,
    "carbs": 6.8,
    "fat": 0.8,
    "fiber": 4.3,
    "aliases": [
      "palak",
      "boiled spinach",
      "saag"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup Cooked (≈ 180g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 180,
        "householdName": "cooked cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005555555555555556,
        "gramsEquivalent": 1,
        "householdName": "cooked cup"
      }
    ]
  },
  {
    "id": "veg_broccoli_steamed",
    "name": "Broccoli (Steamed)",
    "imageUrl": "/images/foods/steamed-broccoli.webp",
    "category": "vegetables",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup (150g)",
    "serving_weight_g": 150,
    "calories": 52,
    "protein": 3.6,
    "carbs": 10.8,
    "fat": 0.6,
    "fiber": 5,
    "aliases": [
      "green cauliflower",
      "steamed broccoli"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup (≈ 150g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "veg_carrot",
    "name": "Carrot (Raw)",
    "imageUrl": "/images/foods/raw-carrot.webp",
    "category": "vegetables",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "medium (61g)",
    "serving_weight_g": 61,
    "calories": 25,
    "protein": 0.6,
    "carbs": 5.8,
    "fat": 0.1,
    "fiber": 1.7,
    "aliases": [
      "gajar",
      "raw carrot"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Medium Carrot (≈ 61g)",
        "shortLabel": "carrot",
        "multiplier": 1,
        "gramsEquivalent": 61,
        "householdName": "medium carrot",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01639344262295082,
        "gramsEquivalent": 1,
        "householdName": "medium carrot"
      }
    ]
  },
  {
    "id": "veg_cauliflower_cooked",
    "name": "Cauliflower (Cooked)",
    "imageUrl": "/images/foods/cooked-cauliflower.webp",
    "category": "vegetables",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup (124g)",
    "serving_weight_g": 124,
    "calories": 28,
    "protein": 2.3,
    "carbs": 5.1,
    "fat": 0.5,
    "fiber": 2.8,
    "aliases": [
      "gobi",
      "phool gobi",
      "boiled gobi"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup (≈ 124g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 124,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.008064516129032258,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "veg_okra_bhindi",
    "name": "Okra / Bhindi (Cooked)",
    "imageUrl": "/images/foods/bhindi-okra.webp",
    "category": "vegetables",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (150g)",
    "serving_weight_g": 150,
    "calories": 128,
    "protein": 3,
    "carbs": 11.2,
    "fat": 7.5,
    "fiber": 4.8,
    "aliases": [
      "bhindi",
      "ladyfinger",
      "bhindi fry",
      "okra"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "protein_whole_egg",
    "name": "Whole Egg (Boiled)",
    "imageUrl": "/images/foods/boiled-egg.webp",
    "category": "proteins",
    "cuisine": "global",
    "dietary": "eggetarian",
    "serving_size": 1,
    "serving_unit": "egg (50g)",
    "serving_weight_g": 50,
    "calories": 72,
    "protein": 6.3,
    "carbs": 0.4,
    "fat": 4.8,
    "fiber": 0,
    "saturated_fat": 1.6,
    "sugar": 0.2,
    "sodium_mg": 70,
    "aliases": [
      "anda",
      "boiled egg",
      "hard boiled egg",
      "egg"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Whole Egg (≈ 50g)",
        "shortLabel": "egg",
        "multiplier": 1,
        "gramsEquivalent": 50,
        "householdName": "egg",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.02,
        "gramsEquivalent": 1,
        "householdName": "egg"
      }
    ]
  },
  {
    "id": "protein_egg_whites",
    "name": "Egg Whites",
    "imageUrl": "/images/foods/egg-whites.webp",
    "category": "proteins",
    "cuisine": "global",
    "dietary": "eggetarian",
    "serving_size": 1,
    "serving_unit": "egg white (33g)",
    "serving_weight_g": 33,
    "calories": 17,
    "protein": 3.6,
    "carbs": 0.2,
    "fat": 0.1,
    "fiber": 0,
    "aliases": [
      "ande ki safedi",
      "egg white liquid",
      "boiled egg white"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Egg White (≈ 33g)",
        "shortLabel": "egg white",
        "multiplier": 1,
        "gramsEquivalent": 33,
        "householdName": "egg white",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.030303030303030304,
        "gramsEquivalent": 1,
        "householdName": "egg white"
      }
    ]
  },
  {
    "id": "protein_chicken_breast",
    "name": "Chicken Breast (Cooked, Boneless)",
    "imageUrl": "/images/foods/chicken-breast.webp",
    "category": "proteins",
    "cuisine": "global",
    "dietary": "non_vegetarian",
    "serving_size": 100,
    "serving_unit": "g",
    "serving_weight_g": 100,
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "fiber": 0,
    "saturated_fat": 1,
    "sugar": 0,
    "sodium_mg": 74,
    "aliases": [
      "grilled chicken",
      "murgh",
      "boiled chicken breast",
      "lean chicken"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "serving (100g)",
        "isDefault": true
      },
      {
        "unit": "serving",
        "label": "Standard Portion (150g)",
        "shortLabel": "portion",
        "multiplier": 1.5,
        "gramsEquivalent": 150,
        "householdName": "portion (150g)",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "protein_paneer_raw",
    "name": "Paneer (Cottage Cheese)",
    "imageUrl": "/images/foods/paneer-raw.webp",
    "category": "proteins",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 100,
    "serving_unit": "g",
    "serving_weight_g": 100,
    "calories": 265,
    "protein": 18.3,
    "carbs": 3.4,
    "fat": 20.8,
    "fiber": 0,
    "saturated_fat": 13,
    "sugar": 2,
    "sodium_mg": 18,
    "aliases": [
      "cottage cheese",
      "indian cottage cheese",
      "fresh paneer",
      "raw paneer"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "serving (100g)",
        "isDefault": true
      },
      {
        "unit": "serving",
        "label": "Standard Serving (100g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 100,
        "householdName": "serving (100g)",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "snack_peanut_butter",
    "name": "Peanut Butter (Natural)",
    "imageUrl": "/images/foods/peanut-butter.webp",
    "category": "snacks",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 2,
    "serving_unit": "tbsp (32g)",
    "serving_weight_g": 32,
    "calories": 188,
    "protein": 8,
    "carbs": 6,
    "fat": 16,
    "fiber": 2,
    "saturated_fat": 3,
    "sugar": 2,
    "sodium_mg": 5,
    "aliases": [
      "peanut butter",
      "pb",
      "natural peanut butter",
      "mungfali butter"
    ],
    "serving_units": [
      {
        "unit": "tbsp",
        "label": "1 Tablespoon (≈ 16g)",
        "shortLabel": "tbsp",
        "multiplier": 0.5,
        "gramsEquivalent": 16,
        "householdName": "tbsp",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "serving",
        "label": "2 Tablespoons (≈ 32g)",
        "shortLabel": "2 tbsp",
        "multiplier": 1,
        "gramsEquivalent": 32,
        "householdName": "2 tbsp",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03125,
        "gramsEquivalent": 1,
        "householdName": "tbsp"
      }
    ]
  },
  {
    "id": "protein_tofu_firm",
    "name": "Tofu (Firm)",
    "imageUrl": "/images/foods/firm-tofu.webp",
    "category": "proteins",
    "cuisine": "east_asian",
    "dietary": "vegan",
    "serving_size": 100,
    "serving_unit": "g",
    "serving_weight_g": 100,
    "calories": 83,
    "protein": 10,
    "carbs": 1.9,
    "fat": 4.8,
    "fiber": 0.9,
    "aliases": [
      "soy bean curd",
      "firm tofu"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "serving (100g)",
        "isDefault": true
      },
      {
        "unit": "serving",
        "label": "Standard Portion (150g)",
        "shortLabel": "portion",
        "multiplier": 1.5,
        "gramsEquivalent": 150,
        "householdName": "portion (150g)",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "protein_soy_chunks_dry",
    "name": "Soy Chunks (Nutrela, Dry)",
    "imageUrl": "/images/foods/soya-chunks.webp",
    "category": "proteins",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 50,
    "serving_unit": "g (dry)",
    "serving_weight_g": 50,
    "calories": 172,
    "protein": 26,
    "carbs": 16.5,
    "fat": 0.3,
    "fiber": 6.5,
    "aliases": [
      "nutrela",
      "soya vadi",
      "soya chunks",
      "textured vegetable protein"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams Dry (g)",
        "shortLabel": "g",
        "multiplier": 0.02,
        "gramsEquivalent": 1,
        "householdName": "serving (50g)",
        "isDefault": true
      },
      {
        "unit": "cup_cooked",
        "label": "1 Cooked Cup (≈ 150g cooked)",
        "shortLabel": "cooked cup",
        "multiplier": 1,
        "gramsEquivalent": 50,
        "householdName": "cooked cup",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "protein_curd_dahi",
    "name": "Curd / Dahi (Plain)",
    "imageUrl": "/images/foods/curd-dahi.webp",
    "category": "dairy",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 100,
    "serving_unit": "g",
    "serving_weight_g": 100,
    "calories": 60,
    "protein": 3.1,
    "carbs": 4.7,
    "fat": 3.3,
    "fiber": 0,
    "aliases": [
      "dahi",
      "yogurt",
      "plain yogurt",
      "homemade curd"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "bowl (150g)",
        "isDefault": true
      },
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1.5,
        "gramsEquivalent": 150,
        "householdName": "bowl",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "staple_greek_yogurt",
    "name": "Greek Yogurt (Plain, Non-fat)",
    "imageUrl": "/images/foods/greek-yogurt.webp",
    "category": "dairy",
    "cuisine": "european",
    "dietary": "vegetarian",
    "serving_size": 150,
    "serving_unit": "g",
    "serving_weight_g": 150,
    "calories": 88,
    "protein": 15.3,
    "carbs": 5.4,
    "fat": 0.6,
    "fiber": 0,
    "aliases": [
      "strained yogurt",
      "high protein yogurt"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "cup (150g)",
        "isDefault": true
      },
      {
        "unit": "cup",
        "label": "1 Cup (≈ 150g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "cup",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "protein_whey_powder",
    "name": "Whey Protein Powder",
    "imageUrl": "/images/foods/whey-protein-powder.webp",
    "category": "proteins",
    "cuisine": "global",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "scoop (30g)",
    "serving_weight_g": 30,
    "calories": 120,
    "protein": 24,
    "carbs": 2,
    "fat": 1.5,
    "fiber": 0,
    "saturated_fat": 0.5,
    "sugar": 1,
    "sodium_mg": 50,
    "aliases": [
      "protein powder",
      "whey isolate",
      "protein shake"
    ],
    "serving_units": [
      {
        "unit": "scoop",
        "label": "1 Scoop (≈ 30g)",
        "shortLabel": "scoop",
        "multiplier": 1,
        "gramsEquivalent": 30,
        "householdName": "scoop",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "half_scoop",
        "label": "1/2 Scoop (≈ 15g)",
        "shortLabel": "1/2 scoop",
        "multiplier": 0.5,
        "gramsEquivalent": 15,
        "householdName": "scoop",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03333333333333333,
        "gramsEquivalent": 1,
        "householdName": "scoop"
      }
    ]
  },
  {
    "id": "protein_salmon_cooked",
    "name": "Fish (Salmon / Rawas, Cooked)",
    "imageUrl": "/images/foods/cooked-salmon.webp",
    "category": "proteins",
    "cuisine": "global",
    "dietary": "non_vegetarian",
    "serving_size": 100,
    "serving_unit": "g",
    "serving_weight_g": 100,
    "calories": 206,
    "protein": 22.1,
    "carbs": 0,
    "fat": 12.3,
    "fiber": 0,
    "aliases": [
      "rawas",
      "grilled salmon",
      "salmon fish"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "fillet (150g)",
        "isDefault": true
      },
      {
        "unit": "fillet",
        "label": "1 Fillet (≈ 150g)",
        "shortLabel": "fillet",
        "multiplier": 1.5,
        "gramsEquivalent": 150,
        "householdName": "fillet",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "protein_canned_tuna",
    "name": "Canned Tuna in Water",
    "imageUrl": "/images/foods/canned-tuna.webp",
    "category": "proteins",
    "cuisine": "global",
    "dietary": "non_vegetarian",
    "serving_size": 100,
    "serving_unit": "g (drained)",
    "serving_weight_g": 100,
    "calories": 116,
    "protein": 25.5,
    "carbs": 0,
    "fat": 0.8,
    "fiber": 0,
    "aliases": [
      "tuna can",
      "tinned tuna"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams Drained (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "can (120g)",
        "isDefault": true
      },
      {
        "unit": "can",
        "label": "1 Can Drained (≈ 120g)",
        "shortLabel": "can",
        "multiplier": 1.2,
        "gramsEquivalent": 120,
        "householdName": "can",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "grain_roti",
    "name": "Roti / Chapati (Whole Wheat)",
    "imageUrl": "/images/foods/roti-chapati.webp",
    "category": "grains",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (40g)",
    "serving_weight_g": 40,
    "calories": 104,
    "protein": 3.5,
    "carbs": 21,
    "fat": 0.8,
    "fiber": 2.8,
    "aliases": [
      "chapati",
      "phulka",
      "roti",
      "gehu ki roti",
      "wheat roti",
      "indian flatbread"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Roti / Piece (≈ 40g)",
        "shortLabel": "roti",
        "multiplier": 1,
        "gramsEquivalent": 40,
        "householdName": "roti",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.025,
        "gramsEquivalent": 1,
        "householdName": "roti"
      }
    ]
  },
  {
    "id": "grain_white_rice",
    "name": "White Rice (Cooked)",
    "imageUrl": "/images/foods/white-rice.webp",
    "category": "grains",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup cooked (150g)",
    "serving_weight_g": 150,
    "calories": 195,
    "protein": 4,
    "carbs": 42.3,
    "fat": 0.4,
    "fiber": 0.6,
    "aliases": [
      "steamed rice",
      "chawal",
      "boiled rice",
      "white rice"
    ],
    "serving_units": [
      {
        "unit": "cooked_cup",
        "label": "1 Cooked Cup (≈ 150g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "cooked cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1.3333333333333333,
        "gramsEquivalent": 200,
        "householdName": "bowl",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "cooked cup"
      }
    ]
  },
  {
    "id": "grain_brown_rice",
    "name": "Brown Rice (Cooked)",
    "imageUrl": "/images/foods/brown-rice.webp",
    "category": "grains",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup cooked (150g)",
    "serving_weight_g": 150,
    "calories": 168,
    "protein": 3.9,
    "carbs": 35.2,
    "fat": 1.4,
    "fiber": 2.7,
    "aliases": [
      "whole grain rice",
      "brown chawal"
    ],
    "serving_units": [
      {
        "unit": "cooked_cup",
        "label": "1 Cooked Cup (≈ 150g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "cooked cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1.3333333333333333,
        "gramsEquivalent": 200,
        "householdName": "bowl",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "cooked cup"
      }
    ]
  },
  {
    "id": "grain_rolled_oats",
    "name": "Rolled Oats (Dry)",
    "imageUrl": "/images/foods/rolled-oats.webp",
    "category": "grains",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 50,
    "serving_unit": "g (dry)",
    "serving_weight_g": 50,
    "calories": 195,
    "protein": 8.5,
    "carbs": 33.1,
    "fat": 3.5,
    "fiber": 5.3,
    "aliases": [
      "oatmeal",
      "quaker oats",
      "dry oats",
      "porridge oats"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams Dry (g)",
        "shortLabel": "g",
        "multiplier": 0.02,
        "gramsEquivalent": 1,
        "householdName": "serving (50g)",
        "isDefault": true
      },
      {
        "unit": "serving_dry",
        "label": "1 Serving Dry (≈ 50g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 50,
        "householdName": "serving dry",
        "isApproximate": true
      },
      {
        "unit": "cup_dry",
        "label": "1 Cup Dry (≈ 90g)",
        "shortLabel": "cup dry",
        "multiplier": 1.8,
        "gramsEquivalent": 90,
        "householdName": "cup dry",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "grain_bread_whole_wheat",
    "name": "Whole Wheat Bread",
    "imageUrl": "/images/foods/whole-wheat-bread.webp",
    "category": "grains",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "slice (40g)",
    "serving_weight_g": 40,
    "calories": 95,
    "protein": 3.8,
    "carbs": 17.5,
    "fat": 1.2,
    "fiber": 2.5,
    "aliases": [
      "brown bread",
      "atta bread",
      "toast"
    ],
    "serving_units": [
      {
        "unit": "slice",
        "label": "1 Slice (≈ 40g)",
        "shortLabel": "slice",
        "multiplier": 1,
        "gramsEquivalent": 40,
        "householdName": "slice",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.025,
        "gramsEquivalent": 1,
        "householdName": "slice"
      }
    ]
  },
  {
    "id": "grain_poha",
    "name": "Poha (Cooked with Veggies)",
    "imageUrl": "/images/foods/poha.webp",
    "category": "grains",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "plate (200g)",
    "serving_weight_g": 200,
    "calories": 260,
    "protein": 4.8,
    "carbs": 48,
    "fat": 6,
    "fiber": 3.5,
    "aliases": [
      "kanda poha",
      "flattened rice",
      "batata poha"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Plate / Bowl (≈ 200g)",
        "shortLabel": "plate",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "plate",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "half_plate",
        "label": "1/2 Plate (≈ 100g)",
        "shortLabel": "1/2 plate",
        "multiplier": 0.5,
        "gramsEquivalent": 100,
        "householdName": "half plate",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "plate"
      }
    ]
  },
  {
    "id": "grain_upma",
    "name": "Rava Upma",
    "imageUrl": "/images/foods/rava-upma.webp",
    "category": "grains",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 230,
    "protein": 5.2,
    "carbs": 35,
    "fat": 7.8,
    "fiber": 3,
    "aliases": [
      "sooji upma",
      "semolina upma",
      "uppumavu"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "grain_idli",
    "name": "Idli (Steamed Rice & Urad)",
    "imageUrl": "/images/foods/idli.webp",
    "category": "grains",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (50g)",
    "serving_weight_g": 50,
    "calories": 65,
    "protein": 2.2,
    "carbs": 13,
    "fat": 0.3,
    "fiber": 0.9,
    "aliases": [
      "steamed idli",
      "rice idli",
      "idly",
      "idlis"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 50g)",
        "shortLabel": "piece",
        "multiplier": 1,
        "gramsEquivalent": 50,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.02,
        "gramsEquivalent": 1,
        "householdName": "piece"
      }
    ]
  },
  {
    "id": "grain_plain_dosa",
    "name": "Plain Dosa",
    "imageUrl": "/images/foods/plain-dosa.webp",
    "category": "grains",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (100g)",
    "serving_weight_g": 100,
    "calories": 168,
    "protein": 3.9,
    "carbs": 29,
    "fat": 3.7,
    "fiber": 1.5,
    "aliases": [
      "sada dosa",
      "crisp dosa",
      "south indian dosa"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 100g)",
        "shortLabel": "piece",
        "multiplier": 1,
        "gramsEquivalent": 100,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "piece"
      }
    ]
  },
  {
    "id": "indian_dal_tadka",
    "name": "Yellow Dal Tadka (Cooked)",
    "imageUrl": "/images/foods/dal-tadka.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (150g)",
    "serving_weight_g": 150,
    "calories": 156,
    "protein": 7.7,
    "carbs": 19.5,
    "fat": 5.2,
    "fiber": 5.7,
    "aliases": [
      "toor dal",
      "arhar dal",
      "dal fry",
      "peeli dal",
      "lentil soup"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "katori",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "half_katori",
        "label": "1/2 Katori (≈ 75g)",
        "shortLabel": "1/2 katori",
        "multiplier": 0.5,
        "gramsEquivalent": 75,
        "householdName": "half katori",
        "isApproximate": true
      },
      {
        "unit": "cup",
        "label": "1 Cup (≈ 200g)",
        "shortLabel": "cup",
        "multiplier": 1.3333333333333333,
        "gramsEquivalent": 200,
        "householdName": "cup",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "katori"
      }
    ]
  },
  {
    "id": "indian_dal_makhani",
    "name": "Dal Makhani",
    "imageUrl": "/images/foods/dal-makhani.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (150g)",
    "serving_weight_g": 150,
    "calories": 252,
    "protein": 8.7,
    "carbs": 22.5,
    "fat": 14.2,
    "fiber": 6,
    "aliases": [
      "maa ki dal",
      "black lentil dal",
      "punjabi dal makhani"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "katori",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "katori"
      }
    ]
  },
  {
    "id": "indian_rajma",
    "name": "Rajma Masala (Kidney Beans Curry)",
    "imageUrl": "/images/foods/rajma-masala.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 236,
    "protein": 11.6,
    "carbs": 32,
    "fat": 6.4,
    "fiber": 10.8,
    "aliases": [
      "rajmah",
      "red kidney beans",
      "rajma curry",
      "punjabi rajma"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "katori",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "katori"
      }
    ]
  },
  {
    "id": "indian_chole",
    "name": "Chole / Chana Masala (Chickpeas Curry)",
    "imageUrl": "/images/foods/chole-masala.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 260,
    "protein": 12.6,
    "carbs": 35,
    "fat": 8,
    "fiber": 10,
    "aliases": [
      "chana masala",
      "kabuli chana",
      "chole curry",
      "punjabi chole"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "katori",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "katori"
      }
    ]
  },
  {
    "id": "indian_palak_paneer",
    "name": "Palak Paneer",
    "imageUrl": "/images/foods/palak-paneer.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 310,
    "protein": 18.4,
    "carbs": 10,
    "fat": 23,
    "fiber": 4,
    "aliases": [
      "spinach cottage cheese",
      "saag paneer"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "katori",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "katori"
      }
    ]
  },
  {
    "id": "indian_paneer_butter_masala",
    "name": "Paneer Butter Masala",
    "imageUrl": "/images/foods/paneer-butter-masala.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 390,
    "protein": 17,
    "carbs": 16,
    "fat": 29,
    "fiber": 2,
    "aliases": [
      "paneer makhani",
      "butter paneer"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "katori",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "katori"
      }
    ]
  },
  {
    "id": "indian_mixed_veg",
    "name": "Mixed Vegetable Curry (Subzi)",
    "imageUrl": "/images/foods/mixed-veg-curry.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (150g)",
    "serving_weight_g": 150,
    "calories": 135,
    "protein": 3.5,
    "carbs": 15,
    "fat": 6.8,
    "fiber": 4.5,
    "aliases": [
      "mix veg",
      "mixed subzi",
      "veg curry"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "katori",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "katori"
      }
    ]
  },
  {
    "id": "indian_khichdi",
    "name": "Moong Dal Khichdi",
    "imageUrl": "/images/foods/moong-dal-khichdi.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (250g)",
    "serving_weight_g": 250,
    "calories": 260,
    "protein": 8.8,
    "carbs": 38,
    "fat": 8.8,
    "fiber": 3.8,
    "aliases": [
      "khichdi",
      "dal khichadi",
      "rice and lentil porridge"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Plate (≈ 250g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 250,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.004,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "indian_sambar",
    "name": "Sambar (South Indian Lentil Stew)",
    "imageUrl": "/images/foods/sambar.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (150g)",
    "serving_weight_g": 150,
    "calories": 98,
    "protein": 4.2,
    "carbs": 12.8,
    "fat": 3,
    "fiber": 3.8,
    "aliases": [
      "sambhar",
      "lentil sambar",
      "south indian stew"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "katori",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "cup",
        "label": "1 Cup (≈ 200g)",
        "shortLabel": "cup",
        "multiplier": 1.3333333333333333,
        "gramsEquivalent": 200,
        "householdName": "cup",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "katori"
      }
    ]
  },
  {
    "id": "indian_chicken_curry",
    "name": "Homestyle Chicken Curry",
    "imageUrl": "/images/foods/homestyle-chicken-curry.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 280,
    "protein": 28,
    "carbs": 8,
    "fat": 15,
    "fiber": 2,
    "aliases": [
      "murgh curry",
      "tari wala chicken",
      "chicken gravy",
      "curry chicken"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "indian_chicken_biryani",
    "name": "Chicken Biryani",
    "imageUrl": "/images/foods/chicken-biryani.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "plate (300g)",
    "serving_weight_g": 300,
    "calories": 525,
    "protein": 28.5,
    "carbs": 60,
    "fat": 19.5,
    "fiber": 2.4,
    "aliases": [
      "biryani",
      "chicken dum biryani",
      "murgh biryani"
    ],
    "serving_units": [
      {
        "unit": "plate",
        "label": "1 Plate (≈ 300g)",
        "shortLabel": "plate",
        "multiplier": 1,
        "gramsEquivalent": 300,
        "householdName": "plate",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "half_plate",
        "label": "1/2 Plate (≈ 150g)",
        "shortLabel": "1/2 plate",
        "multiplier": 0.5,
        "gramsEquivalent": 150,
        "householdName": "half plate",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.0033333333333333335,
        "gramsEquivalent": 1,
        "householdName": "plate"
      }
    ]
  },
  {
    "id": "snack_roasted_chana",
    "name": "Roasted Chickpeas (Bhuna Chana)",
    "imageUrl": "/images/foods/roasted-chana.webp",
    "category": "snacks",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 30,
    "serving_unit": "handful (30g)",
    "serving_weight_g": 30,
    "calories": 110,
    "protein": 6.6,
    "carbs": 17.4,
    "fat": 1.5,
    "fiber": 5.1,
    "aliases": [
      "bhuna chana",
      "roasted gram",
      "chana snack"
    ],
    "serving_units": [
      {
        "unit": "handful",
        "label": "1 Handful (≈ 30g)",
        "shortLabel": "handful",
        "multiplier": 1,
        "gramsEquivalent": 30,
        "householdName": "handful",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03333333333333333,
        "gramsEquivalent": 1,
        "householdName": "handful"
      }
    ]
  },
  {
    "id": "snack_peanuts_roasted",
    "name": "Roasted Peanuts (Unsalted)",
    "imageUrl": "/images/foods/roasted-peanuts.webp",
    "category": "snacks",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 30,
    "serving_unit": "handful (30g)",
    "serving_weight_g": 30,
    "calories": 170,
    "protein": 7.8,
    "carbs": 4.8,
    "fat": 14.7,
    "fiber": 2.6,
    "aliases": [
      "moongphali",
      "groundnuts",
      "mungfali"
    ],
    "serving_units": [
      {
        "unit": "handful",
        "label": "1 Handful (≈ 30g)",
        "shortLabel": "handful",
        "multiplier": 1,
        "gramsEquivalent": 30,
        "householdName": "handful",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03333333333333333,
        "gramsEquivalent": 1,
        "householdName": "handful"
      }
    ]
  },
  {
    "id": "snack_almonds",
    "name": "Raw Almonds",
    "imageUrl": "/images/foods/raw-almonds.webp",
    "category": "snacks",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 10,
    "serving_unit": "almonds (12g)",
    "serving_weight_g": 12,
    "calories": 70,
    "protein": 2.6,
    "carbs": 2.6,
    "fat": 6,
    "fiber": 1.5,
    "aliases": [
      "badaam",
      "badam",
      "whole almonds"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Almond (≈ 1.2g)",
        "shortLabel": "almond",
        "multiplier": 0.1,
        "gramsEquivalent": 1.2,
        "householdName": "almond",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "serving",
        "label": "10 Almonds (≈ 12g)",
        "shortLabel": "10 almonds",
        "multiplier": 1,
        "gramsEquivalent": 12,
        "householdName": "10 almonds",
        "isApproximate": true
      },
      {
        "unit": "handful",
        "label": "1 Handful (≈ 28g)",
        "shortLabel": "handful",
        "multiplier": 2.3333333333333335,
        "gramsEquivalent": 28,
        "householdName": "handful",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.08333333333333333,
        "gramsEquivalent": 1,
        "householdName": "almonds"
      }
    ]
  },
  {
    "id": "snack_walnuts",
    "name": "Walnuts",
    "imageUrl": "/images/foods/walnuts.webp",
    "category": "snacks",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "handful (28g)",
    "serving_weight_g": 28,
    "calories": 185,
    "protein": 4.3,
    "carbs": 3.9,
    "fat": 18.5,
    "fiber": 1.9,
    "aliases": [
      "akhrot",
      "walnut halves"
    ],
    "serving_units": [
      {
        "unit": "handful",
        "label": "1 Handful (≈ 28g)",
        "shortLabel": "handful",
        "multiplier": 1,
        "gramsEquivalent": 28,
        "householdName": "handful",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03571428571428571,
        "gramsEquivalent": 1,
        "householdName": "handful"
      }
    ]
  },
  {
    "id": "snack_makhana",
    "name": "Roasted Makhana (Fox Nuts)",
    "imageUrl": "/images/foods/roasted-makhana.webp",
    "category": "snacks",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup (30g)",
    "serving_weight_g": 30,
    "calories": 106,
    "protein": 2.9,
    "carbs": 23,
    "fat": 0.3,
    "fiber": 2.4,
    "aliases": [
      "fox nuts",
      "lotus seeds",
      "phool makhana"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup (≈ 30g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 30,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03333333333333333,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "snack_sprouts_salad",
    "name": "Moong Sprouts Salad",
    "imageUrl": "/images/foods/moong-sprouts-salad.webp",
    "category": "snacks",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (150g)",
    "serving_weight_g": 150,
    "calories": 120,
    "protein": 9,
    "carbs": 18,
    "fat": 0.8,
    "fiber": 4.5,
    "aliases": [
      "sprouts chaat",
      "ankurit moong",
      "sprouted moong"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "bev_whole_milk",
    "name": "Whole Milk (Full Cream)",
    "imageUrl": "/images/foods/whole-milk.webp",
    "category": "beverages",
    "cuisine": "global",
    "dietary": "vegetarian",
    "serving_size": 250,
    "serving_unit": "ml (1 glass)",
    "serving_weight_g": 250,
    "calories": 155,
    "protein": 8,
    "carbs": 11.8,
    "fat": 8.5,
    "fiber": 0,
    "aliases": [
      "doodh",
      "full cream milk",
      "cow milk whole"
    ],
    "serving_units": [
      {
        "unit": "ml",
        "label": "Millilitres (ml)",
        "shortLabel": "ml",
        "multiplier": 0.004,
        "mlEquivalent": 1,
        "householdName": "glass",
        "isDefault": true
      },
      {
        "unit": "glass",
        "label": "1 Glass / Cup (≈ 250ml)",
        "shortLabel": "glass",
        "multiplier": 1,
        "mlEquivalent": 250,
        "householdName": "glass",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "bev_toned_milk",
    "name": "Toned Milk (Low Fat)",
    "imageUrl": "/images/foods/toned-milk.webp",
    "category": "beverages",
    "cuisine": "global",
    "dietary": "vegetarian",
    "serving_size": 250,
    "serving_unit": "ml (1 glass)",
    "serving_weight_g": 250,
    "calories": 124,
    "protein": 8,
    "carbs": 12.5,
    "fat": 4.5,
    "fiber": 0,
    "aliases": [
      "toned doodh",
      "low fat milk",
      "light milk"
    ],
    "serving_units": [
      {
        "unit": "ml",
        "label": "Millilitres (ml)",
        "shortLabel": "ml",
        "multiplier": 0.004,
        "mlEquivalent": 1,
        "householdName": "glass",
        "isDefault": true
      },
      {
        "unit": "glass",
        "label": "1 Glass / Cup (≈ 250ml)",
        "shortLabel": "glass",
        "multiplier": 1,
        "mlEquivalent": 250,
        "householdName": "glass",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "bev_buttermilk",
    "name": "Buttermilk / Chaas (Salted)",
    "imageUrl": "/images/foods/buttermilk-chaas.webp",
    "category": "beverages",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 200,
    "serving_unit": "ml (1 glass)",
    "serving_weight_g": 200,
    "calories": 60,
    "protein": 3,
    "carbs": 4.8,
    "fat": 1.8,
    "fiber": 0,
    "aliases": [
      "chaas",
      "chhachh",
      "masala chaas",
      "mattha"
    ],
    "serving_units": [
      {
        "unit": "ml",
        "label": "Millilitres (ml)",
        "shortLabel": "ml",
        "multiplier": 0.005,
        "mlEquivalent": 1,
        "householdName": "glass",
        "isDefault": true
      },
      {
        "unit": "glass",
        "label": "1 Glass (≈ 200ml)",
        "shortLabel": "glass",
        "multiplier": 1,
        "mlEquivalent": 200,
        "householdName": "glass",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "bev_sweet_lassi",
    "name": "Sweet Lassi",
    "imageUrl": "/images/foods/sweet-lassi.webp",
    "category": "beverages",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 250,
    "serving_unit": "ml (1 glass)",
    "serving_weight_g": 250,
    "calories": 210,
    "protein": 6,
    "carbs": 32,
    "fat": 6.5,
    "fiber": 0,
    "aliases": [
      "punjabi lassi",
      "sweet curd drink"
    ],
    "serving_units": [
      {
        "unit": "ml",
        "label": "Millilitres (ml)",
        "shortLabel": "ml",
        "multiplier": 0.004,
        "mlEquivalent": 1,
        "householdName": "glass",
        "isDefault": true
      },
      {
        "unit": "glass",
        "label": "1 Glass (≈ 250ml)",
        "shortLabel": "glass",
        "multiplier": 1,
        "mlEquivalent": 250,
        "householdName": "glass",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "bev_chai",
    "name": "Masala Chai with Milk (1 tsp sugar)",
    "imageUrl": "/images/foods/masala-chai.webp",
    "category": "beverages",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 150,
    "serving_unit": "ml (1 cup)",
    "serving_weight_g": 150,
    "calories": 75,
    "protein": 2.2,
    "carbs": 9.5,
    "fat": 2.8,
    "fiber": 0,
    "aliases": [
      "tea",
      "milk tea",
      "adrak chai",
      "indian tea"
    ],
    "serving_units": [
      {
        "unit": "ml",
        "label": "Millilitres (ml)",
        "shortLabel": "ml",
        "multiplier": 0.006666666666666667,
        "mlEquivalent": 1,
        "householdName": "cup",
        "isDefault": true
      },
      {
        "unit": "cup",
        "label": "1 Cup (≈ 150ml)",
        "shortLabel": "cup",
        "multiplier": 1,
        "mlEquivalent": 150,
        "householdName": "cup",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "bev_coffee_black",
    "name": "Black Coffee (No Sugar)",
    "imageUrl": "/images/foods/black-coffee.webp",
    "category": "beverages",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 240,
    "serving_unit": "ml (1 mug)",
    "serving_weight_g": 240,
    "calories": 2,
    "protein": 0.3,
    "carbs": 0.2,
    "fat": 0,
    "fiber": 0,
    "aliases": [
      "espresso",
      "americano",
      "filter coffee black"
    ],
    "serving_units": [
      {
        "unit": "ml",
        "label": "Millilitres (ml)",
        "shortLabel": "ml",
        "multiplier": 0.004166666666666667,
        "mlEquivalent": 1,
        "householdName": "mug",
        "isDefault": true
      },
      {
        "unit": "mug",
        "label": "1 Mug (≈ 240ml)",
        "shortLabel": "mug",
        "multiplier": 1,
        "mlEquivalent": 240,
        "householdName": "mug",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "bev_coconut_water",
    "name": "Fresh Coconut Water",
    "imageUrl": "/images/foods/coconut-water.webp",
    "category": "beverages",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 240,
    "serving_unit": "ml (1 glass)",
    "serving_weight_g": 240,
    "calories": 45,
    "protein": 1.7,
    "carbs": 8.9,
    "fat": 0.5,
    "fiber": 1.1,
    "aliases": [
      "nariyal pani",
      "daab",
      "tender coconut"
    ],
    "serving_units": [
      {
        "unit": "ml",
        "label": "Millilitres (ml)",
        "shortLabel": "ml",
        "multiplier": 0.004166666666666667,
        "mlEquivalent": 1,
        "householdName": "glass",
        "isDefault": true
      },
      {
        "unit": "glass",
        "label": "1 Glass (≈ 240ml)",
        "shortLabel": "glass",
        "multiplier": 1,
        "mlEquivalent": 240,
        "householdName": "glass",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "dessert_gulab_jamun",
    "name": "Gulab Jamun",
    "imageUrl": "/images/foods/gulab-jamun.webp",
    "category": "desserts",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "piece (50g)",
    "serving_weight_g": 50,
    "calories": 175,
    "protein": 2.5,
    "carbs": 26,
    "fat": 7,
    "fiber": 0.2,
    "aliases": [
      "mithai",
      "indian sweet"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 50g)",
        "shortLabel": "piece",
        "multiplier": 1,
        "gramsEquivalent": 50,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.02,
        "gramsEquivalent": 1,
        "householdName": "piece"
      }
    ]
  },
  {
    "id": "dessert_rasgulla",
    "name": "Rasgulla",
    "imageUrl": "/images/foods/rasgulla.webp",
    "category": "desserts",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "piece (50g)",
    "serving_weight_g": 50,
    "calories": 106,
    "protein": 2,
    "carbs": 22,
    "fat": 1,
    "fiber": 0,
    "aliases": [
      "roshogolla",
      "chenna sweet"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 50g)",
        "shortLabel": "piece",
        "multiplier": 1,
        "gramsEquivalent": 50,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.02,
        "gramsEquivalent": 1,
        "householdName": "piece"
      }
    ]
  },
  {
    "id": "dessert_kheer",
    "name": "Rice Kheer (Rice Pudding)",
    "imageUrl": "/images/foods/rice-kheer.webp",
    "category": "desserts",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (150g)",
    "serving_weight_g": 150,
    "calories": 210,
    "protein": 5.5,
    "carbs": 32,
    "fat": 6.8,
    "fiber": 0.4,
    "aliases": [
      "payasam",
      "rice pudding",
      "phirni"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "katori",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "katori"
      }
    ]
  },
  {
    "id": "dessert_dark_chocolate",
    "name": "Dark Chocolate (70% Cacao)",
    "imageUrl": "/images/foods/dark-chocolate.webp",
    "category": "desserts",
    "cuisine": "global",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "square / serving (28g)",
    "serving_weight_g": 28,
    "calories": 170,
    "protein": 2.2,
    "carbs": 13,
    "fat": 12,
    "fiber": 3.1,
    "aliases": [
      "dark chocolate bar",
      "cacao"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Serving / 2-3 Squares (≈ 28g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 28,
        "householdName": "serving",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03571428571428571,
        "gramsEquivalent": 1,
        "householdName": "serving"
      }
    ]
  },
  {
    "id": "indian_masala_dosa",
    "name": "Masala Dosa",
    "imageUrl": "/images/foods/masala-dosa.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (180g)",
    "serving_weight_g": 180,
    "calories": 320,
    "protein": 6.2,
    "carbs": 48,
    "fat": 11.5,
    "fiber": 3.8,
    "saturated_fat": 2.2,
    "sugar": 2,
    "sodium_mg": 380,
    "aliases": [
      "masala dosai",
      "potato dosa",
      "alu dosa"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 180g)",
        "shortLabel": "piece",
        "multiplier": 1,
        "gramsEquivalent": 180,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005555555555555556,
        "gramsEquivalent": 1,
        "householdName": "piece"
      }
    ]
  },
  {
    "id": "indian_ghee_roast_dosa",
    "name": "Ghee Roast Dosa",
    "imageUrl": "/images/foods/ghee-roast-dosa.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "piece (120g)",
    "serving_weight_g": 120,
    "calories": 245,
    "protein": 4.2,
    "carbs": 32,
    "fat": 11,
    "fiber": 1.8,
    "saturated_fat": 6.5,
    "sugar": 1.2,
    "sodium_mg": 280,
    "aliases": [
      "ghee dosa",
      "neyyi roast",
      "crispy ghee dosa"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 120g)",
        "shortLabel": "piece",
        "multiplier": 1,
        "gramsEquivalent": 120,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.008333333333333333,
        "gramsEquivalent": 1,
        "householdName": "piece"
      }
    ]
  },
  {
    "id": "indian_uttapam",
    "name": "Uttapam (Onion & Tomato)",
    "imageUrl": "/images/foods/uttapam.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (140g)",
    "serving_weight_g": 140,
    "calories": 215,
    "protein": 5.1,
    "carbs": 36,
    "fat": 5.5,
    "fiber": 3.2,
    "saturated_fat": 1,
    "sugar": 2.5,
    "sodium_mg": 310,
    "aliases": [
      "uthappam",
      "onion uttapam",
      "tomato uttapam",
      "oothappam"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 140g)",
        "shortLabel": "piece",
        "multiplier": 1,
        "gramsEquivalent": 140,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.007142857142857143,
        "gramsEquivalent": 1,
        "householdName": "piece"
      }
    ]
  },
  {
    "id": "indian_veg_upma",
    "name": "Vegetable Upma",
    "imageUrl": "/images/foods/veg-upma.webp",
    "category": "grains",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 230,
    "protein": 5.2,
    "carbs": 35,
    "fat": 7.8,
    "fiber": 4.2,
    "saturated_fat": 1.8,
    "sugar": 2,
    "sodium_mg": 350,
    "aliases": [
      "vegetable sooji upma",
      "veg uppumavu",
      "khara bath"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "indian_ven_pongal",
    "name": "Ven Pongal",
    "imageUrl": "/images/foods/ven-pongal.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 260,
    "protein": 6.8,
    "carbs": 38,
    "fat": 9,
    "fiber": 3.5,
    "saturated_fat": 4.5,
    "sugar": 0.5,
    "sodium_mg": 340,
    "aliases": [
      "khara pongal",
      "ghee pongal",
      "south indian pongal"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "indian_rasam",
    "name": "Tomato Rasam",
    "imageUrl": "/images/foods/tomato-rasam.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (150g)",
    "serving_weight_g": 150,
    "calories": 63,
    "protein": 1.8,
    "carbs": 9.5,
    "fat": 2,
    "fiber": 1.5,
    "saturated_fat": 0.3,
    "sugar": 3,
    "sodium_mg": 360,
    "aliases": [
      "saaru",
      "rasam soup",
      "thakkali rasam"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "cup",
        "label": "1 Cup (≈ 200g)",
        "shortLabel": "cup",
        "multiplier": 1.3333333333333333,
        "gramsEquivalent": 200,
        "householdName": "cup",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "indian_medu_vada",
    "name": "Medu Vada (Crispy Lentil Fritter)",
    "imageUrl": "/images/foods/medu-vada.webp",
    "category": "snacks",
    "cuisine": "indian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (50g)",
    "serving_weight_g": 50,
    "calories": 145,
    "protein": 4.8,
    "carbs": 14,
    "fat": 7.8,
    "fiber": 2.2,
    "saturated_fat": 1.2,
    "sugar": 0.4,
    "sodium_mg": 180,
    "aliases": [
      "vada",
      "ulundu vadai",
      "urad dal vada"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 50g)",
        "shortLabel": "piece",
        "multiplier": 1,
        "gramsEquivalent": 50,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.02,
        "gramsEquivalent": 1,
        "householdName": "piece"
      }
    ]
  },
  {
    "id": "indian_amritsari_kulcha",
    "name": "Amritsari Kulcha",
    "imageUrl": "/images/foods/amritsari-kulcha.webp",
    "category": "grains",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "piece (100g)",
    "serving_weight_g": 100,
    "calories": 280,
    "protein": 7.2,
    "carbs": 44,
    "fat": 8.2,
    "fiber": 3,
    "saturated_fat": 3.5,
    "sugar": 1.5,
    "sodium_mg": 390,
    "aliases": [
      "kulcha",
      "aloo kulcha",
      "paneer kulcha",
      "stuffed kulcha"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 100g)",
        "shortLabel": "piece",
        "multiplier": 1,
        "gramsEquivalent": 100,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "piece"
      }
    ]
  },
  {
    "id": "indian_aloo_paratha",
    "name": "Aloo Paratha (Homestyle)",
    "imageUrl": "/images/foods/aloo-paratha.webp",
    "category": "grains",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "piece (120g)",
    "serving_weight_g": 120,
    "calories": 290,
    "protein": 6.5,
    "carbs": 42,
    "fat": 10.5,
    "fiber": 4.5,
    "saturated_fat": 3.2,
    "sugar": 1,
    "sodium_mg": 340,
    "aliases": [
      "alu paratha",
      "potato stuffed paratha",
      "punjabi aloo paratha"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Paratha / Piece (≈ 120g)",
        "shortLabel": "paratha",
        "multiplier": 1,
        "gramsEquivalent": 120,
        "householdName": "paratha",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.008333333333333333,
        "gramsEquivalent": 1,
        "householdName": "paratha"
      }
    ]
  },
  {
    "id": "indian_paneer_bhurji",
    "name": "Paneer Bhurji",
    "imageUrl": "/images/foods/paneer-bhurji.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (150g)",
    "serving_weight_g": 150,
    "calories": 285,
    "protein": 18.2,
    "carbs": 6,
    "fat": 21,
    "fiber": 1.8,
    "saturated_fat": 11.5,
    "sugar": 2.2,
    "sodium_mg": 340,
    "aliases": [
      "scrambled paneer",
      "cottage cheese bhurji",
      "spicy paneer bhurji"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 150g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "indian_paneer_tikka",
    "name": "Paneer Tikka (Tandoori Grilled)",
    "imageUrl": "/images/foods/paneer-tikka.webp",
    "category": "proteins",
    "cuisine": "indian",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "serving (150g, 5-6 pcs)",
    "serving_weight_g": 150,
    "calories": 280,
    "protein": 18,
    "carbs": 7.5,
    "fat": 20,
    "fiber": 2.1,
    "saturated_fat": 10.5,
    "sugar": 2,
    "sodium_mg": 360,
    "aliases": [
      "tandoori paneer",
      "paneer tikka dry",
      "grilled paneer"
    ],
    "serving_units": [
      {
        "unit": "serving",
        "label": "1 Serving (≈ 150g, 5-6 pcs)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "serving",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "piece",
        "label": "1 Piece / Cube (≈ 25g)",
        "shortLabel": "piece",
        "multiplier": 0.16666666666666666,
        "gramsEquivalent": 25,
        "householdName": "cube",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "serving"
      }
    ]
  },
  {
    "id": "indian_chicken_tikka",
    "name": "Chicken Tikka (Tandoori Boneless)",
    "imageUrl": "/images/foods/chicken-tikka.webp",
    "category": "proteins",
    "cuisine": "indian",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "serving (150g, 6 pcs)",
    "serving_weight_g": 150,
    "calories": 220,
    "protein": 30.5,
    "carbs": 4,
    "fat": 8.8,
    "fiber": 1.2,
    "saturated_fat": 2.2,
    "sugar": 1.5,
    "sodium_mg": 420,
    "aliases": [
      "tandoori chicken boneless",
      "murgh tikka",
      "chicken tikka kebab"
    ],
    "serving_units": [
      {
        "unit": "serving",
        "label": "1 Serving (≈ 150g, 6 pcs)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "serving",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "piece",
        "label": "1 Piece (≈ 25g)",
        "shortLabel": "piece",
        "multiplier": 0.16666666666666666,
        "gramsEquivalent": 25,
        "householdName": "piece",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "serving"
      }
    ]
  },
  {
    "id": "indian_butter_chicken",
    "name": "Butter Chicken (Murgh Makhani)",
    "imageUrl": "/images/foods/butter-chicken.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 390,
    "protein": 24.5,
    "carbs": 12,
    "fat": 27,
    "fiber": 2,
    "saturated_fat": 12,
    "sugar": 5.5,
    "sodium_mg": 580,
    "aliases": [
      "murgh makhani",
      "chicken makhani",
      "indian butter chicken"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "indian_hyderabadi_biryani",
    "name": "Hyderabadi Dum Chicken Biryani",
    "imageUrl": "/images/foods/hyderabadi-biryani.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "plate (300g)",
    "serving_weight_g": 300,
    "calories": 525,
    "protein": 31,
    "carbs": 62,
    "fat": 16.5,
    "fiber": 3,
    "saturated_fat": 4.5,
    "sugar": 1.8,
    "sodium_mg": 620,
    "aliases": [
      "hyderabadi biryani",
      "dum biryani",
      "spicy chicken biryani"
    ],
    "serving_units": [
      {
        "unit": "plate",
        "label": "1 Plate (≈ 300g)",
        "shortLabel": "plate",
        "multiplier": 1,
        "gramsEquivalent": 300,
        "householdName": "plate",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "half_plate",
        "label": "1/2 Plate (≈ 150g)",
        "shortLabel": "1/2 plate",
        "multiplier": 0.5,
        "gramsEquivalent": 150,
        "householdName": "half plate",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.0033333333333333335,
        "gramsEquivalent": 1,
        "householdName": "plate"
      }
    ]
  },
  {
    "id": "indian_mutton_biryani",
    "name": "Mutton Biryani",
    "imageUrl": "/images/foods/mutton-biryani.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "plate (300g)",
    "serving_weight_g": 300,
    "calories": 640,
    "protein": 28,
    "carbs": 58,
    "fat": 32,
    "fiber": 3.2,
    "saturated_fat": 11.5,
    "sugar": 2,
    "sodium_mg": 640,
    "aliases": [
      "gosht biryani",
      "lamb biryani",
      "goat biryani"
    ],
    "serving_units": [
      {
        "unit": "plate",
        "label": "1 Plate (≈ 300g)",
        "shortLabel": "plate",
        "multiplier": 1,
        "gramsEquivalent": 300,
        "householdName": "plate",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "half_plate",
        "label": "1/2 Plate (≈ 150g)",
        "shortLabel": "1/2 plate",
        "multiplier": 0.5,
        "gramsEquivalent": 150,
        "householdName": "half plate",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.0033333333333333335,
        "gramsEquivalent": 1,
        "householdName": "plate"
      }
    ]
  },
  {
    "id": "protein_beef_steak_grilled",
    "name": "Grilled Beef Steak (Sirloin, Lean)",
    "imageUrl": "/images/foods/beef-steak.webp",
    "category": "proteins",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 100,
    "serving_unit": "g",
    "serving_weight_g": 100,
    "calories": 205,
    "protein": 29.2,
    "carbs": 0,
    "fat": 9.8,
    "fiber": 0,
    "saturated_fat": 3.8,
    "sugar": 0,
    "sodium_mg": 65,
    "aliases": [
      "beef steak",
      "sirloin steak",
      "grilled steak",
      "beef meat"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "steak (200g)",
        "isDefault": true
      },
      {
        "unit": "steak",
        "label": "1 Steak (≈ 200g)",
        "shortLabel": "steak",
        "multiplier": 2,
        "gramsEquivalent": 200,
        "householdName": "steak",
        "isApproximate": true
      },
      {
        "unit": "serving",
        "label": "Portion (150g)",
        "shortLabel": "portion",
        "multiplier": 1.5,
        "gramsEquivalent": 150,
        "householdName": "portion",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "protein_ground_beef_cooked",
    "name": "Cooked Ground Beef (85/15 Lean)",
    "imageUrl": "/images/foods/ground-beef.webp",
    "category": "proteins",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 100,
    "serving_unit": "g",
    "serving_weight_g": 100,
    "calories": 250,
    "protein": 25.8,
    "carbs": 0,
    "fat": 15.4,
    "fiber": 0,
    "saturated_fat": 6,
    "sugar": 0,
    "sodium_mg": 72,
    "aliases": [
      "minced beef",
      "beef mince",
      "keema beef",
      "ground beef"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "cup (150g)",
        "isDefault": true
      },
      {
        "unit": "cup",
        "label": "1 Cup Cooked (≈ 150g)",
        "shortLabel": "cup",
        "multiplier": 1.5,
        "gramsEquivalent": 150,
        "householdName": "cup",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "protein_beef_burger_patty",
    "name": "Beef Burger Patty (Grilled)",
    "imageUrl": "/images/foods/beef-burger-patty.webp",
    "category": "proteins",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "patty (115g)",
    "serving_weight_g": 115,
    "calories": 280,
    "protein": 26.5,
    "carbs": 0,
    "fat": 19,
    "fiber": 0,
    "saturated_fat": 7.5,
    "sugar": 0,
    "sodium_mg": 85,
    "aliases": [
      "burger patty",
      "beef patty",
      "hamburger patty"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Patty (≈ 115g / 1/4 lb)",
        "shortLabel": "patty",
        "multiplier": 1,
        "gramsEquivalent": 115,
        "householdName": "patty",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.008695652173913044,
        "gramsEquivalent": 1,
        "householdName": "patty"
      }
    ]
  },
  {
    "id": "protein_beef_meatballs",
    "name": "Beef Meatballs (Cooked)",
    "imageUrl": "/images/foods/beef-meatballs.webp",
    "category": "proteins",
    "cuisine": "european",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "serving (3 meatballs, 85g)",
    "serving_weight_g": 85,
    "calories": 210,
    "protein": 14.5,
    "carbs": 6.5,
    "fat": 13.8,
    "fiber": 0.8,
    "saturated_fat": 5.2,
    "sugar": 1,
    "sodium_mg": 440,
    "aliases": [
      "meatballs",
      "italian meatballs",
      "baked meatballs"
    ],
    "serving_units": [
      {
        "unit": "serving",
        "label": "1 Serving (3 Meatballs, 85g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 85,
        "householdName": "3 meatballs",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "piece",
        "label": "1 Meatball (≈ 28g)",
        "shortLabel": "meatball",
        "multiplier": 0.3333333333333333,
        "gramsEquivalent": 28,
        "householdName": "meatball",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.011764705882352941,
        "gramsEquivalent": 1,
        "householdName": "meatball"
      }
    ]
  },
  {
    "id": "protein_roast_beef",
    "name": "Roast Beef (Deli Sliced)",
    "imageUrl": "/images/foods/roast-beef.webp",
    "category": "proteins",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "serving (2 slices, 60g)",
    "serving_weight_g": 60,
    "calories": 95,
    "protein": 16.2,
    "carbs": 1,
    "fat": 2.8,
    "fiber": 0,
    "saturated_fat": 1.1,
    "sugar": 0.5,
    "sodium_mg": 480,
    "aliases": [
      "sliced roast beef",
      "deli beef"
    ],
    "serving_units": [
      {
        "unit": "slice",
        "label": "1 Slice (≈ 30g)",
        "shortLabel": "slice",
        "multiplier": 0.5,
        "gramsEquivalent": 30,
        "householdName": "slice",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "serving",
        "label": "2 Slices (≈ 60g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 60,
        "householdName": "2 slices",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.016666666666666666,
        "gramsEquivalent": 1,
        "householdName": "roast beef"
      }
    ]
  },
  {
    "id": "protein_pork_chop_grilled",
    "name": "Grilled Pork Chop (Lean)",
    "imageUrl": "/images/foods/grilled-pork-chop.webp",
    "category": "proteins",
    "cuisine": "european",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "chop (150g)",
    "serving_weight_g": 150,
    "calories": 295,
    "protein": 39.5,
    "carbs": 0,
    "fat": 14,
    "fiber": 0,
    "saturated_fat": 4.8,
    "sugar": 0,
    "sodium_mg": 95,
    "aliases": [
      "pork chop",
      "pork steak",
      "grilled pork"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Chop (≈ 150g)",
        "shortLabel": "chop",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "chop",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "chop"
      }
    ]
  },
  {
    "id": "protein_cooked_bacon",
    "name": "Cooked Bacon (Crispy Strips)",
    "imageUrl": "/images/foods/cooked-bacon.webp",
    "category": "proteins",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "serving (2 strips, 24g)",
    "serving_weight_g": 24,
    "calories": 110,
    "protein": 7.8,
    "carbs": 0.3,
    "fat": 8.6,
    "fiber": 0,
    "saturated_fat": 2.9,
    "sugar": 0.1,
    "sodium_mg": 380,
    "aliases": [
      "bacon",
      "crispy bacon",
      "pork bacon"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Strip (≈ 12g)",
        "shortLabel": "strip",
        "multiplier": 0.5,
        "gramsEquivalent": 12,
        "householdName": "strip",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "serving",
        "label": "2 Strips (≈ 24g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 24,
        "householdName": "2 strips",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.041666666666666664,
        "gramsEquivalent": 1,
        "householdName": "bacon"
      }
    ]
  },
  {
    "id": "protein_pork_tenderloin",
    "name": "Pork Tenderloin (Roasted, Lean)",
    "imageUrl": "/images/foods/pork-tenderloin.webp",
    "category": "proteins",
    "cuisine": "european",
    "dietary": "non_vegetarian",
    "serving_size": 100,
    "serving_unit": "g",
    "serving_weight_g": 100,
    "calories": 143,
    "protein": 26.2,
    "carbs": 0,
    "fat": 3.5,
    "fiber": 0,
    "saturated_fat": 1.2,
    "sugar": 0,
    "sodium_mg": 55,
    "aliases": [
      "lean pork",
      "roasted tenderloin"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "portion (150g)",
        "isDefault": true
      },
      {
        "unit": "portion",
        "label": "1 Portion (≈ 150g)",
        "shortLabel": "portion",
        "multiplier": 1.5,
        "gramsEquivalent": 150,
        "householdName": "portion",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "protein_lamb_kebab",
    "name": "Lamb Kebab (Seekh / Skewer)",
    "imageUrl": "/images/foods/lamb-kebab.webp",
    "category": "proteins",
    "cuisine": "middle_eastern",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "skewer (100g)",
    "serving_weight_g": 100,
    "calories": 235,
    "protein": 19.5,
    "carbs": 4.2,
    "fat": 15.5,
    "fiber": 1.2,
    "saturated_fat": 6.2,
    "sugar": 1,
    "sodium_mg": 480,
    "aliases": [
      "seekh kebab",
      "lamb skewer",
      "mutton seekh kebab"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Skewer (≈ 100g)",
        "shortLabel": "skewer",
        "multiplier": 1,
        "gramsEquivalent": 100,
        "householdName": "skewer",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "skewer"
      }
    ]
  },
  {
    "id": "protein_lamb_curry",
    "name": "Lamb Curry (Homestyle)",
    "imageUrl": "/images/foods/lamb-curry.webp",
    "category": "indian_meals",
    "cuisine": "indian",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 340,
    "protein": 25,
    "carbs": 8.5,
    "fat": 22.5,
    "fiber": 2,
    "saturated_fat": 8.5,
    "sugar": 2.5,
    "sodium_mg": 560,
    "aliases": [
      "mutton curry",
      "gosht curry",
      "lamb gravy"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl / Katori (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "protein_salmon_fillet_pan_seared",
    "name": "Pan-Seared Salmon Fillet",
    "imageUrl": "/images/foods/pan-seared-salmon-fillet.webp",
    "category": "proteins",
    "cuisine": "european",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "fillet (150g)",
    "serving_weight_g": 150,
    "calories": 310,
    "protein": 33.2,
    "carbs": 0,
    "fat": 18.5,
    "fiber": 0,
    "saturated_fat": 3.8,
    "sugar": 0,
    "sodium_mg": 90,
    "aliases": [
      "salmon fillet",
      "crispy skin salmon",
      "pan seared salmon"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Fillet (≈ 150g)",
        "shortLabel": "fillet",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "fillet",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "fillet"
      }
    ]
  },
  {
    "id": "protein_tuna_steak",
    "name": "Tuna Steak (Yellowfin, Grilled)",
    "imageUrl": "/images/foods/tuna-steak.webp",
    "category": "proteins",
    "cuisine": "global",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "steak (150g)",
    "serving_weight_g": 150,
    "calories": 195,
    "protein": 44.5,
    "carbs": 0,
    "fat": 1.5,
    "fiber": 0,
    "saturated_fat": 0.4,
    "sugar": 0,
    "sodium_mg": 75,
    "aliases": [
      "grilled tuna",
      "ahi tuna",
      "yellowfin tuna steak"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Steak (≈ 150g)",
        "shortLabel": "steak",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "steak",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "steak"
      }
    ]
  },
  {
    "id": "protein_cooked_shrimp",
    "name": "Cooked Shrimp (Steamed/Boiled)",
    "imageUrl": "/images/foods/cooked-shrimp.webp",
    "category": "proteins",
    "cuisine": "global",
    "dietary": "non_vegetarian",
    "serving_size": 100,
    "serving_unit": "g (≈ 8-10 pcs)",
    "serving_weight_g": 100,
    "calories": 99,
    "protein": 24,
    "carbs": 0.2,
    "fat": 0.3,
    "fiber": 0,
    "saturated_fat": 0.1,
    "sugar": 0,
    "sodium_mg": 190,
    "aliases": [
      "prawns",
      "jheenga",
      "boiled shrimp",
      "steamed prawns"
    ],
    "serving_units": [
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "serving (100g)",
        "isDefault": true
      },
      {
        "unit": "piece",
        "label": "1 Large Shrimp (≈ 12g)",
        "shortLabel": "shrimp",
        "multiplier": 0.12,
        "gramsEquivalent": 12,
        "householdName": "shrimp",
        "isApproximate": true
      }
    ]
  },
  {
    "id": "protein_grilled_cod",
    "name": "Grilled Cod (Atlantic Whitefish)",
    "imageUrl": "/images/foods/grilled-cod.webp",
    "category": "proteins",
    "cuisine": "european",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "fillet (150g)",
    "serving_weight_g": 150,
    "calories": 135,
    "protein": 30.5,
    "carbs": 0,
    "fat": 1.2,
    "fiber": 0,
    "saturated_fat": 0.2,
    "sugar": 0,
    "sodium_mg": 110,
    "aliases": [
      "cod fish",
      "white fish fillet",
      "baked cod"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Fillet (≈ 150g)",
        "shortLabel": "fillet",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "fillet",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "fillet"
      }
    ]
  },
  {
    "id": "protein_canned_sardines",
    "name": "Sardines (Canned in Olive Oil, Drained)",
    "imageUrl": "/images/foods/canned-sardines.webp",
    "category": "proteins",
    "cuisine": "mediterranean",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "can drained (85g)",
    "serving_weight_g": 85,
    "calories": 175,
    "protein": 21,
    "carbs": 0,
    "fat": 9.8,
    "fiber": 0,
    "saturated_fat": 1.8,
    "sugar": 0,
    "sodium_mg": 320,
    "aliases": [
      "canned sardines",
      "tinned sardines",
      "pilchards"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Can Drained (≈ 85g)",
        "shortLabel": "can",
        "multiplier": 1,
        "gramsEquivalent": 85,
        "householdName": "can",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.011764705882352941,
        "gramsEquivalent": 1,
        "householdName": "can"
      }
    ]
  },
  {
    "id": "asian_salmon_sushi",
    "name": "Salmon Sushi (Nigiri)",
    "imageUrl": "/images/foods/salmon-sushi.webp",
    "category": "fast_food",
    "cuisine": "east_asian",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "serving (2 pcs, 70g)",
    "serving_weight_g": 70,
    "calories": 135,
    "protein": 8.5,
    "carbs": 18,
    "fat": 2.8,
    "fiber": 0.5,
    "saturated_fat": 0.6,
    "sugar": 1.5,
    "sodium_mg": 240,
    "aliases": [
      "sushi",
      "salmon nigiri",
      "sake nigiri"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Piece (≈ 35g)",
        "shortLabel": "piece",
        "multiplier": 0.5,
        "gramsEquivalent": 35,
        "householdName": "piece",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "serving",
        "label": "2 Pieces (≈ 70g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 70,
        "householdName": "2 pieces",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.014285714285714285,
        "gramsEquivalent": 1,
        "householdName": "sushi"
      }
    ]
  },
  {
    "id": "asian_chicken_teriyaki",
    "name": "Chicken Teriyaki",
    "imageUrl": "/images/foods/chicken-teriyaki.webp",
    "category": "proteins",
    "cuisine": "east_asian",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "serving (150g)",
    "serving_weight_g": 150,
    "calories": 260,
    "protein": 28.5,
    "carbs": 12,
    "fat": 10.5,
    "fiber": 0.8,
    "saturated_fat": 2.5,
    "sugar": 8,
    "sodium_mg": 650,
    "aliases": [
      "teriyaki chicken",
      "japanese chicken teriyaki"
    ],
    "serving_units": [
      {
        "unit": "serving",
        "label": "1 Serving (≈ 150g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "serving",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "serving"
      }
    ]
  },
  {
    "id": "asian_tofu_stir_fry",
    "name": "Tofu Stir Fry with Vegetables",
    "imageUrl": "/images/foods/tofu-stir-fry.webp",
    "category": "proteins",
    "cuisine": "east_asian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (220g)",
    "serving_weight_g": 220,
    "calories": 195,
    "protein": 13.5,
    "carbs": 12.5,
    "fat": 10.5,
    "fiber": 4.2,
    "saturated_fat": 1.5,
    "sugar": 4,
    "sodium_mg": 480,
    "aliases": [
      "tofu veg stir fry",
      "asian tofu",
      "wok tofu"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl (≈ 220g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 220,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.004545454545454545,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "asian_miso_soup",
    "name": "Miso Soup with Tofu & Seaweed",
    "imageUrl": "/images/foods/miso-soup.webp",
    "category": "soups_salads",
    "cuisine": "east_asian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (200ml)",
    "serving_weight_g": 200,
    "calories": 65,
    "protein": 4.5,
    "carbs": 6.2,
    "fat": 2.2,
    "fiber": 1.4,
    "saturated_fat": 0.3,
    "sugar": 2,
    "sodium_mg": 620,
    "aliases": [
      "japanese miso soup",
      "tofu miso",
      "miso broth"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl (≈ 200ml)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "mlEquivalent": 200,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "ml",
        "label": "Millilitres (ml)",
        "shortLabel": "ml",
        "multiplier": 0.005,
        "mlEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "asian_ramen_noodles",
    "name": "Ramen Noodles with Broth & Egg",
    "imageUrl": "/images/foods/ramen-noodles.webp",
    "category": "fast_food",
    "cuisine": "east_asian",
    "dietary": "eggetarian",
    "serving_size": 1,
    "serving_unit": "large bowl (450g)",
    "serving_weight_g": 450,
    "calories": 480,
    "protein": 21.5,
    "carbs": 58,
    "fat": 17.5,
    "fiber": 3.8,
    "saturated_fat": 4.5,
    "sugar": 4,
    "sodium_mg": 1200,
    "aliases": [
      "japanese ramen",
      "shoyu ramen",
      "noodle soup ramen"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Large Bowl (≈ 450g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 450,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.0022222222222222222,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "asian_kimchi",
    "name": "Kimchi (Traditional Napa Cabbage)",
    "imageUrl": "/images/foods/kimchi.webp",
    "category": "vegetables",
    "cuisine": "east_asian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "serving (50g)",
    "serving_weight_g": 50,
    "calories": 15,
    "protein": 1.1,
    "carbs": 2.4,
    "fat": 0.3,
    "fiber": 1.4,
    "saturated_fat": 0,
    "sugar": 1,
    "sodium_mg": 320,
    "aliases": [
      "korean kimchi",
      "fermented cabbage",
      "baechu kimchi"
    ],
    "serving_units": [
      {
        "unit": "serving",
        "label": "1 Serving / Small Dish (≈ 50g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 50,
        "householdName": "serving",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.02,
        "gramsEquivalent": 1,
        "householdName": "serving"
      }
    ]
  },
  {
    "id": "asian_edamame_steamed",
    "name": "Edamame (Steamed in Pods)",
    "imageUrl": "/images/foods/steamed-edamame.webp",
    "category": "proteins",
    "cuisine": "east_asian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup in pods (155g, 85g beans)",
    "serving_weight_g": 85,
    "calories": 122,
    "protein": 11.5,
    "carbs": 8.9,
    "fat": 5.2,
    "fiber": 5.2,
    "saturated_fat": 0.6,
    "sugar": 2,
    "sodium_mg": 15,
    "aliases": [
      "steamed soy beans",
      "edamame pods",
      "green soy beans"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup in Pods (≈ 155g gross / 85g beans)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 85,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams Edible Beans (g)",
        "shortLabel": "g",
        "multiplier": 0.011764705882352941,
        "gramsEquivalent": 1,
        "householdName": "beans"
      }
    ]
  },
  {
    "id": "asian_soba_noodles",
    "name": "Soba Noodles (Buckwheat, Cooked)",
    "imageUrl": "/images/foods/soba-noodles.webp",
    "category": "grains",
    "cuisine": "east_asian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup cooked (115g)",
    "serving_weight_g": 115,
    "calories": 114,
    "protein": 5.8,
    "carbs": 24.4,
    "fat": 0.1,
    "fiber": 2.8,
    "saturated_fat": 0,
    "sugar": 0,
    "sodium_mg": 70,
    "aliases": [
      "buckwheat noodles",
      "japanese soba",
      "chilled soba"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup Cooked (≈ 115g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 115,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.008695652173913044,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "asian_bibimbap",
    "name": "Bibimbap (Korean Mixed Rice & Veg Bowl)",
    "imageUrl": "/images/foods/bibimbap.webp",
    "category": "fast_food",
    "cuisine": "east_asian",
    "dietary": "eggetarian",
    "serving_size": 1,
    "serving_unit": "bowl (350g)",
    "serving_weight_g": 350,
    "calories": 460,
    "protein": 18.5,
    "carbs": 68,
    "fat": 12.5,
    "fiber": 6,
    "saturated_fat": 2.8,
    "sugar": 6,
    "sodium_mg": 680,
    "aliases": [
      "korean bibimbap",
      "dolsot bibimbap",
      "rice bowl with egg and veg"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl (≈ 350g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 350,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.002857142857142857,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "asian_veg_dumplings",
    "name": "Vegetable Dumplings (Steamed Gyoza)",
    "imageUrl": "/images/foods/veg-dumplings.webp",
    "category": "snacks",
    "cuisine": "east_asian",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "serving (4 pcs, 100g)",
    "serving_weight_g": 100,
    "calories": 175,
    "protein": 6.2,
    "carbs": 28.5,
    "fat": 3.8,
    "fiber": 2.5,
    "saturated_fat": 0.6,
    "sugar": 2,
    "sodium_mg": 380,
    "aliases": [
      "momos",
      "steamed momos",
      "gyoza",
      "dim sum",
      "potstickers"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Dumpling (≈ 25g)",
        "shortLabel": "dumpling",
        "multiplier": 0.25,
        "gramsEquivalent": 25,
        "householdName": "dumpling",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "serving",
        "label": "4 Dumplings (≈ 100g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 100,
        "householdName": "4 dumplings",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "dumpling"
      }
    ]
  },
  {
    "id": "euro_hummus",
    "name": "Hummus (Creamy Chickpea Dip)",
    "imageUrl": "/images/foods/hummus.webp",
    "category": "snacks",
    "cuisine": "middle_eastern",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "tbsp (30g)",
    "serving_weight_g": 30,
    "calories": 70,
    "protein": 2.4,
    "carbs": 4.8,
    "fat": 4.6,
    "fiber": 1.8,
    "saturated_fat": 0.6,
    "sugar": 0.4,
    "sodium_mg": 115,
    "aliases": [
      "houmous",
      "chickpea dip",
      "tahini hummus"
    ],
    "serving_units": [
      {
        "unit": "tbsp",
        "label": "2 Tablespoons (≈ 30g)",
        "shortLabel": "tbsp",
        "multiplier": 1,
        "gramsEquivalent": 30,
        "householdName": "2 tbsp",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "bowl",
        "label": "Small Bowl (≈ 100g)",
        "shortLabel": "bowl",
        "multiplier": 3.3333333333333335,
        "gramsEquivalent": 100,
        "householdName": "bowl",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03333333333333333,
        "gramsEquivalent": 1,
        "householdName": "tbsp"
      }
    ]
  },
  {
    "id": "euro_falafel",
    "name": "Falafel (Crisp Chickpea Balls)",
    "imageUrl": "/images/foods/falafel.webp",
    "category": "snacks",
    "cuisine": "middle_eastern",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (25g)",
    "serving_weight_g": 25,
    "calories": 70,
    "protein": 2.2,
    "carbs": 7.3,
    "fat": 3.7,
    "fiber": 1.5,
    "saturated_fat": 0.5,
    "sugar": 0.5,
    "sodium_mg": 95,
    "aliases": [
      "felafel",
      "chickpea fritter",
      "falafel ball"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Falafel Ball (≈ 25g)",
        "shortLabel": "falafel",
        "multiplier": 1,
        "gramsEquivalent": 25,
        "householdName": "falafel",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "serving",
        "label": "3 Falafel Balls (≈ 75g)",
        "shortLabel": "serving",
        "multiplier": 3,
        "gramsEquivalent": 75,
        "householdName": "3 falafel",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.04,
        "gramsEquivalent": 1,
        "householdName": "falafel"
      }
    ]
  },
  {
    "id": "euro_pita_bread",
    "name": "Pita Bread (Whole Wheat)",
    "imageUrl": "/images/foods/pita-bread.webp",
    "category": "grains",
    "cuisine": "middle_eastern",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "piece (60g)",
    "serving_weight_g": 60,
    "calories": 165,
    "protein": 6,
    "carbs": 32,
    "fat": 1.2,
    "fiber": 4,
    "saturated_fat": 0.2,
    "sugar": 1,
    "sodium_mg": 320,
    "aliases": [
      "pita pocket",
      "arabic bread",
      "whole wheat pita"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Pita (≈ 60g)",
        "shortLabel": "pita",
        "multiplier": 1,
        "gramsEquivalent": 60,
        "householdName": "pita",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.016666666666666666,
        "gramsEquivalent": 1,
        "householdName": "pita"
      }
    ]
  },
  {
    "id": "euro_tzatziki",
    "name": "Tzatziki (Greek Yogurt Dip)",
    "imageUrl": "/images/foods/tzatziki.webp",
    "category": "snacks",
    "cuisine": "european",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "tbsp (30g)",
    "serving_weight_g": 30,
    "calories": 35,
    "protein": 2.2,
    "carbs": 1.5,
    "fat": 2,
    "fiber": 0.2,
    "saturated_fat": 1.2,
    "sugar": 1,
    "sodium_mg": 70,
    "aliases": [
      "greek yogurt cucumber dip",
      "tzadziki",
      "cucumber garlic dip"
    ],
    "serving_units": [
      {
        "unit": "tbsp",
        "label": "2 Tablespoons (≈ 30g)",
        "shortLabel": "tbsp",
        "multiplier": 1,
        "gramsEquivalent": 30,
        "householdName": "2 tbsp",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "bowl",
        "label": "Small Bowl (≈ 100g)",
        "shortLabel": "bowl",
        "multiplier": 3.3333333333333335,
        "gramsEquivalent": 100,
        "householdName": "bowl",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03333333333333333,
        "gramsEquivalent": 1,
        "householdName": "tbsp"
      }
    ]
  },
  {
    "id": "euro_feta_cheese",
    "name": "Feta Cheese (Crumbled)",
    "imageUrl": "/images/foods/feta-cheese.webp",
    "category": "dairy",
    "cuisine": "european",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "serving (30g)",
    "serving_weight_g": 30,
    "calories": 75,
    "protein": 4.2,
    "carbs": 1.2,
    "fat": 6,
    "fiber": 0,
    "saturated_fat": 4.2,
    "sugar": 1.2,
    "sodium_mg": 330,
    "aliases": [
      "greek feta",
      "crumbled feta",
      "goat cheese feta"
    ],
    "serving_units": [
      {
        "unit": "serving",
        "label": "1 Serving / Crumbled (≈ 30g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 30,
        "householdName": "serving",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.03333333333333333,
        "gramsEquivalent": 1,
        "householdName": "serving"
      }
    ]
  },
  {
    "id": "euro_quinoa_salad",
    "name": "Mediterranean Quinoa Salad",
    "imageUrl": "/images/foods/mediterranean-quinoa-salad.webp",
    "category": "soups_salads",
    "cuisine": "european",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "bowl (180g)",
    "serving_weight_g": 180,
    "calories": 220,
    "protein": 7.2,
    "carbs": 28.5,
    "fat": 9,
    "fiber": 4.5,
    "saturated_fat": 1.2,
    "sugar": 3.5,
    "sodium_mg": 240,
    "aliases": [
      "quinoa veg salad",
      "greek quinoa bowl"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl (≈ 180g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 180,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005555555555555556,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "euro_cooked_pasta",
    "name": "Cooked Pasta (Penne / Spaghetti)",
    "imageUrl": "/images/foods/cooked-pasta.webp",
    "category": "grains",
    "cuisine": "european",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup cooked (140g)",
    "serving_weight_g": 140,
    "calories": 195,
    "protein": 7.2,
    "carbs": 39,
    "fat": 1.1,
    "fiber": 2.5,
    "saturated_fat": 0.2,
    "sugar": 0.8,
    "sodium_mg": 5,
    "aliases": [
      "penne pasta",
      "spaghetti",
      "boiled pasta",
      "macaroni"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cooked Cup (≈ 140g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 140,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "bowl",
        "label": "1 Large Bowl (≈ 250g)",
        "shortLabel": "bowl",
        "multiplier": 1.7857142857142858,
        "gramsEquivalent": 250,
        "householdName": "bowl",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.007142857142857143,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "euro_veg_lasagna",
    "name": "Vegetable Lasagna",
    "imageUrl": "/images/foods/vegetable-lasagna.webp",
    "category": "fast_food",
    "cuisine": "european",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "piece / serving (250g)",
    "serving_weight_g": 250,
    "calories": 320,
    "protein": 14.5,
    "carbs": 36,
    "fat": 13,
    "fiber": 4.8,
    "saturated_fat": 6.2,
    "sugar": 5.5,
    "sodium_mg": 560,
    "aliases": [
      "veg lasagna",
      "baked vegetable lasagna",
      "spinach lasagna"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Serving / Slice (≈ 250g)",
        "shortLabel": "slice",
        "multiplier": 1,
        "gramsEquivalent": 250,
        "householdName": "slice",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.004,
        "gramsEquivalent": 1,
        "householdName": "slice"
      }
    ]
  },
  {
    "id": "euro_chicken_caesar_salad",
    "name": "Chicken Caesar Salad (with dressing)",
    "imageUrl": "/images/foods/chicken-caesar-salad.webp",
    "category": "soups_salads",
    "cuisine": "european",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (250g)",
    "serving_weight_g": 250,
    "calories": 280,
    "protein": 26.5,
    "carbs": 8.5,
    "fat": 15,
    "fiber": 3.2,
    "saturated_fat": 3.8,
    "sugar": 2.2,
    "sodium_mg": 580,
    "aliases": [
      "caesar salad with chicken",
      "grilled chicken caesar"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl (≈ 250g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 250,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.004,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "euro_margherita_pizza",
    "name": "Margherita Pizza (Thin Crust)",
    "imageUrl": "/images/foods/margherita-pizza.webp",
    "category": "fast_food",
    "cuisine": "european",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "slice (107g)",
    "serving_weight_g": 107,
    "calories": 285,
    "protein": 12,
    "carbs": 32,
    "fat": 12,
    "fiber": 2.2,
    "saturated_fat": 5.5,
    "sugar": 3.5,
    "sodium_mg": 580,
    "aliases": [
      "pizza",
      "cheese pizza",
      "italian pizza",
      "margherita"
    ],
    "serving_units": [
      {
        "unit": "slice",
        "label": "1 Slice (≈ 107g)",
        "shortLabel": "slice",
        "multiplier": 1,
        "gramsEquivalent": 107,
        "householdName": "slice",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.009345794392523364,
        "gramsEquivalent": 1,
        "householdName": "slice"
      }
    ]
  },
  {
    "id": "american_beef_tacos",
    "name": "Beef Tacos (2 Tacos)",
    "imageUrl": "/images/foods/beef-tacos.webp",
    "category": "fast_food",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "taco (80g)",
    "serving_weight_g": 80,
    "calories": 170,
    "protein": 9.2,
    "carbs": 13,
    "fat": 8.8,
    "fiber": 1.8,
    "saturated_fat": 3.5,
    "sugar": 1,
    "sodium_mg": 340,
    "aliases": [
      "taco",
      "ground beef taco",
      "mexican taco",
      "crispy taco"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Taco (≈ 80g)",
        "shortLabel": "taco",
        "multiplier": 1,
        "gramsEquivalent": 80,
        "householdName": "taco",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.0125,
        "gramsEquivalent": 1,
        "householdName": "taco"
      }
    ]
  },
  {
    "id": "american_chicken_burrito",
    "name": "Chicken Burrito (Rice, Beans, Chicken)",
    "imageUrl": "/images/foods/chicken-burrito.webp",
    "category": "fast_food",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "piece / burrito (280g)",
    "serving_weight_g": 280,
    "calories": 520,
    "protein": 32,
    "carbs": 64,
    "fat": 14.5,
    "fiber": 6.5,
    "saturated_fat": 4.8,
    "sugar": 2.8,
    "sodium_mg": 890,
    "aliases": [
      "burrito",
      "chicken wrap burrito",
      "chipotle burrito"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Burrito (≈ 280g)",
        "shortLabel": "burrito",
        "multiplier": 1,
        "gramsEquivalent": 280,
        "householdName": "burrito",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.0035714285714285713,
        "gramsEquivalent": 1,
        "householdName": "burrito"
      }
    ]
  },
  {
    "id": "american_pulled_pork",
    "name": "Pulled Pork (Slow Cooked BBQ)",
    "imageUrl": "/images/foods/pulled-pork.webp",
    "category": "proteins",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "serving (150g)",
    "serving_weight_g": 150,
    "calories": 290,
    "protein": 28.5,
    "carbs": 11,
    "fat": 14,
    "fiber": 0.8,
    "saturated_fat": 4.5,
    "sugar": 9,
    "sodium_mg": 620,
    "aliases": [
      "bbq pulled pork",
      "pork carnitas",
      "barbecue pork"
    ],
    "serving_units": [
      {
        "unit": "serving",
        "label": "1 Serving (≈ 150g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "serving",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "serving"
      }
    ]
  },
  {
    "id": "american_grilled_cheese",
    "name": "Grilled Cheese Sandwich",
    "imageUrl": "/images/foods/grilled-cheese-sandwich.webp",
    "category": "grains",
    "cuisine": "american",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "sandwich (120g)",
    "serving_weight_g": 120,
    "calories": 340,
    "protein": 12.5,
    "carbs": 28,
    "fat": 19.5,
    "fiber": 1.8,
    "saturated_fat": 10.5,
    "sugar": 3.2,
    "sodium_mg": 640,
    "aliases": [
      "cheese toastie",
      "melted cheese sandwich"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Sandwich (≈ 120g)",
        "shortLabel": "sandwich",
        "multiplier": 1,
        "gramsEquivalent": 120,
        "householdName": "sandwich",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.008333333333333333,
        "gramsEquivalent": 1,
        "householdName": "sandwich"
      }
    ]
  },
  {
    "id": "american_pancakes",
    "name": "Pancakes (Homestyle Fluffy)",
    "imageUrl": "/images/foods/pancakes.webp",
    "category": "desserts",
    "cuisine": "american",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "pancake (60g)",
    "serving_weight_g": 60,
    "calories": 130,
    "protein": 3.2,
    "carbs": 22,
    "fat": 3.1,
    "fiber": 0.8,
    "saturated_fat": 1,
    "sugar": 4.5,
    "sodium_mg": 210,
    "aliases": [
      "hotcakes",
      "flapjacks",
      "buttermilk pancake"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Pancake (≈ 60g)",
        "shortLabel": "pancake",
        "multiplier": 1,
        "gramsEquivalent": 60,
        "householdName": "pancake",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "serving",
        "label": "Stack of 2 (≈ 120g)",
        "shortLabel": "2 pancakes",
        "multiplier": 2,
        "gramsEquivalent": 120,
        "householdName": "2 pancakes",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.016666666666666666,
        "gramsEquivalent": 1,
        "householdName": "pancake"
      }
    ]
  },
  {
    "id": "american_classic_cheeseburger",
    "name": "Classic Cheeseburger",
    "imageUrl": "/images/foods/classic-cheeseburger.webp",
    "category": "fast_food",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "burger (180g)",
    "serving_weight_g": 180,
    "calories": 450,
    "protein": 25,
    "carbs": 40,
    "fat": 20,
    "fiber": 2,
    "saturated_fat": 8.5,
    "sugar": 6,
    "sodium_mg": 750,
    "aliases": [
      "burger",
      "cheeseburger",
      "beef burger",
      "hamburger"
    ],
    "serving_units": [
      {
        "unit": "piece",
        "label": "1 Burger (≈ 180g)",
        "shortLabel": "burger",
        "multiplier": 1,
        "gramsEquivalent": 180,
        "householdName": "burger",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005555555555555556,
        "gramsEquivalent": 1,
        "householdName": "burger"
      }
    ]
  },
  {
    "id": "american_mac_and_cheese",
    "name": "Macaroni and Cheese",
    "imageUrl": "/images/foods/macaroni-and-cheese.webp",
    "category": "fast_food",
    "cuisine": "american",
    "dietary": "vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (200g)",
    "serving_weight_g": 200,
    "calories": 370,
    "protein": 13.5,
    "carbs": 42,
    "fat": 16.5,
    "fiber": 2.1,
    "saturated_fat": 9.2,
    "sugar": 3.5,
    "sodium_mg": 680,
    "aliases": [
      "mac and cheese",
      "cheese macaroni",
      "pasta with cheese"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl (≈ 200g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 200,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "cup",
        "label": "1 Cup (≈ 150g)",
        "shortLabel": "cup",
        "multiplier": 0.75,
        "gramsEquivalent": 150,
        "householdName": "cup",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.005,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "american_chili_con_carne",
    "name": "Chili con Carne (Beef & Beans)",
    "imageUrl": "/images/foods/chili-con-carne.webp",
    "category": "indian_meals",
    "cuisine": "american",
    "dietary": "non_vegetarian",
    "serving_size": 1,
    "serving_unit": "bowl (250g)",
    "serving_weight_g": 250,
    "calories": 310,
    "protein": 24.5,
    "carbs": 26,
    "fat": 11.5,
    "fiber": 7.2,
    "saturated_fat": 4.2,
    "sugar": 4.5,
    "sodium_mg": 720,
    "aliases": [
      "chili with beef",
      "beef bean chili",
      "tex mex chili"
    ],
    "serving_units": [
      {
        "unit": "bowl",
        "label": "1 Bowl (≈ 250g)",
        "shortLabel": "bowl",
        "multiplier": 1,
        "gramsEquivalent": 250,
        "householdName": "bowl",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "cup",
        "label": "1 Cup (≈ 200g)",
        "shortLabel": "cup",
        "multiplier": 0.8,
        "gramsEquivalent": 200,
        "householdName": "cup",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.004,
        "gramsEquivalent": 1,
        "householdName": "bowl"
      }
    ]
  },
  {
    "id": "american_sweet_corn_boiled",
    "name": "Boiled Sweet Corn (Kernels)",
    "imageUrl": "/images/foods/boiled-sweet-corn.webp",
    "category": "vegetables",
    "cuisine": "american",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "cup (150g)",
    "serving_weight_g": 150,
    "calories": 135,
    "protein": 4.5,
    "carbs": 29,
    "fat": 1.8,
    "fiber": 3.6,
    "saturated_fat": 0.3,
    "sugar": 6.8,
    "sodium_mg": 25,
    "aliases": [
      "sweet corn",
      "boiled bhutta",
      "corn kernels",
      "steamed corn"
    ],
    "serving_units": [
      {
        "unit": "cup",
        "label": "1 Cup Kernels (≈ 150g)",
        "shortLabel": "cup",
        "multiplier": 1,
        "gramsEquivalent": 150,
        "householdName": "cup",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "cob",
        "label": "1 Ear / Corn on Cob (≈ 100g kernels)",
        "shortLabel": "cob",
        "multiplier": 0.6666666666666666,
        "gramsEquivalent": 100,
        "householdName": "cob",
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.006666666666666667,
        "gramsEquivalent": 1,
        "householdName": "cup"
      }
    ]
  },
  {
    "id": "american_sweet_potato_fries",
    "name": "Sweet Potato Fries (Baked)",
    "imageUrl": "/images/foods/sweet-potato-fries.webp",
    "category": "snacks",
    "cuisine": "american",
    "dietary": "vegan",
    "serving_size": 1,
    "serving_unit": "serving (100g)",
    "serving_weight_g": 100,
    "calories": 160,
    "protein": 2.2,
    "carbs": 28,
    "fat": 4.8,
    "fiber": 3.8,
    "saturated_fat": 0.6,
    "sugar": 7,
    "sodium_mg": 180,
    "aliases": [
      "baked sweet potato fries",
      "sweet potato chips",
      "air fried sweet potato"
    ],
    "serving_units": [
      {
        "unit": "serving",
        "label": "1 Standard Serving (≈ 100g)",
        "shortLabel": "serving",
        "multiplier": 1,
        "gramsEquivalent": 100,
        "householdName": "serving",
        "isDefault": true,
        "isApproximate": true
      },
      {
        "unit": "g",
        "label": "Grams (g)",
        "shortLabel": "g",
        "multiplier": 0.01,
        "gramsEquivalent": 1,
        "householdName": "serving"
      }
    ]
  }
];
