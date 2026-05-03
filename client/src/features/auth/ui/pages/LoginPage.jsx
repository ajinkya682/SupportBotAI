import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, googleLogin, reset } from '../../state/authSlice';
import { SUPER_ADMIN_EMAIL } from '../../../../shared/services/config';
import { LogIn, Mail, Lock, Loader2, Bot, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { useEffect } from 'react';

export default function Login() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess || user) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
    if (isError) {
      toast.error(message || 'Login failed');
    }
    dispatch(reset());
  }, [user, isSuccess, isError, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const onNextStep = (e) => {
    e.preventDefault();
    if (email) setStep(2);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      navigate('/super-admin/login');
      return;
    }
    dispatch(login({ email, password }));
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      dispatch(googleLogin({ accessToken: tokenResponse.access_token }));
    },
    onError: () => { toast.error('Google Login Failed'); }
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'var(--color-surface-container-low)',
      position: 'relative',
      overflow: 'hidden',
      padding: 'var(--space-6)',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px',
        background: 'var(--color-primary-light)', opacity: 0.5, borderRadius: 'var(--radius-full)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px',
        background: 'var(--color-primary-light)', opacity: 0.4, borderRadius: 'var(--radius-full)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass"
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-12)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth: '480px',
        }}
      >

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--weight-extrabold)',
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--color-on-surface)',
          marginBottom: 'var(--space-8)',
          textAlign: 'center',
        }}>
          {step === 1 ? 'Welcome back' : 'Enter password'}
        </h1>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Google Login */}
              <button onClick={handleGoogleLogin} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 'var(--space-3)', width: '100%',
                padding: 'var(--space-4)',
                background: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-on-surface)',
                cursor: 'pointer',
                border: 'none',
                boxShadow: 'var(--shadow-xs)',
                fontFamily: 'var(--font-body)',
                transition: 'box-shadow var(--duration-base) var(--ease-standard)',
                marginBottom: 'var(--space-5)',
                border: '2px solid var(--color-primary-light)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
                Continue with Google
              </button>

              {/* Divider */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                marginBottom: 'var(--space-5)',
              }}>
                <div className="surface-divider" style={{ flex: 1 }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', fontWeight: 'var(--weight-semibold)' }}>OR</span>
                <div className="surface-divider" style={{ flex: 1 }} />
              </div>

              <form onSubmit={onNextStep}>
                <div className="input-wrapper" style={{ marginBottom: 'var(--space-5)' }}>
                  <label className="input-label">
                    <Mail size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Email Address
                  </label>
                  <input
                    className="input-field"
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="name@company.com" 
                    style={{border: '1px solid var(--color-primary-light)'}}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 'var(--space-2)' }}>
                  Next <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => setStep(1)}
                className="btn btn-ghost btn-sm"
                style={{ marginBottom: 'var(--space-5)', paddingLeft: 'var(--space-2)' }}
              >
                <ChevronLeft size={16} /> Back to email
              </button>

              <form onSubmit={onSubmit}>
                <div className="input-wrapper" style={{ marginBottom: 'var(--space-3)' }}>
                  <label className="input-label">
                    <Lock size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                    Password
                  </label>
                  <input
                    className="input-field"
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="••••••••"
                    autoFocus
                    style={{border: '1px solid var(--color-primary-light)'}}
                    required
                  />
                </div>
                <div style={{ textAlign: 'right', marginBottom: 'var(--space-5)' }}>
                  <Link to="/forgot-password" style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-primary)',
                    fontWeight: 'var(--weight-medium)',
                  }}>
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg btn-block${isLoading ? ' btn-loading' : ''}`}
                  disabled={isLoading}
                >
                  {!isLoading && 'Sign In'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{
          marginTop: 'var(--space-8)',
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-on-surface-muted)',
        }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 'var(--weight-semibold)' }}>
            Start for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
