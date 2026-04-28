import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import {
  Heart, MessageCircle, Send, Loader2, BookOpen,
  ImagePlus, X, Image as ImageIcon, ChevronLeft, ChevronRight
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const avatarUrl = (u) =>
  u?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name ?? 'U')}&background=7BB342&color=fff&size=128`;

// Make sure media URLs are absolute
const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

// ─── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ media, index, onClose }) {
  const [current, setCurrent] = useState(index);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent(c => Math.max(0, c - 1));
      if (e.key === 'ArrowRight') setCurrent(c => Math.min(media.length - 1, c + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [media.length, onClose]);

  const item = media[current];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)', border: 'none',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <X size={18} />
      </button>

      {/* Prev */}
      {current > 0 && (
        <button
          onClick={e => { e.stopPropagation(); setCurrent(c => c - 1); }}
          style={{
            position: 'absolute', left: '20px',
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', border: 'none',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Media */}
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh' }}>
        {item?.type === 'video' ? (
          <video
            src={resolveUrl(item.url)}
            controls
            style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: '12px', display: 'block' }}
          />
        ) : (
          <img
            src={resolveUrl(item?.url)}
            alt=""
            style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '12px', display: 'block' }}
          />
        )}
      </div>

      {/* Next */}
      {current < media.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); setCurrent(c => c + 1); }}
          style={{
            position: 'absolute', right: '20px',
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', border: 'none',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Counter */}
      {media.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '20px',
          fontSize: '13px', fontWeight: 600,
          color: 'rgba(255,255,255,0.5)',
        }}>
          {current + 1} / {media.length}
        </div>
      )}
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
        .media-grid-1 { display: grid; grid-template-columns: 1fr; }
        .media-grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .media-grid-3 { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
        .media-grid-4 { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
        .media-grid-3 .media-item-0 { grid-row: 1 / 3; }
        .media-item { position: relative; overflow: hidden; background: var(--bg-card-hover); cursor: pointer; }
        .media-item img, .media-item video { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s; }
        .media-item:hover img, .media-item:hover video { transform: scale(1.04); }
        .media-grid-1 .media-item { aspect-ratio: 16/9; }
        .media-grid-2 .media-item { aspect-ratio: 4/3; }
        .media-grid-3 .media-item-0 { aspect-ratio: auto; min-height: 240px; }
        .media-grid-3 .media-item:not(.media-item-0) { aspect-ratio: 1/1; }
        .media-grid-4 .media-item { aspect-ratio: 1/1; }
      `}</style>

      <div
        className={`media-grid-${count}`}
        style={{ gap: '3px', borderRadius: '14px', overflow: 'hidden', marginTop: '14px' }}
      >
        {media.slice(0, 4).map((m, i) => (
          <div
            key={i}
            className={`media-item media-item-${i}`}
            onClick={() => setLightboxIndex(i)}
          >
            {m.type === 'video' ? (
              <video src={resolveUrl(m.url)} />
            ) : (
              <img src={resolveUrl(m.url)} alt="" />
            )}
            {i === 3 && extra > 0 && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', fontWeight: 900, color: '#fff',
              }}>
                +{extra}
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          media={media}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

// ─── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post }) {
  const { user: me } = useAuth();
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes_count ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setComments(prev => [res.data, ...prev]);
      setCommentText('');
    } catch {}
    setSubmitting(false);
  };

  // Normalize media — handle both media array and legacy post.image
  const media = Array.isArray(post.media) && post.media.length > 0
    ? post.media
    : post.image
      ? [{ url: post.image, type: 'image' }]
      : [];

  return (
    <article
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-active)';
        e.currentTarget.style.boxShadow = '0 8px 32px -12px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to={`/profile/${post.user?.id}`} style={{ flexShrink: 0 }}>
          <img
            src={avatarUrl(post.user)}
            alt={post.user?.name}
            style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover', display: 'block' }}
          />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/profile/${post.user?.id}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontWeight: 700, fontSize: '15px', margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {post.user?.name}
            </p>
          </Link>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 500 }}>
            {post.user?.filiere?.name && (
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{post.user.filiere.name} · </span>
            )}
            {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '14px 20px 18px' }}>
        {(post.content ?? post.body) && (
          <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: '15px', lineHeight: 1.65, margin: 0, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {post.content ?? post.body}
            </p>
          </Link>
        )}
        <MediaGrid media={media} />
      </div>

      {/* Actions */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex', gap: '4px',
        background: 'rgba(0,0,0,0.015)',
      }}>
        <button
          onClick={toggleLike}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '10px', border: 'none',
            background: liked ? 'rgba(244,63,94,0.08)' : 'transparent',
            color: liked ? '#F43F5E' : 'var(--text-muted)',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!liked) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
          onMouseLeave={e => { if (!liked) e.currentTarget.style.background = 'transparent'; }}
        >
          <Heart size={16} fill={liked ? '#F43F5E' : 'none'} strokeWidth={liked ? 0 : 2} />
          {likeCount > 0 && likeCount}
        </button>

        <button
          onClick={loadComments}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '10px', border: 'none',
            background: showComments ? 'rgba(123,179,66,0.08)' : 'transparent',
            color: showComments ? 'var(--brand)' : 'var(--text-muted)',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!showComments) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
          onMouseLeave={e => { if (!showComments) e.currentTarget.style.background = 'transparent'; }}
        >
          <MessageCircle size={16} />
          {post.comments_count > 0 && post.comments_count}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '18px 20px', background: 'var(--bg-main)' }}>
          <form onSubmit={submitComment} style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <img
              src={avatarUrl(me)} alt="me"
              style={{ width: '36px', height: '36px', borderRadius: '11px', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  borderRadius: '12px', padding: '10px 44px 10px 14px',
                  fontSize: '13px', outline: 'none',
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)', fontFamily: 'inherit', fontWeight: 500,
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                style={{
                  position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                  width: '28px', height: '28px', borderRadius: '8px', border: 'none',
                  background: commentText.trim() ? 'var(--brand)' : 'transparent',
                  color: commentText.trim() ? '#fff' : 'var(--text-muted)',
                  cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                <Send size={13} />
              </button>
            </div>
          </form>

          {loadingComments ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
              <Loader2 size={20} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : comments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, padding: '12px 0', margin: 0 }}>
              No comments yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <img
                    src={avatarUrl(c.user)} alt={c.user?.name}
                    style={{ width: '32px', height: '32px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{
                    flex: 1, borderRadius: '12px', borderTopLeftRadius: '4px',
                    padding: '10px 14px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  }}>
                    <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 4px', color: 'var(--text-primary)' }}>
                      {c.user?.name}
                      <span style={{ fontWeight: 500, fontSize: '11px', marginLeft: '8px', color: 'var(--text-muted)' }}>
                        {timeAgo(c.created_at)}
                      </span>
                    </p>
                    <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                      {c.content ?? c.body}
                    </p>
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
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const addFiles = (incoming) => {
    const valid = Array.from(incoming)
      .filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .slice(0, 4 - files.length);
    if (!valid.length) return;
    const newFiles = [...files, ...valid].slice(0, 4);
    const newPreviews = [
      ...previews,
      ...valid.map(f => ({ url: URL.createObjectURL(f), type: f.type.startsWith('video') ? 'video' : 'image' }))
    ].slice(0, 4);
    setFiles(newFiles);
    setPreviews(newPreviews);
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
      await api.post('/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // cleanup previews
      previews.forEach(p => URL.revokeObjectURL(p.url));
      setBody('');
      setFiles([]);
      setPreviews([]);
      setFocused(false);
      onCreated?.();
    } catch {}
    setSubmitting(false);
  };

  const canSubmit = (body.trim().length > 0 || files.length > 0) && !submitting;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${focused || dragOver ? 'var(--brand)' : 'var(--border-subtle)'}`,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: focused ? '0 8px 32px -8px rgba(123,179,66,0.15)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
    >
      <form onSubmit={handleSubmit} style={{ padding: '18px 20px' }}>

        {/* Composer row */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <img
            src={avatarUrl(user)} alt="me"
            style={{ width: '44px', height: '44px', borderRadius: '14px', objectFit: 'cover', flexShrink: 0 }}
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { if (!body && !files.length) setFocused(false); }}
            placeholder="What's on your mind? Share with the ISTA community..."
            rows={focused ? 3 : 1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', fontSize: '15px', lineHeight: 1.6,
              color: 'var(--text-primary)', fontFamily: 'inherit',
              paddingTop: '10px', transition: 'all 0.2s',
            }}
          />
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: previews.length === 1 ? '1fr' : '1fr 1fr',
            gap: '6px',
            marginTop: '14px',
            marginLeft: '56px',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {previews.map((p, i) => (
              <div key={i} style={{
                position: 'relative',
                aspectRatio: previews.length === 1 ? '16/9' : '1/1',
                overflow: 'hidden',
                background: 'var(--bg-card-hover)',
              }}>
                {p.type === 'video' ? (
                  <video src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: 'rgba(0,0,0,0.65)', border: 'none',
                    color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Drag hint */}
        {dragOver && previews.length < 4 && (
          <div style={{
            marginTop: '12px', marginLeft: '56px',
            border: '2px dashed var(--brand)', borderRadius: '12px',
            padding: '20px', textAlign: 'center',
            color: 'var(--brand)', fontSize: '13px', fontWeight: 700,
            background: 'rgba(123,179,66,0.04)',
          }}>
            <ImageIcon size={22} style={{ margin: '0 auto 6px', display: 'block' }} />
            Drop photos here
          </div>
        )}

        {/* Bottom bar */}
        {focused && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '14px', paddingTop: '14px',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={files.length >= 4}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '10px', border: 'none',
                  background: files.length > 0 ? 'rgba(123,179,66,0.1)' : 'var(--bg-card-hover)',
                  color: files.length > 0 ? 'var(--brand)' : 'var(--text-muted)',
                  fontSize: '13px', fontWeight: 700,
                  cursor: files.length >= 4 ? 'not-allowed' : 'pointer',
                  opacity: files.length >= 4 ? 0.45 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <ImagePlus size={16} />
                {files.length > 0 ? `${files.length}/4 photos` : 'Photo'}
              </button>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 22px', borderRadius: '11px', border: 'none',
                background: canSubmit ? 'var(--brand)' : 'var(--bg-card-hover)',
                color: canSubmit ? '#fff' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: 800,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? 1 : 0.5,
                boxShadow: canSubmit ? '0 6px 20px -6px rgba(123,179,66,0.5)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {submitting
                ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                : <Send size={15} />
              }
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
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
      borderRadius: '20px', padding: '20px',
    }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'var(--bg-card-hover)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: '14px', background: 'var(--bg-card-hover)', borderRadius: '7px', width: '35%', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: '11px', background: 'var(--bg-card-hover)', borderRadius: '5px', width: '20%', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      <div style={{ height: '13px', background: 'var(--bg-card-hover)', borderRadius: '7px', marginBottom: '10px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ height: '13px', background: 'var(--bg-card-hover)', borderRadius: '7px', width: '70%', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  );
}

// ─── Feed Page ─────────────────────────────────────────────────────────────────
export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = useCallback(async (pg = 1, append = false) => {
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const res = await api.get(`/posts?page=${pg}`);
      const data = res.data?.data ?? res.data ?? [];
      const meta = res.data?.meta ?? res.data;
      setPosts(prev => append ? [...prev, ...data] : data);
      setHasMore(
        meta?.current_page !== undefined
          ? meta.current_page < meta.last_page
          : data.length >= 10
      );
    } catch {}
    append ? setLoadingMore(false) : setLoading(false);
  }, []);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '24px 16px' }}>

      {/* Greeting card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px', padding: '24px',
        marginBottom: '16px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,179,66,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarUrl(user)} alt="me"
              style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: '-2px', right: '-2px',
              width: '14px', height: '14px', borderRadius: '50%',
              background: '#22c55e', border: '2px solid var(--bg-card)',
            }} />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px', margin: 0, color: 'var(--text-primary)' }}>
              Salam, <span style={{ color: 'var(--brand)' }}>{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0', fontWeight: 500 }}>
              What's happening in your community today?
            </p>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div style={{ marginBottom: '20px' }}>
        <CreatePost onCreated={() => { setPage(1); fetchPosts(1); }} />
      </div>

      {/* Posts list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Skeleton /><Skeleton /><Skeleton />
        </div>
      ) : posts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 24px',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: '20px',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 16px',
            background: 'rgba(123,179,66,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={32} color="var(--brand)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 8px', color: 'var(--text-primary)' }}>No posts yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, margin: 0 }}>Be the first to share something!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map(post => <PostCard key={post.id} post={post} />)}
          {hasMore && (
            <button
              onClick={() => { const n = page + 1; setPage(n); fetchPosts(n, true); }}
              disabled={loadingMore}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: 'var(--bg-card)', color: 'var(--brand)',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                border: '1px solid var(--border-subtle)', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >S
              {loadingMore
                ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto' }} />
                : 'Load more'
              }
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}