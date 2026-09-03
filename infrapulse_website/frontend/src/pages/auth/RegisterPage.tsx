import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, FormField } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/feedback/ErrorBanner';
import { Building2, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { registerUser } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/app', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
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
          Register Citizen Account
        </p>
      </div>

      <Card
        style={{
          width: '100%',
          maxWidth: 440,
          padding: 'clamp(1.25rem, 4vw, 2rem)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>Create an Account</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Report infrastructure defects with photo evidence and track real-time resolution queues.
        </p>

        {error && (
          <ErrorBanner
            title="Registration error"
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        <form onSubmit={handleSubmit}>
          <FormField label="Full Name" required>
            <Input
              type="text"
              placeholder="e.g. Maya Lin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </FormField>

          <FormField label="Email Address" required>
            <Input
              type="email"
              placeholder="e.g. maya.lin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" required hint="At least 6 characters">
            <Input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>

          <FormField label="Confirm Password" required>
            <Input
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '0.5rem' }}
            icon={<ArrowRight size={16} />}
          >
            Register & Continue
          </Button>
        </form>

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
          Already registered?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
            Sign in here
          </Link>
        </div>
      </Card>
    </div>
  );
};
