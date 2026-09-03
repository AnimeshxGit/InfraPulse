import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'System Error',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`paper-card ${className}`.trim()}
      style={{
        backgroundColor: 'var(--priority-critical-bg)',
        borderColor: 'var(--priority-critical-border)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <AlertCircle
          size={20}
          style={{ color: 'var(--priority-critical-text)', flexShrink: 0, marginTop: 2 }}
        />
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--priority-critical-text)' }}>
            {title}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {message}
          </div>
        </div>
      </div>
      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          icon={<RefreshCw size={14} />}
          style={{ flexShrink: 0 }}
        >
          Retry
        </Button>
      )}
    </div>
  );
};
