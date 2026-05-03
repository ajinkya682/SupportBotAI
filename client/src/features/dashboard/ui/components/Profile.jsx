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
  Loader2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "../../../../shared/services/config";
import { updateUserProfile } from "../../../auth/state/authSlice";

export default function Profile({ view = "general" }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
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

    let label = "Weak";
    let color = "#ef4444";
    if (score >= 4) {
      label = "Strong";
      color = "#10b981";
    } else if (score >= 2) {
      label = "Medium";
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
      toast.error("Please select an image file (JPG, PNG, WEBP)");
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
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
        toast.success("Profile photo updated successfully");
        setPhotoFile(null);
        setPhotoPreview(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    const pwdValidation = validatePassword(passwordData.newPassword);
    if (pwdValidation.length > 0) {
      errors.newPassword = "Password must meet all security requirements";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
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
        toast.success("Password updated successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password";
      if (msg.toLowerCase().includes("current")) {
        setPasswordErrors({ currentPassword: "Current password is incorrect" });
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

  const isFormValid = () => {
    return passwordData.currentPassword && 
           passwordData.newPassword && 
           passwordData.confirmPassword &&
           validatePassword(passwordData.newPassword).length === 0 &&
           passwordData.newPassword === passwordData.confirmPassword;
  };

  return (
    <div className="profile-page-wrapper animate-fade-in">
      <div className="profile-header-main">
        <h1>{view === "security" ? "Security Settings" : "My Profile"}</h1>
        <p>{view === "security" ? "Manage your account password and security" : "Manage your account settings and preferences"}</p>
      </div>

      <div className="profile-grid single-column">
        {/* Section 1: Photo & Info */}
        {view === "general" && (
          <section className="profile-card info-section full-width">
          <div className="avatar-upload-container">
            <div className="avatar-large">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" />
              ) : user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user?.name} />
              ) : (
                <div className="avatar-initials">{user?.name?.charAt(0)}</div>
              )}
              
              <button 
                className="camera-btn" 
                onClick={() => fileInputRef.current.click()}
                title="Change Photo"
              >
                <Camera size={20} />
              </button>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoSelect} 
              accept="image/jpeg,image/jpg,image/png,image/webp" 
              hidden 
            />

            {photoFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="upload-actions"
              >
                <button 
                  className="btn-save-photo" 
                  onClick={handlePhotoUpload}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : "Save Photo"}
                </button>
                <button 
                  className="btn-cancel-photo" 
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  disabled={isUploading}
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </div>

          <div className="user-details-read">
            <div className="detail-item">
              <label>Full Name</label>
              <p>{user?.name}</p>
            </div>
            <div className="detail-item">
              <label>Role</label>
              <div className="role-pill">
                <ShieldCheck size={14} />
                {user?.role === 'owner' ? 'Business Owner' : (user?.roleTitle || 'Support Agent')}
              </div>
            </div>
            <div className="detail-item">
              <label>Email Address</label>
              <p>{user?.email}</p>
            </div>
          </div>
          </section>
        )}

        {/* Section 2: Password */}
        {view === "security" && (
          <section className="profile-card password-section full-width">
          <div className="card-header">
            <Lock size={20} className="header-icon" />
            <h3>Change Password</h3>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="password-form">
            <div className={`input-group ${passwordErrors.currentPassword ? 'has-error' : ''}`}>
              <label>Current Password</label>
              <div className="password-input-wrap">
                <input 
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => togglePasswordVisibility('current')} className="toggle-eye">
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.currentPassword && <span className="error-msg">{passwordErrors.currentPassword}</span>}
            </div>

            <div className={`input-group ${passwordErrors.newPassword ? 'has-error' : ''}`}>
              <label>New Password</label>
              <div className="password-input-wrap">
                <input 
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Enter new password"
                />
                <button type="button" onClick={() => togglePasswordVisibility('new')} className="toggle-eye">
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Strength Indicator */}
              {passwordData.newPassword && (
                <div className="strength-meter">
                  <div className="strength-bars">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div 
                        key={i} 
                        className={`bar ${i <= strength.score ? 'active' : ''}`}
                        style={{ backgroundColor: i <= strength.score ? strength.color : '#e2e8f0' }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
              
              {/* Requirements list */}
              <div className="pwd-requirements">
                {["At least 8 chars", "Uppercase", "Lowercase", "Number", "Special symbol"].map((req, i) => {
                  const rules = [
                    passwordData.newPassword.length >= 8,
                    /[A-Z]/.test(passwordData.newPassword),
                    /[a-z]/.test(passwordData.newPassword),
                    /[0-9]/.test(passwordData.newPassword),
                    /[^A-Za-z0-9]/.test(passwordData.newPassword)
                  ];
                  return (
                    <div key={i} className={`req-item ${rules[i] ? 'valid' : ''}`}>
                      <Check size={12} />
                      {req}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`input-group ${passwordErrors.confirmPassword ? 'has-error' : ''}`}>
              <label>Confirm New Password</label>
              <div className="password-input-wrap">
                <input 
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Repeat new password"
                />
                <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="toggle-eye">
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.confirmPassword && <span className="error-msg">{passwordErrors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className="btn-update-password" 
              disabled={!isFormValid() || isUpdatingPassword}
            >
              {isUpdatingPassword ? (
                <><Loader2 size={18} className="animate-spin" /> Updating...</>
              ) : "Update Password"}
            </button>
          </form>
        </section>
      )}
      </div>

      <style>{`
        .profile-page-wrapper {
          padding: 40px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .profile-header-main {
          margin-bottom: 40px;
        }

        .profile-header-main h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 8px;
        }

        @media (min-width: 768px) {
          .profile-header-main h1 {
            font-size: 2rem;
          }
        }

        .profile-header-main p {
          color: #64748b;
          font-weight: 500;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: start;
        }

        .profile-grid.single-column {
          grid-template-columns: 1fr;
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-card.full-width {
          width: 100%;
        }

        .profile-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        /* Avatar Section */
        .avatar-upload-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
        }

        .avatar-large {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 800;
          color: white;
          position: relative;
          box-shadow: 0 10px 25px -5px rgba(53, 37, 205, 0.3);
          border: 4px solid white;
        }

        @media (max-width: 640px) {
          .avatar-large {
            width: 90px;
            height: 90px;
            font-size: 2.2rem;
          }
        }

        .avatar-large img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .camera-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1e293b;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: 0.2s;
        }

        .camera-btn:hover {
          background: #f8fafc;
          transform: scale(1.1);
        }

        .upload-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .btn-save-photo {
          padding: 8px 16px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-cancel-photo {
          padding: 8px 16px;
          background: #f1f5f9;
          color: #64748b;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .user-details-read {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .detail-item label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .detail-item p {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .role-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        /* Password Section */
        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .header-icon {
          color: var(--primary);
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
        }

        .password-form {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.9rem;
          font-weight: 700;
          color: #475569;
        }

        .password-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-input-wrap input {
          width: 100%;
          padding: 12px 16px;
          padding-right: 48px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 500;
          color: #1e293b;
          transition: 0.2s;
        }

        .password-input-wrap input:focus {
          background: white;
          border-color: var(--primary);
          box-shadow: 0 0 0 4px var(--primary-low);
          outline: none;
        }

        .toggle-eye {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }

        .toggle-eye:hover {
          color: var(--primary);
        }

        .error-msg {
          font-size: 0.8rem;
          color: #ef4444;
          font-weight: 600;
          margin-top: 4px;
        }

        /* Strength Meter */
        .strength-meter {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }

        .bar {
          height: 4px;
          flex: 1;
          background: #e2e8f0;
          border-radius: 2px;
          transition: 0.3s;
        }

        .strength-label {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          min-width: 60px;
          text-align: right;
        }

        .pwd-requirements {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
        }

        .req-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #94a3b8;
        }

        .req-item.valid {
          color: #10b981;
        }

        .btn-update-password {
          margin-top: 8px;
          padding: 14px;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(53, 37, 205, 0.2);
        }

        .btn-update-password:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .btn-update-password:disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        @media (max-width: 640px) {
          .profile-page-wrapper {
            padding: 24px 16px;
          }
          
          .profile-card {
            padding: 24px;
          }

          .btn-update-password {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
