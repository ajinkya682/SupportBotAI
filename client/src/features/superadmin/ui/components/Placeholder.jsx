import React from 'react';
import { Construction } from 'lucide-react';

const Placeholder = ({ title }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--on-surface-variant)' }}>
    <Construction size={48} style={{ marginBottom: '24px', opacity: 0.2 }} />
    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{title}</h2>
    <p>This module is currently being optimized for the Master Console.</p>
  </div>
);

export default Placeholder;
