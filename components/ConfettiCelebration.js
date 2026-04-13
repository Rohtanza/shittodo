'use client';

import { useEffect, useRef } from 'react';

export default function ConfettiCelebration({ trigger }) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (trigger && !hasFired.current) {
      hasFired.current = true;
      import('canvas-confetti').then((mod) => {
        const confetti = mod.default;
        // Fire from both sides
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x: 0.2, y: 0.6 },
          colors: ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'],
        });
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x: 0.8, y: 0.6 },
          colors: ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'],
        });
      });
    }

    if (!trigger) {
      hasFired.current = false;
    }
  }, [trigger]);

  return null;
}
