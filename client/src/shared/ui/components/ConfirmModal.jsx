import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, ShieldAlert, Info, Trash2, CheckCircle2 } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "This action cannot be undone. Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger" // danger, warning, info, success
}) => {
  if (!isOpen) return null;

  const config = {
    danger: {
      bg: 'rgba(239, 68, 68, 0.1)',
      accent: '#ef4444',
      icon: <Trash2 size={24} />,
      btnClass: 'btn-danger'
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      accent: '#f59e0b',
      icon: <ShieldAlert size={24} />,
      btnClass: 'btn-warning'
    },
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      accent: '#3b82f6',
      icon: <Info size={24} />,
      btnClass: 'btn-info'
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      accent: '#10b981',
      icon: <CheckCircle2 size={24} />,
      btnClass: 'btn-success'
    }
  };

  const activeConfig = config[type] || config.danger;

  return (
    <AnimatePresence>
      <div className="premium-modal-overlay" onClick={onClose}>
        <motion.div 
          className="premium-modal-surface"
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-accent-bar" style={{ background: activeConfig.accent }}></div>
          
          <div className="modal-content-wrap">
            <div className="modal-header-premium">
              <div className="icon-container-premium" style={{ background: activeConfig.bg, color: activeConfig.accent }}>
                {activeConfig.icon}
              </div>
              <button className="close-btn-premium" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-premium">
              <h3>{title}</h3>
              <p>{message}</p>
            </div>

            <div className="modal-footer-premium">
              <button className="btn-cancel-premium" onClick={onClose}>
                {cancelText}
              </button>
              <button 
                className={`btn-confirm-premium ${activeConfig.btnClass}`} 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>

        <style>{`
          .premium-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(12px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .premium-modal-surface {
            background: white;
            width: 100%;
            max-width: 440px;
            border-radius: 28px;
            overflow: hidden;
            box-shadow: 
              0 20px 25px -5px rgba(0, 0, 0, 0.1), 
              0 8px 10px -6px rgba(0, 0, 0, 0.1),
              0 0 0 1px rgba(0, 0, 0, 0.05);
            position: relative;
          }

          .modal-accent-bar {
            height: 6px;
            width: 100%;
          }

          .modal-content-wrap {
            padding: 32px;
          }

          .modal-header-premium {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
          }

          .icon-container-premium {
            width: 56px;
            height: 56px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          }

          .close-btn-premium {
            background: var(--surface-container-low);
            border: none;
            color: var(--outline);
            padding: 8px;
            border-radius: 50%;
            cursor: pointer;
            transition: 0.2s;
            display: flex;
          }

          .close-btn-premium:hover {
            background: var(--outline-variant);
            color: var(--on-surface);
            transform: rotate(90deg);
          }

          .modal-body-premium h3 {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
          }

          .modal-body-premium p {
            color: #475569;
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 32px;
          }

          .modal-footer-premium {
            display: flex;
            gap: 12px;
          }

          .btn-cancel-premium {
            flex: 1;
            padding: 14px;
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            background: white;
            color: #64748b;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: 0.2s;
          }

          .btn-cancel-premium:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            color: #1e293b;
          }

          .btn-confirm-premium {
            flex: 1.5;
            padding: 14px;
            border-radius: 14px;
            border: none;
            color: white;
            font-weight: 700;
            font-size: 0.95rem;
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn-confirm-premium.btn-danger { background: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
          .btn-confirm-premium.btn-danger:hover { background: #dc2626; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4); }
          
          .btn-confirm-premium.btn-warning { background: #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
          .btn-confirm-premium.btn-warning:hover { background: #d97706; transform: translateY(-2px); }
          
          .btn-confirm-premium.btn-info { background: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
          .btn-confirm-premium.btn-info:hover { background: #2563eb; transform: translateY(-2px); }

          .btn-confirm-premium.btn-success { background: #10b981; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
          .btn-confirm-premium.btn-success:hover { background: #059669; transform: translateY(-2px); }

          .btn-confirm-premium:active { transform: translateY(0); }
        `}</style>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
