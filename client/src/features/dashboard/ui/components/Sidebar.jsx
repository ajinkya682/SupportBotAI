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
  X
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout, reset } from "../../../auth/state/authSlice";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ activeTab, setActiveTab, onUpgrade, business, isOpen, onClose }) {
  const dispatch = useDispatch();
  const isFree = business?.plan === 'free';

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
            className="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <div className="brand-icon">
              <img src="/image.png" alt="SupportBot AI" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            </div>
            <div className="brand-text">
              <h3>SupportBot</h3>
              <span>Enterprise AI</span>
            </div>
          </Link>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              <item.icon size={18} className="nav-icon" />
              <span>{item.label}</span>
              {activeTab === item.id && <div className="active-accent" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {isFree && (
            <div className="upgrade-promo-card">
              <div className="promo-header">
                <Sparkles size={14} />
                <span>PRO UPGRADE</span>
              </div>
              <p>Scale your intelligence with advanced URL scanning and custom branding.</p>
              <button className="btn btn-primary" onClick={onUpgrade}>
                Upgrade Now
              </button>
            </div>
          )}
          
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        <style>{`
          .sidebar {
            width: var(--sidebar-width);
            height: 100vh;
            background-color: var(--surface-container);
            display: flex;
            flex-direction: column;
            padding: 32px 16px;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1100;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 8px 0 32px rgba(0, 0, 0, 0.1);
          }

          @media (min-width: 1024px) {
            .sidebar {
              position: sticky;
              transform: translateX(0);
              box-shadow: none;
              z-index: 100;
            }
          }

          .sidebar.is-open {
            transform: translateX(0);
          }

          .sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            z-index: 1050;
          }

          @media (min-width: 1024px) {
            .sidebar-backdrop { display: none; }
          }
          
          .sidebar-header {
            margin-bottom: 40px;
            padding: 0 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
          }

          .sidebar-close-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            color: var(--on-surface-variant);
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }

          @media (min-width: 1024px) {
            .sidebar-close-btn { display: none; }
          }
          
          .brand-icon {
            width: 36px;
            height: 36px;
            background: var(--primary);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: var(--shadow-raised);
          }
          
          .brand-text h3 {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--on-surface);
            margin: 0;
            line-height: 1.1;
          }
          
          .brand-text span {
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--outline);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .sidebar-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
            overflow-y: auto;
          }
          
          .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 12px;
            border-radius: var(--radius-btn-input);
            border: none;
            background: transparent;
            color: var(--on-surface-variant);
            font-weight: 500;
            font-size: var(--text-label-md);
            cursor: pointer;
            transition: var(--transition-fast);
            text-align: left;
            position: relative;
            min-height: 44px;
          }
          
          .nav-item:hover {
            background-color: var(--surface-container-high);
            color: var(--on-surface);
          }
          
          .nav-item.active {
            background-color: var(--surface-container-highest);
            color: var(--primary);
            font-weight: 600;
          }
          
          .active-accent {
            position: absolute;
            left: -16px;
            width: 3px;
            height: 20px;
            background-color: var(--primary);
            border-radius: 0 4px 4px 0;
          }
          
          .nav-icon { flex-shrink: 0; }
          
          .sidebar-footer {
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding-top: 24px;
          }
          
          .upgrade-promo-card {
            padding: 20px;
            background-color: var(--surface-container-low);
            border: 1px solid var(--outline-variant);
            border-radius: var(--radius-card-modal);
          }
          
          .promo-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            color: var(--primary);
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.05em;
          }
          
          .upgrade-promo-card p {
            font-size: 0.75rem;
            color: var(--on-surface-variant);
            line-height: 1.4;
            margin-bottom: 16px;
          }
          
          .upgrade-promo-card .btn { width: 100%; min-height: 36px; font-size: 0.8rem; }
          
          .logout-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 12px;
            border-radius: var(--radius-btn-input);
            border: none;
            background: transparent;
            color: var(--on-surface-variant);
            font-weight: 500;
            font-size: var(--text-label-md);
            cursor: pointer;
            transition: var(--transition-fast);
            min-height: 44px;
          }
          
          .logout-btn:hover { background-color: #ffdad6; color: #93000a; }
        `}</style>
      </aside>
    </>
  );
}
