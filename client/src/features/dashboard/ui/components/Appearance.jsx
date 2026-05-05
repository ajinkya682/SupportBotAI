import { useState, useRef } from 'react';
import { 
  Palette, 
  Upload, 
  Bot, 
  Sparkles, 
  Check, 
  Save, 
  Loader2,
  Trash2,
  Image as ImageIcon,
  Monitor,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../../../../shared/services/config';
import toast from 'react-hot-toast';
import ConfirmModal from '../../../../shared/ui/components/ConfirmModal';

export default function Appearance({ formData, setFormData, onSave, isLoading, business, onUpgrade }) {
  const [previewMode, setPreviewMode] = useState('desktop'); 
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      const { data } = await axios.post(`${API_URL}/business/logo-upload`, uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });
      
      setFormData(prev => ({
        ...prev,
        appearance: { ...prev.appearance, companyLogo: data.url }
      }));
      toast.success('Logo uploaded');
    } catch (err) {
      toast.error('Upload failed');
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
      <ConfirmModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setFormData(prev => ({ ...prev, appearance: { ...prev.appearance, companyLogo: '' } }));
          setShowConfirmModal(false);
        }}
        title="Remove Logo"
        message="Are you sure you want to remove your company logo?"
      />

      <div className="appearance-header">
        <div className="page-title">
          <h1>Widget Branding</h1>
          <p>Customize your AI assistant's visual identity.</p>
        </div>
        <button 
          className="btn btn-primary appearance-save-btn" 
          onClick={onSave} 
          disabled={isLoading}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> <span>Save Changes</span></>}
        </button>
      </div>

      <div className="appearance-grid">
        {/* Settings Panel */}
        <div className="settings-panel">
          <div className="card">
            <h3 className="section-title"><Palette size={20} /> Personality</h3>
            
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
                placeholder="Hi there! How can I help you?"
              />
            </div>

            <div className="form-group">
              <label>Input Placeholder</label>
              <input 
                name="placeholderText"
                value={formData.appearance.placeholderText}
                onChange={handleInputChange}
                placeholder="Type message..."
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
                    aria-label={`Select ${color} color`}
                  >
                    {formData.appearance.themeColor === color && <Check size={14} color="white" />}
                  </button>
                ))}
                <div className="custom-color-input">
                  <input 
                    type="color" 
                    value={formData.appearance.themeColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    aria-label="Select custom color"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title-row">
              <h3 className="section-title"><ImageIcon size={20} /> Branding</h3>
              {business?.plan === 'free' && <span className="pro-badge">PRO</span>}
            </div>

            {business?.plan === 'free' ? (
              <div className="pro-lock-box">
                <Sparkles size={24} color="var(--primary)" />
                <p>Upload logo & remove branding.</p>
                <button className="btn btn-secondary btn-sm" onClick={onUpgrade}>Upgrade</button>
              </div>
            ) : (
              <div className="logo-upload-container">
                <div className="logo-preview-box">
                  {formData.appearance.companyLogo ? (
                    <img src={formData.appearance.companyLogo} alt="Logo" />
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
                    className="btn btn-secondary btn-sm" 
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    Upload
                  </button>
                  {formData.appearance.companyLogo && (
                    <button 
                      className="btn btn-text btn-sm" 
                      style={{ color: 'var(--error)' }}
                      onClick={() => setShowConfirmModal(true)}
                    >
                      <Trash2 size={14} /> Remove
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
              <Monitor size={18} /> <span className="desktop-only">Desktop</span>
            </button>
            <button className={`p-btn ${previewMode === 'mobile' ? 'active' : ''}`} onClick={() => setPreviewMode('mobile')}>
              <Smartphone size={18} /> <span className="desktop-only">Mobile</span>
            </button>
          </div>

          <div className={`preview-container ${previewMode}`}>
            <div className="mock-site">
              <div className="mock-site-overlay"></div>
              <div className="mock-nav">
                <div className="mock-logo">
                  <div className="logo-dot"></div>
                  <div className="logo-text"></div>
                </div>
                <div className="mock-links">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div className="mock-content">
                <div className="mock-hero">
                  <div className="mock-badge"></div>
                  <div className="mock-text-lg"></div>
                  <div className="mock-text-lg short"></div>
                  <div className="mock-text-sm"></div>
                  <div className="mock-text-sm middle"></div>
                  <div className="mock-btn-group">
                    <div className="mock-btn primary"></div>
                    <div className="mock-btn secondary"></div>
                  </div>
                </div>
                <div className="mock-features">
                  <div className="feature-item"></div>
                  <div className="feature-item"></div>
                  <div className="feature-item"></div>
                </div>
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
                    <div className="bot-name">{formData.appearance.botName || 'Assistant'}</div>
                    <div className="bot-status">Online</div>
                  </div>
                </div>
              </div>

              <div className="widget-body">
                <div className="msg bot-msg">
                  <div className="msg-content">{formData.appearance.welcomeMessage}</div>
                </div>
                <div className="msg user-msg">
                  <div className="msg-content" style={{ backgroundColor: formData.appearance.themeColor }}>How can I help?</div>
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
                  <div className="powered-by">Powered by SupportBot</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        .appearance-container { padding-bottom: 40px; }
        
        .appearance-header { 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
          margin-bottom: 32px; 
        }

        @media (min-width: 768px) {
          .appearance-header { flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        }

        .appearance-save-btn { width: 100%; }
        @media (min-width: 768px) { .appearance-save-btn { width: auto; } }

        .appearance-grid { 
          display: flex;
          flex-direction: column;
          gap: 32px; 
        }

        @media (min-width: 1024px) {
          .appearance-grid { 
            display: grid; 
            grid-template-columns: 1fr 400px; 
            gap: 40px; 
          }
        }
        
        .section-title { font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-title-row .section-title { margin-bottom: 0; }

        .color-grid { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .color-swatch { width: 36px; height: 36px; border-radius: 10px; border: 2px solid transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .color-swatch.active { border-color: var(--on-surface); transform: scale(1.05); }
        .custom-color-input { width: 36px; height: 36px; border-radius: 10px; overflow: hidden; border: 1px solid var(--outline-variant); position: relative; }
        .custom-color-input input { position: absolute; top: -10px; left: -10px; width: 60px; height: 60px; cursor: pointer; }
        
        .pro-badge { font-size: 10px; font-weight: 800; background: var(--primary-fixed); color: var(--primary); padding: 2px 8px; border-radius: 4px; }
        .pro-lock-box { text-align: center; padding: 24px; background: var(--surface-container-low); border-radius: 16px; border: 1px dashed var(--outline-variant); }
        .pro-lock-box p { font-size: 13px; color: var(--on-surface-variant); margin: 12px 0 16px; }
        
        .logo-upload-container { display: flex; gap: 16px; align-items: center; }
        .logo-preview-box { width: 80px; height: 80px; border-radius: 12px; background: var(--surface-container-low); border: 1px solid var(--outline-variant); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .logo-preview-box img { width: 100%; height: 100%; object-fit: contain; }
        .upload-controls { display: flex; flex-direction: column; gap: 8px; }
        
        .preview-panel { width: 100%; }
        .preview-controls { 
          display: flex; 
          gap: 4px; 
          background: var(--surface-container-low); 
          padding: 4px; 
          border-radius: 10px; 
          width: fit-content; 
          margin: 0 auto 20px; 
          border: 1px solid var(--outline-variant); 
        }

        .p-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; border: none; background: transparent; color: var(--on-surface-variant); font-weight: 600; font-size: 13px; cursor: pointer; }
        .p-btn.active { background: white; color: var(--on-surface); box-shadow: var(--shadow-1); }
        
        .preview-container { 
          height: 540px; 
          background: #f8fafc; 
          border-radius: 24px; 
          border: 12px solid #1e293b; 
          position: relative; 
          overflow: hidden; 
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); 
          margin: 0 auto; 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        @media (min-width: 1024px) {
          .preview-container { height: 640px; border-radius: 40px; border: 16px solid #1e293b; }
        }

        .preview-container.desktop { width: 100%; }
        .preview-container.mobile { width: 280px; border-width: 18px; border-radius: 44px; }
        @media (min-width: 480px) { .preview-container.mobile { width: 320px; } }
        
        /* Mobile notch */
        .preview-container.mobile::after {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 20px;
          background: #1e293b;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          z-index: 10;
        }

        .mock-site { padding: 0; height: 100%; background: #ffffff; position: relative; overflow: hidden; }
        .mock-site-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 70% 20%, rgba(53, 37, 205, 0.05) 0%, transparent 50%); pointer-events: none; }
        
        .mock-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; position: relative; z-index: 2; }
        .mock-logo { display: flex; align-items: center; gap: 8px; }
        .logo-dot { width: 12px; height: 12px; background: var(--primary); border-radius: 4px; }
        .logo-text { width: 60px; height: 8px; background: #e2e8f0; border-radius: 2px; }
        .mock-links { display: flex; gap: 12px; }
        .mock-links span { width: 32px; height: 6px; background: #f1f5f9; border-radius: 2px; }
        
        .mock-content { padding: 40px 24px; position: relative; z-index: 1; }
        .mock-hero { text-align: left; max-width: 100%; margin-bottom: 40px; }
        .mock-badge { width: 80px; height: 16px; background: #f1f5f9; border-radius: 99px; margin-bottom: 20px; }
        .mock-text-lg { height: 32px; background: #f1f5f9; border-radius: 6px; margin-bottom: 12px; width: 90%; }
        .mock-text-lg.short { width: 60%; }
        .mock-text-sm { height: 10px; background: #f8fafc; border-radius: 2px; margin-bottom: 8px; width: 100%; }
        .mock-text-sm.middle { width: 80%; }
        
        .mock-btn-group { display: flex; gap: 12px; margin-top: 24px; }
        .mock-btn { width: 100px; height: 36px; border-radius: 8px; }
        .mock-btn.primary { background: #e2e8f0; }
        .mock-btn.secondary { background: #f1f5f9; width: 80px; }

        .mock-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 20px; }
        .feature-item { aspect-ratio: 1; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; }
        
        .widget-mockup { 
          position: absolute; 
          bottom: 24px; 
          right: 24px; 
          width: 260px; 
          height: 400px; 
          background: rgba(255, 255, 255, 0.95); 
          backdrop-filter: blur(10px);
          border-radius: 24px; 
          box-shadow: 0 20px 50px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05); 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          transform-origin: bottom right;
          scale: 0.85;
          z-index: 20;
        }

        @media (min-width: 768px) {
          .widget-mockup { width: 300px; height: 460px; scale: 1; bottom: 32px; right: 32px; }
        }

        .preview-container.mobile .widget-mockup {
          scale: 0.75;
          bottom: 16px;
          right: 16px;
          width: 100%;
          height: 90%;
          max-width: 280px;
        }

        .widget-header { 
          padding: 16px 20px; 
          color: white; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header-info { display: flex; gap: 12px; align-items: center; }
        .bot-avatar { 
          width: 36px; 
          height: 36px; 
          background: rgba(255,255,255,0.25); 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .bot-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .bot-name { font-weight: 700; font-size: 14px; letter-spacing: -0.01em; }
        .bot-status { font-size: 11px; opacity: 0.9; display: flex; align-items: center; gap: 5px; }
        .bot-status::before { content: ''; width: 6px; height: 6px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 8px #4ade80; }
        
        .widget-body { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 16px; background: linear-gradient(to bottom, #ffffff, #f9fafb); overflow-y: hidden; }
        .msg { max-width: 85%; position: relative; }
        .msg-content { padding: 12px 16px; border-radius: 18px; font-size: 13px; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        .bot-msg { align-self: flex-start; }
        .bot-msg .msg-content { background: white; color: #1e293b; border-bottom-left-radius: 4px; border: 1px solid #f1f5f9; }
        .user-msg { align-self: flex-end; }
        .user-msg .msg-content { color: white; border-bottom-right-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        
        .widget-footer { padding: 16px 20px 20px; background: white; border-top: 1px solid #f1f5f9; }
        .input-mock { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          background: #f8fafc; 
          padding: 10px 14px; 
          border-radius: 14px; 
          border: 1px solid #f1f5f9; 
          color: #94a3b8; 
          font-size: 13px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .send-icon { width: 28px; height: 28px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .powered-by { text-align: center; font-size: 9px; color: #cbd5e1; margin-top: 14px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; }
        
        .desktop-only { display: none; }
        @media (min-width: 768px) { .desktop-only { display: inline; } }
      `}</style>
    </div>
  );
}
