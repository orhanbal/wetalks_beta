export interface SeriesOutlineNode {
  id: string;
  title: string;
  order: number;
  article_id?: string;
  article_ids?: string[];
  children?: SeriesOutlineNode[];
}

export interface Series {
  id: string;
  title: string;
  tagline: string;
  description: string;
  conceptDescription?: string;
  topics?: string[];
  outline?: SeriesOutlineNode[];
  articleCount: number;
  ogImage?: string;
  logoUrl?: string;
  authorName?: string;
  authorAvatar?: string;
  authorId?: string;
}
