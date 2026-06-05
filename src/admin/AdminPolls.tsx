import { useState, useEffect } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, CreditCard as Edit2, Check, X, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from './AdminLayout';
import ImageUpload from './ImageUpload';

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
  created_at: string;
  image_url: string | null;
  description: string | null;
  thank_you_description: string | null;
  thank_you_image_url: string | null;
}

interface PollWithVotes extends Poll {
  vote_count: number;
}

function generateId() {
  return Math.random().toString(36).slice(2, 8);
}

export default function AdminPolls() {
  const [polls, setPolls] = useState<PollWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [homepagePollId, setHomepagePollId] = useState<string | null>(null);

  const [question, setQuestion] = useState('');
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: generateId(), text: '' },
    { id: generateId(), text: '' },
  ]);
  const [endsAt, setEndsAt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [thankYouDescription, setThankYouDescription] = useState('');
  const [thankYouImageUrl, setThankYouImageUrl] = useState('');

  const fetchPolls = async () => {
    setLoading(true);
    const [{ data: pollData }, { data: settingData }] = await Promise.all([
      supabase.from('polls').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('value').eq('key', 'poll_homepage_id').maybeSingle(),
    ]);

    if (!pollData) { setLoading(false); return; }

    const currentHomepageId = settingData?.value ?? null;

    // Süresi dolmuş anket homepage'e atanmışsa temizle
    if (currentHomepageId) {
      const assignedPoll = pollData.find(p => p.id === currentHomepageId);
      const isExpired = assignedPoll?.ends_at && new Date(assignedPoll.ends_at) < new Date();
      if (!assignedPoll || isExpired) {
        await supabase.from('site_settings').update({ value: null }).eq('key', 'poll_homepage_id');
        setHomepagePollId(null);
      } else {
        setHomepagePollId(currentHomepageId);
      }
    } else {
      setHomepagePollId(null);
    }

    const { data: voteCounts } = await supabase
      .from('poll_votes')
      .select('poll_id');

    const counts: Record<string, number> = {};
    (voteCounts ?? []).forEach(v => {
      counts[v.poll_id] = (counts[v.poll_id] ?? 0) + 1;
    });

    setPolls(pollData.map(p => ({ ...p, vote_count: counts[p.id] ?? 0 })));
    setLoading(false);
  };

  useEffect(() => { fetchPolls(); }, []);

  const resetForm = () => {
    setQuestion('');
    setTitle('');
    setOptions([{ id: generateId(), text: '' }, { id: generateId(), text: '' }]);
    setEndsAt('');
    setImageUrl('');
    setDescription('');
    setThankYouDescription('');
    setThankYouImageUrl('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (poll: Poll) => {
    setQuestion(poll.question);
    setTitle(poll.title ?? '');
    setOptions(poll.options);
    setEndsAt(poll.ends_at ? poll.ends_at.slice(0, 16) : '');
    setImageUrl(poll.image_url ?? '');
    setDescription(poll.description ?? '');
    setThankYouDescription(poll.thank_you_description ?? '');
    setThankYouImageUrl(poll.thank_you_image_url ?? '');
    setEditingId(poll.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    const validOptions = options.filter(o => o.text.trim());
    if (!question.trim() || validOptions.length < 2) return;
    setSaving(true);

    const payload = {
      title: title.trim() || null,
      question: question.trim(),
      options: validOptions,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      image_url: imageUrl.trim() || null,
      description: description.trim() || null,
      thank_you_description: thankYouDescription.trim() || null,
      thank_you_image_url: thankYouImageUrl.trim() || null,
    };

    if (editingId) {
      await supabase.from('polls').update(payload).eq('id', editingId);
    } else {
      await supabase.from('polls').insert({ ...payload, is_active: false });
    }

    setSaving(false);
    resetForm();
    fetchPolls();
  };

  const toggleActive = async (poll: PollWithVotes) => {
    await supabase.from('polls').update({ is_active: !poll.is_active }).eq('id', poll.id);
    fetchPolls();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu anketi silmek istediğinize emin misiniz?')) return;
    await supabase.from('polls').delete().eq('id', id);
    if (homepagePollId === id) {
      await supabase.from('site_settings').upsert({ key: 'poll_homepage_id', value: '' });
      setHomepagePollId(null);
    }
    fetchPolls();
  };

  const handleSetHomepage = async (id: string) => {
    const newId = homepagePollId === id ? '' : id;
    await supabase.from('site_settings').upsert({
      key: 'poll_homepage_id',
      value: newId,
      updated_at: new Date().toISOString(),
    });
    setHomepagePollId(newId || null);
  };

  const addOption = () => {
    if (options.length >= 8) return;
    setOptions(prev => [...prev, { id: generateId(), text: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, text } : o));
  };

  const cardStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  return (
    <div>
      <AdminPageHeader
        title="Anketler"
        subtitle="Okuyucular için anket oluşturun ve yönetin"
        action={
          !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: '#111', color: '#fff', border: 'none',
                borderRadius: 8, padding: '0.6rem 1.25rem',
                fontSize: '0.875rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              <Plus size={15} />
              Yeni Anket
            </button>
          ) : null
        }
      />

      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Form */}
        {showForm && (
          <div style={{ ...cardStyle, border: '1px solid #d1fae5', background: '#f0fdf4' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>
              {editingId ? 'Anketi Düzenle' : 'Yeni Anket Oluştur'}
            </div>

            {/* 1. Başlık */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Anket Başlığı (opsiyonel)</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ana sayfada görünecek başlık..."
                style={{
                  border: '1px solid #d1d5db', borderRadius: 8, padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', outline: 'none', color: '#111',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Boş bırakılırsa anket sorusu gösterilir.</span>
            </div>

            {/* 2. Açıklama */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Açıklama (opsiyonel)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Kısa bir açıklama..."
                rows={2}
                style={{
                  border: '1px solid #d1d5db', borderRadius: 8, padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', outline: 'none', color: '#111',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* 3. Kapak görseli */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Kapak Görseli (opsiyonel)</label>
              <ImageUpload value={imageUrl} onChange={setImageUrl} folder="polls" />
            </div>

            {/* 4. Soru */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Soru</label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Anket sorusunu yazın..."
                rows={2}
                style={{
                  border: '1px solid #d1d5db', borderRadius: 8, padding: '0.625rem 0.875rem',
                  fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', resize: 'none',
                  outline: 'none', color: '#111',
                }}
              />
            </div>

            {/* 5. Seçenekler */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Seçenekler</label>
              {options.map((opt, i) => (
                <div key={opt.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', minWidth: 18 }}>{i + 1}.</span>
                  <input
                    value={opt.text}
                    onChange={e => updateOption(opt.id, e.target.value)}
                    placeholder={`Seçenek ${i + 1}`}
                    style={{
                      flex: 1, border: '1px solid #d1d5db', borderRadius: 8,
                      padding: '0.5rem 0.75rem', fontSize: '0.875rem',
                      fontFamily: 'Inter, sans-serif', outline: 'none', color: '#111',
                    }}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(opt.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, display: 'flex', alignItems: 'center' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 8 && (
                <button
                  onClick={addOption}
                  style={{
                    alignSelf: 'flex-start', background: 'none', border: '1px dashed #d1d5db',
                    borderRadius: 8, padding: '0.4rem 0.875rem',
                    fontSize: '0.8125rem', color: '#6b7280', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '0.375rem',
                  }}
                >
                  <Plus size={12} /> Seçenek Ekle
                </button>
              )}
            </div>

            {/* 6. Bitiş tarihi */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: 240 }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Bitiş Tarihi (opsiyonel)</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={e => setEndsAt(e.target.value)}
                style={{
                  border: '1px solid #d1d5db', borderRadius: 8, padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', outline: 'none', color: '#111',
                }}
              />
            </div>

            {/* 7. Oy sonrası — ayırıcı */}
            <div style={{ borderTop: '1px solid #d1fae5', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Oy Verdikten Sonra
              </span>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Okuyucu oyu kullandıktan sonra gösterilecek içerik.</span>
            </div>

            {/* 8. Teşekkür yazısı */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Teşekkür Yazısı (opsiyonel)</label>
              <textarea
                value={thankYouDescription}
                onChange={e => setThankYouDescription(e.target.value)}
                placeholder="Oy verdikten sonra gösterilecek yazı..."
                rows={2}
                style={{
                  border: '1px solid #d1d5db', borderRadius: 8, padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem', fontFamily: 'Inter, sans-serif', outline: 'none', color: '#111',
                  resize: 'vertical',
                }}
              ></textarea>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Boş bırakılırsa açıklama yazısı gösterilir.</span>
            </div>

            {/* 9. Teşekkür görseli */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Teşekkür Görseli (opsiyonel)</label>
              <ImageUpload value={thankYouImageUrl} onChange={setThankYouImageUrl} folder="polls" />
              <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Boş bırakılırsa kapak görseli gösterilir.</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button
                onClick={handleSave}
                disabled={saving || !question.trim() || options.filter(o => o.text.trim()).length < 2}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  background: '#111', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '0.6rem 1.25rem',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', opacity: saving ? 0.6 : 1,
                }}
              >
                <Check size={14} />
                {saving ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Kaydet'}
              </button>
              <button
                onClick={resetForm}
                style={{
                  background: '#f3f4f6', color: '#374151', border: 'none',
                  borderRadius: 8, padding: '0.6rem 1.25rem',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Poll list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: '0.875rem' }}>Yükleniyor...</div>
        ) : polls.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem', background: '#fff',
            border: '1px dashed #e5e7eb', borderRadius: 12, color: '#9ca3af',
          }}>
            <BarChart2 size={32} style={{ margin: '0 auto 0.75rem', color: '#d1d5db', display: 'block' }} />
            <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem' }}>Henüz anket yok</div>
            <div style={{ fontSize: '0.8125rem' }}>İlk anketinizi oluşturmak için yukarıdaki butona tıklayın.</div>
          </div>
        ) : (
          polls.map(poll => (
            <PollCard
              key={poll.id}
              poll={poll}
              isHomepage={homepagePollId === poll.id}
              onToggleActive={() => toggleActive(poll)}
              onSetHomepage={() => handleSetHomepage(poll.id)}
              onEdit={() => startEdit(poll)}
              onDelete={() => handleDelete(poll.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PollCard({
  poll,
  isHomepage,
  onToggleActive,
  onSetHomepage,
  onEdit,
  onDelete,
}: {
  poll: PollWithVotes;
  isHomepage: boolean;
  onToggleActive: () => void;
  onSetHomepage: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadVotes = async () => {
    if (expanded) { setExpanded(false); return; }
    setLoadingVotes(true);
    const { data } = await supabase
      .from('poll_votes')
      .select('option_id')
      .eq('poll_id', poll.id);

    const counts: Record<string, number> = {};
    (data ?? []).forEach(v => {
      counts[v.option_id] = (counts[v.option_id] ?? 0) + 1;
    });
    setVotes(counts);
    setLoadingVotes(false);
    setExpanded(true);
  };

  const total = Object.values(votes).reduce((s, n) => s + n, 0);

  const isExpired = poll.ends_at ? new Date(poll.ends_at) < new Date() : false;

  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${poll.is_active ? '#bbf7d0' : '#e5e7eb'}`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '1.125rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        {/* Active indicator */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%', marginTop: 7, flexShrink: 0,
          background: poll.is_active ? '#22c55e' : '#d1d5db',
          boxShadow: poll.is_active ? '0 0 0 3px #dcfce7' : 'none',
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111', marginBottom: '0.375rem', lineHeight: 1.4 }}>
            {poll.question}
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: '#9ca3af', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>{poll.options.length} seçenek</span>
            <span>{poll.vote_count} oy</span>
            {poll.ends_at && (
              <span style={{ color: isExpired ? '#ef4444' : '#9ca3af' }}>
                {isExpired ? 'Süresi doldu' : `Bitiş: ${new Date(poll.ends_at).toLocaleDateString('tr-TR')}`}
              </span>
            )}
            {poll.is_active && <span style={{ color: '#22c55e', fontWeight: 600 }}>Yayında</span>}
            {isHomepage && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                background: '#fef9c3', color: '#854d0e',
                fontSize: '0.7rem', fontWeight: 700,
                padding: '0.15rem 0.5rem', borderRadius: 99,
              }}>
                Anasayfada
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={loadVotes}
            style={{
              background: expanded ? '#f3f4f6' : 'none',
              border: '1px solid #e5e7eb', borderRadius: 7,
              padding: '0.4rem 0.75rem', cursor: 'pointer',
              fontSize: '0.78rem', fontWeight: 500, color: '#6b7280',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '0.35rem',
            }}
          >
            <BarChart2 size={13} />
            {loadingVotes ? '...' : 'Sonuçlar'}
          </button>
          <button
            onClick={onEdit}
            style={{
              background: 'none', border: '1px solid #e5e7eb', borderRadius: 7,
              padding: '0.4rem 0.625rem', cursor: 'pointer', color: '#6b7280',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={onToggleActive}
            title={poll.is_active ? 'Yayından kaldır' : 'Yayına al'}
            style={{
              background: 'none', border: `1px solid ${poll.is_active ? '#bbf7d0' : '#e5e7eb'}`,
              borderRadius: 7, padding: '0.4rem 0.625rem', cursor: 'pointer',
              color: poll.is_active ? '#16a34a' : '#9ca3af',
              display: 'flex', alignItems: 'center',
            }}
          >
            {poll.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
          </button>
          <button
            onClick={onSetHomepage}
            title={isHomepage ? 'Anasayfadan kaldır' : 'Anasayfada göster'}
            style={{
              background: isHomepage ? '#fef9c3' : 'none',
              border: `1px solid ${isHomepage ? '#fde68a' : '#e5e7eb'}`,
              borderRadius: 7, padding: '0.4rem 0.625rem', cursor: 'pointer',
              color: isHomepage ? '#854d0e' : '#9ca3af',
              display: 'flex', alignItems: 'center',
              fontSize: '0.7rem', fontWeight: 600, gap: '0.25rem',
            }}
          >
            <BarChart2 size={13} />
          </button>
          <button
            onClick={onDelete}
            style={{
              background: 'none', border: '1px solid #fecaca', borderRadius: 7,
              padding: '0.4rem 0.625rem', cursor: 'pointer', color: '#ef4444',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Sonuçlar */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '1rem 1.5rem 1.25rem 3rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {poll.options.map(opt => {
            const count = votes[opt.id] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={opt.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.8125rem', color: '#374151' }}>
                  <span>{opt.text}</span>
                  <span style={{ color: '#9ca3af', fontWeight: 600 }}>{pct}% ({count})</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#c8f542', width: `${pct}%`, borderRadius: 99, transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>Toplam {total} oy</div>
        </div>
      )}
    </div>
  );
}
