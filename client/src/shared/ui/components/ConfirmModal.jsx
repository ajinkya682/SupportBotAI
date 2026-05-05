import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", type = "danger" }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-content confirm-modal"
        >
          <div className="modal-header">
            <div className={`modal-icon-wrapper ${type}`}>
              <AlertTriangle size={20} />
            </div>
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose}><X size={20} /></button>
          </div>
          
          <div className="modal-body">
            <p>{message}</p>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button 
              className={`btn-${type === 'danger' ? 'danger' : 'primary'}`} 
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
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }
          .modal-content.confirm-modal {
            background: white;
            border-radius: 20px;
            width: 100%;
            max-width: 400px;
            padding: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          .modal-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
            position: relative;
          }
          .modal-icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .modal-icon-wrapper.danger { background: #fee2e2; color: #ef4444; }
          .modal-icon-wrapper.primary { background: #e0e7ff; color: #4f46e5; }
          
          .modal-header h3 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; flex: 1; }
          .modal-close { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 4px; border-radius: 8px; }
          .modal-close:hover { background: #f1f5f9; }
          
          .modal-body p { color: #64748b; line-height: 1.6; margin: 0; font-size: 0.95rem; }
          
          .modal-footer { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
          
          .btn-secondary { padding: 10px 20px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #475569; font-weight: 600; cursor: pointer; transition: 0.2s; }
          .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
          
          .btn-danger { padding: 10px 20px; border-radius: 10px; border: none; background: #ef4444; color: white; font-weight: 600; cursor: pointer; transition: 0.2s; }
          .btn-danger:hover { background: #dc2626; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
          
          .btn-primary { padding: 10px 20px; border-radius: 10px; border: none; background: #4f46e5; color: white; font-weight: 600; cursor: pointer; transition: 0.2s; }
          .btn-primary:hover { background: #4338ca; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
        `}</style>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
