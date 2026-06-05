import type { Category } from '../data/articles';

interface CategoryColor {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

const COLORS: Record<string, CategoryColor> = {
  'Ticaret':           { bg: '#f97316', text: '#fff', border: '#ea6500', dot: '#f97316' },
  'E-Ticaret':         { bg: '#f59e0b', text: '#fff', border: '#d97706', dot: '#f59e0b' },
  'Marka ve Strateji': { bg: '#10b981', text: '#fff', border: '#059669', dot: '#10b981' },
  'Girişimcilik':      { bg: '#3b82f6', text: '#fff', border: '#2563eb', dot: '#3b82f6' },
  'Teknoloji':         { bg: '#22c55e', text: '#fff', border: '#16a34a', dot: '#22c55e' },
  'Yapay Zekâ':        { bg: '#ec4899', text: '#fff', border: '#db2777', dot: '#ec4899' },
  'Kişisel Notlar':    { bg: '#64748b', text: '#fff', border: '#475569', dot: '#64748b' },
};

const DEFAULT_COLOR: CategoryColor = { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', dot: '#6b7280' };

export function getCategoryColor(category: string | undefined): CategoryColor {
  if (!category) return DEFAULT_COLOR;
  return COLORS[category] ?? DEFAULT_COLOR;
}

export type { Category, CategoryColor };
