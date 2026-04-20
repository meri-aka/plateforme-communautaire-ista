import { useState } from 'react';
import { 
  Search as SearchIcon, Download, Plus, Users, UserCheck, 
  UserX, UserPlus, Eye, Edit, Ban, Trash2, Filter, 
  MoreVertical, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import useCountUp from '../../../hooks/useCountUp.jsx';

function CountUpStat({ end, duration = 1500 }) {
  const display = useCountUp(end, duration);
  return <>{display}</>;
}

export default function UsersPage() {
  const { t } = useTranslation();

  const mockUsers = [
    { id: 1,  name: 'Ahmed El Mansouri',  email: 'ahmed.m@ista.ma',    field: t('users.fields.dev'),             role: 'trainee', status: 'active',   joined: 'Jan 12, 2025',  posts: 34, level: t('users.levels.y2'), avatar: 'https://i.pravatar.cc/150?img=11' },
    { id: 2,  name: 'Sara Ait Benhaddou', email: 'sara.a@ista.ma',     field: t('users.fields.infra'), role: 'trainee', status: 'active',   joined: 'Jan 15, 2025',  posts: 21, level: t('users.levels.y1'), avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3,  name: 'Karim Moussaoui',    email: 'karim.m@ista.ma',    field: t('users.fields.dev'),             role: 'trainee', status: 'banned',   joined: 'Sep 3, 2024',   posts: 8,  level: t('users.levels.y1'), avatar: 'https://i.pravatar.cc/150?img=15' },
    { id: 4,  name: 'Nadia Benchekroun',  email: 'nadia.b@ista.ma',    field: t('users.fields.ai'),                      role: 'trainee', status: 'active',   joined: 'Jan 10, 2025',  posts: 56, level: t('users.levels.y2'), avatar: 'https://i.pravatar.cc/150?img=9' },
    { id: 5,  name: 'Youssef Tazi',       email: 'youssef.t@ista.ma',  field: t('users.fields.infra'), role: 'trainee', status: 'inactive', joined: 'Oct 20, 2024',  posts: 3,  level: t('users.levels.y1'), avatar: 'https://i.pravatar.cc/150?img=33' },
    { id: 6,  name: 'Fatima Zohra',       email: 'fatima.z@ista.ma',   field: t('users.fields.dev'),             role: 'trainee', status: 'active',   joined: 'Jan 8, 2025',   posts: 47, level: t('users.levels.y2'), avatar: 'https://i.pravatar.cc/150?img=44' },
  ];

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const STATUS_MAP = {
    active:   { label: t('users.status.active'),   color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    banned:   { label: t('users.status.banned'),   color: '#F43F5E', bg: 'rgba(244,63,94,0.1)'  },
    inactive: { label: t('users.status.inactive'), color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' },
  };

  const ROLE_MAP = {
    trainee:  { label: t('users.roles.trainee'), color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
    trainer:  { label: t('users.roles.trainer'), color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
    admin:    { label: t('users.roles.admin'),   color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  };

  const filtered = mockUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout
      title={t('nav.users')}
      subtitle={t('users.subtitle')}
      actions={[
        { icon: <Download size={14} />, label: t('users.actions.export') },
        { icon: <Plus size={14} />, label: t('users.actions.invite'), primary: true },
      ]}
    >
      {/* ── RESPONSIVE STATS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('users.stats.total'),    value: '2.4K',  Icon: Users,     color: '#3B82F6' },
          { label: t('users.stats.verified'), value: '2.1K',  Icon: UserCheck, color: '#10B981' },
          { label: t('users.stats.pending'),  value: '184',   Icon: UserPlus,  color: '#F59E0B' },
          { label: t('users.stats.restricted'), value: '14',    Icon: UserX,     color: '#F43F5E' },
        ].map((s, i) => (
          <div key={i} className="pro-card p-5 flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: `${s.color}15`, border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <s.Icon size={20} color={s.color} />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--text-primary)] leading-none"><CountUpStat end={s.value} duration={1200} /></p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pro-card overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-[var(--glass-border)] flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('users.table.search')}
              className="pro-input pro-glass w-full pl-12 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          <div className="flex gap-2">
            <select className="pro-glass px-4 py-2 rounded-xl text-xs font-bold border-none">
              <option value="all">{t('users.table.status_filter')}</option>
              <option value="active">{t('users.status.active')}</option>
              <option value="banned">{t('users.status.banned')}</option>
            </select>
            <button className="pro-glass p-2.5 rounded-xl text-[var(--text-secondary)]">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{t('users.table.header_details')}</th>
                <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest hidden md:table-cell">{t('users.table.header_access')}</th>
                <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{t('users.table.header_status')}</th>
                <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest text-right">{t('users.table.header_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const ST = STATUS_MAP[u.status];
                const RL = ROLE_MAP[u.role];
                return (
                  <tr key={u.id} className="border-b border-[var(--glass-border)] hover:bg-white/[0.01] transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} className="w-10 h-10 rounded-xl border border-[var(--glass-border)]" alt="" />
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{u.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 hidden md:table-cell">
                      <span className="text-[10px] font-black px-2 py-1 rounded-md uppercase" style={{ color: RL.color, background: RL.bg }}>{RL.label}</span>
                    </td>
                    <td className="p-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ST.color }} />
                        <span className="text-[11px] font-bold" style={{ color: ST.color }}>{ST.label}</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                         <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)]"><Eye size={14} /></button>
                         <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-secondary)]"><MoreVertical size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
