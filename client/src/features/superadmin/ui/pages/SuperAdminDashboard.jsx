import { useState, useEffect } from 'react';
import { useNavigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MessageSquare, 
  CreditCard, 
  Bell, 
  Settings,
  LogOut,
  ShieldAlert,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout, reset } from '../../../auth/state/authSlice';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Close sidebar on navigation in mobile
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const navItems = [
    { path: '/super-admin/dashboard/overview', icon: LayoutDashboard, label: 'Control Center' },
    { path: '/super-admin/dashboard/businesses', icon: Building2, label: 'Client Accounts' },
    { path: '/super-admin/dashboard/agents', icon: Users, label: 'Agent Directory' },
    { path: '/super-admin/dashboard/conversations', icon: MessageSquare, label: 'Global Logs' },
    { path: '/super-admin/dashboard/subscriptions', icon: CreditCard, label: 'Revenue & Plans' },
    { path: '/super-admin/dashboard/notifications', icon: Bell, label: 'Broadcasts' },
    { path: '/super-admin/dashboard/settings', icon: Settings, label: 'System Config' }
  ];

  return (
    <div className="dashboard-root sa-layout">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            className="sa-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Premium Sidebar */}
      <aside className={`sa-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sa-sidebar-header">
          <div className="sa-header-main">
            <div className="sa-logo-wrapper" style={{ background: 'transparent', width: '48px', height: '48px' }}>
              <img src="/logo.png" alt="SupportBot AI" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            </div>
            <div>
              <h3>SuperAdmin</h3>
              <span>Master Console</span>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} color="var(--outline)" />
          </button>
        </div>
        
        <nav className="sa-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sa-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className="sa-icon" />
                <span>{item.label}</span>
                {isActive && <motion.div layoutId="active-pill" className="active-pill desktop-only" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="sa-sidebar-footer">
          <button onClick={handleLogout} className="sa-logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="sa-main-content">
        <header className="sa-top-bar">
          <div className="sa-top-bar-left">
            <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="sa-breadcrumb">
              <span className="sa-root desktop-only">Network</span>
              <ChevronRight size={14} className="sa-sep desktop-only" />
              <span className="sa-current">
                {location.pathname.split('/').pop().replace('-', ' ')}
              </span>
            </div>
          </div>
          
          <div className="sa-top-actions">
            <div className="sa-admin-badge">GLOBAL</div>
            <div className="sa-avatar">SA</div>
          </div>
        </header>
        
        <main className="sa-viewport">
          <Outlet />
        </main>
      </div>

      <style>{`
        .sa-layout { 
          background: var(--surface); 
          display: flex;
          flex-direction: column;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          width: 100%;
        }

        @media (min-width: 768px) {
          .sa-layout { flex-direction: row; }
        }

        .sa-sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 90;
        }

        @media (min-width: 1024px) {
          .sa-sidebar-overlay { display: none; }
        }

        .sa-sidebar { 
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          width: 100%; 
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid var(--outline-variant);
          display: flex; 
          flex-direction: row; 
          padding: 0; 
          z-index: 100; 
          transform: none;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 768px) and (max-width: 1199px) {
          .sa-sidebar {
            position: static;
            top: 0;
            width: 80px;
            height: 100vh;
            flex-direction: column;
            border-top: none;
            border-right: 1px solid var(--outline-variant);
            padding: 24px 12px;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
          }
          .sa-sidebar:hover {
            width: 300px;
          }
          .sa-sidebar:hover .sa-sidebar-header h3,
          .sa-sidebar:hover .sa-sidebar-header span { display: block; }
          .sa-sidebar:hover .sa-nav-link span { display: block; }
          .sa-sidebar:hover .sa-logout-btn span { display: block; }
        }

        @media (min-width: 1200px) {
          .sa-sidebar {
            position: static;
            width: 300px;
            height: 100vh;
            flex-direction: column;
            border-top: none;
            border-right: 1px solid var(--outline-variant);
            transform: none;
            padding: 32px 16px;
          }
        }

        .sa-sidebar-header { 
          display: none; 
        }

        @media (min-width: 768px) {
          .sa-sidebar-header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            padding: 0 16px; 
            margin-bottom: 48px; 
          }
        }

        .sa-header-main { display: flex; align-items: center; gap: 16px; }
        .sa-logo-wrapper { width: 40px; height: 40px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(53, 37, 205, 0.3); flex-shrink: 0; }
        
        .sa-sidebar-header h3 { color: var(--on-surface); margin: 0; font-size: 1.1rem; font-weight: 800; display: none; white-space: nowrap; }
        .sa-sidebar-header span { color: var(--on-surface-variant); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: none; white-space: nowrap; }
        @media (min-width: 1200px) {
          .sa-sidebar-header h3, .sa-sidebar-header span { display: block; }
        }
        
        .mobile-close-btn { display: none; }

        .sa-sidebar-nav { 
          display: flex; 
          flex-direction: row; 
          gap: 4px; 
          flex: 1; 
          overflow-x: auto; 
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch; 
          padding: 8px; 
          align-items: center;
        }

        @media (min-width: 768px) {
          .sa-sidebar-nav {
            flex-direction: column;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 0;
          }
        }

        .sa-nav-link { 
          display: flex; 
          flex-direction: column;
          align-items: center; 
          justify-content: center;
          gap: 4px; 
          padding: 8px 12px; 
          border-radius: 12px; 
          color: var(--on-surface-variant); 
          text-decoration: none; 
          font-weight: 600; 
          font-size: 0.65rem; 
          transition: 0.2s; 
          position: relative; 
          min-width: 72px;
          flex-shrink: 0;
          text-align: center;
        }

        @media (min-width: 768px) { 
          .sa-nav-link { 
            flex-direction: row;
            justify-content: flex-start;
            padding: 14px 16px; 
            font-size: 0.95rem; 
            gap: 14px;
            text-align: left;
          } 
        }

        .sa-nav-link span { display: block; white-space: nowrap; }
        @media (min-width: 768px) and (max-width: 1199px) {
          .sa-nav-link span { display: none; }
        }

        .sa-nav-link:hover { background: var(--surface-container); }
        .sa-nav-link.active { color: var(--primary); font-weight: 700; }
        @media (min-width: 768px) {
          .sa-nav-link.active { color: white; background: var(--primary); box-shadow: 0 8px 16px -4px rgba(53, 37, 205, 0.3); }
        }

        .active-pill { display: none; }
        @media (min-width: 768px) {
          .active-pill { display: block; position: absolute; left: -16px; width: 4px; height: 24px; background: var(--primary); border-radius: 0 4px 4px 0; }
        }
        
        .sa-sidebar-footer { display: none; }
        @media (min-width: 768px) { 
          .sa-sidebar-footer { display: block; padding-top: 24px; border-top: 1px solid var(--outline-variant); margin-top: auto; } 
        }

        .sa-logout-btn { display: flex; align-items: center; gap: 14px; width: 100%; padding: 14px 16px; border-radius: 12px; background: transparent; border: none; color: #ef4444; cursor: pointer; font-weight: 700; transition: 0.2s; font-size: 0.95rem; }
        .sa-logout-btn:hover { background: #fef2f2; }
        
        .sa-logout-btn span { display: none; }
        @media (min-width: 1200px) { .sa-logout-btn span { display: block; } }
        
        .sa-main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; position: relative; overflow: hidden; padding-bottom: 70px; }
        @media (min-width: 768px) { .sa-main-content { padding-bottom: 0; } }
        
        .sa-top-bar { height: 64px; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; background: white; border-bottom: 1px solid var(--outline-variant); flex-shrink: 0; z-index: 50; }
        @media (min-width: 768px) { .sa-top-bar { height: 72px; padding: 0 32px; } }
        @media (min-width: 1200px) { .sa-top-bar { height: 80px; padding: 0 40px; } }

        .sa-top-bar-left { display: flex; align-items: center; gap: 16px; }

        .mobile-menu-btn { background: transparent; border: none; padding: 4px; color: var(--on-surface); display: flex; align-items: center; justify-content: center; }
        @media (min-width: 768px) { .mobile-menu-btn { display: none; } }

        .sa-breadcrumb { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem; }
        .sa-root { color: var(--on-surface-variant); }
        .sa-sep { color: var(--outline); }
        .sa-current { color: var(--on-surface); text-transform: capitalize; }
        
        .sa-top-actions { display: flex; align-items: center; gap: 16px; }
        @media (min-width: 768px) { .sa-top-actions { gap: 24px; } }

        .sa-admin-badge { font-size: 0.6rem; font-weight: 900; background: var(--inverse-surface); color: white; padding: 4px 8px; border-radius: 6px; letter-spacing: 0.05em; }
        @media (min-width: 768px) { .sa-admin-badge { font-size: 0.65rem; padding: 4px 12px; } }

        .sa-avatar { width: 32px; height: 32px; background: var(--primary-fixed); color: var(--primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
        @media (min-width: 768px) { .sa-avatar { width: 36px; height: 36px; border-radius: 10px; font-size: 0.85rem; } }
        
        .sa-viewport { flex: 1; padding: 16px; overflow-y: auto; background: var(--surface-container-low); -webkit-overflow-scrolling: touch; }
        @media (min-width: 768px) { .sa-viewport { padding: 32px; } }
        @media (min-width: 1200px) { .sa-viewport { padding: 40px; } }

        .desktop-only { display: none; }
        @media (min-width: 1200px) { .desktop-only { display: inline-flex; } }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;
