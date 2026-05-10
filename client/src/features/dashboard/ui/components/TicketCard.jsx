import React from 'react';
import { 
  User, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  UserCheck, 
  Stamp,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function TicketCard({ ticket, onTakeOver, actionLabel, onAction }) {
  const { 
    userName, 
    issueSummary, 
    createdAt, 
    routingStatus, 
    priority,
    intent,
    title,
    status
  } = ticket;

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = () => {
    switch (routingStatus) {
      case 'pending': return '#ef4444'; // Red - offline
      case 'holding': return '#f59e0b'; // Amber - busy
      case 'assigned': return '#3b82f6'; // Blue - sent to agent
      default: return '#94a3b8';
    }
  };

  const getStatusLabel = () => {
    switch (routingStatus) {
      case 'pending': return 'OFFLINE QUEUE';
      case 'holding': return 'BUSY QUEUE';
      case 'assigned': return 'ASSIGNED';
      default: return routingStatus.toUpperCase();
    }
  };

  const getSLAStatus = (date) => {
    const minutes = Math.floor((new Date() - new Date(date)) / 60000);
    if (minutes < 5) return { label: 'ON TRACK', color: '#10b981' };
    if (minutes < 15) return { label: 'DUE SOON', color: '#f59e0b' };
    return { label: 'OVERDUE', color: '#ef4444' };
  };

  const sla = getSLAStatus(createdAt);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="physical-ticket"
    >
      <div className="ticket-header">
        <div className="ticket-id">LOG-{ticket._id.substring(18).toUpperCase()}</div>
        <div className="sla-tag" style={{ background: `${sla.color}15`, color: sla.color }}>
          <AlertCircle size={10} /> {sla.label}
        </div>
        <div className="ticket-priority" data-priority={priority || 'medium'}>{priority?.toUpperCase() || 'MEDIUM'}</div>
      </div>

      <div className="ticket-body">
        <div className="ticket-main">
          <div className="user-info">
            <div className="avatar-sm">
              {userName?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div className="user-details">
              <div className="name">{userName || 'Visitor'}</div>
              <div className="meta">
                <Clock size={10} /> Queued {getTimeAgo(createdAt)}
                {intent && <span className="intent-tag"> • {intent.replace('_', ' ')}</span>}
              </div>
            </div>
          </div>

          <div className="issue-section">
             <h4>{title || 'Customer Escalation'}</h4>
             <p className="summary">{issueSummary || 'Customer is awaiting response from a live agent. Initializing support protocol...'}</p>
          </div>
        </div>

        <div className="ticket-stub">
          <div className="stub-content">
            <div className="status-stamp" style={{ borderColor: getStatusColor(), color: getStatusColor() }}>
              {getStatusLabel()}
            </div>
            <div className="stub-meta">
              <span>CREATED: {new Date(createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <span>REF: 0X-{ticket._id.slice(-4).toUpperCase()}</span>
            </div>
            <button 
              className="take-over-btn" 
              onClick={() => onAction ? onAction(ticket) : onTakeOver(ticket)}
            >
              {actionLabel || 'Intercept'} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="ticket-serration"></div>

      <style>{`
        .physical-ticket {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px 16px 4px 4px;
          overflow: visible;
          box-shadow: var(--shadow-2);
          position: relative;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          margin-bottom: 24px;
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .physical-ticket:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: var(--shadow-4);
          border-color: var(--primary-low);
        }

        .physical-ticket::before {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          height: 6px;
          background: var(--primary);
          border-radius: 16px 16px 0 0;
        }

        .ticket-header {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px dashed #edf2f7;
          background: #fafafa;
          border-radius: 16px 16px 0 0;
        }

        .ticket-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.1em;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 4px;
        }
        
        .sla-tag {
          font-size: 0.65rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: 0.02em;
        }

        .ticket-priority {
          font-size: 0.6rem;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.05em;
          box-shadow: inset 0 0 0 1px currentColor;
        }
        .ticket-priority[data-priority="high"] { background: #fff1f2; color: #e11d48; }
        .ticket-priority[data-priority="medium"] { background: #fffbeb; color: #d97706; }
        .ticket-priority[data-priority="low"] { background: #f0fdf4; color: #16a34a; }

        .ticket-body {
          display: flex;
          min-height: 160px;
        }

        .ticket-main {
          flex: 1;
          padding: 24px;
          border-right: 2px dashed #edf2f7;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .avatar-sm {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--primary), var(--primary-low));
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 800;
          box-shadow: 0 4px 6px -1px rgba(var(--primary-rgb), 0.2);
        }

        .user-details .name {
          font-size: 1rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.01em;
        }

        .user-details .meta {
          font-size: 0.75rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
          font-weight: 500;
        }

        .intent-tag {
          color: var(--primary);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.65rem;
        }

        .issue-section h4 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .issue-section .summary {
          font-size: 0.9rem;
          line-height: 1.6;
          color: #475569;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ticket-stub {
          width: 140px;
          background: #fafafa;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        .ticket-stub::before, .ticket-stub::after {
          content: '';
          position: absolute;
          left: -10px;
          width: 20px;
          height: 20px;
          background: var(--surface);
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          z-index: 2;
        }
        .ticket-stub::before { top: -11px; }
        .ticket-stub::after { bottom: -11px; }

        .status-stamp {
          border: 3px solid;
          padding: 6px 10px;
          font-size: 0.7rem;
          font-weight: 900;
          border-radius: 4px;
          transform: rotate(-15deg);
          text-align: center;
          letter-spacing: 0.05em;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.05);
          opacity: 0.8;
          margin-top: 10px;
        }

        .stub-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin: 20px 0;
        }

        .stub-meta span {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.6rem;
          font-weight: 700;
          color: #94a3b8;
          text-align: center;
        }

        .take-over-btn {
          width: 100%;
          background: #1e293b;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: 0.2s;
        }

        .take-over-btn:hover {
          background: #000;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .ticket-serration {
          height: 12px;
          background: radial-gradient(circle, transparent, transparent 6px, #ffffff 6px, #ffffff) 0 -6px;
          background-size: 12px 12px;
          width: 100%;
          position: absolute;
          bottom: -6px;
          left: 0;
          filter: drop-shadow(0 4px 2px rgba(0,0,0,0.05));
        }
      `}</style>
    </motion.div>
  );
}
