// Shelf-life values (days) assume ideal storage conditions to maximize freshness.
export const foodCategories = [
	'leafy_greens',
	'berries',
	'cruciferous',
	'cucumbers',
	'tomatoes',
	'peppers',
	'root_vegetables',
	'potatoes',
	'alliums',
	'apples_pears',
	'stone_fruit',
	'citrus',
	'summer_squash',
	'winter_squash'
] as const;

export type FoodCategory = (typeof foodCategories)[number];

export const shelfLifeDaysByCategory: Record<FoodCategory, number> = {
	leafy_greens: 14,
	berries: 5,
	cruciferous: 14,
	cucumbers: 12,
	tomatoes: 6,
	peppers: 14,
	root_vegetables: 120,
	potatoes: 120,
	alliums: 60,
	apples_pears: 90,
	stone_fruit: 21,
	citrus: 21,
	summer_squash: 10,
	winter_squash: 90
};

export function getShelfLifeDays(category: FoodCategory) {
	return shelfLifeDaysByCategory[category] ?? 7;
}
