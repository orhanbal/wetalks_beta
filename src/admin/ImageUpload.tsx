import { useEffect, useRef, useState } from 'react';
import { Upload, X, Image, Search, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  /** 'cover' (varsayılan): 2000×1250'ye crop. 'contain': orijinal oran korunur, yalnızca büyükse küçültülür. */
  mode?: 'cover' | 'contain';
}

const TARGET_W = 2000;
const TARGET_H = 1250;
const MAX_CONTAIN = 2000; // contain modunda maksimum kenar uzunluğu

async function resizeToCanvas(file: File, mode: 'cover' | 'contain'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      if (mode === 'contain') {
        // Orijinal oranı koru, sadece çok büyükse küçült
        const scale = Math.min(1, MAX_CONTAIN / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        canvas.width = TARGET_W;
        canvas.height = TARGET_H;
        const ctx = canvas.getContext('2d')!;
        const scale = Math.max(TARGET_W / img.width, TARGET_H / img.height);
        const sw = TARGET_W / scale;
        const sh = TARGET_H / scale;
        const sx = (img.width - sw) / 2;
        const sy = (img.height - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, TARGET_W, TARGET_H);
      }
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/png',
        1,
      );
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

interface UnsplashPhoto {
  id: string;
  urls: { small: string; regular: string; full: string };
  alt_description: string | null;
  user: { name: string; links: { html: string } };
  links: { download_location: string };
}

function UnsplashPicker({ apiKey, onSelect }: { apiKey: string; onSelect: (url: string, alt: string) => void }) {
  // Strip any non-ASCII characters that would break the Authorization header
  const cleanKey = apiKey.replace(/[^\x00-\x7F]/g, '').trim();
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = async (q: string) => {
    if (!q.trim()) { setPhotos([]); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=18&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${cleanKey}` } }
      );
      if (!res.ok) throw new Error(`Unsplash API hatası: ${res.status}`);
      const data = await res.json();
      setPhotos(data.results ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Arama başarısız.');
    }
    setLoading(false);
  };

  const handleQueryChange = (v: string) => {
    setQuery(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(v), 500);
  };

  const handleSelect = async (photo: UnsplashPhoto) => {
    setSelectedId(photo.id);
    // Trigger download per Unsplash API guidelines
    fetch(photo.links.download_location, {
      headers: { Authorization: `Client-ID ${apiKey}` }
    }).catch(() => {});
    onSelect(photo.urls.regular, photo.alt_description ?? '');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Search input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        border: '1px solid #e5e7eb', borderRadius: 7, padding: '0.4rem 0.75rem',
        background: '#f9fafb',
      }}>
        <Search size={13} color="#9ca3af" />
        <input
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Fotoğraf ara... (örn. nature, city)"
          autoFocus
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', color: '#111',
          }}
        />
        {loading && (
          <div style={{
            width: 14, height: 14, border: '2px solid #e5e7eb', borderTopColor: '#6b7280',
            borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0,
          }} />
        )}
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem',
          maxHeight: 340, overflowY: 'auto', borderRadius: 6,
        }}>
          {photos.map(photo => (
            <div
              key={photo.id}
              onClick={() => handleSelect(photo)}
              title={photo.alt_description ?? ''}
              style={{
                position: 'relative',
                height: 90,
                borderRadius: 6,
                overflow: 'hidden',
                outline: selectedId === photo.id ? '2.5px solid #111' : '2.5px solid transparent',
                outlineOffset: 1,
                transition: 'outline-color 0.1s',
                cursor: 'pointer',
                background: '#f3f4f6',
              }}
            >
              <img
                src={photo.urls.small}
                alt={photo.alt_description ?? ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
                padding: '0.5rem 0.375rem 0.25rem',
                opacity: 0,
                transition: 'opacity 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
              >
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, sans-serif' }}>
                  {photo.user.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && photos.length === 0 && query.trim() && (
        <p style={{ fontSize: '0.8125rem', color: '#9ca3af', textAlign: 'center', margin: '0.5rem 0', fontFamily: 'Inter, sans-serif' }}>
          Sonuç bulunamadı.
        </p>
      )}

      {/* Attribution */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '0.6875rem', color: '#d1d5db', fontFamily: 'Inter, sans-serif' }}>Powered by</span>
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.6875rem', color: '#9ca3af', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}
        >
          Unsplash <ExternalLink size={9} />
        </a>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function ImageUpload({ value, onChange, folder = 'misc', mode = 'cover' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [unsplashKey, setUnsplashKey] = useState<string | null>(null);
  const [tab, setTab] = useState<'upload' | 'unsplash'>('upload');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'unsplash_access_key').maybeSingle().then(({ data }) => {
      if (data?.value) setUnsplashKey(data.value);
    });
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Sadece görsel dosyaları yüklenebilir.'); return; }
    if (file.size > 30 * 1024 * 1024) { setError('Dosya boyutu 30MB\'ı geçemez.'); return; }
    setError('');
    setUploading(true);
    try {
      const resized = await resizeToCanvas(file, mode);
      const ext = mode === 'contain' ? 'png' : 'jpg';
      const fileName = `${folder}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, resized, { contentType: mode === 'contain' ? 'image/png' : 'image/jpeg', upsert: false });
      if (uploadError) { setError(uploadError.message); setUploading(false); return; }
      const { data } = supabase.storage.from('covers').getPublicUrl(fileName);
      onChange(data.publicUrl);
    } catch {
      setError('Görsel yüklenirken hata oluştu.');
    }
    setUploading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const hasUnsplash = !!unsplashKey;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {value ? (
        <div style={{
          position: 'relative', borderRadius: 8, overflow: 'hidden',
          border: '1px solid #e5e7eb',
          width: mode === 'contain' ? 'auto' : 200,
          maxWidth: mode === 'contain' ? 300 : 200,
          flexShrink: 0,
          background: mode === 'contain' ? '#f3f4f6' : undefined,
        }}>
          <img
            src={value}
            alt=""
            style={{
              width: '100%',
              aspectRatio: mode === 'contain' ? undefined : '16/10',
              objectFit: mode === 'contain' ? 'contain' : 'cover',
              display: 'block',
              maxHeight: mode === 'contain' ? 120 : undefined,
            }}
          />
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '0.375rem' }}>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              title="Değiştir"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none',
                borderRadius: 6, padding: '0.375rem 0.625rem', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 500, fontFamily: 'Inter, sans-serif',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Upload size={12} /> Değiştir
            </button>
            <button
              onClick={() => onChange('')}
              title="Kaldır"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, background: 'rgba(0,0,0,0.65)', color: '#fff',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <X size={13} />
            </button>
          </div>
          {uploading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', color: '#374151', fontFamily: 'Inter, sans-serif',
            }}>
              Yükleniyor...
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Tabs — only show if Unsplash is configured */}
          {hasUnsplash && (
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb' }}>
              {([
                { key: 'upload' as const, label: 'Yükle' },
                { key: 'unsplash' as const, label: 'Unsplash' },
              ]).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    padding: '0.5rem 1rem', border: 'none', background: 'none',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8125rem', fontWeight: tab === t.key ? 600 : 400,
                    color: tab === t.key ? '#111' : '#9ca3af',
                    borderBottom: tab === t.key ? '2px solid #111' : '2px solid transparent',
                    marginBottom: -1, transition: 'all 0.1s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <div
              onClick={() => !uploading && inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragOver ? '#374151' : '#d1d5db'}`,
                borderRadius: 8,
                padding: '2rem 1.5rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.625rem',
                cursor: uploading ? 'wait' : 'pointer',
                background: dragOver ? '#f9fafb' : '#fff',
                transition: 'all 0.15s',
                textAlign: 'center',
              }}
            >
              {uploading ? (
                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                  Yükleniyor...
                </span>
              ) : (
                <>
                  <div style={{
                    width: 40, height: 40, borderRadius: 8, background: '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Image size={18} color="#9ca3af" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                      Görsel yükle
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif', marginTop: '0.2rem' }}>
                      {mode === 'contain'
                        ? 'Sürükle bırak veya tıkla · PNG, JPG, WebP · Orijinal oran korunur'
                        : 'Sürükle bırak veya tıkla · JPG, PNG, WebP · 2000×1250\'ye otomatik kırpılır'}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Unsplash tab */}
          {tab === 'unsplash' && unsplashKey && (
            <UnsplashPicker
              apiKey={unsplashKey}
              onSelect={(url, alt) => onChange(url)}
            />
          )}
        </div>
      )}

      {error && (
        <span style={{ fontSize: '0.75rem', color: '#ef4444', fontFamily: 'Inter, sans-serif' }}>{error}</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </div>
  );
}
