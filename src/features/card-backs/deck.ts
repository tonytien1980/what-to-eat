import commonEarth from '../../../images/backs/card_back_common_earth.webp';
import commonFire from '../../../images/backs/card_back_common_fire.webp';
import commonWater from '../../../images/backs/card_back_common_water.webp';
import commonWind from '../../../images/backs/card_back_common_wind.webp';
import epicChaos from '../../../images/backs/card_back_epic_chaos.webp';
import epicOrder from '../../../images/backs/card_back_epic_order.webp';
import hiddenBack from '../../../images/backs/card_back_hidden.webp';
import legendaryOmega from '../../../images/backs/card_back_legendary_omega.webp';
import rareDark from '../../../images/backs/card_back_rare_dark.webp';
import rareLight from '../../../images/backs/card_back_rare_light.webp';

export type CardBackRarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'hidden';

export interface CardBackRecord {
  id: string;
  rarity: CardBackRarity;
  weight: number;
  imageUrl: string;
}

const TOTAL_WEIGHT_BASIS = 100000;

export const cardBacks: CardBackRecord[] = [
  {
    id: 'card-back-common-earth',
    rarity: 'common',
    weight: 19725,
    imageUrl: commonEarth,
  },
  {
    id: 'card-back-common-water',
    rarity: 'common',
    weight: 19725,
    imageUrl: commonWater,
  },
  {
    id: 'card-back-common-fire',
    rarity: 'common',
    weight: 19725,
    imageUrl: commonFire,
  },
  {
    id: 'card-back-common-wind',
    rarity: 'common',
    weight: 19725,
    imageUrl: commonWind,
  },
  {
    id: 'card-back-rare-light',
    rarity: 'rare',
    weight: 8000,
    imageUrl: rareLight,
  },
  {
    id: 'card-back-rare-dark',
    rarity: 'rare',
    weight: 8000,
    imageUrl: rareDark,
  },
  {
    id: 'card-back-epic-order',
    rarity: 'epic',
    weight: 2000,
    imageUrl: epicOrder,
  },
  {
    id: 'card-back-epic-chaos',
    rarity: 'epic',
    weight: 2000,
    imageUrl: epicChaos,
  },
  {
    id: 'card-back-legendary-omega',
    rarity: 'legendary',
    weight: 1000,
    imageUrl: legendaryOmega,
  },
  {
    id: 'card-back-hidden',
    rarity: 'hidden',
    weight: 100,
    imageUrl: hiddenBack,
  },
];

export const totalCardBackWeight =
  cardBacks.reduce((sum, cardBack) => sum + cardBack.weight, 0) /
  TOTAL_WEIGHT_BASIS;

export function pickWeightedCardBack(randomValue = Math.random()) {
  const normalizedRandom = Math.min(Math.max(randomValue, 0), 0.999999);
  const ticket = Math.floor(normalizedRandom * TOTAL_WEIGHT_BASIS);

  let cumulativeWeight = 0;

  for (const cardBack of cardBacks) {
    cumulativeWeight += cardBack.weight;

    if (ticket < cumulativeWeight) {
      return cardBack;
    }
  }

  return cardBacks[cardBacks.length - 1];
}
