import { useState, useEffect, useCallback } from 'react';
import { supabase, getPublicUrl } from '@/lib/supabase';
import type { Level, Hazard } from '@/types';

export function useLevels() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    const { data: levelsData } = await supabase
      .from('levels')
      .select('*')
      .order('order_index');

    const { data: hazardsData } = await supabase.from('hazards').select('*');

    if (levelsData) {
      const merged = levelsData.map((level) => ({
        ...level,
        image_path: level.image_path?.startsWith('http') || level.image_path?.startsWith('/')
          ? level.image_path
          : getPublicUrl('level-images', level.image_path),
        audio_background_path: level.audio_background_path
          ? level.audio_background_path.startsWith('http') || level.audio_background_path.startsWith('/')
            ? level.audio_background_path
            : getPublicUrl('sounds', level.audio_background_path)
          : null,
        hazards: (hazardsData || []).filter((h) => h.level_id === level.id),
      }));
      setLevels(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

  const createLevel = useCallback(async (level: Omit<Level, 'id' | 'created_at' | 'hazards'>) => {
    const { data, error } = await supabase.from('levels').insert(level).select().single();
    if (!error) await fetchLevels();
    return { data, error };
  }, [fetchLevels]);

  const updateLevel = useCallback(async (id: string, updates: Partial<Level>) => {
    const { hazards: _, ...rest } = updates as Level & { hazards?: Hazard[] };
    const { error } = await supabase.from('levels').update(rest).eq('id', id);
    if (!error) await fetchLevels();
    return { error };
  }, [fetchLevels]);

  const deleteLevel = useCallback(async (id: string) => {
    const { error } = await supabase.from('levels').delete().eq('id', id);
    if (!error) await fetchLevels();
    return { error };
  }, [fetchLevels]);

  const saveHazards = useCallback(async (levelId: string, hazards: Omit<Hazard, 'id'>[]) => {
    await supabase.from('hazards').delete().eq('level_id', levelId);
    if (hazards.length > 0) {
      const { error } = await supabase.from('hazards').insert(hazards);
      if (error) return { error };
    }
    await fetchLevels();
    return { error: null };
  }, [fetchLevels]);

  return { levels, loading, fetchLevels, createLevel, updateLevel, deleteLevel, saveHazards };
}
