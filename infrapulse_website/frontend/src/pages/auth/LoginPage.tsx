import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, FormField } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/feedback/ErrorBanner';
import { Building2, User, Shield, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'USER' | 'STAFF'>('USER');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { loginUser, loginStaff } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'USER') {
        if (!email.trim() || !password) {
          throw new Error('Please enter your email and password');
        }
        await loginUser({ email: email.trim(), password });
        navigate(from || '/app', { replace: true });
      } else {
        if (!username.trim() || !password) {
          throw new Error('Please enter your staff username and password');
        }
        await loginStaff({ username: username.trim(), password });
        navigate(from || '/staff', { replace: true });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillStaff = (userVal: string) => {
    setUsername(userVal);
    setPassword('staffpass123');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
      }}
    >
      {/* Floating Theme Toggle */}
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-subtle btn-icon"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          style={{
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-neutral)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-paper)',
          }}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--surface-paper)',
            border: '1px solid var(--border-neutral)',
            boxShadow: 'var(--shadow-xs)',
            color: 'var(--accent-primary)',
            marginBottom: '0.85rem',
          }}
        >
          <Building2 size={24} strokeWidth={2.2} />
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 700 }}>InfraPulse</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Civil Defect Reporting & Priority Maintenance System
        </p>
      </div>

      {/* Main Authentication Card */}
      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          padding: 'clamp(1.25rem, 4vw, 2rem)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--surface-paper-inset)',
            padding: 3,
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.75rem',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('USER');
              setError(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '0.55rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: mode === 'USER' ? 'var(--surface-paper)' : 'transparent',
              color: mode === 'USER' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: mode === 'USER' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <User size={15} />
            Citizen Reporter
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('STAFF');
              setError(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '0.55rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-xs)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: mode === 'STAFF' ? 'var(--surface-paper)' : 'transparent',
              color: mode === 'STAFF' ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: mode === 'STAFF' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Shield size={15} />
            Operations Staff
          </button>
        </div>

        {error && (
          <ErrorBanner
            title="Sign in failed"
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'USER' ? (
            <>
              <FormField label="Email Address" required>
                <Input
                  type="email"
                  placeholder="e.g. resident@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </FormField>

              <FormField label="Password" required>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </FormField>
            </>
          ) : (
            <>
              <FormField label="Staff Username" required hint="Assigned category login identifier">
                <Input
                  type="text"
                  placeholder="e.g. alice_structural or bob_functional"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </FormField>

              <FormField label="Staff Password" required>
                <Input
                  type="password"
                  placeholder="Enter your staff password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </FormField>

              {/* Staff Demo Quickfill Helpers */}
              <div
                style={{
                  backgroundColor: 'var(--surface-paper-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1.25rem',
                }}
              >
                <span style={{ fontWeight: 600 }}>Quick Demo Accounts: </span>
                <span
                  style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--accent-primary)', marginRight: 8 }}
                  onClick={() => handleQuickFillStaff('alice_structural')}
                >
                  alice_structural
                </span>
                <span
                  style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--accent-primary)' }}
                  onClick={() => handleQuickFillStaff('bob_functional')}
                >
                  bob_functional
                </span>
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '0.5rem' }}
            icon={<ArrowRight size={16} />}
          >
            {mode === 'USER' ? 'Sign In to Citizen Portal' : 'Access Category Queue'}
          </Button>
        </form>

        {mode === 'USER' && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            First time reporting a defect?{' '}
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
              Create an account
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};
