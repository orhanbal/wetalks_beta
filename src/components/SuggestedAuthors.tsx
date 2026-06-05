import { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { resolveAuthorBadge, formatCount } from '../lib/writerBadges';

interface AuthorCard {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  title: string | null;
  total_articles: number;
  total_reads: number;
  custom_badge: string | null;
  role: string | null;
}

interface FollowState {
  [authorId: string]: boolean;
}

function AuthorItem({
  author,
  isFollowing,
  toggling,
  onToggle,
  onNavigate,
}: {
  author: AuthorCard;
  isFollowing: boolean;
  toggling: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const { user } = useAuth();
  const badge = resolveAuthorBadge(author.total_articles, author.custom_badge, author.role ?? undefined);
  const initials = author.full_name
    ? author.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="suggested-author-card">
      <button className="suggested-author-info" onClick={onNavigate}>
        <div className="suggested-author-avatar">
          {author.avatar_url
            ? <img src={author.avatar_url} alt={author.full_name ?? ''} />
            : <span>{initials}</span>
          }
        </div>
        <div className="suggested-author-meta">
          <p className="suggested-author-name">{author.full_name ?? 'İsimsiz Yazar'}</p>
          {author.title && <p className="suggested-author-title">{author.title}</p>}
          <div className="suggested-author-stats">
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                padding: '2px 7px', borderRadius: 20,
                fontSize: '0.6375rem', fontWeight: 700,
                color: badge.color, background: badge.bg,
                border: `1px solid ${badge.border}`,
              }}
            >
              {badge.label}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
              {formatCount(author.total_reads)} okuma
            </span>
          </div>
        </div>
      </button>

      {user && (
        <button
          className={`suggested-author-follow${isFollowing ? ' suggested-author-follow--following' : ''}`}
          onClick={e => { e.stopPropagation(); onToggle(); }}
          disabled={toggling}
          title={isFollowing ? 'Takibi Bırak' : 'Takip Et'}
        >
          {isFollowing
            ? <><UserCheck size={13} /> Takipte</>
            : <><UserPlus size={13} /> Takip Et</>
          }
        </button>
      )}
    </div>
  );
}

export default function SuggestedAuthors({
  navigate,
  excludeAuthorId,
  limit = 4,
}: {
  navigate: (to: string) => void;
  excludeAuthorId?: string;
  limit?: number;
}) {
  const { user } = useAuth();
  const [authors, setAuthors] = useState<AuthorCard[]>([]);
  const [follows, setFollows] = useState<FollowState>({});
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url, title, role, custom_badge')
        .in('role', ['author', 'editor', 'admin'])
        .order('full_name', { ascending: true }),
      supabase
        .from('writer_stats')
        .select('author_id, total_articles, total_reads'),
    ]).then(([profilesRes, statsRes]) => {
      const statsMap = new Map(
        (statsRes.data ?? []).map((s: { author_id: string; total_articles: number; total_reads: number }) =>
          [s.author_id, s]
        )
      );
      const all: AuthorCard[] = (profilesRes.data ?? [])
        .filter((p: { id: string }) => p.id !== excludeAuthorId)
        .map((p: { id: string; full_name: string | null; avatar_url: string | null; title: string | null; role: string | null; custom_badge: string | null }) => {
          const s = statsMap.get(p.id) as { total_articles: number; total_reads: number } | undefined;
          return {
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            title: p.title,
            role: p.role,
            custom_badge: p.custom_badge ?? null,
            total_articles: s?.total_articles ?? 0,
            total_reads: s?.total_reads ?? 0,
          };
        })
        .sort((a: AuthorCard, b: AuthorCard) => b.total_reads - a.total_reads)
        .slice(0, limit);
      setAuthors(all);
    });
  }, [excludeAuthorId, limit]);

  useEffect(() => {
    if (!user || authors.length === 0) return;
    const ids = authors.map(a => a.id);
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)
      .in('following_id', ids)
      .then(({ data }) => {
        const state: FollowState = {};
        for (const a of authors) state[a.id] = false;
        for (const row of (data ?? []) as { following_id: string }[]) {
          state[row.following_id] = true;
        }
        setFollows(state);
      });
  }, [user, authors]);

  const handleToggle = async (authorId: string) => {
    if (!user || toggling) return;
    setToggling(authorId);
    const isFollowing = follows[authorId];
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', user.id)
        .eq('following_id', authorId);
    } else {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: authorId });
    }
    setFollows(prev => ({ ...prev, [authorId]: !isFollowing }));
    setToggling(null);
  };

  if (authors.length === 0) return null;

  return (
    <div className="suggested-authors-section">
      <h2 className="suggested-authors-title">Yazarları Takip Et</h2>
      <div className="suggested-authors-list">
        {authors.map(author => (
          <AuthorItem
            key={author.id}
            author={author}
            isFollowing={follows[author.id] ?? false}
            toggling={toggling === author.id}
            onToggle={() => handleToggle(author.id)}
            onNavigate={() => navigate(`author/${author.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
