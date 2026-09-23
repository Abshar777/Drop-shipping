// Icon names available for categories, plus a keyword guesser so every category
// gets a sensible icon even before the admin picks one. Pure module: safe on server and client.

export const CATEGORY_ICONS = [
  "sparkles",
  "tshirt",
  "dress",
  "hanger",
  "shoe",
  "jewellery",
  "watch",
  "mobile",
  "laptop",
  "tv",
  "beauty",
  "home",
  "kitchen",
  "furniture",
  "toys",
  "baby",
  "grocery",
  "health",
  "fitness",
  "sports",
  "helmet",
  "scooter",
  "book",
  "pen",
  "paw",
  "music",
  "bag",
  "tag",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICONS)[number];

export function isCategoryIcon(value: unknown): value is CategoryIconName {
  return typeof value === "string" && (CATEGORY_ICONS as readonly string[]).includes(value);
}

// First matching rule wins, so more specific words come before general ones
// (e.g. "women" before "men", "toy" before "kid", "beauty" before "health").
const RULES: Array<[RegExp, CategoryIconName]> = [
  [/\b(for you|recommended|picks)\b/, "sparkles"],
  [/wheeler|scooter|scooty/, "scooter"],
  [/\b(auto|car|bike|motor|vehicle|helmet)/, "helmet"],
  [/mobile|phone|tablet/, "mobile"],
  [/laptop|computer|electronic|gadget|camera|gaming/, "laptop"],
  [/appliance|television|\btv\b|audio|speaker/, "tv"],
  [/beauty|makeup|cosmetic|fragrance|perfume|skincare|hair/, "beauty"],
  [/kitchen|cook|dining|utensil/, "home"],
  [/furniture|sofa|bed\b|decor/, "furniture"],
  [/\bhome\b|household|lamp|light/, "home"],
  [/toy|game|puzzle/, "toys"],
  [/baby|\bmom\b|maternity|infant|newborn/, "baby"],
  [/\bkid|child|boys|girls/, "toys"],
  [/grocery|food|snack|drink|beverage|spice|supermarket/, "grocery"],
  [/health|nutrition|medical|pharma|vitamin|wellness|care\b/, "health"],
  [/fitness|gym|exercise|yoga/, "fitness"],
  [/sport|cricket|football|outdoor|cycling/, "sports"],
  [/book|novel|academic/, "book"],
  [/watch/, "watch"],
  [/jewel|gold|earring|necklace|bangle/, "jewellery"],
  [/bag|luggage|backpack|wallet/, "bag"],
  [/footwear|shoe|sandal|slipper|sneaker/, "shoe"],
  [/lingerie|innerwear|nightwear|sleepwear|bra\b/, "hanger"],
  [/saree|kurti|lehenga|dress|gown|ethnic|women|western|blouse/, "dress"],
  [/fashion|\bmen\b|cloth|wear|shirt|jeans|apparel/, "tshirt"],
  [/stationery|office|\bpen|paper|notebook|craft/, "pen"],
  [/\bpet|dog|cat\b|aquarium/, "paw"],
  [/music|instrument|guitar|piano/, "music"],
  [/accessor/, "jewellery"],
];

/** Best-guess icon from a category name. Falls back to a generic tag. */
export function guessCategoryIcon(name: string): CategoryIconName {
  const text = name.toLowerCase();
  for (const [pattern, icon] of RULES) if (pattern.test(text)) return icon;
  return "tag";
}

/** The icon to show: the admin's explicit choice if valid, otherwise the guess. */
export function resolveCategoryIcon(category: { name: string; icon?: string }): CategoryIconName {
  return isCategoryIcon(category.icon) ? category.icon : guessCategoryIcon(category.name);
}
