import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploader } from './ImageUploader';
import type { Level } from '@/types';

interface LevelFormProps {
  level?: Level | null;
  onSave: (data: Omit<Level, 'id' | 'created_at' | 'hazards'>) => void;
  onCancel: () => void;
}

export function LevelForm({ level, onSave, onCancel }: LevelFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(level?.name || '');
  const [orderIndex, setOrderIndex] = useState(level?.order_index ?? 0);
  const [imagePath, setImagePath] = useState(level?.image_path || '');
  const [audioPath, setAudioPath] = useState(level?.audio_background_path || '');
  const [minRisks, setMinRisks] = useState(level?.min_risks ?? 1);

  useEffect(() => {
    if (level) {
      setName(level.name);
      setOrderIndex(level.order_index);
      setImagePath(level.image_path);
      setAudioPath(level.audio_background_path || '');
      setMinRisks(level.min_risks);
    }
  }, [level]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      order_index: orderIndex,
      image_path: imagePath,
      audio_background_path: audioPath || null,
      min_risks: minRisks,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="font-heading">{t('admin.levelName')}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required className="font-body" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="font-heading">{t('admin.orderIndex')}</Label>
          <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} className="font-body" />
        </div>
        <div className="space-y-1.5">
          <Label className="font-heading">{t('admin.minRisks')}</Label>
          <Input type="number" min={1} value={minRisks} onChange={(e) => setMinRisks(Number(e.target.value))} className="font-body" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="font-heading">{t('admin.image')}</Label>
        <ImageUploader
          bucket="level-images"
          currentUrl={imagePath}
          onUpload={(_path, url) => setImagePath(url)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="font-heading">{t('admin.backgroundAudio')}</Label>
        <Input
          value={audioPath}
          onChange={(e) => setAudioPath(e.target.value)}
          placeholder="sounds/office.mp3"
          className="font-body"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="font-heading">
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading font-semibold">
          {t('admin.saveLevel')}
        </Button>
      </div>
    </form>
  );
}
