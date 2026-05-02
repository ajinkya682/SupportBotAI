import { useState, useRef, useEffect } from "react";
import { 
  User, 
  Camera, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  ShieldCheck, 
  X,
  AlertCircle,
  Mail,
  Shield,
  Edit2,
  Save,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../../../../shared/services/config";
import { updateUserProfile } from "../../../auth/state/authSlice";
import Loader from "../../../../shared/ui/components/Loader";

export default function Profile({ view = "general" }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Profile Details State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Profile Photo State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Password Management State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [strength, setStrength] = useState({ score: 0, label: "", color: "" });

  useEffect(() => {
    setProfileName(user?.name || "");
  }, [user]);

  // Password validation rules
  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push("One special character");
    return errors;
  };

  useEffect(() => {
    if (!passwordData.newPassword) {
      setStrength({ score: 0, label: "", color: "" });
      return;
    }
    const pwd = passwordData.newPassword;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    let label = "Weak Security";
    let color = "#ef4444";
    if (score >= 4) {
      label = "Ironclad Protection";
      color = "#10b981";
    } else if (score >= 2) {
      label = "Average Defense";
      color = "#f59e0b";
    }
    setStrength({ score, label, color });
  }, [passwordData.newPassword]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      const { data } = await axios.put(`${API_URL}/profile/update-photo`, formData, {
        headers: { 
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (data.success) {
        dispatch(updateUserProfile({ profilePhoto: data.profilePhoto }));
        toast.success("Identity updated successfully");
        setPhotoFile(null);
        setPhotoPreview(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) return;
    setIsSavingProfile(true);

    try {
      const { data } = await axios.put(`${API_URL}/profile/update`, {
        name: profileName
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      if (data.success) {
        dispatch(updateUserProfile({ name: profileName }));
        toast.success("Profile details synchronized");
        setIsEditingProfile(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    const pwdValidation = validatePassword(passwordData.newPassword);
    if (pwdValidation.length > 0) {
      errors.newPassword = "Security standard not met";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Verification mismatch";
    }
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Required";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordErrors({});

    try {
      const { data } = await axios.put(`${API_URL}/profile/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      if (data.success) {
        toast.success("Access credentials updated");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Standard security failure";
      if (msg.toLowerCase().includes("current")) {
        setPasswordErrors({ currentPassword: "Authentication failed: incorrect password" });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="profile-container animate-fade-in">
      {view === "general" && (
        <div className="profile-hero-card">
          <div className="ph-left">
            <div className="ph-avatar-group">
              <div className="ph-avatar-main">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" />
                ) : user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user?.name} />
                ) : (
                  <div className="ph-avatar-placeholder">{user?.name?.charAt(0)}</div>
                )}
                <button 
                  className="ph-camera-trigger" 
                  onClick={() => fileInputRef.current.click()}
                  disabled={isUploading}
                >
                  <Camera size={16} />
                </button>
              </div>
              {photoFile && (
                <div className="ph-photo-actions">
                  <button className="ph-save-btn" onClick={handlePhotoUpload} disabled={isUploading}>
                    {isUploading ? <Loader size={14} color="#fff" /> : "Update Identity"}
                  </button>
                  <button className="ph-cancel-btn" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}>
                    Discard
                  </button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} accept="image/*" hidden />
            </div>

            <div className="ph-user-info">
              <div className="ph-name-row">
                {isEditingProfile ? (
                  <div className="ph-name-edit">
                    <input 
                      value={profileName} 
                      onChange={e => setProfileName(e.target.value)}
                      autoFocus
                    />
                    <button onClick={handleUpdateProfile} disabled={isSavingProfile}>
                      {isSavingProfile ? <Loader size={14} color="#fff" /> : <Save size={16} />}
                    </button>
                    <button onClick={() => { setIsEditingProfile(false); setProfileName(user?.name || ""); }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2>{user?.name}</h2>
                    <button className="ph-edit-btn" onClick={() => setIsEditingProfile(true)}>
                      <Edit2 size={14} />
                    </button>
                  </>
                )}
              </div>
              <p className="ph-email"><Mail size={14} /> {user?.email}</p>
              <div className="ph-role-tag">
                <ShieldCheck size={14} />
                <span>{user?.role === 'owner' ? 'System Administrator' : (user?.roleTitle || 'Support Agent')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="profile-main-grid">
        <div className="profile-section-card">
          <div className="psc-header">
            <div className="psc-icon">
              {view === "security" ? <KeyRound size={20} /> : <User size={20} />}
            </div>
            <div className="psc-text">
              <h3>{view === "security" ? "Security Settings" : "My Profile"}</h3>
              <p>{view === "security" ? "Manage your account password and security" : "Manage your account settings and preferences"}</p>
            </div>
          </div>

          {view === "general" ? (
            <div className="psc-content">
              <div className="profile-info-grid">
                <div className="info-item-box">
                  <span className="info-label">Full Name</span>
                  <div className="info-value-wrap">
                    <User size={16} />
                    <span className="info-value">{user?.name}</span>
                  </div>
                </div>
                <div className="info-item-box">
                  <span className="info-label">Email Node</span>
                  <div className="info-value-wrap">
                    <Mail size={16} />
                    <span className="info-value">{user?.email}</span>
                  </div>
                </div>
                <div className="info-item-box">
                  <span className="info-label">Access Level</span>
                  <div className="info-value-wrap">
                    <Shield size={16} />
                    <span className="info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                  </div>
                </div>
                <div className="info-item-box">
                  <span className="info-label">Member Since</span>
                  <div className="info-value-wrap">
                    <Check size={16} />
                    <span className="info-value">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="psc-footer-hint">
                <ShieldAlert size={14} />
                <span>Basic account details are synchronized with system core.</span>
              </div>
            </div>
          ) : (
            <div className="psc-security-layout">
              <form onSubmit={handlePasswordUpdate} className="psc-form">
                <div className="form-field-group">
                  <label>Current Password</label>
                  <div className="field-input-wrap">
                    <Lock size={18} className="field-icon" />
                    <input 
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => togglePasswordVisibility('current')} className="field-toggle">
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && <p className="field-error"><AlertCircle size={12} /> {passwordErrors.currentPassword}</p>}
                </div>

                <div className="form-field-group">
                  <label>New Password</label>
                  <div className="field-input-wrap">
                    <Lock size={18} className="field-icon" />
                    <input 
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Create complex password"
                    />
                    <button type="button" onClick={() => togglePasswordVisibility('new')} className="field-toggle">
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {passwordData.newPassword && (
                    <div className="strength-meter">
                      <div className="sm-bar-bg">
                        <div 
                          className="sm-bar-fill" 
                          style={{ width: `${(strength.score / 5) * 100}%`, background: strength.color }}
                        />
                      </div>
                      <span className="sm-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                  {passwordErrors.newPassword && <p className="field-error"><AlertCircle size={12} /> {passwordErrors.newPassword}</p>}
                </div>

                <div className="form-field-group">
                  <label>Confirm New Password</label>
                  <div className="field-input-wrap">
                    <ShieldCheck size={18} className="field-icon" />
                    <input 
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Repeat new password"
                    />
                    <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="field-toggle">
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && <p className="field-error"><AlertCircle size={12} /> {passwordErrors.confirmPassword}</p>}
                </div>

                <button className="form-submit-btn" type="submit" disabled={isUpdatingPassword || !passwordData.newPassword}>
                  {isUpdatingPassword ? <Loader size={18} color="#fff" label="Synchronizing..." /> : (
                    <>Update Access Protocol <ChevronRight size={18} /></>
                  )}
                </button>
              </form>

              <div className="psc-security-info">
                <div className="security-info-box">
                  <Fingerprint size={24} className="si-icon" />
                  <h4>Security Guidelines</h4>
                  <ul>
                    <li>Use 8+ characters for depth</li>
                    <li>Mix symbols & numbers</li>
                    <li>Avoid common sequences</li>
                    <li>Never share your credentials</li>
                  </ul>
                </div>
                <div className="security-info-box secondary">
                  <ShieldCheck size={24} className="si-icon" />
                  <h4>Session Control</h4>
                  <p>Updates will synchronize across all active sessions in real-time.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .profile-container { padding: 24px; max-width: 1000px; margin: 0 auto; min-height: 100vh; }
        @media (min-width: 768px) { .profile-container { padding: 40px; } }

        .profile-hero-card { background: white; border-radius: 24px; padding: 32px; border: 1px solid var(--outline-variant); box-shadow: var(--shadow-overlay); margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; }
        .profile-hero-card::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: var(--primary); }

        .ph-left { display: flex; align-items: center; gap: 32px; }
        @media (max-width: 640px) { .ph-left { flex-direction: column; text-align: center; width: 100%; } }

        .ph-avatar-group { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .ph-avatar-main { position: relative; width: 100px; height: 100px; border-radius: 30px; background: var(--surface-container); border: 4px solid white; box-shadow: 0 8px 24px rgba(0,0,0,0.1); overflow: visible; }
        .ph-avatar-main img { width: 100%; height: 100%; object-fit: cover; border-radius: 26px; }
        .ph-avatar-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; color: var(--primary); background: var(--primary-low); border-radius: 26px; }
        
        .ph-camera-trigger { position: absolute; bottom: -8px; right: -8px; width: 36px; height: 36px; border-radius: 12px; background: var(--primary); color: white; border: 3px solid white; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-raised); transition: 0.2s; }
        .ph-camera-trigger:hover { transform: scale(1.1); background: #2a1fb8; }

        .ph-photo-actions { display: flex; gap: 8px; margin-top: 8px; }
        .ph-save-btn { padding: 6px 12px; border-radius: 8px; background: var(--primary); color: white; border: none; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .ph-cancel-btn { padding: 6px 12px; border-radius: 8px; background: var(--surface-container); color: var(--on-surface-variant); border: none; font-size: 0.75rem; font-weight: 700; cursor: pointer; }

        .ph-user-info { display: flex; flex-direction: column; gap: 8px; }
        .ph-name-row { display: flex; align-items: center; gap: 12px; }
        @media (max-width: 640px) { .ph-name-row { justify-content: center; } }
        .ph-name-row h2 { font-size: 1.75rem; font-weight: 800; color: var(--on-surface); letter-spacing: -0.02em; margin: 0; }
        .ph-edit-btn { background: transparent; border: none; color: var(--outline); cursor: pointer; padding: 4px; border-radius: 6px; transition: 0.2s; }
        .ph-edit-btn:hover { background: var(--surface-container); color: var(--primary); }

        .ph-name-edit { display: flex; align-items: center; gap: 8px; background: var(--surface-container-low); padding: 4px 8px; border-radius: 12px; border: 1px solid var(--outline-variant); }
        .ph-name-edit input { border: none; background: transparent; font-size: 1.25rem; font-weight: 700; color: var(--on-surface); width: 180px; padding: 4px; outline: none; }
        .ph-name-edit button { background: var(--primary); color: white; border: none; border-radius: 8px; padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .ph-name-edit button:last-child { background: var(--surface-container-highest); color: var(--on-surface); }

        .ph-email { display: flex; align-items: center; gap: 6px; font-size: 0.95rem; color: var(--on-surface-variant); font-weight: 500; }
        .ph-role-tag { display: flex; align-items: center; gap: 6px; background: var(--primary-low); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; width: fit-content; }
        @media (max-width: 640px) { .ph-role-tag { margin: 0 auto; } }

        .profile-main-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
        
        .profile-section-card { background: white; border-radius: 24px; border: 1px solid var(--outline-variant); padding: 32px; box-shadow: var(--shadow-raised); }
        .psc-header { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--surface-container); }
        .psc-icon { width: 48px; height: 48px; border-radius: 14px; background: var(--surface-container-low); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .psc-text h3 { font-size: 1.25rem; font-weight: 800; color: var(--on-surface); margin-bottom: 4px; }
        .psc-text p { font-size: 0.9rem; color: var(--on-surface-variant); font-weight: 500; }

        .profile-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .info-item-box { background: var(--surface-container-lowest); border: 1px solid var(--surface-container-high); padding: 20px; border-radius: 20px; display: flex; flex-direction: column; gap: 8px; transition: 0.2s; }
        .info-item-box:hover { border-color: var(--primary-low); transform: translateY(-2px); }
        .info-label { font-size: 0.7rem; font-weight: 700; color: var(--outline); text-transform: uppercase; letter-spacing: 0.05em; }
        .info-value-wrap { display: flex; align-items: center; gap: 10px; color: var(--on-surface); }
        .info-value-wrap svg { color: var(--primary); opacity: 0.7; }
        .info-value { font-size: 1rem; font-weight: 700; }

        .psc-footer-hint { display: flex; align-items: center; gap: 8px; margin-top: 24px; padding: 12px; background: var(--surface-container-low); border-radius: 12px; color: var(--on-surface-variant); font-size: 0.8rem; font-weight: 600; }
        
        .psc-security-layout { display: grid; grid-template-columns: 1fr; gap: 40px; }
        @media (min-width: 900px) { .psc-security-layout { grid-template-columns: 1.2fr 0.8fr; } }

        .psc-form { display: flex; flex-direction: column; gap: 24px; width: 100%; }
        .form-field-group { display: flex; flex-direction: column; gap: 8px; }
        .form-field-group label { font-size: 0.85rem; font-weight: 700; color: var(--on-surface-variant); margin-left: 4px; }
        
        .field-input-wrap { position: relative; display: flex; align-items: center; }
        .field-icon { position: absolute; left: 16px; color: var(--outline); pointer-events: none; }
        .field-input-wrap input { width: 100%; padding: 14px 48px 14px 48px; border-radius: 16px; border: 2px solid var(--surface-container-highest); background: var(--surface-container-lowest); font-weight: 600; font-size: 1rem; transition: 0.2s; outline: none; }
        .field-input-wrap input:focus { border-color: var(--primary); background: white; }
        .field-toggle { position: absolute; right: 12px; background: transparent; border: none; color: var(--outline); cursor: pointer; padding: 6px; border-radius: 8px; display: flex; }
        .field-toggle:hover { background: var(--surface-container); color: var(--on-surface); }

        .strength-meter { margin-top: 12px; }
        .sm-bar-bg { height: 6px; background: var(--surface-container); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
        .sm-bar-fill { height: 100%; border-radius: 3px; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .sm-label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }

        .field-error { color: var(--error); font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 4px; margin-top: 4px; }

        .form-submit-btn { margin-top: 8px; background: var(--primary); color: white; border: none; padding: 16px; border-radius: 18px; font-weight: 700; font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 12px; cursor: pointer; transition: 0.3s; box-shadow: 0 8px 24px rgba(53, 37, 205, 0.2); }
        .form-submit-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(53, 37, 205, 0.3); }
        .form-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .psc-security-info { display: flex; flex-direction: column; gap: 20px; }
        .security-info-box { background: var(--surface-container-low); padding: 24px; border-radius: 20px; border: 1px solid var(--outline-variant); }
        .security-info-box.secondary { background: var(--primary-low); border-color: var(--primary-fixed); }
        .si-icon { color: var(--primary); margin-bottom: 12px; }
        .security-info-box h4 { font-size: 1rem; font-weight: 800; color: var(--on-surface); margin-bottom: 12px; }
        .security-info-box ul { padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
        .security-info-box li { font-size: 0.85rem; color: var(--on-surface-variant); font-weight: 600; }
        .security-info-box p { font-size: 0.85rem; color: var(--on-surface-variant); font-weight: 600; line-height: 1.5; }
      `}</style>
    </div>
  );
}
