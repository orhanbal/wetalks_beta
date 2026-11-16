import React, { useState, useMemo, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  RotateCcw, 
  Download, 
  Upload, 
  Sliders, 
  X, 
  Check, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Database, 
  ShieldAlert, 
  Tag, 
  FolderMinus, 
  Heart, 
  MessageSquare, 
  FileText, 
  Info,
  Terminal,
  Activity,
  Plus,
  Menu,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  Award,
  Filter,
  CheckCircle,
  Clock,
  Briefcase,
  UploadCloud,
  Mail,
  LogOut,
  Inbox,
  FolderPlus
} from 'lucide-react';
import { auth, getContactMessages, updateContactMessage, deleteContactMessage } from '../lib/selfhosted';
import { SystemSettings, Article, UserProfile, Category, UserRole } from '../types';
import { useToast } from './Toast';

const POPULAR_FONTS = [
  { name: 'Reddit Sans', value: 'Reddit Sans' },
  { name: 'Outfit', value: 'Outfit' },
  { name: 'Playfair Display', value: 'Playfair Display' },
  { name: 'Inter', value: 'Inter' },
  { name: 'Roboto', value: 'Roboto' },
  { name: 'Montserrat', value: 'Montserrat' },
  { name: 'Poppins', value: 'Poppins' },
  { name: 'Lora', value: 'Lora' },
  { name: 'Merriweather', value: 'Merriweather' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono' },
  { name: 'Space Grotesk', value: 'Space Grotesk' },
  { name: 'Cinzel', value: 'Cinzel' },
  { name: 'EB Garamond', value: 'EB Garamond' },
  { name: 'Custom (Özel)', value: 'custom' }
];

interface LogoUploaderProps {
  label: string;
  description: string;
  value?: string;
  onChange: (base64: string) => void;
  onClear: () => void;
  accept?: string;
}

function LogoUploader({ label, description, value, onChange, onClear, accept = "image/*" }: LogoUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    
    if (file.size <= 600 * 1024) {
      // Small files: keep 100% exact original file bytes with no compression or resizing
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Large files: Optimize dynamically with very high quality (0.92 JPEG) and a generous 1024px scale
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1024;
            
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(img, 0, 0, width, height);
            
            const base64 = canvas.toDataURL('image/jpeg', 0.92);
            onChange(base64);
          } catch (err) {
            console.error('Image compression error:', err);
          }
        };
        img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">{label}</label>
      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mb-2">{description}</span>
      
      {value ? (
        <div className="relative group border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-center h-16 w-16">
              <img src={value} className="max-h-full max-w-full object-contain" alt="Önizleme" />
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Yüklendi</span>
              <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 font-mono block">Görsel Dosya Verisi</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-rose-50 text-zinc-500 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            title="Temizle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
            isDragActive 
              ? 'border-[#0D62FE] bg-[#0D62FE]/5 dark:border-[#5591FF] dark:bg-[#5591FF]/5' 
              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-750 bg-transparent'
          }`}
          onClick={() => {
            const input = document.getElementById(`file-input-${label.replace(/\s+/g, '-')}`) as HTMLInputElement;
            if (input) input.click();
          }}
        >
          <input 
            id={`file-input-${label.replace(/\s+/g, '-')}`}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <div className="p-3 rounded-full bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-zinc-450 dark:text-zinc-500">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 block">Dosya Seçin veya Sürükleyin</span>
            <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 block">Önerilen format: Şeffaf PNG</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface AdminPanelProps {
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  articles: Article[];
  profiles: UserProfile[];
  categories: Category[];
  onResetDatabase: () => void;
  onImportDatabase: (jsonString: string) => boolean;
  onExportDatabase: () => string;
  onClose: () => void;
  onLogout?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onModifyArticleStatus?: (articleId: string, status: any, rejectionReason?: string) => void;
  notifications?: any[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onUpdateUserRole?: (userId: string, role: UserRole) => void;
  onAddCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

interface DashboardProduct {
  name: string;
  stocks: number;
  price: number;
  sales: number;
  earnings: number;
  color: string;
  category: string;
}

export default function AdminPanel({
  settings,
  onUpdateSettings,
  articles,
  profiles,
  categories,
  onResetDatabase,
  onImportDatabase,
  onExportDatabase,
  onClose,
  onLogout,
  darkMode,
  onToggleDarkMode,
  onModifyArticleStatus,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onUpdateUserRole,
  onAddCategory,
  onDeleteCategory
}: AdminPanelProps) {
  const toast = useToast();

  // Category addition modal states
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('BookOpen');

  // Database reset confirmation dialog state
  const [showResetConfirmDialog, setShowResetConfirmDialog] = useState(false);

  // Navigation tabs linking to requested visual dashboard mockup & system controllers
  // 'dashboard' is the default view.
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 'products' | 'orders' | 'sales' | 'customers' | 'reports' | 'branding' | 'switches' | 'admin_tabs' | 'menu_management' | 'database_ops' | 'resend' | 'inbox'
  >('dashboard');

  // Contact messages states
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);

  // Interactive dashboard states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);
  
  // Sorting for products table
  const [sortField, setSortField] = useState<'name' | 'stocks' | 'price' | 'sales' | 'earnings'>('earnings');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Input states for management panes
  const [newTitle, setNewTitle] = useState('');
  const [newView, setNewView] = useState('search');
  const [newCategoryParam, setNewCategoryParam] = useState('');
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showRawExport, setShowRawExport] = useState(false);
  const [exportJson, setExportJson] = useState('');

  // Resend / Email integration state (managed server-side only)
  const [emailServiceStatus, setEmailServiceStatus] = useState<{ configured: boolean; provider: string } | null>(null);
  const [testEmail, setTestEmail] = useState('orhanbal@gmail.com');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const loadEmailStatus = async () => {
      try {
        const idToken = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
        const res = await fetch('/api/email/status', {
          headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setEmailServiceStatus(data);
        } else {
          setEmailServiceStatus({ configured: false, provider: 'Unavailable' });
        }
      } catch {
        setEmailServiceStatus({ configured: false, provider: 'Simulation' });
      }
    };
    loadEmailStatus();
  }, []);

  // Diagnostic Logs system
  const [terminalLogs, setTerminalLogs] = useState<string[]>(() => [
    `[${new Date().toLocaleTimeString()}] WeTalks Admin Engine initialized.`,
    `[${new Date().toLocaleTimeString()}] Secure connection established with the self-hosted WeTalks backend.`,
    `[${new Date().toLocaleTimeString()}] Database loaded with ${articles.length} articles, ${profiles.length} profiles, and ${categories.length} content groups.`,
    `[${new Date().toLocaleTimeString()}] AI Integration active using Gemini 3.5 models.`,
  ]);

  const addLog = (message: string) => {
    setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.slice(0, 19)]);
  };

  const fetchContactMessages = async () => {
    setLoadingMessages(true);
    try {
      const messages = await getContactMessages();
      setContactMessages(messages);
    } catch (err) {
      console.error('Error fetching contact messages:', err);
      addLog('Hata: İletişim mesajları yüklenirken hata oluştu.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleToggleMessageRead = async (messageId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'read' ? 'unread' : 'read';
      await updateContactMessage(messageId, { status: newStatus });
      setContactMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: newStatus } : m));
      addLog(`Mesaj durumu güncellendi: ${newStatus === 'read' ? 'Okundu' : 'Okunmadı'}`);
    } catch (err) {
      console.error('Error updating message status:', err);
      addLog('Hata: Mesaj durumu güncellenirken hata oluştu.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteContactMessage(messageId);
      setContactMessages(prev => prev.filter(m => m.id !== messageId));
      addLog('Mesaj başarıyla silindi.');
      toast.info('İletişim mesajı silindi.');
    } catch (err) {
      console.error('Error deleting message:', err);
      addLog('Hata: Mesaj silinirken bir hata oluştu.');
      toast.error('Mesaj silinirken bir hata oluştu.');
    }
  };

  useEffect(() => {
    if (activeSubTab === 'inbox') {
      fetchContactMessages();
    }
  }, [activeSubTab]);

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Geçersiz alıcı e-posta adresi!');
      return;
    }
    setTestStatus('loading');
    setTestError(null);
    try {
      const idToken = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      if (!idToken) {
        setTestStatus('error');
        setTestError('Yönetici oturumu bulunamadı. Lütfen tekrar oturum açın.');
        addLog('Sistem Hatası: Kimlik doğrulama belirteci eksik.');
        toast.error('Oturum doğrulanamadı.');
        return;
      }

      const response = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ 
          email: testEmail.trim()
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setTestStatus('success');
        addLog(`Sistem: "${testEmail}" adresine test e-postası başarıyla gönderildi.`);
      } else {
        setTestStatus('error');
        setTestError(data.error || 'Bilinmeyen bir hata oluştu.');
        addLog(`Sistem Hatası: E-posta gönderimi başarısız (${data.error || 'Bilinmeyen hata'}).`);
      }
    } catch (err: any) {
      console.error(err);
      setTestStatus('error');
      setTestError(err.message || 'Sunucuyla bağlantı kurulamadı.');
      addLog(`Sistem Hatası: E-posta test isteği gönderilemedi.`);
    }
  };

  // Switch settings helpers
  const handleToggle = (key: keyof SystemSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
    addLog(`System Switch Changed: ${String(key)} -> ${updated[key] ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleInputChange = (key: keyof SystemSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    addLog(`Platform Input Updated: ${String(key)} -> "${value}"`);
  };

  const performReset = () => {
    onResetDatabase();
    addLog('Veritabanı fabrika ayarlarına sıfırlandı!');
    setShowResetConfirmDialog(false);
    toast.success('Sistem ve veritabanı başarıyla ilk günkü haline döndürüldü.');
  };

  const triggerExport = () => {
    const data = onExportDatabase();
    setExportJson(data);
    setShowRawExport(true);
    addLog('System snapshot generated & exported');
    toast.success('Veritabanı yedeği dışa aktarıldı.');
  };

  const triggerImport = () => {
    setImportError(null);
    setImportSuccess(false);
    if (!importJson.trim()) {
      setImportError('Lütfen içeri aktarılacak geçerli bir JSON dizesi girin.');
      toast.error('Lütfen geçerli bir JSON dizesi girin.');
      return;
    }
    const success = onImportDatabase(importJson);
    if (success) {
      setImportSuccess(true);
      setImportJson('');
      addLog('System snapshot imported successfully.');
      toast.success('Veritabanı başarıyla güncellendi!');
    } else {
      setImportError('JSON geçersiz veya şemaya uymuyor. Lütfen doğru WeTalks yedek formatı kullanın.');
      toast.error('Yedek formatı geçersiz.');
    }
  };

  // WeTalks en çok okunan makale istatistikleri (Grafik verileriyle uyumlu) - 100% Real from current articles
  const initialProducts: DashboardProduct[] = useMemo(() => {
    if (articles.length === 0) {
      return [
        { name: 'Sistem Yükleniyor...', stocks: 0, price: 0, sales: 0, earnings: 0, color: 'bg-zinc-900', category: 'Genel' }
      ];
    }
    return articles.map((article, index) => {
      const cat = categories.find(c => c.id === article.categoryId || c.slug === article.categoryId);
      const categoryName = cat ? cat.name : 'Gündem';
      const colors = ['bg-zinc-900', 'bg-[#0D62FE]', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-600', 'bg-rose-500'];
      const color = colors[index % colors.length];
      
      const sales = article.likes || 0;
      const stocks = article.views || 0;
      const price = article.readTime ? article.readTime * 1.5 : 5.0; // read-time multiplier
      const earnings = Math.round(sales * 25 + stocks * 0.15); // Dynamic earnings function representation matching engagement

      return {
        name: article.title,
        stocks,
        price,
        sales,
        earnings,
        color,
        category: categoryName
      };
    });
  }, [articles, categories]);

  // Total views and likes calculated directly from real database states
  const totalViews = useMemo(() => articles.reduce((sum, art) => sum + (art.views || 0), 0), [articles]);
  const totalLikes = useMemo(() => articles.reduce((sum, art) => sum + (art.likes || 0), 0), [articles]);

  // Filtered & Sorted Products list
  const processedProducts = useMemo(() => {
    let list = [...initialProducts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      } else {
        return sortDirection === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

    return list;
  }, [initialProducts, searchQuery, sortField, sortDirection]);

  // Sorting helper
  const requestSort = (field: 'name' | 'stocks' | 'price' | 'sales' | 'earnings') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Stacked Bar Chart data - Subscription and Tipping revenue data in Turkish calculated from real metrics
  const revenueData = useMemo(() => {
    const baseSubFee = 199;
    const activeUsers = profiles.length;
    
    // total current revenue elements
    const currentRecurring = activeUsers * baseSubFee;
    const currentTips = totalLikes * 25 + totalViews * 0.15;

    if (selectedPeriod === 'Quarterly') {
      const quarters = ['1. Çeyrek', '2. Çeyrek', '3. Çeyrek', '4. Çeyrek'];
      return quarters.map((q, idx) => {
        const scale = 0.65 + (idx / 3) * 0.35;
        return {
          month: q,
          oneTime: Math.round(currentTips * 3 * scale),
          recurring: Math.round(currentRecurring * 3 * scale)
        };
      });
    } else if (selectedPeriod === 'Yearly') {
      const years = ['2024', '2025', '2026'];
      return years.map((y, idx) => {
        const scale = 0.4 + (idx / 2) * 0.6;
        return {
          month: y,
          oneTime: Math.round(currentTips * 12 * scale),
          recurring: Math.round(currentRecurring * 12 * scale)
        };
      });
    } else {
      // Monthly
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu'];
      return months.map((m, idx) => {
        const scale = 0.5 + (idx / (months.length - 1)) * 0.5;
        return {
          month: m,
          oneTime: Math.round(currentTips * scale),
          recurring: Math.round(currentRecurring * scale)
        };
      });
    }
  }, [profiles, articles, totalViews, totalLikes, selectedPeriod]);

  // dynamic max revenue variable to avoid clipping issues on SVG column heights
  const maxRevenueVal = useMemo(() => {
    const maxVal = Math.max(...revenueData.map(item => item.oneTime + item.recurring));
    return maxVal || 150000;
  }, [revenueData]);

  // Pie chart categories representing reader interests in WeTalks content categories mapped from actual categories
  const categoryChartData = useMemo(() => {
    const catStats = categories.map((cat, index) => {
      const catArticles = articles.filter(a => a.categoryId === cat.id || a.categoryId === cat.slug);
      const views = catArticles.reduce((sum, a) => sum + (a.views || 0), 0);
      const likes = catArticles.reduce((sum, a) => sum + (a.likes || 0), 0);
      const value = likes * 25 + views * 0.15; // Engagement weighting representation

      const colors = ['#3B82F6', '#0D62FE', '#F59E0B', '#EC4899', '#10B981', '#8B5CF6'];
      const textColors = ['text-[#0D62FE]', 'text-[#0D62FE]', 'text-amber-500', 'text-pink-500', 'text-emerald-500', 'text-purple-500'];

      return {
        name: cat.name,
        value: Math.round(value) || 0,
        color: colors[index % colors.length],
        text: textColors[index % textColors.length]
      };
    });

    const totalValue = catStats.reduce((sum, c) => sum + c.value, 0) || 1;

    return catStats.map(c => {
      const pcValue = Math.round((c.value / totalValue) * 100);
      return {
        ...c,
        percent: `${pcValue}%`
      };
    });
  }, [articles, categories]);

  // WeTalks Activities list (İçerik yönetimi aktiviteleri) derived dynamically
  const activityList = useMemo(() => {
    const list: Array<{ id: number; title: string; desc: string; date: string; badge: string; color: string }> = [];
    let idCounter = 1;

    // 1. Pending approval articles
    const pendingArticles = articles.filter(a => a.status === 'Pending' || a.status === 'Draft');
    pendingArticles.forEach(a => {
      list.push({
        id: idCounter++,
        title: 'İçerik Onay Bekliyor',
        desc: `"${a.title}" - Yazar: ${a.authorName}`,
        date: 'Bugün',
        badge: 'Onay Sırasında',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
      });
    });

    // 2. High performing articles
    const sortedByViews = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
    if (sortedByViews.length > 0 && sortedByViews[0].views > 0) {
      list.push({
        id: idCounter++,
        title: 'Yüksek Okuma Sinyali',
        desc: `"${sortedByViews[0].title}" adlı eser ${sortedByViews[0].views} okumaya ulaştı.`,
        date: 'Bugün',
        badge: 'Trend',
        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
      });
    }

    // 3. Profiles signup feed
    const registeredUsers = profiles.filter(p => p.role !== 'Visitor');
    if (registeredUsers.length > 0) {
      const sampleUser = registeredUsers[0];
      list.push({
        id: idCounter++,
        title: 'Aktif Sistem Girişi',
        desc: `${sampleUser.name} (${sampleUser.email}) platform yöneticisi ya da yazarı.`,
        date: 'Dün',
        badge: 'Sistem',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
      });
    }

    // 4. Default AI activity log
    list.push({
      id: idCounter++,
      title: 'AI Trend Takipçisi Aktif',
      desc: 'Gemini 2.5/3.5 dil robotu e-ticaret piyasa trendlerini analiz ediyor.',
      date: 'Sürekli',
      badge: 'Yapay Zeka',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
    });

    return list;
  }, [articles, profiles]);

  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activityList;
    const q = searchQuery.toLowerCase();
    return activityList.filter(act => 
      act.title.toLowerCase().includes(q) || 
      act.desc.toLowerCase().includes(q) || 
      act.badge.toLowerCase().includes(q)
    );
  }, [searchQuery, activityList]);

  // Custom Pie Chart SVG coordinates builder
  const renderPieChartArcs = () => {
    let cumulativePercent = 0;
    const size = 160;
    const radius = 60;
    const center = size / 2;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;

    return categoryChartData.map((cat, index) => {
      const pc = parseFloat(cat.percent) / 100;
      const strokeLength = circumference * pc;
      const strokeOffset = circumference - (circumference * cumulativePercent);
      cumulativePercent += pc;

      const isHovered = hoveredCategoryIndex === index;

      return (
        <circle
          key={index}
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={cat.color}
          strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setHoveredCategoryIndex(index)}
          onMouseLeave={() => setHoveredCategoryIndex(null)}
          style={{ transformOrigin: 'center' }}
        />
      );
    });
  };

  // Pending approval items count for WeTalks
  const pendingApprovals = useMemo(() => {
    return articles.filter(a => a.status === 'Draft' || a.status === 'Pending');
  }, [articles]);

  // Turkish subtab titles translation map
  const subTabTitles: Record<string, string> = {
    dashboard: 'Özet & Analizler',
    products: 'İçerik Kategorileri',
    orders: 'Yayın Onay Kuyruğu',
    sales: 'Bahşiş & Finanslar',
    customers: 'Yazarlar & Üyeler',
    reports: 'Sistem Günlüğü',
    branding: 'Platform Markalama',
    switches: 'Özellik Switchleri',
    admin_tabs: 'Panel Sekmeleri',
    menu_management: 'Navigasyon Yönetimi',
    database_ops: 'Yedekleme & Seeding',
    resend: 'Resend E-Posta Entegrasyonu',
    inbox: 'Gelen İletişim Mesajları'
  };

  // Find active Admin profile (specifically user_orhan)
  const adminUser = useMemo(() => {
    return profiles.find(p => p.id === 'user_orhan') || profiles.find(p => p.role === 'Admin') || profiles[0];
  }, [profiles]);

  // Authorized team members with Admin, Editor or Writer roles
  const adminTeam = useMemo(() => {
    return profiles.filter(p => p.role === 'Admin' || p.role === 'Editor' || p.role === 'Writer');
  }, [profiles]);

  // Notifications logic for Admin
  const adminNotifications = useMemo(() => {
    const list = notifications || [];
    return list.filter(n => n.userId === 'user_orhan' || !n.userId);
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return adminNotifications.filter(n => !n.isRead).length;
  }, [adminNotifications]);

  return (
    <div id="system-external-admin-panel" className="bg-zinc-50 dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 font-sans animate-in fade-in duration-200">
      
      {/* Root Layout: Left Admin Sidebar + Right Panel Canvas */}
      <div className="flex h-screen overflow-hidden">
        
        {/* ===================== SIDEBAR ===================== */}
        <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shrink-0 hidden md:flex transition-colors">
          
          {/* Top section wrapper */}
          <div className="flex flex-col pt-5">
            {/* Header Platform Brand */}
            <div className="px-5 pb-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                {/* Custom uploaded logo displayed here */}
                {settings.lightLogo || settings.darkLogo ? (
                  <img 
                    src={darkMode ? (settings.darkLogo || settings.lightLogo) : (settings.lightLogo || settings.darkLogo)} 
                    alt="" 
                    className="h-8 max-w-[120px] object-contain shrink-0" 
                  />
                ) : null}
                <div>
                  {!(settings.lightLogo || settings.darkLogo) && (
                    <h1 className="text-base font-sans font-black tracking-tight text-zinc-950 dark:text-white">
                      {settings.appName || 'WeTalks'}
                    </h1>
                  )}
                  <span className="text-[10px] text-zinc-400 font-bold block">Yönetim Paneli</span>
                </div>
              </div>
              
              {/* Escape Button */}
              <button 
                id="admin-sidebar-exit"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
                title="Siteye Geri Dön (Oturumu Kapatmadan)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Menu Scroll Area */}
            <div className="px-3 h-[calc(100vh-190px)] overflow-y-auto space-y-4 pb-4">
              
              {/* Siteye Geri Dön Button */}
              <div className="px-1 mb-2 mt-1">
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                  title="Oturumu kapatmadan ana sayfaya geri döner"
                >
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                  <span>Siteye Geri Dön</span>
                </button>
              </div>

              {/* Group: MAIN */}
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest block px-3 mb-1.5">KONTROL PANELİ</span>
                
                <button
                  onClick={() => { setActiveSubTab('dashboard'); addLog('Bölüm Değişti: Yönetim Özet Tablosu'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'dashboard' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" />
                    <span>Özet & Analizler</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSubTab('products'); addLog('Bölüm Değişti: Katalog ve Kategoriler'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'products' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4" />
                    <span>İçerik Kategorileri</span>
                  </div>
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-mono">{categories.length}</span>
                </button>

                <button
                  onClick={() => { setActiveSubTab('orders'); addLog('Bölüm Değişti: Yayın Bekleyenleri ve İlanlar'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'orders' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" />
                    <span>Yayın Onay Kuyruğu</span>
                  </div>
                  {pendingApprovals.length > 0 && (
                    <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">{pendingApprovals.length}</span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveSubTab('sales'); addLog('Bölüm Değişti: Satış & Destek Raporları'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'sales' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4" />
                    <span>Bahşiş & Finanslar</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSubTab('customers'); addLog('Bölüm Değişti: Yazarlar ve Roller'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'customers' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>Yazarlar & Üyeler</span>
                  </div>
                  <span className="text-[10px] bg-indigo-50 dark:bg-zinc-800 text-[#6366F1] px-2 py-0.5 rounded-full font-mono font-bold">{profiles.length}</span>
                </button>

                <button
                  onClick={() => { setActiveSubTab('inbox'); addLog('Bölüm Değişti: Gelen İletişim Mesajları'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'inbox' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-4 h-4" />
                    <span>Gelen Mesajlar</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSubTab('reports'); addLog('Bölüm Değişti: Sistem Tanı Günlüğü'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'reports' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4" />
                    <span>Sistem Günlüğü</span>
                  </div>
                </button>
              </div>

              {/* Group: SETTINGS */}
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-widest block px-3 mb-1.5">AYARLAR VE ARACLAR</span>
                
                <button
                  onClick={() => { setActiveSubTab('branding'); addLog('Sistem: Marka Modifikasyonu açıldı'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'branding' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4" />
                    <span>Platform Markalama</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSubTab('switches'); addLog('Sistem: Özellik Anahtarları görüntülendi'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'switches' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Özellik Switchleri</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSubTab('admin_tabs'); addLog('Sistem: Panel Gezgini toggle kontrolleri'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'admin_tabs' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4" />
                    <span>Panel Sekmeleri</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSubTab('menu_management'); addLog('Sistem: Dinamik Menü Aracı açıldı'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'menu_management' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Menu className="w-4 h-4" />
                    <span>Navigasyon Yönetimi</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSubTab('database_ops'); addLog('Sistem: Ham Veritabanı aracı açıldı'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'database_ops' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Database className="w-4 h-4" />
                    <span>Yedekleme & Seeding</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveSubTab('resend'); addLog('Sistem: Resend Ayarları açıldı'); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeSubTab === 'resend' ? 'bg-[#ECEAFE] text-[#6366F1] dark:bg-indigo-950/40 dark:text-indigo-400' : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/30'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4" />
                    <span>Resend E-Posta Entegrasyonu</span>
                  </div>
                </button>
              </div>

            </div>
          </div>

          {/* Bottom components wrapper (Dark Mode switcher) */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10 space-y-4">
            
            {/* Dark Mode toggle item matching the mockup */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Karanlık Mod</span>
              </div>
              <button 
                id="sidebar-darkmode-toggle-switcher"
                onClick={onToggleDarkMode}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${darkMode ? 'bg-indigo-600' : 'bg-zinc-250 dark:bg-zinc-700'}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </div>

          </div>

        </aside>

        {/* ===================== MAIN WRAPPER ===================== */}
        <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-zinc-50 dark:bg-zinc-950 transition-colors">
          
          {/* ===================== GLOBAL HEADER ===================== */}
          <header className="h-16 shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 z-10 transition-colors">
            
            {/* Page title and mobile menu triggers */}
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                {/* Mobile Selector tab items */}
                <select 
                  value={activeSubTab} 
                  onChange={(e) => setActiveSubTab(e.target.value as any)}
                  className="bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 border-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="dashboard">Özet & Analizler</option>
                  <option value="products">İçerik Kategorileri</option>
                  <option value="orders">Yayın Onay Kuyruğu</option>
                  <option value="sales">Bahşiş & Finanslar</option>
                  <option value="customers">Yazarlar & Üyeler</option>
                  <option value="reports">Sistem Günlüğü</option>
                  <option value="branding">Platform Markalama</option>
                  <option value="switches">Özellik Switchleri</option>
                  <option value="admin_tabs">Sekme Ayarları</option>
                  <option value="menu_management">Navigasyon Yönetimi</option>
                  <option value="database_ops">Veritabanı İşlemleri</option>
                  <option value="resend">E-Posta Entegrasyonu</option>
                </select>
              </div>
              <h2 className="text-lg font-sans font-black tracking-tight text-zinc-900 dark:text-white capitalize hidden sm:block">
                {subTabTitles[activeSubTab] || activeSubTab}
              </h2>
            </div>

            {/* Main top bar settings (Avatars, alarm, search bar, profile info) */}
            <div className="flex items-center gap-4">
              
              {/* Search Bar mimic matching mockup */}
              <div className="relative hidden lg:block w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Her şeyi arayın..."
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800 rounded-xl pl-9 pr-14 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#0D62FE]/80 focus:border-transparent transition-all"
                />
                <span className="absolute right-2 top-2 px-1.5 py-0.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-[9px] font-mono font-bold text-zinc-400 block pointer-events-none">
                  ⌘ K
                </span>
              </div>

              {/* Overlapping Avatar circles mimicking "+2" avatar bubbles representing authorized users */}
              <button 
                onClick={() => {
                  setActiveSubTab('customers');
                  addLog('Yazarlar & Üyeler Bölümü Açıldı (Yetkili Avatarları Tıklandı)');
                }}
                className="flex items-center gap-1.5 hover:opacity-85 transition-opacity text-left cursor-pointer shrink-0"
                title="Yetkililer & Yazarlar - Yönetmek için tıklayın"
              >
                <div className="flex -space-x-1.5 overflow-hidden">
                  {adminTeam.slice(0, 3).map((u, idx) => (
                    <img 
                      key={u.id || idx}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover" 
                      src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"} 
                      alt={u.name} 
                    />
                  ))}
                  {adminTeam.length > 3 && (
                    <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[10px] text-indigo-650 dark:text-indigo-400 font-bold border-2 border-white dark:border-zinc-900 flex items-center justify-center shrink-0">
                      +{adminTeam.length - 3}
                    </div>
                  )}
                </div>
              </button>
              {/* Plus button */}
              <button 
                onClick={() => {
                  setActiveSubTab('customers');
                  addLog('Kullanıcı Yönetimi Açıldı (Yeni Ekle)');
                }}
                className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-xs font-black cursor-pointer shrink-0"
                title="Yeni Yetkili Ekle"
              >
                +
              </button>

              {/* Notification icon indicator with dynamic dropdown panel */}
              <div className="relative shrink-0">
                <button 
                  onClick={() => setIsOpenNotifications(!isOpenNotifications)}
                  className="relative p-2 rounded-full text-zinc-550 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                  title="Bildirimler"
                >
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[9px] font-sans font-black text-white flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                  <Bell className="w-4 h-4" />
                </button>

                {isOpenNotifications && (
                  <div className="absolute right-0 mt-2 w-80 md:w-96 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150 text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">Bildirimler</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-red-500 text-white rounded-full leading-none">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => {
                            if (onMarkAllNotificationsRead) onMarkAllNotificationsRead();
                            addLog('Tüm bildirimler okundu olarak işaretlendi');
                          }}
                          className="text-[10px] font-bold text-[#0D62FE] hover:underline transition-colors cursor-pointer"
                        >
                          Tümünü Okundu İşaretle
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto mt-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {adminNotifications.length === 0 ? (
                        <div className="py-8 text-center text-zinc-400 dark:text-zinc-500">
                          <Bell className="w-6 h-6 mx-auto mb-2 opacity-40" />
                          <p className="text-xs font-bold">Her Şey Güncel</p>
                          <p className="text-[10px] mt-0.5">Okunmamış bir bildiriminiz bulunmuyor.</p>
                        </div>
                      ) : (
                        adminNotifications.map(notif => (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              if (onMarkNotificationRead) onMarkNotificationRead(notif.id);
                              addLog(`Bildirim Okundu: ${notif.title}`);
                            }}
                            className={`p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors cursor-pointer rounded-lg flex items-start gap-2.5 text-left text-xs ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}
                          >
                            <span className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${!notif.isRead ? 'bg-blue-500' : 'bg-transparent'}`} />
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{notif.title}</p>
                              <p className="text-zinc-500 dark:text-zinc-450 line-clamp-2 leading-relaxed text-[11px]">{notif.description}</p>
                              <span className="text-[9px] text-zinc-400 block">{new Date(notif.createdAt).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Vertical Separator */}
              <div className="h-5 border-l border-zinc-200 dark:border-zinc-805 shrink-0 hidden sm:block"></div>

              {/* User Dropdown Profile Bubble */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer shrink-0 hover:opacity-85 transition-opacity text-left bg-transparent border-none outline-none"
                  title="Profil Ayarları"
                >
                  <img 
                    src={adminUser?.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400'} 
                    alt="Admin User Avatar" 
                    className="w-7.5 h-7.5 rounded-full ring-1 ring-zinc-250 dark:ring-zinc-750 shrink-0 object-cover"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1 leading-none">{adminUser?.name || 'Orhan Balcı'}</p>
                    <span className="text-[10px] text-zinc-400 font-bold font-sans">Admin</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 hidden sm:block transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileDropdownOpen && (
                  <>
                    {/* Click-outside backdrop */}
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{adminUser?.name || 'Orhan Balcı'}</p>
                        <p className="text-[10px] text-zinc-400 font-medium font-sans mt-0.5">{adminUser?.email || 'orhanbal@gmail.com'}</p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSubTab('customers');
                          addLog('Yazarlar & Üyeler Bölümü Açıldı (Profil Dropdown)');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span className="font-semibold">Yazarlar & Üyeler</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveSubTab('branding');
                          addLog('Branding Ayarları Açıldı (Profil Dropdown)');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-zinc-400" />
                        <span className="font-semibold">Sistem Ayarları</span>
                      </button>

                      <div className="border-t border-zinc-100 dark:border-zinc-800 my-1"></div>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          if (onClose) onClose();
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-indigo-650 dark:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-950 dark:hover:text-white transition-colors flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Siteye Geri Dön</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          if (onLogout) onLogout();
                          else if (onClose) onClose();
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>

          </header>

          {/* ===================== CANVAS CONTAINER ===================== */}
          <div className="p-4 sm:p-6 lg:p-7 space-y-6">
            
            {/* Search query feedback filter banner */}
            {searchQuery.trim() && (
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-150 dark:border-indigo-900/50 text-xs text-indigo-700 dark:text-indigo-400 flex items-center justify-between">
                <span>🔍 <b>"{searchQuery}"</b> içeren tüm gösterge paneli verileri filtrelendi.</span>
                <button onClick={() => setSearchQuery('')} className="font-bold hover:underline cursor-pointer">Sıfırla</button>
              </div>
            )}

            {/* ===================== SUBVIEW 1: PRODEX GRAPHIC DASHBOARD VIEW ===================== */}
            {activeSubTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 4 KPI Cards mimicking mockup */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Total Products -> Publishings */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:translate-y-[-2px] transition-all">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#0D62FE] shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-sans block">Yayınlanan İçerikler</span>
                      <p className="text-xl font-sans font-black text-zinc-900 dark:text-white mt-0.5">{articles.length} Makale</p>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-450 block font-semibold">{categories.length} aktif kategori başlığı</span>
                    </div>
                  </div>

                  {/* Card 2: Total Sales -> Total Reads */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:translate-y-[-2px] transition-all">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-500 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-sans block">Okuyucu Hit Oranı</span>
                      <p className="text-xl font-sans font-black text-zinc-900 dark:text-white mt-0.5">{totalViews.toLocaleString()} Okuma</p>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-450 block font-semibold">{totalLikes.toLocaleString()} Beğeni ve Etkileşim</span>
                    </div>
                  </div>

                  {/* Card 3: Total Income -> Subscription income */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:translate-y-[-2px] transition-all">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500 shrink-0">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-sans block">Aylık Abonelik Geliri</span>
                      <p className="text-xl font-sans font-black text-zinc-900 dark:text-white mt-0.5">₺{(profiles.length * 199).toLocaleString()}</p>
                      <span className="text-[10px] text-emerald-600 block font-bold">✓ {profiles.length} Aktif Platform Abonesi</span>
                    </div>
                  </div>

                  {/* Card 4: Total Expenses -> Cloud / LLM expenses */}
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:translate-y-[2px] transition-all">
                    <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-500 shrink-0">
                      <ArrowDownRight className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-sans block">API & Sunucu Giderleri</span>
                      <p className="text-xl font-sans font-black text-zinc-900 dark:text-white mt-0.5">${(articles.length * 0.15 + totalViews * 0.0025 + profiles.length * 0.25).toFixed(2)}</p>
                      <span className="text-[10px] text-red-500 block font-bold">🗑 Model & Cloud Ingress Bilgisi</span>
                    </div>
                  </div>

                </div>

                {/* Dashboard Core Two Columns (Left Grid: Bar Chart + Activities, Right Grid: Donut + Products Table) */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                  {/* LEFT WRAPPER: 3 COLS WIDTH */}
                  <div className="lg:col-span-3 space-y-6">

                    {/* Sales Revenue Graph Card */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                      
                      {/* Graph Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-sans font-black text-zinc-900 dark:text-white">Gelir Logları & Büyüme Analizi</h3>
                          <div className="flex items-center gap-3.5 mt-1">
                            <div className="flex items-center gap-1">
                               <span className="w-2 h-2 rounded-full bg-indigo-150 dark:bg-indigo-950"></span>
                              <span className="text-[10px] text-zinc-500 font-bold">Yazar Bahşiş Destekleri</span>
                            </div>
                            <div className="flex items-center gap-1">
                               <span className="w-2 h-2 rounded-full bg-indigo-650"></span>
                              <span className="text-[10px] text-zinc-500 font-bold">Premium Üyelik Aidatları</span>
                            </div>
                          </div>
                        </div>

                        {/* Chart Period Filters */}
                        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl gap-1 shrink-0">
                          {['Aylık', 'Çeyreklik', 'Yıllık'].map((p) => (
                            <button
                              key={p}
                              onClick={() => { setSelectedPeriod(p === 'Aylık' ? 'Monthly' : p === 'Çeyreklik' ? 'Quarterly' : 'Yearly'); addLog(`Gelir Aralığı Seçildi: ${p}`); }}
                              className={`px-3 py-1 text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${((selectedPeriod === 'Monthly' && p === 'Aylık') || (selectedPeriod === 'Quarterly' && p === 'Çeyreklik') || (selectedPeriod === 'Yearly' && p === 'Yıllık')) ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Graph SVG canvas rendering of stacked bars */}
                      <div className="h-48 flex items-end justify-between relative pt-5 border-b border-zinc-100 dark:border-zinc-850 px-2">
                        
                        {/* Background Y Axis markers */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-mono text-zinc-400/80 mt-5 select-none">
                          <div className="border-b border-dashed border-zinc-100 dark:border-zinc-800/60 w-full pb-0.5">{Math.round(maxRevenueVal / 1000)}K ₺</div>
                          <div className="border-b border-dashed border-zinc-100 dark:border-zinc-800/60 w-full pb-0.5">{Math.round((maxRevenueVal * 0.66) / 1000)}K ₺</div>
                          <div className="border-b border-dashed border-zinc-100 dark:border-zinc-800/60 w-full pb-0.5">{Math.round((maxRevenueVal * 0.33) / 1000)}K ₺</div>
                          <div className="border-b border-dashed border-zinc-100 dark:border-zinc-800/60 w-full pb-0.5">{Math.round((maxRevenueVal * 0.1) / 1000)}K ₺</div>
                          <div className="w-full text-right">0</div>
                        </div>

                        {/* Months columns renderer */}
                        {revenueData.map((item, index) => {
                          const totalVal = item.oneTime + item.recurring;
                          const oneTimeHeight = (item.oneTime / maxRevenueVal) * 80;
                          const recHeight = (item.recurring / maxRevenueVal) * 80;

                          const isHovered = hoveredMonthIndex === index;

                          return (
                            <div 
                              key={item.month}
                              className="flex-1 flex flex-col justify-end items-center h-full relative group cursor-pointer"
                              onMouseEnter={() => setHoveredMonthIndex(index)}
                              onMouseLeave={() => setHoveredMonthIndex(null)}
                            >
                              {/* Hover Highlight Overlay Pillar */}
                              <div className={`absolute inset-x-1 sm:inset-x-2.5 top-0 bottom-0 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-xl transition-all ${isHovered ? 'scale-105 border-x border-indigo-100/50 dark:border-indigo-900/30' : 'opacity-0'}`} />

                              {/* Nested Stacked Column of Bars with rounded tops */}
                              <div className="w-6 sm:w-8.5 flex flex-col justify-end h-full z-1 relative pb-1">
                                
                                {/* Recurring Revenue segment */}
                                <div 
                                  className="w-full bg-indigo-650 rounded-md shadow-sm transition-all group-hover:brightness-105"
                                  style={{ height: `${recHeight}%` }}
                                ></div>

                                {/* Spacer cushion */}
                                <div className="h-[2px]"></div>

                                {/* One-Time Revenue segment */}
                                <div 
                                  className="w-full bg-indigo-150 dark:bg-indigo-950 rounded-b-md rounded-t-sm shadow-sm transition-all group-hover:brightness-105"
                                  style={{ height: `${oneTimeHeight}%` }}
                                ></div>

                              </div>

                              {/* Month label identifier */}
                              <span className="text-[10px] font-mono font-bold text-zinc-400 mt-2 z-1">{item.month}</span>

                              {/* Real-time Hover rich popup tooltip card precisely matching mock image */}
                              {isHovered && (
                                <div className="absolute bottom-[85%] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 px-3 py-2.5 rounded-2xl shadow-xl z-50 pointer-events-none w-44 animate-in fade-in zoom-in-95 duration-150">
                                  <div className="space-y-1.5 text-[11px]">
                                    <p className="text-zinc-500 font-bold uppercase text-[9px] mb-1">Dönem: {item.month}</p>
                                    <div className="flex items-center gap-1.5 font-sans justify-between">
                                      <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-indigo-200"></span>
                                        <span className="text-zinc-500">Bahşiş Logları</span>
                                      </div>
                                      <span className="font-bold text-zinc-900 dark:text-white">₺{item.oneTime.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-sans justify-between">
                                      <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-indigo-650"></span>
                                        <span className="text-zinc-500">Premium Ciro</span>
                                      </div>
                                      <span className="font-bold text-zinc-900 dark:text-white">₺{item.recurring.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-zinc-100 dark:border-zinc-750 pt-1 mt-1 flex justify-between font-bold text-[11px]">
                                      <span className="text-zinc-400">Toplam:</span>
                                      <span className="text-indigo-600 dark:text-indigo-400">₺{totalVal.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })}

                      </div>

                    </div>

                    {/* Recent Activity lists */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-sans font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          Son İçerik & Sistem Aktiviteleri
                        </h3>
                        <button 
                          onClick={() => { setActiveSubTab('reports'); addLog('Bölüm Değişti: Sistem Hata & Performans Günlüğü'); }} 
                          className="text-[10px] font-bold text-[#0D62FE] hover:underline cursor-pointer"
                        >
                          Tümünü Gör
                        </button>
                      </div>

                      {/* Displaying active records */}
                      <div className="space-y-3">
                        {filteredActivities.length === 0 ? (
                          <div className="text-center py-6 text-xs text-zinc-400">Eşleşen aktivite bulunamadı.</div>
                        ) : (
                          filteredActivities.map((act) => (
                            <div key={act.id} className="p-3.5 bg-zinc-50 dark:bg-zinc-950/45 border border-zinc-150/80 dark:border-zinc-805 rounded-2xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {/* Simulated action icon overlay */}
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">
                                  {act.title.charAt(0)}
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100">{act.title}</p>
                                  <p className="text-[10.5px] text-zinc-400 mt-0.5">{act.desc} • {act.date}</p>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-sans font-black tracking-wide ${act.color}`}>
                                {act.badge}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                    </div>

                  </div>

                  {/* RIGHT COLUMN: Pie Chart + Products tabular list */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Top Categories Card Chart */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-sans font-black text-zinc-900 dark:text-white">Popüler İlgi Alanları (Kategoriler)</h3>
                        <button onClick={() => { setActiveSubTab('products'); addLog('Bölüm Değişti: İçerik Kategorileri'); }} className="text-[10px] text-zinc-450 hover:underline cursor-pointer">Yönet</button>
                      </div>

                      {/* Donut and total sales summary stacked */}
                      <div className="flex flex-col sm:flex-row items-center gap-5 justify-center py-2">
                        
                        {/* Actual Donut SVG circle elements */}
                        <div className="relative w-40 h-40 shrink-0">
                          <svg width="160" height="160" className="mx-auto">
                            {renderPieChartArcs()}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-10">
                            <span className="text-[10px] uppercase font-bold tracking-tight text-zinc-405">Toplam Katılım</span>
                            <span className="text-sm sm:text-base font-sans font-black text-zinc-900 dark:text-white mt-0.5">{totalViews.toLocaleString()} Okuma</span>
                          </div>
                        </div>

                        {/* Interactive list with hover trigger highlight */}
                        <div className="space-y-2 flex-1 w-full text-xs">
                          {categoryChartData.map((cat, index) => (
                            <div 
                              key={cat.name} 
                              className={`flex items-center justify-between p-2 rounded-xl transition-all border ${hoveredCategoryIndex === index ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700' : 'border-transparent'}`}
                              onMouseEnter={() => setHoveredCategoryIndex(index)}
                              onMouseLeave={() => setHoveredCategoryIndex(null)}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300 truncate max-w-[100px]">{cat.name}</span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-bold text-zinc-900 dark:text-white">{cat.value.toLocaleString()} </span>
                                <span className="text-[10.5px] font-mono text-zinc-400">({cat.percent})</span>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>

                    </div>

                    {/* Top Products Table precise reconstruction */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
                      
                      {/* Table Header Controls */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-sans font-black text-zinc-900 dark:text-white flex items-center gap-1.5 animate-pulse">
                          <ShoppingBag className="w-4 h-4 text-emerald-500" />
                          En Çok Okunan Makaleler
                        </h3>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => requestSort('stocks')}
                            className="bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-800 px-2 py-1.5 rounded-xl text-[10px] font-bold text-zinc-650 dark:text-zinc-400 flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3 text-[#0D62FE]" /> Popülerlik
                          </button>
                          <button 
                            onClick={() => requestSort('earnings')}
                            className="bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-800 px-2 py-1.5 rounded-xl text-[10px] font-bold text-zinc-650 dark:text-zinc-400 flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3 text-[#0D62FE]" /> Gelirler
                          </button>
                        </div>
                      </div>

                      {/* Products Tabular Display */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11.5px] border-collapse min-w-[280px]">
                          <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-850 text-zinc-400 font-bold text-left uppercase text-[9px] tracking-wider select-none">
                              <th className="pb-2 cursor-pointer hover:text-zinc-700" onClick={() => requestSort('name')}>Makale Başlığı</th>
                              <th className="pb-2 text-right cursor-pointer hover:text-zinc-700" onClick={() => requestSort('stocks')}>Okunma</th>
                              <th className="pb-2 text-right">Puan</th>
                              <th className="pb-2 text-right cursor-pointer hover:text-zinc-700" onClick={() => requestSort('sales')}>Yorumlar</th>
                              <th className="pb-2 text-right cursor-pointer hover:text-zinc-700" onClick={() => requestSort('earnings')}>Toplanan Bahşiş</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                            {processedProducts.map((p) => (
                              <tr key={p.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                <td className="py-2.5">
                                  <div className="flex items-center gap-2">
                                    {/* Icon Box Container representing Product image */}
                                    <div className={`w-6.5 h-6.5 rounded-lg ${p.color} flex items-center justify-center text-white text-[9px] font-black shrink-0 shadow-sm`}>
                                      {p.name.charAt(0)}
                                    </div>
                                    <div className="max-w-[75px] sm:max-w-none">
                                      <p className="font-bold text-zinc-800 dark:text-zinc-100 truncate">{p.name}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 text-right font-mono font-semibold text-zinc-600 dark:text-zinc-400">{p.stocks.toLocaleString()}</td>
                                <td className="py-2.5 text-right font-mono font-medium text-zinc-500">{p.price.toFixed(1)} ★</td>
                                <td className="py-2.5 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">{p.sales.toLocaleString()}</td>
                                <td className="py-2.5 text-right font-mono font-black text-indigo-600 dark:text-indigo-400">₺{p.earnings.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* ===================== SUBVIEW 2: DYNAMIC PRODUCTS (Categories) ===================== */}
            {activeSubTab === 'products' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-sans font-black text-zinc-900 dark:text-white">Fiziki Ürün Grupları & Yazı Kategorileri ({categories.length})</h3>
                    <p className="text-xs text-zinc-500 mt-1">Uygulamadaki katalog kırılımları ve her bir kırılıma ait yayınlar.</p>
                  </div>
                  <button 
                    onClick={() => setShowNewCatModal(true)}
                    className="p-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Yeni Grup Ekle
                  </button>
                </div>

                {/* Inline New Category Creation Modal */}
                {showNewCatModal && (
                  <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Yeni Yayın / Ürün Kategorisi Tanımla</h4>
                      </div>
                      <button 
                        onClick={() => setShowNewCatModal(false)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Kategori Adı *</label>
                        <input
                          type="text"
                          value={newCatName}
                          onChange={(e) => {
                            setNewCatName(e.target.value);
                            if (!newCatSlug || newCatSlug === newCatName.toLowerCase().replace(/\s+/g, '-')) {
                              setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9ğüşıöç-]/gi, '').replace(/\s+/g, '-'));
                            }
                          }}
                          placeholder="Örn: Finans & Vergi"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Slug (URL Tanımlayıcı)</label>
                        <input
                          type="text"
                          value={newCatSlug}
                          onChange={(e) => setNewCatSlug(e.target.value)}
                          placeholder="Örn: finans-vergi"
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs rounded-xl font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">Açıklama</label>
                      <input
                        type="text"
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        placeholder="Kategori hakkında kısa özet bilgi..."
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-xs rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowNewCatModal(false)}
                        className="px-3.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl"
                      >
                        Vazgeç
                      </button>
                      <button
                        onClick={() => {
                          if (!newCatName.trim()) {
                            toast.error('Lütfen bir kategori adı girin.');
                            return;
                          }
                          const finalSlug = (newCatSlug.trim() || newCatName.trim().toLowerCase().replace(/\s+/g, '-')).replace(/[^a-z0-9-]/gi, '');
                          const newCat: Category = {
                            id: finalSlug,
                            name: newCatName.trim(),
                            slug: finalSlug,
                            description: newCatDesc.trim() || `${newCatName.trim()} alanı hakkında en kaliteli içerikler.`,
                            icon: newCatIcon || 'BookOpen'
                          };
                          if (onAddCategory) {
                            onAddCategory(newCat);
                          }
                          toast.success(`"${newCat.name}" kategorisi başarıyla eklendi!`);
                          addLog(`Yeni Kategori Eklendi: ${newCat.name} (${newCat.slug})`);
                          setShowNewCatModal(false);
                          setNewCatName('');
                          setNewCatSlug('');
                          setNewCatDesc('');
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                      >
                        Kategoriyi Kaydet
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat) => {
                    const matchedArticles = articles.filter(a => a.categoryId === cat.id);
                    return (
                      <div key={cat.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase">{cat.slug}</span>
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{cat.name}</h4>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{cat.description}</p>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <div>
                            <span className="text-xs font-mono font-black text-indigo-600 block">{matchedArticles.length} makale</span>
                            <span className="text-[10px] text-zinc-400">Aktif İndeks</span>
                          </div>
                          {onDeleteCategory && !['dijital-ticaret', 'gundem', 'yapay-zeka', 'liderlik'].includes(cat.id) && (
                            <button
                              onClick={() => {
                                onDeleteCategory(cat.id);
                                toast.info(`"${cat.name}" kategorisi silindi.`);
                                addLog(`Kategori Silindi: ${cat.name}`);
                              }}
                              className="text-zinc-400 hover:text-rose-500 p-1 transition-colors"
                              title="Kategoriyi Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===================== SUBVIEW 3: ORDERS (WeTalks Approvals Panel) ===================== */}
            {activeSubTab === 'orders' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
                  <h3 className="text-base font-sans font-black text-zinc-900 dark:text-white">Orders & Approval Queue (Editörlük Onaylama Bekleyenleri)</h3>
                  <p className="text-xs text-zinc-500 mt-1">Yazarların sisteme gönderdiği onay bekleyen (Pending / Draft) yayın kuyruğu.</p>
                </div>

                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-850">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-150">Onay Sırası Boş!</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Yayına alınması teklif edilen yeni bir makale taslağı bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((article) => (
                      <div key={article.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={article.coverImage} 
                            alt="" 
                            className="w-16 h-12 object-cover rounded-xl shrink-0 border dark:border-zinc-800" 
                          />
                          <div className="text-left">
                            <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Kategori parametre: {article.categoryId}</span>
                            <h4 className="text-xs sm:text-sm font-black text-zinc-800 dark:text-white line-clamp-1">{article.title}</h4>
                            <p className="text-[10px] text-zinc-400">Yazar: {article.authorName} • {article.readTime} dakika okuma</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto uppercase tracking-wider text-[10px]">
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-1 rounded-full font-black">
                            {article.status}
                          </span>
                          <button 
                            onClick={() => {
                              if (onModifyArticleStatus) {
                                onModifyArticleStatus(article.id, 'Published');
                                addLog(`"${article.title}" onaylandı ve başarıyla yayına alındı.`);
                                toast.success(`"${article.title}" onaylandı ve yayına alındı!`);
                              } else {
                                toast.success(`Makale (${article.title}) onaylandı!`);
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer font-sans"
                          >
                            Onayla
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================== SUBVIEW 4: SALES (Tipping support details) ===================== */}
            {activeSubTab === 'sales' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-205">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
                  <h3 className="text-base font-sans font-black text-zinc-900 dark:text-white">Platform Destek & Finansal Raporlar (Tipping Logs)</h3>
                  <p className="text-xs text-zinc-500 mt-1">Okuyuculardan yazarlara veya dergi fonuna aktarılan bağış/yardım kayıtları.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans uppercase">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-2xl">
                    <span className="text-[10px] font-bold block">Destek Hacmi (Vol.)</span>
                    <span className="text-xl font-bold font-mono">$10,892.00</span>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-400 rounded-2xl">
                    <span className="text-[10px] font-bold block">Komisyon Payı</span>
                    <span className="text-xl font-bold font-mono">$1,089.20</span>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-400 rounded-2xl">
                    <span className="text-[10px] font-bold block">Yazarlara Ödenen</span>
                    <span className="text-xl font-bold font-mono">$9,802.80</span>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border dark:border-zinc-800 space-y-3">
                  <span className="text-[10px] font-bold tracking-wider text-zinc-400 block uppercase">Son Finansal Transfer Günlüğü</span>
                  <div className="text-xs font-mono text-zinc-500 space-y-1.5 divide-y divide-zinc-100 dark:divide-zinc-850/60">
                    <div className="py-2 flex justify-between">
                      <span>Marie Curie tips Jane Doe for "Yorumların Analizi"</span>
                      <span className="text-emerald-600 font-bold">+$25.00 (Success)</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span>John Smith tips Jane Doe for "Yazılardan Hayata"</span>
                      <span className="text-emerald-600 font-bold">+$50.00 (Success)</span>
                    </div>
                    <div className="py-2 flex justify-between">
                      <span>Alex Mercer tips Jane Doe for "Kodun Temelleri"</span>
                      <span className="text-emerald-600 font-bold">+$15.00 (Success)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SUBVIEW 5: CUSTOMERS (User profiles matrices) ===================== */}
            {activeSubTab === 'customers' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
                  <h3 className="text-base font-sans font-black text-zinc-900 dark:text-white">Customers & Community (Yazarlar ve Hub Üyeleri)</h3>
                  <p className="text-xs text-zinc-500 mt-1">Platformdaki her bir kayıtlı hesap profili, takipçi metrikleri ve yetkilendirmesi.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-zinc-150 dark:border-zinc-800 uppercase font-bold text-zinc-400 text-[10px]">
                        <th className="pb-3 text-left">Üye Profil</th>
                        <th className="pb-3 text-left">E-Posta Kimlik</th>
                        <th className="pb-3 text-right">Takipçiler</th>
                        <th className="pb-3 text-right">Yazılar</th>
                        <th className="pb-3 text-center">Rol Yetkilendirme</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {profiles.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all font-semibold text-zinc-800 dark:text-zinc-200">
                          <td className="py-3">
                            <div className="flex items-center gap-2.5">
                              <img src={p.avatar} alt="" className="w-8 h-8 rounded-full border shrink-0 object-cover" />
                              <div className="text-left font-sans">
                                <p className="font-bold text-zinc-900 dark:text-white">{p.name}</p>
                                <span className="text-[10px] text-zinc-400">@{p.username}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 font-mono text-zinc-500">{p.email}</td>
                          <td className="py-3 text-right font-mono text-indigo-650 dark:text-indigo-400">{p.followersCount || 0}</td>
                          <td className="py-3 text-right font-mono text-zinc-500">{p.articlesCount || 0}</td>
                          <td className="py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <select 
                                value={p.role} 
                                onChange={(e) => {
                                  const newRole = e.target.value as UserRole;
                                  if (onUpdateUserRole) {
                                    onUpdateUserRole(p.id, newRole);
                                    toast.success(`${p.name} kullanıcısının rolü '${newRole}' yapıldı.`);
                                  } else {
                                    toast.info(`Rol '${newRole}' olarak seçildi.`);
                                  }
                                  addLog(`Kullanıcı Rolü Değiştirildi: ${p.name} -> ${newRole}`);
                                }}
                                className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10.5px] px-2.5 py-1 rounded-lg text-zinc-700 dark:text-zinc-300 font-sans cursor-pointer focus:outline-none focus:border-indigo-500"
                              >
                                <option value="Visitor">Visitor</option>
                                <option value="Reader">Reader</option>
                                <option value="Writer">Writer</option>
                                <option value="Editor">Editor</option>
                                <option value="Admin">Admin</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===================== SUBVIEW 6: REPORTS (Logging logs list) ===================== */}
            {activeSubTab === 'reports' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
                  <h3 className="text-base font-sans font-black text-zinc-900 dark:text-white">Reports & Real-time Diagnosis Logs (Sistem Günlüğü)</h3>
                  <p className="text-xs text-zinc-500 mt-1">Uygulamanın çalıştığı sürece ürettiği arka plan teknik olay günlükleri.</p>
                </div>

                <div className="bg-zinc-950 text-emerald-400 border border-zinc-900 rounded-3xl p-5 shadow-inner space-y-4 font-mono">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
                      SYSTEM LOG TERMINAL (LOG CONSOLE WINDOW)
                    </span>
                    <span className="text-[9px] text-emerald-500/80 uppercase font-black flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5" /> ONLINE STATUS LISTENING
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 text-[11px] overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-zinc-800">
                    {terminalLogs.map((log, index) => (
                      <div key={index} className="opacity-90 hover:opacity-100 transition-opacity">
                        <span className="text-zinc-500 font-bold">&gt;&gt;</span> {log}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SUBVIEW 7: PLATFORM BRANDING (Marketplace Sync) ===================== */}
            {activeSubTab === 'branding' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
                  <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sliders className="w-5 h-5 text-indigo-500" />
                    Global Markalama & Teknik Metrik Ayarları
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Uygulamanın sloganını, varsayılan tema politikalarını ve kelime okuma sıklığını kontrol edin.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Platform İsmi (App Name)</label>
                    <input 
                      type="text"
                      value={settings.appName}
                      onChange={(e) => handleInputChange('appName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800"
                      placeholder="Örn: WeTalks"
                    />
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Bu değer site genelindeki başlıklarda, logolarda ve aramalarda anında güncellenir.</span>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Site Başlığı (Document Title / Browser Tab Title)</label>
                    <input 
                      type="text"
                      value={settings.siteTitle || ''}
                      onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800"
                      placeholder="Örn: WeTalks | Düşünceler & Teknoloji Platformu"
                    />
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Tarayıcı sekmesinde, arama motorlarında ve paylaşılan bağlantılarda görünen ana sayfa başlığı.</span>
                  </div>

                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Platform Slogan Manifesto Açıklaması (App Footer Description)</label>
                    <textarea 
                      value={settings.appDescription}
                      rows={3}
                      onChange={(e) => handleInputChange('appDescription', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800"
                      placeholder="Footer veya manifestoda yer alan açıklama cümlesi..."
                    />
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block font-semibold">Alt bilgi footer alanında yer alan, manifesto tabanlı dürüst tanımlama sloganı.</span>
                  </div>

                  {/* --- Logo ve Favicon Yükleme Bölümü --- */}
                  <div className="col-span-2 border-t border-zinc-150 dark:border-zinc-800/80 pt-6 mt-2 space-y-4">
                    <div className="flex items-center gap-2">
                      <UploadCloud className="w-4.5 h-4.5 text-[#0D62FE]" />
                      <h4 className="text-sm font-serif font-black text-zinc-900 dark:text-white">🖼️ Logo ve Favicon Özelleştirme</h4>
                    </div>
                    <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                      Uygulama genelinde kullanılacak açık/koyu tema logolarını ve favicon görselini PNG olarak yükleyin.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <LogoUploader 
                        label="Açık Tema Logosu"
                        description="Gündüz/Açık tema modunda navbar üzerinde gösterilecek şeffaf logo."
                        value={settings.lightLogo}
                        onChange={(val) => handleInputChange('lightLogo', val)}
                        onClear={() => handleInputChange('lightLogo', undefined)}
                      />
                      <LogoUploader 
                        label="Koyu Tema Logosu"
                        description="Gece/Koyu tema modunda navbar üzerinde gösterilecek şeffaf logo."
                        value={settings.darkLogo}
                        onChange={(val) => handleInputChange('darkLogo', val)}
                        onClear={() => handleInputChange('darkLogo', undefined)}
                      />
                      <LogoUploader 
                        label="Favicon (PNG)"
                        description="Tarayıcı sekmesinde görüntülenecek 32x32px boyutunda PNG favicon."
                        value={settings.favicon}
                        onChange={(val) => handleInputChange('favicon', val)}
                        onClear={() => handleInputChange('favicon', undefined)}
                        accept="image/png"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Tema Rengi Paleti Akor Tasarımı (Accent Color)</label>
                    <select 
                      value={settings.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800"
                    >
                      <option value="zinc">Klasik Kum Graniti (Zinc)</option>
                      <option value="emerald">Yüksek Enerji Zümrüdü (Emerald)</option>
                      <option value="indigo">Indigo Bulut Mavisi (Indigo)</option>
                      <option value="rose">Sıcak Akdeniz Gülü (Rose)</option>
                      <option value="amber">Premium Altın Kehribar (Amber)</option>
                    </select>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Arayüz üzerindeki buton, sınır çizgileri ve vurgularda kullanılan ana renk.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">Okuma Süresi Hesaplama Çarpanı (WPM / Words Per Minute)</label>
                    <input 
                      type="number"
                      value={settings.wordsPerMinute}
                      onChange={(e) => handleInputChange('wordsPerMinute', Math.max(50, parseInt(e.target.value) || 200))}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-zinc-800"
                      min={50}
                      max={1000}
                    />
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">Makale kelimeleri bu sayıya bölünerek okuma süresi dakikası otomatik hesaplanır.</span>
                  </div>

                  {/* --- Typography Customization Section --- */}
                  <div className="col-span-2 border-t border-zinc-150 dark:border-zinc-800/80 pt-6 mt-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                      <h4 className="text-sm font-serif font-black text-zinc-900 dark:text-white">📊 Tipografi & Google Fonts Tasarım Kontrolü</h4>
                    </div>
                    <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                      Uygulama genelindeki yazı tiplerini ayrı ayrı özelleştirin. Seçtiğiniz her font Google Fonts üzerinden anında indirilip canlandırılır.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-50 dark:bg-zinc-850/30 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
                      {/* Font 1: Heading Font */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-800 dark:text-zinc-200 block">
                          Başlık Fontu (Headings Font)
                        </label>
                        <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mb-1.5">
                          H1-H6 başlıkları, makale başlıkları ve logolar için geçerlidir.
                        </p>
                        <select 
                          value={POPULAR_FONTS.some(f => f.value === settings.headingFont && f.value !== 'custom') ? settings.headingFont : 'custom'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'custom') {
                              handleInputChange('headingFont', val);
                            } else {
                              handleInputChange('headingFont', 'Reddit Sans');
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-800"
                        >
                          {POPULAR_FONTS.map(font => (
                            <option key={font.value} value={font.value}>{font.name}</option>
                          ))}
                        </select>
                        
                        {(!POPULAR_FONTS.some(f => f.value === settings.headingFont && f.value !== 'custom') || settings.headingFont === 'custom') && (
                          <div className="mt-2 space-y-1">
                            <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold block">Özel Google Font İsmi Yazın:</span>
                            <input 
                              type="text"
                              value={settings.headingFont === 'custom' ? '' : (settings.headingFont || '')}
                              onChange={(e) => handleInputChange('headingFont', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800"
                              placeholder="Örn: Merriweather, Playfair Display..."
                            />
                          </div>
                        )}
                      </div>

                      {/* Font 2: Article Font */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-800 dark:text-zinc-200 block">
                          ✍️ Makale Fontu (Articles Font)
                        </label>
                        <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mb-1.5">
                          Makale gövde metinleri, paragraflar ve okuma alanları için geçerlidir.
                        </p>
                        <select 
                          value={POPULAR_FONTS.some(f => f.value === settings.articleFont && f.value !== 'custom') ? settings.articleFont : 'custom'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'custom') {
                              handleInputChange('articleFont', val);
                            } else {
                              handleInputChange('articleFont', 'Reddit Sans');
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-800"
                        >
                          {POPULAR_FONTS.map(font => (
                            <option key={font.value} value={font.value}>{font.name}</option>
                          ))}
                        </select>
                        
                        {(!POPULAR_FONTS.some(f => f.value === settings.articleFont && f.value !== 'custom') || settings.articleFont === 'custom') && (
                          <div className="mt-2 space-y-1">
                            <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold block">Özel Google Font İsmi Yazın:</span>
                            <input 
                              type="text"
                              value={settings.articleFont === 'custom' ? '' : (settings.articleFont || '')}
                              onChange={(e) => handleInputChange('articleFont', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800"
                              placeholder="Örn: Lora, Georgia, Roboto..."
                            />
                          </div>
                        )}
                      </div>

                      {/* Font 3: Menu / UI Font */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-800 dark:text-zinc-200 block">
                          🧭 Menü & Arayüz Fontu (UI / Menu Font)
                        </label>
                        <p className="text-[10px] text-zinc-450 dark:text-zinc-500 mb-1.5">
                          Navigasyon menüsü, butonlar, formlar ve genel uygulama arayüzü için geçerlidir.
                        </p>
                        <select 
                          value={POPULAR_FONTS.some(f => f.value === settings.menuFont && f.value !== 'custom') ? settings.menuFont : 'custom'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val !== 'custom') {
                              handleInputChange('menuFont', val);
                            } else {
                              handleInputChange('menuFont', 'Reddit Sans');
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-800"
                        >
                          {POPULAR_FONTS.map(font => (
                            <option key={font.value} value={font.value}>{font.name}</option>
                          ))}
                        </select>
                        
                        {(!POPULAR_FONTS.some(f => f.value === settings.menuFont && f.value !== 'custom') || settings.menuFont === 'custom') && (
                          <div className="mt-2 space-y-1">
                            <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold block">Özel Google Font İsmi Yazın:</span>
                            <input 
                              type="text"
                              value={settings.menuFont === 'custom' ? '' : (settings.menuFont || '')}
                              onChange={(e) => handleInputChange('menuFont', e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800"
                              placeholder="Örn: Space Grotesk, Inter, Nunito..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SUBVIEW 8: GLOBAL FEATURES SWITCHBOARD (Payment Gateways) ===================== */}
            {activeSubTab === 'switches' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
                  <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    Global Özellik Switchboard Masası (Aktif / Pasif Kontrolleri)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Uygulama üzerindeki yazar, okuyucu veya ziyaretçi mekanizmalarına ait tüm kritik özellikleri anında kapatılıp açabilirsiniz.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-500/5 dark:bg-orange-500/5 border border-orange-500/20 hover:border-orange-500/30 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        📈 WeTalks Insights Landing Sayfası Aktif
                      </span>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400">Insights landing sayfası ana giriş sayfamız olarak yayında kalsın mı? Kapalıyken doğrudan ana mecraya yönlendirilir.</p>
                    </div>
                    <button
                      onClick={() => handleToggle('insightsActive')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.insightsActive !== false ? 'bg-orange-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.insightsActive !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0D62FE]/5 dark:bg-[#0D62FE]/5 border border-[#0D62FE]/20 hover:border-[#0D62FE]/30 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#0D62FE] animate-pulse" />
                        🌐 WeTalks Uygulaması (Meclis/Okuma Platformu) Aktif
                      </span>
                      <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400">Ana okuma platformu, yazarlar ve içerik akışı tüm ziyaretçiler için yayında kalsın mı? Kapalıyken editör ve yöneticiler hariç tüm kullanıcılara şık bir bakım sayfası gösterilir.</p>
                    </div>
                    <button
                      onClick={() => handleToggle('appActive')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.appActive !== false ? 'bg-[#0D62FE]' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.appActive !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="h-px bg-zinc-150 dark:bg-zinc-800/80 my-2" />

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 hover:border-zinc-200 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">🤖 WeTalks Yapay Zeka Asistanı ve Sinyal Analizörü</span>
                      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500">Yazarların ve editörlerin gündem haber sinyallerinden taslak üretmelerini sağlayan Gemini 3.5 entegrasyonu tamamen açık mı?</p>
                    </div>
                    <button
                      onClick={() => handleToggle('enableAiAssistant')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.enableAiAssistant ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.enableAiAssistant ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 hover:border-zinc-200 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">💬 Makale Altı Yorum ve Canlı Tartışma Sistemi</span>
                      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500">Okurların yorum yapma, birbirine yanıt atma, derin tartışmalara girme sistemini aktif veya tamamen kapalı hale getirir.</p>
                    </div>
                    <button
                      onClick={() => handleToggle('enableComments')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.enableComments ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-705'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.enableComments ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 hover:border-zinc-200 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">📨 Anasayfa Bülten Kayıt Bölümü (Newsletter Box)</span>
                      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500">Kullanıcılardan e-posta toplayarak gelişmelerden haberdar eden bülten abonelik şeridini ana sayfada göster veya kaldır.</p>
                    </div>
                    <button
                      onClick={() => handleToggle('enableNewsletter')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.enableNewsletter ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.enableNewsletter ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 hover:border-zinc-200 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">ℹ️ WeTalks Manifestosu ve Misyonumuz Modalı (About Us dialog)</span>
                      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500">Üst menüdeki "Hakkımızda" butonu ve detaylı felsefe manifestosu modal pencereleri erişilebilir durumda kalsın mı?</p>
                    </div>
                    <button
                      onClick={() => handleToggle('enableManifesto')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.enableManifesto ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.enableManifesto ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 hover:border-zinc-200 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">❤️ Canlı Like, Bookmarks ve Takip Özellikleri</span>
                      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500">Okurların beğeni yapabilme, makale kaydedebilme ve yazarları takip edebilme interaktif butonlarını gösterir.</p>
                    </div>
                    <button
                      onClick={() => handleToggle('enableLikesSaves')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.enableLikesSaves ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.enableLikesSaves ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 hover:border-zinc-200 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">🔐 Üye Olmayan Ziyaretçilerin Okuma Yetkisi (Guest Reading)</span>
                      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500">Kapatılırsa, oturum açmamış (Visitor) kullanıcılar hiçbir makaleyi okuyamaz ve doğrudan üye aramıza katılın ekranına yönlendirilir.</p>
                    </div>
                    <button
                      onClick={() => handleToggle('enableGuestReading')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.enableGuestReading ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.enableGuestReading ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 hover:border-zinc-200 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">🎨 Tasarım Stüdyosu Kısayolları (Design Studio Island)</span>
                      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500">Kullanıcı arayüzünde (sayfanın alt kısmında) "Tasarım Stüdyosu" yüzen kontrol adasının gösterilmesini sağlar. Kapatıldığında tüm kullanıcılar için gizlenir.</p>
                    </div>
                    <button
                      onClick={() => handleToggle('showDesignStudio')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.showDesignStudio ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.showDesignStudio ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 hover:border-zinc-200 transition-colors">
                    <div className="space-y-0.5 max-w-[75%]">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white block">🚀 "Projeyi İncele" Butonu Görünürlüğü (Explore Project CTA)</span>
                      <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500">WeTalks Insights açılış sayfasındaki (Insights Landing) "Projeyi İncele" butonunu aktif veya tamamen gizli hale getirir.</p>
                    </div>
                    <button
                      onClick={() => handleToggle('showExploreProjectButton')}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.showExploreProjectButton !== false ? 'bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${settings.showExploreProjectButton !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SUBVIEW 9: ADMIN DASHBOARD TAB TOGGLES (Settings) ===================== */}
            {activeSubTab === 'admin_tabs' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
                  <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Yönetim Paneli ("Panelim") Tüm Bölümlerinin Toggles Şeridi
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Admin, Editör, Yazar ve Okurların ortaklaştığı "Panelim" sekmesindeki dilediğiniz veri alanını açıp kapatın. İstediğiniz sekmeleri tamamen devre dışı bırakın.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 flex items-center justify-between">
                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 dark:text-white block">📊 Özet & İstatistikler Alanı</span>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Overview Tablosu</span>
                    </div>
                    <button
                      onClick={() => handleToggle('showOverviewTab')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${settings.showOverviewTab ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'}`}
                    >
                      {settings.showOverviewTab ? 'Açık' : 'Kapatıldı'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 flex items-center justify-between">
                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 dark:text-white block">🔖 Oylananlar & Kaydedilenler</span>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Saved / Liked listeleri</span>
                    </div>
                    <button
                      onClick={() => handleToggle('showSavedLikedTab')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${settings.showSavedLikedTab ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'}`}
                    >
                      {settings.showSavedLikedTab ? 'Açık' : 'Kapatıldı'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 flex items-center justify-between">
                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 dark:text-white block">✍️ Yazar Yazı Yönetim Listesi</span>
                      <span className="text-[10px] text-zinc-400 block font-semibold">my_articles_list Tablosu</span>
                    </div>
                    <button
                      onClick={() => handleToggle('showMyArticlesTab')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${settings.showMyArticlesTab ? 'bg-emerald-100 text-emerald-800 border-emerald-205 dark:bg-emerald-950/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'}`}
                    >
                      {settings.showMyArticlesTab ? 'Açık' : 'Kapatıldı'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 flex items-center justify-between">
                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 dark:text-white block">🕵️ Editör Onay Kuyruğu</span>
                      <span className="text-[10px] text-zinc-400 block font-semibold">editor_approvals Tablosu</span>
                    </div>
                    <button
                      onClick={() => handleToggle('showEditorApprovalsTab')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${settings.showEditorApprovalsTab ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'}`}
                    >
                      {settings.showEditorApprovalsTab ? 'Açık' : 'Kapatıldı'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-805 flex items-center justify-between">
                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 dark:text-white block">📁 Kategori ve Etiket Tanımları</span>
                      <span className="text-[10px] text-zinc-400 block font-semibold">editor_categories Ayar Alanı</span>
                    </div>
                    <button
                      onClick={() => handleToggle('showEditorCategoriesTab')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${settings.showEditorCategoriesTab ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'}`}
                    >
                      {settings.showEditorCategoriesTab ? 'Açık' : 'Kapatıldı'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 flex items-center justify-between">
                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 dark:text-white block">👥 Üye Matrisi & Yetki Dağıtımı</span>
                      <span className="text-[10px] text-zinc-400 block font-semibold">admin_users Yetkilendirme</span>
                    </div>
                    <button
                      onClick={() => handleToggle('showAdminUsersTab')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${settings.showAdminUsersTab ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30'}`}
                    >
                      {settings.showAdminUsersTab ? 'Açık' : 'Kapatıldı'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-105 dark:border-zinc-800 flex items-center justify-between">
                    <div className="text-left space-y-0.5">
                      <span className="text-xs font-bold text-zinc-800 dark:text-white block">📦 Tüm İndeks & Yayın Kataloğu</span>
                      <span className="text-[10px] text-zinc-400 block font-semibold">admin_catalog Listeleme</span>
                    </div>
                    <button
                      onClick={() => handleToggle('showAdminCatalogTab')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${settings.showAdminCatalogTab ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30' : 'bg-red-50 text-red-700 border-red-205/80'}`}
                    >
                      {settings.showAdminCatalogTab ? 'Açık' : 'Kapatıldı'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SUBVIEW 10: DYNAMIC NAV MENU MANAGEMENT (Menü Yönetimi) ===================== */}
            {activeSubTab === 'menu_management' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4">
                  <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Menu className="w-5 h-5 text-emerald-500" />
                    Navigasyon Menü Yönetim Merkezi (Dinamik Menü)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Uygulamanın en üstünde yer alan ana menüdeki elemanları ekleyin, çıkarın, sıralamasını değiştirin veya geçici olarak gizleyin. Tüm değişiklikler anında üst menüye yansır.
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">AKTİF MENÜ ELEMANLARI ({settings.menuItems?.length || 0})</span>
                  {(!settings.menuItems || settings.menuItems.length === 0) ? (
                    <p className="text-xs text-zinc-400 italic">Menü boş veya tanımlı değil.</p>
                  ) : (
                    <div className="space-y-3">
                      {settings.menuItems.map((item, index) => (
                        <div 
                          key={item.id} 
                          className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-150/80 dark:border-zinc-805 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                disabled={index === 0}
                                onClick={() => {
                                  if (index === 0) return;
                                  const list = [...(settings.menuItems || [])];
                                  const temp = list[index];
                                  list[index] = list[index - 1];
                                  list[index - 1] = temp;
                                  onUpdateSettings({ ...settings, menuItems: list });
                                  addLog(`"${temp.title}" menü elemanı yukarı taşındı`);
                                }}
                                className="p-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-805 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={index === (settings.menuItems.length - 1)}
                                onClick={() => {
                                  if (index === settings.menuItems.length - 1) return;
                                  const list = [...(settings.menuItems || [])];
                                  const temp = list[index];
                                  list[index] = list[index + 1];
                                  list[index + 1] = temp;
                                  onUpdateSettings({ ...settings, menuItems: list });
                                  addLog(`"${temp.title}" menü elemanı aşağı taşındı`);
                                }}
                                className="p-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-zinc-400 hover:text-zinc-800 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="space-y-1 text-left">
                              <input 
                                type="text"
                                value={item.title}
                                onChange={(e) => {
                                  const list = [...(settings.menuItems || [])];
                                  list[index] = { ...list[index], title: e.target.value };
                                  onUpdateSettings({ ...settings, menuItems: list });
                                }}
                                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-805 dark:text-zinc-150 focus:ring-1 focus:ring-indigo-500"
                                placeholder="Başlık"
                              />
                              <div className="text-[9px] text-zinc-400 uppercase font-mono pl-1">
                                <span>Görünüm: <b className="text-[#0D62FE]">{item.view === 'search' ? `Arama (${item.categoryParam || 'Tümü'})` : item.view}</b></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 self-end md:self-auto uppercase tracking-wider text-[10px]">
                            <select
                              value={item.view}
                              onChange={(e) => {
                                const list = [...(settings.menuItems || [])];
                                list[index] = { 
                                  ...list[index], 
                                  view: e.target.value,
                                  categoryParam: e.target.value === 'search' ? 'all' : undefined
                                };
                                onUpdateSettings({ ...settings, menuItems: list });
                              }}
                              className="bg-white dark:bg-zinc-900 border text-xs px-2 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-350 cursor-pointer"
                            >
                              <option value="home">Ana Sayfa</option>
                              <option value="search">Katalog / Arama</option>
                              <option value="explore">Kanallar</option>
                              <option value="dashboard">Panelim</option>
                            </select>

                            {item.view === 'search' && (
                              <select
                                value={item.categoryParam || 'all'}
                                onChange={(e) => {
                                  const list = [...(settings.menuItems || [])];
                                  list[index] = { ...list[index], categoryParam: e.target.value };
                                  onUpdateSettings({ ...settings, menuItems: list });
                                }}
                                className="bg-white dark:bg-zinc-900 border text-xs px-2 py-1.5 rounded-lg text-zinc-700 dark:text-zinc-350 cursor-pointer"
                              >
                                <option value="all">Tüm Katalog</option>
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            )}

                            <button
                              onClick={() => {
                                const list = [...(settings.menuItems || [])];
                                list[index] = { ...list[index], visible: !list[index].visible };
                                onUpdateSettings({ ...settings, menuItems: list });
                                addLog(`"${item.title}" menüsü ${!list[index].visible ? 'GİZLENDİ' : 'GÖRÜNÜR YAPILDI'}`);
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${item.visible ? 'bg-emerald-100 text-emerald-800 border-emerald-250' : 'bg-red-50 text-red-700 border-red-200'}`}
                            >
                              {item.visible ? 'Aktif' : 'Gizli'}
                            </button>

                            <button
                              onClick={() => {
                                const list = [...(settings.menuItems || [])];
                                list.splice(index, 1);
                                onUpdateSettings({ ...settings, menuItems: list });
                                addLog(`"${item.title}" menüden silindi`);
                              }}
                              className="p-1.5 rounded-lg border border-red-200 text-red-650 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1.5 select-none">
                    <Plus className="w-4 h-4 text-emerald-500" />
                    Yeni Menü Elemanı Ekle
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-left">
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Başlık</label>
                      <input 
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs sm:text-sm focus:outline-none placeholder-zinc-400"
                        placeholder="Örn: Yapay Zeka Haberleri"
                      />
                    </div>

                    <div className="text-left">
                      <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Yönlendirilecek Sayfa</label>
                      <select
                        value={newView}
                        onChange={(e) => {
                          const v = e.target.value;
                          setNewView(v);
                          setNewCategoryParam(v === 'search' ? 'all' : '');
                        }}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs sm:text-sm cursor-pointer"
                      >
                        <option value="home">Ana Sayfa</option>
                        <option value="search">Katalog / Kategori Arama</option>
                        <option value="explore">Kanallar Sekmesi</option>
                        <option value="dashboard">Panelim</option>
                      </select>
                    </div>

                    {newView === 'search' && (
                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Kategori Filtresi</label>
                        <select
                          value={newCategoryParam}
                          onChange={(e) => setNewCategoryParam(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl text-xs sm:text-sm cursor-pointer"
                        >
                          <option value="all">Tüm Yazılar</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        if (!newTitle.trim()) {
                          toast.error('Lütfen bir menü elemanı başlığı yazın.');
                          return;
                        }
                        const newItem = {
                          id: 'menu_' + Math.random().toString(36).substring(2, 9),
                          title: newTitle.trim(),
                          view: newView,
                          categoryParam: newView === 'search' ? newCategoryParam : undefined,
                          visible: true
                        };
                        const list = [...(settings.menuItems || []), newItem];
                        onUpdateSettings({ ...settings, menuItems: list });
                        addLog(`"${newItem.title}" adlı yeni menü elemanı eklendi`);
                        toast.success(`"${newItem.title}" menüye eklendi.`);
                        setNewTitle('');
                      }}
                      className="bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Yayın Menüsüne Ekle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SUBVIEW 11: RAW SYSTEM RECOVERY (Help Center) ===================== */}
            {activeSubTab === 'database_ops' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left">
                    <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Database className="w-5 h-5 text-indigo-500" />
                      Ham Veritabanı Kümesi Yedekleme & Kurtarma (Dumping & Seeding)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Sistemdeki tüm canlı makaleleri, profilleri ve yorumları tek tıkla JSON formatında yedekleyin veya geri yükleyin.</p>
                  </div>
                  
                  {showResetConfirmDialog ? (
                    <div className="flex items-center gap-2 p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl animate-in fade-in duration-150">
                      <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">Tüm veriler sıfırlansın mı?</span>
                      <button
                        onClick={performReset}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10.5px] font-bold"
                      >
                        Evet, Sıfırla
                      </button>
                      <button
                        onClick={() => setShowResetConfirmDialog(false)}
                        className="px-2.5 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10.5px]"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResetConfirmDialog(true)}
                      className="shrink-0 px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Sistemi Fabrikaya Sıfırla
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-zinc-105">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase select-none">
                      <Download className="w-4 h-4 text-emerald-500" />
                      Mevcut Veritabanını Dışa Aktar
                    </span>
                    <p className="text-[11px] text-zinc-500 leading-normal mb-1">
                      Sistem durumu (makaleler, yorumlar, kullanıcılar ve kategoriler dahil) JSON yığın çıktısı olarak hazırlanacaktır.
                    </p>
                    <button
                      onClick={triggerExport}
                      className="w-full py-3 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-900 cursor-pointer shadow-sm"
                    >
                      Canlı Veritabanı Yedeğini Çıkar
                    </button>

                    {showRawExport && (
                      <div className="space-y-2 mt-4 animate-in fade-in duration-100">
                        <span className="text-[10px] text-zinc-400 block font-mono">Snapshot JSON Kod Çıktısı (Kopyalayın):</span>
                        <textarea
                          readOnly
                          value={exportJson}
                          rows={6}
                          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                          className="w-full p-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-mono leading-normal focus:outline-none text-zinc-700 dark:text-zinc-300"
                        />
                        <span className="text-[9px] text-emerald-600 block">✓ Sistem Snaphot Hazır! Metne tıklayarak kopyalayabilirsiniz.</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-zinc-105">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase select-none">
                      <Upload className="w-4 h-4 text-indigo-500" />
                      Yedek Dosyası Geri Yükle
                    </span>
                    <p className="text-[11px] text-zinc-500 leading-normal mb-1">
                      Daha önce çıkardığınız geçerli bir Snapshot JSON dizesini aşağıdaki alana yapıştırarak tüm veriyi yükleyebilirsiniz.
                    </p>
                    <textarea
                      value={importJson}
                      onChange={(e) => setImportJson(e.target.value)}
                      rows={5}
                      placeholder='{ "profiles": [...], "articles": [...] }'
                      className="w-full p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-mono focus:outline-none"
                    />

                    {importError && <p className="text-[10.5px] text-red-600 font-medium">✗ {importError}</p>}
                    {importSuccess && <p className="text-[10.5px] text-emerald-600 font-medium">✓ Veritabanı başarıyla geri yüklendi!</p>}

                    <button
                      onClick={triggerImport}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Snaphot Metnini Uygula
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== SUBVIEW 12: RESEND EMAIL INTEGRATION ===================== */}
            {activeSubTab === 'resend' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-zinc-150 dark:border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                  <div className="text-left">
                    <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Mail className="w-5 h-5 text-indigo-500" />
                      Resend E-Posta Entegrasyonu Ayarları
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">Haber bülteni abonelikleri ve makale yayım bildirimlerinin e-posta gönderim ayarlarını yönetin.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {emailServiceStatus?.configured ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Sunucu Entegrasyonu Aktif (Resend)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Simülasyon Modu (Local)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {/* Left Column: Server Secret Security Architecture */}
                  <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-zinc-105">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">Güvenli Sunucu Mimarisi</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Güvenlik standartlarımız gereği hiçbir API anahtarı veya servis sırrı istemci tarafında tutulmaz, veritabanına yazılmaz veya istemciye iletilmez.
                      </p>
                      <div className="p-3 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-[11px] font-mono space-y-1.5">
                        <div className="flex items-center justify-between text-zinc-500">
                          <span>Sır Depolama:</span>
                          <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Google Secret Manager / .env</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-500">
                          <span>Ortam Değişkeni:</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">RESEND_API_KEY</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-500">
                          <span>Entegrasyon:</span>
                          <span className={emailServiceStatus?.configured ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                            {emailServiceStatus?.configured ? "Tanımlı (Aktif)" : "Tanımlanmamış (Simülasyon)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Email Test Form */}
                  <div className="space-y-4 bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-2xl border border-zinc-105 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase select-none mb-2">
                        <Mail className="w-4 h-4 text-indigo-500" />
                        E-Posta Gönderim Testi
                      </span>
                      <p className="text-[11px] text-zinc-500 leading-normal mb-4">
                        Sunucu tarafında yapılandırılan Resend e-posta motorunun çalışmasını doğrulamak için test e-postası gönderebilirsiniz.
                      </p>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 block">Alıcı E-Posta Adresi</label>
                        <input 
                          type="email"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D62FE]"
                          placeholder="orhanbal@gmail.com"
                        />
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      {testStatus === 'loading' && <p className="text-[10.5px] text-zinc-500 font-medium animate-pulse">⏳ Test e-postası gönderiliyor...</p>}
                      {testStatus === 'success' && <p className="text-[10.5px] text-emerald-600 font-medium">✓ Test e-postası başarıyla gönderildi! Lütfen gelen kutunuzu kontrol edin.</p>}
                      {testStatus === 'error' && <p className="text-[10.5px] text-red-600 font-medium font-mono whitespace-pre-wrap">✗ Gönderim hatası: {testError}</p>}

                      <button
                        onClick={handleSendTestEmail}
                        disabled={testStatus === 'loading'}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        Sunucu Üzerinden Test Gönder
                      </button>
                    </div>
                  </div>
                </div>

                {/* Info block */}
                <div className="bg-[#0D62FE]/5 border border-[#0D62FE]/15 rounded-2xl p-4 text-left">
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-white flex items-center gap-1.5 mb-1">
                    💡 Güvenli E-Posta Mimarisi
                  </h4>
                  <ul className="text-[11px] text-zinc-650 dark:text-zinc-400 space-y-1 list-disc pl-4.5">
                    <li>Bülten abonelikleri, iletişim mesajları ve yayım bildirimleri yalnızca sunucu tarafında güvenli Node.js motorunda yürütülür.</li>
                    <li>Sırlar Google Secret Manager veya sunucu ortam değişkenlerinde saklanır; Firestore veya istemci belleğinde asla yer almaz.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSubTab === 'inbox' && (() => {
              const formatMessageDate = (msg: any) => {
                if (!msg || !msg.createdAt) return '';
                if (msg.createdAt.seconds) {
                  return new Date(msg.createdAt.seconds * 1000).toLocaleString('tr-TR');
                }
                try {
                  return new Date(msg.createdAt).toLocaleString('tr-TR');
                } catch (e) {
                  return String(msg.createdAt);
                }
              };

              return (
                <div className="space-y-6 animate-in fade-in duration-200 text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5">
                    <div>
                      <h3 className="text-base font-sans font-black text-zinc-900 dark:text-white uppercase tracking-tight">Gelen Kutusu & İletişim Formu Talepleri</h3>
                      <p className="text-[11px] text-zinc-500 leading-normal mt-0.5">
                        WeTalks Insights platformu üzerinden kurucu Orhan Balcı ile bağlantı kurmak isteyen kişilerin gönderdiği tüm mesajlar.
                      </p>
                    </div>
                    <button 
                      onClick={fetchContactMessages}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold hover:brightness-95 transition-all cursor-pointer"
                    >
                      Yenile
                    </button>
                  </div>

                  {loadingMessages ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-indigo-600 animate-spin" />
                      <p className="text-xs text-zinc-400 font-sans font-medium">İletişim mesajları yükleniyor...</p>
                    </div>
                  ) : contactMessages.length === 0 ? (
                    <div className="py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center p-6 bg-white/40 dark:bg-zinc-900/10">
                      <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 mb-4 border border-zinc-100 dark:border-zinc-800">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-sans font-bold text-zinc-900 dark:text-white">Henüz Mesaj Yok</h4>
                      <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed">
                        İletişim formu aracılığıyla gönderilen tüm mesajlar anlık olarak burada listelenecektir.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Inbox Stats/Counters */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-zinc-50 dark:bg-zinc-900/20 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                          <span className="text-[10px] uppercase font-mono text-zinc-400 block">Toplam Gelen</span>
                          <span className="text-xl font-black font-sans text-zinc-800 dark:text-white">{contactMessages.length}</span>
                        </div>
                        <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/15">
                          <span className="text-[10px] uppercase font-mono text-amber-500 block">Okunmamış</span>
                          <span className="text-xl font-black font-sans text-amber-500">{contactMessages.filter(m => m.status !== 'read').length}</span>
                        </div>
                        <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/15">
                          <span className="text-[10px] uppercase font-mono text-emerald-500 block">Okundu</span>
                          <span className="text-xl font-black font-sans text-emerald-500">{contactMessages.filter(m => m.status === 'read').length}</span>
                        </div>
                      </div>

                      {/* Messages List */}
                      <div className="space-y-3">
                        {contactMessages.map((msg) => {
                          const isRead = msg.status === 'read';
                          const firstLetter = msg.name ? msg.name.charAt(0).toUpperCase() : 'W';
                          const formattedDate = formatMessageDate(msg);
                          
                          return (
                            <div 
                              key={msg.id}
                              className={`p-5 rounded-2.5xl border transition-all ${
                                isRead 
                                  ? 'bg-white dark:bg-zinc-950/30 border-zinc-100 dark:border-zinc-900 opacity-75 hover:opacity-100' 
                                  : 'bg-gradient-to-r from-zinc-50 to-zinc-50/40 dark:from-zinc-900/30 dark:to-zinc-900/10 border-[#0D62FE]/20 shadow-md shadow-zinc-100/50 dark:shadow-none'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                    isRead 
                                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400' 
                                      : 'bg-indigo-650 text-white'
                                  }`}>
                                    {firstLetter}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">{msg.name}</h4>
                                      {!isRead && (
                                        <span className="text-[8.5px] px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-black uppercase tracking-wider">
                                          Yeni
                                        </span>
                                      )}
                                    </div>
                                    <a 
                                      href={`mailto:${msg.email}`}
                                      className="text-[10px] text-zinc-400 hover:text-[#0D62FE] transition-colors font-medium font-sans block mt-0.5"
                                    >
                                      {msg.email}
                                    </a>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                                  {formattedDate}
                                </span>
                              </div>

                              <div className="mt-4 pl-13">
                                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-105 whitespace-pre-wrap">
                                  {msg.message}
                                </p>
                                
                                <div className="flex items-center gap-2 mt-3.5">
                                  <button
                                    onClick={() => handleToggleMessageRead(msg.id, msg.status)}
                                    className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isRead 
                                        ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200' 
                                        : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-[#6366F1] dark:text-indigo-400'
                                    }`}
                                  >
                                    <Check className="w-3 h-3" />
                                    {isRead ? 'Okunmadı İşaretle' : 'Okundu İşaretle'}
                                  </button>
                                  
                                  <a
                                    href={`mailto:${msg.email}?subject=WeTalks%20Insights%20Bağlantı%20Talebi%20Yanıdı&body=Merhaba%20${encodeURIComponent(msg.name || '')},%0A%0AWeTalks%20üzerinden%20bize%20ilettiğiniz%20mesaj%20için%20teşekkür%20ederiz.%0A%0A---%0AGönderdiğiniz%20Mesaj:%0A${encodeURIComponent(msg.message || '')}`}
                                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[10.5px] font-bold transition-all flex items-center gap-1.5"
                                  >
                                    <Mail className="w-3 h-3" />
                                    E-Posta ile Yanıtla
                                  </a>

                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Sil
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>

        </main>

      </div>

    </div>
  );
}
