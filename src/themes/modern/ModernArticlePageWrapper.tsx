import { Clock, ArrowLeft, Bookmark, BookmarkCheck, Share2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { cn } from '../../lib/utils';
import ModernArticleCard from './ModernArticleCard';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

/**
 * Modern ArticlePage wraps the Classic ArticlePage content rendering.
 * We reuse the classic page for content parsing complexity (highlights, TTS, etc.)
 * but override the outer layout shell with modern Shadcn styling.
 */
interface ModernArticlePageWrapperProps {
  children: React.ReactNode;
  article: Article | null;
  navigate: (to: string) => void;
  relatedArticles: Article[];
}

export default function ModernArticlePageWrapper({
  children,
  article,
  navigate,
  relatedArticles,
}: ModernArticlePageWrapperProps) {
  if (!article) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero image */}
      {article.ogImage && (
        <div className="w-full aspect-[21/7] max-h-[420px] overflow-hidden bg-secondary">
          <img
            src={article.ogImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Article content */}
          <article className="lg:col-span-8">
            {/* Back button */}
            <button
              onClick={() => navigate('')}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft size={15} />
              Geri
            </button>

            {/* Category + meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {article.category && (
                <Badge variant="secondary" className="text-xs font-medium">
                  {article.category}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(article.date).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {article.readingTime && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={11} />
                    {article.readingTime} dk okuma
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
              {article.title}
            </h1>

            {/* Subtitle */}
            {(article as any).subtitle && (
              <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
                {(article as any).subtitle}
              </p>
            )}

            {/* Author row */}
            {(article.authorName || article.authorAvatar) && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={article.authorAvatar ?? undefined} />
                    <AvatarFallback>{article.authorName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    {article.authorName && (
                      <p className="text-sm font-semibold text-foreground">{article.authorName}</p>
                    )}
                  </div>
                </div>
                <Separator className="mb-8" />
              </>
            )}

            {/* Article body — classic component does its own rendering */}
            <div className="modern-article-body">
              {children}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Author card */}
            {article.authorName && (
              <div className="rounded-xl border border-border bg-card p-5 sticky top-24">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={article.authorAvatar ?? undefined} />
                    <AvatarFallback>{article.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{article.authorName}</p>
                    <p className="text-xs text-muted-foreground">Yazar</p>
                  </div>
                </div>
                {article.authorId && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => navigate(`author/${article.authorId}`)}
                  >
                    Yazarı Gör
                  </Button>
                )}
              </div>
            )}

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Benzer Yazılar</h3>
                <div className="space-y-0 divide-y divide-border">
                  {relatedArticles.map(a => (
                    <ModernArticleCard
                      key={a.id}
                      article={a}
                      navigate={navigate}
                      variant="compact"
                      className="py-3"
                    />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
