import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { useUserComplaints } from '../../hooks/useComplaint';
import { ComplaintCard } from '../../components/complaint/ComplaintCard';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorBanner } from '../../components/feedback/ErrorBanner';
import { PlusCircle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { data: complaints, isLoading, error, refetch } = useUserComplaints();

  const activeComplaints = complaints?.filter((c) => c.status !== 'RESOLVED') || [];
  const resolvedComplaints = complaints?.filter((c) => c.status === 'RESOLVED') || [];

  return (
    <PageLayout
      title="Citizen Maintenance Portal"
      subtitle="Track your reported infrastructure issues and monitor dynamic resolution queue standing."
      action={
        <Link to="/app/new" className="btn btn-primary">
          <PlusCircle size={16} />
          Report a Defect
        </Link>
      }
    >
      {error && (
        <ErrorBanner
          title="Could not load complaints"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Summary Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active in Queue
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                {isLoading ? <Skeleton width={40} height={28} /> : activeComplaints.length}
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--status-resolved-bg)',
                border: '1px solid var(--status-resolved-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-resolved-text)',
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Resolved Defects
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                {isLoading ? <Skeleton width={40} height={28} /> : resolvedComplaints.length}
              </div>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--surface-paper-inset)',
                border: '1px solid var(--border-neutral)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Submissions
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.65rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                {isLoading ? <Skeleton width={40} height={28} /> : (complaints?.length || 0)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Complaints Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Active Defect Reports</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Currently prioritized in maintenance queues.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {[1, 2, 3].map((n) => (
              <Card key={n} style={{ height: 180, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Skeleton width="40%" height={16} />
                <Skeleton width="100%" height={60} />
                <Skeleton width="60%" height={16} style={{ marginTop: 'auto' }} />
              </Card>
            ))}
          </div>
        ) : activeComplaints.length === 0 ? (
          <EmptyState
            title="No Active Defect Reports"
            description="You have no unresolved maintenance complaints. If you notice structural spalling, cracked tiles, paint peeling, or stagnant water, submit a report with photo evidence."
            action={
              <Link to="/app/new" className="btn btn-primary">
                <PlusCircle size={15} />
                Report First Defect
              </Link>
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {activeComplaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        )}
      </section>

      {/* Resolved History Section */}
      {resolvedComplaints.length > 0 && (
        <section>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Resolved History</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Defects verified and repaired by maintenance teams.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {resolvedComplaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} />
            ))}
          </div>
        </section>
      )}
    </PageLayout>
  );
};
