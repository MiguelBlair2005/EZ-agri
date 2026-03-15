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
	| 'apples'
	| 'pears'
	| 'stone_fruit'
	| 'citrus'
	| 'summer_squash'
	| 'winter_squash';

// Shelf-life values (days) assume ideal storage conditions.
export const foodCategoryOptions: Array<{ value: FoodCategory; label: string; shelfLifeDays: number }> = [
	{ value: 'leafy_greens', label: 'Leafy greens', shelfLifeDays: 5 },
	{ value: 'berries', label: 'Berries', shelfLifeDays: 3 },
	{ value: 'cruciferous', label: 'Cruciferous (broccoli/cauliflower)', shelfLifeDays: 5 },
	{ value: 'cucumbers', label: 'Cucumbers', shelfLifeDays: 7 },
	{ value: 'tomatoes', label: 'Tomatoes', shelfLifeDays: 2 },
	{ value: 'peppers', label: 'Peppers', shelfLifeDays: 7 },
	{ value: 'root_vegetables', label: 'Root vegetables', shelfLifeDays: 14 },
	{ value: 'potatoes', label: 'Potatoes', shelfLifeDays: 60 },
	{ value: 'alliums', label: 'Alliums (onions/garlic)', shelfLifeDays: 28 },
	{ value: 'apples', label: 'Apples', shelfLifeDays: 30 },
	{ value: 'pears', label: 'Pears', shelfLifeDays: 5 },
	{ value: 'stone_fruit', label: 'Stone fruit (peaches/plums)', shelfLifeDays: 5 },
	{ value: 'citrus', label: 'Citrus', shelfLifeDays: 14 },
	{ value: 'summer_squash', label: 'Summer squash', shelfLifeDays: 5 },
	{ value: 'winter_squash', label: 'Winter squash', shelfLifeDays: 90 }
];
