import { useEffect, useRef, useState } from 'react';
import { pickWeightedCardBack } from '../card-backs/deck';
import type { CardBackRecord } from '../card-backs/deck';
import { drawDestinyCard } from '../destiny/draw';
import type { DestinyCard } from '../destiny/types';
import type { LocationPreference } from '../location/types';
import {
  getDestinationPool,
  pickRandomRestaurant,
} from '../restaurants/selectors';
import type { Category, RestaurantRecord } from '../restaurants/types';

export interface ExpeditionRound {
  category: Category;
  cardBack: CardBackRecord;
  destinyCard: DestinyCard;
  pool: RestaurantRecord[];
  destination: RestaurantRecord;
  canReroll: boolean;
}

export type ExpeditionPhase = 'idle' | 'revealing' | 'spinning' | 'result';

export function startExpedition(
  category: Category,
  restaurants: RestaurantRecord[],
  cardBack: CardBackRecord,
  location: Pick<LocationPreference, 'city' | 'district'> | null = null,
  randomSource: () => number = Math.random,
): ExpeditionRound {
  const destinyCard = drawDestinyCard(randomSource());
  const pool = getDestinationPool(restaurants, category, destinyCard, location);

  if (pool.length === 0) {
    throw new Error(`No restaurants available for ${category}`);
  }

  const destination = pickRandomRestaurant(pool, randomSource());

  return {
    category,
    cardBack,
    destinyCard,
    pool,
    destination,
    canReroll: destinyCard.allowReroll,
  };
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useExpedition(
  category: Category | null,
  restaurants: RestaurantRecord[],
  location: Pick<LocationPreference, 'city' | 'district'> | null = null,
) {
  const [phase, setPhase] = useState<ExpeditionPhase>('idle');
  const [currentCardBack, setCurrentCardBack] = useState<CardBackRecord>(() =>
    pickWeightedCardBack(Math.random()),
  );
  const [round, setRound] = useState<ExpeditionRound | null>(null);
  const [rerollsRemaining, setRerollsRemaining] = useState(0);
  const [bonusRerollGranted, setBonusRerollGranted] = useState(false);
  const timersRef = useRef<number[]>([]);

  function clearTimers() {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    }

    timersRef.current = [];
  }

  function runRound(nextRound: ExpeditionRound) {
    clearTimers();
    setRound(nextRound);

    if (prefersReducedMotion()) {
      setPhase('result');
      return;
    }

    setPhase('revealing');

    const revealTimer = window.setTimeout(() => {
      setPhase('spinning');

      const resultTimer = window.setTimeout(() => {
        setPhase('result');
      }, 920);

      timersRef.current.push(resultTimer);
    }, 1600);

    timersRef.current.push(revealTimer);
  }

  function start() {
    if (!category || restaurants.length === 0) {
      return;
    }

    const firstRound = startExpedition(
      category,
      restaurants,
      currentCardBack,
      location,
    );
    const initialRerolls = firstRound.canReroll ? 2 : 1;

    setBonusRerollGranted(firstRound.canReroll);
    setRerollsRemaining(initialRerolls);
    runRound(firstRound);
  }

  function reroll() {
    if (!round || !category || rerollsRemaining <= 0 || restaurants.length === 0) {
      return;
    }

    const nextCardBack = pickWeightedCardBack(Math.random());
    setCurrentCardBack(nextCardBack);

    const nextRound = startExpedition(
      category,
      restaurants,
      nextCardBack,
      location,
    );
    const shouldGrantBonus = nextRound.canReroll && !bonusRerollGranted;
    const nextRemaining = Math.max(rerollsRemaining - 1, 0) + (shouldGrantBonus ? 1 : 0);

    if (shouldGrantBonus) {
      setBonusRerollGranted(true);
    }

    setRerollsRemaining(nextRemaining);
    runRound(nextRound);
  }

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    clearTimers();
    setPhase('idle');
    setRound(null);
    setRerollsRemaining(0);
    setBonusRerollGranted(false);
  }, [category, location?.city, location?.district]);

  return {
    phase,
    round,
    currentCardBack,
    rerollsRemaining,
    start,
    reroll,
    isAnimating: phase === 'revealing' || phase === 'spinning',
    showReroll: Boolean(round),
    canReroll: rerollsRemaining > 0,
  };
}
