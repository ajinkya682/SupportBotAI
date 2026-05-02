import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ fullPage = false, size = 24, label = "" }) => {
  if (fullPage) {
    return (
      <div className="loading-overlay">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div className="professional-loader" style={{ width: size * 2, height: size * 2 }}></div>
          {label ? (
            <p style={{ 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: 'var(--on-surface-variant)', 
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              {label}
            </p>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>SupportBot AI</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Loading Intelligence...</span>
             </div>
          )}
        </div>
      </div>
    );
  }

    return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={size} className="animate-spin" style={{ color: 'inherit' }} />
      </div>
    );
};

export default Loader;
