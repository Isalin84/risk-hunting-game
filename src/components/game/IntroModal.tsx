import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface IntroModalProps {
  open: boolean;
  onStart: () => void;
}

export function IntroModal({ open, onStart }: IntroModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-white border-brand-gold" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-brand-dark flex items-center gap-2 justify-center">
            <Shield className="text-brand-gold" />
            {t('game.howToPlay')}
          </DialogTitle>
          <DialogDescription className="text-center font-body text-brand-dark/80 mt-2">
            {t('game.howToPlayDesc')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-4">
          <Button
            onClick={onStart}
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold px-8 py-3 text-lg"
          >
            {t('game.start')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
