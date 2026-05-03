import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Check, Sparkles, Zap, Lock, Users, BarChart2, Globe, Download, Palette } from 'lucide-react';
import { getBusiness } from '../../../dashboard/state/businessSlice';
import { API_URL } from '../../../../shared/services/config';

const FEATURES = [
  { icon: <Zap size={16} />,      label: 'Basic AI Chatbot',             free: true,  pro: true  },
  { icon: <Globe size={16} />,     label: 'Manual AI Training',           free: true,  pro: true  },
  { icon: <Check size={16} />,     label: 'Embed Widget',                 free: true,  pro: true  },
  { icon: <Users size={16} />,     label: 'Team Members & Agents',        free: false, pro: true  },
  { icon: <Globe size={16} />,     label: 'AI Website Auto-Scan',         free: false, pro: true  },
  { icon: <BarChart2 size={16} />, label: 'Analytics & Performance',      free: false, pro: true  },
  { icon: <Download size={16} />,  label: 'Export Data (CSV)',            free: false, pro: true  },
  { icon: <Palette size={16} />,   label: 'Widget Branding & Custom Logo',free: false, pro: true  },
];

export default function UpgradePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { business } = useSelector((state) => state.business);
  const [loading, setLoading] = useState(false);

  const isPro = business?.plan === 'pro';

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/conversations/upgrade`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      await dispatch(getBusiness());
      toast.success("🎉 Welcome to Pro! All features are now unlocked.");
      navigate('/dashboard');
    } catch {
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
      padding: '60px 24px',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '56px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          padding: '6px 18px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '20px',
          letterSpacing: '0.05em',
        }}>
          <Sparkles size={14} /> UPGRADE YOUR PLAN
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 16px' }}>
          Unlock the Full Platform
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '520px', margin: '0 auto' }}>
          Everything you need to build a world-class AI support system — without limits.
        </p>
      </div>

      {/* Plan Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '800px',
        margin: '0 auto 56px',
      }}>
        {/* Starter Card */}
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '36px 32px',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Starter</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '8px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b' }}>Free</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>Perfect to get started</p>
          </div>

          {!isPro && (
            <div style={{
              background: '#f1f5f9',
              color: '#64748b',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '24px',
            }}>
              ✓ Your current plan
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FEATURES.map((f) => (
              <div key={f.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.85rem',
                color: f.free ? '#1e293b' : '#cbd5e1',
              }}>
                <span style={{ color: f.free ? '#10b981' : '#cbd5e1' }}>{f.free ? <Check size={15} /> : <Lock size={15} />}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Pro Card */}
        <div style={{
          background: 'linear-gradient(145deg, #4f46e5, #7c3aed)',
          border: 'none',
          borderRadius: '24px',
          padding: '36px 32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(99,102,241,0.35)',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
          }} />

          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pro</span>
              <span style={{ background: '#fbbf24', color: '#78350f', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.05em' }}>MOST POPULAR</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>$49</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>/ month</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginTop: '8px' }}>Everything in Starter, plus:</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', position: 'relative' }}>
            {FEATURES.map((f) => (
              <div key={f.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.95)',
              }}>
                <span style={{ color: '#a5f3a0' }}><Check size={15} /></span>
                {f.label}
              </div>
            ))}
          </div>

          {isPro ? (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              position: 'relative',
            }}>
              ✓ You're on Pro 🎉
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                width: '100%',
                background: 'white',
                color: '#4f46e5',
                border: 'none',
                borderRadius: '14px',
                padding: '15px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                position: 'relative',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
            >
              <Sparkles size={18} />
              {loading ? 'Upgrading...' : 'Upgrade Now — $49/mo'}
            </button>
          )}

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '12px', position: 'relative' }}>
            Cancel anytime · No hidden fees
          </p>
        </div>
      </div>

      {/* Back link */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
