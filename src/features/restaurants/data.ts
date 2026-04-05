import restaurantData from '../../../data/restaurants.json';
import restaurantSheetSourceData from '../../../data/restaurant-sheet-sources.json';
import type { Category, RestaurantRecord, RestaurantSheetSource } from './types';

export const restaurants = restaurantData as RestaurantRecord[];
export const restaurantSheetSources =
  restaurantSheetSourceData as RestaurantSheetSource[];

export const categories: { id: Category; label: string }[] = [
  { id: 'lunch', label: '午餐' },
  { id: 'dinner', label: '晚餐' },
  { id: 'drinks', label: '飲料' },
  { id: 'sweets', label: '甜點' },
];
