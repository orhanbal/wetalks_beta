import { useState } from 'react';
import { ChevronRight, Plug, Code2, Zap, Mail, BarChart2, Search, Image, Rss } from 'lucide-react';
import { AdminPageHeader } from './AdminLayout';

type IntegrationStatus = 'active' | 'inactive' | 'coming_soon';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: IntegrationStatus;
  configUrl?: string;
  docsUrl?: string;
  fields?: { key: string; label: string; placeholder: string; type?: string }[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Ziyaretçi davranışlarını ve site trafiğini izleyin.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
        <rect x="13" y="2" width="5" height="20" rx="2.5" fill="#F9AB00" />
        <rect x="2" y="13" width="5" height="9" rx="2.5" fill="#0F9D58" />
        <rect x="7.5" y="7" width="5" height="15" rx="2.5" fill="#4285F4" />
      </svg>
    ),
    status: 'inactive',
    fields: [
      { key: 'ga_measurement_id', label: 'Ölçüm Kimliği', placeholder: 'G-XXXXXXXXXX' },
    ],
  },
  {
    id: 'google-search-console',
    name: 'Google Search Console',
    description: 'Site doğrulama meta etiketi ekleyerek arama performansınızı takip edin.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
        <circle cx="10" cy="10" r="7" stroke="#4285F4" strokeWidth="2" />
        <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M7 10h6M10 7v6" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    status: 'inactive',
    fields: [
      { key: 'gsc_verification', label: 'Doğrulama Meta İçeriği', placeholder: 'AbCdEfGhIjKlMnOpQrStUv...' },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Bülten aboneliği ve e-posta pazarlaması için Mailchimp\'e bağlanın.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
        <ellipse cx="12" cy="13" rx="7" ry="8" fill="#FFE01B" stroke="#241C15" strokeWidth="1.2" />
        <circle cx="9.5" cy="12" r="1" fill="#241C15" />
        <circle cx="14.5" cy="12" r="1" fill="#241C15" />
        <path d="M9.5 15.5c.8.8 2.5.8 3 0" stroke="#241C15" strokeWidth="1" strokeLinecap="round" />
        <path d="M12 5V2M9 5.5L7 3M15 5.5l2-2.5" stroke="#241C15" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    status: 'inactive',
    fields: [
      { key: 'mailchimp_api_key', label: 'API Anahtarı', placeholder: 'xxxxxxxxxxxx-us1', type: 'password' },
      { key: 'mailchimp_list_id', label: 'Liste (Audience) ID', placeholder: 'abc123def4' },
    ],
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    description: 'Makale yazarken ücretsiz yüksek kaliteli fotoğraf arayın.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#000">
        <path d="M7.5 6.75V0h9v6.75h-9zm9 3.75H24V24H0V10.5h7.5v6.75h9V10.5z" />
      </svg>
    ),
    status: 'inactive',
    fields: [
      { key: 'unsplash_access_key', label: 'Access Key', placeholder: 'your-unsplash-access-key', type: 'password' },
    ],
  },
  {
    id: 'rss',
    name: 'RSS Beslemesi',
    description: 'Okuyucularınızın RSS ile içeriklerinize abone olmasını sağlayın.',
    icon: <Rss size={28} color="#f97316" />,
    status: 'active',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Yeni makale yayımlandığında 5000+ uygulamayı tetikleyin.',
    icon: <Zap size={28} color="#FF4A00" />,
    status: 'coming_soon',
  },
  {
    id: 'meta-pixel',
    name: 'Meta Pixel',
    description: 'Facebook ve Instagram reklam dönüşümlerini takip edin.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    status: 'inactive',
    fields: [
      { key: 'meta_pixel_id', label: 'Pixel ID', placeholder: '123456789012345' },
    ],
  },
  {
    id: 'content-api',
    name: 'Content API',
    description: 'İçeriklerinize programatik olarak erişin. Site\'nin public API anahtarı.',
    icon: <Code2 size={28} color="#6b7280" />,
    status: 'active',
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Haftalık bülten göndermek için Resend e-posta servisini bağlayın.',
    icon: <Mail size={28} color="#111" />,
    status: 'inactive',
    fields: [
      { key: 'resend_api_key', label: 'API Anahtarı', placeholder: 're_xxxxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'resend_from_email', label: 'Gönderici E-posta', placeholder: 'bulten@obtalks.tr' },
      { key: 'resend_from_name', label: 'Gönderici Adı', placeholder: 'Orhan Balcı' },
    ],
  },
];

function StatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === 'active') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: '#dcfce7', color: '#15803d', fontSize: '0.6875rem',
        fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
        Aktif
      </span>
    );
  }
  if (status === 'coming_soon') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        background: '#f3f4f6', color: '#9ca3af', fontSize: '0.6875rem',
        fontWeight: 600, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}>
        Yakında
      </span>
    );
  }
  return null;
}

function IntegrationRow({
  integration,
  onConfigure,
  effectiveStatus,
}: {
  integration: Integration;
  onConfigure: (id: string) => void;
  effectiveStatus: IntegrationStatus;
}) {
  return (
    <button
      onClick={() => effectiveStatus !== 'coming_soon' && onConfigure(integration.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        width: '100%', padding: '1.125rem 1.5rem',
        background: 'none', border: 'none',
        cursor: effectiveStatus === 'coming_soon' ? 'default' : 'pointer',
        textAlign: 'left', transition: 'background 0.1s',
        borderBottom: '1px solid #f3f4f6',
      }}
      onMouseEnter={e => {
        if (effectiveStatus !== 'coming_soon')
          (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: '#f9fafb',
        border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        {integration.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111', fontFamily: 'Inter, sans-serif' }}>
            {integration.name}
          </span>
          <StatusBadge status={effectiveStatus} />
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0, fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
          {integration.description}
        </p>
      </div>

      {effectiveStatus !== 'coming_soon' && (
        <ChevronRight size={16} color="#d1d5db" style={{ flexShrink: 0 }} />
      )}
    </button>
  );
}

interface ConfigDrawerProps {
  integration: Integration | null;
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  saved: boolean;
}

function ConfigDrawer({ integration, values, onChange, onSave, onClose, saving, saved }: ConfigDrawerProps) {
  if (!integration) return null;

  const isReadOnly = !integration.fields || integration.fields.length === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
          zIndex: 40, animation: 'fadeIn 0.15s ease',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        animation: 'slideInRight 0.2s ease',
      }}>
        {/* Drawer header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8, background: '#f9fafb',
            border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            {integration.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>{integration.name}</h2>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>{integration.description}</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {integration.id === 'rss' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#166534' }}>
                RSS beslemesi otomatik olarak aktiftir. Aşağıdaki URL'yi RSS okuyucunuza ekleyin.
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>RSS Besleme URL'si</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    readOnly
                    value="https://obtalks.tr/rss.xml"
                    style={{
                      flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb',
                      borderRadius: 6, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                      background: '#f9fafb', color: '#6b7280', outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText('https://obtalks.tr/rss.xml')}
                    style={{
                      padding: '0.5rem 0.875rem', background: '#111', color: '#fff',
                      border: 'none', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                    }}
                  >
                    Kopyala
                  </button>
                </div>
              </div>
            </div>
          )}

          {integration.id === 'content-api' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#1e40af' }}>
                Bu anahtar ile site içeriklerine salt okunur programatik erişim sağlayabilirsiniz.
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Content API URL</label>
                <input
                  readOnly
                  value={`${window.location.origin}/api/v1/content`}
                  style={{
                    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb',
                    borderRadius: 6, fontSize: '0.8125rem', fontFamily: 'monospace',
                    background: '#f9fafb', color: '#374151', outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Açıklama</label>
                <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                  Makaleler, diziler ve etiketleri JSON formatında döndürür. Harici araçlarla içerik senkronizasyonu için kullanın.
                </p>
              </div>
            </div>
          )}

          {integration.fields && integration.fields.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#713f12', lineHeight: 1.5 }}>
                Girdiğiniz değerler şifreli olarak saklanır ve yalnızca bu entegrasyon için kullanılır.
              </div>
              {integration.fields.map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={values[field.key] ?? ''}
                    onChange={e => onChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb',
                      borderRadius: 6, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                      outline: 'none', boxSizing: 'border-box', background: '#fff', color: '#111',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#374151'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer footer */}
        {!isReadOnly && (
          <div style={{
            padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb',
            display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem', background: '#fff', color: '#374151',
                border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.8125rem',
                fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              İptal
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                padding: '0.5rem 1.25rem', background: '#111', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminIntegrations() {
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(r => { map[r.key] = r.value; });
        setSettings(map);
      }
    });
  }, []);

  const openIntegration = (id: string) => {
    const integration = INTEGRATIONS.find(i => i.id === id);
    if (!integration) return;
    const draft: Record<string, string> = {};
    integration.fields?.forEach(f => { draft[f.key] = settings[f.key] ?? ''; });
    setDraftValues(draft);
    setActiveIntegration(id);
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const entries = Object.entries(draftValues);
    for (const [key, value] of entries) {
      await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' });
    }
    setSettings(prev => ({ ...prev, ...draftValues }));
    setSaving(false);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2500);
  };

  const activeIntegrationObj = INTEGRATIONS.find(i => i.id === activeIntegration) ?? null;

  const getEffectiveStatus = (integration: Integration): IntegrationStatus => {
    if (integration.status === 'coming_soon') return 'coming_soon';
    if (!integration.fields || integration.fields.length === 0) return integration.status;
    const allFilled = integration.fields.every(f => !!settings[f.key]?.trim());
    return allFilled ? 'active' : 'inactive';
  };

  const activeCount = INTEGRATIONS.filter(i => getEffectiveStatus(i) === 'active').length;

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>

      <AdminPageHeader
        title="Entegrasyonlar"
        subtitle="Siteyi harici uygulama ve araçlarla bağlayın."
      />

      <div style={{ padding: '2rem', maxWidth: 860 }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            { label: 'Toplam', value: INTEGRATIONS.length, icon: <Plug size={14} /> },
            { label: 'Aktif', value: activeCount, icon: <Zap size={14} color="#16a34a" /> },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
              padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem',
            }}>
              <span style={{ color: '#9ca3af' }}>{s.icon}</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', fontFamily: 'Inter, sans-serif' }}>{s.value}</span>
              <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Integration list */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: 0, fontFamily: 'Inter, sans-serif' }}>
              Tüm Entegrasyonlar
            </h2>
            <span style={{ fontSize: '0.8125rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>
              {INTEGRATIONS.length} entegrasyon
            </span>
          </div>

          {INTEGRATIONS.map(integration => (
            <IntegrationRow
              key={integration.id}
              integration={integration}
              onConfigure={openIntegration}
              effectiveStatus={getEffectiveStatus(integration)}
            />
          ))}
        </div>
      </div>

      <ConfigDrawer
        integration={activeIntegrationObj}
        values={draftValues}
        onChange={(key, val) => setDraftValues(prev => ({ ...prev, [key]: val }))}
        onSave={handleSave}
        onClose={() => setActiveIntegration(null)}
        saving={saving}
        saved={saved}
      />
    </>
  );
}
