import { useEffect, useState } from 'react';
import { Tag, ExternalLink, FileText, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TagStat {
  slug: string;
  label: string;
  count: number;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

interface AdminTagsProps {
  navigate: (to: string) => void;
}

export default function AdminTags({ navigate }: AdminTagsProps) {
  const [tags, setTags] = useState<TagStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('articles')
      .select('tags, category')
      .eq('published', true)
      .then(({ data }) => {
        const map = new Map<string, { label: string; count: number }>();

        (data ?? []).forEach((row: { tags?: string[] | null; category?: string | null }) => {
          const allLabels: string[] = [];
          if (row.category) allLabels.push(row.category);
          (row.tags ?? []).forEach(t => allLabels.push(t));

          allLabels.forEach(label => {
            const slug = slugify(label);
            if (!slug) return;
            const existing = map.get(slug);
            if (existing) {
              existing.count += 1;
            } else {
              map.set(slug, { label, count: 1 });
            }
          });
        });

        const sorted = Array.from(map.entries())
          .map(([slug, { label, count }]) => ({ slug, label, count }))
          .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'tr'));

        setTags(sorted);
        setLoading(false);
      });
  }, []);

  const filtered = search.trim()
    ? tags.filter(t => t.label.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase()))
    : tags;

  const totalArticles = tags.reduce((s, t) => s + t.count, 0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111', margin: '0 0 0.375rem', letterSpacing: '-0.02em' }}>
          Etiketler
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
          Yayınlanmış makalelerdeki tüm etiket ve kategoriler.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Toplam Etiket', value: tags.length },
          { label: 'Etiketli Makale', value: totalArticles },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
            padding: '0.875rem 1.25rem', flex: '0 0 auto',
          }}>
            <div style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111', letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, marginTop: 2 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
        padding: '0.5rem 0.875rem', marginBottom: '1.25rem', maxWidth: 360,
      }}>
        <Search size={14} color="#9ca3af" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Etiket ara..."
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: '0.875rem', color: '#111', flex: 1, fontFamily: 'Inter, sans-serif',
          }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}>
            ×
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 140px 160px 100px',
          padding: '0.625rem 1rem',
          background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
          fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          <span>Etiket</span>
          <span>URL slug</span>
          <span>Makale sayısı</span>
          <span style={{ textAlign: 'right' }}>Site</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
            {search ? 'Eşleşen etiket bulunamadı.' : 'Henüz hiç etiket yok.'}
          </div>
        ) : (
          filtered.map((tag, i) => (
            <div
              key={tag.slug}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 160px 100px',
                padding: '0.75rem 1rem', alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              {/* Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, background: '#f3f4f6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Tag size={13} color="#6b7280" />
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>
                  {tag.label}
                </span>
              </div>

              {/* Slug */}
              <span style={{ fontSize: '0.8125rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                {tag.slug}
              </span>

              {/* Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FileText size={13} color="#9ca3af" />
                <span style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 500 }}>
                  {tag.count} makale
                </span>
              </div>

              {/* Site link */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => navigate(`tag/${tag.slug}`)}
                  title={`#tag/${tag.slug} sayfasına git`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem',
                    background: 'none', border: '1px solid #e5e7eb', borderRadius: 6,
                    padding: '0.3rem 0.625rem', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 500, color: '#374151',
                    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.1s, color 0.1s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#111';
                    (e.currentTarget as HTMLButtonElement).style.color = '#111';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                    (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                  }}
                >
                  <ExternalLink size={12} />
                  Görüntüle
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.875rem' }}>
          {filtered.length} etiket listeleniyor{search ? ` ("${search}" için)` : ''}
        </p>
      )}
    </div>
  );
}
