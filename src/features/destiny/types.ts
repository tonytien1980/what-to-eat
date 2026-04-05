import type { DistanceLevel, PriceLevel } from '../restaurants/types';

export type DestinyCardType = 'filter' | 'flavor' | 'reroll';

export interface DestinyFilter {
  priceLevel?: PriceLevel[];
  distanceLevel?: DistanceLevel[];
  requiredTags?: string[];
}

export interface DestinyCard {
  id: string;
  name: string;
  type: DestinyCardType;
  description: string;
  filter?: DestinyFilter;
  allowReroll: boolean;
}
