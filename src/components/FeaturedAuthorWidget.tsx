import { useState, useEffect, useRef } from 'react';
import { X, PenLine, Eye, UserRound, Twitter, Instagram, Linkedin, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useFollow } from '../hooks/useFollow';
import { useAuth } from '../hooks/useAuth';

interface FeaturedAuthor {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  title: string | null;
  bio: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  website: string | null;
  role: string | null;
}

interface WriterStats {
  total_articles: number;
  total_reads: number;
}

interface FeaturedAuthorWidgetProps {
  authorId?: string | null;
  onNavigate: (to: string) => void;
}

export default function FeaturedAuthorWidget({ authorId, onNavigate }: FeaturedAuthorWidgetProps) {
  const [author, setAuthor] = useState<FeaturedAuthor | null>(null);
  const [stats, setStats] = useState<WriterStats | null>(null);
  const [latestArticles, setLatestArticles] = useState<{ id: string; title: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isFollowing, toggle: toggleFollow } = useFollow(user?.id, authorId ?? null);

  useEffect(() => {
    if (!authorId) { setLoading(false); return; }
    const load = async () => {
      const [{ data: profile }, { data: writerStats }, { data: articles }] = await Promise.all([
        supabase.from('profiles').select('id,full_name,username,avatar_url,title,bio,twitter,instagram,linkedin,website,role').eq('id', authorId).maybeSingle(),
        supabase.from('writer_stats').select('total_articles,total_reads').eq('author_id', authorId).maybeSingle(),
        supabase.from('articles').select('id,title,date').eq('author_id', authorId).eq('status', 'published').order('date', { ascending: false }).limit(3),
      ]);
      setAuthor(profile ?? null);
      setStats(writerStats ?? null);
      setLatestArticles((articles ?? []).map(a => ({ id: a.id, title: a.title, date: a.date })));
      setLoading(false);
    };
    load();
  }, [authorId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  if (loading) return null;

  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}B` : String(n);

  return (
    <>
      {/* Card */}
      <div className="featured-author-widget">
        {!author ? (
          <div className="poll-no-active">
            <div className="poll-no-active-icon"><UserRound size={28} /></div>
            <div className="poll-no-active-title">Öne çıkan yazar yok</div>
            <div className="poll-no-active-text">Bir yazar atandığında burada görüntülenecek.</div>
          </div>
        ) : (
          <div className="faw-card-body">
            <div className="faw-card-top">
              <div className="faw-avatar-wrap">
                {author.avatar_url
                  ? <img src={author.avatar_url} alt={author.full_name ?? ''} className="faw-avatar" />
                  : <div className="faw-avatar faw-avatar--placeholder"><UserRound size={32} /></div>}
              </div>
              <div className="faw-badge"><UserRound size={11} /><span>Öne Çıkan Yazar</span></div>
            </div>

            <div className="faw-card-content">
              <div className="faw-name">{author.full_name}</div>
              {author.title && <div className="faw-title">{author.title}</div>}
              {author.bio && (
                <p className="faw-bio">{author.bio.length > 100 ? author.bio.slice(0, 100) + '…' : author.bio}</p>
              )}
              {(stats?.total_articles || stats?.total_reads) ? (
                <div className="faw-stats">
                  {stats.total_articles > 0 && (
                    <span className="faw-stat"><PenLine size={11} />{stats.total_articles} yazı</span>
                  )}
                  {stats.total_reads > 0 && (
                    <span className="faw-stat"><Eye size={11} />{formatCount(stats.total_reads)} okuma</span>
                  )}
                </div>
              ) : null}
            </div>

            <div className="faw-card-footer">
              <button className="poll-join-btn" onClick={() => setModalOpen(true)}>
                Profili Gör
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {modalOpen && author && (
        <div
          className="poll-modal-overlay"
          ref={overlayRef}
          onClick={e => { if (e.target === overlayRef.current) setModalOpen(false); }}
        >
          <div className="poll-modal faw-modal">
            {/* Header */}
            <div className="poll-modal-header">
              <div className="poll-modal-header-left">
                <UserRound size={16} />
                <span>Yazar Profili</span>
              </div>
              <button className="poll-modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="poll-modal-body faw-modal-body">
              {/* Avatar + name */}
              <div className="faw-modal-hero">
                {author.avatar_url
                  ? <img src={author.avatar_url} alt={author.full_name ?? ''} className="faw-modal-avatar" />
                  : <div className="faw-modal-avatar faw-modal-avatar--placeholder"><UserRound size={40} /></div>}
                <div className="faw-modal-info">
                  <div className="faw-modal-name">{author.full_name}</div>
                  {author.title && <div className="faw-modal-title">{author.title}</div>}
                  {(stats?.total_articles || stats?.total_reads) ? (
                    <div className="faw-stats faw-stats--modal">
                      {stats.total_articles > 0 && (
                        <span className="faw-stat"><PenLine size={11} />{stats.total_articles} yazı</span>
                      )}
                      {stats.total_reads > 0 && (
                        <span className="faw-stat"><Eye size={11} />{formatCount(stats.total_reads)} okuma</span>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Bio */}
              {author.bio && (
                <p className="faw-modal-bio">{author.bio}</p>
              )}

              {/* Sosyal linkler */}
              {(author.twitter || author.instagram || author.linkedin || author.website) && (
                <div className="faw-modal-socials">
                  {author.twitter && (
                    <a href={author.twitter} target="_blank" rel="noopener noreferrer" className="faw-social-link">
                      <Twitter size={15} />
                    </a>
                  )}
                  {author.instagram && (
                    <a href={author.instagram} target="_blank" rel="noopener noreferrer" className="faw-social-link">
                      <Instagram size={15} />
                    </a>
                  )}
                  {author.linkedin && (
                    <a href={author.linkedin} target="_blank" rel="noopener noreferrer" className="faw-social-link">
                      <Linkedin size={15} />
                    </a>
                  )}
                  {author.website && (
                    <a href={author.website} target="_blank" rel="noopener noreferrer" className="faw-social-link">
                      <Globe size={15} />
                    </a>
                  )}
                </div>
              )}

              {/* Son yazılar */}
              {latestArticles.length > 0 && (
                <div className="faw-modal-articles">
                  <div className="faw-modal-articles-title">Son Yazılar</div>
                  {latestArticles.map(a => (
                    <div
                      key={a.id}
                      className="faw-modal-article-item"
                      onClick={() => { setModalOpen(false); onNavigate(`article/${a.id}`); }}
                    >
                      <span className="faw-modal-article-title">{a.title}</span>
                      {a.date && (
                        <span className="faw-modal-article-date">
                          {new Date(a.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="poll-modal-footer faw-modal-footer">
              {user && user.id !== author.id && (
                <button
                  className={`faw-follow-btn${isFollowing ? ' faw-follow-btn--following' : ''}`}
                  onClick={() => toggleFollow()}
                >
                  {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
                </button>
              )}
              {author.username && (
                <button
                  className="faw-profile-btn"
                  onClick={() => { setModalOpen(false); onNavigate(`author/${author.id}`); }}
                >
                  Tam Profil
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
