import React from 'react';
import { FileCheck, ArrowLeft, AlertCircle, BookOpen, Scale, Mail } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate: (view: string) => void;
}

export default function TermsOfService({ onNavigate }: TermsOfServiceProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left font-sans animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Ana Sayfaya Dön</span>
      </button>

      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 bg-[#0D62FE]/10 border border-[#0D62FE]/20 px-3 py-1 rounded-full text-[#0D62FE] text-[11px] font-bold uppercase tracking-wider mb-3">
          <FileCheck className="w-3.5 h-3.5" />
          Kullanıcı Sözleşmesi
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-zinc-900 dark:text-white tracking-tight">
          Kullanım Koşulları
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Son Güncelleme: 20 Mart 2026 • WeTalks (wetalks.tr)
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#0D62FE]" />
            1. Giriş ve Kabul
          </h2>
          <p>
            WeTalks (<strong>wetalks.tr</strong>) web sitesini ziyaret ederek, içeriklerini okuyarak veya sunulan hizmetlerden yararlanarak bu Kullanım Koşulları&apos;nı kabul etmiş sayılırsınız. Bu koşulları kabul etmiyorsanız lütfen siteyi kullanmayınız.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0D62FE]" />
            2. Fikri Mülkiyet Hakları
          </h2>
          <p>
            WeTalks üzerinde yayınlanan tüm özgün makaleler, analizler, görsel tasarımlar, logolar ve yazılımlar WeTalks&apos;a ve ilgili yazarlarına aittir ve ulusal ile uluslararası telif hakkı mevzuatıyla korunmaktadır.
          </p>
          <p>
            İçerikler, kaynak gösterilerek (WeTalks ve aktif bağlantı verilerek) yapılan kısa alıntılar haricinde izinsiz kopyalanamaz, çoğaltılamaz veya ticari amaçlarla yeniden dağıtılamaz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#0D62FE]" />
            3. Bilgilendirme Niteliği ve Sorumluluk Reddi
          </h2>
          <p>
            WeTalks&apos;ta yer alan makale, analiz ve röportajlar genel bilgilendirme, eğitim ve fikir paylaşımı niteliğindedir. Sitede yer alan hiçbir içerik yatırım, finans, hukuk veya vergi tavsiyesi teşkil etmez. İçeriklerin kullanımından doğabilecek kararlardan kullanıcıların kendileri sorumludur.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0D62FE]" />
            4. İletişim
          </h2>
          <p>
            Kullanım koşulları hakkındaki görüş, öneri ve bildirimleriniz için bizimle irtibata geçebilirsiniz:
          </p>
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="font-semibold text-zinc-900 dark:text-white">WeTalks Yönetimi</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">E-posta: <a href="mailto:orhan@wetalks.tr" className="text-[#0D62FE] hover:underline">orhan@wetalks.tr</a></p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Web: <a href="https://wetalks.tr" className="text-[#0D62FE] hover:underline">wetalks.tr</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
