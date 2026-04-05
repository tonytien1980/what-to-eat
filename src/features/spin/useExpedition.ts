import { drawDestinyCard } from '../destiny/draw';
import type { DestinyCard } from '../destiny/types';
import { restaurants } from '../restaurants/data';
import {
  getDestinationPool,
  pickRandomRestaurant,
} from '../restaurants/selectors';
import type { Category, RestaurantRecord } from '../restaurants/types';

export interface ExpeditionRound {
  category: Category;
  destinyCard: DestinyCard;
  destination: RestaurantRecord;
  canReroll: boolean;
}

export function startExpedition(
  category: Category,
  randomSource: () => number = Math.random,
): ExpeditionRound {
  const destinyCard = drawDestinyCard(randomSource());
  const pool = getDestinationPool(restaurants, category, destinyCard);
  const destination = pickRandomRestaurant(pool, randomSource());

  return {
    category,
    destinyCard,
    destination,
    canReroll: destinyCard.allowReroll,
  };
}
