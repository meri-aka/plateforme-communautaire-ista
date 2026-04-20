import { useState } from 'react';
import { 
  Search as SearchIcon, Download, Check, MessageSquare, AlertCircle, 
  Star, Reply, Clock, MoreVertical, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import useCountUp from '../../../hooks/useCountUp.jsx';

function CountUpStat({ end, duration = 1500 }) {
  const display = useCountUp(end, duration);
  return <>{display}</>;
}

export default function FeedbackPage() {
  const { t } = useTranslation();

  const mockFeedback = [
    { id: 1, author: 'Ahmed M.',  avatar: 'https://i.pravatar.cc/150?img=11&retina=1&d=mm', module: 'Laravel — Routing',      rating: 5, status: 'resolved',    date: 'Jan 14, 2025',  category: t('feedback.categories.experience'), comment: t('feedback.mock.c1'), image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=90&fm=webp' },
    { id: 2, author: 'Sara A.',   avatar: 'https://i.pravatar.cc/150?img=5&retina=1&d=mm',  module: t('nav.lost_found'),        rating: 2, status: 'open',        date: 'Jan 15, 2025',  category: t('feedback.categories.bug'), comment: t('feedback.mock.c2'), image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=90&fm=webp' },
    { id: 3, author: 'Omar K.',   avatar: 'https://i.pravatar.cc/150?img=33&retina=1&d=mm', module: 'React — Hooks',     rating: 5, status: 'resolved',    date: 'Jan 16, 2025',  category: t('feedback.categories.experience'), comment: t('feedback.mock.c1'), image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=90&fm=webp' },
    { id: 4, author: 'Lina B.',    avatar: 'https://i.pravatar.cc/150?img=23&retina=1&d=mm', module: 'API Gateway',       rating: 1, status: 'in-progress', date: 'Jan 17, 2025',  category: t('feedback.categories.bug'), comment: t('feedback.mock.c2'), image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=90&fm=webp' },
  ];

  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const STATUS_MAP = {
    open:        { label: t('feedback.status.open') || 'Open',        color: 'var(--accent-rose)', bg: 'rgba(244,63,94,0.1)' },
    resolved:    { label: t('feedback.status.resolved') || 'Resolved',    color: 'var(--accent-green)', bg: 'rgba(34,197,94,0.1)' },
    'in-progress': { label: t('feedback.status.processing') || 'Processing', color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.1)' },
  };

  const filtered = mockFeedback.filter(f => f.author.toLowerCase().includes(search.toLowerCase()) || f.module.toLowerCase().includes(search.toLowerCase()));

  const totalFeedback = mockFeedback.length;
  const openCount = mockFeedback.filter(f => f.status === 'open').length;
  const resolvedCount = mockFeedback.filter(f => f.status === 'resolved').length;
  const avgRating = (mockFeedback.reduce((sum, f) => sum + f.rating, 0) / mockFeedback.length).toFixed(1);

  const stats = [
    { label: t('feedback.metrics.volume'), value: totalFeedback, icon: MessageSquare, color: 'var(--brand)' },
    { label: t('feedback.metrics.active'), value: openCount, icon: AlertCircle, color: 'var(--accent-rose)' },
    { label: t('feedback.metrics.score'), value: avgRating + '/5', icon: Star, color: 'var(--accent-amber)' },
    { label: t('feedback.metrics.rate'), value: resolvedCount, icon: Check, color: 'var(--accent-green)' },
  ];

  return (
    <AdminLayout
      title={t('feedback.title')}
      subtitle={t('feedback.subtitle')}
      actions={[
        { icon: <Download size={14} />, label: t('common.export') },
        { icon: <Check size={14} />, label: t('feedback.resolve'), primary: true },
      ]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="pro-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.color + '15', color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
            </div>
            <div className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
              {typeof stat.value === 'number' ? <CountUpStat end={String(stat.value)} /> : stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="pro-card">
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="relative">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('feedback.search')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {filtered.map((fb) => {
              const ST = STATUS_MAP[fb.status];
              return (
                <div 
                  key={fb.id} 
                  className="p-4 cursor-pointer hover:bg-[var(--bg-card-hover)]"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onClick={() => setExpanded(fb)}
                >
                  <div className="flex items-start gap-3">
                    <img src={fb.avatar} className="avatar-img" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{fb.author}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: ST.color, background: ST.bg }}>{ST.label}</span>
                      </div>
                      <p className="text-xs truncate mb-1" style={{ color: 'var(--text-muted)' }}>{fb.module}</p>
                      <p className="text-sm line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>"{fb.comment}"</p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          {fb.rating >= 4 ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                          {fb.rating}/5
                        </span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {fb.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pro-card overflow-hidden">
          {expanded ? (
            <div>
              <div className="relative h-44">
                <img src={expanded.image} alt="" className="feedback-img" style={{ height: '176px' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
                <img src={expanded.avatar} className="avatar-lg absolute bottom-3 left-3 border-2 border-white" alt="" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{expanded.author}</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded" style={{ 
                    color: STATUS_MAP[expanded.status].color, 
                    background: STATUS_MAP[expanded.status].bg 
                  }}>{expanded.rating}/5</span>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{expanded.module} • {expanded.date}</p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>"{expanded.comment}"</p>
                <div className="flex gap-2 mb-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: 'var(--brand-dim)', color: 'var(--brand)' }}>{expanded.category}</span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ 
                    color: STATUS_MAP[expanded.status].color, 
                    background: STATUS_MAP[expanded.status].bg 
                  }}>{STATUS_MAP[expanded.status].label}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-lg font-semibold text-sm" style={{ background: 'var(--brand)', color: '#fff' }}>
                    <Reply size={16} className="inline mr-2" /> Reply
                  </button>
                  <button className="px-3 rounded-lg" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)' }}>
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p style={{ color: 'var(--text-muted)' }}>Select feedback to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}