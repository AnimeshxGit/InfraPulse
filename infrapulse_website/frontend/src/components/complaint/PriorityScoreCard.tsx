import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { QueuePositionResponse } from '../../types/queue';
import { PriorityLevelType } from '../../types/complaint';
import { Layers, Activity } from 'lucide-react';

export interface PriorityScoreCardProps {
  priorityScore?: number | null;
  priorityLevel?: PriorityLevelType | string | null;
  queuePosition?: QueuePositionResponse | null;
  status: string;
}

export const PriorityScoreCard: React.FC<PriorityScoreCardProps> = ({
  priorityScore,
  priorityLevel,
  queuePosition,
  status,
}) => {
  const isResolved = status.toUpperCase() === 'RESOLVED';

  return (
    <Card style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 650 }}>Priority & Queue Standing</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Authoritative dynamic queue ordering calculated by backend multi-criteria ranking.
          </p>
        </div>
        {priorityLevel && (
          <Badge variant="priority" priority={priorityLevel} style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
            {priorityLevel} Priority
          </Badge>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {/* Dynamic Queue Position */}
        <div
          className="paper-card-subtle"
          style={{
            padding: '1.1rem',
            borderLeft: '4px solid var(--accent-primary)',
            backgroundColor: 'var(--surface-paper)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Layers size={14} />
            Queue Position
          </div>

          <div style={{ marginTop: 6 }}>
            {isResolved ? (
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--status-resolved-text)' }}>
                Resolved (Exited Live Queue)
              </div>
            ) : queuePosition && queuePosition.in_queue && queuePosition.rank ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                  #{queuePosition.rank}
                </span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  of {queuePosition.queue_size ?? '—'} active in {queuePosition.category || 'category'}
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 }}>
                {status.toUpperCase() === 'SUBMITTED' ? 'Awaiting AI classification...' : 'Not in active queue'}
              </div>
            )}
          </div>
        </div>

        {/* Priority Score */}
        <div
          className="paper-card-subtle"
          style={{
            padding: '1.1rem',
            backgroundColor: 'var(--surface-paper)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Activity size={14} />
            Calculated Priority Score
          </div>

          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {priorityScore !== null && priorityScore !== undefined ? priorityScore.toFixed(1) : '—'}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              / 100.0 Scale
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Multi-criteria weighted calculation (Risk &times; Severity &times; Extent)
          </div>
        </div>
      </div>
    </Card>
  );
};
