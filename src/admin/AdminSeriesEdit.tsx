import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, X, GripVertical, FileText, ChevronRight, ChevronDown, FolderOpen, Bell, Check, Users } from 'lucide-react';
import { supabase, type DbSeries, type SeriesOutlineNode } from '../lib/supabase';
import ImageUpload from './ImageUpload';

// _slots is a UI-only field to keep empty rows visible before saving
type NodeWithSlots = SeriesOutlineNode & { _slots?: string[] };

interface AdminSeriesEditProps {
  id?: string;
  navigate: (to: string) => void;
  isNew?: boolean;
  userRole?: string;
  userId?: string;
}

const emptyForm = {
  id: '',
  title: '',
  tagline: '',
  description: '',
  concept_description: '',
  topics: [] as string[],
  outline: [] as SeriesOutlineNode[],
  article_count: 0,
  og_image: '',
  logo_url: '',
  author_id: '',
};

interface ArticleOption {
  id: string;
  title: string;
}

interface ProfileOption {
  id: string;
  full_name: string | null;
}

function nid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Recursive helpers ────────────────────────────────────────────────────────

function addNodeAtPath(
  nodes: SeriesOutlineNode[],
  path: number[],
  newNode: SeriesOutlineNode,
): SeriesOutlineNode[] {
  if (path.length === 0) {
    return [...nodes, newNode];
  }
  return nodes.map((n, i) => {
    if (i === path[0]) {
      const children = addNodeAtPath(n.children ?? [], path.slice(1), newNode);
      return { ...n, children };
    }
    return n;
  });
}

function removeNodeAtPath(
  nodes: SeriesOutlineNode[],
  path: number[],
): SeriesOutlineNode[] {
  if (path.length === 1) {
    return nodes.filter((_, i) => i !== path[0]).map((n, i) => ({ ...n, order: i + 1 }));
  }
  return nodes.map((n, i) => {
    if (i === path[0]) {
      return { ...n, children: removeNodeAtPath(n.children ?? [], path.slice(1)) };
    }
    return n;
  });
}

function updateNodeAtPath(
  nodes: SeriesOutlineNode[],
  path: number[],
  updater: (n: SeriesOutlineNode) => SeriesOutlineNode,
): SeriesOutlineNode[] {
  if (path.length === 1) {
    return nodes.map((n, i) => (i === path[0] ? updater(n) : n));
  }
  return nodes.map((n, i) => {
    if (i === path[0]) {
      return { ...n, children: updateNodeAtPath(n.children ?? [], path.slice(1), updater) };
    }
    return n;
  });
}

function reorderNodes(
  nodes: SeriesOutlineNode[],
  path: number[],
  fromIndex: number,
  toIndex: number,
): SeriesOutlineNode[] {
  if (path.length === 0) {
    const arr = [...nodes];
    const [moved] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, moved);
    return arr.map((n, i) => ({ ...n, order: i + 1 }));
  }
  return nodes.map((n, i) => {
    if (i === path[0]) {
      return { ...n, children: reorderNodes(n.children ?? [], path.slice(1), fromIndex, toIndex) };
    }
    return n;
  });
}

// ── Tree Node Editor ─────────────────────────────────────────────────────────

interface NodeEditorProps {
  node: SeriesOutlineNode;
  path: number[];
  articleOptions: ArticleOption[];
  inputStyle: React.CSSProperties;
  onUpdate: (path: number[], updater: (n: SeriesOutlineNode) => SeriesOutlineNode) => void;
  onRemove: (path: number[]) => void;
  onAddChild: (path: number[]) => void;
  onDragStart: (path: number[]) => void;
  onDragOver: (e: React.DragEvent, path: number[]) => void;
  onDrop: (path: number[]) => void;
  dragPath: number[] | null;
  dragOverPath: number[] | null;
}

function pathsEqual(a: number[] | null, b: number[]) {
  if (!a) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function NodeEditor({
  node, path, articleOptions, inputStyle,
  onUpdate, onRemove, onAddChild,
  onDragStart, onDragOver, onDrop,
  dragPath, dragOverPath,
}: NodeEditorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isGroup = !node.article_id && (node.children?.length ?? 0) > 0;
  const depth = path.length - 1;
  const isDragging = pathsEqual(dragPath, path);
  const isDragOver = pathsEqual(dragOverPath, path);

  return (
    <div style={{ opacity: isDragging ? 0.4 : 1 }}>
      <div
        draggable
        onDragStart={e => { e.stopPropagation(); onDragStart(path); }}
        onDragOver={e => { e.stopPropagation(); onDragOver(e, path); }}
        onDrop={e => { e.stopPropagation(); onDrop(path); }}
        onDragEnd={e => { e.stopPropagation(); }}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.4rem',
          padding: '0.625rem 0.75rem',
          borderRadius: 8,
          border: `1px solid ${isDragOver ? '#374151' : '#e5e7eb'}`,
          background: isDragOver ? '#f3f4f6' : depth === 0 ? '#fff' : '#fafafa',
          marginBottom: '0.375rem',
          marginLeft: depth > 0 ? `${depth * 1.5}rem` : 0,
          transition: 'all 0.1s',
        }}
      >
        {/* Drag handle */}
        <div style={{ cursor: 'grab', color: '#d1d5db', paddingTop: 7, flexShrink: 0 }}>
          <GripVertical size={13} />
        </div>

        {/* Order badge */}
        {depth === 0 ? (
          <div style={{
            padding: '0.1875rem 0.5rem',
            borderRadius: 4,
            background: '#111',
            fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.06em',
            color: '#fff', flexShrink: 0, marginTop: 7, whiteSpace: 'nowrap',
          }}>
            BÖLÜM {node.order}
          </div>
        ) : (
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            background: '#e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.625rem', fontWeight: 800,
            color: '#6b7280', flexShrink: 0, marginTop: 6,
          }}>
            {node.order}
          </div>
        )}

        {/* Fields */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <input
            type="text"
            value={node.title}
            onChange={e => onUpdate(path, n => ({ ...n, title: e.target.value }))}
            placeholder={depth === 0 ? 'Bölüm adı (örn: Giriş, Temel Kavramlar...)' : 'Alt başlık'}
            style={{
              ...inputStyle,
              fontSize: '0.8125rem',
              fontWeight: depth === 0 ? 700 : 400,
              background: depth === 0 ? '#fff' : '#fafafa',
            }}
            onFocus={e => { e.target.style.borderColor = '#374151'; }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
          />

          {/* Article links — only on leaf nodes */}
          {(node.children ?? []).length === 0 && (() => {
            // Display slots: preserve empty strings so new rows stay visible
            const slots: string[] = (node as NodeWithSlots)._slots
              ?? (node.article_ids?.length
                ? node.article_ids
                : node.article_id ? [node.article_id] : ['']);

            const updateSlots = (next: string[]) => {
              const clean = next.filter(Boolean);
              onUpdate(path, n => ({
                ...n,
                _slots: next,
                article_ids: clean.length > 0 ? clean : undefined,
                article_id: clean[0] ?? undefined,
              } as NodeWithSlots));
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {slots.map((aid, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <FileText size={11} color={aid ? '#22c55e' : '#d1d5db'} />
                    <select
                      value={aid}
                      onChange={e => {
                        const next = [...slots];
                        next[idx] = e.target.value;
                        updateSlots(next);
                      }}
                      style={{
                        flex: 1, padding: '0.3rem 0.5rem',
                        border: '1px solid #e5e7eb', borderRadius: 5,
                        fontSize: '0.75rem', fontFamily: 'Inter, sans-serif',
                        color: aid ? '#111' : '#9ca3af',
                        background: '#fff', outline: 'none', cursor: 'pointer',
                      }}
                    >
                      <option value="">Makale bağlanmadı</option>
                      {articleOptions.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                      ))}
                    </select>
                    {slots.length > 1 && (
                      <button
                        onClick={() => updateSlots(slots.filter((_, i) => i !== idx))}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '0.2rem', color: '#d1d5db', display: 'flex', alignItems: 'center', flexShrink: 0,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'; }}
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => updateSlots([...slots, ''])}
                  style={{
                    alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.25rem',
                    background: 'none', border: '1px dashed #d1d5db', borderRadius: 4,
                    padding: '0.2rem 0.5rem', fontSize: '0.6875rem', color: '#9ca3af',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#374151'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db'; (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'; }}
                >
                  <Plus size={10} /> Makale Ekle
                </button>
              </div>
            );
          })()}
        </div>

        {/* Collapse toggle for groups */}
        {(node.children?.length ?? 0) > 0 && (
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Genişlet' : 'Daralt'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.25rem', color: '#9ca3af', flexShrink: 0, marginTop: 4,
              borderRadius: 4, display: 'flex', alignItems: 'center',
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        )}

        {/* Add child */}
        <button
          onClick={() => onAddChild(path)}
          title="Alt başlık ekle"
          style={{
            background: 'none', border: '1px solid #e5e7eb', cursor: 'pointer',
            padding: '0.2rem 0.4rem', color: '#9ca3af', flexShrink: 0, marginTop: 4,
            borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.2rem',
            fontSize: '0.6875rem', fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#374151'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'; }}
        >
          <Plus size={10} />
          Alt
        </button>

        {/* Remove */}
        <button
          onClick={() => onRemove(path)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.25rem', color: '#d1d5db', flexShrink: 0, marginTop: 4,
            borderRadius: 4, display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Children */}
      {!collapsed && (node.children ?? []).length > 0 && (
        <div>
          {node.children!.map((child, ci) => (
            <NodeEditor
              key={child.id}
              node={child}
              path={[...path, ci]}
              articleOptions={articleOptions}
              inputStyle={inputStyle}
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAddChild={onAddChild}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              dragPath={dragPath}
              dragOverPath={dragOverPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminSeriesEdit({ id, navigate, isNew, userRole = 'admin', userId = '' }: AdminSeriesEditProps) {
  const [form, setForm] = useState(emptyForm);
  const [accessDenied, setAccessDenied] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [articleOptions, setArticleOptions] = useState<ArticleOption[]>([]);
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [newRootTitle, setNewRootTitle] = useState('');
  const [dragPath, setDragPath] = useState<number[] | null>(null);
  const [dragOverPath, setDragOverPath] = useState<number[] | null>(null);
  const [notifyArticleId, setNotifyArticleId] = useState('');
  const [notifying, setNotifying] = useState(false);
  const [notifySent, setNotifySent] = useState<number | null>(null);
  const [notifyError, setNotifyError] = useState('');
  const [coAuthors, setCoAuthors] = useState<{ author_id: string; role: string }[]>([]);
  const [coAuthorSaving, setCoAuthorSaving] = useState(false);

  useEffect(() => {
    supabase.from('articles').select('id, title').order('date', { ascending: true }).then(({ data }) => {
      if (data) setArticleOptions(data as ArticleOption[]);
    });
    supabase.from('profiles').select('id, full_name').order('full_name', { ascending: true }).then(({ data }) => {
      if (data) setProfileOptions(data as ProfileOption[]);
    });
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      Promise.all([
        supabase.from('series').select('*').eq('id', id).maybeSingle(),
        supabase.from('series_authors').select('author_id, role').eq('series_id', id),
      ]).then(([seriesRes, authorsRes]) => {
        if (seriesRes.data) {
          const s = seriesRes.data as DbSeries;
          if (userRole === 'author' && userId && s.author_id !== userId) {
            setAccessDenied(true);
            return;
          }
          setForm({
            id: s.id, title: s.title, tagline: s.tagline,
            description: s.description, concept_description: s.concept_description ?? '',
            topics: s.topics ?? [], outline: s.outline ?? [],
            article_count: s.article_count, og_image: s.og_image ?? '',
            logo_url: (s as any).logo_url ?? '',
            author_id: s.author_id ?? '',
          });
        }
        setCoAuthors((authorsRes.data ?? []) as { author_id: string; role: string }[]);
      });
    }
  }, [id, isNew, userRole, userId]);

  const generateId = (title: string) =>
    title.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/â/g, 'a').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();

  const addTopic = () => {
    if (newTopic.trim() && !form.topics.includes(newTopic.trim())) {
      setForm(f => ({ ...f, topics: [...f.topics, newTopic.trim()] }));
      setNewTopic('');
    }
  };

  const removeTopic = (t: string) => setForm(f => ({ ...f, topics: f.topics.filter(x => x !== t) }));

  const handleUpdate = (path: number[], updater: (n: SeriesOutlineNode) => SeriesOutlineNode) => {
    setForm(f => ({ ...f, outline: updateNodeAtPath(f.outline, path, updater) }));
  };

  const handleRemove = (path: number[]) => {
    setForm(f => ({ ...f, outline: removeNodeAtPath(f.outline, path) }));
  };

  const handleAddChild = (parentPath: number[]) => {
    const parentIndex = parentPath[parentPath.length - 1];
    // Find the parent node to know how many children it has
    let nodes = form.outline;
    for (let i = 0; i < parentPath.length - 1; i++) {
      nodes = nodes[parentPath[i]].children ?? [];
    }
    const parent = nodes[parentIndex];
    const childCount = (parent.children ?? []).length;
    const newNode: SeriesOutlineNode = { id: nid(), title: '', order: childCount + 1 };
    setForm(f => ({
      ...f,
      outline: updateNodeAtPath(f.outline, parentPath, n => ({
        ...n,
        article_id: undefined, // groups can't have article_id
        children: [...(n.children ?? []), newNode],
      })),
    }));
  };

  const addRootItem = () => {
    if (!newRootTitle.trim()) return;
    const newNode: SeriesOutlineNode = {
      id: nid(),
      title: newRootTitle.trim(),
      order: form.outline.length + 1,
    };
    setForm(f => ({ ...f, outline: [...f.outline, newNode] }));
    setNewRootTitle('');
  };

  const handleDragStart = (path: number[]) => setDragPath(path);
  const handleDragOver = (e: React.DragEvent, path: number[]) => {
    e.preventDefault();
    setDragOverPath(path);
  };
  const handleDrop = (toPath: number[]) => {
    if (!dragPath) { setDragPath(null); setDragOverPath(null); return; }
    // Only reorder within same parent
    const sameDepth = dragPath.length === toPath.length;
    const sameParent = sameDepth && dragPath.slice(0, -1).every((v, i) => v === toPath[i]);
    if (sameParent && dragPath[dragPath.length - 1] !== toPath[toPath.length - 1]) {
      const parentPath = dragPath.slice(0, -1);
      setForm(f => ({
        ...f,
        outline: reorderNodes(f.outline, parentPath, dragPath[dragPath.length - 1], toPath[toPath.length - 1]),
      }));
    }
    setDragPath(null);
    setDragOverPath(null);
  };

  const cleanOutline = (nodes: SeriesOutlineNode[]): SeriesOutlineNode[] =>
    nodes.map(n => {
      const { _slots, ...rest } = n as NodeWithSlots;
      void _slots;
      const clean: SeriesOutlineNode = rest;
      if (clean.children) clean.children = cleanOutline(clean.children);
      return clean;
    });

  const handleAddCoAuthor = async (authorId: string, role: string) => {
    if (!form.id || !authorId) return;
    setCoAuthorSaving(true);
    const { error } = await supabase.from('series_authors').upsert(
      { series_id: form.id, author_id: authorId, role },
      { onConflict: 'series_id,author_id' }
    );
    if (!error) {
      setCoAuthors(prev => {
        const exists = prev.find(ca => ca.author_id === authorId);
        return exists
          ? prev.map(ca => ca.author_id === authorId ? { ...ca, role } : ca)
          : [...prev, { author_id: authorId, role }];
      });
    }
    setCoAuthorSaving(false);
  };

  const handleRemoveCoAuthor = async (authorId: string) => {
    if (!form.id) return;
    setCoAuthors(prev => prev.filter(ca => ca.author_id !== authorId));
    await supabase.from('series_authors').delete()
      .eq('series_id', form.id)
      .eq('author_id', authorId);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Başlık zorunludur.'); return; }
    setError('');
    setSaving(true);

    const payload = {
      id: isNew ? (form.id || generateId(form.title)) : form.id,
      title: form.title,
      tagline: form.tagline,
      description: form.description,
      concept_description: form.concept_description || null,
      topics: form.topics.length > 0 ? form.topics : null,
      outline: form.outline.length > 0 ? cleanOutline(form.outline) : null,
      article_count: form.article_count,
      og_image: form.og_image || null,
      logo_url: form.logo_url || null,
      author_id: form.author_id || null,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      const { error: err } = await supabase.from('series').insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('series').update(payload).eq('id', payload.id);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (isNew) navigate('admin/series');
  };

  const handleNotify = async () => {
    if (!notifyArticleId || !form.id) return;
    setNotifying(true);
    setNotifyError('');
    setNotifySent(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/notify-series-chapter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token ?? anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ series_id: form.id, article_id: notifyArticleId }),
      });
      const data = await res.json();
      if (data.ok) {
        setNotifySent(data.sent);
      } else {
        setNotifyError(data.error ?? 'Hata oluştu.');
      }
    } catch (e) {
      setNotifyError((e as Error).message);
    }
    setNotifying(false);
  };

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
        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0 }}>Bu diziye erişim yetkiniz yok</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Yalnızca kendi dizilerinizi düzenleyebilirsiniz.</p>
        <button
          onClick={() => navigate('admin/series')}
          style={{
            marginTop: '0.5rem', padding: '0.6rem 1.25rem',
            background: '#111', color: '#fff', border: 'none',
            borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          Dizilere Dön
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('admin/series')}
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
            Diziler
          </button>
          {saved && <span style={{ fontSize: '0.8125rem', color: '#22c55e', fontWeight: 500 }}>Kaydedildi</span>}
          {error && <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{error}</span>}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: '#111', color: '#fff', border: 'none', borderRadius: 6,
            padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div style={{ padding: '2rem', maxWidth: 720 }}>
        {/* Basic Info */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>

          <div>
            <label style={labelStyle}>Başlık *</label>
            <input type="text" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Dizi başlığı" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#374151'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          {isNew && (
            <div>
              <label style={labelStyle}>URL slug</label>
              <input type="text"
                value={form.id || (form.title ? generateId(form.title) : '')}
                onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
                placeholder="dizi-slug"
                style={{ ...inputStyle, color: '#6b7280' }}
                onFocus={e => { e.target.style.borderColor = '#374151'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Kısa açıklama</label>
            <input type="text" value={form.tagline}
              onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
              placeholder="Dizi için kısa bir açıklama" style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#374151'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Açıklama</label>
            <textarea value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Dizi kartında görünen kısa açıklama"
              rows={3} style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = '#374151'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Detaylı açıklama</label>
            <textarea value={form.concept_description}
              onChange={e => setForm(f => ({ ...f, concept_description: e.target.value }))}
              placeholder="Dizi sayfasında görünen uzun açıklama"
              rows={4} style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = '#374151'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>Kapak görseli</label>
            <ImageUpload value={form.og_image}
              onChange={url => setForm(f => ({ ...f, og_image: url }))}
              folder="series"
            />
          </div>

          <div>
            <label style={labelStyle}>Dizi Logosu <span style={{ fontWeight: 400, color: '#9ca3af' }}>(isteğe bağlı — hero slider'da sol üstte gösterilir)</span></label>
            <ImageUpload value={form.logo_url}
              onChange={url => setForm(f => ({ ...f, logo_url: url }))}
              folder="series"
              mode="contain"
            />
          </div>

          <div>
            <label style={labelStyle}>Yazar</label>
            <select
              value={form.author_id}
              onChange={e => setForm(f => ({ ...f, author_id: e.target.value }))}
              style={{ ...inputStyle, color: form.author_id ? '#111' : '#9ca3af', cursor: 'pointer' }}
              onFocus={e => { e.target.style.borderColor = '#374151'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            >
              <option value="">Yazar seçilmedi</option>
              {profileOptions.map(p => (
                <option key={p.id} value={p.id}>{p.full_name || p.id}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Konular</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.625rem' }}>
              {form.topics.map(t => (
                <span key={t} style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  background: '#f3f4f6', padding: '0.25rem 0.625rem', borderRadius: 20,
                  fontSize: '0.8125rem', color: '#374151',
                }}>
                  {t}
                  <button onClick={() => removeTopic(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#9ca3af' }}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTopic(); } }}
                placeholder="Konu ekleyin ve Enter'a basın"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => { e.target.style.borderColor = '#374151'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
              />
              <button onClick={addTopic} style={{
                padding: '0.5rem 0.75rem', background: '#f3f4f6', border: '1px solid #e5e7eb',
                borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}>
                <Plus size={15} color="#6b7280" />
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Makale sayısı</label>
            <input type="number" min={0} value={form.article_count}
              onChange={e => setForm(f => ({ ...f, article_count: parseInt(e.target.value) || 0 }))}
              style={{ ...inputStyle, width: 80 }}
              onFocus={e => { e.target.style.borderColor = '#374151'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>

          {/* Co-Authors */}
          {!isNew && (
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Users size={13} color="#374151" /> Ortak Yazarlar
              </label>
              {coAuthors.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.625rem' }}>
                  {coAuthors.map(ca => {
                    const p = profileOptions.find(p => p.id === ca.author_id);
                    return (
                      <div key={ca.author_id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.45rem 0.75rem',
                        background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 7,
                      }}>
                        <span style={{ flex: 1, fontSize: '0.8125rem', fontWeight: 600, color: '#111' }}>
                          {p?.full_name || ca.author_id}
                        </span>
                        <span style={{
                          fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                          background: ca.role === 'lead' ? '#111' : ca.role === 'editor' ? '#d1fae5' : '#e0f2fe',
                          color: ca.role === 'lead' ? '#fff' : ca.role === 'editor' ? '#065f46' : '#0369a1',
                        }}>
                          {ca.role === 'lead' ? 'Lider' : ca.role === 'editor' ? 'Editör' : 'Katkıda Bulunan'}
                        </span>
                        <button
                          onClick={() => handleRemoveCoAuthor(ca.author_id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', display: 'flex', padding: '2px', borderRadius: 4 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'; }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                <select
                  defaultValue=""
                  onChange={e => {
                    const val = e.target.value;
                    if (val) handleAddCoAuthor(val, 'contributor');
                    e.target.value = '';
                  }}
                  disabled={coAuthorSaving}
                  style={{ ...inputStyle, flex: 1, minWidth: 140, color: '#9ca3af', fontSize: '0.8125rem' }}
                  onFocus={e => { e.target.style.borderColor = '#374151'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
                >
                  <option value="">+ Yazar ekle...</option>
                  {profileOptions
                    .filter(p => !coAuthors.find(ca => ca.author_id === p.id))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.full_name || p.id}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Chapter Notification */}
        {!isNew && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={15} color="#374151" />
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Yeni Bölüm Bildirimi</div>
                <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: 2 }}>Dizi abonelerine yeni bölüm bildirim emaili gönder.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                value={notifyArticleId}
                onChange={e => { setNotifyArticleId(e.target.value); setNotifySent(null); setNotifyError(''); }}
                style={{
                  flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 6,
                  fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif', color: notifyArticleId ? '#111' : '#9ca3af',
                  background: '#fff', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Bildirim gönderilecek makaleyi seçin...</option>
                {articleOptions.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
              <button
                onClick={handleNotify}
                disabled={!notifyArticleId || notifying}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 1rem', background: notifySent !== null ? '#16a34a' : '#111',
                  color: '#fff', border: 'none', borderRadius: 6,
                  fontSize: '0.8125rem', fontWeight: 600,
                  cursor: !notifyArticleId || notifying ? 'not-allowed' : 'pointer',
                  opacity: !notifyArticleId || notifying ? 0.6 : 1,
                  fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', transition: 'background 0.2s',
                }}
              >
                {notifySent !== null ? <><Check size={13} /> {notifySent} gönderildi</> : notifying ? 'Gönderiliyor...' : <><Bell size={13} /> Bildirim Gönder</>}
              </button>
            </div>
            {notifyError && (
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#dc2626' }}>{notifyError}</p>
            )}
          </div>
        )}

        {/* Outline / Content Plan */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <FolderOpen size={16} color="#374151" />
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>İçerik Planı</div>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#9ca3af', paddingLeft: '1.5rem' }}>
              Üst başlıklar ve iç içe alt başlıklar ekleyebilirsiniz.
              Her başlığa &ldquo;Alt&rdquo; butonu ile alt başlık ekleyin.
              Yazı tamamlandığında makaleyi bağlayın.
            </div>
          </div>

          {/* Tree */}
          <div style={{ marginBottom: '1rem' }}>
            {form.outline.length === 0 ? (
              <div style={{
                padding: '2rem', textAlign: 'center', border: '1px dashed #e5e7eb',
                borderRadius: 8, color: '#9ca3af', fontSize: '0.8125rem',
              }}>
                Henüz başlık eklenmedi. Aşağıdan üst başlık ekleyin.
              </div>
            ) : (
              form.outline.map((node, i) => (
                <NodeEditor
                  key={node.id}
                  node={node}
                  path={[i]}
                  articleOptions={articleOptions}
                  inputStyle={inputStyle}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  onAddChild={handleAddChild}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  dragPath={dragPath}
                  dragOverPath={dragOverPath}
                />
              ))
            )}
          </div>

          {/* Add root item */}
          <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
            <input type="text" value={newRootTitle}
              onChange={e => setNewRootTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRootItem(); } }}
              placeholder="Yeni bölüm adı (örn: Giriş, Temel Kavramlar...)"
              style={{ ...inputStyle, flex: 1, fontSize: '0.8125rem' }}
              onFocus={e => { e.target.style.borderColor = '#374151'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
            <button onClick={addRootItem} style={{
              padding: '0.5rem 0.875rem', background: '#111', border: 'none',
              borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem',
              color: '#fff', fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif', fontWeight: 600,
            }}>
              <Plus size={14} />
              Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
