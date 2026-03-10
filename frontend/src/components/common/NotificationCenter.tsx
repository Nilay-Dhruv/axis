import { useState, useEffect, useRef, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, Notification } from '../../services/notificationService';

const TYPE_COLOR: Record<string, string> = {
  critical: '#e05c5c', warning: '#f5a623', info: '#5aa9c4',
};
const TYPE_ICON: Record<string, string> = {
  critical: '🔴', warning: '🟡', info: '🔵',
};

type NotifItemProps = { notif: Notification; onClose: () => void };
function NotifItem({ notif, onClose }: NotifItemProps) {
  const navigate = useNavigate();
  const color = TYPE_COLOR[notif.type];
  return (
    <div
      onClick={() => { navigate(notif.url); onClose(); }}
      style={{
        padding: '12px 16px', cursor: 'pointer',
        borderBottom: '1px solid var(--neu-divider)',
        borderLeft: `3px solid ${color}`,
        transition: 'background 0.15s'
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--neu-bg)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span>{TYPE_ICON[notif.type]}</span>
        <span style={{ color: 'var(--neu-text-dark)', fontSize: 13, fontWeight: 600 }}>{notif.title}</span>
      </div>
      <p style={{ color: 'var(--neu-text-mid)', fontSize: 12, margin: 0 }}>{notif.message}</p>
      <span style={{ color: 'var(--neu-text-light)', fontSize: 11 }}>
        {new Date(notif.timestamp).toLocaleString()}
      </span>
    </div>
  );
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getNotifications()
      .then((r: { notifications: SetStateAction<Notification[]>; unread_count: SetStateAction<number>; }) => { setNotifications(r.notifications); setUnread(r.unread_count); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => { setUnread(0); setNotifications(n => n.map(x => ({ ...x, read: true }))); };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 20, padding: '4px 8px'
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: '#e05c5c', color: '#fff',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          background: 'var(--neu-card)', borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)', width: 360,
          maxHeight: 460, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          zIndex: 200
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderBottom: '1px solid var(--neu-divider)'
          }}>
            <span style={{ color: 'var(--neu-text-dark)', fontWeight: 700 }}>
              Notifications {unread > 0 && <span style={{ color: '#e05c5c' }}>({unread})</span>}
            </span>
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#5aa9c4', fontSize: 12, cursor: 'pointer' }}>
              Mark all read
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--neu-text-light)', fontSize: 13 }}>
                No notifications
              </div>
            ) : (
              notifications.map(n => (
                <NotifItem key={n.id} notif={n} onClose={() => setOpen(false)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}