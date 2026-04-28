import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar  from './Navbar';

export default function AdminLayout({ children, title, subtitle, actions }) {
  const { user, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (loading)               return null;
  if (!user)                 return <Navigate to="/login"  replace />;
  if (user.role !== 'admin') return <Navigate to="/"       replace />;

  return (
    <div className="flex min-h-screen">
      {/* Dynamic Background Mesh */}
      <div className="mesh-bg" />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', 
            backdropFilter: 'blur(4px)', zIndex: 45
          }}
          className="lg:hidden"
        />
      )}

      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />
      
      <div 
        style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        className={`flex-1 flex flex-col min-h-screen relative z-10 ${isCollapsed ? 'lg:ml-[70px]' : 'lg:ml-[240px]'}`}
      >
        <Navbar 
          title={title} 
          subtitle={subtitle} 
          actions={actions} 
          onMenuClick={() => setIsMobileOpen(true)}
          onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
          isCollapsed={isCollapsed}
        />
        
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        <footer style={{ padding: '24px 32px', borderTop: '1px solid var(--glass-border)', marginTop: 'auto' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            &copy; {new Date().getFullYear()} ISTA Connect • Admin v2.0.4
          </p>
        </footer>
      </div>
    </div>
  );
}