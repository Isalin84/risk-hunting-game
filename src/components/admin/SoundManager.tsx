import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSounds } from '@/hooks/useSounds';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Upload, Play, Trash2 } from 'lucide-react';
import type { Sound } from '@/types';

export function SoundManager() {
  const { t } = useTranslation();
  const { sounds, loading, fetchSounds } = useSounds();
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<Sound['category']>('good');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const allSounds = [...sounds.good, ...sounds.bad, ...sounds.background];

  const handleUpload = useCallback(async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !uploadName) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('sounds').upload(fileName, file);
    if (uploadError) { setUploading(false); return; }

    await supabase.from('sounds').insert({
      name: uploadName,
      category: uploadCategory,
      file_path: fileName,
    });

    setUploadName('');
    if (fileRef.current) fileRef.current.value = '';
    await fetchSounds();
    setUploading(false);
  }, [uploadName, uploadCategory, fetchSounds]);

  const handlePlay = useCallback((filePath: string) => {
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(filePath);
    audioRef.current.play().catch(() => {});
  }, []);

  const handleDelete = useCallback(async (sound: Sound) => {
    const path = sound.file_path.includes('/') ? sound.file_path.split('/').pop()! : sound.file_path;
    await supabase.storage.from('sounds').remove([path]);
    await supabase.from('sounds').delete().eq('id', sound.id);
    await fetchSounds();
  }, [fetchSounds]);

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'good': return 'bg-game-success/20 text-game-success';
      case 'bad': return 'bg-game-danger/20 text-game-danger';
      default: return 'bg-brand-gold/20 text-brand-gold-hover';
    }
  };

  return (
    <Card className="border-brand-gold-soft">
      <CardHeader>
        <CardTitle className="font-heading text-brand-dark">{t('admin.sounds')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload form */}
        <div className="flex gap-2 items-end flex-wrap">
          <div className="space-y-1 flex-1 min-w-[150px]">
            <Label className="font-heading text-xs">{t('admin.soundName')}</Label>
            <Input
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              className="font-body h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="font-heading text-xs">{t('admin.soundCategory')}</Label>
            <Select value={uploadCategory} onValueChange={(v) => setUploadCategory(v as Sound['category'])}>
              <SelectTrigger className="w-[140px] h-8 font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="good">{t('admin.good')}</SelectItem>
                <SelectItem value="bad">{t('admin.bad')}</SelectItem>
                <SelectItem value="background">{t('admin.background')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="font-heading text-xs">{t('admin.soundFile')}</Label>
            <input ref={fileRef} type="file" accept="audio/*" className="text-sm font-body" />
          </div>
          <Button
            onClick={handleUpload}
            disabled={uploading || !uploadName}
            size="sm"
            className="bg-brand-gold hover:bg-brand-gold-hover text-brand-dark font-heading gap-1"
          >
            <Upload size={14} />
            {t('admin.uploadSound')}
          </Button>
        </div>

        {/* Sound list */}
        {loading ? (
          <p className="text-center font-body text-brand-dark/60">{t('common.loading')}</p>
        ) : allSounds.length === 0 ? (
          <p className="text-center font-body text-brand-dark/60">{t('admin.noSounds')}</p>
        ) : (
          <div className="space-y-1">
            {allSounds.map((sound) => (
              <div key={sound.id} className="flex items-center gap-2 p-2 rounded hover:bg-brand-beige/30">
                <Badge className={`${categoryColor(sound.category)} font-heading text-xs`}>
                  {t(`admin.${sound.category}`)}
                </Badge>
                <span className="font-body text-sm flex-1">{sound.name}</span>
                <Button variant="ghost" size="sm" onClick={() => handlePlay(sound.file_path)}>
                  <Play size={14} />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-game-danger hover:text-game-danger">
                      <Trash2 size={14} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-heading">{t('admin.deleteConfirm')}</AlertDialogTitle>
                      <AlertDialogDescription className="font-body">{sound.name}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-heading">{t('common.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(sound)} className="bg-game-danger hover:bg-game-danger/90 font-heading">
                        {t('common.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
