import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Lock, CheckCircle2, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../../../../shared/services/config';

const Settings = () => {
  const [settings, setSettings] = useState({
    platformName: '',
    proPlanPrice: 29,
    freeConversationLimit: 100,
    proConversationLimit: 999999
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const res = await axios.get(`${API_URL}/api/super-admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.settings) {
        setSettings({
          platformName: res.data.settings.platformName || 'SupportBotAI',
          proPlanPrice: res.data.settings.proPlanPrice || 29,
          freeConversationLimit: res.data.settings.freeConversationLimit || 100,
          proConversationLimit: res.data.settings.proConversationLimit || 999999
        });
      }
    } catch (error) {
      console.error("Error fetching settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('superAdminToken');
      const res = await axios.put(`${API_URL}/api/super-admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setSettingsMsg({ type: 'success', text: 'Platform settings saved successfully!' });
        setTimeout(() => setSettingsMsg({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setSettingsMsg({ type: 'error', text: 'Failed to save settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
    }
    if (passwords.newPassword.length < 6) {
      return setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
    }

    setSavingPassword(true);

    try {
      const token = localStorage.getItem('superAdminToken');
      const res = await axios.put(`${API_URL}/api/super-admin/settings/change-password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setPasswordMsg({ type: 'error', text: error.response?.data?.message || 'Failed to change password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-20)' }}>
        <Loader2 className="spin" size={32} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', maxWidth: '900px' }}>
      {/* Platform Configuration */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-surface-container-low)', background: 'var(--color-surface-container-lowest)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>Platform Configuration</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)' }}>Manage global defaults and business tier limits.</p>
        </div>

        <form onSubmit={handleSettingsSubmit} style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {settingsMsg.text && (
            <div style={{ 
              padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', 
              background: settingsMsg.type === 'success' ? 'var(--color-secondary-light)' : 'var(--color-error-light)',
              color: settingsMsg.type === 'success' ? 'var(--color-secondary)' : 'var(--color-error)',
              border: `1px solid ${settingsMsg.type === 'success' ? 'var(--color-secondary-light)' : 'var(--color-error-light)'}`
            }}>
              {settingsMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{settingsMsg.text}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            <div className="input-wrapper">
              <label className="input-label">Platform Branding Name</label>
              <input className="input-field" type="text" value={settings.platformName} onChange={e => setSettings({ ...settings, platformName: e.target.value })} required />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Pro Plan Monthly Price ($)</label>
              <input className="input-field" type="number" min="0" step="1" value={settings.proPlanPrice} onChange={e => setSettings({ ...settings, proPlanPrice: Number(e.target.value) })} required />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Free Plan Monthly Conversation Limit</label>
              <input className="input-field" type="number" min="1" value={settings.freeConversationLimit} onChange={e => setSettings({ ...settings, freeConversationLimit: Number(e.target.value) })} required />
              <p style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', marginTop: '4px' }}>Limits AI responses for free tier businesses.</p>
            </div>
            <div className="input-wrapper">
              <label className="input-label">Pro Plan Monthly Conversation Limit</label>
              <input className="input-field" type="number" min="1" value={settings.proConversationLimit} onChange={e => setSettings({ ...settings, proConversationLimit: Number(e.target.value) })} required />
              <p style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', marginTop: '4px' }}>Use 999999 for effectively unlimited access.</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-surface-container-low)' }}>
            <button type="submit" disabled={savingSettings} className={`btn btn-primary${savingSettings ? ' btn-loading' : ''}`}>
              {!savingSettings && <><Save size={18} /> Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-surface-container-low)', background: 'var(--color-surface-container-lowest)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Shield size={20} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>SuperAdmin Security</h3>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)' }}>Update your administrative access credentials.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {passwordMsg.text && (
            <div style={{ 
              padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', 
              background: passwordMsg.type === 'success' ? 'var(--color-secondary-light)' : 'var(--color-error-light)',
              color: passwordMsg.type === 'success' ? 'var(--color-secondary)' : 'var(--color-error)',
              border: `1px solid ${passwordMsg.type === 'success' ? 'var(--color-secondary-light)' : 'var(--color-error-light)'}`
            }}>
              {passwordMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>{passwordMsg.text}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: '440px' }}>
            <div className="input-wrapper">
              <label className="input-label">Current Admin Password</label>
              <input className="input-field" type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
            </div>
            <div className="input-wrapper">
              <label className="input-label">New Password</label>
              <input className="input-field" type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Confirm New Password</label>
              <input className="input-field" type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-surface-container-low)' }}>
            <button type="submit" disabled={savingPassword} className={`btn btn-secondary${savingPassword ? ' btn-loading' : ''}`}>
              {!savingPassword && <><Lock size={18} /> Update Password</>}
            </button>
          </div>
        </form>
      </motion.div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Settings;
