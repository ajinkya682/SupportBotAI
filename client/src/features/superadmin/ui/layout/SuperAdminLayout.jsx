import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, MessageSquare, CreditCard, Bell, Settings, LogOut } from 'lucide-react';

const SuperAdminLayout = ({ children, handleLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/super-admin/dashboard/overview', icon: LayoutDashboard, label: 'Overview' },
    { path: '/super-admin/dashboard/businesses', icon: Building2, label: 'Business Owners' },
    { path: '/super-admin/dashboard/agents', icon: Users, label: 'Support Agents' },
    { path: '/super-admin/dashboard/conversations', icon: MessageSquare, label: 'Conversations' },
    { path: '/super-admin/dashboard/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { path: '/super-admin/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { path: '/super-admin/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const currentLabel = location.pathname.split('/').pop().replace('-', ' ');

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside style={{ background: 'var(--color-surface-container-low)', display: 'flex', flexDirection: 'column', padding: 'var(--space-6)', gap: 'var(--space-1)', overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-lg)', color: 'var(--color-primary)', letterSpacing: 'var(--tracking-tight)' }}>
            SupportBotAI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <span className="badge badge-primary">Super Admin</span>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', marginTop: 'var(--space-2)' }}>Platform Management</p>
        </div>

        {/* Nav Label */}
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: 'var(--space-2) var(--space-4)', marginTop: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>Navigation</span>

        {/* Nav Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', transition: 'all var(--duration-base) var(--ease-standard)',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                  fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)',
                  background: isActive ? 'var(--color-primary-light)' : 'transparent',
                  textDecoration: 'none', fontFamily: 'var(--font-body)',
                }}
              >
                <Icon size={18} style={{ color: isActive ? 'var(--color-primary)' : 'currentColor', flexShrink: 0 }} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all var(--duration-base) var(--ease-standard)', color: 'var(--color-error)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', fontFamily: 'var(--font-body)', marginTop: 'var(--space-4)' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-surface)' }}>
        {/* Sticky Header */}
        <header style={{
          height: '72px', display: 'flex', alignItems: 'center',
          padding: '0 var(--space-8)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          boxShadow: 'var(--shadow-xs)',
          position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
        }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', letterSpacing: 'var(--tracking-display)', color: 'var(--color-on-surface)', textTransform: 'capitalize' }}>
            {currentLabel}
          </h1>
        </header>
        <main style={{ padding: 'var(--space-8)', flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
