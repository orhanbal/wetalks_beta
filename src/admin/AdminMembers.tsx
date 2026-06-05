import { useEffect, useState } from 'react';
import {
  Search, Shield, ChevronDown, Check, RefreshCw, AlertCircle,
  Clock, CheckCircle, XCircle, Users, Inbox, X, PenLine, Eye,
  Globe, FileText, BookOpen, ExternalLink, Twitter, Instagram, Linkedin,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from './AdminLayout';
import { getArticleBadge, resolveAuthorBadge, ARTICLE_BADGES, formatCount } from '../lib/writerBadges';

type Role = 'reader' | 'author' | 'editor' | 'admin';
type Tab = 'members' | 'requests';

interface Member {
  id: string;
  full_name: string | null;
  display_name: string;
  role: Role;
  created_at: string;
  email?: string;
  avatar_url?: string | null;
}

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profile?: {
    full_name: string | null;
    display_name: string | null;
    role: string;
  };
}

interface MemberDetail {
  id: string;
  username: string | null;
  full_name: string | null;
  display_name: string | null;
  role: Role;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  website: string | null;
  created_at: string;
  custom_badge: string | null;
  membership_tier: string | null;
  membership_expires_at: string | null;
}

interface MemberStats {
  total_articles: number;
  published_articles: number;
  total_reads: number;
}

interface MemberArticle {
  id: string;
  title: string;
  published: boolean;
  date: string;
}

const ROLES: { value: Role; label: string; description: string; color: string; bg: string }[] = [
  { value: 'reader', label: 'Okuyucu', description: 'Sadece okuma erişimi', color: '#6b7280', bg: '#f3f4f6' },
  { value: 'author', label: 'Yazar', description: 'Makale oluşturabilir, kendi içeriğini düzenleyebilir', color: '#0369a1', bg: '#e0f2fe' },
  { value: 'editor', label: 'Editör', description: 'Tüm içerikleri düzenleyebilir ve yayınlayabilir', color: '#065f46', bg: '#d1fae5' },
  { value: 'admin', label: 'Admin', description: 'Tam erişim, ayarlar ve üye yönetimi dahil', color: '#92400e', bg: '#fef3c7' },
];

const ROLE_LABELS: Record<string, string> = {
  reader: 'Okuyucu', author: 'Yazar', editor: 'Editör', admin: 'Admin',
};

function RoleBadge({ role }: { role: Role }) {
  const r = ROLES.find(x => x.value === role) ?? ROLES[0];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: r.bg, color: r.color,
      fontSize: '0.6875rem', fontWeight: 700,
      padding: '2px 8px', borderRadius: 20,
      letterSpacing: '0.03em', textTransform: 'uppercase',
    }}>
      {r.label}
    </span>
  );
}

function BadgeChip({ label, color, bg, border, icon }: {
  label: string; color: string; bg: string; border: string; icon?: React.ReactNode;
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem',
      background: bg, border: `1.5px solid ${border}`,
      borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700,
      color, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    }}>
      {icon}
      {label}
    </span>
  );
}

function RoleDropdown({ current, onChange, disabled }: { current: Role; onChange: (r: Role) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const currentRole = ROLES.find(r => r.value === current) ?? ROLES[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.4rem 0.75rem', border: '1px solid #e5e7eb',
          borderRadius: 7, background: disabled ? '#f9fafb' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '0.8125rem', fontWeight: 600,
          color: disabled ? '#9ca3af' : '#374151',
          fontFamily: 'Inter, sans-serif',
          transition: 'border-color 0.15s',
          minWidth: 110,
        }}
        onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = '#9ca3af'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>{currentRole.label}</span>
        <ChevronDown size={13} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 4px)',
            background: '#fff', border: '1px solid #e5e7eb',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 50, minWidth: 220, overflow: 'hidden',
          }}>
            {ROLES.map(role => (
              <button
                key={role.value}
                onClick={() => { onChange(role.value); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '0.625rem 0.875rem',
                  background: current === role.value ? '#f9fafb' : 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.1s', borderBottom: '1px solid #f3f4f6',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = current === role.value ? '#f9fafb' : 'transparent'; }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: 2 }}>{role.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{role.description}</div>
                </div>
                {current === role.value && <Check size={14} color="#16a34a" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MemberDrawer({
  memberId,
  onClose,
  onRoleChange,
  currentUserId,
  navigate,
}: {
  memberId: string;
  onClose: () => void;
  onRoleChange: (id: string, role: Role) => void;
  currentUserId: string | null;
  navigate: (to: string) => void;
}) {
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [stats, setStats] = useState<MemberStats>({ total_articles: 0, published_articles: 0, total_reads: 0 });
  const [articles, setArticles] = useState<MemberArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedRole, setSavedRole] = useState<Role | null>(null);
  const [badgeSaving, setBadgeSaving] = useState(false);
  const [badgeSaved, setBadgeSaved] = useState(false);
  const [membershipTier, setMembershipTier] = useState<'free' | 'member' | 'founding'>('free');
  const [membershipExpires, setMembershipExpires] = useState('');
  const [tierSaving, setTierSaving] = useState(false);
  const [tierSaved, setTierSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const [profileRes, statsRes, articlesRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, full_name, display_name, role, title, bio, avatar_url, twitter, instagram, linkedin, website, created_at, custom_badge, membership_tier, membership_expires_at')
          .eq('id', memberId)
          .maybeSingle(),
        supabase
          .from('writer_stats')
          .select('total_articles, published_articles, total_reads')
          .eq('author_id', memberId)
          .maybeSingle(),
        supabase
          .from('articles')
          .select('id, title, published, date')
          .eq('author_id', memberId)
          .order('date', { ascending: false })
          .limit(5),
      ]);

      if (profileRes.data) {
        const p = profileRes.data as MemberDetail & { membership_tier?: string; membership_expires_at?: string };
        setDetail(p as MemberDetail);
        setMembershipTier((p.membership_tier as 'free' | 'member' | 'founding') || 'free');
        setMembershipExpires(p.membership_expires_at ? p.membership_expires_at.slice(0, 10) : '');
      }
      if (statsRes.data) {
        setStats({
          total_articles: Number(statsRes.data.total_articles) || 0,
          published_articles: Number(statsRes.data.published_articles) || 0,
          total_reads: Number(statsRes.data.total_reads) || 0,
        });
      }
      if (articlesRes.data) setArticles(articlesRes.data as MemberArticle[]);
      setLoading(false);
    })();
  }, [memberId]);

  const handleRoleChange = async (newRole: Role) => {
    if (!detail) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', memberId);
    if (!error) {
      setDetail(d => d ? { ...d, role: newRole } : d);
      setSavedRole(newRole);
      onRoleChange(memberId, newRole);
      setTimeout(() => setSavedRole(null), 2500);
    }
    setSaving(false);
  };

  const handleBadgeChange = async (badgeId: string | null) => {
    if (!detail) return;
    setBadgeSaving(true);
    const { error } = await supabase.from('profiles').update({ custom_badge: badgeId }).eq('id', memberId);
    if (!error) {
      setDetail(d => d ? { ...d, custom_badge: badgeId } : d);
      setBadgeSaved(true);
      setTimeout(() => setBadgeSaved(false), 2000);
    }
    setBadgeSaving(false);
  };

  const handleTierChange = async (tier: 'free' | 'member' | 'founding', expires: string) => {
    setTierSaving(true);
    const { error } = await supabase.from('profiles').update({
      membership_tier: tier,
      membership_expires_at: expires ? new Date(expires).toISOString() : null,
    }).eq('id', memberId);
    if (!error) {
      setMembershipTier(tier);
      setMembershipExpires(expires);
      setTierSaved(true);
      setTimeout(() => setTierSaved(false), 2500);
    }
    setTierSaving(false);
  };

  const socialLink = (raw: string | null | undefined) => {
    if (!raw) return null;
    return raw.startsWith('http') ? raw : `https://${raw}`;
  };

  const isSelf = detail?.id === currentUserId;
  const name = detail?.full_name?.trim() || detail?.display_name || 'İsimsiz';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const activeBadge = resolveAuthorBadge(stats.total_articles, detail?.custom_badge, detail?.role);
  const autoBadge = getArticleBadge(stats.total_articles);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)',
          zIndex: 100, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 420, maxWidth: '100vw',
        background: '#fff', zIndex: 101,
        boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        animation: 'slideInRight 0.22s ease',
      }}>
        <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', borderBottom: '1px solid #f3f4f6',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Üye Profili</span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e5e7eb'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6'; }}
          >
            <X size={15} color="#374151" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '0.875rem' }}>
              Yükleniyor...
            </div>
          ) : !detail ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '0.875rem' }}>
              Profil bulunamadı.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Identity */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                padding: '1.25rem', background: '#f9fafb', borderRadius: 14,
                border: '1px solid #f3f4f6',
              }}>
                <div style={{ flexShrink: 0 }}>
                  {detail.avatar_url ? (
                    <img
                      src={detail.avatar_url}
                      alt={name}
                      style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
                    />
                  ) : (
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%', background: '#111',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.125rem', fontWeight: 700, color: '#c8f542',
                      border: '2px solid #e5e7eb',
                    }}>
                      {initials}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111' }}>{name}</span>
                    {isSelf && <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>(siz)</span>}
                  </div>
                  <RoleBadge role={detail.role} />
                  {detail.title && (
                    <p style={{ margin: '0.375rem 0 0', fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.4 }}>
                      {detail.title}
                    </p>
                  )}

                  {/* Socials */}
                  {(detail.twitter || detail.instagram || detail.linkedin || detail.website) && (
                    <div style={{ display: 'flex', gap: '0.625rem', marginTop: '0.625rem' }}>
                      {detail.twitter && <a href={socialLink(detail.twitter)!} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#111')} onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}><Twitter size={15} /></a>}
                      {detail.instagram && <a href={socialLink(detail.instagram)!} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#111')} onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}><Instagram size={15} /></a>}
                      {detail.linkedin && <a href={socialLink(detail.linkedin)!} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#111')} onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}><Linkedin size={15} /></a>}
                      {detail.website && <a href={socialLink(detail.website)!} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', transition: 'color 0.15s' }} onMouseEnter={e => (e.currentTarget.style.color = '#111')} onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}><Globe size={15} /></a>}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {detail.bio && (
                <div style={{ padding: '0.875rem 1rem', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#374151', lineHeight: 1.6 }}>{detail.bio}</p>
                </div>
              )}

              {/* Stats */}
              {['author', 'editor', 'admin'].includes(detail.role) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                  {[
                    { label: 'Toplam Yazı', value: stats.total_articles.toLocaleString('tr-TR'), icon: <PenLine size={13} />, color: '#1d4ed8' },
                    { label: 'Yayında', value: stats.published_articles.toLocaleString('tr-TR'), icon: <Globe size={13} />, color: '#16a34a' },
                    { label: 'Okuma', value: formatCount(stats.total_reads), icon: <Eye size={13} />, color: '#0e8fa0' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
                      padding: '0.75rem', textAlign: 'center',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'center', color: s.color, marginBottom: '0.25rem' }}>{s.icon}</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: '0.2rem', fontWeight: 500 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Badges */}
              {['author', 'editor', 'admin'].includes(detail.role) && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rozet</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {detail.custom_badge && (
                        <button
                          onClick={() => handleBadgeChange(null)}
                          style={{ fontSize: '0.6875rem', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4, textDecoration: 'underline' }}
                        >
                          Otomatiğe sıfırla
                        </button>
                      )}
                      {badgeSaved && <span style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>Kaydedildi</span>}
                      {badgeSaving && <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>Kaydediliyor...</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <BadgeChip label={activeBadge.label} color={activeBadge.color} bg={activeBadge.bg} border={activeBadge.border} icon={<PenLine size={10} />} />
                    {detail.custom_badge
                      ? <span style={{ fontSize: '0.6875rem', color: '#f59e0b', fontWeight: 600 }}>Manuel atandı</span>
                      : <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>Otomatik ({autoBadge.label})</span>
                    }
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                    {ARTICLE_BADGES.map(badge => {
                      const isActive = detail.custom_badge === badge.id;
                      return (
                        <button
                          key={badge.id}
                          onClick={() => handleBadgeChange(badge.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.5rem 0.625rem', border: `1.5px solid ${isActive ? badge.border : '#e5e7eb'}`,
                            borderRadius: 8, background: isActive ? badge.bg : '#fff',
                            cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                          }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: badge.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 700 : 500, color: isActive ? badge.color : '#374151' }}>
                            {badge.label}
                          </span>
                          {isActive && <Check size={11} style={{ marginLeft: 'auto', color: badge.color, flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent articles */}
              {articles.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                  }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <FileText size={13} /> Son Yazılar
                    </span>
                    <button
                      onClick={() => { onClose(); navigate(detail?.username ? `@${detail.username}` : `author/${memberId}`); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#0e8fa0', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                    >
                      <ExternalLink size={12} />
                      Profilini Görüntüle
                    </button>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
                    {articles.map((a, i) => (
                      <div
                        key={a.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.625rem',
                          padding: '0.625rem 0.875rem',
                          borderBottom: i < articles.length - 1 ? '1px solid #f9fafb' : 'none',
                        }}
                      >
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                          background: a.published ? '#22c55e' : '#f59e0b',
                        }} />
                        <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 500, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.title}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: '#9ca3af', flexShrink: 0 }}>
                          {new Date(a.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Series count */}
              <div style={{ padding: '0.875rem 1rem', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={14} color="#6b7280" />
                <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                  Katılım: <strong style={{ color: '#374151' }}>
                    {new Date(detail.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </strong>
                </span>
              </div>

              {/* Membership Tier */}
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Üyelik Kademesi</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {tierSaved && <span style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>Kaydedildi</span>}
                    {tierSaving && <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>Kaydediliyor...</span>}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.375rem', marginBottom: '0.75rem' }}>
                  {([
                    { value: 'free' as const, label: 'Ücretsiz', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
                    { value: 'member' as const, label: 'Üye', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
                    { value: 'founding' as const, label: 'Kurucu', color: '#92400e', bg: '#fef3c7', border: '#fcd34d' },
                  ]).map(t => {
                    const isActive = membershipTier === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => handleTierChange(t.value, membershipExpires)}
                        disabled={tierSaving}
                        style={{
                          padding: '0.5rem 0.25rem',
                          border: `1.5px solid ${isActive ? t.border : '#e5e7eb'}`,
                          borderRadius: 8,
                          background: isActive ? t.bg : '#fff',
                          color: isActive ? t.color : '#6b7280',
                          fontSize: '0.75rem', fontWeight: isActive ? 700 : 500,
                          cursor: tierSaving ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                        }}
                      >
                        {isActive && <Check size={11} />}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                {membershipTier !== 'free' && (
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.375rem' }}>
                      Bitiş Tarihi (opsiyonel)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="date"
                        value={membershipExpires}
                        onChange={e => setMembershipExpires(e.target.value)}
                        style={{
                          flex: 1, padding: '0.45rem 0.75rem',
                          border: '1px solid #e5e7eb', borderRadius: 7,
                          fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif',
                          color: '#111', background: '#fff', outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleTierChange(membershipTier, membershipExpires)}
                        disabled={tierSaving}
                        style={{
                          padding: '0.45rem 0.875rem',
                          background: '#111', color: '#fff',
                          border: 'none', borderRadius: 7,
                          fontSize: '0.8125rem', fontWeight: 600,
                          cursor: tierSaving ? 'not-allowed' : 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          opacity: tierSaving ? 0.6 : 1,
                        }}
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer — Role Control */}
        {detail && !isSelf && (
          <div style={{
            padding: '1rem 1.25rem', borderTop: '1px solid #f3f4f6', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Rol Değiştir</p>
              <p style={{ margin: '0.125rem 0 0', fontSize: '0.6875rem', color: '#9ca3af' }}>
                {savedRole ? (
                  <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check size={11} /> Kaydedildi
                  </span>
                ) : saving ? 'Kaydediliyor...' : 'Hemen uygulanır'}
              </p>
            </div>
            <RoleDropdown
              current={detail.role}
              onChange={handleRoleChange}
              disabled={saving}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default function AdminMembers({ navigate }: { navigate?: (to: string) => void }) {
  const nav = navigate ?? (() => {});
  const [activeTab, setActiveTab] = useState<Tab>('members');

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<Role | 'all'>('all');
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);

  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const loadMembers = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id ?? null);

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, display_name, role, created_at, avatar_url')
      .order('created_at', { ascending: false });

    setMembers((data as Member[]) ?? []);
    setLoading(false);
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    const { data } = await supabase
      .from('role_requests')
      .select('id, user_id, requested_role, message, status, created_at, profile:profiles(full_name, display_name, role)')
      .order('created_at', { ascending: false });

    setRequests((data as RoleRequest[]) ?? []);
    setRequestsLoading(false);
  };

  useEffect(() => {
    loadMembers();
    loadRequests();
  }, []);

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    setSavingId(memberId);
    setErrorId(null);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      setErrorId(memberId);
      loadMembers();
    } else {
      setSavedId(memberId);
      setTimeout(() => setSavedId(null), 2000);
    }
    setSavingId(null);
  };

  const handleRoleChangeFromDrawer = (memberId: string, newRole: Role) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };

  const handleRequest = async (req: RoleRequest, action: 'approved' | 'rejected') => {
    setProcessingId(req.id);

    const { data: { user } } = await supabase.auth.getUser();

    const { error: updateError } = await supabase
      .from('role_requests')
      .update({
        status: action,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', req.id);

    if (!updateError && action === 'approved') {
      await supabase
        .from('profiles')
        .update({ role: req.requested_role })
        .eq('id', req.user_id);
      loadMembers();
    }

    setProcessingId(null);
    loadRequests();
  };

  const filtered = members.filter(m => {
    const name = (m.full_name ?? m.display_name ?? '').toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || m.role === filterRole;
    return matchSearch && matchRole;
  });

  const filteredRequests = requests.filter(r =>
    filterStatus === 'all' || r.status === filterStatus
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const counts = ROLES.reduce((acc, r) => {
    acc[r.value] = members.filter(m => m.role === r.value).length;
    return acc;
  }, {} as Record<Role, number>);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 1rem 0.6rem 2.25rem',
    border: '1px solid #e5e7eb', borderRadius: 8,
    fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
    outline: 'none', background: '#fff', color: '#111', boxSizing: 'border-box',
  };

  const statusConfig = {
    pending: { label: 'Beklemede', color: '#d97706', bg: '#fef3c7', icon: <Clock size={12} /> },
    approved: { label: 'Onaylandı', color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={12} /> },
    rejected: { label: 'Reddedildi', color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={12} /> },
  };

  return (
    <div>
      <AdminPageHeader
        title="Üyeler"
        subtitle="Kayıtlı kullanıcıları görüntüleyin, rol yetkilendirmesi yapın ve başvuruları yönetin"
        action={
          <button
            onClick={() => { loadMembers(); loadRequests(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', border: '1px solid #e5e7eb',
              borderRadius: 8, background: '#fff', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 600, color: '#374151',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <RefreshCw size={13} />
            Yenile
          </button>
        }
      />

      {/* Tabs */}
      <div style={{ padding: '0 2rem', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '0' }}>
        {([
          { key: 'members' as Tab, label: 'Üyeler', icon: <Users size={14} />, count: members.length },
          { key: 'requests' as Tab, label: 'Talepler', icon: <Inbox size={14} />, count: pendingCount > 0 ? pendingCount : null },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.875rem 1.25rem',
              border: 'none', borderBottom: activeTab === tab.key ? '2px solid #111' : '2px solid transparent',
              background: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? '#111' : '#6b7280',
              fontFamily: 'Inter, sans-serif',
              transition: 'color 0.15s',
              marginBottom: -1,
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span style={{
                background: tab.key === 'requests' ? '#ef4444' : '#e5e7eb',
                color: tab.key === 'requests' ? '#fff' : '#374151',
                fontSize: '0.6875rem', fontWeight: 700,
                padding: '1px 6px', borderRadius: 10,
                minWidth: 18, textAlign: 'center',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {ROLES.map(role => (
              <button
                key={role.value}
                onClick={() => setFilterRole(filterRole === role.value ? 'all' : role.value)}
                style={{
                  background: filterRole === role.value ? role.bg : '#fff',
                  border: `1px solid ${filterRole === role.value ? role.color + '40' : '#e5e7eb'}`,
                  borderRadius: 10, padding: '0.875rem 1rem',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: role.color, lineHeight: 1 }}>
                  {counts[role.value] ?? 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem', fontWeight: 500 }}>
                  {role.label}
                </div>
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="İsim ile ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#374151'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
              />
            </div>
            {filterRole !== 'all' && (
              <button
                onClick={() => setFilterRole('all')}
                style={{
                  padding: '0.6rem 1rem', border: '1px solid #e5e7eb',
                  borderRadius: 8, background: '#f9fafb', cursor: 'pointer',
                  fontSize: '0.8125rem', color: '#6b7280', fontFamily: 'Inter, sans-serif',
                  fontWeight: 500, whiteSpace: 'nowrap',
                }}
              >
                Filtreyi Temizle
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              padding: '0.625rem 1.25rem',
              background: '#fafafa', borderBottom: '1px solid #f3f4f6',
              fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
            }}>
              <span>Kullanıcı</span>
              <span style={{ paddingRight: '5.5rem' }}>Mevcut Rol</span>
              <span>Değiştir</span>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                Yükleniyor...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                <Shield size={32} color="#d1d5db" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                  {search || filterRole !== 'all' ? 'Sonuç bulunamadı.' : 'Henüz kayıtlı üye yok.'}
                </p>
              </div>
            ) : (
              filtered.map((member, idx) => {
                const name = member.full_name?.trim() || member.display_name || 'İsimsiz';
                const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                const isSelf = member.id === currentUserId;
                const isSaving = savingId === member.id;
                const isSaved = savedId === member.id;
                const hasError = errorId === member.id;

                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr auto auto',
                      alignItems: 'center',
                      padding: '0.875rem 1.25rem',
                      borderBottom: idx < filtered.length - 1 ? '1px solid #f9fafb' : 'none',
                      transition: 'background 0.1s', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    onClick={() => setOpenDrawerId(member.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: member.avatar_url ? 'transparent' : '#111',
                        border: member.avatar_url ? '2px solid #e5e7eb' : 'none',
                        flexShrink: 0, overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#c8f542',
                      }}>
                        {member.avatar_url
                          ? <img src={member.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111', fontFamily: 'Inter, sans-serif' }}>
                            {name}
                          </span>
                          {isSelf && (
                            <span style={{ fontSize: '0.6875rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>(siz)</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif', marginTop: 1 }}>
                          {new Date(member.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '1rem' }}>
                      <RoleBadge role={member.role} />
                      {isSaving && <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>kaydediliyor...</span>}
                      {isSaved && !isSaving && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: '#16a34a', fontFamily: 'Inter, sans-serif' }}>
                          <Check size={12} /> kaydedildi
                        </span>
                      )}
                      {hasError && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', color: '#dc2626', fontFamily: 'Inter, sans-serif' }}>
                          <AlertCircle size={12} /> hata
                        </span>
                      )}
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      <RoleDropdown
                        current={member.role}
                        onChange={r => handleRoleChange(member.id, r)}
                        disabled={isSelf || isSaving}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {filtered.length > 0 && (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0, fontFamily: 'Inter, sans-serif' }}>
              {filtered.length} üye gösteriliyor{members.length !== filtered.length ? ` (toplam ${members.length})` : ''}
            </p>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {([
              { key: 'pending' as const, label: 'Bekleyen', color: '#d97706', bg: '#fef3c7' },
              { key: 'approved' as const, label: 'Onaylanan', color: '#16a34a', bg: '#dcfce7' },
              { key: 'rejected' as const, label: 'Reddedilen', color: '#dc2626', bg: '#fee2e2' },
              { key: 'all' as const, label: 'Tümü', color: '#374151', bg: '#f3f4f6' },
            ]).map(f => {
              const count = f.key === 'all' ? requests.length : requests.filter(r => r.status === f.key).length;
              const isActive = filterStatus === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.45rem 0.875rem',
                    border: `1px solid ${isActive ? f.color + '60' : '#e5e7eb'}`,
                    borderRadius: 8,
                    background: isActive ? f.bg : '#fff',
                    color: isActive ? f.color : '#6b7280',
                    fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.15s',
                  }}
                >
                  {f.label}
                  <span style={{
                    background: isActive ? f.color + '20' : '#f3f4f6',
                    color: isActive ? f.color : '#9ca3af',
                    fontSize: '0.6875rem', fontWeight: 700,
                    padding: '1px 5px', borderRadius: 8,
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            {requestsLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                Yükleniyor...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                <Inbox size={32} color="#d1d5db" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                  {filterStatus === 'pending' ? 'Bekleyen talep yok.' : 'Talep bulunamadı.'}
                </p>
              </div>
            ) : (
              filteredRequests.map((req, idx) => {
                const profile = req.profile as { full_name: string | null; display_name: string | null; role: string } | null;
                const name = profile?.full_name?.trim() || profile?.display_name || 'İsimsiz';
                const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                const sc = statusConfig[req.status];
                const isProcessing = processingId === req.id;

                return (
                  <div
                    key={req.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: idx < filteredRequests.length - 1 ? '1px solid #f3f4f6' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: '#111', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, color: '#c8f542',
                          cursor: 'pointer',
                        }}
                          onClick={() => setOpenDrawerId(req.user_id)}
                        >
                          {initials}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setOpenDrawerId(req.user_id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, color: '#111', fontFamily: 'Inter, sans-serif', padding: 0 }}
                            >
                              {name}
                            </button>
                            {profile?.role && (
                              <RoleBadge role={profile.role as Role} />
                            )}
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>
                              {new Date(req.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: '#374151', fontFamily: 'Inter, sans-serif' }}>
                            <span style={{ fontWeight: 500 }}>Talep: </span>
                            <span style={{ fontWeight: 700, color: '#0369a1' }}>{ROLE_LABELS[req.requested_role] ?? req.requested_role}</span>
                            {' '}rolü istiyor
                          </div>
                          {req.message && (
                            <div style={{
                              marginTop: '0.5rem', padding: '0.5rem 0.75rem',
                              background: '#f8f9fa', borderRadius: 6,
                              borderLeft: '3px solid #e5e7eb',
                              fontSize: '0.8125rem', color: '#6b7280',
                              fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
                            }}>
                              {req.message}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 9px', borderRadius: 20,
                          fontSize: '0.6875rem', fontWeight: 700,
                          background: sc.bg, color: sc.color,
                        }}>
                          {sc.icon}
                          {sc.label}
                        </span>

                        {req.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button
                              onClick={() => handleRequest(req, 'approved')}
                              disabled={isProcessing}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.4rem 0.75rem',
                                background: '#16a34a', color: '#fff',
                                border: 'none', borderRadius: 7,
                                fontSize: '0.8125rem', fontWeight: 600,
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                opacity: isProcessing ? 0.6 : 1,
                                fontFamily: 'Inter, sans-serif',
                              }}
                            >
                              <CheckCircle size={13} />
                              Onayla
                            </button>
                            <button
                              onClick={() => handleRequest(req, 'rejected')}
                              disabled={isProcessing}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.4rem 0.75rem',
                                background: '#fff', color: '#dc2626',
                                border: '1px solid #fca5a5', borderRadius: 7,
                                fontSize: '0.8125rem', fontWeight: 600,
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                opacity: isProcessing ? 0.6 : 1,
                                fontFamily: 'Inter, sans-serif',
                              }}
                            >
                              <XCircle size={13} />
                              Reddet
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {filteredRequests.length > 0 && (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0, fontFamily: 'Inter, sans-serif' }}>
              {filteredRequests.length} talep gösteriliyor
            </p>
          )}
        </div>
      )}

      {/* Member Drawer */}
      {openDrawerId && (
        <MemberDrawer
          memberId={openDrawerId}
          onClose={() => setOpenDrawerId(null)}
          onRoleChange={handleRoleChangeFromDrawer}
          currentUserId={currentUserId}
          navigate={nav}
        />
      )}
    </div>
  );
}
