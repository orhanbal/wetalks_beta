import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Globe, Clock, Search, Filter } from 'lucide-react';
import { supabase, type DbArticle } from '../lib/supabase';

interface AdminArticlesProps {
  navigate: (to: string) => void;
  filter?: 'drafts' | 'published' | 'all';
  userRole?: string;
  userId?: string;
}

type SortField = 'date' | 'title';

export default function AdminArticles({ navigate, filter = 'all', userRole = 'admin', userId = '' }: AdminArticlesProps) {
  const [articles, setArticles] = useState<DbArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortField] = useState<SortField>('date');
  const [activeTab, setActiveTab] = useState<'all' | 'drafts' | 'published'>(filter);

  const fetchArticles = async () => {
    let query = supabase.from('articles').select('*').order(sortField, { ascending: false });
    if (userRole === 'author' && userId) {
      query = query.eq('author_id', userId);
    }
    const { data } = await query;
    if (data) setArticles(data as DbArticle[]);
    setLoading(false);
  };

  useEffect(() => { fetchArticles(); }, [sortField, userId, userRole]);

  const togglePublish = async (article: DbArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase
      .from('articles')
      .update({ published: !article.published, updated_at: new Date().toISOString() })
      .eq('id', article.id);
    fetchArticles();
  };

  const deleteArticle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bu makaleyi silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    await supabase.from('articles').delete().eq('id', id);
    setDeleting(null);
    fetchArticles();
  };

  const filtered = articles
    .filter(a => {
      if (activeTab === 'drafts') return !a.published;
      if (activeTab === 'published') return a.published;
      return true;
    })
    .filter(a => search === '' || a.title.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    all: articles.length,
    drafts: articles.filter(a => !a.published).length,
    published: articles.filter(a => a.published).length,
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    border: 'none',
    borderBottom: active ? '2px solid #111' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    color: active ? '#111' : '#6b7280',
    transition: 'all 0.1s',
    marginBottom: -1,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52,
      }}>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>Makaleler</h1>
        <button
          onClick={() => navigate('admin/articles/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: '#111', color: '#fff', border: 'none', borderRadius: 6,
            padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          <Plus size={14} />
          Yeni makale
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
      }}>
        {(['all', 'drafts', 'published'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={tabStyle(activeTab === t)}>
            {t === 'all' ? 'Tümü' : t === 'drafts' ? 'Taslaklar' : 'Yayında'}
            <span style={{
              marginLeft: '0.375rem', fontSize: '0.6875rem', fontWeight: 600,
              background: '#f3f4f6', color: '#6b7280', padding: '1px 6px', borderRadius: 10,
            }}>{counts[t]}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>
        {/* Search + filter bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
            padding: '0.5rem 0.875rem', flex: 1, maxWidth: 360,
          }}>
            <Search size={13} color="#9ca3af" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Makale ara..."
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#111',
                flex: 1,
              }}
            />
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
            padding: '0.5rem 0.875rem', fontSize: '0.8125rem', color: '#6b7280',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 500,
          }}>
            <Filter size={13} />
            Filtrele
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', fontSize: '0.875rem' }}>Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', fontSize: '0.875rem' }}>
            {search ? 'Aramanızla eşleşen makale bulunamadı.' : 'Henüz makale yok.'}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            {filtered.map((article, i) => (
              <div
                key={article.id}
                onClick={() => navigate(`admin/articles/edit/${article.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f9fafb' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 60, height: 60, borderRadius: 6, background: '#f3f4f6',
                  flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {article.og_image
                    ? <img src={article.og_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ fontSize: '1.5rem', color: '#d1d5db' }}>&#9998;</div>
                  }
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {article.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                    <span>Orhan Balcı</span>
                    <span>—</span>
                    <span>{new Date(article.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {article.series_title && (
                      <>
                        <span>—</span>
                        <span style={{ color: '#6b7280' }}>{article.series_title}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status + reading time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#9ca3af', fontSize: '0.75rem' }}>
                    <Clock size={11} />
                    {article.reading_time} dk
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
                    <Globe size={11} color={article.published ? '#22c55e' : '#9ca3af'} />
                    <span style={{ color: article.published ? '#22c55e' : '#9ca3af', fontWeight: 500 }}>
                      {article.published ? 'Yayında' : 'Taslak'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.25rem' }} onClick={e => e.stopPropagation()}>
                    <button
                      onClick={e => togglePublish(article, e)}
                      title={article.published ? 'Unpublish' : 'Publish'}
                      style={{
                        width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: 6,
                        background: '#fff', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6b7280'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; }}
                    >
                      <Pencil size={12} color="#6b7280" />
                    </button>
                    {userRole === 'admin' && (
                      <button
                        onClick={e => deleteArticle(article.id, e)}
                        disabled={deleting === article.id}
                        title="Delete"
                        style={{
                          width: 30, height: 30, border: '1px solid #e5e7eb', borderRadius: 6,
                          background: '#fff', cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5'; (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                      >
                        <Trash2 size={12} color="#ef4444" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
