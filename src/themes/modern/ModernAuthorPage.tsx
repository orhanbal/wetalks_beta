import { useState, useEffect, useMemo } from 'react';
import { Twitter, Instagram, Linkedin, Globe, PenLine, Eye, UserCheck, UserPlus } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import ModernArticleCard from './ModernArticleCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useFollow } from '../../hooks/useFollow';
import type { Article } from '../../data/articles';
import type { Series } from '../../data/series';

interface AuthorProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  title: string | null;
  bio: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  website: string | null;
}

interface WriterStats {
  total_articles: number;
  published_articles: number;
  total_reads: number;
}

interface ModernAuthorPageProps {
  id: string;
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}B` : String(n);
}

export default function ModernAuthorPage({ id, navigate, articles, seriesList }: ModernAuthorPageProps) {
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [stats, setStats] = useState<WriterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isFollowing, followerCount, toggle: toggleFollow } = useFollow(user?.id, id);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('id,full_name,username,avatar_url,role,title,bio,twitter,instagram,linkedin,website').eq('id', id).maybeSingle(),
        supabase.from('writer_stats').select('total_articles,published_articles,total_reads').eq('author_id', id).maybeSingle(),
      ]);
      setProfile(p ?? null);
      setStats(s ?? null);
      setLoading(false);
    })();
  }, [id]);

  const authorArticles = useMemo(
    () => articles.filter(a => a.authorId === id && (a.status === 'published' || !a.status)),
    [articles, id]
  );

  const ROLE_LABELS: Record<string, string> = { author: 'Yazar', editor: 'Editör', admin: 'Admin' };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
      Yükleniyor...
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
      Yazar bulunamadı.
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Author hero */}
      <div className="border-b bg-secondary/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl font-bold">{profile.full_name?.[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
                {profile.role && (
                  <Badge variant="secondary" className="text-xs font-medium">
                    {ROLE_LABELS[profile.role] ?? profile.role}
                  </Badge>
                )}
              </div>
              {profile.title && (
                <p className="text-sm text-muted-foreground">{profile.title}</p>
              )}
              {profile.bio && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {/* Stats */}
                {stats && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {stats.published_articles > 0 && (
                      <span className="flex items-center gap-1">
                        <PenLine size={12} />
                        {stats.published_articles} yazı
                      </span>
                    )}
                    {stats.total_reads > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {formatCount(stats.total_reads)} okuma
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {followerCount} takipçi
                    </span>
                  </div>
                )}

                {/* Social links */}
                <div className="flex items-center gap-2">
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Twitter size={14} />
                    </a>
                  )}
                  {profile.instagram && (
                    <a href={profile.instagram} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Instagram size={14} />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Linkedin size={14} />
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                      <Globe size={14} />
                    </a>
                  )}
                </div>

                {/* Follow button */}
                {user && user.id !== id && (
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => toggleFollow()}
                    className="gap-1.5"
                  >
                    {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-base font-semibold text-foreground mb-6">
          Yazılar
          <span className="ml-2 text-sm font-normal text-muted-foreground">({authorArticles.length})</span>
        </h2>
        {authorArticles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz yazı yok.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {authorArticles.map(article => (
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
