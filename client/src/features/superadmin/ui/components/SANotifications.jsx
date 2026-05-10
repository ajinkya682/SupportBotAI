import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Send, Users, Building2, 
  History, Clock, CheckCircle2, AlertCircle,
  Loader2, Trash2, Megaphone
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';

const SANotifications = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  
  const [formData, setFormData] = useState({
    type: 'broadcast',
    businessId: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchHistory();
    fetchBusinesses();
  }, []);

  const fetchHistory = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.get(`${API_URL}/super-admin/notifications/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setHistory(data.history);
    } catch (err) {
      toast.error('Failed to load notification history');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.get(`${API_URL}/super-admin/businesses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setBusinesses(data.businesses);
    } catch (err) {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      return toast.error('Please fill in all fields');
    }

    setIsSending(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const endpoint = formData.type === 'broadcast' ? 'broadcast' : 'targeted';
      const { data } = await axios.post(`${API_URL}/super-admin/notifications/${endpoint}`, 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success('Notification sent successfully');
        setFormData({ ...formData, subject: '', message: '' });
        fetchHistory();
      }
    } catch (err) {
      toast.error('Failed to send notification');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sa-loading-view">
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Connecting to Broadcast Network...</p>
      </div>
    );
  }

  return (
    <div className="sa-view-container animate-fade-in">
      <header className="sa-view-header">
        <div className="header-text-block">
          <h1>System Broadcasts</h1>
          <p>Send announcements or direct messages to business owners.</p>
        </div>
      </header>

      <div className="sa-notif-grid">
        <div className="sa-compose-panel">
          <form className="card sa-compose-form" onSubmit={handleSend}>
            <div className="sa-card-header">
              <h3><Megaphone size={18} /> Compose Notification</h3>
            </div>

            <div className="form-group">
              <label>Target Audience</label>
              <div className="sa-radio-group">
                <label className={`sa-radio-label ${formData.type === 'broadcast' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="type" 
                    value="broadcast" 
                    checked={formData.type === 'broadcast'} 
                    onChange={() => setFormData({...formData, type: 'broadcast', businessId: ''})} 
                  />
                  <Users size={16} />
                  <span>All Business Owners</span>
                </label>
                <label className={`sa-radio-label ${formData.type === 'targeted' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="type" 
                    value="targeted" 
                    checked={formData.type === 'targeted'} 
                    onChange={() => setFormData({...formData, type: 'targeted'})} 
                  />
                  <Building2 size={16} />
                  <span>Specific Client</span>
                </label>
              </div>
            </div>

            {formData.type === 'targeted' && (
              <div className="form-group animate-slide-down">
                <label>Select Client Account</label>
                <select 
                  value={formData.businessId} 
                  onChange={(e) => setFormData({...formData, businessId: e.target.value})}
                  required
                >
                  <option value="">Choose an owner account...</option>
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name} — Owner: {b.ownerName || b.ownerEmail}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Subject</label>
              <input 
                type="text" 
                placeholder="e.g. Scheduled Maintenance Notice" 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Message Content</label>
              <textarea 
                placeholder="Write your announcement here..." 
                rows="5"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary sa-send-btn" disabled={isSending}>
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              <span>Dispatch Message</span>
            </button>
          </form>
        </div>

        <div className="sa-history-panel">
          <div className="card sa-history-card">
            <div className="sa-card-header">
              <h3><History size={18} /> Broadcast History</h3>
            </div>
            <div className="sa-history-list">
              {history.map((n, i) => (
                <div key={n.id} className="sa-history-item">
                  <div className="item-header">
                    <span className="item-subject">{n.subject}</span>
                    <span className="item-date">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="item-msg">{n.message}</p>
                  <div className="item-footer">
                    <span className="item-target">To: {n.recipient}</span>
                    <span className="item-read">{n.readCount} / {n.totalRecipients} Read</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="sa-empty-history">
                  <Bell size={40} opacity={0.1} />
                  <p>No messages sent yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sa-notif-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) { .sa-notif-grid { grid-template-columns: 450px 1fr; } }
        
        .sa-radio-group { display: flex; gap: 12px; }
        .sa-radio-label { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 1.5px solid var(--outline-variant); border-radius: 12px; cursor: pointer; transition: 0.2s; font-weight: 700; font-size: 0.85rem; color: var(--on-surface-variant); }
        .sa-radio-label input { display: none; }
        .sa-radio-label.active { border-color: var(--primary); background: var(--primary-fixed); color: var(--primary); }
        
        .sa-send-btn { width: 100%; margin-top: 12px; height: 52px; font-size: 1rem; }
        
        .sa-history-list { display: flex; flex-direction: column; gap: 16px; max-height: 600px; overflow-y: auto; padding-right: 8px; }
        .sa-history-item { padding: 16px; background: var(--surface-container-low); border-radius: 12px; border: 1px solid var(--outline-variant); }
        .item-header { display: flex; justify-content: space-between; margin-bottom: 8px; align-items: center; }
        .item-subject { font-weight: 700; font-size: 0.9rem; color: var(--on-surface); }
        .item-date { font-size: 0.75rem; color: var(--outline); font-weight: 600; }
        .item-msg { font-size: 0.85rem; color: var(--on-surface-variant); line-height: 1.5; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .item-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--outline-variant); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--outline); letter-spacing: 0.05em; }
        
        .sa-empty-history { text-align: center; padding: 60px; color: var(--outline); }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default SANotifications;
