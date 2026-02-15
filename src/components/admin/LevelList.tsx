import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLevels } from '@/hooks/useLevels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Crosshair } from 'lucide-react';
import { LevelForm } from './LevelForm';
import { HotspotEditor } from './HotspotEditor';
import type { Level } from '@/types';

export function LevelList() {
  const { t } = useTranslation();
  const { levels, loading, createLevel, updateLevel, deleteLevel, saveHazards } = useLevels();
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHazardsLevel, setEditingHazardsLevel] = useState<Level | null>(null);

  const handleSave = async (data: Omit<Level, 'id' | 'created_at' | 'hazards'>) => {
    if (editingLevel) {
      await updateLevel(editingLevel.id, data);
    } else {
      await createLevel(data);
    }
    setEditingLevel(null);
    setShowForm(false);
  };

  if (editingHazardsLevel) {
    return (
      <HotspotEditor
        level={editingHazardsLevel}
        onSave={async (hazards) => {
          await saveHazards(editingHazardsLevel.id, hazards);
          setEditingHazardsLevel(null);
        }}
        onCancel={() => setEditingHazardsLevel(null)}
      />
    );
  }

  if (showForm || editingLevel) {
    return (
      <Card className="border-brand-gold-soft">
        <CardHeader>
          <CardTitle className="font-heading text-brand-dark">
            {editingLevel ? t('common.edit') : t('admin.createLevel')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LevelForm
            level={editingLevel}
            onSave={handleSave}
            onCancel={() => { setEditingLevel(null); setShowForm(false); }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-brand-gold-soft">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-brand-dark">{t('admin.levels')}</CardTitle>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading gap-1.5"
          size="sm"
        >
          <Plus size={16} />
          {t('admin.createLevel')}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center font-body text-brand-dark/60">{t('common.loading')}</p>
        ) : levels.length === 0 ? (
          <p className="text-center font-body text-brand-dark/60">{t('admin.noLevels')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-heading">#</TableHead>
                <TableHead className="font-heading">{t('admin.levelName')}</TableHead>
                <TableHead className="font-heading">{t('admin.hazards')}</TableHead>
                <TableHead className="font-heading text-right">{t('common.edit')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels.map((level) => (
                <TableRow key={level.id}>
                  <TableCell className="font-body">{level.order_index}</TableCell>
                  <TableCell className="font-body font-medium">{level.name}</TableCell>
                  <TableCell className="font-body">{level.hazards?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingHazardsLevel(level)}
                        className="text-brand-steel-light hover:text-brand-gold"
                        title={t('admin.editHazards')}
                      >
                        <Crosshair size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLevel(level)}
                        className="text-brand-steel-light hover:text-brand-gold"
                      >
                        <Pencil size={16} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-game-danger hover:text-game-danger">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-heading">{t('admin.deleteConfirm')}</AlertDialogTitle>
                            <AlertDialogDescription className="font-body">
                              {level.name}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-heading">{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteLevel(level.id)}
                              className="bg-game-danger hover:bg-game-danger/90 font-heading"
                            >
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
