export type ArticleBadge = {
  id: string;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  tier: number;
};

export const FOUNDER_BADGE: ArticleBadge = {
  id: 'founder',
  label: 'Kurucu Yazar',
  description: 'Platformun kurucusu.',
  color: '#1d4ed8',
  bg: '#dbeafe',
  border: '#93c5fd',
  tier: 0,
};

export const ARTICLE_BADGES: ArticleBadge[] = [
  {
    id: 'new-writer',
    label: 'Yeni Yazar',
    description: 'İlk adımını attın! 10 makaleye kadar geçerlidir.',
    color: '#374151',
    bg: '#f3f4f6',
    border: '#d1d5db',
    tier: 1,
  },
  {
    id: 'rising-writer',
    label: 'Gelişen Yazar',
    description: '10–99 makale yazıldı. Kalem durmuyor!',
    color: '#065f46',
    bg: '#d1fae5',
    border: '#6ee7b7',
    tier: 2,
  },
  {
    id: 'jr-writer',
    label: 'Jr. Yazar',
    description: '100–999 makale! Ciddi bir arşiv oluşuyor.',
    color: '#1e40af',
    bg: '#dbeafe',
    border: '#93c5fd',
    tier: 3,
  },
  {
    id: 'master-writer',
    label: 'Usta Yazar',
    description: '1000–4999 makale. Gerçek bir üretim makinesi!',
    color: '#92400e',
    bg: '#fef3c7',
    border: '#fcd34d',
    tier: 4,
  },
  {
    id: 'chief-writer',
    label: 'Baş Yazar',
    description: '5000+ makale. Efsanevi bir içerik üreticisi!',
    color: '#7c2d12',
    bg: '#ffedd5',
    border: '#fb923c',
    tier: 5,
  },
];

export function getBadgeById(id: string): ArticleBadge | undefined {
  if (id === 'founder') return FOUNDER_BADGE;
  return ARTICLE_BADGES.find(b => b.id === id);
}

export function resolveAuthorBadge(articleCount: number, customBadge?: string | null, role?: string | null): ArticleBadge {
  if (role === 'admin') return FOUNDER_BADGE;
  if (customBadge) {
    const found = getBadgeById(customBadge);
    if (found) return found;
  }
  return getArticleBadge(articleCount);
}

export function getArticleBadge(articleCount: number): ArticleBadge {
  if (articleCount >= 5000) return ARTICLE_BADGES[4];
  if (articleCount >= 1000) return ARTICLE_BADGES[3];
  if (articleCount >= 100) return ARTICLE_BADGES[2];
  if (articleCount >= 10) return ARTICLE_BADGES[1];
  return ARTICLE_BADGES[0];
}

export function getNextArticleMilestone(count: number): { target: number; label: string } | null {
  if (count < 10) return { target: 10, label: 'Gelişen Yazar' };
  if (count < 100) return { target: 100, label: 'Jr. Yazar' };
  if (count < 1000) return { target: 1000, label: 'Usta Yazar' };
  if (count < 5000) return { target: 5000, label: 'Baş Yazar' };
  return null;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
