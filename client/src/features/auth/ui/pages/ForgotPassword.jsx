import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Key,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Sparkles,
  Lock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "../../state/authSlice";
import { API_URL } from "../../../../shared/services/config";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devOTP, setDevOTP] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      if (response.data.devOTP) {
        setDevOTP(response.data.devOTP);
      }
      setStep(2);
      toast.success("Verification code sent!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send code. Check your email.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      setStep(3);
      toast.success("Code verified successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid or expired verification code",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      
      // Auto-login with the returned user data and token
      dispatch(login(response.data));
      
      toast.success("Password updated! Logging you in...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <div className="auth-header">
            <div className="auth-logo-icon">
              <Key size={28} />
            </div>
            <h1>
              {step === 1 && "Reset Password"}
              {step === 2 && "Verify Identity"}
              {step === 3 && "New Password"}
            </h1>
            <p>
              {step === 1 && "Enter your email to receive a recovery code."}
              {step === 2 && `We've sent a 6-digit code to ${email}`}
              {step === 3 && "Create a new secure password for your account."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {devOTP && (
              <motion.div 
                className="dev-otp-banner"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Sparkles size={18} className="sparkle" />
                <div className="content">
                  <span className="label">DEVELOPMENT MODE</span>
                  <span className="code">Your OTP is: <strong>{devOTP}</strong></span>
                </div>
              </motion.div>
            )}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <form onSubmit={handleSendOTP} className="auth-form">
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-with-icon">
                      <Mail className="icon" size={20} />
                      <input
                        type="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      "Send Recovery Code"
                    )}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="auth-form">
                  <div className="form-group">
                    <label>6-Digit Verification Code</label>
                    <div className="input-with-icon">
                      <ShieldCheck className="icon" size={20} />
                      <input
                        type="text"
                        placeholder="0 0 0 0 0 0"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="otp-input"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      "Verify Code"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-text btn-block"
                    onClick={() => setStep(1)}
                  >
                    Resend Code
                  </button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleResetPassword} className="auth-form">
                  <div className="form-group">
                    <label>New Password</label>
                    <div className="input-with-icon">
                      <Lock className="icon" size={20} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-with-icon">
                      <CheckCircle2 className="icon" size={20} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <style>{`
        .auth-page { 
          min-height: 100vh; 
          display: flex; 
          align-items: flex-start; /* Mobile top-align */
          justify-content: center; 
          background: var(--surface-container-lowest); 
          padding: 0; 
          position: relative; 
          overflow: hidden; 
        }

        @media (min-width: 640px) {
          .auth-page {
            align-items: center;
            background: var(--surface-container-low);
            padding: 24px;
          }
        }

        .auth-page::before { content: ''; position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, var(--primary-fixed) 0%, transparent 70%); top: -200px; right: -200px; opacity: 0.4; filter: blur(60px); }
        
        .auth-container { width: 100%; max-width: 480px; position: relative; z-index: 1; }
        
        .auth-card { 
          background: white; 
          border-radius: 0; 
          padding: 48px 24px 32px; 
          min-height: 100vh;
          padding-top: calc(48px + env(safe-area-inset-top));
          display: flex;
          flex-direction: column;
        }

        @media (min-width: 640px) {
          .auth-card {
            border-radius: 32px;
            padding: 56px;
            min-height: auto;
            border: 1px solid var(--outline-variant);
            box-shadow: var(--shadow-4);
          }
        }
        
        .back-link { display: flex; align-items: center; gap: 8px; color: var(--on-surface-variant); text-decoration: none; font-size: 0.9rem; font-weight: 700; margin-bottom: 32px; transition: 0.2s; }
        @media (min-width: 640px) { .back-link { margin-bottom: 40px; } }
        .back-link:hover { color: var(--primary); }
        
        .auth-header { text-align: center; margin-bottom: 32px; }
        @media (min-width: 640px) { .auth-header { margin-bottom: 40px; } }

        .auth-logo-icon { width: 56px; height: 56px; background: var(--primary); color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 24px rgba(53, 37, 205, 0.25); }
        @media (min-width: 640px) { .auth-logo-icon { width: 64px; height: 64px; border-radius: 18px; margin-bottom: 24px; } }

        .auth-header h1 { font-size: 1.75rem; margin-bottom: 8px; }
        @media (min-width: 640px) { .auth-header h1 { font-size: 2rem; margin-bottom: 12px; } }

        .auth-header p { color: var(--on-surface-variant); font-size: 0.95rem; line-height: 1.5; }
        @media (min-width: 640px) { .auth-header p { font-size: 1rem; } }
        
        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        @media (min-width: 640px) { .auth-form { gap: 24px; } }

        .input-with-icon { position: relative; }
        .input-with-icon .icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--outline); transition: 0.2s; }
        .input-with-icon input { width: 100%; padding: 14px 16px 14px 48px; background: var(--surface-container-low); border: 1.5px solid var(--outline-variant); border-radius: 14px; font-size: 1rem; color: var(--on-surface); transition: 0.2s; }
        @media (min-width: 640px) { .input-with-icon input { padding: 14px 16px 14px 52px; } }
        .input-with-icon input:focus { border-color: var(--primary); background: var(--surface-container-lowest); outline: none; }
        .input-with-icon input:focus + .icon { color: var(--primary); }
        
        .otp-input { letter-spacing: 8px; text-align: center; font-weight: 900; font-size: 1.15rem !important; padding-left: 16px !important; }
        @media (min-width: 640px) { .otp-input { letter-spacing: 12px; font-size: 1.25rem !important; } }

        .btn-block { height: 52px; font-size: 1rem; width: 100%; }
        @media (min-width: 640px) { .btn-block { height: 56px; } }

        .dev-otp-banner {
          background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
          border: 1px dashed #d97706;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          color: #92400e;
        }

        .dev-otp-banner .sparkle { color: #d97706; }
        .dev-otp-banner .content { display: flex; flex-direction: column; }
        .dev-otp-banner .label { font-size: 10px; font-weight: 800; letter-spacing: 1px; margin-bottom: 2px; opacity: 0.8; }
        .dev-otp-banner .code { font-size: 1rem; font-weight: 500; }
        .dev-otp-banner .code strong { font-weight: 800; font-size: 1.25rem; color: #b45309; margin-left: 4px; }
      `}</style>
    </div>
  );
}
