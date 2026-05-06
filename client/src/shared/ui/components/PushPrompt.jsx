import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';

const PushPrompt = ({ isVisible, onEnable, onLater }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="push-prompt-container"
        >
          <div className="push-prompt-card">
            <button className="push-prompt-close" onClick={onLater}>
              <X size={18} />
            </button>
            <div className="push-prompt-icon">
              <Bell size={28} className="animate-bounce" />
            </div>
            <div className="push-prompt-content">
              <h3>Stay in the loop</h3>
              <p>Get instant notifications for new messages, tickets, and team activity — even when offline.</p>
            </div>
            <div className="push-prompt-actions">
              <button className="btn btn-primary" onClick={onEnable}>
                Enable Notifications
              </button>
              <button className="btn btn-ghost" onClick={onLater}>
                Maybe Later
              </button>
            </div>
          </div>

          <style>{`
            .push-prompt-container {
              position: fixed;
              bottom: 24px;
              left: 24px;
              z-index: 10000;
              width: 320px;
            }
            .push-prompt-card {
              background: white;
              padding: 24px;
              border-radius: 20px;
              box-shadow: 0 20px 50px rgba(0,0,0,0.15);
              border: 1px solid #e2e8f0;
              position: relative;
              text-align: center;
            }
            .push-prompt-close {
              position: absolute;
              top: 12px;
              right: 12px;
              background: none;
              border: none;
              color: #94a3b8;
              cursor: pointer;
            }
            .push-prompt-icon {
              width: 56px;
              height: 56px;
              background: #f1f5f9;
              border-radius: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px;
              color: var(--primary);
            }
            .push-prompt-content h3 {
              font-size: 1.1rem;
              font-weight: 800;
              margin-bottom: 8px;
              color: #1e293b;
            }
            .push-prompt-content p {
              font-size: 0.85rem;
              color: #64748b;
              line-height: 1.5;
              margin-bottom: 20px;
            }
            .push-prompt-actions {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .push-prompt-actions .btn {
              width: 100%;
              padding: 10px;
              font-size: 0.85rem;
              font-weight: 700;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PushPrompt;
