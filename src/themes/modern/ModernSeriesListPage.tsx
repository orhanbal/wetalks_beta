import { useMemo } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import ModernArticleCard from './ModernArticleCard';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

interface ModernSeriesListPageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

export default function ModernSeriesListPage({ navigate, articles, seriesList }: ModernSeriesListPageProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-bold text-foreground">Seriler</h1>
          <p className="text-sm text-muted-foreground mt-1">{seriesList.length} seri</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map(s => {
            const seriesArticles = articles.filter(a =>
              a.seriesId === s.id && (a.status === 'published' || !a.status)
            );
            return (
              <button
                key={s.id}
                onClick={() => navigate(`series/${s.id}`)}
                className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {s.ogImage && (
                  <div className="aspect-[3/2] overflow-hidden bg-secondary">
                    <img
                      src={s.ogImage}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {s.title}
                  </h2>
                  {s.description && (
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <BookOpen size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{seriesArticles.length} bölüm</span>
                    <ArrowRight size={13} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
