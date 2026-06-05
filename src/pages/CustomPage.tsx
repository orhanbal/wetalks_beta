import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  og_image: string;
  published: boolean;
}

interface CustomPageProps {
  slug: string;
  navigate: (to: string) => void;
}

function renderInline(text: string) {
  return text
    .replace(/`([^`]+)`/g, '<code class="article-code-inline">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function renderParagraphs(content: string) {
  const paras = content.split('\n\n').filter(Boolean);
  return paras.map((para, i) => {
    if (para.startsWith('### ')) {
      return <h3 key={i} className="article-subheading-3">{para.slice(4)}</h3>;
    }
    if (para.startsWith('## ')) {
      return <h2 key={i} className="article-subheading">{para.slice(3)}</h2>;
    }
    if (para.startsWith('**') && para.endsWith('**') && para.split('**').length === 3) {
      return <h2 key={i} className="article-subheading">{para.slice(2, -2)}</h2>;
    }
    if (para.trim() === '---') {
      return <hr key={i} className="article-hr" />;
    }
    const imgMatch = para.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      return (
        <figure key={i} className="article-figure">
          <img src={imgMatch[2]} alt={imgMatch[1]} className="article-figure-img" />
          {imgMatch[1] && <figcaption className="article-figure-caption">{imgMatch[1]}</figcaption>}
        </figure>
      );
    }
    const hlMatch = para.match(/^:::highlight\[([^\]]*)\]([\s\S]*):::$/);
    if (hlMatch) {
      const meta = hlMatch[1];
      const body = hlMatch[2].trim();
      const [emoji, type] = meta.includes('|') ? meta.split('|') : [meta, 'default'];
      const titleMatch = body.match(/^\*\*([^*]+)\*\*:?\s*([\s\S]*)$/);
      const hlTitle = titleMatch ? titleMatch[1] : null;
      const desc = titleMatch ? titleMatch[2].trim() : body;
      return (
        <div key={i} className={`article-highlight article-highlight--${type || 'default'}`}>
          {emoji && <span className="article-highlight-icon">{emoji}</span>}
          <div className="article-highlight-body">
            {hlTitle && <span className="article-highlight-title">{hlTitle}</span>}
            {desc && <span className="article-highlight-desc"> {desc}</span>}
          </div>
        </div>
      );
    }
    const calloutMatch = para.match(/^:::callout\[([^\]]*)\]([\s\S]*):::$/);
    if (calloutMatch) {
      return (
        <div key={i} className="article-callout">
          {calloutMatch[1] && <div className="article-callout-title">{calloutMatch[1].trim()}</div>}
          <div className="article-callout-body" dangerouslySetInnerHTML={{ __html: renderInline(calloutMatch[2].trim()) }} />
        </div>
      );
    }
    const statMatch = para.match(/^:::stat\[([^|]+)\|([^\]]+)\]:::$/);
    if (statMatch) {
      return (
        <div key={i} className="article-stat">
          <span className="article-stat-value">{statMatch[1].trim()}</span>
          <span className="article-stat-label">{statMatch[2].trim()}</span>
        </div>
      );
    }
    const statsMatch = para.match(/^:::stats\[([^\]]+)\]:::$/);
    if (statsMatch) {
      const items = statsMatch[1].split(',').map(s => s.trim());
      return (
        <div key={i} className="article-stats-row">
          {items.map((item, si) => {
            const [val, lbl] = item.split('|').map(s => s.trim());
            return (
              <div key={si} className="article-stat article-stat--inline">
                <span className="article-stat-value">{val}</span>
                <span className="article-stat-label">{lbl}</span>
              </div>
            );
          })}
        </div>
      );
    }
    if (para.startsWith('> ')) {
      const lines = para.split('\n').map(l => l.replace(/^>\s?/, '').trim()).filter(Boolean);
      const quoteText = lines.slice(0, lines.length - 1).join(' ') || lines[0];
      const attribution = lines.length > 1 ? lines[lines.length - 1] : null;
      return (
        <blockquote key={i} className="article-pullquote">
          <p className="article-pullquote-text" dangerouslySetInnerHTML={{ __html: renderInline(quoteText) }} />
          {attribution && <cite className="article-pullquote-cite">{attribution}</cite>}
        </blockquote>
      );
    }
    if (para.split('\n').every(l => l.trim() === '' || l.match(/^- /))) {
      const items = para.split('\n').filter(l => l.match(/^- /));
      if (items.length > 0) {
        return (
          <ul key={i} className="article-list-ul">
            {items.map((item, li) => (
              <li key={li} dangerouslySetInnerHTML={{ __html: renderInline(item.slice(2)) }} />
            ))}
          </ul>
        );
      }
    }
    if (para.split('\n').every(l => l.trim() === '' || l.match(/^\d+\. /))) {
      const items = para.split('\n').filter(l => l.match(/^\d+\. /));
      if (items.length > 0) {
        return (
          <ol key={i} className="article-list-ol">
            {items.map((item, li) => (
              <li key={li} dangerouslySetInnerHTML={{ __html: renderInline(item.replace(/^\d+\. /, '')) }} />
            ))}
          </ol>
        );
      }
    }
    if (para.startsWith('```') && para.endsWith('```') && para.length > 6) {
      const inner = para.slice(3, -3);
      const firstNewline = inner.indexOf('\n');
      const lang = firstNewline > 0 ? inner.slice(0, firstNewline).trim() : '';
      const code = firstNewline > 0 ? inner.slice(firstNewline + 1) : inner;
      return (
        <div key={i} className="article-code-block">
          {lang && <span className="article-code-lang">{lang}</span>}
          <pre><code>{code}</code></pre>
        </div>
      );
    }
    return <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(para) }} />;
  });
}

export default function CustomPage({ slug, navigate }: CustomPageProps) {
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('pages')
        .select('id, title, slug, content, excerpt, og_image, published')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();
      if (!data) {
        setNotFound(true);
      } else {
        setPage(data);
      }
      setLoading(false);
    })();
  }, [slug]);

  useSEO({
    title: page?.title ?? '',
    description: page?.excerpt ?? '',
    ogImage: page?.og_image,
  });

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
        Yükleniyor...
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: 'Inter, sans-serif' }}>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>Sayfa bulunamadı.</p>
        <button
          onClick={() => navigate('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft size={14} /> Ana sayfaya dön
        </button>
      </div>
    );
  }

  return (
    <main>
      <button className="article-back" onClick={() => navigate('home')}>
        <ArrowLeft size={14} /> Ana Sayfa
      </button>

      <header className="article-header">
        <h1 className="article-title">{page.title}</h1>
        {page.excerpt && <p className="article-subtitle">{page.excerpt}</p>}
      </header>

      <div className="article-body-wrap">
        {page.og_image && (
          <div className="article-cover">
            <img src={page.og_image} alt={page.title} />
          </div>
        )}
        <div className="article-body">
          {renderParagraphs(page.content)}
        </div>
        <div className="article-divider" />
      </div>
    </main>
  );
}
