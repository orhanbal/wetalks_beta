import { useState, useEffect } from 'react';
import { Search, Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDarkMode, type ThemePreference } from '../../hooks/useDarkMode';
import type { Series } from '../../data/series';

interface ModernHeaderProps {
  navigate: (to: string) => void;
  currentPage: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  siteTitle?: string;
  onSearchOpen: () => void;
  seriesList?: Series[];
  showPollsPage?: boolean;
  settings?: Record<string, string>;
}

const GRAD_PURPLE_PINK = 'linear-gradient(135deg, #8B5CF6, #EC4899)';

/* Reads data-theme purely from CSS cascade — no JS state race condition */
function useIsDark() {
  const [isDark, setIsDark] = useState(() => {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr === 'dark';
    const stored = localStorage.getItem('theme-pref');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const sync = () =>
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return isDark;
}

const NAV_LINKS = [
  { label: 'Yazarlar', path: 'discover' },
  { label: 'Yazılar', path: 'contents' },
  { label: 'Konular', path: 'discover' },
  { label: 'Seriler', path: 'series' },
  { label: 'Hakkımızda', path: 'about' },
];

export default function ModernHeader({
  navigate, currentPage, logoUrl, logoDarkUrl, siteTitle = 'Site',
  onSearchOpen, showPollsPage, settings = {},
}: ModernHeaderProps) {
  const { user } = useAuth();
  const siteDefault = (settings['default_theme'] as ThemePreference) || 'system';
  const { preference, setPreference } = useDarkMode(siteDefault);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isDark = useIsDark();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const cycleTheme = () => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    setPreference(order[(order.indexOf(preference) + 1) % order.length]);
  };
  const ThemeIcon = preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor;

  const activeLogo = isDark && logoDarkUrl ? logoDarkUrl : logoUrl;
  const navLinks = [...NAV_LINKS, ...(showPollsPage ? [{ label: 'Anketler', path: 'polls' }] : [])];
  const isActive = (path: string) => currentPage === path || (path === 'discover' && currentPage === '');

  return (
    <>
      {/* Header background via inline style (belt-and-suspenders: works even before CSS cascade fires) */}
      <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled
          ? (isDark ? 'rgba(5,11,21,0.90)' : 'rgba(248,247,244,0.90)')
          : (isDark ? 'rgba(3,7,18,0)' : 'rgba(248,247,244,0)'),
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled
          ? `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`
          : '1px solid transparent',
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 72, display: 'flex', alignItems: 'center', gap: '2rem' }}>

          {/* Logo */}
          <button
            onClick={() => navigate('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center' }}
          >
            {activeLogo ? (
              <img src={activeLogo} alt={siteTitle} style={{ height: 26, objectFit: 'contain' }} />
            ) : (
              <span className="modern-logo-text">
                {siteTitle}
                <span style={{ background: GRAD_PURPLE_PINK, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>.</span>
              </span>
            )}
          </button>

          {/* Desktop nav — colors fully controlled by CSS */}
          <nav className="modern-nav" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className={`modern-nav-btn${isActive(link.path) ? ' modern-nav-btn--active' : ''}`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Search */}
            <button onClick={onSearchOpen} className="modern-search-btn">
              <Search size={14} />
              <span className="modern-search-label">Ara...</span>
            </button>

            {/* Theme toggle */}
            <button onClick={cycleTheme} className="modern-theme-btn">
              <ThemeIcon size={15} />
            </button>

            {/* Auth */}
            {user ? (
              <button onClick={() => navigate('profile')} className="modern-login-btn">
                Profilim
              </button>
            ) : (
              <>
                <button onClick={() => navigate('login')} className="modern-login-btn">
                  Giriş Yap
                </button>
                <button
                  onClick={() => navigate('register')}
                  style={{
                    height: 38, padding: '0 1.25rem',
                    background: GRAD_PURPLE_PINK, color: '#fff',
                    border: 'none', borderRadius: 10,
                    fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 12px rgba(139,92,246,0.35)',
                    transition: 'filter 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                  onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                >
                  Yazar Ol
                </button>
              </>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="modern-hamburger modern-login-btn"
              style={{ display: 'none', width: 36, padding: 0, alignItems: 'center', justifyContent: 'center' }}
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="modern-mobile-drawer">
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1rem' }}>
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={() => { navigate(link.path); setMobileOpen(false); }}
                  className={`modern-nav-btn${isActive(link.path) ? ' modern-nav-btn--active' : ''}`}
                  style={{ textAlign: 'left', padding: '0.625rem 0.5rem' }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { navigate('login'); setMobileOpen(false); }} className="modern-login-btn" style={{ flex: 1, height: 42 }}>
                Giriş Yap
              </button>
              <button
                onClick={() => { navigate('register'); setMobileOpen(false); }}
                style={{ flex: 1, height: 42, background: GRAD_PURPLE_PINK, border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Yazar Ol
              </button>
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 768px) {
          .modern-nav { display: none !important; }
          .modern-hamburger { display: flex !important; }
          .modern-search-label { display: none !important; }
        }
        @media (min-width: 769px) {
          .modern-search-label { display: inline !important; }
        }
      `}</style>
    </>
  );
}
