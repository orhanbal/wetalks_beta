import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Settings, Eye, Globe, Image, Link2, Copy, Check, Zap, Calendar, X } from 'lucide-react';
import { supabase, type DbArticle, type DbSeries } from '../lib/supabase';
import ImageUpload from './ImageUpload';
import BlockEditor from './BlockEditor';

const CATEGORIES = ['Ticaret', 'E-Ticaret', 'Marka ve Strateji', 'Girişimcilik', 'Teknoloji', 'Yapay Zekâ', 'Kişisel Notlar'];

function BlockBtn({ label, preview, onClick }: { label: string; preview: React.ReactNode; onClick: () => void }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        padding: '0.625rem 0.75rem',
        background: hover ? '#f9fafb' : '#fff',
        border: `1.5px solid ${hover ? '#d1d5db' : '#e5e7eb'}`,
        borderRadius: 10, cursor: 'pointer',
        fontFamily: 'Inter, sans-serif', textAlign: 'left',
        transition: 'background 0.12s, border-color 0.12s, transform 0.1s, box-shadow 0.1s',
        transform: hover ? 'translateY(-1px)' : '',
        boxShadow: hover ? '0 4px 12px rgba(0,0,0,0.07)' : '',
        minWidth: 110, flex: '1 1 110px',
      }}
    >
      <div style={{ pointerEvents: 'none' }}>{preview}</div>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', marginTop: 'auto' }}>{label}</div>
    </button>
  );
}


interface AdminArticleEditProps {
  id?: string;
  navigate: (to: string) => void;
  isNew?: boolean;
  userRole?: string;
  userId?: string;
}

type ProfileOption = { id: string; full_name: string | null; avatar_url: string | null };

const emptyForm = {
  id: '',
  title: '',
  supertitle: '',
  subtitle: '',
  category: 'Ticaret',
  series_id: '',
  series_title: '',
  date: new Date().toISOString().split('T')[0],
  excerpt: '',
  reading_time: 5,
  content: '',
  published: false,
  featured: false,
  members_only: false,
  boosted: false,
  og_image: '',
  author_id: '',
  friend_link_token: '',
  scheduled_at: '',
};

export default function AdminArticleEdit({ id, navigate, isNew, userRole = 'admin', userId = '' }: AdminArticleEditProps) {
  const [form, setForm] = useState(emptyForm);
  const [accessDenied, setAccessDenied] = useState(false);
  const [friendLinkCopied, setFriendLinkCopied] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({ friend_links: true, scheduling: true, boost: true });
  const [seriesList, setSeriesList] = useState<DbSeries[]>([]);
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);
  const blockEditorRef = useRef<HTMLDivElement>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  useEffect(() => {
    supabase.from('series').select('*').order('title').then(({ data }) => {
      if (data) setSeriesList(data as DbSeries[]);
    });
    supabase.from('profiles').select('id, full_name, avatar_url').order('full_name').then(({ data }) => {
      if (data) setProfileOptions(data as ProfileOption[]);
    });
    supabase.from('site_settings').select('key, value')
      .in('key', ['feature_friend_links', 'feature_scheduling', 'feature_boost'])
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((r: { key: string; value: string }) => { map[r.key] = r.value; });
          setFeatureFlags({
            friend_links: map['feature_friend_links'] !== 'false',
            scheduling: map['feature_scheduling'] !== 'false',
            boost: map['feature_boost'] !== 'false',
          });
        }
      });
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      supabase.from('articles').select('*').eq('id', id).maybeSingle().then(({ data }) => {
        if (data) {
          const a = data as DbArticle;
          if (userRole === 'author' && userId && a.author_id !== userId) {
            setAccessDenied(true);
            return;
          }
          setForm({
            id: a.id,
            title: a.title,
            supertitle: a.supertitle ?? '',
            subtitle: a.subtitle ?? '',
            category: a.category,
            series_id: a.series_id ?? '',
            series_title: a.series_title ?? '',
            date: a.date,
            excerpt: a.excerpt,
            reading_time: a.reading_time,
            content: a.content,
            published: a.published,
            featured: a.featured ?? false,
            members_only: (a as any).members_only ?? false,
            boosted: (a as any).boosted ?? false,
            og_image: a.og_image ?? '',
            author_id: a.author_id ?? '',
            friend_link_token: (a as any).friend_link_token ?? '',
            scheduled_at: (a as any).scheduled_at ? new Date((a as any).scheduled_at).toISOString().slice(0, 16) : '',
          });
          setTimeout(() => { isInitialLoad.current = false; }, 0);
        }
      });
    } else {
      isInitialLoad.current = false;
    }
  }, [id, isNew, userRole, userId]);

  // Autosave: trigger 3s after last change, only for existing articles
  useEffect(() => {
    if (isInitialLoad.current) return;
    if (isNew || !id) return;
    if (!isDirty) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!form.title.trim()) return;
      setAutoSaveStatus('saving');
      await supabase.from('articles').update({
        title: form.title,
        supertitle: form.supertitle || null,
        subtitle: form.subtitle || null,
        category: form.category,
        series_id: form.series_id || null,
        series_title: form.series_title || null,
        date: form.date,
        excerpt: form.excerpt,
        reading_time: form.reading_time,
        content: form.content,
        published: form.published,
        featured: form.featured,
        members_only: form.members_only,
        boosted: form.boosted,
        og_image: form.og_image || null,
        author_id: form.author_id || null,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
      setAutoSaveStatus('saved');
      setIsDirty(false);
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 3000);

    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [form, isDirty, id, isNew]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;
      switch (e.key) {
        case 'H': e.preventDefault(); insertHighlight('tip'); break;
        case 'K': e.preventDefault(); insertHighlight('default'); break;
        case 'W': e.preventDefault(); insertHighlight('warning'); break;
        case 'I': e.preventDefault(); insertHighlight('info'); break;
        case 'Q': e.preventDefault(); insertPullquote(); break;
        case 'B': e.preventDefault(); insertCallout(); break;
        case 'L': e.preventDefault(); insertList(); break;
        case 'O': e.preventDefault(); insertOrderedList(); break;
        case 'E': e.preventDefault(); insertCode(); break;
        case 'S': e.preventDefault(); insertStat(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSeriesChange = (seriesId: string) => {
    const found = seriesList.find(s => s.id === seriesId);
    setForm(f => ({ ...f, series_id: seriesId, series_title: found?.title ?? '' }));
    setIsDirty(true);
  };

  const change = <K extends keyof typeof emptyForm>(key: K, value: typeof emptyForm[K]) => {
    setForm(f => {
      const updated = { ...f, [key]: value };
      if (key === 'content') {
        const words = (value as string).trim().split(/\s+/).filter(Boolean).length;
        updated.reading_time = Math.max(1, Math.round(words / 200));
      }
      return updated;
    });
    setIsDirty(true);
  };

  const handleSave = async (publishState?: boolean) => {
    if (!form.title.trim()) { setError('Başlık zorunludur.'); return; }
    if (!form.excerpt.trim()) { setError('Özet zorunludur.'); return; }
    if (!form.content.trim()) { setError('İçerik zorunludur.'); return; }
    setError('');
    setSaving(true);

    const shouldPublish = publishState !== undefined ? publishState : form.published;

    const payload = {
      id: isNew ? (form.id || generateId(form.title)) : form.id,
      title: form.title,
      supertitle: form.supertitle || null,
      subtitle: form.subtitle || null,
      category: form.category,
      series_id: form.series_id || null,
      series_title: form.series_title || null,
      date: form.date,
      excerpt: form.excerpt,
      reading_time: form.reading_time,
      content: form.content,
      published: shouldPublish,
      featured: form.featured,
      members_only: form.members_only,
      boosted: form.boosted,
      og_image: form.og_image || null,
      author_id: form.author_id || null,
      scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      const { error: err } = await supabase.from('articles').insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('articles').update(payload).eq('id', payload.id);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setSaved(true);
    setForm(f => ({ ...f, published: shouldPublish }));
    setTimeout(() => setSaved(false), 2000);
    if (isNew) navigate('admin/articles');
  };

  function appendBlock(raw: string) {
    const el = blockEditorRef.current as (HTMLDivElement & { appendBlock?: (r: string) => void }) | null;
    el?.appendBlock?.(raw);
  }

  const insertImage = (url: string) => {
    appendBlock(`![](${url})`);
    setShowImagePicker(false);
  };

  const insertHighlight = (type: string = 'tip') => {
    const emojiMap: Record<string, string> = { default: '📌', tip: '💡', info: 'ℹ️', warning: '⚠️' };
    const emoji = emojiMap[type] ?? '📌';
    appendBlock(`:::highlight[${emoji}|${type}]\n**Başlık: Açıklama buraya gelir.**\n:::`);
  };

  const insertPullquote = () => appendBlock('> Alıntı metni buraya gelir.\n> — Kaynak');
  const insertCallout  = () => appendBlock(':::callout[Başlık]\nİçerik buraya gelir. **Kalın** ve *italik* kullanabilirsin.\n:::');
  const insertStat     = () => appendBlock(':::stat[%74|Açıklama metni]:::');
  const insertList     = () => appendBlock('- Birinci madde\n- İkinci madde\n- Üçüncü madde');
  const insertOrderedList = () => appendBlock('1. Birinci adım\n2. İkinci adım\n3. Üçüncü adım');
  const insertCode     = () => appendBlock('```\nkod buraya\n```');

  const handleGenerateFriendLink = async () => {
    if (!id || isNew) return;
    setGeneratingToken(true);
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
    await supabase.from('articles').update({ friend_link_token: token }).eq('id', id);
    setForm(f => ({ ...f, friend_link_token: token }));
    setGeneratingToken(false);
  };

  const handleRevokeFriendLink = async () => {
    if (!id || isNew) return;
    await supabase.from('articles').update({ friend_link_token: null }).eq('id', id);
    setForm(f => ({ ...f, friend_link_token: '' }));
  };

  const copyFriendLink = () => {
    const url = `${window.location.origin}/${isNew ? '' : `yazi/${form.id}?fl=${form.friend_link_token}`}`;
    navigator.clipboard.writeText(url);
    setFriendLinkCopied(true);
    setTimeout(() => setFriendLinkCopied(false), 2000);
  };

  const [notifying, setNotifying] = useState(false);
  const [notifySent, setNotifySent] = useState(false);
  const [notifyError, setNotifyError] = useState('');

  const handleNotify = async () => {
    if (!id || isNew || !form.published) return;
    setNotifying(true);
    setNotifyError('');
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/notify-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ article_id: id, notify_followers: true, notify_subscribers: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setNotifySent(true);
        setTimeout(() => setNotifySent(false), 3000);
      } else {
        setNotifyError(data.error ?? 'Gönderim hatası');
      }
    } catch (e) {
      setNotifyError((e as Error).message);
    }
    setNotifying(false);
  };

  const handleSchedule = async () => {
    if (!form.scheduled_at || !id || isNew) return;
    await supabase.from('articles').update({
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      published: false,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    setForm(f => ({ ...f, published: false }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  function generateId(title: string) {
    return title.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb',
    borderRadius: 6, fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
    outline: 'none', boxSizing: 'border-box', color: '#111', background: '#fff',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem',
  };

  if (accessDenied) {
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
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>Bu makaleye erişim yetkiniz yok</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Yalnızca kendi makalelerinizi düzenleyebilirsiniz.</p>
        <button
          onClick={() => navigate('admin/articles')}
          style={{
            marginTop: '0.5rem', padding: '0.6rem 1.25rem',
            background: '#111', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          Makalelere Dön
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
      {/* Top toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem', height: 52, borderBottom: '1px solid #e5e7eb',
        background: '#fff', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('admin/articles')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#6b7280',
              padding: '0.375rem 0.5rem', borderRadius: 6,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f3f4f6'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
          >
            <ArrowLeft size={15} />
            Makaleler
          </button>

          {(saving || autoSaveStatus === 'saving') && (
            <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>Kaydediliyor...</span>
          )}
          {!saving && autoSaveStatus === 'saved' && (
            <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>Kaydedildi</span>
          )}
          {!saving && saved && autoSaveStatus !== 'saved' && (
            <span style={{ fontSize: '0.8125rem', color: '#22c55e', fontWeight: 500 }}>Kaydedildi</span>
          )}
          {error && (
            <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{error}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => form.id && navigate(`article/${isNew ? generateId(form.title) : form.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              background: 'none', border: '1px solid #e5e7eb', borderRadius: 6,
              padding: '0.45rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#374151',
            }}
          >
            <Eye size={13} />
            Önizle
          </button>

          {form.published ? (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              style={{
                background: '#fff', color: '#374151', border: '1px solid #e5e7eb',
                borderRadius: 6, padding: '0.45rem 0.875rem',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1,
              }}
            >
              Yayından Al
            </button>
          ) : (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              style={{
                background: '#fff', color: '#374151', border: '1px solid #e5e7eb',
                borderRadius: 6, padding: '0.45rem 0.875rem',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
            </button>
          )}

          {!form.published && featureFlags.scheduling && form.scheduled_at && !isNew && (
            <button
              onClick={handleSchedule}
              disabled={saving}
              title={`${new Date(form.scheduled_at).toLocaleString('tr-TR')} tarihinde yayınla`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6,
                padding: '0.45rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1,
              }}
            >
              <Calendar size={13} />
              Zamanla
            </button>
          )}
          {!form.published && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: '#111', color: '#fff', border: 'none', borderRadius: 6,
                padding: '0.45rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1,
              }}
            >
              <Globe size={13} />
              Yayınla
            </button>
          )}

          {form.published && !isNew && (
            <button
              onClick={handleNotify}
              disabled={notifying}
              title="Takipçilere ve newsletter abonelerine bildirim gönder"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                background: notifySent ? '#f0fdf4' : '#fff',
                color: notifySent ? '#16a34a' : '#374151',
                border: `1px solid ${notifySent ? '#bbf7d0' : notifyError ? '#fecaca' : '#e5e7eb'}`,
                borderRadius: 6, padding: '0.45rem 0.875rem',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', opacity: notifying ? 0.6 : 1,
                transition: 'all 0.15s',
              }}
            >
              {notifySent
                ? <><Check size={13} /> Gönderildi</>
                : notifying
                  ? 'Gönderiliyor...'
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg> Bildirim Gönder</>
              }
            </button>
          )}
          {notifyError && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {notifyError}
            </span>
          )}

          <button
            onClick={() => setSettingsOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, background: settingsOpen ? '#f3f4f6' : 'none',
              border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor */}
        <div data-editor-scroll style={{ flex: 1, overflowY: 'auto', padding: '3rem 4rem' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
            {/* Feature image area */}
            {form.og_image && (
              <div style={{ marginBottom: '1.5rem', borderRadius: 8, overflow: 'hidden' }}>
                <img src={form.og_image} alt="" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            {/* Title */}
            <textarea
              value={form.title}
              onChange={e => change('title', e.target.value)}
              placeholder="Makale başlığı"
              rows={2}
              style={{
                width: '100%', border: 'none', outline: 'none', resize: 'none',
                fontFamily: 'Inter, sans-serif', fontSize: '2rem', fontWeight: 700,
                color: '#111', lineHeight: 1.3, letterSpacing: '-0.03em',
                marginBottom: '0.75rem', background: 'transparent',
                boxSizing: 'border-box', overflow: 'hidden',
              }}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = 'auto';
                t.style.height = t.scrollHeight + 'px';
              }}
            />

            {/* Top toolbar: image only */}
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.5rem', position: 'relative' }}>
              <button
                type="button"
                title="Görsel ekle"
                onClick={() => setShowImagePicker(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  background: showImagePicker ? '#f3f4f6' : 'none',
                  border: '1px solid #e5e7eb', borderRadius: 6,
                  padding: '0.3rem 0.625rem', fontSize: '0.8rem', fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#6b7280',
                }}
              >
                <Image size={13} /> Görsel Ekle
              </button>

              {showImagePicker && (
                <>
                  {/* Backdrop */}
                  <div
                    onClick={() => setShowImagePicker(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                  />
                  <div style={{
                    position: 'absolute', top: '110%', left: 0, zIndex: 50,
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '0.875rem',
                    width: 420,
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
                      Görsel ekle
                    </div>
                    <ImageUpload
                      value=""
                      onChange={url => { if (url) insertImage(url); }}
                      folder="articles"
                    />
                  </div>
                </>
              )}
            </div>

            {/* WYSIWYG block editor */}
            <BlockEditor
              ref={blockEditorRef}
              value={form.content}
              onChange={v => change('content', v)}
            />

            {/* ── Block palette ─────────────────────────────── */}
            <div style={{
              marginTop: '2.5rem',
              borderTop: '1px solid #f3f4f6',
              paddingTop: '1.5rem',
            }}>
              <div style={{
                fontSize: '0.7rem', fontWeight: 700, color: '#d1d5db',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: '1rem',
              }}>
                Blok Ekle
              </div>

              {/* Highlights row */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Vurgu Kutuları
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {([
                    { type: 'default', emoji: '📌', label: 'Genel Not', bg: '#f3f4f6', border: '#d1d5db', titleColor: '#374151' },
                    { type: 'tip',     emoji: '💡', label: 'İpucu',     bg: '#fefce8', border: '#fde68a', titleColor: '#713f12' },
                    { type: 'info',    emoji: 'ℹ️',  label: 'Bilgi',    bg: '#eff6ff', border: '#bfdbfe', titleColor: '#1e40af' },
                    { type: 'warning', emoji: '⚠️', label: 'Uyarı',    bg: '#fff7ed', border: '#fed7aa', titleColor: '#9a3412' },
                  ] as { type: string; emoji: string; label: string; bg: string; border: string; titleColor: string }[]).map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => insertHighlight(opt.type)}
                      title={`${opt.label} bloğu ekle`}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                        padding: '0.625rem 0.875rem',
                        background: opt.bg, border: `1.5px solid ${opt.border}`,
                        borderRadius: 10, cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif', textAlign: 'left',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                        minWidth: 140, flex: '1 1 140px',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.transform = '';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
                      }}
                    >
                      <span style={{ fontSize: '1rem', lineHeight: 1, marginTop: 2, flexShrink: 0 }}>{opt.emoji}</span>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: opt.titleColor, lineHeight: 1.2 }}>{opt.label}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2, lineHeight: 1.3 }}>Başlık: Açıklama...</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other blocks row */}
              <div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.5rem', fontWeight: 500 }}>
                  İçerik Blokları
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {/* Pullquote */}
                  <BlockBtn
                    label="Alıntı"
                    onClick={insertPullquote}
                    preview={
                      <div style={{ borderLeft: '3px solid #111', paddingLeft: '0.6rem' }}>
                        <div style={{ fontSize: '0.7rem', fontStyle: 'italic', color: '#374151', lineHeight: 1.4 }}>"Metin..."</div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: 2 }}>— Kaynak</div>
                      </div>
                    }
                  />
                  {/* Callout */}
                  <BlockBtn
                    label="Callout"
                    onClick={insertCallout}
                    preview={
                      <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '2px 6px', fontSize: '0.6rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Başlık</div>
                        <div style={{ padding: '4px 6px', fontSize: '0.65rem', color: '#374151' }}>İçerik metni...</div>
                      </div>
                    }
                  />
                  {/* Stat */}
                  <BlockBtn
                    label="İstatistik"
                    onClick={insertStat}
                    preview={
                      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#111', lineHeight: 1, letterSpacing: '-0.04em' }}>%74</div>
                        <div style={{ fontSize: '0.6rem', color: '#6b7280', marginTop: 1 }}>Açıklama</div>
                      </div>
                    }
                  />
                  {/* UL */}
                  <BlockBtn
                    label="Madde Listesi"
                    onClick={insertList}
                    preview={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {['Madde 1', 'Madde 2', 'Madde 3'].map(t => (
                          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#111', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.65rem', color: '#374151' }}>{t}</span>
                          </div>
                        ))}
                      </div>
                    }
                  />
                  {/* OL */}
                  <BlockBtn
                    label="Numaralı Liste"
                    onClick={insertOrderedList}
                    preview={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {['Birinci adım', 'İkinci adım', 'Üçüncü adım'].map((t, i) => (
                          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#111', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#fff' }}>{i + 1}</span>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: '#374151' }}>{t}</span>
                          </div>
                        ))}
                      </div>
                    }
                  />
                  {/* Code */}
                  <BlockBtn
                    label="Kod Bloğu"
                    onClick={insertCode}
                    preview={
                      <div style={{ background: '#0f172a', borderRadius: 5, padding: '5px 8px' }}>
                        <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: '#94a3b8', lineHeight: 1.6 }}>
                          <div><span style={{ color: '#7dd3fc' }}>const</span> <span style={{ color: '#e2e8f0' }}>x</span> = <span style={{ color: '#86efac' }}>42</span>;</div>
                          <div><span style={{ color: '#7dd3fc' }}>return</span> <span style={{ color: '#e2e8f0' }}>x</span>;</div>
                        </div>
                      </div>
                    }
                  />
                  {/* HR */}
                  <BlockBtn
                    label="Ayırıcı"
                    onClick={() => appendBlock('---')}
                    preview={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0' }}>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                        <div style={{ fontSize: '0.65rem', color: '#d1d5db', letterSpacing: '0.2em' }}>· · ·</div>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                      </div>
                    }
                  />
                </div>
              </div>
            </div>
            {/* ── end block palette ── */}
          </div>
        </div>

        {/* Settings panel */}
        {settingsOpen && (
          <div style={{
            width: 320, borderLeft: '1px solid #e5e7eb', overflowY: 'auto',
            background: '#fff', flexShrink: 0,
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', margin: 0 }}>Makale ayarları</h3>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {isNew && (
                <div>
                  <label style={labelStyle}>Makale URL'si</label>
                  <input
                    type="text"
                    value={form.id || (form.title ? generateId(form.title) : '')}
                    onChange={e => change('id', e.target.value)}
                    placeholder="makale-slug"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#374151'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                  />
                </div>
              )}

              <div>
                <label style={labelStyle}>Yayın tarihi</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => change('date', e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                />
              </div>

              <div>
                <label style={labelStyle}>Kategori</label>
                <select
                  value={form.category}
                  onChange={e => change('category', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Dizi</label>
                <select
                  value={form.series_id}
                  onChange={e => handleSeriesChange(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                >
                  <option value="">— Dizi yok —</option>
                  {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>
                  Okuma süresi
                  <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6 }}>(içerikten otomatik)</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.reading_time}
                    readOnly
                    style={{ ...inputStyle, width: 80, background: '#f9fafb', cursor: 'default', color: '#6b7280' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>dk</span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Üst başlık <span style={{ fontWeight: 400, color: '#9ca3af' }}>(bölüm / kategori etiketi)</span></label>
                <input
                  type="text"
                  value={form.supertitle}
                  onChange={e => change('supertitle', e.target.value)}
                  placeholder="örn: BÖLÜM I — TİCARETİN İÇİNE GİRMEK"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                />
              </div>

              <div>
                <label style={labelStyle}>Alt başlık <span style={{ fontWeight: 400, color: '#9ca3af' }}>(makale başlığının altında)</span></label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={e => change('subtitle', e.target.value)}
                  placeholder="örn: 1. Ne Satabiliriz?"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                />
              </div>

              <div>
                <label style={labelStyle}>Makale alıntısı</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => change('excerpt', e.target.value)}
                  placeholder="Kısa bir özet / teaser..."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                />
              </div>

              <div>
                <label style={labelStyle}>Yazar</label>
                {(() => {
                  const selected = profileOptions.find(p => p.id === form.author_id);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {selected && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.625rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: '#e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280' }}>
                            {selected.avatar_url
                              ? <img src={selected.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              : (selected.full_name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                            }
                          </div>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111' }}>{selected.full_name ?? selected.id}</span>
                        </div>
                      )}
                      <select
                        value={form.author_id}
                        onChange={e => change('author_id', e.target.value)}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                        onFocus={e => { e.target.style.borderColor = '#374151'; }}
                        onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                      >
                        <option value="">— Yazar seç —</option>
                        {profileOptions.map(p => (
                          <option key={p.id} value={p.id}>{p.full_name ?? p.id}</option>
                        ))}
                      </select>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label style={labelStyle}>Kapak görseli</label>
                <ImageUpload
                  value={form.og_image}
                  onChange={url => change('og_image', url)}
                  folder="articles"
                />
              </div>

              {/* Featured toggle */}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem',
                  background: form.featured ? '#fffbeb' : '#f9fafb',
                  border: `1px solid ${form.featured ? '#fde68a' : '#e5e7eb'}`,
                  borderRadius: 8, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                  onClick={() => change('featured', !form.featured)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={form.featured ? '#f59e0b' : 'none'} stroke={form.featured ? '#f59e0b' : '#9ca3af'} strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111' }}>Ön plana çıkar</div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 1 }}>Anasayfa slider'ında göster</div>
                    </div>
                  </div>
                  {/* Toggle switch */}
                  <div style={{
                    width: 36, height: 20, borderRadius: 10, position: 'relative',
                    background: form.featured ? '#f59e0b' : '#d1d5db',
                    transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: form.featured ? 18 : 2,
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                </div>
              </div>

              {/* Members Only */}
              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Üye Erişimi</div>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem',
                    background: form.members_only ? '#eff6ff' : '#f9fafb',
                    border: `1px solid ${form.members_only ? '#bfdbfe' : '#e5e7eb'}`,
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onClick={() => change('members_only', !form.members_only)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={form.members_only ? '#3b82f6' : '#9ca3af'} strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: form.members_only ? '#1d4ed8' : '#6b7280' }}>
                      {form.members_only ? 'Yalnızca üyeler' : 'Herkese açık'}
                    </span>
                  </div>
                  <div style={{
                    width: 36, height: 20, borderRadius: 10, position: 'relative',
                    background: form.members_only ? '#3b82f6' : '#d1d5db',
                    transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: form.members_only ? 18 : 2,
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s',
                    }} />
                  </div>
                </div>
              </div>

              {/* Boost */}
              {featureFlags.boost && (
                <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.625rem 0.75rem',
                      background: form.boosted ? '#fff7ed' : '#f9fafb',
                      border: `1px solid ${form.boosted ? '#fed7aa' : '#e5e7eb'}`,
                      borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onClick={() => change('boosted', !form.boosted)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Zap size={15} color={form.boosted ? '#f97316' : '#9ca3af'} />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111' }}>Editörün Seçimi</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 1 }}>Öne çıkar — Boost rozeti ekler</div>
                      </div>
                    </div>
                    <div style={{
                      width: 36, height: 20, borderRadius: 10, position: 'relative',
                      background: form.boosted ? '#f97316' : '#d1d5db',
                      transition: 'background 0.2s', flexShrink: 0,
                    }}>
                      <div style={{
                        position: 'absolute', top: 2, left: form.boosted ? 18 : 2,
                        width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s',
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduling */}
              {featureFlags.scheduling && !form.published && (
                <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Calendar size={13} /> İleri Tarihli Yayın
                  </div>
                  <input
                    type="datetime-local"
                    value={form.scheduled_at}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={e => change('scheduled_at', e.target.value)}
                    style={{ ...inputStyle, fontSize: '0.8125rem' }}
                    onFocus={e => { e.target.style.borderColor = '#374151'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                  />
                  {form.scheduled_at && (
                    <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: '0.375rem 0 0' }}>
                      Kaydet sonra toolbar'daki "Zamanla" butonuna tıkla.
                    </p>
                  )}
                </div>
              )}

              {/* Friend Link */}
              {featureFlags.friend_links && form.members_only && !isNew && (
                <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Link2 size={13} /> Friend Link
                  </div>
                  {form.friend_link_token ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{
                        padding: '0.5rem 0.625rem', background: '#f0fdf4', border: '1px solid #bbf7d0',
                        borderRadius: 6, fontSize: '0.7rem', fontFamily: 'monospace', color: '#166534',
                        wordBreak: 'break-all',
                      }}>
                        {`${window.location.origin}/yazi/${form.id}?fl=${form.friend_link_token}`}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={copyFriendLink}
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                            padding: '0.45rem', border: '1px solid #e5e7eb', borderRadius: 6,
                            background: friendLinkCopied ? '#f0fdf4' : '#fff', color: friendLinkCopied ? '#16a34a' : '#374151',
                            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.15s',
                          }}
                        >
                          {friendLinkCopied ? <><Check size={12} /> Kopyalandı</> : <><Copy size={12} /> Kopyala</>}
                        </button>
                        <button
                          onClick={handleRevokeFriendLink}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0.45rem 0.625rem', border: '1px solid #fecaca', borderRadius: 6,
                            background: '#fff', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                          }}
                          title="Linki iptal et"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateFriendLink}
                      disabled={generatingToken}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                        padding: '0.5rem', border: '1px dashed #d1d5db', borderRadius: 6,
                        background: '#f9fafb', color: '#6b7280', fontSize: '0.8125rem', fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                      }}
                    >
                      <Link2 size={13} />
                      {generatingToken ? 'Oluşturuluyor...' : 'Paylaşım Linki Oluştur'}
                    </button>
                  )}
                  <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: '0.375rem 0 0', lineHeight: 1.5 }}>
                    Bu linkle üye olmayanlar da makaleyi okuyabilir.
                  </p>
                </div>
              )}

              {/* Status */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Durum</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  background: form.published ? '#f0fdf4' : form.scheduled_at ? '#eff6ff' : '#f9fafb',
                  border: `1px solid ${form.published ? '#bbf7d0' : form.scheduled_at ? '#bfdbfe' : '#e5e7eb'}`,
                  borderRadius: 6,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: form.published ? '#22c55e' : form.scheduled_at ? '#3b82f6' : '#9ca3af',
                  }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: form.published ? '#16a34a' : form.scheduled_at ? '#1d4ed8' : '#6b7280' }}>
                    {form.published ? 'Yayında' : form.scheduled_at ? `Zamanlandı — ${new Date(form.scheduled_at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Taslak'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
