import { useState, useEffect, useCallback } from 'react';
import { 
  Search as SearchIcon, Download, Check, MessageSquare, AlertCircle, 
  Star, Clock, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import useCountUp from '../../../hooks/useCountUp.jsx';
import api from '../../../api/axios';
import { exportFeedbackPDF } from '../../../utils/exportPDF';

function CountUpStat({ end, duration = 1500 }) {
  const display = useCountUp(end, duration);
  return <>{display}</>;
}

const STATUS_MAP = {
  pending:  { label: 'Pending',  color: '#F43F5E', bg: 'rgba(244,63,94,0.1)'   },
  reviewed: { label: 'Reviewed', color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  archived: { label: 'Archived', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

export default function FeedbackPage() {
  const { t } = useTranslation();

  const [feedbacks, setFeedbacks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [resolving, setResolving]   = useState(false);
  const [search, setSearch]         = useState('');
  const [expanded, setExpanded]     = useState(null);

  const fetchFeedbacks = useCallback(() => {
    setLoading(true);
    api.get('/feedbacks')
      .then(res => setFeedbacks(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);

  const handleStatusChange = async (id, status) => {
    await api.patch(`/feedbacks/${id}`, { status });
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    setExpanded(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  // Resolve all pending feedbacks at once
  const handleResolveAll = async () => {
    if (!confirm('Mark all pending feedbacks as reviewed?')) return;
    setResolving(true);
    try {
      const pending = feedbacks.filter(f => f.status === 'pending');
      await Promise.all(pending.map(f => api.patch(`/feedbacks/${f.id}`, { status: 'reviewed' })));
      fetchFeedbacks();
      setExpanded(null);
    } finally {
      setResolving(false);
    }
  };

  const filtered = feedbacks.filter(f =>
    (f.user?.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (f.category ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (f.content ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalCount    = feedbacks.length;
  const pendingCount  = feedbacks.filter(f => f.status === 'pending').length;
  const reviewedCount = feedbacks.filter(f => f.status === 'reviewed').length;

  const stats = [
    { label: t('feedback.metrics.volume'), value: totalCount,    icon: MessageSquare, color: 'var(--brand)' },
    { label: t('feedback.metrics.active'), value: pendingCount,  icon: AlertCircle,   color: '#F43F5E'      },
    { label: t('feedback.metrics.rate'),   value: reviewedCount, icon: Check,         color: '#10B981'      },
    { label: 'Categories',                 value: 4,             icon: Star,          color: '#F59E0B'      },
  ];

  return (
    <AdminLayout
      title={t('feedback.title')}
      subtitle={t('feedback.subtitle')}
      actions={[
{ icon: <Download size={14} />, label: t('common.export'), onClick: () => exportFeedbackPDF(feedbacks) },
        {
          icon: resolving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />,
          label: resolving ? 'Resolving...' : `Resolve All (${pendingCount})`,
          primary: true,
          onClick: handleResolveAll,
        },
      ]}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="pro-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.color + '20', color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</span>
            </div>
            <div className="text-3xl font-black text-[var(--text-primary)]">
              <CountUpStat end={String(stat.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="pro-card">
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="relative">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('feedback.search')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[var(--brand)]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-[var(--text-muted)] text-sm">No feedback yet.</div>
            ) : filtered.map((fb) => {
              const ST = STATUS_MAP[fb.status] ?? STATUS_MAP.pending;
              return (
                <div key={fb.id}
                  className="p-4 cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onClick={() => setExpanded(fb)}>
                  <div className="flex items-start gap-3">
                    {fb.user?.avatar
                      ? <img src={fb.user.avatar} className="w-10 h-10 rounded-xl object-cover border" style={{ borderColor: 'var(--border-subtle)' }} alt="" />
                      : <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: 'var(--brand)' }}>{fb.user?.name?.charAt(0) ?? '?'}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm truncate text-[var(--text-primary)]">{fb.user?.name ?? 'Unknown'}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded ml-2 flex-shrink-0" style={{ color: ST.color, background: ST.bg }}>{ST.label}</span>
                      </div>
                      <p className="text-xs mb-1 text-[var(--text-muted)] capitalize">{fb.category}</p>
                      <p className="text-sm line-clamp-2 mb-2 text-[var(--text-secondary)]">"{fb.content}"</p>
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock size={12} /> {new Date(fb.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="pro-card overflow-hidden">
          {expanded ? (
            <div>
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-4 mb-4">
                  {expanded.user?.avatar
                    ? <img src={expanded.user.avatar} className="w-14 h-14 rounded-xl object-cover border" style={{ borderColor: 'var(--border-subtle)' }} alt="" />
                    : <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-white text-xl" style={{ background: 'var(--brand)' }}>{expanded.user?.name?.charAt(0) ?? '?'}</div>
                  }
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{expanded.user?.name ?? 'Unknown'}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{expanded.user?.email}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 capitalize">{expanded.category} • {new Date(expanded.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed p-4 rounded-xl" style={{ background: 'var(--bg-card-hover)' }}>
                  "{expanded.content}"
                </p>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(STATUS_MAP).map(([key, val]) => (
                    <button key={key} onClick={() => handleStatusChange(expanded.id, key)}
                      className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border"
                      style={{
                        background:  expanded.status === key ? val.bg : 'var(--bg-card-hover)',
                        color:       expanded.status === key ? val.color : 'var(--text-muted)',
                        borderColor: expanded.status === key ? val.color + '40' : 'var(--border-subtle)',
                      }}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-3 opacity-20 text-[var(--text-muted)]" />
                <p className="text-[var(--text-muted)]">Select feedback to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}