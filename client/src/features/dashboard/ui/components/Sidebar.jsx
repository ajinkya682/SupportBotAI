import { 
  LayoutDashboard, 
  MessageSquare, 
  Bot, 
  BarChart3, 
  Settings, 
  Code2, 
  LogOut,
  Sparkles,
  Users,
  Palette
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout, reset } from "../../../auth/state/authSlice";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Sidebar({ activeTab, setActiveTab, onUpgrade, business }) {
  const dispatch = useDispatch();
  const isFree = business?.plan === 'free';

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'training', label: 'AI Training', icon: Bot },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'integration', label: 'Integration', icon: Code2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
  };

  return (
    <aside style={{
      background: 'var(--color-surface-container-low)',
      width: '280px',
      height: '100vh',
      padding: 'var(--space-8) var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--color-surface-container)',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-10)',
        paddingLeft: 'var(--space-2)',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'var(--color-primary-gradient)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <Bot size={20} color="white" />
        </div>
        <Link to="/" style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--weight-extrabold)',
          fontSize: 'var(--text-lg)',
          color: 'var(--color-on-surface)',
          letterSpacing: 'var(--tracking-tight)',
          textDecoration: 'none',
        }}>
          SupportBot<span style={{ color: 'var(--color-primary)' }}>AI</span>
        </Link>
      </div>

      {/* Navigation */}
      <div style={{
        fontSize: '10px',
        fontWeight: 'var(--weight-bold)',
        color: 'var(--color-on-surface-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 'var(--space-3)',
        paddingLeft: 'var(--space-4)',
      }}>
        Dashboard
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--duration-base) var(--ease-standard)',
                color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 'var(--weight-bold)' : 'var(--weight-medium)',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                border: 'none',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--color-surface-container)';
                  e.currentTarget.style.color = 'var(--color-on-surface)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-on-surface-variant)';
                }
              }}
            >
              <item.icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
              {item.label}
              {isActive && (
                <motion.div 
                  layoutId="sidebar-indicator"
                  style={{ marginLeft: 'auto', width: '4px', height: '16px', background: 'var(--color-primary)', borderRadius: 'var(--radius-full)' }} 
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {isFree && (
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-5)',
            border: '1px solid var(--color-surface-container)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: '10px', fontWeight: 'var(--weight-bold)', color: '#f59e0b', textTransform: 'uppercase' }}>Pro Plan</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              Unlock advanced training and full analytics.
            </p>
            <button className="btn btn-primary btn-sm" onClick={onUpgrade} style={{ width: '100%' }}>Upgrade Now</button>
          </div>
        )}

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: '#ef4444',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-bold)',
            background: 'transparent',
            border: 'none',
            width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
