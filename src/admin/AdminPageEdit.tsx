import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Globe, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import BlockEditor from './BlockEditor';
import ImageUpload from './ImageUpload';

interface AdminPageEditProps {
  id?: string;
  isNew?: boolean;
  navigate: (to: string) => void;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminPageEdit({ id, isNew, navigate }: AdminPageEditProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [published, setPublished] = useState(false);
  const [showInNav, setShowInNav] = useState(false);
  const [navLabel, setNavLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [showMeta, setShowMeta] = useState(false);

  useEffect(() => {
    if (!id || isNew) return;
    (async () => {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (data) {
        setTitle(data.title ?? '');
        setSlug(data.slug ?? '');
        setContent(data.content ?? '');
        setExcerpt(data.excerpt ?? '');
        setOgImage(data.og_image ?? '');
        setPublished(data.published ?? false);
        setShowInNav(data.show_in_nav ?? false);
        setNavLabel(data.nav_label ?? '');
        setSlugManual(true);
      }
      setLoading(false);
    })();
  }, [id, isNew]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) { setError('Başlık gereklidir.'); return; }
    if (!slug.trim()) { setError('Slug gereklidir.'); return; }
    setError('');
    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim(),
      og_image: ogImage.trim(),
      published: publish !== undefined ? publish : published,
      show_in_nav: showInNav,
      nav_label: navLabel.trim(),
    };

    if (isNew) {
      const { error: err } = await supabase.from('pages').insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
      navigate('admin/pages');
    } else {
      const { error: err } = await supabase.from('pages').update(payload).eq('id', id);
      if (err) { setError(err.message); setSaving(false); return; }
      if (publish !== undefined) setPublished(publish);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 820, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('admin/pages')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              color: '#6b7280', fontSize: '0.875rem', fontWeight: 500, padding: 0,
            }}
          >
            <ArrowLeft size={15} /> Sayfalara Dön
          </button>
          <span style={{ color: '#d1d5db' }}>·</span>
          <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 600 }}>
            {isNew ? 'Yeni Sayfa' : title || 'Sayfa Düzenle'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {saved && (
            <span style={{ fontSize: '0.8125rem', color: '#16a34a', fontWeight: 500 }}>Kaydedildi!</span>
          )}
          {!published && !isNew && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1rem', background: '#16a34a', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
              }}
            >
              <Globe size={14} /> Yayınla
            </button>
          )}
          {published && !isNew && (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151',
                border: '1px solid #e5e7eb', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
              }}
            >
              <Lock size={14} /> Yayından Kaldır
            </button>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', background: '#111', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
            }}
          >
            <Save size={14} /> {isNew ? 'Kaydet' : 'Güncelle'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem 1rem', background: '#fff5f5', border: '1px solid #fecaca',
          borderRadius: 8, color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.25rem',
        }}>
          {error}
        </div>
      )}

      {/* Title */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Sayfa başlığı"
          style={{
            width: '100%', border: 'none', outline: 'none',
            fontSize: '2rem', fontWeight: 800, color: '#111',
            fontFamily: 'Inter, sans-serif', background: 'transparent',
            padding: 0, boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Slug */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '1.75rem', padding: '0.5rem 0.875rem',
        background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8,
      }}>
        <span style={{ fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'nowrap' }}>URL: /</span>
        <input
          type="text"
          value={slug}
          onChange={e => { setSlug(e.target.value); setSlugManual(true); }}
          placeholder="sayfa-slug"
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: '0.875rem', color: '#374151', fontFamily: 'monospace',
            background: 'transparent', minWidth: 0,
          }}
        />
      </div>

      {/* Content editor */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        marginBottom: '1.25rem', overflow: 'hidden',
      }}>
        <BlockEditor
          value={content}
          onChange={setContent}
        />
      </div>

      {/* Meta / Settings panel (collapsible) */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden',
      }}>
        <button
          onClick={() => setShowMeta(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1.25rem', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {showMeta ? <EyeOff size={14} color="#6b7280" /> : <Eye size={14} color="#6b7280" />}
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Sayfa Ayarları</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: showMeta ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showMeta && (
          <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Excerpt */}
            <div style={{ paddingTop: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Özet (meta açıklama)
              </label>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Sayfa hakkında kısa bir açıklama..."
                style={{
                  width: '100%', padding: '0.625rem 0.875rem',
                  border: '1px solid #e5e7eb', borderRadius: 8,
                  fontSize: '0.875rem', color: '#374151', fontFamily: 'Inter, sans-serif',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* OG Image */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Kapak Görseli (OG Image)
              </label>
              <ImageUpload
                value={ogImage}
                onChange={setOgImage}
                bucket="covers"
              />
            </div>

            {/* Nav settings */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showInNav}
                  onChange={e => setShowInNav(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#111' }}
                />
                <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                  Navigasyon menüsünde göster
                </span>
              </label>

              {showInNav && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Menü etiketi (boşsa başlık kullanılır)
                  </label>
                  <input
                    type="text"
                    value={navLabel}
                    onChange={e => setNavLabel(e.target.value)}
                    placeholder={title || 'Menü etiketi'}
                    style={{
                      width: '100%', padding: '0.5rem 0.875rem',
                      border: '1px solid #e5e7eb', borderRadius: 8,
                      fontSize: '0.875rem', color: '#374151', fontFamily: 'Inter, sans-serif',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={published}
                  onChange={e => setPublished(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#111' }}
                />
                <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                  Yayınla
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
