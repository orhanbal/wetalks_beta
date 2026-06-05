import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  type: string;
  actor_id: string | null;
  actor_name: string | null;
  article_id: string | null;
  article_title: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); setUnreadCount(0); setLoading(false); return; }
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    const items = (data ?? []) as Notification[];
    setNotifications(items);
    setUnreadCount(items.filter(n => !n.read).length);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => { fetchNotifications(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchNotifications]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [user?.id]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(ns => ns.filter(n => n.id !== id));
  }, []);

  return { notifications, unreadCount, loading, markAllRead, markRead, deleteNotification };
}
