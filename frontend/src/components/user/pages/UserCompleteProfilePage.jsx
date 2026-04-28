import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';

import BrandLogo from '../../admin/common/BrandLogo';

export default function UserCompleteProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [filieres, setFilieres]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);

  useEffect(() => {
    api.get('/filieres')
      .then(res => setFilieres(res.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.patch('/me', { filiere_id: selected });
      window.location.href = '/feed';
    } catch (err) {
      setLoading(false);
    }
  };

  const COLORS = ['#7BB342', '#1B365D', '#8B5CF6', '#F59E0B', '#F43F5E', '#10B981'];

  return (
    <div className="relative overflow-hidden" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-main)', padding: '24px',
    }}>
      <div className="mesh-bg absolute inset-0 opacity-40 pointer-events-none" />
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="relative z-10" style={{ width: '100%', maxWidth: '560px', animation: 'fadeIn 0.6s ease-out' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center"
               style={{ background: 'rgba(123, 179, 66, 0.1)', border: '1px solid rgba(123, 179, 66, 0.3)', boxShadow: '0 0 20px rgba(123,179,66,0.15)' }}>
            <BrandLogo size={32} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-1px' }}>
            ISTA<span style={{ color: 'var(--brand)' }}>Connect</span>
          </h2>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '24px', padding: '32px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              Choose your Filière
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Welcome, <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</span>. Please select your field of study to join your community.
            </p>
          </div>

          {fetching ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <Loader2 size={32} color="var(--brand)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
              {filieres.map((f, i) => {
                const color = COLORS[i % COLORS.length];
                const isSelected = selected === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '16px',
                      textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                      background: isSelected ? `${color}15` : 'var(--bg-card-hover)',
                      border: `2px solid ${isSelected ? color : 'var(--border-subtle)'}`,
                      boxShadow: isSelected ? `0 4px 20px ${color}15` : 'none',
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                      background: `${color}20`, border: `1px solid ${color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <BookOpen size={18} style={{ color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>{f.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0', fontFamily: 'monospace' }}>{f.code}</p>
                    </div>
                    {isSelected && (
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            style={{
              width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: selected ? 'pointer' : 'not-allowed',
              background: selected ? 'linear-gradient(135deg, #7BB342 0%, #9ed44e 100%)' : 'var(--bg-card-hover)',
              color: selected ? '#fff' : 'var(--text-muted)',
              fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              transition: 'all 0.25s', opacity: loading ? 0.7 : 1,
              boxShadow: selected ? '0 8px 24px rgba(123,179,66,0.3)' : 'none',
            }}
          >
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <>Continue <ArrowRight size={18} /></>}
          </button>

          <button
            onClick={async () => { await logout(); navigate('/login'); }}
            style={{
              width: '100%', marginTop: '16px', padding: '10px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
