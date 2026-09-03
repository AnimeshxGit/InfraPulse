import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/ui/Card';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const homePath = isAuthenticated ? (role === 'STAFF' ? '/staff' : '/app') : '/login';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <Card
        style={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          padding: '3rem 2rem',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--surface-paper-inset)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
          }}
        >
          <FileQuestion size={28} />
        </div>

        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Document Not Found (404)</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The requested operational resource or URL path does not exist in the InfraPulse civil registry.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to={homePath} className="btn btn-primary">
            <Home size={16} />
            Return to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
};
