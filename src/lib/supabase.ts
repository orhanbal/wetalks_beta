import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DbArticle = {
  id: string;
  title: string;
  supertitle: string | null;
  subtitle: string | null;
  category: string;
  series_id: string | null;
  series_title: string | null;
  date: string;
  excerpt: string;
  reading_time: number;
  content: string;
  published: boolean;
  featured: boolean;
  members_only: boolean;
  friend_link_token: string | null;
  boosted: boolean;
  boosted_at: string | null;
  scheduled_at: string | null;
  og_image: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type SeriesOutlineNode = {
  id: string;
  title: string;
  order: number;
  article_id?: string;
  article_ids?: string[];
  children?: SeriesOutlineNode[];
};

export type DbSeries = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  concept_description: string | null;
  topics: string[] | null;
  outline: SeriesOutlineNode[] | null;
  article_count: number;
  og_image: string | null;
  logo_url: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbHeroSlide = {
  id: string;
  type: 'article' | 'series';
  item_id: string;
  sort_order: number;
  active: boolean;
  chapter_title: string | null;
  progress_bar_color: string | null;
  bottom_bar_color: string | null;
  created_at: string;
};

export type DbSiteSetting = {
  key: string;
  value: string;
  updated_at: string;
};
