import { destinyCards } from './cards';
import type { DestinyCard } from './types';

export function drawDestinyCard(randomValue = Math.random): DestinyCard {
  const index = Math.floor(randomValue * destinyCards.length);
  return destinyCards[index] ?? destinyCards[0];
}
