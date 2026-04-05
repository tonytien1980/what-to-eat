import type { Category } from '../restaurants/types';
import type { ExpeditionPhase, ExpeditionRound } from '../spin/useExpedition';

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

export function getPhaseLabel(phase: ExpeditionPhase) {
  switch (phase) {
    case 'revealing':
      return '命運卡揭示中';
    case 'spinning':
      return '命運之輪轉動中';
    case 'result':
      return '遠征結果已確定';
    case 'idle':
    default:
      return '命運之輪已待命';
  }
}

export function getSlotLabel(phase: ExpeditionPhase) {
  return phase === 'result' ? '本日遠征目的地' : '命運之輪正在低語';
}
