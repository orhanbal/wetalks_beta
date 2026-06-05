import { useState, useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import type { Article } from '../data/articles';

const NEW_DAYS = 14;

interface NewArticlesBannerProps {
  articles: Article[];
  navigate: (to: string) => void;
  bgColor?: string;
  bgColorDark?: string;
}

export default function NewArticlesBanner({ articles, navigate, bgColor, bgColorDark }: NewArticlesBannerProps) {
  const newArticles = articles.filter(a => {
    const diff = (Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= NEW_DAYS;
  });

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark'));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (newArticles.length <= 1) return;

    const cycle = () => {
      setVisible(false);
      timerRef.current = setTimeout(() => {
        setIndex(i => (i + 1) % newArticles.length);
        setVisible(true);
        timerRef.current = setTimeout(cycle, 4000);
      }, 400);
    };

    timerRef.current = setTimeout(cycle, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [newArticles.length]);

  if (newArticles.length === 0) return null;

  const article = newArticles[index];

  const bg = isDark ? bgColorDark : bgColor;

  return (
    <div className="gundem-banner" style={bg ? { background: bg } : undefined}>
      <div className="gundem-banner-inner">
        <span className="gundem-badge">
          <TrendingUp size={11} />
          Yeni
        </span>
        <button
          className="gundem-body"
          style={{ opacity: visible ? 1 : 0 }}
          onClick={() => navigate(`article/${article.id}`)}
        >
          <span className="gundem-title">{article.title}</span>
          {article.excerpt && (
            <span className="gundem-excerpt">{article.excerpt}</span>
          )}
        </button>
        <div className="gundem-dots">
          {newArticles.length > 1 && newArticles.map((_, i) => (
            <span key={i} className={`gundem-dot${i === index ? ' gundem-dot--active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
