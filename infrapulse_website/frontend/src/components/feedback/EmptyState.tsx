import React from 'react';
import { Card } from '../ui/Card';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description,
  action,
  icon,
}) => {
  return (
    <Card
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderColor: 'var(--border-strong)',
        backgroundColor: 'var(--surface-paper-muted)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: 'var(--surface-paper-inset)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
        }}
      >
        {icon || <Inbox size={24} strokeWidth={1.5} />}
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ maxWidth: 420, fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: action ? '1.5rem' : 0 }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </Card>
  );
};
