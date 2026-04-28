import { 
  Users, FileText, MessageSquare, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Activity, 
  Calendar, Download, Cpu, Network, Brain
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import AdminLayout from './layout/AdminLayout';
import useCountUp from '../../hooks/useCountUp.jsx';
import useAdminStats from '../../hooks/useAdminStats';
import { exportStatsPDF } from '../../utils/exportPDF';

function CountUpStat({ end, duration = 1500, suffix = '' }) {
  const display = useCountUp(end, duration);
  return <>{display}{suffix}</>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  // const { stats, loading: statsLoading } = useAdminStats();
  const { stats, loading: statsLoading, fetchStats } = useAdminStats();

  const trafficData = [
    { name: '00:00', users: 120 },
    { name: '04:00', users: 80  },
    { name: '08:00', users: 450 },
    { name: '12:00', users: 820 },
    { name: '16:00', users: 950 },
    { name: '20:00', users: 650 },
    { name: '23:59', users: 300 },
  ];

  const activityByCluster = (stats?.filieres ?? []).map((f, i) => ({
  name:   f.name,
  value:  f.count,
  color:  ['#7BB342', '#1B365D', '#8B5CF6'][i % 3],
  status: f.count > 0 ? t('dashboard.charts.status.optimal') : t('dashboard.charts.status.stable'),
  icon:   [Cpu, Network, Brain][i % 3],
}));

const totalNodes = activityByCluster.reduce((sum, f) => sum + f.value, 0);

  return (
    <AdminLayout
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
      actions={[
      { icon: <Calendar size={14} />, label: t('dashboard.actions.cycle'), onClick: fetchStats },
        {
          icon: <Download size={14} />,
          label: t('dashboard.actions.export'),
          primary: true,
          onClick: () => exportStatsPDF(stats),
        },
      ]}
    >
      {/* ── METRICS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: t('dashboard.node_users'),   value: stats?.users?.total       ?? 0, trend: '+12.5%', isUp: true,  Icon: Users,         color: '#7BB342' },
          { label: t('dashboard.throughput'),    value: stats?.posts?.total       ?? 0, trend: '+5.2%',  isUp: true,  Icon: FileText,       color: '#3B82F6' },
          { label: t('dashboard.signal'),        value: stats?.feedbacks?.pending ?? 0, trend: '-0.3%',  isUp: false, Icon: Activity,       color: '#8B5CF6' },
          { label: t('dashboard.intelligence'),  value: stats?.reports?.pending   ?? 0, trend: t('dashboard.charts.status.stable'), isUp: true, Icon: MessageSquare, color: '#F43F5E' },
        ].map((stat, i) => (
          <div key={i} className="pro-card p-6 relative overflow-hidden animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex justify-between items-start mb-4">
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${stat.color}10`, border: `1px solid ${stat.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <stat.Icon size={24} color={stat.color} />
              </div>
              <div className={`flex items-center gap-1 text-[12px] font-extrabold px-2 py-1 rounded-md ${stat.isUp ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-3xl font-black text-[var(--text-primary)] mb-1 tracking-tighter">
              {statsLoading ? '...' : <CountUpStat end={stat.value} duration={1200} />}
            </p>
            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{stat.label}</p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: `linear-gradient(transparent, ${stat.color}05)`, opacity: 0.5 }} />
          </div>
        ))}
      </div>

      {/* ── CHARTS ── */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="pro-card p-7 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-tight">{t('dashboard.charts.activity_title')}</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">{t('dashboard.charts.activity_desc')}</p>
            </div>
            <div className="flex gap-2 p-1 rounded-lg" style={{ background: 'var(--bg-card-hover)' }}>
              <button className="bg-[var(--brand)] text-white px-3 py-1.5 rounded-md text-[11px] font-bold shadow-lg shadow-[var(--brand-glow)]">{t('dashboard.charts.live')}</button>
              <button className="text-[var(--text-muted)] px-3 py-1.5 rounded-md text-[11px] font-bold hover:text-[var(--text-primary)] transition-colors">{t('dashboard.charts.tfh')}</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--brand)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="users" stroke="var(--brand)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pro-card p-7 w-full lg:w-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Activity size={18} color="var(--brand)" />
              <h3 className="text-lg font-extrabold text-[var(--text-primary)]">{t('dashboard.charts.distribution_title')}</h3>
            </div>
            <span className="text-[9px] font-black text-[var(--brand)] bg-[var(--brand)]/10 border border-[var(--brand)]/20 px-2 py-1 rounded-md uppercase tracking-widest">{t('dashboard.charts.ready')}</span>
          </div>
          <div className="h-[280px] w-full relative my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activityByCluster} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                  {activityByCluster.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-4xl font-black leading-none tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                {statsLoading ? '...' : <CountUpStat end={totalNodes} duration={1500} />}
              </p>
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2">{t('dashboard.charts.active_nodes')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-auto">
            {activityByCluster.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl transition-all" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${item.color}15`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={18} color={item.color} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[13px] font-bold text-[var(--text-primary)]">{item.name}</p>
                    <span style={{ fontSize: '9px', fontWeight: 900, color: item.color, background: `${item.color}15`, padding: '2px 6px', borderRadius: '4px' }}>{item.status}</span>
                  </div>
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border-subtle)' }}>
                    <div style={{ width: totalNodes > 0 ? `${(item.value / totalNodes) * 100}%` : '0%', height: '100%', background: item.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABULAR LOGS ── */}
      <div className="pro-card p-7">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-extrabold text-[var(--text-primary)]">{t('dashboard.logs.title')}</h3>
          <button className="text-xs font-bold text-[var(--brand)] hover:opacity-80 transition-opacity">{t('dashboard.logs.view_history')}</button>
        </div>
        <div className="flex flex-col gap-1 overflow-x-auto">
          {[
            { time: '12:04:22', event: t('dashboard.mock_logs.identity'), module: 'AUTH', type: 'INFO' },
            { time: '11:58:10', event: t('dashboard.mock_logs.flagged'),  module: 'MOD',  type: 'WARN' },
            { time: '11:45:03', event: t('dashboard.mock_logs.db_sync'),  module: 'DB',   type: 'INFO' },
          ].map((ev, i) => (
            <div key={i} className="flex items-center gap-5 p-3.5 rounded-lg transition-colors min-w-[600px]" style={{ background: 'var(--bg-card-hover)' }}>
              <span className="text-xs font-bold text-[var(--text-muted)] font-mono">{ev.time}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md w-12 text-center ${ev.type === 'WARN' ? 'text-amber-500 bg-amber-500/10' : 'text-[var(--brand)] bg-[var(--brand)]/10'}`}>{ev.module}</span>
              <span className="text-sm text-[var(--text-secondary)] flex-1">{ev.event}</span>
              <TrendingUp size={14} className="text-[var(--text-muted)]" />
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}