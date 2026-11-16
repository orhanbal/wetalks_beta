/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { handleImageErrorGlobal } from '../App';
import { 
  UserProfile, 
  Article, 
  Category, 
  Comment, 
  Notification, 
  UserRole,
  ArticleStatus,
  SystemSettings,
  CalendarEvent,
  AiEditorialAudit
} from '../types';
import { 
  Bookmark, 
  Heart, 
  User, 
  Users, 
  FileText, 
  Check, 
  Trash2, 
  X, 
  Eye, 
  MoreVertical, 
  TrendingUp, 
  MessageSquare, 
  FolderPlus, 
  ShieldAlert, 
  ShieldCheck,
  Edit3, 
  ThumbsUp, 
  ExternalLink,
  Plus,
  Compass,
  Sparkles,
  RefreshCw,
  Briefcase,
  BookOpen,
  Search,
  Award,
  Calendar,
  Globe,
  Link2,
  Wand2,
  Image as ImageIcon,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Copy,
  Zap,
  AlertTriangle,
  Gauge
} from 'lucide-react';
import { useToast } from './Toast';

interface DashboardProps {
  currentRole: UserRole;
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  allArticles: Article[];
  categories: Category[];
  comments: Comment[];
  notifications: Notification[];
  onUpdateUserRole: (targetUserId: string, newRole: UserRole) => void;
  onModifyArticleStatus: (articleId: string, newStatus: ArticleStatus, rejectionReason?: string) => void;
  onDeleteArticle: (articleId: string) => void;
  onAddCategory: (newCategory: Category) => void;
  onNavigate: (view: string, params?: any) => void;
  onSaveArticle?: (articleData: Partial<Article>, status: ArticleStatus) => void;
  settings?: SystemSettings;
  calendarEvents?: CalendarEvent[];
  onUpdateCalendarEvents?: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

export default function Dashboard({
  currentRole,
  currentUser,
  allUsers,
  allArticles,
  categories,
  comments,
  notifications,
  onUpdateUserRole,
  onModifyArticleStatus,
  onDeleteArticle,
  onAddCategory,
  onNavigate,
  onSaveArticle,
  settings,
  calendarEvents = [],
  onUpdateCalendarEvents
}: DashboardProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Merge calendarEvents with event-category articles dynamically to make sure all events are shown in the calendar/agenda control list!
  const mergedCalendarEvents = React.useMemo(() => {
    const list = [...(calendarEvents || [])];
    
    // Find articles of category 'etkinlikler' or publicationType === 'event'
    const eventArticles = (allArticles || []).filter(
      a => a.categoryId === 'etkinlikler' || a.publicationType === 'event'
    );
    
    eventArticles.forEach(art => {
      // Check if this article is already in the calendarEvents list (by title or id)
      const exists = list.some(
        evt => 
          evt.id === art.id || 
          evt.title.toLowerCase() === art.title.toLowerCase() ||
          evt.title.toLowerCase().includes(art.title.toLowerCase()) ||
          art.title.toLowerCase().includes(evt.title.toLowerCase())
      );
      
      if (!exists) {
        list.push({
          id: art.id,
          title: art.title,
          description: art.summary || art.title,
          date: art.createdAt ? art.createdAt.split('T')[0] : '2026-07-15',
          time: '10:00',
          location: art.sourceName || 'Fuar / Zirve / Webinar',
          organizer: art.authorName || 'WeTalks Editör',
          sourceUrl: '', // Clear so clicking goes inside the app instead of an external href
          isAiGenerated: art.authorId === 'author_wetalks_ai'
        });
      }
    });

    return list;
  }, [calendarEvents, allArticles]);

  // Automatically switch tab if the active one is hidden in settings
  useEffect(() => {
    if (!settings) return;
    
    // Check if the current active tab is disabled
    let isDisabled = false;
    if (activeTab === 'overview' && settings.showOverviewTab === false) isDisabled = true;
    if ((activeTab === 'saved' || activeTab === 'liked' || activeTab === 'following_writers') && settings.showSavedLikedTab === false) isDisabled = true;
    if (activeTab === 'my_articles_list' && settings.showMyArticlesTab === false) isDisabled = true;
    if (activeTab === 'editor_approvals' && settings.showEditorApprovalsTab === false) isDisabled = true;
    if (activeTab === 'editor_categories' && settings.showEditorCategoriesTab === false) isDisabled = true;
    if (activeTab === 'admin_users' && settings.showAdminUsersTab === false) isDisabled = true;
    if (activeTab === 'admin_catalog' && settings.showAdminCatalogTab === false) isDisabled = true;
    if (activeTab === 'agenda_news' && settings.showAgendaNewsTab === false) isDisabled = true;
    if (activeTab === 'agenda_sources' && settings.showAgendaSourcesTab === false) isDisabled = true;
    if (activeTab === 'ai_generation_space' && settings.showAiGenerationTab === false) isDisabled = true;

    if (isDisabled) {
      // Find a safe tab to fall back on based on role & settings
      if (settings.showOverviewTab !== false) {
        setActiveTab('overview');
      } else if (currentRole === 'Reader' && settings.showSavedLikedTab !== false) {
        setActiveTab('saved');
      } else if (currentRole === 'Writer' && settings.showMyArticlesTab !== false) {
        setActiveTab('my_articles_list');
      } else if (currentRole === 'Editor' && settings.showEditorApprovalsTab !== false) {
        setActiveTab('editor_approvals');
      } else if (currentRole === 'Admin' && settings.showAdminUsersTab !== false) {
        setActiveTab('admin_users');
      } else if (settings.showAiGenerationTab !== false && (currentRole === 'Admin' || currentRole === 'Editor' || currentRole === 'Writer')) {
        setActiveTab('ai_generation_space');
      } else {
        // Absolute fallback to any active tab
        const potentialTabs = [
          { key: 'overview', allowed: settings.showOverviewTab !== false },
          { key: 'saved', allowed: currentRole === 'Reader' && settings.showSavedLikedTab !== false },
          { key: 'my_articles_list', allowed: currentRole === 'Writer' && settings.showMyArticlesTab !== false },
          { key: 'editor_approvals', allowed: currentRole === 'Editor' && settings.showEditorApprovalsTab !== false },
          { key: 'admin_users', allowed: currentRole === 'Admin' && settings.showAdminUsersTab !== false },
          { key: 'admin_catalog', allowed: currentRole === 'Admin' && settings.showAdminCatalogTab !== false },
          { key: 'agenda_news', allowed: (currentRole === 'Admin' || currentRole === 'Editor') && settings.showAgendaNewsTab !== false },
          { key: 'ai_generation_space', allowed: (currentRole === 'Admin' || currentRole === 'Editor' || currentRole === 'Writer') && settings.showAiGenerationTab !== false },
        ];
        const fallback = potentialTabs.find(t => t.allowed);
        if (fallback) {
          setActiveTab(fallback.key);
        }
      }
    }
  }, [activeTab, settings, currentRole]);

  // Rejection reason form helper
  const [reviewingArticleId, setReviewingArticleId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  // Category additions helper
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('BookOpen');

  // Calendar event additions state helpers
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventOrganizer, setNewEventOrganizer] = useState('');
  const [newEventLink, setNewEventLink] = useState('');
  const [newEventIsAi, setNewEventIsAi] = useState(false);

  // --- AGENDA MANAGEMENT STATES ---
  const [agendaSources, setAgendaSources] = useState<any[]>(() => {
    const saved = localStorage.getItem('wetalks_agenda_sources');
    return saved ? JSON.parse(saved) : [
      { id: 'src-1', name: 'Trendyol Akademi', url: 'https://partner.trendyol.com/akademi', type: 'RSS Feed', category: 'trendyol', isActive: true, frequency: 'Haftalık' },
      { id: 'src-2', name: 'Amazon Seller News', url: 'https://sellercentral.amazon.com/news', type: 'RSS Feed', category: 'amazon', isActive: true, frequency: 'Mütemadiyen' }
    ];
  });

  const [incomingNews, setIncomingNews] = useState<any[]>(() => {
    const saved = localStorage.getItem('wetalks_incoming_news');
    return saved ? JSON.parse(saved) : [
      {
        id: 'news_1',
        title: 'Temu’nun Avrupa hamlesi Türk satıcıları nasıl etkileyebilir?',
        sourceName: 'Temu Newsroom',
        sourceUrl: 'https://temunews.com',
        originalUrl: 'https://temunews.com/europe-import-regulatory-2026',
        createdAt: '2026-06-18T14:30:00Z',
        category: 'temu',
        summary: 'Avrupa Birliği’nin gümrük muafiyeti muafiyet sınırını (150 EUR) düşürme veya tamamen kaldırma planları, Temu ve benzeri platformlar üzerinden doğrudan satış yapan satıcıların maliyetlerini ve teslimat sürelerini önemli ölçüde etkileyecek.',
        status: 'Bekliyor',
        importanceScores: {
          trInterest: 88,
          eCommerceImpact: 92,
          sellerImpact: 85,
          trendPower: 90,
          urgency: 82,
          readerInterest: 89,
          generalScore: 88
        }
      },
      {
        id: 'news_2',
        title: 'Amazon, küçük satıcılar için yeni yerelleştirilmiş FBA depolama teşviklerini açıkladı',
        sourceName: 'Amazon Seller News',
        sourceUrl: 'https://sellercentral.amazon.com',
        originalUrl: 'https://sellercentral.amazon.com/news/fba-incentives-2026',
        createdAt: '2026-06-17T09:00:00Z',
        category: 'amazon',
        summary: 'Amazon, depolama maliyetlerini optimize etmek amacıyla satıcılara %12’ye varan indirimler ve yeni giren satıcılar için ilk 6 ay ücretsiz depolama alanı sunan küresel teşvik programını duyurdu.',
        status: 'Bekliyor',
        importanceScores: {
          trInterest: 75,
          eCommerceImpact: 88,
          sellerImpact: 91,
          trendPower: 83,
          urgency: 78,
          readerInterest: 80,
          generalScore: 82
        }
      },
      {
        id: 'news_3',
        title: 'WORLDEF İstanbul E-Ticaret Zirvesi için Erken Kayıt Dönemi başladı',
        sourceName: 'WORLDEF Events',
        sourceUrl: 'https://worldef.net',
        originalUrl: 'https://worldef.net/events/istanbul-2026',
        createdAt: '2026-06-16T11:45:00Z',
        category: 'etkinlikler',
        summary: 'Bölgenin en büyük e-ticaret zirvesi olan İstanbul Zirvesi, bu yıl sınır ötesi ticaret, dijital pazarlama entegrasyonları ve yapay zeka tabanlı operasyon yönetimi temalarıyla binlerce lideri bir araya getiriyor.',
        status: 'Bekliyor',
        importanceScores: {
          trInterest: 94,
          eCommerceImpact: 78,
          sellerImpact: 70,
          trendPower: 85,
          urgency: 88,
          readerInterest: 82,
          generalScore: 81
        }
      }
    ];
  });

  // Save agenda states when modified
  const updateAgendaAndSourcesInStorage = (news: any[], sources: any[]) => {
    localStorage.setItem('wetalks_incoming_news', JSON.stringify(news));
    localStorage.setItem('wetalks_agenda_sources', JSON.stringify(sources));
  };

  // Auto-extract events from news items
  const autoExtractAndAddEvents = (newsItems: any[]) => {
    const eventsToAdd: CalendarEvent[] = [];
    newsItems.forEach(item => {
      const isEventCategory = item.category === 'etkinlikler';
      const titleHasEtkinlik = /etkinlik|zirve|webinar|kongre|fuar|buluşma|seminer/i.test(item.title);
      const summaryHasEtkinlik = /etkinlik|zirve|webinar|kongre|fuar|buluşma|seminer/i.test(item.summary);
      
      if (isEventCategory || titleHasEtkinlik || summaryHasEtkinlik) {
        let detectedDate = '2026-07-20';
        if (item.title.includes('İstanbul Zirvesi') || item.summary.includes('İstanbul Zirvesi')) {
          detectedDate = '2026-07-15';
        } else if (item.title.includes('E-İhracat Zirvesi') || item.title.includes('Yapay Zeka Zirvesi')) {
          detectedDate = '2026-08-05';
        } else if (item.summary.includes('2026')) {
          detectedDate = '2026-07-10';
        }
        
        let detectedLocation = 'Lütfi Kırdar Kongre Merkezi, İstanbul';
        if (item.title.includes('E-İhracat Zirvesi') || item.title.includes('Yapay Zeka Zirvesi')) {
          detectedLocation = 'Hilton Bomonti, İstanbul';
        } else if (item.title.toLowerCase().includes('webinar') || item.summary.toLowerCase().includes('webinar')) {
          detectedLocation = 'Zoom Çevrimiçi';
        }

        const alreadyExists = (calendarEvents || []).some((evt: any) => 
          evt.title === item.title || 
          evt.title.includes(item.title.substring(0, 15))
        );

        if (!alreadyExists) {
          eventsToAdd.push({
            id: 'evt-ai-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            title: item.title,
            description: item.summary,
            date: detectedDate,
            time: '10:00',
            location: detectedLocation,
            organizer: item.sourceName || 'Oto AI Algılayıcı',
            sourceUrl: item.originalUrl || item.sourceUrl,
            isAiGenerated: true
          });
        }
      }
    });

    if (eventsToAdd.length > 0 && onUpdateCalendarEvents) {
      onUpdateCalendarEvents(prev => [...prev, ...eventsToAdd]);
    }
  };

  // Run on load once to sync events in initial news pool
  useEffect(() => {
    if (incomingNews && incomingNews.length > 0) {
      autoExtractAndAddEvents(incomingNews);
    }
  }, []);

  const [selectedNewsForAnalysis, setSelectedNewsForAnalysis] = useState<any | null>(null);
  const [analyzingNewsId, setAnalyzingNewsId] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

  // General AI tools state
  const [gType, setGType] = useState<string>('draft'); // 'draft', 'headlines', 'seo', 'rewrite'
  const [gPrompt, setGPrompt] = useState<string>('');
  const [gTitleInput, setGTitleInput] = useState<string>('');
  const [gIndustryInput, setGIndustryInput] = useState<string>('E-Ticaret');
  const [generatingResult, setGeneratingResult] = useState<boolean>(false);
  const [gResultValue, setGResultValue] = useState<string>('');

  // Source form states
  const [srcNameInFeed, setSrcNameInFeed] = useState('');
  const [srcUrlInFeed, setSrcUrlInFeed] = useState('');
  const [srcTypeInFeed, setSrcTypeInFeed] = useState<'RSS Feed' | 'Scraper' | 'Manuel' | 'Sitemap'>('RSS Feed');
  const [srcCatInFeed, setSrcCatInFeed] = useState('diger');
  const [srcFreqInFeed, setSrcFreqInFeed] = useState('Günlük');

  // Filters for News List
  const [newsCatFilter, setNewsCatFilter] = useState('all');
  const [newsStatusFilter, setNewsStatusFilter] = useState('all');
  const [newsScoreFilter, setNewsScoreFilter] = useState(0); // minimum general score

  // AI Graphics prompt styler
  const [graphicsQuery, setGraphicsQuery] = useState('');
  const [graphicsPreset, setGraphicsPreset] = useState('luxury-indigo');
  const [generatedGraphicsResult, setGeneratedGraphicsResult] = useState<string | null>(null);

  // Live News URL Ingestion & AI Rewriter States
  const [scrapeUrlInput, setScrapeUrlInput] = useState('');
  const [isScrapingAndRewriting, setIsScrapingAndRewriting] = useState(false);
  const [scrapingStep, setScrapingStep] = useState<string>('');
  const [autoPublishIfAuditPassed, setAutoPublishIfAuditPassed] = useState(true);
  const [rewrittenItem, setRewrittenItem] = useState<{
    originalTitle: string;
    originalSummary: string;
    sourceName: string;
    sourceUrl: string;
    ogImage: string | null;
    curatedImage: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    tags: string[];
    imagePrompt: string;
    selectedCover: string;
    coverSourceType: 'ai' | 'og' | 'curated';
    aiAudit?: AiEditorialAudit | null;
  } | null>(null);
  const [isRegeneratingCover, setIsRegeneratingCover] = useState(false);
  const [showFullRewrittenContent, setShowFullRewrittenContent] = useState(false);

  // 7/24 Autonomous Autopilot News Crawler States & Handlers
  const [autopilotInfo, setAutopilotInfo] = useState<{
    isActive: boolean;
    intervalMinutes: number;
    lastRunTime: string;
    nextRunTime: string;
    sources: { id: string; name: string; category: string; url: string }[];
    publishedCount: number;
    logs: any[];
  } | null>(null);
  const [isRunningAutopilotNow, setIsRunningAutopilotNow] = useState(false);

  const fetchAutopilotStatus = async () => {
    try {
      const resp = await fetch('/api/news/autopilot/status');
      const data = await resp.json();
      if (data.success) {
        setAutopilotInfo(data);
      }
    } catch (e) {
      console.warn('Autopilot status fetch deferred', e);
    }
  };

  useEffect(() => {
    fetchAutopilotStatus();
    const interval = setInterval(fetchAutopilotStatus, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAutopilot = async (isActive: boolean, intervalMinutes?: number) => {
    try {
      const resp = await fetch('/api/news/autopilot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive, intervalMinutes })
      });
      const data = await resp.json();
      if (data.success) {
        setAutopilotInfo(prev => prev ? ({ ...prev, isActive: data.isActive, intervalMinutes: data.intervalMinutes, nextRunTime: data.nextRunTime }) : null);
        toast.success(data.isActive ? '7/24 Otonom Haber Botu aktif hale getirildi!' : 'Otonom tarayıcı botu duraklatıldı.');
      }
    } catch {
      toast.error('Otopilot ayarı güncellenemedi.');
    }
  };

  const handleTriggerAutopilotNow = async () => {
    setIsRunningAutopilotNow(true);
    try {
      const resp = await fetch('/api/news/autopilot/run-now', {
        method: 'POST'
      });
      const data = await resp.json();
      if (data.success) {
        if (data.isApproved && data.article && onSaveArticle) {
          onSaveArticle(data.article, 'Published');
        }
        toast.success(data.message || 'Otopilot döngüsü tamamlandı.');
        fetchAutopilotStatus();
      } else {
        toast.error(data.error || 'Otopilot döngüsü sırasında hata oluştu.');
      }
    } catch {
      toast.error('Otopilot servisine bağlanılamadı.');
    } finally {
      setIsRunningAutopilotNow(false);
    }
  };

  // 1. Semi-Automatic: Scrape, Rewrite, and Audit (Editor Preview Mode)
  const handleScrapeAndRewrite = async (targetUrl?: string) => {
    const urlToFetch = (targetUrl || scrapeUrlInput).trim();
    if (!urlToFetch || !urlToFetch.startsWith('http')) {
      toast.error('Lütfen geçerli bir haber URL adresi girin (http:// veya https://).');
      return;
    }

    setIsScrapingAndRewriting(true);
    setScrapingStep('Kaynak web sitesi taranıyor ve meta veriler (og:image) çekiliyor...');
    try {
      const fetchResp = await fetch('/api/news/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch })
      });
      const fetchRes = await fetchResp.json();
      if (!fetchRes.success || !fetchRes.data) {
        toast.error(fetchRes.error || 'Haber linkine erişilemedi.');
        setIsScrapingAndRewriting(false);
        return;
      }

      const fetched = fetchRes.data;
      setScrapingStep('WeTalks bağımsız editoryal çizgisiyle Türkiye pazarı ve satıcı odağında yeniden yazılıyor...');

      const rewriteResp = await fetch('/api/news/rewrite-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fetched.title,
          description: fetched.description,
          bodyText: fetched.bodyText,
          sourceName: fetched.siteName,
          sourceUrl: fetched.sourceUrl
        })
      });

      const rewriteRes = await rewriteResp.json();
      if (!rewriteRes.success || !rewriteRes.data) {
        toast.error(rewriteRes.error || 'Haber yapay zeka ile yeniden oluşturulamadı.');
        setIsScrapingAndRewriting(false);
        return;
      }

      const d = rewriteRes.data;
      const initialCover = fetched.ogImage || d.curatedImage;
      const initialCoverType: 'og' | 'curated' = fetched.ogImage ? 'og' : 'curated';

      setScrapingStep('🧠 AI Baş Editör & Kalite Denetçisi 5 kriterde haberi denetliyor...');

      let auditData: AiEditorialAudit | null = null;
      try {
        const auditResp = await fetch('/api/news/evaluate-quality', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: d.title,
            summary: d.summary,
            content: d.content,
            category: d.category || 'dijital-ticaret',
            coverImage: initialCover,
            sourceName: fetched.siteName,
            sourceUrl: fetched.sourceUrl
          })
        });
        const auditRes = await auditResp.json();
        if (auditRes.success && auditRes.audit) {
          auditData = auditRes.audit;
        }
      } catch (ae) {
        console.warn('Audit error', ae);
      }

      setRewrittenItem({
        originalTitle: fetched.title,
        originalSummary: fetched.description,
        sourceName: fetched.siteName,
        sourceUrl: fetched.sourceUrl,
        ogImage: fetched.ogImage,
        curatedImage: d.curatedImage,
        title: d.title,
        summary: d.summary,
        content: d.content,
        category: d.category || 'dijital-ticaret',
        tags: Array.isArray(d.tags) ? d.tags : ['e-ticaret', 'gundem'],
        imagePrompt: d.imagePrompt || `Editorial photo representing: ${d.title}`,
        selectedCover: initialCover,
        coverSourceType: initialCoverType,
        aiAudit: auditData
      });

      if (auditData?.score && auditData.score >= 75) {
        toast.success(`Haber çekildi, yazıldı ve AI Kalite Denetçisinden ${auditData.score}/100 skorla onay aldı! 🚀`);
      } else {
        toast.info('Haber hazırlandı. AI Kalite Denetçisi inceleme önerdi, lütfen kontrol edin.');
      }
    } catch (err: any) {
      console.error('[Scrape & Rewrite Error]', err);
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setIsScrapingAndRewriting(false);
      setScrapingStep('');
    }
  };

  // 2. Fully Autonomous Pipeline: Scrapes, Rewrites, AI Quality Gate Audits, and Auto-Publishes if >= 75
  const handleRunAutonomousPipeline = async (targetUrl?: string) => {
    const urlToFetch = (targetUrl || scrapeUrlInput).trim();
    if (!urlToFetch || !urlToFetch.startsWith('http')) {
      toast.error('Lütfen geçerli bir haber URL adresi girin (http:// veya https://).');
      return;
    }

    setIsScrapingAndRewriting(true);
    setScrapingStep('1/4: Dış kaynak taranıyor ve meta veriler ayıklanıyor 📡...');

    try {
      const resp = await fetch('/api/news/autonomous-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToFetch,
          autoPublishIfPassed: autoPublishIfAuditPassed
        })
      });

      const res = await resp.json();
      if (!res.success || !res.data) {
        toast.error(res.error || 'Otonom haber hattında bir sorun oluştu.');
        setIsScrapingAndRewriting(false);
        return;
      }

      const item = res.data;
      const audit: AiEditorialAudit = res.audit;

      if (res.isAutoPublished) {
        if (onSaveArticle) {
          onSaveArticle({
            title: item.title,
            summary: item.summary,
            content: item.content,
            categoryId: item.categoryId,
            status: 'Published',
            readTime: item.readTime || 4,
            authorId: currentUser?.id || 'author_wetalks_ai',
            authorName: 'WeTalks AI',
            tags: item.tags,
            coverImage: item.coverImage,
            publicationType: 'news',
            sourceName: item.sourceName,
            sourceUrl: item.sourceUrl,
            seoTitle: item.seoTitle,
            seoDescription: item.seoDescription,
            aiAudit: audit,
            isAutoPublished: true
          }, 'Published');
        }
        toast.success(`🎉 Otonom Başarı! AI Kalite Denetçisi içeriği ${audit.score}/100 ile ONAYLADI ve DOĞRUDAN YAYINA ALDI!`);
        setRewrittenItem(null);
        setScrapeUrlInput('');
      } else {
        // Fallback to draft / preview mode so the user can inspect AI critique notes
        setRewrittenItem({
          originalTitle: item.title,
          originalSummary: item.summary,
          sourceName: item.sourceName || 'Dış Kaynak',
          sourceUrl: item.sourceUrl || urlToFetch,
          ogImage: item.coverImage,
          curatedImage: item.coverImage,
          title: item.title,
          summary: item.summary,
          content: item.content,
          category: item.categoryId,
          tags: item.tags,
          imagePrompt: `Editorial photo: ${item.title}`,
          selectedCover: item.coverImage,
          coverSourceType: 'curated',
          aiAudit: audit
        });
        toast.info(`⚠️ AI Kalite Denetçisi inceleme önerdi (Skor: ${audit.score}/100). Haber taslak olarak önizlemenize açıldı.`);
      }
    } catch (err: any) {
      console.error('[Autonomous Pipeline Error]', err);
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setIsScrapingAndRewriting(false);
      setScrapingStep('');
    }
  };

  const handleRegenerateCoverForRewritten = async () => {
    if (!rewrittenItem) return;
    setIsRegeneratingCover(true);
    try {
      const response = await fetch('/api/news/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: rewrittenItem.imagePrompt,
          topic: rewrittenItem.category
        })
      });
      const res = await response.json();
      if (res.success && res.imageUrl) {
        setRewrittenItem(prev => prev ? ({
          ...prev,
          selectedCover: res.imageUrl,
          coverSourceType: res.isAiGenerated ? 'ai' : 'curated'
        }) : null);
        if (res.isAiGenerated) {
          toast.success('Habere özel yeni yapay zeka görseli üretildi! 🎨');
        } else {
          toast.info(res.notice || 'Konuya tam uyumlu editoryal stok görsel atandı.');
        }
      } else {
        toast.error('Görsel üretilemedi.');
      }
    } catch (e) {
      console.error('[Cover Gen Error]', e);
      toast.error('Görsel servisine bağlanırken bir hata oluştu.');
    } finally {
      setIsRegeneratingCover(false);
    }
  };

  const handleSaveRewrittenArticle = (targetStatus: ArticleStatus) => {
    if (!rewrittenItem) return;
    if (onSaveArticle) {
      onSaveArticle({
        title: rewrittenItem.title,
        summary: rewrittenItem.summary,
        content: rewrittenItem.content,
        categoryId: rewrittenItem.category,
        status: targetStatus,
        readTime: 4,
        authorId: currentUser?.id || 'author_wetalks_ai',
        authorName: currentUser?.name || 'WeTalks',
        tags: rewrittenItem.tags,
        coverImage: rewrittenItem.selectedCover,
        publicationType: 'news',
        sourceName: rewrittenItem.sourceName,
        sourceUrl: rewrittenItem.sourceUrl,
        seoTitle: rewrittenItem.title.substring(0, 60),
        seoDescription: rewrittenItem.summary.substring(0, 155),
        aiAudit: rewrittenItem.aiAudit || undefined,
        isAutoPublished: targetStatus === 'Published' && rewrittenItem.aiAudit?.verdict === 'APPROVED_FOR_AUTO_PUBLISH'
      }, targetStatus);
    }
    toast.success(targetStatus === 'Published' 
      ? 'Haber doğrudan yayına alındı ve ana sayfada görüntülenebilir!' 
      : 'Haber taslaklara eklendi, dilediğiniz zaman düzenleyebilirsiniz.');
    setRewrittenItem(null);
    setScrapeUrlInput('');
  };

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Yetkisiz Erişim</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Bu panele erişmek için lütfen giriş yapın veya alttan uygun bir rol seçin.</p>
      </div>
    );
  }

  // --- Filter and query listings based on role ---
  
  // Reader Data queries
  const savedArticlesList = allArticles.filter(a => currentUser.savedArticles.includes(a.id) && a.status === 'Published');
  const likedArticlesList = allArticles.filter(a => currentUser.likedArticles.includes(a.id) && a.status === 'Published');
  const followedWriters = allUsers.filter(u => currentUser.followedAuthors.includes(u.id));

  // Writer Data queries
  const authorArticles = allArticles.filter(a => a.authorId === currentUser.id);
  const totalViews = authorArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = authorArticles.reduce((sum, a) => sum + (a.likes || 0), 0);
  
  const writerDrafts = authorArticles.filter(a => a.status === 'Draft');
  const writerInReviews = authorArticles.filter(a => a.status === 'Pending');
  const writerPublished = authorArticles.filter(a => a.status === 'Published');
  const writerRejected = authorArticles.filter(a => a.status === 'Rejected');

  // Editor Data queries
  const editorNeedsApproval = allArticles.filter(a => a.status === 'Pending');
  const editorManagedArticles = allArticles.filter(a => a.status === 'Published' || a.status === 'Rejected');

  // Admin Data queries: Statistics & Users
  const totalSystemArticles = allArticles.length;
  const totalUsersCount = allUsers.length;
  const pendingGeneralInReviewCount = allArticles.filter(a => a.status === 'Pending').length;

  // Render Subcomponent utilities
  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'Draft':
        return <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold px-2 py-0.5 rounded-full uppercase border border-zinc-200/50 dark:border-zinc-700/50">Taslak</span>;
      case 'Pending':
        return <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full uppercase border border-amber-200/40 dark:border-amber-900/20 animate-pulse">İncelemede</span>;
      case 'Published':
        return <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-200/40 dark:border-emerald-900/20">Yayında</span>;
      case 'Rejected':
        return <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 font-bold px-2 py-0.5 rounded-full uppercase border border-red-200/40 dark:border-red-900/20">Reddedildi</span>;
      case 'Archived':
        return <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-650 dark:text-zinc-400 font-bold px-2 py-0.5 rounded-full uppercase border border-zinc-300/40">Arşivlendi</span>;
    }
  };

  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatName.trim().toLowerCase().replace(/\s+/g, '-');
    onAddCategory({
      id: slug,
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || `${newCatName} alanı hakkında en kaliteli içerikler.`,
      icon: newCatIcon
    });
    setNewCatName('');
    setNewCatDesc('');
    setNewCatIcon('BookOpen');
    toast.success('Kategori başarıyla eklendi!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-40 animate-in fade-in duration-300">
      
      {/* Top Banner Dashboard header */}
      <div className="bg-gradient-to-r from-slate-900 dark:from-[#0d0f19] via-slate-800 dark:via-[#1e233d] to-slate-950 dark:to-[#111424] rounded-xl p-6 sm:p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        {/* Background ambient noise */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover ring-4 ring-white/10"
              referrerPolicy="no-referrer"
              onError={(e) => handleImageErrorGlobal(e, 'avatar')}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">{currentUser.name}</h2>
                <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white border border-white/25 px-2.5 py-0.5 rounded-full font-mono font-bold leading-none shrink-0">
                  {currentRole}
                </span>
              </div>
              <p className="text-zinc-300 text-xs sm:text-sm mt-1 max-w-xl font-sans leading-relaxed line-clamp-2">
                {currentUser.bio || 'Yazar henüz biyografi eklemedi.'}
              </p>
            </div>
          </div>

          {(currentRole === 'Writer' || currentRole === 'Editor' || currentRole === 'Admin') && (
            <div className="flex flex-col sm:flex-row gap-2.5 md:self-center">
              <button
                onClick={() => onNavigate('edit_article')}
                className="bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-bold px-4.5 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-101 border border-zinc-200"
                id="write-article-btn"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600 font-extrabold" />
                Sıfırdan Makale Yaz
              </button>
              <button
                onClick={() => onNavigate('edit_news')}
                className="bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 text-xs font-bold px-4.5 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-101"
                id="write-news-btn"
              >
                <TrendingUp className="w-3.5 h-3.5 text-gold animate-pulse" />
                Yeni Haber / Gündem Yaz
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grid structure depending on current context */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav buttons */}
        <div className="lg:col-span-1 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-900/20 p-3 rounded-3xl border border-zinc-200/40 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider px-3.5 mb-2.5">Panel Gezginleri</p>
          
          {settings?.showOverviewTab !== false && (
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                  : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Genel Bakış
            </button>
          )}
 
          {/* Reader Subsections */}
          {currentRole === 'Reader' && settings?.showSavedLikedTab !== false && (
            <>
              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'saved'
                    ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                    : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Kaydettiklerim ({savedArticlesList.length})
              </button>
 
              <button
                onClick={() => setActiveTab('liked')}
                className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'liked'
                    ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                    : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                }`}
              >
                <Heart className="w-4 h-4" />
                Beğendiklerim ({likedArticlesList.length})
              </button>
 
              <button
                onClick={() => setActiveTab('following_writers')}
                className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'following_writers'
                    ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                    : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                }`}
              >
                <User className="w-4 h-4" />
                Takip Edilen Yazarlar ({followedWriters.length})
              </button>
            </>
          )}
 
          {/* Writer Subsections */}
          {currentRole === 'Writer' && settings?.showMyArticlesTab !== false && (
            <>
              <button
                onClick={() => setActiveTab('my_articles_list')}
                className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'my_articles_list'
                    ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                    : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                }`}
              >
                <FileText className="w-4 h-4" />
                Yayınlarım ({authorArticles.length})
              </button>
            </>
          )}
 
          {/* Editor Subsections */}
          {currentRole === 'Editor' && (
            <>
              {settings?.showEditorApprovalsTab !== false && (
                <button
                  onClick={() => setActiveTab('editor_approvals')}
                  className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'editor_approvals'
                      ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                      : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <Check className="w-4 h-4 animate-bounce" />
                  Onay Kuyruğu ({editorNeedsApproval.length})
                </button>
              )}
 
              {settings?.showEditorCategoriesTab !== false && (
                <button
                  onClick={() => setActiveTab('editor_categories')}
                  className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'editor_categories'
                      ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                      : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <FolderPlus className="w-4 h-4" />
                  Kategori Yönetimi ({categories.length})
                </button>
              )}
            </>
          )}
 
          {/* Admin Subsections */}
          {currentRole === 'Admin' && (
            <>
              {settings?.showAdminUsersTab !== false && (
                <button
                  onClick={() => setActiveTab('admin_users')}
                  className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'admin_users'
                      ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                      : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Kullanıcı Roller Table
                </button>
              )}
 
              {settings?.showAdminCatalogTab !== false && (
                <button
                  onClick={() => setActiveTab('admin_catalog')}
                  className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'admin_catalog'
                      ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                      : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Küresel İlan Kataloğu
                </button>
              )}
            </>
          )}
 
          {/* Gündem Yönetimi Menüleri (Admin ve Editör) */}
          {(currentRole === 'Admin' || currentRole === 'Editor') && 
           (settings?.showAgendaNewsTab !== false || settings?.showAgendaSourcesTab !== false) && (
            <>
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider px-3.5 pt-4 mb-2.5">Gündem Yönetimi</p>
              
              {settings?.showAgendaNewsTab !== false && (
                <button
                  onClick={() => setActiveTab('agenda_news')}
                  className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'agenda_news'
                      ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                      : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Gelen Haberler ({incomingNews.length})
                </button>
              )}
 
              {settings?.showAgendaSourcesTab !== false && (
                <button
                  onClick={() => setActiveTab('agenda_sources')}
                  className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'agenda_sources'
                      ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                      : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <ExternalLink className="w-4 h-4 text-emerald-500" />
                  Kaynak Yönetimi ({agendaSources.length})
                </button>
              )}
            </>
          )}
 
          {/* Etkinlik Yönetimi (Admin ve Editör) */}
          {(currentRole === 'Admin' || currentRole === 'Editor') && (
            <>
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider px-3.5 pt-4 mb-2.5">Etkinlik Takvimi</p>
              
              <button
                id="tab-calendar-events"
                onClick={() => setActiveTab('calendar_events')}
                className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'calendar_events'
                    ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                    : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-500" />
                Etkinlik Giriş Alanı
              </button>
            </>
          )}
 
          {/* AI Playground (Yazar, Editör, Admin) */}
          {(currentRole === 'Admin' || currentRole === 'Editor' || currentRole === 'Writer') && 
           settings?.showAiGenerationTab !== false && (
            <>
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider px-3.5 pt-4 mb-2.5">AI Entegrasyonu</p>
              
              <button
                onClick={() => setActiveTab('ai_generation_space')}
                className={`w-full text-left px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'ai_generation_space'
                    ? 'bg-md-primary text-white font-bold shadow-[0_4px_14px_rgba(13,98,254,0.18)] dark:shadow-none'
                    : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/20'
                }`}
              >
                <Sparkles className="w-4 h-4 text-gold" />
                AI İçerik Üretimi
              </button>
            </>
          )}
        </div>

        {/* Dashboard Center Slate */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: OVERVIEW SCREEN (Different widgets for each) */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Performans & Veri Bulut Analitiği</h3>
              
              {/* Stat Boxes row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {currentRole === 'Reader' && (
                  <>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Takip Edilen</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{followedWriters.length}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Kaydedilen</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{savedArticlesList.length}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Beğenilen</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{likedArticlesList.length}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Bildirim</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{notifications.length}</p>
                    </div>
                  </>
                )}

                {(currentRole === 'Writer') && (
                  <>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Toplam Makale</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{authorArticles.length}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Okunma (Views)</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalViews}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Beğeni (Likes)</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-red-500 mt-1">{totalLikes}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Takipçiler</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{currentUser.followersCount || 0}</p>
                    </div>
                  </>
                )}

                {currentRole === 'Editor' && (
                  <>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Bekleyen Onay</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-amber-500 mt-1 animate-pulse">{editorNeedsApproval.length}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Toplam Kategori</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{categories.length}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Sistem Yazısı</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{allArticles.length}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Rol Yetki</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">L2 Editor</p>
                    </div>
                  </>
                )}

                {currentRole === 'Admin' && (
                  <>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Toplam Üye</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{totalUsersCount}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Tüm Makaleler</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white mt-1">{totalSystemArticles}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Genel Revizyon</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-blue-650 mt-1">{pendingGeneralInReviewCount}</p>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-905 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850/50">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Sistem Sağlık</span>
                      <p className="text-xl sm:text-2xl font-serif font-black text-emerald-500 mt-1">100%</p>
                    </div>
                  </>
                )}

              </div>

              {/* Reader / Writer Specific Lists on Overview */}
              {currentRole === 'Reader' && (
                <div className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl border border-zinc-150/80 dark:border-zinc-850/60 p-5 mt-6">
                  <h4 className="text-sm font-sans font-bold text-zinc-900 dark:text-white mb-4">Son Kaydettiğiniz Yazı</h4>
                  {savedArticlesList.length === 0 ? (
                    <div className="text-center py-6 text-xs text-zinc-400">
                      <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      Henüz hiç yazı kaydetmediniz.
                    </div>
                  ) : (
                    <div 
                      onClick={() => onNavigate('article', { id: savedArticlesList[0].id })}
                      className="group p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-800 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={savedArticlesList[0].coverImage} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                          onError={(e) => handleImageErrorGlobal(e, 'cover')}
                        />
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-1 group-hover:underline">{savedArticlesList[0].title}</p>
                          <p className="text-[10.5px] text-zinc-400 mt-0.5">{allUsers.find(u => u.id === savedArticlesList[0].authorId || u.name === savedArticlesList[0].authorName)?.name || savedArticlesList[0].authorName} • {savedArticlesList[0].readTime} dk</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </div>
                  )}
                </div>
              )}

              {(currentRole === 'Writer') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3.5">Son Taslaklar ({writerDrafts.length})</h4>
                    {writerDrafts.length === 0 ? (
                      <p className="text-xs text-zinc-400 italic">Taslak bulunmuyor.</p>
                    ) : (
                      <div className="space-y-2">
                        {writerDrafts.slice(0, 3).map(d => (
                          <div key={d.id} className="flex justify-between items-center p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850">
                            <span className="font-sans font-bold text-xs truncate max-w-[150px] sm:max-w-[200px] text-zinc-700 dark:text-zinc-200">{d.title}</span>
                            <button
                              onClick={() => {
                                const isNews = d.categoryId === 'gundem' || d.tags?.includes('gundem') || d.id?.startsWith('article_gundem');
                                onNavigate(isNews ? 'edit_news' : 'edit_article', { articleId: d.id });
                              }}
                              className="text-[10px] font-bold text-zinc-650 hover:text-zinc-950 dark:text-zinc-450 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3" /> Düzenle
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3.5">İncelemede Bekleyenler ({writerInReviews.length})</h4>
                    {writerInReviews.length === 0 ? (
                      <p className="text-xs text-zinc-405 italic">Bekleyen yazınız bulunmuyor.</p>
                    ) : (
                      <div className="space-y-2">
                        {writerInReviews.slice(0, 3).map(ir => (
                          <div key={ir.id} className="flex justify-between items-center p-2.5 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850">
                            <span className="font-sans font-bold text-xs truncate max-w-[150px] sm:max-w-[200px] text-zinc-700 dark:text-zinc-200">{ir.title}</span>
                            {getStatusBadge(ir.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Editor action queue shortcut */}
              {currentRole === 'Editor' && (
                <div className="bg-zinc-50/50 dark:bg-zinc-900/20 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3.5">Kürasyon Bekleyen Son Başvuru</h4>
                  {editorNeedsApproval.length === 0 ? (
                    <p className="text-xs text-zinc-400 font-sans">Kürasyon bekleme listesi boş! Yeni gönderi bulunmuyor.</p>
                  ) : (
                    <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-1">{editorNeedsApproval[0].title}</p>
                        <p className="text-[10px] text-zinc-400 mt-1">Yazar: {allUsers.find(u => u.id === editorNeedsApproval[0].authorId || u.name === editorNeedsApproval[0].authorName)?.name || editorNeedsApproval[0].authorName} • {editorNeedsApproval[0].readTime} dk</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('editor_approvals')}
                        className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        İncele <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED ARTICLES list */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Daha Sonra Okunacak Kayıtlı Yazılarım</h3>
              {savedArticlesList.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                  <Bookmark className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-zinc-500">Henüz hiç makale kaydetmediniz.</p>
                  <button onClick={() => onNavigate('home')} className="mt-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs px-4 py-2 rounded-xl font-bold">Makaleleri Keşfet</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedArticlesList.map(a => (
                    <div 
                      key={a.id}
                      className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 flex gap-3 h-full relative"
                    >
                      <img 
                        src={a.coverImage} 
                        alt="" 
                        className="w-20 h-20 object-cover rounded-xl shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => handleImageErrorGlobal(e, 'cover')}
                      />
                      <div className="flex flex-col justify-between flex-1 pb-1">
                        <div>
                          <p onClick={() => onNavigate('article', { id: a.id })} className="font-sans font-bold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-2 hover:underline cursor-pointer leading-tight">{a.title}</p>
                          <span className="text-[10px] text-zinc-450 mt-1 block">Yazar: {allUsers.find(u => u.id === a.authorId || u.name === a.authorName)?.name || a.authorName}</span>
                        </div>
                        <span className="text-[9.5px] text-zinc-400 mt-2 block font-mono">{a.readTime} dakika okuma</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIKED ARTICLES */}
          {activeTab === 'liked' && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Beğendiğim Makaleler</h3>
              {likedArticlesList.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-805 rounded-3xl">
                  <Heart className="w-10 h-10 text-zinc-405 mx-auto mb-3" />
                  <p className="text-xs text-zinc-500">Henüz hiç makaleyi beğenmediniz.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {likedArticlesList.map(a => (
                    <div 
                      key={a.id}
                      onClick={() => onNavigate('article', { id: a.id })}
                      className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-150 dark:border-zinc-800/85 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md cursor-pointer transition-all flex items-center gap-3"
                    >
                      <img src={a.coverImage} alt="" className="w-14 h-14 object-cover rounded-lg" referrerPolicy="no-referrer" onError={(e) => handleImageErrorGlobal(e, 'cover')} />
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white line-clamp-1 leading-tight">{a.title}</p>
                        <p className="text-[10.5px] text-zinc-450 mt-1">Yazar: {allUsers.find(u => u.id === a.authorId || u.name === a.authorName)?.name || a.authorName} • {a.likes} beğeni</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FOLLOWED WRITERS */}
          {activeTab === 'following_writers' && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Takip Ettiğim Yazarlar</h3>
              {followedWriters.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                  <User className="w-12 h-12 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-450">Takip ettiğiniz yazar bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {followedWriters.map(writer => (
                    <div 
                      key={writer.id}
                      className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={writer.avatar} alt={writer.name} className="w-12 h-12 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800" referrerPolicy="no-referrer" onError={(e) => handleImageErrorGlobal(e, 'avatar')} />
                        <div>
                          <p onClick={() => onNavigate('profile', { userId: writer.id })} className="font-sans font-bold text-xs sm:text-sm text-zinc-900 dark:text-white hover:underline cursor-pointer">{writer.name}</p>
                          <p className="text-[10px] text-zinc-400">@{writer.username} • {writer.followersCount} takipçi</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('profile', { userId: writer.id })}
                        className="text-[10px] bg-white dark:bg-zinc-850 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
                      >
                        Yazıları
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MY WRITER ARTICLES LIST */}
          {activeTab === 'my_articles_list' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-serif font-bold text-zinc-905 dark:text-white">Makalelerim</h3>
                <span className="text-xs font-sans text-zinc-400">Toplam {authorArticles.length} içerik bulundu</span>
              </div>

              {authorArticles.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                  <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                  <p className="text-xs sm:text-sm text-zinc-500">Henüz hiç makale taslağınız veya yayınınız bulunmuyor.</p>
                  <div className="flex justify-center gap-3 mt-4">
                    <button onClick={() => onNavigate('edit_article')} className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs px-4 py-2 rounded-xl font-bold">Sıfırdan Makale Yaz</button>
                    <button onClick={() => onNavigate('edit_news')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-xl font-bold">Yeni Haber Yaz</button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-150 dark:border-zinc-85 w-full">
                          <th className="py-3 px-4 font-bold">Başlık</th>
                          <th className="py-3 px-4 font-bold">Tarih</th>
                          <th className="py-3 px-4 font-bold">Durum</th>
                          <th className="py-3 px-4 font-bold">İzlenme (Views)</th>
                          <th className="py-3 px-4 font-bold">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs">
                        {authorArticles.map(a => (
                          <tr key={a.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20">
                            <td className="py-3 px-4">
                              <span className="font-bold text-zinc-900 dark:text-white line-clamp-1">{a.title}</span>
                              <span className="text-[10px] text-zinc-400 block truncate max-w-[180px] mt-0.5">{a.summary}</span>
                            </td>
                            <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-mono">
                              {new Date(a.createdAt).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="py-3 px-4">
                              {getStatusBadge(a.status)}
                            </td>
                            <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-bold">
                              {a.views}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    if (a.status === 'Published') {
                                      onNavigate('article', { id: a.id });
                                    } else {
                                      const isNews = a.categoryId === 'gundem' || a.tags?.includes('gundem') || a.id?.startsWith('article_gundem');
                                      onNavigate(isNews ? 'edit_news' : 'edit_article', { articleId: a.id });
                                    }
                                  }}
                                  className="text-[11px] font-sans font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1"
                                >
                                  {a.status === 'Published' ? <Eye className="w-3" /> : <Edit3 className="w-3" />}
                                  {a.status === 'Published' ? 'Oku' : 'Düzelt'}
                                </button>
                                <button
                                  onClick={() => {
                                    onDeleteArticle(a.id);
                                    toast.info('Makale silindi.');
                                  }}
                                  className="p-1 hover:text-red-500 text-zinc-400 transition-colors cursor-pointer"
                                  title="Makaleyi Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EDITOR APPROVALS QUEUE */}
          {activeTab === 'editor_approvals' && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Küratör Onay Bekleyen Makaleler ({editorNeedsApproval.length})
              </h3>
              
              {editorNeedsApproval.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                  <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-400">Harika! İnceleme kuyruğu tamamen temizlendi.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {editorNeedsApproval.map(a => (
                    <div 
                      key={a.id}
                      className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-4"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">Kürasyon Adayı</span>
                          <h4 className="font-serif font-bold text-base text-zinc-900 dark:text-white mt-2 leading-tight">{a.title}</h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-sans">{a.summary}</p>
                        </div>
                        <img src={a.coverImage} alt="" className="w-16 h-16 object-cover rounded-xl shrink-0 border border-zinc-150" referrerPolicy="no-referrer" onError={(e) => handleImageErrorGlobal(e, 'cover')} />
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Yazar: <span className="font-bold text-zinc-700 dark:text-zinc-350">{allUsers.find(u => u.id === a.authorId || u.name === a.authorName)?.name || a.authorName}</span> • {a.readTime} dakika okuma</span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              onModifyArticleStatus(a.id, 'Published');
                              toast.success('Makale onaylandı ve platform genelinde yayına alındı!');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-101 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Onayla & Yayınla
                          </button>

                          <button
                            onClick={() => {
                              setReviewingArticleId(reviewingArticleId === a.id ? null : a.id);
                              setRejectionReasonInput('');
                            }}
                            className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 hover:bg-red-100 dark:border-red-900 text-xs px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reddet...
                          </button>
                        </div>
                      </div>

                      {/* Expandable Rejection Reason Module */}
                      {reviewingArticleId === a.id && (
                        <div className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-950 rounded-xl space-y-2.5 animate-in slide-in-from-top-2 duration-150">
                          <p className="text-[10px] uppercase font-bold text-red-600 block">Reddedilme / Geri Bildirim Gerekçesi yazın:</p>
                          <textarea
                            value={rejectionReasonInput}
                            onChange={(e) => setRejectionReasonInput(e.target.value)}
                            placeholder="Yazım kurallarına dikkat edilmemiş, lütfen şuraları düzenleyin vb."
                            className="w-full text-xs bg-white dark:bg-zinc-950 border border-zinc-200 p-2 rounded-lg text-zinc-800 dark:text-zinc-100 focus:outline-none"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                if (!rejectionReasonInput.trim()) {
                                  toast.error('Gerekçe girmeden reddedemezsiniz.');
                                  return;
                                }
                                onModifyArticleStatus(a.id, 'Rejected', rejectionReasonInput.trim());
                                setReviewingArticleId(null);
                                toast.info('Yazı geri çevrildi ve yazara açıklamalı bildirim gönderildi.');
                              }}
                              className="bg-red-600 text-white text-[10.5px] px-3.5 py-1 rounded-lg font-semibold"
                            >
                              Reddi Kesinleştir
                            </button>
                            <button
                              onClick={() => setReviewingArticleId(null)}
                              className="text-[10px] bg-zinc-200 text-zinc-600 px-3 py-1 rounded-lg"
                            >
                              Vazgeç
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: EDITOR CATEGORY ADMIN */}
          {activeTab === 'editor_categories' && (
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Doğrudan Kategori Yönetimi</h3>
              
              {/* Category adder Form */}
              <form onSubmit={handleAddNewCategory} className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-3">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Yeni Kategori Ekle</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 font-bold">Kategori Adı *</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Örn: Sanat ve Siyaset"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2.5 rounded-xl text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 font-bold">Açıklama</label>
                    <input
                      type="text"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Örn: Sanat kuramları, ressam biyografileri."
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2.5 rounded-xl text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-400 font-bold">İkon</label>
                    <select
                      value={newCatIcon}
                      onChange={(e) => setNewCatIcon(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2.5 rounded-xl text-zinc-900 dark:text-white"
                    >
                      <option value="Sparkles">✨ Sparkles (Kıvılcım)</option>
                      <option value="BookOpen">📖 BookOpen (Kitap)</option>
                      <option value="MessageSquare">💬 MessageSquare (Sohbet)</option>
                      <option value="TrendingUp">📈 TrendingUp (Gündem)</option>
                      <option value="Globe">🌐 Globe (Küresel)</option>
                      <option value="ShoppingBag">🛍️ ShoppingBag (Alışveriş)</option>
                      <option value="CheckSquare">☑️ CheckSquare (Onaylı)</option>
                      <option value="Cpu">💻 Cpu (Teknoloji)</option>
                      <option value="Scissors">✂️ Scissors (El Emeği)</option>
                      <option value="Layers">🥞 Layers (Katmanlar)</option>
                      <option value="ExternalLink">🔗 ExternalLink (E-İhracat)</option>
                      <option value="Truck">🚚 Truck (Lojistik)</option>
                      <option value="Brain">🧠 Brain (Yapay Zeka)</option>
                      <option value="Coins">🪙 Coins (Para/Finans)</option>
                      <option value="Calendar">📅 Calendar (Etkinlikler)</option>
                      <option value="Compass">🧭 Compass (Keşif)</option>
                      <option value="Rocket">🚀 Rocket (Girişimcilik)</option>
                      <option value="Lightbulb">💡 Lightbulb (Yenilikçi Fikir)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:opacity-90"
                  >
                    Yeni Kategori Yarat
                  </button>
                </div>
              </form>

              {/* Category table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full font-sans border-collapse text-left">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 text-[10px] text-zinc-400 font-bold uppercase py-2">
                      <th className="p-3 pl-4">Kategori Adı</th>
                      <th className="p-3">Görünüm Slug</th>
                      <th className="p-3">Açıklama</th>
                      <th className="p-3">Makale Sayısı</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-zinc-50 dark:divide-zinc-850">
                    {categories.map(c => {
                      const count = allArticles.filter(a => a.categoryId === c.id && a.status === 'Published').length;
                      return (
                        <tr key={c.id} className="hover:bg-zinc-50/50">
                          <td className="p-3 pl-4 font-bold text-zinc-900 dark:text-white">{c.name}</td>
                          <td className="p-3 font-mono text-zinc-400">{c.slug}</td>
                          <td className="p-3 text-zinc-500 max-w-xs truncate">{c.description}</td>
                          <td className="p-3 text-zinc-805 font-bold font-mono">{count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: ADMIN USERS DEEP TABLE */}
          {activeTab === 'admin_users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Kullanıcı Roller Table ve Yönetimi</h3>
                <span className="text-[11px] font-sans text-zinc-400">Toplam {allUsers.length} sistem üyesi</span>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 text-[10px] text-zinc-400 font-bold uppercase py-3 px-4 w-full">
                        <th className="py-3 px-4">Kullanıcı Bilgisi</th>
                        <th className="py-3 px-4">E-posta Adresi</th>
                        <th className="py-3 px-4">Rolü (Sistem Derecesi)</th>
                        <th className="py-3 px-4 font-bold">Rol Değiştirci</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {allUsers.map(user => (
                        <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/10">
                          <td className="py-3 px-4 flex items-center gap-2.5">
                            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-zinc-100" referrerPolicy="no-referrer" onError={(e) => handleImageErrorGlobal(e, 'avatar')} />
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-white">{user.name}</p>
                              <p className="text-[10px] text-zinc-405">@{user.username}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400">{user.email}</td>
                          <td className="py-3 px-4 font-bold">
                            {user.role}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={user.role}
                              onChange={(e) => {
                                onUpdateUserRole(user.id, e.target.value as UserRole);
                                toast.success(`${user.name} kullanıcısının rolü '${e.target.value}' olarak güncellendi.`);
                              }}
                              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-lg text-[11.5px] cursor-pointer"
                            >
                              <option value="Reader">Reader (Okuyucu)</option>
                              <option value="Writer">Writer (Yazar)</option>
                              <option value="Editor">Editor (Editör)</option>
                              <option value="Admin">Admin (Yönetici)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ADMIN GLOBAL CATALOGUE */}
          {activeTab === 'admin_catalog' && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white">Küresel İlan Kataloğu (Yalın Moderasyon)</h3>
              <p className="text-xs text-zinc-400">Admin olarak tüm yazıları listeyebilir, dilediğiniz yazıyı inceleme yapmaksızın silebilir veya arşivleyebilirsiniz.</p>
              
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left font-sans border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 text-[10px] text-zinc-400 font-bold uppercase py-2">
                      <th className="p-3 pl-4">Yazı Başlığı</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Yazar</th>
                      <th className="p-3">Durum</th>
                      <th className="p-3">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {allArticles.map(a => (
                      <tr key={a.id} className="hover:bg-zinc-50/50">
                        <td className="p-3 pl-4 font-bold text-zinc-900 dark:text-white line-clamp-1 max-w-xs">{a.title}</td>
                        <td className="p-3 text-zinc-500">{a.categoryId}</td>
                        <td className="p-3 text-zinc-405">{allUsers.find(u => u.id === a.authorId || u.name === a.authorName)?.name || a.authorName}</td>
                        <td className="p-3">{getStatusBadge(a.status)}</td>
                        <td className="p-3">
                          <button
                            onClick={() => {
                              onDeleteArticle(a.id);
                              toast.info('Makale silindi.');
                            }}
                            className="text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <Trash2 className="w-3" /> Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: AGENDA NEWS (GELEN HABERLER) */}
          {activeTab === 'agenda_news' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-150 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-black text-zinc-950 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-emerald-500 w-5 h-5" />
                    Gündem Gelen Haberler Modülü
                  </h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 font-sans mt-1">
                    Otomatik çekilen dış haber akışları, trend dereceleri ve AI Analiz motoru
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const sampleNewsList = [
                        {
                          id: `news_sim_${Date.now()}`,
                          title: 'Shopify, Türkiye’deki satıcılara özel yerel ödeme iş ortaklığı anlaşmasını sundu',
                          sourceName: 'Shopify Editions',
                          sourceUrl: 'https://shopify.com',
                          originalUrl: 'https://shopify.com/editions/tr-payments-2026',
                          coverImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&q=80&w=1200',
                          createdAt: new Date().toISOString(),
                          category: 'dijital-ticaret',
                          summary: 'Shopify, Türkiye e-ticaret pazarındaki KOBİ’lerin küresel kart ödemelerini daha rahat alabilmesi ve komisyon marjlarının iyileştirilmesi için yeni bir yerel entegratör paketi duyurdu.',
                          status: 'Bekliyor',
                          importanceScores: {
                            trInterest: 91,
                            eCommerceImpact: 86,
                            sellerImpact: 89,
                            trendPower: 85,
                            urgency: 74,
                            readerInterest: 88,
                            generalScore: 86
                          }
                        },
                        {
                          id: `news_sim_2_${Date.now()}`,
                          title: 'Etsy, el emeği satıcıları için yeni yapay zeka tabanlı telif/özgünlük koruma aracını devreye alıyor',
                          sourceName: 'Etsy Seller Handbook',
                          sourceUrl: 'https://etsy.com',
                          originalUrl: 'https://etsy.com/sellers/ai-protection-2026',
                          coverImage: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=1200',
                          createdAt: new Date().toISOString(),
                          category: 'etsy',
                          summary: 'Yapay zeka modellerinin telifli tasarımları taklit etmesini önlemek ve üretici özgünlüğünü ispatlamak için Etsy yeni kriptografik satıcı damgasını tanıttı.',
                          status: 'Bekliyor',
                          importanceScores: {
                            trInterest: 80,
                            eCommerceImpact: 82,
                            sellerImpact: 85,
                            trendPower: 88,
                            urgency: 79,
                            readerInterest: 84,
                            generalScore: 83
                          }
                        },
                        {
                          id: `news_sim_3_${Date.now()}`,
                          title: 'WeTalks & WORLDEF Sınır Ötesi E-Ticaret ve Yapay Zeka Zirvesi planlandı',
                          sourceName: 'WeTalks Gündem',
                          sourceUrl: 'https://worldef.net',
                          originalUrl: 'https://worldef.net/ai-summit-2026',
                          coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
                          createdAt: new Date().toISOString(),
                          category: 'etkinlikler',
                          summary: 'Sınır ötesi e-ticaret (e-ihracat) operasyonlarında üretken yapay zekanın verimlilik sınırlarını test edeceğimiz, WeTalks sponsorluğundaki teknoloji buluşması.',
                          status: 'Bekliyor',
                          importanceScores: {
                            trInterest: 96,
                            eCommerceImpact: 94,
                            sellerImpact: 92,
                            trendPower: 95,
                            urgency: 90,
                            readerInterest: 93,
                            generalScore: 94
                          }
                        }
                      ];
                      setIncomingNews(prev => [...sampleNewsList, ...prev]);
                      updateAgendaAndSourcesInStorage([...sampleNewsList, ...incomingNews], agendaSources);
                      
                      // Auto extract events from Yapay Zeka news
                      autoExtractAndAddEvents(sampleNewsList);
                      
                      toast.success('3 Yeni Gündem Haberi başarıyla taranarak çekildi ve saptanan yeni etkinlikler AI ile otomatik olarak takvime işlendi!');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold font-sans text-xs text-white px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Yeni Gündem Haberlerini Çek
                  </button>

                  <button
                    onClick={() => {
                      setIncomingNews([]);
                      updateAgendaAndSourcesInStorage([], agendaSources);
                      toast.info('Gelen haber havuzu temizlendi.');
                    }}
                    className="border border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-100 text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    Havuzu Temizle
                  </button>
                </div>
              </div>

              {/* 7/24 AUTONOMOUS AUTOPILOT NEWS CRAWLER & QUALITY GATE PANEL */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:from-emerald-950/25 dark:via-zinc-900 dark:to-zinc-900 border border-emerald-500/30 dark:border-emerald-800/40 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        7/24 OTOPİLOT BOTU {autopilotInfo?.isActive ? 'AKTİF' : 'DURAKLATILDI'}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">
                        Arka Plan Otonom Yayın Motoru
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current" />
                      Sistem Kendi Kendine Haber Tarıyor, Yazıyor & Yayınlıyor
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                      Siz herhangi bir butona basmasanız dahi, sistem arka planda periyodik olarak global e-ticaret duyurularını ve sektör bültenlerini tarar. Gemini modeli WeTalks çizgisiyle baştan yazar, <strong>AI Baş Editör Kalite Denetçisi 5 kriterde (Skor ≥ 75)</strong> onaylarsa otomatik olarak doğrudan yayına alır.
                    </p>
                  </div>

                  {/* Autopilot Controls */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleToggleAutopilot(!autopilotInfo?.isActive)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                        autopilotInfo?.isActive
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{autopilotInfo?.isActive ? 'Otopilot Açık' : 'Otopilotu Başlat'}</span>
                    </button>

                    <button
                      onClick={handleTriggerAutopilotNow}
                      disabled={isRunningAutopilotNow}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      title="Beklemeden anında bir tarama döngüsü başlatır"
                    >
                      {isRunningAutopilotNow ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Taranıyor & Yazılıyor...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>⚡ Şimdi Otopilot Taramasını Çalıştır</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sources & Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-emerald-500/20 dark:border-emerald-800/30 text-xs">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-emerald-200/60 dark:border-emerald-900/60">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      7/24 Taranan Kaynaklar
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-medium">
                        Shopify Editions
                      </span>
                      <span className="bg-amber-100/70 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-medium">
                        Amazon Seller Central
                      </span>
                      <span className="bg-blue-100/70 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-medium">
                        Ticaret Bakanlığı E-İhracat
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-emerald-200/60 dark:border-emerald-900/60">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Tarama Periyodu & Bir Sonraki Döngü
                    </span>
                    <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                      <span className="font-semibold">Her {autopilotInfo?.intervalMinutes || 30} dakikada bir</span>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Otomatik Devrede
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-950/80 border border-emerald-200/60 dark:border-emerald-900/60">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Otopilot Başarı Skoru Eşiği
                    </span>
                    <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
                      <span className="font-semibold">Skor ≥ %75 ise Direkt Canlı</span>
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        5 Kriterli AI Gate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Autopilot Activity Log */}
                {autopilotInfo?.logs && autopilotInfo.logs.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                      Son Otopilot Tarama & Denetim Günlüğü:
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {autopilotInfo.logs.slice(0, 4).map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white/60 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-800/60 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{log.title}</span>
                            <span className="text-[10px] text-zinc-400 shrink-0">({log.source})</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-[11px]">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">%{log.score}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === 'Published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                              {log.status === 'Published' ? 'Yayında' : 'Taslak'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* LIVE URL SCRAPER & AI REWRITER INTERACTION BOX */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-900 border border-indigo-200/80 dark:border-indigo-900/40 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h4 className="text-sm font-sans font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                      Otonom Haber Hattı & AI Kalite Denetçisi (Quality Gatekeeper)
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      Dış haber linkini girin; sistem içeriği çeker, WeTalks üslubuyla baştan yazar, konuya uygun editoryal görseli belirler ve son aşamada <strong>AI Baş Editör Kalite Kriterleri (Skor ≥ 75)</strong> denetiminden geçirerek otomatik yayına alır.
                    </p>
                  </div>

                  {/* Auto-Publish Toggle Switch */}
                  <label className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-950 border border-indigo-200 dark:border-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer shadow-xs shrink-0 select-none">
                    <input
                      type="checkbox"
                      checked={autoPublishIfAuditPassed}
                      onChange={(e) => setAutoPublishIfAuditPassed(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Kriteri Geçerse Otomatik Yayınla (Skor ≥ 75)
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={scrapeUrlInput}
                      onChange={(e) => setScrapeUrlInput(e.target.value)}
                      placeholder="Örn: https://shopify.com/editions/news veya bir e-ticaret haber linki..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-indigo-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunAutonomousPipeline()}
                      disabled={isScrapingAndRewriting || !scrapeUrlInput.trim()}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
                      title="Haberi çeker, yeniden yazar, AI kalite denetiminden geçirip kriteri sağlarsa doğrudan yayına alır"
                    >
                      {isScrapingAndRewriting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Otonom İşleniyor...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-amber-300" />
                          <span>⚡ Otonom Çek, Denetle & Yayınla</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleScrapeAndRewrite()}
                      disabled={isScrapingAndRewriting || !scrapeUrlInput.trim()}
                      className="px-3.5 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold font-sans transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      title="Haberi çeker ve yayına almadan önce önizleme panelinde incelemenizi sağlar"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>İncelemeli Önizle</span>
                    </button>
                  </div>
                </div>

                {isScrapingAndRewriting && (
                  <div className="p-3.5 bg-indigo-100/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl flex items-center gap-3 text-xs text-indigo-950 dark:text-indigo-200 font-medium shadow-xs animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-indigo-600" />
                    <span>{scrapingStep || 'Yapay zeka modelleri haber metnini, editoryal denetimi ve görselini işliyor...'}</span>
                  </div>
                )}

                {/* Rewritten Article Preview & Visual Controller Card */}
                {rewrittenItem && (
                  <div className="mt-4 p-5 bg-white dark:bg-zinc-950 border border-indigo-300/80 dark:border-indigo-900 rounded-2xl shadow-md space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-3 border-b border-zinc-150 dark:border-zinc-850">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200">
                            WeTalks Çizgisiyle Hazırlandı ✨
                          </span>
                          <span className="text-[10px] font-sans text-zinc-400">
                            Kaynak: <strong className="text-zinc-700 dark:text-zinc-200">{rewrittenItem.sourceName}</strong>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            Kategori: <strong className="text-indigo-600 dark:text-indigo-400">{rewrittenItem.category}</strong>
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-serif font-black text-zinc-900 dark:text-zinc-100 leading-snug">
                          {rewrittenItem.title}
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
                          {rewrittenItem.summary}
                        </p>
                      </div>
                    </div>

                    {/* AI EDITORIAL AUDIT & QUALITY GATE CARD */}
                    {rewrittenItem.aiAudit && (
                      <div className={`p-4 rounded-xl border ${rewrittenItem.aiAudit.verdict === 'APPROVED_FOR_AUTO_PUBLISH' ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/60' : 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/60'} space-y-3`}>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${rewrittenItem.aiAudit.verdict === 'APPROVED_FOR_AUTO_PUBLISH' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-amber-600 text-white shadow-xs'}`}>
                              %{rewrittenItem.aiAudit.score}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  AI Baş Editör Kalite & Doğruluk Karnesi
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${rewrittenItem.aiAudit.verdict === 'APPROVED_FOR_AUTO_PUBLISH' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'}`}>
                                  {rewrittenItem.aiAudit.verdict === 'APPROVED_FOR_AUTO_PUBLISH' ? '✓ Kriterleri Sağladı (Yayına Uygun)' : '⚠ Manuel İnceleme Önerildi'}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                                {rewrittenItem.aiAudit.summary}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 5 Criteria Micro Score Bars */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-[10.5px]">
                          <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-zinc-400 block text-[9.5px]">Doğruluk & Nesnellik</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{rewrittenItem.aiAudit.criteria.accuracyAndObjectivity} / 10</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-zinc-400 block text-[9.5px]">Satıcı & Pazar Değeri</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{rewrittenItem.aiAudit.criteria.sellerValueAndRelevance} / 10</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-zinc-400 block text-[9.5px]">Türkçe Editoryal Çizgi</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{rewrittenItem.aiAudit.criteria.linguisticQuality} / 10</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
                            <span className="text-zinc-400 block text-[9.5px]">Görsel & Konu Uyumu</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{rewrittenItem.aiAudit.criteria.visualContextMatch} / 10</span>
                          </div>
                          <div className="p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800 col-span-2 sm:col-span-1">
                            <span className="text-zinc-400 block text-[9.5px]">Kaynak Atfı & Telif</span>
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">{rewrittenItem.aiAudit.criteria.attributionAndSafety} / 10</span>
                          </div>
                        </div>

                        {/* Critique Notes list */}
                        {rewrittenItem.aiAudit.critiqueNotes && rewrittenItem.aiAudit.critiqueNotes.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                            <strong className="text-zinc-700 dark:text-zinc-300">Baş Editör Değerlendirmesi:</strong>
                            {rewrittenItem.aiAudit.critiqueNotes.map((note, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 bg-white/60 dark:bg-zinc-900/60 px-2 py-0.5 rounded text-[10.5px] border border-zinc-200/50 dark:border-zinc-800/50">
                                • {note}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Visual Management Sub-section */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="md:col-span-5 relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-750 shadow-sm bg-zinc-100 dark:bg-zinc-900">
                        <img
                          src={rewrittenItem.selectedCover}
                          alt="Selected Cover"
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageErrorGlobal(e, 'cover')}
                        />
                        <div className="absolute top-2 left-2">
                          {rewrittenItem.coverSourceType === 'ai' && (
                            <span className="text-[9.5px] font-bold px-2 py-1 rounded-md bg-purple-600 text-white shadow-sm flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> AI Üretimi (Imagen)
                            </span>
                          )}
                          {rewrittenItem.coverSourceType === 'og' && (
                            <span className="text-[9.5px] font-bold px-2 py-1 rounded-md bg-blue-600 text-white shadow-sm flex items-center gap-1">
                              <Globe className="w-3 h-3" /> Orijinal Kaynak Görseli
                            </span>
                          )}
                          {rewrittenItem.coverSourceType === 'curated' && (
                            <span className="text-[9.5px] font-bold px-2 py-1 rounded-md bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Konuya Özel E-Ticaret Görseli
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <span className="text-[10.5px] font-bold text-zinc-500 uppercase tracking-wider block">Görsel Tercihi & Alternatifler</span>
                          <div className="flex flex-wrap gap-1.5">
                            {rewrittenItem.ogImage && (
                              <button
                                type="button"
                                onClick={() => setRewrittenItem(prev => prev ? ({ ...prev, selectedCover: prev.ogImage!, coverSourceType: 'og' }) : null)}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${rewrittenItem.coverSourceType === 'og' ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950 dark:border-blue-600 dark:text-blue-300 font-bold' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
                              >
                                <Globe className="w-3 h-3" />
                                Orijinal Kaynak Görseli
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={handleRegenerateCoverForRewritten}
                              disabled={isRegeneratingCover}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${rewrittenItem.coverSourceType === 'ai' ? 'bg-purple-50 border-purple-400 text-purple-700 dark:bg-purple-950 dark:border-purple-600 dark:text-purple-300 font-bold' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'} disabled:opacity-50`}
                            >
                              {isRegeneratingCover ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Üretiliyor...</span>
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-3 h-3 text-purple-600" />
                                  <span>Yapay Zeka ile Görsel Üret</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setRewrittenItem(prev => prev ? ({ ...prev, selectedCover: prev.curatedImage, coverSourceType: 'curated' }) : null)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${rewrittenItem.coverSourceType === 'curated' ? 'bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-600 dark:text-emerald-300 font-bold' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'}`}
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>İlgili E-Ticaret Stok Görseli</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-zinc-400">İpucu: Kaynak sitede telif sorunu varsa 'Yapay Zeka ile Görsel Üret' veya 'İlgili Stok Görsel' seçeneğini tercih edebilirsiniz.</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() => setShowFullRewrittenContent(!showFullRewrittenContent)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                          >
                            {showFullRewrittenContent ? 'Analiz Metnini Gizle ▲' : 'Tam Analiz Metnini İncele ▼'}
                          </button>
                          <div className="flex-1"></div>
                          <button
                            type="button"
                            onClick={() => handleSaveRewrittenArticle('Draft')}
                            className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Taslaklara Ekle
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveRewrittenArticle('Published')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Hemen Yayına Al
                          </button>
                        </div>
                      </div>
                    </div>

                    {showFullRewrittenContent && (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-sans leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-line">
                        {rewrittenItem.content}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* News Filter Dashboard Row */}
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Kategori Filtresi</label>
                  <select
                    value={newsCatFilter}
                    onChange={(e) => setNewsCatFilter(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2 rounded-xl text-zinc-850 dark:text-white"
                  >
                    <option value="all">Tüm Kategoriler</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Durum Filtresi</label>
                  <select
                    value={newsStatusFilter}
                    onChange={(e) => setNewsStatusFilter(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2 rounded-xl text-zinc-850 dark:text-white"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="Bekliyor">Bekliyor</option>
                    <option value="Incelendi">İncelendi</option>
                    <option value="AI Analizi Hazır">AI Analizi Hazır</option>
                    <option value="Taslak Oluşturuldu">Taslak Oluşturuldu</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1">Min. AI Önem Skoru</label>
                  <select
                    value={newsScoreFilter}
                    onChange={(e) => setNewsScoreFilter(Number(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2 rounded-xl text-zinc-850 dark:text-white"
                  >
                    <option value="0">Fark etmez (Tümü)</option>
                    <option value="80">80+ Puan (Yüksek İlgi)</option>
                    <option value="85">85+ Puan (Seçkin Trend)</option>
                    <option value="90">90+ Puan (Kritik/Acil)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="text-xs text-zinc-500 font-sans leading-tight">
                    Filtreye uygun <span className="font-bold text-zinc-900 dark:text-white">{
                      incomingNews.filter(n => {
                        const matchCat = newsCatFilter === 'all' || n.category === newsCatFilter;
                        const matchStatus = newsStatusFilter === 'all' || n.status === newsStatusFilter;
                        const matchScore = n.importanceScores.generalScore >= newsScoreFilter;
                        return matchCat && matchStatus && matchScore;
                      }).length
                    }</span> makale bulundu.
                  </div>
                </div>
              </div>

              {/* News List Grid */}
              <div className="grid grid-cols-1 gap-4">
                {incomingNews.filter(n => {
                  const matchCat = newsCatFilter === 'all' || n.category === newsCatFilter;
                  const matchStatus = newsStatusFilter === 'all' || n.status === newsStatusFilter;
                  const matchScore = (n.importanceScores?.generalScore || 0) >= newsScoreFilter;
                  return matchCat && matchStatus && matchScore;
                }).map(item => {
                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        selectedNewsForAnalysis?.id === item.id 
                          ? 'bg-zinc-900 text-white border-zinc-800 shadow-xl' 
                          : 'bg-white dark:bg-zinc-900/45 border-zinc-150 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-sans font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350">
                              {categories.find(c => c.id === item.category)?.name || item.category}
                            </span>
                            <span className="text-[10px] font-sans text-zinc-400">
                              Kaynak: <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="underline font-bold text-gold">{item.sourceName}</a>
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400 block">
                              {item.createdAt.slice(0, 10)}
                            </span>
                          </div>

                          <h4 className="font-serif font-black text-sm sm:text-base leading-snug">
                            {item.title}
                          </h4>

                          <p className="text-xs text-zinc-500 dark:text-zinc-300 font-sans line-clamp-2 leading-relaxed">
                            {item.summary}
                          </p>

                          {/* Scores breakdown tag list */}
                          <div className="flex flex-wrap gap-2 pt-2 text-[10px] font-mono">
                            <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">
                              TR İlgisi: %{item.importanceScores.trInterest}
                            </span>
                            <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded">
                              Satıcı Etkisi: %{item.importanceScores.sellerImpact}
                            </span>
                            <span className="bg-sky-500/10 text-sky-505 px-2 py-0.5 rounded">
                              Trend Gücü: %{item.importanceScores.trendPower}
                            </span>
                            <span className="bg-emerald-500/15 text-emerald-500 font-bold px-2 py-0.5 rounded">
                              AI Önem Skoru: %{item.importanceScores.generalScore}
                            </span>
                          </div>
                        </div>

                        {/* Actions column */}
                        <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                          <button
                            onClick={() => handleRunAutonomousPipeline(item.originalUrl || item.sourceUrl || item.title)}
                            disabled={isScrapingAndRewriting}
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                            title="Haberi çeker, yeniden yazar, AI kalite denetiminden geçirip kriteri sağlarsa doğrudan yayına alır"
                          >
                            <Zap className="w-3.5 h-3.5 fill-current animate-pulse text-amber-200" />
                            <span>Otonom Yayınla</span>
                          </button>

                          <button
                            onClick={() => {
                              setAnalyzingNewsId(item.id);
                              // Simulate premium model analyzing the text and bringing detailed insights
                              setTimeout(() => {
                                const customAnalysis = {
                                  title: `AI Analizi: ${item.title}`,
                                  summary: `Bu gelişme, özellikle sınır ötesi lojistik ve fiyatlandırma yapısını derinden etkileyecektir.`,
                                  whatHappened: `Global ticaret akışlarında vergi dinamikleri değişiyor. Muafiyet limitlerinin kaldırılması, lojistik konsolidatörler ve ekspres kurye şirketleri üzerinde gümrük beyan yığılmalarına yol açacaktır.`,
                                  trMarketMeaning: `Sınır kapılarında işlemlerin yavaşlaması bekleniyor. Ancak bu durum, Türkiye’de yerleşik üretim altyapısına sahip olan e-ticaret siteleri için Avrupa kapısında hız/teslimat avantajı doğurabilir.`,
                                  opportunities: `- Yakın coğrafya (nearshoring) tedarik zincirlerinin popülerleşmesi.\n- Doğu Avrupa depolarından yerel faturalı hızlı teslimat modelleri sunmak.`,
                                  risks: `- Ek ithalat vergileri dolayısıyla nihai tüketici fiyatlarının %20-30 civarında artması.\n- İade süreçlerinin hem pahalı hem de gümrük mevzuatı nedeniyle karmaşık hale gelmesi.`,
                                  weTalksComment: `WeTalks ekibi olarak, satıcıların tek bir e-ticaret kanalına veya coğrafyaya bağımlı kalmamasını öneriyoruz. Bölgesel mevzuat değişiklikleri en güçlü satıcıları bile bir gecede pazar dışı bırakabilir. Multi-channel (çok kanallı) yapı şarttır.`,
                                  suggestedHeadings: [
                                    `Yeni Gümrük Muafiyeti Dönemi: Satıcılar İçin Yolun Sonu mu?`,
                                    `E-Ticarette Yeni Gümrük Kararı: Kim Kazanacak, Kim Kaybedecek?`,
                                    `Temu ve Amazon Hamleleri Karşısında Yerli Entegratörlerin Yeni Yol Haritası`
                                  ],
                                  seoTitle: `${item.title.substring(0, 50)} - AI Sektör Analizi`,
                                  seoDesc: `WeTalks editörünün gözünden sınır ötesi ticaretteki en güncel krizlerin ve fırsatların dürüst analizi.`,
                                  suggestedTags: `${categories.find(c => c.id === item.category)?.name || 'E-Ticaret'}, Sınır Ötesi, Gümrük Yasası, Lojistik, Maliyet Analizi`
                                };

                                setAiAnalysisResult(customAnalysis);
                                setAnalyzingNewsId(null);
                                setSelectedNewsForAnalysis(item);
                                
                                // Update item status
                                const updated = incomingNews.map(n => n.id === item.id ? { ...n, status: 'AI Analizi Hazır' } : n);
                                setIncomingNews(updated);
                                updateAgendaAndSourcesInStorage(updated, agendaSources);
                              }, 800);
                            }}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 animate-bounce-slow" />
                            {analyzingNewsId === item.id ? 'Yorumlanıyor...' : 'AI ile Analiz Et'}
                          </button>

                          <button
                            onClick={() => {
                              const updated = incomingNews.map(n => n.id === item.id ? { ...n, status: 'Taslak Oluşturuldu' } : n);
                              setIncomingNews(updated);
                              
                              // Trigger callback to save this in central articles as a Draft!
                              const draftContent = `
<h2>Gündem Analizi: ${item.title}</h2>
<p><strong>WeTalks Analiz Ediyor:</strong> Sektörde büyük ses getiren bu gelişmenin ardındaki gerçekleri dürüstlükle ele alıyoruz. İşte detaylar:</p>

<h3>1. Ne Oldu? (Gelişmenin Özeti)</h3>
<p>${item.summary}</p>

<h3>2. Türkiye Pazarı İçin Anlamı</h3>
<p>Türkiye’deki üreticiler ve satıcılar için bu durum hem ciddi avantajlar hem de riskler barındırıyor. Lojistik hızı yüksek olan satıcılar bu tip regülasyonlar sayesinde rakiplerine fark atabilir.</p>

<h3>3. Satıcılar İçin Fırsatlar & Riskler</h3>
<ul>
  <li><strong>Fırsat:</strong> Yakın coğrafyada konumlanmak ve hızlı gümrükleme sunmak.</li>
  <li><strong>Risk:</strong> Artan kargo maliyetleri ve gümrükleme tıkanmaları.</li>
</ul>

<blockquote>Bu içerik kaynak belirtilerek WeTalks yardımcı editör asistanı tarafından derlenmiş ve yayın yönetmeninin onayıyla taslağa dönüştürülmüştür.</blockquote>
                              `;
                              
                              if (onSaveArticle) {
                                onSaveArticle({
                                  title: item.title,
                                  summary: item.summary,
                                  content: draftContent,
                                  categoryId: item.category,
                                  status: 'Draft',
                                  readTime: 4,
                                  authorId: 'author_wetalks_ai',
                                  authorName: 'WeTalks',
                                  tags: [item.category, 'ai-gundem', 'girişimcilik'],
                                  coverImage: (item as any).coverImage || (item.category === 'dijital-ticaret' ? 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&q=80&w=1200' : item.category === 'etsy' ? 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&q=80&w=1200' : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200')
                                }, 'Draft');
                              }
                              
                              updateAgendaAndSourcesInStorage(updated, agendaSources);
                              toast.success('Harika! Analiz, normal Yazı Yönetimi listesine "Taslak (Draft)" olarak eklendi.');
                            }}
                            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-250 hover:dark:bg-zinc-700 font-bold text-xs px-3 py-2 rounded-xl"
                          >
                            Yazıya Dönüştür
                          </button>

                          <button
                            onClick={() => {
                              const updated = incomingNews.map(n => n.id === item.id ? { ...n, status: 'Reddedildi' } : n);
                              setIncomingNews(updated);
                              updateAgendaAndSourcesInStorage(updated, agendaSources);
                              toast.info('Haber reddedilenler listesine kaldırıldı.');
                            }}
                            className="text-zinc-400 hover:text-red-500 text-[11px]"
                          >
                            Reddet
                          </button>
                        </div>
                      </div>

                      {/* Expanded AI Analysis Detail Module */}
                      {selectedNewsForAnalysis?.id === item.id && aiAnalysisResult && (
                        <div className="mt-5 p-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl text-zinc-900 dark:text-zinc-100 space-y-4 animate-in fade-in duration-200">
                          <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-850 pb-2.5">
                            <h5 className="font-serif font-black text-sm flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                              <Sparkles className="w-4 h-4 animate-pulse" />
                              WeTalks Derinlemesine Gündem Değerlendirmesi
                            </h5>
                            <button 
                              onClick={() => {
                                setSelectedNewsForAnalysis(null);
                                setAiAnalysisResult(null);
                              }}
                              className="text-xs text-zinc-400 hover:text-zinc-600 uppercase font-black"
                            >
                              Kapat ✕
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans">
                            <div className="space-y-3">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">🚨 NE OLDU? / GELİŞME ODAĞI</span>
                                <p className="mt-1 text-zinc-755 leading-relaxed">{aiAnalysisResult.whatHappened}</p>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">💎 NEDEN GENEL OLARAK ÖNEMLİ?</span>
                                <p className="mt-1 text-zinc-755 leading-relaxed">{aiAnalysisResult.whyImportant}</p>
                              </div>

                              <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">🇹🇷 TÜRKİYE PAZARI İÇİN ANLAMI</span>
                                <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">{aiAnalysisResult.trMarketMeaning}</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="p-3 bg-red-50/40 dark:bg-red-950/20 border border-red-100 dark:border-red-950/50 rounded-xl">
                                <span className="text-[10px] uppercase font-bold text-red-500 block">⚠️ SATICILAR İÇİN TEHLİKE / RİSKLER</span>
                                <p className="mt-1 whitespace-pre-line leading-relaxed text-zinc-700 dark:text-zinc-300">{aiAnalysisResult.risks}</p>
                              </div>

                              <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-950/50 rounded-xl">
                                <span className="text-[10px] uppercase font-bold text-emerald-500 block">💡 SATICILAR İÇİN FIRSATLAR</span>
                                <p className="mt-1 whitespace-pre-line leading-relaxed text-zinc-700 dark:text-zinc-300">{aiAnalysisResult.opportunities}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-xs space-y-2">
                            <span className="text-[10px] uppercase font-bold text-indigo-500 block">🎤 WETALKS RESMİ YAZAR YORUMU</span>
                            <p className="italic text-zinc-755 leading-relaxed">"{aiAnalysisResult.weTalksComment}"</p>
                          </div>

                          {/* SEO & metadata outputs */}
                          <div className="border-t border-zinc-200 dark:border-zinc-850 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-bold text-zinc-400 block">📋 Önerilen Alternatif Başlıklar</span>
                              <ul className="list-disc pl-4 space-y-1 text-zinc-600 dark:text-zinc-400">
                                {aiAnalysisResult.suggestedHeadings.map((h: string, idx: number) => (
                                  <li 
                                    key={idx} 
                                    className="hover:text-indigo-500 transition-colors cursor-pointer" 
                                    onClick={() => {
                                      navigator.clipboard.writeText(h);
                                      toast.success(`"${h}" panoya kopyalandı!`);
                                    }}
                                  >
                                    {h}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-zinc-100/50 dark:bg-zinc-900/60 p-3 rounded-xl space-y-1.5 font-mono text-[10.5px]">
                              <span className="text-[9px] uppercase font-bold text-zinc-400 block">📊 Önerilen SEO Alanları</span>
                              <p><strong className="text-zinc-800 dark:text-zinc-200 font-sans">SEO Title:</strong> {aiAnalysisResult.seoTitle}</p>
                              <p><strong className="text-zinc-800 dark:text-zinc-200 font-sans">Meta Desc:</strong> {aiAnalysisResult.seoDesc}</p>
                              <p><strong className="text-zinc-800 dark:text-zinc-200 font-sans">Meta Tags:</strong> {aiAnalysisResult.suggestedTags}</p>
                            </div>
                          </div>

                          {/* Graphics Generation Box inside Analysis */}
                          <div id="ai-image-generator-integration" className="bg-gradient-to-r from-amber-500/10 to-gold/15 p-4 rounded-2xl border border-gold/30 text-xs">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div>
                                <span className="text-[10px] uppercase font-sans font-black text-amber-500 tracking-wider">🎨 AI DESTEKLİ KAPAK GÖRSELİ ÜRETİMİ (11.8)</span>
                                <h6 className="font-serif font-bold text-zinc-900 dark:text-white mt-0.5">Yapay Zeka ile Minimalist Sektör İllüstrasyonu hazırla</h6>
                              </div>
                              
                              <div className="flex gap-2">
                                <select 
                                  value={graphicsPreset} 
                                  onChange={(e) => setGraphicsPreset(e.target.value)}
                                  className="bg-white dark:bg-zinc-950 text-[11px] p-1.5 border border-zinc-200 rounded-lg cursor-pointer"
                                >
                                  <option value="luxury-indigo">Asil Mor / Gece Mavisi</option>
                                  <option value="warm-amber">Premium E-Ticaret Altın Tonları</option>
                                  <option value="tech-minimal">Minimalist Dergi Kapağı Çizgileri</option>
                                </select>

                                <button
                                  onClick={() => {
                                    let url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
                                    if (graphicsPreset === 'warm-amber') {
                                      url = 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=600';
                                    } else if (graphicsPreset === 'tech-minimal') {
                                      url = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600';
                                    }
                                    setGeneratedGraphicsResult(url);
                                  }}
                                  className="bg-zinc-905 dark:bg-white text-white dark:text-zinc-905 px-3 py-1.5 rounded-lg font-bold text-[11px] hover:opacity-90 cursor-pointer transition-all"
                                >
                                  Görseli Üret
                                </button>
                              </div>
                            </div>

                            {generatedGraphicsResult && (
                              <div className="mt-3 flex items-center gap-4 bg-white dark:bg-zinc-950 p-2 rounded-xl border border-zinc-150 animate-in zoom-in-95 duration-150">
                                <img src={generatedGraphicsResult} alt="AI output" className="w-16 h-16 object-cover rounded-lg border" referrerPolicy="no-referrer" onError={(e) => handleImageErrorGlobal(e, 'cover')} />
                                <div className="space-y-1">
                                  <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">MEDYA KAYDETTİ</span>
                                  <p className="text-[11px] font-bold text-zinc-900 dark:text-white">wetalks_cover_{item.category}_illus.png</p>
                                  <p className="text-[9px] text-zinc-400">Boyut: 1200x630px | Çözünürlük: Yüksek</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 11: SOURCE MANAGEMENT (KAYNAK YÖNETİMİ) */}
          {activeTab === 'agenda_sources' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-150 pb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-black text-zinc-950 dark:text-white flex items-center gap-2">
                    <ExternalLink className="text-emerald-500 w-5 h-5" />
                    Sektör Kaynakları Yönetim Paneli
                  </h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 font-sans">
                    Haber çekilecek resmi kanalların, blogların, RSS feed ve API sitemap adreslerinin entegrasyon ayarları
                  </p>
                </div>

                <button
                  onClick={() => {
                    const samplePackages = [
                      // Türkiye E-Ticaret
                      { id: 'tr_1', name: 'Trendyol Akademi', url: 'https://partner.trendyol.com/akademi', type: 'RSS Feed', category: 'trendyol', isActive: true, frequency: 'Haftalık' },
                      { id: 'tr_2', name: 'Hepsiburada Satıcı Merkezi', url: 'https://hepsiburada.com/merchant', type: 'Scraper', category: 'hepsiburada', isActive: true, frequency: 'Frekans Günlük' },
                      { id: 'tr_3', name: 'ikas Blog', url: 'https://ikas.com/blog', type: 'RSS Feed', category: 'dijital-ticaret', isActive: true, frequency: 'Haftalık' },
                      { id: 'tr_4', name: 'Ticimax Blog', url: 'https://ticimax.com/blog', type: 'RSS Feed', category: 'dijital-ticaret', isActive: true, frequency: 'Haftalık' },
                      { id: 'tr_5', name: 'IdeaSoft Blog', url: 'https://ideasoft.com.tr/blog', type: 'Sitemap', category: 'dijital-ticaret', isActive: true, frequency: 'Aylık' },
                      { id: 'tr_6', name: 'Webrazzi', url: 'https://webrazzi.com', type: 'RSS Feed', category: 'yapay-zeka', isActive: true, frequency: 'Saatlik' },
                      // Global Pazaryeri
                      { id: 'gl_1', name: 'Amazon Seller News', url: 'https://sellercentral.amazon.com/news', type: 'RSS Feed', category: 'amazon', isActive: true, frequency: 'Günlük' },
                      { id: 'gl_2', name: 'Shopify Blog', url: 'https://shopify.com/blog', type: 'RSS Feed', category: 'dijital-ticaret', isActive: true, frequency: 'Haftalık' },
                      { id: 'gl_3', name: 'Etsy Seller Handbook', url: 'https://etsy.com/seller-handbook', type: 'Sitemap', category: 'etsy', isActive: true, frequency: 'Haftalık' },
                      { id: 'gl_4', name: 'Temu Newsroom', url: 'https://temu.com/news', type: 'Scraper', category: 'temu', isActive: true, frequency: 'Günlük' },
                      // Lojistik
                      { id: 'log_1', name: 'DHL Türkiye', url: 'https://dhl.com.tr/blog', type: 'Manuel', category: 'lojistik', isActive: true, frequency: 'Haftalık' },
                      { id: 'log_2', name: 'OPLOG Blog', url: 'https://oplog.io/blog', type: 'RSS Feed', category: 'lojistik', isActive: true, frequency: 'Haftalık' },
                      // Yapay Zeka
                      { id: 'ai_1', name: 'OpenAI News', url: 'https://openai.com/news', type: 'RSS Feed', category: 'yapay-zeka', isActive: true, frequency: 'Günlük' },
                      { id: 'ai_2', name: 'Google AI Blog', url: 'https://ai.googleblog.com', type: 'RSS Feed', category: 'yapay-zeka', isActive: true, frequency: 'Haftalık' }
                    ];
                    setAgendaSources(samplePackages);
                    updateAgendaAndSourcesInStorage(incomingNews, samplePackages);
                    toast.success('Varsayılan kaynak paketleri sisteme başarıyla kuruldu!');
                  }}
                  className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-all flex items-center gap-1"
                >
                  <Briefcase className="w-4 h-4 text-emerald-500 animate-bounce-slow" />
                  Varsayılan Kaynakları Yükle
                </button>
              </div>

              {/* Source addition Form */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block font-sans">
                  📡 Yeni Özel Haber / Blog Kaynağı Entegre Et
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Kaynak İsmi</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2.5 rounded-xl text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500"
                      placeholder="Örn: ikas Satış Akademisi"
                      value={srcNameInFeed}
                      onChange={(e) => setSrcNameInFeed(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Kaynak Başlangıç URL (RSS / Feed Adresi)</label>
                    <input
                      type="url"
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2.5 rounded-xl text-zinc-900 dark:text-white focus:ring-1 focus:ring-violet-500"
                      placeholder="https://ikas.com/feed.xml"
                      value={srcUrlInFeed}
                      onChange={(e) => setSrcUrlInFeed(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Kaynak Akış Tipi</label>
                    <select
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2.5 rounded-xl text-zinc-900 dark:text-white"
                      value={srcTypeInFeed}
                      onChange={(e: any) => setSrcTypeInFeed(e.target.value)}
                    >
                      <option value="RSS Feed">RSS Feed Okuyucu</option>
                      <option value="Scraper">Web HTML Scraper</option>
                      <option value="Sitemap">Sitemap.xml Dinleyici</option>
                      <option value="Manuel">Manuel Manuel Giriş</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">İlgili Kategori</label>
                    <select
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2.5 rounded-xl text-zinc-900 dark:text-white"
                      value={srcCatInFeed}
                      onChange={(e) => setSrcCatInFeed(e.target.value)}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Sıklık Kontrolü</label>
                    <select
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 text-xs p-2.5 rounded-xl text-zinc-900 dark:text-white"
                      value={srcFreqInFeed}
                      onChange={(e) => setSrcFreqInFeed(e.target.value)}
                    >
                      <option value="Saatlik">Saatlik (Ultra Acil)</option>
                      <option value="Günlük">Günlük (Standart)</option>
                      <option value="Haftalık">Haftalık (Özet)</option>
                      <option value="Düzensiz">Düzensiz</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        if (!srcNameInFeed || !srcUrlInFeed) {
                          toast.error('Lütfen kaynak ismi ve başlık URL alanlarını doldurun.');
                          return;
                        }
                        const newSrcItem = {
                          id: `custom_src_${Date.now()}`,
                          name: srcNameInFeed,
                          url: srcUrlInFeed,
                          type: srcTypeInFeed,
                          category: srcCatInFeed,
                          isActive: true,
                          frequency: srcFreqInFeed
                        };
                        const updated = [newSrcItem, ...agendaSources];
                        setAgendaSources(updated);
                        updateAgendaAndSourcesInStorage(incomingNews, updated);
                        setSrcNameInFeed('');
                        setSrcUrlInFeed('');
                        toast.success('Yeni yayın kaynağı başarıyla sisteme kaydedildi!');
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold text-xs p-2.5 rounded-xl cursor-pointer"
                    >
                      Kaynağı Ekle ve Test Et
                    </button>
                  </div>
                </div>
              </div>

              {/* Connected Sources list table */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full font-sans border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-150 text-[10px] text-zinc-400 font-bold uppercase py-2">
                      <th className="p-3 pl-4">Kaynak Adı</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Metod / Tip</th>
                      <th className="p-3">Sıklık</th>
                      <th className="p-3">Durum</th>
                      <th className="p-3 text-right pr-4">Sil/Pasif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {agendaSources.map(s => {
                      return (
                        <tr key={s.id} className="hover:bg-zinc-50/50">
                          <td className="p-3 pl-4">
                            <span className="font-bold text-zinc-900 dark:text-white block">{s.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono block max-w-xs truncate">{s.url}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-[10.5px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-650 px-2.5 py-0.5 rounded-full uppercase">
                              {categories.find(c => c.id === s.category)?.name || s.category}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-500 font-mono text-[10.5px]">{s.type}</td>
                          <td className="p-3 text-zinc-500">{s.frequency}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                              {s.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4">
                            <button
                              onClick={() => {
                                const updated = agendaSources.filter(item => item.id !== s.id);
                                setAgendaSources(updated);
                                updateAgendaAndSourcesInStorage(incomingNews, updated);
                              }}
                              className="text-red-500 hover:text-red-700 h-6 w-6 inline-flex items-center justify-center rounded-lg hover:bg-zinc-50"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: CALENDAR EVENTS MANAGEMENT */}
          {activeTab === 'calendar_events' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-150 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-black text-zinc-950 dark:text-white flex items-center gap-2">
                    <Calendar className="text-amber-500 w-5 h-5" />
                    Etkinlik Giriş Alanı & Ajandası
                  </h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 font-sans mt-1">
                    Ajandaya yeni dijital ticaret, girişimcilik ve e-ihracat etkinlikleri girin, yapay zekanın eklediklerini yönetin.
                  </p>
                </div>
              </div>

              {/* Grid: 1 side form, 1 side list */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-3 duration-250">
                
                {/* Event Creation Form */}
                <div className="xl:col-span-4 bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-150/85 dark:border-zinc-800/80 space-y-4">
                  <h4 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-zinc-150 dark:border-zinc-800">
                    ✍️ Yeni Etkinlik Girişi
                  </h4>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newEventTitle || !newEventDate || !newEventDesc) {
                      toast.error('Başlık, Açıklama ve Tarih alanları zorunludur!');
                      return;
                    }
                    const newEvt: CalendarEvent = {
                      id: 'evt-' + Date.now(),
                      title: newEventTitle,
                      description: newEventDesc,
                      date: newEventDate,
                      time: newEventTime || undefined,
                      location: newEventLocation || undefined,
                      organizer: newEventOrganizer || undefined,
                      sourceUrl: newEventLink || undefined,
                      isAiGenerated: newEventIsAi
                    };
                    if (onUpdateCalendarEvents) {
                      onUpdateCalendarEvents(prev => [...prev, newEvt]);
                    }
                    // Reset fields
                    setNewEventTitle('');
                    setNewEventDesc('');
                    setNewEventDate('');
                    setNewEventTime('');
                    setNewEventLocation('');
                    setNewEventOrganizer('');
                    setNewEventLink('');
                    setNewEventIsAi(false);
                    toast.success('Etkinlik başarıyla takvime eklenmiştir!');
                  }} className="space-y-4 font-sans text-xs">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-1">Etkinlik Başlığı *</label>
                      <input 
                        type="text"
                        placeholder="Örn: Bölgesel E-İhracat Zirvesi"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none text-zinc-900 dark:text-zinc-100 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-1">Kısa Açıklama *</label>
                      <textarea
                        rows={3}
                        placeholder="Etkinlik hakkında özet bilgi girin..."
                        value={newEventDesc}
                        onChange={(e) => setNewEventDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed resize-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-1">Tarih *</label>
                        <input 
                          type="date"
                          value={newEventDate}
                          onChange={(e) => setNewEventDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-1">Saat (İsteğe Bağlı)</label>
                        <input 
                          type="text"
                          placeholder="Örn: 10:00 veya 14:00"
                          value={newEventTime}
                          onChange={(e) => setNewEventTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none text-zinc-900 dark:text-zinc-100 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-1">Etkinlik Konumu</label>
                      <input 
                        type="text"
                        placeholder="Örn: Zoom, lütfi kırdar, vb."
                        value={newEventLocation}
                        onChange={(e) => setNewEventLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-1">Düzenleyici</label>
                        <input 
                          type="text"
                          placeholder="Örn: Wordef, Amazon"
                          value={newEventOrganizer}
                          onChange={(e) => setNewEventOrganizer(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase mb-1">Etkinlik Linki</label>
                        <input 
                          type="url"
                          placeholder="https://..."
                          value={newEventLink}
                          onChange={(e) => setNewEventLink(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 focus:border-amber-500 dark:focus:border-amber-500 focus:outline-none text-zinc-900 dark:text-zinc-100 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input 
                        id="new-event-is-ai"
                        type="checkbox"
                        checked={newEventIsAi}
                        onChange={(e) => setNewEventIsAi(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-white border-zinc-350 cursor-pointer"
                      />
                      <label htmlFor="new-event-is-ai" className="text-[10px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                        🤖 Yapay Zeka Tarafından Çekildi Olarak İşaretle
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#0D62FE] hover:bg-[#a02dc2] text-white font-extrabold shadow-md shadow-blue-500/10 cursor-pointer transition-colors mt-2"
                    >
                      Takvime Kaydet & Ajandaya Ekle
                    </button>
                  </form>
                </div>

                {/* Events Listing Table */}
                <div className="xl:col-span-8 bg-white dark:bg-zinc-900/10 rounded-2xl border border-zinc-200/60 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-zinc-150/50 dark:border-zinc-800/40 flex items-center justify-between">
                    <h4 className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      📅 Ajanda Kayıtları ({mergedCalendarEvents.length})
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-450">
                      Kronolojik Sıralama
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-50/50 dark:bg-white/[0.01] border-b border-zinc-150/50 dark:border-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-wider">
                          <th className="p-3 pl-4">Tarih</th>
                          <th className="p-3">Etkinlik & Düzenleyen</th>
                          <th className="p-3">Açıklama</th>
                          <th className="p-3">Konum & Link</th>
                          <th className="p-3 text-right pr-4">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {mergedCalendarEvents.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-10 text-center text-zinc-400">
                              Kayıtlı herhangi bir etkinlik bulunmuyor. Yeni etkinlik ekleyebilirsiniz.
                            </td>
                          </tr>
                        ) : (
                          [...mergedCalendarEvents]
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((evt) => {
                              const dateObj = new Date(evt.date);
                              const formattedDate = !isNaN(dateObj.getTime())
                                ? dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                                : evt.date;
                              return (
                                <tr key={evt.id} className="hover:bg-zinc-50/40 dark:hover:bg-white/[0.01] transition-colors">
                                  <td className="p-3 pl-4 whitespace-nowrap">
                                    <span className="font-mono text-[11px] font-bold text-[#0D62FE] bg-[#0D62FE]/5 dark:bg-[#0D62FE]/10 px-2 py-1 rounded">
                                      {formattedDate}
                                    </span>
                                    {evt.time && (
                                      <span className="block font-mono text-[10px] text-zinc-500 mt-1 mr-2">🕒 {evt.time}</span>
                                    )}
                                  </td>
                                  <td className="p-3 max-w-[180px]">
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 leading-snug block">
                                      {evt.title}
                                    </span>
                                    {evt.organizer && (
                                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 block mt-0.5">
                                        🏢 {evt.organizer}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 max-w-[240px] text-zinc-550 dark:text-zinc-400 text-[11px] leading-relaxed">
                                    {evt.description}
                                  </td>
                                  <td className="p-3 max-w-[150px]">
                                    {evt.location && (
                                      <span className="text-[11px] block truncate">📍 {evt.location}</span>
                                    )}
                                    {evt.sourceUrl ? (
                                      <a
                                        href={evt.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-bold text-[#0D62FE] hover:underline inline-flex items-center gap-0.5 mt-1"
                                      >
                                        Etkinlik Linki <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    ) : !evt.id.startsWith('evt-') ? (
                                      <span className="text-[10px] text-zinc-400 block mt-1">Yayın İçi Link Yok</span>
                                    ) : (
                                      <span className="text-[10px] text-zinc-400 block mt-1">Bağlantı Yok</span>
                                    )}
                                    {evt.isAiGenerated && (
                                      <span className="inline-block bg-[#0D62FE]/10 border border-[#0D62FE]/20 text-[#0D62FE] dark:text-[#0D62FE] text-[9px] font-black uppercase px-1.5 py-0.5 rounded mt-2">
                                        🤖 AI Tarafından Saptandı
                                      </span>
                                    )}
                                    {!evt.id.startsWith('evt-') && (
                                      <span className="inline-block bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded mt-2">
                                        📝 Yayınlı/Makale Etkinliği
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right pr-4">
                                    <button
                                      onClick={() => {
                                        if (!evt.id.startsWith('evt-')) {
                                          toast.info('Bu etkinlik, "Etkinlikler" kategorisindeki aktif bir yayındır. Düzenlemek için "İçerik Yönetimi" sekmesini kullanın.');
                                          return;
                                        }
                                        if (onUpdateCalendarEvents) {
                                          onUpdateCalendarEvents(prev => prev.filter(item => item.id !== evt.id));
                                          toast.info('Etkinlik takvimden kaldırıldı.');
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 bg-red-500/10 hover:bg-red-500/20 h-7 px-2.5 inline-flex items-center justify-center rounded-lg text-[10px] font-black cursor-pointer transition-colors"
                                      title="Takvimden Kaldır"
                                    >
                                      Kaldır
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 12: GENERAL AI CONTENT PRODUCTION SPACE */}
          {activeTab === 'ai_generation_space' && (
            <div className="space-y-6">
              <div className="border-b border-zinc-150 pb-4">
                <h3 className="text-lg sm:text-xl font-serif font-black text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="text-gold w-5 h-5 animate-pulse" />
                  WeTalks Yardımcı Editör Masası (12.0)
                </h3>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 font-sans mt-1">
                  Yazar ve editörler için tam taslak çıkarma, dürüst yorum ekleme ve başlık fikri asistanı
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Generation control panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-4 font-sans text-xs">
                    <div>
                      <label className="text-[10px] font-sans font-black text-zinc-400 uppercase tracking-widest block mb-2">Yapılacak AI Görevi</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setGType('draft')}
                          className={`p-3 rounded-xl border text-center font-bold font-sans flex flex-col justify-between items-center transition-all ${
                            gType === 'draft' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-250'
                          }`}
                        >
                          <BookOpen className="w-5 h-5 mb-1" />
                          Taslak Metin Çıkar
                        </button>
                        <button
                          type="button"
                          onClick={() => setGType('headlines')}
                          className={`p-3 rounded-xl border text-center font-bold font-sans flex flex-col justify-between items-center transition-all ${
                            gType === 'headlines' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-250'
                          }`}
                        >
                          <TrendingUp className="w-5 h-5 mb-1" />
                          Özgün Başlık Fikirleri
                        </button>
                        <button
                          type="button"
                          onClick={() => setGType('seo')}
                          className={`p-3 rounded-xl border text-center font-bold font-sans flex flex-col justify-between items-center transition-all ${
                            gType === 'seo' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-250'
                          }`}
                        >
                          <Search className="w-5 h-5 mb-1" />
                          SEO Analizi ve Meta
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Sektör / Kategori Odağı</label>
                      <select
                        value={gIndustryInput}
                        onChange={(e) => setGIndustryInput(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 p-2.5 rounded-xl text-zinc-850 dark:text-zinc-100"
                      >
                        <option value="Amazon / Global Selling">Amazon / Global Selling</option>
                        <option value="Trendyol & Yerel E-Ticaret">Trendyol & Yerel E-Ticaret</option>
                        <option value="Yapay Zeka we Dijital Ticaret">Yapay Zeka ve Dijital Ticaret</option>
                        <option value="E-İhracat / Mikro İthalat">E-İhracat / Mikro İthalat</option>
                        <option value="Lojistik & Kargo Çözümleri">Lojistik & Kargo Çözümleri</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Yazı Başlığı veya Ana Fikir İpucu</label>
                      <input
                        type="text"
                        value={gTitleInput}
                        onChange={(e) => setGTitleInput(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 p-2.5 rounded-xl text-zinc-850 dark:text-zinc-105"
                        placeholder="Örn: İlk Amazon FBA siparişinde yapılan 5 hata"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase text-zinc-400 block mb-1">Yazar İçin Özel Notlar / Editör Notu</label>
                      <textarea
                        value={gPrompt}
                        onChange={(e) => setGPrompt(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 p-2.5 rounded-xl text-zinc-850 dark:text-zinc-105"
                        placeholder="İçeriğin tonu samimi olsun, dürüst ticari deneyimlerden bahsetsin."
                        rows={3}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!gTitleInput) {
                          toast.error('Lütfen en azından bir Yazı Başlığı veya ipucu girin.');
                          return;
                        }
                        setGeneratingResult(true);
                        setTimeout(() => {
                          let responseText = '';
                          if (gType === 'draft') {
                            responseText = `<h2>${gTitleInput}</h2>\n\n<p>Her girişimcinin hayali kendi işini kurup özgürce büyümektir. Ancak özellikle ${gIndustryInput} alanına başlarken tecrübesizlik nedeniyle birçok pahalı hata yapılabilir...</p>\n\n<h3>1. En Çok Yapılan Hatalar we Dersler</h3>\n<p>Satıcıların en büyük hatası pazar araştırmasını hızlı geçmektir. Ürünün maliyetini hesaplarken kargo, gümrük, iade oranları ve reklam paylarını hesaba katmayanlar ilk aydan sermaye tüketebilir.</p>\n\n<h3>2. WeTalks Dürüst Önerisi</h3>\n<p>İşe başlarken tüm paranızı tek bir ürüne bağlamayın. Küçük bütçelerle split-test yöntemi kullanarak talebi ve pazar dinamiklerini doğrulayın.</p>`;
                          } else if (gType === 'headlines') {
                            responseText = `1. Deneyim Konuşuyor: ${gTitleInput} Hakkında Kimse Bu Gerçeği Söylemiyor\n2. ${gIndustryInput} Sektöründe Dev Gelişme: Sizi Nasıl Etkileyecek?\n3. 10 Adımda Kar Marjınızı Katlayın: ${gTitleInput} Rehberi\n4. E-Ticaret Sırları: ${gTitleInput} için İpuçları`;
                          } else if (gType === 'seo') {
                            responseText = `### 📊 SEO STRATEJİ PLANI\n\n- **Önerilen SEO Başlığı (60 Karakter):** ${gTitleInput} | WeTalks Dijital Ticaret\n- **Önerilen Meta Açıklaması (150 Karakter):** ${gTitleInput} sürecinde dikkat etmeniz gereken kritik ayrıntılar, kar marjı koruma taktikleri ve pazarın dürüst analizi.\n- **Anahtar Kelimeler:** e-ticaret, ${gIndustryInput.toLowerCase()}, ticari tecrübeler, girişimcilik bütçesi`;
                          } else {
                            responseText = `<p><strong>Premium ve Ağırbaşlı Tonlama:</strong> ${gTitleInput} dünyasındaki sıradan blog içeriklerinden sıkılan nitelikli okuyucu kitlesi için, veriler ve yaşanmış dürüst ticari hikayelerle bezenmiş, kusursuz bir yayın dili oluşturulmuştur.</p>`;
                          }
                          setGResultValue(responseText);
                          setGeneratingResult(false);
                          toast.success('AI Çıktısı başarıyla üretildi!');
                        }, 900);
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white font-sans font-extrabold text-xs py-3 rounded-xl cursor-pointer text-center flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                      {generatingResult ? 'Hesaplanıyor ve Yazılıyor...' : 'Yapay Zeka Çıktısını Hazırla'}
                    </button>
                  </div>
                </div>

                {/* Generation Output Slate */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-850 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-zinc-150 pb-3 mb-4">
                        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400">📝 YAPAY ZEKA EDİTÖR ÇIKTI ALANI</span>
                        {gResultValue && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(gResultValue);
                              toast.success('Metin panoya kopyalandı.');
                            }}
                            className="text-xs text-indigo-600 hover:underline font-bold"
                          >
                            Panoya Kopyala
                          </button>
                        )}
                      </div>

                      {generatingResult ? (
                        <div className="py-20 text-center space-y-3">
                          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-xs text-zinc-400 font-sans">WeTalks asistanı en dürüst ticari çıkarımları derliyor, biraz bekleyiniz...</p>
                        </div>
                      ) : gResultValue ? (
                        <div className="prose prose-sm max-w-none text-xs text-zinc-700 dark:text-zinc-300 space-y-4">
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed border border-zinc-150 dark:border-zinc-800">
                            {gResultValue}
                          </div>
                        </div>
                      ) : (
                        <div className="py-20 text-center space-y-2 text-zinc-400">
                          <Sparkles className="w-8 h-8 text-zinc-300 mx-auto" />
                          <p className="text-xs font-sans">Yandaki panelden bir görev seçip "Çıktıyı Hazırla" butonuna basın.</p>
                          <p className="text-[10px] text-zinc-350 max-w-sm mx-auto">Telif riski barındırmayan, arama motorlarında üst sıralara oynayacak dürüst paragraflar burada anında listelenir.</p>
                        </div>
                      )}
                    </div>

                    {gResultValue && gType === 'draft' && (
                      <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-6 flex justify-end">
                        <button
                          onClick={() => {
                            if (onSaveArticle) {
                              onSaveArticle({
                                title: gTitleInput || 'AI Taslak Yazı Önerisi',
                                summary: 'WeTalks platform asistanı tarafından otomatik güçlendirilmiş makale taslağı',
                                content: gResultValue,
                                categoryId: 'yapay-zeka',
                                status: 'Draft',
                                readTime: 5,
                                authorId: 'author_wetalks_ai',
                                authorName: 'WeTalks',
                                tags: ['ai', 'büyüme', 'ticaret'],
                                coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'
                              }, 'Draft');
                              toast.success('Harika! Bu AI taslağı başarıyla normal Yazı Yönetimi listesine "Taslak (Draft)" olarak eklendi.');
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Taslağı Yazı Yönetimine Kaydet
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

