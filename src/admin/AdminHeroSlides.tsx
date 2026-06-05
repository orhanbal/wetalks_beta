import { useEffect, useState } from 'react';
import { Plus, Trash2, BookOpen, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { DbArticle, DbSeries, DbHeroSlide, SeriesOutlineNode } from '../lib/supabase';

interface HeroSlide {
  id: string;
  type: 'article' | 'series';
  item_id: string;
  sort_order: number;
  active: boolean;
  chapter_title: string | null;
  progress_bar_color: string | null;
  bottom_bar_color: string | null;
}

// Bir article_id'nin outline ağacında hangi üst bölümde olduğunu bulur
function findChapterForArticle(nodes: SeriesOutlineNode[], articleId: string): string | null {
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      // Bu node bir bölüm başlığı (üst node). Alt çocuklarda article_id ara.
      const found = node.children.some(
        child =>
          child.article_id === articleId ||
          (child.article_ids && child.article_ids.includes(articleId))
      );
      if (found) return node.title;
      // Daha derin ara
      const deeper = findChapterForArticle(node.children, articleId);
      if (deeper) return deeper;
    }
    // Düz liste: doğrudan bu node'un article_id'si eşleşiyorsa parent aramak gerekir
    // (düz liste durumunda üst başlık zaten dışarıdan geliyor)
  }
  return null;
}

// Outline'dan makale_id → bölüm adı haritası çıkar
function buildArticleChapterMap(nodes: SeriesOutlineNode[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.article_id) map[child.article_id] = node.title;
        if (child.article_ids) child.article_ids.forEach(id => { map[id] = node.title; });
      }
      // Recursive derine in
      const deeper = buildArticleChapterMap(node.children);
      Object.assign(map, deeper);
    }
  }
  return map;
}

// Bir serinin outline'ından verilen makale için bölüm adı bul
function getChapterFromSeriesOutline(series: DbSeries, articleId: string): string | null {
  if (!series.outline) return null;
  const map = buildArticleChapterMap(series.outline);
  return map[articleId] ?? null;
}

// Bir serinin hangi makalesinin hangi bölümde olduğunu döner: article_id[] listesi (düz)
function getArticlesInSeries(nodes: SeriesOutlineNode[]): { articleId: string; chapterTitle: string }[] {
  const result: { articleId: string; chapterTitle: string }[] = [];
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (child.article_id) result.push({ articleId: child.article_id, chapterTitle: node.title });
        if (child.article_ids) child.article_ids.forEach(id => result.push({ articleId: id, chapterTitle: node.title }));
      }
      result.push(...getArticlesInSeries(node.children));
    }
  }
  return result;
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: '1.5rem',
  marginBottom: '1.5rem',
};

const label: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.375rem',
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.875rem',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif',
  color: '#111',
  background: '#fff',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.875rem',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: '0.875rem',
  fontFamily: 'Inter, sans-serif',
  color: '#111',
  background: '#fff',
  boxSizing: 'border-box',
};

const btn = (variant: 'primary' | 'danger' | 'ghost'): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: variant === 'ghost' ? '0.35rem 0.5rem' : '0.55rem 1rem',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  fontSize: '0.8125rem',
  fontWeight: 600,
  background: variant === 'primary' ? '#111' : variant === 'danger' ? '#fef2f2' : '#f3f4f6',
  color: variant === 'primary' ? '#fff' : variant === 'danger' ? '#ef4444' : '#374151',
  transition: 'opacity 0.15s',
});

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [articles, setArticles] = useState<DbArticle[]>([]);
  const [seriesList, setSeriesList] = useState<DbSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [newType, setNewType] = useState<'article' | 'series'>('article');
  const [newItemId, setNewItemId] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // inline chapter_title edit state: slideId -> value
  const [editingChapter, setEditingChapter] = useState<Record<string, string>>({});
  // inline color edit state: slideId -> { progress, bottom }
  const [editingColors, setEditingColors] = useState<Record<string, { progress: string; bottom: string }>>({});

  useEffect(() => {
    Promise.all([
      supabase.from('hero_slides').select('*').order('sort_order', { ascending: true }),
      supabase.from('articles').select('id, title, og_image, category, series_id').eq('published', true).order('date', { ascending: false }),
      supabase.from('series').select('id, title, og_image, logo_url, tagline, outline'),
    ]).then(([slidesRes, articlesRes, seriesRes]) => {
      if (slidesRes.data) {
        const mapped = (slidesRes.data as DbHeroSlide[]).map(s => ({
          id: s.id, type: s.type, item_id: s.item_id,
          sort_order: s.sort_order, active: s.active,
          chapter_title: s.chapter_title ?? null,
          progress_bar_color: s.progress_bar_color ?? null,
          bottom_bar_color: s.bottom_bar_color ?? null,
        }));
        setSlides(mapped);
        const initEditing: Record<string, string> = {};
        const initColors: Record<string, { progress: string; bottom: string }> = {};
        mapped.forEach(s => {
          initEditing[s.id] = s.chapter_title ?? '';
          initColors[s.id] = {
            progress: s.progress_bar_color ?? '',
            bottom: s.bottom_bar_color ?? '',
          };
        });
        setEditingChapter(initEditing);
        setEditingColors(initColors);
      }
      if (articlesRes.data) setArticles(articlesRes.data as DbArticle[]);
      if (seriesRes.data) setSeriesList(seriesRes.data as DbSeries[]);
      setLoading(false);
    });
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // Seri seçildiğinde outline'dan bölüm adı öner
  const handleNewSeriesSelect = (seriesId: string) => {
    setNewItemId(seriesId);
    // Otomatik bölüm adı çıkar: serinin ilk outline bölümünü varsayılan yap
    // (Admin dilediği makaleyi seçmediğinden, boş bırakıp ipucu göster)
    setNewChapterTitle('');
  };

  // Mevcut slide için outline'dan bölüm adını otomatik çek
  const autoDetectChapter = (slide: HeroSlide): string | null => {
    if (slide.type !== 'series') return null;
    const series = seriesList.find(s => s.id === slide.item_id);
    if (!series?.outline) return null;
    // Serinin outline'daki tüm chapter başlıklarını listele (1. seviye)
    return series.outline.find(n => n.children && n.children.length > 0)?.title ?? null;
  };

  // Outline'dan o seri için chapter seçeneklerini döner
  const getChapterOptions = (seriesId: string): string[] => {
    const series = seriesList.find(s => s.id === seriesId);
    if (!series?.outline) return [];
    return series.outline
      .filter(n => n.children && n.children.length > 0)
      .map(n => n.title);
  };

  // Yeni slide: tip=series seçilince outline'dan chapter seçenekleri
  const newChapterOptions = newType === 'series' ? getChapterOptions(newItemId) : [];

  const addSlide = async () => {
    if (!newItemId) return;
    setSaving(true);
    const nextOrder = slides.length > 0 ? Math.max(...slides.map(s => s.sort_order)) + 1 : 0;
    const { data, error } = await supabase
      .from('hero_slides')
      .insert({
        type: newType,
        item_id: newItemId,
        sort_order: nextOrder,
        active: true,
        chapter_title: newChapterTitle.trim() || null,
      })
      .select()
      .maybeSingle();
    if (!error && data) {
      const d = data as DbHeroSlide;
      const newSlide: HeroSlide = {
        id: d.id, type: d.type, item_id: d.item_id,
        sort_order: d.sort_order, active: d.active,
        chapter_title: d.chapter_title ?? null,
        progress_bar_color: d.progress_bar_color ?? null,
        bottom_bar_color: d.bottom_bar_color ?? null,
      };
      setSlides(prev => [...prev, newSlide]);
      setEditingChapter(prev => ({ ...prev, [d.id]: d.chapter_title ?? '' }));
      setEditingColors(prev => ({ ...prev, [d.id]: { progress: d.progress_bar_color ?? '', bottom: d.bottom_bar_color ?? '' } }));
      setNewItemId('');
      setNewChapterTitle('');
      showToast('Slide eklendi');
    }
    setSaving(false);
  };

  const removeSlide = async (id: string) => {
    await supabase.from('hero_slides').delete().eq('id', id);
    setSlides(prev => prev.filter(s => s.id !== id));
    showToast('Slide silindi');
  };

  const toggleActive = async (slide: HeroSlide) => {
    const next = !slide.active;
    await supabase.from('hero_slides').update({ active: next }).eq('id', slide.id);
    setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, active: next } : s));
  };

  const saveChapterTitle = async (id: string) => {
    const val = editingChapter[id]?.trim() || null;
    await supabase.from('hero_slides').update({ chapter_title: val }).eq('id', id);
    setSlides(prev => prev.map(s => s.id === id ? { ...s, chapter_title: val } : s));
    showToast('Bölüm adı kaydedildi');
  };

  const saveColors = async (id: string, progressBarColor: string | null, bottomBarColor: string | null) => {
    await supabase.from('hero_slides').update({
      progress_bar_color: progressBarColor || null,
      bottom_bar_color: bottomBarColor || null,
    }).eq('id', id);
    setSlides(prev => prev.map(s => s.id === id
      ? { ...s, progress_bar_color: progressBarColor || null, bottom_bar_color: bottomBarColor || null }
      : s
    ));
    showToast('Renkler kaydedildi');
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const newSlides = [...slides];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= newSlides.length) return;
    [newSlides[idx], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[idx]];
    const updated = newSlides.map((s, i) => ({ ...s, sort_order: i }));
    setSlides(updated);
    await Promise.all(updated.map(s => supabase.from('hero_slides').update({ sort_order: s.sort_order }).eq('id', s.id)));
    showToast('Sıra güncellendi');
  };

  const getItemLabel = (slide: HeroSlide): string => {
    if (slide.type === 'article') {
      const a = articles.find(a => a.id === slide.item_id);
      return a ? a.title : slide.item_id;
    }
    const s = seriesList.find(s => s.id === slide.item_id);
    return s ? s.title : slide.item_id;
  };

  const getItemThumb = (slide: HeroSlide): string | null => {
    if (slide.type === 'article') {
      return articles.find(a => a.id === slide.item_id)?.og_image ?? null;
    }
    return seriesList.find(s => s.id === slide.item_id)?.og_image ?? null;
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>
        Yükleniyor...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 760, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', background: '#111', color: '#fff',
          padding: '0.75rem 1.25rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
          zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#111', margin: 0 }}>Hero Slider</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.35rem' }}>
          Ana sayfa orta panelinde dönen slide'ları yönetin. Makale veya yazı dizisi ekleyebilirsiniz.
        </p>
      </div>

      {/* Yeni slide ekle */}
      <div style={card}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 1.25rem' }}>Yeni Slide Ekle</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <span style={label}>Tür</span>
            <select
              style={selectStyle}
              value={newType}
              onChange={e => { setNewType(e.target.value as 'article' | 'series'); setNewItemId(''); setNewChapterTitle(''); }}
            >
              <option value="article">Makale</option>
              <option value="series">Yazı Dizisi</option>
            </select>
          </div>
          <div>
            <span style={label}>{newType === 'article' ? 'Makale Seç' : 'Yazı Dizisi Seç'}</span>
            <select
              style={selectStyle}
              value={newItemId}
              onChange={e => newType === 'series' ? handleNewSeriesSelect(e.target.value) : setNewItemId(e.target.value)}
            >
              <option value="">-- Seç --</option>
              {newType === 'article'
                ? articles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)
                : seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
        </div>
        {newType === 'series' && newItemId && (
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={label}>
              Bölüm Adı
              <span style={{ fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
                (sağ üst köşede gösterilir — içerik planındaki bölüm başlığı)
              </span>
            </span>
            {newChapterOptions.length > 0 ? (
              <select
                style={selectStyle}
                value={newChapterTitle}
                onChange={e => setNewChapterTitle(e.target.value)}
              >
                <option value="">-- Bölüm seç --</option>
                {newChapterOptions.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            ) : (
              <input
                style={inputStyle}
                placeholder="örn: BÖLÜM I — TİCARETİN İÇİNE GİRMEK"
                value={newChapterTitle}
                onChange={e => setNewChapterTitle(e.target.value)}
              />
            )}
          </div>
        )}
        <button
          style={{ ...btn('primary'), marginTop: '0.25rem' }}
          onClick={addSlide}
          disabled={saving || !newItemId}
        >
          <Plus size={15} />
          Slide Ekle
        </button>
      </div>

      {/* Mevcut slide'lar */}
      {slides.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          <div style={{ marginBottom: '0.75rem', opacity: 0.4 }}>
            <BookOpen size={36} style={{ margin: '0 auto' }} />
          </div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Henüz slide eklenmedi</p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.8125rem' }}>
            Yukarıdan makale veya yazı dizisi ekleyin.
          </p>
        </div>
      ) : (
        <div style={card}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 1rem' }}>
            Slide Listesi ({slides.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {slides.map((slide, idx) => {
              const thumb = getItemThumb(slide);
              const chapterOptions = slide.type === 'series' ? getChapterOptions(slide.item_id) : [];
              return (
                <div key={slide.id} style={{
                  border: '1px solid',
                  borderColor: slide.active ? '#e5e7eb' : '#f3f4f6',
                  borderRadius: 10,
                  overflow: 'hidden',
                  opacity: slide.active ? 1 : 0.65,
                  background: '#fff',
                }}>
                  {/* Header satırı */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: slide.active ? '#fff' : '#f9fafb' }}>
                    {/* Sıra butonları */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                      <button style={btn('ghost')} onClick={() => move(idx, -1)} disabled={idx === 0}>
                        <ChevronUp size={13} />
                      </button>
                      <button style={btn('ghost')} onClick={() => move(idx, 1)} disabled={idx === slides.length - 1}>
                        <ChevronDown size={13} />
                      </button>
                    </div>
                    {/* Görsel */}
                    <div style={{ width: 72, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#e5e7eb' }}>
                      {thumb
                        ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                            {slide.type === 'series' ? <BookOpen size={18} /> : <FileText size={18} />}
                          </div>}
                    </div>
                    {/* Bilgi */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                          background: slide.type === 'series' ? '#eff6ff' : '#f0fdf4',
                          color: slide.type === 'series' ? '#2563eb' : '#16a34a',
                          padding: '0.15rem 0.5rem', borderRadius: 20,
                        }}>
                          {slide.type === 'series' ? 'Yazı Dizisi' : 'Makale'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>#{idx + 1}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getItemLabel(slide)}
                      </p>
                    </div>
                    {/* Aktif toggle */}
                    <button
                      onClick={() => toggleActive(slide)}
                      style={{ ...btn('ghost'), background: slide.active ? '#ecfdf5' : '#f3f4f6', color: slide.active ? '#16a34a' : '#9ca3af', fontSize: '0.75rem' }}
                    >
                      {slide.active ? 'Aktif' : 'Pasif'}
                    </button>
                    {/* Sil */}
                    <button style={btn('danger')} onClick={() => removeSlide(slide.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Bölüm adı satırı — sadece seri için */}
                  {slide.type === 'series' && (
                    <div style={{ padding: '0.75rem 0.875rem 0.875rem', borderTop: '1px solid #f3f4f6' }}>
                      <span style={{ ...label, marginBottom: '0.35rem' }}>
                        Bölüm Adı
                        <span style={{ fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
                          (sağ üst köşede gösterilir — içerik planından otomatik seçin)
                        </span>
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {chapterOptions.length > 0 ? (
                          <select
                            style={{ ...selectStyle, flex: 1 }}
                            value={editingChapter[slide.id] ?? ''}
                            onChange={e => setEditingChapter(prev => ({ ...prev, [slide.id]: e.target.value }))}
                          >
                            <option value="">-- Bölüm seç --</option>
                            {chapterOptions.map(ch => (
                              <option key={ch} value={ch}>{ch}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            style={{ ...inputStyle, flex: 1 }}
                            placeholder="örn: BÖLÜM I — TİCARETİN İÇİNE GİRMEK"
                            value={editingChapter[slide.id] ?? ''}
                            onChange={e => setEditingChapter(prev => ({ ...prev, [slide.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') saveChapterTitle(slide.id); }}
                          />
                        )}
                        <button style={btn('primary')} onClick={() => saveChapterTitle(slide.id)}>
                          Kaydet
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Renk ayarları */}
                  <div style={{ padding: '0.75rem 0.875rem 0.875rem', borderTop: '1px solid #f3f4f6' }}>
                    <span style={{ ...label, marginBottom: '0.75rem' }}>Renk Ayarları</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      {/* Progress bar rengi */}
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.35rem' }}>
                          Progress Bar
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="color"
                            value={editingColors[slide.id]?.progress || '#e8c97e'}
                            onChange={e => setEditingColors(prev => ({ ...prev, [slide.id]: { ...prev[slide.id], progress: e.target.value } }))}
                            style={{ width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', padding: 2, background: '#fff' }}
                          />
                          <input
                            type="text"
                            value={editingColors[slide.id]?.progress || ''}
                            onChange={e => setEditingColors(prev => ({ ...prev, [slide.id]: { ...prev[slide.id], progress: e.target.value } }))}
                            placeholder="#e8c97e"
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          {editingColors[slide.id]?.progress && (
                            <button
                              style={{ ...btn('ghost'), padding: '0.35rem 0.5rem', fontSize: '0.7rem', color: '#9ca3af' }}
                              onClick={() => setEditingColors(prev => ({ ...prev, [slide.id]: { ...prev[slide.id], progress: '' } }))}
                              title="Varsayılana dön"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Alt bar rengi */}
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '0.35rem' }}>
                          Alt Bar Arka Planı
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="color"
                            value={editingColors[slide.id]?.bottom || '#000000'}
                            onChange={e => setEditingColors(prev => ({ ...prev, [slide.id]: { ...prev[slide.id], bottom: e.target.value } }))}
                            style={{ width: 36, height: 36, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', padding: 2, background: '#fff' }}
                          />
                          <input
                            type="text"
                            value={editingColors[slide.id]?.bottom || ''}
                            onChange={e => setEditingColors(prev => ({ ...prev, [slide.id]: { ...prev[slide.id], bottom: e.target.value } }))}
                            placeholder="rgba(0,0,0,0.72)"
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          {editingColors[slide.id]?.bottom && (
                            <button
                              style={{ ...btn('ghost'), padding: '0.35rem 0.5rem', fontSize: '0.7rem', color: '#9ca3af' }}
                              onClick={() => setEditingColors(prev => ({ ...prev, [slide.id]: { ...prev[slide.id], bottom: '' } }))}
                              title="Varsayılana dön"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      style={btn('primary')}
                      onClick={() => saveColors(
                        slide.id,
                        editingColors[slide.id]?.progress || null,
                        editingColors[slide.id]?.bottom || null,
                      )}
                    >
                      Renkleri Kaydet
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
