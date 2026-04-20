import { useState } from 'react';
import { 
  Terminal, AlertCircle, Info, XCircle, Search as SearchIcon, 
  Copy, ArrowRight, Download, Pause, Play, AlignLeft, 
  ChevronDown, Filter, ChevronLeft, ChevronRight, Share2,
  CheckCircle as CheckCircleIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';



const LVL_MAP = {
  INFO:  { color: '#3B82F6', icon: Info },
  WARN:  { color: '#F59E0B', icon: AlertCircle },
  ERROR: { color: '#F43F5E', icon: XCircle },
};

export default function LogsPage() {
  const { t } = useTranslation();

  const mockLogs = [
    { id: 1,  time: '19:12:03', level: 'ERROR',   actor: 'Kernel',             action: t('logs.mock.a1'),                     ip: '-',              module: 'DB'           },
    { id: 2,  time: '18:58:41', level: 'WARN',    actor: 'Karim M.',           action: t('logs.mock.a2'),    ip: '196.12.4.88',    module: 'Mod'   },
    { id: 3,  time: '18:34:22', level: 'INFO',    actor: 'Administrator',      action: t('logs.mock.a3'),                   ip: '41.248.70.5',    module: 'ACL'          },
    { id: 4,  time: '18:01:55', level: 'INFO',    actor: 'System',             action: t('dashboard.mock_logs.identity'),            ip: '196.68.12.4',    module: 'Auth'         },
  ];

  const [search, setSearch]       = useState('');
  const [filterLevel, setLevel]   = useState('all');
  const [expanded, setExpanded]   = useState(null);
  const [isLive, setIsLive]       = useState(true);

  const filtered = mockLogs.filter(l => l.action.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout
      title={t('nav.logs') || 'Terminal Surveillance'}
      subtitle={t('dashboard.logs.title')}
      actions={[
        { icon: isLive ? <Pause size={14} /> : <Play size={14} />, label: isLive ? t('dashboard.logs.suspend') : t('dashboard.logs.initial'), onClick: () => setIsLive(!isLive) },
        { icon: <Download size={14} />, label: t('dashboard.logs.archive'), primary: true },
      ]}
    >
      {/* ── RESPONSIVE METRICS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('logs.stats.throughput'), value: '4.2k/h', Icon: Terminal,      color: '#8B5CF6' },
          { label: t('logs.stats.errors'),  value: '3',       Icon: XCircle,       color: '#F43F5E' },
          { label: t('logs.stats.health'),   value: '99.9%',    Icon: CheckCircleIcon,   color: '#10B981' },
          { label: t('logs.stats.alerts'),    value: '2',        Icon: AlertCircle,   color: '#F59E0B' },
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
              <p className="text-2xl font-black text-[var(--text-primary)] leading-none">{s.value}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pro-card bg-black border-white/5 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="bg-[#050505] p-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5">
           <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
           </div>
           <div className="text-[10px] font-mono text-white/40 flex items-center gap-2">
              <Terminal size={12} /> root@ista-connect:~/logs/production.log
           </div>
           {isLive && (
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-500 uppercase">Live Stream</span>
             </div>
           )}
        </div>

        {/* Console Search */}
        <div className="p-4 bg-black border-b border-white/5 flex flex-wrap gap-4">
           <div className="relative flex-1 min-w-[200px]">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                 value={search} onChange={e => setSearch(e.target.value)}
                 placeholder={t('logs.filter') || 'Filter traces...'}
                 className="w-full bg-transparent border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs font-mono text-white/70 outline-none focus:border-[var(--brand)] transition-colors"
              />
           </div>
           <div className="flex gap-1">
              {['all','INFO','WARN','ERROR'].map(l => (
                <button key={l} onClick={() => setLevel(l)} 
                   className={`px-3 py-1.5 rounded-md text-[9px] font-mono font-bold transition-all ${filterLevel === l ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}>
                   {l}
                </button>
              ))}
           </div>
        </div>

        {/* Log List */}
        <div className="max-h-[500px] overflow-y-auto font-mono text-[11px] divide-y divide-white/5">
           {filtered.map(log => {
             const L = LVL_MAP[log.level];
             const isExp = expanded === log.id;
             return (
               <div key={log.id}>
                  <div 
                    onClick={() => setExpanded(isExp ? null : log.id)}
                    className={`flex items-start sm:items-center gap-4 p-4 cursor-pointer transition-colors ${isExp ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                  >
                     <div className="flex items-center gap-2 min-w-[60px]" style={{ color: L.color }}>
                        <L.icon size={12} /> {log.level}
                     </div>
                     <span className="text-white/20 hidden xs:inline">{log.time}</span>
                     <span className="text-white/40 hidden md:inline">[{log.module}]</span>
                     <span className="flex-1 text-white/60 truncate">{log.action}</span>
                     <ChevronDown size={14} className={`text-white/40 transition-transform ${isExp ? 'rotate-180' : ''}`} />
                  </div>
                  {isExp && (
                    <div className="p-6 bg-black flex flex-col gap-4 animate-fade-in shadow-inner">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-white/30">
                          <div className="flex flex-col gap-2">
                             <div>ID: UUID-{(Math.random()*1000).toFixed(0)}</div>
                             <div>SOURCE: {log.ip}</div>
                          </div>
                          <div className="flex flex-col gap-2">
                             <div>ACTOR: <span className="text-[var(--brand)]">{log.actor}</span></div>
                             <div>NODE: ISTA-NODE-ALPHA</div>
                          </div>
                       </div>
                       <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg text-white/80 leading-relaxed" style={{ color: L.color }}>
                          {log.action}
                       </div>
                    </div>
                  )}
               </div>
             );
           })}
        </div>
      </div>
    </AdminLayout>
  );
}
