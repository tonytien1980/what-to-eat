import type { DistanceLevel, PriceLevel } from '../restaurants/types';

export type DestinyCardType = 'filter' | 'flavor' | 'reroll';
export type DestinyCardArt =
  | 'wind'
  | 'gold'
  | 'flame'
  | 'mist'
  | 'eye'
  | 'festival'
  | 'dice';

export interface DestinyFilter {
  priceLevel?: PriceLevel[];
  distanceLevel?: DistanceLevel[];
  requiredTags?: string[];
}

export interface DestinyCard {
  id: string;
  name: string;
  type: DestinyCardType;
  subtitle: string;
  description: string;
  art: DestinyCardArt;
  accent: 'ember' | 'gold' | 'jade' | 'violet';
  filter?: DestinyFilter;
  allowReroll: boolean;
}
