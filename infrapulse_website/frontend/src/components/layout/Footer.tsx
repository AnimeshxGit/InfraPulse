import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--surface-paper-muted)',
        padding: '1.25rem 0',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <span>InfraPulse Operational Platform</span> &bull; <span>Takneek &rsquo;26</span>
        </div>
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <span>Authoritative Backend v1.0.0</span>
          <span>Dynamic Priority Queues (Structural &bull; Functional &bull; Performance)</span>
        </div>
      </div>
    </footer>
  );
};
