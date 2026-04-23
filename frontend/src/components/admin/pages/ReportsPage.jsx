import { useState, useEffect, useCallback } from 'react';
import {
  Search as SearchIcon, Download, Shield, AlertTriangle,
  CheckCircle, XCircle, Clock, Flag, User, FileText,
  MessageSquare, Loader2, Filter
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import useCountUp from '../../../hooks/useCountUp.jsx';
import api from '../../../api/axios';

function CountUpStat({ end, duration = 1500 }) {
  const display = useCountUp(end, duration);
  return <>{display}</>;
}

const STATUS_MAP = {
  pending:   { label: 'Pending',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  reviewed:  { label: 'Reviewed',  color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  dismissed: { label: 'Dismissed', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
};

const REASON_MAP = {
  spam:          { label: 'Spam',          color: '#F59E0B', icon: Flag        },
  harassment:    { label: 'Harassment',    color: '#F43F5E', icon: AlertTriangle },
  inappropriate: { label: 'Inappropriate', color: '#8B5CF6', icon: Shield      },
  other:         { label: 'Other',         color: '#6B7280', icon: Flag        },
};

const TYPE_ICON = {
  post:    FileText,
  comment: MessageSquare,
  user:    User,
};

export default function ReportsPage() {
  const { t } = useTranslation();

  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchReports = useCallback(() => {
    setLoading(true);
    api.get('/reports')
      .then(res => setReports(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleStatusChange = async (id, status) => {
    await api.patch(`/reports/${id}`, { status });
    fetchReports();
    setExpanded(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const filtered = reports.filter(r => {
    const matchSearch = (r.reporter?.name ?? '').toLowerCase().includes(search.toLowerCase())
                     || r.reason.toLowerCase().includes(search.toLowerCase())
                     || r.reportable_type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? r.status === filterStatus : true;
    const matchReason = filterReason ? r.reason === filterReason : true;
    return matchSearch && matchStatus && matchReason;
  });

  const totalCount     = reports.length;
  const pendingCount   = reports.filter(r => r.status === 'pending').length;
  const reviewedCount  = reports.filter(r => r.status === 'reviewed').length;
  const dismissedCount = reports.filter(r => r.status === 'dismissed').length;

  return (
    <AdminLayout
      title="Reports"
      subtitle="Manage user-submitted reports"
      actions={[
        { icon: <Download size={14} />, label: 'Export' },
      ]}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reports', value: totalCount,     icon: Flag,         color: 'var(--brand)' },
          { label: 'Pending',       value: pendingCount,   icon: Clock,        color: '#F59E0B'      },
          { label: 'Reviewed',      value: reviewedCount,  icon: CheckCircle,  color: '#10B981'      },
          { label: 'Dismissed',     value: dismissedCount, icon: XCircle,      color: '#6B7280'      },
        ].map((s, i) => (
          <div key={i} className="pro-card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '20', color: s.color }}>
                <s.icon size={20} />
              </div>
              <span className="font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">{s.label}</span>
            </div>
            <div className="text-3xl font-black text-[var(--text-primary)]">
              <CountUpStat end={String(s.value)} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="pro-card">
          {/* Toolbar */}
          <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="relative">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by reporter, reason, type..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border-none outline-none"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="dismissed">Dismissed</option>
              </select>
              <select
                value={filterReason}
                onChange={e => setFilterReason(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border-none outline-none"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}
              >
                <option value="">All Reasons</option>
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="inappropriate">Inappropriate</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[var(--brand)]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-[var(--text-muted)] text-sm">No reports found.</div>
            ) : filtered.map((r) => {
              const ST = STATUS_MAP[r.status] ?? STATUS_MAP.pending;
              const RS = REASON_MAP[r.reason]  ?? REASON_MAP.other;
              const TypeIcon = TYPE_ICON[r.reportable_type] ?? Flag;
              return (
                <div
                  key={r.id}
                  onClick={() => setExpanded(r)}
                  className="p-4 cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-start gap-3">
                    {/* Reporter avatar */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: RS.color }}>
                      {r.reporter?.name?.charAt(0) ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm truncate text-[var(--text-primary)]">
                          {r.reporter?.name ?? 'Unknown'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded ml-2 flex-shrink-0"
                          style={{ color: ST.color, background: ST.bg }}>
                          {ST.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                          style={{ color: RS.color, background: RS.color + '15' }}>
                          {RS.label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] capitalize">
                          <TypeIcon size={11} /> {r.reportable_type} #{r.reportable_id}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                        <Clock size={11} /> {new Date(r.created_at).toLocaleDateString()}
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
          {expanded ? (() => {
            const ST = STATUS_MAP[expanded.status] ?? STATUS_MAP.pending;
            const RS = REASON_MAP[expanded.reason]  ?? REASON_MAP.other;
            const TypeIcon = TYPE_ICON[expanded.reportable_type] ?? Flag;
            return (
              <div>
                {/* Header */}
                <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-white text-xl flex-shrink-0"
                      style={{ background: RS.color }}>
                      {expanded.reporter?.name?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">{expanded.reporter?.name ?? 'Unknown'}</h3>
                      <p className="text-xs text-[var(--text-muted)]">{expanded.reporter?.email}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{new Date(expanded.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Report details */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--bg-card-hover)' }}>
                      <RS.icon size={16} style={{ color: RS.color }} />
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Reason</p>
                        <p className="text-sm font-bold" style={{ color: RS.color }}>{RS.label}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--bg-card-hover)' }}>
                      <TypeIcon size={16} className="text-[var(--text-muted)]" />
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Target</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] capitalize">{expanded.reportable_type} #{expanded.reportable_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status actions */}
                <div className="p-6">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(STATUS_MAP).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(expanded.id, key)}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border"
                        style={{
                          background:   expanded.status === key ? val.bg : 'var(--bg-card-hover)',
                          color:        expanded.status === key ? val.color : 'var(--text-muted)',
                          borderColor:  expanded.status === key ? val.color + '40' : 'var(--border-subtle)',
                        }}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Shield size={48} className="mx-auto mb-3 opacity-20 text-[var(--text-muted)]" />
                <p className="text-[var(--text-muted)]">Select a report to review</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}