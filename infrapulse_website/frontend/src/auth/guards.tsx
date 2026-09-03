import React, { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface GuardProps {
  children: ReactElement;
}

/**
 * Ensures user is authenticated. If not, redirects to /login.
 */
export function RequireAuth({ children }: GuardProps): ReactElement {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ width: 28, height: 28, border: '2px solid var(--border-neutral)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', margin: '0 auto 12px auto' }} />
          <p style={{ fontSize: '0.9rem' }}>Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Ensures user has the specific required role (USER or STAFF).
 * If authenticated but with the wrong role, redirects to their designated home.
 */
export function RequireRole({
  role: expectedRole,
  children,
}: {
  role: 'USER' | 'STAFF';
  children: ReactElement;
}): ReactElement {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ width: 28, height: 28, border: '2px solid var(--border-neutral)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', margin: '0 auto 12px auto' }} />
          <p style={{ fontSize: '0.9rem' }}>Authorizing role access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== expectedRole) {
    // Redirect cross-role attempts to their authorized home
    if (role === 'STAFF') {
      return <Navigate to="/staff" replace />;
    } else {
      return <Navigate to="/app" replace />;
    }
  }

  return children;
}

/**
 * For public auth pages like /login or /register.
 * If already authenticated, redirects to the role-appropriate dashboard.
 */
export function RedirectIfAuth({ children }: GuardProps): ReactElement {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{ width: 28, height: 28, border: '2px solid var(--border-neutral)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }} />
      </div>
    );
  }

  if (isAuthenticated) {
    if (role === 'STAFF') {
      return <Navigate to="/staff" replace />;
    }
    return <Navigate to="/app" replace />;
  }

  return children;
}
