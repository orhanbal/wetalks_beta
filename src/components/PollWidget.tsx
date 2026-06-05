import { useState, useEffect, useRef } from 'react';
import { BarChart2, X, CheckCircle2, Users } from 'lucide-react';
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
}

function getSessionId(): string {
  let sid = localStorage.getItem('poll_session_id');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('poll_session_id', sid);
  }
  return sid;
}

export default function PollWidget({ pollId }: { pollId?: string | null }) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pollId) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .maybeSingle();

      setPoll(data ?? null);

      if (data) {
        const sid = getSessionId();
        const { data: existingVote } = await supabase
          .from('poll_votes')
          .select('option_id')
          .eq('poll_id', data.id)
          .eq('session_id', sid)
          .maybeSingle();

        if (existingVote) {
          setVoted(true);
          setSelectedOption(existingVote.option_id);
          await loadVotes(data.id);
          setShowResults(true);
        }
      }

      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const loadVotes = async (pollId: string) => {
    const { data } = await supabase
      .from('poll_votes')
      .select('option_id')
      .eq('poll_id', pollId);

    const counts: Record<string, number> = {};
    (data ?? []).forEach(v => {
      counts[v.option_id] = (counts[v.option_id] ?? 0) + 1;
    });
    setVotes(counts);
    return counts;
  };

  const handleVote = async () => {
    if (!poll || !selectedOption || submitting) return;
    setSubmitting(true);

    const sid = getSessionId();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('poll_votes').insert({
      poll_id: poll.id,
      option_id: selectedOption,
      session_id: sid,
      user_id: user?.id ?? null,
    });

    await loadVotes(poll.id);
    setVoted(true);
    setShowResults(true);
    setSubmitting(false);
  };

  const openModal = async () => {
    if (poll && !voted) {
      setShowResults(false);
    } else if (poll && voted) {
      await loadVotes(poll.id);
      setShowResults(true);
    }
    setModalOpen(true);
  };

  const total = Object.values(votes).reduce((s, n) => s + n, 0);
  const isExpired = poll?.ends_at ? new Date(poll.ends_at) < new Date() : false;

  if (loading) return null;

  return (
    <>
      {/* Card */}
      <div className="poll-widget">
        {!poll || isExpired ? (
          <div className="poll-no-active">
            <div className="poll-no-active-icon">
              <BarChart2 size={28} />
            </div>
            <div className="poll-no-active-title">Aktif anket yok</div>
            <div className="poll-no-active-text">
              Yeni bir anket yayınlandığında burada görüntülenecek.
            </div>
          </div>
        ) : (
          <div className="poll-card-body">
            {(voted ? (poll.thank_you_image_url ?? poll.image_url) : poll.image_url) && (
              <div className="poll-card-image">
                <img src={(voted ? (poll.thank_you_image_url ?? poll.image_url) : poll.image_url)!} alt={poll.question} />
              </div>
            )}
            <div className="poll-card-content">
              <div className="poll-card-badge">
                <BarChart2 size={11} />
                <span>Anket</span>
              </div>
              <div className="poll-card-question">{poll.title ?? poll.question}</div>
              {(voted ? (poll.thank_you_description ?? poll.description) : poll.description) && (
                <div className="poll-card-description">
                  {voted ? (poll.thank_you_description ?? poll.description) : poll.description}
                </div>
              )}
              <div className="poll-card-footer">
                <button className="poll-join-btn" onClick={openModal}>
                  {voted ? 'Sonuçları Gör' : 'Katıl'}
                </button>
                {voted && total > 0 && (
                  <span className="poll-card-votes">
                    <Users size={12} />
                    {total} oy
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {modalOpen && poll && !isExpired && (
        <div
          className="poll-modal-overlay"
          ref={overlayRef}
          onClick={e => { if (e.target === overlayRef.current) setModalOpen(false); }}
        >
          <div className="poll-modal">
            {/* Header */}
            <div className="poll-modal-header">
              <div className="poll-modal-header-left">
                <BarChart2 size={16} />
                <span>Anket</span>
              </div>
              <button className="poll-modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="poll-modal-body">
              {/* Question + image */}
              <div className="poll-modal-question-row">
                {poll.image_url && (
                  <img className="poll-modal-thumb" src={poll.image_url} alt={poll.question} />
                )}
                <div className="poll-modal-question">{poll.question}</div>
              </div>

              {!showResults ? (
                <>
                  <div className="poll-modal-options">
                    {poll.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOption(opt.id)}
                        className={`poll-option${selectedOption === opt.id ? ' poll-option--selected' : ''}`}
                      >
                        <span className={`poll-option-radio${selectedOption === opt.id ? ' poll-option-radio--checked' : ''}`} />
                        <span className="poll-option-text">{opt.text}</span>
                      </button>
                    ))}
                  </div>

                  <div className="poll-modal-actions">
                    <button
                      onClick={handleVote}
                      disabled={!selectedOption || submitting}
                      className="poll-vote-btn"
                    >
                      {submitting ? 'Gönderiliyor...' : 'Oy Ver'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {voted && (
                    <div className="poll-voted-msg">
                      <CheckCircle2 size={14} />
                      Oyunuz alındı
                    </div>
                  )}

                  <div className="poll-results">
                    {poll.options.map(opt => {
                      const count = votes[opt.id] ?? 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      const isChosen = selectedOption === opt.id;
                      return (
                        <div key={opt.id} className={`poll-result-item${isChosen ? ' poll-result-item--chosen' : ''}`}>
                          <div className="poll-result-label">
                            <span className="poll-result-text">{opt.text}</span>
                            <span className="poll-result-pct">{pct}%</span>
                          </div>
                          <div className="poll-result-bar-bg">
                            <div className="poll-result-bar" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="poll-result-count">
                            <Users size={11} />
                            {count} oy
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!voted && (
                    <button onClick={() => setShowResults(false)} className="poll-results-link">
                      Geri dön
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="poll-modal-footer">
              {voted && <><Users size={13} /><span>{total} toplam oy</span></>}
              {poll.ends_at && (
                <span className="poll-ends-at">
                  {voted && ' · '}Son katılım: {new Date(poll.ends_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
