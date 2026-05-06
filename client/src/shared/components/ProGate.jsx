import { Lock, Sparkles } from 'lucide-react';
import usePlan from '../hooks/usePlan';

/**
 * ProGate — wraps content that is locked for free users.
 *
 * Props:
 *  feature      - display name shown in the lock card (e.g. "Team Members")
 *  description  - short message explaining what they unlock (optional)
 *  blur         - if true (default), blurs the children; if false, just disables
 *  children     - the actual feature UI to show/blur
 */
export default function ProGate({ feature, description, blur = true, children }) {
  const { isPro, goUpgrade } = usePlan();

  if (isPro) return <>{children}</>;

  return (
    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
      {/* The actual content — blurred / dimmed */}
      <div
        style={{
          filter: blur ? 'blur(4px)' : 'none',
          opacity: blur ? 0.4 : 1,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '32px 40px',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Lock size={24} color="white" />
          </div>

          <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
            {feature || 'Pro Feature'}
          </h3>
          <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            {description ||
              `This feature is available on the Pro plan. Upgrade to unlock ${feature?.toLowerCase() || 'this feature'} and get the most out of your platform.`}
          </p>

          <button
            onClick={goUpgrade}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Sparkles size={16} />
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ProLockBadge — a small inline lock badge for individual fields/buttons.
 * Use blur={false} scenarios where you just disable a button or field.
 */
export function ProLockBadge({ feature, style = {} }) {
  const { isPro, goUpgrade } = usePlan();
  if (isPro) return null;

  return (
    <span
      onClick={goUpgrade}
      title={`${feature || 'This'} is a Pro feature. Click to upgrade.`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white',
        fontSize: '0.65rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '20px',
        cursor: 'pointer',
        letterSpacing: '0.02em',
        ...style,
      }}
    >
      <Lock size={9} />
      PRO
    </span>
  );
}
