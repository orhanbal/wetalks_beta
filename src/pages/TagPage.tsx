import type { Article } from '../data/articles';
import type { Series, SeriesOutlineNode } from '../data/series';
import ArticleCard, { type ArticleBreadcrumb } from '../components/ArticleCard';
import { useSEO } from '../hooks/useSEO';

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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

function findBreadcrumb(articleId: string, seriesList: Series[]): ArticleBreadcrumb | undefined {
  for (const s of seriesList) {
    if (!s.outline) continue;
    for (const chapter of s.outline) {
      const crumb = searchNode(articleId, chapter, s.title, chapter.title);
      if (crumb) return crumb;
    }
  }
}

interface TagPageProps {
  id: string;
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

export default function TagPage({ id, navigate, articles, seriesList }: TagPageProps) {
  // Check if the id matches a series id
  const matchedSeries = seriesList.find(s => s.id === id);

  const filtered = articles.filter(a => {
    if (matchedSeries) return a.seriesId === id;
    const tagSlugs = (a.tags ?? []).map(slugify);
    if (tagSlugs.includes(id)) return true;
    if (slugify(a.category) === id) return true;
    return false;
  });

  const label = matchedSeries?.title
    ?? (() => {
        for (const a of articles) {
          for (const t of a.tags ?? []) {
            if (slugify(t) === id) return t;
          }
        }
        return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      })();
  const description = matchedSeries?.tagline ?? '';

  useSEO({
    title: label,
    description,
    canonical: `https://obtalks.tr/#tag/${id}`,
  });

  return (
    <main>
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-title">{label}</h1>
          {description && <p className="page-subtitle">{description}</p>}
          <p className="tag-count">{filtered.length} yazı</p>
        </div>
      </div>

      <div className="divider-full" />

      {filtered.length === 0 ? (
        <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
          Bu etiket altında henüz yazı yok.
        </div>
      ) : (
        <div className="article-list">
          {filtered.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              navigate={navigate}
              breadcrumb={findBreadcrumb(article.id, seriesList)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
