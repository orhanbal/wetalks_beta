import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, UserPlus, LogOut, CircleUser as UserCircle, Search, Home, Newspaper, Tag, Info, Mail, BookOpen, Zap, Star, Globe, ChevronRight, LayoutGrid, Layers, ChevronDown, PenLine, Users, Bell, Flame, BarChart2 } from 'lucide-react';
import type { Series } from '../data/series';
import type { AuthorSummary } from '../hooks/useData';
import { resolveAuthorBadge } from '../lib/writerBadges';
import NotificationPanel from './NotificationPanel';
import { useNotifications } from '../hooks/useNotifications';

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <Home size={14} />,
  newspaper: <Newspaper size={14} />,
  tag: <Tag size={14} />,
  info: <Info size={14} />,
  mail: <Mail size={14} />,
  book: <BookOpen size={14} />,
  zap: <Zap size={14} />,
  star: <Star size={14} />,
  globe: <Globe size={14} />,
  chevron: <ChevronRight size={14} />,
  grid: <LayoutGrid size={14} />,
  layers: <Layers size={14} />,
};
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

function SiteLogo({ title }: { title?: string }) {
  const parts = (title || 'Orhan Balcı').split(' ');
  const firstName = parts[0] ?? 'Orhan';
  const lastName = parts.slice(1).join(' ') || 'Balcı';

  return (
    /* Single SVG containing both the bubble mark and the full wordmark */
    <svg
      width="128" height="35" viewBox="0 0 160 44" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${firstName} ${lastName}`}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* ── BUBBLE MARK (left, 44×44 canvas) ── */}

      {/* Circle outline */}
      <circle cx="20" cy="18" r="15.5" stroke="#0e8fa0" strokeWidth="3" fill="none" />

      {/* Tail — solid teal teardrop pointing down-left */}
      <path
        d="M26 31 C26 35 23 38.5 19.5 40.5 C17.5 41.5 15.5 41 15 39.5 C14.5 38 16 36.8 17.5 36.2 C19.5 35.4 21.5 34 23 32 C24.5 30 25.5 29.2 26 31Z"
        fill="#0e8fa0"
      />
      {/* Tail inner cutout — background colour */}
      <path
        d="M24.2 31.8 C24.2 34.5 22.2 37.2 19.6 38.8 C18.3 39.6 17.4 39.2 17.2 38.2 C17 37.2 18 36.4 19.3 35.7 C21 34.8 22.5 33.4 23.3 31.8Z"
        fill="white"
      />

      {/* Two accent strokes under tail */}
      <line x1="11.5" y1="35" x2="17" y2="33.5" stroke="#0e8fa0" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="10.5" y1="38.5" x2="15.5" y2="37.5" stroke="#0e8fa0" strokeWidth="2" strokeLinecap="round" />

      {/* OB inside circle */}
      <text
        x="20" y="22.5"
        textAnchor="middle"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="800"
        fontSize="13"
        letterSpacing="1.5"
        fill="#22a86e"
      >OB</text>

      {/* ── WORDMARK (right of bubble, baseline-aligned to circle centre) ── */}

      {/* First name — regular weight, dark */}
      <text
        x="48" y="23"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="400"
        fontSize="15"
        letterSpacing="-0.2"
        fill="#111827"
      >{firstName}</text>

      {/* Last name — extra bold, teal */}
      <text
        x="48" y="38"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        fontWeight="800"
        fontSize="15"
        letterSpacing="-0.3"
        fill="#0e8fa0"
      >{lastName}</text>
    </svg>
  );
}

const TAG_COLORS = ['#e53e3e','#dd6b20','#d69e2e','#38a169','#0694a2','#3182ce','#e91e8c','#805ad5'];
function tagColor(path: string): string {
  let h = 0;
  for (let i = 0; i < path.length; i++) h = (h * 31 + path.charCodeAt(i)) >>> 0;
  return TAG_COLORS[h % TAG_COLORS.length];
}

const DEFAULT_NAV: { label: string; path: string; icon?: string }[] = [
  { label: 'Anasayfa', path: 'home', icon: 'home' },
  { label: 'Ayna Ticaret', path: 'tag/ayna-ticaret' },
  { label: 'Operasyon', path: 'tag/operasyon' },
  { label: 'Yapay Zeka', path: 'tag/yapay-zeka' },
  { label: 'Bana Dair', path: 'about' },
];

interface HeaderProps {
  navigate: (to: string) => void;
  currentPage: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  siteTitle?: string;
  menuItems?: { label: string; path: string; icon?: string }[];
  navAlignment?: 'left' | 'center' | 'right';
  onSearchOpen?: () => void;
  seriesList?: Series[];
  authorsList?: AuthorSummary[];
  authorsShowLatest?: boolean;
  authorsLatestDays?: number;
  authorsMenuStyle?: 'dropdown' | 'modal';
  showPollsPage?: boolean;
  navbarBgNormal?: string;
  navbarBgSticky?: string;
  navbarBgNormalDark?: string;
  navbarBgStickyDark?: string;
  tagColorEnabled?: boolean;
}

export default function Header({ navigate, currentPage, logoUrl, logoDarkUrl, siteTitle, menuItems, navAlignment = 'left', onSearchOpen, seriesList = [], authorsList = [], authorsShowLatest = true, authorsLatestDays = 3, authorsMenuStyle = 'dropdown', showPollsPage = true, navbarBgNormal, navbarBgSticky, navbarBgNormalDark, navbarBgStickyDark, tagColorEnabled = true }: HeaderProps) {
  // Track active theme so we can switch logo
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
  const navLinks = menuItems?.length ? menuItems : DEFAULT_NAV;
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [seriesMenuOpen, setSeriesMenuOpen] = useState(false);
  const [authorsMenuOpen, setAuthorsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const seriesHoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const authorsHoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSeriesMenu = () => {
    if (seriesHoverTimeout.current) clearTimeout(seriesHoverTimeout.current);
    setSeriesMenuOpen(true);
  };
  const closeSeriesMenu = () => {
    seriesHoverTimeout.current = setTimeout(() => setSeriesMenuOpen(false), 150);
  };
  const openAuthorsMenu = () => {
    if (authorsHoverTimeout.current) clearTimeout(authorsHoverTimeout.current);
    setAuthorsMenuOpen(true);
  };
  const closeAuthorsMenu = () => {
    if (authorsMenuStyle === 'modal') return; // modal modunda hover ile kapanmaz
    authorsHoverTimeout.current = setTimeout(() => setAuthorsMenuOpen(false), 150);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('reader');
  const { unreadCount } = useNotifications();
  const { user, loading } = useAuth();
  const seriesMenuRef = useRef<HTMLDivElement>(null);
  const seriesBtnRef = useRef<HTMLDivElement>(null);
  const authorsMenuRef = useRef<HTMLDivElement>(null);

  const fetchProfile = () => {
    if (!user) { setAvatarUrl(null); setUserRole('reader'); return; }
    supabase
      .from('profiles')
      .select('avatar_url, full_name, role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setAvatarUrl(data?.avatar_url ?? null);
        setUserRole(data?.role ?? 'reader');
      });
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const handler = () => fetchProfile();
    window.addEventListener('profile-avatar-updated', handler);
    return () => window.removeEventListener('profile-avatar-updated', handler);
  }, [user]);

  const handleNav = (path: string) => {
    if (path === 'home') navigate('');
    else navigate(path);
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    navigate('');
  };

  useEffect(() => {
    return () => {
      if (seriesHoverTimeout.current) clearTimeout(seriesHoverTimeout.current);
      if (authorsHoverTimeout.current) clearTimeout(authorsHoverTimeout.current);
    };
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Hesabım';

  const navbarBgStyle: React.CSSProperties = (() => {
    const normalBg = isDark ? navbarBgNormalDark : navbarBgNormal;
    const stickyBg = isDark ? navbarBgStickyDark : navbarBgSticky;
    const bg = scrolled ? stickyBg : normalBg;
    return bg ? { background: bg } : {};
  })();

  const navStyle: React.CSSProperties =
    navAlignment === 'center'
      ? { position: 'absolute', left: '50%', transform: 'translateX(-50%)' }
      : {};

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} style={navbarBgStyle}>
      <div className={`navbar-inner navbar-inner--${navAlignment}`}>
        <div className="navbar-logo-group">
          <button className="navbar-logo" onClick={() => handleNav('home')}>
            {(() => {
              const activeLogoUrl = (isDark && logoDarkUrl) ? logoDarkUrl : logoUrl;
              return activeLogoUrl ? (
                <img src={activeLogoUrl} alt={siteTitle || 'Logo'} style={{ height: 35, maxWidth: 180, objectFit: 'contain', display: 'block' }} />
              ) : (
                <SiteLogo title={siteTitle} />
              );
            })()}
          </button>

          {authorsList.length > 0 && (
            <>
              <span className="navbar-divider" aria-hidden="true" style={{ marginLeft: '0.75rem', marginRight: '0.25rem' }} />
              <div className="navbar-series-menu" ref={authorsMenuRef}
                onMouseEnter={authorsMenuStyle === 'dropdown' ? openAuthorsMenu : undefined}
                onMouseLeave={authorsMenuStyle === 'dropdown' ? closeAuthorsMenu : undefined}
              >
                <button
                  className={`navbar-series-btn${authorsMenuOpen ? ' navbar-series-btn--open' : ''}`}
                  aria-label="Yazarlar"
                  onClick={authorsMenuStyle === 'modal' ? () => setAuthorsMenuOpen(v => !v) : undefined}
                >
                  <Users size={15} />
                  <span>Yazarlar</span>
                  <ChevronDown size={13} className={`navbar-series-chevron${authorsMenuOpen ? ' navbar-series-chevron--open' : ''}`} />
                </button>

                {authorsMenuStyle === 'dropdown' && authorsMenuOpen && (
                  <div className="navbar-series-dropdown navbar-authors-dropdown">
                    <div className="navbar-series-dropdown-header">Yazarlar</div>
                    {authorsList.map(a => {
                      const url = a.username ? `@${a.username}` : `author/${a.id}`;
                      const initials = a.full_name
                        ? a.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                        : '?';
                      return (
                        <div key={a.id} className="navbar-author-entry">
                          <button
                            className={`navbar-series-item${currentPage === url ? ' navbar-series-item--active' : ''}`}
                            onClick={() => { navigate(url); setAuthorsMenuOpen(false); }}
                          >
                            <div className="navbar-author-avatar">
                              {a.avatar_url
                                ? <img src={a.avatar_url} alt={a.full_name ?? ''} className="navbar-author-avatar-img" />
                                : <span className="navbar-author-avatar-initials">{initials}</span>
                              }
                            </div>
                            <div className="navbar-series-item-body">
                              <span className="navbar-author-name-row">
                                <span className="navbar-series-item-title">{a.full_name}</span>
                                {(() => {
                                  const badge = resolveAuthorBadge(a.total_articles, a.custom_badge, a.role);
                                  return (
                                    <span className="navbar-author-badge" style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}>
                                      {badge.label}
                                    </span>
                                  );
                                })()}
                              </span>
                              {a.title && <span className="navbar-series-item-tagline">{a.title}</span>}
                            </div>
                          </button>
                          {authorsShowLatest && a.latest_article && (() => {
                            const daysDiff = (Date.now() - new Date(a.latest_article!.date).getTime()) / 86400000;
                            return daysDiff <= authorsLatestDays;
                          })() && (
                            <button
                              className="navbar-author-latest"
                              onClick={() => { navigate(`article/${a.latest_article!.id}`); setAuthorsMenuOpen(false); }}
                            >
                              <div className="navbar-author-latest-inner">
                                <div className="navbar-author-latest-text">
                                  <span className="navbar-author-latest-label">Yeni</span>
                                  <span className="navbar-author-latest-title">{a.latest_article.title}</span>
                                </div>
                              </div>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {seriesList.length > 0 && (
            <>
              <span className="navbar-divider" aria-hidden="true" style={{ marginLeft: '0.75rem', marginRight: '0.25rem' }} />
              <div className="navbar-series-menu" ref={seriesBtnRef}
                onMouseEnter={openSeriesMenu}
                onMouseLeave={closeSeriesMenu}
              >
                <button
                  className={`navbar-series-btn${seriesMenuOpen ? ' navbar-series-btn--open' : ''}`}
                  aria-label="Yazı Dizileri"
                >
                  <BookOpen size={15} />
                  <span>Yazı Dizileri</span>
                  <ChevronDown size={13} className={`navbar-series-chevron${seriesMenuOpen ? ' navbar-series-chevron--open' : ''}`} />
                </button>
              </div>
            </>
          )}
        </div>

        {seriesMenuOpen && seriesList.length > 0 && (
          <div className="navbar-series-megamenu" ref={seriesMenuRef}
            onMouseEnter={openSeriesMenu}
            onMouseLeave={closeSeriesMenu}
          >
            <div className="navbar-series-megamenu-header">
              <span className="navbar-series-megamenu-title">Yazı Dizileri</span>
              <button
                className="navbar-series-megamenu-showall"
                onClick={() => { navigate('series'); setSeriesMenuOpen(false); }}
              >
                Tümünü Gör <ChevronRight size={13} />
              </button>
            </div>
            <div className="navbar-series-megamenu-grid">
              {seriesList.map(s => (
                <button
                  key={s.id}
                  className={`navbar-series-megacard${currentPage === `series/${s.id}` ? ' navbar-series-megacard--active' : ''}`}
                  onClick={() => { navigate(`series/${s.id}`); setSeriesMenuOpen(false); }}
                >
                  <div className="navbar-series-megacard-img">
                    {s.ogImage
                      ? <img src={s.ogImage} alt={s.title} />
                      : <BookOpen size={22} />
                    }
                  </div>
                  <div className="navbar-series-megacard-body">
                    <span className="navbar-series-megacard-title">{s.title}</span>
                    {s.authorName && (
                      <span className="navbar-series-megacard-author">
                        <span className="navbar-series-megacard-avatar">
                          {s.authorAvatar
                            ? <img src={s.authorAvatar} alt={s.authorName} />
                            : <span>{s.authorName.charAt(0)}</span>
                          }
                        </span>
                        {s.authorName}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <nav className="navbar-nav" style={navStyle}>
          {navLinks.map((link) => {
            const isActive = currentPage === link.path || (link.path.startsWith('tag/') && currentPage === link.path);
            const icon = link.icon ? ICON_MAP[link.icon] : null;
            const isTag = link.path.startsWith('tag/');
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`navbar-link${isTag ? ' navbar-link-tag' : ''} ${isActive ? 'navbar-link-active' : ''}`}
              >
                {icon && <span className="navbar-link-icon">{icon}</span>}
                <span>{isTag ? <><span style={{ fontStyle: 'normal', ...(tagColorEnabled ? { color: tagColor(link.path) } : {}) }}>#</span>{link.label.replace(/^#+/, '')}</> : link.label}</span>
              </button>
            );
          })}
        </nav>

        {!loading && (
          <div className="navbar-auth">
            <button className="navbar-search-btn" onClick={onSearchOpen} aria-label="Ara">
              <Search size={18} />
            </button>
            <button className="navbar-search-btn" onClick={() => navigate('discover')} aria-label="Keşfet" title="Keşfet">
              <Flame size={18} fill="#ef4444" color="#ef4444" />
            </button>
            {showPollsPage && (
              <button
                className="navbar-search-btn"
                onClick={() => navigate('polls')}
                aria-label="Anketler"
                title="Anketler"
                style={{ color: currentPage === 'polls' ? 'var(--accent, #c8f542)' : undefined }}
              >
                <BarChart2 size={18} />
              </button>
            )}
            <span className="navbar-divider" aria-hidden="true" />
            {user ? (
              <div className="user-menu-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ position: 'relative' }}>
                  <button
                    className="navbar-search-btn"
                    onClick={() => setNotifOpen(v => !v)}
                    aria-label="Bildirimler"
                    style={{ position: 'relative' }}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute', top: 2, right: 2,
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#ef4444', border: '1.5px solid #fff',
                      }} />
                    )}
                  </button>
                  {notifOpen && (
                    <NotificationPanel
                      onClose={() => setNotifOpen(false)}
                      navigate={(to) => { navigate(to); setNotifOpen(false); }}
                    />
                  )}
                </div>
                <button
                  className="user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="user-avatar user-avatar-img" />
                  ) : (
                    <div className="user-avatar">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-menu-name">{displayName}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="user-menu-overlay" onClick={() => setUserMenuOpen(false)} />
                    <div className="user-menu-dropdown">
                      <div className="user-menu-email">{user.email}</div>
                      <div className="user-menu-divider" />
                      <button className="user-menu-item" onClick={() => { setUserMenuOpen(false); navigate('profile'); }}>
                        <UserCircle size={15} />
                        Profilim
                      </button>
                      {['author', 'editor', 'admin'].includes(userRole) && (
                        <button className="user-menu-item" onClick={() => { setUserMenuOpen(false); navigate('writer-dashboard'); }}>
                          <PenLine size={15} />
                          Yazar Paneli
                        </button>
                      )}
                      <div className="user-menu-divider" />
                      <button className="user-menu-item user-menu-item-danger" onClick={handleLogout}>
                        <LogOut size={15} />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="navbar-auth-btns">
                <button className="navbar-login-btn" onClick={() => handleNav('login')}>
                  <LogIn size={15} />
                  Giriş Yap
                </button>
                <button className="navbar-register-btn" onClick={() => handleNav('kayit')}>
                  <UserPlus size={15} />
                  Kayıt Ol
                </button>
              </div>
            )}
          </div>
        )}

        <button
          className="navbar-mobile-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-nav-dropdown">
          {navLinks.map((link) => {
            const isTag = link.path.startsWith('tag/');
            return (
              <button
                key={link.path}
                onClick={() => handleNav(link.path)}
                className={`mobile-nav-link ${currentPage === link.path ? 'mobile-nav-link-active' : ''}`}
              >
                {isTag
                  ? <><span style={{ fontStyle: 'normal', ...(tagColorEnabled ? { color: tagColor(link.path) } : {}) }}>#</span>{link.label.replace(/^#+/, '')}</>
                  : link.label}
              </button>
            );
          })}
          <div className="mobile-nav-divider" />
          {user ? (
            <button className="mobile-nav-link mobile-nav-link-danger" onClick={handleLogout}>
              <LogOut size={15} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Çıkış Yap
            </button>
          ) : (
            <>
              <button className="mobile-nav-link" onClick={() => handleNav('login')}>
                <LogIn size={15} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Giriş Yap
              </button>
              <button className="mobile-nav-link" onClick={() => handleNav('kayit')}>
                <UserPlus size={15} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Kayıt Ol
              </button>
            </>
          )}
        </div>
      )}

      {/* Yazarlar modal paneli */}
      {authorsMenuStyle === 'modal' && authorsMenuOpen && (
        <div
          className="authors-modal-overlay"
          onClick={e => { if (e.target === e.currentTarget) setAuthorsMenuOpen(false); }}
        >
          <div className="authors-modal-panel">
            <div className="authors-modal-header">
              <span className="authors-modal-title">
                <Users size={16} />
                Yazarlar
              </span>
              <button className="authors-modal-close" onClick={() => setAuthorsMenuOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="authors-modal-list">
              {authorsList.map(a => {
                const url = a.username ? `@${a.username}` : `author/${a.id}`;
                const initials = a.full_name
                  ? a.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  : '?';
                const badge = resolveAuthorBadge(a.total_articles, a.custom_badge, a.role);
                return (
                  <div key={a.id} className="authors-modal-entry">
                    <button
                      className={`authors-modal-author${currentPage === url ? ' authors-modal-author--active' : ''}`}
                      onClick={() => { navigate(url); setAuthorsMenuOpen(false); }}
                    >
                      <div className="authors-modal-avatar">
                        {a.avatar_url
                          ? <img src={a.avatar_url} alt={a.full_name ?? ''} />
                          : <span className="authors-modal-avatar-initials">{initials}</span>
                        }
                      </div>
                      <div className="authors-modal-info">
                        <span className="authors-modal-name-row">
                          <span className="authors-modal-name">{a.full_name}</span>
                          <span className="authors-modal-badge" style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}>
                            {badge.label}
                          </span>
                        </span>
                        {a.title && <span className="authors-modal-role">{a.title}</span>}
                      </div>
                    </button>
                    {authorsShowLatest && a.latest_article && (() => {
                      const daysDiff = (Date.now() - new Date(a.latest_article!.date).getTime()) / 86400000;
                      return daysDiff <= authorsLatestDays;
                    })() && (
                      <button
                        className="authors-modal-latest"
                        onClick={() => { navigate(`article/${a.latest_article!.id}`); setAuthorsMenuOpen(false); }}
                      >
                        <span className="authors-modal-latest-label">Yeni</span>
                        <span className="authors-modal-latest-title">{a.latest_article.title}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
