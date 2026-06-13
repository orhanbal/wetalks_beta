import { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, ChevronRight, ShoppingCart, Rocket, Code2, Brain,
  Megaphone, User, Star, BookmarkPlus, Check, Mail, TrendingUp,
  Trophy, Play, Users, Zap, Globe, Target,
} from 'lucide-react';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';
import { useAuthors, type AuthorSummary } from '../../hooks/useData';
import { supabase } from '../../lib/supabase';
import { getCategoryColor } from '../../lib/categoryColors';

interface ModernHomePageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
  settings: Record<string, string>;
}

/* ─── Theme hook ──────────────────────────────────────── */
function useDarkTheme() {
  const [isDark, setIsDark] = useState(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr === 'dark';
    const stored = localStorage.getItem('theme-pref') as 'system' | 'light' | 'dark' | null;
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

/* ─── Constants ──────────────────────────────────────── */
const PURPLE = '#8B5CF6';
const PINK   = '#EC4899';
const ORANGE = '#F97316';
const BLUE   = '#3B82F6';
const GREEN  = '#10B981';
const AMBER  = '#F59E0B';

const GRAD_PURPLE_PINK = `linear-gradient(135deg, ${PURPLE}, ${PINK})`;

const CAT_GRADIENT: Record<string, string> = {
  'E-Ticaret':         `linear-gradient(135deg, ${ORANGE}, #EF4444)`,
  'Ticaret':           `linear-gradient(135deg, ${ORANGE}, #EF4444)`,
  'Girişimcilik':      `linear-gradient(135deg, ${PURPLE}, #7C3AED)`,
  'Yazılım':           `linear-gradient(135deg, ${BLUE}, #2563EB)`,
  'Yapay Zekâ':        `linear-gradient(135deg, ${GREEN}, #06B6D4)`,
  'Pazarlama':         `linear-gradient(135deg, ${AMBER}, ${ORANGE})`,
  'Kariyer':           `linear-gradient(135deg, ${PINK}, #EF4444)`,
  'Teknoloji':         `linear-gradient(135deg, #6366F1, #4F46E5)`,
  'Marka ve Strateji': `linear-gradient(135deg, #14B8A6, #06B6D4)`,
  'Kişisel Notlar':    `linear-gradient(135deg, #64748B, #475569)`,
  'Liderlik':          `linear-gradient(135deg, ${PURPLE}, ${PINK})`,
};

const CAT_ICON: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  'E-Ticaret': ShoppingCart, 'Ticaret': ShoppingCart,
  'Girişimcilik': Rocket, 'Yazılım': Code2,
  'Yapay Zekâ': Brain, 'Pazarlama': Megaphone,
  'Kariyer': User, 'Teknoloji': Zap,
  'Marka ve Strateji': Globe, 'Liderlik': Star,
  'Kişisel Notlar': Trophy,
};

function getCatGrad(cat: string): string {
  return CAT_GRADIENT[cat] ?? `linear-gradient(135deg, ${PURPLE}, ${PINK})`;
}
function getCatIcon(cat: string) {
  return CAT_ICON[cat] ?? Target;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}B`;
  return String(n);
}

/* ─── Section Header ─────────────────────────────────── */
function SectionHead({
  label, title, linkLabel, onLink, isDark, icon,
}: {
  label?: string; title: string; linkLabel: string;
  onLink: () => void; isDark: boolean;
  icon?: React.ReactNode;
}) {
  const ink = isDark ? '#fff' : '#111827';
  const ink3 = isDark ? '#71717A' : '#6B7280';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        {icon && <span>{icon}</span>}
        {label && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: PURPLE,
          }}>{label}</span>
        )}
        {!label && <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.025em', color: ink }}>{title}</h2>}
        {label && <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.025em', color: ink }}>{title}</h2>}
      </div>
      <button
        onClick={onLink}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.8rem', fontWeight: 600, color: ink3,
          fontFamily: 'inherit', transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = ink)}
        onMouseLeave={e => (e.currentTarget.style.color = ink3)}
      >
        {linkLabel} <ArrowRight size={13} />
      </button>
    </div>
  );
}

/* ─── Hero Author Card ────────────────────────────────── */
function HeroAuthorCard({
  author, style, navigate, featured, isDark,
}: {
  author: AuthorSummary; style: React.CSSProperties;
  navigate: (to: string) => void; featured?: boolean; isDark: boolean;
}) {
  const initials = (author.full_name ?? 'Y').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const glow = featured
    ? (isDark ? '0 0 48px rgba(139,92,246,0.5), 0 24px 64px rgba(0,0,0,0.7)' : '0 20px 56px rgba(139,92,246,0.25)')
    : (isDark ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 32px rgba(0,0,0,0.12)');

  return (
    <button
      onClick={() => navigate(`author/${author.username ?? author.id}`)}
      style={{
        position: 'absolute', border: 'none', cursor: 'pointer', padding: 0,
        borderRadius: 20, overflow: 'hidden', background: 'transparent',
        boxShadow: glow, outline: featured ? `1.5px solid rgba(139,92,246,0.5)` : 'none',
        transition: 'transform 0.25s, box-shadow 0.25s',
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = (style.transform ?? '') + ' scale(1.04)')}
      onMouseLeave={e => (e.currentTarget.style.transform = style.transform as string ?? '')}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Photo / bg */}
        {author.avatar_url ? (
          <img src={author.avatar_url} alt={author.full_name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: getCatGrad('Girişimcilik'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{initials}</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
        {/* Featured badge */}
        {featured && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: GRAD_PURPLE_PINK, color: '#fff', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 4 }}>
              Öne Çıkan Yazar
            </span>
          </div>
        )}
        {/* Info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.875rem', textAlign: 'left' }}>
          <div style={{ fontSize: featured ? '1rem' : '0.825rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '0.25rem' }}>
            {author.full_name ?? 'Yazar'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.4rem' }}>
            {author.title ?? ''}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.55)' }}>
              {author.total_articles} Yazı · {formatCount(author.total_reads)} Okuma
            </span>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ArrowRight size={10} color="#fff" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── Featured Author Chip ───────────────────────────── */
function AuthorChip({ author, navigate, isDark }: { author: AuthorSummary; navigate: (to: string) => void; isDark: boolean }) {
  const card = isDark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const ink = isDark ? '#fff' : '#111827';
  const ink2 = isDark ? '#A1A1AA' : '#6B7280';
  const initials = (author.full_name ?? 'Y').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <button
      onClick={() => navigate(`author/${author.username ?? author.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.875rem 1rem', background: card,
        border: `1px solid ${border}`, borderRadius: 14,
        cursor: 'pointer', textAlign: 'left', flexShrink: 0, minWidth: 200,
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.3)';
        e.currentTarget.style.boxShadow = isDark ? '0 8px 32px rgba(139,92,246,0.25)' : '0 8px 24px rgba(0,0,0,0.09)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#1a1a2e' }}>
        {author.avatar_url ? (
          <img src={author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: GRAD_PURPLE_PINK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>{initials}</span>
          </div>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>
          {author.full_name}
        </div>
        <div style={{ fontSize: '0.7rem', color: ink2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150, marginTop: 1 }}>
          {author.title ?? ''}
        </div>
        <div style={{ fontSize: '0.65rem', color: isDark ? '#52525B' : '#9CA3AF', marginTop: 2 }}>
          {author.total_articles} Yazı · {formatCount(author.total_reads)} Okuma
        </div>
      </div>
    </button>
  );
}

/* ─── Article Card ───────────────────────────────────── */
function ArticleCard({ article, navigate, isDark }: { article: Article; navigate: (to: string) => void; isDark: boolean }) {
  const catColor = getCategoryColor(article.category);
  const catGrad = getCatGrad(article.category ?? '');
  const card = isDark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const ink = isDark ? '#F4F4F5' : '#111827';
  const ink3 = isDark ? '#71717A' : '#9CA3AF';
  const initials = (article.authorName ?? 'Y').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <button
      onClick={() => navigate(`article/${article.id}`)}
      style={{
        background: card, border: `1px solid ${border}`, borderRadius: 16,
        padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'left',
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 12px 40px rgba(139,92,246,0.2)'
          : '0 12px 32px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = border;
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', flexShrink: 0, background: '#0B1020' }}>
        {article.ogImage ? (
          <img src={article.ogImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: catGrad, opacity: 0.5 }} />
        )}
        {/* Category badge */}
        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
          <span style={{
            display: 'inline-block', padding: '0.2rem 0.55rem',
            background: catColor.bg, color: catColor.text,
            fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
            borderRadius: 4,
          }}>
            {article.category}
          </span>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{
          margin: 0, fontSize: '0.95rem', fontWeight: 700, color: ink,
          letterSpacing: '-0.015em', lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#1a1a2e' }}>
            {article.authorAvatar ? (
              <img src={article.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: GRAD_PURPLE_PINK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#fff' }}>{initials}</span>
              </div>
            )}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 500, color: ink3, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {article.authorName ?? 'Yazar'}
          </span>
          <span style={{ fontSize: '0.68rem', color: ink3, flexShrink: 0 }}>{article.readingTime} dk</span>
          <BookmarkPlus size={13} style={{ color: ink3, flexShrink: 0 }} />
        </div>
      </div>
    </button>
  );
}

/* ─── Trend Topics Sidebar ────────────────────────────── */
function TrendTopicsSidebar({ categoryCounts, navigate, isDark }: {
  categoryCounts: Record<string, number>; navigate: (to: string) => void; isDark: boolean;
}) {
  const bg = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const ink = isDark ? '#F4F4F5' : '#111827';
  const ink2 = isDark ? '#A1A1AA' : '#6B7280';
  const rowHover = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';

  const sorted = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '1.25rem', position: 'sticky', top: 88 }}>
      <h3 style={{ margin: '0 0 1.125rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isDark ? PURPLE : '#6B7280' }}>
        Trend Konular
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {sorted.map(([cat, count]) => {
          const Icon = getCatIcon(cat);
          const grad = getCatGrad(cat);
          return (
            <button
              key={cat}
              onClick={() => navigate(`tag/${encodeURIComponent(cat)}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.625rem', borderRadius: 10, border: 'none',
                background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = rowHover)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: grad,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={15} color="#fff" />
              </div>
              <span style={{ flex: 1, fontSize: '0.825rem', fontWeight: 600, color: ink, textAlign: 'left' }}>{cat}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: GREEN }}>{count} Yazı</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => navigate('discover')}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
          width: '100%', marginTop: '1rem', padding: '0.6rem',
          background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.07)',
          border: `1px solid rgba(139,92,246,${isDark ? '0.2' : '0.15'})`,
          borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
          fontSize: '0.78rem', fontWeight: 600, color: PURPLE,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.12)')}
        onMouseLeave={e => (e.currentTarget.style.background = isDark ? 'rgba(139,92,246,0.1)' : 'rgba(139,92,246,0.07)')}
      >
        Tüm Konular <ArrowRight size={13} />
      </button>
    </div>
  );
}

/* ─── Category Card ──────────────────────────────────── */
function CategoryCard({ cat, count, navigate, isDark }: { cat: string; count: number; navigate: (to: string) => void; isDark: boolean }) {
  const Icon = getCatIcon(cat);
  const grad = getCatGrad(cat);
  return (
    <button
      onClick={() => navigate(`tag/${encodeURIComponent(cat)}`)}
      style={{
        background: grad, borderRadius: 16, border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '1.25rem', minHeight: 140, flexShrink: 0, minWidth: 150,
        position: 'relative', overflow: 'hidden', textAlign: 'left',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark ? '0 12px 40px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Icon size={28} color="rgba(255,255,255,0.9)" />
      </div>
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>{cat}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>{count} Yazı</span>
          <span style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowRight size={11} color="#fff" />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Series Interview Card ──────────────────────────── */
function InterviewCard({ series, navigate }: { series: Series; navigate: (to: string) => void }) {
  return (
    <button
      onClick={() => navigate(`series/${series.id}`)}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 18,
        border: 'none', cursor: 'pointer', aspectRatio: '16/10',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        background: '#0B1020', transition: 'transform 0.2s',
        width: '100%',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      {series.ogImage && (
        <img src={series.ogImage} alt={series.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }} />
      {/* Badge */}
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: 'rgba(139,92,246,0.9)', color: '#fff', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', borderRadius: 4 }}>
          SERİ
        </span>
      </div>
      {/* Play button */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          <Play size={18} color="#fff" fill="#fff" style={{ marginLeft: 2 }} />
        </div>
      </div>
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '1rem 1.125rem', textAlign: 'left' }}>
        <h3 style={{
          margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: '#fff',
          letterSpacing: '-0.02em', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {series.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
            {series.articleCount} bölüm
          </span>
          {series.authorName && (
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>· {series.authorName}</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Newsletter (inline) ────────────────────────────── */
function InlineNewsletter({ isDark }: { isDark: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'dup'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
    setStatus(!error ? 'success' : error.code === '23505' ? 'dup' : 'error');
    if (!error) setEmail('');
  };

  const bg = isDark ? 'rgba(255,255,255,0.04)' : '#fff';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const ink = isDark ? '#F4F4F5' : '#111827';
  const ink2 = isDark ? '#A1A1AA' : '#6B7280';

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '1.5rem' }}>
      <h3 style={{ margin: '0 0 0.375rem', fontSize: '1rem', fontWeight: 800, color: ink }}>Yeniliklerden haberdar ol!</h3>
      <p style={{ margin: '0 0 1rem', fontSize: '0.825rem', color: ink2, lineHeight: 1.6 }}>
        Yeni yazılar ve röportajlar e-postanıza gelsin.
      </p>
      {status === 'success' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: GREEN, fontWeight: 600, fontSize: '0.825rem' }}>
          <Check size={14} /> Abone oldunuz!
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="email" placeholder="E-posta adresinizi girin" value={email}
            onChange={e => setEmail(e.target.value)} required disabled={status === 'loading'}
            style={{
              flex: 1, minWidth: 0, height: 40, padding: '0 0.75rem',
              background: isDark ? 'rgba(255,255,255,0.06)' : '#F9F9F9',
              border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}`,
              borderRadius: 8, fontSize: '0.8rem', fontFamily: 'inherit',
              color: ink, outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = PURPLE)}
            onBlur={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB')}
          />
          <button
            type="submit" disabled={status === 'loading' || !email.trim()}
            style={{
              width: 40, height: 40, borderRadius: 8, border: 'none',
              background: GRAD_PURPLE_PINK, cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: status === 'loading' || !email.trim() ? 0.5 : 1,
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          >
            <ArrowRight size={16} color="#fff" />
          </button>
        </form>
      )}
      {status === 'dup' && <p style={{ margin: '0.375rem 0 0', fontSize: '0.72rem', color: '#F59E0B' }}>Bu e-posta zaten kayıtlı.</p>}
      {status === 'error' && <p style={{ margin: '0.375rem 0 0', fontSize: '0.72rem', color: '#EF4444' }}>Bir hata oluştu.</p>}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function ModernHomePage({ navigate, articles, seriesList, settings }: ModernHomePageProps) {
  const { authors } = useAuthors();
  const isDark = useDarkTheme();
  const authorsRef = useRef<HTMLDivElement>(null);

  const siteTitle = settings['site_title'] ?? 'Site';
  const heroLabel = settings['hero_label'] ?? 'Deneyimler Konuşur';
  const heroTagline = settings['hero_tagline'] ?? 'Gerçek ilham.';
  const heroSubtitle = settings['hero_subtitle'] ?? 'İş dünyası, girişimcilik, e-ticaret, teknoloji ve hayat üzerine gerçek hikayeler. Birinci ağızdan.';

  const bg = isDark ? '#030712' : '#F8F7F4';
  const bgAlt = isDark ? '#050B15' : '#FFFFFF';
  const ink = isDark ? '#FFFFFF' : '#111827';
  const ink2 = isDark ? '#A1A1AA' : '#52525B';
  const ink3 = isDark ? '#52525B' : '#9CA3AF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

  const heroAuthors = authors.slice(0, 3);
  const featuredAuthors = authors.slice(0, 6);
  const trendArticles = articles.slice(0, 4);
  const displaySeries = seriesList.filter(s => s.ogImage).slice(0, 3).length > 0
    ? seriesList.filter(s => s.ogImage).slice(0, 3)
    : seriesList.slice(0, 3);

  const categoryCounts: Record<string, number> = {};
  for (const a of articles) {
    if (a.category) categoryCounts[a.category] = (categoryCounts[a.category] ?? 0) + 1;
  }
  const activeCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k);

  return (
    <div style={{ background: bg, minHeight: '100vh', color: ink }}>

      {/* ─── HERO ──────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(6rem, 10vw, 8rem) 2rem clamp(3rem, 6vw, 5rem)' }}>
        {/* Background glow */}
        {isDark && (
          <>
            <div style={{ position: 'absolute', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -100, right: 0, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(236,72,153,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
          </>
        )}
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', minHeight: 480 }}>

          {/* Left */}
          <div style={{ zIndex: 1 }}>
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.375rem' }}>
              <div style={{ width: 24, height: 2, background: GRAD_PURPLE_PINK, borderRadius: 2 }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: PURPLE }}>
                {heroLabel}
              </span>
            </div>

            {/* Heading — white lines */}
            <p style={{ margin: '0 0 0.5rem', fontSize: 'clamp(1rem, 2vw, 1.35rem)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3, color: ink }}>
              Gerçek deneyimler. Gerçek insanlar.
            </p>

            {/* Heading — animated gradient tagline */}
            <h1 style={{ margin: '0 0 1.375rem', fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
              <span style={{
                background: 'linear-gradient(90deg, #8B5CF6, #C084FC, #F97316, #C084FC, #8B5CF6)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: settings['hero_gradient_animate'] === 'false' ? 'none' : 'heroGradientFlow 4s linear infinite',
                backgroundPosition: settings['hero_gradient_animate'] === 'false' ? '0% 50%' : undefined,
                display: 'inline',
              }}>
                {heroTagline}
              </span>
            </h1>

            {/* Description */}
            <p style={{ margin: '0 0 2rem', fontSize: '1rem', color: ink2, lineHeight: 1.75, maxWidth: 480 }}>
              {heroSubtitle}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button
                onClick={() => navigate('discover')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem', background: GRAD_PURPLE_PINK, color: '#fff',
                  border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
                  transition: 'filter 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                Keşfetmeye Başla <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('discover')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.375rem', color: isDark ? '#fff' : '#374151',
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 12, fontSize: '0.9rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
                }}
              >
                <Users size={16} /> Yazarları Keşfet
              </button>
            </div>

            {/* Social proof */}
            {authors.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex' }}>
                  {authors.slice(0, 4).map((a, i) => (
                    <div key={a.id} style={{
                      width: 30, height: 30, borderRadius: '50%', overflow: 'hidden',
                      marginLeft: i > 0 ? -8 : 0, border: `2px solid ${bg}`,
                      background: '#1a1a2e', flexShrink: 0,
                    }}>
                      {a.avatar_url ? (
                        <img src={a.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: GRAD_PURPLE_PINK }} />
                      )}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.78rem', color: ink2 }}>
                  {formatCount(authors.length * 1000 > 10000 ? authors.length * 1000 : 10000)}+ okur topluluğumuzla büyüyoruz.
                </span>
              </div>
            )}
          </div>

          {/* Right: Author cards */}
          <div style={{ position: 'relative', height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Glow behind cards */}
            {isDark && (
              <div style={{ position: 'absolute', top: '20%', left: '20%', right: '20%', height: '60%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(20px)' }} />
            )}

            {heroAuthors.length > 0 && (
              <>
                {heroAuthors[1] && (
                  <HeroAuthorCard author={heroAuthors[1]} navigate={navigate} isDark={isDark}
                    style={{ width: 170, height: 240, top: '15%', left: '0%', transform: 'rotate(-6deg)', zIndex: 1 }} />
                )}
                {heroAuthors[0] && (
                  <HeroAuthorCard author={heroAuthors[0]} navigate={navigate} isDark={isDark} featured
                    style={{ width: 210, height: 300, top: '5%', left: '50%', transform: 'translateX(-50%)', zIndex: 3 }} />
                )}
                {heroAuthors[2] && (
                  <HeroAuthorCard author={heroAuthors[2]} navigate={navigate} isDark={isDark}
                    style={{ width: 170, height: 240, top: '15%', right: '0%', transform: 'rotate(5deg)', zIndex: 2 }} />
                )}
              </>
            )}

            {/* "See all" CTA */}
            <button
              onClick={() => navigate('discover')}
              style={{
                position: 'absolute', bottom: 0, right: '10%', zIndex: 4,
                width: 40, height: 40, borderRadius: '50%',
                background: GRAD_PURPLE_PINK, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
                transition: 'transform 0.15s',
              }}
              title="Tüm yazarları gör"
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
            >
              <ArrowRight size={17} color="#fff" />
            </button>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* ─── ÖNE ÇIKAN YAZARLAR ──────────────────────── */}
        {featuredAuthors.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <SectionHead
              title="Öne Çıkan Yazarlar" linkLabel="Tüm Yazarlar" onLink={() => navigate('discover')}
              isDark={isDark}
              icon={<Star size={16} color={AMBER} fill={AMBER} />}
            />
            <div style={{ position: 'relative' }}>
              <div ref={authorsRef} style={{ display: 'flex', gap: '0.875rem', overflowX: 'auto', paddingBottom: '0.375rem', scrollbarWidth: 'none' }}>
                {featuredAuthors.map(a => <AuthorChip key={a.id} author={a} navigate={navigate} isDark={isDark} />)}
              </div>
              <button
                onClick={() => authorsRef.current?.scrollBy({ left: 260, behavior: 'smooth' })}
                style={{
                  position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
                  width: 34, height: 34, borderRadius: '50%',
                  background: isDark ? '#0B1020' : '#fff', border: `1px solid ${cardBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.08)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(139,92,246,0.5)' : '#999')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = cardBorder)}
              >
                <ChevronRight size={16} color={isDark ? '#A1A1AA' : '#6B7280'} />
              </button>
            </div>
          </section>
        )}

        {/* ─── POPÜLER YAZILAR + TREND KONULAR ─────────── */}
        {trendArticles.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
              {/* Articles */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <SectionHead
                  title="Popüler Yazılar" linkLabel="Tüm Yazılar" onLink={() => navigate('contents')}
                  isDark={isDark}
                  icon={<Star size={16} color={ORANGE} fill={ORANGE} />}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {trendArticles.map(a => <ArticleCard key={a.id} article={a} navigate={navigate} isDark={isDark} />)}
                </div>
              </div>
              {/* Sidebar */}
              <div style={{ width: 280, flexShrink: 0 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: isDark ? PURPLE : '#6B7280' }}>
                    &nbsp;
                  </span>
                </div>
                <TrendTopicsSidebar categoryCounts={categoryCounts} navigate={navigate} isDark={isDark} />
              </div>
            </div>
          </section>
        )}

        {/* ─── KEŞFET / KATEGORİLER ────────────────────── */}
        {activeCategories.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <SectionHead title="Keşfet" linkLabel="Tüm Konular" onLink={() => navigate('discover')} isDark={isDark} />
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.375rem', scrollbarWidth: 'none' }}>
              {activeCategories.slice(0, 8).map(cat => (
                <CategoryCard key={cat} cat={cat} count={categoryCounts[cat]} navigate={navigate} isDark={isDark} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── YAZAR OL CTA BAND ─────────────────────────── */}
      <section style={{ padding: '0 2rem', marginBottom: '4rem' }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          background: isDark
            ? 'linear-gradient(135deg, #0D0B20 0%, #130B2A 35%, #0A0D1E 100%)'
            : 'linear-gradient(135deg, #F5F3FF 0%, #FDF4FF 50%, #EEF2FF 100%)',
          borderRadius: 24, padding: '3rem 3rem 3rem',
          border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {isDark && (
            <div style={{ position: 'absolute', top: -80, right: 200, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          )}
          <div style={{ zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.8rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 100, marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: PURPLE }}>
                Yazar Ol
              </span>
            </div>
            <h2 style={{
              margin: '0 0 0.875rem', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1,
              color: ink,
            }}>
              Sen de hikayeni binlerce<br />kişiye ulaştır.
            </h2>
            <p style={{ margin: '0 0 1.75rem', fontSize: '0.95rem', color: ink2, maxWidth: 420, lineHeight: 1.7 }}>
              Deneyimlerini paylaş, topluluğumuza ilham ver.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('register')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem', background: GRAD_PURPLE_PINK,
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
                  transition: 'filter 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                Hemen Başla <ArrowRight size={16} />
              </button>
              {authors.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ display: 'flex' }}>
                    {authors.slice(0, 3).map((a, i) => (
                      <div key={a.id} style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', marginLeft: i > 0 ? -8 : 0, border: `2px solid ${isDark ? '#0D0B20' : '#F5F3FF'}`, background: '#1a1a2e', flexShrink: 0 }}>
                        {a.avatar_url ? <img src={a.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: GRAD_PURPLE_PINK }} />}
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: ink2 }}>+{authors.length * 40}+ yazar bize katıldı</span>
                </div>
              )}
            </div>
          </div>
          {/* Illustration */}
          <div style={{ flexShrink: 0, zIndex: 1, opacity: 0.7 }}>
            <svg width="120" height="140" viewBox="0 0 120 140" fill="none">
              <path d="M60 10 L80 40 L110 50 L85 75 L90 110 L60 95 L30 110 L35 75 L10 50 L40 40 Z" stroke={PURPLE} strokeWidth="1.5" fill="none" opacity="0.5" />
              <path d="M60 25 L72 45 L95 52 L78 68 L82 92 L60 80 L38 92 L42 68 L25 52 L48 45 Z" stroke={PINK} strokeWidth="1" fill="rgba(139,92,246,0.05)" opacity="0.8" />
              <circle cx="60" cy="60" r="8" fill={PURPLE} opacity="0.4" />
              <line x1="60" y1="10" x2="60" y2="0" stroke={PURPLE} strokeWidth="2" opacity="0.6" />
              <line x1="60" y1="110" x2="60" y2="140" stroke={PINK} strokeWidth="1.5" opacity="0.5" />
              <path d="M20 20 Q35 10 50 20" stroke={PURPLE} strokeWidth="1" fill="none" opacity="0.4" />
              <path d="M70 115 Q85 130 100 120" stroke={PINK} strokeWidth="1" fill="none" opacity="0.4" />
            </svg>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* ─── SERİLER / RÖPORTAJLAR ───────────────────── */}
        {displaySeries.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <SectionHead
              title="Seriler" linkLabel="Tüm Seriler" onLink={() => navigate('series')}
              isDark={isDark}
              icon={<Play size={16} color={PINK} fill={PINK} />}
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {displaySeries.map(s => <InterviewCard key={s.id} series={s} navigate={navigate} />)}
            </div>
          </section>
        )}

        {/* ─── FOOTER NEWSLETTER (if no series) ────────── */}
        {displaySeries.length === 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <InlineNewsletter isDark={isDark} />
          </section>
        )}

      </div>
    </div>
  );
}
