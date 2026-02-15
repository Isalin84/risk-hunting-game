import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLevels } from '@/hooks/useLevels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Crosshair, Image as ImageIcon } from 'lucide-react';
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

  // --- Hotspot Editor view ---
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

  // --- Level Form view ---
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

  // --- Level List view ---
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-semibold text-xl text-brand-dark">{t('admin.levels')}</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading gap-1.5"
        >
          <Plus size={16} />
          {t('admin.createLevel')}
        </Button>
      </div>

      {loading ? (
        <p className="text-center font-body text-brand-dark/60 py-8">{t('common.loading')}</p>
      ) : levels.length === 0 ? (
        <Card className="border-brand-gold-soft">
          <CardContent className="py-12 text-center">
            <ImageIcon size={48} className="mx-auto text-brand-dark/20 mb-3" />
            <p className="font-body text-brand-dark/60">{t('admin.noLevels')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {levels.map((level) => {
            const hazardCount = level.hazards?.length || 0;
            const uniqueGroups = new Set(level.hazards?.map(h => h.group_key) || []);
            const groupCount = uniqueGroups.size;

            return (
              <Card key={level.id} className="border-brand-gold-soft hover:border-brand-gold transition-colors">
                <CardContent className="p-0">
                  <div className="flex gap-4">
                    {/* Level image thumbnail */}
                    <div className="w-48 h-32 shrink-0 bg-neutral-100 rounded-l-lg overflow-hidden">
                      {level.image_path ? (
                        <img
                          src={level.image_path}
                          alt={level.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-dark/20">
                          <ImageIcon size={32} />
                        </div>
                      )}
                    </div>

                    {/* Level info */}
                    <div className="flex-1 py-3 pr-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-heading font-bold text-brand-dark text-lg">
                            {level.name}
                          </span>
                          <Badge variant="outline" className="font-heading text-xs border-brand-gold-soft text-brand-dark/60">
                            #{level.order_index + 1}
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-sm font-body text-brand-dark/60">
                          <span>
                            {t('admin.hazards')}: <strong className="text-brand-dark">{hazardCount}</strong> шт
                            ({groupCount} {groupCount === 1 ? 'группа' : groupCount < 5 ? 'группы' : 'групп'})
                          </span>
                          <span>
                            {t('admin.minRisks')}: <strong className="text-brand-dark">{level.min_risks}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => setEditingHazardsLevel(level)}
                          className="bg-brand-steel hover:bg-brand-steel-light text-white font-heading gap-1.5"
                        >
                          <Crosshair size={14} />
                          {t('admin.editHazards')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLevel(level)}
                          className="font-heading gap-1.5 border-brand-gold-soft hover:border-brand-gold"
                        >
                          <Pencil size={14} />
                          {t('common.edit')}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-game-danger hover:text-game-danger hover:bg-game-danger/10 font-heading gap-1.5">
                              <Trash2 size={14} />
                              {t('common.delete')}
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
