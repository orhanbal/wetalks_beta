import React from 'react';
import { Shield, ArrowLeft, Mail, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (view: string) => void;
}

export default function PrivacyPolicy({ onNavigate }: PrivacyPolicyProps) {
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
          <Shield className="w-3.5 h-3.5" />
          Yasal Bilgilendirme
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black text-zinc-900 dark:text-white tracking-tight">
          Gizlilik Politikası
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Son Güncelleme: 20 Mart 2026 • WeTalks (wetalks.tr)
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#0D62FE]" />
            1. Genel Bakış ve Kapsam
          </h2>
          <p>
            WeTalks (<strong>wetalks.tr</strong>) olarak kişisel verilerinizin güvenliğine ve gizliliğine en üst düzeyde önem veriyoruz. Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde, içeriklerimizi okuduğunuzda veya bültenimize abone olduğunuzda toplanan bilgilerin nasıl işlendiğini, saklandığını ve korunduğunu açıklamaktadır.
          </p>
          <p>
            Platformumuz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) ve ilgili mevzuat uyarınca &quot;Veri Sorumlusu&quot; sıfatıyla hareket etmektedir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#0D62FE]" />
            2. Toplanan Veriler ve Toplama Amaçları
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Bülten Aboneliği:</strong> Haftalık içeriklerimizi ve sektörel analizlerimizi almak amacıyla paylaştığınız e-posta adresiniz yalnızca bülten gönderimleri için işlenir. Üçüncü şahıslara veya reklam verenlere asla satılmaz veya kiralanmaz.
            </li>
            <li>
              <strong>Teknik ve Analitik Veriler:</strong> Sitemizi ziyaret ettiğinizde IP adresi, tarayıcı türü, ziyaret edilen sayfalar ve oturum süresi gibi anonim istatistiksel veriler performans iyileştirme ve teknik güvenlik amacıyla işlenebilir.
            </li>
            <li>
              <strong>İletişim Talepleri:</strong> Bize e-posta veya iletişim formları aracılığıyla ilettiğiniz mesajlar, adınız ve iletişim bilgileriniz sorunuzu yanıtlamak amacıyla işlenir.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0D62FE]" />
            3. Çerezler (Cookies)
          </h2>
          <p>
            WeTalks, kullanıcı deneyimini iyileştirmek, tema tercihlerini (örneğin açık/koyu mod) ve oturum durumunu hatırlamak için zorunlu ve işlevsel çerezler kullanır. Tarayıcı ayarlarınız üzerinden dilediğiniz zaman çerez kullanımını engelleyebilir veya sınırlandırabilirsiniz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0D62FE]" />
            4. Veri Güvenliği ve Saklama
          </h2>
          <p>
            Verileriniz modern şifreleme yöntemleri ve endüstri standardı güvenlik protokolleri ile korunmaktadır. Yetkisiz erişim, veri kaybı ve kötüye kullanım risklerine karşı düzenli teknik denetimler yapılmaktadır.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-serif font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#0D62FE]" />
            5. İletişim ve Haklarınız
          </h2>
          <p>
            KVKK Madde 11 uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, silinmesini veya düzeltilmesini isteme hakkına sahipsiniz. Tüm talepleriniz ve sorularınız için bizimle doğrudan iletişime geçebilirsiniz:
          </p>
          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <p className="font-semibold text-zinc-900 dark:text-white">WeTalks İletişim</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">E-posta: <a href="mailto:orhan@wetalks.tr" className="text-[#0D62FE] hover:underline">orhan@wetalks.tr</a></p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Web: <a href="https://wetalks.tr" className="text-[#0D62FE] hover:underline">wetalks.tr</a></p>
          </div>
        </section>
      </div>
    </div>
  );
}
