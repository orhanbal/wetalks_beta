import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useSaveReadingProgress(articleId: string) {
  const { user } = useAuth();
  const lastSavedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveProgress = useCallback(async (progress: number) => {
    if (!user || !articleId) return;
    if (Math.abs(progress - lastSavedRef.current) < 5) return;
    lastSavedRef.current = progress;
    await supabase.from('reading_progress').upsert(
      { user_id: user.id, article_id: articleId, progress, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,article_id' }
    );
  }, [user, articleId]);

  const scheduleSync = useCallback((progress: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => saveProgress(progress), 2000);
  }, [saveProgress]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { scheduleSync };
}

export interface ReadingProgressEntry {
  article_id: string;
  progress: number;
  updated_at: string;
}

export function useReadingProgressList() {
  const { user } = useAuth();
  const [list, setList] = useState<ReadingProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setList([]); setLoading(false); return; }
    supabase
      .from('reading_progress')
      .select('article_id, progress, updated_at')
      .eq('user_id', user.id)
      .gt('progress', 5)
      .lt('progress', 95)
      .order('updated_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setList((data ?? []) as ReadingProgressEntry[]);
        setLoading(false);
      });
  }, [user?.id]);

  return { list, loading };
}
