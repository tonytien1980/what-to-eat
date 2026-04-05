import {
  cardBacks,
  pickWeightedCardBack,
  totalCardBackWeight,
} from '../features/card-backs/deck';

test('card back weights add up to exactly one full draw table', () => {
  expect(totalCardBackWeight).toBe(1);
  expect(cardBacks).toHaveLength(10);
});

test('maps weighted random boundaries to the expected card backs', () => {
  expect(pickWeightedCardBack(0).id).toBe('card-back-common-earth');
  expect(pickWeightedCardBack(0.19725).id).toBe('card-back-common-water');
  expect(pickWeightedCardBack(0.3945).id).toBe('card-back-common-fire');
  expect(pickWeightedCardBack(0.789).id).toBe('card-back-rare-light');
  expect(pickWeightedCardBack(0.949).id).toBe('card-back-epic-order');
  expect(pickWeightedCardBack(0.989).id).toBe('card-back-legendary-omega');
  expect(pickWeightedCardBack(0.999).id).toBe('card-back-hidden');
});

test('uses a rarity-matched face template for every card back', () => {
  const faceByRarity = new Map<string, string>();

  for (const cardBack of cardBacks) {
    const existingFace = faceByRarity.get(cardBack.rarity);

    if (existingFace) {
      expect(cardBack.faceImageUrl).toBe(existingFace);
      continue;
    }

    faceByRarity.set(cardBack.rarity, cardBack.faceImageUrl);
  }

  expect(faceByRarity.size).toBe(5);
});
