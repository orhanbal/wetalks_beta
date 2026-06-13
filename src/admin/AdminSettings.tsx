import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, Image, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Home, Newspaper, Tag, Info, Mail, BookOpen, Zap, Star, Globe, ChevronRight, LayoutGrid, Layers, Eye, EyeOff, Users, Link2, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthors, useSeries, useArticles } from '../hooks/useData';
import type { AuthorSummary } from '../hooks/useData';
import type { Series } from '../data/series';

const MENU_ICONS: { key: string; label: string; node: React.ReactNode }[] = [
  { key: '', label: 'Yok', node: <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>—</span> },
  { key: 'home', label: 'Ev', node: <Home size={14} /> },
  { key: 'newspaper', label: 'Gazete', node: <Newspaper size={14} /> },
  { key: 'tag', label: 'Etiket', node: <Tag size={14} /> },
  { key: 'info', label: 'Bilgi', node: <Info size={14} /> },
  { key: 'mail', label: 'E-posta', node: <Mail size={14} /> },
  { key: 'book', label: 'Kitap', node: <BookOpen size={14} /> },
  { key: 'zap', label: 'Şimşek', node: <Zap size={14} /> },
  { key: 'star', label: 'Yıldız', node: <Star size={14} /> },
  { key: 'globe', label: 'Küre', node: <Globe size={14} /> },
  { key: 'chevron', label: 'Ok', node: <ChevronRight size={14} /> },
  { key: 'grid', label: 'Grid', node: <LayoutGrid size={14} /> },
  { key: 'layers', label: 'Katman', node: <Layers size={14} /> },
];

// ── Code Injection Section ─────────────────────────────────────

function CodeInjectionSection({
  settings,
  set,
}: {
  settings: Record<string, string>;
  set: (key: string, val: string) => void;
}) {
  const [tab, setTab] = useState<'header' | 'footer'>('header');
  const headerCode = settings['code_injection_header'] ?? '';
  const footerCode = settings['code_injection_footer'] ?? '';

  const taStyle: React.CSSProperties = {
    width: '100%', minHeight: 420, padding: '1rem 1.25rem',
    border: 'none', outline: 'none', resize: 'vertical',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
    fontSize: '0.8125rem', lineHeight: 1.75, color: '#e2e8f0',
    background: 'transparent', boxSizing: 'border-box',
    caretColor: '#e2e8f0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Info card */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
        padding: '0.875rem 1.125rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
      }}>
        <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0, marginTop: 1 }}>💡</span>
        <div style={{ fontSize: '0.8125rem', color: '#713f12', lineHeight: 1.55 }}>
          <strong>Header:</strong> Google Analytics, Meta Pixel, doğrulama meta etiketleri, hizmet scriptleri için.
          {' '}<strong>Footer:</strong> Live chat widget'ları, defer'lı scriptler için.
          Eklenen kod her sayfaya otomatik eklenir.
        </div>
      </div>

      {/* Editor card */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
        {/* Tab bar */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #e5e7eb',
          background: '#f9fafb', padding: '0 1.25rem',
          gap: 0,
        }}>
          {([
            { key: 'header', label: 'Site header', hint: '<head> içine eklenir' },
            { key: 'footer', label: 'Site footer', hint: '</body> öncesine eklenir' },
          ] as { key: 'header' | 'footer'; label: string; hint: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '0.75rem 1rem 0.625rem',
                border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? '#111' : '#6b7280',
                borderBottom: tab === t.key ? '2px solid #111' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.12s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Code editor area */}
        <div style={{ background: '#0f172a', position: 'relative' }}>
          {/* Line numbers gutter */}
          <div style={{ display: 'flex', minHeight: 420 }}>
            <LineNumbers code={tab === 'header' ? headerCode : footerCode} />
            <textarea
              key={tab}
              value={tab === 'header' ? headerCode : footerCode}
              onChange={e => set(
                tab === 'header' ? 'code_injection_header' : 'code_injection_footer',
                e.target.value,
              )}
              placeholder={tab === 'header'
                ? '<!-- Google Analytics, Meta Pixel, doğrulama etiketleri buraya -->'
                : '<!-- Chat widget, deferred scriptler buraya -->'}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              style={taStyle}
            />
          </div>

          {/* Character count */}
          <div style={{
            position: 'absolute', bottom: 8, right: 12,
            fontSize: '0.6875rem', color: '#475569',
            fontFamily: 'monospace', pointerEvents: 'none',
          }}>
            {(tab === 'header' ? headerCode : footerCode).length} karakter
          </div>
        </div>

        {/* Hint footer */}
        <div style={{
          padding: '0.5rem 1.25rem', borderTop: '1px solid #1e293b',
          background: '#0f172a', fontSize: '0.75rem', color: '#475569',
        }}>
          {tab === 'header'
            ? 'Bu kod her sayfanın <head> etiketine eklenir'
            : 'Bu kod her sayfanın </body> etiketinden önce eklenir'}
        </div>
      </div>

      {/* Quick snippets */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>Hızlı şablonlar</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            {
              label: 'Google Analytics',
              tab: 'header' as const,
              code: `<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXXXX');\n</script>`,
            },
            {
              label: 'Google Search Console',
              tab: 'header' as const,
              code: `<meta name="google-site-verification" content="VERIFICATION_CODE_BURAYA" />`,
            },
            {
              label: 'Meta Pixel',
              tab: 'header' as const,
              code: `<!-- Meta Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,'script',\n'https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', 'PIXEL_ID_BURAYA');\nfbq('track', 'PageView');\n</script>`,
            },
            {
              label: 'Microsoft Clarity',
              tab: 'header' as const,
              code: `<script type="text/javascript">\n    (function(c,l,a,r,i,t,y){\n        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};\n        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;\n        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);\n    })(window, document, "clarity", "script", "CLARITY_ID_BURAYA");\n</script>`,
            },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => {
                setTab(s.tab);
                const key = s.tab === 'header' ? 'code_injection_header' : 'code_injection_footer';
                const existing = settings[key] ?? '';
                set(key, existing ? existing + '\n\n' + s.code : s.code);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb',
                borderRadius: 6, cursor: 'pointer', background: '#fff',
                fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 500,
                color: '#374151', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#374151'; (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
            >
              + {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LineNumbers({ code }: { code: string }) {
  const lines = (code || ' ').split('\n').length;
  return (
    <div style={{
      minWidth: 44, padding: '1rem 0',
      background: '#0f172a', borderRight: '1px solid #1e293b',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'monospace', fontSize: '0.8125rem',
      lineHeight: 1.75, color: '#334155',
      userSelect: 'none', flexShrink: 0,
      textAlign: 'right',
    }}>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} style={{ paddingRight: '0.75rem', paddingLeft: '0.5rem' }}>{i + 1}</span>
      ))}
    </div>
  );
}

// ── Accent presets ─────────────────────────────────────────────

const ACCENT_PRESETS = [
  { label: 'Limon Yeşili', value: '#c8f542' },
  { label: 'Gökyüzü Mavisi', value: '#38bdf8' },
  { label: 'Turuncu', value: '#fb923c' },
  { label: 'Kırmızı', value: '#f87171' },
  { label: 'Pembe', value: '#f472b6' },
  { label: 'Teal', value: '#2dd4bf' },
  { label: 'Sarı', value: '#fbbf24' },
  { label: 'Açık Yeşil', value: '#4ade80' },
];

function LogoUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Sadece görsel dosyaları yüklenebilir.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Dosya boyutu 5MB\'ı geçemez.'); return; }
    setError('');
    setUploading(true);
    try {
      const fileName = `logos/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(fileName, file, { contentType: file.type, upsert: false });
      if (uploadError) { setError(uploadError.message); setUploading(false); return; }
      const { data } = supabase.storage.from('covers').getPublicUrl(fileName);
      onChange(data.publicUrl);
    } catch {
      setError('Görsel yüklenirken hata oluştu.');
    }
    setUploading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {value ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb',
        }}>
          <img src={value} alt="Logo" style={{ height: 36, maxWidth: 160, objectFit: 'contain' }} />
          <div style={{ display: 'flex', gap: '0.375rem', marginLeft: 'auto' }}>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6,
                padding: '0.375rem 0.625rem', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#374151',
              }}
            >
              <Upload size={12} />
              Değiştir
            </button>
            <button
              onClick={() => onChange('')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, background: '#fff', border: '1px solid #e5e7eb',
                borderRadius: 6, cursor: 'pointer', color: '#9ca3af',
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          style={{
            border: '2px dashed #d1d5db', borderRadius: 8, padding: '1.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            cursor: uploading ? 'wait' : 'pointer', background: '#fff', transition: 'all 0.15s',
            textAlign: 'center',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#374151'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#d1d5db'; }}
        >
          {uploading ? (
            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>Yükleniyor...</span>
          ) : (
            <>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Image size={16} color="#9ca3af" />
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', fontFamily: 'Inter, sans-serif' }}>Logo yükle</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>PNG, SVG, WebP — orijinal boyut korunur</div>
            </>
          )}
        </div>
      )}
      {error && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontFamily: 'Inter, sans-serif' }}>{error}</span>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
    </div>
  );
}

type MenuOrderItem = { id: string; hidden: boolean };

function parseMenuOrder(json: string | undefined): MenuOrderItem[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

function applySeriesOrder(seriesList: Series[], order: MenuOrderItem[]): Series[] {
  if (!order.length) return seriesList;
  const map = new Map(seriesList.map(s => [s.id, s]));
  const ordered: Series[] = [];
  order.forEach(o => { if (!o.hidden) { const s = map.get(o.id); if (s) ordered.push(s); } });
  seriesList.forEach(s => { if (!order.find(o => o.id === s.id)) ordered.push(s); });
  return ordered;
}

function applyAuthorsOrder(authors: AuthorSummary[], order: MenuOrderItem[]): AuthorSummary[] {
  if (!order.length) return authors;
  const map = new Map(authors.map(a => [a.id, a]));
  const ordered: AuthorSummary[] = [];
  order.forEach(o => { if (!o.hidden) { const a = map.get(o.id); if (a) ordered.push(a); } });
  authors.forEach(a => { if (!order.find(o => o.id === a.id)) ordered.push(a); });
  return ordered;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('general');
  const [accentInput, setAccentInput] = useState('');
  const [customFontInput, setCustomFontInput] = useState('');
  const [customFontPreview, setCustomFontPreview] = useState(false);
  const [extraFonts, setExtraFonts] = useState<string[]>([]);
  const [sideSearchQ, setSideSearchQ] = useState('');
  const [stripSearchQ, setStripSearchQ] = useState('');
  const [rightSearchQ, setRightSearchQ] = useState('');
  const [authorSearchQ, setAuthorSearchQ] = useState('');
  const { authors } = useAuthors();
  const { seriesList } = useSeries();
  const { articles: allArticles } = useArticles();

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s: { key: string; value: string }) => { map[s.key] = s.value; });
        setSettings(map);
        setAccentInput(map['accent_color'] || '#c8f542');
        if (map['site_extra_fonts']) {
          try { setExtraFonts(JSON.parse(map['site_extra_fonts'])); } catch { /* ignore */ }
        }
      }
    });
  }, []);

  const set = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }));

  const loadGoogleFont = (name: string) => {
    const id = `__gfont_${name.replace(/\s+/g, '_')}__`;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${name.replace(/\s+/g, '+')}:ital,wght@0,400;0,700;1,400&display=swap`;
      document.head.appendChild(link);
    }
  };

  const addExtraFont = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    loadGoogleFont(trimmed);
    const updated = extraFonts.includes(trimmed) ? extraFonts : [...extraFonts, trimmed];
    setExtraFonts(updated);
    set('site_extra_fonts', JSON.stringify(updated));
    set('site_font', trimmed);
    setCustomFontInput('');
    setCustomFontPreview(false);
  };

  const removeExtraFont = (name: string) => {
    const updated = extraFonts.filter(f => f !== name);
    setExtraFonts(updated);
    set('site_extra_fonts', JSON.stringify(updated));
    if ((settings['site_font'] ?? 'Inter') === name) set('site_font', 'Inter');
  };

  const setAccent = (value: string) => {
    setAccentInput(value);
    set('accent_color', value);
    document.documentElement.style.setProperty('--accent', value);
    document.documentElement.style.setProperty('--accent-hover', value);
  };

  const handleSave = async () => {
    setSaving(true);
    const upserts = Object.entries(settings).map(([key, value]) => ({
      key, value, updated_at: new Date().toISOString(),
    }));
    await supabase.from('site_settings').upsert(upserts);
    setSaving(false);
    setSaved(true);
    window.dispatchEvent(new Event('settings-updated'));
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb',
    borderRadius: 6, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#111',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem',
  };

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseUrlSaved, setSupabaseUrlSaved] = useState(false);
  const [supabaseKeySaved, setSupabaseKeySaved] = useState(false);
  const [showAnonKey, setShowAnonKey] = useState(false);

  useEffect(() => {
    setSupabaseUrl(import.meta.env.VITE_SUPABASE_URL ?? '');
    setSupabaseAnonKey(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '');
  }, []);

  const sidebarItems = [
    { id: 'setup', label: 'Kurulum' },
    { id: 'general', label: 'Genel' },
    { id: 'features', label: 'Özellikler' },
    { id: 'theme', label: 'Tema & Logo' },
    { id: 'menu', label: 'Navigasyon Menüsü' },
    { id: 'series_menu', label: 'Yazı Dizileri Menüsü' },
    { id: 'code', label: 'Kod Enjeksiyonu' },
    { id: 'footer', label: 'Alt Bilgi' },
    { id: 'hero', label: 'Ana Sayfa' },
    { id: 'announcement', label: 'Duyuru' },
    { id: 'about', label: 'Hakkımda' },
    { id: 'social', label: 'Sosyal & İletişim' },
    { id: 'writing', label: 'Yazı Araçları' },
  ];

  // Menu items state
  type MenuItem = { label: string; path: string; icon?: string };
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (settings['menu_items']) {
      try { setMenuItems(JSON.parse(settings['menu_items'])); } catch { /* ignore */ }
    }
  }, [settings['menu_items']]);

  const syncMenuItems = (items: MenuItem[]) => {
    setMenuItems(items);
    set('menu_items', JSON.stringify(items));
  };

  const addMenuItem = () => syncMenuItems([...menuItems, { label: '', path: '' }]);

  const updateMenuItem = (i: number, field: 'label' | 'path' | 'icon', val: string) => {
    const next = menuItems.map((m, idx) => idx === i ? { ...m, [field]: val } : m);
    syncMenuItems(next);
  };

  const removeMenuItem = (i: number) => syncMenuItems(menuItems.filter((_, idx) => idx !== i));

  const moveMenuItem = (i: number, dir: 'up' | 'down') => {
    const next = [...menuItems];
    const swap = dir === 'up' ? i - 1 : i + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]];
    syncMenuItems(next);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52,
      }}>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>Ayarlar</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: '#111', color: '#fff', border: 'none', borderRadius: 6,
            padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {/* Left nav */}
        <div style={{
          width: 200, minWidth: 200, padding: '1.25rem 0.75rem',
          borderRight: '1px solid #e5e7eb', background: '#fff',
          minHeight: 'calc(100vh - 52px)',
        }}>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                display: 'block', width: '100%', padding: '0.5rem 0.75rem',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                fontWeight: activeSection === item.id ? 600 : 400,
                background: activeSection === item.id ? '#f3f4f6' : 'transparent',
                color: activeSection === item.id ? '#111' : '#6b7280',
                textAlign: 'left', marginBottom: '1px', transition: 'all 0.1s',
              }}
              onMouseEnter={e => { if (activeSection !== item.id) (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb'; }}
              onMouseLeave={e => { if (activeSection !== item.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '2rem', maxWidth: 640 }}>

          {/* ── SETUP ── */}
          {activeSection === 'setup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Supabase entegrasyonu */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#3ecf8e1a', border: '1px solid #3ecf8e40', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z" fill="#3ecf8e"/></svg>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: 0 }}>Supabase Entegrasyonu</h2>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, marginTop: 2 }}>Veritabanı ve depolama bağlantı bilgileri</p>
                  </div>
                </div>

                {/* Bağlantı durumu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: '#166534', fontWeight: 500 }}>Supabase bağlantısı aktif</span>
                </div>

                {/* URL */}
                <div>
                  <label style={labelStyle}>Proje URL</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={supabaseUrl}
                      readOnly
                      style={{ ...inputStyle, flex: 1, background: '#f9fafb', color: '#374151', cursor: 'default', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
                    />
                    <button
                      onClick={() => { navigator.clipboard.writeText(supabaseUrl); setSupabaseUrlSaved(true); setTimeout(() => setSupabaseUrlSaved(false), 2000); }}
                      style={{ padding: '0.5rem 0.875rem', border: '1px solid #e5e7eb', borderRadius: 6, background: supabaseUrlSaved ? '#f0fdf4' : '#fff', color: supabaseUrlSaved ? '#16a34a' : '#374151', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                    >
                      {supabaseUrlSaved ? 'Kopyalandı!' : 'Kopyala'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.375rem 0 0' }}>
                    Supabase proje dashboard'undan alınan URL. <code style={{ fontSize: '0.7rem', background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>VITE_SUPABASE_URL</code>
                  </p>
                </div>

                {/* Anon Key */}
                <div>
                  <label style={labelStyle}>Anon / Public Key</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input
                        type={showAnonKey ? 'text' : 'password'}
                        value={supabaseAnonKey}
                        readOnly
                        style={{ ...inputStyle, width: '100%', background: '#f9fafb', color: '#374151', cursor: 'default', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', paddingRight: '2.5rem', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={() => setShowAnonKey(v => !v)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex' }}
                      >
                        {showAnonKey
                          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(supabaseAnonKey); setSupabaseKeySaved(true); setTimeout(() => setSupabaseKeySaved(false), 2000); }}
                      style={{ padding: '0.5rem 0.875rem', border: '1px solid #e5e7eb', borderRadius: 6, background: supabaseKeySaved ? '#f0fdf4' : '#fff', color: supabaseKeySaved ? '#16a34a' : '#374151', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                    >
                      {supabaseKeySaved ? 'Kopyalandı!' : 'Kopyala'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.375rem 0 0' }}>
                    Herkese açık (public) anahtar. Gizli değil, ancak paylaşırken dikkatli olun. <code style={{ fontSize: '0.7rem', background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>VITE_SUPABASE_ANON_KEY</code>
                  </p>
                </div>

                {/* Info */}
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#713f12', lineHeight: 1.6 }}>
                  <strong>Bu değerleri değiştirmek için</strong> projenizin <code style={{ fontSize: '0.75rem', background: '#fef3c7', padding: '1px 4px', borderRadius: 3 }}>.env</code> dosyasını güncelleyin ve uygulamayı yeniden derleyin. Ortam değişkenleri derleme zamanında gömüldüğünden tarayıcı üzerinden değiştirilemez.
                </div>
              </div>

              {/* Veritabanı tablolar */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: 0 }}>Veritabanı Tabloları</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  {[
                    { name: 'articles', desc: 'Makaleler ve içerikler' },
                    { name: 'series', desc: 'Yazı dizileri' },
                    { name: 'profiles', desc: 'Kullanıcı profilleri' },
                    { name: 'site_settings', desc: 'Site ayarları' },
                    { name: 'newsletter_subscribers', desc: 'Bülten aboneleri' },
                    { name: 'newsletter_send_logs', desc: 'Bülten gönderim logları' },
                    { name: 'page_views', desc: 'Sayfa görüntüleme analitik' },
                    { name: 'agenda_tasks', desc: 'Ajanda görevleri' },
                    { name: 'agenda_content_plans', desc: 'İçerik planları' },
                    { name: 'role_requests', desc: 'Rol talepleri' },
                  ].map(t => (
                    <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', border: '1px solid #f3f4f6', borderRadius: 8, background: '#fafafa' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3ecf8e', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111', fontFamily: 'monospace' }}>{t.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edge Functions */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: 0 }}>Edge Functions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { name: 'track-pageview', desc: 'Sayfa görüntülemelerini kaydeder ve konum tespiti yapar', method: 'POST' },
                    { name: 'send-newsletter', desc: 'Bülten gönderimini tetikler ve abone yönetimi yapar', method: 'POST' },
                  ].map(fn => (
                    <div key={fn.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', border: '1px solid #f3f4f6', borderRadius: 8, background: '#fafafa' }}>
                      <span style={{ padding: '2px 7px', borderRadius: 5, background: '#dbeafe', color: '#1d4ed8', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'monospace', marginTop: 2, flexShrink: 0 }}>{fn.method}</span>
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111', fontFamily: 'monospace' }}>/functions/v1/{fn.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 2 }}>{fn.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── GENERAL ── */}
          {activeSection === 'general' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Genel ayarlar</h2>
              <div>
                <label style={labelStyle}>Site başlığı</label>
                <input type="text" value={settings['site_title'] ?? ''} onChange={e => set('site_title', e.target.value)} placeholder="Site Adı" style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
              </div>
              <div>
                <label style={labelStyle}>Site açıklaması</label>
                <textarea value={settings['site_description'] ?? ''} onChange={e => set('site_description', e.target.value)} placeholder="Sitenizin kısa açıklaması" rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
              </div>
              <div>
                <label style={labelStyle}>Site alan adı</label>
                <input type="text" value={settings['site_domain'] ?? ''} onChange={e => set('site_domain', e.target.value)} placeholder="siteadi.com" style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
              </div>
            </div>
          )}

          {/* ── THEME & LOGO ── */}
          {activeSection === 'theme' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Logo card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Site logosu</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Logo yüklenirse header ve footer'da metin yerine görsel gösterilir.</p>
                </div>
                {/* Light logo */}
                <div>
                  <label style={labelStyle}>Açık tema logosu</label>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 0.625rem' }}>Açık (light) temada görünecek logo.</p>
                  <LogoUpload value={settings['logo_url'] ?? ''} onChange={url => set('logo_url', url)} />
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={settings['logo_url'] ?? ''}
                      onChange={e => set('logo_url', e.target.value)}
                      placeholder="Veya URL girin: https://... (PNG, SVG, WebP)"
                      style={{ ...inputStyle, flex: 1 }}
                      onFocus={e => { e.target.style.borderColor = '#374151'; }}
                      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                    />
                    {settings['logo_url'] && (
                      <div style={{ width: 44, height: 44, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={settings['logo_url']} alt="Önizleme" style={{ maxWidth: 40, maxHeight: 40, objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dark logo */}
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.25rem' }}>
                  <label style={labelStyle}>Koyu tema logosu</label>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 0.625rem' }}>
                    Koyu (dark) temada görünecek logo. Boş bırakılırsa açık tema logosu kullanılır.
                  </p>
                  <LogoUpload value={settings['logo_url_dark'] ?? ''} onChange={url => set('logo_url_dark', url)} />
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={settings['logo_url_dark'] ?? ''}
                      onChange={e => set('logo_url_dark', e.target.value)}
                      placeholder="Veya URL girin: https://... (PNG, SVG, WebP)"
                      style={{ ...inputStyle, flex: 1 }}
                      onFocus={e => { e.target.style.borderColor = '#374151'; }}
                      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                    />
                    {settings['logo_url_dark'] && (
                      <div style={{ width: 44, height: 44, border: '1px solid #374151', borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={settings['logo_url_dark']} alt="Önizleme" style={{ maxWidth: 40, maxHeight: 40, objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                  {/* Side-by-side preview */}
                  {(settings['logo_url'] || settings['logo_url_dark']) && (
                    <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.75rem' }}>
                      <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Açık Tema</span>
                        {settings['logo_url']
                          ? <img src={settings['logo_url']} alt="Açık tema" style={{ maxHeight: 32, maxWidth: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          : <span style={{ fontSize: '0.75rem', color: '#d1d5db' }}>Logo yok</span>
                        }
                      </div>
                      <div style={{ flex: 1, border: '1px solid #374151', borderRadius: 8, padding: '0.75rem', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Koyu Tema</span>
                        {(settings['logo_url_dark'] || settings['logo_url'])
                          ? <img src={settings['logo_url_dark'] || settings['logo_url']} alt="Koyu tema" style={{ maxHeight: 32, maxWidth: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          : <span style={{ fontSize: '0.75rem', color: '#374151' }}>Logo yok</span>
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Favicon card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Favicon</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Tarayıcı sekmesinde görünen küçük ikon. PNG, ICO veya SVG önerilir, ideal boyut 32×32 veya 64×64 px.</p>
                </div>
                <LogoUpload value={settings['favicon_url'] ?? ''} onChange={url => set('favicon_url', url)} />
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={settings['favicon_url'] ?? ''}
                    onChange={e => set('favicon_url', e.target.value)}
                    placeholder="Veya URL girin: https://... (PNG, ICO, SVG)"
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => { e.target.style.borderColor = '#374151'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                  />
                  {settings['favicon_url'] && (
                    <div style={{
                      width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: 8,
                      background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <img
                        src={settings['favicon_url']}
                        alt="Favicon önizleme"
                        style={{ width: 20, height: 20, objectFit: 'contain' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
                {settings['favicon_url'] && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.625rem 0.875rem', background: '#f9fafb',
                    border: '1px solid #f3f4f6', borderRadius: 8,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: '#fff', border: '1px solid #e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      <img
                        src={settings['favicon_url']}
                        alt=""
                        style={{ width: 14, height: 14, objectFit: 'contain' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                      Tarayıcı sekmesinde bu şekilde görünür
                    </span>
                  </div>
                )}
              </div>

              {/* Font card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Site fontu</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Tüm sayfalarda kullanılacak başlık ve gövde fontu.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.625rem' }}>
                  {[
                    { value: 'Inter', label: 'Inter', sample: 'Modern & temiz' },
                    { value: 'Merriweather', label: 'Merriweather', sample: 'Klasik serif' },
                    { value: 'Lora', label: 'Lora', sample: 'Zarif serif' },
                    { value: 'Playfair Display', label: 'Playfair Display', sample: 'Editoryal' },
                    { value: 'Source Serif 4', label: 'Source Serif 4', sample: 'Gazete stili' },
                    { value: 'DM Sans', label: 'DM Sans', sample: 'Yumuşak geometric' },
                    ...extraFonts.map(f => ({ value: f, label: f, sample: 'Özel font', custom: true })),
                  ].map(f => {
                    const active = (settings['site_font'] ?? 'Inter') === f.value;
                    return (
                      <div key={f.value} style={{ position: 'relative' }}>
                        <button
                          onClick={() => set('site_font', f.value)}
                          style={{
                            width: '100%', padding: '0.75rem 1rem', borderRadius: 8, cursor: 'pointer',
                            border: active ? '2px solid #111' : '1px solid #e5e7eb',
                            background: active ? '#111' : '#fff',
                            textAlign: 'left', fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ fontFamily: `'${f.value}', sans-serif`, fontSize: '1rem', fontWeight: 700, color: active ? '#fff' : '#111', marginBottom: '0.2rem', paddingRight: (f as { custom?: boolean }).custom ? '1.25rem' : 0 }}>
                            {f.label}
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: active ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>
                            {f.sample}
                          </div>
                        </button>
                        {(f as { custom?: boolean }).custom && (
                          <button
                            onClick={e => { e.stopPropagation(); removeExtraFont(f.value); }}
                            title="Kaldır"
                            style={{
                              position: 'absolute', top: 6, right: 6,
                              width: 18, height: 18, borderRadius: '50%',
                              border: 'none', background: active ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                              color: active ? '#fff' : '#6b7280',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.6rem', fontWeight: 700, lineHeight: 1, padding: 0,
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom Google Font */}
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                    Google Fonts'tan font ekle
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 0.75rem' }}>
                    <a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#374151', textDecoration: 'underline' }}>fonts.google.com</a>'dan beğendiğiniz fontu bulup adını tam olarak yazın (örn: <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 3, fontSize: '0.7rem' }}>Reddit Sans</code>, <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 3, fontSize: '0.7rem' }}>Nunito</code>).
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                    <input
                      type="text"
                      value={customFontInput}
                      onChange={e => { setCustomFontInput(e.target.value); setCustomFontPreview(false); }}
                      placeholder="Örn: Reddit Sans"
                      style={{
                        flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb',
                        borderRadius: 7, fontSize: '0.875rem', color: '#111',
                        outline: 'none', fontFamily: 'Inter, sans-serif',
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && customFontInput.trim()) {
                          loadGoogleFont(customFontInput.trim());
                          setCustomFontPreview(true);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (!customFontInput.trim()) return;
                        loadGoogleFont(customFontInput.trim());
                        setCustomFontPreview(true);
                      }}
                      style={{
                        padding: '0.5rem 0.875rem', border: '1px solid #e5e7eb', borderRadius: 7,
                        background: '#f9fafb', color: '#374151', fontSize: '0.8125rem', fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      Önizle
                    </button>
                    <button
                      onClick={() => addExtraFont(customFontInput)}
                      style={{
                        padding: '0.5rem 0.875rem', border: 'none', borderRadius: 7,
                        background: '#111', color: '#fff', fontSize: '0.8125rem', fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      Ekle
                    </button>
                  </div>

                  {customFontPreview && customFontInput.trim() && (
                    <div style={{
                      marginTop: '0.75rem', padding: '0.875rem 1rem',
                      border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa',
                    }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Önizleme — {customFontInput.trim()}
                      </div>
                      <div style={{ fontFamily: `'${customFontInput.trim()}', sans-serif`, fontSize: '1.25rem', fontWeight: 700, color: '#111', lineHeight: 1.3 }}>
                        Sahadan Notlar
                      </div>
                      <div style={{ fontFamily: `'${customFontInput.trim()}', sans-serif`, fontSize: '0.875rem', color: '#666', marginTop: '0.3rem' }}>
                        Ticaret, e-ticaret ve girişimcilik üzerine.
                      </div>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
                  Font değişikliği site genelinde geçerli olur. Google Fonts üzerinden yüklenir.
                </p>
              </div>

              {/* Site theme style card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Site Görünümü</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Klasik el yapımı CSS teması veya Shadcn UI tabanlı modern Tailwind teması arasında seçim yapın.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {[
                    { value: 'classic', label: 'Klasik', desc: 'Özel CSS, magazin düzeni' },
                    { value: 'modern', label: 'Modern', desc: 'Shadcn UI + Tailwind' },
                  ].map(opt => {
                    const active = (settings['site_style'] ?? 'classic') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => set('site_style', opt.value)}
                        style={{
                          padding: '0.75rem 1.25rem',
                          borderRadius: 10,
                          cursor: 'pointer',
                          border: active ? '2px solid #111' : '1px solid #e5e7eb',
                          background: active ? '#111' : '#fff',
                          color: active ? '#fff' : '#374151',
                          fontSize: '0.875rem',
                          fontWeight: active ? 700 : 500,
                          fontFamily: 'Inter, sans-serif',
                          transition: 'all 0.15s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '0.2rem',
                          minWidth: 140,
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{opt.label}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.65, fontWeight: 400 }}>{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
                {(settings['site_style'] ?? 'classic') === 'modern' && (
                  <p style={{ fontSize: '0.775rem', color: '#059669', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    Modern tema aktif. Değişiklik kaydedildiğinde anında uygulanır.
                  </p>
                )}
              </div>

              {/* Default theme card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Varsayılan tema</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Siteyi ilk ziyaret eden kullanıcıların göreceği tema. Kullanıcı kendi tercihini seçerse bu ayar geçersiz olur.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  {[
                    { value: 'system', label: 'Sistem Tercihi' },
                    { value: 'light', label: 'Açık Mod' },
                    { value: 'dark', label: 'Koyu Mod' },
                  ].map(opt => {
                    const active = (settings['default_theme'] ?? 'system') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => set('default_theme', opt.value)}
                        style={{
                          padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer',
                          border: active ? '2px solid #111' : '1px solid #e5e7eb',
                          background: active ? '#111' : '#fff',
                          color: active ? '#fff' : '#374151',
                          fontSize: '0.8125rem', fontWeight: active ? 600 : 400,
                          fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shadows toggle card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Gölgeler</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Kart ve bileşen gölgelerini açın veya kapatın.</p>
                </div>
                {/* Global shadows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Kart gölgeleri</label>
                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    {[
                      { value: 'true', label: 'Açık' },
                      { value: 'false', label: 'Kapalı' },
                    ].map(opt => {
                      const active = (settings['use_shadows'] ?? 'true') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => set('use_shadows', opt.value)}
                          style={{
                            padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer',
                            border: active ? '2px solid #111' : '1px solid #e5e7eb',
                            background: active ? '#111' : '#fff',
                            color: active ? '#fff' : '#374151',
                            fontSize: '0.8125rem', fontWeight: active ? 600 : 400,
                            fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Banner shadow */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Gündem bandı gölgesi</label>
                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    {[
                      { value: 'true', label: 'Açık' },
                      { value: 'false', label: 'Kapalı' },
                    ].map(opt => {
                      const active = (settings['banner_shadow'] ?? 'true') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => set('banner_shadow', opt.value)}
                          style={{
                            padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer',
                            border: active ? '2px solid #111' : '1px solid #e5e7eb',
                            background: active ? '#111' : '#fff',
                            color: active ? '#fff' : '#374151',
                            fontSize: '0.8125rem', fontWeight: active ? 600 : 400,
                            fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Banner background colors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Gündem bandı arka plan rengi</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Açık tema</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="color" value={settings['banner_bg'] || '#ffffff'} onChange={e => set('banner_bg', e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 2 }} />
                        <input type="text" value={settings['banner_bg'] || ''} onChange={e => set('banner_bg', e.target.value)} placeholder="#ffffff" style={{ ...inputStyle, flex: 1 }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Koyu tema</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="color" value={settings['banner_bg_dark'] || '#0a0a0a'} onChange={e => set('banner_bg_dark', e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #374151', cursor: 'pointer', padding: 2, background: '#1a1a1a' }} />
                        <input type="text" value={settings['banner_bg_dark'] || ''} onChange={e => set('banner_bg_dark', e.target.value)} placeholder="#0a0a0a" style={{ ...inputStyle, flex: 1 }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navbar background colors card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Navbar arka plan renkleri</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Navigasyon çubuğunun normal ve kaydırılmış (sticky) hallerinin arka plan rengini ayarlayın.</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Light normal */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Açık tema — normal</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <input type="color" value={settings['navbar_bg_normal'] || '#ffffff00'} onChange={e => set('navbar_bg_normal', e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 2 }} />
                      <input type="text" value={settings['navbar_bg_normal'] || ''} onChange={e => set('navbar_bg_normal', e.target.value)} placeholder="transparent" style={{ ...inputStyle, flex: 1 }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                    </div>
                  </div>
                  {/* Light sticky */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Açık tema — sticky</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <input type="color" value={settings['navbar_bg_sticky'] || '#fafafa'} onChange={e => set('navbar_bg_sticky', e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 2 }} />
                      <input type="text" value={settings['navbar_bg_sticky'] || ''} onChange={e => set('navbar_bg_sticky', e.target.value)} placeholder="#fafafa" style={{ ...inputStyle, flex: 1 }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                    </div>
                  </div>
                  {/* Dark normal */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Koyu tema — normal</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <input type="color" value={settings['navbar_bg_normal_dark'] || '#0f0f0f'} onChange={e => set('navbar_bg_normal_dark', e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #374151', cursor: 'pointer', padding: 2, background: '#1a1a1a' }} />
                      <input type="text" value={settings['navbar_bg_normal_dark'] || ''} onChange={e => set('navbar_bg_normal_dark', e.target.value)} placeholder="transparent" style={{ ...inputStyle, flex: 1 }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                    </div>
                  </div>
                  {/* Dark sticky */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Koyu tema — sticky</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <input type="color" value={settings['navbar_bg_sticky_dark'] || '#141414'} onChange={e => set('navbar_bg_sticky_dark', e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid #374151', cursor: 'pointer', padding: 2, background: '#1a1a1a' }} />
                      <input type="text" value={settings['navbar_bg_sticky_dark'] || ''} onChange={e => set('navbar_bg_sticky_dark', e.target.value)} placeholder="#141414" style={{ ...inputStyle, flex: 1 }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent color card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Tema rengi</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Buton ve vurgu rengi olarak sitede kullanılır.</p>
                </div>

                {/* Preset swatches */}
                <div>
                  <label style={labelStyle}>Hazır renkler</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {ACCENT_PRESETS.map(preset => (
                      <button
                        key={preset.value}
                        title={preset.label}
                        onClick={() => setAccent(preset.value)}
                        style={{
                          width: 36, height: 36, borderRadius: 8, border: '2px solid',
                          borderColor: accentInput.toLowerCase() === preset.value.toLowerCase() ? '#111' : 'transparent',
                          background: preset.value, cursor: 'pointer', padding: 0,
                          outline: accentInput.toLowerCase() === preset.value.toLowerCase() ? '2px solid #111' : 'none',
                          outlineOffset: 2, transition: 'all 0.15s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom hex input */}
                <div>
                  <label style={labelStyle}>Özel renk</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <input
                        type="color"
                        value={accentInput.match(/^#[0-9a-fA-F]{6}$/) ? accentInput : '#c8f542'}
                        onChange={e => setAccent(e.target.value)}
                        style={{
                          width: 44, height: 44, border: '1px solid #e5e7eb', borderRadius: 8,
                          cursor: 'pointer', padding: 2, background: '#fff',
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={accentInput}
                      onChange={e => {
                        setAccentInput(e.target.value);
                        if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                          set('accent_color', e.target.value);
                          document.documentElement.style.setProperty('--accent', e.target.value);
                          document.documentElement.style.setProperty('--accent-hover', e.target.value);
                        }
                      }}
                      placeholder="#c8f542"
                      style={{ ...inputStyle, width: 120 }}
                      onFocus={e => { e.target.style.borderColor = '#374151'; }}
                      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                    />
                    {/* Live preview on a button */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.5rem 1rem', borderRadius: 100,
                      background: accentInput.match(/^#[0-9a-fA-F]{6}$/) ? accentInput : 'var(--accent)',
                      color: '#111', fontSize: '0.8125rem', fontWeight: 700,
                      fontFamily: 'Inter, sans-serif', boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}>
                      Önizle
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MENU ── */}
          {activeSection === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Preview card */}
              <div style={{
                background: '#111', borderRadius: 12, padding: '1rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '1.5rem',
                overflowX: 'auto',
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                  {settings['site_title'] || 'Site Adı'}
                </span>
                {menuItems.map((item, i) => {
                  const iconNode = item.icon ? MENU_ICONS.find(ic => ic.key === item.icon)?.node : null;
                  return (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      fontSize: '0.8125rem', color: i === 0 ? 'var(--accent, #c8f542)' : 'rgba(255,255,255,0.75)',
                      whiteSpace: 'nowrap', fontWeight: i === 0 ? 600 : 400,
                    }}>
                      {iconNode}
                      {item.label || '—'}
                    </span>
                  );
                })}
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>Giriş Yap</span>
              </div>

              {/* Alignment card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.2rem' }}>Menü hizalaması</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Navigasyon bağlantılarının header içindeki konumu.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  {([
                    { value: 'left', label: 'Sola Dayalı', desc: '|≡ ···' },
                    { value: 'center', label: 'Ortada', desc: '· ≡ ·' },
                    { value: 'right', label: 'Sağa Dayalı', desc: '··· ≡|' },
                  ] as { value: string; label: string; desc: string }[]).map(opt => {
                    const active = (settings['nav_alignment'] ?? 'left') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => set('nav_alignment', opt.value)}
                        style={{
                          flex: 1, padding: '0.75rem 0.5rem', borderRadius: 8, cursor: 'pointer',
                          border: active ? '2px solid #111' : '1px solid #e5e7eb',
                          background: active ? '#111' : '#fff',
                          color: active ? '#fff' : '#374151',
                          fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
                        }}
                      >
                        <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', letterSpacing: 2 }}>{opt.desc}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: active ? 600 : 400 }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag color toggle card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.2rem' }}># Hashtag renklendirmesi</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Menüdeki tag linklerinin # işaretine canlı renk uygular.</p>
                </div>
                <button
                  onClick={() => set('tag_color_enabled', settings['tag_color_enabled'] === 'false' ? 'true' : 'false')}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0, padding: 2,
                    background: settings['tag_color_enabled'] !== 'false' ? '#111' : '#e5e7eb',
                    transition: 'background 0.2s', position: 'relative',
                  }}
                  aria-label="Tag renklendirmeyi aç/kapa"
                >
                  <span style={{
                    display: 'block', width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2,
                    left: settings['tag_color_enabled'] !== 'false' ? 22 : 2,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>

              {/* Editor card */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.2rem' }}>Menü öğeleri</h2>
                    <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Sitenin üst navigasyon menüsündeki bağlantılar.</p>
                  </div>
                  <button
                    onClick={addMenuItem}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      background: '#111', color: '#fff', border: 'none', borderRadius: 7,
                      padding: '0.4rem 0.75rem', fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0,
                    }}
                  >
                    <Plus size={13} /> Ekle
                  </button>
                </div>

                {menuItems.length === 0 && (
                  <div style={{
                    border: '2px dashed #e5e7eb', borderRadius: 8, padding: '2rem',
                    textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem',
                  }}>
                    Henüz menü öğesi yok. Ekle butonuna tıkla.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {menuItems.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.625rem', background: '#f9fafb',
                      border: '1px solid #e5e7eb', borderRadius: 8,
                    }}>
                      <GripVertical size={14} color="#d1d5db" style={{ flexShrink: 0, cursor: 'grab' }} />

                      {/* Icon picker */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <select
                          value={item.icon ?? ''}
                          onChange={e => updateMenuItem(i, 'icon', e.target.value)}
                          title="İkon seç"
                          style={{
                            width: 44, height: 30, border: '1px solid #e5e7eb', borderRadius: 6,
                            background: '#fff', cursor: 'pointer', fontSize: '0.75rem',
                            fontFamily: 'Inter, sans-serif', color: '#374151', outline: 'none',
                            appearance: 'none', WebkitAppearance: 'none', textAlign: 'center',
                            padding: '0 4px',
                          }}
                          onFocus={e => { e.currentTarget.style.borderColor = '#374151'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                        >
                          {MENU_ICONS.map(ic => (
                            <option key={ic.key} value={ic.key}>{ic.label}</option>
                          ))}
                        </select>
                        {/* Icon preview overlay */}
                        <div style={{
                          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          pointerEvents: 'none', color: '#374151',
                        }}>
                          {MENU_ICONS.find(ic => ic.key === (item.icon ?? ''))?.node}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={item.label}
                        onChange={e => updateMenuItem(i, 'label', e.target.value.replace(/^#+/, ''))}
                        placeholder="Menü adı"
                        style={{
                          flex: '0 0 140px', padding: '0.375rem 0.625rem',
                          border: '1px solid #e5e7eb', borderRadius: 6,
                          fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif',
                          outline: 'none', background: '#fff', color: '#111',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#374151'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                      />
                      <input
                        type="text"
                        value={item.path}
                        onChange={e => updateMenuItem(i, 'path', e.target.value)}
                        placeholder="yol (ör: home, tag/ayna-ticaret)"
                        style={{
                          flex: 1, padding: '0.375rem 0.625rem',
                          border: '1px solid #e5e7eb', borderRadius: 6,
                          fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif',
                          outline: 'none', background: '#fff', color: '#6b7280',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#374151'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                      />
                      <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                        <button
                          onClick={() => moveMenuItem(i, 'up')}
                          disabled={i === 0}
                          title="Yukarı taşı"
                          style={{ width: 26, height: 26, background: 'none', border: '1px solid #e5e7eb', borderRadius: 5, cursor: i === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', opacity: i === 0 ? 0.4 : 1 }}
                        ><ChevronUp size={12} /></button>
                        <button
                          onClick={() => moveMenuItem(i, 'down')}
                          disabled={i === menuItems.length - 1}
                          title="Aşağı taşı"
                          style={{ width: 26, height: 26, background: 'none', border: '1px solid #e5e7eb', borderRadius: 5, cursor: i === menuItems.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', opacity: i === menuItems.length - 1 ? 0.4 : 1 }}
                        ><ChevronDown size={12} /></button>
                        <button
                          onClick={() => removeMenuItem(i)}
                          title="Sil"
                          style={{ width: 26, height: 26, background: 'none', border: '1px solid #fee2e2', borderRadius: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                        ><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Path hint */}
                <div style={{ padding: '0.875rem', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Yol örnekleri</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {[
                      { label: 'Ana Sayfa', value: 'home' },
                      { label: 'İçerikler', value: 'icerikler' },
                      { label: 'Hakkımda', value: 'hakkimda' },
                      { label: 'İletişim', value: 'iletisim' },
                      { label: 'Etiket', value: 'tag/yapay-zeka' },
                    ].map(ex => (
                      <code key={ex.value} style={{
                        fontSize: '0.7rem', background: '#fff', border: '1px solid #e5e7eb',
                        borderRadius: 4, padding: '2px 6px', color: '#6b7280', fontFamily: 'monospace',
                      }}>
                        {ex.label}: <span style={{ color: '#374151' }}>{ex.value}</span>
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SERIES MENU ── */}
          {activeSection === 'series_menu' && (() => {
            const seriesOrder = parseMenuOrder(settings['series_menu_order']);
            const allSeriesItems: MenuOrderItem[] = (() => {
              const existing = new Map(seriesOrder.map((o, i) => [o.id, { ...o, _idx: i }]));
              const ordered: (MenuOrderItem & { _idx: number })[] = [];
              seriesOrder.forEach((o, i) => { if (seriesList.find(s => s.id === o.id)) ordered.push({ ...o, _idx: i }); });
              seriesList.forEach(s => { if (!existing.has(s.id)) ordered.push({ id: s.id, hidden: false, _idx: ordered.length }); });
              return ordered;
            })();

            const moveSeriesItem = (idx: number, dir: -1 | 1) => {
              const items = [...allSeriesItems];
              const target = idx + dir;
              if (target < 0 || target >= items.length) return;
              [items[idx], items[target]] = [items[target], items[idx]];
              set('series_menu_order', JSON.stringify(items.map(({ id, hidden }) => ({ id, hidden }))));
            };
            const toggleSeriesHidden = (id: string) => {
              const items = allSeriesItems.map(o => o.id === id ? { ...o, hidden: !o.hidden } : o);
              set('series_menu_order', JSON.stringify(items.map(({ id, hidden }) => ({ id, hidden }))));
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Yazı Dizileri */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Yazı Dizileri Menüsü</h2>
                    <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
                      Header'daki yazı dizileri dropdown'ını düzenleyin. Sıralayin ve gizlemek istediklerinizi kapatın.
                    </p>
                  </div>

                  {/* Menü toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#f9fafb', borderRadius: 9, border: '1px solid #e5e7eb' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>Menüyü göster</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>Kapatırsanız header'da yazı dizileri butonu görünmez.</div>
                    </div>
                    <button
                      onClick={() => set('series_menu_enabled', settings['series_menu_enabled'] === 'false' ? 'true' : 'false')}
                      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: settings['series_menu_enabled'] === 'false' ? '#d1d5db' : '#111', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <span style={{ position: 'absolute', top: 3, left: settings['series_menu_enabled'] === 'false' ? 3 : 23, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
                    </button>
                  </div>

                  {/* Sıralama listesi */}
                  {settings['series_menu_enabled'] !== 'false' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Sıralama ve Görünürlük
                      </div>
                      {allSeriesItems.length === 0 && (
                        <div style={{ fontSize: '0.8125rem', color: '#9ca3af', padding: '1rem', textAlign: 'center', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                          Henüz yazı dizisi yok.
                        </div>
                      )}
                      {allSeriesItems.map((item, idx) => {
                        const series = seriesList.find(s => s.id === item.id);
                        if (!series) return null;
                        return (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', background: item.hidden ? '#fafafa' : '#fff', border: `1px solid ${item.hidden ? '#e5e7eb' : '#d1d5db'}`, borderRadius: 8, opacity: item.hidden ? 0.55 : 1, transition: 'all 0.15s' }}>
                            <GripVertical size={14} style={{ color: '#d1d5db', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{series.title}</div>
                              {series.tagline && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{series.tagline}</div>}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#9ca3af', background: '#f3f4f6', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>{series.articleCount} yazı</span>
                            <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                              <button onClick={() => moveSeriesItem(idx, -1)} disabled={idx === 0} style={{ padding: '3px 5px', border: '1px solid #e5e7eb', borderRadius: 5, background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.35 : 1 }}><ChevronUp size={12} /></button>
                              <button onClick={() => moveSeriesItem(idx, 1)} disabled={idx === allSeriesItems.length - 1} style={{ padding: '3px 5px', border: '1px solid #e5e7eb', borderRadius: 5, background: '#fff', cursor: idx === allSeriesItems.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === allSeriesItems.length - 1 ? 0.35 : 1 }}><ChevronDown size={12} /></button>
                              <button onClick={() => toggleSeriesHidden(item.id)} title={item.hidden ? 'Göster' : 'Gizle'} style={{ padding: '3px 6px', border: `1px solid ${item.hidden ? '#d1d5db' : '#e5e7eb'}`, borderRadius: 5, background: item.hidden ? '#f3f4f6' : '#fff', cursor: 'pointer' }}>
                                {item.hidden ? <EyeOff size={12} style={{ color: '#9ca3af' }} /> : <Eye size={12} style={{ color: '#374151' }} />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Yazarlar Menüsü */}
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Yazarlar Menüsü</h2>
                    <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
                      Header'daki yazarlar dropdown'ını düzenleyin.
                    </p>
                  </div>

                  {/* Görüntüleme stili */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#f9fafb', borderRadius: 9, border: '1px solid #e5e7eb' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>Görüntüleme stili</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>
                        {settings['authors_menu_style'] === 'modal'
                          ? 'Ekranın solundan açılan panel olarak görünür'
                          : 'Logo altında açılan dropdown olarak görünür'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      {(['dropdown', 'modal'] as const).map(style => (
                        <button
                          key={style}
                          onClick={() => set('authors_menu_style', style)}
                          style={{
                            padding: '0.4rem 0.875rem', border: '1px solid',
                            borderColor: (settings['authors_menu_style'] ?? 'dropdown') === style ? '#111' : '#e5e7eb',
                            borderRadius: 7, fontSize: '0.78rem', fontWeight: 600,
                            background: (settings['authors_menu_style'] ?? 'dropdown') === style ? '#111' : '#fff',
                            color: (settings['authors_menu_style'] ?? 'dropdown') === style ? '#fff' : '#6b7280',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {style === 'dropdown' ? 'Dropdown' : 'Modal Panel'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Yeni yazı bandı toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#f9fafb', borderRadius: 9, border: '1px solid #e5e7eb' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>Yeni yazı bandı</div>
                      <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>Her yazarın altında son yazı bandını gösterir.</div>
                    </div>
                    <button
                      onClick={() => set('authors_show_latest', settings['authors_show_latest'] === 'false' ? 'true' : 'false')}
                      style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: settings['authors_show_latest'] === 'false' ? '#d1d5db' : '#111', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <span style={{ position: 'absolute', top: 3, left: settings['authors_show_latest'] === 'false' ? 3 : 23, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
                    </button>
                  </div>
                  {settings['authors_show_latest'] !== 'false' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#f9fafb', borderRadius: 9, border: '1px solid #e5e7eb' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>Görünürlük süresi</div>
                        <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>Yayınlandıktan kaç gün sonra bant kaybolsun?</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="number" min={1} max={30} value={settings['authors_latest_days'] || '3'} onChange={e => set('authors_latest_days', e.target.value)} style={{ width: 64, padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 7, fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', color: '#111', background: '#fff' }} />
                        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>gün</span>
                      </div>
                    </div>
                  )}

                  {/* Yazar sıralama listesi */}
                  {(() => {
                    const authorsOrder = parseMenuOrder(settings['authors_menu_order']);
                    const allAuthorItems: MenuOrderItem[] = (() => {
                      const existing = new Map(authorsOrder.map(o => [o.id, o]));
                      const ordered: MenuOrderItem[] = [];
                      authorsOrder.forEach(o => { if (authors.find(a => a.id === o.id)) ordered.push(o); });
                      authors.forEach(a => { if (!existing.has(a.id)) ordered.push({ id: a.id, hidden: false }); });
                      return ordered;
                    })();
                    const moveAuthorItem = (idx: number, dir: -1 | 1) => {
                      const items = [...allAuthorItems];
                      const target = idx + dir;
                      if (target < 0 || target >= items.length) return;
                      [items[idx], items[target]] = [items[target], items[idx]];
                      set('authors_menu_order', JSON.stringify(items));
                    };
                    const toggleAuthorHidden = (id: string) => {
                      const items = allAuthorItems.map(o => o.id === id ? { ...o, hidden: !o.hidden } : o);
                      set('authors_menu_order', JSON.stringify(items));
                    };
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Sıralama ve Görünürlük
                        </div>
                        {allAuthorItems.length === 0 && (
                          <div style={{ fontSize: '0.8125rem', color: '#9ca3af', padding: '1rem', textAlign: 'center', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                            Henüz yazar yok.
                          </div>
                        )}
                        {allAuthorItems.map((item, idx) => {
                          const author = authors.find(a => a.id === item.id);
                          if (!author) return null;
                          const initials = author.full_name ? author.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
                          return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', background: item.hidden ? '#fafafa' : '#fff', border: `1px solid ${item.hidden ? '#e5e7eb' : '#d1d5db'}`, borderRadius: 8, opacity: item.hidden ? 0.55 : 1, transition: 'all 0.15s' }}>
                              <GripVertical size={14} style={{ color: '#d1d5db', flexShrink: 0 }} />
                              <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {author.avatar_url
                                  ? <img src={author.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#6b7280' }}>{initials}</span>
                                }
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{author.full_name}</div>
                                {author.title && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 1 }}>{author.title}</div>}
                              </div>
                              <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                                <button onClick={() => moveAuthorItem(idx, -1)} disabled={idx === 0} style={{ padding: '3px 5px', border: '1px solid #e5e7eb', borderRadius: 5, background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.35 : 1 }}><ChevronUp size={12} /></button>
                                <button onClick={() => moveAuthorItem(idx, 1)} disabled={idx === allAuthorItems.length - 1} style={{ padding: '3px 5px', border: '1px solid #e5e7eb', borderRadius: 5, background: '#fff', cursor: idx === allAuthorItems.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === allAuthorItems.length - 1 ? 0.35 : 1 }}><ChevronDown size={12} /></button>
                                <button onClick={() => toggleAuthorHidden(item.id)} title={item.hidden ? 'Göster' : 'Gizle'} style={{ padding: '3px 6px', border: `1px solid ${item.hidden ? '#d1d5db' : '#e5e7eb'}`, borderRadius: 5, background: item.hidden ? '#f3f4f6' : '#fff', cursor: 'pointer' }}>
                                  {item.hidden ? <EyeOff size={12} style={{ color: '#9ca3af' }} /> : <Eye size={12} style={{ color: '#374151' }} />}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}

          {/* ── CODE INJECTION ── */}
          {activeSection === 'code' && <CodeInjectionSection settings={settings} set={set} />}

          {/* ── FOOTER ── */}
          {activeSection === 'footer' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Alt bilgi (Footer)</h2>
              <div>
                <label style={labelStyle}>Footer kısa açıklaması</label>
                <textarea
                  value={settings['footer_tagline'] ?? ''}
                  onChange={e => set('footer_tagline', e.target.value)}
                  placeholder="Türkiye'de ticaret, e-ticaret..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Telif hakkı metni</label>
                <input
                  type="text"
                  value={settings['footer_copyright'] ?? ''}
                  onChange={e => set('footer_copyright', e.target.value)}
                  placeholder={`© ${new Date().getFullYear()} Orhan Balcı. Tüm hakları saklıdır.`}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                />
              </div>
              <div>
                <label style={labelStyle}>Alan adı (footer sağ)</label>
                <input
                  type="text"
                  value={settings['site_domain'] ?? ''}
                  onChange={e => set('site_domain', e.target.value)}
                  placeholder="siteadi.com"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                />
              </div>
            </div>
          )}

          {/* ── HERO ── */}
          {activeSection === 'hero' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Ana Sayfa</h2>
              <div>
                <label style={labelStyle}>Hero başlığı</label>
                <input type="text" value={settings['hero_title'] ?? ''} onChange={e => set('hero_title', e.target.value)} placeholder="Sahadan notlar." style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
              </div>
              <div>
                <label style={labelStyle}>Kısa açıklama</label>
                <input type="text" value={settings['hero_tagline'] ?? ''} onChange={e => set('hero_tagline', e.target.value)} placeholder="Türkiye'de ticaret, e-ticaret..." style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
              </div>
              <div>
                <label style={labelStyle}>Açıklama paragrafı</label>
                <textarea value={settings['hero_body'] ?? ''} onChange={e => set('hero_body', e.target.value)} placeholder="İş dünyasının görünen yüzünü değil..." rows={5} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENT ── */}
          {activeSection === 'announcement' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Yeni yazılar bandı toggle */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.2rem' }}>Yeni yazılar bildirimi</h2>
                    <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Slider'ın üzerindeki yeni yazı bildirim bandını göster ya da gizle.</p>
                  </div>
                  <button
                    onClick={() => set('show_new_articles_banner', settings['show_new_articles_banner'] === 'false' ? 'true' : 'false')}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: settings['show_new_articles_banner'] === 'false' ? '#d1d5db' : '#111',
                      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                    }}
                    role="switch"
                    aria-checked={settings['show_new_articles_banner'] !== 'false'}
                  >
                    <span style={{
                      position: 'absolute', top: 3, left: settings['show_new_articles_banner'] === 'false' ? 3 : 23,
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
                <div style={{
                  marginTop: '1rem', padding: '0.625rem 0.875rem',
                  background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: 7,
                  fontSize: '0.8125rem', color: '#6b7280',
                }}>
                  Durum: <strong style={{ color: settings['show_new_articles_banner'] === 'false' ? '#ef4444' : '#16a34a' }}>
                    {settings['show_new_articles_banner'] === 'false' ? 'Gizli' : 'Görünür'}
                  </strong>
                  <span style={{ marginLeft: '0.75rem', color: '#9ca3af' }}>
                    — Son {14} günde yayımlanan yazılar otomatik listelenir.
                  </span>
                </div>
              </div>

              {/* Duyuru bandı */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Duyuru bandı</h2>
                <div>
                  <label style={labelStyle}>Duyuru metni</label>
                  <input type="text" value={settings['announcement_text'] ?? ''} onChange={e => set('announcement_text', e.target.value)} placeholder="Ayna Ticaret yazı dizisi yayında..." style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Bağlantı dizi ID'si</label>
                  <input type="text" value={settings['announcement_series_id'] ?? ''} onChange={e => set('announcement_series_id', e.target.value)} placeholder="ayna-ticaret" style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                </div>
              </div>
            </div>
          )}

          {/* ── ABOUT ── */}
          {activeSection === 'about' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Yazar Profili</h2>
                <div>
                  <label style={labelStyle}>Ad Soyad</label>
                  <input type="text" value={settings['author_name'] ?? ''} onChange={e => set('author_name', e.target.value)} placeholder="Orhan Balcı" style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Ünvan / Açıklama</label>
                  <input type="text" value={settings['author_title'] ?? ''} onChange={e => set('author_title', e.target.value)} placeholder="Girişimci · E-Ticaret · Teknoloji" style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Profil Fotoğrafı URL</label>
                  <input type="text" value={settings['author_photo'] ?? ''} onChange={e => set('author_photo', e.target.value)} placeholder="https://..." style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0' }}>Profil sayfasındaki fotoğraf URL'si. Boş bırakılırsa fotoğraf gösterilmez.</p>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Hakkımda Sayfası</h2>
                <div>
                  <label style={labelStyle}>Sayfa alt başlığı</label>
                  <input type="text" value={settings['about_subtitle'] ?? ''} onChange={e => set('about_subtitle', e.target.value)} placeholder="Ticaretin, teknolojinin ve insanın kesişiminde." style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Birinci paragraf</label>
                  <textarea value={settings['about_text_1'] ?? ''} onChange={e => set('about_text_1', e.target.value)} placeholder="Ticaretin, teknolojinin ve insanın kesişiminde üretmeye çalışan bir girişimciyim." rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                </div>
                <div>
                  <label style={labelStyle}>İkinci paragraf</label>
                  <textarea value={settings['about_text_2'] ?? ''} onChange={e => set('about_text_2', e.target.value)} placeholder="..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Üçüncü paragraf</label>
                  <textarea value={settings['about_text_3'] ?? ''} onChange={e => set('about_text_3', e.target.value)} placeholder="..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                </div>
                <div>
                  <label style={labelStyle}>Konu listesi</label>
                  <textarea value={settings['about_topics'] ?? ''} onChange={e => set('about_topics', e.target.value)} placeholder={"E-ticaret ve ticaretin içinden gözlemler — Sahada yaşanan gerçekler.\nTeknoloji ve yapay zeka — AI araçları ve dijital dönüşüm."} rows={5} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0' }}>Her satır bir madde. <strong>Başlık — Açıklama</strong> formatında yazılırsa başlık kalın görünür.</p>
                </div>
                <div>
                  <label style={labelStyle}>Kapanış alıntısı / notu</label>
                  <textarea value={settings['about_quote'] ?? ''} onChange={e => set('about_quote', e.target.value)} placeholder="Bazı yazılar bir gözlem, bazıları bir günlük..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
                </div>
              </div>
            </div>
          )}

          {/* ── SOCIAL ── */}
          {activeSection === 'social' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Sosyal & İletişim</h2>
              <div>
                <label style={labelStyle}>LinkedIn URL</label>
                <input type="text" value={settings['linkedin_url'] ?? ''} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://www.linkedin.com/in/kullanici-adi" style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
              </div>
              <div>
                <label style={labelStyle}>E-posta adresi</label>
                <input type="email" value={settings['email'] ?? ''} onChange={e => set('email', e.target.value)} placeholder="ornek@siteadi.com" style={inputStyle} onFocus={e => { e.target.style.borderColor = '#374151'; }} onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }} />
              </div>
            </div>
          )}

          {/* ── FEATURES ── */}
          {activeSection === 'features' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* ── Anasayfa Modülleri ── */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Anasayfa Modülleri</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Anasayfada hangi bölümlerin ve hangi düzende görüneceğini kontrol et.</p>
                </div>

                {/* Layout seçimi */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {[
                    { val: 'magazine', label: 'Dergi Düzeni', desc: 'Hero + grid kartlar' },
                    { val: 'classic', label: 'Klasik Düzen', desc: 'Yatay liste' },
                  ].map(opt => {
                    const active = (settings['homepage_layout'] ?? 'magazine') === opt.val;
                    return (
                      <div
                        key={opt.val}
                        onClick={() => set('homepage_layout', opt.val)}
                        style={{
                          flex: 1, padding: '0.875rem 1rem', borderRadius: 8, cursor: 'pointer',
                          border: `2px solid ${active ? '#111' : '#e5e7eb'}`,
                          background: active ? '#f9fafb' : '#fff',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: active ? '#111' : '#6b7280' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{opt.desc}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Modül toggle'ları */}
                {([
                  { key: 'show_featured_hero', label: 'Öne Çıkan Hero', desc: 'Büyük featured makale + mini kart listesi' },
                  { key: 'show_latest_section', label: 'Son Yazılar', desc: 'En yeni makalelerin listeleneceği bölüm' },
                  { key: 'show_series_section', label: 'Yazı Dizileri', desc: 'Seri kartlarının gösterildiği bölüm' },
                  { key: 'show_authors_section', label: 'Önerilen Yazarlar', desc: 'Yazarların tanıtıldığı bölüm' },
                  { key: 'show_tag_sections', label: 'Etiket Bölümleri', desc: 'Seçili etiketlere göre ayrı makale grupları' },
                ] as { key: string; label: string; desc: string }[]).map(item => {
                  const isOn = settings[item.key] !== 'false' && (item.key !== 'show_tag_sections' ? true : settings[item.key] === 'true');
                  return (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.75rem 1rem', borderRadius: 8, cursor: 'pointer',
                        background: '#f9fafb', border: '1px solid #e5e7eb', transition: 'all 0.15s',
                      }}
                      onClick={() => set(item.key, isOn ? 'false' : 'true')}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>{item.label}</div>
                        <div style={{ fontSize: '0.775rem', color: '#9ca3af', marginTop: 1 }}>{item.desc}</div>
                      </div>
                      <div style={{ width: 42, height: 24, borderRadius: 12, position: 'relative', flexShrink: 0, background: isOn ? '#10b981' : '#d1d5db', transition: 'background 0.2s' }}>
                        <div style={{ position: 'absolute', top: 3, left: isOn ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                      </div>
                    </div>
                  );
                })}

                {/* Etiket bölümleri listesi */}
                {settings['show_tag_sections'] === 'true' && (() => {
                  let tags: string[] = [];
                  try { tags = JSON.parse(settings['tag_sections_list'] ?? '[]'); } catch { /* ignore */ }
                  const CATEGORY_OPTIONS = ['Ticaret', 'E-Ticaret', 'Marka ve Strateji', 'Girişimcilik', 'Teknoloji', 'Yapay Zekâ', 'Kişisel Notlar'];
                  return (
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Hangi etiket bölümleri görünsün?</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {CATEGORY_OPTIONS.map(cat => {
                          const active = tags.includes(cat);
                          return (
                            <button
                              key={cat}
                              onClick={() => {
                                const next = active ? tags.filter(t => t !== cat) : [...tags, cat];
                                set('tag_sections_list', JSON.stringify(next));
                              }}
                              style={{
                                padding: '0.3rem 0.875rem', borderRadius: 100, border: `1.5px solid ${active ? '#111' : '#e5e7eb'}`,
                                background: active ? '#111' : '#fff', color: active ? '#fff' : '#555',
                                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'all 0.15s',
                              }}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* ── Hero Sol Panel Kartları ── */}
                {(() => {
                  let sideIds: string[] = [];
                  try { sideIds = JSON.parse(settings['hero_side_ids'] ?? '[]'); } catch { /* ignore */ }
                  const filteredSide = allArticles
                    .filter(a => !sideIds.includes(a.id))
                    .filter(a => sideSearchQ.trim() === '' || a.title.toLowerCase().includes(sideSearchQ.toLowerCase()))
                    .slice(0, 20);
                  const selectedSide = allArticles.filter(a => sideIds.includes(a.id));
                  return (
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Hero Sol Panel Kartları</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Sol panelde 3 mini kart gösterilir</div>
                      </div>
                      {selectedSide.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {selectedSide.map((a, idx) => (
                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                              <span style={{ fontSize: '0.7rem', color: '#9ca3af', width: 14, flexShrink: 0 }}>{idx + 1}</span>
                              <span style={{ flex: 1, fontSize: '0.8rem', color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                              <button
                                onClick={() => set('hero_side_ids', JSON.stringify(sideIds.filter(id => id !== a.id)))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {sideIds.length < 3 && (
                        <div>
                          <input
                            type="text"
                            placeholder="Makale ara..."
                            value={sideSearchQ}
                            onChange={e => setSideSearchQ(e.target.value)}
                            style={{ width: '100%', padding: '0.45rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                          />
                          {filteredSide.length > 0 && (
                            <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 4, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>
                              {filteredSide.map(a => (
                                <div
                                  key={a.id}
                                  onClick={() => { set('hero_side_ids', JSON.stringify([...sideIds, a.id])); setSideSearchQ(''); }}
                                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#111', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                                >
                                  <span style={{ fontWeight: 500 }}>{a.title}</span>
                                  {a.category && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#9ca3af' }}>{a.category}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {sideIds.length === 0 && (
                        <p style={{ fontSize: '0.775rem', color: '#9ca3af', margin: 0 }}>
                          Seçim yapılmadığında en yeni makaleler otomatik gösterilir.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* ── Öne Çıkan Kartlar seçimi ── */}
                {(() => {
                  let stripIds: string[] = [];
                  try { stripIds = JSON.parse(settings['featured_strip_ids'] ?? '[]'); } catch { /* ignore */ }
                  const filtered = allArticles
                    .filter(a => !stripIds.includes(a.id))
                    .filter(a => stripSearchQ.trim() === '' || a.title.toLowerCase().includes(stripSearchQ.toLowerCase()))
                    .slice(0, 20);
                  const selected = allArticles.filter(a => stripIds.includes(a.id));
                  return (
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Öne Çıkan Makale Kartları</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Hero altında 4 kart gösterilir</div>
                      </div>
                      {/* Seçili kartlar */}
                      {selected.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {selected.map((a, idx) => (
                            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                              <span style={{ fontSize: '0.7rem', color: '#9ca3af', width: 14, flexShrink: 0 }}>{idx + 1}</span>
                              <span style={{ flex: 1, fontSize: '0.8rem', color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                              <button
                                onClick={() => set('featured_strip_ids', JSON.stringify(stripIds.filter(id => id !== a.id)))}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                                title="Kaldır"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Arama + ekle */}
                      {stripIds.length < 4 && (
                        <div>
                          <input
                            type="text"
                            placeholder="Makale ara..."
                            value={stripSearchQ}
                            onChange={e => setStripSearchQ(e.target.value)}
                            style={{ width: '100%', padding: '0.45rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                          />
                          {filtered.length > 0 && (
                            <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 4, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>
                              {filtered.map(a => (
                                <div
                                  key={a.id}
                                  onClick={() => { set('featured_strip_ids', JSON.stringify([...stripIds, a.id])); setStripSearchQ(''); }}
                                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#111', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                                >
                                  <span style={{ fontWeight: 500 }}>{a.title}</span>
                                  {a.category && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#9ca3af' }}>{a.category}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {stripIds.length === 0 && (
                        <p style={{ fontSize: '0.775rem', color: '#9ca3af', margin: 0 }}>
                          Seçim yapılmadığında öne çıkan (featured) veya en yeni makaleler otomatik gösterilir.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* ── Hero Sağ Panel Makale Kartı ── */}
                {(() => {
                  const rightId = settings['hero_right_article_id'] ?? '';
                  const selectedRight = allArticles.find(a => a.id === rightId) ?? null;
                  const filteredRight = allArticles
                    .filter(a => a.id !== rightId)
                    .filter(a => rightSearchQ.trim() === '' || a.title.toLowerCase().includes(rightSearchQ.toLowerCase()))
                    .slice(0, 20);
                  return (
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Hero Sağ Panel Makale Kartı</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Hero'nun sağında öne çıkan makale</div>
                      </div>
                      {selectedRight && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                          <span style={{ flex: 1, fontSize: '0.8rem', color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedRight.title}</span>
                          {selectedRight.category && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{selectedRight.category}</span>}
                          <button
                            onClick={() => { set('hero_right_article_id', ''); setRightSearchQ(''); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                            title="Kaldır"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      )}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Makale ara..."
                          value={rightSearchQ}
                          onChange={e => setRightSearchQ(e.target.value)}
                          style={{ width: '100%', padding: '0.45rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                        />
                        {(rightSearchQ || filteredRight.length > 0) && (
                          <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 4, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>
                            {filteredRight.map(a => (
                              <div
                                key={a.id}
                                onClick={() => { set('hero_right_article_id', a.id); setRightSearchQ(''); }}
                                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#111', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                              >
                                <span style={{ fontWeight: 500 }}>{a.title}</span>
                                {a.category && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#9ca3af' }}>{a.category}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {!selectedRight && (
                        <p style={{ fontSize: '0.775rem', color: '#9ca3af', margin: 0 }}>
                          Seçim yapılmadığında en yeni 4. makale otomatik gösterilir.
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* ── Hero Sağ Panel Öne Çıkan Yazar ── */}
                {(() => {
                  const authorId = settings['hero_right_author_id'] ?? '';
                  const selectedAuthor = authors.find(a => a.id === authorId) ?? null;
                  const filteredAuthors = authors
                    .filter(a => a.id !== authorId)
                    .filter(a => authorSearchQ.trim() === '' || (a.full_name ?? '').toLowerCase().includes(authorSearchQ.toLowerCase()))
                    .slice(0, 20);
                  return (
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Hero Sağ Panel Öne Çıkan Yazar</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Anket yoksa bu kart gösterilir</div>
                      </div>
                      {selectedAuthor && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                          {selectedAuthor.avatar_url && (
                            <img src={selectedAuthor.avatar_url} alt={selectedAuthor.full_name ?? ''} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          )}
                          <span style={{ flex: 1, fontSize: '0.8rem', color: '#111', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedAuthor.full_name}</span>
                          {selectedAuthor.title && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{selectedAuthor.title}</span>}
                          <button
                            onClick={() => { set('hero_right_author_id', ''); setAuthorSearchQ(''); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0 2px', display: 'flex', alignItems: 'center' }}
                            title="Kaldır"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      )}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Yazar ara..."
                          value={authorSearchQ}
                          onChange={e => setAuthorSearchQ(e.target.value)}
                          style={{ width: '100%', padding: '0.45rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                        />
                        {(authorSearchQ || filteredAuthors.length > 0) && (
                          <div style={{ maxHeight: 200, overflowY: 'auto', marginTop: 4, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}>
                            {filteredAuthors.map(a => (
                              <div
                                key={a.id}
                                onClick={() => { set('hero_right_author_id', a.id); setAuthorSearchQ(''); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#111', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                              >
                                {a.avatar_url && (
                                  <img src={a.avatar_url} alt={a.full_name ?? ''} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                                )}
                                <span style={{ fontWeight: 500 }}>{a.full_name}</span>
                                {a.title && <span style={{ marginLeft: 4, fontSize: '0.7rem', color: '#9ca3af' }}>{a.title}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {!selectedAuthor && (
                        <p style={{ fontSize: '0.775rem', color: '#9ca3af', margin: 0 }}>
                          Yazar seçilmediğinde seçili makale kartı gösterilir.
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Platform Özellikleri</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Makale düzenleme panelinde hangi özelliklerin görüneceğini kontrol et.</p>
                </div>
                {([
                  {
                    key: 'feature_friend_links',
                    label: 'Friend Link',
                    desc: 'Üyelere özel makaleler için paylaşılabilir geçiş linki oluşturma',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                    ),
                    color: '#22c55e',
                  },
                  {
                    key: 'feature_scheduling',
                    label: 'İleri Tarihli Yayın (Scheduling)',
                    desc: 'Makaleleri belirli bir tarih ve saat için zamanlama',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    ),
                    color: '#3b82f6',
                  },
                  {
                    key: 'feature_boost',
                    label: 'Editörün Seçimi (Boost)',
                    desc: 'Seçili makaleleri öne çıkarma — rozet ve anasayfa bölümü',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                    ),
                    color: '#f97316',
                  },
                ] as { key: string; label: string; desc: string; icon: React.ReactNode; color: string }[]).map(feat => {
                  const isOn = settings[feat.key] !== 'false';
                  return (
                    <div
                      key={feat.key}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '1rem 1.125rem',
                        background: isOn ? '#f9fafb' : '#fff',
                        border: `1px solid ${isOn ? '#e5e7eb' : '#f3f4f6'}`,
                        borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onClick={() => set(feat.key, isOn ? 'false' : 'true')}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                          background: isOn ? `${feat.color}18` : '#f3f4f6',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: isOn ? feat.color : '#9ca3af', transition: 'all 0.15s',
                        }}>
                          {feat.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isOn ? '#111' : '#9ca3af', transition: 'color 0.15s' }}>{feat.label}</div>
                          <div style={{ fontSize: '0.775rem', color: '#9ca3af', marginTop: 2, lineHeight: 1.4 }}>{feat.desc}</div>
                        </div>
                      </div>
                      <div style={{
                        width: 42, height: 24, borderRadius: 12, position: 'relative', flexShrink: 0,
                        background: isOn ? feat.color : '#d1d5db', transition: 'background 0.2s',
                      }}>
                        <div style={{
                          position: 'absolute', top: 3, left: isOn ? 21 : 3,
                          width: 18, height: 18, borderRadius: '50%', background: '#fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Okuyucu Özellikleri</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Okuyucuların makale sayfasında göreceği interaktif özellikler.</p>
                </div>
                {([
                  { key: 'feature_tts', label: 'Sesli Okuma (TTS)', desc: 'Makaleleri tarayıcı sesi ile dinleme', color: '#60a5fa' },
                  { key: 'feature_claps', label: 'Alkış (Claps)', desc: 'Makale beğeni sistemi — Medium tarzı', color: '#ec4899' },
                  { key: 'feature_highlights', label: 'Metin Vurgulama', desc: 'Okuyucu seçili metni sarı/yeşil/mavi renkle vurgular', color: '#f59e0b' },
                  { key: 'feature_comments', label: 'Yorumlar', desc: 'Makale altında yorum bölümü', color: '#8b5cf6' },
                  { key: 'show_polls_page', label: 'Anketler Sayfası', desc: 'Başlık çubuğunda anketler simgesi ve /anketler sayfası', color: '#22c55e' },
                ] as { key: string; label: string; desc: string; color: string }[]).map(feat => {
                  const isOn = settings[feat.key] !== 'false';
                  return (
                    <div
                      key={feat.key}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        background: '#f9fafb', border: '1px solid #e5e7eb',
                        borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onClick={() => set(feat.key, isOn ? 'false' : 'true')}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111' }}>{feat.label}</div>
                        <div style={{ fontSize: '0.775rem', color: '#9ca3af', marginTop: 1 }}>{feat.desc}</div>
                      </div>
                      <div style={{
                        width: 42, height: 24, borderRadius: 12, position: 'relative', flexShrink: 0,
                        background: isOn ? feat.color : '#d1d5db', transition: 'background 0.2s',
                      }}>
                        <div style={{
                          position: 'absolute', top: 3, left: isOn ? 21 : 3,
                          width: 18, height: 18, borderRadius: '50%', background: '#fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TTS Configuration */}
              {settings['feature_tts'] !== 'false' && (() => {
                const ttsProvider = settings['tts_provider'] ?? 'browser';
                const ttsVoice = settings['tts_voice'] ?? 'alloy';
                const openaiKey = settings['openai_api_key'] ?? '';
                return (
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Sesli Okuma Ayarları</h2>
                      <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>TTS motoru ve ses seçimi. OpenAI seçilirse API anahtarı gereklidir.</p>
                    </div>

                    {/* Provider toggle */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {(['browser', 'openai'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => set('tts_provider', p)}
                          style={{
                            flex: 1, padding: '0.625rem 0.75rem',
                            border: `2px solid ${ttsProvider === p ? '#2563eb' : '#e5e7eb'}`,
                            borderRadius: 8, background: ttsProvider === p ? '#eff6ff' : '#fafafa',
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            fontSize: '0.8125rem', fontWeight: ttsProvider === p ? 600 : 400,
                            color: ttsProvider === p ? '#2563eb' : '#6b7280',
                            transition: 'all 0.15s',
                          }}
                        >
                          {p === 'browser' ? 'Tarayıcı (ücretsiz)' : 'OpenAI TTS (gerçek ses)'}
                        </button>
                      ))}
                    </div>

                    {ttsProvider === 'openai' && (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>OpenAI API Anahtarı</label>
                          <input
                            type="password"
                            value={openaiKey}
                            onChange={e => set('openai_api_key', e.target.value)}
                            placeholder="sk-..."
                            style={{
                              width: '100%', padding: '0.5rem 0.75rem', boxSizing: 'border-box',
                              border: '1px solid #d1d5db', borderRadius: 7,
                              fontFamily: 'monospace', fontSize: '0.8125rem', color: '#111',
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>platform.openai.com</a> adresinden alınır. Sunucu tarafında güvenli şekilde saklanır.
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>Ses (Voice)</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {([
                              { id: 'alloy', label: 'Alloy', desc: 'Dengeli' },
                              { id: 'echo', label: 'Echo', desc: 'Erkek, derin' },
                              { id: 'fable', label: 'Fable', desc: 'Anlatıcı' },
                              { id: 'onyx', label: 'Onyx', desc: 'Güçlü' },
                              { id: 'nova', label: 'Nova', desc: 'Kadın' },
                              { id: 'shimmer', label: 'Shimmer', desc: 'Yumuşak' },
                            ] as { id: string; label: string; desc: string }[]).map(v => (
                              <button
                                key={v.id}
                                onClick={() => set('tts_voice', v.id)}
                                style={{
                                  padding: '0.375rem 0.875rem',
                                  border: `2px solid ${ttsVoice === v.id ? '#2563eb' : '#e5e7eb'}`,
                                  borderRadius: 20, background: ttsVoice === v.id ? '#eff6ff' : '#fafafa',
                                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                  fontSize: '0.8125rem', fontWeight: ttsVoice === v.id ? 600 : 400,
                                  color: ttsVoice === v.id ? '#2563eb' : '#6b7280',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {v.label} <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{v.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Üyelik Sistemi</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Ücretli/ücretsiz üyelik kademeleri ve içerik kısıtlama özelliği.</p>
                </div>
                {([
                  { key: 'feature_membership', label: 'Okuyucu Üyelik Sistemi', desc: 'Ücretsiz / Üye / Kurucu Üye kademeleri, üyelere özel içerik kilidi', color: '#0369a1' },
                  { key: 'feature_series_newsletter', label: 'Yazı Dizisi Bildirimi', desc: 'Okuyucular bir diziye abone olup yeni bölüm bildirim emaili alabilir', color: '#0e8fa0' },
                  { key: 'feature_bookmarks', label: 'Gelişmiş Bookmark Sistemi', desc: 'Koleksiyonlar, notlar ve filtreli okuma listesi', color: '#d97706' },
                ] as { key: string; label: string; desc: string; color: string }[]).map(feat => {
                  const isOn = settings[feat.key] !== 'false';
                  return (
                    <div
                      key={feat.key}
                      onClick={() => set(feat.key, isOn ? 'false' : 'true')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        border: `1px solid ${isOn ? feat.color + '30' : '#e5e7eb'}`,
                        borderRadius: 10,
                        background: isOn ? feat.color + '08' : '#fafafa',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: 2 }}>{feat.label}</div>
                        <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{feat.desc}</div>
                      </div>
                      <div style={{
                        position: 'relative', width: 44, height: 24, borderRadius: 12,
                        background: isOn ? feat.color : '#d1d5db',
                        flexShrink: 0, transition: 'background 0.2s', cursor: 'pointer',
                      }}>
                        <div style={{
                          position: 'absolute', top: 3, left: isOn ? 21 : 3,
                          width: 18, height: 18, borderRadius: '50%', background: '#fff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── WRITING TOOLS ── */}
          {activeSection === 'writing' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Yazı Editörü Kısayolları</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Makale editöründe kullanılabilecek klavye kısayolları.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { keys: ['Ctrl', 'Shift', 'H'], label: 'İpucu bloğu', emoji: '💡', color: '#fefce8', border: '#fde68a', text: '#713f12' },
                    { keys: ['Ctrl', 'Shift', 'K'], label: 'Genel not bloğu', emoji: '📌', color: '#f3f4f6', border: '#e5e7eb', text: '#374151' },
                    { keys: ['Ctrl', 'Shift', 'I'], label: 'Bilgi bloğu', emoji: 'ℹ️', color: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
                    { keys: ['Ctrl', 'Shift', 'W'], label: 'Uyarı bloğu', emoji: '⚠️', color: '#fff7ed', border: '#fed7aa', text: '#9a3412' },
                    { keys: ['Ctrl', 'Shift', 'Q'], label: 'Pullquote / Alıntı', emoji: '❝', color: '#f9fafb', border: '#e5e7eb', text: '#374151' },
                    { keys: ['Ctrl', 'Shift', 'B'], label: 'Callout kutusu', emoji: '📋', color: '#f9fafb', border: '#e5e7eb', text: '#374151' },
                    { keys: ['Ctrl', 'Shift', 'S'], label: 'İstatistik kartı', emoji: '📊', color: '#f9fafb', border: '#e5e7eb', text: '#374151' },
                    { keys: ['Ctrl', 'Shift', 'L'], label: 'Madde listesi', emoji: '•', color: '#f9fafb', border: '#e5e7eb', text: '#374151' },
                    { keys: ['Ctrl', 'Shift', 'O'], label: 'Numaralı liste', emoji: '1.', color: '#f9fafb', border: '#e5e7eb', text: '#374151' },
                    { keys: ['Ctrl', 'Shift', 'E'], label: 'Kod bloğu', emoji: '</>', color: '#f8fafc', border: '#cbd5e1', text: '#334155' },
                  ].map(s => (
                    <div key={s.label} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.75rem 1rem', border: `1px solid ${s.border}`,
                      borderRadius: 8, background: s.color,
                    }}>
                      <span style={{ fontSize: '1.25rem', lineHeight: 1, width: 28, textAlign: 'center' }}>{s.emoji}</span>
                      <span style={{ flex: 1, fontSize: '0.875rem', color: s.text, fontWeight: 500 }}>{s.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {s.keys.map((k, ki) => (
                          <span key={ki} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            {ki > 0 && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>+</span>}
                            <kbd style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              padding: '0.2rem 0.5rem', background: '#fff', border: '1px solid #d1d5db',
                              borderRadius: 5, fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700,
                              color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                              lineHeight: 1.4,
                            }}>{k}</kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Blok Sözdizimi Referansı</h2>
                  <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>Makale içeriğine direkt yazarak da blok ekleyebilirsin.</p>
                </div>
                <pre style={{
                  background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8,
                  padding: '1rem', fontSize: '0.8rem', fontFamily: 'monospace',
                  color: '#94a3b8', overflowX: 'auto', margin: 0, lineHeight: 1.9,
                }}>
{`## Bölüm Başlığı (H2)
### Alt Başlık (H3)

> Pullquote / Alıntı metni
> — İsim veya kaynak

- Madde 1
- Madde 2

1. Adım birinci
2. Adım ikinci

---    ← bölüm ayırıcı

:::highlight[💡|tip]
**Başlık**: Açıklama.
:::

:::callout[Başlık]
İçerik metni buraya.
:::

:::stat[%74|Türkiye'de dijital penetrasyon]:::

:::stats[%74|Dijital kullanıcı, 12dk|Ort. oturum süresi, 3.2|Ziyaret başına sayfa]:::

\`\`\`javascript
const x = 42;
\`\`\`

Paragraf içinde \`satır içi kod\` kullanımı.`}
                </pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
