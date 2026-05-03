import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Building, Save, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';

export default function Settings({ formData, setFormData, onSave, isLoading }) {
  const { user } = useSelector((state) => state.auth);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    setIsChangingPassword(true);
    setPasswordStatus({ type: '', message: '' });
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const token = storedUser?.token;
      await axios.post(`${API_URL}/api/auth/change-password`,
        { oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordStatus({ type: 'success', message: 'Password changed successfully!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setPasswordStatus({ type: 'error', message: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Manage your business information and security preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-8)' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-surface-container-low)', background: 'var(--color-surface-container-lowest)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
              <Building size={18} />
            </div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>Business Profile</h3>
          </div>
          
          <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="input-wrapper">
              <label className="input-label">Company Name</label>
              <input className="input-field" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Acme Corp" />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Support Email Address</label>
              <input className="input-field" type="email" value={formData.supportEmail} onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })} placeholder="support@acme.com" />
            </div>
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-surface-container-low)', display: 'flex', justifyContent: 'flex-end' }}>
              <button className={`btn btn-primary${isLoading ? ' btn-loading' : ''}`} onClick={onSave} disabled={isLoading}>
                {!isLoading && <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-surface-container-low)', background: 'var(--color-surface-container-lowest)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}>
              <Lock size={18} />
            </div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>Security & Password</h3>
          </div>

          <form onSubmit={handlePasswordChange} style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {passwordStatus.message && (
              <div style={{ 
                padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', 
                background: passwordStatus.type === 'success' ? 'var(--color-secondary-light)' : 'var(--color-error-light)',
                color: passwordStatus.type === 'success' ? 'var(--color-secondary)' : 'var(--color-error)',
              }}>
                {passwordStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)' }}>{passwordStatus.message}</span>
              </div>
            )}

            <div className="input-wrapper">
              <label className="input-label">Current Password</label>
              <input className="input-field" type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} required />
            </div>
            <div className="input-wrapper">
              <label className="input-label">New Password</label>
              <input className="input-field" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
            </div>
            <div className="input-wrapper">
              <label className="input-label">Confirm New Password</label>
              <input className="input-field" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
            </div>
            
            <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-surface-container-low)', display: 'flex', justifyContent: 'flex-start' }}>
              <button type="submit" className={`btn btn-secondary${isChangingPassword ? ' btn-loading' : ''}`} disabled={isChangingPassword}>
                {!isChangingPassword && 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
