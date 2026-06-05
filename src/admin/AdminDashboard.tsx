import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Globe, Users, TrendingUp, FileText, BarChart2, X, AlignJustify, ChevronDown, Eye, Clock, Flame, ArrowUpRight } from 'lucide-react';
import { supabase, type DbArticle } from '../lib/supabase';
const WorldMap = lazy(() => import('./WorldMap').then(m => ({ default: m.WorldMap })));

interface AdminDashboardProps {
  navigate: (to: string) => void;
  siteTitle?: string;
}

type Tab = 'overview' | 'traffic' | 'growth';
type ContentFilter = 'all' | 'articles' | 'pages';

type PageViewRow = {
  id: string;
  page: string;
  title: string | null;
  article_id: string | null;
  referrer: string | null;
  user_agent: string | null;
  language: string | null;
  screen_width: number | null;
  session_id: string | null;
  country: string | null;
  country_name: string | null;
  visited_at: string;
};

// ── Helpers ──────────────────────────────────────────────

function parseBrowser(ua: string | null): string {
  if (!ua) return 'Bilinmiyor';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  return 'Diğer';
}

function parseReferrer(ref: string | null): { label: string; domain: string } {
  if (!ref) return { label: 'Direkt', domain: 'direct' };
  try {
    const host = new URL(ref).hostname.replace('www.', '');
    if (host.includes('google')) return { label: 'Google', domain: 'google.com' };
    if (host.includes('twitter') || host.includes('t.co')) return { label: 'Twitter / X', domain: 'twitter.com' };
    if (host.includes('linkedin')) return { label: 'LinkedIn', domain: 'linkedin.com' };
    if (host.includes('facebook')) return { label: 'Facebook', domain: 'facebook.com' };
    return { label: host, domain: host };
  } catch { return { label: 'Diğer', domain: 'other' }; }
}

function pageLabel(pv: PageViewRow): string {
  if (pv.title) return pv.title;
  if (pv.page === '/') return 'Ana Sayfa';
  if (pv.page === '/icerikler') return 'İçerikler';
  if (pv.page === '/hakkimda') return 'Hakkımda';
  if (pv.page === '/iletisim') return 'İletişim';
  return pv.page;
}

function groupByPage(views: PageViewRow[]): { page: string; label: string; value: number; article_id: string | null }[] {
  const map = new Map<string, { label: string; value: number; article_id: string | null }>();
  for (const pv of views) {
    const key = pv.page;
    const label = pageLabel(pv);
    if (!map.has(key)) map.set(key, { label, value: 0, article_id: pv.article_id });
    map.get(key)!.value++;
    if (pv.title) map.get(key)!.label = pv.title;
  }
  return Array.from(map.entries())
    .map(([page, v]) => ({ page, ...v }))
    .sort((a, b) => b.value - a.value);
}

function groupBySource(views: PageViewRow[]): { label: string; domain: string; value: number }[] {
  const map = new Map<string, { label: string; domain: string; value: number }>();
  for (const pv of views) {
    const { label, domain } = parseReferrer(pv.referrer);
    if (!map.has(domain)) map.set(domain, { label, domain, value: 0 });
    map.get(domain)!.value++;
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

// ── Sparkline with area fill + Y-axis labels ──────────────

function AreaChart({ data, days }: { data: number[]; days: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  if (!data.length) return null;

  const max = Math.max(...data, 1);
  const W = 1000;
  const H = 200;
  const padL = 40;
  const padB = 24;
  const chartW = W - padL;
  const chartH = H - padB;

  const pts = data.map((v, i) => {
    const x = padL + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = chartH - (v / max) * (chartH - 8);
    return { x, y, v };
  });

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${chartH} L${padL},${chartH} Z`;

  const yTicks = [0, Math.round(max / 2), max];
  const startDate = new Date(Date.now() - (days - 1) * 86400000);
  const endDate = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 220, display: 'block' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Y gridlines */}
      {yTicks.map((v, i) => {
        const y = chartH - (v / max) * (chartH - 8);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
            <text x={padL - 6} y={y + 4} fontSize="22" fill="#9ca3af" textAnchor="end">{v}</text>
          </g>
        );
      })}
      {/* Area */}
      <path d={areaPath} fill="url(#areaGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* X axis labels */}
      <text x={padL} y={H - 2} fontSize="22" fill="#9ca3af">{fmt(startDate)}</text>
      <text x={W} y={H - 2} fontSize="22" fill="#9ca3af" textAnchor="end">{fmt(endDate)}</text>
    </svg>
  );
}

// ── Source favicon ────────────────────────────────────────

function SourceIcon({ domain }: { domain: string }) {
  const size = 18;
  if (domain === 'direct') return (
    <div style={{ width: size, height: size, borderRadius: 4, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Globe size={11} color="#6b7280" />
    </div>
  );
  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=32&domain=${domain}`}
      width={size} height={size}
      style={{ borderRadius: 4, flexShrink: 0 }}
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

// ── All-pages modal ───────────────────────────────────────

function AllPagesModal({
  allPages,
  onClose,
  title,
}: {
  allPages: { page: string; label: string; value: number; article_id: string | null }[];
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
        background: 'rgba(0,0,0,0.18)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 580, background: '#fff', overflowY: 'auto',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111', marginBottom: '0.2rem' }}>{title}</div>
            <div style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>Tüm sayfalar ve ziyaret sayıları</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
          >
            <X size={18} />
          </button>
        </div>
        {/* Column header */}
        <div style={{ padding: '0.75rem 1.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6' }}>
          <span>SAYFA</span>
          <span>ZİYARET</span>
        </div>
        {/* Rows */}
        {allPages.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1.75rem',
              borderBottom: i < allPages.length - 1 ? '1px solid #f9fafb' : 'none',
              background: i % 2 === 0 ? '#f9fafb' : '#fff',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'inline-block', background: '#e8f0fe', color: '#3b6fd4',
                fontSize: '0.8125rem', fontWeight: 500,
                padding: '0.2rem 0.625rem', borderRadius: 6,
                maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {p.label}
              </div>
            </div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111', marginLeft: '1.5rem', flexShrink: 0 }}>
              {p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────

export default function AdminDashboard({ navigate, siteTitle }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('traffic');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [counts, setCounts] = useState({ articles: 0, published: 0, draft: 0, series: 0 });
  const [recentArticles, setRecentArticles] = useState<DbArticle[]>([]);
  const [pageViews, setPageViews] = useState<PageViewRow[]>([]);
  const [prevPageViews, setPrevPageViews] = useState<PageViewRow[]>([]);
  const [allArticleViews, setAllArticleViews] = useState<PageViewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<'pages' | 'sources'>('pages');

  useEffect(() => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const prevSince = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000).toISOString();
    setLoading(true);
    (async () => {
      const [{ count: total }, { count: pub }, { count: ser }, { data: recent }, { data: views }, { data: prevViews }, { data: articleViews }] = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('series').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*').order('date', { ascending: false }).limit(10),
        supabase.from('page_views').select('*').gte('visited_at', since).order('visited_at', { ascending: true }),
        supabase.from('page_views').select('id, article_id, session_id, visited_at').gte('visited_at', prevSince).lt('visited_at', since),
        supabase.from('page_views').select('id, article_id, session_id, title, visited_at').not('article_id', 'is', null),
      ]);
      setCounts({ articles: total ?? 0, published: pub ?? 0, draft: (total ?? 0) - (pub ?? 0), series: ser ?? 0 });
      if (recent) setRecentArticles(recent as DbArticle[]);
      if (views) setPageViews(views as PageViewRow[]);
      if (prevViews) setPrevPageViews(prevViews as PageViewRow[]);
      if (articleViews) setAllArticleViews(articleViews as PageViewRow[]);
      setLoading(false);
    })();
  }, [days]);

  // ── Derived data ──

  const uniqueSessions = new Set(pageViews.map(pv => pv.session_id || pv.id)).size;
  const totalViews = pageViews.length;
  const prevTotalViews = prevPageViews.length;
  const prevUniqueSessions = new Set(prevPageViews.map(pv => pv.session_id || pv.id)).size;

  const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  // Article-level view counts (all-time)
  const articleViewMap = (() => {
    const map = new Map<string, number>();
    for (const pv of allArticleViews) {
      if (pv.article_id) map.set(pv.article_id, (map.get(pv.article_id) || 0) + 1);
    }
    return map;
  })();

  // Article views in current period
  const articleViewMapPeriod = (() => {
    const map = new Map<string, number>();
    for (const pv of pageViews) {
      if (pv.article_id) map.set(pv.article_id, (map.get(pv.article_id) || 0) + 1);
    }
    return map;
  })();

  // Article views in previous period
  const articleViewMapPrev = (() => {
    const map = new Map<string, number>();
    for (const pv of prevPageViews) {
      if (pv.article_id) map.set(pv.article_id, (map.get(pv.article_id) || 0) + 1);
    }
    return map;
  })();

  const countryCounts = (() => {
    const map: Record<string, { name: string; count: number }> = {};
    for (const pv of pageViews) {
      if (!pv.country) continue;
      if (!map[pv.country]) map[pv.country] = { name: pv.country_name || pv.country, count: 0 };
      map[pv.country].count++;
    }
    return map;
  })();

  // Daily sparkline
  const dailyViews = (() => {
    const buckets = new Array(days).fill(0);
    const now = Date.now();
    pageViews.forEach(pv => {
      const diff = Math.floor((now - new Date(pv.visited_at).getTime()) / 86400000);
      const idx = days - 1 - diff;
      if (idx >= 0 && idx < days) buckets[idx]++;
    });
    return buckets;
  })();

  const allPageGroups = groupByPage(pageViews);

  const filteredPageGroups = allPageGroups.filter(p => {
    if (contentFilter === 'articles') return p.article_id !== null;
    if (contentFilter === 'pages') return p.article_id === null;
    return true;
  });

  const topContent = filteredPageGroups.slice(0, 6);
  const allSources = groupBySource(pageViews);
  const topSources = allSources.slice(0, 6);

  const topBrowsers = (() => {
    const map = new Map<string, number>();
    pageViews.forEach(pv => {
      const b = parseBrowser(pv.user_agent);
      map.set(b, (map.get(b) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({ label, value }));
  })();

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> },
    { id: 'traffic', label: 'Web Trafiği', icon: <Globe size={14} /> },
    { id: 'growth', label: 'Büyüme', icon: <TrendingUp size={14} /> },
  ];

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 0.875rem', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem', fontWeight: active ? 600 : 400,
    background: active ? '#fff' : 'transparent',
    color: active ? '#111' : '#6b7280',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)' : 'none',
    transition: 'all 0.12s',
  });

  const daysLabel = days === 7 ? 'Son 7 gün' : days === 30 ? 'Son 30 gün' : 'Son 90 gün';

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-0.025em' }}>Analitik</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button onClick={() => navigate('')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: '#6b7280' }}>
            <Globe size={13} /> {siteTitle || 'Siteye Git'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#6b7280' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            {uniqueSessions} çevrimiçi
          </div>
        </div>
      </div>

      {/* ── Tab + filter bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
        <div style={{ display: 'flex', gap: '0.25rem', background: '#f3f4f6', padding: '3px', borderRadius: 8 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={tabStyle(tab === t.id)}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Days dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDaysDropdown(d => !d)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                border: '1px solid #e5e7eb', borderRadius: 6, padding: '0.4rem 0.75rem',
                fontSize: '0.8125rem', color: '#374151', cursor: 'pointer', background: '#fff',
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="12" rx="2" stroke="#6b7280" strokeWidth="1.5" /><path d="M5 1v4M11 1v4M1 7h14" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" /></svg>
              {daysLabel}
              <ChevronDown size={12} />
            </button>
            {showDaysDropdown && (
              <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, minWidth: 140, overflow: 'hidden' }}>
                {[
                  { v: 7, label: 'Son 7 gün' },
                  { v: 30, label: 'Son 30 gün' },
                  { v: 90, label: 'Son 90 gün' },
                ].map(({ v, label }) => (
                  <button
                    key={v}
                    onClick={() => { setDays(v); setShowDaysDropdown(false); }}
                    style={{
                      display: 'block', width: '100%', padding: '0.625rem 1rem',
                      border: 'none', background: days === v ? '#f3f4f6' : '#fff',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem', color: days === v ? '#111' : '#374151',
                      fontWeight: days === v ? 600 : 400, textAlign: 'left',
                    }}
                  >{label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '1.75rem 2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#9ca3af', fontSize: '0.875rem' }}>Yükleniyor...</div>
        ) : (
          <>
            {/* ════════════════════════════════════
                GENEL BAKIŞ
            ════════════════════════════════════ */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
                  {[
                    {
                      label: 'Dönem görüntülenme',
                      value: totalViews.toLocaleString('tr-TR'),
                      prev: prevTotalViews,
                      curr: totalViews,
                      icon: Eye,
                      color: '#38bdf8',
                    },
                    {
                      label: 'Tekil ziyaretçi',
                      value: uniqueSessions.toLocaleString('tr-TR'),
                      prev: prevUniqueSessions,
                      curr: uniqueSessions,
                      icon: Users,
                      color: '#6ee7b7',
                    },
                    {
                      label: 'Yayında makale',
                      value: counts.published,
                      icon: FileText,
                      color: '#22c55e',
                    },
                    {
                      label: 'Dizi',
                      value: counts.series,
                      icon: BarChart2,
                      color: '#6b7280',
                    },
                  ].map(({ label, value, icon: Icon, color, curr, prev }) => {
                    const change = curr !== undefined && prev !== undefined ? pctChange(curr, prev) : null;
                    return (
                      <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon size={14} color={color} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', letterSpacing: '-0.025em', lineHeight: 1 }}>
                          {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
                        </div>
                        {change !== null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: change >= 0 ? '#16a34a' : '#dc2626' }}>
                            <ArrowUpRight size={13} style={{ transform: change < 0 ? 'rotate(90deg)' : undefined }} />
                            {Math.abs(change)}% önceki döneme göre
                          </div>
                        )}
                        {change === null && (
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            Toplam {counts.articles} makale
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 2-column: Popular articles + Recent articles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                  {/* Popular articles (by all-time views) */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Flame size={15} color="#f59e0b" />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>En Popüler Makaleler</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tüm Süre</span>
                    </div>
                    {recentArticles
                      .slice()
                      .sort((a, b) => (articleViewMap.get(b.id) || 0) - (articleViewMap.get(a.id) || 0))
                      .slice(0, 7)
                      .map((a, i) => {
                        const views = articleViewMap.get(a.id) || 0;
                        const periodViews = articleViewMapPeriod.get(a.id) || 0;
                        const prevViews = articleViewMapPrev.get(a.id) || 0;
                        const trending = periodViews > prevViews && periodViews > 0;
                        const maxViews = Math.max(...recentArticles.map(x => articleViewMap.get(x.id) || 0), 1);
                        return (
                          <div
                            key={a.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.5rem', borderBottom: i < 6 ? '1px solid #f9fafb' : 'none', cursor: 'pointer' }}
                            onClick={() => navigate(`admin/articles/edit/${a.id}`)}
                            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                          >
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d1d5db', width: 18, flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
                                {a.title}
                              </div>
                              <div style={{ height: 3, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden', maxWidth: 200 }}>
                                <div style={{ height: '100%', background: '#38bdf8', borderRadius: 99, width: `${Math.round((views / maxViews) * 100)}%`, transition: 'width 0.5s' }} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                              {trending && <TrendingUp size={11} color="#22c55e" />}
                              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', minWidth: 28, textAlign: 'right' }}>
                                {views > 999 ? `${(views / 1000).toFixed(1)}K` : views}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    {recentArticles.length === 0 && (
                      <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8125rem' }}>Henüz makale yok</div>
                    )}
                  </div>

                  {/* Period article performance */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={15} color="#6b7280" />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Dönem Performansı</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Son {days} Gün</span>
                    </div>

                    {/* Mini chart header */}
                    <div style={{ padding: '0.875rem 1.5rem 0', display: 'flex', gap: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Görüntülenme</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>{totalViews.toLocaleString('tr-TR')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ziyaretçi</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>{uniqueSessions.toLocaleString('tr-TR')}</div>
                      </div>
                      {totalViews > 0 && counts.published > 0 && (
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ort. / Makale</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>
                            {Math.round(totalViews / counts.published).toLocaleString('tr-TR')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Top articles this period */}
                    <div style={{ padding: '0.875rem 1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280' }}>Bu dönem en çok okunanlar</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.6875rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Dönem</span>
                        <span style={{ fontSize: '0.6875rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginLeft: '0.5rem' }}>Önceki</span>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '0.875rem' }}>
                      {(() => {
                        const sorted = recentArticles
                          .filter(a => (articleViewMapPeriod.get(a.id) || 0) > 0)
                          .sort((a, b) => (articleViewMapPeriod.get(b.id) || 0) - (articleViewMapPeriod.get(a.id) || 0))
                          .slice(0, 6);
                        if (sorted.length === 0) {
                          return (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8125rem' }}>
                              Bu dönem için görüntülenme verisi yok
                            </div>
                          );
                        }
                        return sorted.map((a, i) => {
                          const curr = articleViewMapPeriod.get(a.id) || 0;
                          const prev = articleViewMapPrev.get(a.id) || 0;
                          const chg = pctChange(curr, prev);
                          return (
                            <div
                              key={a.id}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1.5rem', borderBottom: i < sorted.length - 1 ? '1px solid #f9fafb' : 'none', cursor: 'pointer' }}
                              onClick={() => navigate(`admin/articles/edit/${a.id}`)}
                              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {a.title}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', minWidth: 28, textAlign: 'right' }}>
                                  {curr}
                                </span>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 600, minWidth: 40, textAlign: 'right', color: prev === 0 ? '#9ca3af' : chg >= 0 ? '#16a34a' : '#dc2626' }}>
                                  {prev === 0 ? '—' : `${chg >= 0 ? '+' : ''}${chg}%`}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Category breakdown */}
                {recentArticles.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <BarChart2 size={15} color="#6b7280" />
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Kategori Analizi</span>
                    </div>
                    {(() => {
                      const catMap = new Map<string, { articles: number; views: number }>();
                      recentArticles.forEach(a => {
                        const cat = a.category || 'Diğer';
                        if (!catMap.has(cat)) catMap.set(cat, { articles: 0, views: 0 });
                        const entry = catMap.get(cat)!;
                        entry.articles++;
                        entry.views += articleViewMap.get(a.id) || 0;
                      });
                      const cats = Array.from(catMap.entries())
                        .map(([cat, v]) => ({ cat, ...v }))
                        .sort((a, b) => b.views - a.views);
                      const maxViews = Math.max(...cats.map(c => c.views), 1);
                      const colors = ['#38bdf8', '#6ee7b7', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#34d399'];
                      return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                          {cats.map(({ cat, articles, views }, i) => (
                            <div key={cat} style={{ padding: '0.875rem 1rem', border: '1px solid #f3f4f6', borderRadius: 10, background: '#fafafa' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>{cat}</span>
                                <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>{articles} yazı</span>
                              </div>
                              <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, marginBottom: '0.375rem', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: colors[i % colors.length], borderRadius: 99, width: `${Math.round((views / maxViews) * 100)}%`, transition: 'width 0.6s' }} />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                                <Eye size={10} />
                                {views.toLocaleString('tr-TR')} görüntülenme
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Recent articles — last row */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={15} color="#6b7280" />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Son Eklenen Makaleler</span>
                    <button
                      onClick={() => navigate('admin/articles')}
                      style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: '#0e8fa0', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                    >
                      Tümünü gör <ArrowUpRight size={12} />
                    </button>
                  </div>
                  {recentArticles.slice(0, 5).map((a, i) => (
                    <div
                      key={a.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: i < 4 ? '1px solid #f9fafb' : 'none', cursor: 'pointer' }}
                      onClick={() => navigate(`admin/articles/edit/${a.id}`)}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 6, background: '#f3f4f6', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {a.og_image ? <img src={a.og_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FileText size={16} color="#d1d5db" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>{new Date(a.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span>·</span>
                          <span style={{ color: a.published ? '#22c55e' : '#f59e0b', fontWeight: 500 }}>{a.published ? 'Yayında' : 'Taslak'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                        <Eye size={12} color="#9ca3af" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#374151' }}>
                          {(articleViewMap.get(a.id) || 0).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════
                WEB TRAFİĞİ
            ════════════════════════════════════ */}
            {tab === 'traffic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Big chart card */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  {/* Metric tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ flex: 1, padding: '1.25rem 1.75rem', borderRight: '1px solid #e5e7eb', borderBottom: '3px solid #111', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: 500 }}>Tekil ziyaretçi</span>
                      </div>
                      <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111', letterSpacing: '-0.035em', lineHeight: 1 }}>{uniqueSessions.toLocaleString('tr-TR')}</div>
                    </div>
                    <div style={{ flex: 1, padding: '1.25rem 1.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: 500 }}>Toplam görüntüleme</span>
                      </div>
                      <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111', letterSpacing: '-0.035em', lineHeight: 1 }}>{totalViews.toLocaleString('tr-TR')}</div>
                    </div>
                  </div>
                  {/* Chart */}
                  <div style={{ padding: '1.25rem 1.75rem 0.75rem' }}>
                    {totalViews === 0 ? (
                      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: '0.875rem' }}>
                        Bu dönem için henüz veri yok
                      </div>
                    ) : (
                      <AreaChart data={dailyViews} days={days} />
                    )}
                  </div>
                </div>

                {/* Top content + Top sources */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

                  {/* Top content */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem 0.875rem' }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>En çok ziyaret edilen içerik</div>
                      <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.15rem' }}>Son {days} günün en çok okunan sayfaları</div>
                    </div>

                    {/* Filter pills */}
                    <div style={{ padding: '0 1.5rem 0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', background: '#f3f4f6', padding: '3px', borderRadius: 7 }}>
                        {([['all', 'Tümü'], ['articles', 'Makaleler'], ['pages', 'Sayfalar']] as [ContentFilter, string][]).map(([f, label]) => (
                          <button
                            key={f}
                            onClick={() => setContentFilter(f)}
                            style={{
                              padding: '0.3rem 0.625rem', border: 'none', borderRadius: 5,
                              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                              fontSize: '0.8125rem', fontWeight: contentFilter === f ? 600 : 400,
                              background: contentFilter === f ? '#fff' : 'transparent',
                              color: contentFilter === f ? '#111' : '#6b7280',
                              boxShadow: contentFilter === f ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                            }}
                          >{label}</button>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em' }}>ZİYARET</span>
                    </div>

                    <div style={{ borderTop: '1px solid #f3f4f6' }}>
                      {topContent.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8125rem' }}>Henüz veri yok</div>
                      ) : topContent.map((p, i) => (
                        <div
                          key={i}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 1.5rem', borderBottom: i < topContent.length - 1 ? '1px solid #f9fafb' : 'none' }}
                        >
                          <div style={{ flex: 1, minWidth: 0, marginRight: '0.75rem' }}>
                            <span style={{
                              display: 'inline-block',
                              background: '#e8f0fe', color: '#3b6fd4',
                              fontSize: '0.8125rem', fontWeight: 500,
                              padding: '0.2rem 0.625rem', borderRadius: 6,
                              maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {p.label}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', flexShrink: 0 }}>{p.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* View all */}
                    <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid #f3f4f6' }}>
                      <button
                        onClick={() => { setModalContent('pages'); setModalOpen(true); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                          background: '#f3f4f6', border: 'none', borderRadius: 7,
                          padding: '0.5rem 0.875rem', cursor: 'pointer',
                          fontSize: '0.8125rem', fontWeight: 600, color: '#374151',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Hepsini gör <AlignJustify size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Top sources */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem 0.875rem' }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Trafik kaynakları</div>
                      <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.15rem' }}>Okuyucuların sizi nasıl bulduğu</div>
                    </div>

                    <div style={{ padding: '0 1.5rem 0.875rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em' }}>ZİYARET</span>
                    </div>

                    <div style={{ borderTop: '1px solid #f3f4f6' }}>
                      {topSources.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8125rem' }}>Henüz veri yok</div>
                      ) : topSources.map((s, i) => (
                        <div
                          key={i}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', justifyContent: 'space-between', padding: '0.625rem 1.5rem', borderBottom: i < topSources.length - 1 ? '1px solid #f9fafb' : 'none' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
                            <SourceIcon domain={s.domain} />
                            <span style={{
                              display: 'inline-block',
                              background: '#e8f0fe', color: '#3b6fd4',
                              fontSize: '0.8125rem', fontWeight: 500,
                              padding: '0.2rem 0.625rem', borderRadius: 6,
                            }}>
                              {s.label}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', flexShrink: 0 }}>{s.value}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid #f3f4f6' }}>
                      <button
                        onClick={() => { setModalContent('sources'); setModalOpen(true); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                          background: '#f3f4f6', border: 'none', borderRadius: 7,
                          padding: '0.5rem 0.875rem', cursor: 'pointer',
                          fontSize: '0.8125rem', fontWeight: 600, color: '#374151',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Hepsini gör <AlignJustify size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Devices + Browsers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {/* Browsers */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', marginBottom: '0.15rem' }}>Tarayıcılar</div>
                    <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '1.25rem' }}>Ziyaretçilerin kullandığı tarayıcılar</div>
                    {topBrowsers.length === 0 ? (
                      <div style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>Henüz veri yok</div>
                    ) : topBrowsers.map((b, i) => (
                      <div key={i} style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#374151', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 500 }}>{b.label}</span>
                          <span style={{ fontWeight: 700, color: '#111' }}>{b.value}</span>
                        </div>
                        <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#38bdf8', borderRadius: 3, width: `${Math.round((b.value / (topBrowsers[0]?.value || 1)) * 100)}%`, transition: 'width 0.4s' }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Locations placeholder */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', marginBottom: '0.15rem' }}>Diller</div>
                    <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginBottom: '1.25rem' }}>Ziyaretçilerin tarayıcı dil tercihleri</div>
                    {(() => {
                      const langMap = new Map<string, number>();
                      pageViews.forEach(pv => {
                        const l = (pv.language?.split('-')[0]?.toUpperCase()) || 'Bilinmiyor';
                        langMap.set(l, (langMap.get(l) || 0) + 1);
                      });
                      const langs = Array.from(langMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
                      if (!langs.length) return <div style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>Henüz veri yok</div>;
                      return langs.map(([label, value], i) => (
                        <div key={i} style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#374151', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: 500 }}>{label}</span>
                            <span style={{ fontWeight: 700, color: '#111' }}>{value}</span>
                          </div>
                          <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#6ee7b7', borderRadius: 3, width: `${Math.round((value / (langs[0][1] || 1)) * 100)}%`, transition: 'width 0.4s' }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* World Map */}
                <Suspense fallback={<div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Harita yükleniyor…</div>}>
                  <WorldMap countryCounts={countryCounts} />
                </Suspense>

              </div>
            )}

            {/* ════════════════════════════════════
                BÜYÜME
            ════════════════════════════════════ */}
            {tab === 'growth' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ flex: 1, padding: '1.25rem 1.75rem', borderRight: '1px solid #e5e7eb', borderBottom: '3px solid #111' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: 500 }}>Dönem görüntüleme</span>
                      </div>
                      <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111', letterSpacing: '-0.035em', lineHeight: 1 }}>{totalViews.toLocaleString('tr-TR')}</div>
                    </div>
                    <div style={{ flex: 1, padding: '1.25rem 1.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6ee7b7', display: 'inline-block' }} />
                        <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: 500 }}>Tekil oturum</span>
                      </div>
                      <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111', letterSpacing: '-0.035em', lineHeight: 1 }}>{uniqueSessions.toLocaleString('tr-TR')}</div>
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem 1.75rem 0.75rem' }}>
                    {totalViews === 0 ? (
                      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', fontSize: '0.875rem' }}>Bu dönem için henüz veri yok</div>
                    ) : <AreaChart data={dailyViews} days={days} />}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
                  {[
                    { label: 'Toplam makale', value: counts.articles, color: '#3b82f6' },
                    { label: 'Yayında', value: counts.published, color: '#22c55e' },
                    { label: 'Taslak', value: counts.draft, color: '#f59e0b' },
                    { label: 'Dizi', value: counts.series, color: '#6b7280' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.25rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 800, color, letterSpacing: '-0.025em' }}>{value}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <AllPagesModal
          title={modalContent === 'pages' ? 'En çok ziyaret edilen içerik' : 'Trafik kaynakları'}
          allPages={modalContent === 'pages'
            ? allPageGroups
            : allSources.map(s => ({ page: s.domain, label: s.label, value: s.value, article_id: null }))
          }
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
