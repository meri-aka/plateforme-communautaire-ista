import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { User, Users, Heart, MessageCircle, UserPlus, UserCheck, MapPin, BookOpen, Calendar, Loader2 } from 'lucide-react';
const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const avatarUrl = (u) =>
  u?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name ?? 'U')}&background=7BB342&color=fff&size=128`;

function StatPill({ value, label }) {
  return (
    <div style={{ textAlign:'center', padding:'12px 20px' }}>
      <p style={{ fontSize:'22px', fontWeight:900, color:'var(--text-primary)', margin:0 }}>{value ?? 0}</p>
      <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:'4px 0 0', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const isOwnProfile = !id || String(id) === String(me?.id);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    setLoading(true);
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
      console.error("ProfilePage fetch error:", err);
    }).finally(() => setLoading(false));
  }, [id, isOwnProfile, me?.id]);

  const toggleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const prev = following;
    setFollowing(!prev);
    try { await api.post(`/users/${id}/follow`); }
    catch { setFollowing(prev); }
    setFollowLoading(false);
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <Loader2 size={32} color="var(--brand)" style={{ animation:'spin 1s linear infinite' }} />
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign:'center', padding:'64px', color:'var(--text-muted)' }}>User not found.</div>
  );

  const joinDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month:'long', year:'numeric' }) : '';

  return (
    <div className="relative z-10" style={{ maxWidth:'760px', margin:'0 auto', padding:'32px 16px' }}>
      {/* Cover + Avatar */}
      <div className="rounded-[24px] overflow-hidden mb-6" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 20px 40px -20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ height:'180px', position:'relative', overflow:'hidden', background:'linear-gradient(135deg, #1f3315 0%, #111d0b 100%)' }}>
          <div className="mesh-bg absolute inset-0 opacity-50" />
          <div style={{
            position:'absolute', inset:0,
            background:'radial-gradient(circle at 30% 50%, rgba(123,179,66,0.4) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(212,175,55,0.3) 0%, transparent 50%)'
          }}/>
        </div>

        <div style={{ padding:'0 32px 32px', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:'-60px', flexWrap:'wrap', gap:'16px' }}>
            <div className="relative group">
              <img src={avatarUrl(profile)} alt={profile.name}
                className="w-[120px] h-[120px] rounded-[24px] object-cover border-[6px] border-[var(--bg-card)] shadow-xl transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-[var(--bg-card)] shadow-lg flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {!isOwnProfile && (
              <button onClick={toggleFollow} disabled={followLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[14px] transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                style={{
                  background: following ? 'var(--bg-card-hover)' : 'var(--brand)',
                  color: following ? 'var(--text-secondary)' : '#fff',
                  border: following ? '1px solid var(--border-subtle)' : 'none',
                  boxShadow: following ? 'none' : '0 10px 20px -10px var(--brand-glow)'
                }}>
                {followLoading ? <Loader2 size={16} className="animate-spin"/> :
                  following ? <><UserCheck size={16}/> Following</> : <><UserPlus size={16}/> Follow</>}
              </button>
            )}
          </div>

          <div style={{ marginTop:'20px' }}>
            <h1 className="text-3xl font-black m-0 tracking-tight" style={{ color:'var(--text-primary)' }}>
              {profile.name}
            </h1>
            <div className="flex flex-wrap gap-4 items-center mt-3">
              {profile.filiere?.name && (
                <span className="flex items-center gap-1.5 text-[14px] font-bold px-3 py-1 rounded-lg" style={{ background: 'rgba(123,179,66,0.1)', color:'var(--brand)' }}>
                  <BookOpen size={16}/> {profile.filiere.name}
                </span>
              )}
              {joinDate && (
                <span className="flex items-center gap-1.5 text-[14px] font-medium" style={{ color:'var(--text-muted)' }}>
                  <Calendar size={16}/> Joined {joinDate}
                </span>
              )}
              {profile.cluster && (
                <span className="flex items-center gap-1.5 text-[14px] font-medium" style={{ color:'var(--text-muted)' }}>
                  <MapPin size={16}/> {profile.cluster}
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-[15px] leading-relaxed mt-4" style={{ color:'var(--text-secondary)' }}>{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex rounded-[20px] overflow-hidden mb-6" style={{
        background:'var(--bg-card)', border:'1px solid var(--glass-border)', boxShadow: '0 10px 30px -15px rgba(0,0,0,0.05)'
      }}>
        <div className="flex-1 transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer"><StatPill value={posts.length} label="Posts" /></div>
        <div style={{ width:'1px', background:'var(--border-subtle)', margin:'16px 0' }}/>
        <div className="flex-1 transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer"><StatPill value={profile.followers_count} label="Followers" /></div>
        <div style={{ width:'1px', background:'var(--border-subtle)', margin:'16px 0' }}/>
        <div className="flex-1 transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer"><StatPill value={profile.following_count} label="Following" /></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1.5 rounded-[16px] border border-[var(--border-subtle)]" style={{ background:'var(--bg-card)' }}>
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

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'posts' && (
          posts.length === 0 ? (
            <div className="text-center py-16 rounded-[24px]" style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)' }}>
              <div className="w-16 h-16 mx-auto rounded-[20px] mb-4 flex items-center justify-center" style={{ background: 'rgba(123,179,66,0.1)' }}>
                <BookOpen size={32} color="var(--brand)"/>
              </div>
              <p className="font-bold text-[16px]" style={{ color:'var(--text-primary)' }}>No posts yet.</p>
              <p className="text-[14px] mt-1" style={{ color:'var(--text-muted)' }}>This user hasn't shared anything.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {posts.map(post => (
                <Link key={post.id} to={`/posts/${post.id}`} style={{ textDecoration:'none' }}>
                  <div className="rounded-[20px] p-6 transition-all duration-300 group" style={{
                    background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand)';e.currentTarget.style.boxShadow='0 10px 30px -15px rgba(123,179,66,0.2)';e.currentTarget.style.transform='translateY(-2px)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-subtle)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)'}}>
                    <p className="text-[15px] leading-relaxed mb-4" style={{ color:'var(--text-secondary)' }}>
                      {(post.content ?? post.body)?.length > 250 ? (post.content ?? post.body).slice(0,250)+'…' : (post.content ?? post.body)}
                    </p>
                    <div className="flex gap-6 items-center border-t border-[var(--border-subtle)] pt-4 mt-4">
                      <span className="text-[13px] font-medium" style={{ color:'var(--text-muted)' }}>{timeAgo(post.created_at)}</span>
                      <span className="flex items-center gap-1.5 text-[13px] font-bold transition-colors group-hover:text-[var(--brand)]" style={{ color:'var(--text-muted)' }}>
                        <Heart size={15}/>{post.likes_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5 text-[13px] font-bold transition-colors group-hover:text-[var(--brand)]" style={{ color:'var(--text-muted)' }}>
                        <MessageCircle size={15}/>{post.comments_count ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === 'about' && (
          <div className="rounded-[24px] p-8" style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)' }}>
            <h3 className="text-xl font-black mb-6 flex items-center gap-2" style={{ color:'var(--text-primary)' }}>
              <User size={20} color="var(--brand)"/> About
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { label:'Full Name', value: profile.name },
                { label:'Email', value: profile.email },
                { label:'Filière', value: profile.filiere?.name },
                { label:'Cluster', value: profile.cluster },
                { label:'Role', value: profile.role },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex gap-4 items-center p-4 rounded-[16px] transition-colors hover:bg-[var(--bg-card-hover)]">
                  <span className="text-[13px] font-black uppercase tracking-widest w-[100px] shrink-0" style={{ color:'var(--text-muted)' }}>{row.label}</span>
                  <span className="text-[15px] font-bold" style={{ color:'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
