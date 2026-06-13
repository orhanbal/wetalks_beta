import { useEffect, useState } from 'react';
import { Twitter, Instagram, Linkedin, Globe, ArrowLeft, PenLine, Eye, BookOpen, FileText, Mail, Check, UserPlus, UserCheck, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { useAuth } from '../hooks/useAuth';
import { useFollow } from '../hooks/useFollow';
import ArticleCard, { type ArticleBreadcrumb } from '../components/ArticleCard';
import type { Article } from '../data/articles';
import type { Series, SeriesOutlineNode } from '../data/series';

function searchNode(
  articleId: string,
  node: SeriesOutlineNode,
  seriesTitle: string,
  chapterTitle: string,
  parentTitle?: string,
): ArticleBreadcrumb | undefined {
  const ids = node.article_ids?.length ? node.article_ids : node.article_id ? [node.article_id] : [];
  if (ids.includes(articleId)) {
    return { seriesTitle, chapterTitle, parentTitle, childTitle: node.title };
  }
  for (const child of node.children ?? []) {
    const crumb = searchNode(articleId, child, seriesTitle, chapterTitle, node.title);
    if (crumb) return crumb;
  }
}

function findBreadcrumb(articleId: string, seriesList: Series[]): ArticleBreadcrumb | undefined {
  for (const s of seriesList) {
    if (!s.outline) continue;
    for (const chapter of s.outline) {
      const crumb = searchNode(articleId, chapter, s.title, chapter.title);
      if (crumb) return crumb;
    }
  }
}
import {
  resolveAuthorBadge,
  getNextArticleMilestone,
  formatCount,
} from '../lib/writerBadges';

interface AuthorProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  title: string | null;
  bio: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  website: string | null;
  custom_badge: string | null;
}

interface WriterStats {
  total_articles: number;
  published_articles: number;
  total_reads: number;
}

interface AuthorPageProps {
  id: string;
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

const ROLE_LABELS: Record<string, string> = {
  author: 'Yazar',
  editor: 'Editör',
  admin: 'Admin',
};

function BadgeChip({ label, color, bg, border, icon }: {
  label: string; color: string; bg: string; border: string; icon?: React.ReactNode;
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.65rem',
      background: bg, border: `1.5px solid ${border}`,
      borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700,
      color, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {icon}
      {label}
    </span>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: '100%', height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', background: color,
        borderRadius: 99, transition: 'width 0.7s ease',
      }} />
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      flex: '1 1 120px', background: '#fff',
      border: '1px solid #e5e7eb', borderRadius: 12,
      padding: '1rem 1.25rem',
      display: 'flex', flexDirection: 'column', gap: '0.375rem',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color }}>
        {icon}
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      </span>
      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</span>
    </div>
  );
}

function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
    if (error) {
      setStatus(error.code === '23505' ? 'duplicate' : 'error');
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  if (status === 'success') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.875rem 1.25rem', background: '#f0fdf4',
        border: '1px solid #bbf7d0', borderRadius: 12,
        marginBottom: '1.75rem', fontSize: '0.875rem', color: '#166534', fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
      }}>
        <Check size={16} /> Abone oldunuz! Yeni yazılardan haberdar edileceksiniz.
      </div>
    );
  }

  return (
    <div style={{
      padding: '1rem 1.25rem', background: '#111',
      borderRadius: 12, marginBottom: '1.75rem',
      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
        <Mail size={16} color="#c8f542" />
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', fontFamily: 'Inter, sans-serif' }}>
          Bültene abone ol
        </span>
      </div>
      <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', flex: '1 1 auto', minWidth: 160 }}>
        Yeni yazılar e-postanıza gelsin.
      </span>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 240px' }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          required
          style={{
            flex: 1, padding: '0.5rem 0.875rem',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, color: '#fff', fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif', outline: 'none',
            minWidth: 0,
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(255,255,255,0.4)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '0.5rem 1rem', background: 'var(--accent, #c8f542)',
            color: '#111', border: 'none', borderRadius: 8,
            fontSize: '0.8125rem', fontWeight: 700,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', flexShrink: 0,
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {status === 'loading' ? 'Gönderiliyor...' : 'Abone Ol'}
        </button>
      </form>
      {status === 'duplicate' && (
        <p style={{ width: '100%', margin: 0, fontSize: '0.75rem', color: '#fca5a5', fontFamily: 'Inter, sans-serif' }}>
          Bu e-posta zaten kayıtlı.
        </p>
      )}
      {status === 'error' && (
        <p style={{ width: '100%', margin: 0, fontSize: '0.75rem', color: '#fca5a5', fontFamily: 'Inter, sans-serif' }}>
          Bir hata oluştu. Lütfen tekrar deneyin.
        </p>
      )}
    </div>
  );
}

export default function AuthorPage({ id, navigate, articles, seriesList }: AuthorPageProps) {
  const { user } = useAuth();
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [resolvedId, setResolvedId] = useState<string>(id);
  const [stats, setStats] = useState<WriterStats>({ total_articles: 0, published_articles: 0, total_reads: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'series'>('articles');
  const [badgeExpanded, setBadgeExpanded] = useState(false);

  const { isFollowing, followerCount, toggling, toggle } = useFollow(user?.id, resolvedId);

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  useEffect(() => {
    (async () => {
      const profileQuery = supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, role, title, bio, twitter, instagram, linkedin, website, custom_badge');

      const profileRes = await (isUUID
        ? profileQuery.eq('id', id).maybeSingle()
        : profileQuery.ilike('username', id).maybeSingle());

      const rid = profileRes.data?.id ?? id;
      setResolvedId(rid);
      setAuthor(profileRes.data ?? null);

      // Redirect UUID-based URLs to @username when username is available
      if (profileRes.data?.username && !window.location.pathname.startsWith('/@')) {
        window.history.replaceState(null, '', `/@${profileRes.data.username}`);
      }

      const statsRes = await supabase
        .from('writer_stats')
        .select('total_articles, published_articles, total_reads')
        .eq('author_id', rid)
        .maybeSingle();

      if (statsRes.data) {
        setStats({
          total_articles: Number(statsRes.data.total_articles) || 0,
          published_articles: Number(statsRes.data.published_articles) || 0,
          total_reads: Number(statsRes.data.total_reads) || 0,
        });
      }

      setLoading(false);
    })();
  }, [id]);

  useSEO({
    title: author?.full_name ?? 'Yazar',
    description: author?.bio ?? '',
    canonical: author?.username
      ? `https://wetalks.tr/@${author.username}`
      : `https://wetalks.tr/author/${resolvedId}`,
  });

  const authorArticles = articles.filter(a => a.authorId === resolvedId);
  // Include series where author is either lead or co-author
  const [coAuthoredSeriesIds, setCoAuthoredSeriesIds] = useState<string[]>([]);

  useEffect(() => {
    if (!resolvedId) return;
    supabase.from('series_authors').select('series_id').eq('author_id', resolvedId)
      .then(({ data }) => {
        setCoAuthoredSeriesIds((data ?? []).map((r: { series_id: string }) => r.series_id));
      });
  }, [resolvedId]);

  const authorSeries = seriesList.filter(s =>
    s.authorId === resolvedId || coAuthoredSeriesIds.includes(s.id)
  );

  const initials = author?.full_name
    ? author.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const socialLink = (raw: string | null | undefined) => {
    if (!raw) return null;
    return raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.9rem' }}>
        Yükleniyor...
      </div>
    );
  }

  if (!author) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <p style={{ color: '#888' }}>Yazar bulunamadı.</p>
        <button onClick={() => navigate('contents')} style={{ background: 'none', border: 'none', color: '#111', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Inter, sans-serif' }}>
          <ArrowLeft size={16} /> Yazılara dön
        </button>
      </div>
    );
  }

  const articleBadge = resolveAuthorBadge(stats.total_articles, author?.custom_badge, author?.role);
  const nextArticleMilestone = getNextArticleMilestone(stats.total_articles);

  const tabs = [
    { id: 'articles' as const, label: `Yazılar (${authorArticles.length})`, icon: <FileText size={13} /> },
    ...(authorSeries.length > 0 ? [{ id: 'series' as const, label: `Diziler (${authorSeries.length})`, icon: <BookOpen size={13} /> }] : []),
  ];

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #f9fafb 0%, #fff 100%)',
        borderBottom: '1px solid #e5e7eb',
        padding: '2.5rem 1.5rem 0',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <button
            onClick={() => navigate('contents')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: '0.8125rem', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              fontFamily: 'Inter, sans-serif', padding: '0 0 1.75rem',
            }}
          >
            <ArrowLeft size={14} /> Tüm yazılar
          </button>

          {/* Author identity row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0, position: 'relative' }}>
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.full_name ?? ''}
                  style={{
                    width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
                    border: '3px solid #fff', boxShadow: '0 0 0 2px #e5e7eb',
                  }}
                />
              ) : (
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: '#111', border: '3px solid #fff',
                  boxShadow: '0 0 0 2px #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent, #c8f542)',
                }}>
                  {initials}
                </div>
              )}
            </div>

            {/* Name + badges + bio */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
                <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                  {author.full_name}
                </h1>
                {author.role && ROLE_LABELS[author.role] && (
                  <span style={{
                    padding: '2px 9px', borderRadius: 20, fontSize: '0.6875rem',
                    fontWeight: 700, background: '#f0fdf4', color: '#166534',
                    border: '1px solid #bbf7d0',
                  }}>
                    {ROLE_LABELS[author.role]}
                  </span>
                )}
              </div>

              {author.username && (
                <p style={{ margin: '0 0 0.375rem', fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500, letterSpacing: '-0.01em' }}>
                  @{author.username}
                </p>
              )}

              {author.title && (
                <p style={{ margin: '0 0 0.625rem', fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.4 }}>
                  {author.title}
                </p>
              )}

              {/* Badges row */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <BadgeChip
                  label={articleBadge.label}
                  color={articleBadge.color}
                  bg={articleBadge.bg}
                  border={articleBadge.border}
                  icon={<PenLine size={10} />}
                />
              </div>

              {/* Social links */}
              {(author.twitter || author.instagram || author.linkedin || author.website) && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[
                    { href: author.twitter, icon: <Twitter size={15} />, label: 'Twitter / X' },
                    { href: author.instagram, icon: <Instagram size={15} />, label: 'Instagram' },
                    { href: author.linkedin, icon: <Linkedin size={15} />, label: 'LinkedIn' },
                    { href: author.website, icon: <Globe size={15} />, label: 'Web sitesi' },
                  ].filter(s => s.href).map(s => (
                    <a
                      key={s.label}
                      href={socialLink(s.href)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: '#f3f4f6', border: '1px solid #e5e7eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6b7280', transition: 'all 0.15s', textDecoration: 'none',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = '#111';
                        (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#111';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.background = '#f3f4f6';
                        (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280';
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e7eb';
                      }}
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {author.bio && (
            <p style={{
              margin: '0 0 1.75rem', fontSize: '1rem', color: '#374151',
              lineHeight: 1.75, maxWidth: 680,
            }}>
              {author.bio}
            </p>
          )}

          {/* Newsletter CTA */}
          <NewsletterCTA />

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.75rem', alignItems: 'stretch' }}>
            <StatCard label="Yazı" value={stats.total_articles.toLocaleString('tr-TR')} icon={<PenLine size={14} />} color="#1d4ed8" />
            <StatCard label="Yayında" value={stats.published_articles.toLocaleString('tr-TR')} icon={<FileText size={14} />} color="#16a34a" />
            <StatCard label="Okuma" value={formatCount(stats.total_reads)} icon={<Eye size={14} />} color="#0e8fa0" />
            <StatCard label="Takipçi" value={followerCount.toLocaleString('tr-TR')} icon={<Users size={14} />} color="#b45309" />

            {/* Follow button — only show when viewing someone else's profile */}
            {user && user.id !== resolvedId && (
              <button
                onClick={toggle}
                disabled={toggling}
                style={{
                  flex: '1 1 120px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '1rem 1.25rem',
                  background: isFollowing ? '#fff' : '#111',
                  color: isFollowing ? '#374151' : '#fff',
                  border: isFollowing ? '1px solid #e5e7eb' : '1px solid #111',
                  borderRadius: 12, cursor: toggling ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem', fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                  opacity: toggling ? 0.6 : 1,
                }}
                onMouseEnter={e => {
                  if (!toggling) {
                    (e.currentTarget as HTMLButtonElement).style.opacity = '0.8';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = toggling ? '0.6' : '1';
                }}
              >
                {isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
                {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
              </button>
            )}

            {/* Prompt to log in */}
            {!user && (
              <button
                onClick={() => navigate('login')}
                style={{
                  flex: '1 1 120px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '1rem 1.25rem',
                  background: '#111', color: '#fff',
                  border: '1px solid #111',
                  borderRadius: 12, cursor: 'pointer',
                  fontSize: '0.875rem', fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                <UserPlus size={15} />
                Takip Et
              </button>
            )}
          </div>

          {/* Badge progress (collapsible) */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
            overflow: 'hidden', marginBottom: '0',
          }}>
            <button
              onClick={() => setBadgeExpanded(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.875rem 1.25rem', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>Rozet İlerlemesi</span>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: badgeExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {badgeExpanded && (
              <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid #f3f4f6' }}>
                {/* Article badge progress */}
                <div style={{ paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BadgeChip label={articleBadge.label} color={articleBadge.color} bg={articleBadge.bg} border={articleBadge.border} icon={<PenLine size={10} />} />
                      <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>{articleBadge.description}</span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                      {stats.total_articles} yazı
                    </span>
                  </div>
                  {nextArticleMilestone && (
                    <>
                      <ProgressBar value={stats.total_articles} max={nextArticleMilestone.target} color={articleBadge.border} />
                      <p style={{ margin: '0.375rem 0 0', fontSize: '0.6875rem', color: '#9ca3af' }}>
                        Sonraki seviye: <strong style={{ color: '#374151' }}>{nextArticleMilestone.label}</strong> — {nextArticleMilestone.target - stats.total_articles} yazı kaldı
                      </p>
                    </>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginTop: '1.75rem', borderBottom: 'none' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.625rem 1rem',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #111' : '2px solid transparent',
                  background: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem', fontWeight: activeTab === tab.id ? 700 : 400,
                  color: activeTab === tab.id ? '#111' : '#6b7280',
                  transition: 'all 0.15s',
                  marginBottom: -1,
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Articles tab */}
        {activeTab === 'articles' && (
          <>
            {authorArticles.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '4rem 1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
              }}>
                <FileText size={36} strokeWidth={1.5} color="#d1d5db" />
                <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#374151' }}>
                  Henüz yayınlanmış yazı yok
                </p>
              </div>
            ) : (
              <div className="articles-list">
                {authorArticles.map(article => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    navigate={navigate}
                    breadcrumb={findBreadcrumb(article.id, seriesList)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Series tab */}
        {activeTab === 'series' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {authorSeries.map(s => {
              const isCoAuthor = s.authorId !== resolvedId && coAuthoredSeriesIds.includes(s.id);
              return (
              <div
                key={s.id}
                onClick={() => navigate(`series/${s.id}`)}
                style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
                  overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
                }}
              >
                {isCoAuthor && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 1,
                    background: 'rgba(0,0,0,0.65)', color: '#fff',
                    fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    letterSpacing: '0.04em', textTransform: 'uppercase', backdropFilter: 'blur(4px)',
                  }}>
                    Katkıda
                  </div>
                )}
                {s.ogImage ? (
                  <img src={s.ogImage} alt={s.title} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: 120, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={32} color="#d1d5db" />
                  </div>
                )}
                <div style={{ padding: '1rem' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>{s.title}</p>
                  {s.tagline && (
                    <p style={{ margin: '0 0 0.625rem', fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.4 }}>
                      {s.tagline}
                    </p>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{s.articleCount} yazı</span>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
