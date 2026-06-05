import { ReactNode, useState, useEffect } from 'react';
import { PenLine, FileText, BookOpen, Settings, LogOut, ExternalLink, Users, BarChart2, Tag, ChevronDown, Plus, CalendarDays, Plug, Mail, LayoutGrid as Layout, Vote, Layers, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLayoutProps {
  children: ReactNode;
  navigate: (to: string) => void;
  currentPath: string;
  onLogout: () => void;
  userRole?: string;
}

export default function AdminLayout({ children, navigate, currentPath, onLogout, userRole = 'admin' }: AdminLayoutProps) {
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [contentOpen, setContentOpen] = useState(
    currentPath.startsWith('admin/articles') ||
    currentPath.startsWith('admin/series') ||
    currentPath.startsWith('admin/tags') ||
    currentPath.startsWith('admin/pages') ||
    currentPath === 'admin'
  );
  const [publishOpen, setPublishOpen] = useState(
    currentPath.startsWith('admin/newsletter') ||
    currentPath.startsWith('admin/polls') ||
    currentPath.startsWith('admin/hero-slides') ||
    currentPath.startsWith('admin/agenda')
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email ?? '');
    });
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle().then(({ data }) => {
        if (data?.full_name) setUserName(data.full_name);
      });
    });
    supabase.from('profiles').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setMemberCount(count ?? 0);
    });
  }, []);

  const isActive = (path: string) => currentPath === path;
  const isActivePrefix = (prefix: string) => currentPath.startsWith(prefix);

  const navBtn = (active: boolean, indent = false): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: indent ? '0.3rem 0.75rem 0.3rem 2.25rem' : '0.35rem 0.75rem',
    borderRadius: 5,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    fontSize: indent ? '0.8rem' : '0.8125rem',
    fontWeight: active ? 600 : 400,
    background: active ? '#f3f4f6' : 'transparent',
    color: active ? '#111' : '#6b7280',
    textAlign: 'left',
    transition: 'background 0.1s, color 0.1s',
    lineHeight: 1.4,
  });

  const groupLabel: React.CSSProperties = {
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.07em',
    color: '#9ca3af',
    textTransform: 'uppercase',
    padding: '0.6rem 0.75rem 0.2rem',
  };

  const hoverOn = (e: React.MouseEvent<HTMLButtonElement>, active: boolean) => {
    if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
  };
  const hoverOff = (e: React.MouseEvent<HTMLButtonElement>, active: boolean) => {
    if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 228,
        minWidth: 228,
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '1rem 0.75rem 0.875rem', borderBottom: '1px solid #f3f4f6' }}>
          <button
            onClick={() => navigate('admin')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}
          >
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PenLine size={13} color="#fff" />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>Orhan Balcı</span>
          </button>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0.5rem 0.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Analitik */}
          <button
            onClick={() => navigate('admin')}
            style={navBtn(isActive('admin'))}
            onMouseEnter={e => hoverOn(e, isActive('admin'))}
            onMouseLeave={e => hoverOff(e, isActive('admin'))}
          >
            <BarChart2 size={15} />
            Analitik
          </button>

          {/* Ajanda — en üstte */}
          <button
            onClick={() => navigate('admin/agenda')}
            style={navBtn(isActive('admin/agenda'))}
            onMouseEnter={e => hoverOn(e, isActive('admin/agenda'))}
            onMouseLeave={e => hoverOff(e, isActive('admin/agenda'))}
          >
            <CalendarDays size={15} />
            Ajanda
          </button>

          <div style={{ height: 6 }} />

          {/* ── İÇERİK grubu ── */}
          <div style={groupLabel}>İçerik</div>

          {/* Makaleler — collapsible */}
          <button
            onClick={() => { setContentOpen(o => !o); navigate('admin/articles'); }}
            style={{ ...navBtn(isActivePrefix('admin/articles')), justifyContent: 'space-between' }}
            onMouseEnter={e => hoverOn(e, isActivePrefix('admin/articles'))}
            onMouseLeave={e => hoverOff(e, isActivePrefix('admin/articles'))}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={15} />
              Makaleler
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                onClick={e => { e.stopPropagation(); navigate('admin/articles/new'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px', borderRadius: 3, display: 'flex', alignItems: 'center', color: '#9ca3af' }}
              >
                <Plus size={13} />
              </button>
              <ChevronDown size={13} style={{ color: '#9ca3af', transform: contentOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.15s' }} />
            </span>
          </button>

          {contentOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: 1 }}>
              <button
                onClick={() => navigate('admin/articles/drafts')}
                style={navBtn(isActivePrefix('admin/articles/drafts'), true)}
                onMouseEnter={e => hoverOn(e, isActivePrefix('admin/articles/drafts'))}
                onMouseLeave={e => hoverOff(e, isActivePrefix('admin/articles/drafts'))}
              >
                Taslaklar
              </button>
              <button
                onClick={() => navigate('admin/articles/published')}
                style={navBtn(isActivePrefix('admin/articles/published'), true)}
                onMouseEnter={e => hoverOn(e, isActivePrefix('admin/articles/published'))}
                onMouseLeave={e => hoverOff(e, isActivePrefix('admin/articles/published'))}
              >
                Yayındakiler
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('admin/series')}
            style={navBtn(isActivePrefix('admin/series'))}
            onMouseEnter={e => hoverOn(e, isActivePrefix('admin/series'))}
            onMouseLeave={e => hoverOff(e, isActivePrefix('admin/series'))}
          >
            <BookOpen size={15} />
            Diziler
          </button>

          <button
            onClick={() => navigate('admin/tags')}
            style={navBtn(isActive('admin/tags'))}
            onMouseEnter={e => hoverOn(e, isActive('admin/tags'))}
            onMouseLeave={e => hoverOff(e, isActive('admin/tags'))}
          >
            <Tag size={15} />
            Etiketler
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => navigate('admin/pages')}
              style={navBtn(isActive('admin/pages'))}
              onMouseEnter={e => hoverOn(e, isActive('admin/pages'))}
              onMouseLeave={e => hoverOff(e, isActive('admin/pages'))}
            >
              <Layout size={15} />
              Sayfalar
            </button>
          )}

          <div style={{ height: 6 }} />

          {/* ── YAYINLAMA grubu ── */}
          {userRole === 'admin' && (
            <>
              <div style={groupLabel}>
                <button
                  onClick={() => setPublishOpen(o => !o)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4, color: '#9ca3af', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit' }}
                >
                  Yayınlama
                  <ChevronRight size={10} style={{ transform: publishOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
                </button>
              </div>

              {publishOpen && (
                <>
                  <button
                    onClick={() => navigate('admin/newsletter')}
                    style={navBtn(isActive('admin/newsletter'))}
                    onMouseEnter={e => hoverOn(e, isActive('admin/newsletter'))}
                    onMouseLeave={e => hoverOff(e, isActive('admin/newsletter'))}
                  >
                    <Mail size={15} />
                    Bülten
                  </button>

                  <button
                    onClick={() => navigate('admin/polls')}
                    style={navBtn(isActive('admin/polls'))}
                    onMouseEnter={e => hoverOn(e, isActive('admin/polls'))}
                    onMouseLeave={e => hoverOff(e, isActive('admin/polls'))}
                  >
                    <Vote size={15} />
                    Anketler
                  </button>

                  <button
                    onClick={() => navigate('admin/hero-slides')}
                    style={navBtn(isActive('admin/hero-slides'))}
                    onMouseEnter={e => hoverOn(e, isActive('admin/hero-slides'))}
                    onMouseLeave={e => hoverOff(e, isActive('admin/hero-slides'))}
                  >
                    <Layers size={15} />
                    Hero Slider
                  </button>
                </>
              )}

              <div style={{ height: 6 }} />
            </>
          )}

          {/* ── TOPLULUK grubu ── */}
          {userRole === 'admin' && (
            <>
              <div style={groupLabel}>Topluluk</div>
              <button
                onClick={() => navigate('admin/members')}
                style={navBtn(isActive('admin/members'))}
                onMouseEnter={e => hoverOn(e, isActive('admin/members'))}
                onMouseLeave={e => hoverOff(e, isActive('admin/members'))}
              >
                <Users size={15} />
                Üyeler
                {memberCount !== null && (
                  <span style={{ marginLeft: 'auto', background: '#f3f4f6', color: '#6b7280', fontSize: '0.6875rem', fontWeight: 600, padding: '1px 6px', borderRadius: 10 }}>
                    {memberCount}
                  </span>
                )}
              </button>
            </>
          )}

          <div style={{ flex: 1 }} />

          {/* ── SISTEM grubu ── */}
          {userRole === 'admin' && (
            <>
              <div style={groupLabel}>Sistem</div>
              <button
                onClick={() => navigate('admin/integrations')}
                style={navBtn(isActive('admin/integrations'))}
                onMouseEnter={e => hoverOn(e, isActive('admin/integrations'))}
                onMouseLeave={e => hoverOff(e, isActive('admin/integrations'))}
              >
                <Plug size={15} />
                Entegrasyonlar
              </button>
              <button
                onClick={() => navigate('admin/settings')}
                style={navBtn(isActive('admin/settings'))}
                onMouseEnter={e => hoverOn(e, isActive('admin/settings'))}
                onMouseLeave={e => hoverOff(e, isActive('admin/settings'))}
              >
                <Settings size={15} />
                Ayarlar
              </button>
            </>
          )}

        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={() => navigate('')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              width: '100%', padding: '0.6rem 1.25rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
              color: '#6b7280', textAlign: 'left',
              borderBottom: '1px solid #f3f4f6', transition: 'color 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#111'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6b7280'; }}
          >
            <ExternalLink size={13} />
            Siteyi görüntüle
          </button>

          <button
            onClick={() => navigate('admin/profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              width: '100%', padding: '0.75rem 1rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', textAlign: 'left', transition: 'background 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
              {userName.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>
            </div>
          </button>

          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              width: '100%', padding: '0.5rem 1rem',
              background: 'none', border: 'none', borderTop: '1px solid #f3f4f6',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              fontSize: '0.8rem', color: '#ef4444', textAlign: 'left',
            }}
          >
            <LogOut size={13} />
            Çıkış yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '1.25rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: '0.2rem 0 0' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Breadcrumb({ items }: { items: { label: string; path?: string; onClick?: () => void }[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.875rem 2rem 0', fontSize: '0.8rem', color: '#9ca3af' }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {i > 0 && <span>/</span>}
          {item.onClick
            ? <button onClick={item.onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', padding: 0 }}>{item.label}</button>
            : <span style={{ color: i === items.length - 1 ? '#374151' : '#9ca3af' }}>{item.label}</span>
          }
        </span>
      ))}
    </div>
  );
}
