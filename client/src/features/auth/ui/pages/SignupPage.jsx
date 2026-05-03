import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, googleLogin, reset } from '../../state/authSlice';
import { updateBusiness } from '../../../../features/dashboard/state/businessSlice';
import { 
  User, Mail, Lock, Loader2, Bot, Building2, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', businessName: '', knowledge: ''
  });
  const { name, email, password, businessName, knowledge } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);
  const { isLoading: businessLoading } = useSelector((state) => state.business);

  useEffect(() => {
    if (isSuccess && step === 1) {
      toast.success('Account created successfully!');
      setStep(2);
    }
    if (isError) {
      toast.error(message || 'Registration failed');
      dispatch(reset());
    }
  }, [isSuccess, isError, message, step, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    dispatch(register({ name, email, password }));
  };

  const handleBusinessSetup = (e) => {
    e.preventDefault();
    dispatch(updateBusiness({ name: businessName }));
    setStep(3);
  };

  const handleAISetup = (e) => {
    if (e) e.preventDefault();
    dispatch(updateBusiness({ knowledge }));
    navigate('/dashboard');
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      dispatch(googleLogin({ accessToken: tokenResponse.access_token }));
    },
    onError: () => { toast.error('Google Signup Failed'); }
  });

  const stepLabels = ['Account', 'Business', 'AI Setup'];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Google Signup */}
            <button onClick={handleGoogleSignup} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 'var(--space-3)', width: '100%', padding: 'var(--space-4)',
              background: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-md)', fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-sm)', color: 'var(--color-on-surface)',
              cursor: 'pointer', border: 'none', boxShadow: 'var(--shadow-xs)',
              fontFamily: 'var(--font-body)', marginBottom: 'var(--space-5)',
              transition: 'box-shadow var(--duration-base) var(--ease-standard)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
              Sign up with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div className="surface-divider" style={{ flex: 1 }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-on-surface-muted)', fontWeight: 'var(--weight-semibold)' }}>OR</span>
              <div className="surface-divider" style={{ flex: 1 }} />
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="input-wrapper">
                <label className="input-label"><User size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Full Name</label>
                <input className="input-field" type="text" name="name" value={name} onChange={onChange} placeholder="John Doe" required />
              </div>
              <div className="input-wrapper">
                <label className="input-label"><Mail size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Email Address</label>
                <input className="input-field" type="email" name="email" value={email} onChange={onChange} placeholder="name@company.com" required />
              </div>
              <div className="input-wrapper">
                <label className="input-label"><Lock size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Password</label>
                <input className="input-field" type="password" name="password" value={password} onChange={onChange} placeholder="••••••••" required />
              </div>
              <button type="submit" className={`btn btn-primary btn-lg btn-block${isLoading ? ' btn-loading' : ''}`} disabled={isLoading} style={{ marginTop: 'var(--space-2)' }}>
                {!isLoading && 'Create Account'}
              </button>
            </form>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              marginBottom: 'var(--space-4)',
            }}>
              <div style={{
                width: '28px', height: '28px', background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Building2 size={14} style={{ color: 'var(--color-primary)' }} />
              </div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step 2 of 3</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
              Tell us about your business
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-6)' }}>
              This helps us personalize your AI assistant.
            </p>
            <form onSubmit={handleBusinessSetup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="input-wrapper">
                <label className="input-label"><Building2 size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Business Name</label>
                <input className="input-field" type="text" name="businessName" value={businessName} onChange={onChange} placeholder="Acme Corp" required />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-block">
                Next: AI Training <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              marginBottom: 'var(--space-4)',
            }}>
              <div style={{
                width: '28px', height: '28px', background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={14} style={{ color: 'var(--color-primary)' }} />
              </div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step 3 of 3</span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
              Pre-train your AI
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-6)' }}>
              Describe what your business does or paste some FAQs.
            </p>
            <form onSubmit={handleAISetup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="input-wrapper">
                <label className="input-label"><Bot size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />Business Description / FAQ</label>
                <textarea
                  className="input-field"
                  name="knowledge"
                  value={knowledge}
                  onChange={onChange}
                  placeholder="e.g. We are a digital agency specializing in web design. We are open from 9 AM to 5 PM..."
                />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button type="button" className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={() => navigate('/dashboard')}>
                  Skip for now
                </button>
                <button type="submit" className={`btn btn-primary btn-lg${businessLoading ? ' btn-loading' : ''}`} style={{ flex: 2 }} disabled={businessLoading}>
                  {!businessLoading && 'Complete Setup'}
                </button>
              </div>
            </form>
          </motion.div>
        );
      default: return null;
    }
  };

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass"
        style={{
          position: 'relative', zIndex: 1,
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-12)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%', maxWidth: '500px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: '48px', height: '48px', background: 'var(--color-primary-light)',
            borderRadius: 'var(--radius-full)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto var(--space-4)',
          }}>
            <Bot size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <Link to="/" style={{
            fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)',
            fontSize: 'var(--text-xl)', color: 'var(--color-primary)', letterSpacing: 'var(--tracking-tight)',
          }}>
            SupportBotAI
          </Link>
        </div>

        {/* Step Indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 'var(--space-2)', marginBottom: 'var(--space-8)',
        }}>
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)',
                  background: isCompleted ? 'var(--color-primary-light)' : isActive ? 'var(--color-primary-gradient)' : 'var(--color-surface-container-high)',
                  color: isCompleted ? 'var(--color-primary)' : isActive ? 'white' : 'var(--color-on-surface-muted)',
                  transition: 'all var(--duration-base) var(--ease-standard)',
                }}>
                  {isCompleted ? <CheckCircle2 size={14} /> : stepNum}
                </div>
                {idx < stepLabels.length - 1 && (
                  <div style={{
                    width: '24px', height: '2px',
                    background: step > stepNum ? 'var(--color-primary)' : 'var(--color-surface-container-high)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'background var(--duration-slow) var(--ease-standard)',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--weight-extrabold)',
          letterSpacing: 'var(--tracking-tight)',
          color: 'var(--color-on-surface)',
          marginBottom: 'var(--space-8)',
        }}>
          {step === 1 ? 'Start your free trial' : 'Almost there...'}
        </h1>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {step === 1 && (
          <p style={{
            marginTop: 'var(--space-8)', textAlign: 'center',
            fontSize: 'var(--text-sm)', color: 'var(--color-on-surface-muted)',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 'var(--weight-semibold)' }}>
              Sign In
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
