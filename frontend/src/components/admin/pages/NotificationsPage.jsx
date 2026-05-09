import { useState, useEffect, useCallback } from 'react';
import { 
  Check, Trash2, Flag, UserPlus, MessageSquare, 
  AlertTriangle, FileText, BellOff, Bell, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import api from '../../../api/axios';

const TYPE_ICON_MAP = {
  report:     { icon: Flag,          color: '#F43F5E' },
  follow:     { icon: UserPlus,      color: '#3B82F6' },
  comment:    { icon: MessageSquare, color: '#F59E0B' },
  like:       { icon: Check,         color: '#10B981' },
  lost_found: { icon: FileText,      color: '#8B5CF6' },
  system:     { icon: AlertTriangle, color: '#6B7280' },
};

function getIconConfig(type) {
  return TYPE_ICON_MAP[type] ?? { icon: Bell, color: 'var(--brand)' };
}

export default function NotificationsPage() {
  const { t } = useTranslation();

  const [notifs, setNotifs]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [purging, setPurging]         = useState(false);
  const [filter, setFilter]           = useState('all');
  const [readFilter, setReadFilter]   = useState('all');

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    api.get('/notifications')
      .then(res => setNotifs(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const handleMarkRead = async (id) => {
    await api.post(`/notifications/${id}/read`);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await api.post('/notifications/read-all');
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // Purge = delete all read notifications from DB
  const handlePurge = async () => {
    if (!confirm('Delete all read notifications? This cannot be undone.')) return;
    setPurging(true);
    try {
      // Delete read notifications one by one (no bulk endpoint yet)
      const readIds = notifs.filter(n => n.is_read).map(n => n.id);
      await Promise.all(readIds.map(id =>
        api.delete(`/notifications/${id}`).catch(() => {}) // silent fail per item
      ));
      fetchNotifs();
    } finally {
      setPurging(false);
    }
  };

  const CAT_LABELS = {
    all:        'Total Feed',
    report:     'Moderation',
    follow:     'Users',
    comment:    'Comments',
    lost_found: 'Lost & Found',
    system:     'System',
  };

  const filtered = notifs.filter(n => {
    const matchCat  = filter === 'all' || n.type === filter;
    const matchRead = readFilter === 'all' ? true : readFilter === 'unread' ? !n.is_read : n.is_read;
    return matchCat && matchRead;
  });

  const unreadCount = notifs.filter(n => !n.is_read).length;
  const readCount   = notifs.filter(n => n.is_read).length;

  return (
    <AdminLayout
      title="Intelligence Feed"
      subtitle={t('notifications.subtitle')}
      actions={[
        { icon: <Check size={14} />,  label: t('notifications.sync_all'), onClick: handleMarkAllRead },
        {
          icon: purging ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />,
          label: purging ? 'Purging...' : `Purge Read (${readCount})`,
          onClick: handlePurge,
        },
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* Sidebar */}
        <div className="w-full lg:w-[280px] lg:sticky lg:top-8 order-2 lg:order-1 space-y-4">
          <div className="pro-card p-2 flex lg:flex-col overflow-x-auto lg:overflow-visible">
            {Object.entries(CAT_LABELS).map(([key, label]) => {
              const active = filter === key;
              const count  = key === 'all' ? notifs.length : notifs.filter(n => n.type === key).length;
              return (
                <button key={key} onClick={() => setFilter(key)}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 lg:w-full"
                  style={{
                    background: active ? 'var(--brand)' : 'transparent',
                    color: active ? '#fff' : 'var(--text-secondary)',
                    boxShadow: active ? '0 4px 12px var(--brand-glow)' : 'none',
                  }}>
                  <span>{label}</span>
                  {count > 0 && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md min-w-[20px] text-center"
                      style={{ background: active ? 'rgba(255,255,255,0.2)' : 'var(--bg-card-hover)', color: active ? '#fff' : 'var(--text-muted)' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pro-card p-4 hidden lg:block">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 px-2">Read Status</p>
            <div className="flex flex-col gap-1">
              {[
                { id: 'all',    label: t('notifications.status.all')    },
                { id: 'unread', label: t('notifications.status.unread') },
                { id: 'read',   label: t('notifications.status.read')   },
              ].map(r => (
                <button key={r.id} onClick={() => setReadFilter(r.id)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: readFilter === r.id ? 'var(--bg-card-hover)' : 'transparent',
                    color: readFilter === r.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 min-w-0 order-1 lg:order-2 w-full">
          <div className="pro-card overflow-hidden">
            <div className="p-5 border-b border-[var(--glass-border)] flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">
                {CAT_LABELS[filter]}
                <span className="text-[var(--text-muted)] ml-2">({filtered.length})</span>
              </h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black px-2 py-1 rounded-md text-[var(--brand)] bg-[var(--brand)]/10">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="divide-y divide-[var(--glass-border)] min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={28} className="animate-spin text-[var(--brand)]" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 px-10">
                  <BellOff size={48} className="text-[var(--text-muted)] opacity-20 mb-6" />
                  <p className="text-lg font-black mb-2 text-[var(--text-primary)]">{t('notifications.empty.title')}</p>
                  <p className="text-sm text-[var(--text-muted)] text-center">{t('notifications.empty.desc')}</p>
                </div>
              ) : filtered.map((n) => {
                const { icon: Icon, color } = getIconConfig(n.type);
                return (
                  <div key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className="p-6 flex gap-6 items-start transition-colors cursor-pointer hover:bg-[var(--bg-card-hover)]"
                    style={{ background: !n.is_read ? 'var(--brand-dim)' : 'transparent' }}>
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center border"
                        style={{ background: `${color}15`, color, borderColor: 'var(--border-subtle)' }}>
                        <Icon size={20} />
                      </div>
                      {!n.is_read && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--brand)] border-2 shadow-[0_0_10px_var(--brand)]"
                          style={{ borderColor: 'var(--bg-main)' }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold" style={{ color: !n.is_read ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {n.message ?? n.type}
                        </p>
                        <span className="text-[10px] text-[var(--text-muted)] font-bold ml-4 flex-shrink-0">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 capitalize">{n.type}</p>
                      {!n.is_read && (
                        <button onClick={e => { e.stopPropagation(); handleMarkRead(n.id); }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors"
                          style={{ background: 'var(--bg-card-hover)', color: 'var(--brand)' }}>
                          <Check size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}