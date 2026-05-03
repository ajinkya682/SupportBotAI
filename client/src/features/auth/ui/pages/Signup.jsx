import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    businessName: '',
    knowledge: ''
  });
  const { name, email, password, businessName, knowledge } = formData;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'free';
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
    dispatch(register({ name, email, password, plan }));
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

      dispatch(googleLogin({ accessToken: tokenResponse.access_token, plan }));
    },
    onError: (error) => {

      toast.error('Google Signup Failed');
    }
  });

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <button className="btn btn-secondary google-btn full-width" onClick={handleGoogleSignup}>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
              <span>Sign up with Google</span>
            </button>
            <div className="divider">
              <span>OR SIGN UP WITH EMAIL</span>
            </div>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label><User size={14} className="label-icon" /> Full Name</label>
                <input type="text" name="name" value={name} onChange={onChange} placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label><Mail size={14} className="label-icon" /> Email Address</label>
                <input type="email" name="email" value={email} onChange={onChange} placeholder="name@company.com" required />
              </div>
              <div className="form-group">
                <label><Lock size={14} className="label-icon" /> Password</label>
                <input type="password" name="password" value={password} onChange={onChange} placeholder="••••••••" required />
              </div>
              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={isLoading}>
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
              </button>
            </form>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="step-tag">Step 2 of 3</div>
            <h3>Tell us about your business</h3>
            <p className="step-desc">This helps us personalize your AI assistant.</p>
            <form onSubmit={handleBusinessSetup}>
              <div className="form-group">
                <label><Building2 size={14} className="label-icon" /> Business Name</label>
                <input type="text" name="businessName" value={businessName} onChange={onChange} placeholder="Acme Corp" required />
              </div>
              <button type="submit" className="btn btn-primary auth-submit-btn">
                Next: AI Training <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="step-tag">Step 3 of 3</div>
            <h3>Pre-train your AI</h3>
            <p className="step-desc">Briefly describe what your business does or paste some FAQs.</p>
            <form onSubmit={handleAISetup}>
              <div className="form-group">
                <label><Bot size={14} className="label-icon" /> Business Description / FAQ</label>
                <textarea 
                  name="knowledge" 
                  value={knowledge} 
                  onChange={onChange} 
                  placeholder="e.g. We are a digital agency specializing in web design. We are open from 9 AM to 5 PM..." 
                  style={{ minHeight: '160px' }}
                />
              </div>
              <div className="button-group-responsive">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => navigate('/dashboard')}>
                  Skip for now
                </button>
                <button type="submit" className="btn btn-primary flex-2" disabled={businessLoading}>
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <div className="auth-header">
          <h2>{step === 1 ? 'Start your free trial' : 'Almost there...'}</h2>
          <p className="header-desc">
            {step === 1 ? 'Join thousands of businesses automating support' : 'Finalizing your workspace'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>

        {step === 1 && (
          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login" className="login-link-footer">Sign In</Link>
            </p>
          </div>
        )}
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          background: var(--surface-container-lowest);
          padding: 0;
        }

        .auth-card {
          width: 100%;
          min-height: 100vh;
          padding: 24px;
          background: white;
          border-radius: 0;
          display: flex;
          flex-direction: column;
          padding-top: calc(80px + env(safe-area-inset-top)); /* Adjusted to clear navbar */
        }

        @media (min-width: 640px) {
          .auth-page {
            align-items: center;
            background: var(--surface);
            padding: 80px 24px 24px;
          }
          .auth-card {
            max-width: 480px;
            min-height: auto;
            padding: 32px 40px;
            margin-top: 20px;
            margin-bottom: 20px;
            border-radius: 24px;
            box-shadow: var(--shadow-overlay);
            border: 1px solid var(--outline-variant);
          }
        }

        .auth-header { text-align: center; margin-bottom: 24px; }
        .auth-brand { display: flex; align-items: center; gap: 12px; justify-content: center; margin-bottom: 24px; text-decoration: none; }
        .brand-icon { background: var(--primary); padding: 8px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-raised); }
        .brand-text { font-size: 1.25rem; font-weight: 800; color: var(--on-surface); letter-spacing: -0.02em; }
        .brand-text .highlight { color: var(--primary); }
        
        .auth-header h2 { font-size: clamp(1.5rem, 5vw, 1.75rem); margin-bottom: 8px; }
        .header-desc { color: var(--on-surface-variant); font-size: 0.9rem; }

        .google-btn { width: 100%; background: white; border: 1px solid var(--outline-variant); margin-bottom: 24px; gap: 12px; height: 44px; }
        .google-btn:hover { background-color: var(--surface-container-low); border-color: var(--primary); }
        
        .divider { display: flex; align-items: center; text-align: center; margin: 16px 0; color: var(--outline); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; }
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1.5px solid var(--outline-variant); }
        .divider span { padding: 0 16px; }

        .label-icon { margin-right: 8px; vertical-align: middle; }
        .auth-submit-btn { width: 100%; margin-top: 8px; height: 52px; font-size: 1rem; }

        .step-tag { font-size: 0.7rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; background: var(--surface-container-low); width: fit-content; padding: 4px 12px; border-radius: var(--radius-full); }
        .step-desc { color: var(--on-surface-variant); margin-bottom: 24px; font-size: 0.9rem; line-height: 1.5; }

        .button-group-responsive { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        @media (min-width: 640px) { .button-group-responsive { flex-direction: row; gap: 16px; } }
        
        .flex-1 { flex: 1; }
        .flex-2 { flex: 2; }

        .auth-footer { margin-top: auto; text-align: center; padding-top: 24px; border-top: 1px solid var(--outline-variant); }
        @media (min-width: 640px) { .auth-footer { margin-top: 32px; } }
        
        .auth-footer p { color: var(--on-surface-variant); font-size: 0.9rem; }
        .login-link-footer { color: var(--primary); font-weight: 700; text-decoration: none; }
      `}</style>
    </div>
  );
}
