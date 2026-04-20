import { useState } from 'react';
import { 
  Search as SearchIcon, Download, Check, MessageSquare, AlertCircle, 
  Star, Reply, Send, Bug, Lightbulb, BookOpen, Filter, 
  Clock, ChevronLeft, ChevronRight, MoreVertical 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';

export default function FeedbackPage() {
  const { t } = useTranslation();

  const mockFeedback = [
    { id: 1, author: 'Ahmed M.',  avatar: 'https://i.pravatar.cc/150?img=11', module: 'Laravel — Routing',      rating: 5, status: 'resolved',    date: 'Jan 14, 2025',  category: t('feedback.categories.experience'), comment: t('feedback.mock.c1') },
    { id: 2, author: 'Sara A.',   avatar: 'https://i.pravatar.cc/150?img=5',  module: t('nav.lost_found'),        rating: 2, status: 'open',        date: 'Jan 15, 2025',  category: t('feedback.categories.bug'), comment: t('feedback.mock.c2') },
  ];

  const [search, setSearch]       = useState('');
  const [expanded, setExpanded]   = useState(null);

  const STATUS_MAP = {
    open:        { label: t('feedback.status.open') || 'Open',        color: '#F43F5E', bg: 'rgba(244,63,94,0.1)' },
    resolved:    { label: t('feedback.status.resolved') || 'Resolved',    color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    'in-progress': { label: t('feedback.status.processing') || 'Processing', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  };

  const filtered = mockFeedback.filter(f => f.author.toLowerCase().includes(search.toLowerCase()) || f.module.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout
      title={t('feedback.title')}
      subtitle={t('feedback.subtitle')}
      actions={[
        { icon: <Download size={14} />, label: t('common.export') },
        { icon: <Check size={14} />, label: t('feedback.resolve'), primary: true },
      ]}
    >
      {/* ── RESPONSIVE METRICS GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('feedback.metrics.volume'),  value: '842',      Icon: MessageSquare, color: '#8B5CF6' },
          { label: t('feedback.metrics.active'), value: '14',  Icon: AlertCircle,   color: '#F43F5E' },
          { label: t('feedback.metrics.score'), value: `4.2/5`, Icon: Star,     color: '#F59E0B' },
          { label: t('feedback.metrics.rate'), value: '94.2%',  Icon: Check,         color: '#10B981' },
        ].map((s, i) => (
          <div key={i} className="pro-card p-5 flex items-center gap-4 animate-slide-up">
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: `${s.color}15`, border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <s.Icon size={20} color={s.color} />
            </div>
            <div>
              <p className="text-2xl font-black text-[var(--text-primary)] leading-none">{s.value}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pro-card overflow-hidden">
        <div className="p-5 border-b border-[var(--glass-border)] flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('feedback.search')}
              className="pro-input pro-glass w-full pl-12 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="divide-y divide-[var(--glass-border)]">
          {filtered.map((fb) => {
            const ST = STATUS_MAP[fb.status] || STATUS_MAP.open;
            const isActive = expanded === fb.id;
            
            return (
              <div key={fb.id} className="p-6 hover:bg-white/[0.01] transition-colors">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  
                  <div className="flex flex-row sm:flex-col items-center gap-3 min-w-[80px]">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border border-[var(--glass-border)]" 
                         style={{ color: fb.rating >= 4 ? '#10B981' : '#F59E0B', background: fb.rating >= 4 ? '#10B98110' : '#F59E0B10' }}>
                      {fb.rating}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <img src={fb.avatar} className="w-8 h-8 rounded-lg" alt="" />
                        <span className="text-sm font-bold text-[var(--text-primary)]">{fb.author}</span>
                        <span className="text-xs text-[var(--text-muted)] hidden xs:inline">{t('common.on') || 'on'} <span className="text-[var(--brand)]">{fb.module}</span></span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-bold">{fb.date}</span>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] italic mb-6 leading-relaxed">"{fb.comment}"</p>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[9px] font-black px-2 py-1 rounded-md bg-[var(--brand)]/10 text-[var(--brand)] uppercase border border-[var(--brand)]/20">{fb.category}</span>
                      <span className="text-[9px] font-black px-2 py-1 rounded-md uppercase" style={{ color: ST.color, background: ST.bg }}>{ST.label}</span>

                      <div className="ml-auto flex gap-2">
                        <button 
                          onClick={() => setExpanded(isActive ? null : fb.id)}
                          className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all border border-[var(--glass-border)] ${isActive ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white'}`}
                        >
                          {isActive ? t('feedback.cancel') : t('feedback.reply')}
                        </button>
                        <button className="p-2 rounded-lg text-[var(--text-muted)] border border-[var(--glass-border)]"><MoreVertical size={16} /></button>
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-fade-in text-right">
                        <textarea
                          rows={3}
                          placeholder={t('feedback.placeholder') || "Type your response..."}
                          className="w-full bg-transparent border-none outline-none text-sm text-white resize-none mb-4"
                        />
                        <button className="bg-[var(--brand)] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-[var(--brand-glow)] uppercase">
                          {t('feedback.dispatch')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
