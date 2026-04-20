import { useState } from 'react';
import { 
  Plus, Search as SearchIcon, MapPin, Calendar, 
  Package, Clock, CheckCircle2, MoreVertical, 
  Trash2, Filter, ChevronLeft, ChevronRight,
  Monitor, Smartphone, Watch, Laptop, Briefcase,
  Camera, ShoppingBag, Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';



function ItemDrawer({ item, onClose }) {
  const { t } = useTranslation();
  if (!item) return null;
  const Icon = item.icon;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="pro-glass w-full max-w-md h-full relative z-10 p-8 shadow-2xl animate-slide-left flex flex-col">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-all">
          <ChevronRight size={24} />
        </button>

        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>
            <Icon size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{item.item}</h2>
          <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${item.type === 'lost' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {item.type === 'lost' ? t('lost_found.types.lost') : t('lost_found.types.found')}
          </span>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto pr-4 no-scrollbar">
          <div className="pro-card p-5 bg-white/[0.02]">
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, margin: '0 0 6px' }}>{t('lost_found.details.coordinates')}</p>
            <div className="flex items-center gap-2 text-white font-bold">
              <MapPin size={16} className="text-[var(--brand)]" />
              {item.location}
            </div>
          </div>
          <div className="pro-card p-5 bg-white/[0.02]">
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, margin: '0 0 6px' }}>{t('lost_found.details.cataloged')}</p>
            <div className="flex items-center gap-2 text-white font-bold">
              <Clock size={16} className="text-[var(--brand)]" />
              {item.time}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8 pt-8 border-t border-white/5">
          <button className="flex-1 pro-glass bg-[var(--brand)] hover:opacity-90 transition-opacity py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest border-none cursor-pointer">
            {t('lost_found.actions.resolve')}
          </button>
          <button className="flex-1 pro-glass hover:bg-white/5 py-4 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all">
            {t('lost_found.actions.contact')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LostFoundPage() {
  const { t } = useTranslation();

  const mockItems = [
    { id: 1, type: 'lost',  category: t('lost_found.categories_list.electronics'), item: t('lost_found.mock.item1'),   location: t('lost_found.mock.loc1'),   time: t('common.time.h', { count: 2 }),      user: 'Karim M.', status: 'pending',   icon: Laptop,       color: '#3B82F6' },
    { id: 2, type: 'found', category: t('lost_found.categories_list.accessories'), item: t('lost_found.mock.item2'),   location: t('lost_found.mock.loc2'), time: t('common.time.h', { count: 5 }),      user: 'Nadia B.', status: 'recorded',  icon: Smartphone,   color: '#10B981' },
    { id: 3, type: 'lost',  category: t('lost_found.categories_list.personal'),    item: t('lost_found.mock.item3'),   location: t('lost_found.mock.loc3'),  time: t('common.time.yesterday'),   user: 'Omar H.',  status: 'pending',   icon: ShoppingBag,  color: '#F43F5E' },
    { id: 4, type: 'found', category: t('lost_found.categories_list.electronics'), item: t('lost_found.mock.item4'),   location: t('lost_found.mock.loc4'), time: t('common.time.d', { count: 2 }),  user: 'System',   status: 'resolved',  icon: Watch,        color: '#8B5CF6' },
  ];

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = mockItems.filter(item => {
    const matchType = filter === 'all' || item.type === filter;
    const matchSearch = item.item.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <AdminLayout
      title={t('nav.lost_found')}
      subtitle={t('lost_found.subtitle')}
      actions={[
        { icon: <Plus size={14} />, label: t('lost_found.register'), primary: true },
        { icon: <Download size={14} />, label: t('common.export') },
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Stats Column */}
        <div className="w-full lg:w-[320px] shrink-0 animate-slide-up">
          <div className="pro-card p-8 bg-[var(--brand)] shadow-[0_20px_50px_var(--brand-glow)] border-none relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                <Package size={24} className="text-white" />
              </div>
              <h3 className="text-3xl font-black text-white mb-2">{t('lost_found.hero.title')}</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">{t('lost_found.hero.desc')}</p>
              <div className="text-4xl font-black text-white">94% <span className="text-lg text-white/50 font-bold tracking-tight">{t('lost_found.hero.success')}</span></div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
          </div>

          <div className="pro-card mt-6 p-6">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">{t('lost_found.categories')}</h4>
            <div className="flex flex-wrap gap-2">
              {[
                t('lost_found.categories_list.tech'),
                t('lost_found.categories_list.labs'),
                t('lost_found.categories_list.library'),
                t('lost_found.categories_list.admin')
              ].map(c => (
                <button key={c} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--brand)] hover:text-white transition-all">{c}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="flex-1 min-w-0 w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="pro-card overflow-hidden">
            <div className="p-5 border-b border-white/5 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={t('lost_found.search')}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:border-[var(--brand)] transition-all outline-none"
                />
              </div>
              <div className="flex gap-2">
                 <select 
                   value={filter} onChange={e => setFilter(e.target.value)}
                   className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white cursor-pointer outline-none"
                 >
                    <option value="all">{t('lost_found.categories')}</option>
                    <option value="lost">{t('lost_found.types.lost')}</option>
                    <option value="found">{t('lost_found.types.found')}</option>
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="p-6 bg-[var(--bg-card)] hover:bg-white/[0.02] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20`, color: item.color }}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">{item.item}</p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-white/20 group-hover:text-[var(--brand)] group-hover:translate-x-1 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      <ItemDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </AdminLayout>
  );
}
