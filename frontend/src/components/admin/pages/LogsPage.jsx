import { useState, useEffect, useCallback } from 'react';
import { 
  Terminal, AlertCircle, Info, XCircle, Search as SearchIcon,
  Download, Pause, Play, ChevronDown,
  CheckCircle as CheckCircleIcon, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import useCountUp from '../../../hooks/useCountUp.jsx';
import api from '../../../api/axios';

function CountUpStat({ end, duration = 1500 }) {
  const display = useCountUp(end, duration);
  return <>{display}</>;
}

const LVL_MAP = {
  INFO:  { color: '#3B82F6', icon: Info       },
  WARN:  { color: '#F59E0B', icon: AlertCircle },
  ERROR: { color: '#F43F5E', icon: XCircle    },
};

// Map action strings to levels for display
function inferLevel(action = '') {
  const a = action.toLowerCase();
  if (a.includes('error') || a.includes('fail') || a.includes('delete')) return 'ERROR';
  if (a.includes('warn') || a.includes('ban')  || a.includes('report')) return 'WARN';
  return 'INFO';
}

export default function LogsPage() {
  const { t } = useTranslation();

  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterLevel, setLevel] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [isLive, setIsLive]     = useState(true);
  const [meta, setMeta]         = useState(null);
  const [page, setPage]         = useState(1);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', page);
    if (search) params.append('action', search);

    api.get(`/admin/logs?${params.toString()}`)
      .then(res => {
        setLogs(res.data.data);
        setMeta(res.data);
      })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    const delay = setTimeout(fetchLogs, 300);
    return () => clearTimeout(delay);
  }, [fetchLogs]);

  // Auto-refresh every 10s when live
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [isLive, fetchLogs]);

  const filtered = logs.filter(l => {
    const level = inferLevel(l.action);
    const matchLevel  = filterLevel === 'all' || level === filterLevel;
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase())
                     || (l.user?.name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const errorCount = logs.filter(l => inferLevel(l.action) === 'ERROR').length;
  const warnCount  = logs.filter(l => inferLevel(l.action) === 'WARN').length;

  return (
    <AdminLayout
      title={t('nav.logs') || 'Terminal Surveillance'}
      subtitle={t('dashboard.logs.title')}
      actions={[
        {
          icon: isLive ? <Pause size={14} /> : <Play size={14} />,
          label: isLive ? 'Pause' : 'Resume',
          onClick: () => setIsLive(!isLive)
        },
        { icon: <Download size={14} />, label: 'Export', primary: true },
      ]}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Logs',  value: String(meta?.total ?? 0), Icon: Terminal,        color: '#8B5CF6' },
          { label: 'Errors',      value: String(errorCount),        Icon: XCircle,         color: '#F43F5E' },
          { label: 'Warnings',    value: String(warnCount),         Icon: AlertCircle,     color: '#F59E0B' },
          { label: 'Info',        value: String(logs.length - errorCount - warnCount), Icon: CheckCircleIcon, color: '#10B981' },
        ].map((s, i) => (
          <div key={i} className="pro-card p-5 flex items-center gap-4 animate-slide-up">
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: `${s.color}15`, border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <s.Icon size={20} color={s.color} />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--text-primary)] leading-none">
                <CountUpStat end={s.value} duration={1200} />
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pro-card overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b"
          style={{ background: 'var(--bg-card-hover)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
          </div>
          <div className="text-[10px] font-mono flex items-center gap-2 text-[var(--text-muted)]">
            <Terminal size={12} /> root@ista-connect:~/logs/production.log
          </div>
          {isLive && (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-500 uppercase">Live Stream</span>
            </div>
          )}
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b flex flex-wrap gap-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <div className="relative flex-1 min-w-[200px]">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Filter by action or user..."
              className="w-full rounded-lg py-2 pl-9 pr-4 text-xs font-mono outline-none transition-colors"
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex gap-1">
            {['all', 'INFO', 'WARN', 'ERROR'].map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className="px-3 py-1.5 rounded-md text-[9px] font-mono font-bold transition-all"
                style={{
                  background:  filterLevel === l ? 'var(--brand)' : 'transparent',
                  color:       filterLevel === l ? '#fff' : 'var(--text-muted)',
                  border:      filterLevel === l ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Log List */}
        <div className="max-h-[500px] overflow-y-auto font-mono text-[11px]">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[var(--brand)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-[var(--text-muted)]">No logs found.</div>
          ) : filtered.map(log => {
            const level = inferLevel(log.action);
            const L     = LVL_MAP[level];
            const isExp = expanded === log.id;
            return (
              <div key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <div
                  onClick={() => setExpanded(isExp ? null : log.id)}
                  className="flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-[var(--bg-card-hover)]"
                  style={{ background: isExp ? 'var(--bg-card-hover)' : 'transparent' }}
                >
                  <div className="flex items-center gap-2 min-w-[70px]" style={{ color: L.color }}>
                    <L.icon size={12} /> {level}
                  </div>
                  <span className="text-[var(--text-muted)] hidden sm:inline min-w-[70px]">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                  <span className="text-[var(--text-muted)] hidden md:inline min-w-[60px]">
                    [{log.entity_type ?? 'system'}]
                  </span>
                  <span className="flex-1 truncate text-[var(--text-secondary)]">{log.action}</span>
                  <ChevronDown size={14} className={`transition-transform text-[var(--text-muted)] ${isExp ? 'rotate-180' : ''}`} />
                </div>
                {isExp && (
                  <div className="p-6 flex flex-col gap-4 animate-fade-in" style={{ background: 'var(--bg-card-hover)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-[var(--text-muted)]">
                      <div className="flex flex-col gap-2">
                        <div>ID: #{log.id}</div>
                        <div>ENTITY: {log.entity_type ?? '—'} #{log.entity_id ?? '—'}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div>ACTOR: <span className="text-[var(--brand)]">{log.user?.name ?? 'System'}</span></div>
                        <div>DATE: {new Date(log.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    {log.metadata && (
                      <div className="p-4 rounded-lg leading-relaxed text-[10px]"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: L.color }}>
                        {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs text-[var(--text-muted)] font-mono">{meta.from}–{meta.to} of {meta.total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}>Prev</button>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
                className="px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-30"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}