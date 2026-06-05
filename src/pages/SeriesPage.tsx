import { ArrowLeft, BookOpen, CheckCircle2, Circle, Bell, BellOff, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Article } from '../data/articles';
import type { Series, SeriesOutlineNode } from '../data/series';
import ArticleCard, { type ArticleBreadcrumb } from '../components/ArticleCard';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../lib/supabase';

function findBreadcrumb(articleId: string, seriesData: Series): ArticleBreadcrumb | undefined {
  for (const chapter of seriesData.outline ?? []) {
    const crumb = searchNode(articleId, chapter, seriesData.title, chapter.title);
    if (crumb) return crumb;
  }
}

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

function SeriesSubscribeWidget({ seriesId, seriesTitle }: { seriesId: string; seriesTitle: string }) {
  const [featureOn, setFeatureOn] = useState(true);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already'>('idle');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'feature_series_newsletter').maybeSingle()
      .then(({ data }) => {
        if (data?.value === 'false') setFeatureOn(false);
      });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setEmail(user.email);
        supabase.from('series_subscribers')
          .select('id, status').eq('series_id', seriesId).eq('email', user.email).maybeSingle()
          .then(({ data }) => {
            if (data?.status === 'active') setSubscribed(true);
          });
      }
    });
  }, [seriesId]);

  if (!featureOn) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('series_subscribers').upsert({
      series_id: seriesId,
      email: email.trim().toLowerCase(),
      user_id: user?.id ?? null,
      status: 'active',
    }, { onConflict: 'series_id,email' });

    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setSubscribed(true);
    }
  };

  const handleUnsubscribe = async () => {
    setStatus('loading');
    await supabase.from('series_subscribers')
      .update({ status: 'unsubscribed' })
      .eq('series_id', seriesId)
      .eq('email', email);
    setSubscribed(false);
    setStatus('idle');
  };

  if (subscribed) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1rem', padding: '1rem 1.25rem',
        background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
        margin: '0 2rem 1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Check size={15} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#15803d' }}>Bu diziye abonesiniz</div>
            <div style={{ fontSize: '0.8125rem', color: '#16a34a' }}>Yeni bölüm yayınlandığında email ile bilgilendirileceksiniz.</div>
          </div>
        </div>
        <button
          onClick={handleUnsubscribe}
          disabled={status === 'loading'}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.4rem 0.875rem', background: '#fff',
            border: '1px solid #bbf7d0', borderRadius: 8,
            fontSize: '0.8125rem', fontWeight: 600, color: '#6b7280',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
          }}
        >
          <BellOff size={13} /> Aboneliği İptal Et
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.25rem 1.5rem',
      background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 12,
      margin: '0 2rem 1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Bell size={15} color="#374151" />
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111' }}>Yeni bölümleri kaçırmayın</div>
          <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
            <strong>{seriesTitle}</strong> dizisinde yeni bölüm yayınlandığında email ile haber alın.
          </div>
        </div>
      </div>
      <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
          placeholder="Email adresiniz"
          required
          style={{
            flex: 1, padding: '0.5rem 0.875rem',
            border: '1px solid #e5e7eb', borderRadius: 8,
            fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
            color: '#111', background: '#fff', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = '#374151'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.5rem 1.125rem', background: '#111', color: '#fff',
            border: 'none', borderRadius: 8,
            fontSize: '0.875rem', fontWeight: 600,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
          }}
        >
          <Bell size={13} />
          {status === 'loading' ? 'Kaydediliyor...' : 'Abone Ol'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#dc2626' }}>Bir hata oluştu. Lütfen tekrar deneyin.</p>
      )}
    </div>
  );
}

interface SeriesPageProps {
  id: string;
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

// Count all leaf nodes (nodes with article_id or no children)
function countLeaves(nodes: SeriesOutlineNode[]): number {
  return nodes.reduce((acc, n) => {
    if ((n.children ?? []).length === 0) return acc + 1;
    return acc + countLeaves(n.children!);
  }, 0);
}

// Count published leaves
function countPublished(nodes: SeriesOutlineNode[], publishedIds: Set<string>): number {
  return nodes.reduce((acc, n) => {
    if ((n.children ?? []).length === 0) {
      const ids = n.article_ids?.length ? n.article_ids : n.article_id ? [n.article_id] : [];
      return acc + (ids.some(id => publishedIds.has(id)) ? 1 : 0);
    }
    return acc + countPublished(n.children!, publishedIds);
  }, 0);
}

interface OutlineNodeProps {
  node: SeriesOutlineNode;
  depth: number;
  articles: Article[];
  navigate: (to: string) => void;
}

function OutlineNodeView({ node, depth, articles, navigate }: OutlineNodeProps) {
  const hasChildren = (node.children ?? []).length > 0;

  // Collect all linked article IDs (support both article_ids[] and legacy article_id)
  const linkedIds: string[] = node.article_ids?.length
    ? node.article_ids
    : node.article_id ? [node.article_id] : [];
  const linkedArticles = linkedIds.map(aid => articles.find(a => a.id === aid)).filter(Boolean) as typeof articles;
  const isPublished = linkedArticles.length > 0;

  if (hasChildren) {
    return (
      <div className={`outline-group outline-group--depth-${Math.min(depth, 2)}`}>
        <div className="outline-group-header">
          {depth === 0 && <span className="outline-group-chapter">Bölüm {node.order}</span>}
          {depth > 0 && <span className="outline-group-order">{node.order}</span>}
          <span className="outline-group-title">{node.title}</span>
        </div>
        <div className="outline-group-children">
          {node.children!.map(child => (
            <OutlineNodeView
              key={child.id}
              node={child}
              depth={depth + 1}
              articles={articles}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    );
  }

  // Single article linked — original layout
  if (linkedArticles.length <= 1) {
    const linkedArticle = linkedArticles[0] ?? null;
    return (
      <div
        className={`outline-leaf${isPublished ? ' outline-leaf--published' : ' outline-leaf--pending'}`}
        style={{ paddingLeft: depth > 0 ? `${depth * 1.25}rem` : undefined }}
        onClick={isPublished ? () => navigate(`article/${linkedArticle!.id}`) : undefined}
      >
        <div className={`outline-leaf-icon${isPublished ? ' outline-leaf-icon--done' : ''}`}>
          {isPublished ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </div>
        <div className="outline-leaf-body">
          <span className="outline-leaf-order">{node.order}.</span>
          <span className="outline-leaf-title">{node.title}</span>
        </div>
        {isPublished && <span className="outline-leaf-cta">Oku &rarr;</span>}
      </div>
    );
  }

  // Multiple articles linked — show header row + sub-rows for each
  return (
    <div
      className="outline-leaf outline-leaf--published outline-leaf--multi"
      style={{ paddingLeft: depth > 0 ? `${depth * 1.25}rem` : undefined, flexDirection: 'column', alignItems: 'stretch', cursor: 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.125rem 0' }}>
        <div className="outline-leaf-icon outline-leaf-icon--done">
          <CheckCircle2 size={16} />
        </div>
        <div className="outline-leaf-body">
          <span className="outline-leaf-order">{node.order}.</span>
          <span className="outline-leaf-title">{node.title}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.75rem', marginTop: '0.375rem' }}>
        {linkedArticles.map((a, i) => (
          <button
            key={a.id}
            onClick={() => navigate(`article/${a.id}`)}
            className="outline-sub-article"
          >
            <span style={{ color: '#9ca3af', fontSize: '0.7rem', minWidth: 14 }}>{i + 1}.</span>
            <span style={{ flex: 1 }}>{a.title}</span>
            <span className="outline-leaf-cta">Oku &rarr;</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SeriesPage({ id, navigate, articles, seriesList }: SeriesPageProps) {
  const seriesData = seriesList.find(s => s.id === id);

  if (!seriesData) {
    return (
      <main>
        <div style={{ padding: '3rem 2rem' }}>
          <p style={{ color: '#888' }}>Yazı dizisi bulunamadı.</p>
          <button className="btn-secondary" onClick={() => navigate('contents')} style={{ marginTop: '1rem' }}>
            <ArrowLeft size={15} /> Geri Dön
          </button>
        </div>
      </main>
    );
  }

  const seriesArticles = articles.filter(a => a.seriesId === id);

  useSEO({
    title: seriesData.title,
    description: seriesData.description,
    ogImage: seriesData.ogImage,
    ogType: 'website',
    canonical: `https://obtalks.tr/#series/${seriesData.id}`,
  });

  const outline = seriesData.outline ?? [];
  const publishedIds = new Set(seriesArticles.map(a => a.id));
  const totalLeaves = countLeaves(outline);
  const publishedLeaves = countPublished(outline, publishedIds);

  return (
    <main>
      <button className="article-back" onClick={() => navigate('contents')}>
        <ArrowLeft size={14} /> İçeriklere Dön
      </button>

      <div className="series-page-header">
        <div className="series-page-badge">
          <BookOpen size={14} />
          Yazı Dizisi · {seriesData.articleCount} yazı
        </div>
        <h1 className="series-page-title">{seriesData.title}</h1>
        {seriesData.tagline && <p className="series-page-tagline">"{seriesData.tagline}"</p>}
        {seriesData.conceptDescription && <p className="series-page-concept">{seriesData.conceptDescription}</p>}
      </div>

      <SeriesSubscribeWidget seriesId={seriesData.id} seriesTitle={seriesData.title} />

      <div className="divider-full" />

      {seriesData.topics && seriesData.topics.length > 0 && (
        <>
          <div className="series-topics-section">
            <p className="series-topics-label">Kapsanan Konular</p>
            <div className="series-topics-grid">
              {seriesData.topics.map(topic => (
                <span key={topic} className="series-topic-chip">{topic}</span>
              ))}
            </div>
          </div>
          <div className="divider-full" />
        </>
      )}

      {/* Content Outline Tree */}
      {outline.length > 0 && (
        <>
          <div className="series-outline-section">
            <div className="series-outline-header">
              <div>
                <h2 className="series-outline-title">İçerik Planı</h2>
                <p className="series-outline-subtitle">Bu dizinin tüm bölümleri ve yayın durumu</p>
              </div>
              {totalLeaves > 0 && (
                <div className="series-outline-progress">
                  <div className="series-outline-progress-bar">
                    <div
                      className="series-outline-progress-fill"
                      style={{ width: `${Math.round((publishedLeaves / totalLeaves) * 100)}%` }}
                    />
                  </div>
                  <span className="series-outline-progress-label">
                    {publishedLeaves} / {totalLeaves} yayında
                  </span>
                </div>
              )}
            </div>

            <div className="outline-tree">
              {outline.map(node => (
                <OutlineNodeView
                  key={node.id}
                  node={node}
                  depth={0}
                  articles={seriesArticles}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
          <div className="divider-full" />
        </>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 0' }}>
        <div className="section-header" style={{ padding: '0 2rem', marginBottom: 0 }}>
          <h2 className="section-title">Yayınlanan Yazılar</h2>
        </div>
      </div>

      <div className="article-list">
        {seriesArticles.length > 0
          ? seriesArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                navigate={navigate}
                breadcrumb={findBreadcrumb(article.id, seriesData)}
              />
            ))
          : <p className="empty-state">Bu dizide henüz yazı yayınlanmadı.</p>
        }
      </div>
    </main>
  );
}
