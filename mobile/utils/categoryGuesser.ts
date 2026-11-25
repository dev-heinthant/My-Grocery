import { resolveCatalogEntryByName } from '@/constants/groceryCatalog';
import { DefaultGroceryCategory } from '@/types/grocery';

export function guessCategory(name: string): DefaultGroceryCategory {
  const catalogEntry = resolveCatalogEntryByName(name);
  if (catalogEntry) {
    return catalogEntry.category;
  }

  const lower = name.toLowerCase();

  const rules: { category: DefaultGroceryCategory; keywords: string[] }[] = [
    {
      category: 'Produce',
      keywords: [
        'apple', 'banana', 'avocado', 'tomato', 'onion', 'potato', 'garlic',
        'spinach', 'kale', 'lettuce', 'orange', 'lemon', 'lime', 'berry',
        'strawberr', 'blueberr', 'carrot', 'cucumber', 'pepper', 'mushroom',
        'broccoli', 'herb', 'salad', 'grape', 'watermelon', 'fruit', 'vegetable',
        'peach', 'pear', 'mango', 'ginger', 'cilantro', 'basil', 'zucchini',
      ],
    },
    {
      category: 'Dairy',
      keywords: [
        'milk', 'cheese', 'yogurt', 'butter', 'egg', 'cream', 'cheddar',
        'mozzarella', 'parmesan', 'curd', 'ghee', 'sour cream',
      ],
    },
    {
      category: 'Bakery',
      keywords: [
        'bread', 'bagel', 'croissant', 'sourdough', 'tortilla', 'bun',
        'pita', 'roll', 'muffin', 'toast', 'baguette', 'brioche', 'pastry',
      ],
    },
    {
      category: 'Meat & Seafood',
      keywords: [
        'chicken', 'beef', 'pork', 'salmon', 'tuna', 'shrimp', 'turkey',
        'steak', 'bacon', 'sausage', 'fish', 'meat', 'lamb', 'cod', 'ham',
      ],
    },
    {
      category: 'Frozen',
      keywords: [
        'ice cream', 'frozen', 'pizza', 'gelato', 'popsicle', 'waffle',
        'dumpling', 'edamame', 'fries',
      ],
    },
    {
      category: 'Beverages',
      keywords: [
        'coffee', 'tea', 'juice', 'soda', 'water', 'seltzer', 'beer',
        'wine', 'kombucha', 'latte', 'espresso', 'sparkling',
      ],
    },
    {
      category: 'Snacks',
      keywords: [
        'chip', 'cracker', 'cookie', 'nut', 'almond', 'peanut', 'cashew',
        'popcorn', 'pretzel', 'chocolate', 'candy', 'granola', 'snack',
      ],
    },
    {
      category: 'Pantry',
      keywords: [
        'pasta', 'rice', 'oil', 'olive oil', 'vinegar', 'sauce', 'soup',
        'bean', 'lentil', 'flour', 'sugar', 'salt', 'spice', 'oat',
        'cereal', 'honey', 'syrup', 'ketchup', 'mustard', 'mayo', 'mayonnaise',
      ],
    },
    {
      category: 'Household',
      keywords: [
        'soap', 'paper towel', 'toilet paper', 'detergent', 'sponge',
        'foil', 'trash bag', 'shampoo', 'toothpaste', 'cleaner', 'bleach',
        'tissue', 'wrap', 'battery',
      ],
    },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category;
    }
  }

  return 'Other';
}
