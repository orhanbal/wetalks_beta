import { useState, useEffect } from 'react';
import { BarChart2, CheckCircle2, Users, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PollOption {
  id: string;
  text: string;
}

interface Poll {
  id: string;
  title: string | null;
  question: string;
  options: PollOption[];
  is_active: boolean;
  ends_at: string | null;
  image_url: string | null;
  description: string | null;
  thank_you_description: string | null;
  thank_you_image_url: string | null;
  created_at: string;
}

function getSessionId(): string {
  let sid = localStorage.getItem('poll_session_id');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('poll_session_id', sid);
  }
  return sid;
}

function PollItem({ poll }: { poll: Poll }) {
  const [expanded, setExpanded] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const isExpired = poll.ends_at ? new Date(poll.ends_at) < new Date() : false;

  useEffect(() => {
    if (!expanded || initialized) return;
    const init = async () => {
      const sid = getSessionId();
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', poll.id)
        .eq('session_id', sid)
        .maybeSingle();

      if (existingVote) {
        setVoted(true);
        setSelectedOption(existingVote.option_id);
        await loadVotes();
        setShowResults(true);
      } else if (isExpired) {
        await loadVotes();
        setShowResults(true);
      }
      setInitialized(true);
    };
    init();
  }, [expanded]);

  const loadVotes = async () => {
    const { data } = await supabase
      .from('poll_votes')
      .select('option_id')
      .eq('poll_id', poll.id);
    const counts: Record<string, number> = {};
    (data ?? []).forEach(v => {
      counts[v.option_id] = (counts[v.option_id] ?? 0) + 1;
    });
    setVotes(counts);
    return counts;
  };

  const handleVote = async () => {
    if (!selectedOption || submitting) return;
    setSubmitting(true);
    const sid = getSessionId();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('poll_votes').insert({
      poll_id: poll.id,
      option_id: selectedOption,
      session_id: sid,
      user_id: user?.id ?? null,
    });
    await loadVotes();
    setVoted(true);
    setShowResults(true);
    setSubmitting(false);
  };

  const total = Object.values(votes).reduce((s, n) => s + n, 0);

  const statusLabel = isExpired
    ? 'Sona Erdi'
    : poll.is_active
      ? 'Aktif'
      : 'Pasif';

  const statusColor = isExpired
    ? '#9ca3af'
    : poll.is_active
      ? '#16a34a'
      : '#9ca3af';

  const statusBg = isExpired
    ? '#f3f4f6'
    : poll.is_active
      ? '#dcfce7'
      : '#f3f4f6';

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 16,
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Header row */}
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '1rem',
          padding: '1.25rem 1.5rem', cursor: 'pointer',
        }}
        onClick={() => setExpanded(v => !v)}
      >
        {poll.image_url && (
          <img
            src={poll.image_url}
            alt={poll.question}
            style={{
              width: 60, height: 60, borderRadius: 10,
              objectFit: 'cover', flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: statusColor,
              background: statusBg, padding: '0.2rem 0.5rem',
              borderRadius: 99,
            }}>
              {statusLabel}
            </span>
            {poll.ends_at && !isExpired && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                <Clock size={11} />
                {new Date(poll.ends_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            )}
            {isExpired && poll.ends_at && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                <Clock size={11} />
                {new Date(poll.ends_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde sona erdi
              </span>
            )}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111', lineHeight: 1.4, marginBottom: '0.25rem' }}>
            {poll.title ?? poll.question}
          </div>
          {poll.title && (
            <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>{poll.question}</div>
          )}
          {poll.description && (
            <div style={{ fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.25rem', lineHeight: 1.5 }}>
              {poll.description}
            </div>
          )}
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          gap: '0.375rem', flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#f9fafb', border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6b7280',
          }}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {!showResults && !isExpired && !voted ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {poll.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      background: selectedOption === opt.id ? '#f0fdf4' : '#f9fafb',
                      border: `1.5px solid ${selectedOption === opt.id ? '#86efac' : '#e5e7eb'}`,
                      borderRadius: 10, padding: '0.75rem 1rem',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${selectedOption === opt.id ? '#22c55e' : '#d1d5db'}`,
                      background: selectedOption === opt.id ? '#22c55e' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selectedOption === opt.id && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />
                      )}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#111', fontWeight: selectedOption === opt.id ? 600 : 400 }}>
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || submitting}
                  style={{
                    background: '#111', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '0.625rem 1.5rem',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    opacity: (!selectedOption || submitting) ? 0.45 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  {submitting ? 'Gönderiliyor...' : 'Oy Ver'}
                </button>
                <button
                  onClick={async () => { await loadVotes(); setShowResults(true); }}
                  style={{
                    background: 'none', border: 'none', color: '#9ca3af',
                    fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    padding: '0.625rem 0',
                  }}
                >
                  Sonuçları gör
                </button>
              </div>
            </>
          ) : (
            <>
              {voted && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: '#16a34a', fontSize: '0.85rem', fontWeight: 600,
                }}>
                  <CheckCircle2 size={16} />
                  Oyunuz alındı
                </div>
              )}
              {isExpired && !voted && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  color: '#9ca3af', fontSize: '0.85rem',
                }}>
                  <Clock size={14} />
                  Bu anket sona erdi. Yalnızca sonuçları görüntüleyebilirsiniz.
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {poll.options.map(opt => {
                  const count = votes[opt.id] ?? 0;
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const isChosen = selectedOption === opt.id;
                  return (
                    <div key={opt.id}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '0.375rem',
                      }}>
                        <span style={{
                          fontSize: '0.875rem', color: isChosen ? '#111' : '#374151',
                          fontWeight: isChosen ? 700 : 400,
                          display: 'flex', alignItems: 'center', gap: '0.375rem',
                        }}>
                          {isChosen && <CheckCircle2 size={13} color="#22c55e" />}
                          {opt.text}
                        </span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{
                        height: 8, background: '#f3f4f6',
                        borderRadius: 99, overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: isChosen ? '#22c55e' : '#c8f542',
                          borderRadius: 99,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{
                        fontSize: '0.75rem', color: '#9ca3af',
                        marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem',
                      }}>
                        <Users size={11} /> {count} oy
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.8125rem', color: '#9ca3af', paddingTop: '0.25rem',
              }}>
                <Users size={13} />
                <span>Toplam {total} oy</span>
              </div>

              {!voted && !isExpired && (
                <button
                  onClick={() => setShowResults(false)}
                  style={{
                    alignSelf: 'flex-start', background: 'none', border: 'none',
                    color: '#6b7280', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', padding: 0,
                  }}
                >
                  ← Oy kullanmak istiyorum
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPolls(data ?? []);
        setLoading(false);
      });
  }, []);

  const activePolls = polls.filter(p => p.is_active && !(p.ends_at && new Date(p.ends_at) < new Date()));
  const pastPolls = polls.filter(p => !p.is_active || (p.ends_at && new Date(p.ends_at) < new Date()));

  return (
    <div style={{
      maxWidth: 680, margin: '0 auto',
      padding: '2.5rem 1.25rem 4rem',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#f0fdf4', color: '#16a34a',
          borderRadius: 99, padding: '0.3rem 0.875rem',
          fontSize: '0.75rem', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: '0.875rem',
        }}>
          <BarChart2 size={13} />
          Anketler
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.2 }}>
          Okuyucu Anketleri
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#6b7280', marginTop: '0.5rem', lineHeight: 1.6 }}>
          Aktif anketlere katılın, geçmiş anketlerin sonuçlarını görüntüleyin.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#9ca3af', fontSize: '0.875rem' }}>
          Yükleniyor...
        </div>
      ) : polls.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 1rem',
          background: '#fff', border: '1px dashed #e5e7eb',
          borderRadius: 16, color: '#9ca3af',
        }}>
          <BarChart2 size={36} style={{ margin: '0 auto 1rem', color: '#e5e7eb', display: 'block' }} />
          <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Henüz anket yok</div>
          <div style={{ fontSize: '0.8125rem' }}>Yeni bir anket yayınlandığında burada görünecek.</div>
        </div>
      ) : (
        <>
          {activePolls.length > 0 && (
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '0.875rem',
              }}>
                Aktif
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activePolls.map(p => <PollItem key={p.id} poll={p} />)}
              </div>
            </section>
          )}

          {pastPolls.length > 0 && (
            <section>
              <h2 style={{
                fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '0.875rem',
              }}>
                Geçmiş
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pastPolls.map(p => <PollItem key={p.id} poll={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
