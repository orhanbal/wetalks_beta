import { useState } from 'react';
import { ArrowRight, Check, Linkedin, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface ModernFooterProps {
  navigate: (to: string) => void;
  settings?: Record<string, string>;
}

const NAV_LINKS = [
  { group: 'İçerik', links: [
    { label: 'Anasayfa', path: '' },
    { label: 'Tüm Yazılar', path: 'contents' },
    { label: 'Seriler', path: 'series' },
    { label: 'Keşfet', path: 'discover' },
  ]},
  { group: 'Sayfalar', links: [
    { label: 'Hakkımda', path: 'about' },
    { label: 'İletişim', path: 'contact' },
    { label: 'Anketler', path: 'polls' },
  ]},
];

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase() });
    if (error) {
      setStatus(error.code === '23505' ? 'duplicate' : 'error');
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <Check size={15} />
        Bülten listemize eklendiniz.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <Input
        type="email"
        placeholder="E-posta adresiniz"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={status === 'loading'}
        className="h-9 text-sm"
      />
      <Button type="submit" size="sm" disabled={status === 'loading' || !email.trim()} className="shrink-0">
        <ArrowRight size={15} />
      </Button>
    </form>
  );
}

export default function ModernFooter({ navigate, settings = {} }: ModernFooterProps) {
  const siteTitle = settings['site_title'] || 'Site';
  const logoUrl = settings['logo_url'] || '';
  const tagline = settings['footer_tagline'] || '';
  const copyright = settings['footer_copyright'] || `© ${new Date().getFullYear()} ${siteTitle}`;
  const linkedinUrl = settings['linkedin_url'] || '';

  return (
    <footer className="border-t bg-background mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <button onClick={() => navigate('')} className="focus-visible:outline-none">
              {logoUrl ? (
                <img src={logoUrl} alt={siteTitle} className="h-7 object-contain mb-3" />
              ) : (
                <span className="font-bold text-base text-foreground">{siteTitle}</span>
              )}
            </button>
            {tagline && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{tagline}</p>}
            <div className="flex items-center gap-2 mt-4">
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Linkedin size={14} />
                </a>
              )}
            </div>
          </div>

          {/* Nav groups */}
          {NAV_LINKS.map(group => (
            <div key={group.group}>
              <h4 className="text-sm font-semibold text-foreground mb-3">{group.group}</h4>
              <ul className="space-y-2">
                {group.links.map(link => (
                  <li key={link.path}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail size={14} className="text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Haftalık Bülten</h4>
            </div>
            <p className="text-sm text-muted-foreground">Yeni yazıları e-postanıza alın.</p>
            <NewsletterForm />
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>{copyright}</span>
          <span>{settings['site_domain'] || ''}</span>
        </div>
      </div>
    </footer>
  );
}
