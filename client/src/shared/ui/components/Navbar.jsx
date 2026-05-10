import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../../../features/auth/state/authSlice';
import { Bot, LogOut, LayoutDashboard, ChevronRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    setIsMobileMenuOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/super-admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Product', path: '/product' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Documentation', path: '/docs' },
  ];

  return (
    <nav className="global-navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand-logo">
          <div className="logo-icon" style={{ background: 'transparent', width: '52px', height: '52px' }}>
            <img src="/logo.png" alt="SupportBot AI" style={{ width: '52px', height: '52px', objectFit: 'contain' }} />
          </div>
          <span className="brand-text">SUPPORTBOT <span className="highlight">AI</span></span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="nav-navigation">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="nav-actions">
          {user ? (
            <div className="auth-actions">
              <Link to={user.role === 'superadmin' ? "/super-admin/dashboard" : "/dashboard"} className="btn btn-secondary">
                <LayoutDashboard size={18} /> <span>Dashboard</span>
              </Link>
              <button onClick={onLogout} className="logout-icon-btn" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="login-link">Sign In</Link>
              <Link to="/signup" className="btn btn-primary">
                Get Started <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <button 
          className="hamburger" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="drawer-header">
                <Link to="/" className="brand-logo" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="logo-icon" style={{ background: 'transparent', width: '40px', height: '40px' }}>
                    <img src="/logo.png" alt="SupportBot AI" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  </div>
                  <span className="brand-text">SUPPORTBOT <span className="highlight">AI</span></span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="close-btn">
                  <X size={24} />
                </button>
              </div>

              <div className="drawer-links">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`drawer-link ${location.pathname === link.path ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="drawer-actions">
                {user ? (
                  <>
                    <Link to={user.role === 'superadmin' ? "/super-admin/dashboard" : "/dashboard"} className="btn btn-secondary full-width">
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <button onClick={onLogout} className="btn btn-text error-text full-width">
                      <LogOut size={18} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-secondary full-width" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link to="/signup" className="btn btn-primary full-width" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Started <ChevronRight size={16} />
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .global-navbar {
          height: 64px;
          display: flex;
          align-items: center;
          background: rgba(252, 248, 255, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--outline-variant);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding-top: env(safe-area-inset-top);
        }
        
        .nav-inner { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          width: 100%;
        }
        
        .brand-logo { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          text-decoration: none; 
          flex-shrink: 0;
        }
        
        .logo-icon { 
          background: var(--primary); 
          width: 36px; 
          height: 36px; 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: var(--shadow-raised); 
        }
        
        .brand-text { 
          font-size: 1rem; 
          font-weight: 800; 
          color: var(--on-surface); 
          letter-spacing: -0.02em;
        }
        
        .brand-text .highlight { color: var(--primary); }
        
        /* Mobile First: Hide desktop links and actions */
        .nav-navigation, .nav-actions { display: none; }
        
        .hamburger {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--on-surface);
          cursor: pointer;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          transition: var(--transition-fast);
        }
        
        .hamburger:hover { background: var(--surface-container-low); }

        /* Desktop Styles (lg breakpoint) */
        @media (min-width: 1024px) {
          .global-navbar { height: 80px; }
          .brand-text { font-size: 1.25rem; }
          .logo-icon { width: 40px; height: 40px; }
          .nav-navigation { display: flex; gap: 32px; align-items: center; margin: 0 40px; }
          .nav-actions { display: flex; align-items: center; gap: 24px; }
          .hamburger { display: none; }
        }

        .nav-link { 
          text-decoration: none; 
          color: var(--on-surface-variant); 
          font-weight: 500; 
          font-size: var(--text-label-md); 
          transition: var(--transition-fast); 
          position: relative; 
          padding: 8px 0;
        }
        
        .nav-link:hover, .nav-link.active { color: var(--primary); }
        .nav-link.active::after { 
          content: ''; 
          position: absolute; 
          bottom: 0; 
          left: 0; 
          width: 100%; 
          height: 2px; 
          background: var(--primary); 
          border-radius: 2px; 
        }
        
        .auth-actions, .guest-actions { display: flex; align-items: center; gap: 16px; }
        .login-link { text-decoration: none; color: var(--on-surface); font-weight: 600; font-size: var(--text-label-md); transition: var(--transition-fast); }
        .login-link:hover { color: var(--primary); }
        
        .logout-icon-btn { 
          background: transparent; 
          border: none; 
          color: var(--error); 
          cursor: pointer; 
          padding: 10px; 
          border-radius: var(--radius-btn-input); 
          transition: var(--transition-fast); 
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .logout-icon-btn:hover { background: var(--error-container); }

        /* Mobile Drawer Styles */
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1100;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          height: 100dvh;
          width: 85%;
          background: var(--surface-container-lowest);
          z-index: 1200;
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 32px rgba(0, 0, 0, 0.1);
        }
        @media (min-width: 640px) {
          .mobile-drawer { width: 320px; box-shadow: -8px 0 32px rgba(0, 0, 0, 0.1); }
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }

        .close-btn {
          background: var(--surface-container-low);
          border: none;
          color: var(--on-surface);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drawer-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: auto;
        }

        .drawer-link {
          text-decoration: none;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--on-surface);
          padding: 12px 16px;
          border-radius: 12px;
          transition: var(--transition-fast);
        }

        .drawer-link.active {
          background: var(--surface-container-low);
          color: var(--primary);
        }

        .drawer-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 40px;
        }

        .full-width { width: 100%; }
        .error-text { color: var(--error); }
      `}</style>
    </nav>
  );
}
