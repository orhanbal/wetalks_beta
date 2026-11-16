/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { handleImageErrorGlobal, playPluckSynth } from '../App';
import { UserProfile, Notification, UserRole, SystemSettings, Category, Article, ArticleSeries, CalendarEvent } from '../types';
import { useToast } from './Toast';
import { 
  Sun, 
  Moon, 
  Moon as MoonIcon, // Keep compatibility if needed
  Bell, 
  Search, 
  Plus, 
  Menu, 
  X, 
  LayoutDashboard, 
  User, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Grid,
  ChevronDown,
  Users,
  MessageSquare,
  TrendingUp,
  Info,
  Settings,
  Globe,
  ShoppingBag,
  Layers,
  Compass,
  UserCheck,
  Flame,
  CheckSquare,
  Cpu,
  Scissors,
  ExternalLink,
  Truck,
  Brain,
  Coins,
  Calendar,
  Rocket,
  Lightbulb,
  BellRing,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  currentUser: UserProfile | null;
  onLogout?: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onAddNotification?: (notification: Notification) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (view: string, params?: any) => void;
  currentView: string;
  viewParams?: any;
  onTriggerAuthModal: () => void;
  onTriggerSearchModal?: () => void;
  categories?: Category[];
  writers?: UserProfile[];
  series?: ArticleSeries[];
  articles?: Article[];
  settings?: SystemSettings;
  calendarEvents?: CalendarEvent[];
  onUpdateCalendarEvents?: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  lang?: 'tr' | 'en';
  onChangeLang?: (lang: 'tr' | 'en') => void;
}

const getCategoryIcon = (iconName?: string, categoryId?: string, categoryName?: string) => {
  const normalizedId = categoryId?.toLowerCase() || '';
  const normalizedName = categoryName?.toLowerCase() || '';
  
  if (normalizedId === 'girisimcilik' || normalizedId === 'girişimcilik' || normalizedName.includes('girişimcilik')) {
    return <Rocket className="w-3.5 h-3.5 text-fuchsia-500" />;
  }

  switch (iconName) {
    case 'Sparkles': return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
    case 'BookOpen': return <BookOpen className="w-3.5 h-3.5 text-[#0D62FE]" />;
    case 'MessageSquare': return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
    case 'TrendingUp': return <TrendingUp className="w-3.5 h-3.5 text-amber-500" />;
    case 'Globe': return <Globe className="w-3.5 h-3.5 text-cyan-500" />;
    case 'ShoppingBag': return <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />;
    case 'CheckSquare': return <CheckSquare className="w-3.5 h-3.5 text-indigo-550" />;
    case 'Cpu': return <Cpu className="w-3.5 h-3.5 text-rose-500" />;
    case 'Scissors': return <Scissors className="w-3.5 h-3.5 text-pink-500" />;
    case 'ExternalLink': return <ExternalLink className="w-3.5 h-3.5 text-teal-500" />;
    case 'Truck': return <Truck className="w-3.5 h-3.5 text-amber-600" />;
    case 'Brain': return <Brain className="w-3.5 h-3.5 text-fuchsia-500" />;
    case 'Coins': return <Coins className="w-3.5 h-3.5 text-yellow-600" />;
    case 'Calendar': return <Calendar className="w-3.5 h-3.5 text-red-500" />;
    case 'Compass': return <Compass className="w-3.5 h-3.5 text-violet-500" />;
    case 'Rocket': return <Rocket className="w-3.5 h-3.5 text-fuchsia-500" />;
    case 'Lightbulb': return <Lightbulb className="w-3.5 h-3.5 text-amber-500" />;
    default: return <Layers className="w-3.5 h-3.5 text-zinc-500" />;
  }
};

export default function Navbar({
  currentRole,
  currentUser,
  onLogout,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onAddNotification,
  darkMode,
  onToggleDarkMode,
  onNavigate,
  currentView,
  viewParams,
  onTriggerAuthModal,
  onTriggerSearchModal,
  categories = [],
  writers = [],
  series = [],
  articles = [],
  settings,
  calendarEvents = [],
  onUpdateCalendarEvents,
  lang = 'tr',
  onChangeLang
}: NavbarProps) {
  const toast = useToast();
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [isOpenProfileDropdown, setIsOpenProfileDropdown] = useState(false);
  const [isOpenAboutModal, setIsOpenAboutModal] = useState(false);
  const [isOpenKunyeModal, setIsOpenKunyeModal] = useState(false);
  const [isOpenLogoDropdown, setIsOpenLogoDropdown] = useState(false);
  const [isOpenCalendarDropdown, setIsOpenCalendarDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // States for event notifications and alarm settings
  const [subscribedEventIds, setSubscribedEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wetalks_subscribed_event_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wetalks_subscribed_event_ids', JSON.stringify(subscribedEventIds));
  }, [subscribedEventIds]);

  const [alertSoundOn, setAlertSoundOn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('wetalks_alert_sound_enabled');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('wetalks_alert_sound_enabled', String(alertSoundOn));
  }, [alertSoundOn]);

  const [calendarToast, setCalendarToast] = useState<{message: string; type: 'success' | 'info'} | null>(null);

  useEffect(() => {
    if (calendarToast) {
      const timer = setTimeout(() => {
        setCalendarToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [calendarToast]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const menuItemsToUse = (settings?.menuItems || [
    { id: 'articles', title: 'Yazılar', view: 'search', visible: true },
    { id: 'roportajlar', title: 'Röportajlar', view: 'search', categoryParam: 'roportajlar', visible: true },
    { id: 'etkinlikler', title: 'Etkinlikler', view: 'search', categoryParam: 'etkinlikler', visible: true }
  ]).filter(item => item.view !== 'explore' && item.id !== 'konular' && item.id !== 'explore' && item.id !== 'writers' && item.id !== 'roportajlar');

  const eventRelatedNotifications = React.useMemo(() => {
    return (notifications || []).filter(notif => {
      const titleLower = (notif.title || '').toLowerCase();
      const descLower = (notif.description || '').toLowerCase();
      const idStr = String(notif.id || '');
      return (
        titleLower.includes('etkinlik') ||
        titleLower.includes('takvim') ||
        titleLower.includes('alarm') ||
        descLower.includes('etkinlik') ||
        descLower.includes('takvim') ||
        descLower.includes('alarm') ||
        idStr.startsWith('evt-') ||
        (notif.link && (articles || []).some(a => a.id === notif.link && (a.categoryId === 'etkinlikler' || a.publicationType === 'event')))
      );
    });
  }, [notifications, articles]);

  const nonEventNotifications = React.useMemo(() => {
    return (notifications || []).filter(notif => {
      const titleLower = (notif.title || '').toLowerCase();
      const descLower = (notif.description || '').toLowerCase();
      const idStr = String(notif.id || '');
      const isEventRelated = 
        titleLower.includes('etkinlik') ||
        titleLower.includes('takvim') ||
        titleLower.includes('alarm') ||
        descLower.includes('etkinlik') ||
        descLower.includes('takvim') ||
        descLower.includes('alarm') ||
        idStr.startsWith('evt-') ||
        (notif.link && (articles || []).some(a => a.id === notif.link && (a.categoryId === 'etkinlikler' || a.publicationType === 'event')));
      return !isEventRelated;
    });
  }, [notifications, articles]);

  const unreadCount = nonEventNotifications.filter(n => !n.isRead).length;
  const unreadEventCount = eventRelatedNotifications.filter(n => !n.isRead).length;

  // Merge calendarEvents with event-category articles dynamically to make sure all events are shown in the calendar!
  const mergedCalendarEvents = React.useMemo(() => {
    const list = [...(calendarEvents || [])];
    
    // Find articles of category 'etkinlikler' or publicationType === 'event'
    const eventArticles = (articles || []).filter(
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
  }, [calendarEvents, articles]);

  const handleCreateArticleClick = () => {
    if (currentRole === 'Visitor') {
      onTriggerAuthModal();
    } else if (currentRole === 'Reader') {
      toast.error('Yalnızca Yazar, Editör veya Admin rolüne sahip kullanıcılar makale oluşturabilir.');
    } else {
      onNavigate('edit_article');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const isOrhan = currentUser?.id === 'user_orhan' || currentUser?.username === 'orhanbalci' || currentUser?.name === 'Orhan Balcı';
    if (isOrhan && (role === 'Admin' || role === 'Writer')) {
      return <span className="text-[10px] uppercase tracking-wider bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold border border-orange-100 dark:border-orange-900/30">Kurucu Yazar</span>;
    }

    switch (role) {
      case 'Visitor':
        return <span className="text-[10px] uppercase tracking-wider bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded-full font-semibold border border-zinc-200/50 dark:border-zinc-700/50">Ziyaretçi</span>;
      case 'Reader':
        return <span className="text-[10px] uppercase tracking-wider bg-blue-50 text-[#0D62FE] dark:bg-blue-950/50 dark:text-[#5591FF] px-2 py-0.5 rounded-full font-semibold border border-blue-100 dark:border-blue-900/30">Okuyucu</span>;
      case 'Writer':
        return <span className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-100 dark:border-blue-900/30">Yazar</span>;
      case 'Editor':
        return <span className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-100 dark:border-blue-900/30">Küratör Editör</span>;
      case 'Admin':
        return <span className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-100 dark:border-blue-900/30">Kurucu Editör</span>;
    }
  };

  if (currentView === 'insights') {
    return (
      <header id="main-navbar" className="sticky top-0 z-45 w-full bg-[#03040B]/85 backdrop-blur-xl border-b border-zinc-900/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 flex-nowrap gap-4">
            {/* Left: Brand/Logo ONLY */}
            <button 
              onClick={() => {
                if (settings?.appActive === false && currentRole !== 'Admin' && currentRole !== 'Editor') {
                  onNavigate('insights');
                } else {
                  onNavigate('home');
                }
              }}
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-none shrink-0"
            >
              {settings?.darkLogo || settings?.lightLogo ? (
                <img 
                  src={settings.darkLogo || settings.lightLogo} 
                  className="h-8 sm:h-9 max-w-[150px] sm:max-w-[180px] object-contain block" 
                  alt="" 
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20 shrink-0">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="8" cy="8" r="4" fill="white" fillOpacity="0.8" />
                      <circle cx="16" cy="8" r="4" fill="white" />
                      <circle cx="8" cy="16" r="4" fill="white" />
                      <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.6" />
                    </svg>
                  </div>
                  <span className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight flex items-center select-none">
                    {settings?.appName || 'WeTalks'}<span className="text-orange-500 font-sans font-black text-3xl sm:text-4xl leading-none ml-0.5">.</span>
                  </span>
                </div>
              )}
            </button>

            {/* Right: Slogan and Language Toggle */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] sm:text-xs tracking-wider text-right">
                <span className="text-orange-400 font-bold">BUILT WITH GEMINI.</span>
                <span className="text-zinc-600 font-light shrink-0">|</span>
                <span className="text-zinc-400 font-bold">GUIDED BY HUMAN EXPERIENCE.</span>
              </div>
              
              {/* Language Switcher button */}
              <div className="relative flex items-center bg-zinc-950 p-1 rounded-full border border-zinc-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] group/lang shrink-0 select-none">
                {/* Sliding indicator */}
                <div 
                  className={`absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_2px_10px_rgba(234,88,12,0.4)] transition-all duration-300 ease-out ${
                    lang === 'tr' 
                      ? 'left-1 w-[38px]' 
                      : 'left-[43px] w-[38px]'
                  }`} 
                />
                <button
                  onClick={() => onChangeLang?.('tr')}
                  className={`relative z-10 w-[38px] py-1 text-center text-[10px] font-mono font-extrabold tracking-wider transition-colors duration-200 cursor-pointer ${
                    lang === 'tr' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Türkçe"
                >
                  TR
                </button>
                <button
                  onClick={() => onChangeLang?.('en')}
                  className={`relative z-10 w-[38px] py-1 text-center text-[10px] font-mono font-extrabold tracking-wider transition-colors duration-200 cursor-pointer ${
                    lang === 'en' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="English"
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header id="main-navbar" className="sticky top-0 z-40 w-full">
        <div className={`absolute inset-0 -z-10 transition-all duration-300 backdrop-blur-xl ${
          isScrolled 
            ? 'bg-white/70 dark:bg-[#020308]/75 shadow-[0_4px_22px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_35px_rgba(0,0,0,0.5)] border-b border-zinc-200/60 dark:border-white/10' 
            : 'bg-white/60 dark:bg-[#020308]/65 border-b border-zinc-100/50 dark:border-white/5'
        }`} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 flex-nowrap gap-2">
          {/* Left: Branding & Role info */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0 flex-nowrap">
            <div 
              className="relative py-2.5"
              onMouseEnter={() => setIsOpenLogoDropdown(true)}
              onMouseLeave={() => setIsOpenLogoDropdown(false)}
            >
              <button 
                id="navbar-logo"
                onClick={() => {
                  if (settings?.appActive === false && currentRole !== 'Admin' && currentRole !== 'Editor') {
                    onNavigate('insights');
                  } else {
                    onNavigate('home');
                  }
                  setIsOpenLogoDropdown(!isOpenLogoDropdown);
                }}
                className="flex items-center gap-2 group cursor-pointer focus:outline-none shrink-0"
              >
                {settings?.lightLogo || settings?.darkLogo ? (
                  <img 
                    src={darkMode ? (settings.darkLogo || settings.lightLogo) : (settings.lightLogo || settings.darkLogo)} 
                    className="h-8 sm:h-9 max-w-[150px] sm:max-w-[180px] object-contain block" 
                    alt="" 
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0D62FE] flex items-center justify-center text-white font-black shadow-md shadow-[#0D62FE]/20 shrink-0">
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="8" cy="8" r="4" fill="white" fillOpacity="0.8" />
                        <circle cx="16" cy="8" r="4" fill="white" />
                        <circle cx="8" cy="16" r="4" fill="white" />
                        <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.6" />
                      </svg>
                    </div>
                    <span className="text-2xl sm:text-3xl font-serif font-black text-zinc-900 dark:text-white tracking-tight flex items-center select-none">
                      {settings?.appName || 'WeTalks'}<span className="text-[#0D62FE] font-sans font-black text-3xl sm:text-4xl leading-none ml-0.5">.</span>
                    </span>
                  </div>
                )}
                <ChevronDown className={`w-4 h-4 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white mt-1.5 transition-transform duration-300 ${isOpenLogoDropdown ? 'rotate-180 text-[#0D62FE]' : ''}`} />
              </button>

              {/* Redesigned Premium Animated Dropdown with AnimatePresence */}
              <AnimatePresence>
                {isOpenLogoDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 top-full pt-2 w-[280px] z-[9999]"
                  >
                    {/* Transparent pointer-hover helper to seal the physical boundary gap */}
                    <div className="absolute left-0 right-0 top-0 h-2 bg-transparent z-10" />

                    <div className="relative overflow-hidden glass-panel rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-2xl z-20">
                      {/* Top Premium Gradient Line Accent */}
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D62FE] to-[#FF4C1C] z-10" />
                        
                      <button
                        onClick={() => {
                          setIsOpenAboutModal(true);
                          setIsOpenLogoDropdown(false);
                        }}
                        className="flex w-full items-start gap-3.5 px-3 py-3 text-left rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-all duration-200 cursor-pointer group/item text-xs font-sans"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0D62FE]/10 text-[#0D62FE] group-hover/item:bg-[#0D62FE] group-hover/item:text-white transition-all duration-300 shrink-0 shadow-sm border border-[#0D62FE]/10">
                          <Info className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-zinc-850 dark:text-zinc-100 group-hover/item:text-[#0D62FE] transition-colors leading-none mb-1">
                            WeTalks Hakkında
                          </span>
                          <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-normal">
                            Vizyonumuz, felsefemiz ve akıllı içerik felsefesi.
                          </span>
                        </div>
                      </button>

                      <div className="h-px bg-zinc-100/50 dark:bg-zinc-800/60 my-0.5 mx-2" />

                      <button
                        onClick={() => {
                          setIsOpenKunyeModal(true);
                          setIsOpenLogoDropdown(false);
                        }}
                        className="flex w-full items-start gap-3.5 px-3 py-3 text-left rounded-xl hover:bg-zinc-50 dark:hover:bg-white/[0.03] transition-all duration-200 cursor-pointer group/item text-xs font-sans"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all duration-300 shrink-0 shadow-sm border border-emerald-500/10">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-zinc-850 dark:text-zinc-100 group-hover/item:text-emerald-500 dark:group-hover/item:text-emerald-400 transition-colors leading-none mb-1">
                            WeTalks Künye
                          </span>
                          <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-normal">
                            Yayın kadromuz, kurullar ve editoryal kriterlerimiz.
                          </span>
                        </div>
                      </button>

                      <div className="h-px bg-zinc-100/50 dark:bg-zinc-800/60 my-0.5 mx-2" />

                      <button
                        onClick={() => {
                          onNavigate('insights');
                          setIsOpenLogoDropdown(false);
                        }}
                        className="flex w-full items-start gap-3.5 px-3 py-3 text-left rounded-xl hover:bg-orange-50/50 dark:hover:bg-orange-950/10 transition-all duration-200 cursor-pointer group/item text-xs font-sans"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 group-hover/item:bg-orange-500 group-hover/item:text-white transition-all duration-300 shrink-0 shadow-sm border border-orange-500/10">
                          <Sparkles className="w-4 h-4 text-orange-500 group-hover/item:text-white animate-pulse" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-zinc-850 dark:text-zinc-100 group-hover/item:text-orange-500 transition-colors leading-none mb-1">
                            WeTalks Insights
                          </span>
                          <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-normal">
                            İnsan ve yapay zekâ ortak üretimi iş içgörüsü platformu.
                          </span>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Keşfet (Explore) Dropdown right next to the logo */}
            <div className="relative group/categories py-2 hidden md:block z-[9999]">
              <button 
                id="navbar-categories-trigger"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-[15.5px] font-sans font-black transition-all cursor-pointer focus:outline-none"
              >
                <Compass className="w-4.5 h-4.5 text-[#0D62FE]" />
                <span>Keşfet</span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-hover/categories:rotate-180 transition-transform duration-200" />
              </button>

              {/* Single Column Dribbble-Style Dropdown */}
              <div className="absolute left-0 top-[100%] pt-2 w-[270px] invisible opacity-0 scale-95 origin-top-left group-hover/categories:visible group-hover/categories:opacity-100 group-hover/categories:scale-100 transition-[opacity,transform] duration-150 ease-out z-[99999]">
                {/* Transparent pointer-hover helper to seal the physical boundary gap */}
                <div className="absolute left-0 right-0 top-0 h-2 bg-transparent z-10" />
                
                <div className="glass-panel rounded-2xl p-2.5 shadow-2xl relative z-20">
                  <div className="flex flex-col">
                      <span className="text-[9px] font-black text-zinc-550 dark:text-zinc-300 uppercase tracking-widest px-3 mb-1 block">ÖNE ÇIKANLAR</span>
                      <button
                        onClick={() => onNavigate('writers')}
                        className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-700 hover:text-[#0D62FE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-sans font-semibold text-xs text-left transition-colors w-full cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-cyan-500 transition-colors shrink-0" />
                        <span>Takip Edilenler</span>
                      </button>
                      <button
                        onClick={() => onNavigate('articles')}
                        className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-700 hover:text-[#0D62FE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-sans font-semibold text-xs text-left transition-colors w-full cursor-pointer"
                      >
                        <TrendingUp className="w-4 h-4 text-emerald-500 transition-colors shrink-0" />
                        <span>Popüler</span>
                      </button>
                      <button
                        onClick={() => onNavigate('articles')}
                        className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-700 hover:text-[#0D62FE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-sans font-semibold text-xs text-left transition-colors w-full cursor-pointer animate-in fade-in duration-150"
                      >
                        <Sparkles className="w-4 h-4 text-purple-500 transition-colors shrink-0" />
                        <span>Yeni ve Öne Çıkanlar</span>
                      </button>

                      <div className="my-1.5 border-t border-zinc-150/50 dark:border-zinc-850" />

                      <span className="text-[9px] font-black text-zinc-550 dark:text-zinc-300 uppercase tracking-widest px-3 mb-1 block">YAYIN TÜRLERİ</span>
                      <button
                        onClick={() => onNavigate('news')}
                        className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-700 hover:text-[#0D62FE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-sans font-semibold text-xs text-left transition-colors w-full cursor-pointer"
                      >
                        <TrendingUp className="w-4 h-4 text-[#0D62FE] transition-colors shrink-0" />
                        <span>Haberler</span>
                      </button>
                      <button
                        onClick={() => onNavigate('articles')}
                        className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-700 hover:text-[#0D62FE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-sans font-semibold text-xs text-left transition-colors w-full cursor-pointer animate-in fade-in duration-150"
                      >
                        <BookOpen className="w-4 h-4 text-emerald-500 transition-colors shrink-0" />
                        <span>Makaleler</span>
                      </button>
                      <button
                        onClick={() => onNavigate('series')}
                        className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-700 hover:text-[#0D62FE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-sans font-semibold text-xs text-left transition-colors w-full cursor-pointer animate-in fade-in duration-150"
                      >
                        <Layers className="w-4 h-4 text-indigo-500 transition-colors shrink-0" />
                        <span>Yazı Dizileri</span>
                      </button>
                      <button
                        onClick={() => onNavigate('interviews')}
                        className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-700 hover:text-[#0D62FE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-sans font-semibold text-xs text-left transition-colors w-full cursor-pointer animate-in fade-in duration-150"
                      >
                        <MessageSquare className="w-4 h-4 text-rose-500 transition-colors shrink-0" />
                        <span>Röportajlar</span>
                      </button>
                      <button
                        onClick={() => onNavigate('events')}
                        className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-700 hover:text-[#0D62FE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-sans font-semibold text-xs text-left transition-colors w-full cursor-pointer animate-in fade-in duration-150"
                      >
                        <Calendar className="w-4 h-4 text-amber-500 transition-colors shrink-0" />
                        <span>Etkinlikler</span>
                      </button>
                      <button
                        onClick={() => onNavigate('writers')}
                        className="group flex items-center gap-3 px-3 py-1.5 rounded-xl text-zinc-700 hover:text-[#0D62FE] dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-sans font-semibold text-xs text-left transition-colors w-full cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4 text-cyan-500 transition-colors shrink-0" />
                        <span>Yazarlar</span>
                      </button>

                      <div className="my-1.5 border-t border-zinc-150/50 dark:border-zinc-850" />
                      <span className="text-[9px] font-black text-zinc-550 dark:text-zinc-300 uppercase tracking-widest px-3 mb-1 block">KONULAR VE KATEGORİLER</span>

                      <div className="max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-0.5 custom-scrollbar">
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              onNavigate('articles', { category: cat.id });
                            }}
                            className="group/item flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-zinc-650 hover:text-[#0D62FE] dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/45 font-sans font-medium text-xs text-left transition-colors w-full cursor-pointer"
                          >
                            <div className="transition-transform group-hover/item:scale-110 shrink-0">
                              {getCategoryIcon(cat.icon, cat.id, cat.name)}
                            </div>
                            <span className="truncate">{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Yazarlar Dropdown */}
            <div className="relative group/writers py-2 hidden md:block z-[9999]">
              <button 
                id="navbar-writers-trigger"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-[15.5px] font-sans font-black transition-all cursor-pointer focus:outline-none"
              >
                <Users className="w-4.5 h-4.5 text-[#0D62FE]" />
                <span>Yazarlar</span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-hover/writers:rotate-180 transition-transform duration-200" />
              </button>

              {/* Mega Dropdown for Writers */}
              <div className="absolute left-0 top-[100%] pt-2 w-[420px] invisible opacity-0 scale-95 origin-top-left group-hover/writers:visible group-hover/writers:opacity-100 group-hover/writers:scale-100 transition-[opacity,transform] duration-150 ease-out z-[99999]">
                {/* Transparent pointer-hover helper to seal the physical boundary gap */}
                <div className="absolute left-0 right-0 top-0 h-2 bg-transparent z-10" />
                
                <div className="glass-panel rounded-2xl p-4 shadow-2xl relative z-20">
                  <div className="px-2 pb-2.5 mb-2.5 border-b border-zinc-150/55 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-zinc-550 dark:text-zinc-300">ÖNE ÇIKAN YAZARLAR</span>
                    <button 
                      onClick={() => onNavigate('writers')}
                      className="text-[10px] font-sans font-black text-[#0D62FE] hover:underline cursor-pointer"
                    >
                      Tümünü Gör &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {writers.slice(0, 6).map(writer => (
                      <button
                        key={writer.id}
                        onClick={() => onNavigate('profile', { userId: writer.id })}
                        className="group/item flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-left transition-colors cursor-pointer w-full"
                      >
                        <img 
                           src={writer.avatar} 
                           alt={writer.name} 
                           className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 transition-transform group-hover/item:scale-105 shrink-0"
                           referrerPolicy="no-referrer"
                           onError={(e) => handleImageErrorGlobal(e, 'avatar')}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-sans font-bold text-zinc-800 dark:text-zinc-200 group-hover/item:text-[#0D62FE] transition-colors truncate">
                            {writer.name}
                          </p>
                          <p className="text-[9px] text-zinc-450 dark:text-zinc-500 truncate leading-none mt-0.5">
                            @{writer.username}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Yazı Dizileri Dropdown */}
            <div className="relative group/series py-2 hidden md:block z-[9999]">
              <button 
                id="navbar-series-trigger"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-[15.5px] font-sans font-black transition-all cursor-pointer focus:outline-none"
              >
                <Layers className="w-4.5 h-4.5 text-[#0D62FE]" />
                <span>Yazı Dizileri</span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-hover/series:rotate-180 transition-transform duration-200" />
              </button>

              {/* Mega Dropdown for Series */}
              <div className="absolute left-0 top-[100%] pt-2 w-[480px] invisible opacity-0 scale-95 origin-top-left group-hover/series:visible group-hover/series:opacity-100 group-hover/series:scale-100 transition-[opacity,transform] duration-150 ease-out z-[99999]">
                {/* Transparent pointer-hover helper to seal the physical boundary gap */}
                <div className="absolute left-0 right-0 top-0 h-2 bg-transparent z-10" />
                
                <div className="glass-panel rounded-2xl p-4 shadow-2xl relative z-20">
                  <div className="px-2 pb-2.5 mb-2.5 border-b border-zinc-150/55 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-[#0D62FE] dark:text-zinc-400">YAZI DİZİLERİ & SERİLER</span>
                    <button 
                      onClick={() => onNavigate('explore')}
                      className="text-[10px] font-sans font-black text-[#0D62FE] hover:underline cursor-pointer"
                    >
                      Hepsini Gör &rarr;
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {series.slice(0, 4).map(ser => {
                      const matchingArticles = articles.filter(a => a.seriesId === ser.id && a.status === 'Published');
                      const firstArt = matchingArticles[0];
                      return (
                        <button
                          key={ser.id}
                          onClick={() => {
                            if (firstArt) {
                              onNavigate('article', { id: firstArt.id });
                            } else {
                              onNavigate('explore');
                            }
                          }}
                          className="group/item flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-left transition-colors cursor-pointer w-full"
                        >
                          <div className="mt-0.5 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 transition-colors shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-sans font-bold text-zinc-800 dark:text-zinc-200 group-hover/item:text-[#0D62FE] transition-colors truncate">
                                {ser.title}
                              </p>
                              <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-450 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                                {matchingArticles.length} Yazı
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-450 dark:text-zinc-400 line-clamp-1 leading-normal mt-0.5">
                              {ser.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* WeTalks Insights Premium Link removed */}
          </div>
  
          {/* Right Action Widgets */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 flex-nowrap">

            {/* Search Icon Button Only */}
            <button
              id="navbar-search-btn"
              onClick={() => {
                if (onTriggerSearchModal) {
                  onTriggerSearchModal();
                } else {
                  onNavigate('search');
                }
              }}
              className="p-2 sm:p-2.5 text-zinc-550 dark:text-zinc-450 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-950/20 rounded-full transition-colors cursor-pointer focus:outline-none shrink-0"
              aria-label="Arama Yap"
              title="Ara"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark Mode toggle */}
            <button
              id="dark-mode-toggle"
              onClick={onToggleDarkMode}
              className="p-2 sm:p-2.5 text-zinc-550 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-950/20 rounded-full transition-colors cursor-pointer focus:outline-none shrink-0"
              aria-label="Karanlık Mod Değiştir"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Switcher removed from main navbar */}

            {/* Calendar Events Dropdown Container */}
            <div 
              className="hidden"
            >
              <button
                id="calendar-event-btn"
                onClick={() => {
                  setIsOpenCalendarDropdown(!isOpenCalendarDropdown);
                  setIsOpenNotifications(false);
                  setIsOpenProfileDropdown(false);
                }}
                className="relative p-1.5 text-zinc-550 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-950/20 rounded-xl transition-all cursor-pointer focus:outline-none shrink-0 flex items-center justify-center"
                aria-label="Etkinlik Takvimi"
                title="Etkinlik Takvimi"
              >
                <div className="relative w-8 h-8 flex items-center justify-center">
                  {/* Detailed custom calendar SVG designed precisely to match the second image */}
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF9800"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#FF9800]"
                  >
                    {/* Rounded rectangle block base representing the calendar sheet */}
                    <rect x="3.5" y="6.5" width="17" height="14.5" rx="3.5" fill="none" strokeWidth="2.8" />
                    {/* Thick loop dual hangers at the absolute top boundary */}
                    <path d="M8 2.5v4" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" />
                    <path d="M16 2.5v4" stroke="#FF9800" strokeWidth="3" strokeLinecap="round" />
                    {/* High contrast banner margin horizontal divider */}
                    <path d="M3.5 11h17" stroke="#FF9800" strokeWidth="2.8" />
                  </svg>
                  {mergedCalendarEvents.length > 0 && (
                    <span 
                      id="calendar-event-badge"
                      className="absolute top-[0px] right-[0px] w-[18px] h-[18px] bg-[#FF9800] text-white font-sans font-black text-[11px] leading-none flex items-center justify-center rounded-full shadow-lg border-2 border-[#fff] dark:border-[#0b0c16] transform translate-x-1 -translate-y-1"
                    >
                      {mergedCalendarEvents.length}
                    </span>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isOpenCalendarDropdown && (
                  <motion.div
                    id="calendar-event-panel"
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-[-24px] sm:right-[-10px] pt-2.5 w-[335px] sm:w-[370px] z-[99999]"
                  >
                    {/* Transparent pointer-hover helper to seal the physical boundary gap zone */}
                    <div className="absolute left-0 right-0 top-0 h-2.5 bg-transparent z-10" />

                    {/* Top Arrow Pointer pointing to Calendar Icon */}
                    <div className="absolute top-2.5 right-[34px] sm:right-[20px] w-3.5 h-3.5 -mt-1.5 rotate-45 bg-white dark:bg-[#111424] border-t border-l border-zinc-200/60 dark:border-white/5 z-20" />

                    <div className="glass-panel rounded-2xl py-3 overflow-hidden relative shadow-2xl z-30">
                      {/* Amber Gradient Accent Stripe for Calendar */}
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
                      
                      <div className="flex items-center justify-between px-4 pb-2.5 border-b border-zinc-150/50 dark:border-zinc-800/60">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-sans font-bold text-zinc-855 dark:text-zinc-50">📅 Etkinlik Takvimi</span>
                          {mergedCalendarEvents.length > 0 && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-500 text-zinc-950 rounded-full leading-none">
                              {mergedCalendarEvents.length}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            onNavigate('search', { publicationType: 'event' });
                            setIsOpenCalendarDropdown(false);
                          }}
                          className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:opacity-80 transition-colors"
                        >
                          Tümünü Gör
                        </button>
                      </div>

                      {/* CANLI ALARM MOTORU Control Toggle Bar */}
                      <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50/20 dark:from-amber-950/20 dark:to-orange-950/5 border-b border-zinc-150/50 dark:border-zinc-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-sans font-bold text-amber-800 dark:text-amber-450 uppercase tracking-wider">ETKİNLİK ALARMLARI</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAlertSoundOn(!alertSoundOn);
                            if (typeof playPluckSynth !== 'undefined') {
                              playPluckSynth('click');
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8.5px] font-black uppercase transition-all ${
                            alertSoundOn 
                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-transparent'
                          }`}
                        >
                          {alertSoundOn ? '🔊 BİLDİRİM SESİ AÇIK' : '🔇 SES SESSİZ'}
                        </button>
                      </div>

                      {/* Interactive Calendar Notification Toast Banner inside the dropdown */}
                      {calendarToast && (
                        <div className="px-4 py-2 bg-amber-500 text-zinc-950 text-[10.5px] font-bold flex items-center justify-between gap-2 border-b border-amber-600/20 shadow-sm animate-pulse">
                          <span>🔔 {calendarToast.message}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setCalendarToast(null); }} 
                            className="bg-zinc-950/20 hover:bg-zinc-950/40 text-zinc-950 px-1 rounded font-black text-[12px] leading-none"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      
                      <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/40 scrollbar-none">
                        {mergedCalendarEvents.length === 0 ? (
                          <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                            <Calendar className="w-8 h-8 text-zinc-300 dark:text-zinc-650 mb-2" />
                            <p className="text-xs font-sans font-bold text-zinc-855 dark:text-zinc-200">Kayıtlı Etkinlik Yok</p>
                            <p className="text-[10px] font-sans text-zinc-450 dark:text-zinc-500 mt-1">
                              Şu an için yaklaşan bir sektör etkinliği bulunmamaktadır.
                            </p>
                          </div>
                        ) : (
                          [...mergedCalendarEvents]
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((evt) => {
                              const dateObj = new Date(evt.date);
                              const day = dateObj.getDate();
                              const monthStr = dateObj.toLocaleDateString('tr-TR', { month: 'short' });
                              const hasNotification = subscribedEventIds.includes(evt.id);
                              
                              // Check if there are any unread alerts/notifications related to this event
                              const hasUnreadAlert = eventRelatedNotifications.some(n => !n.isRead && (n.link === evt.id || n.link === `article/${evt.id}`));

                              return (
                                <div 
                                  key={evt.id} 
                                  onClick={() => {
                                    // Mark related notifications as read when the user views the event details
                                    const relatedNotifs = eventRelatedNotifications.filter(
                                      n => (n.link === evt.id || n.link === `article/${evt.id}`) && !n.isRead
                                    );
                                    relatedNotifs.forEach(n => {
                                      if (onMarkNotificationRead) {
                                        onMarkNotificationRead(n.id);
                                      }
                                    });

                                    if (!evt.id.startsWith('evt-')) {
                                      onNavigate('article', { id: evt.id });
                                      setIsOpenCalendarDropdown(false);
                                    }
                                  }}
                                  className={`p-3 hover:bg-zinc-50 dark:hover:bg-white/[0.02] flex items-center gap-3 transition-colors text-left relative ${
                                    hasUnreadAlert 
                                      ? 'bg-amber-500/[0.03] border-l-2 border-amber-500' 
                                      : 'border-l-2 border-transparent'
                                  } ${!evt.id.startsWith('evt-') ? 'cursor-pointer' : ''}`}
                                >
                                  {/* Date Box */}
                                  <div className="shrink-0 flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-amber-400/10 dark:bg-amber-400/5 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                                    <span className="font-mono text-base font-extrabold leading-none">{isNaN(day) ? '?' : day}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5 leading-none">{isNaN(day) ? 'Tarih' : monthStr}</span>
                                  </div>

                                  {/* Event Content */}
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start justify-between gap-1">
                                      <h5 className="text-[11.5px] font-sans font-bold text-zinc-905 dark:text-white leading-snug line-clamp-2">
                                        {evt.title}
                                      </h5>
                                      {evt.isAiGenerated && (
                                        <span 
                                          className="shrink-0 text-[8px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/15 px-1 py-0.5 rounded"
                                          title="Yapay zeka tarafından otomatik eklenen haber sızıntı etkinliği"
                                        >
                                          AI
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">
                                      {evt.description}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-zinc-450 dark:text-zinc-500">
                                      {evt.time && (
                                        <span className="font-mono">🕒 {evt.time}</span>
                                      )}
                                      {evt.location && (
                                        <span className="truncate max-w-[125px]">📍 {evt.location}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {!evt.id.startsWith('evt-') ? (
                                        <span
                                          className="inline-flex items-center gap-0.5 text-[8.5px] font-black uppercase text-amber-600 dark:text-amber-400 hover:underline mt-0.5 cursor-pointer"
                                        >
                                          Yayın Detayı <ExternalLink className="w-2.5 h-2.5" />
                                        </span>
                                      ) : evt.sourceUrl ? (
                                        <a
                                          href={evt.sourceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-[8.5px] font-black uppercase text-amber-600 dark:text-amber-400 hover:underline mt-0.5"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Dış Link <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      ) : null}
                                      {hasNotification && (
                                        <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded mt-0.5 animate-pulse">
                                          ⏰ Alarm Kuruldu
                                        </span>
                                      )}
                                      {hasUnreadAlert && (
                                        <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 rounded mt-0.5 animate-pulse">
                                          🔴 Yeni Bildirim var!
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Notification Toggle Bell Button right aligned in the row */}
                                  <div className="shrink-0 self-center pl-1">
                                    <button
                                      type="button"
                                      title={hasNotification ? "Bu etkinlik bildirimlerini devre dışı bırak" : "Bu etkinlik için bildirim kurulmasını talep et"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const isSubscribedAlready = subscribedEventIds.includes(evt.id);
                                        let updated: string[];
                                        if (isSubscribedAlready) {
                                          updated = subscribedEventIds.filter(id => id !== evt.id);
                                          setCalendarToast({
                                            message: "Alarm devreden çıkarıldı.",
                                            type: "info"
                                          });
                                          if (alertSoundOn && typeof playPluckSynth !== 'undefined') {
                                            playPluckSynth('click');
                                          }
                                        } else {
                                          updated = [...subscribedEventIds, evt.id];
                                          setCalendarToast({
                                            message: `"${evt.title}" için bildirim planlandı!`,
                                            type: "success"
                                          });
                                          if (alertSoundOn && typeof playPluckSynth !== 'undefined') {
                                            playPluckSynth('success');
                                          }

                                          // Connect dynamically to parent's notification system!
                                          if (onAddNotification) {
                                            const formattedTime = evt.time ? ` saat ${evt.time}'da` : '';
                                            onAddNotification({
                                              id: `evt-notif-auto-${evt.id}-${Date.now()}`,
                                              userId: currentUser?.id || 'visitor_user',
                                              type: 'newPost',
                                              title: `🔔 Takvim Alarmları: ${evt.title}`,
                                              description: `${evt.date} tarihindeki${formattedTime} ticari etkinlik ve canlı yayın için anlık hatırlatıcı kaydınız alındı.`,
                                              createdAt: new Date().toISOString(),
                                              isRead: false,
                                              link: !evt.id.startsWith('evt-') ? `article/${evt.id}` : undefined
                                            });
                                          }
                                        }
                                        setSubscribedEventIds(updated);
                                      }}
                                      className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                                        hasNotification
                                          ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200/50 dark:border-white/5 hover:text-amber-500 hover:border-amber-500/30'
                                      }`}
                                    >
                                      <Bell className={`w-3.5 h-3.5 ${hasNotification ? 'animate-bounce' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Dropdown Container */}
            {currentRole !== 'Visitor' && (
              <div className="relative">
                <button
                  id="bell-notif-btn"
                  onClick={() => {
                    setIsOpenNotifications(!isOpenNotifications);
                    setIsOpenProfileDropdown(false);
                  }}
                  className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-full transition-colors cursor-pointer focus:outline-none"
                  aria-label="Bildirimler"
                >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[9px] text-white font-bold flex items-center justify-center rounded-full animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isOpenNotifications && (
                  <motion.div
                    id="notifications-panel"
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-80 md:w-[380px] z-[9999]"
                  >
                    <div className="glass-panel rounded-2xl py-3 overflow-hidden relative shadow-2xl">
                    {/* Premium Gradient Accent Accent Stripe */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0D62FE] via-[#8B5CF6] to-[#FF4C1C]" />
                    
                    <div className="flex items-center justify-between px-4 pb-2.5 border-b border-zinc-150/50 dark:border-zinc-800/60">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-sans font-bold text-zinc-855 dark:text-zinc-50">Bildirimler</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-[#0D62FE] text-white rounded-full leading-none">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={onMarkAllNotificationsRead}
                          className="text-[10px] font-bold text-[#0D62FE] hover:text-[#a02dc2] dark:text-[#c456f2] dark:hover:text-[#da85fc] transition-colors cursor-pointer"
                        >
                          Tümünü Okundu İşaretle
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/40">
                      {nonEventNotifications.length === 0 ? (
                        <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
                          <div className="relative mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100/80 dark:border-white/5 shadow-sm">
                            <Bell className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#0D62FE]/80" />
                          </div>
                          <p className="text-xs font-sans font-bold text-zinc-800 dark:text-zinc-200">Kutunuz Tamamen Temiz</p>
                          <p className="text-[10.5px] font-sans text-zinc-450 dark:text-zinc-500 mt-1 max-w-[220px] leading-relaxed">
                            Güzel! Şu anda okunmamış herhangi bir bildirim veya güncellemeniz bulunmuyor.
                          </p>
                        </div>
                      ) : (
                        nonEventNotifications.map(notif => {
                          return (
                            <div
                              key={notif.id}
                              className={`relative flex gap-3.5 p-3.5 text-xs transition-all duration-200 cursor-pointer group/notif ${
                                notif.isRead 
                                  ? 'hover:bg-zinc-50/80 dark:hover:bg-white/[0.015]' 
                                  : 'bg-zinc-50/40 dark:bg-zinc-900/10 hover:bg-zinc-50 dark:hover:bg-white/[0.02]'
                              }`}
                              onClick={() => {
                                onMarkNotificationRead(notif.id);
                                if (notif.link) {
                                  onNavigate('article', { id: notif.link });
                                }
                                setIsOpenNotifications(false);
                              }}
                            >
                              {/* Left Glowing bar for unread notifications */}
                              {!notif.isRead && (
                                <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gradient-to-b from-[#0D62FE] to-[#FF4C1C]" />
                              )}

                              <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-[#0D62FE]/5 dark:bg-[#0D62FE]/10 border border-[#0D62FE]/15 text-[#0D62FE] group-hover/notif:bg-gradient-to-br group-hover/notif:from-[#0D62FE] group-hover/notif:to-[#8B5CF6] group-hover/notif:text-white group-hover/notif:border-transparent transition-all duration-300">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`font-bold text-[11.5px] leading-snug group-hover/notif:text-[#0D62FE] dark:group-hover/notif:text-[#da85fc] transition-colors ${
                                    notif.isRead ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-900 dark:text-white font-extrabold'
                                  }`}>
                                    {notif.title}
                                  </p>
                                  {!notif.isRead && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D62FE] shrink-0 mt-1.5 animate-pulse" />
                                  )}
                                </div>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[10.5px] leading-relaxed line-clamp-2">
                                  {notif.description}
                                </p>
                                <span className="text-[9px] font-sans font-medium text-zinc-400 dark:text-zinc-550 block mt-2">
                                  {new Date(notif.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            {/* User Profile dropdown */}
            {currentRole === 'Visitor' ? (
              <div className="flex items-center gap-3">
                <button
                  id="signin-action-btn"
                  onClick={onTriggerAuthModal}
                  className="md3-btn-filled py-2 px-4.5 text-xs font-bold"
                >
                  Giriş Yap
                </button>
              </div>
            ) : (
              <div className="relative group/profile py-2">
                <button
                  id="profile-dropdown-btn"
                  onClick={() => {
                    onNavigate('dashboard');
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer focus:outline-none"
                >
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageErrorGlobal(e, 'avatar')}
                  />
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                </button>

                <div 
                  id="profile-dropdown-menu" 
                  className="absolute right-0 top-[100%] pt-2 w-56 invisible opacity-0 scale-95 origin-top-right group-hover/profile:visible group-hover/profile:opacity-100 group-hover/profile:scale-100 transition-[opacity,transform] duration-150 ease-out z-[9999]"
                >
                    {/* Transparent pointer-hover helper to seal the physical boundary gap */}
                    <div className="absolute left-0 right-0 top-0 h-2 bg-transparent z-10" />

                    <div className="glass-panel rounded-2xl py-2 flex flex-col shadow-2xl overflow-hidden relative z-20">
                      <div className="px-4 py-2 border-b border-zinc-150/50 dark:border-zinc-800 mb-1 flex items-center justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">{currentUser?.name}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-1">@{currentUser?.username}</p>
                        </div>
                        <div className="shrink-0 scale-90 origin-right">
                          {getRoleBadge(currentRole)}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          onNavigate('profile', { userId: currentUser?.id });
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        Profilim
                      </button>

                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#0D62FE]" />
                        Panelim
                      </button>

                      {currentRole === 'Admin' && (
                        <button
                          onClick={() => {
                            onNavigate('system_admin');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-zinc-750 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-zinc-500" />
                          Sistem Admin
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onLogout) onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer transition-colors font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-500" />
                        Oturumu Kapat
                      </button>

                      <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
                      <div className="px-4 py-1.5">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-black">Aktif Rol Yetkisi</p>
                        <p className="text-[11px] font-sans font-semibold text-zinc-700 dark:text-zinc-300 mt-0.5">{currentRole === 'Admin' ? 'Sistem Yöneticisi' : currentRole === 'Editor' ? 'Küratör Editör' : currentRole === 'Writer' ? 'İçerik Yazarı' : 'Üye Okuyucu'}</p>
                      </div>
                    </div>
                </div>
            </div>
            )}

            {/* Mobile menu trigger */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setIsOpenMobile(!isOpenMobile)}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-full md:hidden transition-colors cursor-pointer"
              aria-label="Menü"
            >
              {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav Drawer */}
      {isOpenMobile && (
        <div id="mobile-drawer" className="md:hidden border-t border-zinc-150 dark:border-zinc-850 px-4 py-4 bg-white dark:bg-zinc-950 space-y-3 shadow-lg max-h-screen overflow-y-auto">
          <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Rol Yetki:</span>
            {getRoleBadge(currentRole)}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setIsOpenAboutModal(true); setIsOpenMobile(false); }}
              className="text-left px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 rounded-lg transition-colors col-span-1"
            >
              ℹ️ Hakkında
            </button>
            <button
              onClick={() => { setIsOpenKunyeModal(true); setIsOpenMobile(false); }}
              className="text-left px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 rounded-lg transition-colors col-span-1"
            >
              📋 Künye
            </button>
            {currentRole !== 'Visitor' && (
              <button
                onClick={() => { onNavigate('dashboard'); setIsOpenMobile(false); }}
                className="text-left px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors col-span-2 text-center"
              >
                Panelim (Giriş Yapıldı)
              </button>
            )}
          </div>

          {/* New Mobile Categories Grid */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
            <p className="text-[10px] font-black text-zinc-550 dark:text-zinc-300 uppercase tracking-wider mb-2 font-sans px-1">ÖNE ÇIKANLAR</p>
            
            {/* Keşfet Quick Actions */}
            <div className="grid grid-cols-3 gap-1.5 mb-4 px-0.5">
              <button 
                onClick={() => { onNavigate('writers'); setIsOpenMobile(false); }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-center cursor-pointer hover:bg-cyan-500/5"
              >
                <UserCheck className="w-4 h-4 text-cyan-500 mb-1" />
                <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Takip Edilenler</span>
              </button>
              <button 
                onClick={() => { onNavigate('articles'); setIsOpenMobile(false); }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-center cursor-pointer hover:bg-emerald-500/5"
              >
                <TrendingUp className="w-4 h-4 text-emerald-500 mb-1" />
                <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Popüler</span>
              </button>
              <button 
                onClick={() => { onNavigate('articles'); setIsOpenMobile(false); }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-center cursor-pointer hover:bg-purple-500/5"
              >
                <Sparkles className="w-4 h-4 text-purple-500 mb-1" />
                <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Öne Çıkanlar</span>
              </button>
            </div>

            <p className="text-[10px] font-black text-zinc-550 dark:text-zinc-300 uppercase tracking-wider mb-2 font-sans px-1">YAYIN TÜRLERİ</p>
            
            {/* Keşfet Quick Actions */}
            <div className="grid grid-cols-2 gap-1.5 mb-4 px-0.5">
              <button 
                onClick={() => { onNavigate('news'); setIsOpenMobile(false); }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-center cursor-pointer hover:bg-[#0D62FE]/5"
              >
                <TrendingUp className="w-4 h-4 text-[#0D62FE] mb-1" />
                <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Haberler</span>
              </button>
              <button 
                onClick={() => { onNavigate('articles'); setIsOpenMobile(false); }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-center cursor-pointer hover:bg-emerald-500/5"
              >
                <BookOpen className="w-4 h-4 text-emerald-500 mb-1" />
                <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Makaleler</span>
              </button>
              <button 
                onClick={() => { onNavigate('series'); setIsOpenMobile(false); }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-center cursor-pointer hover:bg-indigo-500/5"
              >
                <Layers className="w-4 h-4 text-indigo-500 mb-1" />
                <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Yazı Dizileri</span>
              </button>
              <button 
                onClick={() => { onNavigate('interviews'); setIsOpenMobile(false); }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-center cursor-pointer hover:bg-rose-500/5"
              >
                <MessageSquare className="w-4 h-4 text-rose-500 mb-1" />
                <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Röportajlar</span>
              </button>
              <button 
                onClick={() => { onNavigate('events'); setIsOpenMobile(false); }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-center cursor-pointer hover:bg-amber-500/5"
              >
                <Calendar className="w-4 h-4 text-amber-500 mb-1" />
                <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Etkinlikler</span>
              </button>
              <button 
                onClick={() => { onNavigate('writers'); setIsOpenMobile(false); }}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-center cursor-pointer hover:bg-cyan-500/5"
              >
                <UserCheck className="w-4 h-4 text-cyan-500 mb-1" />
                <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300">Yazarlar</span>
              </button>
            </div>

            {/* Kategoriler adının başında ikonlar olmalı */}
            <p className="text-[9px] font-black text-zinc-550 dark:text-zinc-300 tracking-wider mb-2 font-sans px-1">KATEGORİ VE KONULAR</p>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { onNavigate('articles', { category: cat.id }); setIsOpenMobile(false); }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 hover:bg-[#0D62FE]/5 border border-zinc-100/50 dark:border-zinc-800/40 text-left cursor-pointer"
                >
                  <div className="shrink-0 scale-95">
                    {getCategoryIcon(cat.icon, cat.id, cat.name)}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-sans font-bold text-zinc-800 dark:text-zinc-300 truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Yazarlar Section */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-black text-zinc-550 dark:text-zinc-300 tracking-wider font-sans">YAZARLAR</p>
              <button 
                onClick={() => { onNavigate('writers'); setIsOpenMobile(false); }}
                className="text-[10px] font-bold text-[#0D62FE] hover:underline cursor-pointer"
              >
                Tümü &rarr;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {writers.slice(0, 4).map(writer => (
                <button
                  key={writer.id}
                  onClick={() => { onNavigate('profile', { userId: writer.id }); setIsOpenMobile(false); }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 hover:bg-[#0D62FE]/5 border border-zinc-100/50 dark:border-zinc-800/40 text-left cursor-pointer"
                >
                  <img 
                    src={writer.avatar} 
                    alt={writer.name} 
                    className="w-6 h-6 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageErrorGlobal(e, 'avatar')}
                  />
                  <span className="text-[10px] sm:text-[11px] font-sans font-bold text-zinc-800 dark:text-zinc-300 truncate">{writer.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Yazı Dizileri Section */}
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-3 pb-1">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-[10px] font-black text-zinc-550 dark:text-zinc-300 tracking-wider font-sans">YAZI DİZİLERİ</p>
              <button 
                onClick={() => { onNavigate('explore'); setIsOpenMobile(false); }}
                className="text-[10px] font-bold text-[#0D62FE] hover:underline cursor-pointer"
              >
                Tümü &rarr;
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {series.slice(0, 3).map(ser => {
                const matchingArticles = articles.filter(a => a.seriesId === ser.id && a.status === 'Published');
                const firstArt = matchingArticles[0];
                return (
                  <button
                    key={ser.id}
                    onClick={() => {
                      if (firstArt) {
                        onNavigate('article', { id: firstArt.id });
                      } else {
                        onNavigate('explore');
                      }
                      setIsOpenMobile(false);
                    }}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100/50 dark:border-zinc-800/40 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-600 scale-90 shrink-0">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-sans font-bold text-zinc-800 dark:text-zinc-300 truncate">{ser.title}</span>
                    </div>
                    <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                      {matchingArticles.length} Yazı
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {(currentRole === 'Writer' || currentRole === 'Editor' || currentRole === 'Admin') && (
            <button
              onClick={() => { handleCreateArticleClick(); setIsOpenMobile(false); }}
              className="w-full flex items-center justify-center gap-2 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Yazmaya Başla
            </button>
          )}
        </div>
      )}

    </header>

    {/* Elegant About Us ("Hakkımızda") Philosophy Modal */}
    {isOpenAboutModal && (
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpenAboutModal(false);
        }}
        className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      >
        <div className="bg-white dark:bg-[#0c0f1d] border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-none">
          <button 
            onClick={() => setIsOpenAboutModal(false)}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-650 bg-zinc-100 dark:bg-zinc-800 rounded-full transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 dark:from-gold dark:to-bronze dark:bg-gradient-to-tr flex items-center justify-center shadow-md">
                <span className="text-white dark:text-zinc-950 font-serif font-black text-lg italic mt-[-2px]">W</span>
              </div>
              <div>
                <h3 className="text-xl font-serif font-black text-zinc-900 dark:text-white">WeTalks Platform Manifestosu</h3>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold uppercase tracking-widest mt-0.5">DÜRÜSTLÜK & KATMA DEĞER odakli di̇ji̇tal yayincilik</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
              <p>
                WeTalks; içi boşaltılmış, sürekli kendini tekrar eden e-ticaret kurslarından, yanıltıcı başarı hikayelerinden ve sponsorlu yüzeysel makalelerden sıkılan <strong className="text-zinc-950 dark:text-white font-bold">bağımsız girişimciler ve teknoloji uzmanları</strong> için kurulmuş premium bir içerik kütüphanesidir.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-105 dark:border-zinc-800">
                  <h4 className="font-serif font-bold text-zinc-900 dark:text-white text-xs mb-1.5">🌟 1. %100 Gerçek Deneyimler</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">Uydurma başarı iddiaları yerine satıcıların ve kurucuların bizzat yaşadığı zorluklar, kriz yönetimleri ve net rakamlar paylaşılan dürüst analizlerdir.</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-105 dark:border-zinc-800">
                  <h4 className="font-serif font-bold text-zinc-900 dark:text-white text-xs mb-1.5">🚫 2. Sıfır Clickbait Politika</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">Dikkat çekici aldatıcı başlıklar yerine okuyucunun zamanına saygı duyan doğrudan, dürüst ve derinlemesine akademik-sektörel anlatılar.</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-105 dark:border-zinc-800">
                  <h4 className="font-serif font-bold text-zinc-900 dark:text-white text-xs mb-1.5">⚡ 3. WeTalks Asistanı</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">Gemini 3.5 altyapısıyla küresel gündem sinyallerini tarayan, ilgi katsayılarına göre süzgeçten geçiren ve dürüst taslaklar üreten sistem editörü.</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-105 dark:border-zinc-800">
                  <h4 className="font-serif font-bold text-zinc-900 dark:text-white text-xs mb-1.5">⚙️ 4. Şeffaf Rol Yönetimi</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">Okurlar, yazarlar, editörler ve yöneticilerin her birinin sisteme değer katabildiği, yapıcı tartışmaların yorumlar üzerinden yürüdüğü ekosistem.</p>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 italic text-center pt-2">
                "Öğrenmeye, dürüst ticarete ve dürüst tecrübelere odaklanın. WeTalks size gerisini sağlayacaktır."
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end gap-2 text-xs">
              <button 
                onClick={() => setIsOpenAboutModal(false)}
                className="px-5 py-3 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold hover:opacity-90 cursor-pointer"
              >
                Manifestoyu Kabul Ediyorum
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Elegant Künye (Imprint) Modal */}
    {isOpenKunyeModal && (
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpenKunyeModal(false);
        }}
        className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200"
      >
        <div className="bg-white dark:bg-[#0c0f1d] border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-none">
          <button 
            onClick={() => setIsOpenKunyeModal(false)}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-650 bg-zinc-100 dark:bg-zinc-800 rounded-full transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D62FE] flex items-center justify-center shadow-md">
                <span className="text-white font-serif font-black text-lg italic mt-[-2px]">W</span>
              </div>
              <div>
                <h3 className="text-xl font-serif font-black text-zinc-900 dark:text-white">WeTalks Yayın Kadrosu & Künye</h3>
                <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-sans font-bold uppercase tracking-widest mt-0.5">YÖNETİM, EDİTÖR VE TEKNİK EKİP LİSTESİ</p>
              </div>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Çekirdek Kadro</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Orhan Balcı */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                  <img 
                    src={writers?.find(w => w.id === 'user_orhan' || w.name === 'Orhan Balcı')?.avatar || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200"} 
                    alt="Orhan Balcı" 
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all border border-zinc-200 dark:border-zinc-700" 
                  />
                  <div>
                    <h5 className="text-[13px] font-sans font-bold text-zinc-900 dark:text-white leading-tight">Orhan Balcı</h5>
                    <p className="text-[10.5px] text-[#0D62FE] font-semibold mt-0.5">Kurucu & Genel Yayın Yönetmeni</p>
                    <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 leading-none mt-1">E-Ticaret Girişimcisi</p>
                  </div>
                </div>

                {/* Elif Nazlı */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" 
                    alt="Elif Nazlı" 
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all border border-zinc-200 dark:border-zinc-700" 
                  />
                  <div>
                    <h5 className="text-[13px] font-sans font-bold text-zinc-900 dark:text-white leading-tight">Elif Nazlı</h5>
                    <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Pazarlama ve İletişim Sorumlusu</p>
                    <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 leading-none mt-1">Marka Pazarlama Uzmanı</p>
                  </div>
                </div>

                {/* Mehmet Yılmaz */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                  <img 
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200" 
                    alt="Mehmet Yılmaz" 
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all border border-zinc-200 dark:border-zinc-700" 
                  />
                  <div>
                    <h5 className="text-[13px] font-sans font-bold text-zinc-900 dark:text-white leading-tight">Mehmet Yılmaz</h5>
                    <p className="text-[10.5px] text-[#0D62FE] dark:text-[#5591FF] font-semibold mt-0.5">Teknoloji & Altyapı Direktörü</p>
                    <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 leading-none mt-1">Yazılım Geliştiricisi</p>
                  </div>
                </div>

                {/* Burak Yıldız */}
                <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
                    alt="Burak Yıldız" 
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all border border-zinc-200 dark:border-zinc-700" 
                  />
                  <div>
                    <h5 className="text-[13px] font-sans font-bold text-zinc-900 dark:text-white leading-tight">Burak Yıldız</h5>
                    <p className="text-[10.5px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">Ürün ve Tasarım Lideri</p>
                    <p className="text-[9.5px] text-zinc-450 dark:text-zinc-500 leading-none mt-1">Ürün Yöneticisi</p>
                  </div>
                </div>
              </div>

              {/* Seda Korkmaz & General Info row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 flex items-center gap-2.5 col-span-1">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" 
                    alt="Seda Korkmaz" 
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover shrink-0 grayscale" 
                  />
                  <div>
                    <h6 className="text-xs font-bold leading-tight">Seda Korkmaz</h6>
                    <p className="text-[9px] text-[#0D62FE] font-bold">Finans Danışmanı</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 col-span-2 text-[11px] font-sans text-zinc-500 dark:text-zinc-400 flex flex-col justify-center leading-normal">
                  <p>📧 <strong className="text-zinc-800 dark:text-zinc-200">İletişim:</strong> iletisim@wetalks.tr</p>
                  <p>📍 <strong className="text-zinc-800 dark:text-zinc-200">Adres:</strong> Levent Plaza, No: 173, Şişli, İstanbul</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-end gap-2 text-xs">
              <button 
                onClick={() => setIsOpenKunyeModal(false)}
                className="px-5 py-3 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold hover:opacity-90 cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// Inline helper to match view params and highlight the navbar active item correctly
function paramsMatch(view: string, categoryId: string): boolean {
  // Simple check for checking navbar selections
  return true; 
}
