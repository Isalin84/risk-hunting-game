import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface LevelCompleteModalProps {
  open: boolean;
  levelScore: number;
  levelTime: number;
  onNext: () => void;
}

export function LevelCompleteModal({ open, levelScore, levelTime, onNext }: LevelCompleteModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-white border-brand-gold" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-brand-dark flex items-center gap-2 justify-center">
            <Trophy className="text-brand-gold" />
            {t('game.levelComplete')}
          </DialogTitle>
          <DialogDescription className="text-center font-body text-brand-dark/80 mt-2">
            {t('game.levelCompleteDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="text-center space-y-1 font-body text-brand-dark">
          <p>{t('game.risksFound')}: <strong>{levelScore}</strong></p>
          <p>{t('game.timeSpent')}: <strong>{levelTime} {t('game.sec')}</strong></p>
        </div>
        <div className="flex justify-center mt-4">
          <Button
            onClick={onNext}
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold px-6"
          >
            {t('game.nextLevel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
