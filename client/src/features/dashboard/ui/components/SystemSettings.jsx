import React from 'react';
import { Settings, Save, Loader2, Building, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SystemSettings({ formData, setFormData, onSave, isLoading }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="animate-fade-in settings-container">
      <div className="settings-header">
        <div className="page-title">
          <h1>System Settings</h1>
          <p>Manage your business profile and global configurations.</p>
        </div>
        <button 
          className="btn btn-primary settings-save-btn" 
          onClick={onSave} 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> <span>Save Changes</span></>}
        </button>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="section-header">
            <div className="section-icon"><Building size={20} /></div>
            <div>
              <h3>Business Profile</h3>
              <p>Basic information about your company.</p>
            </div>
          </div>
          
          <div className="form-group">
            <label>Business Name</label>
            <input 
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="form-group">
            <label>Support Email</label>
            <input 
              name="supportEmail"
              type="email"
              value={formData.supportEmail || ''}
              onChange={handleInputChange}
              placeholder="e.g. support@acmecorp.com"
            />
          </div>
        </div>
      </div>

      <style>{`
        .settings-container { padding-bottom: 40px; }
        .settings-header { display: flex; flex-direction: column; gap: 20px; margin-bottom: 32px; }
        @media (min-width: 768px) {
          .settings-header { flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        }
        .settings-save-btn { width: 100%; }
        @media (min-width: 768px) { .settings-save-btn { width: auto; } }
        
        .settings-grid { display: flex; flex-direction: column; gap: 32px; max-width: 800px; }
        
        .section-header { display: flex; gap: 12px; align-items: center; margin-bottom: 24px; }
        .section-header h3 { font-size: 1.1rem; }
        .section-header p { font-size: 13px; color: var(--on-surface-variant); }
        .section-icon { width: 40px; height: 40px; background: var(--primary-fixed); color: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
