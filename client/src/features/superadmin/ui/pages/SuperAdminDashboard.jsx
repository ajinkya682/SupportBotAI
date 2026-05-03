import { useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout, reset } from '../../../auth/state/authSlice';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();

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
      {/* Premium Sidebar */}
      <aside className="sa-sidebar">
        <div className="sa-sidebar-header">
          <div className="sa-logo-wrapper">
            <ShieldAlert size={24} color="white" />
          </div>
          <div>
            <h3>SuperAdmin</h3>
            <span>Master Console</span>
          </div>
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
                <Icon size={20} className="sa-icon" />
                <span>{item.label}</span>
                {isActive && <motion.div layoutId="active-pill" className="active-pill" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="sa-sidebar-footer">
          <button onClick={handleLogout} className="sa-logout-btn">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="sa-main-content">
        <header className="sa-top-bar">
          <div className="sa-breadcrumb">
            <span className="sa-root">Network</span>
            <ChevronRight size={14} className="sa-sep" />
            <span className="sa-current">
              {location.pathname.split('/').pop().replace('-', ' ')}
            </span>
          </div>
          <div className="sa-top-actions">
            <div className="sa-admin-badge">GLOBAL ACCESS</div>
            <div className="sa-avatar">SA</div>
          </div>
        </header>
        
        <main className="sa-viewport">
          <Outlet />
        </main>
      </div>

      <style>{`
        .sa-layout { background: var(--surface); }
        .sa-sidebar { width: 300px; background: var(--inverse-surface); display: flex; flex-direction: column; padding: 32px 16px; position: relative; z-index: 100; }
        .sa-sidebar-header { display: flex; align-items: center; gap: 16px; padding: 0 16px; margin-bottom: 48px; }
        .sa-logo-wrapper { width: 44px; height: 44px; background: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(53, 37, 205, 0.3); }
        .sa-sidebar-header h3 { color: white; margin: 0; font-size: 1.15rem; font-weight: 800; }
        .sa-sidebar-header span { color: var(--outline); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .sa-sidebar-nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .sa-nav-link { display: flex; align-items: center; gap: 16px; padding: 14px 16px; border-radius: 12px; color: var(--outline); text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: 0.2s; position: relative; }
        .sa-nav-link:hover { color: white; background: rgba(255,255,255,0.05); }
        .sa-nav-link.active { color: white; background: var(--primary-container); }
        .active-pill { position: absolute; left: -16px; width: 4px; height: 24px; background: white; border-radius: 0 4px 4px 0; }
        
        .sa-sidebar-footer { padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); }
        .sa-logout-btn { display: flex; align-items: center; gap: 16px; width: 100%; padding: 14px 16px; border-radius: 12px; background: transparent; border: none; color: #f87171; cursor: pointer; font-weight: 700; transition: 0.2s; }
        .sa-logout-btn:hover { background: rgba(248, 113, 113, 0.1); }
        
        .sa-main-content { flex: 1; display: flex; flex-direction: column; }
        .sa-top-bar { height: 80px; padding: 0 40px; display: flex; justify-content: space-between; align-items: center; background: white; border-bottom: 1px solid var(--outline-variant); }
        .sa-breadcrumb { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem; }
        .sa-root { color: var(--on-surface-variant); }
        .sa-sep { color: var(--outline); }
        .sa-current { color: var(--on-surface); text-transform: capitalize; }
        
        .sa-top-actions { display: flex; align-items: center; gap: 24px; }
        .sa-admin-badge { font-size: 0.65rem; font-weight: 900; background: var(--inverse-surface); color: white; padding: 4px 12px; border-radius: 6px; letter-spacing: 0.05em; }
        .sa-avatar { width: 36px; height: 36px; background: var(--primary-fixed); color: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; }
        
        .sa-viewport { flex: 1; padding: 40px; overflow-y: auto; background: var(--surface-container-low); }
      `}</style>
    </div>
  );
};

export default SuperAdminDashboard;
