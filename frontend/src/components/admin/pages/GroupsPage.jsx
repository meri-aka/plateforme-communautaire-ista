import { useState, useEffect, useCallback } from 'react';
import { Users, Search as SearchIcon, Trash2, Eye, Loader2, X, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import api from '../../../api/axios';

export default function GroupsPage() {
  const { t } = useTranslation();

  const [groups, setGroups]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [meta, setMeta]             = useState(null);
  const [selected, setSelected]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchGroups = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', page);
    api.get(`/admin/groups?${params.toString()}`)
      .then(res => { setGroups(res.data.data); setMeta(res.data); })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleView = async (group) => {
    setDetailLoading(true);
    const res = await api.get(`/admin/groups/${group.id}`);
    setSelected(res.data);
    setDetailLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this group permanently?')) return;
    await api.delete(`/admin/groups/${id}`);
    setSelected(null);
    fetchGroups();
  };

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.creator?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Groups"
      subtitle="Manage all chat groups"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Groups List */}
        <div className="pro-card overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="relative">
              <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search groups or creators..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[var(--brand)]" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-[var(--text-muted)] text-sm">No groups found.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: 'var(--bg-card-hover)' }}>
                    <th className="p-4 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Group</th>
                    <th className="p-4 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest hidden md:table-cell">Creator</th>
                    <th className="p-4 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Members</th>
                    <th className="p-4 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(g => (
                    <tr key={g.id}
                      className="border-b hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                      style={{ borderColor: 'var(--border-subtle)' }}
                      onClick={() => handleView(g)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--brand), #1B365D)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Users size={16} color="#fff" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">{g.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{new Date(g.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-xs text-[var(--text-secondary)]">{g.creator?.name ?? '—'}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ background: 'rgba(123,179,66,0.1)', color: 'var(--brand)' }}>
                          {g.members_count} members
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); handleView(g); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--brand)] transition-colors"
                            style={{ background: 'var(--bg-card-hover)' }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(g.id); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-colors"
                            style={{ background: 'var(--bg-card-hover)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-xs text-[var(--text-muted)]">{meta.from}–{meta.to} of {meta.total}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
                  style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}>
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
                  className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30"
                  style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Group Detail Panel */}
        <div className="pro-card overflow-hidden">
          {detailLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-[var(--brand)]" />
            </div>
          ) : !selected ? (
            <div className="h-[400px] flex items-center justify-center flex-col gap-3">
              <Users size={48} className="opacity-20 text-[var(--text-muted)]" />
              <p className="text-[var(--text-muted)] text-sm">Select a group to view details</p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '14px',
                      background: 'linear-gradient(135deg, var(--brand), #1B365D)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Users size={24} color="#fff" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--text-primary)]">{selected.name}</h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Created {new Date(selected.created_at).toLocaleDateString()} · {selected.members?.length} members
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
                  >
                    Delete Group
                  </button>
                </div>

                {/* Creator */}
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-card-hover)' }}>
                  <Crown size={14} className="text-[var(--brand)]" />
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ background: 'var(--brand)' }}>
                      {selected.creator?.name?.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{selected.creator?.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">{selected.creator?.email}</span>
                  </div>
                  <span className="ml-auto text-[10px] font-black text-[var(--brand)] bg-[var(--brand)]/10 px-2 py-0.5 rounded-md uppercase">Creator</span>
                </div>
              </div>

              {/* Members */}
              <div className="p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Members ({selected.members?.length})
                </p>
                <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
                  {selected.members?.map(m => (
                    <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--bg-card-hover)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0" style={{ background: 'var(--brand)' }}>
                        {m.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">{m.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{m.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {m.filiere && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(123,179,66,0.1)', color: 'var(--brand)' }}>
                            {m.filiere.name}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md capitalize" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                          {m.pivot?.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages */}
              <div className="p-6">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Recent Messages ({selected.messages?.length})
                </p>
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                  {selected.messages?.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] text-center py-4">No messages yet.</p>
                  ) : selected.messages?.slice(-10).reverse().map(msg => (
                    <div key={msg.id} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: 'var(--bg-card-hover)' }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0" style={{ background: 'var(--brand)' }}>
                        {msg.user?.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-bold text-[var(--text-primary)]">{msg.user?.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] truncate">{msg.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}