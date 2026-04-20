import { useState } from 'react';
import { 
  Check, Trash2, Flag, UserPlus, MessageSquare, 
  Search as SearchIcon, AlertTriangle, FileText, 
  CheckCircle2, BellOff, ArrowRight, Filter, 
  ChevronLeft, ChevronRight, MoreVertical, Bell 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';

export default function NotificationsPage() {
  const { t } = useTranslation();

  const mockNotifications = [
    { id: 1,  icon: Flag,          color: '#F43F5E', title: t('notifications.mock.t1'), body: t('notifications.mock.b1'),   time: t('common.time.m', { count: 12 }),  read: false, category: 'moderation' },
    { id: 2,  icon: UserPlus,      color: '#3B82F6', title: t('notifications.mock.t2'),    body: t('notifications.mock.b2'),  time: t('common.time.m', { count: 34 }),  read: false, category: 'users' },
    { id: 3,  icon: MessageSquare, color: '#F59E0B', title: t('notifications.mock.t3'),    body: t('notifications.mock.b3'),  time: t('common.time.h', { count: 2 }),      read: true,  category: 'feedback' },
    { id: 4,  icon: SearchIcon,    color: '#8B5CF6', title: t('notifications.mock.t4'),   body: t('notifications.mock.b4'),           time: t('common.time.h', { count: 3 }),      read: true,  category: 'lost-found' },
  ];

  const [filter, setFilter]     = useState('all');
  const [readFilter, setRead]   = useState('all');
  const [notifs, setNotifs]     = useState(mockNotifications);

  const CAT_LABELS = { 
    all: t('notifications.status.all') || 'Total Feed', 
    moderation: t('sections.analytics') || 'Moderation', 
    users: t('nav.users') || 'Users', 
    feedback: t('nav.feedback') || 'Feedback', 
    'lost-found': t('nav.lost_found') || 'Assets', 
    system: t('sections.system') || 'System' 
  };

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markRead    = (id) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const dismiss     = (id) => setNotifs(n => n.filter(x => x.id !== id));

  const filtered = notifs.filter(n => {
    const matchCat  = filter    === 'all' || n.category === filter;
    const matchRead = readFilter === 'all' || (readFilter === 'unread' ? !n.read : n.read);
    return matchCat && matchRead;
  });

  return (
    <AdminLayout
      title={t('nav.dispatch') || 'Intelligence Feed'}
      subtitle={t('notifications.subtitle')}
      actions={[
        { icon: <Check size={14} />, label: t('notifications.sync_all'), onClick: markAllRead },
        { icon: <Trash2 size={14} />, label: t('notifications.purge'), primary: false },
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Navigation Filters */}
        <div className="w-full lg:w-[280px] lg:sticky lg:top-8 order-2 lg:order-1">
          <div className="pro-card p-2 flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar mb-6">
            {Object.entries(CAT_LABELS).map(([key, label]) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all flex-shrink-0 lg:flex-shrink-1 ${active ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand-glow)]' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          <div className="pro-card p-4 hidden lg:block">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 px-2">{t('notifications.status.all')}</p>
            <div className="flex flex-col gap-1">
              {[
                { id: 'all', label: t('notifications.status.all') },
                { id: 'unread', label: t('notifications.status.unread') },
                { id: 'read', label: t('notifications.status.read') }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => setRead(r.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${readFilter === r.id ? 'bg-white/5 text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Feed */}
        <div className="flex-1 min-w-0 order-1 lg:order-2 w-full">
          <div className="pro-card overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[var(--glass-border)] flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">
                {CAT_LABELS[filter]} <span className="text-[var(--text-muted)] ml-2">({filtered.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-[var(--glass-border)] min-h-[400px]">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 px-10">
                  <BellOff size={48} className="text-[var(--text-muted)] opacity-20 mb-6" />
                  <p className="text-lg font-black text-white mb-2">{t('notifications.empty.title')}</p>
                  <p className="text-sm text-[var(--text-muted)] text-center">{t('notifications.empty.desc')}</p>
                </div>
              ) : (
                filtered.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={`p-6 flex gap-6 items-start transition-colors cursor-pointer ${!n.read ? 'bg-[var(--brand)]/[0.03]' : 'hover:bg-white/[0.01]'}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-[var(--glass-border)]" style={{ background: `${n.color}15`, color: n.color }}>
                        <n.icon size={20} />
                      </div>
                      {!n.read && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--brand)] border-2 border-[var(--bg-main)] shadow-[0_0_10px_var(--brand)]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-bold ${!n.read ? 'text-white' : 'text-[var(--text-secondary)]'}`}>{n.title}</p>
                        <span className="text-[10px] text-[var(--text-muted)] font-bold">{n.time}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{n.body}</p>
                      
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-black uppercase text-[var(--text-secondary)] hover:bg-white/10 transition-colors">{t('common.details')}</button>
                        <button 
                          onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
