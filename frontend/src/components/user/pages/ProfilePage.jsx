import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import {
  User, Users, Heart, MessageCircle, UserPlus, UserCheck,
  MapPin, BookOpen, Calendar, Loader2, Camera, CheckCircle, AlertCircle, Settings, X
} from 'lucide-react';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const avatarUrl = (u) => {
  if (!u?.avatar) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name ?? 'U')}&background=7BB342&color=fff&size=256`;
  }
  // If it's a relative path (stored locally), prepend backend storage URL
  if (u.avatar.startsWith('avatars/') || u.avatar.startsWith('http') === false) {
    return `http://localhost:8000/storage/${u.avatar}`;
  }
  return u.avatar;
};

function StatPill({ value, label }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 20px' }}>
      <p style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>{value ?? 0}</p>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
    </div>
  );
}

// Mini toast notification
function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = type === 'success';
  return (
    <div style={{
      position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px',
      padding: '14px 22px', borderRadius: '16px', fontWeight: 700, fontSize: '14px',
      background: isSuccess ? 'linear-gradient(135deg, #1f3315, #2d4a1e)' : 'linear-gradient(135deg, #3d1515, #5c1f1f)',
      color: '#fff', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)',
      border: `1px solid ${isSuccess ? 'rgba(123,179,66,0.4)' : 'rgba(220,80,80,0.4)'}`,
      animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      {isSuccess
        ? <CheckCircle size={18} color="#7BB342" />
        : <AlertCircle size={18} color="#e85555" />
      }
      {message}
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const isOwnProfile = !id || String(id) === String(me?.id);

  const [profile, setProfile]           = useState(null);
  const [posts, setPosts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [following, setFollowing]       = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab]       = useState('posts');

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [toast, setToast]                 = useState(null); // { type, message }
  const fileInputRef = useRef(null);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', filiere_id: '' });
  const [filieres, setFilieres] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setLoading(true);
    setAvatarPreview(null);
    const endpoint = isOwnProfile ? '/me' : `/users/${id}`;
    Promise.all([
      api.get(endpoint),
      api.get(`/posts?user_id=${id || me?.id}`)
    ]).then(([profileRes, postsRes]) => {
      const profileData = profileRes.data?.user ?? profileRes.data;
      setProfile(profileData);
      setFollowing(profileData?.is_following ?? false);
      setPosts(postsRes.data?.data ?? postsRes.data ?? []);
    }).catch((err) => {
      console.error('ProfilePage fetch error:', err);
    }).finally(() => setLoading(false));

    // Fetch filieres for edit modal
    if (isOwnProfile) {
      api.get('/filieres').then(res => setFilieres(res.data)).catch(console.error);
    }
  }, [id, isOwnProfile, me?.id]);

  const toggleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const prev = following;
    setFollowing(!prev);
    try {
      const res = await api.post(`/users/${id}/follow`);
      setFollowing(res.data.following);
      setProfile(p => ({
        ...p,
        followers_count: res.data.following
          ? (p.followers_count ?? 0) + 1
          : (p.followers_count ?? 1) - 1,
      }));
    } catch {
      setFollowing(prev);
    }
    setFollowLoading(false);
  };

  // ── Avatar upload ──────────────────────────────────────────────
  const handleAvatarClick = () => {
    if (isOwnProfile && !uploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Please select a valid image file.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Image must be smaller than 2MB.' });
      return;
    }

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = res.data.user;

      // Sync global auth state so header/sidebar avatars update
      updateUser(updatedUser);

      // Update local profile with the real stored path
      setProfile(p => ({ ...p, avatar: updatedUser.avatar }));
      // Clear optimistic preview — avatarUrl() will now use the real path
      setAvatarPreview(null);
      setToast({ type: 'success', message: 'Profile picture updated!' });
    } catch (err) {
      setAvatarPreview(null);
      const msg = err.response?.data?.message ?? 'Upload failed. Please try again.';
      setToast({ type: 'error', message: msg });
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch('/me', editForm);
      const updatedUser = res.data.user;
      setProfile(p => ({ ...p, ...updatedUser }));
      updateUser(updatedUser); // sync global auth state
      setIsEditing(false);
      setToast({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Failed to update profile.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: profile.name || '',
      bio: profile.bio || '',
      filiere_id: profile.filiere_id || ''
    });
    setIsEditing(true);
  };
  // ──────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Loader2 size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>User not found.</div>
  );

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';

  const displayAvatar = avatarPreview ?? avatarUrl(profile);

  return (
    <>
      {/* Inject toast keyframe once */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px) scale(0.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1);   }
        }
        .avatar-upload-ring:hover .avatar-overlay { opacity: 1 !important; }
      `}</style>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="relative z-10" style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 16px' }}>

        {/* ── Cover + Avatar card ── */}
        <div className="rounded-[24px] overflow-hidden mb-6" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 20px 40px -20px rgba(0,0,0,0.1)'
        }}>
          {/* Cover banner */}
          <div style={{ height: '180px', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1f3315 0%, #111d0b 100%)' }}>
            <div className="mesh-bg absolute inset-0 opacity-50" />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 30% 50%, rgba(123,179,66,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(212,175,55,0.3) 0%, transparent 50%)'
            }} />
          </div>

          <div style={{ padding: '0 32px 32px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-60px', flexWrap: 'wrap', gap: '16px' }}>

              {/* ── Avatar with upload overlay ── */}
              <div
                className="avatar-upload-ring relative"
                onClick={handleAvatarClick}
                style={{ cursor: isOwnProfile ? 'pointer' : 'default', userSelect: 'none' }}
                title={isOwnProfile ? 'Change profile picture' : undefined}
              >
                {/* Hidden file input */}
                {isOwnProfile && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    id="avatar-file-input"
                  />
                )}

                {/* Avatar image */}
                <img
                  src={displayAvatar}
                  alt={profile.name}
                  style={{
                    width: '120px', height: '120px',
                    borderRadius: '24px', objectFit: 'cover',
                    border: '6px solid var(--bg-card)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    transition: 'transform 0.3s ease, filter 0.3s ease',
                    filter: uploading ? 'brightness(0.6)' : 'brightness(1)',
                    display: 'block',
                  }}
                />

                {/* Camera overlay — only on own profile */}
                {isOwnProfile && (
                  <div
                    className="avatar-overlay"
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: '20px',
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '4px',
                      opacity: uploading ? 1 : 0,
                      transition: 'opacity 0.25s ease',
                      pointerEvents: 'none',
                    }}
                  >
                    {uploading
                      ? <Loader2 size={24} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                      : <>
                          <Camera size={22} color="#fff" />
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>CHANGE</span>
                        </>
                    }
                  </div>
                )}

                {/* Online indicator */}
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '28px', height: '28px',
                  background: '#22c55e', borderRadius: '50%',
                  border: '4px solid var(--bg-card)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                </div>
              </div>

              {/* Follow / edit buttons */}
              {!isOwnProfile && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={toggleFollow} disabled={followLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[14px] transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                    style={{
                      background: following ? 'var(--bg-card-hover)' : 'var(--brand)',
                      color: following ? 'var(--text-secondary)' : '#fff',
                      border: following ? '1px solid var(--border-subtle)' : 'none',
                      boxShadow: following ? 'none' : '0 10px 20px -10px var(--brand-glow)'
                    }}>
                    {followLoading ? <Loader2 size={16} className="animate-spin" /> :
                      following ? <><UserCheck size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
                  </button>
                  <Link to={`/messages/${profile.id}`}
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: 'var(--bg-card-hover)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none'
                    }}
                    title="Send Message"
                  >
                    <MessageCircle size={18} />
                  </Link>
                </div>
              )}

              {isOwnProfile && (
                <>
                  <button
                    onClick={openEditModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: 'var(--bg-card-hover)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                    title="Edit Profile Settings"
                  >
                    <Settings size={14} />
                    Edit Profile
                  </button>
                  <label
                    htmlFor="avatar-file-input"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: 'var(--bg-card-hover)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.6 : 1,
                    }}
                    title="Upload a new profile picture"
                  >
                    {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={14} />}
                    {uploading ? 'Uploading…' : 'Change Photo'}
                  </label>
                </>
              )}
            </div>

            {/* Name & meta */}
            <div style={{ marginTop: '20px' }}>
              <h1 className="text-3xl font-black m-0 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {profile.name}
              </h1>
              <div className="flex flex-wrap gap-4 items-center mt-3">
                {profile.filiere?.name && (
                  <span className="flex items-center gap-1.5 text-[14px] font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(123,179,66,0.1)', color: 'var(--brand)' }}>
                    <BookOpen size={16} /> {profile.filiere.name}
                  </span>
                )}
                {joinDate && (
                  <span className="flex items-center gap-1.5 text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    <Calendar size={16} /> Joined {joinDate}
                  </span>
                )}
                {profile.cluster && (
                  <span className="flex items-center gap-1.5 text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={16} /> {profile.cluster}
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="text-[15px] leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="flex rounded-[20px] overflow-hidden mb-6" style={{
          background: 'var(--bg-card)', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px -15px rgba(0,0,0,0.05)'
        }}>
          <div className="flex-1 transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer"><StatPill value={posts.length} label="Posts" /></div>
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '16px 0' }} />
          <div className="flex-1 transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer"><StatPill value={profile.followers_count} label="Followers" /></div>
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '16px 0' }} />
          <div className="flex-1 transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer"><StatPill value={profile.following_count} label="Following" /></div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 mb-8 p-1.5 rounded-[16px] border border-[var(--border-subtle)]" style={{ background: 'var(--bg-card)' }}>
          {['posts', 'about'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 rounded-[12px] font-bold text-[14px] capitalize transition-all duration-300"
              style={{
                background: activeTab === tab ? 'var(--brand)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                boxShadow: activeTab === tab ? '0 4px 15px -5px var(--brand-glow)' : 'none'
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="animate-fade-in">
          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div className="text-center py-16 rounded-[24px]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div className="w-16 h-16 mx-auto rounded-[20px] mb-4 flex items-center justify-center" style={{ background: 'rgba(123,179,66,0.1)' }}>
                  <BookOpen size={32} color="var(--brand)" />
                </div>
                <p className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>No posts yet.</p>
                <p className="text-[14px] mt-1" style={{ color: 'var(--text-muted)' }}>This user hasn't shared anything.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {posts.map(post => (
                  <Link key={post.id} to={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
                    <div className="rounded-[20px] p-6 transition-all duration-300 group" style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 10px 30px -15px rgba(123,179,66,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      <p className="text-[15px] leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {(post.content ?? post.body)?.length > 250 ? (post.content ?? post.body).slice(0, 250) + '…' : (post.content ?? post.body)}
                      </p>
                      <div className="flex gap-6 items-center border-t border-[var(--border-subtle)] pt-4 mt-4">
                        <span className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>{timeAgo(post.created_at)}</span>
                        <span className="flex items-center gap-1.5 text-[13px] font-bold transition-colors group-hover:text-[var(--brand)]" style={{ color: 'var(--text-muted)' }}>
                          <Heart size={15} />{post.likes_count ?? 0}
                        </span>
                        <span className="flex items-center gap-1.5 text-[13px] font-bold transition-colors group-hover:text-[var(--brand)]" style={{ color: 'var(--text-muted)' }}>
                          <MessageCircle size={15} />{post.comments_count ?? 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {activeTab === 'about' && (
            <div className="rounded-[24px] p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <h3 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <User size={20} color="var(--brand)" /> About
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Full Name', value: profile.name },
                  { label: 'Email',     value: profile.email },
                  { label: 'Filière',   value: profile.filiere?.name },
                  { label: 'Cluster',   value: profile.cluster },
                  { label: 'Role',      value: profile.role },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex gap-4 items-center p-4 rounded-[16px] transition-colors hover:bg-[var(--bg-card-hover)]">
                    <span className="text-[13px] font-black uppercase tracking-widest w-[100px] shrink-0" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {isEditing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="animate-fade-in w-full max-w-md rounded-[24px] p-6 shadow-2xl relative" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)'
          }}>
            <button onClick={() => setIsEditing(false)} style={{
              position: 'absolute', top: '24px', right: '24px',
              color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer'
            }} className="hover:text-[var(--text-primary)] transition-colors">
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Edit Profile</h2>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl font-medium outline-none transition-all"
                  style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Bio</label>
                <textarea
                  rows="3"
                  value={editForm.bio}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl font-medium outline-none transition-all resize-none"
                  style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
              </div>

              {me?.role === 'stagiaire' && (
                <div>
                  <label className="block text-[13px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Filière</label>
                  <select
                    value={editForm.filiere_id}
                    onChange={e => setEditForm(f => ({ ...f, filiere_id: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl font-medium outline-none transition-all appearance-none"
                    style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                  >
                    <option value="">Select a Filière</option>
                    {filieres.map(fil => (
                      <option key={fil.id} value={fil.id}>{fil.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 rounded-xl font-bold transition-colors hover:bg-[var(--bg-card-hover)]" style={{ color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={savingProfile} className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100" style={{ background: 'var(--brand)', color: '#fff' }}>
                  {savingProfile ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
