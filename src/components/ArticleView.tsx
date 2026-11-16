/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { handleImageErrorGlobal } from '../App';
import { Article, Comment, UserProfile, Category, ArticleSeries } from '../types';
import { useToast } from './Toast';
import { getCuratedNewsCover } from '../lib/curatedImages';
import { 
  Heart, 
  Bookmark, 
  Share2, 
  Send, 
  Trash2, 
  Edit3, 
  MessageSquare, 
  CornerDownRight, 
  Clock, 
  Calendar, 
  UserPlus, 
  UserMinus,
  Check,
  Link,
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  ChevronRight,
  ChevronLeft,
  Headphones,
  Type,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface ArticleViewProps {
  article: Article;
  authorProfile: UserProfile | null;
  comments: Comment[];
  currentUser: UserProfile | null;
  categories: Category[];
  allArticles: Article[];
  series?: ArticleSeries[];
  onLikeArticle: (id: string) => void;
  onSaveArticle: (id: string) => void;
  onFollowAuthor: (authorId: string) => void;
  onAddComment: (content: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, newContent: string) => void;
  onNavigate: (view: string, params?: any) => void;
  onTriggerAuthModal: () => void;
}

export default function ArticleView({
  article,
  authorProfile,
  comments,
  currentUser,
  categories,
  allArticles,
  series = [],
  onLikeArticle,
  onSaveArticle,
  onFollowAuthor,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onNavigate,
  onTriggerAuthModal
}: ArticleViewProps) {
  const toast = useToast();
  const [commentText, setCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Reading Experience States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1.0);
  const [showAuditDetails, setShowAuditDetails] = useState(false);

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Web Speech API / TTS Audio Reader Logic
  const cleanTextForSpeech = (raw: string) => {
    return raw
      .replace(/###\s+/g, '')
      .replace(/####\s+/g, '')
      .replace(/>\s+/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  const handleToggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Tarayıcınız sesli okuma özelliğini desteklemiyor.');
      return;
    }

    if (isPlayingAudio && !isPausedAudio) {
      window.speechSynthesis.pause();
      setIsPausedAudio(true);
      return;
    }

    if (isPausedAudio) {
      window.speechSynthesis.resume();
      setIsPausedAudio(false);
      return;
    }

    // Start fresh speech
    window.speechSynthesis.cancel();
    const speechText = `${article.title}. ${article.summary ? article.summary + '.' : ''} ${cleanTextForSpeech(article.content)}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'tr-TR';
    utterance.rate = audioSpeed;

    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find(v => v.lang.startsWith('tr'));
    if (trVoice) {
      utterance.voice = trVoice;
    }

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    setIsPausedAudio(false);
    toast.success('Sesli makale dinleme başlatıldı 🎧');
  };

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
  };

  const handleChangeSpeed = (newSpeed: number) => {
    setAudioSpeed(newSpeed);
    if (isPlayingAudio) {
      // Restart with new speed
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      const speechText = `${article.title}. ${article.summary ? article.summary + '.' : ''} ${cleanTextForSpeech(article.content)}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'tr-TR';
      utterance.rate = newSpeed;
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find(v => v.lang.startsWith('tr'));
      if (trVoice) utterance.voice = trVoice;
      utterance.onend = () => { setIsPlayingAudio(false); setIsPausedAudio(false); };
      utterance.onerror = () => { setIsPlayingAudio(false); setIsPausedAudio(false); };
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
    }
  };

  // Stop audio on unmount or article change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article.id]);

  // Dynamic SEO meta tags and Schema.org JSON-LD structured data
  useEffect(() => {
    const originalTitle = document.title;
    const pageTitle = article.seoTitle || `${article.title} | WeTalks`;
    document.title = pageTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    const descriptionText = article.seoDescription || article.summary || article.title;
    metaDesc.setAttribute('content', descriptionText);

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', descriptionText);

    // Inject JSON-LD Schema.org NewsArticle / BlogPosting
    const scriptId = 'article-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    const schemaData = {
      "@context": "https://schema.org",
      "@type": article.publicationType === 'news' ? "NewsArticle" : "BlogPosting",
      "headline": article.title,
      "description": descriptionText,
      "image": [article.coverImage],
      "datePublished": article.createdAt,
      "dateModified": article.createdAt,
      "author": [{
        "@type": "Person",
        "name": article.authorName,
        "url": `https://wetalks.tr/u/${article.authorId}`
      }],
      "publisher": {
        "@type": "Organization",
        "name": "WeTalks",
        "logo": {
          "@type": "ImageObject",
          "url": "https://wetalks.tr/favicon.ico"
        }
      }
    };
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      document.title = originalTitle;
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [article]);

  const isLiked = currentUser?.likedArticles.includes(article.id) || false;
  const isSaved = currentUser?.savedArticles.includes(article.id) || false;
  const isFollowing = currentUser?.followedAuthors.includes(article.authorId) || false;

  const resolvedAuthorAvatar = authorProfile?.avatar || article.authorAvatar;
  const resolvedAuthorName = authorProfile?.name || article.authorName;

  const category = categories.find(c => c.id === article.categoryId);

  const articleSeries = series.find(s => s.id === article.seriesId || s.articleIds.includes(article.id));
  const seriesArticles = articleSeries 
    ? articleSeries.articleIds
        .map(id => allArticles.find(a => a.id === id))
        .filter((a): a is Article => !!a)
    : [];

  const currentSeriesIndex = seriesArticles.findIndex(a => a.id === article.id);
  const prevArticleInSeries = currentSeriesIndex > 0 ? seriesArticles[currentSeriesIndex - 1] : null;
  const nextArticleInSeries = currentSeriesIndex >= 0 && currentSeriesIndex < seriesArticles.length - 1 ? seriesArticles[currentSeriesIndex + 1] : null;

  // Group comments: top-level and their child replies
  const topLevelComments = comments.filter(c => c.articleId === article.id && !c.parentId);
  const repliesMap = comments.reduce((acc, comment) => {
    if (comment.parentId) {
      if (!acc[comment.parentId]) {
        acc[comment.parentId] = [];
      }
      acc[comment.parentId].push(comment);
    }
    return acc;
  }, {} as Record<string, Comment[]>);

  // Similar articles (same category, excluding current)
  const similarArticles = allArticles
    .filter(a => a.categoryId === article.categoryId && a.id !== article.id && a.status === 'Published')
    .slice(0, 3);

  // Other articles by same author
  const authorOtherArticles = allArticles
    .filter(a => a.authorId === article.authorId && a.id !== article.id && a.status === 'Published')
    .slice(0, 3);

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAuthGuardedAction = (action: () => void) => {
    if (!currentUser) {
      onTriggerAuthModal();
    } else {
      action();
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    onAddComment(replyText.trim(), parentId);
    setReplyText('');
    setReplyToId(null);
  };

  const handleStartEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.content);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editingText.trim()) return;
    onEditComment(commentId, editingText.trim());
    setEditingCommentId(null);
  };

  // Convert dummy Markdown representation to elegant visual tags manually safely
  const renderFormattedContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-xl font-sans font-bold text-zinc-900 dark:text-zinc-50 mt-8 mb-4 tracking-tight">{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('#### ')) {
        return <h4 key={idx} className="text-lg font-sans font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3 tracking-tight">{trimmed.replace('#### ', '')}</h4>;
      }
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-md-primary/50 dark:border-zinc-300 pl-4 py-1 italic my-6 text-zinc-650 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-r-lg">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <p key={idx} className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200 my-4 font-bold">{trimmed.replace(/\*\*/g, '')}</p>;
      }
      if (trimmed.startsWith('* ')) {
        return (
          <ul key={idx} className="list-disc list-inside pl-4 my-2 text-base text-zinc-700 dark:text-zinc-350">
            <li className="mt-1">{trimmed.replace('* ', '')}</li>
          </ul>
        );
      }
      if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
        return (
          <ol key={idx} className="list-decimal list-inside pl-4 my-2 text-base text-zinc-700 dark:text-zinc-350">
            <li className="mt-1">{trimmed.substring(3)}</li>
          </ol>
        );
      }
      if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
        return (
          <pre key={idx} className="bg-zinc-900 dark:bg-black text-emerald-400 font-mono text-xs p-4 rounded-xl overflow-x-auto my-6 border border-zinc-850">
            <code>{trimmed.replace(/```[a-z]*/g, '')}</code>
          </pre>
        );
      }
      if (trimmed === '```javascript' || trimmed === '```') {
        return null; // Handle code blocks opening/closing
      }
      if (trimmed.includes('// Kötü bir y') || trimmed.includes('while (') || trimmed.includes('checkNotifications') || trimmed.includes('writeThreeLines') || trimmed.includes('joinUnnecessaryMeeting') || trimmed.includes('overthink') || trimmed.includes('}')) {
        return (
          <pre key={idx} className="bg-zinc-900 dark:bg-black text-emerald-400 font-mono text-xs p-4 rounded-xl overflow-x-auto my-1 border border-zinc-800">
            <code>{line}</code>
          </pre>
        );
      }
      if (line === '') {
        return <div key={idx} className="h-4" />;
      }
      return <p key={idx} className="text-base leading-relaxed text-zinc-850 dark:text-zinc-300 my-4 select-text">{line}</p>;
    });
  };

  return (
    <article id={`article-page-${article.id}`} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-36 animate-in fade-in duration-300 relative">
      {/* Top sticky scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-[9999] pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-[#0D62FE] via-indigo-500 to-emerald-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back navigation button */}
      <button
        id="btn-back-to-home"
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 mb-6 transition-colors group cursor-pointer focus:outline-none"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Makalelere Geri Dön
      </button>

      {/* Hero Category Badge */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {article.publicationType === 'news' ? (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 dark:bg-amber-550/10 text-amber-600 dark:text-amber-400 text-xs px-3 py-1 rounded-full font-bold tracking-wider uppercase border border-amber-500/20">
            ⚡ GÜNDEM HABER
          </span>
        ) : article.publicationType === 'interview' ? (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 dark:bg-rose-550/10 text-rose-600 dark:text-rose-450 text-xs px-3 py-1 rounded-full font-bold tracking-wider uppercase border border-rose-500/20">
            🎙️ SÖYLEŞİ / RÖPORTAJ
          </span>
        ) : article.publicationType === 'event' ? (
          <span className="inline-flex items-center gap-1 bg-cyan-500/10 dark:bg-cyan-550/10 text-cyan-600 dark:text-cyan-400 text-xs px-3 py-1 rounded-full font-bold tracking-wider uppercase border border-cyan-500/20">
            📅 ETKİNLİK
          </span>
        ) : article.publicationType === 'series' ? (
          <span className="inline-flex items-center gap-1 bg-[#0D62FE]/10 dark:bg-blue-900/15 text-[#0D62FE] dark:text-[#5591FF] text-xs px-3 py-1 rounded-full font-bold tracking-wider uppercase border border-[#0D62FE]/20">
            📚 YAZI DİZİSİ
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-750 dark:text-zinc-300 text-xs px-3 py-1 rounded-full font-semibold border border-zinc-200 dark:border-zinc-800">
            📝 MAKALE
          </span>
        )}

        <span className="inline-block bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs px-2.5 py-1 rounded-full font-sans border border-zinc-200/50 dark:border-zinc-800/40">
          Konu: {category?.name || 'Genel'}
        </span>

        {article.aiAudit && (
          <button
            onClick={() => setShowAuditDetails(!showAuditDetails)}
            className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/20 transition-all cursor-pointer shadow-2xs"
            title="AI Kalite ve Doğruluk Denetim Karnesini İncele"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Baş Editör Onaylı (%{article.aiAudit.score})</span>
            <Info className="w-3 h-3 opacity-70" />
          </button>
        )}

        {article.isAutoPublished && (
          <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-500/20">
            <Zap className="w-3 h-3 fill-current text-amber-500" />
            Otonom Yayın
          </span>
        )}
      </div>

      {/* Expandable AI Editorial Audit Scorecard Modal/Panel */}
      {showAuditDetails && article.aiAudit && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                WeTalks AI Kalite & Doğruluk Denetim Karnesi
              </h4>
            </div>
            <span className="text-[10.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-zinc-900 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
              Skor: %{article.aiAudit.score} / 100
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {article.aiAudit.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[10.5px]">
            <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-950">
              <span className="text-zinc-400 block text-[9px]">Doğruluk & Nesnellik</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{article.aiAudit.criteria.accuracyAndObjectivity}/10</span>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-950">
              <span className="text-zinc-400 block text-[9px]">Satıcı & Pazar Değeri</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{article.aiAudit.criteria.sellerValueAndRelevance}/10</span>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-950">
              <span className="text-zinc-400 block text-[9px]">Türkçe Çizgi</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{article.aiAudit.criteria.linguisticQuality}/10</span>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-950">
              <span className="text-zinc-400 block text-[9px]">Görsel Uyumu</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{article.aiAudit.criteria.visualContextMatch}/10</span>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-950 col-span-2 sm:col-span-1">
              <span className="text-zinc-400 block text-[9px]">Kaynak & Telif</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{article.aiAudit.criteria.attributionAndSafety}/10</span>
            </div>
          </div>

          {article.aiAudit.critiqueNotes && article.aiAudit.critiqueNotes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">Editör Notları:</span>
              {article.aiAudit.critiqueNotes.map((note, i) => (
                <span key={i} className="bg-white/60 dark:bg-zinc-900/60 px-2 py-0.5 rounded text-[10px] border border-zinc-200/50 dark:border-zinc-800/50">
                  ✓ {note}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-zinc-900 dark:text-white tracking-tight leading-tight mb-6">
        {article.title}
      </h1>

      {/* Short Summary */}
      <p className="text-lg text-zinc-500 dark:text-zinc-400 font-sans italic leading-relaxed mb-8 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4">
        {article.summary}
      </p>

      {/* Author Bar HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-y border-zinc-100 dark:border-zinc-900 mb-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('profile', { userId: article.authorId })}
            className="cursor-pointer focus:outline-none"
          >
            <img
              src={resolvedAuthorAvatar}
              alt={resolvedAuthorName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-150 dark:ring-zinc-800"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageErrorGlobal(e, 'avatar')}
            />
          </button>
          
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <button 
                onClick={() => onNavigate('profile', { userId: article.authorId })}
                className="font-sans font-bold text-sm text-zinc-950 dark:text-white hover:underline block text-left"
              >
                {resolvedAuthorName}
              </button>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                article.authorId === 'user_orhan' || resolvedAuthorName === 'Orhan Balcı'
                  ? 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-500/20'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
              }`}>
                {article.authorId === 'user_orhan' || resolvedAuthorName === 'Orhan Balcı' ? 'Kurucu Yazar' : 'Yazar'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 font-sans">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(article.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime} dakika okuma
              </span>
            </div>
          </div>
        </div>

        {/* Follow/Unfollow Button - Hidden for own profile */}
        {currentUser?.id !== article.authorId && (
          <button
            id={`btn-follow-${article.authorId}`}
            onClick={() => handleAuthGuardedAction(() => onFollowAuthor(article.authorId))}
            className={`flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer ${
              isFollowing
                ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200'
                : 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-85 border-transparent'
            }`}
          >
            {isFollowing ? (
              <>
                <UserMinus className="w-3.5 h-3.5" />
                Takibi Bırak
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                Takip Et
              </>
            )}
          </button>
        )}
      </div>

      {/* Interactive Audio Player & Reader Utility Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 mb-8 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isPlayingAudio && !isPausedAudio
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
                : isPausedAudio
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-[#0D62FE] text-white hover:bg-blue-600'
            }`}
            title="Makaleyi sesli dinleyin"
          >
            {isPlayingAudio && !isPausedAudio ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Duraklat</span>
              </>
            ) : isPausedAudio ? (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Devam Et</span>
              </>
            ) : (
              <>
                <Headphones className="w-4 h-4" />
                <span>Makaleyi Dinle (TTS)</span>
              </>
            )}
          </button>

          {(isPlayingAudio || isPausedAudio) && (
            <button
              onClick={handleStopAudio}
              className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
              title="Durdur"
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
            {[1.0, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => handleChangeSpeed(speed)}
                className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  audioSpeed === speed
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-black'
                    : 'hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Soundwave animation if active */}
          {isPlayingAudio && !isPausedAudio && (
            <div className="hidden sm:flex items-center gap-0.5 h-4 ml-1">
              <span className="w-0.5 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-0.5 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-0.5 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            </div>
          )}
        </div>

        {/* Reader Comfort / Font Sizing Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
            <Type className="w-3.5 h-3.5" /> Metin:
          </span>
          <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-0.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${fontSize === 'sm' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'hover:text-zinc-900 dark:hover:text-white'}`}
              title="Küçük punto"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${fontSize === 'base' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'hover:text-zinc-900 dark:hover:text-white'}`}
              title="Normal punto"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${fontSize === 'lg' ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'hover:text-zinc-900 dark:hover:text-white'}`}
              title="Büyük punto"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Featured Cover Art */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-10 shadow-2xl border border-zinc-200/20 dark:border-zinc-800/10">
        <img
          src={getCuratedNewsCover(article)}
          alt={article.title}
          className="w-full h-full object-cover transition-transform hover:scale-101 duration-700"
          referrerPolicy="no-referrer"
          onError={(e) => handleImageErrorGlobal(e, 'cover')}
        />
      </div>

      {/* Article Series Navigation Menu */}
      {articleSeries && seriesArticles.length > 0 && (
        <div id="article-series-navigation-card" className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 mb-10 overflow-hidden">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60 mb-4">
            <div className="space-y-1">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block font-mono">
                📚 Yazı Dizisi / Serisi
              </span>
              <h4 className="text-sm font-sans font-black text-zinc-900 dark:text-white leading-tight">
                {articleSeries.title}
              </h4>
              <p className="text-xs text-zinc-400 font-sans line-clamp-2 italic leading-relaxed">
                {articleSeries.description}
              </p>
            </div>
          </div>

          {/* List of articles in this series (Internal Menu) */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider block">Yazı Dizisi Menüsü ({seriesArticles.length} Bölüm)</span>
            <div className="grid grid-cols-1 gap-2">
              {seriesArticles.map((sa, i) => {
                const isActive = sa.id === article.id;
                return (
                  <div
                    key={sa.id}
                    onClick={() => {
                      if (isActive) return;
                      onNavigate('article', { id: sa.id });
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/5 text-zinc-900 dark:text-zinc-50 font-semibold cursor-default'
                        : 'bg-white dark:bg-zinc-950 border-zinc-150 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800 cursor-pointer hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                      isActive 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <span className={`text-xs block line-clamp-1 leading-snug ${isActive ? 'text-zinc-900 dark:text-emerald-400 font-bold' : 'text-zinc-650 dark:text-zinc-350 hover:underline'}`}>
                        {sa.title}
                      </span>
                    </div>
                    {isActive ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 shrink-0 font-mono">
                        Şu Anki Bölüm
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-400 shrink-0 hover:underline">
                        Bölüme Git →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* NEWS RATINGS METRICS PANEL & VERIFICATION HUD */}
      {article.publicationType === 'news' && (
        <div id="news-ratings-hud-card" className="bg-gradient-to-r from-amber-500/5 to-orange-550/5 dark:from-amber-950/15 dark:to-orange-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-5 sm:p-6 mb-10 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-150 dark:border-zinc-850/60">
            <span className="text-xl">📊</span>
            <div className="space-y-0.5">
              <h4 className="text-sm font-sans font-black text-zinc-900 dark:text-amber-400">Gündem Etki ve İlgi Endeksi</h4>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-sans uppercase tracking-wider">Haberin Türkiye ve küresel e-ticaret pazaryerlerine operasyonel yansıması</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TR Interest */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans font-bold">
                <span className="text-zinc-600 dark:text-zinc-400">TR Sektör İlgisi</span>
                <span className="text-amber-600 dark:text-amber-400 font-mono">{article.trInterest || 80}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-205 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-650 rounded-full transition-all duration-1000"
                  style={{ width: `${article.trInterest || 80}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-sans leading-relaxed">Türkiye'deki satıcılar ve kamuoyu arasındaki genel merak sıklığı.</p>
            </div>

            {/* E-Commerce Impact */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans font-bold">
                <span className="text-zinc-600 dark:text-zinc-400">E-Ticaret Pazar Etkisi</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-mono">{article.eCommerceImpact || 85}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-205 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                  style={{ width: `${article.eCommerceImpact || 85}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-455 dark:text-zinc-500 font-sans leading-relaxed">Sektörün genel hacmine, hacim artışına veya vergi regülasyonlarına olan uzun vadeli etkisi.</p>
            </div>

            {/* Seller Impact */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-sans font-bold">
                <span className="text-zinc-600 dark:text-zinc-400">Bireysel Satıcıya Etki</span>
                <span className="text-rose-500 dark:text-rose-450 font-mono">{article.sellerImpact || 75}%</span>
              </div>
              <div className="h-2 w-full bg-zinc-205 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full transition-all duration-1000"
                  style={{ width: `${article.sellerImpact || 75}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-455 dark:text-zinc-500 font-sans leading-relaxed">Doğrudan mağaza operasyonları, sevk ve teslim süreçleri ile kârlılık marjlarına etki.</p>
            </div>
          </div>

          {/* Sources & Citations Box inside News HUD */}
          {article.sourceName && (
            <div className="mt-5 pt-4 border-t border-zinc-150 dark:border-zinc-850/65 flex flex-wrap items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-xl">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-450 font-sans">
                <span>📍 Doğrulanmış Kaynak:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{article.sourceName}</span>
              </div>
              {article.sourceUrl && (
                <a 
                  href={article.sourceUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-sans font-bold text-[#0D62FE] hover:underline flex items-center gap-1"
                >
                  Orijinal Kaynağı Görüntüle <Link className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Stylized Article Text */}
      <div className={`prose dark:prose-invert max-w-none mb-12 select-text selection:bg-emerald-500/20 ${
        fontSize === 'sm' 
          ? 'text-sm sm:text-base leading-relaxed' 
          : fontSize === 'lg' 
          ? 'text-lg sm:text-xl leading-relaxed' 
          : 'text-base sm:text-lg leading-relaxed'
      }`}>
        {renderFormattedContent(article.content)}
      </div>

      {/* Series Next / Previous Sequential Navigation Card */}
      {articleSeries && (prevArticleInSeries || nextArticleInSeries) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-10 p-5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80">
          {prevArticleInSeries ? (
            <button
              onClick={() => onNavigate('article', { id: prevArticleInSeries.id })}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-left cursor-pointer group shadow-sm"
            >
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-indigo-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Önceki Bölüm</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                  {prevArticleInSeries.title}
                </span>
              </div>
            </button>
          ) : <div />}

          {nextArticleInSeries ? (
            <button
              onClick={() => onNavigate('article', { id: nextArticleInSeries.id })}
              className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all text-right cursor-pointer group shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">Sonraki Bölüm</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                  {nextArticleInSeries.title}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-indigo-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ) : <div />}
        </div>
      )}

      {/* Interaction Footbar Toolbar: Likes, Saves, Sharing details */}
      <div id="article-actions-bar" className="flex items-center justify-between py-6 border-y border-zinc-150 dark:border-zinc-900 my-12 bg-zinc-50/50 dark:bg-zinc-950/20 px-4 sm:px-6 rounded-2xl">
        <div className="flex items-center gap-6">
          {/* Likes */}
          <button
            id={`action-like-${article.id}`}
            onClick={() => handleAuthGuardedAction(() => onLikeArticle(article.id))}
            className={`flex items-center gap-2 text-sm font-sans font-medium transition-colors cursor-pointer group focus:outline-none ${
              isLiked 
                ? 'text-red-500 font-semibold' 
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{article.likes} Beğeni</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Save to Favorites */}
          <button
            id={`action-save-${article.id}`}
            onClick={() => handleAuthGuardedAction(() => onSaveArticle(article.id))}
            className={`p-2.5 rounded-full border transition-colors cursor-pointer group/save focus:outline-none ${
              isSaved
                ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-950'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
            title={isSaved ? 'Kaydedilenlerden Çıkar' : 'Daha sonra oku'}
          >
            <Bookmark className={`w-4 h-4 group-hover/save:scale-105 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Social Share Link */}
          <button
            id="action-share-link"
            onClick={handleShareClick}
            className={`p-2.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none ${
              copiedLink
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
            }`}
            title="Bağlantıyı kopyala"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copiedLink && <span className="text-[10px] font-bold font-sans">Kopyalandı!</span>}
          </button>
        </div>
      </div>

      {/* Segment 1: Similar Articles ("Benzer yazılar") */}
      {similarArticles.length > 0 && (
        <section id="similar-articles-region" className="pt-10 border-t border-zinc-150 dark:border-zinc-900">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-zinc-905 dark:text-white mb-6">
            Önerilen Benzer Yazılar
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {similarArticles.map(sa => (
              <div
                key={sa.id}
                onClick={() => onNavigate('article', { id: sa.id })}
                className="group cursor-pointer flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl p-3 border border-zinc-100/80 dark:border-zinc-850/40 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:border-zinc-250 dark:hover:border-zinc-800"
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden mb-3.5">
                  <img
                    src={sa.coverImage}
                    alt={sa.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-103 duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageErrorGlobal(e, 'cover')}
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:underline">
                  {sa.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 mt-auto pt-3">
                  <span className="font-semibold">{sa.authorName}</span>
                  <span>{sa.readTime} dk</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Segment 2: Other Articles by Same Author ("Yazarın diğer yazıları") */}
      {authorOtherArticles.length > 0 && (
        <section id="author-other-articles-region" className="pt-12 mt-12 border-t border-zinc-150 dark:border-zinc-900">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-zinc-905 dark:text-white">
              {resolvedAuthorName} Yazarından Diğer Yazılar
            </h3>
            <button
              onClick={() => onNavigate('profile', { userId: article.authorId })}
              className="text-xs font-semibold text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border-b border-zinc-300 dark:border-zinc-800 hover:border-zinc-900 pb-0.5 cursor-pointer"
            >
              Yazar Sayfasına Git
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {authorOtherArticles.map(oa => (
              <div
                key={oa.id}
                onClick={() => onNavigate('article', { id: oa.id })}
                className="group cursor-pointer flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl p-3 border border-zinc-100/80 dark:border-zinc-850/40 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:border-zinc-250 dark:hover:border-zinc-800"
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden mb-3.5">
                  <img
                    src={oa.coverImage}
                    alt={oa.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-103 duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageErrorGlobal(e, 'cover')}
                  />
                </div>
                <h4 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:underline">
                  {oa.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 mt-auto pt-3">
                  <span>{new Date(oa.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                  <span>{oa.readTime} dk okuma</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
