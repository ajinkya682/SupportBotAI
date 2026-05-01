import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, ShieldCheck, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../../../shared/services/config';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      setStep(3);
      toast.success('OTP verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword });
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = ['Enter your email to receive a reset code.', "We've sent a 6-digit code to your email.", 'Create a new secure password for your account.'];

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--color-surface-container-low)',
      position: 'relative', overflow: 'hidden', padding: 'var(--space-6)',
    }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'var(--color-primary-light)', opacity: 0.5, borderRadius: 'var(--radius-full)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'var(--color-primary-light)', opacity: 0.4, borderRadius: 'var(--radius-full)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass" style={{ position: 'relative', zIndex: 1, borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: '480px' }}>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)', marginBottom: 'var(--space-8)', transition: 'color var(--duration-base) var(--ease-standard)' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-on-surface-muted)'; }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)' }}>
            <Sparkles size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-3)' }}>Reset Password</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)' }}>{stepTitles[step - 1]}</p>
        </div>

        {/* Step progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ width: s === step ? '24px' : '8px', height: '8px', borderRadius: 'var(--radius-full)', background: s <= step ? 'var(--color-primary)' : 'var(--color-surface-container-high)', transition: 'all var(--duration-slow) var(--ease-standard)' }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {step === 1 && (
              <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div className="input-wrapper">
                  <label className="input-label"><Mail size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Email Address</label>
                  <input className="input-field" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className={`btn btn-primary btn-lg btn-block${isLoading ? ' btn-loading' : ''}`} disabled={isLoading}>{!isLoading && 'Send Reset Code'}</button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div className="input-wrapper">
                  <label className="input-label"><ShieldCheck size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />6-Digit Code</label>
                  <input className="input-field" type="text" placeholder="123456" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} style={{ letterSpacing: '8px', textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)' }} required />
                </div>
                <button type="submit" className={`btn btn-primary btn-lg btn-block${isLoading ? ' btn-loading' : ''}`} disabled={isLoading}>{!isLoading && 'Verify Code'}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Resend Code</button>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div className="input-wrapper">
                  <label className="input-label"><Key size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />New Password</label>
                  <input className="input-field" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </div>
                <div className="input-wrapper">
                  <label className="input-label"><Key size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Confirm Password</label>
                  <input className={`input-field${error ? ' error' : ''}`} type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  {error && <span className="input-error-msg">{error}</span>}
                </div>
                <button type="submit" className={`btn btn-primary btn-lg btn-block${isLoading ? ' btn-loading' : ''}`} disabled={isLoading}>{!isLoading && 'Reset Password'}</button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
