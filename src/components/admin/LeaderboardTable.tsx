import { useTranslation } from 'react-i18next';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export function LeaderboardTable() {
  const { t } = useTranslation();
  const { entries, loading, deleteEntry } = useLeaderboard();

  return (
    <Card className="border-brand-gold-soft">
      <CardHeader>
        <CardTitle className="font-heading text-brand-dark">{t('admin.leaderboardTab')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center font-body text-brand-dark/60">{t('common.loading')}</p>
        ) : entries.length === 0 ? (
          <p className="text-center font-body text-brand-dark/60">{t('admin.noEntries')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-heading">#</TableHead>
                <TableHead className="font-heading">{t('game.name')}</TableHead>
                <TableHead className="font-heading">{t('game.risksPerTime')}</TableHead>
                <TableHead className="font-heading text-right">{t('common.delete')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, i) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-body">{i + 1}</TableCell>
                  <TableCell className="font-body font-medium">{entry.player_name}</TableCell>
                  <TableCell className="font-body">
                    {entry.score} / {entry.time_seconds}{t('game.sec')}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-game-danger hover:text-game-danger">
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-heading">{t('admin.deleteConfirm')}</AlertDialogTitle>
                          <AlertDialogDescription className="font-body">{entry.player_name}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-heading">{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteEntry(entry.id)} className="bg-game-danger hover:bg-game-danger/90 font-heading">
                            {t('common.delete')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
