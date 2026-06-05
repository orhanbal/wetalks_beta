import { Component, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Route } from '../hooks/useRouter';

class AdminErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Bir hata oluştu</h2>
          <pre style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', fontSize: '0.8125rem', color: '#374151', overflowX: 'auto' }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#111', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}
          >
            Tekrar dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { useArticles, useSeries } from '../hooks/useData';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminArticles from './AdminArticles';
import AdminArticleEdit from './AdminArticleEdit';
import AdminSeries from './AdminSeries';
import AdminSeriesEdit from './AdminSeriesEdit';
import AdminSettings from './AdminSettings';
import AdminProfile from './AdminProfile';
import AdminIntegrations from './AdminIntegrations';
import AdminMembers from './AdminMembers';
import AdminNewsletter from './AdminNewsletter';
import AdminTags from './AdminTags';
import AdminPages from './AdminPages';
import AdminPageEdit from './AdminPageEdit';
import AdminPolls from './AdminPolls';
import AdminHeroSlides from './AdminHeroSlides';
import AgendaPage from '../pages/AgendaPage';

interface AdminAppProps {
  route: Route;
  navigate: (to: string) => void;
}

const ALLOWED_ROLES = ['author', 'editor', 'admin'] as const;
type AllowedRole = typeof ALLOWED_ROLES[number];

export default function AdminApp({ route, navigate }: AdminAppProps) {
  const { articles } = useArticles();
  const { seriesList } = useSeries();
  const [session, setSession] = useState<unknown>(null);
  const [userRole, setUserRole] = useState<string>('reader');
  const [userId, setUserId] = useState<string>('');
  const [checking, setChecking] = useState(true);
  const [siteTitle, setSiteTitle] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'site_title').maybeSingle().then(({ data }) => {
      if (data?.value) setSiteTitle(data.value);
    });
  }, []);

  const fetchRole = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', uid)
      .maybeSingle();
    return data?.role ?? 'reader';
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      setSession(s);
      if (s?.user) {
        setUserId(s.user.id);
        const role = await fetchRole(s.user.id);
        setUserRole(role);
      }
      setChecking(false);
    });

    supabase.auth.onAuthStateChange((_event, s) => {
      (async () => {
        setSession(s);
        if (s?.user) {
          setUserId(s.user.id);
          const role = await fetchRole(s.user.id);
          setUserRole(role);
        } else {
          setUserRole('reader');
          setUserId('');
        }
      })();
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('');
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#888' }}>
        Yükleniyor...
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={async () => {
      const { data } = await supabase.auth.getSession();
      const s = data.session;
      setSession(s);
      if (s?.user) {
        setUserId(s.user.id);
        const role = await fetchRole(s.user.id);
        setUserRole(role);
      }
    }} />;
  }

  if (!(ALLOWED_ROLES as readonly string[]).includes(userRole)) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif', background: '#f8f9fa',
      }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '2.5rem', maxWidth: 400, width: '100%',
          border: '1px solid #e5e7eb', textAlign: 'center',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: '#fef2f2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', margin: '0 0 0.5rem' }}>Erişim Reddedildi</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            Bu alana erişmek için yazar, editör veya admin rolüne sahip olmanız gerekiyor.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('profile')}
              style={{
                background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8,
                padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Profil
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: '#111', color: '#fff', border: 'none', borderRadius: 8,
                padding: '0.65rem 1.25rem', fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const role = userRole as AllowedRole;

  const currentPath = (() => {
    if (route.page === 'admin') return 'admin';
    if (route.page === 'admin-articles-drafts') return 'admin/articles/drafts';
    if (route.page === 'admin-articles-published') return 'admin/articles/published';
    if (route.page === 'admin-articles' || route.page === 'admin-article-edit' || route.page === 'admin-article-new') return 'admin/articles';
    if (route.page === 'admin-series' || route.page === 'admin-series-edit' || route.page === 'admin-series-new') return 'admin/series';
    if (route.page === 'admin-settings') return 'admin/settings';
    if (route.page === 'admin-integrations') return 'admin/integrations';
    if (route.page === 'admin-members') return 'admin/members';
    if (route.page === 'admin-profile') return 'admin/profile';
    if (route.page === 'admin-agenda') return 'admin/agenda';
    if (route.page === 'admin-newsletter') return 'admin/newsletter';
    if (route.page === 'admin-tags') return 'admin/tags';
    if (route.page === 'admin-pages' || route.page === 'admin-page-new' || route.page === 'admin-page-edit') return 'admin/pages';
    if (route.page === 'admin-polls') return 'admin/polls';
    if (route.page === 'admin-hero-slides') return 'admin/hero-slides';
    return 'admin';
  })();

  const adminOnly = (node: React.ReactNode) => {
    if (role !== 'admin') return <AccessDenied navigate={navigate} />;
    return node;
  };

  const renderContent = () => {
    switch (route.page) {
      case 'admin': return <AdminDashboard navigate={navigate} siteTitle={siteTitle} />;
      case 'admin-articles': return <AdminArticles navigate={navigate} filter="all" userRole={role} userId={userId} />;
      case 'admin-articles-drafts': return <AdminArticles navigate={navigate} filter="drafts" userRole={role} userId={userId} />;
      case 'admin-articles-published': return <AdminArticles navigate={navigate} filter="published" userRole={role} userId={userId} />;
      case 'admin-article-new': return <AdminArticleEdit navigate={navigate} isNew userRole={role} userId={userId} />;
      case 'admin-article-edit': return <AdminArticleEdit id={route.id} navigate={navigate} userRole={role} userId={userId} />;
      case 'admin-series': return <AdminSeries navigate={navigate} userRole={role} userId={userId} />;
      case 'admin-series-new': return <AdminSeriesEdit navigate={navigate} isNew userRole={role} userId={userId} />;
      case 'admin-series-edit': return <AdminSeriesEdit id={route.id} navigate={navigate} userRole={role} userId={userId} />;
      case 'admin-settings': return adminOnly(<AdminSettings />);
      case 'admin-integrations': return adminOnly(<AdminIntegrations />);
      case 'admin-members': return role === 'admin' ? <AdminMembers navigate={navigate} /> : <AccessDenied navigate={navigate} />;
      case 'admin-profile': return <AdminProfile />;
      case 'admin-agenda': return <AgendaPage navigate={navigate} articles={articles} seriesList={seriesList} />;
      case 'admin-newsletter': return role === 'admin' ? <AdminNewsletter /> : <AccessDenied navigate={navigate} />;
      case 'admin-tags': return <AdminTags navigate={navigate} />;
      case 'admin-pages': return adminOnly(<AdminPages navigate={navigate} />);
      case 'admin-page-new': return adminOnly(<AdminPageEdit isNew navigate={navigate} />);
      case 'admin-page-edit': return adminOnly(<AdminPageEdit id={route.id} navigate={navigate} />);
      case 'admin-polls': return adminOnly(<AdminPolls />);
      case 'admin-hero-slides': return adminOnly(<AdminHeroSlides />);
      default: return <AdminDashboard navigate={navigate} siteTitle={siteTitle} />;
    }
  };

  return (
    <AdminErrorBoundary>
      <AdminLayout navigate={navigate} currentPath={currentPath} onLogout={handleLogout} userRole={role}>
        {renderContent()}
      </AdminLayout>
    </AdminErrorBoundary>
  );
}

function AccessDenied({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%', background: '#fef2f2',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>Bu sayfaya erişim yetkiniz yok</p>
      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Bu içerik yalnızca admin rolü için erişilebilir.</p>
      <button
        onClick={() => navigate('admin')}
        style={{
          marginTop: '0.5rem', padding: '0.6rem 1.25rem',
          background: '#111', color: '#fff', border: 'none',
          borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}
      >
        Panele Dön
      </button>
    </div>
  );
}