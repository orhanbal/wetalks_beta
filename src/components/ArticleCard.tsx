import { ChevronRight, Bookmark } from 'lucide-react';
import type { Article } from '../data/articles';
import { getCategoryColor } from '../lib/categoryColors';

export interface ArticleBreadcrumb {
  seriesTitle: string;
  chapterTitle: string;
  parentTitle?: string;
  childTitle?: string;
}

interface ArticleCardProps {
  article: Article;
  navigate: (to: string) => void;
  breadcrumb?: ArticleBreadcrumb;
  bookmarked?: boolean;
  onBookmark?: (e: React.MouseEvent) => void;
  claps?: number;
  variant?: 'row' | 'vertical' | 'mini' | 'overlay' | 'text-card';
}

function CategoryPill({ category, size = 'md' }: { category: string | undefined; size?: 'sm' | 'md' }) {
  const c = getCategoryColor(category);
  return (
    <span className={`cat-pill${size === 'sm' ? ' cat-pill--sm' : ''}`}>
      <span className="cat-pill-dot" style={{ background: c.dot }} />
      {category}
    </span>
  );
}

export default function ArticleCard({ article, navigate, breadcrumb, bookmarked, onBookmark, claps, variant = 'row' }: ArticleCardProps) {
  const formattedDate = new Date(article.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const shortDate = new Date(article.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const thumb = article.ogImage;
  const authorName = article.authorName ?? '';
  const initials = authorName
    ? authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (article.authorUsername) navigate(`@${article.authorUsername}`);
    else if (article.authorId) navigate(`author/${article.authorId}`);
  };

  const bookmarkBtn = onBookmark && (
    <button
      className={`bookmark-btn${bookmarked ? ' bookmark-btn--active' : ''}`}
      onClick={(e) => { e.stopPropagation(); onBookmark(e); }}
      title={bookmarked ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
      aria-label={bookmarked ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
    >
      <Bookmark size={14} />
    </button>
  );

  const authorChip = (
    <button className="author-chip" onClick={handleAuthorClick} disabled={!article.authorId}>
      <div className="author-avatar" style={{ padding: article.authorAvatar ? 0 : undefined, overflow: 'hidden' }}>
        {article.authorAvatar
          ? <img src={article.authorAvatar} alt={authorName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : initials}
      </div>
      {authorName && <span className="author-name">{authorName}</span>}
    </button>
  );

  // ── Overlay variant: görsel tam, sol altta kategori pill + başlık + dk okuma
  if (variant === 'overlay') {
    return (
      <article className="article-overlay" onClick={() => navigate(`article/${article.id}`)}>
        <div className="article-overlay-image">
          {thumb && <img src={thumb} alt={article.title} />}
          {!thumb && <div className="article-overlay-placeholder" />}
          <div className="article-overlay-gradient" />
        </div>
        <div className="article-overlay-content">
          <CategoryPill category={article.category} size="sm" />
          <h3 className="article-overlay-title">{article.title}</h3>
          <span className="article-overlay-meta">{article.readingTime} dk okuma</span>
        </div>
      </article>
    );
  }

  // ── Text-card variant: resimsiz dikdörtgen kart, kategori dot+etiket, kalın başlık, yazar avatar+adı + tarih
  if (variant === 'text-card') {
    return (
      <article className="article-text-card" onClick={() => navigate(`article/${article.id}`)}>
        <CategoryPill category={article.category} size="sm" />
        <h3 className="article-text-card-title">{article.title}</h3>
        <div className="article-text-card-meta">
          <button className="article-text-card-author" onClick={handleAuthorClick} disabled={!article.authorId}>
            <div className="article-text-card-avatar">
              {article.authorAvatar
                ? <img src={article.authorAvatar} alt={authorName} />
                : <span>{initials}</span>}
            </div>
            <span className="article-text-card-author-name">{authorName || 'Yazar'}</span>
          </button>
          <span className="article-text-card-date">{shortDate}</span>
        </div>
      </article>
    );
  }

  // ── Mini variant: kare thumbnail sol + dot+kategori+başlık+by yazar//tarih sağ
  if (variant === 'mini') {    return (
      <article className="article-mini" onClick={() => navigate(`article/${article.id}`)}>
        <div className="article-mini-image">
          {thumb && <img src={thumb} alt={article.title} />}
          {!thumb && <div className="article-mini-placeholder" />}
        </div>
        <div className="article-mini-body">
          <CategoryPill category={article.category} size="sm" />
          <h4 className="article-mini-title">{article.title}</h4>
          {authorName && (
            <span className="article-mini-byline">
              By <strong>{authorName}</strong> // {shortDate}
            </span>
          )}
        </div>
      </article>
    );
  }

  // ── Vertical variant: görsel üstte, body altında (tag section 4-sütun grid)
  if (variant === 'vertical') {
    return (
      <article className="article-vertical" onClick={() => navigate(`article/${article.id}`)}>
        <div className="article-vertical-image">
          {thumb && <img src={thumb} alt={article.title} />}
          {!thumb && <div className="article-vertical-placeholder" />}
        </div>
        <div className="article-vertical-body">
          <CategoryPill category={article.category} size="sm" />
          <h3 className="article-vertical-title">{article.title}</h3>
          {authorName && (
            <div className="article-vertical-author">
              <div className="article-vertical-avatar">
                {article.authorAvatar
                  ? <img src={article.authorAvatar} alt={authorName} />
                  : <span>{initials}</span>}
              </div>
              <span className="article-vertical-author-name">{authorName}</span>
              <span className="article-vertical-author-date">{shortDate}</span>
            </div>
          )}
          {(onBookmark || (claps != null && claps > 0)) && (
            <div className="article-vertical-footer">
              {claps != null && claps > 0 && (
                <span className="article-clap-count">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 2.5c.6-1 2.1-1 2.6 0l.9 1.6.9-1.6c.5-1 2-.9 2.5 0l.9 1.7.9-1.6c.5-.9 1.9-.9 2.4.1.3.5.3 1.1 0 1.6L17 8l.8 1.3c1.2 2 .7 4.6-1.1 6L13 18H9l-3.7-2.7C3.5 13.9 3 11.3 4.2 9.3L8.5 2.5z"/></svg>
                  {claps}
                </span>
              )}
              {bookmarkBtn}
            </div>
          )}
        </div>
      </article>
    );
  }

  // ── Row variant (default): tam genişlik liste
  return (
    <article className="article-row" onClick={() => navigate(`article/${article.id}`)}>
      <div className="article-row-image">
        {thumb && <img src={thumb} alt={article.title} />}
      </div>

      <div className="article-row-body">
        <div className="article-row-meta">
          <CategoryPill category={article.category} />
          {article.seriesTitle && (
            <span className="article-tag-pill" style={{ color: '#888', borderColor: '#eee' }}>
              {article.seriesTitle}
            </span>
          )}
          {article.boosted && (
            <span className="boost-badge" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Editörün Seçimi
            </span>
          )}
          <span className="article-row-date">{formattedDate}</span>
        </div>

        <h3 className="article-row-title">{article.title}</h3>
        <p className="article-row-excerpt">{article.excerpt}</p>

        <div className="article-row-footer">
          {authorChip}
          {claps != null && claps > 0 && (
            <span className="article-clap-count">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8.5 2.5c.6-1 2.1-1 2.6 0l.9 1.6.9-1.6c.5-1 2-.9 2.5 0l.9 1.7.9-1.6c.5-.9 1.9-.9 2.4.1.3.5.3 1.1 0 1.6L17 8l.8 1.3c1.2 2 .7 4.6-1.1 6L13 18H9l-3.7-2.7C3.5 13.9 3 11.3 4.2 9.3L8.5 2.5z"/></svg>
              {claps}
            </span>
          )}
          {bookmarkBtn}
        </div>

        {(breadcrumb || !article.seriesId) && (
          <div className="article-breadcrumb">
            {!article.seriesId ? (
              <span className="article-breadcrumb-series">Bağımsız Makale</span>
            ) : breadcrumb ? (
              <>
                <span className="article-breadcrumb-series">{breadcrumb.seriesTitle}</span>
                <ChevronRight size={11} className="article-breadcrumb-sep" />
                <span className="article-breadcrumb-chapter">{breadcrumb.chapterTitle}</span>
                {breadcrumb.parentTitle && (
                  <>
                    <ChevronRight size={11} className="article-breadcrumb-sep" />
                    <span className="article-breadcrumb-parent">{breadcrumb.parentTitle}</span>
                  </>
                )}
                {breadcrumb.childTitle && (
                  <>
                    <ChevronRight size={11} className="article-breadcrumb-sep" />
                    <span className="article-breadcrumb-child">{breadcrumb.childTitle}</span>
                  </>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
