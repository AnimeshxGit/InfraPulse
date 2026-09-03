import React from 'react';
import { ComplaintStatusType, StatusHistoryResponse } from '../../types/complaint';
import { Check, Circle } from 'lucide-react';

export interface ComplaintTimelineProps {
  currentStatus: ComplaintStatusType | string;
  statusHistory?: StatusHistoryResponse[];
}

const STEPS: Array<{ key: ComplaintStatusType; label: string; desc: string }> = [
  { key: 'SUBMITTED', label: 'Submitted', desc: 'Defect logged & enqueued' },
  { key: 'ASSIGNED', label: 'Assigned', desc: 'Claimed by domain staff' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Repairs/inspections underway' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Defect remediated' },
];

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({
  currentStatus,
  statusHistory = [],
}) => {
  const currentStatusUpper = (currentStatus || 'SUBMITTED').toUpperCase();

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 0;
      case 'ASSIGNED':
        return 1;
      case 'IN_PROGRESS':
        return 2;
      case 'RESOLVED':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatusUpper);

  // Map history timestamp to step if available
  const getStepTimestamp = (key: ComplaintStatusType) => {
    const historyItem = statusHistory.find((h) => h.to_status?.toUpperCase() === key);
    if (historyItem) {
      const d = new Date(historyItem.changed_at);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return null;
  };

  return (
    <div
      className="paper-card"
      style={{
        padding: '1.5rem',
      }}
    >
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
        Lifecycle Progression
      </div>

      <div className="timeline-grid">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex || (idx === 3 && currentIndex === 3);
          const isCurrent = idx === currentIndex && currentIndex !== 3;
          const time = getStepTimestamp(step.key);

          let circleBg = 'var(--surface-paper)';
          let circleBorder = 'var(--border-strong)';
          let circleColor = 'var(--text-muted)';
          let labelColor = 'var(--text-secondary)';

          if (isCompleted) {
            circleBg = 'var(--status-resolved-bg)';
            circleBorder = 'var(--status-resolved-border)';
            circleColor = 'var(--status-resolved-text)';
            labelColor = 'var(--text-primary)';
          } else if (isCurrent) {
            circleBg = 'var(--accent-subtle)';
            circleBorder = 'var(--accent-primary)';
            circleColor = 'var(--accent-primary)';
            labelColor = 'var(--accent-primary)';
          }

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Step indicator circle */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: circleBg,
                  border: `2px solid ${circleBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: circleColor,
                  marginBottom: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={2.5} />
                ) : isCurrent ? (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary)',
                    }}
                  />
                ) : (
                  <Circle size={10} style={{ opacity: 0.4 }} />
                )}
              </div>

              {/* Step Title */}
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                  color: labelColor,
                }}
              >
                {step.label}
              </div>

              {/* Subtitle / Timestamp */}
              <div
                className="tabular-nums"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.2rem',
                }}
              >
                {time || step.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
