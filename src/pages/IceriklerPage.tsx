import { useState } from 'react';
import type { Article, Category } from '../data/articles';
import type { Series, SeriesOutlineNode } from '../data/series';
import ArticleCard, { type ArticleBreadcrumb } from '../components/ArticleCard';
import SeriesCard from '../components/SeriesCard';
import { useSEO } from '../hooks/useSEO';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAuth } from '../hooks/useAuth';
import { useArticleClapsMap } from '../hooks/useData';

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

const allCategories: Category[] = [
  'Ticaret', 'E-Ticaret', 'Marka ve Strateji', 'Girişimcilik', 'Teknoloji', 'Yapay Zekâ', 'Kişisel Notlar',
];

interface IceriklerPageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

export default function IceriklerPage({ navigate, articles, seriesList }: IceriklerPageProps) {
  useSEO({
    title: 'İçerikler',
    description: "Ticaret, e-ticaret, marka, girişimcilik, teknoloji ve yapay zekâ üzerine tüm yazılar.",
    canonical: 'https://obtalks.tr/#contents',
  });
  const { user } = useAuth();
  const { isBookmarked, toggle } = useBookmarks();
  const [activeCategory, setActiveCategory] = useState<Category | 'Tümü'>('Tümü');
  const clapsMap = useArticleClapsMap(articles.map(a => a.id));

  const filtered = activeCategory === 'Tümü' ? articles : articles.filter(a => a.category === activeCategory);

  return (
    <main>
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-title">İçerikler</h1>
          <p className="page-subtitle">Ticaret, e-ticaret, markalaşma, teknoloji ve girişimcilik üzerine yazılar.</p>
        </div>
      </div>

      <div className="divider-full" />

      <div className="filter-tabs">
        <button className={`filter-tab ${activeCategory === 'Tümü' ? 'filter-tab-active' : ''}`} onClick={() => setActiveCategory('Tümü')}>Tümü</button>
        {allCategories.map(cat => (
          <button key={cat} className={`filter-tab ${activeCategory === cat ? 'filter-tab-active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </div>

      <div className="divider-full" />

      <div className="article-list">
        {filtered.length > 0
          ? filtered.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                navigate={navigate}
                breadcrumb={findBreadcrumb(article.id, seriesList)}
                bookmarked={isBookmarked('article', article.id)}
                onBookmark={user ? () => toggle('article', article.id) : undefined}
                claps={clapsMap[article.id] ?? 0}
              />
            ))
          : <p className="empty-state">Bu kategoride henüz yazı yok.</p>
        }
      </div>

      {seriesList.length > 0 && (
        <>
          <div className="divider-full" style={{ marginTop: '1rem' }} />
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Yazı Dizileri</h2>
            </div>
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
          </div>
        </>
      )}
    </main>
  );
}
