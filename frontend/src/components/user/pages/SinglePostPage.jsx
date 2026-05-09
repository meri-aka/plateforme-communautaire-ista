import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { Heart, MessageCircle, Send, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { resolveAvatar } from '../../../utils/avatarUrl';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const avatarUrl = (u) => resolveAvatar(u, 128);

export default function SinglePostPage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/posts/${id}`),
      api.get(`/posts/${id}/comments`),
    ]).then(([postRes, commentsRes]) => {
      const p = postRes.data?.data ?? postRes.data;
      setPost(p);
      setLiked(p?.is_liked ?? false);
      setLikeCount(p?.likes_count ?? 0);
      setComments(commentsRes.data?.data ?? commentsRes.data ?? []);
    }).catch(() => navigate('/'))
    .finally(() => setLoading(false));
  }, [id, navigate]);

  const toggleLike = async () => {
    const prev = liked;
    setLiked(!prev); setLikeCount(c => prev ? c - 1 : c + 1);
    try { await api.post(`/posts/${id}/like`); }
    catch { setLiked(prev); setLikeCount(c => prev ? c + 1 : c - 1); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, { content: commentText });
      setComments(prev => [...prev, res.data]);
      setCommentText('');
    } catch {}
    setSubmitting(false);
  };

  const deleteComment = async (commentId) => {
    setDeleting(commentId);
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {}
    setDeleting(null);
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <Loader2 size={32} color="var(--brand)" style={{ animation:'spin 1s linear infinite' }}/>
    </div>
  );

  if (!post) return null;

  return (
    <div style={{ maxWidth:'720px', margin:'0 auto', padding:'28px 16px' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)}
        style={{ display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none',
          color:'var(--text-muted)', fontSize:'14px', fontWeight:600, cursor:'pointer', marginBottom:'24px', padding:'0' }}>
        <ArrowLeft size={18}/> Back
      </button>

      {/* Post */}
      <article style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'20px', overflow:'hidden', marginBottom:'24px' }}>
        {/* Author */}
        <div style={{ padding:'20px 24px 16px', display:'flex', alignItems:'center', gap:'14px' }}>
          <Link to={`/profile/${post.user?.id}`} style={{ flexShrink:0 }}>
            <img src={avatarUrl(post.user)} alt={post.user?.name}
              style={{ width:'52px', height:'52px', borderRadius:'14px', objectFit:'cover' }}/>
          </Link>
          <div>
            <Link to={`/profile/${post.user?.id}`} style={{ textDecoration:'none' }}>
              <p style={{ fontWeight:800, fontSize:'16px', color:'var(--text-primary)', margin:0 }}>{post.user?.name}</p>
            </Link>
            <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:'3px 0 0' }}>
              {post.user?.filiere?.name && <span style={{ color:'var(--brand)', fontWeight:600 }}>{post.user.filiere.name} · </span>}
              {timeAgo(post.created_at)}
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'0 24px 20px' }}>
          <p style={{ fontSize:'17px', lineHeight:'1.75', color:'var(--text-secondary)', margin:0, whiteSpace:'pre-wrap' }}>
            {post.content ?? post.body}
          </p>
          {(post.media?.length > 0 || post.image) && (
            <div style={{ marginTop:'16px', borderRadius:'14px', overflow:'hidden' }}>
              <img src={post.media?.[0]?.url ?? post.image} alt="Post" style={{ width:'100%', maxHeight:'480px', objectFit:'cover' }}/>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ padding:'12px 24px', borderTop:'1px solid var(--border-subtle)', borderBottom:'1px solid var(--border-subtle)',
          display:'flex', gap:'20px' }}>
          {likeCount > 0 && (
            <span style={{ fontSize:'13px', color:'var(--text-muted)', fontWeight:500 }}>
              <strong style={{ color:'var(--text-primary)', fontWeight:700 }}>{likeCount}</strong> {likeCount === 1 ? 'like' : 'likes'}
            </span>
          )}
          {comments.length > 0 && (
            <span style={{ fontSize:'13px', color:'var(--text-muted)', fontWeight:500 }}>
              <strong style={{ color:'var(--text-primary)', fontWeight:700 }}>{comments.length}</strong> {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding:'8px 16px', display:'flex', gap:'4px' }}>
          <button onClick={toggleLike}
            style={{ display:'flex', alignItems:'center', gap:'8px', flex:1, justifyContent:'center',
              padding:'10px', borderRadius:'10px', border:'none', cursor:'pointer',
              background: liked?'rgba(244,63,94,0.08)':'transparent',
              color: liked?'#F43F5E':'var(--text-muted)', fontWeight:700, fontSize:'14px', transition:'all 0.2s' }}>
            <Heart size={18} fill={liked?'#F43F5E':'none'}/> Like
          </button>
          <button onClick={() => document.getElementById('comment-input')?.focus()}
            style={{ display:'flex', alignItems:'center', gap:'8px', flex:1, justifyContent:'center',
              padding:'10px', borderRadius:'10px', border:'none', cursor:'pointer',
              background:'transparent', color:'var(--text-muted)', fontWeight:700, fontSize:'14px', transition:'all 0.2s' }}>
            <MessageCircle size={18}/> Comment
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:'20px', padding:'20px 24px' }}>
        <h3 style={{ fontSize:'16px', fontWeight:800, color:'var(--text-primary)', margin:'0 0 20px' }}>
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>

        {/* New Comment */}
        <form onSubmit={submitComment} style={{ display:'flex', gap:'12px', marginBottom:'24px' }}>
          <img src={avatarUrl(me)} alt="me"
            style={{ width:'40px', height:'40px', borderRadius:'10px', objectFit:'cover', flexShrink:0 }}/>
          <div style={{ flex:1, position:'relative' }}>
            <input id="comment-input" value={commentText} onChange={e=>setCommentText(e.target.value)}
              placeholder="Add a comment…"
              style={{ width:'100%', background:'var(--bg-card-hover)', border:'1px solid var(--border-subtle)',
                borderRadius:'12px', padding:'12px 48px 12px 16px', fontSize:'14px',
                color:'var(--text-primary)', outline:'none', transition:'border-color 0.2s' }}
              onFocus={e=>e.target.style.borderColor='var(--brand)'}
              onBlur={e=>e.target.style.borderColor='var(--border-subtle)'}/>
            <button type="submit" disabled={submitting || !commentText.trim()}
              style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)',
                background: commentText.trim()?'var(--brand)':'transparent',
                border:'none', borderRadius:'8px', cursor: commentText.trim()?'pointer':'not-allowed',
                padding:'6px', display:'flex', color:'#fff', transition:'background 0.2s' }}>
              <Send size={15}/>
            </button>
          </div>
        </form>

        {/* Comment List */}
        {comments.length === 0 ? (
          <p style={{ textAlign:'center', color:'var(--text-muted)', padding:'24px 0', fontSize:'14px' }}>
            No comments yet. Be the first!
          </p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ display:'flex', gap:'12px', alignItems:'flex-start' }}>
                <Link to={`/profile/${c.user?.id}`} style={{ flexShrink:0 }}>
                  <img src={avatarUrl(c.user)} alt={c.user?.name}
                    style={{ width:'38px', height:'38px', borderRadius:'10px', objectFit:'cover' }}/>
                </Link>
                <div style={{ flex:1, background:'var(--bg-card-hover)', borderRadius:'12px', padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <Link to={`/profile/${c.user?.id}`} style={{ textDecoration:'none' }}>
                        <span style={{ fontSize:'13px', fontWeight:800, color:'var(--text-primary)' }}>{c.user?.name}</span>
                      </Link>
                      <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{timeAgo(c.created_at)}</span>
                    </div>
                    {(me?.id === c.user?.id || me?.role === 'admin') && (
                      <button onClick={() => deleteComment(c.id)} disabled={deleting === c.id}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'2px',
                          opacity: deleting===c.id ? 0.5 : 1, transition:'color 0.2s' }}
                        onMouseEnter={e=>e.currentTarget.style.color='#F43F5E'}
                        onMouseLeave={e=>e.currentTarget.style.color='var(--text-muted)'}>
                        {deleting === c.id ? <Loader2 size={13} style={{animation:'spin 1s linear infinite'}}/> : <Trash2 size={13}/>}
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize:'14px', color:'var(--text-secondary)', margin:0, lineHeight:'1.6' }}>{c.content ?? c.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
