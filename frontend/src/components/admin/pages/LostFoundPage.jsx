import { useState } from 'react';
import { 
  Plus, Search as SearchIcon, MapPin, Calendar, 
  Package, Clock, CheckCircle2, MoreVertical, 
  Trash2, Filter, ChevronLeft, ChevronRight,
  Monitor, Smartphone, Watch, Laptop, Briefcase,
  Camera, ShoppingBag, Download, AlertCircle, CircleCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import useCountUp from '../../../hooks/useCountUp.jsx';

function CountUpStat({ end, duration = 1500 }) {
  const display = useCountUp(end, duration);
  return <>{display}</>;
}

function ItemDrawer({ item, onClose }) {
  const { t } = useTranslation();
  if (!item) return null;
  const Icon = item.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="pro-glass w-full max-w-lg h-full relative z-10 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] flex flex-col animate-slide-left">
        <div className="relative h-64 overflow-hidden">
          {item.image ? (
            <img src={item.image} alt={item.item} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${item.color}40, ${item.color}10)` }}>
              <Icon size={64} className="text-[var(--text-muted)]/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2.5 rounded-full bg-black/30 backdrop-blur-md hover:bg-black/50 text-[var(--text-primary)]/80 hover:text-[var(--text-primary)] transition-all">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${item.type === 'lost' ? 'bg-rose-500/90 text-[var(--text-primary)]' : 'bg-emerald-500/90 text-[var(--text-primary)]'}`}>
              {item.type === 'lost' ? <AlertCircle size={12} /> : <CircleCheck size={12} />}
              {item.type === 'lost' ? t('lost_found.types.lost') : t('lost_found.types.found')}
            </span>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-[var(--bg-main)]">
          <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">{item.item}</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">{item.category}</p>

          <div className="space-y-4">
            <div className="pro-card p-4 bg-[var(--bg-card-hover)]/[0.02] border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-3">{t('lost_found.details.coordinates')}</p>
              <div className="flex items-center gap-3 text-[var(--text-primary)] font-semibold">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--brand)]/20">
                  <MapPin size={16} className="text-[var(--brand)]" />
                </div>
                {item.location}
              </div>
            </div>
            <div className="pro-card p-4 bg-[var(--bg-card-hover)]/[0.02] border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-3">{t('lost_found.details.cataloged')}</p>
              <div className="flex items-center gap-3 text-[var(--text-primary)] font-semibold">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20">
                  <Clock size={16} className="text-purple-400" />
                </div>
                {item.time}
              </div>
            </div>
            <div className="pro-card p-4 bg-[var(--bg-card-hover)]/[0.02] border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-3">Reported by</p>
              <div className="flex items-center gap-3 text-[var(--text-primary)] font-semibold">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/20">
                  <span className="text-orange-400 font-bold text-xs">{item.user.charAt(0)}</span>
                </div>
                {item.user}
              </div>
            </div>
            <div className="pro-card p-4 bg-[var(--bg-card-hover)]/[0.02] border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-3">Status</p>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${item.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : item.status === 'recorded' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {item.status}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div className="flex gap-3">
            <button className="flex-1 bg-[var(--brand)] hover:opacity-90 transition-opacity py-3.5 rounded-xl text-[var(--text-primary)] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-none cursor-pointer">
              <CheckCircle2 size={18} />
              {t('lost_found.actions.resolve')}
            </button>
            <button className="px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-primary)] transition-all border border-white/10">
              <span className="font-bold text-sm">{t('lost_found.actions.contact')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LostFoundPage() {
  const { t } = useTranslation();

  const mockItems = [
    { id: 1, type: 'lost',  category: t('lost_found.categories_list.electronics'), item: t('lost_found.mock.item1'),   location: t('lost_found.mock.loc1'),   time: t('common.time.h', { count: 2 }),      user: 'Karim M.', status: 'pending',   icon: Laptop,       color: '#3B82F6', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop' },
    { id: 2, type: 'found', category: t('lost_found.categories_list.accessories'), item: t('lost_found.mock.item2'),   location: t('lost_found.mock.loc2'), time: t('common.time.h', { count: 5 }),      user: 'Nadia B.', status: 'recorded',  icon: Smartphone,   color: '#10B981', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop' },
    { id: 3, type: 'lost',  category: t('lost_found.categories_list.personal'),    item: t('lost_found.mock.item3'),   location: t('lost_found.mock.loc3'),  time: t('common.time.yesterday'),   user: 'Omar H.',  status: 'pending',   icon: ShoppingBag,  color: '#F43F5E', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=400&fit=crop' },
    { id: 4, type: 'found', category: t('lost_found.categories_list.electronics'), item: t('lost_found.mock.item4'),   location: t('lost_found.mock.loc4'), time: t('common.time.d', { count: 2 }),  user: 'System',   status: 'resolved',  icon: Watch,        color: '#8B5CF6', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop' },
    { id: 5, type: 'lost',  category: t('lost_found.categories_list.electronics'), item: 'iPad Pro 12.9"',   location: 'Bibliothèque centrale',  time: t('common.time.d', { count: 3 }),  user: 'Youssef R.', status: 'pending',   icon: Monitor,      color: '#EC4899', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop' },
    { id: 6, type: 'found', category: t('lost_found.categories_list.accessories'), item: 'Clé USB 64GB',   location: 'Labo Info B23', time: t('common.time.h', { count: 8 }),      user: 'Admin',   status: 'recorded',  icon: Briefcase,    color: '#14B8A6', image: 'https://images.unsplash.com/photo-1618410320928-25228d811631?w=600&h=400&fit=crop' },
  ];

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = mockItems.filter(item => {
    const matchType = filter === 'all' || item.type === filter;
    const matchSearch = item.item.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const lostCount = mockItems.filter(i => i.type === 'lost').length;
  const foundCount = mockItems.filter(i => i.type === 'found').length;

  return (
    <AdminLayout
      title={t('nav.lost_found')}
      subtitle={t('lost_found.subtitle')}
      actions={[
        { icon: <Plus size={14} />, label: t('lost_found.register'), primary: true },
        { icon: <Download size={14} />, label: t('common.export') },
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
              <div className="text-4xl font-black text-[var(--text-primary)]"><CountUpStat end="94" duration={1000} />%</div>
              <p className="text-[var(--text-muted)] text-xs mt-1">{t('lost_found.hero.success')}</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="pro-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('lost_found.search')}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-[var(--text-primary)] focus:border-[var(--brand)] transition-all outline-none"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'lost', 'found'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === f 
                      ? 'bg-[var(--brand)] text-[var(--text-primary)]' 
                      : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-[var(--text-primary)]'
                  }`}
                >
                  {f === 'all' ? t('lost_found.categories') : t(`lost_found.types.${f}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedItem(item)}
                className="pro-card overflow-hidden group cursor-pointer hover:border-[var(--brand)]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--brand)]/10"
              >
                <div className="relative h-40 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.item} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)` }}>
                      <Icon size={48} className="text-[var(--text-muted)]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className={`absolute top-3 left-3 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 ${item.type === 'lost' ? 'bg-rose-500/90 text-[var(--text-primary)]' : 'bg-emerald-500/90 text-[var(--text-primary)]'}`}>
                    {item.type === 'lost' ? <AlertCircle size={10} /> : <CircleCheck size={10} />}
                    {item.type === 'lost' ? t('lost_found.types.lost') : t('lost_found.types.found')}
                  </span>
                  <span className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-1 rounded-md uppercase ${item.status === 'resolved' ? 'bg-emerald-500/80 text-[var(--text-primary)]' : item.status === 'recorded' ? 'bg-blue-500/80 text-[var(--text-primary)]' : 'bg-amber-500/80 text-[var(--text-primary)]'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 truncate group-hover:text-[var(--brand)] transition-colors">{item.item}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                      <Clock size={12} /> {item.time}
                    </span>
                    <span className="text-[10px] font-medium text-[var(--text-primary)]/60">{item.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="pro-card p-12 text-center">
            <Package size={48} className="text-[var(--text-primary)]/20 mx-auto mb-4" />
            <p className="text-[var(--text-primary)]/50 font-medium">No items found</p>
          </div>
        )}
      </div>

      <ItemDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </AdminLayout>
  );
}
