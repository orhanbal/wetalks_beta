import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, BookOpen, Tag, Hash, ChevronRight, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import type { Article } from '../data/articles';
import type { Series } from '../data/series';

interface SearchModalProps {
  articles: Article[];
  seriesList?: Series[];
  navigate: (to: string) => void;
  onClose: () => void;
}

type FilterCategory = 'all' | string;
type FilterSeries = 'all' | string;
type ResultType = 'article' | 'series';

interface SearchResult {
  type: ResultType;
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  seriesTitle?: string;
  ogImage?: string;
  readingTime?: number;
  date?: string;
  excerpt?: string;
  score: number;
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(14,143,160,0.15)', color: 'inherit', borderRadius: 3, padding: '0 2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function score(article: Article, q: string): number {
  let s = 0;
  const ql = q.toLowerCase();
  if (article.title.toLowerCase().includes(ql)) s += article.title.toLowerCase().startsWith(ql) ? 10 : 6;
  if (article.category.toLowerCase().includes(ql)) s += 4;
  if (article.excerpt?.toLowerCase().includes(ql)) s += 2;
  if (article.seriesTitle?.toLowerCase().includes(ql)) s += 1;
  return s;
}

const RECENT_KEY = 'search_recent';
const MAX_RECENT = 5;

function getRecent(): { id: string; title: string; type: ResultType }[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

function pushRecent(item: { id: string; title: string; type: ResultType }) {
  const prev = getRecent().filter(r => !(r.id === item.id && r.type === item.type));
  localStorage.setItem(RECENT_KEY, JSON.stringify([item, ...prev].slice(0, MAX_RECENT)));
}

export default function SearchModal({ articles, seriesList = [], navigate, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState<FilterCategory>('all');
  const [filterSeries, setFilterSeries] = useState<FilterSeries>('all');
  const [activeIdx, setActiveIdx] = useState(0);
  const [recent, setRecent] = useState<{ id: string; title: string; type: ResultType }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setRecent(getRecent());
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();

  // Categories from articles
  const categories = [...new Set(articles.map(a => a.category))].sort();

  // Compute results
  const results: SearchResult[] = q.length >= 2
    ? [
        ...articles
          .filter(a => {
            const haystack = [a.title, a.excerpt, a.category, a.seriesTitle ?? ''].join(' ').toLowerCase();
            if (!haystack.includes(q)) return false;
            if (filterCat !== 'all' && a.category !== filterCat) return false;
            if (filterSeries !== 'all' && a.seriesId !== filterSeries) return false;
            return true;
          })
          .map(a => ({
            type: 'article' as ResultType,
            id: a.id,
            title: a.title,
            subtitle: a.excerpt,
            category: a.category,
            seriesTitle: a.seriesTitle,
            ogImage: a.ogImage,
            readingTime: a.readingTime,
            date: a.date,
            excerpt: a.excerpt,
            score: score(a, q),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 8),

        ...(filterCat === 'all' && filterSeries === 'all'
          ? seriesList
              .filter(s => {
                const haystack = [s.title, s.tagline, s.description].join(' ').toLowerCase();
                return haystack.includes(q);
              })
              .map(s => ({
                type: 'series' as ResultType,
                id: s.id,
                title: s.title,
                subtitle: s.tagline,
                ogImage: s.ogImage,
                score: s.title.toLowerCase().includes(q) ? 5 : 1,
              }))
              .slice(0, 3)
          : []),
      ].sort((a, b) => b.score - a.score).slice(0, 10)
    : [];

  const hasResults = results.length > 0;
  const showRecent = q.length < 2 && recent.length > 0;

  // Keyboard navigation
  const totalItems = hasResults ? results.length : (showRecent ? recent.length : 0);

  useEffect(() => { setActiveIdx(0); }, [query, filterCat, filterSeries]);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, totalItems - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (hasResults && results[activeIdx]) {
        selectResult(results[activeIdx]);
      } else if (showRecent && recent[activeIdx]) {
        selectRecentItem(recent[activeIdx]);
      }
    }
  }, [totalItems, activeIdx, hasResults, results, showRecent, recent]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    itemRefs.current[activeIdx]?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const selectResult = (r: SearchResult) => {
    pushRecent({ id: r.id, title: r.title, type: r.type });
    navigate(r.type === 'series' ? `series/${r.id}` : `article/${r.id}`);
    onClose();
  };

  const selectRecentItem = (r: { id: string; title: string; type: ResultType }) => {
    navigate(r.type === 'series' ? `series/${r.id}` : `article/${r.id}`);
    onClose();
  };

  const clearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'clamp(1rem, 8vh, 5rem) 1rem 1rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          width: '100%', maxWidth: 620,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 6rem)',
        }}
      >
        {/* ── Search input ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0 1rem', gap: '0.625rem',
          borderBottom: '1px solid #f3f4f6',
          flexShrink: 0,
        }}>
          <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Makale, dizi veya konu ara…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontFamily: 'Inter, sans-serif', fontSize: '1rem',
              padding: '1rem 0', background: 'transparent', color: '#111',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: '0.25rem', cursor: 'pointer', display: 'flex', color: '#6b7280', flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.25rem', display: 'flex', flexShrink: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
            onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Filters ── */}
        {q.length >= 2 && (
          <div style={{
            display: 'flex', gap: '0.5rem', padding: '0.625rem 1rem',
            borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap',
            flexShrink: 0, overflowX: 'auto',
          }}>
            {/* Category filters */}
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <Tag size={12} color="#9ca3af" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(filterCat === cat ? 'all' : cat)}
                  style={{
                    padding: '0.2rem 0.625rem',
                    borderRadius: 20,
                    border: `1.5px solid ${filterCat === cat ? '#0e8fa0' : '#e5e7eb'}`,
                    background: filterCat === cat ? '#e0f7f9' : '#fff',
                    color: filterCat === cat ? '#0e8fa0' : '#6b7280',
                    fontSize: '0.6875rem', fontWeight: 600,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.12s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Series filter */}
            {seriesList.length > 0 && (
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', borderLeft: '1px solid #f3f4f6', paddingLeft: '0.5rem', marginLeft: '0.125rem' }}>
                <BookOpen size={12} color="#9ca3af" />
                {seriesList.slice(0, 4).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFilterSeries(filterSeries === s.id ? 'all' : s.id)}
                    style={{
                      padding: '0.2rem 0.625rem',
                      borderRadius: 20,
                      border: `1.5px solid ${filterSeries === s.id ? '#1d4ed8' : '#e5e7eb'}`,
                      background: filterSeries === s.id ? '#eff6ff' : '#fff',
                      color: filterSeries === s.id ? '#1d4ed8' : '#6b7280',
                      fontSize: '0.6875rem', fontWeight: 600,
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      fontFamily: 'Inter, sans-serif', transition: 'all 0.12s',
                      maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                    title={s.title}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}

            {/* Active filter count & clear */}
            {(filterCat !== 'all' || filterSeries !== 'all') && (
              <button
                onClick={() => { setFilterCat('all'); setFilterSeries('all'); }}
                style={{
                  padding: '0.2rem 0.625rem', borderRadius: 20,
                  border: '1px solid #fca5a5', background: '#fff1f2',
                  color: '#dc2626', fontSize: '0.6875rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  transition: 'all 0.12s', whiteSpace: 'nowrap',
                }}
              >
                <X size={10} /> Filtreyi temizle
              </button>
            )}
          </div>
        )}

        {/* ── Results / recent / empty ── */}
        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* Results */}
          {hasResults && (
            <>
              {/* Group header: articles */}
              {results.some(r => r.type === 'article') && (
                <div style={{ padding: '0.5rem 1rem 0.125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Hash size={11} color="#9ca3af" />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Makaleler ({results.filter(r => r.type === 'article').length})
                  </span>
                </div>
              )}
              <ul ref={listRef} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {results.filter(r => r.type === 'article').map((r, i) => (
                  <li key={r.id}>
                    <button
                      ref={el => { itemRefs.current[i] = el; }}
                      onClick={() => selectResult(r)}
                      onMouseEnter={() => setActiveIdx(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        width: '100%', textAlign: 'left',
                        background: activeIdx === i ? '#f9fafb' : 'none',
                        border: 'none', cursor: 'pointer',
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #f9fafb',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'background 0.1s',
                      }}
                    >
                      <div style={{
                        width: 76, height: 48, borderRadius: 7, flexShrink: 0,
                        background: '#f3f4f6', overflow: 'hidden',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {r.ogImage
                          ? <img src={r.ogImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Hash size={16} color="#d1d5db" />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#0e8fa0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {r.category}
                          </span>
                          {r.seriesTitle && (
                            <>
                              <ChevronRight size={10} color="#d1d5db" />
                              <span style={{ fontSize: '0.6875rem', color: '#9ca3af', fontWeight: 500 }}>{r.seriesTitle}</span>
                            </>
                          )}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111', lineHeight: 1.35, marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {highlight(r.title, query.trim())}
                        </div>
                        {r.excerpt && (
                          <div style={{ fontSize: '0.78rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {highlight(r.excerpt, query.trim())}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                        {activeIdx === i && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: '#f3f4f6', borderRadius: 6, padding: '0.2rem 0.5rem', fontSize: '0.6875rem', color: '#6b7280' }}>
                            <CornerDownLeft size={10} /> seç
                          </span>
                        )}
                        {r.readingTime && (
                          <span style={{ fontSize: '0.6875rem', color: '#d1d5db' }}>{r.readingTime} dk</span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Series results */}
              {results.some(r => r.type === 'series') && (
                <>
                  <div style={{ padding: '0.625rem 1rem 0.125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', borderTop: '1px solid #f3f4f6', marginTop: '0.25rem' }}>
                    <BookOpen size={11} color="#9ca3af" />
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Diziler
                    </span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {results.filter(r => r.type === 'series').map((r, si) => {
                      const absIdx = results.filter(x => x.type === 'article').length + si;
                      return (
                        <li key={r.id}>
                          <button
                            ref={el => { itemRefs.current[absIdx] = el; }}
                            onClick={() => selectResult(r)}
                            onMouseEnter={() => setActiveIdx(absIdx)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.875rem',
                              width: '100%', textAlign: 'left',
                              background: activeIdx === absIdx ? '#f9fafb' : 'none',
                              border: 'none', cursor: 'pointer',
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid #f9fafb',
                              fontFamily: 'Inter, sans-serif',
                              transition: 'background 0.1s',
                            }}
                          >
                            <div style={{
                              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                              background: '#f0fdf4', overflow: 'hidden',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: '1.5px solid #bbf7d0',
                            }}>
                              {r.ogImage
                                ? <img src={r.ogImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <BookOpen size={16} color="#16a34a" />
                              }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>
                                Dizi
                              </div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111', lineHeight: 1.3 }}>
                                {highlight(r.title, query.trim())}
                              </div>
                              {r.subtitle && (
                                <div style={{ fontSize: '0.78rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {r.subtitle}
                                </div>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </>
          )}

          {/* No results */}
          {q.length >= 2 && !hasResults && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.625rem' }}>🔍</div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>
                "{query}" için sonuç bulunamadı
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
                {filterCat !== 'all' || filterSeries !== 'all'
                  ? 'Filtreleri kaldırmayı deneyin'
                  : 'Farklı bir anahtar kelime ile deneyin'}
              </p>
            </div>
          )}

          {/* Recent searches */}
          {showRecent && (
            <div>
              <div style={{ padding: '0.75rem 1rem 0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Clock size={12} color="#9ca3af" />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Son aramalar
                  </span>
                </div>
                <button
                  onClick={clearRecent}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.6875rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif', padding: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#374151')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}
                >
                  Temizle
                </button>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recent.map((r, i) => (
                  <li key={`${r.type}-${r.id}`}>
                    <button
                      ref={el => { itemRefs.current[i] = el; }}
                      onClick={() => selectRecentItem(r)}
                      onMouseEnter={() => setActiveIdx(i)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        width: '100%', textAlign: 'left',
                        background: activeIdx === i ? '#f9fafb' : 'none',
                        border: 'none', cursor: 'pointer',
                        padding: '0.625rem 1rem',
                        borderBottom: '1px solid #f9fafb',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'background 0.1s',
                      }}
                    >
                      <div style={{
                        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                        background: '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {r.type === 'series'
                          ? <BookOpen size={13} color="#9ca3af" />
                          : <Clock size={13} color="#9ca3af" />
                        }
                      </div>
                      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.title}
                      </span>
                      {r.type === 'series' && (
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, background: '#f0fdf4', padding: '2px 7px', borderRadius: 20, border: '1px solid #bbf7d0', color: '#16a34a' }}>
                          Dizi
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty state (no query, no recent) */}
          {q.length < 2 && !showRecent && (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
              <Search size={36} color="#e5e7eb" strokeWidth={1.5} style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#374151', margin: '0 0 0.25rem' }}>
                Aramaya başlayın
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
                Makale başlığı, kategori veya konu girebilirsiniz
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '0.625rem 1rem',
          borderTop: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', gap: '1rem',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <kbd style={kbdStyle}><ArrowUp size={10} /></kbd>
            <kbd style={kbdStyle}><ArrowDown size={10} /></kbd>
            <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>gezin</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <kbd style={kbdStyle}><CornerDownLeft size={10} /></kbd>
            <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>seç</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <kbd style={kbdStyle}>Esc</kbd>
            <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>kapat</span>
          </div>
          {hasResults && (
            <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: '#9ca3af' }}>
              {results.length} sonuç
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 5,
  padding: '2px 5px', fontSize: '0.6875rem', color: '#6b7280', fontFamily: 'inherit',
  minWidth: 22,
};
