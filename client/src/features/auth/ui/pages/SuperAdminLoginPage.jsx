import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Bot, Shield, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../../../../shared/services/config';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/super-admin/login`, { email, password });
      if (response.data.success) {
        localStorage.setItem('superAdminToken', response.data.token);
        navigate('/super-admin/dashboard/overview');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--color-surface-container-low)',
      position: 'relative', overflow: 'hidden', padding: 'var(--space-6)',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'var(--color-primary-light)', opacity: 0.5, borderRadius: 'var(--radius-full)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'var(--color-primary-light)', opacity: 0.4, borderRadius: 'var(--radius-full)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="glass" style={{ position: 'relative', zIndex: 1, borderRadius: 'var(--radius-xl)', padding: 'var(--space-12)', boxShadow: 'var(--shadow-xl)', width: '100%', maxWidth: '480px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
            <Shield size={24} style={{ color: 'var(--color-primary)' }} />
          </div>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-extrabold)', fontSize: 'var(--text-xl)', color: 'var(--color-primary)', letterSpacing: 'var(--tracking-tight)' }}>SupportBotAI</Link>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <span className="badge badge-primary">Super Admin Portal</span>
          </div>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-extrabold)', letterSpacing: 'var(--tracking-tight)', color: 'var(--color-on-surface)', marginBottom: 'var(--space-8)' }}>
          Secure Portal Access
        </h1>

        {error && (
          <div style={{ background: '#fdecea', color: 'var(--color-error)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', textAlign: 'center', fontWeight: 'var(--weight-medium)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="input-wrapper">
            <label className="input-label">Email Address</label>
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="superadmin@example.com" required />
          </div>
          <div className="input-wrapper">
            <label className="input-label">Password</label>
            <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className={`btn btn-primary btn-lg btn-block${loading ? ' btn-loading' : ''}`} style={{ marginTop: 'var(--space-2)' }}>
            {!loading && (<>Secure Login <ArrowRight size={18} /></>)}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SuperAdminLogin;
