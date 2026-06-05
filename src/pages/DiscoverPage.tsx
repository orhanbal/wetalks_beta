import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Eye, HandMetal, MessageCircle, BookOpen, ArrowRight, Flame, Star, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Article } from '../data/articles';
import type { Series } from '../data/series';
import { useSEO } from '../hooks/useSEO';

interface DiscoverPageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

interface ArticleWithScore extends Article {
  score: number;
  views: number;
  claps: number;
  comments: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) return 'bugün';
  if (d < 30) return `${d} gün önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

type Period = '7' | '30' | 'all';
const PERIOD_LABELS: Record<Period, string> = { '7': 'Bu Hafta', '30': 'Bu Ay', all: 'Tüm Zamanlar' };

export default function DiscoverPage({ navigate, articles, seriesList }: DiscoverPageProps) {
  const [period, setPeriod] = useState<Period>('30');
  const [trending, setTrending] = useState<ArticleWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useSEO({ title: 'Keşfet', description: 'En çok okunan ve öne çıkan yazılar.' });

  const editorPicks = articles.filter(a => a.published && a.boosted).slice(0, 6);
  const categories = [...new Set(articles.filter(a => a.published).map(a => a.category).filter(Boolean))];

  useEffect(() => {
    loadTrending();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, articles]);

  async function loadTrending() {
    setLoading(true);
    const publishedIds = articles.filter(a => a.published).map(a => a.id);
    if (!publishedIds.length) { setLoading(false); return; }

    const since = period !== 'all'
      ? new Date(Date.now() - parseInt(period) * 86400000).toISOString()
      : '2000-01-01T00:00:00Z';

    const [viewsRes, clapsRes, commentsRes] = await Promise.all([
      supabase.from('page_views').select('article_id').in('article_id', publishedIds).gte('created_at', since),
      supabase.from('claps').select('article_id, count').in('article_id', publishedIds),
      supabase.from('comments').select('article_id').in('article_id', publishedIds).gte('created_at', since),
    ]);

    const viewMap: Record<string, number> = {};
    (viewsRes.data ?? []).forEach((r: { article_id: string }) => { viewMap[r.article_id] = (viewMap[r.article_id] || 0) + 1; });
    const clapsMap: Record<string, number> = {};
    (clapsRes.data ?? []).forEach((r: { article_id: string; count: number }) => { clapsMap[r.article_id] = (clapsMap[r.article_id] || 0) + r.count; });
    const commentsMap: Record<string, number> = {};
    (commentsRes.data ?? []).forEach((r: { article_id: string }) => { commentsMap[r.article_id] = (commentsMap[r.article_id] || 0) + 1; });

    const scored: ArticleWithScore[] = articles
      .filter(a => a.published)
      .map(a => ({
        ...a,
        views: viewMap[a.id] || 0,
        claps: clapsMap[a.id] || 0,
        comments: commentsMap[a.id] || 0,
        score: (viewMap[a.id] || 0) + (clapsMap[a.id] || 0) * 3 + (commentsMap[a.id] || 0) * 5,
      }))
      .sort((a, b) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);

    setTrending(scored);
    setLoading(false);
  }

  const filtered = activeCategory ? trending.filter(a => a.category === activeCategory) : trending;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem 5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
          <Flame size={22} color="#f97316" />
          <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Keşfet</h1>
        </div>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#6b7280' }}>En çok okunan, alkışlanan ve tartışılan yazılar.</p>
      </div>

      {editorPicks.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Star size={15} color="#f59e0b" />
            <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Editörün Seçkileri</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {editorPicks.map(article => (
              <button key={article.id} onClick={() => navigate(`article/${article.id}`)}
                style={{ textAlign: 'left', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {article.ogImage
                  ? <img src={article.ogImage} alt={article.title} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: 130, background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={30} color="#0e8fa0" strokeWidth={1.5} /></div>
                }
                <div style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#f97316', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 4, padding: '1px 6px' }}>Editörün Seçimi</span>
                    {article.category && <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>{article.category}</span>}
                  </div>
                  <p style={{ margin: '0 0 0.375rem', fontSize: '0.9rem', fontWeight: 700, color: '#111', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                    <Clock size={11} /> {article.readingTime} dk <ArrowRight size={11} style={{ marginLeft: 'auto' }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={15} color="#0e8fa0" />
            <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Trend Yazılar</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', background: '#f3f4f6', borderRadius: 8, padding: '0.25rem' }}>
            {(['7', '30', 'all'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: '0.375rem 0.875rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', fontWeight: 600, background: period === p ? '#fff' : 'transparent', color: period === p ? '#111' : '#6b7280', boxShadow: period === p ? '0 1px 2px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s' }}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button onClick={() => setActiveCategory(null)} style={{ padding: '0.3rem 0.875rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', fontWeight: 600, background: !activeCategory ? '#111' : '#f3f4f6', color: !activeCategory ? '#fff' : '#374151', transition: 'all 0.15s' }}>Tümü</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat === activeCategory ? null : cat)} style={{ padding: '0.3rem 0.875rem', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', fontWeight: 600, background: activeCategory === cat ? '#111' : '#f3f4f6', color: activeCategory === cat ? '#fff' : '#374151', transition: 'all 0.15s' }}>{cat}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ height: 72, background: '#f9fafb', borderRadius: 10 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af' }}>
            <TrendingUp size={40} strokeWidth={1.5} style={{ marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#374151' }}>Bu dönemde trend içerik yok</p>
            <p style={{ margin: '0.375rem 0 0', fontSize: '0.8125rem' }}>Farklı bir dönem seçin.</p>
          </div>
        ) : (
          <div>
            {filtered.map((article, i) => {
              const isTop3 = i < 3;
              return (
                <button key={article.id} onClick={() => navigate(`article/${article.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 10, width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'background 0.12s', borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ width: 32, height: 32, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isTop3 ? '1rem' : '0.875rem', fontWeight: 900, color: isTop3 ? '#f97316' : '#d1d5db', background: isTop3 ? '#fff7ed' : 'transparent', borderRadius: '50%' }}>{i + 1}</span>
                  {article.ogImage
                    ? <img src={article.ogImage} alt="" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 52, height: 52, borderRadius: 8, background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={18} color="#d1d5db" /></div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                      {article.category && <span style={{ fontWeight: 600, color: '#6b7280' }}>{article.category}</span>}
                      <span>·</span><span>{timeAgo(article.date)}</span>
                      <span>·</span><span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {article.readingTime}dk</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                    {article.views > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Eye size={11} /> {article.views}</span>}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {article.claps > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><HandMetal size={11} /> {article.claps}</span>}
                      {article.comments > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MessageCircle size={11} /> {article.comments}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {seriesList.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BookOpen size={15} color="#0e8fa0" />
            <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700 }}>Yazı Dizileri</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {seriesList.slice(0, 6).map(s => (
              <button key={s.id} onClick={() => navigate(`series/${s.id}`)}
                style={{ textAlign: 'left', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', padding: 0, display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.15s', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                {s.ogImage
                  ? <img src={s.ogImage} alt={s.title} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: 100, background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={28} color="#d1d5db" /></div>
                }
                <div style={{ padding: '0.875rem' }}>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#111', lineHeight: 1.3 }}>{s.title}</p>
                  {s.tagline && <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.4 }}>{s.tagline}</p>}
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BookOpen size={10} /> {s.articleCount} yazı</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
