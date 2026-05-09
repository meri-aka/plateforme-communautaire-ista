import { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus, Loader2, BellOff } from 'lucide-react';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const TYPE_CONFIG = {
  like:    { icon: Heart,         color:'#F43F5E', bg:'rgba(244,63,94,0.1)',   label:'liked your post'          },
  comment: { icon: MessageCircle, color:'#7BB342', bg:'rgba(123,179,66,0.1)', label:'commented on your post'   },
  follow:  { icon: UserPlus,      color:'#EAB308', bg:'rgba(234,179,8,0.1)',  label:'started following you'    },
  default: { icon: Bell,          color:'var(--text-muted)', bg:'var(--bg-card-hover)', label:'sent you a notification' },
};

function NotifIcon({ type }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.default;
  const Icon = cfg.icon;
  return (
    <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:cfg.bg,
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon size={18} color={cfg.color} fill={type==='like'?cfg.color:'none'}/>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.data ?? res.data ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    try { await api.post(`/notifications/${id}/read`); } catch {}
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    } catch {}
    setMarkingAll(false);
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="relative z-10" style={{ maxWidth:'760px', margin:'0 auto', padding:'32px 16px' }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-8 md:p-10 rounded-[24px] relative overflow-hidden" style={{
        background: 'var(--bg-card)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.1)'
      }}>
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full blur-[60px] opacity-[0.05]" style={{ background: 'var(--brand)' }} />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3" style={{ color:'var(--text-primary)' }}>
            <Bell size={32} color="var(--brand)" /> Notifications
          </h1>
          {unreadCount > 0 ? (
            <p className="text-[15px] font-medium" style={{ color:'var(--text-muted)' }}>
              You have <span style={{ color:'var(--brand)', fontWeight:800 }}>{unreadCount} unread</span> {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          ) : (
            <p className="text-[15px] font-medium" style={{ color:'var(--text-muted)' }}>
              You're all caught up!
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={markingAll}
            className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-[var(--bg-card-hover)]"
            style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', color:'var(--brand)' }}>
            {markingAll ? <Loader2 size={16} className="animate-spin"/> : <CheckCheck size={16}/>}
            Mark all read
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label:'All', count: notifications.length },
          { label:'Unread', count: unreadCount },
        ].map(f => (
          <span key={f.label} className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold shadow-sm" style={{
            background:'var(--bg-card)', border:'1px solid var(--border-subtle)', color:'var(--text-secondary)'
          }}>
            {f.label} {f.count > 0 && <span className="px-2 py-0.5 rounded-full text-[11px] font-black" style={{ background:'rgba(123,179,66,0.1)', color:'var(--brand)' }}>{f.count}</span>}
          </span>
        ))}
      </div>

      {/* List */}
      <div className="animate-fade-in">
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 size={32} color="var(--brand)" className="animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 rounded-[24px]" style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)' }}>
            <div className="w-20 h-20 mx-auto rounded-[24px] mb-6 flex items-center justify-center" style={{ background: 'rgba(123,179,66,0.1)' }}>
              <BellOff size={40} color="var(--brand)"/>
            </div>
            <h3 className="text-xl font-black mb-2" style={{ color:'var(--text-primary)' }}>All caught up!</h3>
            <p className="font-medium" style={{ color:'var(--text-muted)' }}>No notifications yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map(n => {
              const isUnread = !n.read_at;
              const type = n.data?.type ?? n.type ?? 'default';
              const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.default;
              const actorName = n.data?.actor_name ?? n.data?.user_name ?? 'Someone';
              const body = n.data?.body ?? cfg.label;

              return (
                <div key={n.id}
                  onClick={() => isUnread && markRead(n.id)}
                  className={`flex items-start gap-4 p-5 rounded-[20px] transition-all duration-300 ${isUnread ? 'cursor-pointer hover:-translate-y-1' : ''}`}
                  style={{
                    background: isUnread ? 'rgba(123,179,66,0.05)' : 'var(--bg-card)',
                    border: `1px solid ${isUnread ? 'rgba(123,179,66,0.3)' : 'var(--border-subtle)'}`,
                    boxShadow: isUnread ? '0 10px 30px -15px rgba(123,179,66,0.1)' : 'none'
                  }}
                >
                  <NotifIcon type={type}/>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-[15px] mb-1.5 leading-relaxed" style={{ color:'var(--text-primary)' }}>
                      <span className="font-black mr-1">{actorName}</span>
                      <span className="font-medium" style={{ color:'var(--text-secondary)' }}>{body}</span>
                    </p>
                    <p className="text-[13px] font-medium" style={{ color:'var(--text-muted)' }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="w-3 h-3 rounded-full mt-2 shrink-0 animate-pulse" style={{ background:'var(--brand)', boxShadow: '0 0 10px var(--brand)' }}/>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
