import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Clock, 
  Sparkles,
  TrendingUp,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Article, Category } from '../types';
import { getCuratedNewsCover, CURATED_NEWS_IMAGES } from '../lib/curatedImages';

interface NewsSliderProps {
  articles: Article[];
  categories: Category[];
  onNavigate: (view: string, params?: any) => void;
  profiles?: any[];
}

export default function NewsSlider({ articles, categories, onNavigate, profiles }: NewsSliderProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [autorun, setAutorun] = useState(true);

  const getResolvedAuthor = (art: Article) => {
    if (!profiles) return { name: art.authorName, avatar: art.authorAvatar };
    const p = profiles.find((item: any) => item.id === art.authorId || item.name === art.authorName);
    return {
      name: p?.name || art.authorName,
      avatar: p?.avatar || art.authorAvatar
    };
  };

  // Deduplicate and filter distinct published news/gundem articles
  const seenTitles = new Set<string>();
  const distinctNewsArticles: Article[] = [];

  for (const a of articles) {
    if (a.status !== 'Published') continue;
    const isNews = a.publicationType === 'news' || 
                   a.categoryId === 'gundem' || 
                   a.categoryId === 'amazon' || 
                   a.categoryId === 'lojistik' || 
                   a.categoryId === 'dijital-ticaret' || 
                   a.categoryId === 'yapay-zeka' || 
                   a.tags?.includes('gundem') || 
                   a.id.startsWith('article_gundem');
    if (!isNews) continue;

    // Normalize title to prevent duplicate headlines
    const norm = a.title.trim().toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, '').substring(0, 30);
    if (!seenTitles.has(norm)) {
      seenTitles.add(norm);
      distinctNewsArticles.push(a);
    }
  }

  // If fewer than 5 distinct news articles, pad with other published articles
  let selectedArticles = [...distinctNewsArticles];
  if (selectedArticles.length < 5) {
    for (const a of articles) {
      if (a.status !== 'Published') continue;
      const norm = a.title.trim().toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, '').substring(0, 30);
      if (!seenTitles.has(norm)) {
        seenTitles.add(norm);
        selectedArticles.push(a);
      }
      if (selectedArticles.length >= 5) break;
    }
  }

  selectedArticles = selectedArticles.slice(0, 5);

  // Auto scroll effect
  useEffect(() => {
    if (!autorun || selectedArticles.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % selectedArticles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autorun, selectedArticles.length]);

  if (selectedArticles.length === 0) return null;

  const currentArticle = selectedArticles[activeIdx];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = CURATED_NEWS_IMAGES.defaultCommerce;
  };

  return (
    <div id="experimental-news-slider" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 w-full relative z-20">

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0D62FE]/50 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0D62FE]" />
            </span>
            <span className="text-[10px] font-sans font-extrabold tracking-widest text-[#0D62FE]/80 dark:text-[#5591FF] uppercase">
              WE-TALKS RADAR
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-black text-zinc-950 dark:text-white tracking-tight mt-1">
            Gündemi Belirleyen Gelişmeler
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('search', { publicationType: 'news' })}
            className="text-xs font-sans font-extrabold text-zinc-650 hover:text-[#0D62FE] dark:text-zinc-400 dark:hover:text-[#5591FF] flex items-center gap-1 bg-transparent px-4 py-2 rounded-xl border border-transparent transition-all cursor-pointer"
          >
            Tüm Haberleri Filtrele
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mt-2">
        {/* Left: Interactive Main Deck Viewport */}
        <div 
          onClick={() => {
            onNavigate('article', { id: currentArticle.id });
          }}
          onMouseEnter={() => setAutorun(false)}
          onMouseLeave={() => setAutorun(true)}
          className="lg:col-span-8 group relative h-[420px] sm:h-[480px] lg:h-[520px] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 flex flex-col justify-end"
        >
          {/* Dynamic Screen Glare overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 duration-1000 transition-all pointer-events-none" />

          {/* Background cover image with custom ken burns effect */}
          <img 
            src={getCuratedNewsCover(currentArticle)} 
            alt={currentArticle.title}
            onError={handleImageError}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-out group-hover:scale-105"
          />

          {/* Deep cybernetic gradients for superb typography readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-transparent to-transparent pointer-events-none" />

          {/* Float Badge */}
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-sans font-extrabold tracking-widest text-[#0D62FE] bg-white/95 dark:bg-[#0D62FE]/15 dark:text-[#5591FF] px-3.5 py-1.5 rounded-xl border border-zinc-200/50 dark:border-[#0D62FE]/20 shadow-md">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              SICAK GELİŞME
            </span>
          </div>

          {/* Bottom Left Content HUD */}
          <div className="relative z-10 p-6 sm:p-10 pr-24 sm:pr-36 text-left space-y-4">
            <div className="space-y-2 max-w-2xl">
              {/* Extra micro-data line */}
              <div className="flex items-center gap-3 text-white/70 text-[11px] font-sans font-bold">
                <span className="bg-white/10 px-2 py-0.5 rounded text-white tracking-wide border border-white/5">
                  #GÜNDEM
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {currentArticle.readTime} Dk Okuma
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-sans font-black text-white leading-tight tracking-tight group-hover:text-amber-250 transition-colors">
                {currentArticle.title}
              </h3>

              <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-xl font-medium line-clamp-2 sm:line-clamp-3">
                {currentArticle.summary}
              </p>
            </div>

            {/* Author Detail HUD */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <img 
                src={getResolvedAuthor(currentArticle).avatar} 
                alt={getResolvedAuthor(currentArticle).name}
                onError={handleImageError}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-white/15"
              />
              <div>
                <span className="text-xs font-sans font-black text-white block leading-none">{getResolvedAuthor(currentArticle).name}</span>
                <span className="text-[10px] text-white/60 font-medium mt-0.5 block">WeTalks Kıdemli Moderatörü</span>
              </div>
            </div>
          </div>

          {/* Interactive Neomorphic Trigger Button */}
          <div className="absolute right-6 bottom-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-[#111424] hover:bg-[#0D62FE] dark:hover:bg-[#0D62FE] flex items-center justify-center text-zinc-950 dark:text-white hover:text-white hover:scale-105 duration-300 transition-all z-20">
            <ArrowUpRight className="w-6 h-6 sm:w-7 sm:h-7 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>

        {/* Right: Kinetic Control Terminal (Deck of selectable list files) */}
        <div className="lg:col-span-4 flex flex-col gap-[9px] sm:gap-3 h-auto lg:h-[520px] justify-between">
          {selectedArticles.map((article, index) => {
            const isActive = index === activeIdx;

            return (
              <div 
                key={article.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIdx(index);
                }}
                className={`group/item cursor-pointer p-3.5 rounded-xl transition-all duration-300 flex items-center gap-4 text-left select-none relative overflow-hidden ${
                  isActive 
                    ? 'bg-[#0D62FE]/5 dark:bg-[#0D62FE]/5 border-transparent' 
                    : 'bg-transparent border-transparent'
                }`}
              >
                {/* Active background glowing highlight streak */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0D62FE]" />
                )}

                {/* Thumbnail indicator with static micro indices */}
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-white/5">
                  <img 
                    src={getCuratedNewsCover(article)} 
                    alt="" 
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  {isActive && (
                    <div className="absolute inset-0 bg-[#0D62FE]/10 backdrop-blur-[1px] flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#0D62FE]" />
                    </div>
                  )}
                </div>

                {/* Text meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-mono font-extrabold text-zinc-400 dark:text-zinc-500">
                      [0{index + 1}]
                    </span>
                    <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {categories.find(c => c.id === article.categoryId)?.name || 'Haber'}
                    </span>
                  </div>

                  <h4 className={`text-xs font-sans font-black tracking-tight leading-snug line-clamp-2 transition-colors ${
                    isActive 
                      ? 'text-[#0D62FE] dark:text-[#5591FF]' 
                      : 'text-zinc-900 dark:text-white group-hover/item:text-[#0D62FE]'
                  }`}>
                    {article.title}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                    <span className="truncate max-w-[120px] font-bold">{getResolvedAuthor(article).name}</span>
                    <span className="font-mono text-[9px]">{article.readTime} dk</span>
                  </div>
                </div>

                {/* Icon prompt arrow */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isActive 
                    ? 'bg-[#0D62FE] text-white' 
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 group-hover/item:text-[#0D62FE]'
                }`}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
