import restaurantData from '../../../data/restaurants.json';
import type { Category, RestaurantRecord } from './types';

export const restaurants = restaurantData as RestaurantRecord[];

export const categories: { id: Category; label: string }[] = [
  { id: 'lunch', label: '午餐' },
  { id: 'dinner', label: '晚餐' },
  { id: 'drinks', label: '飲料' },
  { id: 'sweets', label: '甜點' },
];
