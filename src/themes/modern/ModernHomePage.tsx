import { useMemo } from 'react';
import { ArrowRight, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';
import ModernArticleCard from './ModernArticleCard';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

interface ModernHomePageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
  settings: Record<string, string>;
}

export default function ModernHomePage({ navigate, articles, seriesList, settings }: ModernHomePageProps) {
  const published = useMemo(() => articles.filter(a => a.status === 'published' || !a.status), [articles]);

  const featured = useMemo(() => {
    const pinned = published.find(a => a.featured);
    return pinned ?? published[0] ?? null;
  }, [published]);

  const latest = useMemo(() => published.filter(a => a.id !== featured?.id).slice(0, 6), [published, featured]);
  const trending = useMemo(() => [...published].sort((a, b) => (b.readCount ?? 0) - (a.readCount ?? 0)).slice(0, 4), [published]);
  const recentSeries = useMemo(() => seriesList.slice(0, 3), [seriesList]);

  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    published.forEach(a => { if (a.category) cats.set(a.category, (cats.get(a.category) ?? 0) + 1); });
    return [...cats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [published]);

  const siteTitle = settings['site_title'] || 'Site';
  const tagline = settings['footer_tagline'] || '';

  return (
    <main className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="border-b bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Featured article */}
            {featured && (
              <div className="lg:col-span-7">
                <button
                  onClick={() => navigate(`article/${featured.id}`)}
                  className="group w-full text-left"
                >
                  {featured.ogImage && (
                    <div className="aspect-[16/9] overflow-hidden rounded-xl bg-secondary mb-5">
                      <img
                        src={featured.ogImage}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default" className="text-xs">
                      <Sparkles size={10} className="mr-1" />
                      Öne Çıkan
                    </Badge>
                    {featured.category && (
                      <Badge variant="secondary" className="text-xs">{featured.category}</Badge>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {featured.title}
                  </h1>
                  {featured.excerpt && (
                    <p className="mt-3 text-base text-muted-foreground leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-4">
                    {featured.authorAvatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={featured.authorAvatar} />
                        <AvatarFallback>{featured.authorName?.[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {featured.authorName && (
                        <span className="font-medium text-foreground">{featured.authorName}</span>
                      )}
                      {featured.authorName && <span className="mx-1.5">·</span>}
                      <span>{new Date(featured.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      {featured.readingTime && (
                        <>
                          <span className="mx-1.5">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} />
                            {featured.readingTime} dk okuma
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Right column: latest 4 */}
            <div className="lg:col-span-5 flex flex-col gap-0 divide-y divide-border">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest pb-3">
                Son Yazılar
              </h2>
              {published.filter(a => a.id !== featured?.id).slice(0, 4).map(article => (
                <ModernArticleCard
                  key={article.id}
                  article={article}
                  navigate={navigate}
                  variant="compact"
                  className="py-3"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Latest articles */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Tüm Yazılar</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('contents')} className="text-muted-foreground gap-1">
                  Tümünü gör <ArrowRight size={14} />
                </Button>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {latest.map(article => (
                  <ModernArticleCard
                    key={article.id}
                    article={article}
                    navigate={navigate}
                    variant="horizontal"
                  />
                ))}
              </div>
            </section>

            {/* Series */}
            {recentSeries.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-foreground">Seriler</h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate('series')} className="text-muted-foreground gap-1">
                    Tümünü gör <ArrowRight size={14} />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recentSeries.map(s => (
                    <button
                      key={s.id}
                      onClick={() => navigate(`series/${s.id}`)}
                      className="group text-left rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all duration-200"
                    >
                      {s.ogImage && (
                        <div className="aspect-[3/2] overflow-hidden rounded-lg bg-secondary mb-3">
                          <img src={s.ogImage} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                      )}
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {s.title}
                      </h3>
                      {s.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Trending */}
            {trending.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={15} className="text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-foreground">Popüler Yazılar</h3>
                </div>
                <div className="space-y-0 divide-y divide-border">
                  {trending.map((article, i) => (
                    <button
                      key={article.id}
                      onClick={() => navigate(`article/${article.id}`)}
                      className="group w-full text-left flex gap-3 items-start py-3 first:pt-0 last:pb-0 hover:bg-secondary/30 transition-colors rounded"
                    >
                      <span className="text-2xl font-black text-muted-foreground/30 w-6 shrink-0 leading-none mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </p>
                        {article.category && (
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">{article.category}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Konular</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(([cat, count]) => (
                    <button
                      key={cat}
                      onClick={() => navigate(`tag/${cat.toLowerCase().replace(/\s+/g, '-')}`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {cat}
                      <span className="text-[10px] text-muted-foreground/60">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* About card */}
            {(siteTitle || tagline) && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">{siteTitle}</h3>
                {tagline && <p className="text-sm text-muted-foreground leading-relaxed">{tagline}</p>}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full gap-1"
                  onClick={() => navigate('about')}
                >
                  Hakkımda <ArrowRight size={13} />
                </Button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
