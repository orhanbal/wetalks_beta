import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export function useComments(articleId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profile:profiles(full_name, avatar_url, username)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });
    if (data) setComments(data as Comment[]);
    setLoading(false);
  }, [articleId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const addComment = useCallback(async (body: string) => {
    if (!user) return false;
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase
      .from('comments')
      .insert({ article_id: articleId, user_id: user.id, body: body.trim() });
    setSubmitting(false);
    if (err) { setError('Yorum gönderilemedi.'); return false; }
    await fetchComments();
    return true;
  }, [user, articleId, fetchComments]);

  const deleteComment = useCallback(async (commentId: string) => {
    await supabase.from('comments').delete().eq('id', commentId);
    setComments(c => c.filter(x => x.id !== commentId));
  }, []);

  return { comments, loading, submitting, error, addComment, deleteComment };
}
