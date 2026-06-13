import { useState } from 'react';
import { ArrowRight, Check, Linkedin, Twitter, Instagram, Youtube, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ModernFooterProps {
  navigate: (to: string) => void;
  settings?: Record<string, string>;
}

const ORANGE = '#F97316';

const COL_KESFET = [
  { label: 'Yazarlar', path: 'discover' },
  { label: 'Yazılar', path: 'contents' },
  { label: 'Seriler', path: 'series' },
  { label: 'Keşfet', path: 'discover' },
];

const COL_HAKKIMIZDA = [
  { label: 'Hakkımızda', path: 'about' },
  { label: 'Kariyer', path: 'about' },
  { label: 'İletişim', path: 'contact' },
  { label: 'Gizlilik Politikası', path: 'about' },
];

const COL_YAZAR_OL = [
  { label: 'Nasıl Yazabilirim?', path: 'register' },
  { label: 'Yazar Rehberi', path: 'register' },
  { label: 'Gelir Modeli', path: 'register' },
  { label: 'Yazarlar İçin Destek', path: 'contact' },
];

function FooterLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', background: 'none', border: 'none', cursor: 'pointer',
        textAlign: 'left', padding: '0.3rem 0',
        fontSize: '0.825rem', color: '#888', fontFamily: 'inherit',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = '#111')}
      onMouseLeave={e => (e.currentTarget.style.color = '#888')}
    >
      {label}
    </button>
  );
}

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.825rem', fontWeight: 600 }}>
        <Check size={14} /> Bültene abone oldunuz!
      </div>
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
          flex: 1, minWidth: 0, height: 40, padding: '0 0.75rem',
          background: '#F5F3EE', border: '1.5px solid #e8e5df',
          borderRadius: 8, fontSize: '0.82rem', fontFamily: 'inherit',
          outline: 'none', transition: 'border-color 0.15s',
          color: '#111',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = ORANGE)}
        onBlur={e => (e.currentTarget.style.borderColor = '#e8e5df')}
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email.trim()}
        style={{
          height: 40, padding: '0 1rem',
          background: ORANGE, color: '#fff',
          border: 'none', borderRadius: 8,
          fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', flexShrink: 0,
          opacity: status === 'loading' || !email.trim() ? 0.6 : 1,
          transition: 'filter 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
      >
        Abone Ol
      </button>
    </form>
  );
}

export default function ModernFooter({ navigate, settings = {} }: ModernFooterProps) {
  const siteTitle = settings['site_title'] || 'Site';
  const logoUrl = settings['logo_url'] || '';
  const tagline = settings['footer_tagline'] || 'Deneyimler paylaşıldığında değer kazanır.';
  const copyright = settings['footer_copyright'] || `© ${new Date().getFullYear()} ${siteTitle}. Tüm hakları saklıdır.`;
  const linkedinUrl = settings['linkedin_url'] || '';
  const twitterUrl = settings['twitter_url'] || '';
  const instagramUrl = settings['instagram_url'] || '';
  const youtubeUrl = settings['youtube_url'] || '';

  const HEADING: React.CSSProperties = {
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#bbb', marginBottom: '0.875rem',
  };

  const SOCIAL_BTN: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 8,
    border: '1.5px solid #e8e5df', background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#999', textDecoration: 'none',
    transition: 'border-color 0.15s, color 0.15s',
  };

  return (
    <footer style={{ background: '#FAFAF6', borderTop: '1px solid #F0EDE8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 2rem 2rem' }}>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1.5fr', gap: '2.5rem', marginBottom: '3rem' }}>

          {/* Brand col */}
          <div>
            <button
              onClick={() => navigate('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '0.875rem', display: 'block' }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={siteTitle} style={{ height: 28, objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#111', fontFamily: 'inherit' }}>
                  {siteTitle}<span style={{ color: ORANGE }}>.</span>
                </span>
              )}
            </button>
            {tagline && (
              <p style={{ fontSize: '0.825rem', color: '#999', lineHeight: 1.7, maxWidth: 220, margin: '0 0 1.25rem' }}>{tagline}</p>
            )}
            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={SOCIAL_BTN}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#0A66C2'; (e.currentTarget as HTMLAnchorElement).style.color = '#0A66C2'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e8e5df'; (e.currentTarget as HTMLAnchorElement).style.color = '#999'; }}>
                  <Linkedin size={14} />
                </a>
              )}
              {twitterUrl && (
                <a href={twitterUrl} target="_blank" rel="noopener noreferrer" style={SOCIAL_BTN}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#111'; (e.currentTarget as HTMLAnchorElement).style.color = '#111'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e8e5df'; (e.currentTarget as HTMLAnchorElement).style.color = '#999'; }}>
                  <Twitter size={14} />
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" style={SOCIAL_BTN}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E1306C'; (e.currentTarget as HTMLAnchorElement).style.color = '#E1306C'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e8e5df'; (e.currentTarget as HTMLAnchorElement).style.color = '#999'; }}>
                  <Instagram size={14} />
                </a>
              )}
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" style={SOCIAL_BTN}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FF0000'; (e.currentTarget as HTMLAnchorElement).style.color = '#FF0000'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e8e5df'; (e.currentTarget as HTMLAnchorElement).style.color = '#999'; }}>
                  <Youtube size={14} />
                </a>
              )}
              {/* Show at least one placeholder if no social links */}
              {!linkedinUrl && !twitterUrl && !instagramUrl && !youtubeUrl && (
                <>
                  <div style={{ ...SOCIAL_BTN, cursor: 'default' }}><Linkedin size={14} /></div>
                  <div style={{ ...SOCIAL_BTN, cursor: 'default' }}><Twitter size={14} /></div>
                  <div style={{ ...SOCIAL_BTN, cursor: 'default' }}><Instagram size={14} /></div>
                  <div style={{ ...SOCIAL_BTN, cursor: 'default' }}><Youtube size={14} /></div>
                </>
              )}
            </div>
          </div>

          {/* Keşfet */}
          <div>
            <h4 style={HEADING}>Keşfet</h4>
            {COL_KESFET.map(l => <FooterLink key={l.label} label={l.label} onClick={() => navigate(l.path)} />)}
          </div>

          {/* Hakkımızda */}
          <div>
            <h4 style={HEADING}>Hakkımızda</h4>
            {COL_HAKKIMIZDA.map(l => <FooterLink key={l.label} label={l.label} onClick={() => navigate(l.path)} />)}
          </div>

          {/* Yazar Ol */}
          <div>
            <h4 style={HEADING}>Yazar Ol</h4>
            {COL_YAZAR_OL.map(l => <FooterLink key={l.label} label={l.label} onClick={() => navigate(l.path)} />)}
          </div>

          {/* Callout box */}
          <div style={{ background: '#FEF7EE', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Star size={16} color={ORANGE} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111' }}>Bir hikayeniz var mı?</span>
            </div>
            <p style={{ fontSize: '0.775rem', color: '#888', lineHeight: 1.6, margin: 0 }}>
              Deneyiminizi binlerce kişiyle paylaşmaya hazır mısınız?
            </p>
            <button
              onClick={() => navigate('register')}
              style={{
                marginTop: '0.5rem', padding: '0.5rem 0', background: ORANGE, color: '#fff',
                border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', width: '100%',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
            >
              Yazar Ol
            </button>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.775rem', color: '#bbb' }}>{copyright}</span>
        </div>
      </div>
    </footer>
  );
}
