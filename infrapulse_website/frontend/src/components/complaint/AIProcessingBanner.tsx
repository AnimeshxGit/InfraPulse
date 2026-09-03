import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AIStatusType } from '../../types/complaint';

export interface AIProcessingBannerProps {
  aiStatus: AIStatusType | string;
  detectedDefect?: string | null;
  category?: string | null;
  confidence?: number | null;
  pipelineTimeMs?: number | null;
  errorMessage?: string | null;
}

export const AIProcessingBanner: React.FC<AIProcessingBannerProps> = ({
  aiStatus,
  detectedDefect,
  category,
  confidence,
  pipelineTimeMs,
  errorMessage,
}) => {
  const statusUpper = (aiStatus || 'PENDING').toUpperCase();

  if (statusUpper === 'PENDING' || statusUpper === 'PROCESSING') {
    return (
      <div
        className="paper-card"
        style={{
          backgroundColor: 'var(--priority-medium-bg)',
          borderColor: 'var(--priority-medium-border)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'var(--surface-paper)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--priority-medium-text)',
            flexShrink: 0,
          }}
        >
          <Loader2 className="animate-spin" size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 650, fontSize: '0.95rem', color: 'var(--priority-medium-text)' }}>
            AI Inference & Visual Assessment in Progress
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            The autonomous vision pipeline is analyzing the photograph to identify defect classification, measure visible extent, and calculate objective priority scoring.
          </div>
        </div>
      </div>
    );
  }

  if (statusUpper === 'FAILED') {
    return (
      <div
        className="paper-card"
        style={{
          backgroundColor: 'var(--priority-critical-bg)',
          borderColor: 'var(--priority-critical-border)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: 'var(--surface-paper)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--priority-critical-text)',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 650, fontSize: '0.95rem', color: 'var(--priority-critical-text)' }}>
            AI Defect Analysis Encountered an Issue
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {errorMessage || 'The automated classifier could not complete inference. An operational administrator may re-enqueue this complaint.'}
          </div>
        </div>
      </div>
    );
  }

  // COMPLETED
  return (
    <div
      className="paper-card"
      style={{
        backgroundColor: 'var(--surface-paper-muted)',
        borderColor: 'var(--border-strong)',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: 'var(--status-resolved-bg)',
            border: '1px solid var(--status-resolved-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--status-resolved-text)',
            flexShrink: 0,
          }}
        >
          <CheckCircle2 size={16} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
            Autonomous Defect Classification Verified
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            System-generated detection: <strong>{detectedDefect?.replace('_', ' ')}</strong> &bull; Routed to <strong>{category}</strong> queue
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem' }}>
        {confidence !== undefined && confidence !== null && (
          <div className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            Confidence: <strong>{(confidence * 100).toFixed(1)}%</strong>
          </div>
        )}
        {pipelineTimeMs !== undefined && pipelineTimeMs !== null && (
          <div className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Latency: <strong>{pipelineTimeMs.toFixed(0)} ms</strong>
          </div>
        )}
      </div>
    </div>
  );
};
