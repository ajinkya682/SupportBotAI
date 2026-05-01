import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Users, User as UserIcon, CheckCircle2, Inbox, Loader2, Megaphone, Bell, History, Search, ChevronRight } from 'lucide-react';
import { API_URL } from '../../../../shared/services/config';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const [businesses, setBusinesses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('broadcast');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [searchBusiness, setSearchBusiness] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [busRes, histRes] = await Promise.all([
        axios.get(`${API_URL}/api/super-admin/businesses`, config),
        axios.get(`${API_URL}/api/super-admin/notifications/history`, config)
      ]);
      if (busRes.data.success) setBusinesses(busRes.data.businesses);
      if (histRes.data.success) setHistory(histRes.data.history);
    } catch (error) { console.error("Error fetching notification data", error); }
    finally { setLoading(false); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject || !message) return;
    if (mode === 'targeted' && !selectedBusiness) return;
    setSending(true); setSuccessMsg('');
    try {
      const token = localStorage.getItem('superAdminToken');
      const endpoint = mode === 'broadcast' ? `${API_URL}/api/super-admin/notifications/broadcast` : `${API_URL}/api/super-admin/notifications/targeted`;
      const payload = mode === 'broadcast' ? { subject, message } : { businessId: selectedBusiness, subject, message };
      const res = await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setSuccessMsg('Notification dispatched successfully!');
        setSubject(''); setMessage(''); setSelectedBusiness(''); setSearchBusiness('');
        fetchData();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (error) { console.error("Error sending notification", error); }
    finally { setSending(false); }
  };

  const filteredBusinesses = businesses.filter(b =>
    b.name.toLowerCase().includes(searchBusiness.toLowerCase()) || b.ownerEmail.toLowerCase().includes(searchBusiness.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>Communications</h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Broadcast platform updates or send targeted alerts to businesses.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-10)', alignItems: 'start' }}>
        {/* Composer */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-surface-container-low)', background: 'var(--color-surface-container-lowest)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Megaphone size={18} />
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>New Notification</h3>
            </div>
            
            <div style={{ display: 'flex', background: 'var(--color-surface-container-low)', padding: '2px', borderRadius: 'var(--radius-lg)' }}>
              {['broadcast', 'targeted'].map(m => (
                <button 
                  key={m} onClick={() => setMode(m)}
                  style={{ 
                    padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                    background: mode === m ? 'white' : 'transparent', color: mode === m ? 'var(--color-primary)' : 'var(--color-on-surface-muted)',
                    boxShadow: mode === m ? 'var(--shadow-sm)' : 'none', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSend} style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <AnimatePresence>
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  style={{ padding: 'var(--space-4)', background: 'var(--color-secondary-light)', color: 'var(--color-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 'bold' }}
                >
                  <CheckCircle2 size={18} /> {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'targeted' && (
              <div className="input-wrapper">
                <label className="input-label">Select Business Recipient</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-on-surface-muted)' }} />
                    <input 
                      type="text" placeholder="Search by name or email..." 
                      value={searchBusiness} onChange={e => setSearchBusiness(e.target.value)} 
                      className="input-field" style={{ paddingLeft: '36px' }} 
                    />
                  </div>
                  {searchBusiness && filteredBusinesses.length > 0 && !selectedBusiness && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'white', border: '1px solid var(--color-surface-container)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', zIndex: 50, maxHeight: '220px', overflowY: 'auto' }}>
                      {filteredBusinesses.map(b => (
                        <div 
                          key={b.id} onClick={() => { setSelectedBusiness(b.id); setSearchBusiness(b.name); }}
                          style={{ padding: 'var(--space-4)', cursor: 'pointer', borderBottom: '1px solid var(--color-surface-container-low)', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container-low)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>{b.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)' }}>{b.ownerEmail}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedBusiness && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary)' }}>Recipient: {searchBusiness}</span>
                      <button type="button" onClick={() => { setSelectedBusiness(''); setSearchBusiness(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="input-wrapper">
              <label className="input-label">Subject</label>
              <input type="text" className="input-field" placeholder="Brief descriptive title..." value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>

            <div className="input-wrapper">
              <label className="input-label">Message Content</label>
              <textarea className="input-field" rows={6} placeholder="Describe the update or alert in detail..." value={message} onChange={e => setMessage(e.target.value)} style={{ resize: 'none' }} required />
            </div>

            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-surface-container-low)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className={`btn btn-primary${sending ? ' btn-loading' : ''}`} disabled={sending || (mode === 'targeted' && !selectedBusiness)}>
                {!sending && <><Send size={18} /> {mode === 'broadcast' ? 'Broadcast to All' : 'Send Notification'}</>}
              </button>
            </div>
          </form>
        </div>

        {/* Recent History Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-on-surface-muted)' }}>
            <History size={16} />
            <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Dispatch Log</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {history.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', opacity: 0.6 }}>
                <Bell size={24} style={{ margin: '0 auto 8px', color: 'var(--color-on-surface-muted)' }} />
                <p style={{ fontSize: '12px' }}>No history yet.</p>
              </div>
            ) : history.slice(0, 5).map(h => (
              <div key={h.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ background: h.recipient.includes('Broadcast') ? 'var(--color-primary-light)' : 'var(--color-surface-container-low)', color: h.recipient.includes('Broadcast') ? 'var(--color-primary)' : 'var(--color-on-surface-muted)', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                    {h.recipient.includes('Broadcast') ? 'BROADCAST' : 'TARGETED'}
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--color-on-surface-muted)' }}>{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', margin: 0 }}>{h.subject}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ flex: 1, background: 'var(--color-surface-container-low)', height: '4px', borderRadius: 'full', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--color-secondary)', height: '100%', width: `${(h.readCount / h.totalRecipients) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{Math.round((h.readCount / h.totalRecipients) * 100)}% read</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Notifications;
