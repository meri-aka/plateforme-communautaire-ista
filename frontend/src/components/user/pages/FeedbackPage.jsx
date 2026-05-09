import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import { MessageSquare, Send, Server, BookOpen, Briefcase, HelpCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const CATEGORIES = [
  { id: 'infrastructure', label: 'Infrastructure', icon: Server, desc: 'Wi-Fi, Classrooms, Hardware', color: '#8B5CF6' },
  { id: 'teaching', label: 'Teaching', icon: BookOpen, desc: 'Courses, Instructors, Materials', color: '#10B981' },
  { id: 'administration', label: 'Admin', icon: Briefcase, desc: 'Schedules, Documents, Management', color: '#F59E0B' },
  { id: 'other', label: 'Other', icon: HelpCircle, desc: 'General feedback & suggestions', color: '#7BB342' },
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('other');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || loading) return;
    
    setLoading(true);
    try {
      await api.post('/feedbacks', { content, category });
      setSuccess(true);
      setContent('');
      setCategory('other');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden" style={{ background: 'var(--bg-main)', padding: '40px 24px' }}>
      <div className="mesh-bg absolute inset-0 opacity-40" />
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatOrb { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }
      `}</style>
      
      {/* Decorative Orbs */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none opacity-20"
           style={{ background: 'var(--brand)', animation: 'floatOrb 10s ease-in-out infinite' }} />
      <div className="absolute bottom-[20%] right-[15%] w-[250px] h-[250px] rounded-full blur-[60px] pointer-events-none opacity-20"
           style={{ background: '#8B5CF6', animation: 'floatOrb 8s ease-in-out infinite 2s' }} />

      <div className="max-w-[700px] mx-auto relative z-10" style={{ animation: 'slideUpFade 0.6s ease-out' }}>
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
               style={{ background: 'rgba(123,179,66,0.1)', border: '1px solid rgba(123,179,66,0.3)' }}>
             <Sparkles size={16} color="var(--brand)"/>
             <span className="text-[11px] font-black text-[var(--brand)] tracking-widest uppercase">Your Voice Matters</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Help us improve <span style={{ color: 'var(--brand)' }}>ISTA.</span>
          </h1>
          <p className="text-[16px] text-[var(--text-secondary)] max-w-[500px] mx-auto leading-relaxed font-medium">
            Report issues, suggest new features, or tell us what you love. Your feedback goes directly to the administration.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-[24px] overflow-hidden"
             style={{ 
               background: 'var(--bg-card)', 
               border: '1px solid var(--glass-border)',
               boxShadow: 'var(--shadow-premium)',
               backdropFilter: 'blur(20px)'
             }}>
          
          {success ? (
            <div className="p-12 text-center" style={{ animation: 'slideUpFade 0.5s' }}>
              <div className="w-[80px] h-[80px] rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">Feedback Sent!</h2>
              <p className="text-[var(--text-secondary)] max-w-[300px] mx-auto">
                Thank you, {user?.name?.split(' ')[0]}. We appreciate you taking the time to help us grow.
              </p>
              <button onClick={() => setSuccess(false)}
                      className="mt-8 px-8 py-3 rounded-xl font-bold text-[14px] transition-all"
                      style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 md:p-10">
              
              {/* Category Selection */}
              <div className="mb-8">
                <label className="block text-[12px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 ml-1">
                  What is this about?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CATEGORIES.map(cat => {
                    const isSel = category === cat.id;
                    const Icon = cat.icon;
                    return (
                      <div key={cat.id} onClick={() => setCategory(cat.id)}
                           className="group flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300"
                           style={{
                             background: isSel ? 'var(--brand-dim)' : 'var(--bg-card-hover)',
                             border: `1px solid ${isSel ? 'var(--brand)' : 'var(--border-subtle)'}`,
                             transform: isSel ? 'scale(1.02)' : 'scale(1)'
                           }}>
                        <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center shrink-0 transition-colors"
                             style={{ background: isSel ? cat.color : 'rgba(0,0,0,0.05)', color: isSel ? '#fff' : cat.color }}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-[14px] mb-1" style={{ color: isSel ? 'var(--brand)' : 'var(--text-primary)' }}>
                            {cat.label}
                          </p>
                          <p className="text-[11px] font-medium text-[var(--text-muted)] leading-tight">{cat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Input */}
              <div className="mb-8 relative group">
                <label className="absolute -top-3 left-4 bg-[var(--bg-card)] px-2 text-[10px] font-black text-[var(--brand)] uppercase tracking-widest z-10 transition-colors">
                  Your Message
                </label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your issue, idea, or feedback in detail..."
                  className="w-full min-h-[160px] p-5 rounded-2xl outline-none resize-y transition-all duration-300 font-medium leading-relaxed"
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 4px var(--brand-dim)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border-subtle)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={!content.trim() || loading}
                      className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-[15px] tracking-wide transition-all duration-300 group overflow-hidden relative"
                      style={{
                        background: content.trim() ? 'var(--brand)' : 'var(--bg-card-hover)',
                        color: content.trim() ? '#fff' : 'var(--text-muted)',
                        boxShadow: content.trim() ? '0 10px 25px -5px var(--brand-glow)' : 'none',
                        cursor: content.trim() ? 'pointer' : 'not-allowed',
                      }}>
                {content.trim() && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                )}
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className={content.trim() ? 'group-hover:translate-x-1 transition-transform' : ''} />}
                {loading ? 'SUBMITTING...' : 'SEND FEEDBACK'}
              </button>

            </form>
          )}
        </div>
        
        <p className="text-center text-[12px] font-medium text-[var(--text-muted)] mt-8">
          All feedback is reviewed by the administration. <br className="sm:hidden"/> Thanks for making ISTA better!
        </p>

      </div>
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
    </div>
  );
}
