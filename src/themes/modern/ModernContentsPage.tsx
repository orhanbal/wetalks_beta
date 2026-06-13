import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import ModernArticleCard from './ModernArticleCard';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

interface ModernContentsPageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

export default function ModernContentsPage({ navigate, articles, seriesList }: ModernContentsPageProps) {
  const published = useMemo(() => articles.filter(a => a.status === 'published' || !a.status), [articles]);
  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    published.forEach(a => { if (a.category) cats.set(a.category, (cats.get(a.category) ?? 0) + 1); });
    return [...cats.entries()].sort((a, b) => b[1] - a[1]);
  }, [published]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Tüm Yazılar</h1>
          <p className="text-sm text-muted-foreground mt-1">{published.length} yazı</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Article list */}
          <div className="lg:col-span-8">
            <div className="flex flex-col divide-y divide-border">
              {published.map(article => (
                <ModernArticleCard
                  key={article.id}
                  article={article}
                  navigate={navigate}
                  variant="horizontal"
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Konular</h3>
                <div className="space-y-2">
                  {categories.map(([cat, count]) => (
                    <button
                      key={cat}
                      onClick={() => navigate(`tag/${cat.toLowerCase().replace(/\s+/g, '-')}`)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors group"
                    >
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{cat}</span>
                      <Badge variant="secondary" className="text-xs">{count}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Series */}
            {seriesList.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Seriler</h3>
                <div className="space-y-3">
                  {seriesList.slice(0, 5).map(s => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`series/${s.id}`)}
                      className="w-full text-left group"
                    >
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {s.title}
                      </p>
                      {s.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
