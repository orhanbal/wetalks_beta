import { BookOpen } from 'lucide-react';
import SuggestedAuthors from '../components/SuggestedAuthors';
import PollWidget from '../components/PollWidget';
import FeaturedAuthorWidget from '../components/FeaturedAuthorWidget';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Article } from '../data/articles';
import type { Series, SeriesOutlineNode } from '../data/series';
import ArticleCard, { type ArticleBreadcrumb } from '../components/ArticleCard';
import SeriesCard from '../components/SeriesCard';
import { useSEO } from '../hooks/useSEO';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAuth } from '../hooks/useAuth';
import { useArticleClapsMap, useHeroSlides } from '../hooks/useData';
import { getCategoryColor } from '../lib/categoryColors';
import { supabase } from '../lib/supabase';

function findBreadcrumb(articleId: string, seriesList: Series[]): ArticleBreadcrumb | undefined {
  for (const s of seriesList) {
    if (!s.outline) continue;
    for (const chapter of s.outline) {
      const crumb = searchNode(articleId, chapter, s.title, chapter.title);
      if (crumb) return crumb;
    }
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

interface HomePageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
  settings: Record<string, string>;
}

// ── Slider orta panel: makale veya yazı dizisi ──────────────────────────────
function SliderMainPanel({
  slide,
  article,
  series,
  chapterTitle,
  progressBarColor,
  bottomBarColor,
  navigate,
}: {
  slide: { type: 'article' | 'series'; item_id: string };
  article?: Article;
  series?: Series;
  chapterTitle?: string;
  progressBarColor?: string | null;
  bottomBarColor?: string | null;
  navigate: (to: string) => void;
}) {
  if (slide.type === 'article' && article) {
    const catColor = getCategoryColor(article.category);
    return (
      <div className="wetalks-hero-main" onClick={() => navigate(`article/${article.id}`)}>
        <div className="wetalks-hero-image">
          {article.ogImage
            ? <img src={article.ogImage} alt={article.title} />
            : <div className="wetalks-hero-placeholder" />}
        </div>
        {/* Alt bar: makale bilgileri */}
        <div className="wetalks-hero-bottom-bar" style={bottomBarColor ? { background: bottomBarColor } : undefined}>
          <div className="wetalks-hero-bottom-bar-content">
            <span className="wetalks-hero-tag">
              <span className="wetalks-hero-tag-dot" style={{ background: catColor.dot }} />
              {article.category}
            </span>
            <h2 className="wetalks-hero-title">{article.title}</h2>
            <p className="wetalks-hero-excerpt">{article.excerpt}</p>
            <div className="wetalks-hero-meta">
              {article.authorName && (
                <span className="wetalks-hero-author">
                  <div className="wetalks-hero-avatar" style={{ overflow: article.authorAvatar ? 'hidden' : undefined }}>
                    {article.authorAvatar
                      ? <img src={article.authorAvatar} alt={article.authorName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : article.authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  {article.authorName}
                </span>
              )}
              <span className="wetalks-hero-date">
                {new Date(article.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slide.type === 'series' && series) {
    return (
      <div className="wetalks-hero-main" onClick={() => navigate(`series/${series.id}`)}>
        <div className="wetalks-hero-image">
          {series.ogImage
            ? <img src={series.ogImage} alt={series.title} />
            : <div className="wetalks-hero-placeholder" />}
        </div>
        {/* Alt bar: logo + slogan + bölüm adı */}
        <div className="wetalks-hero-bottom-bar" style={bottomBarColor ? { background: bottomBarColor } : undefined}>
          <div className="wetalks-series-bar-left">
            {series.logoUrl
              ? <img src={series.logoUrl} alt={series.title} className="wetalks-series-logo" />
              : <span className="wetalks-series-name-badge">{series.title}</span>}
            {series.tagline && (
              <>
                <div className="wetalks-series-top-divider" />
                <div className="wetalks-series-bar-info">
                  <span className="wetalks-hero-tag" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <BookOpen size={10} strokeWidth={2.5} style={{ marginRight: 4 }} />
                    Yazı Dizisi · {series.articleCount} bölüm
                  </span>
                  <span className="wetalks-series-tagline-badge">{series.tagline}</span>
                </div>
              </>
            )}
          </div>
          {chapterTitle && (
            <div className="wetalks-series-chapter-badge">{chapterTitle}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wetalks-hero-main">
      <div className="wetalks-hero-placeholder" />
    </div>
  );
}

// ── WeTalks 3-column hero + slider orta panel ─────────────────────────────
function MagazineHero({
  articles,
  seriesList,
  recent,
  navigate,
  homepagePollId,
  heroRightArticle,
  heroRightAuthorId,
}: {
  articles: Article[];
  seriesList: Series[];
  recent: Article[];
  navigate: (to: string) => void;
  homepagePollId?: string | null;
  heroRightArticle?: Article | null;
  heroRightAuthorId?: string | null;
}) {
  const { slides, loading: slidesLoading } = useHeroSlides();
  const [activeIdx, setActiveIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fallback: hero_slides boşsa featured/ilk makaleyi göster
  const fallbackArticle = articles.find(a => a.featured) ?? articles[0];
  const hasSlidesData = !slidesLoading && slides.length > 0;

  useEffect(() => { setActiveIdx(0); }, [slides.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % (hasSlidesData ? slides.length : 1));
      setProgressKey(k => k + 1);
    }, 5000);
  }, [hasSlidesData, slides.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const [progressKey, setProgressKey] = useState(0);

  const [paused, setPaused] = useState(false);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const resumeTimer = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const goTo = (idx: number) => {
    setActiveIdx(idx);
    setProgressKey(k => k + 1);
    resetTimer();
  };

  const currentSlide = hasSlidesData ? slides[activeIdx] : null;
  const currentArticle = currentSlide?.type === 'article'
    ? articles.find(a => a.id === currentSlide.item_id)
    : !hasSlidesData ? fallbackArticle : undefined;
  const currentSeries = currentSlide?.type === 'series'
    ? seriesList.find(s => s.id === currentSlide.item_id)
    : undefined;

  // Bölüm adı: aktif slide'dan geliyor
  const chapterTitle = hasSlidesData ? (slides[activeIdx]?.chapterTitle ?? null) : null;

  return (
    <>
    <div className="wetalks-hero">
      {/* Sol: 3 mini kart listesi */}
      <div className="wetalks-hero-left">
        {recent.slice(0, 3).map((article) => {
          const c = getCategoryColor(article.category);
          return (
            <div key={article.id} className="wetalks-mini-item" onClick={() => navigate(`article/${article.id}`)}>
              <div className="wetalks-mini-thumb">
                {article.ogImage
                  ? <img src={article.ogImage} alt={article.title} />
                  : <div className="wetalks-mini-placeholder" />}
              </div>
              <div className="wetalks-mini-body">
                <span className="cat-pill cat-pill--sm">
                  <span className="cat-pill-dot" style={{ background: c.dot }} />
                  {article.category}
                </span>
                <h4 className="wetalks-mini-title">{article.title}</h4>
                <span className="wetalks-mini-date">
                  {new Date(article.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orta: slider */}
      <div
        className="wetalks-hero-center"
        onMouseEnter={() => { setPaused(true); pauseTimer(); }}
        onMouseLeave={() => { setPaused(false); resumeTimer(); }}
      >
        {hasSlidesData ? (
          <div className="wetalks-slide-stack">
            {/* Progress bar */}
            {slides.length > 1 && (
              <div className="wetalks-progress-track">
                <div
                  key={progressKey}
                  className="wetalks-progress-fill"
                  style={{
                    ...(slides[activeIdx]?.progressBarColor ? { background: slides[activeIdx].progressBarColor! } : {}),
                    animationPlayState: paused ? 'paused' : 'running',
                  }}
                />
              </div>
            )}
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`wetalks-slide ${idx === activeIdx ? 'wetalks-slide--active' : ''}`}
              >
                <SliderMainPanel
                  slide={slide}
                  article={articles.find(a => a.id === slide.item_id)}
                  series={seriesList.find(s => s.id === slide.item_id)}
                  chapterTitle={slide.chapterTitle ?? undefined}
                  progressBarColor={slide.progressBarColor}
                  bottomBarColor={slide.bottomBarColor}
                  navigate={navigate}
                />
              </div>
            ))}
          </div>
        ) : fallbackArticle ? (
          <SliderMainPanel
            slide={{ type: 'article', item_id: fallbackArticle.id }}
            article={fallbackArticle}
            navigate={navigate}
          />
        ) : (
          <div className="wetalks-hero-main">
            <div className="wetalks-hero-placeholder" />
          </div>
        )}

        {/* Slider dots — sadece birden fazla slide varsa */}
        {hasSlidesData && slides.length > 1 && (
          <div className="wetalks-slider-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`wetalks-dot ${idx === activeIdx ? 'wetalks-dot--active' : ''}`}
                onClick={() => goTo(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sağ: anket > öne çıkan yazar > seçili/4. makale kartı — desktop */}
      <div className="wetalks-hero-right">
        {homepagePollId ? (
          <PollWidget pollId={homepagePollId} />
        ) : heroRightAuthorId ? (
          <FeaturedAuthorWidget authorId={heroRightAuthorId} onNavigate={navigate} />
        ) : heroRightArticle && (() => {
          const a = heroRightArticle;
          const c = getCategoryColor(a.category);
          const excerptShort = a.excerpt ? a.excerpt.slice(0, 120) + (a.excerpt.length > 120 ? '…' : '') : '';
          return (
            <div className="wetalks-right-featured wetalks-right-featured--rich" onClick={() => navigate(`article/${a.id}`)}>
              <div className="wetalks-right-image">
                {a.ogImage
                  ? <img src={a.ogImage} alt={a.title} />
                  : <div className="wetalks-mini-placeholder" />}
              </div>
              <div className="wetalks-right-body">
                <span className="cat-pill cat-pill--sm">
                  <span className="cat-pill-dot" style={{ background: c.dot }} />
                  {a.category}
                </span>
                <h4 className="wetalks-right-title">{a.title}</h4>
                {excerptShort && (
                  <p className="wetalks-right-excerpt">{excerptShort}</p>
                )}
              </div>
              {(a.authorName || a.authorAvatar) && (
                <div className="wetalks-right-author">
                  {a.authorAvatar
                    ? <img src={a.authorAvatar} alt={a.authorName ?? ''} className="wetalks-right-author-avatar" />
                    : <div className="wetalks-right-author-avatar wetalks-right-author-avatar--placeholder" />}
                  <div className="wetalks-right-author-info">
                    <span className="wetalks-right-author-name">{a.authorName}</span>
                    <span className="wetalks-right-author-date">
                      {new Date(a.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              )}
              {!a.authorName && (
                <span className="wetalks-mini-date wetalks-mini-date--bottom">
                  {new Date(a.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          );
        })()}
      </div>
    </div>

    {/* Tablet/mobil: anket hero altında tam genişlikte */}
    {homepagePollId && (
      <div className="wetalks-hero-poll-mobile">
        <PollWidget pollId={homepagePollId} />
      </div>
    )}
    </>
  );
}

// ── Section header: büyük dot + başlık + View All
function SectionHeader({ title, dotColor, onViewAll }: {
  title: string;
  dotColor?: string;
  onViewAll?: () => void;
}) {
  return (
    <div className="mag-section-header">
      <div className="mag-section-header-left">
        <span className="mag-section-dot" style={{ background: dotColor ?? 'var(--accent, #3b82f6)' }} />
        <h2 className="mag-section-title">{title}</h2>
      </div>
      {onViewAll && (
        <button className="section-link" onClick={onViewAll}>
          View All <span className="section-link-dots">•••</span>
        </button>
      )}
    </div>
  );
}

// ── Tag section: overlay (5'li yatay) veya 4'lü grid
function TagSection({ tag, articles, navigate, isBookmarked, toggle, user, clapsMap }: {
  tag: string;
  articles: Article[];
  navigate: (to: string) => void;
  isBookmarked: (type: string, id: string) => boolean;
  toggle: (type: string, id: string) => void;
  user: unknown;
  clapsMap: Record<string, number>;
}) {
  const c = getCategoryColor(tag);
  const filtered = articles.filter(a => a.category === tag);
  if (!filtered.length) return null;

  // 5+ makale varsa overlay (yatay scroll), yoksa 4-sütun grid
  const useOverlay = filtered.length >= 4;
  const shown = filtered.slice(0, useOverlay ? 5 : 4);

  return (
    <div className="tag-section">
      <SectionHeader
        title={tag}
        dotColor={c.dot}
        onViewAll={() => navigate(`tag/${encodeURIComponent(tag)}`)}
      />
      {useOverlay ? (
        <div className="mag-overlay-row">
          {shown.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              navigate={navigate}
              bookmarked={isBookmarked('article', article.id)}
              onBookmark={user ? () => toggle('article', article.id) : undefined}
              claps={clapsMap[article.id] ?? 0}
              variant="overlay"
            />
          ))}
        </div>
      ) : (
        <div className="mag-grid-4">
          {shown.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              navigate={navigate}
              bookmarked={isBookmarked('article', article.id)}
              onBookmark={user ? () => toggle('article', article.id) : undefined}
              claps={clapsMap[article.id] ?? 0}
              variant="vertical"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage({ navigate, articles, seriesList, settings }: HomePageProps) {
  useSEO({ ogType: 'website', canonical: 'https://obtalks.tr' });
  const { user } = useAuth();
  const { isBookmarked, toggle } = useBookmarks();

  const isClassic = settings?.['homepage_layout'] === 'classic';
  const showFeaturedHero = settings?.['show_featured_hero'] !== 'false';
  const showLatestSection = settings?.['show_latest_section'] !== 'false';
  const showTagSections = settings?.['show_tag_sections'] === 'true';
  const showSeriesSection = settings?.['show_series_section'] !== 'false';
  const showAuthorsSection = settings?.['show_authors_section'] !== 'false';
  const featureBoost = settings?.['feature_boost'] !== 'false';

  let tagSectionsList: string[] = [];
  try {
    const raw = settings?.['tag_sections_list'];
    if (raw) tagSectionsList = JSON.parse(raw);
  } catch { /* ignore */ }

  const featuredArticles = articles.filter(a => a.featured);
  const boostedArticles = articles.filter(a => a.boosted);
  const latestArticles = articles.slice(0, isClassic ? 5 : 6);
  const rawPollId = settings?.['poll_homepage_id'] || null;
  const [homepagePollId, setHomepagePollId] = useState<string | null>(rawPollId);

  useEffect(() => {
    if (!rawPollId) { setHomepagePollId(null); return; }
    supabase.from('polls').select('ends_at').eq('id', rawPollId).maybeSingle().then(({ data }) => {
      if (!data) { setHomepagePollId(null); return; }
      const expired = data.ends_at && new Date(data.ends_at) < new Date();
      setHomepagePollId(expired ? null : rawPollId);
    });
  }, [rawPollId]);

  // Tüm claps için ID listesi
  const allIds = [...new Set([
    ...latestArticles.map(a => a.id),
    ...boostedArticles.slice(0, 3).map(a => a.id),
    ...tagSectionsList.flatMap(tag => articles.filter(a => a.category === tag).slice(0, 3).map(a => a.id)),
    ...featuredArticles.slice(0, 4).map(a => a.id),
    ...articles.slice(0, 4).map(a => a.id),
  ])];
  const clapsMap = useArticleClapsMap(allIds);

  const heroFeatured = featuredArticles[0] ?? articles[0];
  const heroRecent = articles.filter(a => a.id !== heroFeatured?.id).slice(0, 4);

  // Hero sol panel: admin'den seçili makaleler varsa onları kullan, yoksa son 4
  let heroSideArticles = heroRecent;
  const sideIdsRaw = settings?.['hero_side_ids'];
  if (sideIdsRaw) {
    try {
      const ids: string[] = JSON.parse(sideIdsRaw);
      const byId = ids.map(id => articles.find(a => a.id === id)).filter(Boolean) as Article[];
      if (byId.length > 0) {
        // 3 kartın tamamı seçilmemişse kalan kısımları heroRecent ile tamamla
        const usedIds = new Set(byId.map(a => a.id));
        const fallback = heroRecent.filter(a => !usedIds.has(a.id));
        heroSideArticles = [...byId, ...fallback].slice(0, 4);
      }
    } catch { /* ignore */ }
  }

  // Hero sağ panel: admin'den seçili makale varsa onu, yoksa heroSideArticles[3]
  const rightArticleId = settings?.['hero_right_article_id'];
  const heroRightArticle = (rightArticleId ? articles.find(a => a.id === rightArticleId) : null)
    ?? heroSideArticles[3]
    ?? null;

  // Hero sağ panel yazar: admin'den seçili yazar ID'si
  const heroRightAuthorId = settings?.['hero_right_author_id'] || null;

  if (isClassic) {
    return (
      <main>
        {featuredArticles.length > 0 && showFeaturedHero && heroFeatured && (
          <div className="magazine-hero-wrap">
            <div className="page-container">
              <MagazineHero
                articles={articles}
                seriesList={seriesList}
                recent={heroSideArticles}
                navigate={navigate}
                homepagePollId={homepagePollId}
                heroRightArticle={heroRightArticle}
                heroRightAuthorId={heroRightAuthorId}
              />
            </div>
          </div>
        )}
        {showLatestSection && (
          <div className="article-list">
            {latestArticles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                navigate={navigate}
                breadcrumb={findBreadcrumb(article.id, seriesList)}
                bookmarked={isBookmarked('article', article.id)}
                onBookmark={user ? () => toggle('article', article.id) : undefined}
                claps={clapsMap[article.id] ?? 0}
              />
            ))}
          </div>
        )}
        {showSeriesSection && seriesList.length > 0 && (
          <>
            <div className="divider-full" />
            <div className="section">
              <SectionHeader title="Yazı Dizileri" dotColor="#3b82f6" onViewAll={() => navigate('contents')} />
              <div className="series-grid">
                {seriesList.map(s => (
                  <SeriesCard key={s.id} series={s} navigate={navigate}
                    bookmarked={isBookmarked('series', s.id)}
                    onBookmark={user ? () => toggle('series', s.id) : undefined} />
                ))}
              </div>
            </div>
          </>
        )}
        {showAuthorsSection && (
          <>
            <div className="divider-full" />
            <div className="section"><SuggestedAuthors navigate={navigate} limit={4} /></div>
          </>
        )}
      </main>
    );
  }

  // ── Magazine Layout ─────────────────────────────────────────────────────
  // Hero'nun hemen altında gösterilecek 4 öne çıkan makale
  let featuredStripFilled: typeof articles = [];
  const stripIdsRaw = settings?.['featured_strip_ids'];
  if (stripIdsRaw) {
    try {
      const ids: string[] = JSON.parse(stripIdsRaw);
      const byId = ids.map(id => articles.find(a => a.id === id)).filter(Boolean) as typeof articles;
      featuredStripFilled = byId.slice(0, 4);
    } catch { /* ignore */ }
  }
  if (featuredStripFilled.length < 4) {
    const usedIds = new Set(featuredStripFilled.map(a => a.id));
    const fallback = articles.filter(a => !usedIds.has(a.id));
    const featured = fallback.filter(a => a.featured);
    const rest = fallback.filter(a => !a.featured);
    const pool = [...featured, ...rest];
    featuredStripFilled = [...featuredStripFilled, ...pool.slice(0, 4 - featuredStripFilled.length)];
  }

  return (
    <main>
      {/* Magazine Hero with Slider */}
      {showFeaturedHero && (articles.length > 0 || true) && (
        <div className="magazine-hero-wrap">
          <div className="page-container">
            <MagazineHero
              articles={articles}
              seriesList={seriesList}
              recent={heroSideArticles}
              navigate={navigate}
              homepagePollId={homepagePollId}
              heroRightArticle={heroRightArticle}
              heroRightAuthorId={heroRightAuthorId}
            />
          </div>
        </div>
      )}

      {featuredStripFilled.length > 0 && (
        <div className="featured-strip-wrap">
          <div className="page-container">
            <div className="featured-strip">
              {featuredStripFilled.slice(0, 4).map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  navigate={navigate}
                  bookmarked={isBookmarked('article', article.id)}
                  onBookmark={user ? () => toggle('article', article.id) : undefined}
                  claps={clapsMap[article.id] ?? 0}
                  variant="text-card"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editörün Seçimi — overlay yatay */}
      {featureBoost && boostedArticles.length > 0 && (
        <>
          <section className="section">
            <SectionHeader
              title="Editörün Seçimi"
              dotColor="#f97316"
            />
            <div className="mag-overlay-row">
              {boostedArticles.slice(0, 5).map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  navigate={navigate}
                  breadcrumb={findBreadcrumb(article.id, seriesList)}
                  bookmarked={isBookmarked('article', article.id)}
                  onBookmark={user ? () => toggle('article', article.id) : undefined}
                  claps={clapsMap[article.id] ?? 0}
                  variant="overlay"
                />
              ))}
            </div>
          </section>
          <div className="divider-full" />
        </>
      )}

      {/* Son Yazılar — 2 sütun list grid */}
      {showLatestSection && latestArticles.length > 0 && (
        <>
          <section className="section">
            <SectionHeader
              title="Son Yazılar"
              dotColor="#3b82f6"
              onViewAll={() => navigate('contents')}
            />
            <div className="mag-latest-4col">
              {latestArticles.slice(0, 8).map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  navigate={navigate}
                  breadcrumb={findBreadcrumb(article.id, seriesList)}
                  bookmarked={isBookmarked('article', article.id)}
                  onBookmark={user ? () => toggle('article', article.id) : undefined}
                  claps={clapsMap[article.id] ?? 0}
                  variant="vertical"
                />
              ))}
            </div>
          </section>
          <div className="divider-full" />
        </>
      )}

      {/* Etikete göre section'lar */}
      {showTagSections && tagSectionsList.length > 0 && (
        <>
          {tagSectionsList.map(tag => (
            <div key={tag}>
              <section className="section">
                <TagSection
                  tag={tag}
                  articles={articles}
                  navigate={navigate}
                  isBookmarked={isBookmarked}
                  toggle={toggle}
                  user={user}
                  clapsMap={clapsMap}
                />
              </section>
              <div className="divider-full" />
            </div>
          ))}
        </>
      )}

      {/* Yazı Dizileri */}
      {showSeriesSection && seriesList.length > 0 && (
        <>
          <section className="section">
            <SectionHeader
              title="Yazı Dizileri"
              dotColor="#3b82f6"
              onViewAll={() => navigate('contents')}
            />
            <div className="series-grid">
              {seriesList.map(s => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  navigate={navigate}
                  bookmarked={isBookmarked('series', s.id)}
                  onBookmark={user ? () => toggle('series', s.id) : undefined}
                />
              ))}
            </div>
          </section>
          <div className="divider-full" />
        </>
      )}

      {/* Önerilen Yazarlar */}
      {showAuthorsSection && (
        <div className="section">
          <SuggestedAuthors navigate={navigate} limit={4} />
        </div>
      )}
    </main>
  );
}
