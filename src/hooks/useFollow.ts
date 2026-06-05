import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useFollow(currentUserId: string | null | undefined, authorId: string | null | undefined) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!authorId) return;

    (async () => {
      setLoading(true);

      const countRes = await supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', authorId);
      setFollowerCount(countRes.count ?? 0);

      if (currentUserId) {
        const followRes = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUserId)
          .eq('following_id', authorId)
          .maybeSingle();
        setIsFollowing(!!followRes.data);
      }

      setLoading(false);
    })();
  }, [currentUserId, authorId]);

  const toggle = async () => {
    if (!currentUserId || !authorId || toggling) return;
    setToggling(true);

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', authorId);
      setIsFollowing(false);
      setFollowerCount(c => Math.max(0, c - 1));
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: authorId });
      setIsFollowing(true);
      setFollowerCount(c => c + 1);
    }

    setToggling(false);
  };

  return { isFollowing, followerCount, loading, toggling, toggle };
}

export function useFollowingCount(userId: string | null | undefined) {
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId)
      .then(res => setFollowingCount(res.count ?? 0));
  }, [userId]);

  return followingCount;
}

export function useFollowerCount(userId: string | null | undefined) {
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId)
      .then(res => setFollowerCount(res.count ?? 0));
  }, [userId]);

  return followerCount;
}
