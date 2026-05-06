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
  Palette,
  X,
  Building2,
  Lock
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout, reset } from "../../../auth/state/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ activeTab, setActiveTab, onUpgrade, business, isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isFree = business?.plan === 'free';

  // Items that require Pro plan
  const proItems = ['team', 'analytics'];

  const menuItems = [
    { id: 'overview', label: 'Control Center', icon: LayoutDashboard },
    { id: 'conversations', label: 'Global Logs', icon: MessageSquare },
    { id: 'team', label: 'Team Directory', icon: Users },
    { id: 'training', label: 'AI Intelligence', icon: Bot },
    { id: 'analytics', label: 'Revenue & Metrics', icon: BarChart3 },
    { id: 'appearance', label: 'Visual Design', icon: Palette },
    { id: 'integration', label: 'Widget Config', icon: Code2 },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="sa-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`sa-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sa-sidebar-header">
          <div className="sa-header-main">
            <div className="sa-logo-wrapper" style={{ background: 'transparent', width: '48px', height: '48px' }}>
              <img src="/logo.png" alt="SupportBot AI" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            </div>
            <div className="sa-brand-text">
              <h3>{business?.name || 'SupportBot'}</h3>
              <span>{isFree ? 'Starter Plan' : 'Enterprise Node'}</span>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={20} color="var(--outline)" />
          </button>
        </div>

        <nav className="sa-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isProLocked = isFree && proItems.includes(item.id);
            return (
              <button
                key={item.id}
                className={`sa-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
              >
                <Icon size={18} className="sa-icon" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isProLocked && (
                  <span style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    letterSpacing: '0.02em',
                  }}>
                    <Lock size={8} /> PRO
                  </span>
                )}
                {isActive && <motion.div layoutId="active-pill" className="active-pill desktop-only" />}
              </button>
            );
          })}
        </nav>

        <div className="sa-sidebar-footer">
          {isFree && (
            <div className="sa-upgrade-card">
              <div className="promo-header">
                <Sparkles size={14} />
                <span>PRO UPGRADE</span>
              </div>
              <p>Scale your intelligence with advanced URL scanning and custom branding.</p>
              <button className="btn-upgrade-sa" onClick={() => navigate('/dashboard/upgrade')}>
                Upgrade Now
              </button>
            </div>
          )}
          
          <button onClick={onLogout} className="sa-logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        <style>{`
          .sa-sidebar { 
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            width: 280px; 
            background: white; 
            border-right: 1px solid var(--outline-variant);
            display: flex; 
            flex-direction: column; 
            padding: 24px 16px; 
            z-index: 1000; 
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sa-sidebar.open { transform: translateX(0); }

          @media (min-width: 1024px) {
            .sa-sidebar {
              position: sticky;
              width: 300px;
              transform: none;
              padding: 32px 16px;
              height: 100vh;
            }
          }

          .sa-sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            z-index: 950;
          }

          @media (min-width: 1024px) {
            .sa-sidebar-overlay { display: none; }
          }

          .sa-sidebar-header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between;
            padding: 0 8px; 
            margin-bottom: 32px; 
          }

          @media (min-width: 1024px) { .sa-sidebar-header { margin-bottom: 40px; } }

          .sa-header-main { display: flex; align-items: center; gap: 12px; }
          .sa-logo-wrapper { 
            width: 40px; 
            height: 40px; 
            background: var(--primary); 
            border-radius: 12px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            box-shadow: 0 4px 12px rgba(53, 37, 205, 0.2);
            flex-shrink: 0;
          }
          
          .sa-brand-text h3 { color: var(--on-surface); margin: 0; font-size: 1rem; font-weight: 800; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
          .sa-brand-text span { color: var(--primary); font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
          
          .mobile-close-btn { background: transparent; border: none; padding: 4px; display: flex; align-items: center; justify-content: center; }
          @media (min-width: 1024px) { .mobile-close-btn { display: none; } }

          .sa-sidebar-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; padding-right: 4px; }
          
          .sa-nav-link { 
            display: flex; 
            align-items: center; 
            gap: 14px; 
            padding: 12px 14px; 
            border-radius: 12px; 
            color: var(--on-surface-variant); 
            text-decoration: none; 
            font-weight: 600; 
            font-size: 0.9rem; 
            transition: 0.2s; 
            position: relative;
            background: transparent;
            border: none;
            width: 100%;
            cursor: pointer;
            text-align: left;
          }

          .sa-nav-link:hover { background: var(--surface-container-low); color: var(--on-surface); }
          
          .sa-nav-link.active { 
            color: white; 
            background: var(--primary); 
            font-weight: 700;
            box-shadow: 0 8px 16px -4px rgba(53, 37, 205, 0.3);
          }

          .active-pill { 
            position: absolute; 
            left: -16px; 
            width: 4px; 
            height: 24px; 
            background: var(--primary); 
            border-radius: 0 4px 4px 0; 
          }
          
          .sa-icon { flex-shrink: 0; }

          .sa-sidebar-footer { 
            padding-top: 16px; 
            border-top: 1px solid var(--outline-variant); 
            margin-top: auto; 
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .sa-upgrade-card {
            background: linear-gradient(135deg, var(--primary-low), white);
            border: 1px solid var(--primary-container);
            padding: 16px;
            border-radius: 16px;
            margin-bottom: 8px;
          }

          .promo-header { display: flex; align-items: center; gap: 8px; color: var(--primary); font-size: 0.65rem; font-weight: 800; margin-bottom: 6px; }
          .sa-upgrade-card p { font-size: 0.7rem; color: var(--on-surface-variant); line-height: 1.4; margin-bottom: 12px; font-weight: 500; }
          
          .btn-upgrade-sa {
            width: 100%;
            padding: 8px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 0.75rem;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s;
            box-shadow: 0 4px 10px rgba(53, 37, 205, 0.2);
          }

          .btn-upgrade-sa:hover { transform: translateY(-1px); filter: brightness(1.1); }

          .sa-logout-btn { 
            display: flex; 
            align-items: center; 
            gap: 14px; 
            width: 100%; 
            padding: 12px 14px; 
            border-radius: 12px; 
            background: transparent; 
            border: none; 
            color: #ef4444; 
            cursor: pointer; 
            font-weight: 700; 
            transition: 0.2s; 
            font-size: 0.9rem; 
          }

          .sa-logout-btn:hover { background: #fef2f2; }

          .desktop-only { display: none; }
          @media (min-width: 1024px) { .desktop-only { display: inline-flex; } }
          
          /* Custom scrollbar for nav */
          .sa-sidebar-nav::-webkit-scrollbar { width: 4px; }
          .sa-sidebar-nav::-webkit-scrollbar-thumb { background: var(--outline-variant); border-radius: 10px; }
        `}</style>
      </aside>
    </>
  );
}
