import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface RiskFoundModalProps {
  open: boolean;
  description: string | null;
  onClose: () => void;
}

export function RiskFoundModal({ open, description, onClose }: RiskFoundModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm bg-white border-game-success">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-game-success shrink-0 mt-0.5" size={24} />
          <DialogDescription className="text-base font-body text-brand-dark">
            {description}
          </DialogDescription>
        </div>
        <div className="flex justify-center mt-2">
          <Button
            onClick={onClose}
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading"
          >
            {t('game.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
