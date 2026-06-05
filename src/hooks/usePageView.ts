import { useEffect } from 'react';
import type { Route } from './useRouter';

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-pageview`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function getSessionId(): string {
  const key = 'pv_session';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, id);
  }
  return id;
}

const PAGE_TITLES: Record<string, string> = {
  home: 'Ana Sayfa',
  icerikler: 'İçerikler',
  hakkimda: 'Hakkımda',
  iletisim: 'İletişim',
  giris: 'Giriş',
  kayit: 'Kayıt',
  profil: 'Profil',
};

function routeToMeta(route: Route): { page: string; title: string | null; article_id: string | null } {
  switch (route.page) {
    case 'home': return { page: '/', title: 'Ana Sayfa', article_id: null };
    case 'icerikler': return { page: '/icerikler', title: 'İçerikler', article_id: null };
    case 'hakkimda': return { page: '/hakkimda', title: 'Hakkımda', article_id: null };
    case 'iletisim': return { page: '/iletisim', title: 'İletişim', article_id: null };
    case 'giris': return { page: '/giris', title: 'Giriş', article_id: null };
    case 'kayit': return { page: '/kayit', title: 'Kayıt', article_id: null };
    case 'profil': return { page: '/profil', title: 'Profil', article_id: null };
    case 'article':
      return { page: `/makaleler/${route.id}`, title: document.title || null, article_id: route.id };
    case 'series':
      return { page: `/dizi/${route.id}`, title: document.title || null, article_id: null };
    case 'tag':
      return { page: `/etiket/${route.id}`, title: route.id, article_id: null };
    default:
      return { page: `/${route.page}`, title: PAGE_TITLES[route.page] || null, article_id: null };
  }
}

export function usePageView(route: Route) {
  useEffect(() => {
    if (route.page.toString().startsWith('admin')) return;

    const timer = setTimeout(() => {
      const { page, title, article_id } = routeToMeta(route);

      fetch(EDGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
          'Apikey': ANON_KEY,
        },
        body: JSON.stringify({
          page,
          title,
          article_id,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
          language: navigator.language || null,
          screen_width: window.screen.width || null,
          session_id: getSessionId(),
        }),
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [route.page, (route as { id?: string }).id]);
}
