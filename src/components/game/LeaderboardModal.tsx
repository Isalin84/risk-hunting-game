import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Crown } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardModalProps {
  open: boolean;
  entries: LeaderboardEntry[];
  onClose: () => void;
}

export function LeaderboardModal({ open, entries, onClose }: LeaderboardModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg bg-brand-dark text-white border-brand-gold">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-brand-gold flex items-center gap-2 justify-center">
            <Crown />
            {t('game.leaderboard')}
          </DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow className="border-brand-gold/30">
              <TableHead className="text-brand-gold font-heading">{t('game.place')}</TableHead>
              <TableHead className="text-brand-gold font-heading">{t('game.name')}</TableHead>
              <TableHead className="text-brand-gold font-heading">{t('game.risksPerTime')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.slice(0, 10).map((entry, i) => (
              <TableRow key={entry.id} className="border-brand-gold/20">
                <TableCell className="font-heading font-bold text-brand-gold">{i + 1}</TableCell>
                <TableCell className="font-body">{entry.player_name}</TableCell>
                <TableCell className="font-body">
                  {entry.score} / {entry.time_seconds}{t('game.sec')}
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center font-body text-white/60">—</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex justify-center mt-4">
          <Button
            onClick={onClose}
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold px-6"
          >
            {t('game.playAgain')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
