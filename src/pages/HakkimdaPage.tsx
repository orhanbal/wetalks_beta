import { ArrowRight } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

interface HakkimdaPageProps {
  navigate: (to: string) => void;
  settings: Record<string, string>;
}

export default function HakkimdaPage({ navigate, settings }: HakkimdaPageProps) {
  useSEO({
    title: 'Bana Dair',
    description: "Ticaretin, teknolojinin ve insanın kesişiminde üretmeye çalışan bir girişimciyim.",
    canonical: 'https://obtalks.tr/#bana-dair',
  });

  const authorPhoto = settings['author_photo'] || '';
  const authorName = settings['author_name'] || '';
  const authorTitle = settings['author_title'] || '';
  const aboutText1 = settings['about_text_1'] || '';
  const aboutText2 = settings['about_text_2'] || '';
  const aboutText3 = settings['about_text_3'] || '';
  const aboutQuote = settings['about_quote'] || '';
  const aboutTopicsRaw = settings['about_topics'] || '';
  const aboutTopics = aboutTopicsRaw ? aboutTopicsRaw.split('\n').filter(Boolean) : [];

  return (
    <main>
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1 className="page-title">Bana Dair</h1>
          <p className="page-subtitle">{settings['about_subtitle'] || 'Ticaretin, teknolojinin ve insanın kesişiminde.'}</p>
        </div>
      </div>

      <div className="divider-full" />

      <div className="about-content">
        {(authorPhoto || authorName) && (
          <div className="about-author-row">
            {authorPhoto && (
              <img
                src={authorPhoto}
                alt={authorName}
                className="about-author-photo"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {authorName && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#111', marginBottom: '0.25rem' }}>{authorName}</div>
                {authorTitle && <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{authorTitle}</div>}
              </div>
            )}
          </div>
        )}

        {aboutText1 && <p>{aboutText1}</p>}
        {aboutText2 && <p>{aboutText2}</p>}
        {aboutText3 && <p>{aboutText3}</p>}

        {aboutTopics.length > 0 && (
          <>
            <div className="about-divider" />
            <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Burada;</p>
            <ul className="about-topics">
              {aboutTopics.map((topic, i) => {
                const [bold, rest] = topic.includes(' — ') ? topic.split(' — ') : [null, topic];
                return (
                  <li key={i}>
                    {bold ? <><strong>{bold}</strong>{' — '}{rest}</> : rest}
                  </li>
                );
              })}
            </ul>
            <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>konuşuyoruz.</p>
          </>
        )}

        {aboutQuote && (
          <>
            <div className="about-divider" />
            <p style={{ fontStyle: 'italic', color: '#555', borderLeft: '3px solid #e5e7eb', paddingLeft: '1rem' }}>
              {aboutQuote}
            </p>
          </>
        )}

        {authorName && <p style={{ color: '#374151', marginTop: '1.25rem' }}>— {authorName}</p>}

        <div className="about-actions">
          <button className="btn-secondary" onClick={() => navigate('contents')}>
            Yazıları Oku <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </main>
  );
}
