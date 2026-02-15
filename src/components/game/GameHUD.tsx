import { useTranslation } from 'react-i18next';
import { Clock, Search, Zap } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { StreakIndicator } from './StreakIndicator';
import { HintButton } from './HintButton';

interface GameHUDProps {
  levelName: string;
  levelIndex: number;
  totalLevels: number;
  seconds: number;
  foundCount: number;
  totalGroups: number;
  streakCount: number;
  hintsRemaining: number;
  onUseHint: () => void;
}

export function GameHUD({
  levelName,
  levelIndex,
  totalLevels,
  seconds,
  foundCount,
  totalGroups,
  streakCount,
  hintsRemaining,
  onUseHint,
}: GameHUDProps) {
  const { t } = useTranslation();
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="bg-brand-steel text-white px-4 py-2 flex flex-col gap-1">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="font-heading font-semibold text-brand-gold">
            {t('game.level')} {levelIndex + 1}/{totalLevels}
          </span>
          <span className="text-sm font-body text-white/70">{levelName}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-brand-gold" />
            <span className="font-heading tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Search size={16} className="text-brand-gold" />
            <span className="font-heading">
              {foundCount}/{totalGroups}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Zap size={16} className="text-game-warning" />
            <StreakIndicator count={streakCount} />
          </div>

          <HintButton hintsRemaining={hintsRemaining} onUseHint={onUseHint} />
        </div>
      </div>
      <ProgressBar found={foundCount} total={totalGroups} />
    </div>
  );
}
