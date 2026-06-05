import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { supabase, type DbSeries } from '../lib/supabase';

interface AdminSeriesProps {
  navigate: (to: string) => void;
  userRole?: string;
  userId?: string;
}

export default function AdminSeries({ navigate, userRole = 'admin', userId = '' }: AdminSeriesProps) {
  const [seriesList, setSeriesList] = useState<DbSeries[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeries = async () => {
    let query = supabase.from('series').select('*').order('created_at');
    if (userRole === 'author' && userId) {
      query = query.eq('author_id', userId);
    }
    const { data } = await query;
    if (data) setSeriesList(data as DbSeries[]);
    setLoading(false);
  };

  useEffect(() => { fetchSeries(); }, [userId, userRole]);

  const deleteSeries = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bu diziyi silmek istediğinize emin misiniz? Bağlı makaleler dizisiz kalacak.')) return;
    await supabase.from('series').delete().eq('id', id);
    fetchSeries();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52,
      }}>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>Diziler</h1>
        <button
          onClick={() => navigate('admin/series/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            background: '#111', color: '#fff', border: 'none', borderRadius: 6,
            padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          <Plus size={14} />
          Yeni dizi
        </button>
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', fontSize: '0.875rem' }}>Yükleniyor...</div>
        ) : seriesList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af', fontSize: '0.875rem' }}>Henüz dizi yok.</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
            {seriesList.map((s, i) => (
              <div
                key={s.id}
                onClick={() => navigate(`admin/series/edit/${s.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.125rem 1.5rem',
                  borderBottom: i < seriesList.length - 1 ? '1px solid #f9fafb' : 'none',
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 8, background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {s.og_image
                    ? <img src={s.og_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    : <BookOpen size={18} color="#9ca3af" />
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111' }}>{s.title}</span>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 600,
                      background: '#f3f4f6', color: '#6b7280',
                      padding: '1px 6px', borderRadius: 10,
                    }}>
                      {s.article_count} makale
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.tagline || s.description}
                  </div>
                  {s.topics && s.topics.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                      {s.topics.slice(0, 4).map(t => (
                        <span key={t} style={{
                          fontSize: '0.6875rem', background: '#f3f4f6', color: '#6b7280',
                          padding: '1px 6px', borderRadius: 4,
                        }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`admin/series/edit/${s.id}`)}
                    title="Edit"
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
                      onClick={e => deleteSeries(s.id, e)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
