import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Delete", 
  cancelText = "Cancel",
  type = "danger" // danger, warning, info
}) => {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: 'var(--error-container)',
      text: 'var(--error)',
      btn: 'bg-red-600 hover:bg-red-700',
      icon: <AlertCircle className="text-red-600" size={24} />
    },
    warning: {
      bg: 'var(--warning-container)',
      text: 'var(--warning)',
      btn: 'bg-amber-600 hover:bg-amber-700',
      icon: <AlertCircle className="text-amber-600" size={24} />
    },
    info: {
      bg: 'var(--primary-low)',
      text: 'var(--primary)',
      btn: 'bg-blue-600 hover:bg-blue-700',
      icon: <AlertCircle className="text-blue-600" size={24} />
    }
  };

  const style = colors[type] || colors.danger;

  return (
    <AnimatePresence>
      <div className="confirm-modal-overlay">
        <motion.div 
          className="confirm-modal-surface"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="confirm-modal-header">
            <div className="confirm-icon-wrap" style={{ background: style.bg }}>
              {style.icon}
            </div>
            <button className="confirm-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="confirm-modal-body">
            <h3>{title}</h3>
            <p>{message}</p>
          </div>

          <div className="confirm-modal-footer">
            <button className="btn-cancel" onClick={onClose}>
              {cancelText}
            </button>
            <button 
              className={`btn-confirm ${type}`} 
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>

        <style>{`
          .confirm-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .confirm-modal-surface {
            background: white;
            width: 100%;
            max-width: 400px;
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.05);
          }

          .confirm-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }

          .confirm-icon-wrap {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .confirm-close {
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            padding: 4px;
            border-radius: 8px;
            transition: 0.2s;
          }

          .confirm-close:hover {
            background: #f1f5f9;
            color: #64748b;
          }

          .confirm-modal-body h3 {
            font-size: 1.25rem;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 8px;
          }

          .confirm-modal-body p {
            color: #64748b;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 32px;
          }

          .confirm-modal-footer {
            display: flex;
            gap: 12px;
          }

          .btn-cancel {
            flex: 1;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            background: white;
            color: #64748b;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            transition: 0.2s;
          }

          .btn-cancel:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
          }

          .btn-confirm {
            flex: 2;
            padding: 12px;
            border-radius: 12px;
            border: none;
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            transition: 0.2s;
          }

          .btn-confirm.danger {
            background: #ef4444;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
          }

          .btn-confirm.danger:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }

          .btn-confirm.warning {
            background: #f59e0b;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
          }

          .btn-confirm.warning:hover {
            background: #d97706;
          }

          .btn-confirm.info {
            background: #3b82f6;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
          }

          .btn-confirm.info:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
