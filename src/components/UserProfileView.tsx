import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  Heart, 
  Award, 
  Compass, 
  Twitter, 
  Github, 
  Linkedin, 
  Globe, 
  Calendar, 
  Flame, 
  TrendingUp, 
  Check, 
  Plus, 
  Users, 
  Share2, 
  FileText, 
  Mail, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Star,
  Activity,
  AlertCircle,
  X,
  Edit,
  Upload
} from 'lucide-react';
import { UserProfile, Article, UserRole } from '../types';

interface UserProfileViewProps {
  profileUser: UserProfile;
  articles: Article[];
  currentUser: UserProfile | null;
  currentRole: UserRole;
  onNavigate: (view: string, params?: any) => void;
  onFollowAuthor: (authorId: string) => void;
  onShowAuthModal: (show: boolean) => void;
  handleImageErrorGlobal: (e: any, type: string) => void;
  playPluckSynth?: (type: 'click' | 'success' | 'hover' | 'pop') => void;
  onUpdateProfile?: (updated: UserProfile) => void;
}

export default function UserProfileView({
  profileUser,
  articles,
  currentUser,
  currentRole,
  onNavigate,
  onFollowAuthor,
  onShowAuthModal,
  handleImageErrorGlobal,
  playPluckSynth,
  onUpdateProfile
}: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'articles' | 'analytics' | 'about'>('articles');
  const [copied, setCopied] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Profile Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    avatar: '',
    bio: '',
    expertise: '',
    linkedin: '',
    twitter: '',
    github: '',
    website: '',
  });

  const processImageFile = (file: File, callback: (base64: string) => void, onError: (err: string) => void) => {
    if (file.size <= 600 * 1024) {
      // Small files: keep 100% exact original file bytes with no compression or resizing
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          callback(event.target.result as string);
        } else {
          onError('Dosya okunamadı.');
        }
      };
      reader.onerror = () => onError('Dosya okunurken bir hata oluştu.');
      reader.readAsDataURL(file);
    } else {
      // Large files: Optimize dynamically with very high quality (0.92 JPEG) and a generous 1024px scale
      // This preserves pristine quality for the human eye while keeping the file safely under Firestore's 1MB limit
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) {
          onError('Görsel okunamadı.');
          return;
        }
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
            if (!ctx) {
              onError('Görsel işlenemedi.');
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            
            const base64 = canvas.toDataURL('image/jpeg', 0.92);
            callback(base64);
          } catch (err) {
            console.error('Image compression error:', err);
            onError('Görsel işlenirken hata oluştu.');
          }
        };
        img.onerror = () => {
          onError('Görsel yüklenirken hata oluştu.');
        };
        img.src = event.target.result as string;
      };
      reader.onerror = () => onError('Dosya okunurken bir hata oluştu.');
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSaveError('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSaveError('Görsel boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }
      processImageFile(
        file,
        (base64) => {
          setEditForm(prev => ({ ...prev, avatar: base64 }));
          setSaveError('');
        },
        (err) => {
          setSaveError(err);
        }
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setSaveError('Lütfen geçerli bir görsel dosyası seçin (PNG, JPG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSaveError('Görsel boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }
      processImageFile(
        file,
        (base64) => {
          setEditForm(prev => ({ ...prev, avatar: base64 }));
          setSaveError('');
        },
        (err) => {
          setSaveError(err);
        }
      );
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: profileUser.name || '',
      username: profileUser.username || '',
      avatar: profileUser.avatar || '',
      bio: profileUser.bio || '',
      expertise: profileUser.expertise ? profileUser.expertise.join(', ') : '',
      linkedin: profileUser.socials?.linkedin || '',
      twitter: profileUser.socials?.twitter || '',
      github: profileUser.socials?.github || '',
      website: profileUser.socials?.website || '',
    });
    setSaveError('');
    setIsEditing(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      setSaveError('Ad Soyad alanı boş bırakılamaz.');
      return;
    }
    if (!editForm.username.trim()) {
      setSaveError('Kullanıcı adı alanı boş bırakılamaz.');
      return;
    }

    setIsSaving(true);
    if (playPluckSynth) playPluckSynth('success');

    setTimeout(() => {
      const updated: UserProfile = {
        ...profileUser,
        name: editForm.name.trim(),
        username: editForm.username.trim().replace(/^@/, '').toLowerCase(),
        avatar: editForm.avatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
        bio: editForm.bio.trim(),
        expertise: editForm.expertise
          ? editForm.expertise.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          : [],
        socials: {
          linkedin: editForm.linkedin.trim() || undefined,
          twitter: editForm.twitter.trim() || undefined,
          github: editForm.github.trim() || undefined,
          website: editForm.website.trim() || undefined,
        }
      };

      if (onUpdateProfile) {
        onUpdateProfile(updated);
      }
      setIsSaving(false);
      setIsEditing(false);
    }, 600);
  };

  const writerArticleList = articles.filter(
    (a) => a.authorId === profileUser.id && a.status === 'Published'
  );

  const isFollowing = currentUser?.followedAuthors.includes(profileUser.id) || false;

  // Calculate some realistic/dynamic analytics metrics for this author
  const totalReadTime = writerArticleList.reduce((sum, a) => sum + a.readTime, 0);
  const totalViews = writerArticleList.reduce((sum, a) => sum + (a.views || 0), 0);
  const totalLikes = writerArticleList.reduce((sum, a) => sum + (a.likes || 0), 0);
  
  // Calculate category density
  const categoryCounts: { [key: string]: number } = {};
  writerArticleList.forEach(art => {
    categoryCounts[art.categoryId] = (categoryCounts[art.categoryId] || 0) + 1;
  });

  const handleShare = () => {
    if (playPluckSynth) playPluckSynth('click');
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubscribeToWriter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim()) return;
    if (playPluckSynth) playPluckSynth('success');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubscribed(true);
      setSubscriberEmail('');
    }, 1000);
  };

  // Get elegant badges for roles
  const getRoleBadge = () => {
    const isOrhan = profileUser.id === 'user_orhan' || profileUser.username === 'orhanbalci' || profileUser.name === 'Orhan Balcı';
    if (isOrhan) {
      return {
        label: 'Kurucu Yazar',
        class: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50'
      };
    }

    // For everyone else, they must be BLUE (mavi)
    switch (profileUser.role) {
      case 'Admin':
        return {
          label: 'Kurucu Editör',
          class: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 border-blue-900/50'
        };
      case 'Editor':
        return {
          label: 'Yayın Yönetmeni',
          class: 'bg-blue-50 text-[#0D62FE] dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
        };
      default:
        return {
          label: 'Küratör Yazar',
          class: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 border-blue-900/50'
        };
    }
  };

  const badgeInfo = getRoleBadge();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-40 animate-in fade-in duration-300">
      
      {/* 2. THE ASYMMETRIC WRITER HUB (Bannerless Header Panel) */}
      <div className="relative z-20 px-0 mb-10">
        <div className="bg-white/80 dark:bg-zinc-950/85 backdrop-blur-xl border border-zinc-150 dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
            
            {/* Left: Avatar + Identity Detail Block */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-5 sm:gap-6 text-center sm:text-left">
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0D62FE] to-cyan-500 rounded-[30px] opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative p-1.5 rounded-[28px] bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-md">
                  <img
                    src={profileUser.avatar}
                    alt={profileUser.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-[22px] object-cover bg-zinc-50"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageErrorGlobal(e, 'avatar')}
                  />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 border-2 border-white dark:border-zinc-950 p-1.5 rounded-full shadow-md text-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h2 className="text-2xl sm:text-3xl font-serif font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                    {profileUser.name}
                  </h2>
                  <span className={`inline-flex items-center gap-1 border text-[9.5px] font-sans font-black tracking-wider uppercase px-2.5 py-1 rounded-full ${badgeInfo.class} self-center sm:self-auto`}>
                    <Star className="w-3 h-3 fill-current" />
                    {badgeInfo.label}
                  </span>
                </div>

                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium">
                  @{profileUser.username} • <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">Kıdemli Kürasyon Üyesi</span>
                </p>

                {/* Micro metrics strip inside main card */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-sans font-bold">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#0D62FE]" />
                    <span><strong className="text-zinc-900 dark:text-white font-serif text-sm">{profileUser.followersCount}</strong> takipçi</span>
                  </div>
                  <span className="text-zinc-300 dark:text-zinc-800">•</span>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#0D62FE]" />
                    <span><strong className="text-zinc-900 dark:text-white font-serif text-sm">{writerArticleList.length}</strong> yayın</span>
                  </div>
                  <span className="text-zinc-300 dark:text-zinc-800">•</span>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span><strong className="text-zinc-900 dark:text-white font-serif text-sm">{(writerArticleList.length * 12) + 8}</strong> Etki İndeksi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Follow CTA & Share & Global Interaction */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0 border-t border-zinc-100 dark:border-zinc-900/60 lg:border-t-0 pt-4 lg:pt-0">
              {/* Member ID and context */}
              <div className="hidden sm:flex flex-col items-end text-right select-none pr-2">
                <span className="text-[9px] tracking-wider font-sans font-black text-zinc-400 dark:text-zinc-500 uppercase">
                  Yayıncı Kadrosu
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                  Üye No: #{profileUser.id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              {/* Share button */}
              <button 
                onClick={handleShare}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800/60 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold shadow-sm"
                title="Profil Bağlantısını Kopyala"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Paylaş</span>
                  </>
                )}
              </button>

              {currentUser?.id !== profileUser.id ? (
                <button
                  onClick={() => {
                    if (currentRole === 'Visitor') {
                      onShowAuthModal(true);
                    } else {
                      if (playPluckSynth) playPluckSynth('click');
                      onFollowAuthor(profileUser.id);
                    }
                  }}
                  className={`w-full sm:w-auto text-xs px-8 py-3.5 font-bold rounded-2xl border transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                    isFollowing
                      ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800'
                      : 'bg-[#0D62FE] hover:bg-[#0D62FE]/90 text-white border-transparent hover:scale-102 active:scale-98 shadow-md shadow-[#0D62FE]/20'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      Takip Ediliyor
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Yazarı Takip Et
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
                  <div className="text-[11.5px] font-sans font-bold bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 px-4 py-3 rounded-2xl border border-zinc-150 dark:border-zinc-800 w-full lg:w-auto text-center select-none shrink-0">
                    ✨ Kendi Profiliniz
                  </div>
                  <button
                    onClick={openEditModal}
                    className="w-full sm:w-auto text-xs px-6 py-3.5 font-bold rounded-2xl bg-[#0D62FE] hover:bg-[#0D62FE]/90 text-white border border-transparent transition-all hover:scale-102 active:scale-98 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4 text-white" />
                    <span>Profili Düzenle</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. ASYMMETRIC BENTO GRID SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT COL: AUTHOR BIO, CONNECTIONS, MINI-NEWSLETTER (Col Span 4) --- */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Bento Block A: Manifesto & Vision */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest font-sans uppercase">
              Yazar Manifestosu & Vizyonu
            </h4>
            
            <div className="relative">
              {/* Giant elegant quotation background */}
              <span className="absolute -top-6 -left-3 text-7xl font-serif text-zinc-100 dark:text-zinc-900/40 select-none pointer-events-none">“</span>
              <p className="relative z-10 text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-300 leading-relaxed font-sans italic">
                {profileUser.bio || 'WeTalks bünyesinde, dürüst ve derinlemesine teknoloji, e-ticaret, e-ihracat analizleri üretmeye ve bağımsız gelişim zincirlerini desteklemeye odaklanıyorum.'}
              </p>
            </div>
          </div>

          {/* Bento Block B: Expertise Focus areas */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3.5">
            <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest font-sans uppercase">
              Odak ve Uzmanlık Alanları
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profileUser.expertise && profileUser.expertise.length > 0 ? (
                profileUser.expertise.map((exp, i) => (
                  <span 
                    key={i} 
                    className="text-[11px] font-sans font-bold bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border border-zinc-150 dark:border-zinc-805 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span className="text-[#0D62FE] font-bold text-xs">#</span>
                    {exp}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-zinc-400 italic">Etiket eklenmemiş.</span>
              )}
            </div>
          </div>

          {/* Bento Block C: Professional Network Links */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-widest font-sans uppercase">
              Profesyonel Yayın Ağı
            </h4>
            
            <div className="grid grid-cols-1 gap-2.5">
              {profileUser.socials.linkedin && (
                <a 
                  href={profileUser.socials.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/50 hover:bg-blue-50/30 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 hover:border-blue-200 dark:hover:border-blue-900/30 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-xl text-blue-600 dark:text-blue-400">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-sans font-bold text-zinc-750 dark:text-zinc-200">LinkedIn Profili</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {profileUser.socials.twitter && (
                <a 
                  href={profileUser.socials.twitter} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/50 hover:bg-sky-50/30 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 hover:border-sky-200 dark:hover:border-sky-900/30 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-sky-100 dark:bg-sky-950/50 rounded-xl text-sky-500 dark:text-sky-400">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-sans font-bold text-zinc-750 dark:text-zinc-200">Twitter / X Hesabı</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {profileUser.socials.github && (
                <a 
                  href={profileUser.socials.github} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/50 hover:bg-zinc-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 hover:border-zinc-300 dark:hover:border-zinc-800 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100">
                      <Github className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-sans font-bold text-zinc-750 dark:text-zinc-200">GitHub Arşivi</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {profileUser.socials.website && (
                <a 
                  href={profileUser.socials.website} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50/50 hover:bg-emerald-50/30 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 border border-zinc-150 dark:border-zinc-805 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-sans font-bold text-zinc-750 dark:text-zinc-200">Kişisel Web Sitesi</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}

              {!profileUser.socials.linkedin && !profileUser.socials.twitter && !profileUser.socials.github && !profileUser.socials.website && (
                <div className="text-xs text-zinc-400 italic text-center py-4 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                  Sosyal bağlantı eklenmemiş.
                </div>
              )}
            </div>
          </div>

          {/* Bento Block D: Yazara Özel Bülten Bülteni (Premium & Dynamic Hook) */}
          <div className="bg-gradient-to-br from-zinc-50/60 to-zinc-100/50 dark:from-zinc-950 dark:to-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#0D62FE]" />
              <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 tracking-wider font-sans uppercase">
                {profileUser.name} Bültenine Abone Olun
              </h4>
            </div>
            
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
              Yazarın doğrudan platformda yayınlayacağı en özel analizlerden, derinlemesine makalelerden ve bültenlerden anında e-posta ile haberdar olun.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                <span className="text-xs font-sans font-bold text-emerald-600 dark:text-emerald-400 block">Kayıt Başarılı!</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">{profileUser.name} akışına bağlandınız.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribeToWriter} className="space-y-2.5">
                <input 
                  type="email"
                  required
                  placeholder="E-posta adresiniz..."
                  value={subscriberEmail}
                  onChange={(e) => setSubscriberEmail(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-sans font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Kaydediliyor...' : 'Yazara Abone Ol'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* --- RIGHT COL: TABBED AREA & INTERACTIVE METRIC PANELS (Col Span 8) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 3A. PREMIUM TAB SELECTOR */}
          <div className="bg-zinc-50 dark:bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-150 dark:border-zinc-800 flex items-center gap-1">
            <button
              onClick={() => {
                if (playPluckSynth) playPluckSynth('click');
                setActiveTab('articles');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-sans font-black transition-all cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-white dark:bg-zinc-900 text-[#0D62FE] dark:text-white border border-zinc-150 dark:border-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Yayınlar ({writerArticleList.length})
            </button>

            <button
              onClick={() => {
                if (playPluckSynth) playPluckSynth('click');
                setActiveTab('analytics');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-sans font-black transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white dark:bg-zinc-900 text-[#0D62FE] dark:text-white border border-zinc-150 dark:border-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20 border border-transparent'
              }`}
            >
              <Activity className="w-4 h-4" />
              Etki & Analizler
            </button>

            <button
              onClick={() => {
                if (playPluckSynth) playPluckSynth('click');
                setActiveTab('about');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-sans font-black transition-all cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-white dark:bg-zinc-900 text-[#0D62FE] dark:text-white border border-zinc-150 dark:border-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/20 border border-transparent'
              }`}
            >
              <User className="w-4 h-4" />
              Derin Profil Bilgisi
            </button>
          </div>

          {/* 3B. TAB CONTENTS */}

          {/* TAB 1: ARTICLES GRID (With Highlight Featured Header) */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              
              {/* Highlight Featured Article Option if exists and has published articles */}
              {writerArticleList.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider font-sans uppercase">
                      ⭐ En Çok İlgi Gören Yayın
                    </span>
                    <span className="text-[10px] font-mono text-[#0D62FE] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30 font-bold">
                      Öne Çıkarılan
                    </span>
                  </div>

                  {(() => {
                    // Pick the longest read-time or views-based article as featured
                    const featured = [...writerArticleList].sort((a, b) => b.readTime - a.readTime)[0];
                    return (
                      <div 
                        onClick={() => onNavigate('article', { id: featured.id })}
                        className="group cursor-pointer bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/40 p-5 rounded-3xl border border-zinc-150 dark:border-zinc-800 hover:border-[#0D62FE] dark:hover:border-[#5591FF] hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                          <div className="md:col-span-5 h-44 rounded-2xl overflow-hidden relative border border-zinc-100 dark:border-zinc-800">
                            <img 
                              src={featured.coverImage} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" 
                              referrerPolicy="no-referrer" 
                              onError={(e) => handleImageErrorGlobal(e, 'cover')} 
                            />
                            <div className="absolute top-2.5 left-2.5 bg-zinc-950/85 backdrop-blur-md text-white text-[9.5px] font-black font-sans px-2.5 py-1 rounded-lg tracking-wider uppercase">
                              {featured.readTime} Dk Okuma
                            </div>
                          </div>
                          <div className="md:col-span-7 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {new Date(featured.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                              <span className="text-zinc-300 dark:text-zinc-700">•</span>
                              <span className="text-[10.5px] text-[#0D62FE] dark:text-blue-400 font-sans font-black tracking-wider uppercase">
                                {featured.categoryId.toUpperCase()}
                              </span>
                            </div>
                            <h3 className="text-lg font-serif font-black text-zinc-900 dark:text-white group-hover:text-[#0D62FE] dark:group-hover:text-[#5591FF] transition-colors leading-snug">
                              {featured.title}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                              {featured.summary}
                            </p>
                            <div className="flex items-center gap-3 pt-1">
                              <span className="text-[10.5px] font-sans font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-150/40 dark:border-zinc-800">
                                ❤️ {featured.likes || 0} Beğeni
                              </span>
                              <span className="text-[10.5px] font-sans font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-150/40 dark:border-zinc-800">
                                👁️ {featured.views || 0} Gözlem
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Grid of other publications */}
              <div className="space-y-4">
                <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider font-sans uppercase block">
                  📰 Tüm Yayın Arşivi
                </span>

                {writerArticleList.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-6">
                    <BookOpen className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs text-zinc-400 italic">Bu yazar tarafından yayınlanmış henüz bir makale bulunmamaktadır.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {writerArticleList.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => onNavigate('article', { id: item.id })}
                        className="group cursor-pointer bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 hover:border-zinc-250 dark:hover:border-zinc-700 p-3.5 rounded-2xl hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full"
                      >
                        <div className="space-y-3">
                          <div className="h-40 rounded-xl overflow-hidden relative border border-zinc-100 dark:border-zinc-900">
                            <img 
                              src={item.coverImage} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                              referrerPolicy="no-referrer" 
                              onError={(e) => handleImageErrorGlobal(e, 'cover')} 
                            />
                            <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[9px] font-mono px-2 py-0.5 rounded-md">
                              {item.readTime} dk okuma
                            </span>
                          </div>
                          
                          <div className="space-y-1.5 px-0.5">
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                              <span>{new Date(item.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                              <span>•</span>
                              <span className="text-[#0D62FE] dark:text-blue-400 font-bold uppercase">{item.categoryId}</span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-sans font-black text-zinc-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#0D62FE] dark:group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-zinc-550 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 mt-4 border-t border-zinc-100 dark:border-zinc-900/60 text-[10px] font-mono text-zinc-400">
                          <span className="font-bold">Detayları Oku</span>
                          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: ANALYTICS & STATS (Fully Interactive custom dashboard metrics) */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Core Analytics Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl shadow-sm text-center">
                  <span className="text-[9.5px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase block mb-1">Toplam Erişim</span>
                  <span className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white block">{totalViews.toLocaleString('tr-TR')}</span>
                  <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">▲ %12.4 Haftalık</span>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl shadow-sm text-center">
                  <span className="text-[9.5px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase block mb-1">Katkı Süresi</span>
                  <span className="text-xl sm:text-2xl font-serif font-black text-zinc-900 dark:text-white block">{totalReadTime} Dk</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Yayın İçerik Hacmi</span>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl shadow-sm text-center">
                  <span className="text-[9.5px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase block mb-1">Beğeni Skoru</span>
                  <span className="text-xl sm:text-2xl font-serif font-black text-[#0D62FE] dark:text-blue-400 block">+{totalLikes}</span>
                  <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">Fayda/Okuyucu</span>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl shadow-sm text-center">
                  <span className="text-[9.5px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider uppercase block mb-1">Etki Derecesi</span>
                  <span className="text-xl sm:text-2xl font-serif font-black text-orange-500 block">
                    {profileUser.followersCount > 100 ? 'A++ Pro' : 'B+ Standart'}
                  </span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">Yayıncı Derecesi</span>
                </div>
              </div>

              {/* Beautiful custom vector chart: Category coverage Distribution */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-sans font-black text-zinc-900 dark:text-white">Kategori ve İçerik Yoğunluğu</h3>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Yazarın yayınladığı makalelerin sektörel ve kanalsal dağılım analizi.</p>
                  </div>
                  <span className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400">
                    <TrendingUp className="w-4 h-4 text-[#0D62FE]" />
                  </span>
                </div>

                {/* Grid showing distribution bars */}
                <div className="space-y-3.5 pt-2">
                  {Object.entries(categoryCounts).length > 0 ? (
                    Object.entries(categoryCounts).map(([catId, count]) => {
                      const percentage = Math.round((count / writerArticleList.length) * 100);
                      return (
                        <div key={catId} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-sans font-bold">
                            <span className="text-zinc-700 dark:text-zinc-300 uppercase">{catId}</span>
                            <span className="text-zinc-500 dark:text-zinc-400">{count} Makale ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-[#0D62FE] to-cyan-400 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-zinc-400 italic">Henüz yeterli veri bulunmamaktadır.</div>
                  )}
                </div>
              </div>

              {/* Dynamic Timeline of Activity Infograph */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-sans font-black text-zinc-900 dark:text-white">Haftalık Yayın Dağılımı (Trend)</h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Yazarın son 6 haftalık yayım ve okuyucu etkileşim yoğunluk grafiği.</p>
                </div>

                {/* Visual custom chart blocks */}
                <div className="flex items-end justify-between h-32 pt-4 border-b border-zinc-100 dark:border-zinc-900/60 px-4">
                  {[
                    { week: '6. Hafta', published: true, score: 35, color: '#0D62FE' },
                    { week: '5. Hafta', published: false, score: 12, color: '#94A3B8' },
                    { week: '4. Hafta', published: true, score: 75, color: '#0D62FE' },
                    { week: '3. Hafta', published: true, score: 50, color: '#0D62FE' },
                    { week: '2. Hafta', published: false, score: 20, color: '#94A3B8' },
                    { week: 'Son Hafta', published: true, score: 92, color: '#0D62FE' },
                  ].map((wk, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 w-1/6 group">
                      <div className="w-full relative flex justify-center">
                        {/* Tooltip bubble on hover */}
                        <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-zinc-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded transition-opacity duration-200 z-10">
                          Değer: {wk.score}%
                        </span>
                        
                        <div 
                          className="w-4 sm:w-6 rounded-t-md transition-all duration-700 ease-out"
                          style={{ 
                            height: `${wk.score * 0.8}px`,
                            backgroundColor: wk.published ? wk.color : 'rgba(148, 163, 184, 0.2)'
                          }}
                        />
                      </div>
                      <span className="text-[9.5px] font-sans font-bold text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">{wk.week}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400 pt-1">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0D62FE]" />
                    <span>Yayın Haftası</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <span>Sadece Okuma Aktifliği</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: DEEP BIO & STATS */}
          {activeTab === 'about' && (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-6 sm:p-8 rounded-[28px] shadow-sm space-y-6">
              
              <div className="space-y-4">
                <h3 className="text-base font-serif font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  Detaylı Özgeçmiş ve Yayın Kimliği
                </h3>

                <p className="text-xs sm:text-[13px] text-zinc-650 dark:text-zinc-350 leading-relaxed font-sans space-y-3">
                  {profileUser.bio ? (
                    profileUser.bio
                  ) : (
                    <span>Yazar, WeTalks topluluğunda nitelikli, dürüst ve bağımsız içerik ekosistemini güçlendiren uzman bir kalemdir.</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-900/60">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider font-sans uppercase">Platform Rol Yetkisi</h4>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">{badgeInfo.label} Yetkilendirmesi</span>
                      <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 block">Kürasyon ve onaylama mekanizmasına dahil hesap</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider font-sans uppercase">Yazar Hesabı İletişim</h4>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                    <Mail className="w-5 h-5 text-[#0D62FE]" />
                    <div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">İrtibat ve Koordinasyon</span>
                      <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 block font-mono">wetalks-desk@{profileUser.username}.com</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 4. EDIT PROFILE MODAL */}
      {isEditing && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditing(false);
          }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-[#0c0f1d] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto relative animate-in zoom-in-95 duration-200 scrollbar-none">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Edit className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="text-xl font-serif font-bold text-zinc-900 dark:text-white">Profilinizi Düzenleyin</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
                WeTalks profil kartınızı, biyografinizi ve sosyal medya bağlantılarınızı özelleştirin.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {saveError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-650 dark:text-red-400 text-xs font-sans font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Avatar Live Preview & URL */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 space-y-3">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold font-sans tracking-wider block">Yazar Görseli & Kimlik</span>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <img 
                      src={editForm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} 
                      alt="Önizleme" 
                      className="w-20 h-20 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';
                      }}
                    />
                  </div>
                  
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 w-full border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[90px] ${
                      isDragging 
                        ? 'border-[#0D62FE] bg-[#0D62FE]/5 dark:bg-blue-500/5' 
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-[#0D62FE]/50 bg-white dark:bg-zinc-950/40'
                    }`}
                    onClick={() => document.getElementById('avatar-file-input')?.click()}
                  >
                    <Upload className="w-4 h-4 text-[#0D62FE] dark:text-blue-400 animate-bounce" />
                    <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
                      Görseli buraya sürükleyin veya tıklayın
                    </span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
                      PNG, JPG, WEBP (Maks 5MB)
                    </span>
                    <input 
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1">
                  <label className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 block">Alternatif Profil Fotoğrafı URL'si</label>
                  <input 
                    type="url"
                    value={editForm.avatar}
                    onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-[11px] p-2 bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl focus:border-[#0D62FE] dark:focus:border-blue-500 focus:outline-none transition-colors text-zinc-750 dark:text-zinc-200 font-mono"
                  />
                </div>
              </div>

              {/* Name & Username Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-650 dark:text-zinc-300">Ad Soyad *</label>
                  <input 
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Örn. Orhan Balcı"
                    className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:bg-white dark:focus:bg-zinc-950 focus:border-[#0D62FE] focus:outline-none transition-all text-zinc-850 dark:text-zinc-100 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-650 dark:text-zinc-300">Kullanıcı Adı *</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs text-zinc-400 font-mono font-bold">@</span>
                    <input 
                      type="text"
                      required
                      value={editForm.username}
                      onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value.replace(/\s+/g, '').toLowerCase() }))}
                      placeholder="kullanici_adi"
                      className="w-full text-xs pl-7 pr-3 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:bg-white dark:focus:bg-zinc-950 focus:border-[#0D62FE] focus:outline-none transition-all text-zinc-800 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Manifesto */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-650 dark:text-zinc-300">Yazar Manifestosu & Biyografi</label>
                <textarea 
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Manifestonuzu veya kendinizi tanıtan kısa bir biyografi girin..."
                  rows={3}
                  className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:bg-white dark:focus:bg-zinc-950 focus:border-[#0D62FE] focus:outline-none transition-all text-zinc-750 dark:text-zinc-200 leading-relaxed"
                />
              </div>

              {/* Expertise Tags */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-650 dark:text-zinc-300">Uzmanlık Alanları</label>
                  <span className="text-[9px] text-zinc-400">Virgülle ayırın</span>
                </div>
                <input 
                  type="text"
                  value={editForm.expertise}
                  onChange={(e) => setEditForm(prev => ({ ...prev, expertise: e.target.value }))}
                  placeholder="Yapay Zeka, E-İhracat, Girişimcilik, SaaS"
                  className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:bg-white dark:focus:bg-zinc-950 focus:border-[#0D62FE] focus:outline-none transition-all text-zinc-800 dark:text-zinc-100 font-medium"
                />
              </div>

              {/* Social Links Network Group */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold font-sans tracking-wider block">Yayın Ağı & Sosyal Bağlantılar</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* LinkedIn */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-sans font-semibold block">LinkedIn Profili</span>
                    <input 
                      type="url"
                      value={editForm.linkedin}
                      onChange={(e) => setEditForm(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full text-[11px] p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:bg-white dark:focus:bg-zinc-950 focus:border-blue-500 focus:outline-none transition-all text-zinc-850 dark:text-zinc-200 font-mono"
                    />
                  </div>

                  {/* Twitter */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-sans font-semibold block">Twitter / X Profili</span>
                    <input 
                      type="url"
                      value={editForm.twitter}
                      onChange={(e) => setEditForm(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://twitter.com/username"
                      className="w-full text-[11px] p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:bg-white dark:focus:bg-zinc-950 focus:border-sky-500 focus:outline-none transition-all text-zinc-850 dark:text-zinc-200 font-mono"
                    />
                  </div>

                  {/* GitHub */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-sans font-semibold block">GitHub Arşivi</span>
                    <input 
                      type="url"
                      value={editForm.github}
                      onChange={(e) => setEditForm(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="https://github.com/username"
                      className="w-full text-[11px] p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:bg-white dark:focus:bg-zinc-950 focus:border-zinc-500 focus:outline-none transition-all text-zinc-850 dark:text-zinc-200 font-mono"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-sans font-semibold block">Kişisel Web Sitesi</span>
                    <input 
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                      className="w-full text-[11px] p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:bg-white dark:focus:bg-zinc-950 focus:border-emerald-500 focus:outline-none transition-all text-zinc-850 dark:text-zinc-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#0D62FE] hover:bg-[#0D62FE]/90 rounded-xl transition-all hover:scale-102 active:scale-98 cursor-pointer shadow-md shadow-blue-500/10 flex items-center justify-center gap-2 min-w-32 disabled:opacity-75"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <span>Değişiklikleri Kaydet</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
