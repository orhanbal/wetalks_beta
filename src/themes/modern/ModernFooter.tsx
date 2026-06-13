import { useState } from 'react';
import { ArrowRight, Check, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ModernFooterProps {
  navigate: (to: string) => void;
  settings?: Record<string, string>;
}

const NAV_GROUPS = [
  { group: 'İçerik', links: [
    { label: 'Anasayfa', path: '' },
    { label: 'Tüm Yazılar', path: 'contents' },
    { label: 'Seriler', path: 'series' },
    { label: 'Keşfet', path: 'discover' },
  ]},
  { group: 'Sayfalar', links: [
    { label: 'Hakkımda', path: 'about' },
    { label: 'İletişim', path: 'contact' },
    { label: 'Anketler', path: 'polls' },
  ]},
];

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase() });
    if (error) {
      setStatus(error.code === '23505' ? 'duplicate' : 'error');
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#86efac', marginTop: '0.75rem' }}>
        <Check size={14} />
        Bülten listemize eklendiniz.
      </div>
    );
  }

  if (status === 'duplicate') {
    return (
      <p style={{ fontSize: '0.82rem', color: 'rgba(240,237,232,0.5)', marginTop: '0.75rem' }}>
        Bu e-posta zaten kayıtlı.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
      <input
        type="email"
        placeholder="E-posta adresiniz"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={status === 'loading'}
        style={{
          flex: 1,
          minWidth: 0,
          height: 36,
          padding: '0 0.75rem',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8,
          color: '#F0EDE8',
          fontSize: '0.82rem',
          fontFamily: 'inherit',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email.trim()}
        style={{
          height: 36,
          width: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: '#F0EDE8',
          border: 'none',
          borderRadius: 8,
          color: '#0D0D0D',
          cursor: 'pointer',
          transition: 'opacity 0.15s',
          opacity: status === 'loading' || !email.trim() ? 0.4 : 1,
        }}
      >
        <ArrowRight size={15} />
      </button>
    </form>
  );
}

export default function ModernFooter({ navigate, settings = {} }: ModernFooterProps) {
  const siteTitle = settings['site_title'] || 'Site';
  const logoUrl = settings['logo_url'] || '';
  const tagline = settings['footer_tagline'] || '';
  const copyright = settings['footer_copyright'] || `© ${new Date().getFullYear()} ${siteTitle}. Tüm hakları saklıdır.`;
  const siteDomain = settings['site_domain'] || '';

  const linkStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.825rem',
    color: 'rgba(240,237,232,0.5)',
    background: 'none',
    border: 'none',
    padding: '0.275rem 0',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'color 0.15s',
  };

  return (
    <footer style={{
      background: '#0D0D0D',
      color: 'rgba(240,237,232,0.85)',
      marginTop: 0,
      borderTop: 'none',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 2rem 2.5rem' }}>
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1.5fr', gap: '3rem', marginBottom: '3rem' }}>

          {/* Brand */}
          <div>
            <button
              onClick={() => navigate('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '1rem', display: 'block' }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={siteTitle} style={{ height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              ) : (
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  color: '#F0EDE8',
                  fontFamily: 'inherit',
                  lineHeight: 1,
                }}>
                  {siteTitle}
                </span>
              )}
            </button>
            {tagline && (
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(240,237,232,0.48)',
                lineHeight: 1.75,
                maxWidth: 280,
                margin: 0,
              }}>
                {tagline}
              </p>
            )}
          </div>

          {/* Nav groups */}
          {NAV_GROUPS.map(group => (
            <div key={group.group}>
              <h4 style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(240,237,232,0.3)',
                marginBottom: '1rem',
              }}>
                {group.group}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {group.links.map(link => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    style={linkStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F0EDE8')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.5)')}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Mail size={13} style={{ color: 'rgba(240,237,232,0.4)', flexShrink: 0 }} />
              <h4 style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(240,237,232,0.3)',
                margin: 0,
              }}>
                Haftalık Bülten
              </h4>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'rgba(240,237,232,0.48)', margin: 0, lineHeight: 1.6 }}>
              Yeni yazıları e-postanıza alın.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: '1.75rem' }} />

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(240,237,232,0.28)' }}>{copyright}</span>
          {siteDomain && (
            <span style={{ fontSize: '0.75rem', color: 'rgba(240,237,232,0.28)', letterSpacing: '0.03em' }}>{siteDomain}</span>
          )}
        </div>
      </div>
    </footer>
  );
}
