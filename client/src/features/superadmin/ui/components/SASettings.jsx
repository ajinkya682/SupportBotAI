import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Save, Lock, Globe, 
  Database, Shield, MessageSquare, 
  DollarSign, Loader2, RefreshCcw
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';

const SASettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    platformName: 'SupportBot AI',
    proPlanPrice: 49,
    freeConversationLimit: 100,
    proConversationLimit: 999999,
    maintenanceMode: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.get(`${API_URL}/super-admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setConfig(data.settings);
      }
    } catch (err) {
      toast.error('Failed to load system config');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.put(`${API_URL}/super-admin/settings`, config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success('System configuration updated');
      }
    } catch (err) {
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.put(`${API_URL}/super-admin/settings/change-password`, 
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Admin password updated');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    }
  };

  if (isLoading) {
    return (
      <div className="sa-loading-view">
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
        <p>Accessing System Core...</p>
      </div>
    );
  }

  return (
    <div className="sa-view-container animate-fade-in">
      <header className="sa-view-header">
        <div className="header-text-block">
          <h1>System Config</h1>
          <p>Global platform constants, security parameters, and limits.</p>
        </div>
      </header>

      <div className="sa-settings-grid">
        <div className="sa-settings-main">
          <form className="card" onSubmit={handleSaveConfig}>
            <div className="sa-card-header">
              <h3><Globe size={18} /> General Settings</h3>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving}>
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Changes</span>
              </button>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Platform Name</label>
                <input 
                  type="text" 
                  value={config.platformName} 
                  onChange={(e) => setConfig({...config, platformName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Pro Plan Monthly Price ($)</label>
                <div className="input-with-icon">
                  <DollarSign size={16} />
                  <input 
                    type="number" 
                    value={config.proPlanPrice} 
                    onChange={(e) => setConfig({...config, proPlanPrice: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="sa-divider" />

            <div className="sa-card-header">
              <h3><MessageSquare size={18} /> Usage Limits</h3>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Free Plan Conversation Limit</label>
                <input 
                  type="number" 
                  value={config.freeConversationLimit} 
                  onChange={(e) => setConfig({...config, freeConversationLimit: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Pro Plan Conversation Limit</label>
                <input 
                  type="number" 
                  value={config.proConversationLimit} 
                  onChange={(e) => setConfig({...config, proConversationLimit: e.target.value})}
                />
              </div>
            </div>
          </form>

          <div className="card sa-danger-zone">
            <div className="sa-card-header">
              <h3><Shield size={18} /> Security & System</h3>
            </div>
            <div className="danger-item">
              <div className="danger-info">
                <strong>Maintenance Mode</strong>
                <p>Restrict access to the platform for all users during updates.</p>
              </div>
              <div className="sa-toggle">
                <input 
                  type="checkbox" 
                  id="m-mode" 
                  checked={config.maintenanceMode} 
                  onChange={(e) => setConfig({...config, maintenanceMode: e.target.checked})}
                />
                <label htmlFor="m-mode"></label>
              </div>
            </div>
            <div className="danger-item">
              <div className="danger-info">
                <strong>Clear System Cache</strong>
                <p>Invalidate all global cache entries for AI models and CDN.</p>
              </div>
              <button className="btn btn-secondary btn-sm"><RefreshCcw size={14} /> Clear</button>
            </div>
          </div>
        </div>

        <div className="sa-settings-side">
          <form className="card" onSubmit={handleChangePassword}>
            <div className="sa-card-header">
              <h3><Lock size={18} /> Admin Security</h3>
            </div>
            <p className="side-desc">Update your master administrative credentials.</p>
            
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn btn-secondary w-full">Update Password</button>
          </form>

          <div className="card sa-info-card">
            <div className="sa-card-header">
              <h3><Database size={18} /> Instance Info</h3>
            </div>
            <div className="info-row">
              <span>Core Version</span>
              <strong>v2.4.0-pro</strong>
            </div>
            <div className="info-row">
              <span>Database</span>
              <strong>MongoDB Cluster</strong>
            </div>
            <div className="info-row">
              <span>Environment</span>
              <strong style={{ color: '#10b981' }}>Production</strong>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sa-settings-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) { .sa-settings-grid { grid-template-columns: 1fr 340px; } }
        
        .sa-settings-main { display: flex; flex-direction: column; gap: 24px; }
        .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        
        .input-with-icon { position: relative; }
        .input-with-icon svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--outline); }
        .input-with-icon input { padding-left: 40px; }
        
        .sa-divider { height: 1px; background: var(--outline-variant); margin: 8px 0 24px; }
        
        .danger-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--surface-container-highest); }
        .danger-item:last-child { border-bottom: none; padding-bottom: 0; }
        .danger-info strong { display: block; font-size: 0.9rem; margin-bottom: 4px; }
        .danger-info p { font-size: 0.8rem; color: var(--on-surface-variant); margin: 0; max-width: 400px; }
        
        .side-desc { font-size: 0.8rem; color: var(--on-surface-variant); margin-bottom: 24px; line-height: 1.5; }
        
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--surface-container-highest); font-size: 0.85rem; }
        .info-row:last-child { border-bottom: none; }
        .info-row span { color: var(--on-surface-variant); font-weight: 600; }
        
        .sa-toggle { position: relative; width: 44px; height: 24px; }
        .sa-toggle input { opacity: 0; width: 0; height: 0; }
        .sa-toggle label { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--outline-variant); transition: .4s; border-radius: 24px; }
        .sa-toggle label:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        .sa-toggle input:checked + label { background-color: var(--primary); }
        .sa-toggle input:checked + label:before { transform: translateX(20px); }
      `}</style>
    </div>
  );
};

export default SASettings;
