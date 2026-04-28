import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search as SearchIcon, MapPin,
  Package, Clock, CheckCircle2,
  ChevronRight, Download, AlertCircle, CircleCheck, Loader2, Trash2, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import useCountUp from '../../../hooks/useCountUp.jsx';
import api from '../../../api/axios';
import { exportLostFoundPDF } from '../../../utils/exportPDF';

function CountUpStat({ end, duration = 1500 }) {
  const display = useCountUp(end, duration);
  return <>{display}</>;
}

function RegisterModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ type: 'lost', title: '', description: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.description) { setError('Title and description are required.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/lost-found', form);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to register item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="pro-card relative z-10 w-full max-w-md p-8 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-[var(--text-primary)]">Register Item</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X size={20} /></button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          {/* Type toggle */}
          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Type</label>
            <div className="flex gap-2">
              {['lost', 'found'].map(t => (
                <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  style={{
                    background: form.type === t ? (t === 'lost' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)') : 'var(--bg-card-hover)',
                    color: form.type === t ? (t === 'lost' ? '#F43F5E' : '#10B981') : 'var(--text-muted)',
                    border: `1px solid ${form.type === t ? (t === 'lost' ? '#F43F5E40' : '#10B98140') : 'var(--border-subtle)'}`,
                  }}
                >{t}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Title</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="MacBook Pro 14&quot;" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the item..." rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Location</label>
            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              placeholder="Labo Info B23" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold"
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'var(--brand)', color: '#fff' }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Register Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemDrawer({ item, onClose, onResolve, onDelete }) {
  const { t } = useTranslation();
  if (!item) return null;

  const STATUS_COLORS = {
    open:     { color: 'text-amber-400',   bg: 'bg-amber-500/20'   },
    claimed:  { color: 'text-blue-400',    bg: 'bg-blue-500/20'    },
    resolved: { color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  };
  const st = STATUS_COLORS[item.status] ?? STATUS_COLORS.open;
  const firstImage = item.media?.[0]?.url ?? null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="pro-glass w-full max-w-lg h-full relative z-10 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] flex flex-col">
        <div className="relative h-64 overflow-hidden">
          {firstImage ? (
            <img src={firstImage} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(123,179,66,0.2), rgba(123,179,66,0.05))' }}>
              <Package size={64} className="text-[var(--text-muted)]/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2.5 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 text-white transition-all">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-4">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${item.type === 'lost' ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
              {item.type === 'lost' ? <AlertCircle size={12} /> : <CircleCheck size={12} />}
              {item.type === 'lost' ? t('lost_found.types.lost') : t('lost_found.types.found')}
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-[var(--bg-main)]">
          <h2 className="text-2xl font-black text-[var(--text-primary)] mb-1">{item.title}</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">{item.description}</p>
          <div className="space-y-3">
            <div className="pro-card p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-2">Location</p>
              <div className="flex items-center gap-3 text-[var(--text-primary)] font-semibold">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--brand)]/20">
                  <MapPin size={16} className="text-[var(--brand)]" />
                </div>
                {item.location ?? '—'}
              </div>
            </div>
            <div className="pro-card p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-2">Reported by</p>
              <div className="flex items-center gap-3 text-[var(--text-primary)] font-semibold">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/20">
                  <span className="text-orange-400 font-bold text-xs">{item.user?.name?.charAt(0) ?? '?'}</span>
                </div>
                {item.user?.name ?? '—'}
              </div>
            </div>
            <div className="pro-card p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-2">Status</p>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${st.bg} ${st.color}`}>
                {item.status}
              </span>
            </div>
            <div className="pro-card p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-2">Date</p>
              <div className="flex items-center gap-3 text-[var(--text-primary)] font-semibold">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20">
                  <Clock size={16} className="text-purple-400" />
                </div>
                {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div className="flex gap-3">
            {item.status !== 'resolved' && (
              <button onClick={() => onResolve(item.id)}
                className="flex-1 bg-[var(--brand)] hover:opacity-90 transition-opacity py-3.5 rounded-xl text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border-none">
                <CheckCircle2 size={18} /> {t('lost_found.actions.resolve')}
              </button>
            )}
            <button onClick={() => onDelete(item.id)}
              className="px-4 py-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all border border-rose-500/20 cursor-pointer">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LostFoundPage() {
  const { t } = useTranslation();

  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [search, setSearch]             = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const fetchItems = useCallback(() => {
    setLoading(true);
    api.get('/lost-found')
      .then(res => setItems(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleResolve = async (id) => {
    await api.patch(`/lost-found/${id}`, { status: 'resolved' });
    setSelectedItem(null);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/lost-found/${id}`);
    setSelectedItem(null);
    fetchItems();
  };

  const filtered = items.filter(item => {
    const matchType   = filter === 'all' || item.type === filter;
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase())
                     || (item.location ?? '').toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const lostCount     = items.filter(i => i.type === 'lost').length;
  const foundCount    = items.filter(i => i.type === 'found').length;
  const resolvedCount = items.filter(i => i.status === 'resolved').length;
  const recoveryRate  = items.length > 0 ? Math.round((resolvedCount / items.length) * 100) : 0;

  return (
    <AdminLayout
      title={t('nav.lost_found')}
      subtitle={t('lost_found.subtitle')}
      actions={[
        { icon: <Plus size={14} />,     label: t('lost_found.register'), primary: true, onClick: () => setShowRegister(true) },
        { icon: <Download size={14} />, label: t('common.export'), onClick: () => exportLostFoundPDF(items) },
      ]}
    >
      <div className="space-y-6">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="pro-card p-6 bg-gradient-to-br from-rose-500/20 to-rose-600/10 border-rose-500/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-500/30 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <AlertCircle size={20} className="text-rose-400" />
                </div>
                <span className="text-rose-400 font-bold text-xs uppercase tracking-wider">{t('lost_found.types.lost')}</span>
              </div>
              <div className="text-4xl font-black text-[var(--text-primary)]"><CountUpStat end={String(lostCount)} duration={1000} /></div>
              <p className="text-[var(--text-muted)] text-xs mt-1">items reported</p>
            </div>
          </div>

          <div className="pro-card p-6 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CircleCheck size={20} className="text-emerald-400" />
                </div>
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">{t('lost_found.types.found')}</span>
              </div>
              <div className="text-4xl font-black text-[var(--text-primary)]"><CountUpStat end={String(foundCount)} duration={1000} /></div>
              <p className="text-[var(--text-muted)] text-xs mt-1">items waiting</p>
            </div>
          </div>

          <div className="pro-card p-6 bg-gradient-to-br from-[var(--brand)]/20 to-[var(--brand)]/5 border-[var(--brand)]/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--brand)]/20 rounded-full blur-2xl group-hover:bg-[var(--brand)]/30 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand)]/20 flex items-center justify-center">
                  <Package size={20} className="text-[var(--brand)]" />
                </div>
                <span className="text-[var(--brand)] font-bold text-xs uppercase tracking-wider">Recovery</span>
              </div>
              <div className="text-4xl font-black text-[var(--text-primary)]"><CountUpStat end={String(recoveryRate)} duration={1000} />%</div>
              <p className="text-[var(--text-muted)] text-xs mt-1">{t('lost_found.hero.success')}</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pro-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('lost_found.search')}
                className="w-full rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all"
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex gap-2">
              {['all', 'lost', 'found'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  style={{ background: filter === f ? 'var(--brand)' : 'var(--bg-card-hover)', color: filter === f ? '#fff' : 'var(--text-muted)' }}>
                  {f === 'all' ? t('lost_found.categories') : t(`lost_found.types.${f}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[var(--brand)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="pro-card p-12 text-center">
            <Package size={48} className="text-[var(--text-primary)]/20 mx-auto mb-4" />
            <p className="text-[var(--text-primary)]/50 font-medium">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const firstImage = item.media?.[0]?.url ?? null;
              const STATUS_COLORS = {
                open:     'bg-amber-500/80',
                claimed:  'bg-blue-500/80',
                resolved: 'bg-emerald-500/80',
              };
              return (
                <div key={item.id} onClick={() => setSelectedItem(item)}
                  className="pro-card overflow-hidden group cursor-pointer hover:border-[var(--brand)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--brand)]/10">
                  <div className="relative h-40 overflow-hidden">
                    {firstImage ? (
                      <img src={firstImage} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, rgba(123,179,66,0.2), rgba(123,179,66,0.05))' }}>
                        <Package size={48} className="text-[var(--text-muted)]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className={`absolute top-3 left-3 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 ${item.type === 'lost' ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                      {item.type === 'lost' ? <AlertCircle size={10} /> : <CircleCheck size={10} />}
                      {item.type === 'lost' ? t('lost_found.types.lost') : t('lost_found.types.found')}
                    </span>
                    <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-1 rounded-md uppercase text-white ${STATUS_COLORS[item.status] ?? 'bg-amber-500/80'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 truncate group-hover:text-[var(--brand)] transition-colors">{item.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                      <MapPin size={12} /> {item.location ?? '—'}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                        <Clock size={12} /> {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-medium text-[var(--text-primary)]/60">{item.user?.name ?? '—'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ItemDrawer item={selectedItem} onClose={() => setSelectedItem(null)} onResolve={handleResolve} onDelete={handleDelete} />
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onSuccess={fetchItems} />}
    </AdminLayout>
  );
}