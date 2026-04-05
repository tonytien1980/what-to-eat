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

export function getRerollCopy(rerollsRemaining: number) {
  if (rerollsRemaining > 0) {
    return {
      label: '再抽一次',
      hint:
        rerollsRemaining > 1
          ? `這局還能再改命 ${rerollsRemaining} 次`
          : '這局還能再改命 1 次',
    };
  }

  return {
    label: '重選次數已用盡',
    hint: '本局重選次數已經用完，想換口味就開新的一局。',
  };
}

export function getPhaseLabel(phase: ExpeditionPhase) {
  switch (phase) {
    case 'revealing':
      return '命運卡翻面中';
    case 'spinning':
      return '目的地抽選中';
    case 'result':
      return '今天就吃這家';
    case 'idle':
    default:
      return '先別再糾結了';
  }
}

export function getSlotLabel(phase: ExpeditionPhase) {
  return phase === 'result' ? '本日遠征目的地' : '命運之輪正在低語';
}
