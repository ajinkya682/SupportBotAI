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

      <style>{`
        .physical-ticket {
          background: #fdfbf7;
          border: 1px solid #e5e1d8;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          position: relative;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          margin-bottom: 16px;
        }

        .physical-ticket::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: repeating-linear-gradient(90deg, #e5e1d8, #e5e1d8 10px, transparent 10px, transparent 20px);
        }

        .ticket-header {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed #e5e1d8;
          background: rgba(0,0,0,0.02);
        }

        .ticket-id {
          font-size: 0.65rem;
          font-weight: 800;
          color: #a3a3a3;
          letter-spacing: 0.05em;
        }
        
        .sla-tag {
          font-size: 0.6rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .ticket-priority {
          font-size: 0.6rem;
          font-weight: 900;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
        .ticket-priority[data-priority="high"] { background: #fee2e2; color: #ef4444; }
        .ticket-priority[data-priority="medium"] { background: #fef3c7; color: #f59e0b; }
        .ticket-priority[data-priority="low"] { background: #f1f5f9; color: #64748b; }

        .ticket-body {
          display: flex;
          min-height: 140px;
        }

        .ticket-main {
          flex: 1;
          padding: 16px;
          border-right: 1px dashed #e5e1d8;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .avatar-sm {
          width: 28px;
          height: 28px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .user-details .name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
        }

        .user-details .meta {
          font-size: 0.65rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .intent-tag {
          text-transform: capitalize;
        }

        .issue-section h4 {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .issue-section .summary {
          font-size: 0.8rem;
          line-height: 1.4;
          color: #475569;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ticket-stub {
          width: 120px;
          background: #f8f9fa;
          padding: 12px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .ticket-stub::before, .ticket-stub::after {
          content: '';
          position: absolute;
          left: -6px;
          width: 12px;
          height: 12px;
          background: #fdfbf7;
          border-radius: 50%;
          border: 1px solid #e5e1d8;
        }
        .ticket-stub::before { top: -7px; }
        .ticket-stub::after { bottom: -7px; }

        .status-stamp {
          border: 2px solid;
          padding: 4px 6px;
          font-size: 0.6rem;
          font-weight: 900;
          border-radius: 4px;
          transform: rotate(-12deg);
          margin-bottom: 12px;
          text-align: center;
          letter-spacing: 0.02em;
        }

        .stub-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 16px;
        }

        .stub-meta span {
          font-size: 0.5rem;
          font-weight: 700;
          color: #94a3b8;
          text-align: center;
        }

        .take-over-btn {
          width: 100%;
          background: #1e293b;
          color: white;
          border: none;
          padding: 6px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: 0.2s;
        }

        .take-over-btn:hover {
          background: #0f172a;
          transform: translateY(-1px);
        }
      `}</style>
    </motion.div>
  );
}
