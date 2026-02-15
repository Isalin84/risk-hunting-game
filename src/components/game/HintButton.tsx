import { Lightbulb } from 'lucide-react';
import { GAME_CONFIG } from '@/lib/constants';

interface HintButtonProps {
  hintsRemaining: number;
  onUseHint: () => void;
  disabled?: boolean;
}

export function HintButton({ hintsRemaining, onUseHint, disabled }: HintButtonProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: GAME_CONFIG.TOTAL_HINTS }).map((_, i) => (
        <Lightbulb
          key={i}
          size={20}
          className={i < hintsRemaining ? 'text-game-warning cursor-pointer' : 'text-white/30'}
          fill={i < hintsRemaining ? 'currentColor' : 'none'}
          onClick={() => {
            if (i < hintsRemaining && !disabled) onUseHint();
          }}
        />
      ))}
    </div>
  );
}
