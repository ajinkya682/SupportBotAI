import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../../../features/auth/state/authSlice';
import { Bot, LogOut, LayoutDashboard, Shield, Bell, MessageSquare, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
  };

  if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin')) {
    return null;
  }

  return (
    <nav className="global-navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand-logo">
          <div className="logo-icon">
            <Bot size={24} color="white" />
          </div>
          <span className="brand-text">SUPPORTBOT <span className="highlight">AI</span></span>
        </Link>
        
        <div className="nav-navigation">
          <Link to="/product" className={`nav-link ${location.pathname === '/product' ? 'active' : ''}`}>Product</Link>
          <Link to="/pricing" className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}>Pricing</Link>
          <Link to="/docs" className={`nav-link ${location.pathname === '/docs' ? 'active' : ''}`}>Documentation</Link>
        </div>

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to={user.role === 'superadmin' ? "/super-admin/dashboard" : "/dashboard"} className="btn btn-secondary">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <button onClick={onLogout} className="logout-icon-btn" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link to="/login" className="login-link">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">
                Get Started <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .global-navbar {
          height: 80px;
          display: flex;
          align-items: center;
          background: rgba(252, 248, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--outline-variant);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; width: 100%; }
        
        .brand-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .logo-icon { background: var(--primary); width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-raised); }
        .brand-text { font-size: 1.25rem; font-weight: 800; color: var(--on-surface); letter-spacing: -0.02em; }
        .brand-text .highlight { color: var(--primary); }
        
        .nav-navigation { display: flex; gap: 32px; align-items: center; }
        .nav-link { text-decoration: none; color: var(--on-surface-variant); font-weight: 500; font-size: var(--text-label-md); transition: var(--transition-fast); position: relative; }
        .nav-link:hover, .nav-link.active { color: var(--primary); }
        .nav-link.active::after { content: ''; position: absolute; bottom: -8px; left: 0; width: 100%; height: 2px; background: var(--primary); border-radius: 2px; }
        
        .nav-actions { display: flex; align-items: center; gap: 24px; }
        .login-link { text-decoration: none; color: var(--on-surface); font-weight: 600; font-size: var(--text-label-md); transition: var(--transition-fast); }
        .login-link:hover { color: var(--primary); }
        
        .logout-icon-btn { background: transparent; border: none; color: var(--error); cursor: pointer; padding: 10px; border-radius: var(--radius-btn-input); transition: var(--transition-fast); }
        .logout-icon-btn:hover { background: var(--error-container); }
      `}</style>
    </nav>
  );
}
