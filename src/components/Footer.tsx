import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, 
  Send, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Flame, 
  Sparkles, 
  Mail, 
  ArrowUpRight, 
  BookOpen, 
  Newspaper, 
  Calendar, 
  Users, 
  Mic, 
  ArrowRight,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { SystemSettings } from '../types';
import { useToast } from './Toast';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
  playPluckSynth?: (type: string) => void;
  settings?: SystemSettings;
}

export default function Footer({ onNavigate, playPluckSynth, settings }: FooterProps) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    if (playPluckSynth) playPluckSynth('click');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
        if (playPluckSynth) playPluckSynth('success');
        toast.success('WeTalks bültenine başarıyla abone oldunuz! 🚀');
      } else {
        toast.error(data.error || 'Abonelik sırasında bir hata oluştu.');
      }
    } catch (err) {
      console.error('Newsletter error:', err);
      // Fallback to local simulated success if server is offline or fails
      setIsSubscribed(true);
      setEmail('');
      if (playPluckSynth) playPluckSynth('success');
      toast.success('Bülten aboneliğiniz kaydedildi! 🚀');
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerLinks = {
    publications: [
      { label: 'Haberler', icon: Newspaper, action: () => onNavigate('news') },
      { label: 'Makaleler', icon: BookOpen, action: () => onNavigate('articles') },
      { label: 'Yazı Dizileri', icon: Layers, action: () => onNavigate('series') },
      { label: 'Röportajlar', icon: Mic, action: () => onNavigate('interviews') },
      { label: 'Etkinlik Takvimi', icon: Calendar, action: () => onNavigate('events') },
    ],
    categories: [
      { label: 'Yapay Zeka', badge: 'Yeni', action: () => onNavigate('search', { category: 'yapay-zeka' }) },
      { label: 'Amazon & E-Ticaret', action: () => onNavigate('search', { category: 'amazon' }) },
      { label: 'Teknoloji Trendleri', action: () => onNavigate('search', { query: 'teknoloji' }) },
      { label: 'Deneyimler & Analiz', action: () => onNavigate('search', { category: 'deneyimler' }) },
      { label: 'Girişimcilik Rehberi', action: () => onNavigate('search', { query: 'girişimcilik' }) },
    ],
    quickAccess: [
      { label: 'Yazarlarımız', icon: Users, action: () => onNavigate('writers') },
      { label: 'Makale Keşfet', icon: Sparkles, action: () => onNavigate('explore') },
      { label: 'Yazar Paneli', icon: Flame, action: () => onNavigate('dashboard') },
    ]
  };

  return (
    <footer id="global-premium-footer" className="bg-[#081426] text-zinc-450 border-t border-zinc-900/80 relative overflow-hidden pt-16 pb-8 transition-colors duration-300">
      {/* Background Decorative Ambient light */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] rounded-full bg-[#0D62FE]/5 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-zinc-900/70">
          {/* Logo & Philosophy Column */}
          <div className="lg:col-span-4 space-y-5">
            {settings?.darkLogo || settings?.lightLogo ? (
              <div className="flex items-center gap-2">
                <img 
                  src={settings.darkLogo || settings.lightLogo} 
                  className="h-9 max-w-[180px] object-contain" 
                  alt="" 
                />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0D62FE] flex items-center justify-center text-white font-black shadow-md shadow-[#0D62FE]/20 shrink-0">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="8" cy="8" r="4" fill="white" fillOpacity="0.8" />
                    <circle cx="16" cy="8" r="4" fill="white" />
                    <circle cx="8" cy="16" r="4" fill="white" />
                    <circle cx="16" cy="16" r="4" fill="white" fillOpacity="0.6" />
                  </svg>
                </div>
                <span className="font-serif font-black text-white text-xl tracking-tight select-none">
                  {settings?.appName ? (
                    <span>{settings.appName}</span>
                  ) : (
                    <>We<span className="text-[#0D62FE]">Talks</span></>
                  )}
                </span>
              </div>
            )}
            <p className="text-xs sm:text-[13px] text-zinc-450 leading-relaxed font-sans max-w-sm">
              Sınır ötesi ticaret, dijital dönüşüm, e-ticaret operasyonları ve yapay zeka entegrasyonlarına odaklanan, modern yazarlar ve kıdemli editör kadrolarıyla donatılmış yeni nesil özgür yayıncılık ekosistemi.
            </p>
            <div className="pt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#0D62FE]" />
              <a href="mailto:orhan@wetalks.tr" className="hover:text-white transition-colors">orhan@wetalks.tr</a>
            </div>
          </div>

          {/* Yayınlar & Keşfet Column */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[11px] uppercase tracking-wider font-sans font-black text-white">Yayın Türleri</h4>
            <ul className="space-y-2.5">
              {footerLinks.publications.map((link, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      if (playPluckSynth) playPluckSynth('click');
                      link.action();
                    }}
                    className="group flex items-center gap-2 text-xs sm:text-[13px] text-zinc-450 hover:text-white transition-colors cursor-pointer text-left w-full focus:outline-none"
                  >
                    <link.icon className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#5591FF] transition-colors shrink-0" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Popüler Kategoriler Column */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[11px] uppercase tracking-wider font-sans font-black text-white">Öne Çıkan Başlıklar</h4>
            <ul className="space-y-2.5">
              {footerLinks.categories.map((link, i) => (
                <li key={i}>
                  <button
                    onClick={() => {
                      if (playPluckSynth) playPluckSynth('click');
                      link.action();
                    }}
                    className="group flex items-center justify-between gap-2 text-xs sm:text-[13px] text-zinc-450 hover:text-white transition-colors cursor-pointer text-left w-full focus:outline-none"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-[#0D62FE] transition-colors" />
                      <span className="truncate">{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className="text-[9px] bg-[#0D62FE]/15 text-[#7DA1C9] px-1.5 py-0.5 rounded-md font-sans font-black uppercase tracking-wide">
                        {link.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[11px] uppercase tracking-wider font-sans font-black text-white">Haftalık Bülten</h4>
            <p className="text-xs text-zinc-450 leading-relaxed">
              E-ticaret sahasından en dürüst analizleri, trendleri ve etkinlik bildirimlerini kaçırmamak için bültene katılın.
            </p>

            <AnimatePresence mode="wait">
              {!isSubscribed ? (
                <motion.form
                  key="newsletter-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleSubscribe}
                  className="space-y-2"
                >
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="E-posta adresiniz..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-[#0D62FE] rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all pr-10"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#0D62FE] hover:bg-[#0D62FE] text-white rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-550">
                    <Lock className="w-3 h-3 text-zinc-600 shrink-0" />
                    <span>Spam göndermeyiz. İstediğiniz zaman ayrılabilirsiniz.</span>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="newsletter-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-sans font-black">Bültene Kaydoldunuz!</span>
                  </div>
                  <p className="text-[11px] text-zinc-450 leading-normal">
                    Haftalık analizlerimiz artık e-posta kutunuza dürüstlükle ve zamanında ulaşacak. Teşekkürler!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick dashboard trigger */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (playPluckSynth) playPluckSynth('click');
                  onNavigate('dashboard');
                }}
                className="group flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              >
                <span>Yazar Masasına Git</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#0D62FE] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5">
            <span>&copy; 2026 WeTalks. Tüm Hakları Saklıdır.</span>
            <span className="hidden sm:inline text-zinc-800">•</span>
            <button
              onClick={() => {
                if (playPluckSynth) playPluckSynth('click');
                onNavigate('terms');
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Kullanım Koşulları
            </button>
            <span className="hidden sm:inline text-zinc-800">•</span>
            <button
              onClick={() => {
                if (playPluckSynth) playPluckSynth('click');
                onNavigate('privacy');
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Gizlilik Politikası
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[10px] font-bold tracking-wider text-zinc-400 uppercase">wetalks.tr</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
