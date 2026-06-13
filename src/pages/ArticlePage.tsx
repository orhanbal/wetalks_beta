import { ArrowLeft, ArrowRight, Clock, Linkedin, Twitter, Facebook, Link2, Check, CheckCircle2, Circle, Bookmark, BookmarkCheck, Highlighter, X, Play, Pause, Square, Volume2, HandMetal, MessageCircle, Share2, MoreHorizontal, Star, Award, UserPlus, UserCheck } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Article } from '../data/articles';
import type { Series, SeriesOutlineNode } from '../data/series';
import { useSEO } from '../hooks/useSEO';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAuth } from '../hooks/useAuth';
import { useClaps } from '../hooks/useClaps';
import { useComments } from '../hooks/useComments';
import Comments from '../components/Comments';
import { useHighlights, type HighlightColor } from '../hooks/useHighlights';
import SuggestedAuthors from '../components/SuggestedAuthors';
import { useTTS } from '../hooks/useTTS';
import { useSaveReadingProgress } from '../hooks/useReadingProgress';
import { useFollow } from '../hooks/useFollow';

function nodeContainsArticle(n: SeriesOutlineNode, articleId: string): boolean {
  const ids = n.article_ids?.length ? n.article_ids : n.article_id ? [n.article_id] : [];
  return ids.includes(articleId);
}

// Find the outline item that matches the current article (recursive)
function findCurrentNode(nodes: SeriesOutlineNode[], articleId: string): SeriesOutlineNode | null {
  for (const n of nodes) {
    if (nodeContainsArticle(n, articleId)) return n;
    if (n.children) {
      const found = findCurrentNode(n.children, articleId);
      if (found) return found;
    }
  }
  return null;
}

interface ArticleOutlineRowProps {
  node: SeriesOutlineNode;
  currentArticleId: string;
  articles: Article[];
  navigate: (to: string) => void;
  depth: number;
}

function ArticleOutlineRow({ node, currentArticleId, articles, navigate, depth }: ArticleOutlineRowProps) {
  const hasChildren = (node.children ?? []).length > 0;

  if (hasChildren) {
    return (
      <div className="aop-group">
        <div className="aop-group-label" style={{ paddingLeft: depth > 0 ? `${depth}rem` : undefined }}>
          {depth === 0
            ? <span className="aop-chapter-badge">Bölüm {node.order}</span>
            : <span className="aop-group-order">{node.order}.</span>
          }
          <span className="aop-group-title">{node.title}</span>
        </div>
        {node.children!.map(child => (
          <ArticleOutlineRow
            key={child.id}
            node={child}
            currentArticleId={currentArticleId}
            articles={articles}
            navigate={navigate}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  const ids = node.article_ids?.length ? node.article_ids : node.article_id ? [node.article_id] : [];
  const linkedArticles = ids.map(aid => articles.find(a => a.id === aid)).filter(Boolean) as Article[];
  const isPublished = linkedArticles.length > 0;
  const isCurrent = ids.includes(currentArticleId);
  const firstArticle = linkedArticles[0] ?? null;

  return (
    <div
      className={`aop-row${isCurrent ? ' aop-row--current' : ''}${isPublished && !isCurrent ? ' aop-row--published' : ''}${!isPublished ? ' aop-row--pending' : ''}`}
      style={{ paddingLeft: depth > 0 ? `${depth * 1.25 + 0.625}rem` : undefined, cursor: isPublished && !isCurrent && linkedArticles.length === 1 ? 'pointer' : 'default' }}
      onClick={isPublished && !isCurrent && linkedArticles.length === 1 ? () => navigate(`article/${firstArticle!.id}`) : undefined}
    >
      <div className="aop-icon">
        {isPublished ? <CheckCircle2 size={13} /> : <Circle size={13} />}
      </div>
      <span className="aop-label">
        <span className="aop-num">{node.order}.</span>
        {node.title}
      </span>
    </div>
  );
}

interface ArticlePageProps {
  id: string;
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

function useReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const footer = document.querySelector('footer');
      const footerHeight = footer ? footer.offsetHeight : 0;
      const scrolled = document.documentElement.scrollTop || document.body.scrollTop;
      const total = document.documentElement.scrollHeight - document.documentElement.clientHeight - footerHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return progress;
}

function ClapIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 117.57 122.88" fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" paintOrder="stroke" className={className} aria-hidden="true">
      <path d="M113.6,74.1c-0.77-1.4-1.91-2.47-3.22-3.18l1.88-1.03c1.92-1.06,3.23-2.8,3.8-4.75c0.57-1.96,0.39-4.13-0.66-6.05 c0,0,0-0.01,0-0.01c-0.78-1.42-1.99-2.57-3.44-3.28l1.51-0.83c1.92-1.06,3.23-2.8,3.8-4.75c0.57-1.96,0.39-4.13-0.66-6.05 c-1.05-1.92-2.8-3.23-4.75-3.79c-1.96-0.57-4.13-0.39-6.05,0.66l-1.54,0.85c0.15-1.53-0.15-3.12-0.94-4.57 c-1.05-1.92-2.8-3.23-4.75-3.8c-1.96-0.57-4.13-0.39-6.05,0.66l-7.92,4.36c-0.85-1.86-2.32-3.45-4.3-4.41c0,0-0.01,0-0.01,0 c-1.68-0.81-3.56-1.09-5.4-0.8l0.87-1.78c1.1-2.26,1.18-4.76,0.41-6.97c-0.76-2.21-2.37-4.13-4.63-5.23 c-2.26-1.1-4.76-1.18-6.97-0.41c-2.21,0.76-4.13,2.37-5.23,4.62l-0.88,1.81c-0.88-1.53-2.21-2.83-3.91-3.66 c-2.26-1.1-4.76-1.18-6.97-0.41c-2.21,0.76-4.13,2.37-5.23,4.63L23.36,64.92c-0.43,0.63-0.82,1.29-1.16,1.98l0,0l-1.12,2.29 l-0.11-0.29c-0.77-2.01-1.47-4.07-1.74-4.84c-1.79-5.21-5.2-7.79-8.65-8.29c-1.56-0.23-3.1-0.03-4.51,0.53 c-1.41,0.56-2.68,1.49-3.7,2.73c-2.41,2.93-3.37,7.63-1.04,13.32l0.03,0.1l0,0l0.01,0.02c2.47,7.27,8.27,29.5,14.65,36.5 c7.89,8.66,28.31,16.78,39.3,12.91c6.06-2.13,11.32-6.59,14.36-12.83l1.13-2.32c13.22-7.27,26.43-14.55,39.66-21.83 c1.92-1.05,3.23-2.8,3.79-4.75C114.83,78.2,114.66,76.02,113.6,74.1L113.6,74.1L113.6,74.1z M85.43,42.19 c2.93-1.6,5.88-3.21,8.83-4.84c1.04-0.57,2.23-0.67,3.3-0.36c1.07,0.31,2.02,1.02,2.59,2.07c0.57,1.04,0.67,2.23,0.36,3.3 c-0.31,1.07-1.02,2.02-2.07,2.59l-8.98,4.94c-0.29-0.18-0.58-0.35-0.9-0.5l0,0c-1.65-0.8-3.43-1.06-5.13-0.84l1.08-2.21 C85.16,45,85.45,43.58,85.43,42.19L85.43,42.19z M92.22,52.64l15.32-8.43c1.04-0.57,2.23-0.67,3.3-0.36 c1.07,0.31,2.02,1.02,2.59,2.07c0.57,1.04,0.67,2.23,0.36,3.3c-0.31,1.07-1.02,2.02-2.07,2.59L92.35,62.46l0.42-0.87 c1.1-2.26,1.18-4.76,0.41-6.97C92.95,53.93,92.62,53.26,92.22,52.64L92.22,52.64z M89.45,68.42l16.88-9.29 c1.04-0.57,2.23-0.67,3.3-0.36c1.07,0.31,2.02,1.02,2.59,2.07c0.57,1.04,0.67,2.23,0.36,3.3c-0.31,1.07-1.02,2.02-2.07,2.59 L87.73,79.26l1.74,3.17l15.07-8.29c1.04-0.57,2.23-0.67,3.3-0.36c1.07,0.31,2.02,1.02,2.59,2.07c0.57,1.04,0.67,2.23,0.36,3.3 c-0.31,1.07-1.02,2.02-2.07,2.59C97,88.19,85.28,94.64,73.56,101.09L89.45,68.42L89.45,68.42z M65.95,107.24 c-2.55,5.23-6.94,8.97-12.01,10.75c-9.36,3.3-28.17-4.45-34.87-11.8C13.38,99.95,7.11,76.52,5.29,71.15 c-0.02-0.09-0.06-0.19-0.09-0.28l-1.92,0.79l1.91-0.79c-1.7-4.1-1.16-7.32,0.4-9.21c0.57-0.69,1.26-1.2,2.02-1.5 c0.76-0.3,1.57-0.41,2.38-0.29c2.04,0.3,4.12,2.01,5.34,5.54c0.28,0.81,1.02,2.96,1.79,4.97c0.72,1.89,1.51,3.75,2.16,4.69 c0.2,0.35,0.51,0.63,0.88,0.81c0,0,0,0,0,0l1.83,0l4.02-7.14C32.68,55,39.36,41.52,46.08,27.73c0.6-1.23,1.65-2.1,2.86-2.52 c1.21-0.42,2.57-0.38,3.8,0.22c1.23,0.6,2.1,1.65,2.52,2.85c0.42,1.21,0.38,2.57-0.22,3.8L42.01,58.85l3.86,1.88l17.21-35.36 c0.6-1.23,1.65-2.1,2.85-2.52c1.21-0.42,2.57-0.38,3.8,0.22c1.23,0.6,2.1,1.65,2.52,2.86c0.42,1.21,0.38,2.57-0.22,3.8L54.82,65.09 l3.94,1.92l13.07-26.85c0.6-1.23,1.65-2.1,2.86-2.52c1.21-0.42,2.57-0.38,3.8,0.22c1.23,0.6,2.1,1.65,2.52,2.86 c0.42,1.21,0.38,2.57-0.22,3.8L67.71,71.36l3.73,1.82l8.64-17.76c0.6-1.23,1.64-2.1,2.85-2.52c1.21-0.42,2.57-0.38,3.8,0.22 c1.23,0.6,2.1,1.65,2.52,2.86c0.41,1.21,0.38,2.57-0.22,3.8C81.34,75.6,73.65,91.42,65.95,107.24L65.95,107.24z M82.16,14.53 c-0.01,1.36-1.12,2.46-2.48,2.44c-1.36-0.01-2.46-1.12-2.44-2.48L77.3,2.58c0.01-1.36,1.12-2.46,2.48-2.44 c1.36,0.01,2.46,1.12,2.44,2.48L82.16,14.53L82.16,14.53z M95.14,14.37c-0.54,1.25-2,1.82-3.25,1.28c-1.25-0.54-1.82-2-1.28-3.25 l4.78-10.91c0.54-1.25,2-1.82,3.25-1.28c1.25,0.54,1.82,2,1.28,3.25L95.14,14.37L95.14,14.37z M100,26.05 c-1.11,0.79-2.65,0.54-3.44-0.57c-0.79-1.11-0.54-2.65,0.57-3.44l10.99-7.88c1.11-0.79,2.65-0.54,3.44,0.57 c0.79,1.11,0.54,2.65-0.57,3.44L100,26.05L100,26.05z"/>
    </svg>
  );
}


function ClapButton({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const { totalClaps, userClaps, clap } = useClaps(articleId);
  const [burst, setBurst] = useState(false);
  const [floatKey, setFloatKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClap = () => {
    if (!user) return;
    clap();
    setBurst(true);
    setFloatKey(k => k + 1);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setBurst(false), 300);
  };

  return (
    <div className="clap-wrap">
      <button
        className={`clap-btn${burst ? ' clap-btn--burst' : ''}${userClaps > 0 ? ' clap-btn--active' : ''}`}
        onClick={handleClap}
        disabled={!user || userClaps >= 50}
        title={user ? (userClaps >= 50 ? 'Maksimum alkış verildi' : 'Alkışla') : 'Alkışlamak için giriş yap'}
        aria-label="Alkışla"
      >
        <ClapIcon size={22} />
        {burst && floatKey > 0 && (
          <span key={floatKey} className="clap-float">+1</span>
        )}
      </button>
      <span className="clap-count">{totalClaps > 0 ? totalClaps : ''}</span>
      {userClaps > 0 && (
        <span className="clap-mine">{userClaps}/50</span>
      )}
    </div>
  );
}

const HIGHLIGHT_COLORS: { key: HighlightColor; label: string; bg: string }[] = [
  { key: 'yellow', label: 'Sarı', bg: '#fef08a' },
  { key: 'green',  label: 'Yeşil', bg: '#bbf7d0' },
  { key: 'blue',   label: 'Mavi', bg: '#bae6fd' },
  { key: 'pink',   label: 'Pembe', bg: '#fecdd3' },
];

function applyHighlightsToHtml(html: string, texts: { text: string; color: HighlightColor }[]): string {
  let result = html;
  for (const { text, color } of texts) {
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const rx = new RegExp(`(?<!<[^>]*)(${escaped})(?![^<]*>)`, 'g');
      result = result.replace(rx, `<mark class="hl hl--${color}" data-hl-text="${text.replace(/"/g, '&quot;')}">$1</mark>`);
    } catch { /* skip invalid regex */ }
  }
  return result;
}

export default function ArticlePage({ id, navigate, articles, seriesList }: ArticlePageProps) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const [hlTooltip, setHlTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [hlColor, setHlColor] = useState<HighlightColor>('yellow');
  const progress = useReadingProgressBar();
  const { scheduleSync } = useSaveReadingProgress(id);
  const [meteredCount, setMeteredCount] = useState(0);
  const [meteredLimit, setMeteredLimit] = useState(5);
  const [meteredEnabled, setMeteredEnabled] = useState(false);
  const { user } = useAuth();
  const { isBookmarked, toggle } = useBookmarks();
  const { highlights, addHighlight, removeHighlight } = useHighlights(id);
  const articleBodyRef = useRef<HTMLDivElement>(null);
  const index = articles.findIndex(a => a.id === id);
  const article = articles[index];
  const { isFollowing, toggling: followToggling, toggle: toggleFollow } = useFollow(user?.id, article?.authorId ?? null);
  const { totalClaps: headerClaps, userClaps: headerUserClaps, clap: headerClap } = useClaps(id);
  const { comments: headerComments } = useComments(id);
  const [headerClapBurst, setHeaderClapBurst] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({ tts: true, claps: true, highlights: true, comments: true });
  const [userMembershipTier, setUserMembershipTier] = useState<'free' | 'member' | 'founding'>('free');

  useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      supabase.from('site_settings').select('key, value')
        .in('key', ['feature_tts', 'feature_claps', 'feature_highlights', 'feature_comments', 'metered_enabled', 'metered_free_limit'])
        .then(({ data }) => {
          if (data) {
            const map: Record<string, string> = {};
            data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
            setFeatureFlags({
              tts: map['feature_tts'] !== 'false',
              claps: map['feature_claps'] !== 'false',
              highlights: map['feature_highlights'] !== 'false',
              comments: map['feature_comments'] !== 'false',
            });
            setMeteredEnabled(map['metered_enabled'] === 'true');
            setMeteredLimit(map['metered_free_limit'] ? parseInt(map['metered_free_limit']) : 5);
          }
        });
    });
  }, []);

  // Metered paywall: track articles read this month for anon users via localStorage
  useEffect(() => {
    if (user) return;
    const key = 'metered_reads_' + new Date().toISOString().slice(0, 7);
    try {
      const raw = localStorage.getItem(key);
      const reads: string[] = raw ? JSON.parse(raw) : [];
      if (!reads.includes(id)) { reads.push(id); localStorage.setItem(key, JSON.stringify(reads)); }
      setMeteredCount(reads.length);
    } catch { /* ignore */ }
  }, [id, user]);

  // Sync reading progress on scroll (every 5% change)
  useEffect(() => {
    if (progress > 0) scheduleSync(Math.round(progress));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.round(progress / 5) * 5]);

  useEffect(() => {
    if (!user) { setUserMembershipTier('free'); return; }
    import('../lib/supabase').then(({ supabase }) => {
      supabase.from('profiles').select('membership_tier, membership_expires_at').eq('id', user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            const expires = data.membership_expires_at;
            const isExpired = expires ? new Date(expires) < new Date() : false;
            setUserMembershipTier(isExpired ? 'free' : (data.membership_tier as 'free' | 'member' | 'founding') || 'free');
          }
        });
    });
  }, [user?.id]);

  // Friend link bypass: check ?fl=TOKEN in URL
  const friendLinkToken = useMemo(() => new URLSearchParams(window.location.search).get('fl'), []);
  const hasFriendLinkAccess = useMemo(
    () => !!friendLinkToken && !!article?.friendLinkToken && friendLinkToken === article.friendLinkToken,
    [friendLinkToken, article]
  );

  if (!article) {
    return (
      <main>
        <div style={{ padding: '3rem 2rem' }}>
          <p style={{ color: '#888' }}>Yazı bulunamadı.</p>
          <button className="btn-secondary" onClick={() => navigate('contents')} style={{ marginTop: '1rem' }}>
            <ArrowLeft size={15} /> İçeriklere Dön
          </button>
        </div>
      </main>
    );
  }

  const prevArticle = index > 0 ? articles[index - 1] : null;
  const nextArticle = index < articles.length - 1 ? articles[index + 1] : null;

  const formattedDate = new Date(article.date).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const paragraphs = article.content.split('\n\n').filter(Boolean);

  const ttsText = useMemo(() => {
    return article.title + '.\n\n' + article.content
      .split('\n\n')
      .filter(Boolean)
      .map(p => p
        .replace(/^#{1,3}\s+/, '')
        .replace(/^>{1}\s+/, '')
        .replace(/:::[\w\[\]|,. ]+\n?/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
      )
      .filter(p => p.length > 5)
      .join('\n\n');
  }, [article.content, article.title]);

  const tts = useTTS(ttsText);

  const shareUrl = `https://wetalks.tr/#yazi/${article.id}`;
  const shareText = `${article.title} — Orhan Balcı`;

  useSEO({
    title: article.title,
    description: article.excerpt,
    ogImage: article.ogImage,
    ogType: 'article',
    canonical: shareUrl,
    publishedTime: new Date(article.date).toISOString(),
    author: 'Orhan Balcı',
    section: article.category,
    tags: article.seriesTitle ? [article.category, article.seriesTitle] : [article.category],
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareOpen]);

  const handleTextSelect = useCallback(() => {
    if (!user || !featureFlags.highlights) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setHlTooltip(null);
      return;
    }
    const text = sel.toString().trim();
    if (text.length < 3 || text.length > 1000) return;
    // Only trigger inside article-body
    const range = sel.getRangeAt(0);
    const container = articleBodyRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) return;
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setHlTooltip({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text,
    });
  }, [user]);

  const handleHighlight = useCallback(async () => {
    if (!hlTooltip) return;
    await addHighlight(hlTooltip.text, hlColor);
    setHlTooltip(null);
    window.getSelection()?.removeAllRanges();
  }, [hlTooltip, hlColor, addHighlight]);

  const handleHighlightClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('hl') && target.dataset.hlText) {
      const found = highlights.find(h => h.selected_text === target.dataset.hlText);
      if (found) removeHighlight(found.id);
    }
  }, [highlights, removeHighlight]);

  const shareLinks = [
    {
      label: 'LinkedIn',
      icon: <Linkedin size={15} />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: '#0a66c2',
    },
    {
      label: 'X (Twitter)',
      icon: <Twitter size={15} />,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: '#000',
    },
    {
      label: 'Facebook',
      icon: <Facebook size={15} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: '#1877f2',
    },
    {
      label: 'WhatsApp',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.552 4.118 1.52 5.847L.057 23.882l6.204-1.438A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.848 0-3.577-.49-5.068-1.347l-.364-.214-3.684.854.88-3.576-.235-.38A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      ),
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      color: '#25d366',
    },
  ];

  // Series outline for "where am I" panel
  const seriesData = article.seriesId ? seriesList.find(s => s.id === article.seriesId) : null;
  const outline = seriesData?.outline ?? [];
  const seriesArticles = article.seriesId ? articles.filter(a => a.seriesId === article.seriesId) : [];
  const currentOutlineNode = findCurrentNode(outline, article.id);

  return (
    <main>
      <div className="reading-progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
      <button className="article-back" onClick={() => navigate(article.seriesId ? `series/${article.seriesId}` : 'contents')}>
        <ArrowLeft size={14} /> {article.seriesId ? 'Diziye Dön' : 'İçeriklere Dön'}
      </button>

      <header className="article-header">
        {/* Row 1: Badges */}
        {(article.membersOnly || article.featured || article.boosted) && (
          <div className="article-badges-row">
            {article.membersOnly && (
              <span className="article-badge article-badge--member">
                <Star size={13} fill="currentColor" />
                Üyelere Özel
              </span>
            )}
            {article.featured && (
              <span className="article-badge article-badge--featured">
                <Award size={13} />
                Öne Çıkan
              </span>
            )}
            {article.boosted && (
              <span className="article-badge article-badge--boosted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Editörün Seçimi
              </span>
            )}
          </div>
        )}

        {/* Row 2: Title + subtitle */}
        {article.supertitle && (
          <p className="article-supertitle">{article.supertitle}</p>
        )}
        <h1 className="article-title">{article.title}</h1>
        {article.subtitle && (
          <p className="article-subtitle">{article.subtitle}</p>
        )}

        {/* Row 3: Author + follow + meta */}
        <div className="article-author-meta">
          <div
            className="article-author-profile"
            style={{ cursor: article.authorId ? 'pointer' : 'default' }}
            onClick={() => {
              if (article.authorUsername) navigate(`@${article.authorUsername}`);
              else if (article.authorId) navigate(`author/${article.authorId}`);
            }}
          >
            <div className="article-author-avatar">
              {article.authorAvatar
                ? <img src={article.authorAvatar} alt={article.authorName ?? ''} />
                : <span>{article.authorName ? article.authorName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'OB'}</span>
              }
            </div>
            <div className="article-author-info">
              <div className="article-author-name-row">
                <span className="article-author-name">{article.authorName ?? 'Orhan Balcı'}</span>
                {article.authorId && user && user.id !== article.authorId && (
                  <button
                    className={`article-follow-btn${isFollowing ? ' article-follow-btn--following' : ''}`}
                    onClick={e => { e.stopPropagation(); toggleFollow(); }}
                    disabled={followToggling}
                  >
                    {isFollowing
                      ? <><UserCheck size={13} />Takip Ediliyor</>
                      : <><UserPlus size={13} />Takip Et</>
                    }
                  </button>
                )}
              </div>
              <div className="article-author-details">
                <span>{article.readingTime} dk okuma</span>
                <span className="article-meta-dot">·</span>
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Action bar */}
        <div className="article-action-bar">
          <div className="article-action-bar-left">
            <button
              className={`article-action-btn${headerUserClaps > 0 ? ' article-action-btn--active' : ''}${headerClapBurst ? ' article-action-btn--burst' : ''}`}
              onClick={() => {
                if (!user) return;
                headerClap();
                setHeaderClapBurst(true);
                setTimeout(() => setHeaderClapBurst(false), 300);
              }}
              title="Alkışla"
            >
              <ClapIcon size={20} />
              {headerClaps > 0 && <span>{headerClaps >= 1000 ? `${(headerClaps / 1000).toFixed(1)}K` : headerClaps}</span>}
            </button>
            <button
              className="article-action-btn"
              onClick={() => { const el = document.querySelector('.comments-section'); el?.scrollIntoView({ behavior: 'smooth' }); }}
              title="Yorumlar"
            >
              <MessageCircle size={20} />
              {headerComments.length > 0 && <span>{headerComments.length}</span>}
            </button>
          </div>

          <div className="article-action-bar-right">
            {user && (
              <button
                className={`article-action-btn${isBookmarked('article', article.id) ? ' article-action-btn--active' : ''}`}
                onClick={() => toggle('article', article.id)}
                title={isBookmarked('article', article.id) ? 'Kaydedildi' : 'Kaydet'}
              >
                {isBookmarked('article', article.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            )}
            {tts.supported && featureFlags.tts && (
              <button
                className={`article-action-btn${tts.state !== 'idle' ? ' article-action-btn--active' : ''}`}
                onClick={() => tts.state === 'idle' || tts.state === 'paused' ? tts.play() : tts.pause()}
                title={tts.state === 'playing' ? 'Duraklat' : 'Sesli Oku'}
              >
                {tts.state === 'playing' ? <Pause size={20} /> : <Volume2 size={20} />}
              </button>
            )}
            <div className="share-dropdown-wrap" ref={shareRef}>
              <button
                className={`article-action-btn${shareOpen ? ' article-action-btn--active' : ''}`}
                onClick={() => setShareOpen(o => !o)}
                title="Paylaş"
              >
                <Share2 size={20} />
              </button>
              {shareOpen && (
                <div className="share-dropdown">
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="share-dropdown-item"
                    onClick={() => setShareOpen(false)}
                  >
                    <Twitter size={16} /> X / Twitter
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="share-dropdown-item"
                    onClick={() => setShareOpen(false)}
                  >
                    <Linkedin size={16} /> LinkedIn
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="share-dropdown-item"
                    onClick={() => setShareOpen(false)}
                  >
                    <Facebook size={16} /> Facebook
                  </a>
                  <button
                    className="share-dropdown-item"
                    onClick={() => { handleCopy(); setShareOpen(false); }}
                  >
                    {copied ? <Check size={16} /> : <Link2 size={16} />}
                    {copied ? 'Kopyalandı!' : 'Bağlantıyı kopyala'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="article-body-wrap">
        <div className={`article-cover${article.ogImage ? '' : ' article-cover-blank'}`}>
          {article.ogImage && <img src={article.ogImage} alt={article.title} />}
        </div>
        <div
          className="article-body"
          ref={articleBodyRef}
          onMouseUp={handleTextSelect}
          onTouchEnd={handleTextSelect}
          onClick={handleHighlightClick}
          style={{ position: 'relative' }}
        >
          {featureFlags.highlights && hlTooltip && (
            <div
              className="hl-tooltip"
              style={{ left: hlTooltip.x, top: hlTooltip.y }}
              onMouseDown={e => e.preventDefault()}
            >
              <div className="hl-tooltip-colors">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c.key}
                    className={`hl-color-btn${hlColor === c.key ? ' hl-color-btn--active' : ''}`}
                    style={{ background: c.bg }}
                    onClick={() => setHlColor(c.key)}
                    title={c.label}
                  />
                ))}
              </div>
              <button className="hl-confirm-btn" onClick={handleHighlight}>
                <Highlighter size={13} /> Vurgula
              </button>
              <button className="hl-close-btn" onClick={() => setHlTooltip(null)}>
                <X size={13} />
              </button>
            </div>
          )}
          {(article.membersOnly && !(user && (userMembershipTier === 'member' || userMembershipTier === 'founding')) && !hasFriendLinkAccess ? paragraphs.slice(0, 3) : paragraphs).map((para, i) => {
            // H3
            if (para.startsWith('### ')) {
              return <h3 key={i} className="article-subheading-3">{para.slice(4)}</h3>;
            }
            // H2
            if (para.startsWith('## ')) {
              return <h2 key={i} className="article-subheading">{para.slice(3)}</h2>;
            }
            // Legacy bold-only H2
            if (para.startsWith('**') && para.endsWith('**') && para.split('**').length === 3) {
              return <h2 key={i} className="article-subheading">{para.slice(2, -2)}</h2>;
            }
            // Horizontal rule
            if (para.trim() === '---') {
              return <hr key={i} className="article-hr" />;
            }
            // Image
            const imgMatch = para.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
            if (imgMatch) {
              return (
                <figure key={i} className="article-figure">
                  <img src={imgMatch[2]} alt={imgMatch[1]} className="article-figure-img" />
                  {imgMatch[1] && <figcaption className="article-figure-caption">{imgMatch[1]}</figcaption>}
                </figure>
              );
            }
            // Key Highlight block: :::highlight[emoji|type] content:::
            const hlMatch = para.match(/^:::highlight\[([^\]]*)\]([\s\S]*):::$/);
            if (hlMatch) {
              const meta = hlMatch[1];
              const body = hlMatch[2].trim();
              const [emoji, type] = meta.includes('|') ? meta.split('|') : [meta, 'default'];
              const titleMatch = body.match(/^\*\*([^*]+)\*\*:?\s*([\s\S]*)$/);
              const title = titleMatch ? titleMatch[1] : null;
              const desc = titleMatch ? titleMatch[2].trim() : body;
              return (
                <div key={i} className={`article-highlight article-highlight--${type || 'default'}`}>
                  {emoji && <span className="article-highlight-icon">{emoji}</span>}
                  <div className="article-highlight-body">
                    {title && <span className="article-highlight-title">{title}</span>}
                    {desc && <span className="article-highlight-desc"> {desc}</span>}
                  </div>
                </div>
              );
            }
            // Callout box: :::callout[Başlık] içerik:::
            const calloutMatch = para.match(/^:::callout\[([^\]]*)\]([\s\S]*):::$/);
            if (calloutMatch) {
              const title = calloutMatch[1].trim();
              const body = calloutMatch[2].trim();
              const processed = body
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>');
              return (
                <div key={i} className="article-callout">
                  {title && <div className="article-callout-title">{title}</div>}
                  <div className="article-callout-body" dangerouslySetInnerHTML={{ __html: processed }} />
                </div>
              );
            }
            // Stat card: :::stat[Değer|Açıklama]:::
            const statMatch = para.match(/^:::stat\[([^|]+)\|([^\]]+)\]:::$/);
            if (statMatch) {
              return (
                <div key={i} className="article-stat">
                  <span className="article-stat-value">{statMatch[1].trim()}</span>
                  <span className="article-stat-label">{statMatch[2].trim()}</span>
                </div>
              );
            }
            // Multi-stat row: :::stats[V1|L1, V2|L2, ...]:::
            const statsMatch = para.match(/^:::stats\[([^\]]+)\]:::$/);
            if (statsMatch) {
              const items = statsMatch[1].split(',').map(s => s.trim());
              return (
                <div key={i} className="article-stats-row">
                  {items.map((item, si) => {
                    const [val, lbl] = item.split('|').map(s => s.trim());
                    return (
                      <div key={si} className="article-stat article-stat--inline">
                        <span className="article-stat-value">{val}</span>
                        <span className="article-stat-label">{lbl}</span>
                      </div>
                    );
                  })}
                </div>
              );
            }
            // Pullquote: > text
            if (para.startsWith('> ')) {
              const lines = para.split('\n').map(l => l.replace(/^>\s?/, '').trim()).filter(Boolean);
              const quoteText = lines.slice(0, lines.length - 1).join(' ') || lines[0];
              const attribution = lines.length > 1 ? lines[lines.length - 1] : null;
              const processed = quoteText
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>');
              return (
                <blockquote key={i} className="article-pullquote">
                  <p className="article-pullquote-text" dangerouslySetInnerHTML={{ __html: processed }} />
                  {attribution && <cite className="article-pullquote-cite">{attribution}</cite>}
                </blockquote>
              );
            }
            // Unordered list: lines starting with "- "
            if (para.split('\n').every(l => l.trim() === '' || l.match(/^- /))) {
              const items = para.split('\n').filter(l => l.match(/^- /));
              if (items.length > 0) {
                return (
                  <ul key={i} className="article-list-ul">
                    {items.map((item, li) => {
                      const processed = item.slice(2)
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>');
                      return <li key={li} dangerouslySetInnerHTML={{ __html: processed }} />;
                    })}
                  </ul>
                );
              }
            }
            // Ordered list: lines starting with "N. "
            if (para.split('\n').every(l => l.trim() === '' || l.match(/^\d+\. /))) {
              const items = para.split('\n').filter(l => l.match(/^\d+\. /));
              if (items.length > 0) {
                return (
                  <ol key={i} className="article-list-ol">
                    {items.map((item, li) => {
                      const processed = item.replace(/^\d+\. /, '')
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>');
                      return <li key={li} dangerouslySetInnerHTML={{ __html: processed }} />;
                    })}
                  </ol>
                );
              }
            }
            // Code block: ```...```
            if (para.startsWith('```') && para.endsWith('```') && para.length > 6) {
              const inner = para.slice(3, -3);
              const firstNewline = inner.indexOf('\n');
              const lang = firstNewline > 0 ? inner.slice(0, firstNewline).trim() : '';
              const code = firstNewline > 0 ? inner.slice(firstNewline + 1) : inner;
              return (
                <div key={i} className="article-code-block">
                  {lang && <span className="article-code-lang">{lang}</span>}
                  <pre><code>{code}</code></pre>
                </div>
              );
            }
            // Default paragraph with inline formatting + highlights
            let processed = para
              .replace(/`([^`]+)`/g, '<code class="article-code-inline">$1</code>')
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.+?)\*/g, '<em>$1</em>');
            if (highlights.length > 0) {
              processed = applyHighlightsToHtml(processed, highlights.map(h => ({ text: h.selected_text, color: h.color })));
            }
            return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />;
          })}

          {/* Paywall gate */}
          {article.membersOnly && !(user && (userMembershipTier === 'member' || userMembershipTier === 'founding')) && !hasFriendLinkAccess && (
            <div className="paywall-gate">
              <div className="paywall-blur-overlay" />
              <div className="paywall-card">
                <div className="paywall-lock">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="paywall-title">Bu içerik üyelere özel</h3>
                {user ? (
                  <p className="paywall-desc">Bu içeriğe erişmek için ücretli üyelik gerekiyor.</p>
                ) : (
                  <p className="paywall-desc">Devamını okumak için üye olun. Tüm içeriklere sınırsız erişim.</p>
                )}
                <div className="paywall-actions">
                  {!user && (
                    <>
                      <button className="paywall-btn paywall-btn--primary" onClick={() => navigate('register')}>
                        Üye Ol
                      </button>
                      <button className="paywall-btn paywall-btn--secondary" onClick={() => navigate('login')}>
                        Giriş Yap
                      </button>
                    </>
                  )}
                  {user && (
                    <button className="paywall-btn paywall-btn--primary" onClick={() => navigate('profile')}>
                      Üyeliğimi Yönet
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Metered paywall gate — anon users who exceeded monthly free reads */}
          {meteredEnabled && !user && !article.membersOnly && meteredCount > meteredLimit && (
            <div className="paywall-gate">
              <div className="paywall-blur-overlay" />
              <div className="paywall-card">
                <div className="paywall-lock">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <h3 className="paywall-title">Aylık okuma limitine ulaştın</h3>
                <p className="paywall-desc">Bu ay {meteredLimit} ücretsiz makale okudun. Devam etmek için üye ol — tamamen ücretsiz.</p>
                <div className="paywall-actions">
                  <button className="paywall-btn paywall-btn--primary" onClick={() => navigate('register')}>Ücretsiz Üye Ol</button>
                  <button className="paywall-btn paywall-btn--secondary" onClick={() => navigate('login')}>Giriş Yap</button>
                </div>
              </div>
            </div>
          )}
        </div>
        {featureFlags.claps && (
          <>
            <div className="article-divider" />
            <div className="clap-section">
              <ClapButton articleId={article.id} />
              {!user && (
                <p className="clap-login-hint">Alkışlamak için <button onClick={() => navigate('login')} className="clap-login-link">giriş yap</button></p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Series position panel */}
      {seriesData && outline.length > 0 && (
        <div className="article-series-position">
          <div className="article-series-position-header">
            <button
              className="article-series-position-title"
              onClick={() => navigate(`series/${seriesData.id}`)}
            >
              {seriesData.title}
            </button>
            {currentOutlineNode && (
              <span className="article-series-position-sub">
                {currentOutlineNode.order}. madde &middot; {outline.length} bölümden
              </span>
            )}
          </div>

          <div className="aop-list">
            {outline.map(node => (
              <ArticleOutlineRow
                key={node.id}
                node={node}
                currentArticleId={article.id}
                articles={seriesArticles}
                navigate={navigate}
                depth={0}
              />
            ))}
          </div>
        </div>
      )}

      <div className="article-share-row">
        <span className="article-share-label">Bu yazıyı paylaş:</span>
        <div className="article-share-btns">
          {shareLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn"
              style={{ '--share-color': s.color } as React.CSSProperties}
              title={s.label}
            >
              {s.icon}
              <span className="share-btn-label">{s.label}</span>
            </a>
          ))}
          <button
            className={`share-btn share-btn-copy ${copied ? 'share-btn-copied' : ''}`}
            onClick={handleCopy}
            title="Linki kopyala"
          >
            {copied ? <Check size={15} /> : <Link2 size={15} />}
            <span className="share-btn-label">{copied ? 'Kopyalandı!' : 'Linki Kopyala'}</span>
          </button>
        </div>
      </div>

      {featureFlags.comments && (
        <div className="comments-section" style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem' }}>
          <Comments articleId={article.id} navigate={navigate} />
        </div>
      )}

      <nav className="article-nav">
        {prevArticle ? (
          <button className="article-nav-btn article-nav-prev" onClick={() => navigate(`article/${prevArticle.id}`)}>
            <span className="article-nav-label"><ArrowLeft size={12} /> Önceki</span>
            <span className="article-nav-title">{prevArticle.title}</span>
          </button>
        ) : <div />}
        {nextArticle ? (
          <button className="article-nav-btn article-nav-next" onClick={() => navigate(`article/${nextArticle.id}`)}>
            <span className="article-nav-label">Sonraki <ArrowRight size={12} /></span>
            <span className="article-nav-title">{nextArticle.title}</span>
          </button>
        ) : <div />}
      </nav>

      {/* Suggested Authors */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
        <SuggestedAuthors navigate={navigate} excludeAuthorId={article.authorId} limit={3} />
      </div>

      {/* Related articles */}
      {(() => {
        const related = articles
          .filter(a => a.id !== article.id && (a.category === article.category || a.seriesId === article.seriesId))
          .slice(0, 3);
        if (related.length === 0) return null;
        return (
          <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: '0 0 1.25rem', letterSpacing: '-0.01em' }}>
              Benzer Yazılar
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {related.map(r => (
                <button
                  key={r.id}
                  onClick={() => navigate(`article/${r.id}`)}
                  style={{
                    textAlign: 'left', background: '#fff',
                    border: '1px solid #e5e7eb', borderRadius: 12,
                    overflow: 'hidden', cursor: 'pointer',
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                    fontFamily: 'Inter, sans-serif', padding: 0,
                    display: 'flex', flexDirection: 'column',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                  }}
                >
                  {r.ogImage ? (
                    <img src={r.ogImage} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ width: '100%', height: 100, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={20} color="#d1d5db" />
                    </div>
                  )}
                  <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--accent, #0e8fa0)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {r.category}
                    </span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 'auto' }}>{r.readingTime} dk</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Floating TTS Player */}
      {tts.state !== 'idle' && (
        <div className="tts-player">
          <div className="tts-player-info">
            <Volume2 size={14} className="tts-player-icon" />
            <span className="tts-player-title">{article.title}</span>
            {tts.provider === 'openai' && (
              <span style={{ fontSize: '0.625rem', padding: '1px 5px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 4, fontWeight: 600, letterSpacing: '0.02em', flexShrink: 0 }}>AI</span>
            )}
          </div>

          <div className="tts-progress-bar">
            {tts.state === 'loading' ? (
              <div className="tts-progress-fill tts-progress-loading" style={{ width: '40%' }} />
            ) : (
              <div className="tts-progress-fill" style={{ width: `${tts.progress}%` }} />
            )}
          </div>

          <div className="tts-player-controls">
            <button
              className="tts-btn tts-btn--rate"
              onClick={() => tts.changeRate(tts.rate === 1 ? 1.25 : tts.rate === 1.25 ? 1.5 : tts.rate === 1.5 ? 2 : 1)}
              title="Okuma hızı"
              disabled={tts.state === 'loading'}
            >
              {tts.rate}×
            </button>
            <button
              className="tts-btn tts-btn--main"
              onClick={() => tts.state === 'playing' ? tts.pause() : tts.play()}
              title={tts.state === 'loading' ? 'Yükleniyor...' : tts.state === 'playing' ? 'Duraklat' : 'Devam'}
              disabled={tts.state === 'loading'}
            >
              {tts.state === 'loading' ? (
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : tts.state === 'playing' ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              className="tts-btn tts-btn--stop"
              onClick={tts.stop}
              title="Durdur"
            >
              <Square size={14} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
