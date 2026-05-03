import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../../../features/auth/state/authSlice';
import { useState } from 'react';
import { Bot, LogOut, LayoutDashboard, X, Menu } from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
  };

  // Don't show main navbar on dashboard/admin pages (they have their own sidebar)
  if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { to: '/product', label: 'Product' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/docs', label: 'Docs' },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
        }}>
          {/* Logo */}
          <Link to="/" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 'var(--weight-extrabold)',
            fontSize: 'var(--text-xl)',
            color: 'var(--color-primary)',
            letterSpacing: 'var(--tracking-tight)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            SupportBot<span style={{ color: 'var(--color-primary)' }}>AI</span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }} className="desktop-nav">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  color: location.pathname === link.to ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  position: 'relative',
                  paddingBottom: 'var(--space-1)',
                  transition: 'color var(--duration-base) var(--ease-standard)',
                }}
              >
                {link.label}
                {location.pathname === link.to && (
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'var(--color-primary)',
                    borderRadius: 'var(--radius-full)',
                  }} />
                )}
              </Link>
            ))}

            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-secondary btn-sm">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={onLogout} className="btn btn-ghost btn-icon" title="Logout">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="btn btn-ghost btn-icon mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            style={{ display: 'none' }}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13,13,13,0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 299,
          }}
        />
      )}

      {/* Mobile Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: '300px',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        zIndex: 300,
        padding: 'var(--space-8)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform var(--duration-slow) var(--ease-decelerate)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--color-on-surface-variant)',
              padding: 'var(--space-3) 0',
            }}
          >
            {link.label}
          </Link>
        ))}
        <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <button onClick={() => { onLogout(); setMobileOpen(false); }} className="btn btn-ghost">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/signup" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
