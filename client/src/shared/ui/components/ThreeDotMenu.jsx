import { useState, useRef, useEffect } from 'react';
import { MoreVertical, ShieldBan, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThreeDotMenu = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="three-dot-container" ref={menuRef}>
      <button 
        className={`three-dot-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <MoreVertical size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="three-dot-menu"
          >
            {actions.map((action, idx) => (
              <button 
                key={idx} 
                className={`menu-item ${action.type}`}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .three-dot-container { position: relative; display: inline-block; }
        .three-dot-trigger { 
          background: transparent; 
          border: none; 
          padding: 8px; 
          border-radius: 8px; 
          color: #64748b; 
          cursor: pointer; 
          transition: 0.2s; 
          display: flex;
        }
        .three-dot-trigger:hover, .three-dot-trigger.active { background: #f1f5f9; color: #1e293b; }
        
        .three-dot-menu {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          padding: 6px;
          min-width: 160px;
          z-index: 100;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          background: transparent;
          border: none;
          color: #475569;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        
        .menu-item:hover { background: #f8fafc; color: #1e293b; }
        .menu-item.danger { color: #ef4444; }
        .menu-item.danger:hover { background: #fef2f2; color: #dc2626; }
        .menu-item.success { color: #10b981; }
        .menu-item.success:hover { background: #ecfdf5; color: #059669; }
        
        .menu-item svg { width: 16px; height: 16px; }
      `}</style>
    </div>
  );
};

export default ThreeDotMenu;
