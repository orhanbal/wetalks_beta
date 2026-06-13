import { Clock, ArrowRight, Eye, BookOpen } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import type { Article } from '../../data/articles';

interface ModernArticleCardProps {
  article: Article;
  navigate: (to: string) => void;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  className?: string;
}

export default function ModernArticleCard({
  article,
  navigate,
  variant = 'default',
  className,
}: ModernArticleCardProps) {
  const dateStr = new Date(article.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (variant === 'compact') {
    return (
      <button
        onClick={() => navigate(`article/${article.id}`)}
        className={cn(
          'group w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors',
          className
        )}
      >
        {article.ogImage && (
          <div className="shrink-0 w-16 h-12 rounded-md overflow-hidden bg-secondary">
            <img src={article.ogImage} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {article.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{dateStr}</p>
        </div>
      </button>
    );
  }

  if (variant === 'horizontal') {
    return (
      <button
        onClick={() => navigate(`article/${article.id}`)}
        className={cn(
          'group w-full text-left flex gap-5 py-5 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors rounded-lg px-3',
          className
        )}
      >
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          <div>
            {article.category && (
              <Badge variant="secondary" className="mb-2 text-xs font-medium">
                {article.category}
              </Badge>
            )}
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {article.authorAvatar && (
              <Avatar className="h-5 w-5">
                <AvatarImage src={article.authorAvatar} />
                <AvatarFallback>{article.authorName?.[0]}</AvatarFallback>
              </Avatar>
            )}
            {article.authorName && <span className="font-medium text-foreground/70">{article.authorName}</span>}
            <span>{dateStr}</span>
            {article.readingTime && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {article.readingTime} dk
              </span>
            )}
          </div>
        </div>
        {article.ogImage && (
          <div className="shrink-0 w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden bg-secondary">
            <img
              src={article.ogImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
      </button>
    );
  }

  if (variant === 'featured') {
    return (
      <button
        onClick={() => navigate(`article/${article.id}`)}
        className={cn(
          'group w-full text-left relative overflow-hidden rounded-xl bg-card border border-border',
          className
        )}
      >
        {article.ogImage && (
          <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
            <img
              src={article.ogImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </div>
        )}
        <div className="p-5">
          {article.category && (
            <Badge variant="secondary" className="mb-3 text-xs font-semibold">
              {article.category}
            </Badge>
          )}
          <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-3">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              {article.authorAvatar && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={article.authorAvatar} />
                  <AvatarFallback>{article.authorName?.[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className="text-xs text-muted-foreground">
                {article.authorName && <span className="font-medium text-foreground">{article.authorName}</span>}
                {article.authorName && <span className="mx-1">·</span>}
                <span>{dateStr}</span>
              </div>
            </div>
            {article.readingTime && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={11} />
                {article.readingTime} dk
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }

  // default card
  return (
    <button
      onClick={() => navigate(`article/${article.id}`)}
      className={cn(
        'group w-full text-left rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col',
        className
      )}
    >
      {article.ogImage && (
        <div className="aspect-[16/10] overflow-hidden bg-secondary shrink-0">
          <img
            src={article.ogImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        {article.category && (
          <Badge variant="secondary" className="self-start mb-2 text-xs">
            {article.category}
          </Badge>
        )}
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-3 flex-1">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          {article.authorAvatar && (
            <Avatar className="h-5 w-5">
              <AvatarImage src={article.authorAvatar} />
              <AvatarFallback>{article.authorName?.[0]}</AvatarFallback>
            </Avatar>
          )}
          <span>{article.authorName || dateStr}</span>
          {article.readingTime && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Clock size={10} />
                {article.readingTime} dk
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
