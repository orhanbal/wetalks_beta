import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import {
  PenLine, BookOpen, Eye, BarChart2, Plus, ChevronRight,
  FileText, Lock, Globe, Clock, ArrowLeft, Award, TrendingUp,
  Star, Users, HandMetal, MessageCircle
} from 'lucide-react';
import { useFollowerCount } from '../hooks/useFollow';
import {
  resolveAuthorBadge,
  getNextArticleMilestone,
  formatCount
} from '../lib/writerBadges';
import type { Article } from '../data/articles';
import type { Series } from '../data/series';

interface WriterDashboardProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

interface WriterStats {
  total_articles: number;
  published_articles: number;
  draft_articles: number;
  total_reads: number;
  total_claps: number;
  total_comments: number;
}

interface MyArticle {
  id: string;
  title: string;
  published: boolean;
  date: string;
  reading_time: number;
  category: string;
  views: number;
  claps: number;
  comments: number;
}

interface MySeries {
  id: string;
  title: string;
  tagline: string;
  article_count: number;
  og_image: string | null;
}

type Tab = 'overview' | 'articles' | 'series';

const ROLE_LABELS: Record<string, string> = {
  reader: 'Okuyucu',
  author: 'Yazar',
  editor: 'Editör',
  admin: 'Admin',
};

function BadgeChip({
  label, color, bg, border, icon,
}: {
  label: string; color: string; bg: string; border: string; icon?: React.ReactNode;
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.6rem',
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
    <div style={{
      width: '100%', height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden',
    }}>
      <div style={{
        width: `${pct}%`, height: '100%', background: color,
        borderRadius: 99, transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

export default function WriterDashboard({ navigate, articles: allArticles, seriesList: allSeries }: WriterDashboardProps) {
  const { user, loading: authLoading } = useAuth();
  const followerCount = useFollowerCount(user?.id);
  const [profile, setProfile] = useState<{ full_name: string; role: string; avatar_url: string | null; custom_badge?: string | null } | null>(null);
  const [stats, setStats] = useState<WriterStats>({ total_articles: 0, published_articles: 0, draft_articles: 0, total_reads: 0, total_claps: 0, total_comments: 0 });
  const [myArticles, setMyArticles] = useState<MyArticle[]>([]);
  const [mySeries, setMySeries] = useState<MySeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [articleFilter, setArticleFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('login'); return; }
    loadAll();
  }, [user, authLoading]);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);

    const [profileRes, statsRes, articlesRes, seriesRes] = await Promise.all([
      supabase.from('profiles').select('full_name, role, avatar_url, custom_badge').eq('id', user.id).maybeSingle(),
      supabase.from('writer_stats').select('*').eq('author_id', user.id).maybeSingle(),
      supabase
        .from('articles')
        .select('id, title, published, date, reading_time, category')
        .eq('author_id', user.id)
        .order('date', { ascending: false }),
      supabase
        .from('series')
        .select('id, title, tagline, article_count, og_image')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);

    const articleIds = (articlesRes.data ?? []).map((a: { id: string }) => a.id);

    const [viewMap, clapsMap, commentsMap] = await Promise.all([
      fetchViewCounts(articleIds),
      fetchClapsMap(articleIds),
      fetchCommentsMap(articleIds),
    ]);

    const totalClaps = Object.values(clapsMap).reduce((s, v) => s + v, 0);
    const totalComments = Object.values(commentsMap).reduce((s, v) => s + v, 0);

    if (statsRes.data) {
      setStats({
        total_articles: Number(statsRes.data.total_articles) || 0,
        published_articles: Number(statsRes.data.published_articles) || 0,
        draft_articles: Number(statsRes.data.draft_articles) || 0,
        total_reads: Number(statsRes.data.total_reads) || 0,
        total_claps: totalClaps,
        total_comments: totalComments,
      });
    }

    if (articlesRes.data) {
      setMyArticles(articlesRes.data.map((a: { id: string; title: string; published: boolean; date: string; reading_time: number; category: string }) => ({
        ...a,
        views: viewMap[a.id] || 0,
        claps: clapsMap[a.id] || 0,
        comments: commentsMap[a.id] || 0,
      })));
    }

    if (seriesRes.data) setMySeries(seriesRes.data as MySeries[]);

    setLoading(false);
  };

  const fetchViewCounts = async (ids: string[]): Promise<Record<string, number>> => {
    if (!ids.length) return {};
    const { data } = await supabase.from('page_views').select('article_id').in('article_id', ids);
    const map: Record<string, number> = {};
    (data ?? []).forEach((row: { article_id: string | null }) => {
      if (row.article_id) map[row.article_id] = (map[row.article_id] || 0) + 1;
    });
    return map;
  };

  const fetchClapsMap = async (ids: string[]): Promise<Record<string, number>> => {
    if (!ids.length) return {};
    const { data } = await supabase.from('claps').select('article_id, count').in('article_id', ids);
    const map: Record<string, number> = {};
    (data ?? []).forEach((row: { article_id: string; count: number }) => {
      map[row.article_id] = (map[row.article_id] || 0) + row.count;
    });
    return map;
  };

  const fetchCommentsMap = async (ids: string[]): Promise<Record<string, number>> => {
    if (!ids.length) return {};
    const { data } = await supabase.from('comments').select('article_id').in('article_id', ids);
    const map: Record<string, number> = {};
    (data ?? []).forEach((row: { article_id: string }) => {
      map[row.article_id] = (map[row.article_id] || 0) + 1;
    });
    return map;
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.9rem' }}>
        Yükleniyor...
      </div>
    );
  }

  if (!profile || !['author', 'editor', 'admin'].includes(profile.role)) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <Lock size={40} strokeWidth={1.5} color="#9ca3af" />
        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', margin: 0 }}>Bu sayfaya erişim yetkiniz yok</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>Yazarlık başvurusu yapmak için profilinizi ziyaret edin.</p>
        <button
          onClick={() => navigate('profile')}
          style={{
            marginTop: '0.5rem', padding: '0.6rem 1.25rem',
            background: '#111', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          Profilime Git
        </button>
      </div>
    );
  }

  const articleBadge = resolveAuthorBadge(stats.total_articles, profile?.custom_badge, profile?.role);
  const nextArticleMilestone = getNextArticleMilestone(stats.total_articles);

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || '?';

  const filteredArticles = myArticles.filter(a => {
    if (articleFilter === 'published') return a.published;
    if (articleFilter === 'draft') return !a.published;
    return true;
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: <BarChart2 size={14} /> },
    { id: 'articles', label: `Yazılarım (${stats.total_articles})`, icon: <FileText size={14} /> },
    { id: 'series', label: `Dizilerim (${mySeries.length})`, icon: <BookOpen size={14} /> },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem', fontFamily: 'Inter, sans-serif' }}>

      {/* Back */}
      <button
        onClick={() => navigate('')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6b7280', fontSize: '0.8125rem', fontWeight: 500,
          padding: '0 0 1.5rem', fontFamily: 'Inter, sans-serif',
        }}
      >
        <ArrowLeft size={15} />
        Ana Sayfaya Dön
      </button>

      {/* Header Card */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
        padding: '1.75rem', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: profile.avatar_url ? 'transparent' : '#f3f4f6',
          border: '2px solid #e5e7eb', flexShrink: 0, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.375rem', fontWeight: 700, color: '#374151',
        }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '0.375rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>
              {profile.full_name || 'İsimsiz Yazar'}
            </h1>
            <span style={{
              padding: '2px 8px', borderRadius: 20, fontSize: '0.6875rem',
              fontWeight: 700, background: '#f0fdf4', color: '#166534',
              border: '1px solid #bbf7d0',
            }}>
              {ROLE_LABELS[profile.role] ?? profile.role}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <BadgeChip
              label={articleBadge.label}
              color={articleBadge.color}
              bg={articleBadge.bg}
              border={articleBadge.border}
              icon={<PenLine size={10} />}
            />
          </div>
        </div>

        <button
          onClick={() => navigate('admin/articles/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.65rem 1.25rem',
            background: '#111', color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: '0.875rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            transition: 'opacity 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={16} />
          Yeni Yazı
        </button>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem', marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Toplam Yazı', value: stats.total_articles, icon: <PenLine size={18} />, color: '#1d4ed8' },
          { label: 'Yayında', value: stats.published_articles, icon: <Globe size={18} />, color: '#16a34a' },
          { label: 'Toplam Okuma', value: stats.total_reads, icon: <Eye size={18} />, color: '#0e8fa0', format: true },
          { label: 'Toplam Alkış', value: stats.total_claps, icon: <HandMetal size={18} />, color: '#7c3aed', format: true },
          { label: 'Toplam Yorum', value: stats.total_comments, icon: <MessageCircle size={18} />, color: '#db2777', format: true },
          { label: 'Takipçi', value: followerCount, icon: <Users size={18} />, color: '#b45309' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
            padding: '1.125rem 1.25rem',
            display: 'flex', flexDirection: 'column', gap: '0.375rem',
          }}>
            <span style={{ color: stat.color, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {stat.icon}
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>{stat.label}</span>
            </span>
            <span style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>
              {stat.format ? formatCount(stat.value) : stat.value.toLocaleString('tr-TR')}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.25rem', background: '#f3f4f6',
        borderRadius: 10, padding: '0.25rem', marginBottom: '1.5rem',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
              padding: '0.5rem 0.75rem', borderRadius: 8,
              border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.15s',
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#111' : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Badge Progress */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Award size={16} color="#0e8fa0" />
              <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Rozet İlerlemesi</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Article Badge */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yazı Rozeti</p>
                    <BadgeChip label={articleBadge.label} color={articleBadge.color} bg={articleBadge.bg} border={articleBadge.border} icon={<PenLine size={10} />} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>
                    {stats.total_articles} yazı
                  </span>
                </div>
                {nextArticleMilestone && (
                  <>
                    <ProgressBar value={stats.total_articles} max={nextArticleMilestone.target} color={articleBadge.border} />
                    <p style={{ margin: '0.375rem 0 0', fontSize: '0.6875rem', color: '#9ca3af' }}>
                      Sonraki rozet: <strong style={{ color: '#374151' }}>{nextArticleMilestone.label}</strong> — {nextArticleMilestone.target - stats.total_articles} yazı kaldı
                    </p>
                  </>
                )}
                {!nextArticleMilestone && (
                  <p style={{ margin: '0.375rem 0 0', fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>
                    En yüksek rozete ulaştın!
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* All Badge Tiers */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Star size={16} color="#0e8fa0" />
              <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Tüm Rozet Seviyeleri</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Yeni Yazar', desc: '0–9 makale', icon: <PenLine size={12} />, color: '#374151', bg: '#f3f4f6', border: '#d1d5db', active: stats.total_articles >= 0 && stats.total_articles < 10 },
                { label: 'Gelişen Yazar', desc: '10–99 makale', icon: <PenLine size={12} />, color: '#065f46', bg: '#d1fae5', border: '#6ee7b7', active: stats.total_articles >= 10 && stats.total_articles < 100 },
                { label: 'Jr. Yazar', desc: '100–999 makale', icon: <PenLine size={12} />, color: '#1e40af', bg: '#dbeafe', border: '#93c5fd', active: stats.total_articles >= 100 && stats.total_articles < 1000 },
                { label: 'Usta Yazar', desc: '1000–4999 makale', icon: <PenLine size={12} />, color: '#92400e', bg: '#fef3c7', border: '#fcd34d', active: stats.total_articles >= 1000 && stats.total_articles < 5000 },
                { label: 'Baş Yazar', desc: '5000+ makale', icon: <PenLine size={12} />, color: '#7c2d12', bg: '#ffedd5', border: '#fb923c', active: stats.total_articles >= 5000 },
              ].map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: 10,
                  border: `1.5px solid ${b.active ? b.border : '#e5e7eb'}`,
                  background: b.active ? b.bg : '#fafafa',
                  opacity: b.active ? 1 : 0.45,
                  transition: 'all 0.15s',
                }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: b.active ? b.border : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: b.active ? b.color : '#9ca3af', flexShrink: 0,
                  }}>
                    {b.icon}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: b.active ? b.color : '#9ca3af' }}>{b.label}</p>
                    <p style={{ margin: 0, fontSize: '0.6875rem', color: '#9ca3af' }}>{b.desc}</p>
                  </div>
                  {b.active && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.625rem', fontWeight: 700, color: b.color, background: b.bg, border: `1px solid ${b.border}`, borderRadius: 99, padding: '2px 7px' }}>
                      Aktif
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Partner Earnings Estimate */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid #334155', borderRadius: 16, padding: '1.5rem',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <TrendingUp size={16} color="#60a5fa" />
              <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#fff' }}>Partner Puan Tahmini</h2>
            </div>
            {(() => {
              const score = stats.total_reads * 1 + stats.total_claps * 2 + stats.total_comments * 5;
              const tiers = [
                { min: 0,    max: 100,   label: 'Başlangıç',   color: '#94a3b8' },
                { min: 100,  max: 500,   label: 'Gelişen',     color: '#34d399' },
                { min: 500,  max: 2000,  label: 'Aktif',       color: '#60a5fa' },
                { min: 2000, max: 10000, label: 'Güçlü',       color: '#f59e0b' },
                { min: 10000,max: Infinity, label: 'Elite',    color: '#f97316' },
              ];
              const tier = tiers.find(t => score >= t.min && score < t.max) ?? tiers[tiers.length - 1];
              const nextTier = tiers[tiers.indexOf(tier) + 1];
              const pct = nextTier ? Math.min((score - tier.min) / (nextTier.min - tier.min) * 100, 100) : 100;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Toplam Puan</p>
                      <p style={{ margin: 0, fontSize: '2.25rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{score.toLocaleString('tr-TR')}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: tier.color, fontWeight: 700 }}>Seviye: {tier.label}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>Puan Dağılımı</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#e2e8f0', lineHeight: 1.8 }}>
                        {stats.total_reads} okuma × 1 = {stats.total_reads}<br/>
                        {stats.total_claps} alkış × 2 = {stats.total_claps * 2}<br/>
                        {stats.total_comments} yorum × 5 = {stats.total_comments * 5}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div style={{ height: 6, background: '#334155', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: tier.color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                    </div>
                    {nextTier && (
                      <p style={{ margin: '0.375rem 0 0', fontSize: '0.6875rem', color: '#64748b' }}>
                        Sonraki seviye ({nextTier.label}): {nextTier.min - score} puan kaldı
                      </p>
                    )}
                  </div>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem',
                    paddingTop: '0.75rem', borderTop: '1px solid #334155',
                  }}>
                    {[
                      { label: 'Okuma', value: stats.total_reads, mult: '×1', color: '#94a3b8' },
                      { label: 'Alkış', value: stats.total_claps, mult: '×2', color: '#f472b6' },
                      { label: 'Yorum', value: stats.total_comments, mult: '×5', color: '#818cf8' },
                    ].map(m => (
                      <div key={m.label} style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 0.125rem', fontSize: '0.6875rem', color: '#64748b', fontWeight: 500 }}>{m.label}</p>
                        <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: m.color }}>{m.value.toLocaleString('tr-TR')}</p>
                        <p style={{ margin: 0, fontSize: '0.6rem', color: '#475569' }}>{m.mult}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Top Performing Articles */}
          {myArticles.length > 0 && (
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} color="#0e8fa0" />
                  <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>En İyi Performans</h2>
                </div>
                <button
                  onClick={() => setActiveTab('articles')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.8125rem', color: '#0e8fa0', fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Tümünü Gör <ChevronRight size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[...myArticles]
                  .sort((a, b) => (b.views + b.claps * 3 + b.comments * 5) - (a.views + a.claps * 3 + a.comments * 5))
                  .slice(0, 5)
                  .map(article => (
                    <ArticleRow
                      key={article.id}
                      article={article}
                      onEdit={() => navigate(`admin/articles/edit/${article.id}`)}
                      onView={() => navigate(`article/${article.id}`)}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Recent Articles */}
          {myArticles.length > 0 && (
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#6b7280" />
                  <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Son Yazılar</h2>
                </div>
                <button
                  onClick={() => setActiveTab('articles')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '0.8125rem', color: '#0e8fa0', fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Tümünü Gör <ChevronRight size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {myArticles.slice(0, 5).map(article => (
                  <ArticleRow
                    key={article.id}
                    article={article}
                    onEdit={() => navigate(`admin/articles/edit/${article.id}`)}
                    onView={() => navigate(`article/${article.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ARTICLES TAB ────────────────────────────────────────────── */}
      {activeTab === 'articles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.375rem', background: '#f3f4f6', borderRadius: 8, padding: '0.25rem' }}>
              {(['all', 'published', 'draft'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setArticleFilter(f)}
                  style={{
                    padding: '0.375rem 0.75rem', borderRadius: 6,
                    border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.15s',
                    background: articleFilter === f ? '#fff' : 'transparent',
                    color: articleFilter === f ? '#111' : '#6b7280',
                    boxShadow: articleFilter === f ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {f === 'all' ? 'Tümü' : f === 'published' ? 'Yayında' : 'Taslak'}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('admin/articles/new')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1rem', background: '#111', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Plus size={14} /> Yeni Yazı
            </button>
          </div>

          {filteredArticles.length === 0 ? (
            <EmptyState
              icon={<FileText size={36} strokeWidth={1.5} />}
              title={articleFilter === 'draft' ? 'Taslak yok' : articleFilter === 'published' ? 'Yayında yazı yok' : 'Henüz yazı yok'}
              subtitle="Yeni bir yazı oluşturmak için yukarıdaki butonu kullanın."
            />
          ) : (
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
              overflow: 'hidden',
            }}>
              {filteredArticles.map((article, i) => (
                <div key={article.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <ArticleRow
                    article={article}
                    onEdit={() => navigate(`admin/articles/edit/${article.id}`)}
                    onView={() => navigate(`article/${article.id}`)}
                    padded
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SERIES TAB ──────────────────────────────────────────────── */}
      {activeTab === 'series' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => navigate('admin/series/new')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1rem', background: '#111', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Plus size={14} /> Yeni Dizi
            </button>
          </div>

          {mySeries.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={36} strokeWidth={1.5} />}
              title="Henüz yazı dizisi yok"
              subtitle="Yazılarınızı bir araya getiren diziler oluşturun."
            />
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}>
              {mySeries.map(s => (
                <div
                  key={s.id}
                  style={{
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14,
                    overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                  onClick={() => navigate(`series/${s.id}`)}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb';
                  }}
                >
                  {s.og_image ? (
                    <img src={s.og_image} alt={s.title} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: 120, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={32} color="#d1d5db" />
                    </div>
                  )}
                  <div style={{ padding: '1rem' }}>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>{s.title}</p>
                    {s.tagline && <p style={{ margin: '0 0 0.625rem', fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.4 }}>{s.tagline}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{s.article_count} yazı</span>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`admin/series/edit/${s.id}`); }}
                        style={{
                          fontSize: '0.75rem', fontWeight: 600, color: '#0e8fa0',
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Düzenle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ArticleRow({
  article, onEdit, onView, padded = false,
}: {
  article: MyArticle;
  onEdit: () => void;
  onView: () => void;
  padded?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: padded ? '0.875rem 1.25rem' : '0.625rem 0',
      transition: 'background 0.1s',
    }}
      onMouseEnter={e => { if (padded) (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}
      onMouseLeave={e => { if (padded) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <span style={{
        flexShrink: 0, width: 8, height: 8, borderRadius: '50%',
        background: article.published ? '#22c55e' : '#f59e0b',
        marginTop: 1,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#111',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {article.title}
        </p>
        <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
          {article.category} · {article.reading_time} dk ·{' '}
          {new Date(article.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', fontSize: '0.75rem', color: '#6b7280', flexShrink: 0 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Eye size={12} />
          {article.views.toLocaleString('tr-TR')}
        </span>
        {article.claps > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <HandMetal size={12} />
            {article.claps.toLocaleString('tr-TR')}
          </span>
        )}
        {article.comments > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MessageCircle size={12} />
            {article.comments}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        {article.published && (
          <button
            onClick={onView}
            style={{
              fontSize: '0.75rem', fontWeight: 600, color: '#6b7280',
              background: 'none', border: '1px solid #e5e7eb', borderRadius: 6,
              padding: '0.25rem 0.625rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            Görüntüle
          </button>
        )}
        <button
          onClick={onEdit}
          style={{
            fontSize: '0.75rem', fontWeight: 600, color: '#0e8fa0',
            background: 'none', border: '1px solid #cffafe', borderRadius: 6,
            padding: '0.25rem 0.625rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          Düzenle
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{
      textAlign: 'center', padding: '3rem 1rem',
      color: '#9ca3af', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
    }}>
      {icon}
      <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#374151' }}>{title}</p>
      <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}
