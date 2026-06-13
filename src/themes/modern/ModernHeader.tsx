import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, Sun, Moon, Monitor, BookOpen, ChevronDown, ChevronRight, Bell, LogOut, LogIn, UserPlus, CircleUser as UserCircle, PenLine, Flame, BarChart2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDarkMode, type ThemePreference } from '../../hooks/useDarkMode';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationPanel from '../../components/NotificationPanel';
import { supabase } from '../../lib/supabase';
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
  menuItems?: { label: string; path: string; icon?: string }[];
}

const DEFAULT_NAV = [
  { label: 'Anasayfa', path: '' },
  { label: 'Yazılar', path: 'contents' },
  { label: 'Seriler', path: 'series' },
  { label: 'Keşfet', path: 'discover' },
];

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
    const sync = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

export default function ModernHeader({
  navigate, currentPage, logoUrl, logoDarkUrl, siteTitle = 'Site',
  onSearchOpen, showPollsPage, settings = {}, menuItems, seriesList = [],
}: ModernHeaderProps) {
  const { user, loading } = useAuth();
  const siteDefault = (settings['default_theme'] as ThemePreference) || 'system';
  const { preference, setPreference } = useDarkMode(siteDefault);
  const { unreadCount } = useNotifications();
  const isDark = useIsDark();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [seriesMenuOpen, setSeriesMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('reader');

  const seriesHoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeLogo = isDark && logoDarkUrl ? logoDarkUrl : logoUrl;
  const navLinks = menuItems?.length ? menuItems : DEFAULT_NAV;
  const isActive = (path: string) => currentPage === path || (path === '' && currentPage === '');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const fetchProfile = () => {
    if (!user) { setAvatarUrl(null); setUserRole('reader'); return; }
    supabase.from('profiles').select('avatar_url, role').eq('id', user.id).maybeSingle()
      .then(({ data }) => { setAvatarUrl(data?.avatar_url ?? null); setUserRole(data?.role ?? 'reader'); });
  };

  useEffect(() => { fetchProfile(); }, [user]);
  useEffect(() => {
    const h = () => fetchProfile();
    window.addEventListener('profile-avatar-updated', h);
    return () => window.removeEventListener('profile-avatar-updated', h);
  }, [user]);

  useEffect(() => () => {
    if (seriesHoverTimeout.current) clearTimeout(seriesHoverTimeout.current);
  }, []);

  const handleNav = (path: string) => { navigate(path === 'home' ? '' : path); setMobileOpen(false); setUserMenuOpen(false); };
  const handleLogout = async () => { await supabase.auth.signOut(); setUserMenuOpen(false); navigate(''); };

  const cycleTheme = () => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    setPreference(order[(order.indexOf(preference) + 1) % order.length]);
  };
  const ThemeIcon = preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor;

  const openSeries = () => { if (seriesHoverTimeout.current) clearTimeout(seriesHoverTimeout.current); setSeriesMenuOpen(true); };
  const closeSeries = () => { seriesHoverTimeout.current = setTimeout(() => setSeriesMenuOpen(false), 150); };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Hesabım';

  const ink = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,15,20,0.9)';
  const ink2 = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,15,20,0.5)';
  const bg = scrolled
    ? (isDark ? 'rgba(5,11,21,0.92)' : 'rgba(248,247,244,0.96)')
    : 'transparent';
  const border = scrolled
    ? `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`
    : '1px solid transparent';

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: bg,
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: border,
        transition: 'background 0.35s, border-color 0.35s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', height: 72, display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

          {/* Left: Logo + Series dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            <button
              onClick={() => handleNav('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {activeLogo ? (
                <img src={activeLogo} alt={siteTitle} style={{ height: 40, objectFit: 'contain' }} />
              ) : (
                <span className="modern-logo-text">{siteTitle}</span>
              )}
            </button>

            {seriesList.length > 0 && (
              <>
                <span style={{ width: 1, height: 18, background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', margin: '0 0.5rem', flexShrink: 0 }} />
                <div
                  style={{ position: 'relative' }}
                  onMouseEnter={openSeries}
                  onMouseLeave={closeSeries}
                >
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0.375rem 0.625rem', borderRadius: 8,
                    fontSize: '0.82rem', fontWeight: 600, color: ink,
                    fontFamily: 'inherit', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <BookOpen size={14} />
                    <span>Yazı Dizileri</span>
                    <ChevronDown size={12} style={{ transform: seriesMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Series megamenu */}
          {seriesMenuOpen && seriesList.length > 0 && (
            <div
              onMouseEnter={openSeries}
              onMouseLeave={closeSeries}
              style={{
                position: 'fixed', top: 72, left: 0, right: 0, zIndex: 200,
                background: isDark ? 'rgba(10,14,26,0.97)' : 'rgba(250,249,247,0.98)',
                backdropFilter: 'blur(24px)',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                padding: '1.5rem 2rem',
                boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(0,0,0,0.12)',
              }}
            >
              <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: ink2 }}>Yazı Dizileri</span>
                  <button
                    onClick={() => { navigate('series'); setSeriesMenuOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: '#8B5CF6', fontFamily: 'inherit' }}
                  >
                    Tümünü Gör <ChevronRight size={13} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {seriesList.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { navigate(`series/${s.id}`); setSeriesMenuOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: currentPage === `series/${s.id}`
                          ? (isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)')
                          : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                        textAlign: 'left', fontFamily: 'inherit',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = currentPage === `series/${s.id}` ? (isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'))}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {s.ogImage ? <img src={s.ogImage} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BookOpen size={18} color={ink2} />}
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: ink, lineHeight: 1.3 }}>{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Center: Nav links */}
          <nav className="modern-nav" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {navLinks.map(link => {
              const path = link.path === 'home' ? '' : link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`modern-nav-btn${isActive(path) ? ' modern-nav-btn--active' : ''}`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right controls */}
          {!loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
              {/* Search */}
              <button onClick={onSearchOpen} className="modern-search-btn">
                <Search size={14} />
                <span className="modern-search-label">Ara...</span>
              </button>

              {/* Keşfet */}
              <button
                onClick={() => navigate('discover')}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 9,
                  background: 'none', border: 'none', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                title="Keşfet"
              >
                <Flame size={17} fill="#ef4444" color="#ef4444" />
              </button>

              {/* Polls */}
              {showPollsPage && (
                <button
                  onClick={() => navigate('polls')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: 9,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: currentPage === 'polls' ? '#8B5CF6' : ink2,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  title="Anketler"
                >
                  <BarChart2 size={17} />
                </button>
              )}

              {/* Theme toggle */}
              <button onClick={cycleTheme} className="modern-theme-btn">
                <ThemeIcon size={15} />
              </button>

              {/* Divider */}
              <span style={{ width: 1, height: 20, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)', margin: '0 0.125rem', flexShrink: 0 }} />

              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {/* Notifications */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setNotifOpen(v => !v)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 36, height: 36, borderRadius: 9, position: 'relative',
                        background: 'none', border: 'none', cursor: 'pointer', color: ink2,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      title="Bildirimler"
                    >
                      <Bell size={17} />
                      {unreadCount > 0 && (
                        <span style={{
                          position: 'absolute', top: 6, right: 6,
                          width: 7, height: 7, borderRadius: '50%',
                          background: '#ef4444', border: '1.5px solid',
                          borderColor: isDark ? '#050b15' : '#f8f7f4',
                        }} />
                      )}
                    </button>
                    {notifOpen && (
                      <NotificationPanel
                        onClose={() => setNotifOpen(false)}
                        navigate={to => { navigate(to); setNotifOpen(false); }}
                      />
                    )}
                  </div>

                  {/* User avatar + dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setUserMenuOpen(v => !v)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: 10, padding: '0.3rem 0.625rem 0.3rem 0.3rem',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#8B5CF6')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)')}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" style={{ width: 26, height: 26, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                        }}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: ink, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayName}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setUserMenuOpen(false)} />
                        <div style={{
                          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
                          minWidth: 200, borderRadius: 12,
                          background: isDark ? 'rgba(12,16,28,0.97)' : 'rgba(255,255,255,0.98)',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                          boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.6)' : '0 16px 40px rgba(0,0,0,0.14)',
                          backdropFilter: 'blur(20px)',
                          padding: '0.5rem',
                          overflow: 'hidden',
                        }}>
                          <div style={{ padding: '0.5rem 0.75rem 0.625rem', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, marginBottom: '0.375rem' }}>
                            <span style={{ fontSize: '0.75rem', color: ink2, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                          </div>
                          {[
                            { icon: <UserCircle size={14} />, label: 'Profilim', path: 'profile' },
                            ...(['author', 'editor', 'admin'].includes(userRole) ? [{ icon: <PenLine size={14} />, label: 'Yazar Paneli', path: 'writer-dashboard' }] : []),
                          ].map(item => (
                            <button
                              key={item.path}
                              onClick={() => { setUserMenuOpen(false); navigate(item.path); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%',
                                padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: 'none', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500, color: ink,
                                textAlign: 'left', transition: 'background 0.12s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                            >
                              {item.icon}{item.label}
                            </button>
                          ))}
                          <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', margin: '0.375rem 0' }} />
                          <button
                            onClick={handleLogout}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%',
                              padding: '0.5rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                              background: 'none', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 500, color: '#ef4444',
                              textAlign: 'left', transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                          >
                            <LogOut size={14} />Çıkış Yap
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <button onClick={() => navigate('login')} className="modern-login-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <LogIn size={14} />Giriş Yap
                  </button>
                  <button
                    onClick={() => navigate('register')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      height: 36, padding: '0 1rem',
                      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: '#fff',
                      border: 'none', borderRadius: 9,
                      fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'inherit', whiteSpace: 'nowrap',
                      boxShadow: '0 2px 12px rgba(139,92,246,0.3)',
                      transition: 'filter 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
                    onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                  >
                    <UserPlus size={14} />Kayıt Ol
                  </button>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="modern-hamburger modern-login-btn"
                style={{ display: 'none', width: 36, padding: 0, alignItems: 'center', justifyContent: 'center' }}
              >
                {mobileOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="modern-mobile-drawer">
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', marginBottom: '1rem' }}>
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => { handleNav(link.path); setMobileOpen(false); }}
                  className={`modern-nav-btn${isActive(link.path === 'home' ? '' : link.path) ? ' modern-nav-btn--active' : ''}`}
                  style={{ textAlign: 'left', padding: '0.625rem 0.5rem' }}
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {user ? (
                <button onClick={() => { navigate('profile'); setMobileOpen(false); }} className="modern-login-btn" style={{ flex: 1, height: 42 }}>
                  Profilim
                </button>
              ) : (
                <>
                  <button onClick={() => { navigate('login'); setMobileOpen(false); }} className="modern-login-btn" style={{ flex: 1, height: 42 }}>
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => { navigate('register'); setMobileOpen(false); }}
                    style={{ flex: 1, height: 42, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', border: 'none', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Kayıt Ol
                  </button>
                </>
              )}
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
