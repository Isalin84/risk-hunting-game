import { useEffect, useState } from 'react';

interface StreakIndicatorProps {
  count: number;
}

export function StreakIndicator({ count }: StreakIndicatorProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (count >= 2) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
    setVisible(false);
  }, [count]);

  if (!visible || count < 2) return null;

  return (
    <span
      className="inline-block text-game-warning font-heading font-bold text-lg"
      style={{ animation: 'streakPop 0.3s ease-out forwards' }}
    >
      x{count}!
    </span>
  );
}
