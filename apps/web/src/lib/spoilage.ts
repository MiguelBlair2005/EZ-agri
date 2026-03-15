export type FoodCategory =
	| 'leafy_greens'
	| 'berries'
	| 'cruciferous'
	| 'cucumbers'
	| 'tomatoes'
	| 'peppers'
	| 'root_vegetables'
	| 'potatoes'
	| 'alliums'
	| 'apples_pears'
	| 'stone_fruit'
	| 'citrus'
	| 'summer_squash'
	| 'winter_squash';

// Shelf-life values (days) assume ideal storage conditions.
export const foodCategoryOptions: Array<{ value: FoodCategory; label: string; shelfLifeDays: number }> = [
	{ value: 'leafy_greens', label: 'Leafy greens', shelfLifeDays: 14 },
	{ value: 'berries', label: 'Berries', shelfLifeDays: 5 },
	{ value: 'cruciferous', label: 'Cruciferous (broccoli/cauliflower)', shelfLifeDays: 14 },
	{ value: 'cucumbers', label: 'Cucumbers', shelfLifeDays: 12 },
	{ value: 'tomatoes', label: 'Tomatoes', shelfLifeDays: 6 },
	{ value: 'peppers', label: 'Peppers', shelfLifeDays: 14 },
	{ value: 'root_vegetables', label: 'Root vegetables', shelfLifeDays: 120 },
	{ value: 'potatoes', label: 'Potatoes', shelfLifeDays: 120 },
	{ value: 'alliums', label: 'Alliums (onions/garlic)', shelfLifeDays: 60 },
	{ value: 'apples_pears', label: 'Apples & pears', shelfLifeDays: 90 },
	{ value: 'stone_fruit', label: 'Stone fruit (peaches/plums)', shelfLifeDays: 21 },
	{ value: 'citrus', label: 'Citrus', shelfLifeDays: 21 },
	{ value: 'summer_squash', label: 'Summer squash', shelfLifeDays: 10 },
	{ value: 'winter_squash', label: 'Winter squash', shelfLifeDays: 90 }
];
