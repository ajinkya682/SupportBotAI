import { useState, useRef } from 'react';
import { 
  Palette, 
  Upload, 
  Bot, 
  User, 
  MessageSquare, 
  Sparkles, 
  Check, 
  Save, 
  Loader2,
  Trash2,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';

export default function Appearance({ formData, setFormData, onSave, isLoading, business, onUpgrade }) {
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, mobile
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      appearance: { ...prev.appearance, themeColor: color }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [name]: value }
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('logo', file);

    setIsUploading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const { data } = await axios.post(`${API_URL}/auth/upload-logo`, uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setFormData(prev => ({
        ...prev,
        appearance: { ...prev.appearance, companyLogo: data.url }
      }));
      toast.success('Logo uploaded successfully');
    } catch (err) {
      toast.error('Logo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const colors = [
    '#3525cd', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#1f2937'
  ];

  return (
    <div className="animate-fade-in appearance-container">
      <div className="appearance-header">
        <div className="page-title">
          <h1>Widget Branding</h1>
          <p>Customize how your AI assistant looks on your website.</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={onSave} 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div className="appearance-grid">
        {/* Settings Panel */}
        <div className="settings-panel">
          <div className="card">
            <h3 className="section-title"><Palette size={20} /> Design & Personality</h3>
            
            <div className="form-group">
              <label>Bot Name</label>
              <input 
                name="botName"
                value={formData.appearance.botName}
                onChange={handleInputChange}
                placeholder="e.g. SupportBot AI"
              />
            </div>

            <div className="form-group">
              <label>Welcome Message</label>
              <textarea 
                name="welcomeMessage"
                value={formData.appearance.welcomeMessage}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hi there! How can I help you today?"
              />
            </div>

            <div className="form-group">
              <label>Input Placeholder</label>
              <input 
                name="placeholderText"
                value={formData.appearance.placeholderText}
                onChange={handleInputChange}
                placeholder="Type your message..."
              />
            </div>

            <div className="form-group">
              <label>Theme Color</label>
              <div className="color-grid">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-swatch ${formData.appearance.themeColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  >
                    {formData.appearance.themeColor === color && <Check size={14} color="white" />}
                  </button>
                ))}
                <div className="custom-color-input">
                  <input 
                    type="color" 
                    value={formData.appearance.themeColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="section-title" style={{ marginBottom: 0 }}><ImageIcon size={20} /> Branding & Logo</h3>
              {business?.plan === 'free' && (
                <span className="pro-badge">PRO FEATURE</span>
              )}
            </div>

            {business?.plan === 'free' ? (
              <div className="pro-feature-lock">
                <Sparkles size={24} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                <p>Upload your own logo and remove "Powered by SupportBotAI" branding.</p>
                <button className="btn btn-secondary btn-sm" onClick={onUpgrade}>Upgrade to Unlock</button>
              </div>
            ) : (
              <div className="logo-upload-container">
                <div className="logo-preview-box">
                  {formData.appearance.companyLogo ? (
                    <img src={formData.appearance.companyLogo} alt="Company Logo" />
                  ) : (
                    <div className="empty-logo"><ImageIcon size={32} /></div>
                  )}
                </div>
                <div className="upload-controls">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                  />
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    Upload Logo
                  </button>
                  {formData.appearance.companyLogo && (
                    <button 
                      className="btn btn-text" 
                      style={{ color: 'var(--error)' }}
                      onClick={() => setFormData(prev => ({ ...prev, appearance: { ...prev.appearance, companyLogo: '' } }))}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="preview-panel">
          <div className="preview-controls">
            <button className={`p-btn ${previewMode === 'desktop' ? 'active' : ''}`} onClick={() => setPreviewMode('desktop')}>
              <Monitor size={18} /> Desktop
            </button>
            <button className={`p-btn ${previewMode === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewMode('mobile')}>
              <Smartphone size={18} /> Mobile
            </button>
          </div>

          <div className={`preview-container ${previewMode}`}>
            <div className="mock-site">
              <div className="mock-nav">
                <div className="mock-logo"></div>
                <div className="mock-links">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div className="mock-hero">
                <div className="mock-text-lg"></div>
                <div className="mock-text-sm"></div>
                <div className="mock-btn"></div>
              </div>
            </div>

            {/* The Widget Mockup */}
            <motion.div 
              className="widget-mockup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="widget-header" style={{ backgroundColor: formData.appearance.themeColor }}>
                <div className="header-info">
                  <div className="bot-avatar">
                    {formData.appearance.companyLogo ? (
                      <img src={formData.appearance.companyLogo} alt="Logo" />
                    ) : (
                      <Bot size={20} color="white" />
                    )}
                  </div>
                  <div>
                    <div className="bot-name">{formData.appearance.botName || 'AI Assistant'}</div>
                    <div className="bot-status">Online</div>
                  </div>
                </div>
              </div>

              <div className="widget-body">
                <div className="msg bot-msg">
                  <div className="msg-content">{formData.appearance.welcomeMessage}</div>
                  <div className="msg-time">Just now</div>
                </div>
                <div className="msg user-msg">
                  <div className="msg-content" style={{ backgroundColor: formData.appearance.themeColor }}>How can I help you?</div>
                </div>
              </div>

              <div className="widget-footer">
                <div className="input-mock">
                  <span>{formData.appearance.placeholderText}</span>
                  <div className="send-icon" style={{ backgroundColor: formData.appearance.themeColor }}>
                    <ChevronRight size={16} color="white" />
                  </div>
                </div>
                {business?.plan === 'free' && (
                  <div className="powered-by">Powered by SupportBotAI</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        .appearance-container { padding-bottom: 60px; }
        .appearance-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .appearance-grid { display: grid; grid-template-columns: 1fr 480px; gap: 40px; }
        
        .section-title { font-size: 1.1rem; display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
        .color-grid { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .color-swatch { width: 40px; height: 40px; border-radius: 12px; border: 2px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .color-swatch.active { border-color: var(--on-surface); transform: scale(1.1); box-shadow: var(--shadow-2); }
        .custom-color-input { width: 40px; height: 40px; border-radius: 12px; overflow: hidden; border: 2px solid var(--outline-variant); position: relative; }
        .custom-color-input input { position: absolute; top: -10px; left: -10px; width: 60px; height: 60px; cursor: pointer; }
        
        .pro-badge { font-size: 0.65rem; font-weight: 800; background: var(--primary-fixed); color: var(--primary); padding: 4px 10px; border-radius: 6px; letter-spacing: 0.05em; }
        .pro-feature-lock { text-align: center; padding: 32px; background: var(--surface-container-low); border-radius: var(--radius-lg); border: 1px dashed var(--outline-variant); }
        .pro-feature-lock p { font-size: 0.85rem; color: var(--on-surface-variant); margin-bottom: 20px; }
        
        .logo-upload-container { display: flex; gap: 24px; align-items: center; }
        .logo-preview-box { width: 100px; height: 100px; border-radius: var(--radius-lg); background: var(--surface-container-low); border: 1.5px solid var(--outline-variant); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .logo-preview-box img { width: 100%; height: 100%; object-fit: contain; }
        .empty-logo { color: var(--outline); }
        .upload-controls { display: flex; flex-direction: column; gap: 12px; }
        
        .preview-panel { position: sticky; top: 32px; }
        .preview-controls { display: flex; gap: 8px; background: var(--surface-container-low); padding: 6px; border-radius: 12px; width: fit-content; margin: 0 auto 24px; border: 1px solid var(--outline-variant); }
        .p-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 8px; border: none; background: transparent; color: var(--on-surface-variant); font-weight: 600; font-size: 0.875rem; cursor: pointer; }
        .p-btn.active { background: var(--surface-container-lowest); color: var(--on-surface); box-shadow: var(--shadow-1); }
        
        .preview-container { height: 700px; background: #e5e7eb; border-radius: 32px; border: 8px solid #1f2937; position: relative; overflow: hidden; transition: 0.4s; margin: 0 auto; }
        .preview-container.desktop { width: 100%; }
        .preview-container.mobile { width: 340px; border-radius: 40px; }
        
        .mock-site { padding: 24px; height: 100%; background: white; }
        .mock-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 60px; }
        .mock-logo { width: 100px; height: 20px; background: #e5e7eb; border-radius: 4px; }
        .mock-links { display: flex; gap: 12px; }
        .mock-links span { width: 40px; height: 10px; background: #f3f4f6; border-radius: 2px; }
        .mock-hero { text-align: center; max-width: 80%; margin: 0 auto; }
        .mock-text-lg { height: 32px; background: #f3f4f6; border-radius: 8px; margin-bottom: 16px; }
        .mock-text-sm { height: 16px; background: #f9fafb; border-radius: 4px; margin-bottom: 24px; width: 60%; margin: 0 auto 24px; }
        .mock-btn { width: 120px; height: 40px; background: #e5e7eb; border-radius: 8px; margin: 0 auto; }
        
        .widget-mockup { position: absolute; bottom: 24px; right: 24px; width: 320px; height: 480px; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #f3f4f6; }
        .widget-header { padding: 20px; color: white; display: flex; justify-content: space-between; align-items: flex-start; }
        .header-info { display: flex; gap: 12px; align-items: center; }
        .bot-avatar { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .bot-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .bot-name { font-weight: 700; font-size: 0.95rem; }
        .bot-status { font-size: 0.7rem; opacity: 0.8; display: flex; align-items: center; gap: 4px; }
        .bot-status::before { content: ''; width: 6px; height: 6px; background: #4ade80; border-radius: 50%; }
        
        .widget-body { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 16px; background: #fafafa; overflow-y: auto; }
        .msg { max-width: 85%; }
        .msg-content { padding: 12px 16px; border-radius: 16px; font-size: 0.875rem; line-height: 1.5; }
        .bot-msg { align-self: flex-start; }
        .bot-msg .msg-content { background: white; color: #1f2937; border-bottom-left-radius: 4px; border: 1px solid #e5e7eb; }
        .user-msg { align-self: flex-end; }
        .user-msg .msg-content { color: white; border-bottom-right-radius: 4px; }
        .msg-time { font-size: 0.65rem; color: #9ca3af; margin-top: 4px; margin-left: 4px; }
        
        .widget-footer { padding: 16px; background: white; border-top: 1px solid #f3f4f6; }
        .input-mock { display: flex; justify-content: space-between; align-items: center; background: #f9fafb; padding: 10px 14px; border-radius: 12px; border: 1px solid #e5e7eb; color: #9ca3af; font-size: 0.875rem; }
        .send-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .powered-by { text-align: center; font-size: 0.6rem; color: #d1d5db; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; }
        
        @media (max-width: 340px) {
          .preview-container.mobile { width: 100%; border-radius: 0; border: none; }
        }
      `}</style>
    </div>
  );
}
