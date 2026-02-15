import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, getPublicUrl } from '@/lib/supabase';
import type { Sound } from '@/types';

export function useSounds() {
  const [sounds, setSounds] = useState<{ good: Sound[]; bad: Sound[]; background: Sound[] }>({
    good: [],
    bad: [],
    background: [],
  });
  const [loading, setLoading] = useState(true);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  const fetchSounds = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('sounds').select('*');
    if (data) {
      const resolved = data.map((s) => ({
        ...s,
        file_path: s.file_path?.startsWith('http') || s.file_path?.startsWith('/')
          ? s.file_path
          : getPublicUrl('sounds', s.file_path),
      }));
      setSounds({
        good: resolved.filter((s) => s.category === 'good'),
        bad: resolved.filter((s) => s.category === 'bad'),
        background: resolved.filter((s) => s.category === 'background'),
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSounds(); }, [fetchSounds]);

  const playRandom = useCallback((category: 'good' | 'bad') => {
    const list = sounds[category];
    if (list.length === 0) return;
    const sound = list[Math.floor(Math.random() * list.length)];
    const audio = new Audio(sound.file_path);
    audio.play().catch(() => {});
  }, [sounds]);

  const playBackground = useCallback((filePath: string) => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current = null;
    }
    const audio = new Audio(filePath);
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(() => {});
    bgAudioRef.current = audio;
  }, []);

  const stopBackground = useCallback(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current = null;
    }
  }, []);

  return { sounds, loading, fetchSounds, playRandom, playBackground, stopBackground };
}
