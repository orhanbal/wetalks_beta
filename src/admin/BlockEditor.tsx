import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';

// ── Block types ────────────────────────────────────────────────

type BlockType =
  | 'paragraph'
  | 'heading2'
  | 'heading3'
  | 'highlight-default'
  | 'highlight-tip'
  | 'highlight-info'
  | 'highlight-warning'
  | 'pullquote'
  | 'callout'
  | 'stat'
  | 'list-ul'
  | 'list-ol'
  | 'code'
  | 'hr'
  | 'image';

interface Block {
  id: string;
  type: BlockType;
  raw: string; // the markdown/syntax content for this block
}

let _id = 0;
function uid() { return `b${++_id}`; }

// ── Parsing: content string → Block[] ─────────────────────────

function parseBlocks(content: string): Block[] {
  const paras = content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return paras.map(raw => ({ id: uid(), type: detectType(raw), raw }));
}

function detectType(raw: string): BlockType {
  if (/^:::highlight\[[^\]]*\|tip\]/.test(raw)) return 'highlight-tip';
  if (/^:::highlight\[[^\]]*\|info\]/.test(raw)) return 'highlight-info';
  if (/^:::highlight\[[^\]]*\|warning\]/.test(raw)) return 'highlight-warning';
  if (/^:::highlight\[/.test(raw)) return 'highlight-default';
  if (/^:::callout\[/.test(raw)) return 'callout';
  if (/^:::stats?\[/.test(raw)) return 'stat';
  if (/^:::stat\[/.test(raw)) return 'stat';
  if (raw.startsWith('> ')) return 'pullquote';
  if (raw.startsWith('## ')) return 'heading2';
  if (raw.startsWith('### ')) return 'heading3';
  if (raw.startsWith('```') && raw.endsWith('```')) return 'code';
  if (/^[-*] /.test(raw) || /^\d+\. /.test(raw.split('\n')[0])) {
    if (/^\d+\./.test(raw.split('\n')[0])) return 'list-ol';
    return 'list-ul';
  }
  if (raw === '---' || raw === '***') return 'hr';
  if (/^!\[.*\]\(/.test(raw)) return 'image';
  return 'paragraph';
}

// ── Serialising: Block[] → content string ─────────────────────

function serialiseBlocks(blocks: Block[]): string {
  return blocks.map(b => b.raw).join('\n\n');
}

// ── Inline markdown renderer (for preview) ─────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '0 3px', borderRadius: 3, fontSize: '0.9em' }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

// ── Block renderers (visual, read-only preview) ─────────────────

function RenderHighlight({ raw, type }: { raw: string; type: 'default' | 'tip' | 'info' | 'warning' }) {
  const hlMatch = raw.match(/^:::highlight\[([^\]]*)\]([\s\S]*):::$/s);
  if (!hlMatch) return <div>{raw}</div>;
  const meta = hlMatch[1];
  const body = hlMatch[2].trim();
  const [emoji] = meta.includes('|') ? meta.split('|') : [meta, type];
  const titleMatch = body.match(/^\*\*([^*]+)\*\*:?\s*([\s\S]*)$/);
  const title = titleMatch ? titleMatch[1] : null;
  const desc = titleMatch ? titleMatch[2].trim() : body;

  const styles: Record<string, { bg: string; border: string; titleColor: string }> = {
    default: { bg: '#f3f4f6', border: '#e5e7eb', titleColor: '#374151' },
    tip:     { bg: '#fefce8', border: '#fde68a', titleColor: '#713f12' },
    info:    { bg: '#eff6ff', border: '#bfdbfe', titleColor: '#1e40af' },
    warning: { bg: '#fff7ed', border: '#fed7aa', titleColor: '#9a3412' },
  };
  const s = styles[type] ?? styles.default;

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
      padding: '1.125rem 1.25rem', borderRadius: 12,
      background: s.bg, border: `1px solid ${s.border}`,
    }}>
      {emoji && <span style={{ fontSize: '1.375rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem', userSelect: 'none' }}>{emoji}</span>}
      <div style={{ flex: 1, fontSize: '1.0625rem', lineHeight: 1.65, color: '#374151' }}>
        {title && <span style={{ fontWeight: 700, color: s.titleColor }}>{title}</span>}
        {title && desc && <span style={{ color: '#374151' }}>: {renderInline(desc)}</span>}
        {!title && renderInline(desc)}
      </div>
    </div>
  );
}

function RenderPullquote({ raw }: { raw: string }) {
  const lines = raw.split('\n').map(l => l.replace(/^>\s?/, '').trim()).filter(Boolean);
  const quoteText = lines.length > 1 ? lines.slice(0, -1).join(' ') : lines[0];
  const attribution = lines.length > 1 ? lines[lines.length - 1] : null;
  return (
    <blockquote style={{
      margin: '0', padding: '1.5rem 2rem',
      borderLeft: '4px solid #111',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '-0.25rem', left: '1.25rem',
        fontSize: '4rem', lineHeight: 1, color: '#111', opacity: 0.25,
        fontFamily: 'Georgia, serif', pointerEvents: 'none', userSelect: 'none',
      }}>"</div>
      <p style={{ fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.6, color: '#111', fontStyle: 'italic', margin: 0, paddingTop: '0.5rem' }}>
        {renderInline(quoteText)}
      </p>
      {attribution && (
        <cite style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.875rem', fontStyle: 'normal', color: '#9ca3af', fontWeight: 500 }}>
          {attribution}
        </cite>
      )}
    </blockquote>
  );
}

function RenderCallout({ raw }: { raw: string }) {
  const m = raw.match(/^:::callout\[([^\]]*)\]([\s\S]*):::$/s);
  if (!m) return <div>{raw}</div>;
  const title = m[1].trim();
  const body = m[2].trim();
  return (
    <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      {title && (
        <div style={{
          padding: '0.625rem 1.25rem',
          background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
          fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: '#6b7280',
        }}>{title}</div>
      )}
      <div style={{ padding: '1.125rem 1.25rem', fontSize: '1rem', lineHeight: 1.7, color: '#374151' }}>
        {renderInline(body)}
      </div>
    </div>
  );
}

function RenderStat({ raw }: { raw: string }) {
  const single = raw.match(/^:::stat\[([^|]+)\|([^\]]+)\]:::$/);
  const multi = raw.match(/^:::stats\[([^\]]+)\]:::$/);
  if (single) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.375rem', padding: '2rem 1.5rem',
        background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 16, textAlign: 'center',
      }}>
        <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#111' }}>{single[1].trim()}</span>
        <span style={{ fontSize: '0.9375rem', color: '#6b7280', fontWeight: 500 }}>{single[2].trim()}</span>
      </div>
    );
  }
  if (multi) {
    const items = multi[1].split(',').map(s => { const [v, l] = s.trim().split('|'); return { v: v?.trim(), l: l?.trim() }; });
    return (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.375rem', padding: '2rem 1.5rem',
            background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 16, textAlign: 'center',
          }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#111' }}>{item.v}</span>
            <span style={{ fontSize: '0.9375rem', color: '#6b7280', fontWeight: 500 }}>{item.l}</span>
          </div>
        ))}
      </div>
    );
  }
  return <div>{raw}</div>;
}

function RenderCode({ raw }: { raw: string }) {
  const inner = raw.slice(3, -3);
  const nl = inner.indexOf('\n');
  const lang = nl > 0 ? inner.slice(0, nl).trim() : '';
  const code = nl > 0 ? inner.slice(nl + 1) : inner;
  return (
    <div style={{ background: '#0f172a', borderRadius: 10, overflow: 'hidden' }}>
      {lang && (
        <div style={{ padding: '0.375rem 1rem', background: '#1e293b', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {lang}
        </div>
      )}
      <pre style={{ margin: 0, padding: '1.125rem 1.25rem', overflowX: 'auto' }}>
        <code style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.7 }}>{code}</code>
      </pre>
    </div>
  );
}

function RenderHeading({ raw, level }: { raw: string; level: 2 | 3 }) {
  const text = raw.replace(/^#{2,3}\s+/, '');
  if (level === 2) {
    return (
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111', margin: '0', lineHeight: 1.3, letterSpacing: '-0.025em' }}>
        {renderInline(text)}
      </h2>
    );
  }
  return (
    <h3 style={{ fontSize: '1.1875rem', fontWeight: 700, color: '#111', margin: '0', lineHeight: 1.35 }}>
      {renderInline(text)}
    </h3>
  );
}

function RenderList({ raw, ordered }: { raw: string; ordered: boolean }) {
  const lines = raw.split('\n').map(l => l.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim());
  if (ordered) {
    return (
      <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', counterReset: 'ol-c' }}>
        {lines.map((l, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', counterIncrement: 'ol-c' }}>
            <span style={{ width: '1.25rem', height: '1.25rem', borderRadius: '50%', background: '#111', color: '#fff', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: '1.0625rem', lineHeight: 1.65, color: '#374151' }}>{renderInline(l)}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {lines.map((l, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#111', flexShrink: 0 }} />
          <span style={{ fontSize: '1.0625rem', lineHeight: 1.65, color: '#374151' }}>{renderInline(l)}</span>
        </li>
      ))}
    </ul>
  );
}

function RenderHR() {
  return (
    <div style={{ position: 'relative', margin: '0.5rem 0' }}>
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #e5e7eb 20%, #e5e7eb 80%, transparent)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '0 0.75rem', color: '#d1d5db', fontSize: '0.875rem', letterSpacing: '0.25em' }}>· · ·</div>
    </div>
  );
}

function RenderImage({ raw }: { raw: string }) {
  const m = raw.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
  if (!m) return null;
  const [, alt, src] = m;
  return <img src={src} alt={alt} style={{ width: '100%', borderRadius: 10, display: 'block' }} />;
}

function RenderParagraph({ raw }: { raw: string }) {
  const lines = raw.split('\n');
  return (
    <p style={{ margin: 0, fontSize: '1.0625rem', lineHeight: 1.75, color: '#374151' }}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {renderInline(line)}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </p>
  );
}

function BlockPreview({ block }: { block: Block }) {
  switch (block.type) {
    case 'highlight-tip':     return <RenderHighlight raw={block.raw} type="tip" />;
    case 'highlight-info':    return <RenderHighlight raw={block.raw} type="info" />;
    case 'highlight-warning': return <RenderHighlight raw={block.raw} type="warning" />;
    case 'highlight-default': return <RenderHighlight raw={block.raw} type="default" />;
    case 'pullquote':         return <RenderPullquote raw={block.raw} />;
    case 'callout':           return <RenderCallout raw={block.raw} />;
    case 'stat':              return <RenderStat raw={block.raw} />;
    case 'code':              return <RenderCode raw={block.raw} />;
    case 'heading2':          return <RenderHeading raw={block.raw} level={2} />;
    case 'heading3':          return <RenderHeading raw={block.raw} level={3} />;
    case 'list-ul':           return <RenderList raw={block.raw} ordered={false} />;
    case 'list-ol':           return <RenderList raw={block.raw} ordered={true} />;
    case 'hr':                return <RenderHR />;
    case 'image':             return <RenderImage raw={block.raw} />;
    default:                  return <RenderParagraph raw={block.raw} />;
  }
}

// ── Single block row ────────────────────────────────────────────

const VISUAL_TYPES: BlockType[] = [
  'highlight-default', 'highlight-tip', 'highlight-info', 'highlight-warning',
  'pullquote', 'callout', 'stat', 'code', 'hr', 'image', 'list-ul', 'list-ol',
  'heading2', 'heading3',
];

function BlockRow({
  block,
  isFirst,
  isLast,
  onChange,
  onDelete,
  onMove,
  onAddAfter,
}: {
  block: Block;
  isFirst: boolean;
  isLast: boolean;
  onChange: (raw: string) => void;
  onDelete: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onAddAfter: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const isVisual = VISUAL_TYPES.includes(block.type);

  useEffect(() => {
    if (editing && taRef.current) {
      taRef.current.focus();
      const len = taRef.current.value.length;
      taRef.current.setSelectionRange(len, len);
      autoResize(taRef.current);
    }
  }, [editing]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') { setEditing(false); return; }
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onAddAfter();
    }
  }

  function handleBlur(val: string) {
    onChange(val);
    setEditing(false);
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 0 }}
    >
      {/* Side controls */}
      <div style={{
        position: 'absolute', left: -44, top: 2,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
        userSelect: 'none',
      }}>
        <button
          title="Yukarı taşı"
          disabled={isFirst}
          onClick={() => onMove('up')}
          style={{ ...sideBtn, opacity: isFirst ? 0.3 : 1 }}
        ><ChevronUp size={12} /></button>
        <button
          title="Aşağı taşı"
          disabled={isLast}
          onClick={() => onMove('down')}
          style={{ ...sideBtn, opacity: isLast ? 0.3 : 1 }}
        ><ChevronDown size={12} /></button>
        <div style={{ width: 1, height: 8, background: '#e5e7eb', margin: '1px 0' }} />
        <button title="Bloğu sil" onClick={onDelete} style={{ ...sideBtn, color: '#ef4444' }}>
          <Trash2 size={12} />
        </button>
      </div>

      {/* Block content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isVisual && !editing ? (
          <div
            onClick={() => setEditing(true)}
            title="Düzenlemek için tıkla"
            style={{
              cursor: 'text',
              outline: hovered ? '2px dashed #d1d5db' : '2px dashed transparent',
              outlineOffset: 4,
              borderRadius: 8,
              transition: 'outline-color 0.15s',
            }}
          >
            <BlockPreview block={block} />
          </div>
        ) : editing ? (
          <textarea
            ref={taRef}
            defaultValue={block.raw}
            onKeyDown={handleKeyDown}
            onBlur={e => handleBlur(e.target.value)}
            onChange={e => { autoResize(e.target); onChange(e.target.value); }}
            style={{
              width: '100%', border: '2px solid #3b82f6', borderRadius: 8,
              padding: '0.625rem 0.75rem', resize: 'none', outline: 'none',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: '0.875rem', lineHeight: 1.65, color: '#374151',
              background: '#f8faff', boxSizing: 'border-box', overflowY: 'hidden',
            }}
          />
        ) : (
          /* Plain text block */
          <div
            onClick={() => setEditing(true)}
            title="Düzenlemek için tıkla"
            style={{
              cursor: 'text',
              outline: hovered ? '2px dashed #d1d5db' : '2px dashed transparent',
              outlineOffset: 4,
              borderRadius: 8,
              transition: 'outline-color 0.15s',
              minHeight: 28,
            }}
          >
            <BlockPreview block={block} />
          </div>
        )}
      </div>
    </div>
  );
}

const sideBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 22, height: 22, background: 'none', border: '1px solid #e5e7eb',
  borderRadius: 5, cursor: 'pointer', color: '#9ca3af', padding: 0,
  transition: 'background 0.1s, color 0.1s',
};

// ── BlockEditor main component ─────────────────────────────────

interface BlockEditorProps {
  value: string;
  onChange: (val: string) => void;
}

const BlockEditor = React.forwardRef<HTMLDivElement, BlockEditorProps>(function BlockEditor({ value, onChange }, ref) {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const b = parseBlocks(value);
    return b.length ? b : [{ id: uid(), type: 'paragraph', raw: '' }];
  });

  // Sync incoming value changes (e.g. initial load)
  const lastExternal = useRef(value);
  useEffect(() => {
    if (value !== lastExternal.current) {
      lastExternal.current = value;
      const b = parseBlocks(value);
      setBlocks(b.length ? b : [{ id: uid(), type: 'paragraph', raw: '' }]);
    }
  }, [value]);

  // Emit serialised content on every blocks change
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const serialised = serialiseBlocks(blocks);
    lastExternal.current = serialised;
    onChange(serialised);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const updateBlock = useCallback((id: string, raw: string) => {
    setBlocks(bs => bs.map(b => {
      if (b.id !== id) return b;
      return { ...b, raw, type: detectType(raw) };
    }));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(bs => {
      const next = bs.filter(b => b.id !== id);
      return next.length ? next : [{ id: uid(), type: 'paragraph', raw: '' }];
    });
  }, []);

  const moveBlock = useCallback((id: string, dir: 'up' | 'down') => {
    setBlocks(bs => {
      const idx = bs.findIndex(b => b.id === id);
      if (idx < 0) return bs;
      const next = [...bs];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return bs;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }, []);

  const addBlockAfter = useCallback((id: string, raw = '') => {
    setBlocks(bs => {
      const idx = bs.findIndex(b => b.id === id);
      const newBlock: Block = { id: uid(), type: detectType(raw), raw };
      const next = [...bs];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
  }, []);

  // Public API: insert a raw block at end (used by toolbar)
  const appendBlock = useCallback((raw: string) => {
    setBlocks(bs => {
      // If last block is empty paragraph, replace it
      const last = bs[bs.length - 1];
      if (last && last.type === 'paragraph' && !last.raw.trim()) {
        return [...bs.slice(0, -1), { id: uid(), type: detectType(raw), raw }];
      }
      return [...bs, { id: uid(), type: detectType(raw), raw }];
    });
  }, []);

  // Expose appendBlock on the container DOM node (used by parent via ref)
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      (el as HTMLDivElement & { appendBlock?: (r: string) => void }).appendBlock = appendBlock;
    }
    if (ref) {
      if (typeof ref === 'function') ref(el);
      else (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  }, [appendBlock, ref]);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: 44 }}>
      {blocks.map((block, i) => (
        <BlockRow
          key={block.id}
          block={block}
          isFirst={i === 0}
          isLast={i === blocks.length - 1}
          onChange={raw => updateBlock(block.id, raw)}
          onDelete={() => deleteBlock(block.id)}
          onMove={dir => moveBlock(block.id, dir)}
          onAddAfter={() => addBlockAfter(block.id)}
        />
      ))}
      {/* Add empty paragraph on click below last block */}
      <div
        onClick={() => addBlockAfter(blocks[blocks.length - 1]?.id ?? '', '')}
        style={{ height: 48, cursor: 'text', borderRadius: 8 }}
      />
    </div>
  );
});

export default BlockEditor;
