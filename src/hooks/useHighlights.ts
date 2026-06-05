import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface Highlight {
  id: string;
  article_id: string;
  user_id: string;
  selected_text: string;
  color: HighlightColor;
  created_at: string;
}

export function useHighlights(articleId: string) {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHighlights = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('highlights')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (data) setHighlights(data as Highlight[]);
    setLoading(false);
  }, [articleId, user]);

  useEffect(() => { fetchHighlights(); }, [fetchHighlights]);

  const addHighlight = useCallback(async (text: string, color: HighlightColor = 'yellow') => {
    if (!user) return null;
    if (highlights.length >= 50) return null;
    const trimmed = text.trim().slice(0, 1000);
    if (!trimmed) return null;
    // Avoid exact duplicates
    if (highlights.some(h => h.selected_text === trimmed)) return null;

    const { data, error } = await supabase
      .from('highlights')
      .insert({ article_id: articleId, user_id: user.id, selected_text: trimmed, color })
      .select()
      .single();
    if (error || !data) return null;
    const newH = data as Highlight;
    setHighlights(prev => [...prev, newH]);
    return newH;
  }, [user, articleId, highlights]);

  const removeHighlight = useCallback(async (id: string) => {
    await supabase.from('highlights').delete().eq('id', id);
    setHighlights(prev => prev.filter(h => h.id !== id));
  }, []);

  return { highlights, loading, addHighlight, removeHighlight };
}
