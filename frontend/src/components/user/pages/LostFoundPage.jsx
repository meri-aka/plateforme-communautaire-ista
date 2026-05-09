import { useState, useEffect,  useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { PackageSearch, Plus, X, Loader2, MapPin, Tag, Clock, CheckCircle, AlertCircle, Search } from 'lucide-react';

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const avatarUrl = (u) =>
  u?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name ?? 'U')}&background=7BB342&color=fff&size=128`;

const STATUS_COLORS = {
  open:     { bg:'rgba(123,179,66,0.12)',   text:'#7BB342',  label:'Open'     },
  claimed:  { bg:'rgba(234,179,8,0.12)',    text:'#EAB308',  label:'Claimed'  },
  resolved: { bg:'rgba(34,197,94,0.12)',    text:'#22C55E',  label:'Resolved' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.open;
  return (
    <span style={{ background:s.bg, color:s.text, fontSize:'11px', fontWeight:700,
      padding:'3px 10px', borderRadius:'999px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
      {s.label}
    </span>
  );
}

function ClaimModal({ item, onClose, onClaimed }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { setError('Please describe how this belongs to you.'); return; }
    setSubmitting(true);
    try {
      await api.post(`/lost-found/${item.id}/claim`, { message });
      onClaimed();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to submit claim. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)' }} onClick={onClose}/>
      <div style={{ position:'relative', zIndex:1, background:'var(--bg-card)', borderRadius:'20px', padding:'28px',
        border:'1px solid var(--border-subtle)', width:'100%', maxWidth:'480px',
        boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'18px', fontWeight:800, color:'var(--text-primary)', margin:0 }}>Submit a Claim</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:'4px' }}>
            <X size={20}/>
          </button>
        </div>
        <div style={{ background:'var(--bg-card-hover)', borderRadius:'12px', padding:'14px', marginBottom:'20px', display:'flex', gap:'12px' }}>
          {(item.media?.length > 0 || item.image) && <img src={item.media?.[0]?.url ?? item.image} alt="" style={{ width:'56px', height:'56px', borderRadius:'8px', objectFit:'cover', flexShrink:0 }}/>}
          <div>
            <p style={{ fontWeight:700, color:'var(--text-primary)', margin:'0 0 4px' }}>{item.title}</p>
            <p style={{ fontSize:'13px', color:'var(--text-muted)', margin:0 }}>{item.type === 'lost' ? 'Lost Item' : 'Found Item'}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize:'13px', fontWeight:600, color:'var(--text-secondary)', display:'block', marginBottom:'8px' }}>
            Describe how this belongs to you *
          </label>
          <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4}
            placeholder="Provide details that prove this item belongs to you or that you found it…"
            style={{ width:'100%', background:'var(--bg-card-hover)', border:'1px solid var(--border-subtle)',
              borderRadius:'10px', padding:'12px', fontSize:'14px', color:'var(--text-primary)', outline:'none',
              resize:'vertical', fontFamily:'inherit', lineHeight:'1.6' }}
            onFocus={e=>e.target.style.borderColor='var(--brand)'}
            onBlur={e=>e.target.style.borderColor='var(--border-subtle)'}/>
          {error && <p style={{ color:'#F43F5E', fontSize:'13px', marginTop:'8px' }}>{error}</p>}
          <button type="submit" disabled={submitting}
            style={{ width:'100%', marginTop:'16px', padding:'12px', borderRadius:'12px', border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#7BB342,#9ed44e)', color:'#fff', fontWeight:700, fontSize:'15px',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', transition:'opacity 0.2s' }}>
            {submitting ? <Loader2 size={18} style={{animation:'spin 1s linear infinite'}}/> : <CheckCircle size={18}/>}
            Submit Claim
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateItemModal({ onClose, onCreated }) {
  const [form, setForm]           = useState({ title: '', description: '', type: 'lost', location: '' });
  const [files, setFiles]         = useState([]);
  const [previews, setPreviews]   = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const fileRef                   = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addFiles = (incoming) => {
    const valid = Array.from(incoming)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, 4 - files.length);
    if (!valid.length) return;
    const newFiles    = [...files, ...valid].slice(0, 4);
    const newPreviews = [...previews, ...valid.map(f => URL.createObjectURL(f))].slice(0, 4);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const removeFile = (i) => {
    URL.revokeObjectURL(previews[i]);
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setError('Title and description are required.'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('type',        form.type);
      fd.append('location',    form.location);
      files.forEach(f => fd.append('media[]', f));
      await api.post('/lost-found', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      previews.forEach(p => URL.revokeObjectURL(p));
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create item.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', zIndex: 1, background: 'var(--bg-card)', borderRadius: '20px', padding: '28px',
        border: '1px solid var(--border-subtle)', width: '100%', maxWidth: '520px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Post an Item</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Type Toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card-hover)', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
          {['lost', 'found'].map(t => (
            <button key={t} onClick={() => set('type', t)} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '13px', textTransform: 'capitalize', transition: 'all 0.2s',
              background: form.type === t ? (t === 'lost' ? '#F43F5E' : '#7BB342') : 'transparent',
              color: form.type === t ? '#fff' : 'var(--text-muted)',
            }}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'Title *',   key: 'title',    placeholder: 'e.g. Black backpack, Student ID card…' },
            { label: 'Location',  key: 'location', placeholder: 'e.g. Building A, Cafeteria…' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder}
                style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
            </div>
          ))}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              placeholder="Describe the item in detail — color, brand, distinguishing features…"
              style={{ width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Photos ({files.length}/4)
            </label>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />

            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
                {previews.map((p, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <button type="button" onClick={() => removeFile(i)} style={{
                      position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px',
                      borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {files.length < 4 && (
              <button type="button" onClick={() => fileRef.current?.click()} style={{
                width: '100%', padding: '10px', borderRadius: '10px', border: '2px dashed var(--border-subtle)',
                background: 'var(--bg-card-hover)', color: 'var(--text-muted)', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
              >
                <Plus size={16} /> Add Photos
              </button>
            )}
          </div>

          {error && <p style={{ color: '#F43F5E', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,#7BB342,#9ed44e)', color: '#fff', fontWeight: 700, fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            opacity: submitting ? 0.7 : 1,
          }}>
            {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={18} />}
            Post Item
          </button>
        </form>
      </div>
    </div>
  );
}
function ItemCard({ item, onClaim }) {
  const { user } = useAuth();
  const isOwner = item.user?.id === user?.id;
  const isLost = item.type === 'lost';

  return (
    <div className="group rounded-[24px] overflow-hidden transition-all duration-300 flex flex-col h-full" style={{ 
      background:'var(--bg-card)', border:'1px solid var(--border-subtle)',
    }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border-active)';e.currentTarget.style.boxShadow='0 12px 40px -15px rgba(0,0,0,0.1)';e.currentTarget.style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-subtle)';e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)'}}>
      
      {(item.media?.length > 0 || item.image) ? (
        <div className="relative h-[200px] overflow-hidden bg-[var(--bg-card-hover)]">
          <img src={item.media?.[0]?.url ?? item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
        </div>
      ) : (
        <div className="relative h-[160px] overflow-hidden bg-[var(--bg-card-hover)] flex items-center justify-center">
          <PackageSearch size={40} className="opacity-20" color="var(--brand)" />
        </div>
      )}

      <div className="flex-1 flex flex-col p-6 relative z-10 bg-[var(--bg-card)]">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex gap-2 items-center flex-wrap">
            <span className="text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm" style={{
              background: isLost ? 'rgba(244,63,94,0.1)' : 'rgba(123,179,66,0.1)',
              color: isLost ? '#F43F5E' : '#7BB342',
              border: `1px solid ${isLost ? 'rgba(244,63,94,0.2)' : 'rgba(123,179,66,0.2)'}`
            }}>
              {item.type}
            </span>
            <StatusBadge status={item.status ?? 'open'}/>
          </div>
        </div>

        <h3 className="text-[18px] font-black mb-2 leading-tight" style={{ color:'var(--text-primary)' }}>{item.title}</h3>
        <p className="text-[14px] leading-relaxed mb-5 flex-1" style={{ color:'var(--text-secondary)' }}>
          {item.description?.length > 120 ? item.description.slice(0,120)+'…' : item.description}
        </p>

        <div className="flex flex-wrap gap-3 mb-5 p-3 rounded-[12px] border border-[var(--border-subtle)]" style={{ background: 'var(--bg-card-hover)' }}>
          {item.location && (
            <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color:'var(--text-muted)' }}>
              <MapPin size={14}/> {item.location}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[12px] font-bold" style={{ color:'var(--text-muted)' }}>
            <Clock size={14}/> {timeAgo(item.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-subtle)] mt-auto">
          <img src={avatarUrl(item.user)} alt={item.user?.name}
            className="w-[36px] h-[36px] rounded-[10px] object-cover border border-[var(--border-subtle)]"/>
          <span className="text-[13px] font-bold flex-1" style={{ color:'var(--text-primary)' }}>{item.user?.name}</span>
          {!isOwner && item.status === 'open' && (
            <button onClick={()=>onClaim(item)} className="px-4 py-2 rounded-[10px] text-[13px] font-black tracking-wide transition-colors hover:bg-[var(--brand)] hover:text-white" style={{
              background:'var(--brand-dim)', color:'var(--brand)'
            }}>
              CLAIM
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LostFoundPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [claimTarget, setClaimTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lost-found');
      setItems(res.data?.data ?? res.data ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter(i => {
    const matchesType = filter === 'all' || i.type === filter;
    const matchesSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="relative z-10" style={{ maxWidth:'1000px', margin:'0 auto', padding:'32px 16px' }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-8 md:p-10 rounded-[24px] relative overflow-hidden" style={{
        background: 'var(--bg-card)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.1)'
      }}>
        <div className="absolute top-[-50%] left-[-10%] w-[300px] h-[300px] rounded-full blur-[60px] opacity-[0.05]" style={{ background: '#F43F5E' }} />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3" style={{ color:'var(--text-primary)' }}>
            <PackageSearch size={32} color="var(--brand)" /> Lost &amp; Found
          </h1>
          <p className="text-[15px] font-medium" style={{ color:'var(--text-muted)' }}>
            Help return lost items to their owners.
          </p>
        </div>
        <button onClick={()=>setShowCreate(true)}
          className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[14px] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          style={{ background:'var(--brand)', color:'#fff', boxShadow:'0 10px 20px -10px var(--brand-glow)' }}>
          <Plus size={18}/> Post an Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search for items…"
            className="w-full rounded-[16px] py-3.5 pr-4 pl-12 text-[14px] outline-none transition-all duration-300 font-medium"
            style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)', color:'var(--text-primary)', boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)' }}
            onFocus={e=>{e.target.style.borderColor='var(--brand)';e.target.style.boxShadow='0 0 0 4px var(--brand-dim)';}}
            onBlur={e=>{e.target.style.borderColor='var(--border-subtle)';e.target.style.boxShadow='0 4px 20px -10px rgba(0,0,0,0.05)';}}/>
        </div>
        <div className="flex gap-2 p-1.5 rounded-[16px] border border-[var(--border-subtle)]" style={{ background:'var(--bg-card)' }}>
          {['all','lost','found'].map(f => (
            <button key={f} onClick={()=>setFilter(f)}
              className="px-6 py-2 rounded-[12px] font-bold text-[14px] capitalize transition-all duration-300"
              style={{
                background: filter===f ? 'var(--brand)' : 'transparent',
                color: filter===f ? '#fff' : 'var(--text-muted)',
                boxShadow: filter===f ? '0 4px 15px -5px var(--brand-glow)' : 'none'
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i=>(
            <div key={i} className="animate-pulse rounded-[24px] h-[360px]" style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)' }}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-[24px]" style={{ background:'var(--bg-card)', border:'1px solid var(--border-subtle)' }}>
          <div className="w-20 h-20 mx-auto rounded-[24px] mb-6 flex items-center justify-center" style={{ background: 'rgba(123,179,66,0.1)' }}>
            <PackageSearch size={40} color="var(--brand)"/>
          </div>
          <p className="text-xl font-black mb-2" style={{ color:'var(--text-primary)' }}>No items found</p>
          <p className="font-medium" style={{ color:'var(--text-muted)' }}>Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => <ItemCard key={item.id} item={item} onClaim={setClaimTarget}/>)}
        </div>
      )}

      {claimTarget && <ClaimModal item={claimTarget} onClose={()=>setClaimTarget(null)} onClaimed={fetchItems}/>}
      {showCreate && <CreateItemModal onClose={()=>setShowCreate(false)} onCreated={fetchItems}/>}
    </div>
  );
}
