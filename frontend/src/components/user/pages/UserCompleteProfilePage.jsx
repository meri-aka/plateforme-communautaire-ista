import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, BookOpen, Sparkles, LogOut } from 'lucide-react';
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

  const COLORS = ['#7BB342', '#D4AF37', '#8B5CF6', '#F59E0B', '#F43F5E', '#10B981'];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Light Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none opacity-20" 
           style={{ background: 'radial-gradient(circle, var(--brand-glow) 0%, transparent 70%)' }}/>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] pointer-events-none opacity-20" 
           style={{ background: 'radial-gradient(circle, var(--gold-glow) 0%, transparent 70%)' }}/>

      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--bg-card)] border border-[var(--glass-border)] flex items-center justify-center mb-4 shadow-2xl">
            <BrandLogo size={32} />
          </div>
          <h2 className="text-[10px] font-black text-[var(--brand)] uppercase tracking-[0.3em] mb-1.5">Account Setup</h2>
          <h1 className="text-2xl xl:text-3xl font-black text-[var(--text-primary)] tracking-tight">Final Step</h1>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-[28px] p-6 xl:p-8 shadow-premium backdrop-blur-md relative overflow-hidden">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={14} className="text-[var(--brand)]" />
              <p className="text-[12px] font-bold text-[var(--text-primary)]">Welcome, {user?.name?.split(' ')[0]}</p>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1.5">Select your Filière</h3>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed opacity-80">
              To tailor your experience and connect you with your classmates, please choose your field of study.
            </p>
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 size={28} className="animate-spin text-[var(--brand)]" />
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Fetching courses...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 mb-8">
              {filieres.map((f, i) => {
                const color = COLORS[i % COLORS.length];
                const isSelected = selected === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f.id)}
                    className={`group relative flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-300 text-left border-2 ${
                      isSelected 
                        ? 'bg-[var(--brand-dim)] border-[var(--brand)] shadow-lg' 
                        : 'bg-[var(--bg-card-hover)] border-transparent hover:border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[var(--brand)] shadow-lg' : 'bg-[var(--bg-card)]'
                    }`}>
                      <BookOpen size={18} className={isSelected ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--brand)]'} />
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-bold text-[13px] transition-colors ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                        {f.name}
                      </p>
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{f.code}</p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[var(--brand)] flex items-center justify-center text-white animate-in zoom-in">
                        <ArrowRight size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-3.5">
            <button
              onClick={handleSubmit}
              disabled={!selected || loading}
              className="w-full bg-[var(--brand)] text-white font-black text-[11px] tracking-[0.2em] h-12 rounded-xl shadow-xl shadow-[var(--brand-glow)] hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>JOIN COMMUNITY <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>

            <button
              onClick={async () => { await logout(); navigate('/login'); }}
              className="w-full flex items-center justify-center gap-2 py-1 text-[10px] font-bold text-[var(--text-muted)] hover:text-rose-500 transition-all uppercase tracking-widest"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}
