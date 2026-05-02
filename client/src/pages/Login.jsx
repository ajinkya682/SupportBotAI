import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Mail, Lock, Bot, ArrowRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false); // Local loading state

  const { email, password } = formData;
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      console.log("Logged in with:", formData);
      navigate("/dashboard");
    }, 1500);
  };

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

  const handleGoogleLogin = () => {
    console.log("Google Login Clicked");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "var(--color-surface-container-low)",
        position: "relative",
        overflow: "hidden",
        padding: "var(--space-6)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "400px",
          height: "400px",
          background: "var(--color-primary-light)",
          opacity: 0.5,
          borderRadius: "var(--radius-full)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          background: "var(--color-primary-light)",
          opacity: 0.4,
          borderRadius: "var(--radius-full)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass"
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-12)",
          boxShadow: "var(--shadow-xl)",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "var(--color-primary-light)",
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto var(--space-4)",
            }}
          >
            <Bot size={24} style={{ color: "var(--color-primary)" }} />
          </div>
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--weight-extrabold)",
              fontSize: "var(--text-xl)",
              color: "var(--color-primary)",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            SupportBotAI
          </Link>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-3xl)",
            fontWeight: "var(--weight-extrabold)",
            color: "var(--color-on-surface)",
            marginBottom: "var(--space-8)",
          }}
        >
          {step === 1 ? "Welcome back" : "Enter password"}
        </h1>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button onClick={handleGoogleLogin} className="btn-google">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  width="18"
                />
                Continue with Google
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                  marginBottom: "var(--space-5)",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--color-surface-container-high)",
                  }}
                />
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-on-surface-muted)",
                    fontWeight: "var(--weight-bold)",
                  }}
                >
                  OR
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--color-surface-container-high)",
                  }}
                />
              </div>

              <form onSubmit={onNextStep}>
                <div className="input-group">
                  <label className="input-label">
                    <Mail size={14} /> Email Address
                  </label>
                  <input
                    className="input-field"
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  style={{ marginTop: "var(--space-4)" }}
                >
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
            >
              <button
                onClick={() => setStep(1)}
                className="btn btn-ghost btn-sm"
                style={{ marginBottom: "var(--space-4)" }}
              >
                <ChevronLeft size={16} /> Back to email
              </button>

              <form onSubmit={onSubmit}>
                <div className="input-group">
                  <label className="input-label">
                    <Lock size={14} /> Password
                  </label>
                  <input
                    className="input-field"
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    placeholder="••••••••"
                    autoFocus
                    required
                  />
                </div>
                <div
                  style={{ textAlign: "right", marginBottom: "var(--space-5)" }}
                >
                  <Link
                    to="#"
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-primary)",
                      fontWeight: "var(--weight-medium)",
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p
          style={{
            marginTop: "var(--space-8)",
            textAlign: "center",
            fontSize: "var(--text-sm)",
            color: "var(--color-on-surface-muted)",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{
              color: "var(--color-primary)",
              fontWeight: "var(--weight-bold)",
            }}
          >
            Start for free
          </Link>
        </p>
      </motion.div>

      <style>{`
        .input-group { display: flex; flexDirection: column; gap: var(--space-2); margin-bottom: var(--space-4); }
        .input-label { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--color-on-surface-variant); display: flex; align-items: center; gap: 8px; }
        .input-field { 
          width: 100%; padding: var(--space-4); border-radius: var(--radius-md); 
          border: none; background: var(--color-surface-container-low);
          font-family: var(--font-body); transition: all 0.2s;
        }
        .input-field:focus { outline: 2px solid var(--color-primary-light); background: white; }
        .btn-block { width: 100%; justify-content: center; }
        .btn-google {
          display: flex; align-items: center; justify-content: center; gap: 12px; width: 100%;
          padding: var(--space-4); background: white; border-radius: var(--radius-md);
          border: 1px solid var(--color-surface-container-high); cursor: pointer;
          font-family: var(--font-body); font-weight: var(--weight-bold); margin-bottom: var(--space-5);
        }
      `}</style>
    </div>
  );
}
