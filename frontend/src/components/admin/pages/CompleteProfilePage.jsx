import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import BrandLogo from '../common/BrandLogo';
export default function CompleteProfilePage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [filieres, setFilieres]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);

  useEffect(() => {
    api.get('/filieres')
      .then(res => setFilieres(res.data))
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.patch(`/admin/users/${user.id}`, { filiere_id: selected });
      // refresh user in context by re-fetching /me
      const res = await api.get('/me');
      // update context user — re-use existing token
      const token = localStorage.getItem('token');
      localStorage.setItem('token', token);
      // force AuthContext to reload user
      window.location.href = user.role === 'admin' ? '/admin' : '/';
    } catch (err) {
      setLoading(false);
    }
  };

  const COLORS = ['#7BB342', '#1B365D', '#8B5CF6', '#F59E0B', '#F43F5E', '#10B981'];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-main)', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <BrandLogo size={48} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
              ISTA<span style={{ color: 'var(--brand)' }}>Connect</span>
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
              Complete your profile
            </p>
          </div>
        </div>

        <div className="pro-card p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2 tracking-tight">
              Choose your Filière
            </h1>
            <p className="text-[var(--text-muted)] text-sm">
              Welcome, <span className="font-bold text-[var(--text-primary)]">{user?.name}</span>. Select your field of study to continue.
            </p>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[var(--brand)]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 mb-8">
              {filieres.map((f, i) => {
                const color = COLORS[i % COLORS.length];
                const isSelected = selected === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f.id)}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all text-left w-full"
                    style={{
                      background: isSelected ? `${color}15` : 'var(--bg-card-hover)',
                      border: `2px solid ${isSelected ? color : 'var(--border-subtle)'}`,
                      boxShadow: isSelected ? `0 0 20px ${color}20` : 'none',
                    }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                      background: `${color}20`, border: `1px solid ${color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <BookOpen size={20} style={{ color }} />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{f.name}</p>
                      <p className="text-xs text-[var(--text-muted)] font-mono">{f.code}</p>
                    </div>
                    {isSelected && (
                      <div className="ml-auto w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: color }}>
                        <ArrowRight size={12} color="#fff" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selected || loading}
            className="w-full py-4 rounded-xl font-black text-white text-sm uppercase tracking-wider disabled:opacity-40 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--brand)', boxShadow: '0 8px 24px var(--brand-glow)' }}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Saving...</>
              : <>Continue <ArrowRight size={18} /></>
            }
          </button>

          <button
            onClick={async () => { await logout(); navigate('/login'); }}
            className="w-full mt-3 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}