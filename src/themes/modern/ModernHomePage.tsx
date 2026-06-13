import { useState, useRef } from 'react';
import {
  ArrowRight, ChevronRight, ShoppingCart, Rocket, Code2, Brain,
  Megaphone, User, Cpu, Star, BookmarkPlus, Check, Mail,
  TrendingUp, Trophy,
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

const ORANGE = '#F97316';

const TOPIC_CONFIG: { key: string; color: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { key: 'E-Ticaret',         color: '#F97316', icon: ShoppingCart },
  { key: 'Girişimcilik',      color: '#8B5CF6', icon: Rocket },
  { key: 'Yazılım',           color: '#3B82F6', icon: Code2 },
  { key: 'Yapay Zekâ',        color: '#10B981', icon: Brain },
  { key: 'Pazarlama',         color: '#F59E0B', icon: Megaphone },
  { key: 'Kariyer',           color: '#EF4444', icon: User },
  { key: 'Teknoloji',         color: '#22C55E', icon: Cpu },
  { key: 'Liderlik',          color: '#EC4899', icon: Star },
  { key: 'Marka ve Strateji', color: '#14B8A6', icon: TrendingUp },
  { key: 'Kişisel Notlar',    color: '#6366F1', icon: Trophy },
  { key: 'Ticaret',           color: '#F97316', icon: ShoppingCart },
];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}B`;
  return String(n);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ─── Section Header ─────────────────────────────────── */
function SectionHead({ title, linkLabel, onLink }: { title: string; linkLabel: string; onLink: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', letterSpacing: '-0.025em', margin: 0 }}>{title}</h2>
      <button
        onClick={onLink}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.8rem', fontWeight: 600, color: '#777',
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#111')}
        onMouseLeave={e => (e.currentTarget.style.color = '#777')}
      >
        {linkLabel} <ArrowRight size={14} />
      </button>
    </div>
  );
}

/* ─── Hero Author Card ───────────────────────────────── */
function HeroAuthorCard({
  author,
  style,
  navigate,
}: {
  author: AuthorSummary;
  style: React.CSSProperties;
  navigate: (to: string) => void;
}) {
  const initials = (author.full_name ?? 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <button
      onClick={() => navigate(`author/${author.username ?? author.id}`)}
      style={{
        position: 'absolute',
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 0.2s',
        ...style,
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = (style.transform ?? '') + ' scale(1.03)')}
      onMouseLeave={e => (e.currentTarget.style.transform = style.transform as string ?? '')}
    >
      {/* Author photo */}
      <div style={{ width: '100%', aspectRatio: '3/2', overflow: 'hidden', background: '#f0ede8', flexShrink: 0 }}>
        {author.avatar_url ? (
          <img src={author.avatar_url} alt={author.full_name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#f97316,#fb923c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{initials}</span>
          </div>
        )}
      </div>
      {/* Info */}
      <div style={{ padding: '0.75rem 0.875rem 0.875rem' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {author.full_name ?? 'Yazar'}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {author.title ?? 'Yazar'}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#aaa', fontWeight: 500 }}>
          {author.total_articles} Yazı · {formatCount(author.total_reads)} Okuma
        </div>
      </div>
    </button>
  );
}

/* ─── Featured Author Chip ───────────────────────────── */
function AuthorChip({ author, navigate }: { author: AuthorSummary; navigate: (to: string) => void }) {
  const initials = (author.full_name ?? 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <button
      onClick={() => navigate(`author/${author.username ?? author.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.875rem 1.125rem',
        background: '#fff', border: '1px solid #F0EDE8', borderRadius: 14,
        cursor: 'pointer', textAlign: 'left', flexShrink: 0, minWidth: 200,
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#f0ede8' }}>
        {author.avatar_url ? (
          <img src={author.avatar_url} alt={author.full_name ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{initials}</span>
          </div>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
          {author.full_name ?? 'Yazar'}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
          {author.title ?? ''}
        </div>
        <div style={{ fontSize: '0.68rem', color: '#bbb', marginTop: '0.2rem' }}>
          {author.total_articles} Yazı · {formatCount(author.total_reads)} Okuma
        </div>
      </div>
    </button>
  );
}

/* ─── Trend Article Card ─────────────────────────────── */
function TrendCard({ article, navigate }: { article: Article; navigate: (to: string) => void }) {
  const catColor = getCategoryColor(article.category);
  const initials = (article.authorName ?? 'Y').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <button
      onClick={() => navigate(`article/${article.id}`)}
      style={{
        background: '#fff', border: 'none', borderRadius: 14,
        cursor: 'pointer', textAlign: 'left', padding: 0, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#f0ede8', flexShrink: 0 }}>
        {article.ogImage ? (
          <img src={article.ogImage} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${catColor.bg}33, ${catColor.bg}66)` }} />
        )}
        {/* Category badge overlay */}
        <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
          <span style={{
            display: 'inline-block', padding: '0.2rem 0.6rem',
            background: catColor.bg, color: catColor.text,
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
            borderRadius: 4,
          }}>
            {article.category}
          </span>
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{
          fontSize: '0.95rem', fontWeight: 800, color: '#111',
          letterSpacing: '-0.015em', lineHeight: 1.35, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </h3>
        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#f0ede8' }}>
            {article.authorAvatar ? (
              <img src={article.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#fff' }}>{initials}</span>
              </div>
            )}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#555', flex: 1 }}>{article.authorName ?? 'Yazar'}</span>
          <span style={{ fontSize: '0.7rem', color: '#aaa' }}>{article.readingTime} dk okuma</span>
          <BookmarkPlus size={14} style={{ color: '#ccc', flexShrink: 0 }} />
        </div>
      </div>
    </button>
  );
}

/* ─── Topic Tile ─────────────────────────────────────── */
function TopicTile({ config, count, onClick }: {
  config: typeof TOPIC_CONFIG[number];
  count: number;
  onClick: () => void;
}) {
  const Icon = config.icon;
  return (
    <button
      onClick={onClick}
      style={{
        background: config.color, borderRadius: 14, border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.5rem', padding: '1.25rem 1rem', flexShrink: 0, minWidth: 120,
        transition: 'filter 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <Icon size={24} color="#fff" />
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{config.key}</span>
      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)' }}>{count} Yazı</span>
    </button>
  );
}

/* ─── Series Card (röportaj/interview style) ─────────── */
function SeriesInterviewCard({ series, navigate }: { series: Series; navigate: (to: string) => void }) {
  return (
    <button
      onClick={() => navigate(`series/${series.id}`)}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 16,
        border: 'none', cursor: 'pointer', aspectRatio: '16/10',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        background: '#1a1a1a', transition: 'transform 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      {series.ogImage && (
        <img
          src={series.ogImage}
          alt={series.title}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
        />
      )}
      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)' }} />
      {/* Badge */}
      <div style={{ position: 'absolute', top: 12, left: 12 }}>
        <span style={{
          display: 'inline-block', padding: '0.2rem 0.6rem',
          background: ORANGE, color: '#fff',
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          borderRadius: 4,
        }}>
          SERİ
        </span>
      </div>
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '1rem 1.125rem 1.125rem', textAlign: 'left' }}>
        <h3 style={{
          fontSize: '1rem', fontWeight: 800, color: '#fff',
          letterSpacing: '-0.02em', lineHeight: 1.3, margin: '0 0 0.5rem',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {series.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            {series.articleCount} bölüm
          </span>
          {series.authorName && (
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>· {series.authorName}</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Newsletter CTA ─────────────────────────────────── */
function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase() });
    if (error) {
      setStatus(error.code === '23505' ? 'duplicate' : 'error');
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <section style={{ background: '#FEF7EE', borderRadius: 24, margin: '0 0 4rem', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr', gap: '2rem', alignItems: 'center' }}>
        {/* Illustration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(249,115,22,0.15)' }}>
            <Mail size={40} color={ORANGE} />
          </div>
        </div>
        {/* Text */}
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.2, margin: '0 0 0.75rem' }}>
            Topluluğumuza katıl,<br />ilhamı kaçırma.
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#888', lineHeight: 1.65, margin: 0 }}>
            Yeni yazılar, röportajlar ve özel içerikler e-posta kutuna gelsin.
          </p>
        </div>
        {/* Form */}
        <div>
          {status === 'success' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
              <Check size={16} /> Harika! Bülten listemize eklendiniz.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                style={{
                  flex: 1, minWidth: 180, height: 46,
                  padding: '0 1rem', borderRadius: 10,
                  border: '1.5px solid #e8e5df', background: '#fff',
                  fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = ORANGE)}
                onBlur={e => (e.currentTarget.style.borderColor = '#e8e5df')}
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                style={{
                  height: 46, padding: '0 1.25rem',
                  background: ORANGE, color: '#fff',
                  border: 'none', borderRadius: 10,
                  fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', whiteSpace: 'nowrap',
                  transition: 'filter 0.15s',
                  opacity: status === 'loading' || !email.trim() ? 0.6 : 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                Abone Ol
              </button>
              {status === 'duplicate' && (
                <span style={{ width: '100%', fontSize: '0.78rem', color: '#999', marginTop: 4 }}>Bu e-posta zaten kayıtlı.</span>
              )}
              {status === 'error' && (
                <span style={{ width: '100%', fontSize: '0.78rem', color: '#ef4444', marginTop: 4 }}>Bir hata oluştu, tekrar deneyin.</span>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function ModernHomePage({ navigate, articles, seriesList, settings }: ModernHomePageProps) {
  const { authors } = useAuthors();
  const authorsRef = useRef<HTMLDivElement>(null);

  const siteTitle = settings['site_title'] ?? 'WeTalks';
  const heroTitle = settings['hero_title'] ?? 'Deneyimler konuşur,\nilham bırakır.';
  const heroSubtitle = settings['hero_subtitle'] ?? 'İş dünyası, girişimcilik, teknoloji ve hayat üzerine gerçek hikayeler. Birinci ağızdan.';

  const featuredAuthors = authors.slice(0, 6);
  const trendArticles = articles.slice(0, 8);

  const categoryCounts: Record<string, number> = {};
  for (const a of articles) {
    if (a.category) categoryCounts[a.category] = (categoryCounts[a.category] ?? 0) + 1;
  }
  const activeTopics = TOPIC_CONFIG.filter(t => (categoryCounts[t.key] ?? 0) > 0);

  const featuredSeries = seriesList.filter(s => s.ogImage).slice(0, 3);
  const fallbackSeries = seriesList.slice(0, 3);
  const displaySeries = featuredSeries.length > 0 ? featuredSeries : fallbackSeries;

  const scrollAuthors = (dir: 1 | -1) => {
    if (authorsRef.current) authorsRef.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
  };

  return (
    <div style={{ background: '#FAFAF6', minHeight: '100vh' }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{ background: '#FAFAF6', padding: '4rem 2rem 3rem', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', minHeight: 460 }}>

          {/* Left: text */}
          <div style={{ zIndex: 1 }}>
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 28, height: 2, background: ORANGE, borderRadius: 2 }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ORANGE }}>
                {settings['hero_label'] ?? 'Gerçek Deneyimler, Gerçek İnsanlar'}
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              fontWeight: 900, letterSpacing: '-0.04em',
              lineHeight: 1.08, color: '#111', margin: '0 0 1.25rem',
              whiteSpace: 'pre-line',
            }}>
              {heroTitle.replace(/\.$/, '')}<span style={{ color: ORANGE }}>.</span>
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: '1rem', color: '#777', lineHeight: 1.75, maxWidth: 440, margin: '0 0 2rem' }}>
              {heroSubtitle}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('discover')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.75rem 1.5rem',
                  background: ORANGE, color: '#fff',
                  border: 'none', borderRadius: 100,
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'filter 0.15s',
                  boxShadow: '0 4px 16px rgba(249,115,22,0.35)',
                }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                Keşfetmeye Başla <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('discover')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.75rem 1.5rem',
                  background: 'transparent', color: '#333',
                  border: '1.5px solid #ddd', borderRadius: 100,
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#111'; e.currentTarget.style.color = '#111'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd'; e.currentTarget.style.color = '#333'; }}
              >
                Yazarları Keşfet
              </button>
            </div>
          </div>

          {/* Right: author cards */}
          <div style={{ position: 'relative', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Background blobs */}
            <div style={{ position: 'absolute', top: '10%', right: '5%', width: 200, height: 200, borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%', background: 'rgba(253,186,116,0.35)', filter: 'blur(2px)' }} />
            <div style={{ position: 'absolute', top: '30%', left: '5%', width: 160, height: 160, borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%', background: 'rgba(167,139,250,0.25)', filter: 'blur(2px)' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(147,197,253,0.3)', filter: 'blur(2px)' }} />

            {/* Author cards */}
            {authors.length > 0 && (
              <>
                {/* Left card */}
                {authors[1] && (
                  <HeroAuthorCard
                    author={authors[1]}
                    navigate={navigate}
                    style={{ width: 155, top: '10%', left: '2%', transform: 'rotate(-6deg)', zIndex: 1 }}
                  />
                )}
                {/* Center card (featured) */}
                {authors[0] && (
                  <HeroAuthorCard
                    author={authors[0]}
                    navigate={navigate}
                    style={{ width: 185, top: '0%', left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}
                  />
                )}
                {/* Right card */}
                {authors[2] && (
                  <HeroAuthorCard
                    author={authors[2]}
                    navigate={navigate}
                    style={{ width: 155, top: '10%', right: '2%', transform: 'rotate(5deg)', zIndex: 2 }}
                  />
                )}
              </>
            )}

            {/* "Tüm yazarları gör" link */}
            <button
              onClick={() => navigate('discover')}
              style={{
                position: 'absolute', bottom: 0, right: '10%',
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                background: ORANGE, color: '#fff',
                border: 'none', borderRadius: '50%',
                width: 40, height: 40, cursor: 'pointer',
                flexShrink: 0, transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
              title="Tüm yazarları gör"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>

        {/* ── ÖNE ÇIKAN YAZARLAR ─────────────────────────── */}
        {featuredAuthors.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <SectionHead title="Öne Çıkan Yazarlar" linkLabel="Tümünü Göster" onLink={() => navigate('discover')} />
            <div style={{ position: 'relative' }}>
              <div
                ref={authorsRef}
                style={{ display: 'flex', gap: '0.875rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}
              >
                {featuredAuthors.map(author => (
                  <AuthorChip key={author.id} author={author} navigate={navigate} />
                ))}
              </div>
              {/* Scroll arrow */}
              <button
                onClick={() => scrollAuthors(1)}
                style={{
                  position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#fff', border: '1.5px solid #e8e5df',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#bbb')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e5df')}
              >
                <ChevronRight size={16} color="#555" />
              </button>
            </div>
          </section>
        )}

        {/* ── TREND YAZILAR ──────────────────────────────── */}
        {trendArticles.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <SectionHead title="Trend Yazılar" linkLabel="Tüm Yazıları Gör" onLink={() => navigate('contents')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.125rem' }}>
              {trendArticles.slice(0, 4).map(article => (
                <TrendCard key={article.id} article={article} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* ── POPÜLER KONULAR ─────────────────────────────── */}
        {activeTopics.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <SectionHead title="Popüler Konular" linkLabel="Tüm Konuları Gör" onLink={() => navigate('discover')} />
            <div style={{ display: 'flex', gap: '0.875rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none', alignItems: 'stretch' }}>
              {activeTopics.map(topic => (
                <TopicTile
                  key={topic.key}
                  config={topic}
                  count={categoryCounts[topic.key] ?? 0}
                  onClick={() => navigate(`tag/${encodeURIComponent(topic.key)}`)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── SON SERİLER ─────────────────────────────────── */}
        {displaySeries.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <SectionHead title="Son Seriler" linkLabel="Tüm Serileri Gör" onLink={() => navigate('series')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {displaySeries.map(s => (
                <SeriesInterviewCard key={s.id} series={s} navigate={navigate} />
              ))}
            </div>
          </section>
        )}

        {/* ── NEWSLETTER CTA ──────────────────────────────── */}
        <NewsletterCTA />

      </div>
    </div>
  );
}
