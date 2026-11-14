const fs = require('fs');
const path = require('path');
const { FOOD_CATALOG } = require('../src/data/foodCatalog.ts');
const { FOOD_IMAGE_MAP, DEFAULT_FOOD_PLACEHOLDER, getFoodImageUrl, getFoodImageAlt } = require('../src/data/foodImageMap.ts');

console.log('======================================================');
console.log('TEST SUITE: Complete Food Library Image Integration');
console.log('======================================================\n');

let failed = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// Test 1: Verify catalog count
assert(FOOD_CATALOG.length === 126, `Catalog has exactly 126 foods (found ${FOOD_CATALOG.length})`);

// Test 2: Check placeholder exists
const placeholderPath = path.resolve(__dirname, '../public', DEFAULT_FOOD_PLACEHOLDER.replace(/^\//, ''));
assert(fs.existsSync(placeholderPath), `Neutral placeholder exists at ${DEFAULT_FOOD_PLACEHOLDER}`);
const placeholderContent = fs.readFileSync(placeholderPath, 'utf8');
assert(placeholderContent.includes('<svg') && placeholderContent.includes('NutriTrack'), 'Placeholder is valid NutriTrack SVG');

// Test 3: Check that every single food in FOOD_CATALOG has a valid imageUrl that exists on disk
let allImagesExist = true;
let totalBytes = 0;
for (const food of FOOD_CATALOG) {
  const url = getFoodImageUrl({ id: food.id, imageUrl: food.imageUrl, name: food.name });
  const localFile = path.resolve(__dirname, '../public', url.replace(/^\//, ''));
  if (!fs.existsSync(localFile)) {
    console.error(`Missing file for food: [${food.id}] ${food.name} -> ${url}`);
    allImagesExist = false;
  } else {
    const size = fs.statSync(localFile).size;
    totalBytes += size;
    if (size < 500) {
      console.error(`Suspiciously small file for [${food.id}] ${food.name}: ${size} bytes`);
      allImagesExist = false;
    }
  }
}
assert(allImagesExist, `All 126 food items have dedicated valid image files on disk (total asset size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB)`);

// Test 4: Verify specific user-requested food items
const testCases = [
  { id: 'dessert_gulab_jamun', name: 'Gulab Jamun', expectedFile: 'gulab-jamun.webp' },
  { id: 'dessert_rasgulla', name: 'Rasgulla', expectedFile: 'rasgulla.webp' },
  { id: 'grain_idli', name: 'Idli', expectedFile: 'idli.webp' },
  { id: 'indian_masala_dosa', name: 'Masala Dosa', expectedFile: 'masala-dosa.webp' },
  { id: 'grain_plain_dosa', name: 'Plain Dosa', expectedFile: 'plain-dosa.webp' },
  { id: 'indian_sambar', name: 'Sambar', expectedFile: 'sambar.webp' },
  { id: 'grain_roti', name: 'Roti / Chapati', expectedFile: 'roti-chapati.webp' },
  { id: 'indian_paneer_tikka', name: 'Paneer Tikka', expectedFile: 'paneer-tikka.webp' },
  { id: 'indian_butter_chicken', name: 'Butter Chicken', expectedFile: 'butter-chicken.webp' },
  { id: 'indian_chicken_biryani', name: 'Chicken Biryani', expectedFile: 'chicken-biryani.webp' },
  { id: 'indian_mutton_biryani', name: 'Mutton Biryani', expectedFile: 'mutton-biryani.webp' },
  { id: 'indian_rajma', name: 'Rajma Masala', expectedFile: 'rajma-masala.webp' },
  { id: 'indian_chole', name: 'Chole', expectedFile: 'chole-masala.webp' },
  { id: 'indian_dal_makhani', name: 'Dal Makhani', expectedFile: 'dal-makhani.webp' },
  { id: 'protein_beef_steak_grilled', name: 'Beef Steak', expectedFile: 'beef-steak.webp' },
  { id: 'protein_beef_burger_patty', name: 'Beef Burger Patty', expectedFile: 'beef-burger-patty.webp' },
  { id: 'protein_salmon_cooked', name: 'Grilled Salmon', expectedFile: 'cooked-salmon.webp' },
  { id: 'protein_cooked_shrimp', name: 'Cooked Shrimp', expectedFile: 'cooked-shrimp.webp' },
  { id: 'asian_salmon_sushi', name: 'Salmon Sushi', expectedFile: 'salmon-sushi.webp' },
  { id: 'asian_ramen_noodles', name: 'Ramen', expectedFile: 'ramen-noodles.webp' },
  { id: 'asian_kimchi', name: 'Kimchi', expectedFile: 'kimchi.webp' },
  { id: 'euro_falafel', name: 'Falafel', expectedFile: 'falafel.webp' },
  { id: 'euro_hummus', name: 'Hummus', expectedFile: 'hummus.webp' },
  { id: 'staple_greek_yogurt', name: 'Greek Yogurt', expectedFile: 'greek-yogurt.webp' },
  { id: 'euro_margherita_pizza', name: 'Pizza', expectedFile: 'margherita-pizza.webp' },
  { id: 'american_pancakes', name: 'Pancakes', expectedFile: 'pancakes.webp' },
  { id: 'american_beef_tacos', name: 'Tacos', expectedFile: 'beef-tacos.webp' },
];

for (const tc of testCases) {
  const url = getFoodImageUrl({ id: tc.id });
  assert(url === `/images/foods/${tc.expectedFile}`, `${tc.name} displays exact verified image: ${tc.expectedFile}`);
}

// Test 5: Verify custom food without image gets neutral placeholder
const customWithoutImg = getFoodImageUrl({ id: 'custom_123', isCustom: true, name: 'My Custom Shake' });
assert(customWithoutImg === DEFAULT_FOOD_PLACEHOLDER, 'Custom food without image returns clean neutral placeholder');

// Test 6: Verify custom food with uploaded image preserves user photo
const customWithImg = getFoodImageUrl({ id: 'custom_456', isCustom: true, imageUrl: 'data:image/jpeg;base64,abc123xyz' });
assert(customWithImg === 'data:image/jpeg;base64,abc123xyz', 'Custom food with uploaded photo preserves user image');

// Test 7: Verify accessible alt text
const gulabJamunAlt = getFoodImageAlt({ id: 'dessert_gulab_jamun', name: 'Gulab Jamun' });
assert(gulabJamunAlt.toLowerCase().includes('gulab jamun'), `Descriptive alt text for Gulab Jamun: "${gulabJamunAlt}"`);

console.log('\n======================================================');
if (failed === 0) {
  console.log('ALL FOOD IMAGE INTEGRATION TESTS PASSED (100%)!');
} else {
  console.error(`${failed} TESTS FAILED!`);
  process.exit(1);
}
console.log('======================================================');

