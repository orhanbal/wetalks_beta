import { useEffect, useState } from 'react';
import { Plus, Globe, Lock, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from './AdminLayout';

interface Page {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  show_in_nav: boolean;
  nav_label: string;
  excerpt: string;
  updated_at: string;
}

interface AdminPagesProps {
  navigate: (to: string) => void;
}

export default function AdminPages({ navigate }: AdminPagesProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from('pages')
      .select('id, title, slug, published, show_in_nav, nav_label, excerpt, updated_at')
      .order('updated_at', { ascending: false });
    setPages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" sayfasını silmek istediğinizden emin misiniz?`)) return;
    setDeletingId(id);
    await supabase.from('pages').delete().eq('id', id);
    await load();
    setDeletingId(null);
  };

  const handleTogglePublish = async (page: Page) => {
    await supabase.from('pages').update({ published: !page.published }).eq('id', page.id);
    setPages(prev => prev.map(p => p.id === page.id ? { ...p, published: !p.published } : p));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <AdminPageHeader
        title="Sayfalar"
        subtitle="Statik sayfaları oluşturun ve yönetin"
        action={
          <button
            onClick={() => navigate('admin/pages/new')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', background: '#111', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            <Plus size={14} /> Yeni Sayfa
          </button>
        }
      />

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
          Yükleniyor...
        </div>
      ) : pages.length === 0 ? (
        <div style={{
          padding: '4rem 2rem', textAlign: 'center',
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: '#f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <Globe size={22} color="#9ca3af" />
          </div>
          <p style={{ margin: '0 0 0.375rem', fontSize: '1rem', fontWeight: 600, color: '#111' }}>Henüz sayfa yok</p>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
            Hakkımda, iletişim veya başka özel sayfalar oluşturun.
          </p>
          <button
            onClick={() => navigate('admin/pages/new')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem', background: '#111', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={15} /> İlk Sayfayı Oluştur
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                <th style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sayfa
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Durum
                </th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Güncellendi
                </th>
                <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page, i) => (
                <tr
                  key={page.id}
                  style={{
                    borderBottom: i < pages.length - 1 ? '1px solid #f3f4f6' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111' }}>
                        {page.title || <em style={{ color: '#9ca3af' }}>Başlıksız</em>}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                        /{page.slug}
                      </span>
                      {page.excerpt && (
                        <span style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.125rem' }}>
                          {page.excerpt.length > 80 ? page.excerpt.slice(0, 80) + '…' : page.excerpt}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleTogglePublish(page)}
                      title={page.published ? 'Yayından kaldır' : 'Yayınla'}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.3rem 0.75rem', borderRadius: 20, border: 'none', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                        background: page.published ? '#f0fdf4' : '#f9fafb',
                        color: page.published ? '#166534' : '#6b7280',
                        transition: 'all 0.15s',
                      }}
                    >
                      {page.published ? <Globe size={11} /> : <Lock size={11} />}
                      {page.published ? 'Yayında' : 'Taslak'}
                    </button>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.8125rem', color: '#6b7280' }}>
                    {formatDate(page.updated_at)}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {page.published && (
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Sayfayı görüntüle"
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 32, height: 32, borderRadius: 7,
                            background: '#f3f4f6', border: '1px solid #e5e7eb',
                            color: '#6b7280', textDecoration: 'none', transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = '#111';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = '#f3f4f6';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280';
                          }}
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => navigate(`admin/pages/edit/${page.id}`)}
                        title="Düzenle"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32, borderRadius: 7,
                          background: '#f3f4f6', border: '1px solid #e5e7eb',
                          color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#111';
                          (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6';
                          (e.currentTarget as HTMLButtonElement).style.color = '#6b7280';
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        disabled={deletingId === page.id}
                        title="Sil"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32, borderRadius: 7,
                          background: '#fff5f5', border: '1px solid #fee2e2',
                          color: '#ef4444', cursor: deletingId === page.id ? 'not-allowed' : 'pointer',
                          opacity: deletingId === page.id ? 0.5 : 1, transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          if (deletingId !== page.id) {
                            (e.currentTarget as HTMLButtonElement).style.background = '#ef4444';
                            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = '#fff5f5';
                          (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
