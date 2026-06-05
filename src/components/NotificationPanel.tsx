import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, MessageCircle, UserPlus, HandMetal, FileText, X } from 'lucide-react';
import { useNotifications, type Notification } from '../hooks/useNotifications';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}s`;
  return `${Math.floor(h / 24)}g`;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  new_comment:  { icon: <MessageCircle size={14} />, color: '#0e8fa0', bg: '#f0f9ff' },
  new_follower: { icon: <UserPlus size={14} />,      color: '#16a34a', bg: '#f0fdf4' },
  new_clap:     { icon: <HandMetal size={14} />,     color: '#f59e0b', bg: '#fffbeb' },
  new_article:  { icon: <FileText size={14} />,      color: '#6b7280', bg: '#f9fafb' },
  info:         { icon: <Bell size={14} />,           color: '#6b7280', bg: '#f9fafb' },
};

interface NotificationPanelProps {
  onClose: () => void;
  navigate: (to: string) => void;
}

export default function NotificationPanel({ onClose, navigate }: NotificationPanelProps) {
  const { notifications, unreadCount, loading, markAllRead, markRead, deleteNotification } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.read) await markRead(n.id);
    if (n.article_id) navigate(`article/${n.article_id}`);
    onClose();
  };

  return (
    <div ref={panelRef} style={{ position: 'absolute', top: '110%', right: 0, zIndex: 200, width: 360, maxHeight: 480, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={15} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111' }}>Bildirimler</span>
          {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: '0.6875rem', fontWeight: 700, padding: '1px 7px' }}>{unreadCount}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '0.3rem 0.625rem', cursor: 'pointer', fontSize: '0.75rem', color: '#6b7280', fontFamily: 'Inter, sans-serif' }}>
              <CheckCheck size={12} /> Tümünü oku
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0.25rem' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>Yükleniyor...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={32} strokeWidth={1.5} color="#d1d5db" />
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Henüz bildirim yok</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#9ca3af' }}>Yeni yorumlar ve takipçiler burada görünecek.</p>
          </div>
        ) : notifications.map(n => {
          const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
          return (
            <div key={n.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', background: n.read ? 'transparent' : '#fafeff', borderBottom: '1px solid #f9fafb', cursor: n.article_id ? 'pointer' : 'default', transition: 'background 0.1s' }}
              onClick={() => handleNotificationClick(n)}
              onMouseEnter={e => { if (n.article_id) (e.currentTarget as HTMLDivElement).style.background = '#f9fafb'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.read ? 'transparent' : '#fafeff'; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.color, flexShrink: 0 }}>
                {cfg.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 0.125rem', fontSize: '0.8125rem', color: '#111', lineHeight: 1.4 }}>{n.message}</p>
                {n.article_title && <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.article_title}</p>}
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{timeAgo(n.created_at)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0e8fa0' }} />}
                <button
                  onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '0.125rem', display: 'flex' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#d1d5db')}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
