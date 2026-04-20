import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Sparkles, Users, Target, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LandingPage() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { icon: Target, title: 'Lost & Found', desc: 'Quickly report and find lost items on campus' },
    { icon: Users, title: 'Community', desc: 'Connect with fellow students and staff' },
    { icon: Bell, title: 'Notifications', desc: 'Real-time alerts and updates' },
  ];

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      position: 'relative',
      background: 'linear-gradient(135deg, #0a0f1c 0%, #1a2744 50%, #0f1929 100%)'
    }}>
      {/* Mesh Background */}
      <div className="absolute inset-0 mesh-bg opacity-100" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(123, 179, 66, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(123, 179, 66, 0.3) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* Main Content */}
      <div 
        className="relative z-10 h-full flex flex-col items-center justify-center px-6"
        style={{
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Badge */}
        <div className="mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
          <span className="flex items-center gap-2 text-xs font-semibold text-white/70">
            <Sparkles size={14} className="text-[#7BB342]" />
            Campus Community Platform
          </span>
        </div>

        {/* Logo */}
        <div className="mb-8 animate-float">
          <img 
            src="/logo-pro-final.png" 
            alt="ISTA Platform" 
            className="h-20 md:h-28 w-auto"
            style={{ filter: 'drop-shadow(0 4px 20px rgba(123, 179, 66, 0.3))' }}
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white text-center mb-4 tracking-tight" style={{ letterSpacing: '-0.04em' }}>
          ISTA <span className="text-[#7BB342]">Platform</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-white/70 text-center max-w-2xl mb-12 font-medium">
          Your all-in-one campus community hub
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-3 px-10 py-5 bg-[#7BB342] hover:bg-[#7BB342]/90 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-xl hover:scale-105"
            style={{ boxShadow: '0 4px 20px rgba(123, 179, 66, 0.25)' }}
          >
            <span>Get Started</span>
            <ArrowRight size={22} />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
          {features.map((feat, i) => (
            <div 
              key={i}
              className="p-6 md:p-8 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:border-[#7BB342]/30 hover:bg-white/[0.06] transition-all duration-500 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#7BB342]/10 flex items-center justify-center mb-5">
                <feat.icon size={28} className="text-[#7BB342]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-white/50 text-base leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 py-4" style={{ background: 'linear-gradient(to top, rgba(4,6,14,0.9), transparent)' }}>
        <div className="flex items-center gap-6 text-white/40">
          <span className="text-xs font-semibold uppercase tracking-widest">ISTA</span>
          <span className="hidden md:block text-xs">© 2025 All rights reserved</span>
        </div>
      </div>
    </div>
  );
}