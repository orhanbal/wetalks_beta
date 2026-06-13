import { useState, useEffect } from 'react';
import { ArrowRight, Check, Linkedin, Twitter, Instagram, Youtube, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ModernFooterProps {
  navigate: (to: string) => void;
  settings?: Record<string, string>;
}

const GRAD_PURPLE_PINK = 'linear-gradient(135deg, #8B5CF6, #EC4899)';
const PURPLE = '#8B5CF6';

function useDarkTheme() {
  const [isDark, setIsDark] = useState(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr === 'dark';
    const stored = localStorage.getItem('theme-pref') as 'system' | 'light' | 'dark' | null;
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function NewsletterForm({ isDark }: { isDark: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'dup'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
    setStatus(!error ? 'success' : error.code === '23505' ? 'dup' : 'error');
    if (!error) setEmail('');
  };

  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#F9F9F9';
  const inputBorder = isDark ? 'rgba(255,255,255,0.10)' : '#E5E7EB';
  const ink = isDark ? '#fff' : '#111827';

  if (status === 'success') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 600, fontSize: '0.825rem' }}>
        <Check size={14} /> Abone oldunuz!
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        type="email" placeholder="E-posta adresinizi girin" value={email}
        onChange={e => setEmail(e.target.value)} required disabled={status === 'loading'}
        style={{
          flex: 1, minWidth: 0, height: 40, padding: '0 0.75rem',
          background: inputBg, border: `1px solid ${inputBorder}`,
          borderRadius: 8, fontSize: '0.8rem', fontFamily: 'inherit',
          color: ink, outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = PURPLE)}
        onBlur={e => (e.currentTarget.style.borderColor = inputBorder)}
      />
      <button
        type="submit" disabled={status === 'loading' || !email.trim()}
        style={{
          width: 40, height: 40, borderRadius: 8, border: 'none',
          background: GRAD_PURPLE_PINK, cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: status === 'loading' || !email.trim() ? 0.5 : 1,
          transition: 'filter 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.12)')}
        onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
      >
        <ArrowRight size={16} color="#fff" />
      </button>
    </form>
  );
}

export default function ModernFooter({ navigate, settings = {} }: ModernFooterProps) {
  const isDark = useDarkTheme();
  const siteTitle = settings['site_title'] || 'Site';
  const logoUrl = settings['logo_url'] || '';
  const logoDarkUrl = settings['logo_dark_url'] || '';
  const tagline = settings['footer_tagline'] || 'Deneyimler paylaşıldığında değer kazanır.';
  const copyright = settings['footer_copyright'] || `© ${new Date().getFullYear()} ${siteTitle}. Tüm hakları saklıdır.`;
  const linkedinUrl = settings['linkedin_url'] || '';
  const twitterUrl = settings['twitter_url'] || '';
  const instagramUrl = settings['instagram_url'] || '';
  const youtubeUrl = settings['youtube_url'] || '';

  const activeLogo = isDark && logoDarkUrl ? logoDarkUrl : logoUrl;

  const BG = isDark ? '#030712' : '#F8F7F4';
  const BORDER = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const INK = isDark ? '#F4F4F5' : '#111827';
  const INK2 = isDark ? '#71717A' : '#6B7280';
  const INK3 = isDark ? '#52525B' : '#9CA3AF';
  const CARD = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const CARD_BORDER = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const SOCIAL_BG = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const SOCIAL_HOVER = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';

  const HEAD_STYLE: React.CSSProperties = {
    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
    textTransform: 'uppercase', color: INK3, marginBottom: '1rem', display: 'block',
  };

  const LINK_STYLE: React.CSSProperties = {
    display: 'block', background: 'none', border: 'none', cursor: 'pointer',
    textAlign: 'left', padding: '0.3rem 0', fontSize: '0.825rem',
    color: INK2, fontFamily: 'inherit', transition: 'color 0.15s',
  };

  const COL_KESFET = [
    { label: 'Yazarlar', path: 'discover' },
    { label: 'Yazılar', path: 'contents' },
    { label: 'Konular', path: 'discover' },
    { label: 'Seriler', path: 'series' },
    { label: 'Etkinlikler', path: 'discover' },
  ];

  const COL_HAKKIMIZDA = [
    { label: 'Hakkımızda', path: 'about' },
    { label: 'Kariyer', path: 'about' },
    { label: 'İletişim', path: 'contact' },
    { label: 'Gizlilik Politikası', path: 'about' },
    { label: 'Kullanım Koşulları', path: 'about' },
  ];

  const COL_YAZAR = [
    { label: 'Neden WeTalks?', path: 'register' },
    { label: 'Yazar Rehberi', path: 'register' },
    { label: 'Gelir Modeli', path: 'register' },
    { label: 'Yazarlar İçin Destek', path: 'contact' },
  ];

  const SOCIAL_LINKS = [
    { url: linkedinUrl, Icon: Linkedin, hoverColor: '#0A66C2', label: 'LinkedIn' },
    { url: twitterUrl,  Icon: Twitter,  hoverColor: isDark ? '#fff' : '#000', label: 'X' },
    { url: instagramUrl, Icon: Instagram, hoverColor: '#E1306C', label: 'Instagram' },
    { url: youtubeUrl,  Icon: Youtube,  hoverColor: '#FF0000', label: 'YouTube' },
  ];

  return (
    <footer style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 2rem 2rem' }}>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1.5fr', gap: '2.5rem', marginBottom: '3rem' }}>

          {/* Brand */}
          <div>
            <button
              onClick={() => navigate('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '0.75rem', display: 'block' }}
            >
              {activeLogo ? (
                <img src={activeLogo} alt={siteTitle} style={{ height: 26, objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: INK, fontFamily: 'inherit' }}>
                  {siteTitle}
                  <span style={{ background: GRAD_PURPLE_PINK, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>.</span>
                </span>
              )}
            </button>
            {tagline && (
              <p style={{ fontSize: '0.825rem', color: INK2, lineHeight: 1.7, maxWidth: 220, margin: '0 0 1.375rem' }}>{tagline}</p>
            )}
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map(({ url, Icon, hoverColor, label }) => {
                const el = (
                  <div
                    key={label}
                    title={label}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: SOCIAL_BG, border: `1px solid ${CARD_BORDER}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: url ? 'pointer' : 'default', color: INK2,
                      transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => { if (url) { (e.currentTarget as HTMLDivElement).style.background = SOCIAL_HOVER; (e.currentTarget as HTMLDivElement).style.color = hoverColor; (e.currentTarget as HTMLDivElement).style.borderColor = hoverColor + '55'; } }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = SOCIAL_BG; (e.currentTarget as HTMLDivElement).style.color = INK2; (e.currentTarget as HTMLDivElement).style.borderColor = CARD_BORDER; }}
                  >
                    <Icon size={14} />
                  </div>
                );
                return url ? (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>{el}</a>
                ) : el;
              })}
            </div>
          </div>

          {/* Keşfet */}
          <div>
            <span style={HEAD_STYLE}>Keşfet</span>
            {COL_KESFET.map(l => (
              <button key={l.label} onClick={() => navigate(l.path)} style={LINK_STYLE}
                onMouseEnter={e => (e.currentTarget.style.color = INK)}
                onMouseLeave={e => (e.currentTarget.style.color = INK2)}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Hakkımızda */}
          <div>
            <span style={HEAD_STYLE}>Hakkımızda</span>
            {COL_HAKKIMIZDA.map(l => (
              <button key={l.label} onClick={() => navigate(l.path)} style={LINK_STYLE}
                onMouseEnter={e => (e.currentTarget.style.color = INK)}
                onMouseLeave={e => (e.currentTarget.style.color = INK2)}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Yazar Ol */}
          <div>
            <span style={HEAD_STYLE}>Yazar Ol</span>
            {COL_YAZAR.map(l => (
              <button key={l.label} onClick={() => navigate(l.path)} style={LINK_STYLE}
                onMouseEnter={e => (e.currentTarget.style.color = INK)}
                onMouseLeave={e => (e.currentTarget.style.color = INK2)}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Newsletter CTA card */}
          <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: '1.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Star size={15} color={PURPLE} fill={PURPLE} />
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: INK }}>Yeniliklerden haberdar olun!</span>
            </div>
            <p style={{ fontSize: '0.775rem', color: INK2, lineHeight: 1.65, margin: '0 0 1rem' }}>
              Yeni yazılar ve röportajlar e-posta kutunuza gelsin.
            </p>
            <NewsletterForm isDark={isDark} />
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: INK3 }}>{copyright}</span>
        </div>
      </div>
    </footer>
  );
}
