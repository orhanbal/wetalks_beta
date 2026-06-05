import { Linkedin, Mail } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface IletisimPageProps {
  settings: Record<string, string>;
}

export default function IletisimPage({ settings }: IletisimPageProps) {
  useSEO({
    title: 'İletişim',
    description: 'Fikir paylaşmak, iş birliği yapmak veya merhaba demek için ulaşın.',
    canonical: 'https://obtalks.tr/#iletisim',
  });
  const linkedinUrl = settings['linkedin_url'] ?? '';
  const email = settings['email'] ?? '';

  return (
    <main>
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-title">İletişim</h1>
          <p className="page-subtitle">Fikir paylaşmak, iş birliği yapmak veya merhaba demek için ulaşabilirsiniz.</p>
        </div>
      </div>

      <div className="divider-full" />

      <div className="contact-blocks">
        {linkedinUrl && (
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="contact-block">
            <div className="contact-block-icon"><Linkedin size={22} /></div>
            <div className="contact-block-content">
              <h3>LinkedIn</h3>
              <p>Yazılarımı takip etmek ve mesaj göndermek için en hızlı yol.</p>
              <span className="contact-block-link">{linkedinUrl.replace('https://', '')} →</span>
            </div>
          </a>
        )}

        {email && (
          <a href={`mailto:${email}`} className="contact-block">
            <div className="contact-block-icon"><Mail size={22} /></div>
            <div className="contact-block-content">
              <h3>E-posta</h3>
              <p>Detaylı konuşmalar ve iş birliği teklifleri için.</p>
              <span className="contact-block-link">{email} →</span>
            </div>
          </a>
        )}

        {!linkedinUrl && !email && (
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', padding: '2rem 0' }}>
            İletişim bilgileri henüz ayarlanmamış. Admin panelinden ekleyebilirsiniz.
          </p>
        )}
      </div>

      <div className="contact-note">
        İçeriklerimi paylaşmaktan ve geri bildirim almaktan memnuniyet duyarım. Her mesajı
        okuyor, mümkün olduğunca yanıt vermeye çalışıyorum.
      </div>
    </main>
  );
}
