import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Camera, Save, ArrowLeft, Trash2, Send, Clock, CheckCircle, XCircle, Bookmark, BookOpen, FileText, User, Globe, Twitter, Instagram, Linkedin, Eye, PenLine, ChevronRight, ExternalLink, CreditCard as Edit2, X, Users, Shield, Star, Crown, FolderPlus, Folder, StickyNote, Check, Plus, Pencil } from 'lucide-react';
import AvatarCrop from '../components/AvatarCrop';
import { useBookmarks } from '../hooks/useBookmarks';
import { useFollowingCount } from '../hooks/useFollow';
import type { Article } from '../data/articles';
import type { Series } from '../data/series';

interface ProfilePageProps {
  navigate: (to: string) => void;
  articles: Article[];
  seriesList: Series[];
}

interface Profile {
  id: string;
  full_name: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  bio: string;
  title: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  website: string;
  membership_tier?: 'free' | 'member' | 'founding';
  membership_expires_at?: string | null;
}

interface RoleRequest {
  id: string;
  requested_role: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface ReadingStats {
  totalBookmarks: number;
  articleBookmarks: number;
  seriesBookmarks: number;
}

const ROLE_LABELS: Record<string, string> = {
  reader: 'Okuyucu',
  author: 'Yazar',
  editor: 'Editör',
  admin: 'Admin',
};

const ROLE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  reader: { color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' },
  author: { color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
  editor: { color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' },
  admin: { color: '#92400e', bg: '#fef3c7', border: '#fcd34d' },
};

type Tab = 'overview' | 'membership' | 'bookmarks' | 'settings';

function TabButton({ id, label, icon, active, count, onClick }: {
  id: Tab; label: string; icon: React.ReactNode;
  active: boolean; count?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.625rem 1rem',
        border: 'none', borderBottom: active ? '2px solid #111' : '2px solid transparent',
        background: 'none', cursor: 'pointer',
        fontSize: '0.875rem', fontWeight: active ? 700 : 500,
        color: active ? '#111' : '#6b7280',
        fontFamily: 'Inter, sans-serif', transition: 'color 0.15s',
        marginBottom: -1, whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span style={{
          background: active ? '#111' : '#e5e7eb',
          color: active ? '#fff' : '#374151',
          fontSize: '0.6875rem', fontWeight: 700,
          padding: '1px 6px', borderRadius: 10,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

const MEMBERSHIP_TIERS = {
  free:     { label: 'Ücretsiz',     color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb',  icon: <User size={12} /> },
  member:   { label: 'Üye',          color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc',  icon: <Shield size={12} /> },
  founding: { label: 'Kurucu Üye',   color: '#92400e', bg: '#fef3c7', border: '#fcd34d',  icon: <Crown size={12} /> },
} as const;

export default function ProfilePage({ navigate, articles, seriesList }: ProfilePageProps) {
  const { user, loading: authLoading } = useAuth();
  const followingCount = useFollowingCount(user?.id);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [membershipSettings, setMembershipSettings] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Edit states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Role request
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
  const [requestRole, setRequestRole] = useState<'author' | 'editor'>('author');
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  const { bookmarks, collections, isBookmarked, toggle, updateBookmark, createCollection, deleteCollection, renameCollection } = useBookmarks();
  const [bmFilter, setBmFilter] = useState<'all' | 'article' | 'series'>('all');
  const [bmCollection, setBmCollection] = useState<string | null>(null);
  const [newCollName, setNewCollName] = useState('');
  const [newCollColor, setNewCollColor] = useState('#0369a1');
  const [showNewColl, setShowNewColl] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [renamingColl, setRenamingColl] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('login'); return; }
    loadProfile();
    loadRoleRequests();
    supabase.from('site_settings').select('key, value')
      .in('key', ['feature_membership', 'membership_member_label', 'membership_founding_label',
                  'membership_member_perks', 'membership_founding_perks'])
      .then(({ data }) => {
        if (data) {
          const m: Record<string, string> = {};
          data.forEach((r: { key: string; value: string }) => { m[r.key] = r.value; });
          setMembershipSettings(m);
        }
      });
  }, [user, authLoading]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (data) {
      setProfile(data as Profile);
      setFieldValues(data as Profile);
    }
    setLoading(false);
  };

  const loadRoleRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('role_requests')
      .select('id, requested_role, message, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setRoleRequests((data as RoleRequest[]) ?? []);
  };

  const saveField = async (field: string, value: string) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (!error) {
      setProfile(p => p ? { ...p, [field]: value.trim() } : p);
      setSaveSuccess(field);
      setEditingField(null);
      setTimeout(() => setSaveSuccess(null), 2500);
      if (field === 'full_name') window.dispatchEvent(new Event('profile-updated'));
    }
    setSaving(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) { setUploadError('Dosya 10MB\'dan küçük olmalıdır.'); return; }
    setUploadError('');
    setCropFile(file);
  };

  const handleCropConfirm = async (blob: Blob) => {
    if (!user) return;
    setCropFile(null);
    setUploading(true);
    setUploadError('');
    const filePath = `${user.id}/avatar.webp`;
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, blob, { contentType: 'image/webp', upsert: true });
    if (uploadErr) { setUploadError('Resim yüklenemedi.'); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const urlWithCache = `${publicUrl}?t=${Date.now()}`;
    await supabase.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', user.id);
    setProfile(p => p ? { ...p, avatar_url: urlWithCache } : p);
    window.dispatchEvent(new Event('profile-avatar-updated'));
    setUploading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!user || !profile?.avatar_url) return;
    setUploading(true);
    await supabase.from('profiles').update({ avatar_url: null, updated_at: new Date().toISOString() }).eq('id', user.id);
    setProfile(p => p ? { ...p, avatar_url: null } : p);
    window.dispatchEvent(new Event('profile-avatar-updated'));
    setUploading(false);
  };

  const handleRoleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setRequestError('');
    setRequestSuccess('');
    const { error } = await supabase.from('role_requests').insert({
      user_id: user.id,
      requested_role: requestRole,
      message: requestMessage.trim(),
    });
    if (error) {
      setRequestError('Başvuru gönderilemedi. Lütfen tekrar deneyin.');
    } else {
      setRequestSuccess('Başvurunuz alındı. Admin incelemesini bekleyiniz.');
      setRequestMessage('');
      loadRoleRequests();
      setTimeout(() => setRequestSuccess(''), 5000);
    }
    setSubmitting(false);
  };

  if (authLoading || loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Yükleniyor...</div>;
  }

  const name = profile?.full_name?.trim() || profile?.display_name || 'İsimsiz';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const role = profile?.role ?? 'reader';
  const roleStyle = ROLE_COLORS[role] ?? ROLE_COLORS.reader;
  const hasPendingRequest = roleRequests.some(r => r.status === 'pending');
  const canRequest = role === 'reader' || role === 'author';

  const bookmarkedArticles = articles.filter(a => isBookmarked('article', a.id));
  const bookmarkedSeries = seriesList.filter(s => isBookmarked('series', s.id));
  const stats: ReadingStats = {
    totalBookmarks: bookmarks.length,
    articleBookmarks: bookmarkedArticles.length,
    seriesBookmarks: bookmarkedSeries.length,
  };

  const socialLink = (raw: string) => {
    if (!raw) return null;
    return raw.startsWith('http') ? raw : `https://${raw}`;
  };

  const InlineEdit = ({ field, label, value, placeholder, multiline = false }: {
    field: string; label: string; value: string; placeholder: string; multiline?: boolean;
  }) => {
    const [draft, setDraft] = useState(value);
    const isEditing = editingField === field;

    useEffect(() => { if (!isEditing) setDraft(value); }, [value, isEditing]);

    return (
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
          {!isEditing && (
            <button
              onClick={() => { setDraft(value); setEditingField(field); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif', padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
            >
              <Edit2 size={12} /> Düzenle
            </button>
          )}
        </div>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {multiline ? (
              <textarea
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={placeholder}
                rows={3}
                style={{
                  width: '100%', padding: '0.625rem 0.75rem',
                  border: '1.5px solid #111', borderRadius: 8,
                  fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                  outline: 'none', resize: 'vertical', minHeight: 72,
                  boxSizing: 'border-box', color: '#111',
                }}
              />
            ) : (
              <input
                autoFocus
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={placeholder}
                onKeyDown={e => { if (e.key === 'Enter') saveField(field, draft); if (e.key === 'Escape') setEditingField(null); }}
                style={{
                  width: '100%', padding: '0.625rem 0.75rem',
                  border: '1.5px solid #111', borderRadius: 8,
                  fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                  outline: 'none', boxSizing: 'border-box', color: '#111',
                }}
              />
            )}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => saveField(field, draft)}
                disabled={saving}
                style={{
                  padding: '0.45rem 1rem', background: '#111', color: '#fff',
                  border: 'none', borderRadius: 7, fontSize: '0.8125rem', fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                onClick={() => setEditingField(null)}
                style={{
                  padding: '0.45rem 0.75rem', background: '#f3f4f6', color: '#374151',
                  border: 'none', borderRadius: 7, fontSize: '0.8125rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                İptal
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '0.625rem 0.75rem',
            background: '#f9fafb', borderRadius: 8,
            border: '1px solid #f3f4f6',
            fontSize: '0.875rem', color: value ? '#374151' : '#9ca3af',
            lineHeight: 1.5, minHeight: 38,
            display: 'flex', alignItems: multiline ? 'flex-start' : 'center',
          }}>
            {value || <span style={{ fontStyle: 'italic' }}>{placeholder}</span>}
            {saveSuccess === field && (
              <CheckCircle size={13} color="#16a34a" style={{ marginLeft: 'auto', flexShrink: 0 }} />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {cropFile && <AvatarCrop file={cropFile} onConfirm={handleCropConfirm} onCancel={() => setCropFile(null)} />}

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '1.5rem 1rem 5rem', fontFamily: 'Inter, sans-serif' }}>

        {/* Back */}
        <button
          onClick={() => navigate('')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '0.8125rem', fontWeight: 500,
            padding: '0 0 1.25rem', fontFamily: 'Inter, sans-serif',
          }}
        >
          <ArrowLeft size={15} /> Ana Sayfaya Dön
        </button>

        {/* ── Profile Hero Card ── */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 20, overflow: 'hidden',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}>
          {/* Cover strip */}
          <div style={{
            height: 80, background: 'linear-gradient(135deg, #111 0%, #374151 100%)',
          }} />

          {/* Avatar + info */}
          <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block', marginTop: -40 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '3px solid #fff', background: '#111',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.375rem', fontWeight: 700, color: '#c8f542',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#fff', border: '2px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLButtonElement).style.borderColor = '#374151'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; }}
                title="Fotoğraf değiştir"
              >
                <Camera size={12} color="#374151" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>

            {/* Name + role row */}
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.375rem', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>
                  {name}
                </h1>
                {profile?.title && (
                  <p style={{ margin: '0 0 0.375rem', fontSize: '0.875rem', color: '#6b7280' }}>{profile.title}</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '3px 10px', borderRadius: 20,
                    fontSize: '0.6875rem', fontWeight: 700,
                    background: roleStyle.bg, color: roleStyle.color,
                    border: `1.5px solid ${roleStyle.border}`,
                  }}>
                    {ROLE_LABELS[role] ?? role}
                  </span>
                  {membershipSettings['feature_membership'] !== 'false' && (() => {
                    const tier = (profile?.membership_tier ?? 'free') as keyof typeof MEMBERSHIP_TIERS;
                    const ts = MEMBERSHIP_TIERS[tier] ?? MEMBERSHIP_TIERS.free;
                    return (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: '0.6875rem', fontWeight: 700,
                        background: ts.bg, color: ts.color,
                        border: `1.5px solid ${ts.border}`,
                        cursor: 'pointer',
                      }}
                        onClick={() => setActiveTab('membership')}
                      >
                        {ts.icon}
                        {membershipSettings[`membership_${tier}_label`] || ts.label}
                      </span>
                    );
                  })()}
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user?.email}</span>
                </div>
              </div>

              {/* Social links */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {profile?.twitter && (
                  <a href={socialLink(profile.twitter)!} target="_blank" rel="noopener noreferrer"
                    style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', transition: 'all 0.15s', textDecoration: 'none', border: '1px solid #e5e7eb' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#111'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f3f4f6'; (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280'; }}
                  >
                    <Twitter size={14} />
                  </a>
                )}
                {profile?.instagram && (
                  <a href={socialLink(profile.instagram)!} target="_blank" rel="noopener noreferrer"
                    style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', transition: 'all 0.15s', textDecoration: 'none', border: '1px solid #e5e7eb' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#111'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f3f4f6'; (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280'; }}
                  >
                    <Instagram size={14} />
                  </a>
                )}
                {profile?.linkedin && (
                  <a href={socialLink(profile.linkedin)!} target="_blank" rel="noopener noreferrer"
                    style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', transition: 'all 0.15s', textDecoration: 'none', border: '1px solid #e5e7eb' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#111'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f3f4f6'; (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280'; }}
                  >
                    <Linkedin size={14} />
                  </a>
                )}
                {profile?.website && (
                  <a href={socialLink(profile.website)!} target="_blank" rel="noopener noreferrer"
                    style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', transition: 'all 0.15s', textDecoration: 'none', border: '1px solid #e5e7eb' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#111'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f3f4f6'; (e.currentTarget as HTMLAnchorElement).style.color = '#6b7280'; }}
                  >
                    <Globe size={14} />
                  </a>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p style={{ margin: '0.875rem 0 0', fontSize: '0.875rem', color: '#374151', lineHeight: 1.65, maxWidth: 560 }}>
                {profile.bio}
              </p>
            )}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f3f4f6' }}>
              {[
                { label: 'Kaydedilen', value: stats.totalBookmarks, icon: <Bookmark size={13} /> },
                { label: 'Makale', value: stats.articleBookmarks, icon: <FileText size={13} /> },
                { label: 'Dizi', value: stats.seriesBookmarks, icon: <BookOpen size={13} /> },
                { label: 'Takip Edilen', value: followingCount, icon: <Users size={13} /> },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span style={{ color: '#9ca3af' }}>{s.icon}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111' }}>{s.value}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{s.label}</span>
                </div>
              ))}
            </div>

            {uploadError && (
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem', color: '#dc2626' }}>{uploadError}</p>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
          display: 'flex', gap: '0',
          background: '#fff', borderRadius: '12px 12px 0 0',
          paddingLeft: '0.5rem',
        }}>
          <TabButton id="overview" label="Genel Bakış" icon={<User size={14} />} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          {membershipSettings['feature_membership'] !== 'false' && (
            <TabButton id="membership" label="Üyelik" icon={<Shield size={14} />} active={activeTab === 'membership'} onClick={() => setActiveTab('membership')} />
          )}
          <TabButton id="bookmarks" label="Kaydettiklerim" icon={<Bookmark size={14} />} active={activeTab === 'bookmarks'} count={stats.totalBookmarks} onClick={() => setActiveTab('bookmarks')} />
          <TabButton id="settings" label="Hesap Ayarları" icon={<Edit2 size={14} />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Quick edit card */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Profil Bilgileri</h2>
              <InlineEdit field="full_name" label="Ad Soyad" value={profile?.full_name ?? ''} placeholder="Adınız Soyadınız" />
              <InlineEdit field="title" label="Unvan / Tagline" value={profile?.title ?? ''} placeholder="Örn: Teknoloji yazarı, girişimci…" />
              <InlineEdit field="bio" label="Hakkımda" value={profile?.bio ?? ''} placeholder="Kendinizi kısaca tanıtın…" multiline />
            </div>

            {/* Role status */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Rol & Yetki</h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.375rem', fontSize: '0.8125rem', color: '#6b7280' }}>Mevcut rolünüz</p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 20,
                    fontSize: '0.8125rem', fontWeight: 700,
                    background: roleStyle.bg, color: roleStyle.color,
                    border: `1.5px solid ${roleStyle.border}`,
                  }}>
                    {ROLE_LABELS[role] ?? role}
                  </span>
                </div>
                {canRequest && (
                  <button
                    onClick={() => setActiveTab('settings')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.5rem 1rem', border: '1.5px solid #e5e7eb',
                      borderRadius: 8, background: '#fff', cursor: 'pointer',
                      fontSize: '0.8125rem', fontWeight: 600, color: '#374151',
                      fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#111')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  >
                    <PenLine size={13} /> Rol başvurusu yap
                    <ChevronRight size={13} />
                  </button>
                )}
              </div>

              {hasPendingRequest && (
                <div style={{
                  marginTop: '1rem', padding: '0.75rem 1rem',
                  background: '#fef3c7', border: '1px solid #fcd34d',
                  borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.8125rem', color: '#92400e', fontWeight: 500,
                }}>
                  <Clock size={14} /> Bekleyen bir başvurunuz var, inceleniyor.
                </div>
              )}
            </div>

            {/* Recent bookmarks preview */}
            {stats.totalBookmarks > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Son Kaydedilenler</h2>
                  <button
                    onClick={() => setActiveTab('bookmarks')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: '#0e8fa0', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                  >
                    Tümünü gör <ChevronRight size={13} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[...bookmarkedArticles.slice(0, 3), ...bookmarkedSeries.slice(0, 2)].slice(0, 4).map((item, i) => {
                    const isArticle = 'readingTime' in item;
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.625rem 0.75rem', borderRadius: 10,
                          border: '1px solid #f3f4f6', background: '#fafafa',
                          cursor: 'pointer', transition: 'background 0.15s',
                        }}
                        onClick={() => navigate(isArticle ? `yazi/${item.id}` : `dizi/${item.id}`)}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fafafa')}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 7, flexShrink: 0,
                          background: isArticle ? '#e0f2fe' : '#d1fae5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isArticle ? <FileText size={14} color="#0369a1" /> : <BookOpen size={14} color="#065f46" />}
                        </div>
                        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: '#9ca3af', fontWeight: 600, background: '#f3f4f6', padding: '2px 7px', borderRadius: 20, flexShrink: 0 }}>
                          {isArticle ? 'Makale' : 'Dizi'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERSHIP TAB ── */}
        {activeTab === 'membership' && membershipSettings['feature_membership'] !== 'false' && (() => {
          const currentTier = (profile?.membership_tier ?? 'free') as keyof typeof MEMBERSHIP_TIERS;
          const parsePerks = (raw: string) => raw ? raw.split('|').filter(Boolean) : [];
          const memberPerks = parsePerks(membershipSettings['membership_member_perks'] ?? 'Tüm içeriklere erişim|Yorum yapabilme|Yazıları kaydetme');
          const foundingPerks = parsePerks(membershipSettings['membership_founding_perks'] ?? 'Tüm üye avantajları|Özel kurucu rozeti|Erken erişim');
          const memberLabel = membershipSettings['membership_member_label'] || 'Üye';
          const foundingLabel = membershipSettings['membership_founding_label'] || 'Kurucu Üye';

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Current status */}
              <div style={{
                background: currentTier === 'founding'
                  ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                  : currentTier === 'member'
                    ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)'
                    : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                border: `1px solid ${MEMBERSHIP_TIERS[currentTier].border}`,
                borderRadius: 16, padding: '1.5rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: MEMBERSHIP_TIERS[currentTier].bg,
                  border: `2px solid ${MEMBERSHIP_TIERS[currentTier].border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: MEMBERSHIP_TIERS[currentTier].color, flexShrink: 0,
                }}>
                  {currentTier === 'founding' ? <Crown size={24} /> : currentTier === 'member' ? <Shield size={24} /> : <User size={24} />}
                </div>
                <div>
                  <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mevcut Üyelik</p>
                  <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 800, color: MEMBERSHIP_TIERS[currentTier].color }}>
                    {currentTier === 'free' ? 'Ücretsiz' : currentTier === 'member' ? memberLabel : foundingLabel}
                  </h2>
                  {profile?.membership_expires_at && (
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                      Son: {new Date(profile.membership_expires_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  {!profile?.membership_expires_at && currentTier !== 'free' && (
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Süresiz</p>
                  )}
                </div>
              </div>

              {/* Tier cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {/* Free */}
                <div style={{
                  background: '#fff', border: `2px solid ${currentTier === 'free' ? '#111' : '#e5e7eb'}`,
                  borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem',
                  position: 'relative',
                }}>
                  {currentTier === 'free' && (
                    <span style={{ position: 'absolute', top: -10, right: 12, background: '#111', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '2px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>
                      MEVCUT
                    </span>
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 800, color: '#111' }}>Ücretsiz</h3>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#111' }}>₺0 <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#9ca3af' }}>/ay</span></p>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {['Halka açık içerikler', 'Yorumlar ve alkışlar'].map(p => (
                      <li key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#374151' }}>
                        <CheckCircle size={13} color="#22c55e" style={{ flexShrink: 0 }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Member */}
                <div style={{
                  background: '#fff', border: `2px solid ${currentTier === 'member' ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem',
                  position: 'relative',
                  boxShadow: currentTier === 'member' ? '0 4px 20px rgba(59,130,246,0.12)' : 'none',
                }}>
                  {currentTier === 'member' && (
                    <span style={{ position: 'absolute', top: -10, right: 12, background: '#3b82f6', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '2px 10px', borderRadius: 20 }}>
                      MEVCUT
                    </span>
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Shield size={14} /> {memberLabel}
                    </h3>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#111' }}>
                      {membershipSettings['membership_member_price'] === '0' ? 'Ücretsiz' : `₺${membershipSettings['membership_member_price']}`}
                      {membershipSettings['membership_member_price'] !== '0' && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#9ca3af' }}> /ay</span>}
                    </p>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {memberPerks.map(p => (
                      <li key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#374151' }}>
                        <CheckCircle size={13} color="#3b82f6" style={{ flexShrink: 0 }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  {currentTier === 'free' && (
                    <div style={{ padding: '0.625rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 500, textAlign: 'center' }}>
                      Üyelik için site yöneticinizle iletişime geçin
                    </div>
                  )}
                </div>

                {/* Founding */}
                <div style={{
                  background: currentTier === 'founding' ? '#fffbeb' : '#fff',
                  border: `2px solid ${currentTier === 'founding' ? '#f59e0b' : '#e5e7eb'}`,
                  borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem',
                  position: 'relative',
                  boxShadow: currentTier === 'founding' ? '0 4px 20px rgba(245,158,11,0.15)' : 'none',
                }}>
                  {currentTier === 'founding' && (
                    <span style={{ position: 'absolute', top: -10, right: 12, background: '#f59e0b', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '2px 10px', borderRadius: 20 }}>
                      MEVCUT
                    </span>
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Crown size={14} /> {foundingLabel}
                    </h3>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#111' }}>
                      {membershipSettings['membership_founding_price'] === '0' ? 'Davet ile' : `₺${membershipSettings['membership_founding_price']}`}
                      {membershipSettings['membership_founding_price'] !== '0' && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#9ca3af' }}> /ay</span>}
                    </p>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {foundingPerks.map(p => (
                      <li key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#374151' }}>
                        <CheckCircle size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  {currentTier !== 'founding' && (
                    <div style={{ padding: '0.625rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: '0.75rem', color: '#92400e', fontWeight: 500, textAlign: 'center' }}>
                      Davet kodu veya yönetici atamasıyla aktifleşir
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── BOOKMARKS TAB ── */}
        {activeTab === 'bookmarks' && (() => {
          const COLL_COLORS = ['#0369a1','#065f46','#92400e','#6b21a8','#be123c','#0e8fa0','#374151'];

          const filteredBookmarks = bookmarks.filter(b => {
            if (bmFilter === 'article' && b.content_type !== 'article') return false;
            if (bmFilter === 'series' && b.content_type !== 'series') return false;
            if (bmCollection && b.collection_id !== bmCollection) return false;
            return true;
          });

          const getCollection = (id: string | null) => collections.find(c => c.id === id);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Collections row */}
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: collections.length > 0 || showNewColl ? '0.75rem' : 0 }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Folder size={13} /> Koleksiyonlar
                  </span>
                  <button
                    onClick={() => setShowNewColl(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: 7, padding: '0.3rem 0.625rem', cursor: 'pointer', fontSize: '0.75rem', color: '#374151', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#374151')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  >
                    <Plus size={11} /> Yeni
                  </button>
                </div>

                {showNewColl && (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {COLL_COLORS.map(c => (
                        <button key={c} onClick={() => setNewCollColor(c)} style={{
                          width: 18, height: 18, borderRadius: '50%', background: c, border: newCollColor === c ? '2px solid #111' : '2px solid transparent',
                          cursor: 'pointer', padding: 0, outline: 'none',
                        }} />
                      ))}
                    </div>
                    <input
                      autoFocus
                      type="text"
                      value={newCollName}
                      onChange={e => setNewCollName(e.target.value)}
                      onKeyDown={async e => {
                        if (e.key === 'Enter' && newCollName.trim()) {
                          await createCollection(newCollName, newCollColor);
                          setNewCollName(''); setShowNewColl(false);
                        }
                        if (e.key === 'Escape') { setShowNewColl(false); setNewCollName(''); }
                      }}
                      placeholder="Koleksiyon adı"
                      style={{ flex: 1, minWidth: 120, padding: '0.375rem 0.625rem', border: '1px solid #e5e7eb', borderRadius: 7, fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif', color: '#111', outline: 'none' }}
                      onFocus={e => (e.target.style.borderColor = '#374151')}
                      onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                    />
                    <button
                      onClick={async () => { if (newCollName.trim()) { await createCollection(newCollName, newCollColor); setNewCollName(''); setShowNewColl(false); } }}
                      style={{ padding: '0.375rem 0.75rem', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                      Ekle
                    </button>
                  </div>
                )}

                {collections.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    <button
                      onClick={() => setBmCollection(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.3rem 0.75rem', borderRadius: 20,
                        border: `1.5px solid ${bmCollection === null ? '#111' : '#e5e7eb'}`,
                        background: bmCollection === null ? '#111' : '#fff',
                        color: bmCollection === null ? '#fff' : '#374151',
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.15s',
                      }}
                    >
                      Tümü <span style={{ background: bmCollection === null ? 'rgba(255,255,255,0.2)' : '#f3f4f6', padding: '0 5px', borderRadius: 10, fontSize: '0.6875rem' }}>{bookmarks.length}</span>
                    </button>
                    {collections.map(col => {
                      const isActive = bmCollection === col.id;
                      const count = bookmarks.filter(b => b.collection_id === col.id).length;
                      return (
                        <div key={col.id} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          {renamingColl === col.id ? (
                            <input
                              autoFocus
                              value={renameDraft}
                              onChange={e => setRenameDraft(e.target.value)}
                              onKeyDown={async e => {
                                if (e.key === 'Enter' && renameDraft.trim()) { await renameCollection(col.id, renameDraft); setRenamingColl(null); }
                                if (e.key === 'Escape') setRenamingColl(null);
                              }}
                              onBlur={() => setRenamingColl(null)}
                              style={{ padding: '0.25rem 0.5rem', border: '1.5px solid #374151', borderRadius: 20, fontSize: '0.75rem', fontFamily: 'Inter, sans-serif', color: '#111', width: 100, outline: 'none' }}
                            />
                          ) : (
                            <button
                              onClick={() => setBmCollection(isActive ? null : col.id)}
                              onDoubleClick={() => { setRenamingColl(col.id); setRenameDraft(col.name); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                                padding: '0.3rem 0.75rem', borderRadius: 20,
                                border: `1.5px solid ${isActive ? col.color : '#e5e7eb'}`,
                                background: isActive ? col.color + '15' : '#fff',
                                color: isActive ? col.color : '#374151',
                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                transition: 'all 0.15s',
                              }}
                              title="Çift tıkla: yeniden adlandır"
                            >
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                              {col.name}
                              <span style={{ fontSize: '0.6875rem', opacity: 0.7 }}>{count}</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteCollection(col.id)}
                            title="Koleksiyonu sil"
                            style={{ marginLeft: 2, background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '2px', display: 'flex', borderRadius: 4 }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter bar */}
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {([
                  { key: 'all' as const, label: 'Tümü', icon: <Bookmark size={12} /> },
                  { key: 'article' as const, label: 'Makaleler', icon: <FileText size={12} /> },
                  { key: 'series' as const, label: 'Diziler', icon: <BookOpen size={12} /> },
                ]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setBmFilter(f.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.4rem 0.875rem', borderRadius: 8,
                      border: `1px solid ${bmFilter === f.key ? '#111' : '#e5e7eb'}`,
                      background: bmFilter === f.key ? '#111' : '#fff',
                      color: bmFilter === f.key ? '#fff' : '#6b7280',
                      fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                    }}
                  >
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>

              {/* List */}
              {filteredBookmarks.length === 0 ? (
                <div style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
                  padding: '4rem 1rem', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                }}>
                  <Bookmark size={40} color="#d1d5db" strokeWidth={1.5} />
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                    {bookmarks.length === 0 ? 'Henüz kaydedilen içerik yok' : 'Bu filtrede içerik yok'}
                  </p>
                  {bookmarks.length === 0 && (
                    <button
                      onClick={() => navigate('contents')}
                      style={{ marginTop: '0.5rem', padding: '0.6rem 1.25rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    >
                      İçeriklere Göz At
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
                  {filteredBookmarks.map((bm, i) => {
                    const isArticle = bm.content_type === 'article';
                    const item = isArticle
                      ? articles.find(a => a.id === bm.content_id)
                      : seriesList.find(s => s.id === bm.content_id);
                    if (!item) return null;
                    const col = getCollection(bm.collection_id);
                    const isEditingNote = editingNote === bm.id;

                    return (
                      <div
                        key={bm.id}
                        style={{
                          borderBottom: i < filteredBookmarks.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.875rem',
                            padding: '0.875rem 1.25rem',
                            cursor: 'pointer', transition: 'background 0.1s',
                          }}
                          onClick={() => navigate(isArticle ? `article/${item.id}` : `series/${item.id}`)}
                          onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          {/* Thumbnail */}
                          {(item as { ogImage?: string }).ogImage ? (
                            <img src={(item as { ogImage?: string }).ogImage} alt="" style={{ width: 60, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid #f3f4f6' }} />
                          ) : (
                            <div style={{ width: 60, height: 40, borderRadius: 6, background: isArticle ? '#e0f2fe' : '#d1fae5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {isArticle ? <FileText size={14} color="#0369a1" /> : <BookOpen size={14} color="#065f46" />}
                            </div>
                          )}

                          {/* Title + meta */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: '0 0 0.2rem', fontSize: '0.875rem', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                                padding: '1px 6px', borderRadius: 20,
                                background: isArticle ? '#e0f2fe' : '#d1fae5',
                                color: isArticle ? '#0369a1' : '#065f46',
                              }}>
                                {isArticle ? 'Makale' : 'Dizi'}
                              </span>
                              {isArticle && (item as { category?: string; readingTime?: number }).category && (
                                <>
                                  <span style={{ fontSize: '0.6875rem', color: '#d1d5db' }}>·</span>
                                  <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>{(item as { category?: string }).category}</span>
                                </>
                              )}
                              {col && (
                                <>
                                  <span style={{ fontSize: '0.6875rem', color: '#d1d5db' }}>·</span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.6875rem', fontWeight: 600, color: col.color }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: col.color }} />
                                    {col.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            {/* Collection assign */}
                            {collections.length > 0 && (
                              <select
                                value={bm.collection_id ?? ''}
                                onChange={e => updateBookmark(bm.id, { collection_id: e.target.value || null })}
                                style={{
                                  padding: '0.25rem 0.375rem', border: '1px solid #e5e7eb', borderRadius: 6,
                                  fontSize: '0.6875rem', fontFamily: 'Inter, sans-serif', color: '#374151',
                                  background: '#fff', cursor: 'pointer', outline: 'none', maxWidth: 90,
                                }}
                                title="Koleksiyona ekle"
                              >
                                <option value="">Koleksiyon</option>
                                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            )}
                            {/* Note toggle */}
                            <button
                              onClick={() => {
                                if (isEditingNote) { setEditingNote(null); }
                                else { setEditingNote(bm.id); setNoteDraft(bm.note ?? ''); }
                              }}
                              title="Not ekle"
                              style={{
                                background: bm.note ? '#fef9c3' : 'none', border: bm.note ? '1px solid #fde68a' : '1px solid #e5e7eb',
                                borderRadius: 6, padding: '0.25rem 0.4rem', cursor: 'pointer',
                                color: bm.note ? '#92400e' : '#9ca3af', display: 'flex', alignItems: 'center',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => { if (!bm.note) (e.currentTarget as HTMLButtonElement).style.borderColor = '#374151'; }}
                              onMouseLeave={e => { if (!bm.note) (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; }}
                            >
                              <StickyNote size={12} />
                            </button>
                            {/* Remove */}
                            <button
                              onClick={() => toggle(bm.content_type, bm.content_id)}
                              title="Kaydı kaldır"
                              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '0.25rem 0.4rem', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5'; (e.currentTarget as HTMLButtonElement).style.background = '#fff1f2'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Note editor */}
                        {isEditingNote && (
                          <div style={{ padding: '0 1.25rem 0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                            <StickyNote size={13} color="#f59e0b" style={{ marginTop: 8, flexShrink: 0 }} />
                            <textarea
                              autoFocus
                              value={noteDraft}
                              onChange={e => setNoteDraft(e.target.value)}
                              placeholder="Bu içerik için notunuz..."
                              rows={2}
                              style={{
                                flex: 1, padding: '0.5rem 0.75rem',
                                border: '1.5px solid #fde68a', borderRadius: 8,
                                fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif',
                                color: '#111', background: '#fefce8', outline: 'none', resize: 'vertical',
                              }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <button
                                onClick={async () => { await updateBookmark(bm.id, { note: noteDraft.trim() || null }); setEditingNote(null); }}
                                style={{ padding: '0.375rem 0.625rem', background: '#111', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                              >
                                <Check size={12} />
                              </button>
                              <button
                                onClick={() => setEditingNote(null)}
                                style={{ padding: '0.375rem 0.625rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 7, fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Note display */}
                        {!isEditingNote && bm.note && (
                          <div
                            style={{
                              margin: '0 1.25rem 0.75rem', padding: '0.5rem 0.75rem',
                              background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8,
                              display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
                            }}
                          >
                            <StickyNote size={12} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#713f12', lineHeight: 1.5, flex: 1 }}>{bm.note}</p>
                            <button
                              onClick={() => { setEditingNote(bm.id); setNoteDraft(bm.note ?? ''); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: 0, display: 'flex', flexShrink: 0 }}
                            >
                              <Pencil size={11} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Profile photo */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Profil Fotoğrafı</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#111', overflow: 'hidden', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 700, color: '#c8f542', flexShrink: 0 }}>
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ padding: '0.5rem 1rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: uploading ? 0.7 : 1 }}
                  >
                    <Camera size={13} style={{ display: 'inline', marginRight: 5 }} />{uploading ? 'Yükleniyor...' : 'Fotoğraf Yükle'}
                  </button>
                  {profile?.avatar_url && (
                    <button
                      onClick={handleRemoveAvatar}
                      disabled={uploading}
                      style={{ padding: '0.5rem 1rem', background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                      <Trash2 size={13} /> Kaldır
                    </button>
                  )}
                </div>
              </div>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>JPG, PNG, WebP — maks. 10 MB. Kırpma aracı ile yuvarlak fotoğraf oluşturulur.</p>
              {uploadError && <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#dc2626' }}>{uploadError}</p>}
            </div>

            {/* Personal info */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Kişisel Bilgiler</h2>
              <InlineEdit field="full_name" label="Ad Soyad" value={profile?.full_name ?? ''} placeholder="Adınız Soyadınız" />
              <InlineEdit field="title" label="Unvan / Tagline" value={profile?.title ?? ''} placeholder="Örn: Teknoloji yazarı, girişimci…" />
              <InlineEdit field="bio" label="Hakkımda" value={profile?.bio ?? ''} placeholder="Kendinizi kısaca tanıtın…" multiline />
              <div style={{ marginTop: '0.25rem', padding: '0.75rem 0.875rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #f3f4f6' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                  <strong style={{ color: '#6b7280' }}>E-posta:</strong> {user?.email} <span style={{ marginLeft: '0.25rem' }}>(değiştirilemez)</span>
                </p>
              </div>
            </div>

            {/* Social links */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Sosyal Medya & Bağlantılar</h2>
              {[
                { field: 'twitter', label: 'Twitter / X', icon: <Twitter size={13} />, placeholder: 'kullanıcı_adı veya tam URL' },
                { field: 'instagram', label: 'Instagram', icon: <Instagram size={13} />, placeholder: 'kullanıcı_adı veya tam URL' },
                { field: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={13} />, placeholder: 'linkedin.com/in/... veya tam URL' },
                { field: 'website', label: 'Web Sitesi', icon: <Globe size={13} />, placeholder: 'https://siteniz.com' },
              ].map(({ field, label, placeholder }) => (
                <InlineEdit key={field} field={field} label={label} value={(profile as Record<string, string> ?? {})[field] ?? ''} placeholder={placeholder} />
              ))}
            </div>

            {/* Role request */}
            {canRequest && (
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.375rem', fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Yazar / Editör Başvurusu</h2>
                <p style={{ margin: '0 0 1.25rem', fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.5 }}>
                  İçerik üretmek veya düzenlemek istiyorsanız aşağıdan başvurabilirsiniz. Adminler talebinizi inceleyecektir.
                </p>

                {!hasPendingRequest ? (
                  <form onSubmit={handleRoleRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Talep Edilen Rol
                      </label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {(['author', 'editor'] as const).filter(r => {
                          if (role === 'author') return r === 'editor';
                          return true;
                        }).map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRequestRole(r)}
                            style={{
                              flex: 1, padding: '0.75rem 1rem',
                              border: `2px solid ${requestRole === r ? '#111' : '#e5e7eb'}`,
                              borderRadius: 10,
                              background: requestRole === r ? '#111' : '#fff',
                              color: requestRole === r ? '#fff' : '#374151',
                              fontSize: '0.875rem', fontWeight: 700,
                              cursor: 'pointer', transition: 'all 0.15s',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            {r === 'author' ? '✦ Yazar' : '✦ Editör'}
                            <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 400, marginTop: '0.2rem', opacity: 0.7 }}>
                              {r === 'author' ? 'Kendi makalelerinizi yayınlayın' : 'Tüm içerikleri yönetin'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                        Motivasyon Mesajı <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.7rem' }}>(isteğe bağlı)</span>
                      </label>
                      <textarea
                        value={requestMessage}
                        onChange={e => setRequestMessage(e.target.value)}
                        placeholder="Neden bu rolü almak istediğinizi kısaca açıklayın..."
                        rows={3}
                        style={{
                          width: '100%', padding: '0.625rem 0.75rem',
                          border: '1.5px solid #e5e7eb', borderRadius: 8,
                          fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
                          outline: 'none', resize: 'vertical', minHeight: 72,
                          boxSizing: 'border-box', color: '#111', transition: 'border-color 0.15s',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#111')}
                        onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                      />
                    </div>

                    {requestError && <p style={{ margin: 0, fontSize: '0.8125rem', color: '#dc2626' }}>{requestError}</p>}
                    {requestSuccess && (
                      <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#166534', fontWeight: 500 }}>
                        <CheckCircle size={14} /> {requestSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                        padding: '0.7rem 1.5rem', background: '#111', color: '#fff',
                        border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700,
                        cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
                        fontFamily: 'Inter, sans-serif', transition: 'opacity 0.15s',
                      }}
                    >
                      <Send size={14} />
                      {submitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
                    </button>
                  </form>
                ) : (
                  <div style={{ padding: '0.875rem 1rem', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#92400e', fontWeight: 500 }}>
                    <Clock size={14} /> Bekleyen bir başvurunuz var, admin incelemesini bekleyiniz.
                  </div>
                )}

                {roleRequests.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem' }}>
                      Geçmiş Başvurular
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {roleRequests.map(req => {
                        const st = req.status;
                        const sc = st === 'pending'
                          ? { color: '#d97706', bg: '#fef3c7', icon: <Clock size={11} />, label: 'Beklemede' }
                          : st === 'approved'
                          ? { color: '#16a34a', bg: '#dcfce7', icon: <CheckCircle size={11} />, label: 'Onaylandı' }
                          : { color: '#dc2626', bg: '#fee2e2', icon: <XCircle size={11} />, label: 'Reddedildi' };
                        return (
                          <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', border: '1px solid #f3f4f6', borderRadius: 8, background: '#fafafa' }}>
                            <div>
                              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                                {ROLE_LABELS[req.requested_role] ?? req.requested_role} başvurusu
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.5rem' }}>
                                {new Date(req.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: '0.6875rem', fontWeight: 700, background: sc.bg, color: sc.color }}>
                              {sc.icon} {sc.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
