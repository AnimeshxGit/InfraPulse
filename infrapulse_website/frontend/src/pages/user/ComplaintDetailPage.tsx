import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { useComplaintDetail, useComplaintPosition, useComplaintEvents } from '../../hooks/useComplaint';
import { DefectDetailsCard } from '../../components/complaint/DefectDetailsCard';
import { PriorityScoreCard } from '../../components/complaint/PriorityScoreCard';
import { ComplaintTimeline } from '../../components/complaint/ComplaintTimeline';
import { AIProcessingBanner } from '../../components/complaint/AIProcessingBanner';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorBanner } from '../../components/feedback/ErrorBanner';
import { MapPin, ArrowLeft, History } from 'lucide-react';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: complaint,
    isLoading: isComplaintLoading,
    error: complaintError,
    refetch,
  } = useComplaintDetail(id);

  const { data: queuePosition } = useComplaintPosition(id, complaint?.status !== 'RESOLVED');
  const { data: events } = useComplaintEvents(id);

  if (isComplaintLoading) {
    return (
      <PageLayout
        title="Loading Complaint Record..."
        breadcrumbs={[
          { label: 'My Complaints', href: '/app' },
          { label: 'Detail' },
        ]}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton height={60} />
          <Skeleton height={280} />
          <Skeleton height={140} />
        </div>
      </PageLayout>
    );
  }

  if (complaintError || !complaint) {
    return (
      <PageLayout
        title="Defect Report Not Found"
        breadcrumbs={[
          { label: 'My Complaints', href: '/app' },
          { label: 'Not Found' },
        ]}
      >
        <ErrorBanner
          title="Complaint Record Unavailable"
          message={complaintError?.message || 'The requested complaint record does not exist or you do not have permission to view it.'}
          onRetry={() => refetch()}
        />
        <Link to="/app" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Return to My Complaints
        </Link>
      </PageLayout>
    );
  }

  const createdDate = new Date(complaint.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <PageLayout
      title={complaint.detected_defect ? complaint.detected_defect.replace('_', ' ') : 'Defect Report'}
      subtitle={`Reference ID: ${complaint.id}`}
      breadcrumbs={[
        { label: 'My Complaints', href: '/app' },
        { label: `Defect #${complaint.id.slice(0, 8)}` },
      ]}
      action={
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Badge variant="status" status={complaint.status} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            {complaint.status.replace('_', ' ')}
          </Badge>
          <Link to="/app" className="btn btn-sm btn-secondary">
            <ArrowLeft size={14} />
            Back to List
          </Link>
        </div>
      }
    >
      {/* Real-time AI Processing Banner */}
      <AIProcessingBanner
        aiStatus={complaint.ai_status}
        detectedDefect={complaint.detected_defect}
        category={complaint.category}
        confidence={complaint.confidence}
        pipelineTimeMs={complaint.pipeline_time_ms}
        errorMessage={complaint.error_message}
      />

      {/* Main Grid: Details + Priority Standing */}
      <div className="detail-page-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Left Column: Vision Assessment & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <DefectDetailsCard complaint={complaint} />

          {/* Location & Report Details */}
          <Card style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 650, marginBottom: '1rem' }}>Location & Description</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Physical Location
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.95rem', fontWeight: 550, marginTop: 3 }}>
                  <MapPin size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <span>{complaint.address}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Problem Description
                </div>
                <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.45 }}>
                  {complaint.description}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <div>
                  Reporter: <strong style={{ color: 'var(--text-primary)' }}>{complaint.name_snapshot}</strong>
                </div>
                <div>
                  Submitted: <span className="tabular-nums">{createdDate}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Queue Standing & Lifecycle Stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <PriorityScoreCard
            priorityScore={complaint.priority_score}
            priorityLevel={complaint.priority_level}
            queuePosition={queuePosition || (complaint.queue_position ? {
              complaint_id: complaint.id,
              category: complaint.category,
              in_queue: complaint.status !== 'RESOLVED',
              rank: complaint.queue_position,
              queue_size: complaint.queue_size,
              status: complaint.status,
              ai_status: complaint.ai_status,
            } : null)}
            status={complaint.status}
          />

          <ComplaintTimeline
            currentStatus={complaint.status}
            statusHistory={complaint.status_history || events}
          />

          {/* Status Audit Log */}
          {(complaint.status_history?.length > 0 || (events && events.length > 0)) && (
            <Card style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 650, marginBottom: '0.85rem' }}>
                <History size={16} />
                <span>Audit & Status Change Log</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {(complaint.status_history || events || []).map((h) => {
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
