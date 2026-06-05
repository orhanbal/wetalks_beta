import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useClaps(articleId: string) {
  const { user } = useAuth();
  const [totalClaps, setTotalClaps] = useState(0);
  const [userClaps, setUserClaps] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchClaps = useCallback(async () => {
    const { data: rows } = await supabase
      .from('claps')
      .select('user_id, count')
      .eq('article_id', articleId);

    if (rows) {
      const total = rows.reduce((sum, r) => sum + r.count, 0);
      setTotalClaps(total);
      if (user) {
        const mine = rows.find(r => r.user_id === user.id);
        setUserClaps(mine?.count ?? 0);
      }
    }
    setLoading(false);
  }, [articleId, user]);

  useEffect(() => { fetchClaps(); }, [fetchClaps]);

  const clap = useCallback(async () => {
    if (!user) return;
    const next = Math.min(userClaps + 1, 50);
    if (next === userClaps) return;

    setUserClaps(next);
    setTotalClaps(t => t + 1);

    const { data: existing } = await supabase
      .from('claps')
      .select('id, count')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('claps')
        .update({ count: next, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('claps')
        .insert({ article_id: articleId, user_id: user.id, count: 1 });
    }
  }, [user, articleId, userClaps]);

  return { totalClaps, userClaps, clap, loading };
}
