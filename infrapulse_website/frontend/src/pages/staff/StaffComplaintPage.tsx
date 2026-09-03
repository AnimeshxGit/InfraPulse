import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { useStaffComplaint, useUpdateComplaintStatus } from '../../hooks/useStaffQueue';
import { DefectDetailsCard } from '../../components/complaint/DefectDetailsCard';
import { PriorityScoreCard } from '../../components/complaint/PriorityScoreCard';
import { ComplaintTimeline } from '../../components/complaint/ComplaintTimeline';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Textarea, FormField } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorBanner } from '../../components/feedback/ErrorBanner';
import { useToast } from '../../components/ui/Toast';
import { ComplaintStatusType } from '../../types/complaint';
import { ArrowLeft, CheckCircle2, Play, UserCheck, Check, History, MapPin } from 'lucide-react';

export const StaffComplaintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: complaint, isLoading, error, refetch } = useStaffComplaint(id);
  const updateStatusMutation = useUpdateComplaintStatus();

  const [notes, setNotes] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <PageLayout
        title="Loading Staff Review..."
        breadcrumbs={[
          { label: 'Category Queue', href: '/staff' },
          { label: 'Review' },
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton height={60} />
          <Skeleton height={280} />
        </div>
      </PageLayout>
    );
  }

  if (error || !complaint) {
    return (
      <PageLayout
        title="Complaint Not Found"
        breadcrumbs={[
          { label: 'Category Queue', href: '/staff' },
          { label: 'Error' },
        ]}
      >
        <ErrorBanner
          title="Staff Review Unavailable"
          message={error?.message || 'Complaint not found or does not belong to your operational category.'}
          onRetry={() => refetch()}
        />
        <Link to="/staff" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to Live Queue
        </Link>
      </PageLayout>
    );
  }

  const currentStatus = complaint.status.toUpperCase() as ComplaintStatusType;

  // Determine allowed next status in predefined lifecycle
  let nextAllowedStatus: ComplaintStatusType | null = null;
  let nextActionLabel = '';
  let nextActionIcon = <Check size={16} />;

  if (currentStatus === 'SUBMITTED') {
    nextAllowedStatus = 'ASSIGNED';
    nextActionLabel = 'Claim & Assign Complaint';
    nextActionIcon = <UserCheck size={16} />;
  } else if (currentStatus === 'ASSIGNED') {
    nextAllowedStatus = 'IN_PROGRESS';
    nextActionLabel = 'Begin Remediation (In Progress)';
    nextActionIcon = <Play size={16} />;
  } else if (currentStatus === 'IN_PROGRESS') {
    nextAllowedStatus = 'RESOLVED';
    nextActionLabel = 'Complete & Mark Resolved';
    nextActionIcon = <CheckCircle2 size={16} />;
  }

  const handleStatusTransition = async (targetStatus: ComplaintStatusType) => {
    setTransitionError(null);

    try {
      await updateStatusMutation.mutateAsync({
        complaintId: complaint.id,
        payload: {
          status: targetStatus,
          notes: notes.trim() || undefined,
        },
      });

      showToast(
        `Complaint #${complaint.id.slice(0, 8)} transitioned to ${targetStatus.replace('_', ' ')}`,
        'success',
        'Status Updated'
      );

      setNotes('');

      if (targetStatus === 'RESOLVED') {
        // Since resolved items leave the queue, navigate to staff queue or history
        navigate('/staff');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setTransitionError(err.message);
      } else {
        setTransitionError('Failed to transition status.');
      }
    }
  };

  return (
    <PageLayout
      title={complaint.detected_defect ? complaint.detected_defect.replace('_', ' ') : 'Staff Complaint Review'}
      subtitle={`Case ID: ${complaint.id} • ${complaint.category || 'Maintenance'} Department`}
      breadcrumbs={[
        { label: 'Category Queue', href: '/staff' },
        { label: `Review #${complaint.id.slice(0, 8)}` },
      ]}
      action={
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Badge variant="status" status={complaint.status} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            {complaint.status.replace('_', ' ')}
          </Badge>
          <Link to="/staff" className="btn btn-sm btn-secondary">
            <ArrowLeft size={14} />
            Back to Queue
          </Link>
        </div>
      }
    >
      {transitionError && (
        <ErrorBanner
          title="Transition Rejected by Backend"
          message={transitionError}
          onRetry={() => setTransitionError(null)}
        />
      )}

      {/* Main Grid */}
      <div className="detail-page-grid" style={{ marginBottom: '2rem' }}>
        {/* Left Column: Vision Assessment & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <DefectDetailsCard complaint={complaint} />

          {/* Location & Reporter Info */}
          <Card style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 650, marginBottom: '1rem' }}>Location & Citizen Report</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Defect Location
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', fontWeight: 550, marginTop: 3 }}>
                  <MapPin size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <span>{complaint.address}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Citizen Description
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.45 }}>
                  {complaint.description}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div>
                  Citizen: <strong style={{ color: 'var(--text-primary)' }}>{complaint.name_snapshot}</strong>
                </div>
                <div>
                  Registered: <span className="tabular-nums">{new Date(complaint.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Status Transition Controls & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Lifecycle Controls */}
          <Card style={{ padding: '1.5rem', borderColor: 'var(--border-focus)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 650, marginBottom: '0.35rem' }}>Operational Status Controls</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enforces the strict lifecycle: Submitted &rarr; Assigned &rarr; In Progress &rarr; Resolved.
            </p>

            {currentStatus === 'RESOLVED' ? (
              <div
                style={{
                  backgroundColor: 'var(--status-resolved-bg)',
                  border: '1px solid var(--status-resolved-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--status-resolved-text)',
                }}
              >
                <CheckCircle2 size={20} />
                <div>
                  <div style={{ fontWeight: 650, fontSize: '0.9rem' }}>Defect Fully Remediated</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    Resolved at {complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleString() : 'N/A'}. This case is archived in history.
                  </div>
                </div>
              </div>
            ) : nextAllowedStatus ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FormField label="Operational Transition Notes (Optional)">
                  <Textarea
                    rows={2}
                    placeholder="e.g. Work crew dispatched to site with materials..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </FormField>

                <Button
                  variant="primary"
                  onClick={() => handleStatusTransition(nextAllowedStatus!)}
                  isLoading={updateStatusMutation.isPending}
                  icon={nextActionIcon}
                  style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem' }}
                >
                  {nextActionLabel}
                </Button>

                {/* Visual indicator of invalid next transitions */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Next sequential state: <strong>{nextAllowedStatus.replace('_', ' ')}</strong>
                </div>
              </div>
            ) : null}
          </Card>

          {/* Priority Standing Summary */}
          <PriorityScoreCard
            priorityScore={complaint.priority_score}
            priorityLevel={complaint.priority_level}
            queuePosition={complaint.queue_position ? {
              complaint_id: complaint.id,
              category: complaint.category,
              in_queue: complaint.status !== 'RESOLVED',
              rank: complaint.queue_position,
              queue_size: complaint.queue_size,
              status: complaint.status,
              ai_status: complaint.ai_status,
            } : null}
            status={complaint.status}
          />

          {/* Lifecycle Stepper */}
          <ComplaintTimeline
            currentStatus={complaint.status}
            statusHistory={complaint.status_history}
          />

          {/* Status Audit Log */}
          {complaint.status_history?.length > 0 && (
            <Card style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 650, marginBottom: '0.85rem' }}>
                <History size={16} />
                <span>Status Audit History</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {complaint.status_history.map((h) => {
                  const changeTime = new Date(h.changed_at).toLocaleString();
                  return (
                    <div
                      key={h.id}
                      style={{
                        fontSize: '0.8rem',
                        borderLeft: '2px solid var(--border-strong)',
                        paddingLeft: '0.65rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {h.from_status} &rarr; {h.to_status}
                      </div>
                      <div className="tabular-nums" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {changeTime} &bull; by {h.changed_by_role}
                      </div>
                      {h.notes && (
                        <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 2 }}>
                          &ldquo;{h.notes}&rdquo;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
