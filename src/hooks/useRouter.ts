import { useState, useEffect, useCallback } from 'react';

export type Route =
  | { page: 'home' }
  | { page: 'contents' }
  | { page: 'discover' }
  | { page: 'contact' }
  | { page: 'login' }
  | { page: 'register' }
  | { page: 'profile' }
  | { page: 'writer-dashboard' }
  | { page: 'tag'; id: string }
  | { page: 'article'; id: string }
  | { page: 'series'; id: string }
  | { page: 'author'; id: string }
  | { page: 'admin' }
  | { page: 'admin-articles' }
  | { page: 'admin-articles-drafts' }
  | { page: 'admin-articles-published' }
  | { page: 'admin-article-edit'; id: string }
  | { page: 'admin-article-new' }
  | { page: 'admin-series' }
  | { page: 'admin-series-edit'; id: string }
  | { page: 'admin-series-new' }
  | { page: 'admin-settings' }
  | { page: 'admin-integrations' }
  | { page: 'admin-members' }
  | { page: 'admin-profile' }
  | { page: 'admin-agenda' }
  | { page: 'admin-newsletter' }
  | { page: 'admin-tags' }
  | { page: 'admin-pages' }
  | { page: 'admin-page-new' }
  | { page: 'admin-page-edit'; id: string }
  | { page: 'admin-polls' }
  | { page: 'admin-hero-slides' }
  | { page: 'polls' }
  | { page: 'custom-page'; slug: string };

function parsePath(pathname: string): Route {
  const path = pathname.replace(/^\//, '').replace(/\/$/, '');
  if (!path || path === 'home') return { page: 'home' };
  if (path === 'contents' || path === 'icerikler') return { page: 'contents' };
  if (path === 'discover' || path === 'kesfet') return { page: 'discover' };
  if (path === 'about' || path === 'hakkimda') return { page: 'custom-page', slug: 'hakkimda' };
  if (path === 'contact' || path === 'iletisim') return { page: 'contact' };
  if (path === 'login' || path === 'giris') return { page: 'login' };
  if (path === 'register' || path === 'kayit') return { page: 'register' };
  if (path === 'profile' || path === 'profil') return { page: 'profile' };
  if (path === 'writer-dashboard' || path === 'yazar-paneli') return { page: 'writer-dashboard' };
  if (path === 'admin') return { page: 'admin' };
  if (path === 'admin/articles' || path === 'admin/makaleler') return { page: 'admin-articles' };
  if (path === 'admin/articles/drafts' || path === 'admin/makaleler/taslaklar') return { page: 'admin-articles-drafts' };
  if (path === 'admin/articles/published' || path === 'admin/makaleler/yayinda') return { page: 'admin-articles-published' };
  if (path === 'admin/articles/new' || path === 'admin/makaleler/yeni') return { page: 'admin-article-new' };
  if (path === 'admin/series' || path === 'admin/diziler') return { page: 'admin-series' };
  if (path === 'admin/series/new' || path === 'admin/diziler/yeni') return { page: 'admin-series-new' };
  if (path === 'admin/settings' || path === 'admin/ayarlar') return { page: 'admin-settings' };
  if (path === 'admin/integrations' || path === 'admin/entegrasyonlar') return { page: 'admin-integrations' };
  if (path === 'admin/members' || path === 'admin/uyeler') return { page: 'admin-members' };
  if (path === 'admin/profile' || path === 'admin/profil') return { page: 'admin-profile' };
  if (path === 'admin/agenda' || path === 'admin/ajanda') return { page: 'admin-agenda' };
  if (path === 'admin/newsletter' || path === 'admin/bulten') return { page: 'admin-newsletter' };
  if (path === 'admin/tags') return { page: 'admin-tags' };
  if (path === 'admin/pages' || path === 'admin/sayfalar') return { page: 'admin-pages' };
  if (path === 'admin/pages/new' || path === 'admin/sayfalar/yeni') return { page: 'admin-page-new' };
  if (path === 'admin/polls' || path === 'admin/anketler') return { page: 'admin-polls' };
  if (path === 'admin/hero-slides' || path === 'admin/slider') return { page: 'admin-hero-slides' };
  if (path === 'polls' || path === 'anketler') return { page: 'polls' };
  if (path.startsWith('admin/pages/edit/')) return { page: 'admin-page-edit', id: path.slice(17) };
  if (path.startsWith('admin/articles/edit/')) return { page: 'admin-article-edit', id: path.slice(20) };
  if (path.startsWith('admin/makaleler/duzenle/')) return { page: 'admin-article-edit', id: path.slice(24) };
  if (path.startsWith('admin/series/edit/')) return { page: 'admin-series-edit', id: path.slice(18) };
  if (path.startsWith('admin/diziler/duzenle/')) return { page: 'admin-series-edit', id: path.slice(22) };
  if (path.startsWith('article/')) return { page: 'article', id: path.slice(8) };
  if (path.startsWith('yazi/')) return { page: 'article', id: path.slice(5) };
  if (path.startsWith('series/')) return { page: 'series', id: path.slice(7) };
  if (path.startsWith('dizi/')) return { page: 'series', id: path.slice(5) };
  if (path.startsWith('tag/')) return { page: 'tag', id: path.slice(4) };
  if (path.startsWith('etiket/')) return { page: 'tag', id: path.slice(7) };
  if (path.startsWith('@')) return { page: 'author', id: path.slice(1) };
  if (path.startsWith('author/')) return { page: 'author', id: path.slice(7) };
  if (path.startsWith('yazar/')) return { page: 'author', id: path.slice(6) };
  // Custom pages: any remaining slug is treated as a page slug
  if (path && !path.includes('/')) return { page: 'custom-page', slug: path };
  return { page: 'home' };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parsePath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const path = to.startsWith('/') ? to : `/${to}`;
    window.history.pushState(null, '', path);
    setRoute(parsePath(path));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}
