import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Building2, Users, MessageSquare, User, Mail, Calendar, Loader2, ShieldCheck, Activity, ChevronRight, Hash } from 'lucide-react';
import { API_URL } from '../../../../shared/services/config';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig = {
  ai_resolved: { label: 'AI Resolved', color: 'var(--color-secondary)', bg: 'var(--color-secondary-light)' },
  human_resolved: { label: 'Resolved', color: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: '#fef3e2' },
  human_needed: { label: 'Urgent', color: 'var(--color-error)', bg: 'var(--color-error-light)' },
};

const BusinessDetailModal = ({ businessId, onClose, onPlanChange }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('superAdminToken');
        const res = await axios.get(`${API_URL}/api/super-admin/businesses/${businessId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) setDetails(res.data.business);
      } catch (error) { console.error("Failed to fetch business details", error); }
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [businessId]);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end', zIndex: 500 }}>
        <div style={{ width: '100%', maxWidth: '580px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="spin" size={32} style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end', zIndex: 500 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ width: '100%', maxWidth: '580px', background: 'white', height: '100%', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--color-surface-container)' }}
      >
        {/* Header */}
        <div style={{ padding: 'var(--space-6) var(--space-8)', borderBottom: '1px solid var(--color-surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>Profile Details</h2>
              <span style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', fontWeight: 'bold' }}>REF: {businessId.substring(0, 8)}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-surface-container-low)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
          
          {/* Main Info Card */}
          <div className="card" style={{ padding: 'var(--space-8)', background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container-low)' }}>
             <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-2xl)', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white', boxShadow: 'var(--shadow-lg)' }}>
                  {details.logo ? <img src={details.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Building2 size={40} style={{ color: 'var(--color-primary)' }} />}
                </div>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)' }}>{details.name}</h3>
                      <span style={{ 
                        fontSize: '10px', fontWeight: 'bold', padding: '2px 10px', borderRadius: 'var(--radius-full)',
                        background: details.plan === 'pro' ? 'var(--color-secondary-light)' : 'var(--color-surface-container-low)',
                        color: details.plan === 'pro' ? 'var(--color-secondary)' : 'var(--color-on-surface-muted)',
                        textTransform: 'uppercase'
                      }}>{details.plan}</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)' }}>
                      <Calendar size={14} /> Joined {new Date(details.createdAt).toLocaleDateString()}
                   </div>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <div style={{ padding: 'var(--space-4)', background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-container-low)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface-muted)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                      <User size={14} /> Owner Identity
                   </div>
                   <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{details.ownerName}</div>
                   <div style={{ fontSize: '12px', color: 'var(--color-on-surface-muted)' }}>{details.ownerEmail}</div>
                </div>
                <div style={{ padding: 'var(--space-4)', background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-container-low)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface-muted)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>
                      <ShieldCheck size={14} /> Security
                   </div>
                   <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Verified Account</div>
                   <div style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>Status: Active</div>
                </div>
             </div>
          </div>

          {/* Section: Support Team */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
               <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                 <Users size={18} /> Support Personnel ({details.agents.length})
               </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {details.agents.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)', borderStyle: 'dashed' }}>No agents added by this business.</div>
              ) : details.agents.map(agent => (
                <div key={agent._id} style={{ padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container-low)', borderRadius: 'var(--radius-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>{agent.name.charAt(0)}</div>
                      <div>
                         <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{agent.name}</div>
                         <div style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{agent.email}</div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: agent.status === 'online' ? 'var(--color-secondary)' : 'var(--color-on-surface-muted)' }} />
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: agent.status === 'online' ? 'var(--color-secondary)' : 'var(--color-on-surface-muted)', textTransform: 'uppercase' }}>{agent.status}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Activity */}
          <div>
            <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <Activity size={18} /> Activity Log
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {details.recentConversations.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-on-surface-muted)', fontSize: 'var(--text-sm)', borderStyle: 'dashed' }}>No activity history found.</div>
              ) : details.recentConversations.map(conv => {
                const s = statusConfig[conv.status] || statusConfig.in_progress;
                return (
                  <div key={conv._id} style={{ padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-surface-container-low)', borderRadius: 'var(--radius-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div style={{ color: 'var(--color-on-surface-muted)' }}>
                           <MessageSquare size={16} />
                        </div>
                        <div>
                           <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{conv.title || 'Support Session'}</div>
                           <div style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{new Date(conv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} · {conv.messages.length} msgs</div>
                        </div>
                     </div>
                     <span style={{ fontSize: '9px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px', background: s.bg, color: s.color, textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: 'var(--space-6) var(--space-8)', borderTop: '1px solid var(--color-surface-container-low)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', background: 'var(--color-surface-container-lowest)' }}>
           <button className="btn btn-secondary" onClick={onClose}>Close Profile</button>
           <button className="btn btn-primary">Archive Account</button>
        </div>
      </motion.div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BusinessDetailModal;
