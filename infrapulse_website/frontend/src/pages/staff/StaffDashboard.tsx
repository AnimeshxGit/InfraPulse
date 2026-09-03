import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useStaffQueue, useStaffMe } from '../../hooks/useStaffQueue';
import { QueueTable } from '../../components/queue/QueueTable';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorBanner } from '../../components/feedback/ErrorBanner';
import { Shield, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const StaffDashboard: React.FC = () => {
  const { data: staffMe } = useStaffMe();
  const { data: queueData, isLoading: isQueueLoading, error, refetch, isFetching } = useStaffQueue();

  const category = staffMe?.category || queueData?.category || 'Category';
  const totalItems = queueData?.total_items ?? queueData?.items?.length ?? 0;

  return (
    <PageLayout
      title={`${category} Live Priority Queue`}
      subtitle={`Authoritative ranked resolution queue for the ${category} maintenance department.`}
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="category" category={category} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            <Shield size={14} style={{ marginRight: 4 }} />
            {category} Operations
          </Badge>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => refetch()}
            isLoading={isFetching}
            icon={<RefreshCw size={14} />}
            title="Refresh priority queue"
          >
            Refresh
          </Button>
        </div>
      }
    >
      {error && (
        <ErrorBanner
          title="Could not fetch category queue"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Dominant Priority Queue Card */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Priority Ranked Queue</h2>
            <span
              className="tabular-nums"
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--surface-paper-inset)',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {totalItems} active {totalItems === 1 ? 'case' : 'cases'}
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Sorting: Priority Score (Desc) &rarr; Severity &rarr; Confidence &rarr; FIFO
          </div>
        </div>

        {isQueueLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton height={52} />
            <Skeleton height={64} />
            <Skeleton height={64} />
            <Skeleton height={64} />
          </div>
        ) : !queueData || queueData.items.length === 0 ? (
          <EmptyState
            title="Category Queue Clear"
            description={`There are currently no active or unresolved ${category} complaints requiring remediation. New photo submissions will appear automatically via real-time WebSocket events.`}
            icon={<CheckCircle2 size={24} style={{ color: 'var(--status-resolved-text)' }} />}
          />
        ) : (
          <QueueTable items={queueData.items} category={category} />
        )}
      </section>

      {/* Operational Queue Notice */}
      <div
        className="paper-card-subtle"
        style={{
          padding: '1rem 1.25rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <AlertCircle size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong>Operational Sorting & Access Policy:</strong> In accordance with civil maintenance guidelines, complaints are ordered dynamically by calculated risk and extent. Once marked as <strong>Resolved</strong>, complaints automatically exit the live queue and are archived in the historical audit ledger.
        </div>
      </div>
    </PageLayout>
  );
};
