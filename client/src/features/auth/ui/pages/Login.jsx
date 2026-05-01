import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, googleLogin, reset } from "../../state/authSlice";
import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  Bot,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isSuccess || user) {
      toast.success("Welcome back!");
      if (user.role === "superadmin") {
        navigate("/super-admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
    if (isError) {
      toast.error(message || "Login failed");
    }
    dispatch(reset());
  }, [user, isSuccess, isError, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onNextStep = (e) => {
    e.preventDefault();
    if (email) setStep(2);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      dispatch(googleLogin({ accessToken: tokenResponse.access_token }));
    },
    onError: () => {
      toast.error("Google Login Failed");
    },
  });

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <div className="brand-icon">
              <Bot size={28} color="white" />
            </div>
            <span className="brand-text">
              SUPPORTBOT <span className="highlight">AI</span>
            </span>
          </Link>
          <h2>{step === 1 ? "Neural Access" : "Authenticate"}</h2>
          <p>
            {step === 1
              ? "Enter your credentials to synchronize with the platform."
              : `Logged in as ${email}`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              <button
                className="btn btn-secondary google-btn"
                onClick={handleGoogleLogin}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  width="18"
                />
                <span>Continue with Google</span>
              </button>

              <div className="divider">
                <span>OR SIGN IN WITH EMAIL</span>
              </div>

              <form onSubmit={onNextStep}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary auth-submit-btn">
                  Continue <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <button className="btn-back" onClick={() => setStep(1)}>
                <ChevronLeft size={16} /> Use different email
              </button>

              <form onSubmit={onSubmit}>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="••••••••"
                    autoFocus
                    required
                  />
                </div>
                <div className="forgot-password-link">
                  <Link to="/forgot-password">Recovery options</Link>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Access Neural Node"
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="auth-footer">
          <p>
            New to SupportBotAI? <Link to="/signup">Initialize Account</Link>
          </p>
        </div>
      </motion.div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: flex-start; /* Mobile: top aligned */
          justify-content: center;
          background: var(--surface-container-lowest);
          padding: 0;
        }

        .auth-card {
          width: 100%;
          min-height: 100vh;
          padding: 48px 24px 32px;
          background: white;
          border-radius: 0;
          display: flex;
          flex-direction: column;
          padding-top: calc(48px + env(safe-area-inset-top));
        }

        @media (min-width: 640px) {
          .auth-page {
            align-items: center;
            background: var(--surface);
            padding: 24px;
          }
          .auth-card {
            max-width: 440px;
            min-height: auto;
            padding: 48px;
            border-radius: 24px;
            box-shadow: var(--shadow-overlay);
            border: 1px solid var(--outline-variant);
          }
        }
        
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .auth-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          margin-bottom: 24px;
          text-decoration: none;
        }
        
        .brand-icon {
          background: var(--primary);
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-raised);
        }
        
        .brand-text {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--on-surface);
          letter-spacing: -0.02em;
        }
        
        .brand-text .highlight { color: var(--primary); }
        
        .auth-header h2 { font-size: clamp(1.5rem, 5vw, 1.75rem); margin-bottom: 8px; }
        .auth-header p { color: var(--on-surface-variant); font-size: 0.9rem; line-height: 1.5; }
        
        .google-btn {
          width: 100%;
          background: white;
          border: 1px solid var(--outline-variant);
          margin-bottom: 24px;
          gap: 12px;
        }
        
        .google-btn:hover { background-color: var(--surface-container-low); border-color: var(--primary); }
        
        .divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 24px 0;
          color: var(--outline);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        
        .divider::before, .divider::after { content: ''; flex: 1; border-bottom: 1px solid var(--outline-variant); }
        .divider span { padding: 0 16px; }
        
        .btn-back {
          background: none;
          border: none;
          color: var(--on-surface-variant);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          margin-bottom: 24px;
          font-weight: 600;
          font-size: var(--text-label-sm);
          padding: 8px 0;
          transition: var(--transition-fast);
        }
        
        .btn-back:hover { color: var(--primary); }
        
        .forgot-password-link { text-align: right; margin-top: -16px; margin-bottom: 24px; }
        .forgot-password-link a { color: var(--primary); font-size: var(--text-label-sm); font-weight: 600; text-decoration: none; }
        
        .auth-footer {
          margin-top: auto; /* Push to bottom on mobile */
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid var(--outline-variant);
        }

        @media (min-width: 640px) {
          .auth-footer { margin-top: 32px; }
        }
        
        .auth-footer p { color: var(--on-surface-variant); font-size: 0.9rem; }
        .auth-footer a { color: var(--primary); font-weight: 700; text-decoration: none; }
        
        .auth-submit-btn { width: 100%; font-size: 1rem; }
      `}</style>
    </div>
  );
}
