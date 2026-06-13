import { useState, useEffect } from 'react';
import { Search, Menu, X, Sun, Moon, Monitor, LogIn } from 'lucide-react';
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

const ORANGE = '#F97316';

const NAV_LINKS = [
  { label: 'Yazarlar', path: 'discover' },
  { label: 'Yazılar', path: 'contents' },
  { label: 'Seriler', path: 'series' },
  { label: 'Keşfet', path: 'discover' },
];

export default function ModernHeader({
  navigate,
  currentPage,
  logoUrl,
  logoDarkUrl,
  siteTitle = 'Site',
  onSearchOpen,
  showPollsPage,
  settings = {},
}: ModernHeaderProps) {
  const { user, signOut } = useAuth();
  const siteDefault = (settings['default_theme'] as ThemePreference) || 'system';
  const { preference, setPreference } = useDarkMode(siteDefault);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    return () => obs.disconnect();
  }, []);

  const activeLogo = isDark && logoDarkUrl ? logoDarkUrl : logoUrl;

  const cycleTheme = () => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    setPreference(order[(order.indexOf(preference) + 1) % order.length]);
  };

  const ThemeIcon = preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor;
  const navLinks = [...NAV_LINKS, ...(showPollsPage ? [{ label: 'Anketler', path: 'polls' }] : [])];
  const isActive = (path: string) => currentPage === path || (path === '' && currentPage === 'home') || (path === 'discover' && (currentPage === 'discover' || currentPage === ''));

  const BG = isDark ? 'rgba(12,12,12,0.92)' : 'rgba(250,250,246,0.92)';
  const BORDER = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
  const INK = isDark ? '#F0EDE8' : '#111';
  const INK3 = isDark ? '#888' : '#666';

  const headerBg = scrolled ? BG : 'transparent';
  const headerBorder = scrolled ? `1px solid ${BORDER}` : '1px solid transparent';

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: headerBg,
        backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
        borderBottom: headerBorder,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', gap: '2rem' }}>

          {/* Logo */}
          <button
            onClick={() => navigate('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            {activeLogo ? (
              <img src={activeLogo} alt={siteTitle} style={{ height: 28, objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: INK, fontFamily: 'inherit', lineHeight: 1 }}>
                {siteTitle}
                <span style={{ color: ORANGE }}>.</span>
              </span>
            )}
          </button>

          {/* Desktop nav — centered */}
          <nav style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive(link.path) ? 700 : 500,
                  color: isActive(link.path) ? INK : INK3,
                  background: 'none',
                  border: 'none', borderRadius: 8,
                  padding: '0.4rem 0.875rem',
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = INK; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = isActive(link.path) ? INK : INK3; }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right: search + theme + auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Search */}
            <button
              onClick={onSearchOpen}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.75rem', background: isDark ? 'rgba(255,255,255,0.06)' : '#f0ede8',
                border: 'none', borderRadius: 8, cursor: 'pointer', color: INK3,
                fontSize: '0.8rem', fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.1)' : '#e8e4dc'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.06)' : '#f0ede8'; }}
            >
              <Search size={14} />
              <span style={{ display: 'none' }} className="md-search-label">Ara...</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              style={{
                width: 34, height: 34, borderRadius: 8, border: 'none', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: INK3, transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <ThemeIcon size={15} />
            </button>

            {/* Auth buttons */}
            {user ? (
              <button
                onClick={() => navigate('profile')}
                style={{
                  padding: '0.45rem 1rem', background: 'transparent',
                  border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#ddd'}`,
                  borderRadius: 100, fontSize: '0.82rem', fontWeight: 600, color: INK,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = INK; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#ddd'; }}
              >
                Profilim
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate('login')}
                  style={{
                    padding: '0.45rem 1rem', background: 'transparent',
                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.15)' : '#ddd'}`,
                    borderRadius: 100, fontSize: '0.82rem', fontWeight: 600, color: INK,
                    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#999'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#ddd'; }}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => navigate('register')}
                  style={{
                    padding: '0.45rem 1rem', background: ORANGE, color: '#fff',
                    border: 'none', borderRadius: 100,
                    fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'inherit', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 10px rgba(249,115,22,0.3)',
                    transition: 'filter 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'none'; }}
                >
                  Yazar Ol
                </button>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              style={{
                display: 'none', width: 34, height: 34, borderRadius: 8,
                border: 'none', background: 'transparent', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: INK,
              }}
              className="modern-mobile-toggle"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: `1px solid ${BORDER}`, background: isDark ? '#0C0C0C' : '#FAFAF6', padding: '0.75rem 2rem 1.25rem' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={() => { navigate(link.path); setMobileOpen(false); }}
                  style={{
                    textAlign: 'left', fontSize: '0.9rem', fontWeight: 600,
                    color: isActive(link.path) ? INK : INK3,
                    background: 'none', border: 'none', borderRadius: 8,
                    padding: '0.625rem 0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { navigate('login'); setMobileOpen(false); }} style={{ flex: 1, padding: '0.625rem', background: 'transparent', border: `1.5px solid ${BORDER}`, borderRadius: 100, fontSize: '0.82rem', fontWeight: 600, color: INK, cursor: 'pointer', fontFamily: 'inherit' }}>Giriş Yap</button>
              <button onClick={() => { navigate('register'); setMobileOpen(false); }} style={{ flex: 1, padding: '0.625rem', background: ORANGE, border: 'none', borderRadius: 100, fontSize: '0.82rem', fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Yazar Ol</button>
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 768px) {
          .modern-mobile-toggle { display: flex !important; }
          nav { display: none !important; }
          .md-search-label { display: none !important; }
        }
        @media (min-width: 769px) {
          .md-search-label { display: inline !important; }
        }
      `}</style>
    </>
  );
}
