import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import {
  Heart, MessageCircle, Send, Loader2, BookOpen,
  ImagePlus, X, ChevronLeft, ChevronRight,
  Sparkles, TrendingUp, Users
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const avatarUrl = (u) =>
  u?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name ?? 'U')}&background=7BB342&color=fff&size=128`;

const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ─── Online Users Strip ────────────────────────────────────────────────────────
function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const stripRef = useRef();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/users/online');
        setOnlineUsers(res.data?.data ?? res.data ?? []);
      } catch {
        // fallback: empty
      }
      setLoading(false);
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!loading && onlineUsers.length === 0) return null;
//   useEffect(() => {
//     api.post('/ping'); // ping on mount
//     const interval = setInterval(() => api.post('/ping'), 60000); // every 60s
//     return () => clearInterval(interval);
// }, []);
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      padding: '14px 18px',
      marginBottom: '14px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)', flexShrink: 0 }} />
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          Active Now
        </span>
        {!loading && (
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginLeft: '2px' }}>
            · {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'}
          </span>
        )}
      </div>

      {/* Scrollable strip */}
      {loading ? (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'hidden' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--bg-card-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ width: '36px', height: '9px', borderRadius: '5px', background: 'var(--bg-card-hover)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={stripRef}
          style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}
        >
          <style>{`.online-strip::-webkit-scrollbar{display:none}`}</style>
          {onlineUsers.map(u => (
            <Link
              key={u.id}
              to={`/profile/${u.id}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0, textDecoration: 'none', cursor: 'pointer' }}
            >
              <div style={{ position: 'relative' }}>
                <img
                  src={avatarUrl(u)}
                  alt={u.name}
                  style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    objectFit: 'cover', display: 'block',
                    border: '2px solid var(--brand)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <span style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: '#22c55e', border: '2px solid var(--bg-card)',
                }} />
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
                maxWidth: '52px', textAlign: 'center',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {u.name?.split(' ')[0]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ media, index, onClose }) {
  const [current, setCurrent] = useState(index);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(media.length - 1, c + 1));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [media.length, onClose]);
  const item = media[current];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
      {current > 0 && <button onClick={e => { e.stopPropagation(); setCurrent(c => c - 1); }} style={{ position: 'absolute', left: '20px', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={22} /></button>}
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh' }}>
        {item?.type === 'video'
          ? <video src={resolveUrl(item.url)} controls style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: '12px', display: 'block' }} />
          : <img src={resolveUrl(item?.url)} alt="" style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }} />
        }
      </div>
      {current < media.length - 1 && <button onClick={e => { e.stopPropagation(); setCurrent(c => c + 1); }} style={{ position: 'absolute', right: '20px', width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={22} /></button>}
      {media.length > 1 && <div style={{ position: 'absolute', bottom: '20px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{current + 1} / {media.length}</div>}
    </div>
  );
}

// ─── Media Grid ────────────────────────────────────────────────────────────────
function MediaGrid({ media }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  if (!media?.length) return null;
  const count = Math.min(media.length, 4);
  const extra = media.length - 4;
  return (
    <>
      <style>{`
        .mg-1{display:grid;grid-template-columns:1fr}
        .mg-2{display:grid;grid-template-columns:1fr 1fr}
        .mg-3{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto}
        .mg-4{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto auto}
        .mg-3 .mi-0{grid-row:1/3}
        .mi{position:relative;overflow:hidden;background:var(--bg-card-hover);cursor:pointer}
        .mi img,.mi video{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.4s cubic-bezier(0.4,0,0.2,1)}
        .mi:hover img,.mi:hover video{transform:scale(1.06)}
        .mg-1 .mi{aspect-ratio:16/9}
        .mg-2 .mi{aspect-ratio:4/3}
        .mg-3 .mi-0{min-height:220px}
        .mg-3 .mi:not(.mi-0){aspect-ratio:1/1}
        .mg-4 .mi{aspect-ratio:1/1}
      `}</style>
      <div className={`mg-${count}`} style={{ gap: '3px', borderRadius: '14px', overflow: 'hidden', marginTop: '12px' }}>
        {media.slice(0, 4).map((m, i) => (
          <div key={i} className={`mi mi-${i}`} onClick={() => setLightboxIndex(i)}>
            {m.type === 'video' ? <video src={resolveUrl(m.url)} /> : <img src={resolveUrl(m.url)} alt="" />}
            {i === 3 && extra > 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, color: '#fff' }}>+{extra}</div>
            )}
          </div>
        ))}
      </div>
      {lightboxIndex !== null && <Lightbox media={media} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
    </>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post }) {
  const { user: me } = useAuth();
  const [liked, setLiked]               = useState(post.is_liked ?? false);
  const [likeCount, setLikeCount]       = useState(post.likes_count ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]         = useState([]);
  const [commentText, setCommentText]   = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const toggleLike = async () => {
    const prev = liked;
    setLiked(!prev);
    setLikeCount(c => prev ? c - 1 : c + 1);
    try { await api.post(`/posts/${post.id}/like`); }
    catch { setLiked(prev); setLikeCount(c => prev ? c + 1 : c - 1); }
  };

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await api.get(`/posts/${post.id}/comments`);
      setComments(res.data?.data ?? res.data ?? []);
    } catch {}
    setLoadingComments(false);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${post.id}/comments`, { content: commentText });
      setComments(prev => [...prev, res.data]);
      setCommentText('');
    } catch {}
    setSubmitting(false);
  };

  const media = Array.isArray(post.media) && post.media.length > 0
    ? post.media
    : post.image ? [{ url: post.image, type: 'image' }] : [];

  return (
    <article style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px', overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.boxShadow = '0 4px 24px -8px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Header */}
      <div style={{ padding: '16px 18px 0', display: 'flex', alignItems: 'center', gap: '11px' }}>
        <Link to={`/profile/${post.user?.id}`} style={{ flexShrink: 0, display: 'block', position: 'relative' }}>
          <img src={avatarUrl(post.user)} alt={post.user?.name}
            style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', display: 'block', border: '2px solid var(--border-subtle)' }} />
          {post.user?.is_online && (
            <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '11px', height: '11px', borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-card)' }} />
          )}
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/profile/${post.user?.id}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontWeight: 700, fontSize: '14px', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {post.user?.name}
            </p>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '1px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {post.user?.filiere?.name && <>
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{post.user.filiere.name}</span>
              <span>·</span>
            </>}
            {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 18px 16px' }}>
        {(post.content ?? post.body) && (
          <p style={{ fontSize: '14px', lineHeight: 1.65, margin: 0, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
            {post.content ?? post.body}
          </p>
        )}
        <MediaGrid media={media} />
      </div>

      {/* Actions */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '2px' }}>
        <button onClick={toggleLike} style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '7px 12px', borderRadius: '8px', border: 'none',
          background: liked ? 'rgba(244,63,94,0.08)' : 'transparent',
          color: liked ? '#F43F5E' : 'var(--text-muted)',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { if (!liked) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
          onMouseLeave={e => { if (!liked) e.currentTarget.style.background = liked ? 'rgba(244,63,94,0.08)' : 'transparent'; }}
        >
          <Heart size={15} fill={liked ? '#F43F5E' : 'none'} strokeWidth={liked ? 0 : 2} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>

        <button onClick={loadComments} style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '7px 12px', borderRadius: '8px', border: 'none',
          background: showComments ? 'var(--brand-dim)' : 'transparent',
          color: showComments ? 'var(--brand)' : 'var(--text-muted)',
          fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { if (!showComments) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
          onMouseLeave={e => { if (!showComments) e.currentTarget.style.background = showComments ? 'var(--brand-dim)' : 'transparent'; }}
        >
          <MessageCircle size={15} />
          {post.comments_count > 0 && <span>{post.comments_count}</span>}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '14px 18px', background: 'var(--bg-main)' }}>
          <form onSubmit={submitComment} style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
            <img src={avatarUrl(me)} alt="me"
              style={{ width: '32px', height: '32px', borderRadius: '9px', objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, position: 'relative' }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Write a comment…"
                style={{
                  width: '100%', boxSizing: 'border-box', borderRadius: '10px',
                  padding: '8px 40px 8px 12px', fontSize: '13px', outline: 'none',
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)', fontFamily: 'inherit', fontWeight: 500, transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
              />
              <button type="submit" disabled={submitting || !commentText.trim()} style={{
                position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                width: '26px', height: '26px', borderRadius: '7px', border: 'none',
                background: commentText.trim() ? 'var(--brand)' : 'transparent',
                color: commentText.trim() ? '#fff' : 'var(--text-muted)',
                cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}>
                <Send size={12} />
              </button>
            </div>
          </form>

          {loadingComments ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
              <Loader2 size={18} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', padding: '8px 0', margin: 0 }}>No comments yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <img src={avatarUrl(c.user)} alt={c.user?.name}
                    style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, borderRadius: '10px', borderTopLeftRadius: '3px', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    <p style={{ fontWeight: 700, fontSize: '12px', margin: '0 0 3px', color: 'var(--text-primary)' }}>
                      {c.user?.name}
                      <span style={{ fontWeight: 400, fontSize: '11px', marginLeft: '6px', color: 'var(--text-muted)' }}>{timeAgo(c.created_at)}</span>
                    </p>
                    <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.5, color: 'var(--text-secondary)' }}>{c.content ?? c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Create Post ───────────────────────────────────────────────────────────────
function CreatePost({ onCreated }) {
  const { user }                    = useAuth();
  const [body, setBody]             = useState('');
  const [files, setFiles]           = useState([]);
  const [previews, setPreviews]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused]       = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const fileRef                     = useRef();

  const addFiles = (incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')).slice(0, 4 - files.length);
    if (!valid.length) return;
    setFiles(prev => [...prev, ...valid].slice(0, 4));
    setPreviews(prev => [...prev, ...valid.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' }))].slice(0, 4));
    setFocused(true);
  };

  const removeFile = (i) => {
    URL.revokeObjectURL(previews[i].url);
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!body.trim() && !files.length) || submitting) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('content', body);
      files.forEach(f => fd.append('media[]', f));
      await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      previews.forEach(p => URL.revokeObjectURL(p.url));
      setBody(''); setFiles([]); setPreviews([]); setFocused(false);
      onCreated?.();
    } catch {}
    setSubmitting(false);
  };

  const canSubmit = (body.trim().length > 0 || files.length > 0) && !submitting;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${focused || dragOver ? 'var(--brand)' : 'var(--border-subtle)'}`,
      borderRadius: '16px', overflow: 'hidden',
      boxShadow: focused ? '0 0 0 3px var(--brand-dim)' : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
    >
      <form onSubmit={handleSubmit} style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <img src={avatarUrl(user)} alt="me"
            style={{ width: '38px', height: '38px', borderRadius: '11px', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border-subtle)' }} />
          <textarea value={body} onChange={e => setBody(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { if (!body && !files.length) setFocused(false); }}
            placeholder="Share something with your community..."
            rows={focused ? 3 : 1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', fontSize: '14px', lineHeight: 1.65,
              color: 'var(--text-primary)', fontFamily: 'inherit',
              paddingTop: '8px', transition: 'all 0.2s',
            }}
          />
        </div>

        {previews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: previews.length === 1 ? '1fr' : '1fr 1fr', gap: '4px', marginTop: '12px', marginLeft: '48px', borderRadius: '10px', overflow: 'hidden' }}>
            {previews.map((p, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: previews.length === 1 ? '16/9' : '1/1', overflow: 'hidden', background: 'var(--bg-card-hover)' }}>
                {p.type === 'video'
                  ? <video src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                }
                <button type="button" onClick={() => removeFile(i)} style={{
                  position: 'absolute', top: '5px', right: '5px', width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><X size={11} /></button>
              </div>
            ))}
          </div>
        )}

        {focused && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }}
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={files.length >= 4} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '8px', border: 'none',
                background: files.length > 0 ? 'var(--brand-dim)' : 'var(--bg-card-hover)',
                color: files.length > 0 ? 'var(--brand)' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: 700, cursor: files.length >= 4 ? 'not-allowed' : 'pointer',
                opacity: files.length >= 4 ? 0.4 : 1, transition: 'all 0.15s',
              }}>
                <ImagePlus size={14} />
                {files.length > 0 ? `${files.length}/4` : 'Photo'}
              </button>
            </div>
            <button type="submit" disabled={!canSubmit} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '9px', border: 'none',
              background: canSubmit ? 'var(--brand)' : 'var(--bg-card-hover)',
              color: canSubmit ? '#fff' : 'var(--text-muted)',
              fontSize: '13px', fontWeight: 700,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              opacity: canSubmit ? 1 : 0.5,
              boxShadow: canSubmit ? '0 4px 14px -4px var(--brand-glow)' : 'none',
              transition: 'all 0.2s',
            }}>
              {submitting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '18px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-card-hover)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: '13px', background: 'var(--bg-card-hover)', borderRadius: '6px', width: '35%', marginBottom: '7px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '10px', background: 'var(--bg-card-hover)', borderRadius: '5px', width: '20%', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <div style={{ height: '12px', background: 'var(--bg-card-hover)', borderRadius: '6px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: '12px', background: 'var(--bg-card-hover)', borderRadius: '6px', width: '75%', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  );
}

// ─── Feed Page ─────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const { user }                        = useAuth();
  const [posts, setPosts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);

  const fetchPosts = useCallback(async (pg = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const res  = await api.get(`/posts?page=${pg}`);
      const data = res.data?.data ?? res.data ?? [];
      const meta = res.data;
      setPosts(prev => append ? [...prev, ...data] : data);
      setHasMore(meta?.current_page !== undefined ? meta.current_page < meta.last_page : data.length >= 10);
    } catch {}
    append ? setLoadingMore(false) : setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Salam' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div style={{ maxWidth: '620px', margin: '0 auto' }}>

      {/* Welcome banner */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        borderRadius: '16px', padding: '20px 22px', marginBottom: '14px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '100%', background: 'radial-gradient(circle at 80% 50%, var(--brand-dim) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={avatarUrl(user)} alt="me"
              style={{ width: '48px', height: '48px', borderRadius: '14px', objectFit: 'cover', display: 'block', border: '2px solid var(--border-subtle)' }} />
            <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-card)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.4px', margin: 0, color: 'var(--text-primary)' }}>
              {greeting}, <span style={{ color: 'var(--brand)' }}>{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '3px 0 0', fontWeight: 500 }}>
              What's on your mind today?
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px', background: 'var(--brand-dim)', border: '1px solid rgba(123,179,66,0.2)' }}>
            <Sparkles size={12} color="var(--brand)" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand)' }}>LIVE</span>
          </div>
        </div>
      </div>

      {/* Online Users Strip */}
      <OnlineUsers />

      {/* Composer */}
      <div style={{ marginBottom: '14px' }}>
        <CreatePost onCreated={() => { setPage(1); fetchPosts(1); }} />
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Skeleton /><Skeleton /><Skeleton />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 14px', background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={26} color="var(--brand)" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>No posts yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, margin: 0 }}>Be the first to share something!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {posts.map(post => <PostCard key={post.id} post={post} />)}
          {hasMore && (
            <button onClick={() => { const n = page + 1; setPage(n); fetchPosts(n, true); }} disabled={loadingMore} style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'var(--bg-card)', color: 'var(--brand)',
              fontSize: '13px', fontWeight: 700, cursor: 'pointer',
              border: '1px solid var(--border-subtle)', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              {loadingMore
                ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto' }} />
                : 'Load more posts'
              }
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
      `}</style>
    </div>
  );
}