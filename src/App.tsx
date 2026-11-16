/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, 
  Article, 
  Category, 
  Comment, 
  Notification, 
  UserRole,
  ArticleStatus,
  SystemSettings,
  ArticleSeries,
  CalendarEvent
} from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_TAGS, 
  INITIAL_PROFILES, 
  INITIAL_ARTICLES, 
  INITIAL_COMMENTS, 
  INITIAL_NOTIFICATIONS 
} from './data';
import {
  syncCollectionFromCloud,
  syncDocumentFromCloud,
  saveDocToCloud,
  deleteDocFromCloud,
  syncCollectionToCloud,
  auth,
  db,
  collection,
  onSnapshot,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  googleProvider,
  signOut,
  onAuthStateChanged,
  extractRoleFromClaims,
  type User as FirebaseUser
} from './lib/selfhosted';
import { useToast } from './components/Toast';
import { CURATED_NEWS_IMAGES, getCuratedNewsCover, sanitizeArticle } from './lib/curatedImages';

import Navbar from './components/Navbar';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import ArticleView from './components/ArticleView';
import Editor from './components/Editor';
import NewsEditor from './components/NewsEditor';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import NewsSlider from './components/NewsSlider';
import Footer from './components/Footer';
import UserProfileView from './components/UserProfileView';
import InsightsLanding from './components/InsightsLanding';

import { 
  TrendingUp, 
  Users, 
  Grid, 
  Mail, 
  Check, 
  ArrowRight, 
  Search, 
  Sparkles, 
  BookOpen, 
  Cpu, 
  Brain, 
  ShoppingBag, 
  Rocket, 
  Compass, 
  Heart,
  UserCheck,
  Calendar,
  Clock,
  Heart as HeartIcon,
  Bookmark,
  MessageSquare,
  ArrowUpRight,
  Plus,
  Share2,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Sliders,
  LayoutGrid,
  Layers,
  Eye,
  EyeOff,
  Lock,
  HelpCircle,
  Activity,
  X,
  CheckSquare,
  Scissors,
  ExternalLink,
  Truck,
  Coins,
  Globe,
  Lightbulb,
  ShoppingCart,
  Megaphone,
  User,
  Code2,
  Zap,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const DEFAULT_SETTINGS: SystemSettings = {
  appName: 'WeTalks',
  siteTitle: 'WeTalks | AI-Supported Founder Stories & Business Insights',
  appDescription: 'Düşünürlerin, bağımsız teknologların ve kreatif yazarların kaliteli yayınlar tasarladığı modern bir dijital okuma ekosistemidir.',
  accentColor: 'zinc',
  wordsPerMinute: 225,
  menuItems: [
    { id: 'writers', title: 'Yazarlar', view: 'writers', visible: true },
    { id: 'series', title: 'Yazı Dizileri', view: 'series', visible: true },
    { id: 'deneyimler', title: 'Deneyimler', view: 'search', categoryParam: 'deneyimler', visible: true },
    { id: 'roportajlar', title: 'Röportajlar', view: 'search', categoryParam: 'roportajlar', visible: true },
    { id: 'gundem', title: 'Gündem', view: 'search', categoryParam: 'gundem', visible: true },
    { id: 'explore', title: 'Kanallar', view: 'explore', visible: true }
  ],
  
  // Feature Switches
  enableAiAssistant: true,
  enableComments: true,
  enableNewsletter: true,
  enableManifesto: true,
  enableLikesSaves: true,
  enableGuestReading: true,
  showDesignStudio: false,
  showExploreProjectButton: true,
  
  // Status Switches
  appActive: true,
  insightsActive: true,
  
  // Dashboard Tabs Switchboard
  showOverviewTab: true,
  showSavedLikedTab: true,
  showMyArticlesTab: true,
  showEditorApprovalsTab: true,
  showEditorCategoriesTab: true,
  showAdminUsersTab: true,
  showAdminCatalogTab: true,
  showAgendaNewsTab: true,
  showAgendaSourcesTab: true,
  showAiGenerationTab: true,
  headingFont: 'Reddit Sans',
  articleFont: 'Reddit Sans',
  menuFont: 'Reddit Sans'
};

export const handleImageErrorGlobal = (e: React.SyntheticEvent<HTMLImageElement, Event>, type: 'avatar' | 'cover' | 'logo' = 'cover') => {
  e.currentTarget.onerror = null; // Prevent infinite loop
  if (type === 'avatar') {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
  } else if (type === 'logo') {
    // Return empty but elegant container, or a stylish text-based visual if the logo ever fails.
    e.currentTarget.style.display = 'none';
  } else {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800';
  }
};

// --- Immersive Acoustic Synth UI Feedback (Dribbble Class Interaction) ---
let soundEnabledCache = true;

export const setGlobalSoundEnabled = (enabled: boolean) => {
  soundEnabledCache = enabled;
};

export const playPluckSynth = (type: 'click' | 'success' | 'hover' | 'pop') => {
  if (typeof window === 'undefined') return;
  if (!soundEnabledCache) return;
  
  try {
    const AudioContextValue = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextValue) return;
    const audioCtx = new AudioContextValue();
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1); // A2
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E4
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.08); // E3
      gainNode.gain.setValueAtTime(0.05, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'success') {
      const freqArray = [523.25, 659.25, 783.99, 1046.50]; // Elegand Arpeggio C5 -> E5 -> G5 -> C6
      freqArray.forEach((freq, index) => {
        const itemOsc = audioCtx.createOscillator();
        const itemGain = audioCtx.createGain();
        itemOsc.connect(itemGain);
        itemGain.connect(audioCtx.destination);
        itemOsc.type = 'sine';
        itemOsc.frequency.setValueAtTime(freq, now + index * 0.045);
        itemGain.gain.setValueAtTime(0.035, now + index * 0.045);
        itemGain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.045 + 0.22);
        itemOsc.start(now + index * 0.045);
        itemOsc.stop(now + index * 0.045 + 0.22);
      });
    } else if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.exponentialRampToValueAtTime(174.61, now + 0.05); // F3
      gainNode.gain.setValueAtTime(0.008, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (error) {
    // Suppress Web Audio autoplay blocks
  }
};

export default function App() {
  const isInitialMount = useRef(true);
  const toast = useToast();

  // --- System Settings State ---
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('wetalks_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let items = parsed.menuItems && Array.isArray(parsed.menuItems) ? parsed.menuItems : DEFAULT_SETTINGS.menuItems;
        
        // Remove 'home' and duplicate 'makaleler'
        items = items.filter((i: any) => i.id !== 'home' && i.id !== 'makaleler');
        
        // Ensure 'writers' exists
        if (!items.some((i: any) => i.id === 'writers')) {
          items.push({ id: 'writers', title: 'Yazarlar', view: 'writers', visible: true });
        }
        // Ensure 'series' exists
        if (!items.some((i: any) => i.id === 'series')) {
          items.push({ id: 'series', title: 'Yazı Dizileri', view: 'series', visible: true });
        }

        // Put 'writers' first, then 'series', then the rest
        const writersItem = items.find((i: any) => i.id === 'writers');
        const seriesItem = items.find((i: any) => i.id === 'series');
        const restItems = items.filter((i: any) => i.id !== 'writers' && i.id !== 'series');
        
        parsed.menuItems = [writersItem, seriesItem, ...restItems];
        if (!parsed.headingFont) parsed.headingFont = 'Reddit Sans';
        if (!parsed.articleFont) parsed.articleFont = 'Reddit Sans';
        if (!parsed.menuFont) parsed.menuFont = 'Reddit Sans';
        return parsed;
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // --- Dynamic DB Operations ---
  const handleResetDatabase = () => {
    localStorage.removeItem('wetalks_profiles');
    localStorage.removeItem('wetalks_articles');
    localStorage.removeItem('wetalks_comments');
    localStorage.removeItem('wetalks_notifications');
    localStorage.removeItem('wetalks_categories');
    localStorage.removeItem('wetalks_settings');
    
    setProfiles(INITIAL_PROFILES);
    setArticles(INITIAL_ARTICLES);
    setComments(INITIAL_COMMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCategories(INITIAL_CATEGORIES);
    setSettings(DEFAULT_SETTINGS);
  };

  const handleExportDatabase = (): string => {
    const exportObj = {
      profiles,
      articles,
      comments,
      notifications,
      categories,
      settings
    };
    return JSON.stringify(exportObj, null, 2);
  };

  const handleImportDatabase = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profiles && Array.isArray(parsed.profiles)) {
        setProfiles(parsed.profiles);
      }
      if (parsed.articles && Array.isArray(parsed.articles)) {
        setArticles(parsed.articles);
      }
      if (parsed.comments && Array.isArray(parsed.comments)) {
        setComments(parsed.comments);
      }
      if (parsed.notifications && Array.isArray(parsed.notifications)) {
        setNotifications(parsed.notifications);
      }
      if (parsed.categories && Array.isArray(parsed.categories)) {
        const excludedIds = ['yasam', 'kultur-sanat', 'sinema', 'ekonomi', 'kultur', 'makaleler', 'gundem', 'roportajlar'];
        const excludedNames = ['Yaşam', 'Kültür & Sanat', 'Sinema', 'Ekonomi', 'Kültür', 'Yaşam / Doğa', 'Makaleler', 'Gündem', 'Röportajlar'];
        let filtered = parsed.categories.filter((c: any) => 
          !excludedIds.includes(c.id?.toLowerCase()) && 
          !excludedIds.includes(c.slug?.toLowerCase()) &&
          !excludedNames.includes(c.name)
        );
        const hasEtkinlikler = filtered.some((c: any) => c.id === 'etkinlikler');
        if (!hasEtkinlikler) {
          filtered.push({
            id: 'etkinlikler',
            name: 'Etkinlikler',
            slug: 'etkinlikler',
            description: 'Sektörün nabzını tutan fuarlar, zirveler, WORLDEF ve Webrazzi buluşmaları.',
            icon: 'Calendar'
          });
        }
        setCategories(filtered);
      }
      if (parsed.settings) {
        setSettings(parsed.settings);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // --- Persistent States ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('wetalks_dark');
    return saved !== 'false'; // Default to true if not explicitly disabled
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('Visitor');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState<boolean>(false);

  const [lang, setLang] = useState<'tr' | 'en'>(() => {
    const saved = localStorage.getItem('wetalks_lang');
    if (saved === 'tr' || saved === 'en') return saved;
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone) {
        const tzLower = timezone.toLowerCase();
        if (tzLower.includes('istanbul') || tzLower.includes('turkey') || tzLower.includes('ankara')) {
          return 'tr';
        } else {
          // Physical timezone is outside Turkey, force English as requested
          return 'en';
        }
      }
      const userLang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
      if (userLang.toLowerCase().startsWith('tr')) {
        return 'tr';
      }
    } catch (e) {}
    return 'en';
  });

  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('wetalks_profiles');
    let list: UserProfile[] = saved ? JSON.parse(saved) : [];
    
    // Ensure that any newly added or missing INITIAL_PROFILES are present 
    // even for existing sessions in the browser to avoid stale state issues.
    const existingIds = new Set(list.map(p => p.id));
    const missing = INITIAL_PROFILES.filter(p => !existingIds.has(p.id));
    if (missing.length > 0) {
      list = [...list, ...missing];
    }
    
    if (list.length === 0) {
      list = [...INITIAL_PROFILES];
    }

    // Force Orhan Balcı username and correct avatar
    list = list.map(p => {
      if (p.id === 'user_orhan' || p.name === 'Orhan Balcı') {
        const updated = { ...p, username: 'orhanbalci' };
        if (!p.avatar || p.avatar === 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=400') {
          updated.avatar = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400';
        }
        return updated;
      }
      return p;
    });

    return list;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem('wetalks_articles');
    let list: Article[] = saved ? JSON.parse(saved) : [];
    
    // Ensure that any newly added INITIAL_ARTICLES (like the agenda/gundem news)
    // are present even for existing sessions in the browser.
    const existingIds = new Set(list.map(a => a.id));
    const missing = INITIAL_ARTICLES.filter(a => !existingIds.has(a.id));
    if (missing.length > 0) {
      list = [...list, ...missing];
    }
    
    if (list.length === 0) {
      list = [...INITIAL_ARTICLES];
    }

    // Filter to keep ONLY Orhan's articles OR actual news/gündem items, dynamically cleaning any other content
    list = list.filter(a => {
      const isOrhan = a.authorId === 'user_orhan';
      const isNews = a.publicationType === 'news' || 
                     a.categoryId === 'gundem' || 
                     a.categoryId === 'amazon' || 
                     a.categoryId === 'trendyol' || 
                     a.categoryId === 'hepsiburada' || 
                     a.id.includes('gundem') ||
                     a.authorId === 'author_wetalks_ai';
      return isOrhan || isNews;
    });

    // Deduplicate articles by normalized title so duplicate autopilot runs don't flood the list
    const seenTitlesInit = new Set<string>();
    list = list.filter(a => {
      const norm = a.title.trim().toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, '').substring(0, 30);
      if (seenTitlesInit.has(norm)) return false;
      seenTitlesInit.add(norm);
      return true;
    });

    return list.map(art => {
      let updated = { ...art };
      
      // Explicitly pair relevant articles with correct seriesId
      const aynaTicaretIds = [
        'article_1',
        'article_gundem_3',
        'orhan_article_1',
        'orhan_article_2',
        'orhan_article_3',
        'orhan_article_4',
        'orhan_article_5',
        'orhan_article_6',
        'orhan_article_7',
        'orhan_article_8'
      ];
      if (aynaTicaretIds.includes(updated.id)) {
        updated.seriesId = 'series_orhan_ecommerce';
      }
      
      // Hardcode publicationType based on seriesId mapping or fallback to category-informed typing
      if (updated.seriesId) {
        updated.publicationType = 'series';
      } else if (!updated.publicationType) {
        if (updated.categoryId === 'gundem' || updated.categoryId === 'haberler' || updated.id.includes('gundem')) {
          updated.publicationType = 'news';
        } else if (updated.categoryId === 'etkinlikler' || updated.id.includes('etkinlik')) {
          updated.publicationType = 'event';
        } else if (updated.categoryId === 'roportajlar' || updated.id.includes('roportaj')) {
          updated.publicationType = 'interview';
        } else {
          updated.publicationType = 'article';
        }
      }
      return sanitizeArticle(updated);
    });
  });

  const [series, setSeries] = useState<ArticleSeries[]>(() => {
    const defaultSeriesList: ArticleSeries[] = [
      {
        id: 'series_orhan_ecommerce',
        title: 'Ayna Ticaret: Esnaflıktan Dijital Girişimciliğe',
        description: 'E-ticaretin, pazaryeri dinamiklerinin ve operasyonel esnaflığın cilasız gerçekleri ile yeni nesil girişimcilik felsefesi.',
        articleIds: [
          'article_1', 
          'article_gundem_3', 
          'orhan_article_4',
          'orhan_article_5',
          'orhan_article_6',
          'orhan_article_7',
          'orhan_article_8',
          'orhan_article_3',
          'orhan_article_1',
          'orhan_article_2'
        ],
        createdAt: new Date().toISOString()
      }
    ];

    const saved = localStorage.getItem('wetalks_series');
    if (saved) {
      try {
        const parsed: ArticleSeries[] = JSON.parse(saved);
        const combined = parsed.filter(s => s.id !== 'series_stoic' && s.id !== 'series_ai');
        defaultSeriesList.forEach(ds => {
          const idx = combined.findIndex(s => s.id === ds.id);
          if (idx === -1) {
            combined.push(ds);
          } else {
            // Force reset Ayna Ticaret series in user session's local storage to have the perfect order
            if (ds.id === 'series_orhan_ecommerce') {
              combined[idx] = ds;
            }
          }
        });
        return combined;
      } catch (e) {}
    }
    return defaultSeriesList;
  });

  // --- Dynamic Google Fonts Loader & CSS Custom Properties Application ---
  useEffect(() => {
    const heading = settings.headingFont || 'Reddit Sans';
    const article = settings.articleFont || 'Reddit Sans';
    const menu = settings.menuFont || 'Reddit Sans';

    const uniqueFonts = Array.from(new Set([heading, article, menu]));

    const fontId = 'dynamic-google-fonts-link';
    let linkEl = document.getElementById(fontId) as HTMLLinkElement;
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.id = fontId;
      linkEl.rel = 'stylesheet';
      document.head.appendChild(linkEl);
    }

    const fontQueries = uniqueFonts
      .map(font => {
        const formatted = font.replace(/\s+/g, '+');
        return `family=${formatted}:wght@300;400;500;600;700;800;900`;
      })
      .join('&');

    linkEl.href = `https://fonts.googleapis.com/css2?${fontQueries}&display=swap`;

    const root = document.documentElement;
    root.style.setProperty('--font-heading-custom', `"${heading}", "Playfair Display", "Reddit Sans", serif`);
    root.style.setProperty('--font-article-custom', `"${article}", "Outfit", "Reddit Sans", sans-serif`);
    root.style.setProperty('--font-menu-custom', `"${menu}", "Outfit", "Reddit Sans", sans-serif`);
  }, [settings.headingFont, settings.articleFont, settings.menuFont]);

  useEffect(() => {
    localStorage.setItem('wetalks_series', JSON.stringify(series));
    if (!isInitialMount.current && (currentRole === 'Admin' || currentRole === 'Editor')) {
      syncCollectionToCloud('series', series);
    }
  }, [series, currentRole]);

  // Keep series articleIds in perfect sync with articles seriesId references while preserving custom order
  useEffect(() => {
    setSeries(prevSeries => {
      let changed = false;
      const updated = prevSeries.map(s => {
        // Find all articles currently assigned to this series id
        const matchingIds = articles
          .filter(a => a.seriesId === s.id)
          .map(a => a.id);
        
        // Arrange matching IDs in the predefined order of original articleIds, appending any new ones
        const orderedMatchingIds = [
          ...s.articleIds.filter(id => matchingIds.includes(id)),
          ...matchingIds.filter(id => !s.articleIds.includes(id))
        ];
        
        // Are the arrays identical in content and sequence?
        const isSame = s.articleIds.length === orderedMatchingIds.length && 
                       s.articleIds.every((id, idx) => orderedMatchingIds[idx] === id);
        
        if (!isSame) {
          changed = true;
          return {
            ...s,
            articleIds: orderedMatchingIds
          };
        }
        return s;
      });
      return changed ? updated : prevSeries;
    });
  }, [articles]);

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('wetalks_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('wetalks_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('wetalks_calendar_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'evt-1',
        title: 'WORLDEF İstanbul E-Ticaret Zirvesi',
        description: 'Bölgenin en büyük e-ticaret zirvesi, bu yıl sınır ötesi ticaret ve yapay zeka operasyonlarını merkeze alıyor.',
        date: '2026-07-15',
        durationDays: 3,
        time: '09:00',
        location: 'Lütfi Kırdar Kongre Merkezi, İstanbul',
        organizer: 'WORLDEF',
        sourceUrl: 'https://worldef.net'
      },
      {
        id: 'evt-2',
        title: 'Trendyol Satıcı Buluşmaları',
        description: 'Trendyol ekosistemindeki başarılı satıcıların e-ihracat deneyimlerini paylaştığı ücretsiz networking buluşması.',
        date: '2026-06-28',
        durationDays: 1,
        time: '14:00',
        location: 'Trendyol HQ, Maslak, İstanbul',
        organizer: 'Trendyol Akademi'
      },
      {
        id: 'evt-3',
        title: 'Amazon FBA & KDV Çözümleri Webinarı',
        description: 'Avrupa ve Amerika’da satış yapanlar için vergi optimizasyonu ve FBA kargo gönderim ipuçları.',
        date: '2026-07-02',
        durationDays: 2,
        time: '20:00',
        location: 'Zoom Çevrimiçi',
        organizer: 'WeTalks Akademi & Taxer'
      },
      {
        id: 'evt-4',
        title: 'E-İhracat ve Lojistik Yoğun Eğitim Kampı',
        description: 'Yeni başlayanlar ve e-ihracat cirosunu katlamak isteyen profesyoneller için 5 günlük online bootcamp.',
        date: '2026-07-08',
        durationDays: 5,
        time: '10:00',
        location: 'WeTalks Akademi Portalı',
        organizer: 'WeTalks Global'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('wetalks_calendar_events', JSON.stringify(calendarEvents));
    if (!isInitialMount.current && (currentRole === 'Admin' || currentRole === 'Editor')) {
      syncCollectionToCloud('calendar_events', calendarEvents);
    }
  }, [calendarEvents, currentRole]);

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('wetalks_categories');
    const loadedList = saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    const excludedIds = ['yasam', 'kultur-sanat', 'sinema', 'ekonomi', 'kultur', 'makaleler', 'gundem', 'roportajlar'];
    const excludedNames = ['Yaşam', 'Kültür & Sanat', 'Sinema', 'Ekonomi', 'Kültür', 'Yaşam / Doğa', 'Makaleler', 'Gündem', 'Röportajlar'];
    let filtered = loadedList.filter((c: any) => 
      !excludedIds.includes(c.id?.toLowerCase()) && 
      !excludedIds.includes(c.slug?.toLowerCase()) &&
      !excludedNames.includes(c.name)
    );
    const hasEtkinlikler = filtered.some((c: any) => c.id === 'etkinlikler');
    if (!hasEtkinlikler) {
      filtered.push({
        id: 'etkinlikler',
        name: 'Etkinlikler',
        slug: 'etkinlikler',
        description: 'Sektörün nabzını tutan fuarlar, zirveler, WORLDEF ve Webrazzi buluşmaları.',
        icon: 'Calendar'
      });
    }
    return filtered;
  });

  // --- Router & Nav state ---
  const [currentView, setCurrentView] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/admin') return 'system_admin';
    if (path.startsWith('/yazi/')) return 'article';
    if (path !== '/' && path !== '') {
      const viewName = path.slice(1);
      const validViews = ['search', 'explore', 'dashboard', 'writers', 'series', 'insights', 'google', 'home'];
      if (validViews.includes(viewName)) {
        return viewName === 'google' ? 'insights' : viewName;
      }
    }
    
    const saved = localStorage.getItem('wetalks_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.insightsActive === false) {
          return 'home';
        }
      } catch (e) {}
    }
    return 'insights';
  }); // 'home', 'article', 'edit_article', 'profile', 'search', 'explore', 'dashboard'
  const [viewParams, setViewParams] = useState<any>({});

  // --- UI Aux States ---
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategoryFilter, setSearchCategoryFilter] = useState<string>('all');
  const [searchTagFilter, setSearchTagFilter] = useState<string>('all');
  const [searchPublicationTypeFilter, setSearchPublicationTypeFilter] = useState<string>('all');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  // --- News Portal States ---
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('all');
  const [newsPollVoted, setNewsPollVoted] = useState<boolean>(() => {
    return localStorage.getItem('news_poll_voted') === 'true';
  });
  const [newsPollChoice, setNewsPollChoice] = useState<string | null>(() => {
    return localStorage.getItem('news_poll_choice');
  });
  const [newsPollVotes, setNewsPollVotes] = useState<{yes: number, no: number, maybe: number}>(() => {
    const savedVotes = localStorage.getItem('news_poll_votes');
    return savedVotes ? JSON.parse(savedVotes) : { yes: 184, no: 62, maybe: 48 };
  });

  // --- Interactive Calendar States ---
  const [eventActiveTab, setEventActiveTab] = useState<'calendar' | 'upcoming'>('calendar');
  const [calMonth, setCalMonth] = useState<number>(6); // Default: July (0-indexed: 6 = July)
  const [calYear, setCalYear] = useState<number>(2026); // Default: 2026
  const [selectedCalDayEvent, setSelectedCalDayEvent] = useState<CalendarEvent | null>(null);

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(prev => prev - 1);
    } else {
      setCalMonth(prev => prev - 1);
    }
    setSelectedCalDayEvent(null);
    playPluckSynth('click');
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(prev => prev + 1);
    } else {
      setCalMonth(prev => prev + 1);
    }
    setSelectedCalDayEvent(null);
    playPluckSynth('click');
  };

  // --- High-Fidelity Dribbble Premium Styling & Audio States ---
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('wetalks_sound_enabled');
    return saved !== 'false'; // Default to true for rich feedback
  });

  const [bentoMode, setBentoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('wetalks_bento_mode');
    return saved !== 'false'; // Default to true bento mode for gorgeous home feeds
  });

  const [glowOrbsEnabled, setGlowOrbsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('wetalks_glow_orbs_enabled');
    return saved !== 'false'; // Default to true (cool glass gradients)
  });

  const [glassBlurTheme, setGlassBlurTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem('wetalks_glass_blur');
    return saved !== 'false'; // Default to true
  });

  // Sync sound cached variable
  useEffect(() => {
    setGlobalSoundEnabled(soundEnabled);
    localStorage.setItem('wetalks_sound_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('wetalks_bento_mode', String(bentoMode));
  }, [bentoMode]);

  useEffect(() => {
    localStorage.setItem('wetalks_glow_orbs_enabled', String(glowOrbsEnabled));
  }, [glowOrbsEnabled]);

  useEffect(() => {
    localStorage.setItem('wetalks_glass_blur', String(glassBlurTheme));
  }, [glassBlurTheme]);

  // --- News Poll Handlers ---
  const handleNewsPollVote = (choice: 'yes' | 'no' | 'maybe') => {
    if (newsPollVoted) return;
    const updated = { ...newsPollVotes, [choice]: newsPollVotes[choice] + 1 };
    setNewsPollVotes(updated);
    setNewsPollChoice(choice);
    setNewsPollVoted(true);
    localStorage.setItem('news_poll_voted', 'true');
    localStorage.setItem('news_poll_choice', choice);
    localStorage.setItem('news_poll_votes', JSON.stringify(updated));
    playPluckSynth('success');
  };

  const handleResetNewsPoll = () => {
    const original = { yes: 184, no: 62, maybe: 48 };
    setNewsPollVotes(original);
    setNewsPollChoice(null);
    setNewsPollVoted(false);
    localStorage.removeItem('news_poll_voted');
    localStorage.removeItem('news_poll_choice');
    localStorage.removeItem('news_poll_votes');
    playPluckSynth('click');
  };

  // Listen for keyboard shortcuts (Cmd+K / Ctrl+K) to toggle the search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
        setModalSearchQuery('');
      } else if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Ghost CMS path routing synchronization ---
  useEffect(() => {
    const syncRouteFromPath = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentView('system_admin');
      } else if (path === '/privacy') {
        setCurrentView('privacy');
      } else if (path === '/terms') {
        setCurrentView('terms');
      } else if (path.startsWith('/yazi/')) {
        const artId = path.replace('/yazi/', '');
        if (artId) {
          setCurrentView('article');
          setViewParams({ id: artId });
        }
      } else if (path !== '/' && path !== '') {
        const viewName = path.slice(1);
        const validViews = ['search', 'explore', 'dashboard', 'writers', 'series', 'insights', 'google', 'home', 'privacy', 'terms', 'articles', 'news', 'interviews', 'events'];
        if (validViews.includes(viewName)) {
          setCurrentView(viewName === 'google' ? 'insights' : viewName);
        } else {
          setCurrentView('home');
        }
      } else {
        // Root path is '/' or ''
        const savedSettings = localStorage.getItem('wetalks_settings');
        let isInsightsActive = true;
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            if (parsed.insightsActive === false) {
              isInsightsActive = false;
            }
          } catch (e) {
            // ignore
          }
        }
        if (isInsightsActive) {
          setCurrentView('insights');
        } else {
          setCurrentView('home');
        }
      }
    };

    window.addEventListener('popstate', syncRouteFromPath);
    syncRouteFromPath(); // sync on initial mount

    return () => window.removeEventListener('popstate', syncRouteFromPath);
  }, []);

  const [isControlIslandExpanded, setIsControlIslandExpanded] = useState<boolean>(true);
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // --- Auth Session Resolution ---
  // Resolves currently signed-in profile backed by verified Firebase Authentication session
  const getCurrentUser = (): UserProfile | null => {
    if (!firebaseUser || currentRole === 'Visitor') return null;
    const found = profiles.find(
      p => (p.email && firebaseUser.email && p.email.toLowerCase() === firebaseUser.email.toLowerCase()) || 
           p.id === firebaseUser.uid
    );
    if (found) return { ...found, role: currentRole };

    return {
      id: firebaseUser.uid,
      username: firebaseUser.email?.split('@')[0] || 'kullanici',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kullanıcı',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.displayName || firebaseUser.email || 'U')}&background=0D62FE&color=fff`,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      bio: '',
      expertise: [],
      socials: {},
      followersCount: 0,
      articlesCount: 0,
      role: currentRole,
      followedAuthors: [],
      savedArticles: [],
      likedArticles: []
    };
  };

  const currentUser = getCurrentUser();

  // Firebase Authentication State Synchronization
  useEffect(() => {
    // Purge legacy role storage
    localStorage.removeItem('wetalks_role');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const role = extractRoleFromClaims(idTokenResult);
          setCurrentRole(role);
        } catch (err) {
          console.error('[Auth] Failed to resolve token claims:', err);
          setCurrentRole('Reader');
        }
      } else {
        setCurrentRole('Visitor');
      }
    });

    return () => unsubscribe();
  }, []);

  // Save states to localStorage on change
  useEffect(() => {
    localStorage.setItem('wetalks_dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('wetalks_lang', lang);
  }, [lang]);

  // Geolocation language detection on startup (if no explicit language preference exists)
  useEffect(() => {
    const detectLocationLanguage = async () => {
      const saved = localStorage.getItem('wetalks_lang');
      if (saved) return; // Respect existing user choice or previously detected language
      
      try {
        console.log('[Geolocation] Detecting user location...');
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data && data.country_code) {
            const detectedLang = data.country_code === 'TR' ? 'tr' : 'en';
            setLang(detectedLang);
            localStorage.setItem('wetalks_lang', detectedLang);
            console.log(`[Geolocation] Detected country: ${data.country_code}. Automatically set language to: ${detectedLang}`);
          }
        }
      } catch (error) {
        console.warn('[Geolocation] Language detection via IP failed, falling back to browser/timezone language:', error);
      }
    };
    detectLocationLanguage();
  }, []);

  // --- Self-hosted PostgreSQL syncing on Startup ---
  useEffect(() => {
    async function loadCloudData() {
      try {
        console.log('[SelfHosted] Syncing data with PostgreSQL...');
        
        // 1. Settings (Public Safe Settings)
        const cloudPublicSettings = await syncDocumentFromCloud<Partial<SystemSettings>>('settings', 'public_settings', {});
        setSettings(prev => {
          const merged = { ...prev, ...cloudPublicSettings };
          if (merged.siteTitle === 'WeTalks | Düşünceler & Teknoloji Platformu' || merged.siteTitle === 'WeTalks Pro' || !merged.siteTitle) {
            merged.siteTitle = 'WeTalks | AI-Supported Founder Stories & Business Insights';
          }
          if (merged.appName === 'WeTalks Pro' || !merged.appName) {
            merged.appName = 'WeTalks';
          }
          return merged;
        });
        
        // 2. Categories
        const cloudCategories = await syncCollectionFromCloud<Category>('categories', categories);
        setCategories(cloudCategories);
        
        // 3. Profiles
        let cloudProfiles = await syncCollectionFromCloud<UserProfile>('profiles', profiles);
        cloudProfiles = cloudProfiles.map(p => {
          if (p.id === 'user_orhan' || p.name === 'Orhan Balcı') {
            const updated = { ...p, username: 'orhanbalci' };
            if (!p.avatar || p.avatar === 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=400') {
              updated.avatar = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400';
            }
            return updated;
          }
          return p;
        });
        setProfiles(cloudProfiles);
        
        // 4. Articles
        const cloudArticles = await syncCollectionFromCloud<Article>('articles', articles);
        const sanitizedCloudArticles = cloudArticles.map(art => sanitizeArticle(art));
        setArticles(sanitizedCloudArticles);

        // Update cloud and local storage with repaired images
        sanitizedCloudArticles.forEach(art => {
          const orig = cloudArticles.find(c => c.id === art.id);
          if (orig && orig.coverImage !== art.coverImage) {
            saveDocToCloud('articles', art.id, art);
          }
        });
        try {
          localStorage.setItem('wetalks_articles', JSON.stringify(sanitizedCloudArticles));
        } catch {
          // Ignore quota errors if any
        }
        
        // 5. Comments
        const cloudComments = await syncCollectionFromCloud<Comment>('comments', comments);
        setComments(cloudComments);
        
        // 6. Notifications (Private user data - only loaded if authenticated)
        if (auth?.currentUser) {
          try {
            const cloudNotifications = await syncCollectionFromCloud<Notification>('notifications', notifications);
            setNotifications(cloudNotifications);
          } catch (notifErr) {
            console.warn('[SelfHosted] Notification sync deferred.');
          }
        }
        
        // 7. Series
        const cloudSeries = await syncCollectionFromCloud<ArticleSeries>('series', series);
        setSeries(cloudSeries);
        
        // 8. Calendar Events
        const cloudCalendarEvents = await syncCollectionFromCloud<CalendarEvent>('calendar_events', calendarEvents);
        setCalendarEvents(cloudCalendarEvents);
        
        console.log('[SelfHosted] Cloud data sync completed successfully.');
      } catch (e) {
        console.error('[SelfHosted] Sync failed:', e);
      } finally {
        isInitialMount.current = false;
      }
    }
    loadCloudData();

    // Real-time onSnapshot listeners for live article and comment updates
    let unsubArticles: (() => void) | null = null;
    let unsubComments: (() => void) | null = null;
    try {
      unsubArticles = onSnapshot(collection(db, 'articles'), (snapshot) => {
        if (!snapshot.empty && !isInitialMount.current) {
          const liveArticles: Article[] = [];
          snapshot.forEach(docSnap => {
            liveArticles.push(docSnap.data() as Article);
          });
          if (liveArticles.length > 0) {
            setArticles(liveArticles);
          }
        }
      }, (err) => {
        console.warn('[SelfHosted] Articles snapshot listener deferred:', err);
      });

      unsubComments = onSnapshot(collection(db, 'comments'), (snapshot) => {
        if (!snapshot.empty && !isInitialMount.current) {
          const liveComments: Comment[] = [];
          snapshot.forEach(docSnap => {
            liveComments.push(docSnap.data() as Comment);
          });
          if (liveComments.length > 0) {
            setComments(liveComments);
          }
        }
      }, (err) => {
        console.warn('[SelfHosted] Comments snapshot listener deferred:', err);
      });
    } catch (listenerErr) {
      console.warn('[SelfHosted] Live listeners setup skipped:', listenerErr);
    }

    return () => {
      if (unsubArticles) unsubArticles();
      if (unsubComments) unsubComments();
    };
  }, []);

  // Periodic sync of autopilot auto-published articles from server
  useEffect(() => {
    let isMounted = true;

    const checkAutopilotArticles = async () => {
      try {
        const resp = await fetch('/api/news/autopilot/new-articles');
        const data = await resp.json();
        if (isMounted && data.success && Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles(prevArticles => {
            const currentIds = new Set(prevArticles.map(a => a.id));
            const currentTitles = new Set(prevArticles.map(a => a.title.trim().toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, '').substring(0, 30)));
            const newOnes = data.articles.filter((a: Article) => {
              const norm = a.title.trim().toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, '').substring(0, 30);
              return !currentIds.has(a.id) && !currentTitles.has(norm);
            });
            if (newOnes.length === 0) return prevArticles;

            // Run side effects and toast notifications outside the reducer cycle
            setTimeout(() => {
              newOnes.forEach((art: Article) => {
                saveDocToCloud('articles', art.id, art);
              });
              const newest = newOnes[0];
              toast.info(`🤖 Otopilot yeni bir haber taradı ve AI Baş Editör onayıyla yayına aldı: "${newest.title.substring(0, 45)}..."`);
            }, 0);

            return [...newOnes, ...prevArticles];
          });
        }
      } catch (e) {
        // quiet fallback
      }
    };

    // Initial check after 4s, then every 40s
    const timeoutId = setTimeout(checkAutopilotArticles, 4000);
    const intervalId = setInterval(checkAutopilotArticles, 40000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  // Load administrative settings when an authenticated Admin session is active
  useEffect(() => {
    if (currentRole === 'Admin') {
      syncDocumentFromCloud<Partial<SystemSettings>>('settings', 'admin_settings', {}).then(adminData => {
        if (adminData && Object.keys(adminData).length > 0) {
          setSettings(prev => ({ ...prev, ...adminData }));
        }
      }).catch(err => {
        console.warn('[SelfHosted] Could not fetch admin_settings:', err);
      });
    }
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('wetalks_profiles', JSON.stringify(profiles));
    if (!isInitialMount.current && currentRole === 'Admin') {
      syncCollectionToCloud('profiles', profiles);
    }
  }, [profiles, currentRole]);

  useEffect(() => {
    localStorage.setItem('wetalks_articles', JSON.stringify(articles));
    if (!isInitialMount.current && (currentRole === 'Admin' || currentRole === 'Editor')) {
      syncCollectionToCloud('articles', articles);
    }
  }, [articles, currentRole]);

  useEffect(() => {
    localStorage.setItem('wetalks_comments', JSON.stringify(comments));
    if (!isInitialMount.current && (currentRole === 'Admin' || currentRole === 'Editor')) {
      syncCollectionToCloud('comments', comments);
    }
  }, [comments, currentRole]);

  useEffect(() => {
    localStorage.setItem('wetalks_notifications', JSON.stringify(notifications));
    if (!isInitialMount.current && currentRole === 'Admin') {
      syncCollectionToCloud('notifications', notifications);
    }
  }, [notifications, currentRole]);

  useEffect(() => {
    localStorage.setItem('wetalks_categories', JSON.stringify(categories));
    if (!isInitialMount.current && currentRole === 'Admin') {
      syncCollectionToCloud('categories', categories);
    }
  }, [categories, currentRole]);

  useEffect(() => {
    localStorage.setItem('wetalks_settings', JSON.stringify(settings));
    if (!isInitialMount.current && currentRole === 'Admin') {
      // Split settings into public presentation and administrative tab preferences
      const PUBLIC_SAFE_KEYS: (keyof SystemSettings)[] = [
        'appName', 'siteTitle', 'appDescription', 'accentColor', 'wordsPerMinute',
        'menuItems', 'lightLogo', 'darkLogo', 'favicon', 'enableAiAssistant',
        'enableComments', 'enableNewsletter', 'enableManifesto', 'enableLikesSaves',
        'enableGuestReading', 'showDesignStudio', 'showExploreProjectButton',
        'appActive', 'insightsActive', 'headingFont', 'articleFont', 'menuFont'
      ];

      const INTERNAL_ADMIN_KEYS: (keyof SystemSettings)[] = [
        'showOverviewTab', 'showSavedLikedTab', 'showMyArticlesTab',
        'showEditorApprovalsTab', 'showEditorCategoriesTab', 'showAdminUsersTab',
        'showAdminCatalogTab', 'showAgendaNewsTab', 'showAgendaSourcesTab',
        'showAiGenerationTab'
      ];

      const publicPayload: Partial<SystemSettings> = {};
      for (const k of PUBLIC_SAFE_KEYS) {
        if (settings[k] !== undefined) (publicPayload as any)[k] = settings[k];
      }
      saveDocToCloud('settings', 'public_settings', publicPayload);

      const adminPayload: Partial<SystemSettings> = {};
      for (const k of INTERNAL_ADMIN_KEYS) {
        if (settings[k] !== undefined) (adminPayload as any)[k] = settings[k];
      }
      saveDocToCloud('settings', 'admin_settings', adminPayload);
    }
  }, [settings, currentRole]);

  // --- Dynamic Favicon Updater ---
  useEffect(() => {
    if (settings?.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings?.favicon]);

  // --- Dynamic Document Title Updater ---
  // Bu kisim index.html'deki title'in dogrudan gorunmesi icin devre disi birakilmistir.
  // useEffect(() => {
  //   if (settings && (settings.siteTitle || settings.appName)) {
  //     document.title = settings.siteTitle || `${settings.appName} | Platform`;
  //   }
  // }, [settings?.siteTitle, settings?.appName]);

  // --- Helpers for Category Icons ---
  const getCategoryIcon = (iconName: string, categoryId?: string, categoryName?: string) => {
    const normalizedId = categoryId?.toLowerCase() || '';
    const normalizedName = categoryName?.toLowerCase() || '';
    
    // Category-specific color and icon resolutions
    if (normalizedId.includes('ai') || normalizedId.includes('yapay') || normalizedName.includes('yapay')) {
      return <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    }
    if (normalizedId.includes('tekno') || normalizedName.includes('tekno') || normalizedId === 'temu') {
      return <Cpu className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    }
    if (normalizedId === 'girisimcilik' || normalizedId === 'girişimcilik' || normalizedName.includes('girişimcilik') || normalizedId === 'deneyimler') {
      return <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
    if (normalizedId.includes('ticaret') || normalizedId === 'amazon' || normalizedId === 'trendyol' || normalizedId === 'hepsiburada' || normalizedId === 'etsy' || normalizedName.includes('ticaret')) {
      return <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
    }
    if (normalizedId.includes('etkinlik') || normalizedName.includes('etkinlik')) {
      return <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
    if (normalizedId.includes('gundem') || normalizedName.includes('gündem')) {
      return <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
    if (normalizedId.includes('roportaj') || normalizedName.includes('röportaj')) {
      return <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }

    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'Globe': return <Globe className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'ShoppingCart': return <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'CheckSquare': return <CheckSquare className="w-5 h-5 text-orange-500" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'Scissors': return <Scissors className="w-5 h-5 text-amber-600" />;
      case 'Layers': return <Layers className="w-5 h-5 text-indigo-600" />;
      case 'ExternalLink': return <ExternalLink className="w-5 h-5 text-blue-500" />;
      case 'Truck': return <Truck className="w-5 h-5 text-teal-600" />;
      case 'Brain': return <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-amber-500" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-violet-600" />;
      case 'Rocket': return <Rocket className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'Lightbulb': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      default: return <BookOpen className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />;
    }
  };

  // --- Visual Action Handlers ---
  
  const handleLikeArticle = (id: string) => {
    if (!currentUser) return;

    setProfiles(prev => prev.map(p => {
      if (p.id === currentUser.id) {
        const liked = p.likedArticles.includes(id);
        const newLiked = liked
          ? p.likedArticles.filter(item => item !== id)
          : [...p.likedArticles, id];
        const updatedProfile = { ...p, likedArticles: newLiked };
        saveDocToCloud('profiles', updatedProfile.id, updatedProfile);
        return updatedProfile;
      }
      return p;
    }));

    setArticles(prev => prev.map(art => {
      if (art.id === id) {
        const isCurrentlyLiked = currentUser.likedArticles.includes(id);
        const newLikesCount = isCurrentlyLiked ? Math.max(0, art.likes - 1) : art.likes + 1;
        const updatedArticle = { ...art, likes: newLikesCount };
        saveDocToCloud('articles', updatedArticle.id, updatedArticle);
        
        // Push notification back if first like
        if (!isCurrentlyLiked && art.authorId !== currentUser.id) {
          const newNotif: Notification = {
            id: 'n_like_' + Math.random().toString(36).substring(2, 9),
            userId: art.authorId,
            type: 'comment',
            title: 'Makaleniz Beğenildi',
            description: `${currentUser.name}, "${art.title.substring(0, 30)}..." makalenizi beğendi.`,
            createdAt: new Date().toISOString(),
            isRead: false,
            link: art.id
          };
          setNotifications(old => [newNotif, ...old]);
          saveDocToCloud('notifications', newNotif.id, newNotif);
        }

        return updatedArticle;
      }
      return art;
    }));
  };

  const handleSaveArticle = (id: string) => {
    if (!currentUser) return;

    let wasSaved = false;
    setProfiles(prev => prev.map(p => {
      if (p.id === currentUser.id) {
        const isSaved = p.savedArticles.includes(id);
        wasSaved = isSaved;
        const saved = isSaved
          ? p.savedArticles.filter(item => item !== id)
          : [...p.savedArticles, id];
        const updated = { ...p, savedArticles: saved };
        saveDocToCloud('profiles', updated.id, updated);
        return updated;
      }
      return p;
    }));
    toast.info(wasSaved ? 'Makale yer imlerinizden çıkarıldı.' : 'Makale kaydedildi.');
  };

  const handleFollowAuthor = (authorId: string) => {
    if (!currentUser) return;

    let isNowFollowing = false;

    setProfiles(prev => prev.map(p => {
      // Toggle followed list on caller
      if (p.id === currentUser.id) {
        const followed = p.followedAuthors.includes(authorId)
          ? p.followedAuthors.filter(item => item !== authorId)
          : [...p.followedAuthors, authorId];
        isNowFollowing = !p.followedAuthors.includes(authorId);
        const updated = { ...p, followedAuthors: followed };
        saveDocToCloud('profiles', updated.id, updated);
        return updated;
      }
      return p;
    }));

    setProfiles(prev => prev.map(p => {
      // Toggle followers count on writer
      if (p.id === authorId) {
        const count = isNowFollowing ? p.followersCount + 1 : Math.max(0, p.followersCount - 1);
        
        // Fire Notification
        if (isNowFollowing) {
          const newNotif: Notification = {
            id: 'n_follow_' + Math.random().toString(36).substring(2, 9),
            userId: authorId,
            type: 'follower',
            title: 'Yeni Takipçi',
            description: `${currentUser.name} sizi takip etmeye başladı.`,
            createdAt: new Date().toISOString(),
            isRead: false
          };
          setNotifications(old => [newNotif, ...old]);
          saveDocToCloud('notifications', newNotif.id, newNotif);
        }

        const updated = { ...p, followersCount: count };
        saveDocToCloud('profiles', updated.id, updated);
        return updated;
      }
      return p;
    }));

    toast.info(isNowFollowing ? 'Yazar takip ediliyor.' : 'Yazar takipten çıkarıldı.');
  };

  const handleAddComment = (content: string, parentId?: string) => {
    if (!currentUser || !viewParams.id) return;

    const newComment: Comment = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      articleId: viewParams.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      parentId
    };

    setComments(prev => [...prev, newComment]);
    saveDocToCloud('comments', newComment.id, newComment);
    toast.success('Yorumunuz eklendi.');

    // Send notification to author if they are not the ones commenting
    const article = articles.find(a => a.id === viewParams.id);
    if (article && article.authorId !== currentUser.id) {
      const newNotif: Notification = {
        id: 'n_comment_' + Math.random().toString(36).substring(2, 9),
        userId: article.authorId,
        type: 'comment',
        title: 'Yazınıza Yorum Yapıldı',
        description: `${currentUser.name}, "${article.title.substring(0, 25)}..." yazınıza yorum ekledi.`,
        createdAt: new Date().toISOString(),
        isRead: false,
        link: article.id
      };
      setNotifications(old => [newNotif, ...old]);
      saveDocToCloud('notifications', newNotif.id, newNotif);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
    deleteDocFromCloud('comments', commentId);
    toast.info('Yorum silindi.');
  };

  const handleEditComment = (commentId: string, newContent: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const updated = { ...c, content: newContent };
        saveDocToCloud('comments', updated.id, updated);
        return updated;
      }
      return c;
    }));
    toast.success('Yorum güncellendi.');
  };

  const handleUpdateUserRole = (targetUserId: string, newRole: UserRole) => {
    setProfiles(prev => prev.map(u => {
      if (u.id === targetUserId) {
        const updated = { ...u, role: newRole };
        saveDocToCloud('profiles', targetUserId, updated);
        return updated;
      }
      return u;
    }));
    toast.success(`Kullanıcı yetkisi "${newRole}" olarak güncellendi.`);
  };

  const notifySubscribersOfNewArticle = async (article: Article) => {
    try {
      const subscriberEmails = profiles.map(p => p.email).filter(email => email && email.includes('@'));
      console.log('Sending new article email notification for:', article.title, 'to:', subscriberEmails);
      
      const idToken = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const response = await fetch('/api/article/notify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: article.title,
          summary: article.summary,
          authorName: article.authorName,
          articleId: article.id,
          subscribers: subscriberEmails
        }),
      });
      const data = await response.json();
      console.log('Notification delivery response:', data);
    } catch (err) {
      console.error('Error notifying subscribers:', err);
    }
  };

  const handleModifyArticleStatus = (articleId: string, newStatus: ArticleStatus, rejectionReason?: string) => {
    setArticles(prev => prev.map(art => {
      if (art.id === articleId) {
        const updated = { ...art, status: newStatus };
        saveDocToCloud('articles', updated.id, updated);

        // Automatically draft notification payload for writer
        const titleText = newStatus === 'Published' ? 'Makaleniz Onaylandı' : 'Makale Revizyon Talebi';
        const descriptionText = newStatus === 'Published' 
          ? `Tebrikler! "${art.title.substring(0, 30)}..." yazınız onaylandı ve yayına alındı.`
          : `"${art.title.substring(0, 30)}..." yazınız revizyon gerektiriyor: "${rejectionReason || 'Detaylar belirtilmemiş.'}"`;

        const newNotif: Notification = {
          id: 'n_status_' + Math.random().toString(36).substring(2, 9),
          userId: art.authorId,
          type: newStatus === 'Published' ? 'approval' : 'rejection',
          title: titleText,
          description: descriptionText,
          createdAt: new Date().toISOString(),
          isRead: false,
          link: newStatus === 'Published' ? art.id : undefined
        };
        setNotifications(old => [newNotif, ...old]);
        saveDocToCloud('notifications', newNotif.id, newNotif);

        if (newStatus === 'Published') {
          notifySubscribersOfNewArticle(art);
        }

        return updated;
      }
      return art;
    }));
    toast.success(`Yazı durumu güncellendi: ${newStatus}`);
  };

  const handleDeleteArticle = (articleId: string) => {
    setArticles(prev => prev.filter(a => a.id !== articleId));
    deleteDocFromCloud('articles', articleId);
    toast.info('İçerik başarıyla silindi.');
  };

  const handleAddCategory = (newCategory: Category) => {
    setCategories(prev => [...prev, newCategory]);
    saveDocToCloud('categories', newCategory.id, newCategory);
    toast.success(`"${newCategory.name}" kategorisi eklendi.`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    deleteDocFromCloud('categories', categoryId);
    toast.info('Kategori silindi.');
  };

  const handleAddSeries = (title: string, description: string) => {
    const newId = 'series_' + Math.random().toString(36).substring(2, 9);
    const newSeriesItem: ArticleSeries = {
      id: newId,
      title,
      description,
      articleIds: [],
      createdAt: new Date().toISOString()
    };
    setSeries(prev => [...prev, newSeriesItem]);
    return newId;
  };

  const handleSaveArticleFromEditor = async (articleData: Partial<Article>, status: ArticleStatus) => {
    if (!currentUser) return;

    const isEdit = !!viewParams.articleId;

    if (isEdit) {
      let updatedArticle: Article | null = null;
      setArticles(prev => prev.map(art => {
        if (art.id === viewParams.articleId) {
          updatedArticle = {
            ...art,
            ...articleData,
            status,
            createdAt: new Date().toISOString()
          } as Article;
          return updatedArticle;
        }
        return art;
      }));

      if (updatedArticle) {
        saveDocToCloud('articles', (updatedArticle as Article).id, updatedArticle);
      }
      toast.success(status === 'Published' ? 'Yazınız başarıyla güncellendi!' : 'Taslağınız güncellendi.');
    } else {
      const newArticle: Article = {
        id: articleData.id || 'article_' + Math.random().toString(36).substring(2, 9),
        title: articleData.title || 'Başlıksız Makale',
        summary: articleData.summary || '',
        content: articleData.content || '',
        coverImage: articleData.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        categoryId: articleData.categoryId || categories[0]?.id || '',
        tags: articleData.tags || [],
        createdAt: new Date().toISOString(),
        readTime: articleData.readTime || 5,
        status, // 'Draft' or 'Pending'
        views: 0,
        likes: 0,
        seoTitle: articleData.seoTitle,
        seoDescription: articleData.seoDescription
      };
      setArticles(old => [newArticle, ...old]);

      // Save directly to PostgreSQL for persistence
      saveDocToCloud('articles', newArticle.id, newArticle);

      if (status === 'Pending') {
        const editorProfiles = profiles.filter(p => p.role === 'Editor' || p.role === 'Admin');
        editorProfiles.forEach(editor => {
          const systemNotif: Notification = {
            id: 'n_reviewer_' + Math.random().toString(36).substring(2, 9),
            userId: editor.id,
            type: 'newPost',
            title: 'Yeni İnceleme Talebi',
            description: `"${currentUser.name}" yeni bir yazıyı onay kuyruğuna gönderdi.`,
            createdAt: new Date().toISOString(),
            isRead: false
          };
          setNotifications(old => [systemNotif, ...old]);
          saveDocToCloud('notifications', systemNotif.id, systemNotif);
        });
        toast.info('Yazınız inceleme için editör onay kuyruğuna gönderildi.');
      } else {
        toast.success('Taslağınız başarıyla buluta kaydedildi.');
      }
    }

    setCurrentView('dashboard');
  };

  const handleSaveNews = async (newsData: any, status: ArticleStatus) => {
    if (!currentUser) return;

    const isEdit = !!viewParams.articleId;

    if (isEdit) {
      let updatedNews: Article | null = null;
      setArticles(prev => prev.map(art => {
        if (art.id === viewParams.articleId) {
          updatedNews = {
            ...art,
            ...newsData,
            status,
            createdAt: new Date().toISOString()
          } as Article;
          
          if (status === 'Published') {
            notifySubscribersOfNewArticle(updatedNews);
          }
          return updatedNews;
        }
        return art;
      }));

      if (updatedNews) {
        saveDocToCloud('articles', (updatedNews as Article).id, updatedNews);
      }
      toast.success(status === 'Published' ? 'Haberiniz başarıyla yayınlandı!' : 'Haber taslağı güncellendi.');
    } else {
      const newNews: Article = {
        id: newsData.id || 'article_' + Math.random().toString(36).substring(2, 9),
        title: newsData.title || 'Başlıksız Gündem Analizi',
        summary: newsData.summary || '',
        content: newsData.content || '',
        coverImage: newsData.coverImage || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        categoryId: newsData.categoryId || 'gundem',
        tags: newsData.tags || ['gundem', 'analiz'],
        createdAt: new Date().toISOString(),
        readTime: newsData.readTime || 4,
        status, // 'Draft' or 'Published' or 'Pending'
        views: 0,
        likes: 0,
        seoTitle: newsData.seoTitle,
        seoDescription: newsData.seoDescription,
        sourceName: newsData.sourceName,
        sourceUrl: newsData.sourceUrl,
        trInterest: newsData.trInterest,
        eCommerceImpact: newsData.eCommerceImpact,
        sellerImpact: newsData.sellerImpact
      };
      setArticles(old => [newNews, ...old]);

      // Save directly to PostgreSQL
      saveDocToCloud('articles', newNews.id, newNews);

      if (status === 'Published') {
        notifySubscribersOfNewArticle(newNews);
      }

      toast.success(status === 'Published' ? 'Gündem haberi başarıyla yayına alındı!' : 'Haber taslağı buluta kaydedildi.');
    }

    setCurrentView('dashboard');
  };

  // --- Router Navigation router helper ---
  const handleNavigate = (view: string, params: any = {}) => {
    playPluckSynth('click');
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Precise URL path mapping mimicking production router paths
    let path = '/';
    if (view === 'system_admin') {
      path = '/admin';
    } else if (view === 'article' && params.id) {
      path = `/yazi/${params.id}`;
    } else if (view === 'home') {
      path = '/';
    } else {
      path = `/${view}`;
    }

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }

    if (view === 'articles' || view === 'search') {
      if (params.category) {
        setSearchCategoryFilter(params.category);
      } else {
        setSearchCategoryFilter('all');
      }
      if (params.tag) {
        setSearchTagFilter(params.tag);
      } else {
        setSearchTagFilter('all');
      }
      if (params.publicationType) {
        setSearchPublicationTypeFilter(params.publicationType);
      } else {
        setSearchPublicationTypeFilter('all');
      }
    }
  };

  // --- Newsletter handler ---
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 2000);
  };

  // --- Filter listings for Feed render ---
  const publishedArticles = articles.filter(a => a.status === 'Published');
  const featuredArticle = publishedArticles[0] || null;
  const recentArticles = publishedArticles.slice(1, 6);
  const editorsChoiceArticles = publishedArticles.filter(a => a.categoryId === 'yapay-zeka' || a.categoryId === 'deneyimler').slice(0, 3);
  const activeWriters = profiles.filter(p => p.role === 'Writer');

  // --- Deep Search logic ---
  const filteredSearchArticles = publishedArticles.filter(art => {
    const matchesKeyword = !searchTerm.trim() || 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.authorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = searchCategoryFilter === 'all' || art.categoryId === searchCategoryFilter;
    const matchesTag = searchTagFilter === 'all' || art.tags.includes(searchTagFilter);
    const matchesPublicationType = searchPublicationTypeFilter === 'all' || art.publicationType === searchPublicationTypeFilter;

    return matchesKeyword && matchesCategory && matchesTag && matchesPublicationType;
  });

  // Prepare "POPÜLER YAZILAR" (Popular Articles) list, prioritizing Orhan's copied articles
  const popularArticles = (() => {
    let list = articles.filter(a => 
      a.status === 'Published' && 
      (a.id === 'orhan_article_1' || a.id === 'orhan_article_2' || a.id === 'orhan_article_3' || a.id === 'orhan_article_4')
    );
    
    const existingIds = list.map(p => p.id);
    const fallback = articles.filter(a => a.status === 'Published' && !existingIds.includes(a.id));
    list = [...list, ...fallback].slice(0, 5);
    
    const order = ['orhan_article_1', 'orhan_article_2', 'orhan_article_3', 'orhan_article_4'];
    list.sort((a, b) => {
      const scoreA = order.indexOf(a.id);
      const scoreB = order.indexOf(b.id);
      if (scoreA !== -1 && scoreB !== -1) return scoreA - scoreB;
      if (scoreA !== -1) return -1;
      if (scoreB !== -1) return 1;
      return 0;
    });
    
    return list;
  })();

  if (currentView === 'system_admin') {
    return (
      <div id="wetalks-admin-shell" className="min-h-screen bg-zinc-50 dark:bg-[#070913] text-zinc-900 dark:text-zinc-100 transition-colors selection:bg-[#0D62FE]/10">
        {currentRole === 'Admin' ? (
          <AdminPanel
            settings={settings}
            onUpdateSettings={setSettings}
            articles={articles}
            profiles={profiles}
            categories={categories}
            onResetDatabase={handleResetDatabase}
            onImportDatabase={handleImportDatabase}
            onExportDatabase={handleExportDatabase}
            onClose={() => handleNavigate('home')}
            onLogout={async () => {
              await signOut(auth);
              setCurrentRole('Visitor');
              setFirebaseUser(null);
              handleNavigate('home');
            }}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onModifyArticleStatus={handleModifyArticleStatus}
            notifications={notifications}
            onMarkNotificationRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
            onMarkAllNotificationsRead={() => setNotifications(prev => prev.map(n => n.userId === currentUser?.id || n.userId === 'user_orhan' ? { ...n, isRead: true } : n))}
            onUpdateUserRole={handleUpdateUserRole}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        ) : (
          <div id="admin-login-layout" className="min-h-screen flex items-center justify-center p-4 bg-[#0a0c16] relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute top-[-25%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[#0D62FE]/8 blur-[180px]" />
              <div className="absolute bottom-[-25%] right-[-15%] w-[60vw] h-[60vw] rounded-full bg-indigo-600/8 blur-[180px]" />
              <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[120px]" />
            </div>
            
            <div className="bg-[#121424]/90 backdrop-blur-md text-white border border-zinc-800/60 rounded-[28px] shadow-2xl p-8 md:p-10 max-w-md w-full relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-350">
              
              {/* Logo / Header Area */}
              <div className="text-center space-y-3">
                {settings?.darkLogo || settings?.lightLogo ? (
                  <div className="flex justify-center mb-4">
                    <img 
                      src={settings.darkLogo || settings.lightLogo} 
                      className="h-10 sm:h-12 max-w-[220px] object-contain block transition-all" 
                      alt="" 
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-[#0D62FE] rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-[#0D62FE]/25 font-black text-white mb-4">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="8" cy="8" r="4" fill="white" fillOpacity="0.8" />
                      <circle cx="16" cy="8" r="4" fill="white" />
                      <circle cx="8" cy="16" r="4" fill="white" />
                      <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.6" />
                    </svg>
                  </div>
                )}
                <h2 className="text-xl font-sans font-black tracking-tight text-white">
                  {settings?.darkLogo || settings?.lightLogo ? `${settings.appName || 'WeTalks'} Portal` : 'WeTalks Yönetici Portali'}
                </h2>
                <p className="text-xs text-zinc-400">Yayın, kategori ve sistem parametreleri yönetim merkezi.</p>
              </div>

              {/* Inline Login Error Alert */}
              {loginError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <p className="flex-1 font-medium">{loginError}</p>
                </div>
              )}
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoginError(null);
                const form = e.currentTarget;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
                const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                if (!email || !password) {
                  setLoginError('Lütfen yönetici e-posta ve şifrenizi girin.');
                  return;
                }
                setIsAdminLoggingIn(true);
                try {
                  const cred = await signInWithEmailAndPassword(auth, email, password);
                  const tokenResult = await cred.user.getIdTokenResult();
                  const role = extractRoleFromClaims(tokenResult);
                  if (role !== 'Admin') {
                    setLoginError('Bu hesap yönetici yetkilerine sahip değildir. Erişim reddedildi.');
                    await signOut(auth);
                    setCurrentRole('Visitor');
                    setFirebaseUser(null);
                  } else {
                    setCurrentRole('Admin');
                    setFirebaseUser(cred.user);
                    setLoginError(null);
                  }
                } catch (err: any) {
                  if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                    setLoginError('Geçersiz yönetici e-postası veya şifre.');
                  } else if (err.code === 'auth/too-many-requests') {
                    setLoginError('Çok fazla başarısız deneme yapıldı. Lütfen daha sonra tekrar deneyin.');
                  } else {
                    setLoginError('Giriş başarısız oldu: ' + (err.message || 'Lütfen bilgilerinizi kontrol edin.'));
                  }
                } finally {
                  setIsAdminLoggingIn(false);
                }
              }} className="space-y-4 text-left">
                
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Yönetici E-Posta</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      name="email"
                      type="email" 
                      className="w-full pl-10 pr-4 py-3 bg-[#17192a] border border-zinc-800/80 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#0D62FE] focus:ring-1 focus:ring-[#0D62FE]/30 transition-all"
                      placeholder="eposta@wetalks.tr"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Giriş Şifresi</label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      name="password"
                      type={showLoginPassword ? 'text' : 'password'} 
                      className="w-full pl-10 pr-10 py-3 bg-[#17192a] border border-zinc-800/80 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#0D62FE] focus:ring-1 focus:ring-[#0D62FE]/30 transition-all"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isAdminLoggingIn}
                  className="w-full py-3.5 bg-gradient-to-r from-[#0D62FE] to-indigo-600 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 text-xs text-white font-bold rounded-xl shadow-lg shadow-[#0D62FE]/15 transition-all cursor-pointer mt-6 flex items-center justify-center gap-2"
                >
                  {isAdminLoggingIn ? (
                    <span>Doğrulanıyor...</span>
                  ) : (
                    <>
                      <span>Sisteme Güvenli Giriş Yap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Footer Navigation */}
                <div className="pt-4 border-t border-zinc-800/60 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginError(null);
                      handleNavigate('home');
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>&larr; Web Sitesine Geri Dön</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="wetalks-wrapper" className="min-h-screen bg-slate-50/20 dark:bg-[#070913]/30 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-450 selection:bg-[#0D62FE]/10 select-text relative overflow-x-clip z-10">
      
      {/* Dynamic Modern Glassmorphism Wallpaper from the Screenshot */}
      <div className="glass-wallpaper opacity-100 dark:opacity-90">
        <div className="ambient-orb-1" />
        <div className="ambient-orb-2" />
        <div className="ambient-orb-3" />
      </div>

      {/* Dynamic Ambient Glowing Orbs Background (Dribbble Signature Atmosphere) */}
      {glowOrbsEnabled && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[8%] left-[-12%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent blur-[120px] dark:from-blue-500/5 animate-pulse duration-[12000ms]" />
          <div className="absolute top-[35%] right-[-8%] w-[42vw] h-[42vw] rounded-full bg-gradient-to-br from-[#0D62FE]/10 to-transparent blur-[100px] dark:from-[#0D62FE]/5 animate-pulse duration-[15000ms] delay-750" />
          <div className="absolute bottom-[20%] left-[15%] w-[38vw] h-[38vw] rounded-full bg-gradient-to-tr from-[#38BDF8]/10 to-transparent blur-[110px] dark:from-[#38BDF8]/5 animate-pulse duration-[10000ms] delay-1500" />
        </div>
      )}

      {/* 1. Header Toolbar Navigation */}
      <Navbar
        currentRole={currentRole}
        currentUser={currentUser}
        onLogout={async () => {
          await signOut(auth);
          setCurrentRole('Visitor');
          setFirebaseUser(null);
          handleNavigate('home');
        }}
        notifications={notifications.filter(n => n.userId === currentUser?.id)}
        onMarkNotificationRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
        onMarkAllNotificationsRead={() => setNotifications(prev => prev.map(n => n.userId === currentUser?.id ? { ...n, isRead: true } : n))}
        onAddNotification={(newNotif) => setNotifications(old => [newNotif, ...old])}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onNavigate={handleNavigate}
        currentView={currentView}
        viewParams={viewParams}
        onTriggerAuthModal={() => setShowAuthModal(true)}
        onTriggerSearchModal={() => { setShowSearchModal(true); setModalSearchQuery(''); }}
        categories={categories}
        writers={profiles.filter(p => p.role !== 'Reader' && p.role !== 'Visitor')}
        series={series}
        articles={articles}
        settings={settings}
        calendarEvents={calendarEvents}
        onUpdateCalendarEvents={setCalendarEvents}
        lang={lang}
        onChangeLang={setLang}
      />

      {/* 2. Gündem Barı (Header Altında Kayar Haber/Yazı Barı) - Sticky top-20 directly below Navbar (h-20) */}
      {currentView !== 'insights' && (
        <div id="gundem-ticker-bar" className="sticky top-20 z-35 bg-white/85 dark:bg-[#070913]/85 backdrop-blur-xl border-b border-zinc-200/50 dark:border-white/5 h-12 sm:h-13 min-h-[48px] sm:min-h-[52px] shrink-0 shadow-sm select-none flex items-center">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              display: inline-flex;
              align-items: center;
              height: 100%;
              white-space: nowrap;
              animation: marquee 160s linear infinite;
              will-change: transform;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full flex items-center">
            <div className="relative flex items-center w-full h-full overflow-hidden select-none">
              {/* Red pulsing icon indicator */}
              <div className="pl-1 pr-3 flex items-center justify-center shrink-0 z-10 self-center">
                <span className="flex h-3 w-3 relative items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              </div>

              {/* Scrolling area */}
              <div className="flex-1 overflow-hidden relative h-full flex items-center pl-2">
                {(() => {
                  let tickerItems = articles.filter(a => 
                    (a.categoryId === 'gundem' || a.tags?.includes('gundem') || a.id.startsWith('article_gundem')) && 
                    a.status === 'Published'
                  );
                  
                  if (tickerItems.length === 0) {
                    tickerItems = [
                      { id: '1', title: 'WeTalks Premium Dijital Yayın Platformu Genel Gündem Akışı Başlatıldı' },
                      { id: '2', title: 'Derin Değerlendirmeler: Yapay Zekadan Edebiyata Kültür Söyleşileri' },
                      { id: '3', title: 'Teknoloji Trendleri ve Yatırım Ekosistemindeki Son Gelişmeler' }
                    ] as any;
                  }

                  // Keep up to 10 latest items so it doesn't inflate uncontrollably
                  const activeItems = tickerItems.slice(0, 10);
                  // Duplicate elements list for consistent infinite loop animation
                  const displayedList = [...activeItems, ...activeItems];
                  // Tuned speed: responsive and active yet easy to read
                  const calculatedDuration = Math.max(150, activeItems.length * 17);

                  return (
                    <div 
                      className="animate-marquee items-center h-full gap-8"
                      style={{ animationDuration: `${calculatedDuration}s` }}
                    >
                      {displayedList.map((art, idx) => (
                        <div key={`${art.id}-${idx}`} className="inline-flex items-center h-full shrink-0">
                          <span 
                            className="inline-flex items-center text-[13px] sm:text-[14px] font-sans font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#0D62FE] dark:hover:text-[#5591FF] cursor-pointer transition-colors duration-200 leading-none select-none" 
                            onClick={() => handleNavigate('article', { id: art.id })}
                          >
                            {art.title}
                          </span>
                          <span className="inline-flex items-center justify-center text-[#0D62FE] dark:text-[#5591FF] font-black mx-4 select-none text-xs leading-none" aria-hidden="true">•</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Visual Layout switch engine */}
      <main className="flex-1 w-full flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 w-full flex flex-col"
          >
            
            {/* IF APP IS INACTIVE AND USER IS NOT ADMIN/EDITOR */}
            {settings?.appActive === false && currentView !== 'insights' && currentView !== 'system_admin' && currentRole !== 'Admin' && currentRole !== 'Editor' ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-50 dark:bg-[#070913] min-h-[60vh]">
                <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#0f111a]/80 p-8 sm:p-10 rounded-3xl border border-zinc-200/50 dark:border-white/5 shadow-xl">
                  <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto border border-orange-500/20">
                    <svg className="w-8 h-8 animate-pulse text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-serif font-black text-zinc-900 dark:text-white tracking-tight">
                      Platformumuz Geçici Olarak Bakımdadır
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      WeTalks dijital yayın ve meclis platformumuz, yeni sürüm geliştirmeleri ve altyapı iyileştirmeleri sebebiyle geçici bir süreliğine kapalıdır.
                    </p>
                  </div>

                  {settings?.insightsActive !== false ? (
                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/60 space-y-4">
                      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                        Bu süreçte insan ve yapay zekâ ortak üretimi olan iş içgörüleri platformumuz yayındadır:
                      </p>
                      <button
                        onClick={() => handleNavigate('insights')}
                        className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-sans font-black text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-md"
                      >
                        WeTalks Insights'ı Keşfet
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                      Çok yakında yeniden yayında olacağız. Sabrınız için teşekkür ederiz.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* VIEW A: HOME VITRINE FEED */}
                {currentView === 'home' && (
          <div className="flex-1 flex flex-col">
            
            {/* Premium News Slider Segment */}
            <NewsSlider articles={articles} categories={categories} onNavigate={handleNavigate} profiles={profiles} />

            {/* 1.5. EXPERIMENTAL HABERLER SECTION: Asymmetric High-Impact Interactive Matrix */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full relative z-10">

              {/* 4-Column Side-By-Side Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {(() => {
                  // Fetch 4 key news / gündem articles
                  const displayList = articles.filter(a => 
                    a.status === 'Published' && 
                    (a.id === 'article_gundem_1' || a.id === 'article_gundem_2' || a.id === 'article_gundem_4' || a.id === 'article_gundem_5')
                  ).slice(0, 4);

                  if (displayList.length === 0) {
                    return <p className="text-sm text-zinc-400 italic text-left col-span-4">Gündem maddeleri bulunamadı.</p>;
                  }

                  return displayList.map((art) => {
                    const displayCategoryName = categories.find(c => c.id === art.categoryId)?.name || 'Gündem';
                    return (
                      <div 
                        key={art.id} 
                        onClick={() => handleNavigate('article', { id: art.id })}
                        className="group bg-white dark:bg-[#111424] rounded-[28px] p-4 border border-zinc-200/80 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-500 hover:translate-y-[-4px] hover:border-[#0D62FE]/30 flex flex-col justify-between h-full cursor-pointer text-left"
                      >
                        <div className="space-y-1">
                          {/* Image with Concave Cutout in Bottom Right */}
                          <div className="relative aspect-[4/3] rounded-[20px] overflow-hidden bg-zinc-100 dark:bg-zinc-950/40">
                            <img 
                              src={art.coverImage} 
                              alt={art.title} 
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                              referrerPolicy="no-referrer"
                              onError={(e) => handleImageErrorGlobal(e, 'cover')}
                            />
                          </div>

                          {/* Category Badge & Read Time Row */}
                          <div className="pt-4 flex items-center justify-between">
                            <span className="inline-block text-[9px] font-extrabold text-[#0D62FE] dark:text-[#5591FF] uppercase tracking-wider bg-[#0D62FE]/8 dark:bg-[#0D62FE]/15 px-2.5 py-1 rounded-full border border-[#0D62FE]/10">
                              📢 {displayCategoryName}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#0D62FE]" />
                              {art.readTime} Dk
                            </span>
                          </div>

                          {/* News Title styling exactly matching display weight details */}
                          <h4 className="text-zinc-950 dark:text-zinc-50 text-[14.5px] font-black font-sans leading-snug tracking-tight line-clamp-2 uppercase-none group-hover:text-[#0D62FE] dark:group-hover:text-[#5591FF] transition-colors mt-3">
                            {art.title}
                          </h4>

                          {/* Summary text */}
                          <p className="text-zinc-500 dark:text-zinc-400 text-[11.5px] leading-relaxed line-clamp-3 mt-1.5 font-sans font-medium">
                            {art.summary}
                          </p>
                        </div>

                        {/* Author metadata panel at the base */}
                        {(() => {
                          const authorProf = profiles.find(p => p.id === art.authorId || p.name === art.authorName);
                          const resolvedAvatar = authorProf?.avatar || art.authorAvatar;
                          const resolvedName = authorProf?.name || art.authorName;
                          return (
                            <div className="flex items-center gap-2 pt-3 mt-4 border-t border-zinc-100 dark:border-white/5">
                              <img 
                                src={resolvedAvatar} 
                                alt={resolvedName} 
                                className="w-5.5 h-5.5 rounded-full object-cover border border-zinc-200/40 dark:border-white/10 shrink-0"
                                referrerPolicy="no-referrer"
                                onError={(e) => handleImageErrorGlobal(e, 'avatar')}
                              />
                              <span className="text-[11px] font-sans font-extrabold text-zinc-650 dark:text-zinc-350">
                                {authorProf?.id === 'user_orhan' || resolvedName === 'Orhan Balcı' ? 'Kurucu Yazar: ' : 'Yazar: '}{resolvedName}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  });
                })()}
              </div>
            </section>
            
            {/* HERO SEGMENT */}
            <section id="hero-banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 w-full relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column (Typography, details, CTAs) */}
                <div className="lg:col-span-7 text-left space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-[1.5px] bg-[#0D62FE]" />
                    <span className="text-[10px] tracking-widest font-black uppercase text-[#0D62FE] font-sans">
                      DENEYİMLER KONUŞUR
                    </span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-sans font-black text-zinc-950 dark:text-white leading-[1.1] tracking-tight">
                    Gerçek deneyimler.<br />
                    Gerçek insanlar.<br />
                    <span className="text-[#0D62FE] italic font-serif font-light">Gerçek ilham.</span>
                  </h1>
                  
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
                    İş dünyası, girişimcilik, e-ticaret, teknoloji ve hayat üzerine gerçek hikayeler. Birinci ağızdan WeTalks stüdyosunda.
                  </p>
                  
                  {/* Buttons matching image */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-2">
                    <button
                      onClick={() => handleNavigate('search')}
                      className="bg-[#0D62FE] hover:bg-[#0b54da] text-white font-sans font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl flex items-center gap-2 transition-all shadow-sm hover:scale-102 cursor-pointer border border-[#0D62FE]"
                    >
                      Keşfetmeye Başla
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleNavigate('writers')}
                      className="bg-zinc-100 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-sans font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 hover:scale-102"
                    >
                      <Users className="w-4 h-4 text-[#0D62FE]" />
                      Yazarları Keşfet
                    </button>
                  </div>
                </div>
                
                {/* Right Column (Stacked tilted author cards, wrapped in responsive scale container to look perfect on all devices) */}
                <div className="lg:col-span-5 relative h-[380px] sm:h-[450px] flex items-center justify-center pt-4 lg:pt-0 overflow-visible">
                  <div className="relative w-full max-w-[500px] h-full flex items-center justify-center scale-[0.62] xxs:scale-[0.68] xs:scale-[0.8] sm:scale-[0.9] lg:scale-[0.95] xl:scale-100 origin-center transition-all duration-300">
                    
                    {/* Card 1: Elif Nazlı (Pazarlama) */}
                    <div className="absolute left-0 bottom-[10%] w-[180px] bg-[#0A0B1A]/90 backdrop-blur-xl border border-zinc-700/30 rounded-3xl p-4 transform -rotate-8 transition-all hover:rotate-0 hover:scale-105 duration-300 shadow-2xl z-10 cursor-pointer" onClick={() => handleNavigate('profile', { userId: 'user_elif' })}>
                      <div className="h-40 w-full overflow-hidden rounded-2xl mb-3 relative">
                        <img src={profiles.find(p => p.id === 'user_elif')?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"} className="w-full h-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105" onError={(e) => handleImageErrorGlobal(e, 'avatar')} />
                      </div>
                      <h4 className="text-white text-xs sm:text-sm font-black tracking-tight font-sans">{profiles.find(p => p.id === 'user_elif')?.name || 'Elif Nazlı'}</h4>
                      <span className="text-zinc-400 text-[9px] font-sans block mt-1">{profiles.find(p => p.id === 'user_elif')?.expertise?.[0] || 'Pazarlama Uzmanı'}</span>
                      <div className="flex items-center justify-between mt-3 text-[9px] text-zinc-500 font-sans border-t border-zinc-800/60 pt-2">
                        <span>{articles.filter(a => a.authorId === 'user_elif' && a.status === 'Published').length || 1} Yayın</span>
                        <div className="w-5 h-5 rounded-full border border-zinc-700/60 flex items-center justify-center text-white hover:bg-white/10 transition-colors"><ArrowRight className="w-2.5 h-2.5" /></div>
                      </div>
                    </div>
                    
                    {/* Card 2: Orhan Balcı (E-Ticaret) */}
                    <div className="absolute left-[130px] bottom-[5%] w-[240px] bg-[#03040B]/95 backdrop-blur-xl border-2 border-[#0D62FE] rounded-3xl p-5 transform transition-all hover:-translate-y-2 hover:scale-[1.03] duration-300 shadow-[0_20px_50px_rgba(13, 98, 254, 0.22)] z-25 cursor-pointer" onClick={() => handleNavigate('profile', { userId: 'user_orhan' })}>
                      <div className="absolute -top-3.5 left-4.5 bg-orange-600 text-white text-[8px] font-extrabold uppercase px-3.5 py-1 rounded-full border border-orange-400 tracking-widest shadow-md">
                        KURUCU YAZAR
                      </div>
                      <div className="h-52 w-full overflow-hidden rounded-2xl mb-4.5 relative">
                        <img src={profiles.find(p => p.id === 'user_orhan')?.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400"} className="w-full h-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105" onError={(e) => handleImageErrorGlobal(e, 'avatar')} />
                      </div>
                      <h4 className="text-white text-base font-black tracking-tight font-sans">{profiles.find(p => p.id === 'user_orhan')?.name || 'Orhan Balcı'}</h4>
                      <span className="text-zinc-400 text-[11px] font-sans block mt-1">{profiles.find(p => p.id === 'user_orhan')?.expertise?.[0] || 'E-Ticaret Girişimcisi'}</span>
                      <div className="flex items-center justify-between mt-4 text-xs text-zinc-500 font-sans border-t border-zinc-800/80 pt-3">
                        <span>{articles.filter(a => a.authorId === 'user_orhan' && a.status === 'Published').length || 1} Yayın</span>
                        <div className="w-7 h-7 rounded-full bg-[#0D62FE] flex items-center justify-center text-white shadow-[0_0_15px_rgba(189,59,240,0.6)] hover:bg-[#A82DE0] transition-colors"><ArrowRight className="w-3.5 h-3.5" /></div>
                      </div>
                    </div>
                    
                    {/* Card 3: Mehmet Yılmaz (Yazılım) */}
                    <div className="absolute right-0 bottom-[8%] w-[180px] bg-[#0A0B1A]/90 backdrop-blur-xl border border-zinc-700/30 rounded-3xl p-4 transform rotate-8 transition-all hover:rotate-0 hover:scale-105 duration-300 shadow-2xl z-20 cursor-pointer" onClick={() => handleNavigate('profile', { userId: 'user_mehmet' })}>
                      <div className="h-40 w-full overflow-hidden rounded-2xl mb-3 relative">
                        <img src={profiles.find(p => p.id === 'user_mehmet')?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400"} className="w-full h-full object-cover rounded-2xl transition-transform duration-500 hover:scale-105" onError={(e) => handleImageErrorGlobal(e, 'avatar')} />
                      </div>
                      <h4 className="text-white text-xs sm:text-sm font-black tracking-tight font-sans">{profiles.find(p => p.id === 'user_mehmet')?.name || 'Mehmet Yılmaz'}</h4>
                      <span className="text-zinc-400 text-[9px] font-sans block mt-1">{profiles.find(p => p.id === 'user_mehmet')?.expertise?.[0] || 'Yazılım Geliştiricisi'}</span>
                      <div className="flex items-center justify-between mt-3 text-[9px] text-zinc-500 font-sans border-t border-zinc-800/60 pt-2">
                        <span>{articles.filter(a => a.authorId === 'user_mehmet' && a.status === 'Published').length || 1} Yayın</span>
                        <div className="w-5 h-5 rounded-full border border-zinc-700/60 flex items-center justify-center text-white hover:bg-white/10 transition-colors"><ArrowRight className="w-2.5 h-2.5" /></div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
             </section>
 
             {/* 2. ÖNE ÇIKAN YAZARLAR Row Segment */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-[#0D62FE] rounded-full" />
                  <h3 className="text-zinc-950 dark:text-white text-base font-sans font-black uppercase tracking-wider">
                    Öne Çıkan Yazarlar
                  </h3>
                </div>
                <button onClick={() => handleNavigate('writers')} className="text-zinc-500 dark:text-zinc-400 hover:text-[#0D62FE] dark:hover:text-white text-xs font-bold font-sans flex items-center gap-1 cursor-pointer transition-colors">
                  Tüm Yazarlar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {profiles.slice(0, 5).map((writer, idx) => {
                  const isOrhan = writer.id === 'user_orhan' || writer.username === 'orhanbalci' || writer.name === 'Orhan Balcı';
                  const iconColor = isOrhan ? 'bg-orange-50' : 'bg-blue-50';
                  const checkColor = isOrhan ? 'bg-orange-500' : 'bg-[#0D62FE]';
                  const textColor = isOrhan ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400';
                  return (
                    <div 
                      key={writer.id}
                      onClick={() => handleNavigate('profile', { userId: writer.id })}
                      className={`flex flex-row sm:flex-col lg:flex-row items-center sm:items-start lg:items-center gap-3.5 p-4 bg-white dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 border ${isOrhan ? 'border-orange-200 dark:border-orange-900/50' : 'border-zinc-200 dark:border-white/5'} rounded-2xl cursor-pointer hover:border-[#0D62FE]/30 transition-all duration-300 shadow-sm dark:shadow-none`}
                    >
                      <img 
                        src={writer.avatar} 
                        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-11 lg:h-11 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-white/10 shrink-0" 
                        referrerPolicy="no-referrer" 
                        onError={(e) => handleImageErrorGlobal(e, 'avatar')} 
                      />
                      <div className="text-left min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-zinc-900 dark:text-white text-xs font-black font-sans truncate">{writer.name}</h4>
                          <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full ${checkColor} text-[8px] font-black text-white shrink-0 shadow-sm`} title="Doğrulanmış Yazar">✓</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans mt-0.5 truncate">{writer.expertise[2] || writer.expertise[0] || 'Kreatif Editör'}</p>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 whitespace-nowrap">{articles.filter(a => a.authorId === writer.id && a.status === 'Published').length || 1} Yayın</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. POPÜLER YAZILAR (GENİŞLETİLMİŞ FULL WIDTH) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                    <h3 className="text-zinc-950 dark:text-white text-base font-sans font-black uppercase tracking-wider">
                      Yazı Dizileri ve Makaleler
                    </h3>
                  </div>
                  <button onClick={() => handleNavigate('search')} className="text-zinc-500 dark:text-zinc-400 hover:text-[#0D62FE] dark:hover:text-white text-xs font-bold font-sans flex items-center gap-1 cursor-pointer transition-colors">
                    Tüm Yazılar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-stretch">
                  {popularArticles.map((art, index) => {
                    const writerProf = profiles.find(p => p.name === art.authorName || p.id === art.authorId);
                    
                    // Match colors exactly as pictured
                    let catColor = "bg-orange-600";
                    let catName = "E-TİCARET";
                    
                    if (art.categoryId === 'yapay-zeka' || art.categoryId === 'yazilim' || art.tags?.includes('yazilim') || art.title.toLowerCase().includes('yapay') || art.title.toLowerCase().includes('yazılımcı')) {
                      catColor = "bg-sky-600";
                      catName = "TEKNOLOJİ";
                    } else if (art.categoryId === 'tasarim' || art.title.toLowerCase().includes('lider')) {
                      catColor = "bg-emerald-600";
                      catName = "LİDERLİK";
                    } else if (art.id === 'orhan_article_4' || art.categoryId === 'yasam' || art.tags?.includes('girisimcilik') || art.title.toLowerCase().includes('girişim') || art.title.toLowerCase().includes('saas')) {
                      catColor = "bg-[#0D62FE]";
                      catName = "GİRİŞİMCİLİK";
                    }

                    return (
                      <div key={art.id} className="flex flex-col h-full justify-between">
                        <div 
                          onClick={() => handleNavigate('article', { id: art.id })}
                          className="bg-white dark:bg-[#060814]/60 border border-zinc-200 dark:border-white/5 rounded-3xl p-4 flex flex-col justify-between hover:border-[#0D62FE]/30 hover:shadow-lg dark:hover:shadow-none transition-all duration-300 group cursor-pointer hover:scale-[1.02] flex-1 min-h-[280px]"
                        >
                          <div className="space-y-3 flex flex-col flex-1">
                            <div className="h-32 w-full overflow-hidden rounded-2xl relative shadow-sm shrink-0">
                              <img 
                                src={art.coverImage} 
                                className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105" 
                                referrerPolicy="no-referrer"
                                onError={(e) => handleImageErrorGlobal(e, 'cover')} 
                              />
                              <span className={`absolute bottom-2.5 left-2.5 text-[7px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider text-white ${catColor}`}>
                                {catName}
                              </span>
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <h4 className="text-zinc-900 dark:text-white text-xs font-black font-sans leading-snug tracking-tight text-left line-clamp-2 pt-0.5 group-hover:text-[#0D62FE] transition-colors">
                                {art.title}
                              </h4>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-450 pt-3 border-t border-zinc-150 dark:border-white/5 mt-3 shrink-0">
                            <div className="flex items-center gap-1.5 font-sans min-w-0 flex-1">
                              <img 
                                src={writerProf?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"} 
                                className="w-4 h-4 rounded-full object-cover shrink-0" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex flex-col text-left min-w-0">
                                <span className="text-[8px] font-black text-[#FF4C1C] dark:text-[#E5C158] uppercase tracking-wide leading-none mb-0.5 whitespace-nowrap">
                                  {writerProf?.id === 'user_orhan' || art.authorId === 'user_orhan' || art.authorName === 'Orhan Balcı' ? 'Kurucu Yazar' : 'Yazar'}
                                </span>
                                <span className="font-bold text-zinc-600 dark:text-zinc-250 line-clamp-1 leading-tight text-[10px]">
                                  {writerProf?.name || art.authorName}
                                </span>
                              </div>
                            </div>
                            <Bookmark className="w-3.5 h-3.5 text-zinc-400 hover:text-[#0D62FE] transition-colors shrink-0 ml-1" />
                          </div>
                        </div>
                        <div className="text-[9.5px] text-zinc-400 dark:text-zinc-500 text-left mt-1.5 pl-2 font-sans shrink-0">
                          {art.readTime} okuma
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 4. CATEGORIES GRID (Kategorileri Keşfedin) */}
            <section id="categories-feed" className="bg-white dark:bg-zinc-950 py-16 w-full relative z-10 font-sans">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Box with rounded corners and lavender background in light mode, deep branded purple-gray in dark mode */}
                <div className="bg-[#F1F0FB] dark:bg-[#16132D]/40 border border-[#DDDDF4] dark:border-[#2B2455] rounded-[32px] p-6 sm:p-10 md:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.02)]">
                  
                  {/* Top Header Row of the box */}
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl sm:text-2xl font-sans font-black tracking-tight text-neutral-900 dark:text-zinc-100">
                      Keşfet
                    </h3>
                    <button 
                      onClick={() => {
                        handleNavigate('search');
                        playPluckSynth('click');
                      }}
                      onMouseEnter={() => playPluckSynth('hover')}
                      className="text-xs sm:text-sm font-sans font-bold text-zinc-550 dark:text-zinc-400 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border-b border-transparent hover:border-zinc-550 dark:hover:border-zinc-400 pb-0.5"
                    >
                      Tüm Konular <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Grid containing the 5 pill cards matching the user's categories */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
                    
                    {/* CARD 1: YAPAY ZEKA */}
                    {(() => {
                      const count = articles.filter(a => a.categoryId === 'yapay-zeka' && a.status === 'Published').length;
                      return (
                        <div
                          onClick={() => {
                            handleNavigate('search', { category: 'yapay-zeka' });
                            playPluckSynth('click');
                          }}
                          onMouseEnter={() => playPluckSynth('hover')}
                          className="group cursor-pointer rounded-[28px] p-5 pt-6 pb-5 flex flex-col justify-between items-center text-center transition-all duration-400 hover:scale-[1.03] hover:shadow-2xl h-[290px] sm:h-[320px] relative overflow-hidden bg-gradient-to-b from-[#0D2622] via-[#091C19] to-[#05110F] border border-teal-500/25 shadow-sm"
                        >
                          {/* Card Header Tag Row */}
                          <div className="w-full flex items-center justify-between z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-white/10 text-teal-200 border border-teal-400/30 font-sans">
                              <Sparkles className="w-2.5 h-2.5 text-teal-300" /> AI & MODELLER
                            </span>
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-teal-200 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          {/* Centerpiece: Clean Big Pure White Icon (No background, No shadow) */}
                          <div className="my-auto z-10 flex items-center justify-center py-4">
                            <Brain 
                              className="w-20 h-20 sm:w-24 sm:h-24 text-white stroke-[1.5] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" 
                            />
                          </div>

                          {/* Bottom Typography & Action */}
                          <div className="w-full z-10 pt-2 border-t border-teal-500/20">
                            <h4 className="font-sans font-black text-sm sm:text-base text-white tracking-tight leading-snug">
                              Yapay Zekâ
                            </h4>
                            <div className="flex items-center justify-between text-[11px] font-medium text-teal-200/80 mt-1">
                              <span>{count} Yazı</span>
                              <span className="font-bold text-teal-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                Keşfet →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* CARD 2: TEKNOLOJI */}
                    {(() => {
                      const count = articles.filter(a => (a.categoryId === 'temu' || a.title.toLowerCase().includes('teknoloji') || a.summary.toLowerCase().includes('teknoloji') || a.tags?.includes('teknoloji')) && a.status === 'Published').length;
                      return (
                        <div
                          onClick={() => {
                            handleNavigate('search', { query: 'teknoloji' });
                            playPluckSynth('click');
                          }}
                          onMouseEnter={() => playPluckSynth('hover')}
                          className="group cursor-pointer rounded-[28px] p-5 pt-6 pb-5 flex flex-col justify-between items-center text-center transition-all duration-400 hover:scale-[1.03] hover:shadow-2xl h-[290px] sm:h-[320px] relative overflow-hidden bg-gradient-to-b from-[#290C16] via-[#1F0910] to-[#120509] border border-rose-500/25 shadow-sm"
                        >
                          {/* Card Header Tag Row */}
                          <div className="w-full flex items-center justify-between z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-white/10 text-rose-200 border border-rose-400/30 font-sans">
                              <Zap className="w-2.5 h-2.5 text-rose-300" /> TECH & DİJİTAL
                            </span>
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-rose-200 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          {/* Centerpiece: Clean Big Pure White Icon (No background, No shadow) */}
                          <div className="my-auto z-10 flex items-center justify-center py-4">
                            <Cpu 
                              className="w-20 h-20 sm:w-24 sm:h-24 text-white stroke-[1.5] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-2" 
                            />
                          </div>

                          {/* Bottom Typography & Action */}
                          <div className="w-full z-10 pt-2 border-t border-rose-500/20">
                            <h4 className="font-sans font-black text-sm sm:text-base text-white tracking-tight leading-snug">
                              Teknoloji
                            </h4>
                            <div className="flex items-center justify-between text-[11px] font-medium text-rose-200/80 mt-1">
                              <span>{count} Yazı</span>
                              <span className="font-bold text-rose-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                Keşfet →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* CARD 3: GIRISIMCILIK */}
                    {(() => {
                      const count = articles.filter(a => ['deneyimler', 'girişimcilik', 'girisimcilik'].includes(a.categoryId) && a.status === 'Published').length;
                      return (
                        <div
                          onClick={() => {
                            handleNavigate('search', { category: 'deneyimler' });
                            playPluckSynth('click');
                          }}
                          onMouseEnter={() => playPluckSynth('hover')}
                          className="group cursor-pointer rounded-[28px] p-5 pt-6 pb-5 flex flex-col justify-between items-center text-center transition-all duration-400 hover:scale-[1.03] hover:shadow-2xl h-[290px] sm:h-[320px] relative overflow-hidden bg-gradient-to-b from-[#210D33] via-[#190926] to-[#0E0516] border border-purple-500/25 shadow-sm"
                        >
                          {/* Card Header Tag Row */}
                          <div className="w-full flex items-center justify-between z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-white/10 text-purple-200 border border-purple-400/30 font-sans">
                              <Rocket className="w-2.5 h-2.5 text-purple-300" /> GİRİŞİM & BÜYÜME
                            </span>
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-purple-200 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          {/* Centerpiece: Clean Big Pure White Icon (No background, No shadow) */}
                          <div className="my-auto z-10 flex items-center justify-center py-4">
                            <Rocket 
                              className="w-20 h-20 sm:w-24 sm:h-24 text-white stroke-[1.5] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" 
                            />
                          </div>

                          {/* Bottom Typography & Action */}
                          <div className="w-full z-10 pt-2 border-t border-purple-500/20">
                            <h4 className="font-sans font-black text-sm sm:text-base text-white tracking-tight leading-snug">
                              Girişimcilik
                            </h4>
                            <div className="flex items-center justify-between text-[11px] font-medium text-purple-200/80 mt-1">
                              <span>{count} Yazı</span>
                              <span className="font-bold text-purple-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                Keşfet →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* CARD 4: E-TICARET */}
                    {(() => {
                      const count = articles.filter(a => ['amazon', 'trendyol', 'hepsiburada', 'temu', 'etsy', 'walmart', 'e-ihracat', 'lojistik'].includes(a.categoryId) && a.status === 'Published').length;
                      return (
                        <div
                          onClick={() => {
                            handleNavigate('search', { category: 'amazon' });
                            playPluckSynth('click');
                          }}
                          onMouseEnter={() => playPluckSynth('hover')}
                          className="group cursor-pointer rounded-[28px] p-5 pt-6 pb-5 flex flex-col justify-between items-center text-center transition-all duration-400 hover:scale-[1.03] hover:shadow-2xl h-[290px] sm:h-[320px] relative overflow-hidden bg-gradient-to-b from-[#2B1408] via-[#1F0E05] to-[#120702] border border-orange-500/25 shadow-sm"
                        >
                          {/* Card Header Tag Row */}
                          <div className="w-full flex items-center justify-between z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-white/10 text-orange-200 border border-orange-400/30 font-sans">
                              <ShoppingCart className="w-2.5 h-2.5 text-orange-300" /> PAZARYERİ & E-İHRACAT
                            </span>
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-orange-200 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          {/* Centerpiece: Clean Big Pure White Icon (No background, No shadow) */}
                          <div className="my-auto z-10 flex items-center justify-center py-4">
                            <ShoppingCart 
                              className="w-20 h-20 sm:w-24 sm:h-24 text-white stroke-[1.5] transition-transform duration-300 group-hover:scale-110" 
                            />
                          </div>

                          {/* Bottom Typography & Action */}
                          <div className="w-full z-10 pt-2 border-t border-orange-500/20">
                            <h4 className="font-sans font-black text-sm sm:text-base text-white tracking-tight leading-snug">
                              E-Ticaret
                            </h4>
                            <div className="flex items-center justify-between text-[11px] font-medium text-orange-200/80 mt-1">
                              <span>{count} Yazı</span>
                              <span className="font-bold text-orange-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                Keşfet →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* CARD 5: ETKINLIKLER */}
                    {(() => {
                      const count = articles.filter(a => a.categoryId === 'etkinlikler' && a.status === 'Published').length;
                      return (
                        <div
                          onClick={() => {
                            handleNavigate('search', { category: 'etkinlikler' });
                            playPluckSynth('click');
                          }}
                          onMouseEnter={() => playPluckSynth('hover')}
                          className="group cursor-pointer rounded-[28px] p-5 pt-6 pb-5 flex flex-col justify-between items-center text-center transition-all duration-400 hover:scale-[1.03] hover:shadow-2xl h-[290px] sm:h-[320px] relative overflow-hidden bg-gradient-to-b from-[#2B2106] via-[#201804] to-[#120D02] border border-amber-500/25 shadow-sm"
                        >
                          {/* Card Header Tag Row */}
                          <div className="w-full flex items-center justify-between z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-white/10 text-amber-200 border border-amber-400/30 font-sans">
                              <Calendar className="w-2.5 h-2.5 text-amber-300" /> ZİRVE & TAKVİM
                            </span>
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-amber-200 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          {/* Centerpiece: Clean Big Pure White Icon (No background, No shadow) */}
                          <div className="my-auto z-10 flex items-center justify-center py-4">
                            <Calendar 
                              className="w-20 h-20 sm:w-24 sm:h-24 text-white stroke-[1.5] transition-transform duration-300 group-hover:scale-110" 
                            />
                          </div>

                          {/* Bottom Typography & Action */}
                          <div className="w-full z-10 pt-2 border-t border-amber-500/20">
                            <h4 className="font-sans font-black text-sm sm:text-base text-white tracking-tight leading-snug">
                              Etkinlikler
                            </h4>
                            <div className="flex items-center justify-between text-[11px] font-medium text-amber-200/80 mt-1">
                              <span>{count} Yazı</span>
                              <span className="font-bold text-amber-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                Keşfet →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              </div>
            </section>

            {/* 5. RÖPORTAJLAR (Interviews Section) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 font-sans">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                  <h3 className="text-zinc-950 dark:text-white text-base font-sans font-black uppercase tracking-wider">
                    Röportajlar
                  </h3>
                </div>
                <button onClick={() => handleNavigate('search')} className="text-zinc-500 dark:text-zinc-400 hover:text-[#0D62FE] dark:hover:text-white text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer transition-colors">
                  Tüm Röportajlar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {[
                  {
                    title: "Orhan Balcı ile E-Ticaretin Dünü, Bugünü ve Yarını",
                    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800",
                    duration: "24 dk"
                  },
                  {
                    title: "Marka Olmak mı, Faydalı Olmak mı?",
                    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
                    duration: "18 dk"
                  },
                  {
                    title: "Yazılımcıların Geleceği Üzerine Samimi Bir Sohbet",
                    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
                    duration: "21 dk"
                  }
                ].map((interview, i) => (
                  <div 
                    key={i} 
                    className="group cursor-pointer bg-zinc-900 border border-zinc-200 dark:bg-zinc-950 dark:border-white/10 rounded-xl p-5 overflow-hidden flex flex-col justify-between h-[180px] hover:shadow-2xl hover:shadow-purple-500/15 relative transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => handleNavigate('search')}
                  >
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={interview.image} 
                        alt={interview.title}
                        className="w-full h-full object-cover opacity-75 dark:opacity-80 group-hover:opacity-95 group-hover:scale-105 duration-500 transition-all" 
                        referrerPolicy="no-referrer" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
                    </div>
                    
                    <div className="z-10 flex justify-between items-start">
                      <span className="text-[8px] font-black tracking-widest text-[#F182FF] border border-[#0D62FE]/40 bg-[#0D62FE]/25 px-2.5 py-1 rounded-md uppercase font-sans">RÖPORTAJ</span>
                      <span className="text-[10px] font-mono text-zinc-300 dark:text-zinc-400">{interview.duration}</span>
                    </div>
                    
                    <div className="z-10 pt-4 flex items-end justify-between gap-4">
                      <h4 className="text-white text-sm sm:text-base font-black font-sans leading-tight line-clamp-2 mb-1 group-hover:text-amber-300 transition-colors">
                        {interview.title}
                      </h4>
                      <div className="w-9 h-9 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 flex items-center justify-center shrink-0 text-white group-hover:bg-[#0D62FE] group-hover:border-[#0D62FE] transition-all shadow-md group-hover:scale-110">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FEATURED ARTICLES (Öne Çıkanlar) */}
            {featuredArticle && (
              <section id="featured-article-region" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <div className="flex items-center gap-2.5 mb-8">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                  </span>
                  <h3 className="text-xs tracking-widest font-sans font-black text-zinc-550 dark:text-zinc-400">EDİTÖRLERİN BAŞYAPIT SEÇKİSİ</h3>
                </div>

                <div 
                  onClick={() => handleNavigate('article', { id: featuredArticle.id })}
                  onMouseEnter={() => playPluckSynth('hover')}
                  className={`group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white dark:bg-zinc-900/40 p-5 sm:p-7 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-[0_15px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:border-amber-500/40 dark:hover:border-amber-500/30 ${
                    glassBlurTheme ? 'backdrop-blur-xl' : ''
                  }`}
                >
                  <div className="lg:col-span-7 aspect-video w-full rounded-lg overflow-hidden relative shadow-md">
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-103 duration-[1200ms]"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageErrorGlobal(e, 'cover')}
                    />
                    <div className="absolute top-4 left-4 bg-zinc-950/90 text-[#E5C158] text-[9.5px] uppercase font-black tracking-widest px-3.5 py-1.5 rounded-full backdrop-blur-md border border-amber-500/25 shadow-sm">
                      Küratör Önerisi
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-5 text-left">
                    <span className="text-[10px] uppercase font-sans font-black tracking-wider text-amber-600 dark:text-amber-400">
                      {categories.find(c => c.id === featuredArticle.categoryId)?.name || 'Girişimcilik & Strateji'}
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-serif font-black text-zinc-900 dark:text-white leading-tight group-hover:text-amber-600 dark:group-hover:text-[#E5C158] transition-colors duration-300">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {featuredArticle.summary}
                    </p>
                    
                    <div className="flex items-center justify-between pt-5 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-550 dark:text-zinc-450 font-sans">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const authorProf = profiles.find(p => p.id === featuredArticle.authorId || p.name === featuredArticle.authorName);
                          const resolvedName = authorProf?.name || featuredArticle.authorName;
                          const isOrhan = authorProf?.id === 'user_orhan' || resolvedName === 'Orhan Balcı' || featuredArticle.authorId === 'user_orhan';
                          return (
                            <>
                              <div className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-600 dark:text-[#E5C158] font-bold text-[10px] flex items-center justify-center border border-amber-500/20">
                                {resolvedName.charAt(0)}
                              </div>
                              <span className="text-zinc-400 dark:text-zinc-500 font-sans">{isOrhan ? 'Kurucu Yazar:' : 'Yazar:'}</span>
                              <span className="font-bold text-zinc-700 dark:text-zinc-250">{resolvedName}</span>
                            </>
                          );
                        })()}
                      </div>
                      <span className="font-mono text-[11px] bg-zinc-50 dark:bg-zinc-850/60 px-2.5 py-1 rounded-md border border-zinc-100 dark:border-zinc-800">
                        {new Date(featuredArticle.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} • {featuredArticle.readTime} dk okuma
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}



            {/* EDITORS CHOICE HORIZONTAL BAR GRID */}
            <section id="choice-vitrine" className="bg-zinc-50 dark:bg-zinc-905 py-16 w-full border-t border-zinc-100 dark:border-zinc-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white">Ekibimizin Seçtikleri</h3>
                    <p className="text-[11px] sm:text-xs text-zinc-500 font-sans mt-1">Öğrenme odaklı derinlemesine makaleler</p>
                  </div>
                  <button onClick={() => handleNavigate('search')} className="text-xs font-bold text-gold hover:underline">Kataloga Git →</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {editorsChoiceArticles.map(a => (
                    <div
                      key={a.id}
                      onClick={() => handleNavigate('article', { id: a.id })}
                      className="group cursor-pointer bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-150/60 dark:border-zinc-800 hover:shadow-xl hover:translate-y-[-2px] transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <img src={a.coverImage} alt="" className="w-full h-40 object-cover rounded-xl" referrerPolicy="no-referrer" onError={(e) => handleImageErrorGlobal(e, 'cover')} />
                        {(() => {
                          const resolvedName = profiles.find(p => p.id === a.authorId || p.name === a.authorName)?.name || a.authorName;
                          const isOrhan = a.authorId === 'user_orhan' || resolvedName === 'Orhan Balcı';
                          return (
                            <span className="text-[9px] uppercase font-mono font-bold text-zinc-400 block">
                              {isOrhan ? 'KURUCU YAZAR: ' : 'YAZAR: '}{resolvedName}
                            </span>
                          );
                        })()}
                        <h4 className="font-serif font-bold text-sm sm:text-base text-zinc-900 dark:text-white line-clamp-2 leading-tight group-hover:underline">{a.title}</h4>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-4 mt-4 border-t border-zinc-50 dark:border-zinc-805">
                        <span>{a.readTime} dakika</span>
                        <span>{a.likes} Beğeni</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>



          </div>
        )}

        {/* VIEW B: ARTICLE DETAIL READER */}
        {currentView === 'article' && (
          (() => {
            const art = articles.find(a => a.id === viewParams.id);
            if (!art) {
              return (
                <div className="max-w-xl mx-auto py-20 text-center">
                  <p className="text-zinc-500">Aradığınız makale bulunamadı veya silinmiş.</p>
                  <button onClick={() => setCurrentView('home')} className="mt-4 bg-zinc-950 text-white text-xs px-4 py-2 rounded-xl">Ana Sayfaya Git</button>
                </div>
              );
            }
            const authP = profiles.find(p => p.id === art.authorId) || null;
            return (
              <ArticleView
                article={art}
                authorProfile={authP}
                comments={comments.filter(c => c.articleId === art.id)}
                currentUser={currentUser}
                categories={categories}
                allArticles={articles}
                series={series}
                onLikeArticle={handleLikeArticle}
                onSaveArticle={handleSaveArticle}
                onFollowAuthor={handleFollowAuthor}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onEditComment={handleEditComment}
                onNavigate={handleNavigate}
                onTriggerAuthModal={() => setShowAuthModal(true)}
              />
            );
          })()
        )}

        {/* VIEW C: WRITE & EDIT ARTICLE */}
        {currentView === 'edit_article' && (
          <Editor
            articleToEdit={viewParams.articleId ? articles.find(a => a.id === viewParams.articleId) : null}
            categories={categories}
            series={series}
            onSaveArticle={handleSaveArticleFromEditor}
            onCancel={() => handleNavigate('dashboard')}
            onAddSeries={handleAddSeries}
          />
        )}

        {/* VIEW C2: WRITE & EDIT NEWS / AGENDA */}
        {currentView === 'edit_news' && (
          <NewsEditor
            articleToEdit={viewParams.articleId ? articles.find(a => a.id === viewParams.articleId) : null}
            categories={categories}
            onSaveNews={handleSaveNews}
            onCancel={() => handleNavigate('dashboard')}
          />
        )}

        {/* VIEW D: WRITER/USER PROFILE */}
        {currentView === 'profile' && (
          (() => {
            const profileUser = profiles.find(u => u.id === viewParams.userId);
            if (!profileUser) return <div className="text-center py-20 text-zinc-500">Profil bulunamadı.</div>;

            return (
              <UserProfileView
                profileUser={profileUser}
                articles={articles}
                currentUser={currentUser}
                currentRole={currentRole}
                onNavigate={handleNavigate}
                onFollowAuthor={handleFollowAuthor}
                onShowAuthModal={setShowAuthModal}
                handleImageErrorGlobal={handleImageErrorGlobal}
                playPluckSynth={playPluckSynth}
                onUpdateProfile={(updatedProfile: UserProfile) => {
                  setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
                  saveDocToCloud('profiles', updatedProfile.id, updatedProfile);
                  setArticles(prev => prev.map(art => art.authorId === updatedProfile.id ? {
                    ...art,
                    authorName: updatedProfile.name,
                    authorAvatar: updatedProfile.avatar
                  } : art));
                  toast.success('Profil bilgileriniz güncellendi.');
                }}
              />
            );
          })()
        )}

        {/* VIEW E: ALL CATEGORIES EXPLORE LIST */}
        {currentView === 'explore' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-40 animate-in fade-in duration-200">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-serif font-bold text-zinc-950 dark:text-white tracking-tight">Tüm Kategoriler, Kanallar ve Seriler</h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-2 max-w-2xl mx-auto">WeTalks yayın direktörlüğü tarafından derlenen temel yayın kanallarını ve yazı dizisi serilerini buradan keşfedebilirsiniz.</p>
            </div>

            {/* Sıralı Yazı Dizileri Section */}
            {series && series.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm font-sans font-black text-zinc-900 dark:text-white tracking-tight py-1.5 px-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    📚 ÖNE ÇIKAN SIRALI YAZI DİZİLERİ (SERİLER)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {series.map(s => {
                    const seriesMatchingArticles = articles.filter(a => a.seriesId === s.id && a.status === 'Published');
                    if (seriesMatchingArticles.length === 0) return null;
                    const firstArticle = seriesMatchingArticles[0];

                    return (
                      <div 
                        key={s.id}
                        className="p-6 bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-850 dark:to-zinc-850/30 rounded-3xl border border-emerald-500/15 dark:border-emerald-500/10 space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">SERİ • {seriesMatchingArticles.length} BÖLÜM</span>
                            <span className="text-[9.5px] text-zinc-400 font-mono">Eklenme: {new Date(s.createdAt || firstArticle.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <h3 className="text-lg font-serif font-bold text-zinc-900 dark:text-white leading-snug">{s.title}</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 italic">{s.description}</p>
                        </div>

                        <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Mini lists inside series */}
                          <div className="flex flex-wrap gap-1 items-center">
                            {seriesMatchingArticles.slice(0, 3).map((art, idx) => (
                              <span 
                                key={art.id} 
                                onClick={() => handleNavigate('article', { id: art.id })}
                                className="text-[9.5px] bg-white dark:bg-zinc-950 px-2 py-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-150 dark:border-zinc-800 cursor-pointer max-w-[120px] truncate"
                                title={art.title}
                              >
                                {idx + 1}. {art.title}
                              </span>
                            ))}
                            {seriesMatchingArticles.length > 3 && (
                              <span className="text-[9px] text-zinc-400 font-mono pl-1">+{seriesMatchingArticles.length - 3} daha</span>
                            )}
                          </div>

                          <button
                            onClick={() => handleNavigate('article', { id: firstArticle.id })}
                            className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer hover:opacity-90 shrink-0 self-end sm:self-auto"
                          >
                            Seriye Başla →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {categories.map(cat => {
                const count = articles.filter(a => a.categoryId === cat.id && a.status === 'Published').length;
                return (
                  <div 
                    key={cat.id}
                    className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-150 dark:border-zinc-850/80 space-y-4"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="p-3 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-850 text-zinc-900 shrink-0">
                        {getCategoryIcon(cat.icon, cat.id, cat.name)}
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white capitalize">{cat.name}</h3>
                        <p className="text-xs text-zinc-450 mt-1">{cat.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                      <span className="font-mono text-zinc-400">{count} makale aktif</span>
                      <button
                        onClick={() => handleNavigate('search', { category: cat.id })}
                        className="text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        Yazıları İncele →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW: WRITERS LIST */}
        {currentView === 'writers' && (
          (() => {
            const list = profiles.filter(p => p.role === 'Writer' || p.role === 'Editor' || p.role === 'Admin');
            
            return (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-40 animate-in fade-in duration-200">
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-serif font-bold text-zinc-950 dark:text-white tracking-tight">Platform Yazarları</h2>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-2 max-w-2xl mx-auto">
                    Kendi tecrübelerini, dürüst ticari hikayelerini ve yapay zeka analizlerini paylaşan bağımsız düşünür ve uzman kadromuz.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map(writer => {
                    const writerArticles = articles.filter(a => a.authorId === writer.id && a.status === 'Published');
                    const isFollowing = currentUser?.followedAuthors.includes(writer.id) || false;

                    return (
                      <div 
                        key={writer.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Banner background */}
                          <div className="h-24 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-800/40 relative">
                            {writer.coverImage && (
                              <img 
                                src={writer.coverImage} 
                                alt="" 
                                className="w-full h-full object-cover opacity-50 dark:opacity-30"
                                referrerPolicy="no-referrer"
                                onError={(e) => handleImageErrorGlobal(e, 'cover')}
                              />
                            )}
                            <div className="absolute top-4 right-4">
                              {(() => {
                                const isOrhan = writer.id === 'user_orhan' || writer.username === 'orhanbalci' || writer.name === 'Orhan Balcı';
                                if (isOrhan) {
                                  return (
                                    <span className="text-[10px] uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50 px-2.5 py-1 rounded-full font-bold">
                                      Kurucu Yazar
                                    </span>
                                  );
                                } else {
                                  const label = writer.role === 'Admin' ? 'Kurucu Editör' : writer.role === 'Editor' ? 'Küratör Editör' : 'Yazar';
                                  return (
                                    <span className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50 px-2.5 py-1 rounded-full font-bold">
                                      {label}
                                    </span>
                                  );
                                }
                              })()}
                            </div>
                          </div>

                          {/* Profile metadata container */}
                          <div className="px-6 pb-2 relative flex flex-col">
                            {/* Avatar offset */}
                            <div className="flex justify-between items-end mb-3 mt-[-32px]">
                              <img 
                                src={writer.avatar} 
                                alt={writer.name} 
                                className="w-16 h-16 rounded-lg object-cover ring-4 ring-white dark:ring-zinc-900 shadow-md bg-zinc-100"
                                referrerPolicy="no-referrer"
                                onError={(e) => handleImageErrorGlobal(e, 'avatar')}
                              />
                              {currentUser && currentUser.id !== writer.id && (
                                <button 
                                  onClick={() => handleFollowAuthor(writer.id)}
                                  className={`text-[11px] font-sans font-bold px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
                                    isFollowing 
                                      ? 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700' 
                                      : 'bg-zinc-950 border-zinc-950 text-white hover:opacity-90 dark:bg-white dark:border-white dark:text-zinc-950 dark:hover:opacity-90'
                                  }`}
                                >
                                  {isFollowing ? '✓ Takip Ediliyor' : 'Takip Et'}
                                </button>
                              )}
                            </div>

                            <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-white leading-tight">{writer.name}</h3>
                            <span className="text-xs text-zinc-400 font-mono">@{writer.username}</span>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 line-clamp-3 leading-relaxed font-sans">{writer.bio || 'Yazar henüz biyografi eklememiş.'}</p>

                            {writer.expertise && writer.expertise.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-4">
                                {writer.expertise.map(exp => (
                                  <span key={exp} className="text-[10px] bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-100 dark:border-zinc-800/40">{exp}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer stats / buttons */}
                        <div className="p-6 pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-4 flex items-center justify-between">
                          <div className="flex gap-4 text-center">
                            <div>
                              <p className="text-xs font-bold text-zinc-900 dark:text-white">{writer.followersCount + (isFollowing ? 1 : 0)}</p>
                              <p className="text-[10px] text-zinc-400">Takipçi</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-900 dark:text-white">{writerArticles.length}</p>
                              <p className="text-[10px] text-zinc-400">Yayın</p>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleNavigate('profile', { userId: writer.id })}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            Profili İncele <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()
        )}

        {/* VIEW: SERIES LIST */}
        {currentView === 'series' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-40 animate-in fade-in duration-200">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-serif font-bold text-zinc-950 dark:text-white tracking-tight">Sıralı Yazı Dizileri</h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-2 max-w-2xl mx-auto">
                Konunun uzmanları tarafından özel olarak derlenen, birbirini takip eden ve parçalar halinde yayınlanan baş ucu serilerimiz.
              </p>
            </div>

            {series && series.length > 0 ? (
              <div className="space-y-12">
                {series.map(s => {
                  const seriesMatchingArticles = articles.filter(a => a.seriesId === s.id && a.status === 'Published');
                  if (seriesMatchingArticles.length === 0) return null;
                  const firstArticle = seriesMatchingArticles[0];

                  return (
                    <div 
                      key={s.id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl p-6 sm:p-10 shadow-sm relative overflow-hidden"
                    >
                      {/* Decorative background aura */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Series Details Left */}
                        <div className="lg:col-span-1 space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono bg-emerald-500/10 px-3 py-1 rounded-full">
                              📚 {seriesMatchingArticles.length} Bölümlük Yazı Dizisi
                            </span>
                            <h3 className="text-2xl font-serif font-bold text-zinc-900 dark:text-white leading-snug">{s.title}</h3>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">{s.description}</p>
                          </div>

                          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                            <span className="text-[11px] text-zinc-400 font-sans">
                              {firstArticle.authorId === 'user_orhan' ? 'Kurucu Yazar:' : 'Yazar:'}
                            </span>
                            <span onClick={() => handleNavigate('profile', { userId: firstArticle.authorId })} className="text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:underline cursor-pointer">
                              {profiles.find(p => p.id === firstArticle.authorId || p.name === firstArticle.authorName)?.name || firstArticle.authorName}
                            </span>
                          </div>
                        </div>

                        {/* Series Progression Right */}
                        <div className="lg:col-span-2 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-lg p-6 border border-zinc-100 dark:border-zinc-850">
                          <h4 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider mb-6 font-sans">
                            Sıralı Öğrenme Yolculuğu
                          </h4>

                          <div className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-6">
                            {seriesMatchingArticles.map((art, idx) => {
                              return (
                                <div key={art.id} className="relative">
                                  {/* Step Node */}
                                  <div className="absolute left-[-31px] top-1 w-4 h-4 bg-white dark:bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-[7.5px] font-sans font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}</span>
                                  </div>

                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-2">
                                    <div className="space-y-0.5">
                                      <h5 
                                        onClick={() => handleNavigate('article', { id: art.id })}
                                        className="text-sm font-serif font-bold text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
                                      >
                                        {art.title}
                                      </h5>
                                      <p className="text-xs text-zinc-400 dark:text-zinc-500">{art.summary}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[10px] text-zinc-400 font-mono bg-white dark:bg-zinc-950 py-0.5 px-2 rounded border border-zinc-150 dark:border-zinc-800">
                                        {art.readTime} dakika okuma
                                      </span>
                                      <button 
                                        onClick={() => handleNavigate('article', { id: art.id })}
                                        className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                                      >
                                        Oku →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-8 pt-4 border-t border-zinc-150 dark:border-zinc-800/80 flex justify-end">
                            <button
                              onClick={() => handleNavigate('article', { id: firstArticle.id })}
                              className="bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              Seriye Başla (Bölüm 1) <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-150 dark:border-zinc-850">
                  <p className="text-sm text-zinc-500">Kütüphanede tanımlanmış aktif bir yazı dizisi bulunmamaktadır.</p>
                </div>
              )}
            </div>
          )}

               {/* VIEW F1: HABERLER LANDING HOME (YAYIN TÜRÜ: HABERLER) */}
        {currentView === 'news' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-40 animate-in fade-in duration-250 w-full text-left">
            {/* Real Newspaper-Style Header & Brand Plate */}
            <div className="border-b-4 border-zinc-900 dark:border-white pb-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1 rounded-full text-zinc-700 dark:text-zinc-350 text-[10px] font-black uppercase tracking-wider mb-3">
                    <span className="w-2 h-2 rounded-full bg-[#0D62FE] animate-pulse" />
                    WETALKS GLOBAL NEWS DESK
                  </div>
                  <h2 className="text-5xl sm:text-6xl font-serif font-black text-zinc-950 dark:text-white tracking-tighter leading-none">
                    GÜNDEM & HABERLER
                  </h2>
                  <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-3 max-w-2xl leading-relaxed">
                    Yapay zeka devrimi, global e-ticaret regülasyonları, sınır ötesi lojistik ve girişimcilik ekosisteminin can damarı. Tarafsız, analitik ve derinlemesine dijital yayıncılık portalı.
                  </p>
                </div>

                {/* Date stamp and quick stats */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3">
                    <span className="text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-500 block mb-0.5 tracking-widest">SÜRÜM / TARİH</span>
                    <span className="text-xs font-sans font-black text-[#0D62FE] dark:text-[#5591FF]">23 Haziran 2026, Salı</span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 flex items-center gap-3">
                    <div>
                      <span className="text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-500 block mb-0.5 tracking-widest">RADAR SİNYALİ</span>
                      <span className="text-xs font-sans font-black text-emerald-500 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 animate-pulse" /> AKTİF YAYIN
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BREAKING NEWS TICKER (SON DAKİKA GELİŞMELERİ) */}
            <div className="bg-[#0D62FE]/8 dark:bg-[#0D62FE]/15 border border-[#0D62FE]/25 rounded-2xl px-4 py-3 mb-8 flex items-center gap-3 overflow-hidden relative h-12">
              <span className="bg-[#0D62FE] text-white text-[9px] font-black px-3 py-1 rounded-lg shrink-0 tracking-widest flex items-center gap-1 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                SON DAKİKA
              </span>
              <div className="flex-1 overflow-hidden font-sans text-xs font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap h-full flex items-center">
                <div className="inline-flex items-center h-full gap-16 animate-marquee">
                  <span className="inline-flex items-center leading-none">🚀 Ticaret Bakanlığı E-İhracat Teşviklerini %35 Oranında Artırdığını Açıkladı!</span>
                  <span className="inline-flex items-center leading-none">🤖 OpenAI, yeni nesil muhakeme odaklı "Shopping Search-Agent" entegrasyonunu sessizce yayına aldı.</span>
                  <span className="inline-flex items-center leading-none">📦 Amazon, global satıcılar için %12 komisyon indirimli yeni FBA programını duyurdu.</span>
                  <span className="inline-flex items-center leading-none">🇪🇺 AB genelinde Çin menşeili kargolar için gümrük muafiyet limitleri sınırlandırılıyor!</span>
                </div>
              </div>
            </div>

            {/* SEARCH & FILTERS PANEL (ÇOK KATMANLI PORTAL SEÇİCİ) */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-8 mb-8 border-b border-zinc-150 dark:border-zinc-800">
              {/* Category Pills specific to News topics */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', name: 'Tüm Gündem', icon: Layers },
                  { id: 'yapay-zeka', name: 'Yapay Zeka (AI)', icon: Brain },
                  { id: 'e-ticaret', name: 'E-Ticaret & Pazaryeri', icon: ShoppingBag },
                  { id: 'gundem', name: 'Global Regülasyonlar', icon: TrendingUp }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = selectedNewsCategory === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setSelectedNewsCategory(tab.id);
                        playPluckSynth('click');
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-all ${
                        isActive
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic search inside the news section */}
              <div className="relative w-full md:w-80 shrink-0">
                <input
                  type="text"
                  placeholder="Haber veya gelişme ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-[#0D62FE]/30 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 shadow-sm font-sans font-semibold"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {(() => {
              // Filters articles specifically by publicationType === 'news'
              const newsList = articles.filter(a => {
                const matchesSearch = !searchTerm.trim() || 
                  a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  a.summary.toLowerCase().includes(searchTerm.toLowerCase());
                
                const matchesCategory = selectedNewsCategory === 'all' || 
                  a.categoryId === selectedNewsCategory || 
                  a.tags.includes(selectedNewsCategory);
                  
                return a.status === 'Published' && a.publicationType === 'news' && matchesSearch && matchesCategory;
              });

              if (newsList.length === 0) {
                return (
                  <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                    <p className="text-xs sm:text-sm text-zinc-400 italic">Seçilen kategori veya arama filtresine uygun haber bulunamadı.</p>
                  </div>
                );
              }

              // Calculate front page components
              const featuredNews = newsList[0];
              const restNews = newsList.slice(1);

              // 1. Live Chronological News Wire Feed (Left column)
              const liveFeed = articles
                .filter(a => a.status === 'Published' && a.publicationType === 'news')
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 4);

              // 2. Trending news based on highest views (Right column)
              const trendingNews = articles
                .filter(a => a.status === 'Published' && a.publicationType === 'news')
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 4);

              return (
                <div className="space-y-16">
                  {/* LAYER 1: CLASSIC TRIPLE-COLUMN NEWSPAPER FRONT-PAGE GRID */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-zinc-200 dark:border-zinc-800 pb-12">
                    
                    {/* LEFT COLUMN: ANLİK RADAR / HABER AKIŞI (WIRE FEED) */}
                    <div className="lg:col-span-3 border-r border-zinc-150 dark:border-zinc-800/60 pr-6 hidden lg:flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-5">
                          <span className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-widest block border-l-2 border-emerald-500 pl-2">
                            ANLIK HABER AKIŞI
                          </span>
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        </div>
                        
                        <div className="space-y-5">
                          {liveFeed.map((item, index) => {
                            // Synthesize mock hours stamps for active feed realism
                            const timeStamps = ["14 dk önce", "1 saat önce", "3 saat önce", "5 saat önce"];
                            return (
                              <div
                                key={`feed-${item.id}`}
                                onClick={() => {
                                  handleNavigate('article', { id: item.id });
                                  playPluckSynth('click');
                                }}
                                className="group cursor-pointer block pb-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                              >
                                <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2 py-0.5 rounded">
                                  {timeStamps[index] || "Bugün"}
                                </span>
                                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 group-hover:text-[#0D62FE] dark:group-hover:text-[#5591FF] mt-1.5 transition-colors line-clamp-2 leading-snug">
                                  {item.title}
                                </h4>
                                <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-2">
                                  {item.summary}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Editorial index badge */}
                      <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-800/80 p-3.5 rounded-2xl mt-4">
                        <span className="text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-500 block mb-1">GÜNLÜK VERİ PANELİ</span>
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-zinc-500">eCommerce Index</span>
                          <span className="text-[#0D62FE] font-black">9.4 ▲</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono mt-1">
                          <span className="text-zinc-500">TR Market Interest</span>
                          <span className="text-emerald-500 font-black">8.7 ▲</span>
                        </div>
                      </div>
                    </div>

                    {/* CENTER COLUMN: BAŞ MANŞET (THE LEAD HERO) */}
                    <div className="lg:col-span-6 flex flex-col justify-between">
                      <div 
                        onClick={() => {
                          handleNavigate('article', { id: featuredNews.id });
                          playPluckSynth('click');
                        }}
                        className="group cursor-pointer block space-y-4"
                      >
                        <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-[28px] overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/60 dark:border-white/5 shadow-md">
                          <img 
                            src={getCuratedNewsCover(featuredNews)} 
                            alt={featuredNews.title} 
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-4 left-4 bg-[#FF4C1C] text-white text-[9px] uppercase font-black px-3.5 py-1.5 rounded-full border border-white/10 tracking-widest shadow-md">
                            🔥 BAŞ MANŞET HABERİ
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[9px] font-black text-[#0D62FE] dark:text-[#5591FF] uppercase tracking-widest bg-[#0D62FE]/8 dark:bg-[#0D62FE]/15 px-3 py-1 rounded-full border border-[#0D62FE]/10 font-sans">
                              {featuredNews.categoryId.toUpperCase()} GÜNDEM
                            </span>
                            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-mono font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              {featuredNews.readTime} Dk Okuma
                            </span>
                          </div>
                          
                          <h3 className="text-zinc-950 dark:text-zinc-50 text-2xl sm:text-3.5xl font-serif font-black leading-tight tracking-tight group-hover:text-[#0D62FE] dark:group-hover:text-[#5591FF] transition-colors">
                            {featuredNews.title}
                          </h3>
                          
                          <p className="text-zinc-550 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                            {featuredNews.summary}
                          </p>
                        </div>
                      </div>

                      {/* Author row & navigation info */}
                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-150 dark:border-white/5">
                        {(() => {
                          const authorProf = profiles.find(p => p.id === featuredNews.authorId || p.name === featuredNews.authorName);
                          const resolvedAvatar = authorProf?.avatar || featuredNews.authorAvatar;
                          const resolvedName = authorProf?.name || featuredNews.authorName;
                          return (
                            <div className="flex items-center gap-2.5">
                              <img src={resolvedAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-zinc-200" />
                              <div>
                                <p className="text-xs font-black text-zinc-800 dark:text-zinc-250 leading-none">{resolvedName}</p>
                                <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">WeTalks Kıdemli Muhabiri</p>
                              </div>
                            </div>
                          );
                        })()}
                        <button 
                          onClick={() => {
                            handleNavigate('article', { id: featuredNews.id });
                            playPluckSynth('click');
                          }}
                          className="bg-[#0D62FE] text-white hover:bg-opacity-90 font-bold text-[11px] px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
                        >
                          Habere Git <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: ÇOK OKUNANLAR (TRENDING COLUMN) */}
                    <div className="lg:col-span-3 border-l border-zinc-150 dark:border-zinc-800/60 pl-6 hidden lg:flex flex-col justify-start">
                      <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-4 h-4 text-[#0D62FE]" />
                        <span className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-widest block border-l-2 border-[#0D62FE] pl-2">
                          EN ÇOK OKUNANLAR
                        </span>
                      </div>

                      <div className="space-y-6">
                        {trendingNews.map((item, index) => {
                          const formattedRank = `[0${index + 1}]`;
                          return (
                            <div
                              key={`trend-${item.id}`}
                              onClick={() => {
                                handleNavigate('article', { id: item.id });
                                playPluckSynth('click');
                              }}
                              className="group cursor-pointer pb-4 border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-black text-[#0D62FE] dark:text-[#5591FF]">
                                  {formattedRank}
                                </span>
                                <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-0.5">
                                  <Eye className="w-3 h-3" /> {item.views || 0} Okuma
                                </span>
                              </div>
                              <h4 className="text-xs font-extrabold text-zinc-850 dark:text-zinc-250 group-hover:text-[#0D62FE] dark:group-hover:text-[#5591FF] mt-1.5 transition-colors line-clamp-2 leading-snug">
                                {item.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                                {(() => {
                                  const isOrhan = item.authorId === 'user_orhan' || item.authorName === 'Orhan Balcı';
                                  const resolvedName = profiles.find(p => p.id === item.authorId || p.name === item.authorName)?.name || item.authorName;
                                  return `${isOrhan ? 'Kurucu Yazar' : 'Yazar'}: ${resolvedName}`;
                                })()} • {item.readTime} dk
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* LAYER 2: INTERACTIVE WEEKLY DEBATE POLL (HAFTALIK GÜNDEM ANKETİ) */}
                  <div className="p-6 sm:p-8 bg-gradient-to-r from-zinc-50 via-zinc-100/50 to-zinc-50 dark:from-zinc-900/60 dark:via-zinc-850 dark:to-zinc-900/60 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-5 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-[#0D62FE]/8 dark:bg-[#0D62FE]/15 border border-[#0D62FE]/20 px-3 py-1 rounded-full text-[#0D62FE] dark:text-[#5591FF] text-[10px] font-black uppercase tracking-wider">
                          <MessageSquare className="w-3.5 h-3.5 animate-bounce" />
                          Haftalık Sektör Anketi
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-black text-zinc-950 dark:text-white leading-tight">
                          Yapay Zeka Asistanları, Klasik Filtreleme Motorlarını Bitirebilir mi?
                        </h3>
                        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                          Sizce OpenAI'ın geliştirdiği yeni nesil sesli ve yazılı "Shopping Search-Agent" entegrasyon modelleri, önümüzdeki 3 yıl içinde e-ticaret sitelerindeki klasik tablo ve filtreleme motorlarını tamamen tarihe gömebilir mi?
                        </p>
                      </div>

                      <div className="lg:col-span-7">
                        {!newsPollVoted ? (
                          <div className="space-y-3">
                            <button
                              onClick={() => handleNewsPollVote('yes')}
                              className="w-full flex items-center justify-between text-left p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0D62FE] dark:hover:border-[#0D62FE] hover:bg-[#0D62FE]/5 dark:hover:bg-[#0D62FE]/5 cursor-pointer font-sans font-bold text-xs transition-all text-zinc-800 dark:text-zinc-250"
                            >
                              <span>Evet, kesinlikle gömer. Yapay zeka dönemi başladı.</span>
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                              onClick={() => handleNewsPollVote('no')}
                              className="w-full flex items-center justify-between text-left p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0D62FE] dark:hover:border-[#0D62FE] hover:bg-[#0D62FE]/5 dark:hover:bg-[#0D62FE]/5 cursor-pointer font-sans font-bold text-xs transition-all text-zinc-800 dark:text-zinc-250"
                            >
                              <span>Hayır, geleneksel tablo ve filtreleme hızı vazgeçilmezdir.</span>
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </button>
                            <button
                              onClick={() => handleNewsPollVote('maybe')}
                              className="w-full flex items-center justify-between text-left p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#0D62FE] dark:hover:border-[#0D62FE] hover:bg-[#0D62FE]/5 dark:hover:bg-[#0D62FE]/5 cursor-pointer font-sans font-bold text-xs transition-all text-zinc-800 dark:text-zinc-250"
                            >
                              <span>Kısmen, hibrit asistan sistemleri ağırlık kazanır.</span>
                              <ChevronRight className="w-4 h-4 text-zinc-400" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="bg-[#0D62FE]/10 dark:bg-[#0D62FE]/20 text-[#0D62FE] dark:text-[#5591FF] p-3 rounded-2xl text-center text-xs font-extrabold tracking-tight mb-2 flex items-center justify-center gap-1.5">
                              <Check className="w-4 h-4" /> Oyunuz Kaydedildi! Katılımınız İçin Teşekkür Ederiz.
                            </div>

                            {(() => {
                              const total = newsPollVotes.yes + newsPollVotes.no + newsPollVotes.maybe;
                              const yesPct = Math.round((newsPollVotes.yes / total) * 100);
                              const noPct = Math.round((newsPollVotes.no / total) * 100);
                              const maybePct = Math.round((newsPollVotes.maybe / total) * 100);

                              return (
                                <div className="space-y-3.5 font-sans">
                                  {/* Yes bar */}
                                  <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5 text-zinc-850 dark:text-zinc-200">
                                      <span className={newsPollChoice === 'yes' ? 'text-[#0D62FE] flex items-center gap-1 font-extrabold' : ''}>
                                        {newsPollChoice === 'yes' && '✓ '}Evet, kesinlikle gömer
                                      </span>
                                      <span>{yesPct}% ({newsPollVotes.yes})</span>
                                    </div>
                                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-[#0D62FE] to-indigo-500 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${yesPct}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* No bar */}
                                  <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5 text-zinc-850 dark:text-zinc-200">
                                      <span className={newsPollChoice === 'no' ? 'text-[#0D62FE] flex items-center gap-1 font-extrabold' : ''}>
                                        {newsPollChoice === 'no' && '✓ '}Hayır, geleneksel sistemler kalır
                                      </span>
                                      <span>{noPct}% ({newsPollVotes.no})</span>
                                    </div>
                                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-zinc-400 dark:bg-zinc-600 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${noPct}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Maybe bar */}
                                  <div>
                                    <div className="flex justify-between text-xs font-bold mb-1.5 text-zinc-850 dark:text-zinc-200">
                                      <span className={newsPollChoice === 'maybe' ? 'text-[#0D62FE] flex items-center gap-1 font-extrabold' : ''}>
                                        {newsPollChoice === 'maybe' && '✓ '}Hibrit asistanlar hakim olur
                                      </span>
                                      <span>{maybePct}% ({newsPollVotes.maybe})</span>
                                    </div>
                                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                                        style={{ width: `${maybePct}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Reset & total vote counter */}
                                  <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-3">
                                    <span>Toplam Oy: {total}</span>
                                    <button
                                      onClick={handleResetNewsPoll}
                                      className="text-[#0D62FE] hover:underline cursor-pointer font-bold"
                                    >
                                      Sıfırla & Yeniden Oy Ver
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* LAYER 3: THEMED CATEGORY FOLDS (ÇOK KATMANLI ÖZEL BÖLÜMLER) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* FOLD A: YAPAY ZEKA & DERİN TEKNOLOJİ GÜNDEMİ */}
                    {(() => {
                      const aiNews = articles.filter(a => 
                        a.status === 'Published' && 
                        a.publicationType === 'news' && 
                        (a.categoryId === 'yapay-zeka' || a.tags.includes('yapay-zeka'))
                      ).slice(0, 3);

                      if (aiNews.length === 0) return null;

                      return (
                        <div className="space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30 p-6 rounded-[32px] border border-zinc-150 dark:border-zinc-800">
                          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                            <span className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-wider block flex items-center gap-1.5">
                              <Brain className="w-4 h-4 text-indigo-500" /> YAPAY ZEKA GÜNDEMİ
                            </span>
                            <span className="text-[10px] font-bold text-zinc-450 uppercase">{aiNews.length} Gelişme</span>
                          </div>

                          <div className="space-y-4">
                            {aiNews.map(item => (
                              <div
                                key={`ai-${item.id}`}
                                onClick={() => {
                                  handleNavigate('article', { id: item.id });
                                  playPluckSynth('click');
                                }}
                                className="group flex gap-4 cursor-pointer"
                              >
                                <img 
                                  src={item.coverImage} 
                                  alt="" 
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-zinc-100 dark:bg-zinc-900"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0D62FE] dark:group-hover:text-[#5591FF] leading-snug line-clamp-2">
                                    {item.title}
                                  </h4>
                                  <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1">
                                    {(() => {
                                      const resolvedName = profiles.find(p => p.id === item.authorId || p.name === item.authorName)?.name || item.authorName;
                                      const isOrhan = item.authorId === 'user_orhan' || resolvedName === 'Orhan Balcı';
                                      return `${isOrhan ? 'Kurucu Yazar' : 'Yazar'}: ${resolvedName}`;
                                    })()} • {item.readTime} Dk Okuma
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* FOLD B: GLOBAL TİCARET, REGÜLASYON & LOJİSTİK */}
                    {(() => {
                      const tradeNews = articles.filter(a => 
                        a.status === 'Published' && 
                        a.publicationType === 'news' && 
                        ['gundem', 'amazon', 'e-ihracat', 'lojistik', 'temu'].includes(a.categoryId)
                      ).slice(0, 3);

                      if (tradeNews.length === 0) return null;

                      return (
                        <div className="space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30 p-6 rounded-[32px] border border-zinc-150/80 dark:border-zinc-800">
                          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                            <span className="text-xs font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-wider block flex items-center gap-1.5">
                              <ShoppingBag className="w-4 h-4 text-emerald-500" /> GLOBAL TİCARET & LOJİSTİK
                            </span>
                            <span className="text-[10px] font-bold text-zinc-450 uppercase">{tradeNews.length} Gelişme</span>
                          </div>

                          <div className="space-y-4">
                            {tradeNews.map(item => (
                              <div
                                key={`trade-${item.id}`}
                                onClick={() => {
                                  handleNavigate('article', { id: item.id });
                                  playPluckSynth('click');
                                }}
                                className="group flex gap-4 cursor-pointer"
                              >
                                <img 
                                  src={item.coverImage} 
                                  alt="" 
                                  className="w-16 h-16 rounded-xl object-cover shrink-0 bg-zinc-100 dark:bg-zinc-900"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0D62FE] dark:group-hover:text-[#5591FF] leading-snug line-clamp-2">
                                    {item.title}
                                  </h4>
                                  <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 mt-1">
                                    {(() => {
                                      const resolvedName = profiles.find(p => p.id === item.authorId || p.name === item.authorName)?.name || item.authorName;
                                      const isOrhan = item.authorId === 'user_orhan' || resolvedName === 'Orhan Balcı';
                                      return `${isOrhan ? 'Kurucu Yazar' : 'Yazar'}: ${resolvedName}`;
                                    })()} • {item.readTime} Dk Okuma
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                  </div>

                  {/* LAYER 4: KRONOLOJİK HABER AKIŞI (CHRONOLOGICAL COMPLETE FEED) */}
                  <div className="space-y-6 pt-4">
                    <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4 flex items-center justify-between">
                      <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block border-l-2 border-[#0D62FE] pl-3">
                        KRONOLOJİK SON GELEŞMELER ({newsList.length} HABER)
                      </h3>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">En Yeniden En Eskiye Doğru Sıralıdır</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {newsList.map((art, index) => {
                        const formattedIndex = index + 1 < 10 ? `[0${index + 1}]` : `[${index + 1}]`;
                        return (
                          <div 
                            key={art.id}
                            onClick={() => {
                              handleNavigate('article', { id: art.id });
                              playPluckSynth('click');
                            }}
                            className="group relative flex items-center gap-4 p-4 rounded-3xl border border-zinc-150/80 dark:border-white/5 bg-white dark:bg-[#0c0d1b] hover:bg-blue-50/20 dark:hover:bg-[#0D62FE]/5 hover:border-[#0D62FE]/30 dark:hover:border-[#0D62FE]/30 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
                          >
                            {/* Left border highlight indicator */}
                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#0D62FE] rounded-r scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />
                            
                            {/* Thumbnail */}
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-150/30 dark:border-white/5">
                              <img 
                                src={getCuratedNewsCover(art)} 
                                alt={art.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                referrerPolicy="no-referrer"
                              />
                            </div>

                            {/* Content area */}
                            <div className="flex-1 min-w-0 pr-4 pl-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-tight">
                                  {formattedIndex}
                                </span>
                                <span className="inline-flex text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded">
                                  HABER
                                </span>
                              </div>
                              <h4 className="text-zinc-900 dark:text-zinc-50 text-sm sm:text-base font-bold sm:font-extrabold leading-snug tracking-tight group-hover:text-[#0D62FE] dark:group-hover:text-[#5591FF] transition-colors line-clamp-2">
                                {art.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-sans">
                                {(() => {
                                  const resolvedName = profiles.find(p => p.id === art.authorId || p.name === art.authorName)?.name || art.authorName;
                                  const isOrhan = art.authorId === 'user_orhan' || resolvedName === 'Orhan Balcı';
                                  return (
                                    <span className="font-semibold">
                                      {isOrhan ? 'Kurucu Yazar: ' : 'Yazar: '}{resolvedName}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Read time and action button */}
                            <div className="flex items-center gap-4 shrink-0 pr-2">
                              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                                {art.readTime} dk
                              </span>
                              <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900/60 group-hover:bg-[#0D62FE] group-hover:border-transparent group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[#0D62FE]/30 group-hover:shadow-md">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW F2: MAKALELER LANDING HOME (YAYIN TÜRÜ: MAKALELER) */}
        {currentView === 'articles' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-40 animate-in fade-in duration-250 w-full text-left">
            {/* Header section with deep design */}
            <div className="border-b border-zinc-250 dark:border-zinc-800 pb-8 mb-8">
              <div className="inline-flex items-center gap-2 bg-indigo-500/8 dark:bg-indigo-500/15 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                DÜŞÜNCE & YAŞAM REHBERLERİ
              </div>
              <h2 className="text-4xl sm:text-5xl font-serif font-extrabold text-zinc-950 dark:text-white tracking-tight">Kapsamlı Makaleler</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
                Yazarlarımızın entelektüel derinliğe, pratik tecrübelere ve rasyonel analizlere dayalı olarak kaleme aldığı düşünce yazıları ve öğreticiler.
              </p>
            </div>

            {/* Category Quick Selector Pills */}
            <div className="mb-10">
              <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 block mb-3 font-sans">KATEGORİLERE GÖRE FİLTRELE</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSearchCategoryFilter('all')}
                  className={`text-xs font-bold font-sans px-4 py-2.5 rounded-full transition-colors cursor-pointer border ${
                    searchCategoryFilter === 'all' 
                      ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950' 
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400'
                  }`}
                >
                  Tüm Kategoriler
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSearchCategoryFilter(c.id)}
                    className={`text-xs font-bold font-sans px-4 py-2.5 rounded-full transition-colors cursor-pointer border ${
                      searchCategoryFilter === c.id 
                        ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-white dark:text-zinc-950' 
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-100 dark:text-zinc-400'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Editorial Layout: Left: Articles stream, Right: Premium sidebars */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-6">
                {(() => {
                  const filteredArticles = articles.filter(a => 
                    a.status === 'Published' && 
                    a.publicationType === 'article' &&
                    (searchCategoryFilter === 'all' || a.categoryId === searchCategoryFilter)
                  );

                  if (filteredArticles.length === 0) {
                    return (
                      <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                        <p className="text-xs sm:text-sm text-zinc-400 italic">Bu kategoride henüz yayınlanmış bir makale bulunmamaktadır.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-6">
                      {filteredArticles.map(art => {
                        const displayCategory = categories.find(c => c.id === art.categoryId)?.name || 'Genel';
                        return (
                          <div 
                            key={art.id}
                            onClick={() => handleNavigate('article', { id: art.id })}
                            className="group bg-white dark:bg-[#0e101c] p-4.5 rounded-[28px] border border-zinc-200/80 dark:border-white/5 hover:border-[#0D62FE]/30 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row gap-6 items-start"
                          >
                            <div className="w-full md:w-44 h-32 shrink-0 rounded-2xl overflow-hidden relative bg-zinc-150 dark:bg-zinc-950/40">
                              <img src={art.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" referrerPolicy="no-referrer" />
                              <span className="absolute bottom-2 left-2 bg-zinc-950/90 text-white text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border border-white/15">
                                {displayCategory}
                              </span>
                            </div>

                            <div className="flex-1 flex flex-col justify-between h-full py-1">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3 text-[10px] text-zinc-450 dark:text-zinc-500 font-sans font-bold">
                                  {(() => {
                                    const resolvedName = profiles.find(p => p.id === art.authorId || p.name === art.authorName)?.name || art.authorName;
                                    const isOrhan = art.authorId === 'user_orhan' || resolvedName === 'Orhan Balcı';
                                    return (
                                      <span>
                                        {isOrhan ? 'Kurucu Yazar: ' : 'Yazar: '}{resolvedName}
                                      </span>
                                    );
                                  })()}
                                  <span>•</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {art.readTime} Dk Okuma</span>
                                </div>
                                <h3 className="text-zinc-950 dark:text-zinc-100 text-lg sm:text-xl font-extrabold leading-tight group-hover:text-[#0D62FE] dark:group-hover:text-[#5591FF] transition-colors">
                                  {art.title}
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2 font-sans font-medium">
                                  {art.summary}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0D62FE] group-hover:underline pt-4">
                                Makaleyi İncele <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Sidebar Panel */}
              <div className="lg:col-span-4 space-y-8">
                {/* Writers widget */}
                <div className="bg-zinc-50 dark:bg-[#111424] rounded-3xl p-6 border border-zinc-200/60 dark:border-white/5">
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0D62FE]" />
                    ÖNE ÇIKAN YAZARLAR
                  </h3>
                  <div className="space-y-4">
                    {profiles.filter(p => p.role === 'Writer' || p.id === 'user_orhan').slice(0, 3).map(writer => (
                      <div 
                        key={writer.id}
                        onClick={() => handleNavigate('profile', { userId: writer.id })}
                        className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img src={writer.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-zinc-200" />
                          <div>
                            <p className="text-xs font-black text-zinc-900 dark:text-white leading-tight">{writer.name}</p>
                            {(() => {
                              const isOrhan = writer.id === 'user_orhan' || writer.username === 'orhanbalci' || writer.name === 'Orhan Balcı';
                              if (isOrhan) {
                                return (
                                  <span className="text-[8.5px] uppercase tracking-wider bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50 px-1.5 py-0.5 rounded-full font-bold inline-block mt-0.5">
                                    Kurucu Yazar
                                  </span>
                                );
                              } else {
                                const label = writer.role === 'Admin' ? 'Kurucu Editör' : writer.role === 'Editor' ? 'Küratör Editör' : 'Yazar';
                                return (
                                  <span className="text-[8.5px] uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50 px-1.5 py-0.5 rounded-full font-bold inline-block mt-0.5">
                                    {label}
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        </div>
                        <button className="bg-[#0D62FE] hover:bg-[#0b54da] text-white text-[9px] font-black px-3 py-1.5 rounded-full shrink-0">TAKİP ET</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Yazı dizileri portal widget */}
                <div className="bg-zinc-50 dark:bg-[#111424] rounded-3xl p-6 border border-zinc-200/60 dark:border-white/5 space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-4 h-4 text-purple-500" />
                      YAZI DİZİLERİ
                    </h3>
                    <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mt-1">Belirli konular etrafında gruplanmış seri makale akışları.</p>
                  </div>
                  <div className="space-y-2.5">
                    {series.slice(0, 2).map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => handleNavigate('series')}
                        className="p-3 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-150 dark:border-zinc-800 hover:border-purple-500/40 cursor-pointer transition-all flex flex-col justify-between"
                      >
                        <p className="text-[10px] font-extrabold text-purple-600 uppercase tracking-widest">{s.categoryName}</p>
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white mt-1 leading-tight">{s.title}</h4>
                        <span className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-2 block">{s.articlesCount} Derin Makale</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW F3: RÖPORTAJLAR LANDING HOME (YAYIN TÜRÜ: RÖPORTAJLAR) */}
        {currentView === 'interviews' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-40 animate-in fade-in duration-250 w-full text-left">
            {/* Header section */}
            <div className="border-b border-zinc-250 dark:border-zinc-800 pb-8 mb-10">
              <div className="inline-flex items-center gap-2 bg-rose-500/8 dark:bg-rose-500/15 border border-rose-500/20 px-3 py-1 rounded-full text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider mb-3">
                <MessageSquare className="w-3.5 h-3.5" />
                ÖZEL SÖYLEŞİLER & PODCAST
              </div>
              <h2 className="text-4xl sm:text-5xl font-serif font-extrabold text-zinc-950 dark:text-white tracking-tight">Soru & Cevap Röportajları</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
                Teknoloji devlerinden, öncü girişimcilerden ve vizyoner yaratıcılardan birebir WeTalks söyleşileri. İlham verici kariyer yolculukları ve içgörüler.
              </p>
            </div>

            {/* Quote Spotlight Banner Card */}
            <div className="bg-zinc-50 dark:bg-[#121323] border border-zinc-200 dark:border-zinc-800/80 rounded-[32px] p-6 sm:p-8 mb-12 flex flex-col md:flex-row gap-6 sm:gap-8 items-center relative overflow-hidden">
              <div className="absolute right-0 top-0 w-44 h-44 bg-rose-500/5 rounded-full blur-[60px]" />
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center shrink-0 text-3xl font-serif font-extrabold italic select-none">
                “
              </div>
              <div className="space-y-3.5 flex-1">
                <span className="text-[10px] font-extrabold uppercase text-rose-500 tracking-wider font-sans">HAFTANIN RÖPORTAJ ALINTISI</span>
                <blockquote className="text-sm sm:text-base font-serif font-black text-zinc-900 dark:text-zinc-50 italic leading-relaxed">
                  "Sürekli değişen dijital pazar kuralları arasında kaybolmamak için tek formül: Kendi markanızı bir kabile gibi inşa etmek ve müşterilerle aracı olmadan doğrudan konuşmaktır."
                </blockquote>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  — <span className="text-[#0D62FE]">Orhan Balcı</span>, WeTalks Baş Editörü & E-Ticaret Kurucusu
                </p>
              </div>
            </div>

            {/* Interviews Grid */}
            {(() => {
              const interviewsList = articles.filter(a => a.status === 'Published' && a.publicationType === 'interview');

              if (interviewsList.length === 0) {
                return (
                  <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                    <p className="text-xs sm:text-sm text-zinc-400 italic">Henüz yayınlanmış röportaj bulunmamaktadır.</p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {interviewsList.map(art => {
                    return (
                      <div 
                        key={art.id}
                        onClick={() => handleNavigate('article', { id: art.id })}
                        className="group bg-white dark:bg-[#111221] rounded-[32px] overflow-hidden border border-zinc-250/70 dark:border-white/5 hover:border-rose-500/20 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                      >
                        <div className="p-6 sm:p-8 space-y-4">
                          <div className="aspect-[16/9] rounded-2.5xl overflow-hidden bg-zinc-150 relative">
                            <img src={art.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <span className="absolute bottom-3 left-3 bg-rose-600 text-white text-[9px] uppercase font-black px-3.5 py-1 rounded-full border border-white/10 tracking-wider">
                              🎙️ EXCLUSIVE SÖYLEŞİ
                            </span>
                          </div>

                          {(() => {
                            const resolvedName = profiles.find(p => p.id === art.authorId || p.name === art.authorName)?.name || art.authorName;
                            const isOrhan = art.authorId === 'user_orhan' || resolvedName === 'Orhan Balcı';
                            return (
                              <span className="text-[10px] uppercase font-bold text-zinc-450 block font-sans">
                                {isOrhan ? 'KONUK (KURUCU YAZAR): ' : 'KONUK (YAZAR): '}{resolvedName}
                              </span>
                            );
                          })()}
                          <h3 className="text-zinc-950 dark:text-zinc-50 text-xl font-black font-sans leading-tight group-hover:text-rose-500 transition-colors">
                            {art.title}
                          </h3>
                          <p className="text-zinc-550 dark:text-zinc-400 text-xs leading-relaxed line-clamp-3 italic font-serif">
                            "{art.summary}"
                          </p>
                        </div>

                        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-150 dark:border-white/5 flex items-center justify-between text-xs font-bold text-rose-500">
                          <span className="text-zinc-450 dark:text-zinc-500 font-sans">Okuma süresi: {art.readTime} dakika</span>
                          <span className="group-hover:underline flex items-center gap-1.5">Söyleşiyi Başlat <ArrowRight className="w-4 h-4" /></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* VIEW F4: ETKİNLİKLER LANDING HOME (YAYIN TÜRÜ: ETKİNLİKLER) */}
        {currentView === 'events' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-40 animate-in fade-in duration-250 w-full text-left">
            {/* Header section with deep design */}
            <div className="border-b border-zinc-250 dark:border-zinc-800 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/8 dark:bg-amber-500/15 border border-amber-500/20 px-3 py-1 rounded-full text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  YAKLAŞAN ETKİNLİKLER VE NETWORKING
                </div>
                <h2 className="text-4xl sm:text-5xl font-serif font-extrabold text-zinc-950 dark:text-white tracking-tight">Etkinlik Takvimi</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl leading-relaxed">
                  Fiziksel panellerimiz, online webinarlarımız ve her ay düzenli gerçekleşen WeTalks Maslak buluşmaları ile ekosistemin nabzını tutun.
                </p>
              </div>

              {/* TABS Switcher (Takvim vs Yaklaşan Etkinlikler Listesi) */}
              <div className="flex bg-zinc-100 dark:bg-zinc-900/65 p-1 rounded-2xl border border-zinc-200/50 dark:border-white/5 shrink-0 self-start md:self-auto select-none">
                <button
                  onClick={() => { setEventActiveTab('calendar'); playPluckSynth('click'); }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    eventActiveTab === 'calendar'
                      ? 'bg-white dark:bg-[#0c0d1b] text-zinc-950 dark:text-white shadow-sm font-black'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Takvim
                </button>
                <button
                  onClick={() => { setEventActiveTab('upcoming'); playPluckSynth('click'); }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    eventActiveTab === 'upcoming'
                      ? 'bg-white dark:bg-[#0c0d1b] text-zinc-950 dark:text-white shadow-sm font-black'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Yaklaşan Etkinlikler
                </button>
              </div>
            </div>

            {/* TAB CONTENT */}
            {eventActiveTab === 'calendar' ? (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Modern Classic Calendar Picker Grid */}
                <div className="bg-white dark:bg-[#0e0f1d] rounded-3xl border border-zinc-200/80 dark:border-white/5 shadow-md overflow-hidden">
                  
                  {/* Calendar Top Header Controls */}
                  <div className="flex items-center justify-between p-5 border-b border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-[#111225]/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-100">
                          {(() => {
                            const TURKISH_MONTHS = [
                              'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                              'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
                            ];
                            return `${TURKISH_MONTHS[calMonth]} ${calYear}`;
                          })()}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">AYLIK GÖRÜNÜM</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer text-zinc-600 dark:text-zinc-350"
                        title="Önceki Ay"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCalMonth(6);
                          setCalYear(2026);
                          setSelectedCalDayEvent(null);
                          playPluckSynth('click');
                        }}
                        className="px-3 py-1.5 text-[11px] font-black hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-all cursor-pointer text-zinc-600 dark:text-zinc-350"
                      >
                        Temmuz 2026
                      </button>
                      <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer text-zinc-600 dark:text-zinc-350"
                        title="Sonraki Ay"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid Container */}
                  <div className="p-4">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 text-center font-sans text-xs font-extrabold text-zinc-400 dark:text-zinc-500 tracking-wider pb-3 border-b border-zinc-150 dark:border-zinc-800/40">
                      {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => (
                        <div key={day} className="truncate px-1">
                          <span className="hidden sm:inline">{day}</span>
                          <span className="sm:hidden">{day.slice(0, 3)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Day Cells Grid */}
                    <div className="grid grid-cols-7 gap-1.5 mt-3">
                      {(() => {
                        // Days calculation logic
                        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                        const firstDayDate = new Date(calYear, calMonth, 1);
                        let firstDayIndex = firstDayDate.getDay(); // 0 = Sunday, 1 = Monday...
                        const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

                        const prevMonthDays = new Date(calYear, calMonth, 0).getDate();
                        const cells = [];

                        // 1. Previous month cells
                        for (let i = startOffset - 1; i >= 0; i--) {
                          cells.push({
                            day: prevMonthDays - i,
                            month: calMonth === 0 ? 11 : calMonth - 1,
                            year: calMonth === 0 ? calYear - 1 : calYear,
                            isCurrentMonth: false,
                          });
                        }

                        // 2. Current month cells
                        for (let i = 1; i <= daysInMonth; i++) {
                          cells.push({
                            day: i,
                            month: calMonth,
                            year: calYear,
                            isCurrentMonth: true,
                          });
                        }

                        // 3. Next month cells
                        const totalCells = cells.length;
                        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                        for (let i = 1; i <= remaining; i++) {
                          cells.push({
                            day: i,
                            month: calMonth === 11 ? 0 : calMonth + 1,
                            year: calMonth === 11 ? calYear + 1 : calYear,
                            isCurrentMonth: false,
                          });
                        }

                        return cells.map((cell, idx) => {
                          const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                          const isToday = cell.day === 23 && cell.month === 5 && cell.year === 2026; // June 23, 2026

                          // Find all events active on this date range
                          const dayEvents = calendarEvents.filter(evt => {
                            const startCompare = new Date(evt.date);
                            startCompare.setHours(0,0,0,0);
                            const endCompare = new Date(startCompare);
                            endCompare.setDate(startCompare.getDate() + (evt.durationDays || 1) - 1);
                            endCompare.setHours(23,59,59,999);

                            const cellDate = new Date(cell.year, cell.month, cell.day);
                            return cellDate >= startCompare && cellDate <= endCompare;
                          });

                          return (
                            <div
                              key={`${dateStr}-${idx}`}
                              onClick={() => {
                                if (dayEvents.length > 0) {
                                  setSelectedCalDayEvent(dayEvents[0]);
                                  playPluckSynth('click');
                                }
                              }}
                              className={`min-h-[90px] sm:min-h-[115px] p-2 rounded-2xl border flex flex-col justify-between transition-all duration-200 select-none ${
                                cell.isCurrentMonth
                                  ? 'bg-zinc-50/20 dark:bg-[#0c0d1b]/35 border-zinc-200/60 dark:border-white/5'
                                  : 'bg-zinc-100/10 dark:bg-zinc-900/10 border-transparent opacity-45'
                              } ${
                                dayEvents.length > 0
                                  ? 'hover:border-amber-500/30 cursor-pointer shadow-xs bg-amber-500/2 dark:bg-amber-500/2'
                                  : 'hover:border-zinc-300 dark:hover:border-zinc-800'
                              }`}
                            >
                              {/* Cell Header: Day Number and indicators */}
                              <div className="flex items-center justify-between">
                                <span
                                  className={`text-[11.5px] sm:text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${
                                    isToday
                                      ? 'bg-amber-500 text-white font-black shadow-sm'
                                      : cell.isCurrentMonth
                                        ? 'text-zinc-800 dark:text-zinc-200'
                                        : 'text-zinc-400 dark:text-zinc-650'
                                  }`}
                                >
                                  {cell.day}
                                </span>
                                {dayEvents.length > 0 && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                )}
                              </div>

                              {/* Stacked Event Bars (Lines representing duration) */}
                              <div className="space-y-1.5 mt-2 flex-1 flex flex-col justify-end">
                                {dayEvents.map(evt => {
                                  const isStart = dateStr === evt.date;
                                  
                                  const startDateObj = new Date(evt.date);
                                  const duration = evt.durationDays || 1;
                                  const endDateObj = new Date(startDateObj);
                                  endDateObj.setDate(startDateObj.getDate() + duration - 1);
                                  const endStr = `${endDateObj.getFullYear()}-${String(endDateObj.getMonth() + 1).padStart(2, '0')}-${String(endDateObj.getDate()).padStart(2, '0')}`;
                                  const isEnd = dateStr === endStr;

                                  // Choose color based on event ID
                                  let colorClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
                                  if (evt.id === 'evt-2') colorClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
                                  if (evt.id === 'evt-3') colorClass = 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20';
                                  if (evt.id === 'evt-4') colorClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';

                                  return (
                                    <div
                                      key={evt.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCalDayEvent(evt);
                                        playPluckSynth('click');
                                      }}
                                      className={`border-y text-[9.5px] sm:text-[10.5px] font-sans font-black px-1.5 py-0.5 leading-none transition-all hover:brightness-105 select-none truncate ${colorClass} ${
                                        duration > 1
                                          ? `${isStart ? 'rounded-l-lg border-l ml-0.5' : ''} ${isEnd ? 'rounded-r-lg border-r mr-0.5' : ''} ${!isStart && !isEnd ? 'rounded-none border-x-0 mx-0' : ''}`
                                          : 'rounded-lg border'
                                      }`}
                                      title={`${evt.title} (${evt.organizer})`}
                                    >
                                      {/* Show title only on start day or in single-day events */}
                                      {(isStart || duration === 1) ? (
                                        <span className="truncate block font-extrabold">{evt.title.slice(0, 16)}...</span>
                                      ) : (
                                        <div className="h-2 w-full flex items-center justify-center opacity-65">
                                          <div className="h-0.5 w-full bg-current/45 rounded-full" />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Selected Day Event Drawer / Detail View */}
                {selectedCalDayEvent ? (
                  <div className="bg-amber-500/5 dark:bg-amber-500/10 rounded-3xl p-6 border border-amber-500/20 animate-in slide-in-from-bottom duration-300 relative">
                    <button
                      onClick={() => setSelectedCalDayEvent(null)}
                      className="absolute top-4 right-4 text-xs font-black text-zinc-450 dark:text-zinc-550 hover:text-zinc-700 dark:hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 cursor-pointer"
                    >
                      Kapat ✕
                    </button>
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-500/20">
                            SEÇİLEN ETKİNLİK
                          </span>
                          <span className="text-zinc-400 dark:text-zinc-500 text-xs font-bold font-mono">
                            🗓️ {new Date(selectedCalDayEvent.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {selectedCalDayEvent.durationDays && selectedCalDayEvent.durationDays > 1 && ` - ${selectedCalDayEvent.durationDays} Gün Sürecek`}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-zinc-900 dark:text-white leading-tight">
                          {selectedCalDayEvent.title}
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-350 text-xs sm:text-sm leading-relaxed">
                          {selectedCalDayEvent.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500 dark:text-zinc-450 font-sans font-bold pt-2">
                          <span className="flex items-center gap-1.5">⏰ Başlangıç Saati: {selectedCalDayEvent.time}</span>
                          <span className="flex items-center gap-1.5">📍 Yer: {selectedCalDayEvent.location}</span>
                          <span className="flex items-center gap-1.5">👤 Düzenleyen: {selectedCalDayEvent.organizer}</span>
                        </div>
                      </div>

                      <div className="shrink-0 w-full sm:w-auto pt-4 md:pt-0">
                        <button
                          onClick={() => {
                            playPluckSynth('click');
                            const isReg = registeredEvents.includes(selectedCalDayEvent.id);
                            if (isReg) {
                              setRegisteredEvents(prev => prev.filter(id => id !== selectedCalDayEvent.id));
                              toast.info(`"${selectedCalDayEvent.title}" etkinliği takvimden çıkarıldı.`);
                            } else {
                              setRegisteredEvents(prev => [...prev, selectedCalDayEvent.id]);
                              toast.success(`Kayıt Başarılı! "${selectedCalDayEvent.title}" etkinliği takviminize eklendi. 🗓️`);
                            }
                          }}
                          className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-200 shadow-md cursor-pointer ${
                            registeredEvents.includes(selectedCalDayEvent.id)
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950'
                          }`}
                        >
                          {registeredEvents.includes(selectedCalDayEvent.id) ? '✓ TAKVİME EKLENDİ (KAYIT TAMAM)' : 'BU ETKİNLİĞE KAYDOL'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-zinc-50/50 dark:bg-[#0c0d1b]/20 border border-dashed border-zinc-200 dark:border-white/5 rounded-3xl">
                    <p className="text-xs sm:text-sm text-zinc-450 italic font-medium">
                      Takvim üzerinde renkli bir etkinliğe tıklayarak detaylı bilgileri görüntüleyebilir ve hemen kaydolabilirsiniz. ⚡
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Upcoming Events list view */}
                <h3 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-widest block mb-1">
                  YAKLAŞAN PLANLI ETKİNLİKLER ({calendarEvents.length})
                </h3>
                
                {calendarEvents.length === 0 ? (
                  <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                    <p className="text-xs sm:text-sm text-zinc-400 italic">Planlanmış aktif bir etkinlik bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {calendarEvents.map((evt, idx) => {
                      const isRegistered = registeredEvents.includes(evt.id);
                      const parsedDate = new Date(evt.date);
                      const day = parsedDate.getDate();
                      const monthStr = parsedDate.toLocaleString('tr-TR', { month: 'short' }).toUpperCase();

                      return (
                        <div 
                          key={evt.id}
                          className="bg-white dark:bg-[#0e0f1d] rounded-3xl p-5 sm:p-6 border border-zinc-200/80 dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-amber-500/20 transition-all duration-300"
                        >
                          {/* Left date block */}
                          <div className="flex items-center gap-4.5 shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex flex-col items-center justify-center font-sans shrink-0 border border-amber-500/20">
                              <span className="text-xl font-black leading-none">{day}</span>
                              <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider">{monthStr}</span>
                            </div>
                            <div className="h-10 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                            <div>
                              <span className="inline-block text-[9px] font-extrabold uppercase text-[#0D62FE] dark:text-[#5591FF] tracking-widest mb-1">{evt.organizer} Sunar</span>
                              <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">{evt.title}</h4>
                            </div>
                          </div>

                          {/* Middle detailed stats */}
                          <div className="flex-1 md:px-8 space-y-1.5">
                            <p className="text-zinc-555 dark:text-zinc-400 text-xs leading-relaxed line-clamp-2">
                              {evt.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] sm:text-xs text-zinc-450 dark:text-zinc-500 font-sans font-bold font-mono">
                              <span className="flex items-center gap-1">⏰ {evt.time}</span>
                              <span className="flex items-center gap-1">📍 {evt.location}</span>
                              {evt.durationDays && evt.durationDays > 1 && (
                                <span className="flex items-center gap-1 text-amber-500">🗓️ {evt.durationDays} Gün Sürecek</span>
                              )}
                            </div>
                          </div>

                          {/* Right Interactive CTA */}
                          <div className="shrink-0 w-full sm:w-auto">
                            <button
                              onClick={() => {
                                playPluckSynth('click');
                                if (isRegistered) {
                                  setRegisteredEvents(prev => prev.filter(id => id !== evt.id));
                                  toast.info(`"${evt.title}" etkinliği takvimden çıkarıldı.`);
                                } else {
                                  setRegisteredEvents(prev => [...prev, evt.id]);
                                  toast.success(`Kayıt Başarılı! "${evt.title}" etkinliği takviminize eklendi. 🗓️`);
                                }
                              }}
                              className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                                isRegistered 
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                                  : 'bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 shadow-md'
                              }`}
                            >
                              {isRegistered ? '✓ KAYDINIZ ALINDI (TAKAVİME EKLENDİ)' : 'KAYIT OL VE KATIL'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* PAST HIGHLIGHT GALLERY */}
            <div className="pt-10 mt-10 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-6">WEETALKS TAMAMLANAN PANEL ARŞİVİ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.filter(a => a.status === 'Published' && (a.categoryId === 'etkinlikler' || a.publicationType === 'event')).map(art => (
                  <div 
                    key={art.id}
                    onClick={() => handleNavigate('article', { id: art.id })}
                    className="group bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-2.5xl border border-zinc-200/50 dark:border-zinc-800/40 hover:shadow-xl hover:translate-y-[-2px] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      <div className="aspect-video w-full rounded-xl overflow-hidden relative bg-zinc-150">
                        <img src={art.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" referrerPolicy="no-referrer" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-450 dark:text-zinc-500">TAMAMLANDI • PANEL RAPORU</span>
                      <h4 className="font-serif font-bold text-sm text-zinc-900 dark:text-white leading-tight group-hover:underline line-clamp-2">{art.title}</h4>
                      <p className="text-zinc-500 text-[11.5px] line-clamp-2 leading-relaxed font-medium font-sans">{art.summary}</p>
                    </div>
                    <div className="text-[10.5px] font-bold text-[#0D62FE] pt-4 mt-4 border-t border-zinc-150 dark:border-zinc-800/50 flex items-center justify-between">
                      {(() => {
                        const resolvedName = profiles.find(p => p.id === art.authorId || p.name === art.authorName)?.name || art.authorName;
                        const isOrhan = art.authorId === 'user_orhan' || resolvedName === 'Orhan Balcı';
                        return (
                          <span>
                            {isOrhan ? 'Kurucu Yazar ' : 'Yazar '}{resolvedName} Yazdı
                          </span>
                        );
                      })()}
                      <span className="group-hover:underline flex items-center gap-1">Raporu Oku <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW G: DEEP MODULAR DASHBOARDS PANEL */}
        {currentView === 'dashboard' && (
          <Dashboard
            currentRole={currentRole}
            currentUser={currentUser}
            allUsers={profiles}
            allArticles={articles}
            categories={categories}
            comments={comments}
            notifications={notifications.filter(n => n.userId === currentUser?.id)}
            onUpdateUserRole={handleUpdateUserRole}
            onModifyArticleStatus={handleModifyArticleStatus}
            onDeleteArticle={handleDeleteArticle}
            onAddCategory={handleAddCategory}
            onNavigate={handleNavigate}
            onSaveArticle={handleSaveArticleFromEditor}
            settings={settings}
            calendarEvents={calendarEvents}
            onUpdateCalendarEvents={setCalendarEvents}
          />
        )}

        {/* VIEW H: EXTERNAL COMPREHENSIVE ADMINISTRATIVE CONTROL PANEL */}
        {currentView === 'system_admin' && currentRole === 'Admin' && (
          <AdminPanel
            settings={settings}
            onUpdateSettings={setSettings}
            articles={articles}
            profiles={profiles}
            categories={categories}
            onResetDatabase={handleResetDatabase}
            onImportDatabase={handleImportDatabase}
            onExportDatabase={handleExportDatabase}
            onClose={() => setCurrentView('home')}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onModifyArticleStatus={handleModifyArticleStatus}
            notifications={notifications}
            onMarkNotificationRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))}
            onMarkAllNotificationsRead={() => setNotifications(prev => prev.map(n => n.userId === currentUser?.id || n.userId === 'user_orhan' ? { ...n, isRead: true } : n))}
            onUpdateUserRole={handleUpdateUserRole}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {/* VIEW I: WETALKS INSIGHTS LANDING PAGE */}
        {currentView === 'insights' && (
          <InsightsLanding onNavigate={handleNavigate} lang={lang} profiles={profiles} showExploreProjectButton={settings.showExploreProjectButton !== false} />
        )}

        {/* VIEW J: PRIVACY POLICY */}
        {currentView === 'privacy' && (
          <PrivacyPolicy onNavigate={handleNavigate} />
        )}

        {/* VIEW K: TERMS OF SERVICE */}
        {currentView === 'terms' && (
          <TermsOfService onNavigate={handleNavigate} />
        )}

              </>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Footer Segment Bar */}
      {currentView !== 'insights' && (
        <Footer onNavigate={handleNavigate} playPluckSynth={playPluckSynth} settings={settings} />
      )}

      {/* 4. Production Authentication Modal Dialog */}
      {showAuthModal && (
        <div id="auth-modal-dialog" className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-250 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[85vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 scrollbar-none">
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthError('');
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 bg-[#0D62FE]/10 text-[#0D62FE] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">
                Giriş Yap
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                WeTalks ile yazıları takip edin, beğenin ve editoryal içeriğe erişin.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
                className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                  authModalMode === 'login'
                    ? 'border-[#0D62FE] text-[#0D62FE]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
                className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                  authModalMode === 'register'
                    ? 'border-[#0D62FE] text-[#0D62FE]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Kayıt Ol
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('forgot');
                  setAuthError('');
                  setAuthSuccessMsg('');
                }}
                className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                  authModalMode === 'forgot'
                    ? 'border-[#0D62FE] text-[#0D62FE]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                Şifremi Unuttum
              </button>
            </div>

            {/* Quick Google Sign In */}
            {false && authModalMode !== 'forgot' && (
              <div className="mb-4">
                <button
                  type="button"
                  disabled={isAuthenticating}
                  onClick={async () => {
                    setIsAuthenticating(true);
                    setAuthError('');
                    try {
                      const res = await signInWithPopup(auth, googleProvider);
                      const user = res.user;
                      const tokenResult = await user.getIdTokenResult();
                      const role = extractRoleFromClaims(tokenResult);
                      setCurrentRole(role);
                      setFirebaseUser(user);

                      // Ensure user profile exists in PostgreSQL
                      const existing = profiles.find(p => p.id === user.uid || (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase()));
                      if (!existing) {
                        const newProfile: UserProfile = {
                          id: user.uid,
                          username: user.email?.split('@')[0] || 'kullanici',
                          name: user.displayName || user.email?.split('@')[0] || 'Kullanıcı',
                          email: user.email || '',
                          avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=0D62FE&color=fff`,
                          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
                          bio: 'WeTalks Okuru.',
                          expertise: [],
                          socials: {},
                          followersCount: 0,
                          articlesCount: 0,
                          role: 'Reader',
                          followedAuthors: [],
                          savedArticles: [],
                          likedArticles: []
                        };
                        setProfiles(prev => [...prev, newProfile]);
                        saveDocToCloud('profiles', newProfile.id, newProfile);
                      }
                      setShowAuthModal(false);
                      toast.success(`Hoş geldiniz, ${user.displayName || 'okurumuz'}!`);
                    } catch (gErr: any) {
                      console.error('[Google Sign In]', gErr);
                      setAuthError('Google ile oturum açılamadı: ' + (gErr.message || ''));
                    } finally {
                      setIsAuthenticating(false);
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google ile Devam Et</span>
                </button>
                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <span className="relative bg-white dark:bg-zinc-900 px-3 text-[10px] uppercase font-bold text-zinc-400">
                    veya e-posta ile
                  </span>
                </div>
              </div>
            )}

            {authSuccessMsg && (
              <div className="p-3 mb-4 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                {authSuccessMsg}
              </div>
            )}

            {authError && (
              <div className="p-3 mb-4 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
                {authError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsAuthenticating(true);
                setAuthError('');
                setAuthSuccessMsg('');

                if (authModalMode === 'forgot') {
                  if (!authEmail.trim()) {
                    setAuthError('Lütfen e-posta adresinizi girin.');
                    setIsAuthenticating(false);
                    return;
                  }
                  try {
                    await sendPasswordResetEmail(auth, authEmail.trim());
                    setAuthSuccessMsg('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
                    toast.success('Şifre sıfırlama bağlantısı gönderildi.');
                  } catch (err: any) {
                    setAuthError('Şifre sıfırlama hatası: ' + (err.message || 'Lütfen bilgilerinizi kontrol edin.'));
                  } finally {
                    setIsAuthenticating(false);
                  }
                  return;
                }

                if (!authEmail.trim() || !authPassword.trim()) {
                  setAuthError('Lütfen e-posta ve şifrenizi girin.');
                  setIsAuthenticating(false);
                  return;
                }

                if (authModalMode === 'register') {
                  if (!authName.trim()) {
                    setAuthError('Lütfen adınızı ve soyadınızı girin.');
                    setIsAuthenticating(false);
                    return;
                  }
                  try {
                    const cred = await createUserWithEmailAndPassword(auth, authEmail.trim(), authPassword);
                    const user = cred.user;
                    const newProfile: UserProfile = {
                      id: user.uid,
                      username: authEmail.split('@')[0],
                      name: authName.trim(),
                      email: user.email || authEmail.trim(),
                      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authName.trim())}&background=0D62FE&color=fff`,
                      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
                      bio: 'WeTalks Okuru.',
                      expertise: [],
                      socials: {},
                      followersCount: 0,
                      articlesCount: 0,
                      role: 'Reader',
                      followedAuthors: [],
                      savedArticles: [],
                      likedArticles: []
                    };
                    setProfiles(prev => [...prev, newProfile]);
                    saveDocToCloud('profiles', newProfile.id, newProfile);
                    setCurrentRole('Reader');
                    setFirebaseUser(user);
                    setShowAuthModal(false);
                    toast.success(`Aramıza hoş geldiniz, ${authName}!`);
                  } catch (err: any) {
                    if (err.code === 'auth/email-already-in-use') {
                      setAuthError('Bu e-posta adresi ile zaten bir hesap mevcut.');
                    } else if (err.code === 'auth/weak-password') {
                      setAuthError('Şifreniz en az 6 karakter olmalıdır.');
                    } else {
                      setAuthError('Kayıt başarısız: ' + (err.message || 'Lütfen bilgilerinizi kontrol edin.'));
                    }
                  } finally {
                    setIsAuthenticating(false);
                  }
                  return;
                }

                // Default: Login Mode
                try {
                  const cred = await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
                  const tokenResult = await cred.user.getIdTokenResult();
                  const role = extractRoleFromClaims(tokenResult);
                  setCurrentRole(role);
                  setFirebaseUser(cred.user);
                  setShowAuthModal(false);
                  setAuthEmail('');
                  setAuthPassword('');
                  setAuthError('');
                  toast.success('Başarıyla giriş yapıldı.');
                } catch (err: any) {
                  if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                    setAuthError('Geçersiz e-posta veya şifre.');
                  } else if (err.code === 'auth/invalid-email') {
                    setAuthError('Lütfen geçerli bir e-posta adresi girin.');
                  } else if (err.code === 'auth/too-many-requests') {
                    setAuthError('Çok fazla başarısız deneme yapıldı. Lütfen biraz sonra tekrar deneyin.');
                  } else {
                    setAuthError('Giriş başarısız oldu: ' + (err.message || 'Lütfen bilgilerinizi kontrol edin.'));
                  }
                } finally {
                  setIsAuthenticating(false);
                }
              }}
              className="space-y-3.5"
            >
              {authModalMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                    Adınız Soyadınız
                  </label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Ahmet Yılmaz"
                    required
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0D62FE]/30 focus:border-[#0D62FE]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                  E-Posta Adresi
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="ornek@wetalks.tr"
                  required
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0D62FE]/30 focus:border-[#0D62FE]"
                />
              </div>

              {authModalMode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-sans">
                    Şifre
                  </label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0D62FE]/30 focus:border-[#0D62FE]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full mt-2 py-3 bg-[#0D62FE] hover:bg-[#0050E6] disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isAuthenticating
                  ? 'İşleniyor...'
                  : authModalMode === 'register'
                  ? 'Hesap Oluştur'
                  : authModalMode === 'forgot'
                  ? 'Sıfırlama Linki Gönder'
                  : 'Giriş Yap'}
              </button>
            </form>

            <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-400 mt-5">
              Devam ederek WeTalks{' '}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  handleNavigate('terms');
                }}
                className="text-[#0D62FE] hover:underline cursor-pointer"
              >
                Kullanım Koşulları
              </button>
              'nı ve{' '}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  handleNavigate('privacy');
                }}
                className="text-[#0D62FE] hover:underline cursor-pointer"
              >
                Gizlilik Politikası
              </button>
              'nı kabul etmiş sayılırsınız.
            </p>
          </div>
        </div>
      )}

      {/* 6. Ghost CMS Style Global Search Modal */}
      {showSearchModal && (() => {
        const query = modalSearchQuery.trim().toLowerCase();
        
        // Find matching articles with sanitized working covers
        const matchedArticles = (query 
          ? articles.filter(art => 
              art.title.toLowerCase().includes(query) || 
              art.summary.toLowerCase().includes(query) ||
              art.tags.some(t => t.toLowerCase().includes(query)) ||
              art.authorName.toLowerCase().includes(query)
            ).slice(0, 5)
          : articles.slice(0, 4) // Default trending/recent articles
        ).map(art => sanitizeArticle(art));
          
        // Find matching writers
        const matchedWriters = query
          ? profiles.filter(p => 
              p.role !== 'Reader' && p.role !== 'Visitor' && 
              (p.name.toLowerCase().includes(query) || p.username.toLowerCase().includes(query))
            ).slice(0, 3)
          : profiles.filter(p => p.role !== 'Reader' && p.role !== 'Visitor').slice(0, 3);
          
        // Find matching categories
        const matchedCategories = query
          ? categories.filter(c => 
              c.name.toLowerCase().includes(query) || 
              c.description.toLowerCase().includes(query)
            ).slice(0, 3)
          : categories.slice(0, 4);

        const hasResults = matchedArticles.length > 0 || matchedWriters.length > 0 || matchedCategories.length > 0;

        return (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowSearchModal(false);
            }}
            className="fixed inset-0 z-[99999] bg-black/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div className="bg-white dark:bg-[#0c0f1d] border border-zinc-150 dark:border-zinc-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative animate-in zoom-in-95 duration-200">
              
              {/* Header Input Area with Search Icon and Esc Close */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <Search className="w-5 h-5 text-[#0D62FE] shrink-0" />
                <input 
                  type="text" 
                  placeholder="Yazı, kategori, yazar veya etiket arayın..." 
                  autoFocus 
                  className="w-full bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none font-sans font-medium" 
                  value={modalSearchQuery} 
                  onChange={(e) => setModalSearchQuery(e.target.value)} 
                />
                <button 
                  onClick={() => setShowSearchModal(false)}
                  className="text-[10px] sm:text-[11px] font-sans font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 px-2 py-1 rounded-lg hover:text-zinc-700 dark:hover:text-zinc-350 transition-colors uppercase cursor-pointer"
                >
                  kapat (esc)
                </button>
              </div>

              {/* Scrollable Results content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-none">
                
                {/* 1. Article list */}
                {matchedArticles.length > 0 ? (
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-zinc-420 dark:text-zinc-500 uppercase font-bold tracking-widest font-sans px-1">
                      {query ? 'Eşleşen Makaleler' : 'Öne Çıkan Başlıklar'}
                    </p>
                    <div className="space-y-1.5">
                      {matchedArticles.map(art => {
                        const isNews = art.categoryId === 'etkinlikler' || art.categoryId === 'gundem';
                        return (
                          <div 
                            key={art.id}
                            onClick={() => {
                              handleNavigate('article', { articleId: art.id });
                              setShowSearchModal(false);
                            }}
                            className="group p-3 rounded-2xl bg-zinc-50 hover:bg-[#0D62FE]/5 dark:bg-zinc-800/20 dark:hover:bg-[#0D62FE]/10 border border-zinc-100/50 dark:border-zinc-800/40 hover:border-[#0D62FE]/20 cursor-pointer flex gap-4 transition-all"
                          >
                            <img 
                              src={getCuratedNewsCover(art) || art.coverImage} 
                              alt={art.title} 
                              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-white/5"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = CURATED_NEWS_IMAGES.shopify;
                              }}
                            />
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                                  isNews ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                }`}>
                                  {art.categoryId ? art.categoryId.toLocaleUpperCase('tr-TR') : 'Makale'}
                                </span>
                                <span className="text-[9.5px] text-zinc-400 dark:text-zinc-550 flex items-center gap-1">
                                  {art.authorName} &middot; {art.readTime || '3 dk okuma'}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-[13px] font-sans font-bold text-zinc-900 dark:text-white mt-1 group-hover:text-[#0D62FE] transition-colors line-clamp-1">
                                {art.title}
                              </h4>
                              <p className="text-[10.5px] text-zinc-450 dark:text-zinc-400 line-clamp-1 mt-0.5 leading-relaxed">
                                {art.summary}
                              </p>
                            </div>
                            <div className="self-center pr-1 shrink-0 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all">
                              <ArrowRight className="w-4 h-4 text-[#0D62FE]" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* 2. Categories matching list */}
                {matchedCategories.length > 0 ? (
                  <div className="space-y-2.5 pt-1">
                    <p className="text-[10px] text-zinc-420 dark:text-zinc-500 uppercase font-bold tracking-widest font-sans px-1">
                      {query ? 'Eşleşen Akademiler & Konular' : 'Akademiler & Kategori Araştırma'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchedCategories.map(cat => (
                        <div 
                          key={cat.id}
                          onClick={() => {
                            handleNavigate('search', { category: cat.id });
                            setShowSearchModal(false);
                          }}
                          className="group p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/20 dark:hover:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0D62FE]/15 to-[#EC4899]/10 flex items-center justify-center text-xs font-semibold text-[#0D62FE] shrink-0 border border-[#0D62FE]/10 font-mono">
                            #
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-[#0D62FE] transition-colors">{cat.name}</h5>
                            <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 line-clamp-1 mt-0.5">{cat.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* 3. Writers matching list */}
                {matchedWriters.length > 0 ? (
                  <div className="space-y-2.5 pt-1">
                    <p className="text-[10px] text-zinc-420 dark:text-zinc-500 uppercase font-bold tracking-widest font-sans px-1">
                      Yazarların Perspektifleri
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {matchedWriters.map(writer => (
                        <div 
                          key={writer.id}
                          onClick={() => {
                            handleNavigate('profile', { userId: writer.id });
                            setShowSearchModal(false);
                          }}
                          className="group p-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/20 dark:hover:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 cursor-pointer flex items-center gap-2.5 transition-colors"
                        >
                          <img 
                            src={writer.avatar} 
                            alt={writer.name} 
                            className="w-8 h-8 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all border border-zinc-200 dark:border-zinc-700 shrink-0" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200";
                            }}
                          />
                          <div className="min-w-0">
                            <h5 className="text-[11.5px] font-sans font-bold text-zinc-900 dark:text-white line-clamp-1 leading-tight group-hover:text-[#0D62FE] transition-colors">{writer.name}</h5>
                            <p className="text-[9px] text-zinc-400 dark:text-zinc-550 leading-none mt-0.5 font-sans font-medium">@{writer.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* 4. Empty State if typing and nothing found */}
                {!hasResults && query ? (
                  <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                      <Search className="w-5 h-5 line-through decoration-[#0D62FE] decoration-2" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Hiçbir sonuç bulunamadı</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">"{modalSearchQuery}" sorgusuna uygun makale, yazar veya kategori bulamadık.</p>
                    </div>
                  </div>
                ) : null}

              </div>

              {/* Sticky Footer Info */}
              <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-[10px] sm:text-[10.5px] text-zinc-400 dark:text-zinc-500 font-sans font-medium">
                <div className="flex items-center gap-1">
                  💡 <span className="font-semibold text-zinc-650 dark:text-zinc-400">Tüyo:</span> Kelime yazarak anında live-search yapabilirsiniz.
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      handleNavigate('search');
                      setShowSearchModal(false);
                    }}
                    className="text-[#0D62FE] font-sans font-bold hover:underline"
                  >
                    Gelişmiş Kataloğa Git &rarr;
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* FLOATING DESIGNER ISLAND / DYNAMIC ISLAND HUD (Dribbble Interaction Model) */}
      {settings.showDesignStudio && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] max-w-[95vw] pointer-events-auto">
          <motion.div 
            layout
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`flex flex-col md:flex-row items-center gap-3 p-2.5 rounded-3xl md:rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition-all ${
              glassBlurTheme ? 'ring-1 ring-zinc-150/40 dark:ring-zinc-800/60' : ''
            }`}
          >
            {/* Active status indicator left bar */}
            <div 
              onClick={() => {
                setIsControlIslandExpanded(!isControlIslandExpanded);
                playPluckSynth('pop');
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer select-none shrink-0"
            >
              <span className="flex h-2 w-2 relative shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${soundEnabled ? 'bg-amber-400' : 'bg-zinc-450'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${soundEnabled ? 'bg-amber-500' : 'bg-zinc-500'}`} />
              </span>
              <span className="text-[10.5px] uppercase font-sans font-black tracking-wider text-zinc-700 dark:text-zinc-200 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-zinc-500 rotate-90" />
                Tasarım Studio
              </span>
            </div>

            <AnimatePresence>
              {isControlIslandExpanded && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-wrap md:flex-nowrap items-center justify-center gap-1.5 shrink-0"
                >
                  {/* 1. Acoustic Sound Engine trigger */}
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      setTimeout(() => playPluckSynth('success'), 50);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      soundEnabled 
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                        : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border border-transparent hover:bg-zinc-100'
                    }`}
                    title="Klik etkileşimlerinde minik organik ses dalgası sentezleyiciyi açar."
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        Ses Efekti: Aktif
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        Ses Efekti: Kapalı
                      </>
                    )}
                  </button>

                  {/* 2. Bento Feed trigger */}
                  <button
                    onClick={() => {
                      setBentoMode(!bentoMode);
                      playPluckSynth('click');
                    }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      bentoMode 
                        ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm border border-transparent' 
                        : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-550 dark:text-zinc-400 border border-transparent hover:bg-zinc-100'
                    }`}
                    title="Ana sayfada modern asimetrik bento grid düzenini açar."
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    {bentoMode ? 'Bento Galeri' : 'Klasik Satır'}
                  </button>

                  {/* 3. Glow orbs trigger */}
                  <button
                    onClick={() => {
                      setGlowOrbsEnabled(!glowOrbsEnabled);
                      playPluckSynth('click');
                    }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      glowOrbsEnabled 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border border-transparent hover:bg-zinc-100'
                    }`}
                    title="Arka planda dönebilen ve hafifçe sönen degrade küre dalgalarını tetikler."
                  >
                    <Activity className="w-3.5 h-3.5" />
                    {glowOrbsEnabled ? 'Derin Atmosfer' : 'Sade Düz'}
                  </button>

                  {/* 4. Glass theme trigger */}
                  <button
                    onClick={() => {
                      setGlassBlurTheme(!glassBlurTheme);
                      playPluckSynth('click');
                    }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      glassBlurTheme 
                        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20' 
                        : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border border-transparent hover:bg-zinc-100'
                    }`}
                    title="Hafif yarı saydam cam efekti ve ince lüks kenarlık modunu etkinleştirir."
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {glassBlurTheme ? 'Cam Sınırlar' : 'Şeffaf'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

    </div>
  );
}
