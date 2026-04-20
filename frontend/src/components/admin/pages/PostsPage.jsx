import { useState } from 'react';
import { 
  Search as SearchIcon, Filter, MoreVertical, Eye, 
  CheckCircle, XCircle, AlertTriangle, MessageSquare, 
  Share2, Heart, TrendingUp, Download, Plus 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';

export default function PostsPage() {
  const { t } = useTranslation();

  const mockPosts = [
    { id: 1, author: 'Omar H.',  avatar: 'https://i.pravatar.cc/150?img=12', title: t('posts.mock.p1'), field: t('users.fields.dev'), status: 'published', likes: 142, signals: 0, date: t('common.time.h', { count: 2 }) },
    { id: 2, author: 'Nadia B.', avatar: 'https://i.pravatar.cc/150?img=9',  title: t('posts.mock.p2'), field: t('users.fields.ai'), status: 'published', likes: 89,  signals: 2, date: t('common.time.h', { count: 5 }) },
    { id: 3, author: 'Karim M.', avatar: 'https://i.pravatar.cc/150?img=15', title: t('posts.mock.p3'),  field: t('users.fields.general'),      status: 'flagged',   likes: 4,   signals: 12, date: t('common.time.d', { count: 1 }) },
  ];

  const [search, setSearch] = useState('');

  const filtered = mockPosts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.author.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout
      title={t('nav.posts')}
      subtitle={t('posts.subtitle')}
      actions={[
        { icon: <Download size={14} />, label: t('common.export') },
        { icon: <Plus size={14} />, label: t('common.view_all'), primary: true },
      ]}
    >
      <div className="pro-card overflow-hidden animate-slide-up">
        {/* Toolbar */}
        <div className="p-5 border-b border-white/5 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('posts.table.search')}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:border-[var(--brand)] transition-all outline-none"
            />
          </div>
          <button className="pro-glass p-2.5 rounded-xl text-[var(--text-secondary)]">
            <Filter size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{t('posts.table.header_details')}</th>
                <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest hidden md:table-cell">{t('posts.table.header_metrics')}</th>
                <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest text-right">{t('posts.table.header_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={p.avatar} className="w-12 h-12 rounded-xl border border-white/10" alt="" />
                        {p.signals > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-[var(--bg-card)] flex items-center justify-center text-[8px] font-black text-white">{p.signals}</div>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1 group-hover:text-[var(--brand)] transition-colors">{p.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">{p.author} • {p.field}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 hidden md:table-cell">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                        <Heart size={14} className="text-rose-500/60" /> {p.likes}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                        <Share2 size={14} className="text-sky-500/60" /> {(p.likes * 0.2).toFixed(0)}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--brand)] hover:text-white transition-all"><Eye size={16} /></button>
                       <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-rose-500/60 hover:bg-rose-500 hover:text-white transition-all"><XCircle size={16} /></button>
                       <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[var(--text-secondary)]"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
