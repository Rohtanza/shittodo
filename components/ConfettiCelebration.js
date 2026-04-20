'use client';

import { useEffect, useRef } from 'react';

let confettiPromise = null;

function loadConfetti() {
  if (!confettiPromise) {
    confettiPromise = import('canvas-confetti').then((mod) => mod.default);
  }
  return confettiPromise;
}

export default function ConfettiCelebration({ activeCount, total }) {
  const prevActive = useRef(null);

  useEffect(() => {
    if (prevActive.current === null) {
      prevActive.current = activeCount;
      return;
    }

    const wasActive = prevActive.current;
    prevActive.current = activeCount;

    if (total > 0 && activeCount === 0 && wasActive > 0) {
      loadConfetti().then((confetti) => {
        const palette = ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];
        confetti({ particleCount: 80, spread: 70, origin: { x: 0.2, y: 0.6 }, colors: palette });
        confetti({ particleCount: 80, spread: 70, origin: { x: 0.8, y: 0.6 }, colors: palette });
      });
    }
  }, [activeCount, total]);

  return null;
}
