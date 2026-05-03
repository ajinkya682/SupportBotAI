import { useState, useRef, useEffect } from "react";
import { Bot, Palette, Save, Loader2, MessageSquare, Sparkles, Upload, Image, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import toast from 'react-hot-toast';
import { API_URL } from '../../../../shared/services/config';

export default function Appearance({ formData, setFormData, onSave, isLoading, business, onUpgrade }) {
  const [logoPreview, setLogoPreview] = useState(formData.appearance?.companyLogo || null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLogoPreview(formData.appearance?.companyLogo || null);
  }, [formData.appearance?.companyLogo]);

  const isFree = business?.plan === 'free';
  const theme = formData.appearance?.themeColor || "#004ac6";

  const handleAppearanceChange = (e) => {
    if (isFree) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, appearance: { ...prev.appearance, [name]: value } }));
  };

  const handleLogoUpload = async (e) => {
    if (isFree) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) { toast.error("Logo must be under 1MB."); return; }
    setUploadingLogo(true);
    const formDataUpload = new FormData();
    formDataUpload.append('logo', file);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      const { data } = await axios.post(`${API_URL}/api/business/logo-upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setLogoPreview(data.url);
        setFormData(prev => ({ ...prev, appearance: { ...prev.appearance, companyLogo: data.url } }));
        toast.success("Logo uploaded!");
      }
    } catch (error) {
      toast.error("Logo upload failed.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    if (isFree) return;
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, appearance: { ...prev.appearance, companyLogo: "" } }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', color: 'var(--color-on-surface)' }}>
            Widget Personalization
          </h1>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Customize your chatbot's branding and conversational style.</p>
        </div>
        <button className={`btn btn-primary${isLoading ? ' btn-loading' : ''}`} onClick={onSave} disabled={isLoading || isFree}>
          {!isLoading && <><Save size={18} /> Save Branding</>}
        </button>
      </div>

      {/* Banner */}
      {isFree && (
        <div style={{ background: 'var(--color-primary-light)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>
              <Palette size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', marginBottom: '4px' }}>Custom Branding Available in Pro</h3>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--text-sm)' }}>Upload your logo, set custom colors, and rename your assistant to match your brand.</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={onUpgrade}><Sparkles size={16} /> Upgrade Now</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-10)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', opacity: isFree ? 0.6 : 1, pointerEvents: isFree ? 'none' : 'auto' }}>
          
          {/* Identity */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
              <Bot size={20} style={{ color: 'var(--color-primary)' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Assistant Identity</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="input-wrapper">
                <label className="input-label">Public Assistant Name</label>
                <input className="input-field" name="botName" value={formData.appearance?.botName || ""} onChange={handleAppearanceChange} placeholder="e.g. Aria" />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Initial Welcome Message</label>
                <textarea className="input-field" name="welcomeMessage" value={formData.appearance?.welcomeMessage || ""} onChange={handleAppearanceChange} rows={3} placeholder="Hey! How can I help you?" style={{ resize: 'none' }} />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Input Box Placeholder</label>
                <input className="input-field" name="placeholderText" value={formData.appearance?.placeholderText || ""} onChange={handleAppearanceChange} placeholder="Type a message..." />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <Image size={20} style={{ color: 'var(--color-secondary)' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Brand Assets</h3>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', marginBottom: 'var(--space-6)' }}>Recommended: Square PNG/JPG under 1MB.</p>
            
            {logoPreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', padding: 'var(--space-6)', background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-container)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'white', border: '1px solid var(--color-surface-container)' }}>
                  <img src={logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary)', fontSize: '12px', fontWeight: 'var(--weight-bold)', marginBottom: '8px' }}>
                    <CheckCircle2 size={14} /> Logo Uploaded
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()}>Change</button>
                    <button className="btn btn-ghost btn-sm" onClick={removeLogo} style={{ color: 'var(--color-error)' }}>Remove</button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ border: '2px dashed var(--color-surface-container)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-surface-container)'}
              >
                {uploadingLogo ? <Loader2 className="spin" size={24} style={{ color: 'var(--color-primary)', margin: '0 auto' }} /> : (
                  <>
                    <Upload size={24} style={{ color: 'var(--color-on-surface-muted)', margin: '0 auto var(--space-3)' }} />
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface)' }}>Click to upload logo</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', marginTop: '4px' }}>SVG, PNG or JPG (Max 1MB)</p>
                  </>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
          </div>

          {/* Color */}
          <div className="card" style={{ padding: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <Palette size={20} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Theme Colors</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
              <input type="color" name="themeColor" value={theme} onChange={handleAppearanceChange} style={{ width: '60px', height: '60px', padding: 0, border: 'none', borderRadius: 'var(--radius-xl)', cursor: 'pointer', background: 'none' }} />
              <div>
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 'var(--text-lg)' }}>{theme.toUpperCase()}</div>
                <p style={{ fontSize: '11px', color: 'var(--color-on-surface-muted)', marginTop: '4px' }}>Primary brand color for buttons and widget headers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ position: 'sticky', top: 'var(--space-10)' }}>
          <div style={{ fontSize: '10px', fontWeight: 'var(--weight-bold)', color: 'var(--color-on-surface-muted)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 'var(--space-4)', letterSpacing: '0.1em' }}>LIVE WIDGET PREVIEW</div>
          <div style={{ background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-3xl)', padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '280px', height: '460px', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow-2xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: 'var(--space-4)', background: `linear-gradient(135deg, ${theme}, ${theme}dd)`, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', background: 'white', overflow: 'hidden' }}>
                  <img src={logoPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=bot`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', background: 'var(--color-secondary)', border: '2px solid white', borderRadius: '50%' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'var(--weight-bold)' }}>{formData.appearance?.botName || "Aria Support"}</div>
                  <div style={{ fontSize: '9px', opacity: 0.8 }}>Online · Instant Reply</div>
                </div>
              </div>
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-surface-container)', flexShrink: 0 }} />
                  <div style={{ padding: '8px 12px', background: 'var(--color-surface-container-low)', borderRadius: '12px', borderTopLeftRadius: '2px', fontSize: '11px', lineHeight: 1.5 }}>
                    {formData.appearance?.welcomeMessage || "Hey! How can I help?"}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ padding: '8px 12px', background: theme, color: 'white', borderRadius: '12px', borderTopRightRadius: '2px', fontSize: '11px' }}>
                    I have a question!
                  </div>
                </div>
              </div>
              <div style={{ padding: '12px', borderTop: '1px solid var(--color-surface-container-low)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface-container-low)', padding: '6px 10px', borderRadius: '20px' }}>
                  <span style={{ flex: 1, fontSize: '10px', color: 'var(--color-on-surface-muted)' }}>{formData.appearance?.placeholderText || "Type here..."}</span>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: theme, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={12} color="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
