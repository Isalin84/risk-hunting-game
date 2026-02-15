import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, User } from 'lucide-react';

interface GameOverModalProps {
  open: boolean;
  totalScore: number;
  totalTime: number;
  nickname?: string;
  onSave: (name: string) => void;
}

export function GameOverModal({ open, totalScore, totalTime, nickname, onSave }: GameOverModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const handleSave = () => {
    const playerName = nickname || name.trim() || t('game.noName');
    onSave(playerName);
    setName('');
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-white border-brand-gold" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-brand-dark flex items-center gap-2 justify-center">
            <Award className="text-brand-gold" />
            {t('game.gameOver')}
          </DialogTitle>
          <DialogDescription className="text-center font-body text-brand-dark/80 mt-2">
            {t('game.allLevelsComplete')}
          </DialogDescription>
        </DialogHeader>
        <p className="text-center font-body text-brand-dark">
          {t('game.yourResult', { score: totalScore, time: totalTime })}
        </p>

        {nickname ? (
          <div className="flex items-center justify-center gap-2 mt-2 p-3 bg-brand-bg rounded-lg border border-brand-gold-soft">
            <User size={16} className="text-brand-gold" />
            <span className="font-heading text-brand-dark">
              {t('game.saveAs', { name: nickname })}
            </span>
          </div>
        ) : (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('game.enterName')}
            maxLength={20}
            className="mt-2 font-body border-brand-gold-soft focus:border-brand-gold"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        )}

        <div className="flex justify-center mt-4">
          <Button
            onClick={handleSave}
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold px-6"
          >
            {t('game.saveResult')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
