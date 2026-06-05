import { useState, useEffect } from 'react';
import { Linkedin, Monitor, Sun, Moon, Mail, ArrowRight, Check } from 'lucide-react';
import { useDarkMode, ThemePreference } from '../hooks/useDarkMode';
import { supabase } from '../lib/supabase';

interface FooterProps {
  navigate: (to: string) => void;
  settings?: Record<string, string>;
}

const navItems = [
  { label: 'Anasayfa', path: '' },
  { label: 'Bana Dair', path: 'about' },
  { label: 'Ayna Ticaret', path: 'tag/ayna-ticaret' },
  { label: 'Operasyon', path: 'tag/operasyon' },
  { label: 'Yapay Zeka', path: 'tag/yapay-zeka' },
  { label: 'Ayna Ticaret Serisi', path: 'series/ayna-ticaret' },
];

const themeOptions: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: 'system', label: 'Sistem', icon: <Monitor size={13} /> },
  { value: 'light', label: 'Açık', icon: <Sun size={13} /> },
  { value: 'dark', label: 'Koyu', icon: <Moon size={13} /> },
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
      if (error.code === '23505') {
        setStatus('duplicate');
      } else {
        setStatus('error');
      }
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  if (status === 'success') {
    return (
      <div className="newsletter-success">
        <div className="newsletter-success-icon">
          <Check size={16} />
        </div>
        <div>
          <p className="newsletter-success-title">Bültene kaydoldunuz!</p>
          <p className="newsletter-success-desc">Her hafta yeni yazıları e-posta ile alacaksınız.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      <div className="newsletter-input-row">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          required
          disabled={status === 'loading'}
          className="newsletter-input"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !email.trim()}
          className="newsletter-btn"
        >
          {status === 'loading' ? (
            <span className="newsletter-btn-loading" />
          ) : (
            <ArrowRight size={15} />
          )}
        </button>
      </div>
      {status === 'duplicate' && (
        <p className="newsletter-msg newsletter-msg--warn">Bu e-posta adresi zaten kayıtlı.</p>
      )}
      {status === 'error' && (
        <p className="newsletter-msg newsletter-msg--error">Bir hata oluştu. Lütfen tekrar deneyin.</p>
      )}
    </form>
  );
}

export default function Footer({ navigate, settings = {} }: FooterProps) {
  const siteTitle = settings['site_title'] || 'obtalks.tr';
  const logoUrl = settings['logo_url'] || '';
  const logoDarkUrl = settings['logo_url_dark'] || '';
  const tagline = settings['footer_tagline'] || 'Türkiye\'de ticaret, e-ticaret, markalaşma, teknoloji ve girişimcilik üzerine sahadan notlar.';
  const copyright = settings['footer_copyright'] || `© ${new Date().getFullYear()} Orhan Balcı. Tüm hakları saklıdır.`;
  const linkedinUrl = settings['linkedin_url'] || 'https://www.linkedin.com/in/orhanbalci';

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const activeLogoUrl = (isDark && logoDarkUrl) ? logoDarkUrl : logoUrl;

  const siteDefault = (settings['default_theme'] as ThemePreference) || 'system';
  const { preference, setPreference } = useDarkMode(siteDefault);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <button className="footer-logo" onClick={() => navigate('')}>
            {activeLogoUrl ? (
              <img src={activeLogoUrl} alt={siteTitle} style={{ height: 28, maxWidth: 130, objectFit: 'contain', display: 'block' }} />
            ) : (
              siteTitle
            )}
          </button>
          <p className="footer-desc">{tagline}</p>
          <div className="footer-socials">
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-btn"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
          </div>
        </div>

        <div className="footer-nav-section">
          <h4>Navigasyon</h4>
          <div className="footer-nav-grid">
            {navItems.map((item) => (
              <button
                key={item.label}
                className="footer-nav-link"
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="footer-newsletter-section">
          <div className="footer-newsletter-header">
            <Mail size={14} />
            <h4>Haftalık Bülten</h4>
          </div>
          <p className="footer-newsletter-desc">
            Yeni yazıları doğrudan e-posta kutunuza alın. Haftada bir, spam yok.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>{copyright}</span>
          <div className="theme-switcher">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                className={`theme-switcher-btn${preference === opt.value ? ' theme-switcher-btn--active' : ''}`}
                onClick={() => setPreference(opt.value)}
                aria-label={opt.label}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
          <span>{(settings['site_domain'] || 'obtalks.tr')}</span>
        </div>
      </div>
    </footer>
  );
}
