import type { Category } from '../restaurants/types';

const categoryLabelMap: Record<Category, string> = {
  lunch: '午餐',
  dinner: '晚餐',
  drinks: '飲料',
  sweets: '甜點',
};

export function getCategoryLabel(category: Category) {
  return categoryLabelMap[category];
}

export function getCategorySummary(category: Category, count: number) {
  return `${categoryLabelMap[category]}遠征 · 可抽 ${count} 家`;
}

export function getRerollCopy(rerollsRemaining: number) {
  if (rerollsRemaining > 0) {
    return {
      label: '再抽一次',
    };
  }

  return {
    label: '重選次數已用盡',
  };
}

export function getComfortCopy(comfort: string) {
  return `體感${comfort}`;
}
