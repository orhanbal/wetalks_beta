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
  const isDark = useDarkTheme();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
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

  const bgBase = isDark ? 'rgba(3,7,18,0)' : 'rgba(248,247,244,0)';
  const bgScrolled = isDark
    ? 'rgba(5,11,21,0.85)'
    : 'rgba(255,255,255,0.85)';
  const borderScrolled = isDark
    ? 'rgba(255,255,255,0.07)'
    : 'rgba(17,24,39,0.07)';
  const INK = isDark ? '#fff' : '#111827';
  const INK3 = isDark ? '#71717A' : '#6B7280';
  const SRCH_BG = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const SRCH_BORDER = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const BTN1_BORDER = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? bgScrolled : bgBase,
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? `1px solid ${borderScrolled}` : '1px solid transparent',
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
              <span style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: INK, fontFamily: 'inherit', lineHeight: 1 }}>
                {siteTitle}
                <span style={{ background: GRAD_PURPLE_PINK, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>.</span>
              </span>
            )}
          </button>

          {/* Desktop nav */}
          <nav className="modern-nav" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                style={{
                  background: 'none', border: 'none', borderRadius: 8,
                  padding: '0.4rem 0.875rem', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.875rem', fontWeight: isActive(link.path) ? 600 : 400,
                  color: isActive(link.path) ? INK : INK3,
                  transition: 'color 0.15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = INK)}
                onMouseLeave={e => (e.currentTarget.style.color = isActive(link.path) ? INK : INK3)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {/* Search */}
            <button
              onClick={onSearchOpen}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.45rem 0.875rem', height: 38,
                background: SRCH_BG, border: `1px solid ${SRCH_BORDER}`,
                borderRadius: 100, cursor: 'pointer', color: INK3,
                fontSize: '0.8rem', fontFamily: 'inherit', transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = SRCH_BG; e.currentTarget.style.borderColor = SRCH_BORDER; }}
            >
              <Search size={14} />
              <span className="modern-search-label" style={{ color: INK3 }}>Ara...</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: INK3, transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <ThemeIcon size={15} />
            </button>

            {/* Auth */}
            {user ? (
              <button
                onClick={() => navigate('profile')}
                style={{
                  height: 38, padding: '0 1.1rem', background: 'transparent',
                  border: `1px solid ${BTN1_BORDER}`, borderRadius: 10,
                  fontSize: '0.82rem', fontWeight: 500, color: INK,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = BTN1_BORDER)}
              >
                Profilim
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('login')}
                  style={{
                    height: 38, padding: '0 1.1rem', background: 'transparent',
                    border: `1px solid ${BTN1_BORDER}`, borderRadius: 10,
                    fontSize: '0.82rem', fontWeight: 500, color: INK,
                    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = BTN1_BORDER)}
                >
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
              className="modern-hamburger"
              style={{
                display: 'none', width: 36, height: 36, borderRadius: 10,
                border: `1px solid ${BTN1_BORDER}`, background: 'transparent',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: INK,
              }}
            >
              {mobileOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div style={{
            borderTop: `1px solid ${borderScrolled}`,
            background: isDark ? '#050B15' : '#fff',
            padding: '0.875rem 2rem 1.5rem',
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1rem' }}>
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={() => { navigate(link.path); setMobileOpen(false); }}
                  style={{
                    textAlign: 'left', fontSize: '0.9rem', fontWeight: 500, color: INK3,
                    background: 'none', border: 'none', borderRadius: 8,
                    padding: '0.625rem 0.5rem', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = INK)}
                  onMouseLeave={e => (e.currentTarget.style.color = INK3)}
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => { navigate('login'); setMobileOpen(false); }}
                style={{ flex: 1, height: 42, background: 'transparent', border: `1px solid ${BTN1_BORDER}`, borderRadius: 10, fontSize: '0.85rem', fontWeight: 500, color: INK, cursor: 'pointer', fontFamily: 'inherit' }}
              >
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
