import { useState, useEffect, useCallback } from 'react';
import { 
  Search as SearchIcon, Filter, Eye, 
  Heart, MessageSquare, Download, Plus, Loader2, Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import api from '../../../api/axios';

export default function PostsPage() {
  const { t } = useTranslation();

  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [meta, setMeta]             = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page);

    api.get(`/posts?${params.toString()}`)
      .then(res => {
        setPosts(res.data.data);
        setMeta(res.data);
      })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    const delay = setTimeout(fetchPosts, 300);
    return () => clearTimeout(delay);
  }, [fetchPosts]);

  const handleDelete = async (id) => {
    if (!confirm(t('posts.confirm_delete'))) return;
    await api.delete(`/posts/${id}`);
    fetchPosts();
  };

  return (
    <AdminLayout
      title={t('nav.posts')}
      subtitle={t('posts.subtitle')}
      actions={[
        { icon: <Download size={14} />, label: t('common.export') },
        { icon: <Plus size={14} />,     label: t('common.view_all'), primary: true },
      ]}
    >
      <div className="pro-card overflow-hidden animate-slide-up">
        {/* Toolbar */}
        <div className="p-5 border-b flex flex-wrap items-center gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="relative flex-1 min-w-[280px]">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('posts.table.search')}
              className="w-full rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none transition-all"
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>
          <button className="pro-glass p-2.5 rounded-xl text-[var(--text-secondary)]">
            <Filter size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-[var(--brand)]" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: 'var(--bg-card-hover)' }}>
                  <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest">{t('posts.table.header_details')}</th>
                  <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest hidden md:table-cell">{t('posts.table.header_metrics')}</th>
                  <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest hidden md:table-cell">Filière</th>
                  <th className="p-5 font-black text-[10px] text-[var(--text-muted)] uppercase tracking-widest text-right">{t('posts.table.header_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-[var(--text-muted)] text-sm">
                      {t('posts.table.empty')}
                    </td>
                  </tr>
                ) : posts.map((p) => (
                  <tr key={p.id} className="transition-colors group hover:bg-[var(--bg-card-hover)]" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        {p.user?.avatar
                          ? <img src={p.user.avatar} className="w-12 h-12 rounded-xl border object-cover" alt="" style={{ borderColor: 'var(--border-subtle)' }} />
                          : <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm bg-[var(--brand)]">{p.user?.name?.charAt(0) ?? '?'}</div>
                        }
                        <div>
                          <p className="text-sm font-bold mb-1 group-hover:text-[var(--brand)] transition-colors line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                            {p.content?.substring(0, 80)}...
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">{p.user?.name} • {new Date(p.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 hidden md:table-cell">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                          <Heart size={14} className="text-rose-500/60" /> {p.likes_count ?? 0}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)]">
                          <MessageSquare size={14} className="text-sky-500/60" /> {p.comments_count ?? 0}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 hidden md:table-cell">
                      <span className="text-xs text-[var(--text-secondary)]">{p.user?.filiere?.name ?? '—'}</span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedPost(p)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--brand)] transition-all"
                          style={{ background: 'var(--bg-card-hover)' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-all"
                          style={{ background: 'var(--bg-card-hover)' }}
                        >
                          <Trash2 size={16} />
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
          <div className="p-5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs text-[var(--text-muted)]">{meta.from}–{meta.to} of {meta.total} posts</p>
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

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
          <div className="pro-card relative z-10 w-full max-w-lg p-8 animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              {selectedPost.user?.avatar
                ? <img src={selectedPost.user.avatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                : <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white" style={{ background: 'var(--brand)' }}>{selectedPost.user?.name?.charAt(0) ?? '?'}</div>
              }
              <div>
                <p className="font-bold text-[var(--text-primary)]">{selectedPost.user?.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{selectedPost.user?.email} • {new Date(selectedPost.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 p-4 rounded-xl" style={{ background: 'var(--bg-card-hover)' }}>
              {selectedPost.content}
            </p>

            {selectedPost.media?.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-6">
                {selectedPost.media.map((m, i) => (
                  <img key={i} src={m.url} className="w-full h-32 object-cover rounded-xl" alt="" />
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 mb-6 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-2"><Heart size={16} className="text-rose-400" /> {selectedPost.likes_count ?? 0} likes</span>
              <span className="flex items-center gap-2"><MessageSquare size={16} className="text-sky-400" /> {selectedPost.comments_count ?? 0} comments</span>
              <span className="text-xs">{selectedPost.user?.filiere?.name ?? '—'}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { handleDelete(selectedPost.id); setSelectedPost(null); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors"
              >
                Delete Post
              </button>
              <button
                onClick={() => setSelectedPost(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}