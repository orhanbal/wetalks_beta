import { useMemo } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import ModernArticleCard from './ModernArticleCard';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

interface ModernTagPageProps {
  id: string;
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

export default function ModernTagPage({ id, navigate, articles, seriesList }: ModernTagPageProps) {
  const tagName = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const filtered = useMemo(
    () => articles.filter(a =>
      (a.status === 'published' || !a.status) &&
      (a.category?.toLowerCase().replace(/\s+/g, '-') === id ||
        (a.tags as string[] | undefined)?.includes(id))
    ),
    [articles, id]
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <button onClick={() => navigate('')} className="hover:text-foreground transition-colors">Anasayfa</button>
            <span>/</span>
            <span>{tagName}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{tagName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} yazı</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen size={36} className="mx-auto mb-4 opacity-40" />
            <p className="text-base font-medium">Bu konuda yazı bulunamadı.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {filtered.map(article => (
              <ModernArticleCard
                key={article.id}
                article={article}
                navigate={navigate}
                variant="horizontal"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
