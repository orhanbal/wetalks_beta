import { useEffect, useState, useMemo } from 'react';
import { Mail, Users, UserCheck, RefreshCw, Trash2, Send, AlertCircle, Check, Clock, Download, TrendingUp, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminPageHeader } from './AdminLayout';

interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  created_at: string;
  unsubscribed_at: string | null;
}

interface SendLog {
  id: string;
  sent_at: string;
  subject: string;
  recipient_count: number;
  status: 'success' | 'error';
  error_message: string | null;
}

type FilterStatus = 'all' | 'active' | 'unsubscribed';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('active');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sendLogs, setSendLogs] = useState<SendLog[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'subscribers' | 'send' | 'notifications'>('subscribers');
  const [notifLogs, setNotifLogs] = useState<{
    id: string; article_title: string; sent_at: string;
    recipient_count: number; status: string; notify_followers: boolean; notify_subscribers: boolean;
  }[]>([]);

  const load = async () => {
    setLoading(true);
    const [{ data: subs }, { data: settingsData }] = await Promise.all([
      supabase
        .from('newsletter_subscribers')
        .select('id, email, status, created_at, unsubscribed_at')
        .order('created_at', { ascending: false }),
      supabase.from('site_settings').select('key, value'),
    ]);

    setSubscribers((subs as Subscriber[]) ?? []);
    if (settingsData) {
      const map: Record<string, string> = {};
      settingsData.forEach(r => { map[r.key] = r.value; });
      setSettings(map);
    }
    setLoading(false);
  };

  const loadLogs = async () => {
    const { data } = await supabase
      .from('newsletter_send_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(20);
    setSendLogs((data as SendLog[]) ?? []);
  };

  const loadNotifLogs = async () => {
    const { data } = await supabase
      .from('article_notification_logs')
      .select('id, article_title, sent_at, recipient_count, status, notify_followers, notify_subscribers')
      .order('sent_at', { ascending: false })
      .limit(30);
    if (data) setNotifLogs(data);
  };

  useEffect(() => {
    load();
    loadLogs();
    loadNotifLogs();
  }, []);

  const handleExportCSV = () => {
    const rows = [
      ['E-posta', 'Durum', 'Abone Tarihi', 'Abonelikten Çıkış'],
      ...subscribers.map(s => [
        s.email,
        s.status === 'active' ? 'Aktif' : 'Çıkmış',
        new Date(s.created_at).toLocaleDateString('tr-TR'),
        s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleDateString('tr-TR') : '',
      ]),
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulten-aboneleri-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aboneyi silmek istediğinizden emin misiniz?')) return;
    setDeletingId(id);
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    setSubscribers(prev => prev.filter(s => s.id !== id));
    setDeletingId(null);
  };

  const handleSendNewsletter = async () => {
    setSending(true);
    setSendResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`${supabaseUrl}/functions/v1/send-newsletter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token ?? supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manual: true }),
      });

      const json = await res.json();

      if (!res.ok) {
        setSendResult({ ok: false, message: json.error ?? 'Bülten gönderilirken hata oluştu.' });
      } else {
        setSendResult({ ok: true, message: `Bülten ${json.sent ?? 0} aboneye başarıyla gönderildi.` });
        loadLogs();
      }
    } catch {
      setSendResult({ ok: false, message: 'Ağ hatası. Lütfen tekrar deneyin.' });
    }
    setSending(false);
  };

  const filtered = subscribers.filter(s =>
    filterStatus === 'all' || s.status === filterStatus
  );

  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const unsubCount = subscribers.filter(s => s.status === 'unsubscribed').length;

  const resendConfigured = !!(settings['resend_api_key']?.trim() && settings['resend_from_email']?.trim());

  // Growth chart: last 8 weeks cumulative active subs
  const growthData = useMemo(() => {
    const weeks: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - i * 7);
      const label = cutoff.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      const count = subscribers.filter(s => {
        const created = new Date(s.created_at);
        const unsub = s.unsubscribed_at ? new Date(s.unsubscribed_at) : null;
        return created <= cutoff && (!unsub || unsub > cutoff);
      }).length;
      weeks.push({ label, count });
    }
    return weeks;
  }, [subscribers]);

  return (
    <div>
      <AdminPageHeader
        title="Bülten"
        subtitle="Aboneleri yönetin ve haftalık bülten gönderin"
        action={
          <button
            onClick={load}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1rem', border: '1px solid #e5e7eb',
              borderRadius: 8, background: '#fff', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 600, color: '#374151',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <RefreshCw size={13} />
            Yenile
          </button>
        }
      />

      {/* Tabs */}
      <div style={{ padding: '0 2rem', borderBottom: '1px solid #f3f4f6', display: 'flex' }}>
        {([
          { key: 'subscribers' as const, label: 'Aboneler', icon: <Users size={14} /> },
          { key: 'send' as const, label: 'Bülten Gönder', icon: <Send size={14} /> },
          { key: 'notifications' as const, label: 'Makale Bildirimleri', icon: <Bell size={14} /> },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.875rem 1.25rem',
              border: 'none', borderBottom: activeTab === tab.key ? '2px solid #111' : '2px solid transparent',
              background: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? '#111' : '#6b7280',
              fontFamily: 'Inter, sans-serif', transition: 'color 0.15s',
              marginBottom: -1,
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'subscribers' && (
        <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto) 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Toplam', value: subscribers.length, color: '#374151', bg: '#f9fafb', key: 'all' as FilterStatus },
              { label: 'Aktif', value: activeCount, color: '#0369a1', bg: '#e0f2fe', key: 'active' as FilterStatus },
              { label: 'Abonelikten Çıkmış', value: unsubCount, color: '#6b7280', bg: '#f3f4f6', key: 'unsubscribed' as FilterStatus },
            ].map(stat => (
              <button
                key={stat.key}
                onClick={() => setFilterStatus(filterStatus === stat.key ? 'all' : stat.key)}
                style={{
                  background: filterStatus === stat.key ? stat.bg : '#fff',
                  border: `1px solid ${filterStatus === stat.key ? stat.color + '40' : '#e5e7eb'}`,
                  borderRadius: 10, padding: '0.875rem 1.25rem',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem', fontWeight: 500 }}>{stat.label}</div>
              </button>
            ))}
          </div>

          {/* Growth chart */}
          {growthData.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={14} color="#0369a1" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', fontFamily: 'Inter, sans-serif' }}>
                    Abone Büyümesi (8 Hafta)
                  </span>
                </div>
                <button
                  onClick={handleExportCSV}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.375rem 0.75rem', border: '1px solid #e5e7eb',
                    borderRadius: 7, background: '#fff', cursor: 'pointer',
                    fontSize: '0.8125rem', fontWeight: 600, color: '#374151',
                    fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; }}
                >
                  <Download size={13} /> CSV İndir
                </button>
              </div>
              {(() => {
                const maxVal = Math.max(...growthData.map(d => d.count), 1);
                const chartH = 80;
                const pts = growthData.map((d, i) => {
                  const x = (i / (growthData.length - 1)) * 100;
                  const y = chartH - (d.count / maxVal) * (chartH - 8);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                }).join(' ');
                return (
                  <div>
                    <svg viewBox={`0 0 100 ${chartH}`} preserveAspectRatio="none" style={{ width: '100%', height: chartH, display: 'block' }}>
                      <defs>
                        <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0369a1" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points={`0,${chartH} ${pts} 100,${chartH}`}
                        fill="url(#growthGrad)"
                      />
                      <polyline
                        points={pts}
                        fill="none"
                        stroke="#0369a1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      {growthData.map((d, i) => {
                        const x = (i / (growthData.length - 1)) * 100;
                        const y = chartH - (d.count / maxVal) * (chartH - 8);
                        return <circle key={i} cx={x} cy={y} r="1.5" fill="#0369a1" vectorEffect="non-scaling-stroke" />;
                      })}
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      {growthData.map((d, i) => (
                        <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ fontSize: '0.625rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {i === 0 || i === growthData.length - 1 ? d.label : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                        Başlangıç: <strong style={{ color: '#111' }}>{growthData[0].count}</strong>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
                        Şu an: <strong style={{ color: '#0369a1' }}>{growthData[growthData.length - 1].count}</strong>
                      </span>
                      {growthData[growthData.length - 1].count > growthData[0].count && (
                        <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                          +{growthData[growthData.length - 1].count - growthData[0].count} büyüme
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto',
              padding: '0.625rem 1.25rem',
              background: '#fafafa', borderBottom: '1px solid #f3f4f6',
              fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
            }}>
              <span>E-posta</span>
              <span style={{ paddingRight: '4rem' }}>Durum</span>
              <span>Sil</span>
            </div>

            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif' }}>
                Yükleniyor...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                <Mail size={32} color="#d1d5db" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                  {filterStatus !== 'all' ? 'Bu filtrede abone yok.' : 'Henüz bülten abonesi yok.'}
                </p>
              </div>
            ) : (
              filtered.map((sub, idx) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr auto auto',
                    alignItems: 'center', padding: '0.75rem 1.25rem',
                    borderBottom: idx < filtered.length - 1 ? '1px solid #f9fafb' : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#fafafa'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111', fontFamily: 'Inter, sans-serif' }}>
                      {sub.email}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>
                      {new Date(sub.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ paddingRight: '1rem' }}>
                    {sub.status === 'active' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', color: '#16a34a', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                        <UserCheck size={10} /> Aktif
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f3f4f6', color: '#9ca3af', fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase' }}>
                        Çıkmış
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(sub.id)}
                    disabled={deletingId === sub.id}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '0.375rem', color: '#d1d5db', borderRadius: 6,
                      display: 'flex', alignItems: 'center',
                      opacity: deletingId === sub.id ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#d1d5db'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0, fontFamily: 'Inter, sans-serif' }}>
              {filtered.length} abone gösteriliyor{subscribers.length !== filtered.length ? ` (toplam ${subscribers.length})` : ''}
            </p>
          )}
        </div>
      )}

      {activeTab === 'send' && (
        <div style={{ padding: '1.5rem 2rem', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!resendConfigured && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '0.875rem 1rem', background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 10, fontSize: '0.8125rem', color: '#713f12', lineHeight: 1.5,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>Resend henüz yapılandırılmadı.</strong> Bülten göndermek için{' '}
                <strong>Entegrasyonlar &gt; Resend</strong> bölümünden API anahtarını ve gönderici e-postayı ayarlayın.
              </div>
            </div>
          )}

          {/* Manual send card */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} color="#0369a1" />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', fontFamily: 'Inter, sans-serif' }}>
                  Haftalık Bülten Gönder
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>
                  Son 7 günde yayımlanan makaleler aktif abonelere gönderilir
                </div>
              </div>
            </div>

            <div style={{
              padding: '0.75rem', background: '#f9fafb', borderRadius: 8,
              fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.5,
              marginBottom: '1rem', fontFamily: 'Inter, sans-serif',
            }}>
              <strong style={{ color: '#374151' }}>{activeCount}</strong> aktif abone bulunuyor.
              Bülten gönderildiğinde son 7 günün yeni yazıları bu abonelere iletilir.
            </div>

            {sendResult && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem', borderRadius: 8, marginBottom: '1rem',
                background: sendResult.ok ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${sendResult.ok ? '#bbf7d0' : '#fecaca'}`,
                fontSize: '0.8125rem', fontFamily: 'Inter, sans-serif',
                color: sendResult.ok ? '#166534' : '#dc2626',
              }}>
                {sendResult.ok ? <Check size={14} /> : <AlertCircle size={14} />}
                {sendResult.message}
              </div>
            )}

            <button
              onClick={handleSendNewsletter}
              disabled={sending || !resendConfigured || activeCount === 0}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                width: '100%', padding: '0.7rem',
                background: '#111', color: '#fff',
                border: 'none', borderRadius: 8,
                fontSize: '0.875rem', fontWeight: 600,
                cursor: sending || !resendConfigured || activeCount === 0 ? 'not-allowed' : 'pointer',
                opacity: sending || !resendConfigured || activeCount === 0 ? 0.5 : 1,
                fontFamily: 'Inter, sans-serif', transition: 'opacity 0.15s',
              }}
            >
              {sending ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Bülteni Şimdi Gönder
                </>
              )}
            </button>
          </div>

          {/* Send logs */}
          {sendLogs.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={14} color="#9ca3af" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111', fontFamily: 'Inter, sans-serif' }}>Gönderim Geçmişi</span>
              </div>
              {sendLogs.map((log, idx) => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1.25rem',
                  borderBottom: idx < sendLogs.length - 1 ? '1px solid #f9fafb' : 'none',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111', marginBottom: 2 }}>
                      {log.subject || 'Haftalık Bülten'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {new Date(log.sent_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' · '}{log.recipient_count} alıcı
                    </div>
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 20,
                    fontSize: '0.6875rem', fontWeight: 700,
                    background: log.status === 'success' ? '#dcfce7' : '#fee2e2',
                    color: log.status === 'success' ? '#16a34a' : '#dc2626',
                  }}>
                    {log.status === 'success' ? <Check size={10} /> : <AlertCircle size={10} />}
                    {log.status === 'success' ? 'Gönderildi' : 'Hata'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === 'notifications' && (
        <div style={{ padding: '1.5rem 2rem', maxWidth: 720 }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111', margin: '0 0 0.25rem' }}>Makale Bildirim Geçmişi</h2>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
              Makale düzenleme sayfasındaki "Bildirim Gönder" butonuyla tetiklenen bildirimler burada listelenir.
            </p>
          </div>

          {notifLogs.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem 2rem',
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
              color: '#9ca3af',
            }}>
              <Bell size={36} strokeWidth={1.5} style={{ marginBottom: '0.75rem', color: '#d1d5db' }} />
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Henüz makale bildirimi yok</p>
              <p style={{ margin: '0.375rem 0 0', fontSize: '0.8125rem' }}>
                Bir makaleyi düzenlerken "Bildirim Gönder" butonunu kullanın.
              </p>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Makale', 'Tarih', 'Alıcı', 'Takipçi', 'Abone', 'Durum'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {notifLogs.map((log, i) => (
                    <tr key={log.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#111', fontWeight: 500, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.article_title}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {new Date(log.sent_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: '#111' }}>
                        {log.recipient_count}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {log.notify_followers
                          ? <Check size={14} color="#22c55e" />
                          : <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {log.notify_subscribers
                          ? <Check size={14} color="#22c55e" />
                          : <span style={{ color: '#d1d5db', fontSize: '0.75rem' }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                          padding: '0.2rem 0.625rem', borderRadius: 20,
                          fontSize: '0.7rem', fontWeight: 700,
                          background: log.status === 'success' ? '#f0fdf4' : '#fef2f2',
                          color: log.status === 'success' ? '#166534' : '#991b1b',
                          border: `1px solid ${log.status === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        }}>
                          {log.status === 'success' ? 'Başarılı' : 'Hata'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
