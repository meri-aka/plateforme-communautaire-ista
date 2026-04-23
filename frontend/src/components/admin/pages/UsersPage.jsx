import { useState, useEffect, useCallback } from 'react';
import { 
  Search as SearchIcon, Download, Plus, Users, UserCheck, 
  UserX, UserPlus, Eye, Edit, Trash2, Filter, MoreVertical,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import useCountUp from '../../../hooks/useCountUp.jsx';
import useAdminStats from '../../../hooks/useAdminStats';
import api from '../../../api/axios';
import { exportUsersPDF } from '../../../utils/exportPDF';

function CountUpStat({ end, duration = 1500 }) {
  const display = useCountUp(end, duration);
  return <>{display}</>;
}

export default function UsersPage() {
  const { t } = useTranslation();
  const { stats } = useAdminStats();

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage]           = useState(1);
  const [meta, setMeta]           = useState(null); // pagination meta

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)     params.append('search', search);
    if (filterRole) params.append('role', filterRole);
    params.append('page', page);

    api.get(`/admin/users?${params.toString()}`)
      .then(res => {
        setUsers(res.data.data);
        setMeta(res.data);
      })
      .finally(() => setLoading(false));
  }, [search, filterRole, page]);

  useEffect(() => {
    const delay = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delay);
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!confirm(t('users.confirm_delete'))) return;
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  const handleRoleChange = async (id, role) => {
    await api.patch(`/admin/users/${id}`, { role });
    fetchUsers();
  };

  const STATUS_MAP = {
    stagiaire:  { label: t('users.roles.trainee'), color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
    formateur:  { label: t('users.roles.trainer'), color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
    admin:      { label: t('users.roles.admin'),   color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  };

  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'stagiaire', filiere_id: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

const handleInvite = async () => {
  setInviteLoading(true);
  setInviteError('');
  try {
    await api.post('/register', {
      ...inviteData,
      password: 'Ista@2025',
      password_confirmation: 'Ista@2025',
    });
    setShowInvite(false);
    setInviteData({ name: '', email: '', role: 'stagiaire', filiere_id: '' });
    fetchUsers();
  } catch (err) {
    setInviteError(err.response?.data?.message ?? 'Failed to create user.');
  } finally {
    setInviteLoading(false);
  }
};

  return (
    <AdminLayout
      title={t('nav.users')}
      subtitle={t('users.subtitle')}
      actions={[
        { icon: <Download size={14} />, label: t('users.actions.export'), onClick: () => exportUsersPDF(users) },
        { icon: <Plus size={14} />,     label: t('users.actions.invite'), primary: true, onClick: () => setShowInvite(true) },
      ]}
    >
      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('users.stats.total'),      value: stats?.users?.total      ?? 0, Icon: Users,     color: '#3B82F6' },
          { label: t('users.stats.verified'),   value: stats?.users?.stagiaires ?? 0, Icon: UserCheck, color: '#10B981' },
          { label: t('users.stats.pending'),    value: stats?.users?.formateurs ?? 0, Icon: UserPlus,  color: '#F59E0B' },
          { label: t('users.stats.restricted'), value: stats?.users?.new_today  ?? 0, Icon: UserX,     color: '#F43F5E' },
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
              <p className="text-2xl font-black text-[var(--text-primary)] leading-none">
                <CountUpStat end={s.value} duration={1200} />
              </p>
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
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('users.table.search')}
              className="pro-input pro-glass w-full pl-12 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={e => { setFilterRole(e.target.value); setPage(1); }}
              className="pro-glass px-4 py-2 rounded-xl text-xs font-bold border-none"
              style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}
            >
              <option value="">{t('users.table.status_filter')}</option>
              <option value="stagiaire">{t('users.roles.trainee')}</option>
              <option value="formateur">{t('users.roles.trainer')}</option>
              <option value="admin">{t('users.roles.admin')}</option>
            </select>
            <button className="pro-glass p-2.5 rounded-xl text-[var(--text-secondary)]">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[var(--brand)]" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: 'var(--bg-card-hover)' }}>
                  <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{t('users.table.header_details')}</th>
                  <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest hidden md:table-cell">Filière</th>
                  <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{t('users.table.header_access')}</th>
                  <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest text-right">{t('users.table.header_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-[var(--text-muted)] text-sm">
                      {t('users.table.empty')}
                    </td>
                  </tr>
                ) : users.map((u) => {
                  const RL = STATUS_MAP[u.role] ?? STATUS_MAP.stagiaire;
                  return (
                    <tr key={u.id} className="border-b transition-colors hover:bg-[var(--bg-card-hover)]" style={{ borderColor: 'var(--border-subtle)' }}>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          {u.avatar
                            ? <img src={u.avatar} className="w-10 h-10 rounded-xl border object-cover" style={{ borderColor: 'var(--border-subtle)' }} alt="" />
                            : <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: RL.color }}>{u.name.charAt(0)}</div>
                          }
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{u.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 hidden md:table-cell">
                        <span className="text-xs text-[var(--text-secondary)]">{u.filiere?.name ?? '—'}</span>
                      </td>
                      <td className="p-5">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="text-[10px] font-black px-2 py-1 rounded-md border-none cursor-pointer"
                          style={{ color: RL.color, background: RL.bg }}
                        >
                          <option value="stagiaire">{t('users.roles.trainee')}</option>
                          <option value="formateur">{t('users.roles.trainer')}</option>
                          <option value="admin">{t('users.roles.admin')}</option>
                        </select>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-colors"
                            style={{ background: 'var(--bg-card-hover)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="p-5 border-t border-[var(--glass-border)] flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)]">
              {meta.from}–{meta.to} of {meta.total} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
        {showInvite && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
    <div className="pro-card relative z-10 w-full max-w-md p-8 animate-slide-up">
      <h3 className="text-xl font-black text-[var(--text-primary)] mb-6">Invite Member</h3>

      {inviteError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {inviteError}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Full Name</label>
          <input
            value={inviteData.name}
            onChange={e => setInviteData(p => ({ ...p, name: e.target.value }))}
            placeholder="Ahmed El Mansouri"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Email</label>
          <input
            type="email"
            value={inviteData.email}
            onChange={e => setInviteData(p => ({ ...p, email: e.target.value }))}
            placeholder="ahmed@ista.ma"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Role</label>
          <select
            value={inviteData.role}
            onChange={e => setInviteData(p => ({ ...p, role: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <option value="stagiaire">Stagiaire</option>
            <option value="formateur">Formateur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <p className="text-[10px] text-[var(--text-muted)]">Default password: <span className="font-mono text-[var(--brand)]">Ista@2025</span></p>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={() => setShowInvite(false)}
          className="flex-1 py-3 rounded-xl text-sm font-bold"
          style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleInvite}
          disabled={inviteLoading || !inviteData.name || !inviteData.email}
          className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: 'var(--brand)', color: '#fff' }}
        >
          {inviteLoading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Member'}
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </AdminLayout>
  );
}