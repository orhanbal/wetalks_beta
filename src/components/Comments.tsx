import { useState } from 'react';
import { Trash2, MessageCircle, Send } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { useAuth } from '../hooks/useAuth';

interface CommentsProps {
  articleId: string;
  navigate: (to: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m} dakika önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} gün önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Comments({ articleId, navigate }: CommentsProps) {
  const { user } = useAuth();
  const { comments, loading, submitting, error, addComment, deleteComment } = useComments(articleId);
  const [draft, setDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const ok = await addComment(draft);
    if (ok) setDraft('');
  };

  const handleDelete = async (id: string) => {
    if (confirmDelete === id) {
      await deleteComment(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <MessageCircle size={18} />
        <h3 className="comments-title">
          {loading ? 'Yorumlar' : `${comments.length} Yorum`}
        </h3>
      </div>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-form-avatar">
            {(user as any).user_metadata?.avatar_url
              ? <img src={(user as any).user_metadata.avatar_url} alt="" />
              : <span>{((user.email ?? '?')[0]).toUpperCase()}</span>
            }
          </div>
          <div className="comment-form-body">
            <textarea
              className="comment-textarea"
              placeholder="Düşüncelerini paylaş..."
              value={draft}
              onChange={e => setDraft(e.target.value)}
              maxLength={2000}
              rows={3}
            />
            <div className="comment-form-footer">
              <span className="comment-char-count">{draft.length}/2000</span>
              {error && <span className="comment-error">{error}</span>}
              <button
                type="submit"
                className="comment-submit-btn"
                disabled={!draft.trim() || submitting}
              >
                <Send size={14} />
                {submitting ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <MessageCircle size={20} className="comment-login-icon" />
          <p>Yorum yapmak için <button className="comment-login-link" onClick={() => navigate('login')}>giriş yap</button></p>
        </div>
      )}

      {loading ? (
        <div className="comments-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="comment-skeleton">
              <div className="comment-skeleton-avatar" />
              <div className="comment-skeleton-body">
                <div className="comment-skeleton-line comment-skeleton-line--short" />
                <div className="comment-skeleton-line" />
                <div className="comment-skeleton-line comment-skeleton-line--med" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">
          <p>Henüz yorum yok. İlk yorumu sen yaz!</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(c => {
            const name = c.profile?.full_name ?? c.profile?.username ?? 'Anonim';
            const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
            const isOwn = user?.id === c.user_id;
            return (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar">
                  {c.profile?.avatar_url
                    ? <img src={c.profile.avatar_url} alt={name} />
                    : <span>{initials}</span>
                  }
                </div>
                <div className="comment-content">
                  <div className="comment-meta">
                    <span className="comment-author">{name}</span>
                    <span className="comment-time">{timeAgo(c.created_at)}</span>
                    {isOwn && (
                      <button
                        className={`comment-delete-btn${confirmDelete === c.id ? ' comment-delete-btn--confirm' : ''}`}
                        onClick={() => handleDelete(c.id)}
                        title={confirmDelete === c.id ? 'Silmek için tekrar tıkla' : 'Yorumu sil'}
                      >
                        <Trash2 size={12} />
                        {confirmDelete === c.id ? 'Emin misin?' : ''}
                      </button>
                    )}
                  </div>
                  <p className="comment-body">{c.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
