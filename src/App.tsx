import { useEffect, useState } from 'react';
import { useRouter } from './hooks/useRouter';
import { useArticles, useSeries, useSiteSettings, useAuthors } from './hooks/useData';
import { usePageView } from './hooks/usePageView';
import Header from './components/Header';
import SearchModal from './components/SearchModal';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import IceriklerPage from './pages/IceriklerPage';
import IletisimPage from './pages/IletisimPage';
import ArticlePage from './pages/ArticlePage';
import SeriesPage from './pages/SeriesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import WriterDashboard from './pages/WriterDashboard';
import AdminApp from './admin/AdminApp';
import TagPage from './pages/TagPage';
import AuthorPage from './pages/AuthorPage';
import CustomPage from './pages/CustomPage';
import NewArticlesBanner from './components/NewArticlesBanner';
import PollsPage from './pages/PollsPage';

// Modern theme imports
import ModernHeader from './themes/modern/ModernHeader';
import ModernFooter from './themes/modern/ModernFooter';
import ModernHomePage from './themes/modern/ModernHomePage';
import ModernContentsPage from './themes/modern/ModernContentsPage';
import ModernTagPage from './themes/modern/ModernTagPage';
import ModernAuthorPage from './themes/modern/ModernAuthorPage';
import ModernSeriesListPage from './themes/modern/ModernSeriesListPage';

function parseMenuOrder(json: string | undefined): { id: string; hidden: boolean }[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

export default function App() {
  const { route, navigate } = useRouter();
  const { articles, loading: articlesLoading } = useArticles();
  const { seriesList, loading: seriesLoading } = useSeries();
  const { authors } = useAuthors();
  const { settings } = useSiteSettings();
  const [searchOpen, setSearchOpen] = useState(false);
  usePageView(route);

  const isModern = settings['site_style'] === 'modern';

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const accent = settings['accent_color'];
    if (accent) {
      document.documentElement.style.setProperty('--accent', accent);
      document.documentElement.style.setProperty('--accent-hover', accent);
    }
  }, [settings]);

  useEffect(() => {
    const useShadows = settings['use_shadows'] !== 'false';
    document.documentElement.setAttribute('data-shadows', useShadows ? 'true' : 'false');
    const bannerShadow = settings['banner_shadow'] !== 'false';
    document.documentElement.setAttribute('data-banner-shadow', bannerShadow ? 'true' : 'false');
  }, [settings['use_shadows'], settings['banner_shadow']]);

  // Apply site_style attribute for CSS targeting
  useEffect(() => {
    const style = settings['site_style'] ?? 'classic';
    document.documentElement.setAttribute('data-site-style', style);
  }, [settings['site_style']]);

  useEffect(() => {
    const font = settings['site_font'];
    const fontName = font && font.trim() ? font.trim() : 'Inter';
    const fontStack = `'${fontName}', sans-serif`;

    if (fontName !== 'Inter') {
      const id = `__gfont_${fontName.replace(/\s+/g, '_')}__`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        const encoded = fontName.replace(/\s+/g, '+');
        link.href = `https://fonts.googleapis.com/css2?family=${encoded}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700&display=swap`;
        document.head.appendChild(link);
      }
    }

    document.documentElement.style.setProperty('--site-font', fontStack);
    document.body.style.fontFamily = fontStack;

    const styleId = '__site_font_override__';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `*, *::before, *::after { font-family: ${fontStack} !important; }
      code, pre, kbd, samp, .code-block, [class*="code"], [style*="monospace"], [style*="JetBrains"], [style*="Fira Code"] { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }`;
  }, [settings['site_font']]);

  useEffect(() => {
    const faviconUrl = settings['favicon_url'];
    if (!faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
    const ext = faviconUrl.split('.').pop()?.toLowerCase();
    link.type = ext === 'svg' ? 'image/svg+xml' : ext === 'png' ? 'image/png' : ext === 'ico' ? 'image/x-icon' : 'image/png';
  }, [settings['favicon_url']]);

  useEffect(() => {
    const code = settings['code_injection_header'];
    if (!code) return;
    const id = '__site_head_injection__';
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const container = document.createElement('div');
    container.id = id;
    container.innerHTML = code;
    Array.from(container.childNodes).forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'SCRIPT') {
          const s = document.createElement('script');
          Array.from(el.attributes).forEach(a => s.setAttribute(a.name, a.value));
          s.textContent = el.textContent;
          document.head.appendChild(s);
        } else {
          document.head.appendChild(el.cloneNode(true));
        }
      }
    });
  }, [settings['code_injection_header']]);

  useEffect(() => {
    const code = settings['code_injection_footer'];
    if (!code) return;
    const id = '__site_footer_injection__';
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const container = document.createElement('div');
    container.id = id;
    container.innerHTML = code;
    Array.from(container.childNodes).forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'SCRIPT') {
          const s = document.createElement('script');
          Array.from(el.attributes).forEach(a => s.setAttribute(a.name, a.value));
          s.textContent = el.textContent;
          document.body.appendChild(s);
        } else {
          document.body.appendChild(el.cloneNode(true));
        }
      }
    });
  }, [settings['code_injection_footer']]);

  const isAdmin = route.page.toString().startsWith('admin');

  if (isAdmin) {
    return <AdminApp route={route} navigate={navigate} />;
  }

  const currentPage = (route.page === 'article' || route.page === 'series' || route.page === 'login' || route.page === 'register' || route.page === 'profile')
    ? route.page
    : route.page === 'tag'
      ? `tag/${(route as { page: 'tag'; id: string }).id}`
      : route.page;
  const loading = articlesLoading || seriesLoading;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#888', fontSize: '0.9rem' }}>
        Yükleniyor...
      </div>
    );
  }

  // ── Modern theme render ──────────────────────────────────────
  if (isModern) {
    return (
      <div className="site-wrapper" data-site-style="modern">
        <ModernHeader
          navigate={navigate}
          currentPage={currentPage}
          logoUrl={settings['logo_url']}
          logoDarkUrl={settings['logo_url_dark']}
          siteTitle={settings['site_title']}
          onSearchOpen={() => setSearchOpen(true)}
          showPollsPage={settings['show_polls_page'] !== 'false'}
          settings={settings}
        />
        {searchOpen && (
          <SearchModal
            articles={articles}
            seriesList={seriesList}
            navigate={navigate}
            onClose={() => setSearchOpen(false)}
          />
        )}

        <div className="main-content">
          {route.page === 'home' && (
            <ModernHomePage navigate={navigate} articles={articles} seriesList={seriesList} settings={settings} />
          )}
          {route.page === 'contents' && (
            <ModernContentsPage navigate={navigate} articles={articles} seriesList={seriesList} />
          )}
          {route.page === 'discover' && (
            <DiscoverPage navigate={navigate} articles={articles} seriesList={seriesList} />
          )}
          {route.page === 'contact' && <IletisimPage settings={settings} />}
          {route.page === 'login' && <LoginPage navigate={navigate} />}
          {route.page === 'register' && <RegisterPage navigate={navigate} />}
          {route.page === 'profile' && <ProfilePage navigate={navigate} articles={articles} seriesList={seriesList} />}
          {route.page === 'writer-dashboard' && <WriterDashboard navigate={navigate} articles={articles} seriesList={seriesList} />}
          {route.page === 'article' && (
            <ArticlePage id={route.id} navigate={navigate} articles={articles} seriesList={seriesList} />
          )}
          {route.page === 'series' && (
            <SeriesPage id={route.id} navigate={navigate} articles={articles} seriesList={seriesList} />
          )}
          {route.page === 'tag' && (
            <ModernTagPage id={route.id} navigate={navigate} articles={articles} seriesList={seriesList} />
          )}
          {route.page === 'author' && (
            <ModernAuthorPage id={route.id} navigate={navigate} articles={articles} seriesList={seriesList} />
          )}
          {route.page === 'polls' && <PollsPage />}
          {route.page === 'custom-page' && <CustomPage slug={route.slug} navigate={navigate} />}

          <ModernFooter navigate={navigate} settings={settings} />
        </div>
      </div>
    );
  }

  // ── Classic theme render ─────────────────────────────────────
  return (
    <div className="site-wrapper">
      <Header
        navigate={navigate}
        currentPage={currentPage}
        logoUrl={settings['logo_url']}
        logoDarkUrl={settings['logo_url_dark']}
        siteTitle={settings['site_title']}
        menuItems={settings['menu_items'] ? (() => { try { return JSON.parse(settings['menu_items']); } catch { return undefined; } })() : undefined}
        navAlignment={(settings['nav_alignment'] as 'left' | 'center' | 'right') || 'left'}
        onSearchOpen={() => setSearchOpen(true)}
        seriesList={settings['series_menu_enabled'] !== 'false' ? seriesList : []}
        showPollsPage={settings['show_polls_page'] !== 'false'}
        authorsList={(() => {
          const order = parseMenuOrder(settings['authors_menu_order']);
          if (!order.length) return authors;
          const map = new Map(authors.map(a => [a.id, a]));
          const result = order.filter(o => !o.hidden).map(o => map.get(o.id)).filter(Boolean) as typeof authors;
          authors.forEach(a => { if (!order.find(o => o.id === a.id)) result.push(a); });
          return result;
        })()}
        authorsShowLatest={settings['authors_show_latest'] !== 'false'}
        authorsLatestDays={settings['authors_latest_days'] ? parseInt(settings['authors_latest_days']) : 3}
        authorsMenuStyle={(settings['authors_menu_style'] as 'dropdown' | 'modal') || 'dropdown'}
        navbarBgNormal={settings['navbar_bg_normal']}
        navbarBgSticky={settings['navbar_bg_sticky']}
        navbarBgNormalDark={settings['navbar_bg_normal_dark']}
        navbarBgStickyDark={settings['navbar_bg_sticky_dark']}
        tagColorEnabled={settings['tag_color_enabled'] !== 'false'}
      />
      {searchOpen && (
        <SearchModal
          articles={articles}
          seriesList={seriesList}
          navigate={navigate}
          onClose={() => setSearchOpen(false)}
        />
      )}
      {settings['show_new_articles_banner'] !== 'false' && <NewArticlesBanner articles={articles} navigate={navigate} bgColor={settings['banner_bg']} bgColorDark={settings['banner_bg_dark']} />}

      <div className="main-content">
        {route.page === 'home' && <HomePage navigate={navigate} articles={articles} seriesList={seriesList} settings={settings} />}
        {route.page === 'contents' && <IceriklerPage navigate={navigate} articles={articles} seriesList={seriesList} />}
        {route.page === 'discover' && <DiscoverPage navigate={navigate} articles={articles} seriesList={seriesList} />}
        {route.page === 'contact' && <IletisimPage settings={settings} />}
        {route.page === 'login' && <LoginPage navigate={navigate} />}
        {route.page === 'register' && <RegisterPage navigate={navigate} />}
        {route.page === 'profile' && <ProfilePage navigate={navigate} articles={articles} seriesList={seriesList} />}
        {route.page === 'writer-dashboard' && <WriterDashboard navigate={navigate} articles={articles} seriesList={seriesList} />}
        {route.page === 'article' && <ArticlePage id={route.id} navigate={navigate} articles={articles} seriesList={seriesList} />}
        {route.page === 'series' && <SeriesPage id={route.id} navigate={navigate} articles={articles} seriesList={seriesList} />}
        {route.page === 'tag' && <TagPage id={route.id} navigate={navigate} articles={articles} seriesList={seriesList} />}
        {route.page === 'author' && <AuthorPage id={route.id} navigate={navigate} articles={articles} seriesList={seriesList} />}
        {route.page === 'polls' && <PollsPage />}
        {route.page === 'custom-page' && <CustomPage slug={route.slug} navigate={navigate} />}

        <Footer navigate={navigate} settings={settings} />
      </div>
    </div>
  );
}
