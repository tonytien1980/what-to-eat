import type { Category } from '../restaurants/types';
import type { ExpeditionRound } from '../spin/useExpedition';

const categoryLabelMap: Record<Category, string> = {
  lunch: '午餐',
  dinner: '晚餐',
  drinks: '飲料',
  sweets: '甜點',
};

export function getCategorySummary(category: Category) {
  return `目前遠征類型：${categoryLabelMap[category]}`;
}

export function getRoundSummary(round: ExpeditionRound) {
  return `命運卡「${round.destinyCard.name}」已指定今日遠征地。`;
}
