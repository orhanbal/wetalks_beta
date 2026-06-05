import { useState, useEffect } from 'react';
import { supabase, type DbArticle, type DbSeries, type DbSiteSetting, type DbHeroSlide } from '../lib/supabase';
import type { Article, Category } from '../data/articles';
import type { Series, SeriesOutlineNode } from '../data/series';

export type HeroSlide = {
  id: string;
  type: 'article' | 'series';
  item_id: string;
  sort_order: number;
  active: boolean;
  chapterTitle: string | null;
  progressBarColor: string | null;
  bottomBarColor: string | null;
};

function dbArticleToArticle(a: DbArticle & { profiles?: { full_name: string | null; avatar_url: string | null; username: string | null } | null }): Article {
  return {
    id: a.id,
    title: a.title,
    supertitle: a.supertitle ?? undefined,
    subtitle: a.subtitle ?? undefined,
    category: a.category as Category,
    seriesId: a.series_id ?? undefined,
    seriesTitle: a.series_title ?? undefined,
    date: a.date,
    excerpt: a.excerpt,
    readingTime: a.reading_time,
    content: a.content,
    ogImage: a.og_image ?? undefined,
    featured: a.featured,
    membersOnly: a.members_only,
    friendLinkToken: a.friend_link_token ?? undefined,
    boosted: a.boosted,
    boostedAt: a.boosted_at ?? undefined,
    scheduledAt: a.scheduled_at ?? undefined,
    authorId: a.author_id ?? undefined,
    authorName: a.profiles?.full_name ?? undefined,
    authorAvatar: a.profiles?.avatar_url ?? undefined,
    authorUsername: a.profiles?.username ?? undefined,
  };
}

function dbSeriesToSeries(s: DbSeries & { profiles?: { full_name: string | null; avatar_url: string | null } | null }): Series {
  return {
    id: s.id,
    title: s.title,
    tagline: s.tagline,
    description: s.description,
    conceptDescription: s.concept_description ?? undefined,
    topics: s.topics ?? undefined,
    outline: (s.outline as SeriesOutlineNode[] | null) ?? undefined,
    articleCount: s.article_count,
    ogImage: s.og_image ?? undefined,
    logoUrl: s.logo_url ?? undefined,
    authorName: s.profiles?.full_name ?? undefined,
    authorAvatar: s.profiles?.avatar_url ?? undefined,
    authorId: s.author_id ?? undefined,
  };
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    const now = new Date().toISOString();
    // Fetch published articles + scheduled articles whose time has come
    const { data } = await supabase
      .from('articles')
      .select('*, profiles(full_name, avatar_url, username)')
      .or(`published.eq.true,and(published.eq.false,scheduled_at.lte.${now})`)
      .order('date', { ascending: false });
    if (data) {
      // Auto-publish any scheduled articles that are due
      const toPublish = data.filter((a: DbArticle) => !a.published && a.scheduled_at && a.scheduled_at <= now);
      if (toPublish.length > 0) {
        await supabase.from('articles')
          .update({ published: true, scheduled_at: null })
          .in('id', toPublish.map((a: DbArticle) => a.id));
        toPublish.forEach((a: DbArticle) => { a.published = true; a.scheduled_at = null; });
      }
      setArticles(data.map(dbArticleToArticle));
    }
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, []);

  return { articles, loading, refetch: fetchArticles };
}

export function useSeries() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeries = async () => {
    const { data, error } = await supabase
      .from('series')
      .select('*, profiles!series_author_id_fkey(full_name, avatar_url)')
      .order('created_at', { ascending: true });
    if (error) console.error('useSeries error:', error);
    if (data) setSeriesList(data.map(dbSeriesToSeries));
    setLoading(false);
  };

  useEffect(() => { fetchSeries(); }, []);

  return { seriesList, loading, refetch: fetchSeries };
}

export interface AuthorLatestArticle {
  id: string;
  title: string;
  date: string;
  reading_time: number;
  og_image: string | null;
}

export interface AuthorSummary {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  title: string | null;
  role: string | null;
  total_articles: number;
  total_reads: number;
  custom_badge: string | null;
  latest_article: AuthorLatestArticle | null;
}

export function useAuthors() {
  const [authors, setAuthors] = useState<AuthorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, title, role, custom_badge')
        .in('role', ['author', 'editor', 'admin'])
        .order('full_name', { ascending: true }),
      supabase
        .from('writer_stats')
        .select('author_id, total_articles, total_reads'),
      supabase
        .from('articles')
        .select('id, title, date, reading_time, og_image, author_id')
        .eq('published', true)
        .order('date', { ascending: false }),
    ]).then(([profilesRes, statsRes, articlesRes]) => {
      const statsMap = new Map(
        (statsRes.data ?? []).map((s: any) => [s.author_id, s])
      );
      const latestMap = new Map<string, AuthorLatestArticle>();
      for (const a of (articlesRes.data ?? []) as any[]) {
        if (a.author_id && !latestMap.has(a.author_id)) {
          latestMap.set(a.author_id, {
            id: a.id,
            title: a.title,
            date: a.date,
            reading_time: a.reading_time,
            og_image: a.og_image ?? null,
          });
        }
      }
      const mapped: AuthorSummary[] = (profilesRes.data ?? []).map((p: any) => {
        const s: any = statsMap.get(p.id);
        return {
          id: p.id,
          username: p.username,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          title: p.title,
          role: p.role,
          total_articles: s?.total_articles ?? 0,
          total_reads: s?.total_reads ?? 0,
          custom_badge: p.custom_badge ?? null,
          latest_article: latestMap.get(p.id) ?? null,
        };
      });
      setAuthors(mapped);
      setLoading(false);
    });
  }, []);

  return { authors, loading };
}

export function useArticleClapsMap(articleIds: string[]) {
  const [clapsMap, setClapsMap] = useState<Record<string, number>>({});
  const key = articleIds.join(',');

  useEffect(() => {
    if (articleIds.length === 0) return;
    supabase
      .from('claps')
      .select('article_id, count')
      .in('article_id', articleIds)
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, number> = {};
        for (const row of data as { article_id: string; count: number }[]) {
          map[row.article_id] = (map[row.article_id] ?? 0) + row.count;
        }
        setClapsMap(map);
      });
  }, [key]);

  return clapsMap;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const map: Record<string, string> = {};
      (data as DbSiteSetting[]).forEach(s => { map[s.key] = s.value; });
      setSettings(map);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  useEffect(() => {
    const handler = () => fetchSettings();
    window.addEventListener('settings-updated', handler);
    return () => window.removeEventListener('settings-updated', handler);
  }, []);

  return { settings, loading, refetch: fetchSettings };
}

export function useHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlides = async () => {
    const { data } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (data) setSlides((data as DbHeroSlide[]).map(s => ({
      id: s.id,
      type: s.type,
      item_id: s.item_id,
      sort_order: s.sort_order,
      active: s.active,
      chapterTitle: s.chapter_title ?? null,
      progressBarColor: s.progress_bar_color ?? null,
      bottomBarColor: s.bottom_bar_color ?? null,
    })));
    setLoading(false);
  };

  useEffect(() => { fetchSlides(); }, []);

  return { slides, loading, refetch: fetchSlides };
}

