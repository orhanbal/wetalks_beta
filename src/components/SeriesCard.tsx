import { ArrowRight, BookOpen, User, Bookmark } from 'lucide-react';
import type { Series } from '../data/series';

interface SeriesCardProps {
  series: Series;
  navigate: (to: string) => void;
  bookmarked?: boolean;
  onBookmark?: (e: React.MouseEvent) => void;
}

export default function SeriesCard({ series, navigate, bookmarked, onBookmark }: SeriesCardProps) {
  return (
    <div className={`series-card${series.ogImage ? ' series-card--has-image' : ''}`} onClick={() => navigate(`series/${series.id}`)}>
      {series.ogImage && (
        <div className="series-card-banner">
          <img src={series.ogImage} alt={series.title} className="series-card-banner-img" />
        </div>
      )}
      <div className="series-card-body">
        <div className="series-card-header">
          <BookOpen size={15} />
          <span className="series-article-count">{series.articleCount} yazı</span>
          {onBookmark && (
            <button
              className={`bookmark-btn${bookmarked ? ' bookmark-btn--active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onBookmark(e); }}
              title={bookmarked ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
              aria-label={bookmarked ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
              style={{ marginLeft: 'auto' }}
            >
              <Bookmark size={14} />
            </button>
          )}
        </div>
        <h3 className="series-card-title">{series.title}</h3>
        {series.tagline && (
          <p className="series-card-tagline">"{series.tagline}"</p>
        )}
        <p className="series-card-desc">{series.description}</p>
        {series.authorName && (
          <div className="series-card-author">
            <User size={12} />
            <span>{series.authorName}</span>
          </div>
        )}
        <button
          className="series-read-btn"
          onClick={(e) => { e.stopPropagation(); navigate(`series/${series.id}`); }}
        >
          Seriyi Oku <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
