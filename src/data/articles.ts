export type Category =
  | 'Ticaret'
  | 'E-Ticaret'
  | 'Marka ve Strateji'
  | 'Girişimcilik'
  | 'Teknoloji'
  | 'Yapay Zekâ'
  | 'Kişisel Notlar';

export interface Article {
  id: string;
  title: string;
  supertitle?: string;
  subtitle?: string;
  category: Category;
  seriesId?: string;
  seriesTitle?: string;
  date: string;
  excerpt: string;
  readingTime: number;
  content: string;
  ogImage?: string;
  featured?: boolean;
  membersOnly?: boolean;
  friendLinkToken?: string;
  boosted?: boolean;
  boostedAt?: string;
  scheduledAt?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorUsername?: string;
}
