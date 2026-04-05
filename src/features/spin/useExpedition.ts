import { useEffect, useRef, useState } from 'react';
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
  pool: RestaurantRecord[];
  destination: RestaurantRecord;
  canReroll: boolean;
}

export type ExpeditionPhase = 'idle' | 'revealing' | 'spinning' | 'result';

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

export function useExpedition(category: Category) {
  const [phase, setPhase] = useState<ExpeditionPhase>('idle');
  const [round, setRound] = useState<ExpeditionRound | null>(null);
  const [displayedName, setDisplayedName] = useState('');
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
    setDisplayedName('命運尚未揭曉');

    if (prefersReducedMotion()) {
      setPhase('result');
      setDisplayedName(nextRound.destination.name);
      return;
    }

    setPhase('revealing');

    const revealTimer = window.setTimeout(() => {
      setPhase('spinning');

      let index = 0;
      const spinInterval = window.setInterval(() => {
        const candidate =
          nextRound.pool[index % nextRound.pool.length] ?? nextRound.destination;
        setDisplayedName(candidate.name);
        index += 1;
      }, 90);

      const resultTimer = window.setTimeout(() => {
        window.clearInterval(spinInterval);
        setDisplayedName(nextRound.destination.name);
        setPhase('result');
      }, 900);

      timersRef.current.push(spinInterval);
      timersRef.current.push(resultTimer);
    }, 480);

    timersRef.current.push(revealTimer);
  }

  function start() {
    const firstRound = startExpedition(category);
    const initialRerolls = firstRound.canReroll ? 2 : 1;

    setBonusRerollGranted(firstRound.canReroll);
    setRerollsRemaining(initialRerolls);
    runRound(firstRound);
  }

  function reroll() {
    if (!round || rerollsRemaining <= 0) {
      return;
    }

    const nextRound = startExpedition(category);
    const shouldGrantBonus = nextRound.canReroll && !bonusRerollGranted;
    const nextRemaining = Math.max(rerollsRemaining - 1, 0) + (shouldGrantBonus ? 1 : 0);

    if (shouldGrantBonus) {
      setBonusRerollGranted(true);
    }

    setRerollsRemaining(nextRemaining);
    runRound(nextRound);
  }

  useEffect(() => () => clearTimers(), []);

  return {
    phase,
    round,
    displayedName,
    rerollsRemaining,
    start,
    reroll,
    isAnimating: phase === 'revealing' || phase === 'spinning',
    showReroll: Boolean(round),
    canReroll: rerollsRemaining > 0,
  };
}
