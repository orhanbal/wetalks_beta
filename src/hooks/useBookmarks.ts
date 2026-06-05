import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export type BookmarkType = 'article' | 'series';

export interface BookmarkCollection {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  content_type: BookmarkType;
  content_id: string;
  note: string | null;
  collection_id: string | null;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!user) { setBookmarks([]); setCollections([]); return; }
    setLoading(true);
    const [bmRes, colRes] = await Promise.all([
      supabase
        .from('bookmarks')
        .select('id, content_type, content_id, note, collection_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('bookmark_collections')
        .select('id, name, color, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
    ]);
    setBookmarks((bmRes.data as Bookmark[]) ?? []);
    setCollections((colRes.data as BookmarkCollection[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const isBookmarked = useCallback(
    (type: BookmarkType, id: string) =>
      bookmarks.some(b => b.content_type === type && b.content_id === id),
    [bookmarks],
  );

  const toggle = useCallback(async (type: BookmarkType, id: string) => {
    if (!user) return;
    const existing = bookmarks.find(b => b.content_type === type && b.content_id === id);
    if (existing) {
      setBookmarks(prev => prev.filter(b => b.id !== existing.id));
      await supabase.from('bookmarks').delete().eq('id', existing.id);
    } else {
      const optimistic: Bookmark = {
        id: crypto.randomUUID(),
        content_type: type,
        content_id: id,
        note: null,
        collection_id: null,
        created_at: new Date().toISOString(),
      };
      setBookmarks(prev => [optimistic, ...prev]);
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, content_type: type, content_id: id })
        .select('id, content_type, content_id, note, collection_id, created_at')
        .single();
      if (!error && data) {
        setBookmarks(prev => prev.map(b => b.id === optimistic.id ? (data as Bookmark) : b));
      } else if (error) {
        setBookmarks(prev => prev.filter(b => b.id !== optimistic.id));
      }
    }
  }, [user, bookmarks]);

  const updateBookmark = useCallback(async (id: string, updates: { note?: string | null; collection_id?: string | null }) => {
    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    await supabase.from('bookmarks').update(updates).eq('id', id);
  }, []);

  const createCollection = useCallback(async (name: string, color: string): Promise<BookmarkCollection | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('bookmark_collections')
      .insert({ user_id: user.id, name: name.trim(), color })
      .select('id, name, color, created_at')
      .single();
    if (!error && data) {
      const col = data as BookmarkCollection;
      setCollections(prev => [...prev, col]);
      return col;
    }
    return null;
  }, [user]);

  const deleteCollection = useCallback(async (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    setBookmarks(prev => prev.map(b => b.collection_id === id ? { ...b, collection_id: null } : b));
    await supabase.from('bookmark_collections').delete().eq('id', id);
  }, []);

  const renameCollection = useCallback(async (id: string, name: string) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    await supabase.from('bookmark_collections').update({ name: name.trim() }).eq('id', id);
  }, []);

  return {
    bookmarks, collections, loading,
    isBookmarked, toggle,
    updateBookmark, createCollection, deleteCollection, renameCollection,
    refetch: fetch,
  };
}
