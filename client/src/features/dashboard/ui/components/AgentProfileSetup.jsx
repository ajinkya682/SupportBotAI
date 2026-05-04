import { useState, useRef } from "react";
import { Camera, User, Briefcase, CheckCircle2, Loader2, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../../auth/state/authSlice";
import { API_URL } from "../../../../shared/services/config";

export default function AgentProfileSetup({ user, onComplete, onDismiss }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || "");
  const [roleTitle, setRoleTitle] = useState(user?.roleTitle || "Support Agent");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto || null);
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("Photo must be under 1MB");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Please enter your display name");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("displayName", displayName.trim());
      formData.append("roleTitle", roleTitle.trim());
      if (photo) formData.append("photo", photo);

      const { data } = await axios.put(`${API_URL}/agents/update-profile`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile saved! You're all set 🎉");
      // Permanently suppress popup: set flag + update Redux+localStorage
      localStorage.setItem(`profile_setup_done_${user?._id}`, '1');
      dispatch(updateUserProfile({
        displayName: data.agent.displayName,
        roleTitle: data.agent.roleTitle,
        profilePhoto: data.agent.profilePhoto,
      }));
      onComplete?.(data.agent);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ps-overlay">
      <div className="ps-card">
        <div className="ps-header">
          <div className="ps-icon-wrap">
            <User size={24} color="white" />
          </div>
          <div>
            <h2>Complete Your Profile</h2>
            <p>Customers will see this when you join their chat.</p>
          </div>
          {onDismiss && (
            <button className="ps-close" onClick={onDismiss}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Photo Upload */}
        <div className="ps-photo-section">
          <div
            className="ps-avatar-wrap"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="ps-avatar-img" />
            ) : (
              <div className="ps-avatar-placeholder">
                <User size={32} color="#94a3b8" />
              </div>
            )}
            <div className="ps-avatar-overlay">
              <Camera size={18} color="white" />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handlePhotoChange}
          />
          <p className="ps-photo-hint">Click to upload photo (max 1MB)</p>
        </div>

        {/* Fields */}
        <div className="ps-fields">
          <div className="ps-field">
            <label>
              <User size={14} /> Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Johnson"
              maxLength={40}
            />
          </div>
          <div className="ps-field">
            <label>
              <Briefcase size={14} /> Role Title
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Support Agent"
              maxLength={40}
            />
          </div>
        </div>

        <button className="ps-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 size={18} className="spin" />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {saving ? "Saving..." : "Save Profile & Go Live"}
        </button>

        <style>{`
          .ps-overlay {
            position: fixed; inset: 0; background: rgba(15,23,42,0.6);
            backdrop-filter: blur(8px); z-index: 1000;
            display: flex; align-items: center; justify-content: center; padding: 16px;
          }
          .ps-card {
            background: white; border-radius: 24px; padding: 32px;
            width: 100%; max-width: 420px;
            box-shadow: 0 24px 64px rgba(0,0,0,0.2);
            border: 1px solid rgba(255,255,255,0.2);
          }
          .ps-header {
            display: flex; align-items: flex-start; gap: 16px;
            margin-bottom: 28px; position: relative;
          }
          .ps-icon-wrap {
            width: 48px; height: 48px; border-radius: 14px;
            background: var(--primary); display: flex; align-items: center;
            justify-content: center; flex-shrink: 0;
            box-shadow: 0 8px 20px -4px rgba(53,37,205,0.4);
          }
          .ps-header h2 { font-size: 1.15rem; font-weight: 800; color: var(--on-surface); margin: 0 0 4px; }
          .ps-header p { font-size: 0.8rem; color: var(--on-surface-variant); margin: 0; }
          .ps-close {
            position: absolute; top: -4px; right: -4px;
            background: transparent; border: none; cursor: pointer;
            color: var(--outline); padding: 4px; border-radius: 8px;
          }
          .ps-photo-section { display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 24px; }
          .ps-avatar-wrap {
            width: 88px; height: 88px; border-radius: 50%; position: relative;
            cursor: pointer; overflow: hidden;
            border: 3px solid var(--outline-variant);
            transition: border-color 0.2s;
          }
          .ps-avatar-wrap:hover { border-color: var(--primary); }
          .ps-avatar-img { width: 100%; height: 100%; object-fit: cover; }
          .ps-avatar-placeholder {
            width: 100%; height: 100%; background: var(--surface-container);
            display: flex; align-items: center; justify-content: center;
          }
          .ps-avatar-overlay {
            position: absolute; inset: 0; background: rgba(0,0,0,0.45);
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: 0.2s;
          }
          .ps-avatar-wrap:hover .ps-avatar-overlay { opacity: 1; }
          .ps-photo-hint { font-size: 0.7rem; color: var(--outline); font-weight: 500; }
          .ps-fields { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
          .ps-field label {
            display: flex; align-items: center; gap: 6px;
            font-size: 0.8rem; font-weight: 700; color: var(--on-surface-variant);
            margin-bottom: 6px;
          }
          .ps-field input {
            width: 100%; padding: 12px 16px; border-radius: 12px;
            border: 1.5px solid var(--outline-variant); font-size: 0.9rem;
            color: var(--on-surface); outline: none; transition: 0.2s;
            background: var(--surface-container-low);
            box-sizing: border-box;
          }
          .ps-field input:focus { border-color: var(--primary); background: white; }
          .ps-save-btn {
            width: 100%; padding: 14px; border-radius: 14px;
            background: var(--primary); color: white; border: none;
            font-size: 0.95rem; font-weight: 700; cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 10px;
            transition: 0.2s; box-shadow: 0 8px 20px -4px rgba(53,37,205,0.4);
          }
          .ps-save-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
          .ps-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .spin { animation: psSpin 0.8s linear infinite; }
          @keyframes psSpin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
