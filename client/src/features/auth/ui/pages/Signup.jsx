import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, googleLogin, reset } from '../../state/authSlice';
import { updateBusiness } from '../../../dashboard/state/businessSlice';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Loader2, 
  Bot, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const [step, setStep] = useState(1); // 1: Account, 2: Business, 3: AI Setup
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    businessName: '',
    knowledge: ''
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
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
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
    onError: () => {
      toast.error('Google Signup Failed');
    }
  });

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button className="btn btn-secondary google-btn" onClick={handleGoogleSignup} style={{ width: '100%', background: 'white', border: '1.5px solid var(--outline-variant)' }}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
              <span>Sign up with Google</span>
            </button>
            <div className="divider">
              <span>OR SIGN UP WITH EMAIL</span>
            </div>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>
                  <User size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Full Name
                </label>
                <input type="text" name="name" value={name} onChange={onChange} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>
                  <Mail size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Email Address
                </label>
                <input type="email" name="email" value={email} onChange={onChange} placeholder="name@company.com" required />
              </div>
              <div className="form-group">
                <label>
                  <Lock size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Password
                </label>
                <input type="password" name="password" value={password} onChange={onChange} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', height: '52px' }} disabled={isLoading}>
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
              </button>
            </form>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="step-tag">Step 2 of 3</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Tell us about your business</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', fontSize: '0.95rem' }}>This helps us personalize your AI assistant.</p>
            <form onSubmit={handleBusinessSetup}>
              <div className="form-group">
                <label>
                  <Building2 size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Business Name
                </label>
                <input type="text" name="businessName" value={businessName} onChange={onChange} placeholder="Acme Corp" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px', height: '52px' }}>
                Next: AI Training <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="step-tag">Step 3 of 3</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Pre-train your AI</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', fontSize: '0.95rem' }}>Briefly describe what your business does or paste some FAQs.</p>
            <form onSubmit={handleAISetup}>
              <div className="form-group">
                <label>
                  <Bot size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Business Description / FAQ
                </label>
                <textarea 
                  name="knowledge" 
                  value={knowledge} 
                  onChange={onChange} 
                  placeholder="e.g. We are a digital agency specializing in web design. We are open from 9 AM to 5 PM..." 
                  style={{ minHeight: '160px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, height: '52px' }} onClick={() => navigate('/dashboard')}>
                  Skip for now
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, height: '52px' }} disabled={businessLoading}>
                  {businessLoading ? <Loader2 size={18} className="animate-spin" /> : 'Complete Setup'}
                </button>
              </div>
            </form>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card auth-card"
          style={{ padding: '40px' }}
        >
          <div className="auth-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '24px', textDecoration: 'none' }}>
              <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                <Bot size={32} color="white" />
              </div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', color: 'var(--on-surface)' }}>
                SUPPORTBOT <span style={{ color: 'var(--primary)' }}>AI</span>
              </span>
            </Link>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{step === 1 ? 'Start your free trial' : 'Almost there...'}</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
              {step === 1 ? 'Join thousands of businesses automating support' : 'Finalizing your workspace'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {step === 1 && (
            <div style={{ marginTop: '32px', textAlign: 'center', paddingTop: '24px', borderTop: '1px solid var(--outline-variant)' }}>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--surface-container-low) 0%, var(--surface) 100%);
          padding: 24px;
        }
        .step-tag {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
          background: var(--primary-fixed);
          width: fit-content;
          padding: 4px 12px;
          border-radius: var(--radius-full);
        }
        .google-btn:hover {
          background-color: var(--surface-container-low) !important;
          border-color: var(--primary) !important;
        }
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--outline);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          border-bottom: 1.5px solid var(--outline-variant);
        }
        .divider span { padding: 0 16px; }
      `}</style>
    </div>
  );
}
