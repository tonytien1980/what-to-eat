import commonEarth from '../../../images/backs/card_back_common_earth.webp';
import commonFire from '../../../images/backs/card_back_common_fire.webp';
import commonWater from '../../../images/backs/card_back_common_water.webp';
import commonWind from '../../../images/backs/card_back_common_wind.webp';
import commonFace from '../../../images/faces/card_face_template_common.webp';
import epicChaos from '../../../images/backs/card_back_epic_chaos.webp';
import epicOrder from '../../../images/backs/card_back_epic_order.webp';
import epicFace from '../../../images/faces/card_face_template_epic.webp';
import hiddenFace from '../../../images/faces/card_face_template_hidden.webp';
import hiddenBack from '../../../images/backs/card_back_hidden.webp';
import legendaryFace from '../../../images/faces/card_face_template_legendary.webp';
import legendaryOmega from '../../../images/backs/card_back_legendary_omega.webp';
import rareFace from '../../../images/faces/card_face_template_rare.webp';
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
  faceImageUrl: string;
}

const TOTAL_WEIGHT_BASIS = 100000;

export const cardBacks: CardBackRecord[] = [
  {
    id: 'card-back-common-earth',
    rarity: 'common',
    weight: 17250,
    imageUrl: commonEarth,
    faceImageUrl: commonFace,
  },
  {
    id: 'card-back-common-water',
    rarity: 'common',
    weight: 17250,
    imageUrl: commonWater,
    faceImageUrl: commonFace,
  },
  {
    id: 'card-back-common-fire',
    rarity: 'common',
    weight: 17250,
    imageUrl: commonFire,
    faceImageUrl: commonFace,
  },
  {
    id: 'card-back-common-wind',
    rarity: 'common',
    weight: 17250,
    imageUrl: commonWind,
    faceImageUrl: commonFace,
  },
  {
    id: 'card-back-rare-light',
    rarity: 'rare',
    weight: 10000,
    imageUrl: rareLight,
    faceImageUrl: rareFace,
  },
  {
    id: 'card-back-rare-dark',
    rarity: 'rare',
    weight: 10000,
    imageUrl: rareDark,
    faceImageUrl: rareFace,
  },
  {
    id: 'card-back-epic-order',
    rarity: 'epic',
    weight: 4000,
    imageUrl: epicOrder,
    faceImageUrl: epicFace,
  },
  {
    id: 'card-back-epic-chaos',
    rarity: 'epic',
    weight: 4000,
    imageUrl: epicChaos,
    faceImageUrl: epicFace,
  },
  {
    id: 'card-back-legendary-omega',
    rarity: 'legendary',
    weight: 2000,
    imageUrl: legendaryOmega,
    faceImageUrl: legendaryFace,
  },
  {
    id: 'card-back-hidden',
    rarity: 'hidden',
    weight: 1000,
    imageUrl: hiddenBack,
    faceImageUrl: hiddenFace,
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
