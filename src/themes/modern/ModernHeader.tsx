import { useState, useEffect } from 'react';
import { Search, Menu, X, Sun, Moon, Monitor, LogIn, CircleUser as UserCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDarkMode, type ThemePreference } from '../../hooks/useDarkMode';
import type { Series } from '../../data/series';
import type { AuthorSummary } from '../../hooks/useData';

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

const NAV_LINKS = [
  { label: 'Anasayfa', path: '' },
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
  const { user } = useAuth();
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
  const isActive = (path: string) => currentPage === path || (path === '' && currentPage === 'home');

  const headerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: scrolled ? 'rgba(249,248,246,0.9)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
    borderBottom: scrolled ? '1px solid var(--m-border, #E8E5DF)' : '1px solid transparent',
    transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
  };

  const headerStyleDark: React.CSSProperties = {
    ...headerStyle,
    background: scrolled ? 'rgba(12,12,12,0.9)' : 'transparent',
  };

  const iconBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: 'var(--m-ink-3, #717070)',
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    flexShrink: 0,
  };

  return (
    <>
      <header style={isDark ? headerStyleDark : headerStyle}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Logo / Wordmark */}
          <button
            onClick={() => navigate('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          >
            {activeLogo ? (
              <img src={activeLogo} alt={siteTitle} style={{ height: 28, objectFit: 'contain', display: 'block' }} />
            ) : (
              <span style={{
                fontSize: '1.15rem',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: 'var(--m-ink, #0D0D0D)',
                fontFamily: 'inherit',
                lineHeight: 1,
              }}>
                {siteTitle}
              </span>
            )}
          </button>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', flex: 1 }}>
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  fontSize: '0.82rem',
                  fontWeight: isActive(link.path) ? 600 : 500,
                  color: isActive(link.path) ? 'var(--m-ink, #0D0D0D)' : 'var(--m-ink-3, #717070)',
                  background: isActive(link.path) ? 'rgba(13,13,13,0.07)' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.path)) {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--m-ink, #0D0D0D)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,13,13,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive(link.path)) {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--m-ink-3, #717070)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto', flexShrink: 0 }}>
            <button
              onClick={onSearchOpen}
              style={iconBtnStyle}
              aria-label="Ara"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,13,13,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--m-ink, #0D0D0D)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--m-ink-3, #717070)'; }}
            >
              <Search size={17} />
            </button>

            <button
              onClick={cycleTheme}
              style={iconBtnStyle}
              aria-label="Tema"
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,13,13,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--m-ink, #0D0D0D)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--m-ink-3, #717070)'; }}
            >
              <ThemeIcon size={16} />
            </button>

            {user ? (
              <button
                onClick={() => navigate('profile')}
                style={iconBtnStyle}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,13,13,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--m-ink, #0D0D0D)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--m-ink-3, #717070)'; }}
              >
                <UserCircle size={18} />
              </button>
            ) : (
              <button
                onClick={() => navigate('login')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--m-ink, #0D0D0D)',
                  background: 'transparent',
                  border: '1.5px solid var(--m-border-strong, #D1CEC6)',
                  borderRadius: 8,
                  padding: '0.4rem 0.875rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--m-ink, #0D0D0D)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(13,13,13,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--m-border-strong, #D1CEC6)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <LogIn size={13} />
                Giriş Yap
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              style={{ ...iconBtnStyle, display: 'none' }}
              className="modern-header-mobile-toggle"
              aria-label="Menü"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid var(--m-border, #E8E5DF)',
            background: 'var(--m-surface, #FFFFFF)',
            padding: '0.75rem 2rem 1rem',
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMobileOpen(false); }}
                  style={{
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    fontWeight: isActive(link.path) ? 700 : 500,
                    color: isActive(link.path) ? 'var(--m-ink, #0D0D0D)' : 'var(--m-ink-3, #717070)',
                    background: isActive(link.path) ? 'rgba(13,13,13,0.06)' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0.625rem 0.875rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 767px) {
          .modern-header-mobile-toggle { display: inline-flex !important; }
          .modern-header-mobile-toggle ~ button { display: none; }
        }
      `}</style>
    </>
  );
}
