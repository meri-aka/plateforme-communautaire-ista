import { useState } from 'react';
import { 
  Search as SearchIcon, Download, Check, MessageSquare, AlertCircle, 
  Star, Reply, Send, Bug, Lightbulb, BookOpen, Filter, 
  Clock, ChevronLeft, ChevronRight, MoreVertical, ThumbsUp, ThumbsDown
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

  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState(null);

  const STATUS_MAP = {
    open:        { label: t('feedback.status.open') || 'Open',        color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
    resolved:    { label: t('feedback.status.resolved') || 'Resolved',    color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    'in-progress': { label: t('feedback.status.processing') || 'Processing', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  };

  const filtered = mockFeedback.filter(f => f.author.toLowerCase().includes(search.toLowerCase()) || f.module.toLowerCase().includes(search.toLowerCase()));

  const totalFeedback = mockFeedback.length;
  const openCount = mockFeedback.filter(f => f.status === 'open').length;
  const resolvedCount = mockFeedback.filter(f => f.status === 'resolved').length;
  const avgRating = (mockFeedback.reduce((sum, f) => sum + f.rating, 0) / mockFeedback.length).toFixed(1);

  return (
    <AdminLayout
      title={t('feedback.title')}
      subtitle={t('feedback.subtitle')}
      actions={[
        { icon: <Download size={14} />, label: t('common.export') },
        { icon: <Check size={14} />, label: t('feedback.resolve'), primary: true },
      ]}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="pro-card p-5 bg-gradient-to-br from-violet-500/20 to-violet-600/10 border-violet-500/30 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl group-hover:bg-violet-500/30 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <MessageSquare size={20} className="text-violet-400" />
              </div>
              <span className="text-violet-400 font-bold text-xs uppercase tracking-wider">{t('feedback.metrics.volume')}</span>
            </div>
            <div className="text-4xl font-black text-white"><CountUpStat end={String(totalFeedback)} duration={1000} /></div>
            <p className="text-white/50 text-xs mt-1">total feedback</p>
          </div>
        </div>

        <div className="pro-card p-5 bg-gradient-to-br from-rose-500/20 to-rose-600/10 border-rose-500/30 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-500/30 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <AlertCircle size={20} className="text-rose-400" />
              </div>
              <span className="text-rose-400 font-bold text-xs uppercase tracking-wider">{t('feedback.metrics.active')}</span>
            </div>
            <div className="text-4xl font-black text-white"><CountUpStat end={String(openCount)} duration={1000} /></div>
            <p className="text-white/50 text-xs mt-1">open tickets</p>
          </div>
        </div>

        <div className="pro-card p-5 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Star size={20} className="text-amber-400" />
              </div>
              <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">{t('feedback.metrics.score')}</span>
            </div>
            <div className="text-4xl font-black text-white"><CountUpStat end={avgRating} duration={1000} />&nbsp;/5</div>
            <p className="text-white/50 text-xs mt-1">avg rating</p>
          </div>
        </div>

        <div className="pro-card p-5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Check size={20} className="text-emerald-400" />
              </div>
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">{t('feedback.metrics.rate')}</span>
            </div>
            <div className="text-4xl font-black text-white"><CountUpStat end={String(resolvedCount)} duration={1000} /></div>
            <p className="text-white/50 text-xs mt-1">resolved</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feedback List */}
        <div className="rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <div className="p-5 border-b flex flex-wrap items-center gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="relative flex-1 min-w-[280px]">
              <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('feedback.search')}
                className="pro-input pro-glass w-full pl-12 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {filtered.map((fb) => {
              const ST = STATUS_MAP[fb.status] || STATUS_MAP.open;
              const isActive = expanded === fb.id;
              
              return (
                <div key={fb.id} className="p-5 cursor-pointer" onClick={() => setExpanded(fb)} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-start gap-4">
                    <img src={fb.avatar} className="avatar-img" alt="" loading="lazy" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-white truncate">{fb.author}</span>
                        <span className="text-[9px] font-black px-2 py-1 rounded-md uppercase" style={{ color: ST.color, background: ST.bg }}>{ST.label}</span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mb-2 truncate">{fb.module}</p>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-2">"{fb.comment}"</p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                          {fb.rating >= 4 ? <ThumbsUp size={12} className="text-emerald-400" /> : <ThumbsDown size={12} className="text-rose-400" />}
                          {fb.rating}/5
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                          <Clock size={12} /> {fb.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Detail */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          {expanded ? (
            <div className="p-0">
              <div className="relative h-48">
                <img src={expanded.image} alt="" className="feedback-img" style={{ filter: 'none' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)' }} />
                <img src={expanded.avatar} className="avatar-lg absolute bottom-4 left-4 border-2 border-white" alt="" loading="eager" style={{ filter: 'none' }} />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-black text-white">{expanded.author}</h3>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${expanded.rating >= 4 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {expanded.rating}/5
                  </span>
                </div>
                <p className="text-sm text-[var(--text-muted)] mb-4">{expanded.module} • {expanded.date}</p>
                <p className="text-base text-white mb-6">"{expanded.comment}"</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-[9px] font-black px-2 py-1 rounded-md bg-[var(--brand)]/10 text-[var(--brand)] uppercase border border-[var(--brand)]/20">{expanded.category}</span>
                  <span className="text-[9px] font-black px-2 py-1 rounded-md uppercase" style={{ color: STATUS_MAP[expanded.status].color, background: STATUS_MAP[expanded.status].bg }}>{STATUS_MAP[expanded.status].label}</span>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-[var(--brand)] hover:opacity-90 transition-opacity py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 border-none">
                    <Reply size={16} /> Reply
                  </button>
                  <button className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center">
                <MessageSquare size={48} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/50 font-medium">Select a feedback to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setExpanded(null)} />
      )}
    </AdminLayout>
  );
}