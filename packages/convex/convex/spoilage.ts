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
	'apples',
	'pears',
	'stone_fruit',
	'citrus',
	'summer_squash',
	'winter_squash'
] as const;

export type FoodCategory = (typeof foodCategories)[number];

export const shelfLifeDaysByCategory: Record<FoodCategory, number> = {
	leafy_greens: 5,
	berries: 3,
	cruciferous: 5,
	cucumbers: 7,
	tomatoes: 2,
	peppers: 7,
	root_vegetables: 14,
	potatoes: 60,
	alliums: 28,
	apples: 30,
	pears: 5,
	stone_fruit: 5,
	citrus: 14,
	summer_squash: 5,
	winter_squash: 90
};

export function getShelfLifeDays(category: FoodCategory) {
	return shelfLifeDaysByCategory[category] ?? 7;
}
