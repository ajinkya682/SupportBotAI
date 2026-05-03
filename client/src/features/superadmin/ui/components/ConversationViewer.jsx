import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, User, Bot, Clock, AlertCircle, Loader2, Building, ShieldCheck, MessageSquare, ChevronDown } from 'lucide-react';
import { API_URL } from '../../../../shared/services/config';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
  ai_resolved: { label: 'AI Resolved', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  human_resolved: { label: 'Human Resolved', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fef3e2' },
  human_needed: { label: 'Urgent', color: 'var(--color-error)', bg: 'var(--color-error-light)' },
};

const ConversationViewer = ({ conversationId, onClose }) => {
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const token = localStorage.getItem('superAdminToken');
        const res = await axios.get(`${API_URL}/api/super-admin/conversations/${conversationId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setConversation(res.data.conversation);
        else setError('Failed to load conversation');
      } catch {
        setError('Error loading conversation details.');
      } finally { setLoading(false); }
    };
    fetchConversation();
  }, [conversationId]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end', zIndex: 600 }}>
        <div style={{ width: '100%', maxWidth: '600px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="spin" size={32} style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end', zIndex: 600 }} onClick={onClose}>
        <div style={{ width: '100%', maxWidth: '600px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-10)' }}>
           <AlertCircle size={48} style={{ color: 'var(--color-error)', marginBottom: 'var(--space-6)' }} />
           <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>{error || 'Not Found'}</h3>
           <button className="btn btn-secondary" onClick={onClose}>Close Viewer</button>
        </div>
      </div>
    );
  }

  const s = statusConfig[conversation.status] || statusConfig.in_progress;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end', zIndex: 600 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ width: '100%', maxWidth: '600px', background: 'white', height: '100%', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ padding: 'var(--space-6) var(--space-8)', borderBottom: '1px solid var(--color-surface-container-low)', background: 'var(--color-surface-container-lowest)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                   <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-extrabold)' }}>Audit Viewer</h2>
                   <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', fontWeight: 'bold' }}>SESSION: #{conversation._id.substring(0, 8)}</span>
                </div>
             </div>
             <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-surface-container-low)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <X size={16} />
             </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--color-on-surface-muted)' }}>
                <Building size={14} /> {conversation.business?.name}
             </div>
             <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-surface-container)' }} />
             <span style={{ 
               fontSize: '10px', fontWeight: 'bold', padding: '2px 10px', borderRadius: 'var(--radius-full)',
               background: s.bg, color: s.color, textTransform: 'uppercase'
             }}>{s.label}</span>
          </div>
        </div>

        {/* Message Log */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', background: 'var(--color-surface-container-lowest)' }}>
          {conversation.messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
               <AlertCircle size={32} />
               <p style={{ fontSize: 'var(--text-sm)', marginTop: '8px' }}>Empty conversation transcript.</p>
            </div>
          ) : conversation.messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isAI = msg.senderType === 'ai';
            const senderName = isUser ? 'Customer' : (msg.senderName || (isAI ? 'Optical AI' : 'Agent'));
            
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '11px', fontWeight: 'bold', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', padding: '0 4px' }}>
                  {!isUser && (isAI ? <Bot size={12} style={{ color: 'var(--color-secondary)' }} /> : <User size={12} style={{ color: 'var(--color-primary)' }} />)}
                  {senderName}
                  {isUser && <User size={12} />}
                </div>
                <div style={{ 
                  maxWidth: '85%', padding: '12px 16px', borderRadius: 'var(--radius-xl)', fontSize: '14px', lineHeight: 1.5,
                  background: isUser ? 'white' : (isAI ? 'var(--color-secondary-light)' : 'var(--color-primary-light)'),
                  color: isUser ? 'var(--color-on-surface)' : (isAI ? 'var(--color-secondary)' : 'var(--color-primary)'),
                  border: `1px solid ${isUser ? 'var(--color-surface-container-low)' : 'transparent'}`,
                  boxShadow: isUser ? 'var(--shadow-sm)' : 'none',
                  borderTopRightRadius: isUser ? '4px' : 'var(--radius-xl)',
                  borderTopLeftRadius: !isUser ? '4px' : 'var(--radius-xl)'
                }}>
                  {msg.content}
                </div>
                <div style={{ marginTop: '4px', fontSize: '10px', color: 'var(--color-on-surface-muted)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px' }}>
                  <Clock size={10} /> {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Audit Tools */}
        <div style={{ padding: 'var(--space-6) var(--space-8)', borderTop: '1px solid var(--color-surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
           <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-on-surface-muted)' }}>
             Total Volume: {conversation.messages.length} messages
           </div>
           <button className="btn btn-secondary btn-sm" onClick={onClose}>Finish Audit</button>
        </div>
      </motion.div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ConversationViewer;
