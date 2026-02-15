import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { LeaderboardEntry } from '@/types';
import { GAME_CONFIG } from '@/lib/constants';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('time_seconds', { ascending: true })
      .limit(GAME_CONFIG.LEADERBOARD_SIZE);
    if (data) setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const addEntry = useCallback(async (entry: Omit<LeaderboardEntry, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('leaderboard').insert(entry);
    if (!error) await fetchEntries();
    return { error };
  }, [fetchEntries]);

  const deleteEntry = useCallback(async (id: string) => {
    const { error } = await supabase.from('leaderboard').delete().eq('id', id);
    if (!error) await fetchEntries();
    return { error };
  }, [fetchEntries]);

  return { entries, loading, fetchEntries, addEntry, deleteEntry };
}
