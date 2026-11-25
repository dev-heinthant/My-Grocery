import { DefaultGroceryCategory, Language } from '../types/grocery';

export interface PredefinedGroceryItem {
  key: string;
  group: string;
  en: string;
  my: string;
  category: DefaultGroceryCategory;
  aliases: readonly string[];
}

export const PREDEFINED_GROCERY_CATALOG: readonly PredefinedGroceryItem[] = [
  // Produce
  { key: 'apple', group: 'apple', en: 'Apple', my: 'ပန်းသီး', category: 'Produce', aliases: ['apple', 'ပန်းသီး'] },
  { key: 'apples', group: 'apple', en: 'Apples', my: 'ပန်းသီး', category: 'Produce', aliases: ['apples'] },
  { key: 'banana', group: 'banana', en: 'Banana', my: 'ငှက်ပျောသီး', category: 'Produce', aliases: ['banana', 'ငှက်ပျောသီး'] },
  { key: 'bananas', group: 'banana', en: 'Bananas', my: 'ငှက်ပျောသီး', category: 'Produce', aliases: ['bananas'] },
  { key: 'orange', group: 'orange', en: 'Orange', my: 'လိမ္မော်သီး', category: 'Produce', aliases: ['orange', 'oranges', 'လိမ္မော်သီး'] },
  { key: 'mango', group: 'mango', en: 'Mango', my: 'သရက်သီး', category: 'Produce', aliases: ['mango', 'mangoes', 'သရက်သီး'] },
  { key: 'watermelon', group: 'watermelon', en: 'Watermelon', my: 'ဖရဲသီး', category: 'Produce', aliases: ['watermelon', 'ဖရဲသီး'] },
  { key: 'grapes', group: 'grapes', en: 'Grapes', my: 'စပျစ်သီး', category: 'Produce', aliases: ['grape', 'grapes', 'စပျစ်သီး'] },
  { key: 'lemon', group: 'lemon', en: 'Lemon', my: 'သံပရာသီး', category: 'Produce', aliases: ['lemon', 'lemons', 'lime', 'limes', 'သံပရာသီး', 'သံပုရာသီး'] },
  { key: 'avocado', group: 'avocado', en: 'Avocado', my: 'ထောပတ်သီး', category: 'Produce', aliases: ['avocado', 'avocados', 'ထောပတ်သီး'] },
  { key: 'strawberries', group: 'strawberries', en: 'Strawberries', my: 'စတော်ဘယ်ရီ', category: 'Produce', aliases: ['strawberry', 'strawberries', 'စတော်ဘယ်ရီ'] },
  { key: 'tomato', group: 'tomato', en: 'Tomato', my: 'ခရမ်းချဉ်သီး', category: 'Produce', aliases: ['tomato', 'ခရမ်းချဉ်သီး'] },
  { key: 'tomatoes', group: 'tomato', en: 'Tomatoes', my: 'ခရမ်းချဉ်သီး', category: 'Produce', aliases: ['tomatoes'] },
  { key: 'potato', group: 'potato', en: 'Potato', my: 'အာလူး', category: 'Produce', aliases: ['potato', 'အာလူး'] },
  { key: 'potatoes', group: 'potato', en: 'Potatoes', my: 'အာလူး', category: 'Produce', aliases: ['potatoes'] },
  { key: 'onion', group: 'onion', en: 'Onion', my: 'ကြက်သွန်နီ', category: 'Produce', aliases: ['onion', 'ကြက်သွန်နီ'] },
  { key: 'onions', group: 'onion', en: 'Onions', my: 'ကြက်သွန်နီ', category: 'Produce', aliases: ['onions'] },
  { key: 'garlic', group: 'garlic', en: 'Garlic', my: 'ကြက်သွန်ဖြူ', category: 'Produce', aliases: ['garlic', 'ကြက်သွန်ဖြူ'] },
  { key: 'ginger', group: 'ginger', en: 'Ginger', my: 'ချင်း', category: 'Produce', aliases: ['ginger', 'ချင်း', 'ဂျင်း'] },
  { key: 'carrot', group: 'carrot', en: 'Carrot', my: 'မုန်လာဥနီ', category: 'Produce', aliases: ['carrot', 'carrots', 'မုန်လာဥနီ'] },
  { key: 'cucumber', group: 'cucumber', en: 'Cucumber', my: 'သခွားသီး', category: 'Produce', aliases: ['cucumber', 'cucumbers', 'သခွားသီး'] },
  { key: 'spinach', group: 'spinach', en: 'Spinach', my: 'ဟင်းနုနွယ်', category: 'Produce', aliases: ['spinach', 'ဟင်းနုနွယ်'] },
  { key: 'lettuce', group: 'lettuce', en: 'Lettuce', my: 'ဆလတ်ရွက်', category: 'Produce', aliases: ['lettuce', 'ဆလတ်ရွက်'] },
  { key: 'broccoli', group: 'broccoli', en: 'Broccoli', my: 'ပန်းဂေါ်ဖီစိမ်း', category: 'Produce', aliases: ['broccoli', 'ပန်းဂေါ်ဖီစိမ်း'] },
  { key: 'mushroom', group: 'mushroom', en: 'Mushroom', my: 'မှို', category: 'Produce', aliases: ['mushroom', 'mushrooms', 'မှို'] },
  { key: 'chili', group: 'chili', en: 'Chili', my: 'ငရုတ်သီး', category: 'Produce', aliases: ['chili', 'chilli', 'chilies', 'ငရုတ်သီး'] },

  // Dairy
  { key: 'milk', group: 'milk', en: 'Milk', my: 'နို့', category: 'Dairy', aliases: ['milk', 'နို့', 'နွားနို့'] },
  { key: 'egg', group: 'egg', en: 'Egg', my: 'ကြက်ဥ', category: 'Dairy', aliases: ['egg', 'ကြက်ဥ'] },
  { key: 'eggs', group: 'egg', en: 'Eggs', my: 'ကြက်ဥ', category: 'Dairy', aliases: ['eggs'] },
  { key: 'cheese', group: 'cheese', en: 'Cheese', my: 'ဒိန်ခဲ', category: 'Dairy', aliases: ['cheese', 'ဒိန်ခဲ', 'ချိစ်'] },
  { key: 'butter', group: 'butter', en: 'Butter', my: 'ထောပတ်', category: 'Dairy', aliases: ['butter', 'ထောပတ်'] },
  { key: 'yogurt', group: 'yogurt', en: 'Yogurt', my: 'ဒိန်ချဉ်', category: 'Dairy', aliases: ['yogurt', 'yoghurt', 'ဒိန်ချဉ်'] },
  { key: 'cream', group: 'cream', en: 'Cream', my: 'မလိုင်', category: 'Dairy', aliases: ['cream', 'မလိုင်'] },

  // Bakery
  { key: 'bread', group: 'bread', en: 'Bread', my: 'ပေါင်မုန့်', category: 'Bakery', aliases: ['bread', 'ပေါင်မုန့်'] },
  { key: 'sourdough_bread', group: 'bread', en: 'Sourdough Bread', my: 'ပေါင်မုန့်', category: 'Bakery', aliases: ['sourdough bread'] },
  { key: 'toast', group: 'toast', en: 'Toast', my: 'ပေါင်မုန့်မီးကင်', category: 'Bakery', aliases: ['toast', 'ပေါင်မုန့်မီးကင်'] },
  { key: 'croissant', group: 'croissant', en: 'Croissant', my: 'ခရိုဆန့်', category: 'Bakery', aliases: ['croissant', 'croissants', 'ခရိုဆန့်'] },
  { key: 'cake', group: 'cake', en: 'Cake', my: 'ကိတ်မုန့်', category: 'Bakery', aliases: ['cake', 'ကိတ်မုန့်'] },

  // Meat & Seafood
  { key: 'chicken', group: 'chicken', en: 'Chicken', my: 'ကြက်သား', category: 'Meat & Seafood', aliases: ['chicken', 'ကြက်သား'] },
  { key: 'beef', group: 'beef', en: 'Beef', my: 'အမဲသား', category: 'Meat & Seafood', aliases: ['beef', 'အမဲသား'] },
  { key: 'pork', group: 'pork', en: 'Pork', my: 'ဝက်သား', category: 'Meat & Seafood', aliases: ['pork', 'ဝက်သား'] },
  { key: 'fish', group: 'fish', en: 'Fish', my: 'ငါး', category: 'Meat & Seafood', aliases: ['fish', 'ငါး'] },
  { key: 'shrimp', group: 'shrimp', en: 'Shrimp', my: 'ပုစွန်', category: 'Meat & Seafood', aliases: ['shrimp', 'prawn', 'prawns', 'ပုစွန်'] },
  { key: 'salmon', group: 'salmon', en: 'Salmon', my: 'ဆယ်လ်မွန်ငါး', category: 'Meat & Seafood', aliases: ['salmon', 'ဆယ်လ်မွန်ငါး'] },
  { key: 'bacon', group: 'bacon', en: 'Bacon', my: 'ဝက်သားပြား', category: 'Meat & Seafood', aliases: ['bacon', 'ဝက်သားပြား'] },
  { key: 'sausage', group: 'sausage', en: 'Sausage', my: 'ကြက်အူချောင်း', category: 'Meat & Seafood', aliases: ['sausage', 'sausages', 'ကြက်အူချောင်း', 'ဝက်အူချောင်း'] },

  // Pantry
  { key: 'rice', group: 'rice', en: 'Rice', my: 'ဆန်', category: 'Pantry', aliases: ['rice', 'ဆန်'] },
  { key: 'oil', group: 'oil', en: 'Oil', my: 'ဆီ', category: 'Pantry', aliases: ['oil', 'cooking oil', 'ဆီ', 'စားသုံးဆီ'] },
  { key: 'olive_oil', group: 'olive_oil', en: 'Olive Oil', my: 'သံလွင်ဆီ', category: 'Pantry', aliases: ['olive oil', 'သံလွင်ဆီ'] },
  { key: 'sugar', group: 'sugar', en: 'Sugar', my: 'သကြား', category: 'Pantry', aliases: ['sugar', 'သကြား'] },
  { key: 'salt', group: 'salt', en: 'Salt', my: 'ဆား', category: 'Pantry', aliases: ['salt', 'ဆား'] },
  { key: 'flour', group: 'flour', en: 'Flour', my: 'ဂျုံမှုန့်', category: 'Pantry', aliases: ['flour', 'ဂျုံမှုန့်'] },
  { key: 'noodles', group: 'noodles', en: 'Noodles', my: 'ခေါက်ဆွဲ', category: 'Pantry', aliases: ['noodle', 'noodles', 'ခေါက်ဆွဲ'] },
  { key: 'pasta', group: 'pasta', en: 'Pasta', my: 'ပါစတာ', category: 'Pantry', aliases: ['pasta', 'ပါစတာ'] },
  { key: 'honey', group: 'honey', en: 'Honey', my: 'ပျားရည်', category: 'Pantry', aliases: ['honey', 'ပျားရည်'] },
  { key: 'soy_sauce', group: 'soy_sauce', en: 'Soy Sauce', my: 'ပဲငံပြာရည်', category: 'Pantry', aliases: ['soy sauce', 'ပဲငံပြာရည်'] },
  { key: 'fish_sauce', group: 'fish_sauce', en: 'Fish Sauce', my: 'ငံပြာရည်', category: 'Pantry', aliases: ['fish sauce', 'ငံပြာရည်'] },
  { key: 'vinegar', group: 'vinegar', en: 'Vinegar', my: 'ရှာလကာရည်', category: 'Pantry', aliases: ['vinegar', 'ရှာလကာရည်'] },
  { key: 'beans', group: 'beans', en: 'Beans', my: 'ပဲ', category: 'Pantry', aliases: ['bean', 'beans', 'ပဲ'] },
  { key: 'cereal', group: 'cereal', en: 'Cereal', my: 'စီရီယယ်', category: 'Pantry', aliases: ['cereal', 'စီရီယယ်'] },
  { key: 'oats', group: 'oats', en: 'Oats', my: 'အုတ်ဂျုံ', category: 'Pantry', aliases: ['oat', 'oats', 'oatmeal', 'အုတ်ဂျုံ'] },

  // Beverages
  { key: 'water', group: 'water', en: 'Water', my: 'ရေသန့်', category: 'Beverages', aliases: ['water', 'drinking water', 'ရေသန့်', 'သောက်ရေ'] },
  { key: 'coffee', group: 'coffee', en: 'Coffee', my: 'ကော်ဖီ', category: 'Beverages', aliases: ['coffee', 'ကော်ဖီ'] },
  { key: 'coffee_beans', group: 'coffee', en: 'Coffee Beans', my: 'ကော်ဖီစေ့', category: 'Beverages', aliases: ['coffee beans', 'ကော်ဖီစေ့'] },
  { key: 'tea', group: 'tea', en: 'Tea', my: 'လက်ဖက်ရည်', category: 'Beverages', aliases: ['tea', 'green tea', 'လက်ဖက်ရည်', 'လက်ဖက်ခြောက်'] },
  { key: 'juice', group: 'juice', en: 'Juice', my: 'သစ်သီးဖျော်ရည်', category: 'Beverages', aliases: ['juice', 'သစ်သီးဖျော်ရည်', 'ဖျော်ရည်'] },
  { key: 'soda', group: 'soda', en: 'Soda', my: 'ဆိုဒါ', category: 'Beverages', aliases: ['soda', 'ဆိုဒါ'] },

  // Frozen
  { key: 'ice_cream', group: 'ice_cream', en: 'Ice Cream', my: 'ရေခဲမုန့်', category: 'Frozen', aliases: ['ice cream', 'ရေခဲမုန့်'] },
  { key: 'pizza', group: 'pizza', en: 'Pizza', my: 'ပီဇာ', category: 'Frozen', aliases: ['pizza', 'ပီဇာ'] },
  { key: 'dumplings', group: 'dumplings', en: 'Dumplings', my: 'ဖက်ထုပ်', category: 'Frozen', aliases: ['dumpling', 'dumplings', 'ဖက်ထုပ်'] },

  // Snacks
  { key: 'chocolate', group: 'chocolate', en: 'Chocolate', my: 'ချောကလက်', category: 'Snacks', aliases: ['chocolate', 'ချောကလက်'] },
  { key: 'cookies', group: 'cookies', en: 'Cookies', my: 'ဘီစကစ်မုန့်', category: 'Snacks', aliases: ['cookie', 'cookies', 'biscuit', 'biscuits', 'ဘီစကစ်', 'ဘီစကစ်မုန့်'] },
  { key: 'chips', group: 'chips', en: 'Chips', my: 'အာလူးကြော်', category: 'Snacks', aliases: ['chip', 'chips', 'potato chips', 'အာလူးကြော်'] },
  { key: 'nuts', group: 'nuts', en: 'Nuts', my: 'အစေ့အဆံ', category: 'Snacks', aliases: ['nut', 'nuts', 'peanut', 'peanuts', 'almond', 'almonds', 'မြေပဲ', 'အစေ့အဆံ'] },
  { key: 'candy', group: 'candy', en: 'Candy', my: 'သကြားလုံး', category: 'Snacks', aliases: ['candy', 'sweets', 'သကြားလုံး'] },

  // Household
  { key: 'soap', group: 'soap', en: 'Soap', my: 'ဆပ်ပြာ', category: 'Household', aliases: ['soap', 'ဆပ်ပြာ'] },
  { key: 'shampoo', group: 'shampoo', en: 'Shampoo', my: 'ခေါင်းလျှော်ရည်', category: 'Household', aliases: ['shampoo', 'ခေါင်းလျှော်ရည်'] },
  { key: 'toothpaste', group: 'toothpaste', en: 'Toothpaste', my: 'သွားတိုက်ဆေး', category: 'Household', aliases: ['toothpaste', 'သွားတိုက်ဆေး'] },
  { key: 'detergent', group: 'detergent', en: 'Detergent', my: 'ဆပ်ပြာမှုန့်', category: 'Household', aliases: ['detergent', 'laundry detergent', 'ဆပ်ပြာမှုန့်'] },
  { key: 'toilet_paper', group: 'toilet_paper', en: 'Toilet Paper', my: 'တစ်ရှူးစက္ကူ', category: 'Household', aliases: ['toilet paper', 'tissue', 'paper towel', 'တစ်ရှူး', 'တစ်ရှူးစက္ကူ'] },
  { key: 'dish_soap', group: 'dish_soap', en: 'Dish Soap', my: 'ပန်းကန်ဆေးဆပ်ပြာ', category: 'Household', aliases: ['dish soap', 'dishwashing liquid', 'ပန်းကန်ဆေးဆပ်ပြာ'] },
  { key: 'trash_bags', group: 'trash_bags', en: 'Trash Bags', my: 'အမှိုက်အိတ်', category: 'Household', aliases: ['trash bag', 'trash bags', 'garbage bag', 'အမှိုက်အိတ်'] },
];

export const QUICK_ADD_CATALOG_KEYS: readonly string[] = [
  'apples',
  'bananas',
  'milk',
  'eggs',
  'bread',
  'coffee',
  'oil',
];

const BY_KEY = new Map<string, PredefinedGroceryItem>();
const BY_ALIAS = new Map<string, PredefinedGroceryItem>();

export function normalizeGroceryName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

for (const entry of PREDEFINED_GROCERY_CATALOG) {
  BY_KEY.set(entry.key, entry);
  const enNorm = normalizeGroceryName(entry.en);
  const myNorm = normalizeGroceryName(entry.my);
  if (!BY_ALIAS.has(enNorm)) BY_ALIAS.set(enNorm, entry);
  if (!BY_ALIAS.has(myNorm)) BY_ALIAS.set(myNorm, entry);
  for (const alias of entry.aliases) {
    const normalized = normalizeGroceryName(alias);
    if (!BY_ALIAS.has(normalized)) BY_ALIAS.set(normalized, entry);
  }
}

export function resolveCatalogEntryByName(
  rawName: string
): PredefinedGroceryItem | undefined {
  const normalized = normalizeGroceryName(rawName);
  if (!normalized) return undefined;
  return BY_ALIAS.get(normalized);
}

export function guessCategoryForName(rawName: string): DefaultGroceryCategory {
  const exact = resolveCatalogEntryByName(rawName);
  if (exact) return exact.category;

  const lower = normalizeGroceryName(rawName);
  if (!lower) return 'Other';

  for (const entry of PREDEFINED_GROCERY_CATALOG) {
    if (
      lower.includes(normalizeGroceryName(entry.en)) ||
      lower.includes(normalizeGroceryName(entry.my))
    ) {
      return entry.category;
    }
  }
  return 'Other';
}

export function getQuickAddSuggestions(language: Language): {
  key: string;
  name: string;
  category: DefaultGroceryCategory;
}[] {
  return QUICK_ADD_CATALOG_KEYS.map((key) => {
    const entry = BY_KEY.get(key);
    if (!entry) return null;
    return {
      key: entry.key,
      name: language === 'my' ? entry.my : entry.en,
      category: entry.category,
    };
  }).filter(
    (
      v
    ): v is {
      key: string;
      name: string;
      category: DefaultGroceryCategory;
    } => v !== null
  );
}

export function getLocalizedItemName(
  item: { name: string },
  language: Language
): string {
  const entry = resolveCatalogEntryByName(item.name);
  if (!entry) {
    return item.name;
  }
  return language === 'my' ? entry.my : entry.en;
}

export function getItemCanonicalGroupOrName(item: { name: string }): string {
  const entry = resolveCatalogEntryByName(item.name);
  if (entry) {
    return `catalog:${entry.group}`;
  }
  return `custom:${normalizeGroceryName(item.name)}`;
}

export function matchesItemSearchQuery(
  item: { name: string; note: string; category: string },
  query: string
): boolean {
  const q = normalizeGroceryName(query);
  if (!q) return true;

  if (normalizeGroceryName(item.name).includes(q)) return true;

  const entry = resolveCatalogEntryByName(item.name);
  if (entry) {
    if (normalizeGroceryName(entry.en).includes(q)) return true;
    if (normalizeGroceryName(entry.my).includes(q)) return true;
  }

  if (normalizeGroceryName(item.note).includes(q)) return true;
  if (normalizeGroceryName(item.category).includes(q)) return true;
  return false;
}
