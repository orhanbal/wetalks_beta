import { useState, useEffect } from 'react';
import { Search, Menu, X, Sun, Moon, Monitor, LogIn, CircleUser as UserCircle, Bell } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
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

  const themeIcons: Record<ThemePreference, React.ReactNode> = {
    system: <Monitor size={16} />,
    light: <Sun size={16} />,
    dark: <Moon size={16} />,
  };

  const cycleTheme = () => {
    const order: ThemePreference[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(preference) + 1) % order.length];
    setPreference(next);
  };

  const navLinks = [...NAV_LINKS, ...(showPollsPage ? [{ label: 'Anketler', path: 'polls' }] : [])];
  const isActive = (path: string) => currentPage === path || (path === '' && currentPage === 'home');

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b transition-all duration-200',
          scrolled
            ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm'
            : 'bg-background'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <button
              onClick={() => navigate('')}
              className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
            >
              {activeLogo ? (
                <img src={activeLogo} alt={siteTitle} className="h-7 object-contain" />
              ) : (
                <span className="text-lg font-bold tracking-tight text-foreground">{siteTitle}</span>
              )}
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive(link.path)
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearchOpen}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Ara"
              >
                <Search size={18} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={cycleTheme}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Tema değiştir"
              >
                {themeIcons[preference]}
              </Button>

              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('profile')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <UserCircle size={18} />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('login')}
                  className="hidden sm:flex gap-1.5 text-sm"
                >
                  <LogIn size={14} />
                  Giriş Yap
                </Button>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-muted-foreground"
                onClick={() => setMobileOpen(v => !v)}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-background animate-fade-in">
            <nav className="flex flex-col px-4 py-3 gap-1">
              {navLinks.map(link => (
                <button
                  key={link.path}
                  onClick={() => { navigate(link.path); setMobileOpen(false); }}
                  className={cn(
                    'text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive(link.path)
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  {link.label}
                </button>
              ))}
              {!user && (
                <button
                  onClick={() => { navigate('login'); setMobileOpen(false); }}
                  className="text-left mt-2 px-3 py-2.5 rounded-md text-sm font-medium bg-primary text-primary-foreground"
                >
                  Giriş Yap
                </button>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
