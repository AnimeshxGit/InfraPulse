import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AuthenticatedImage } from '../ui/AuthenticatedImage';
import { ComplaintResponse } from '../../types/complaint';
import { Eye, ShieldAlert, Sparkles, Ruler } from 'lucide-react';

export interface DefectDetailsCardProps {
  complaint: ComplaintResponse;
}

export const DefectDetailsCard: React.FC<DefectDetailsCardProps> = ({ complaint }) => {
  const isPending = complaint.ai_status === 'PENDING' || complaint.ai_status === 'PROCESSING';

  return (
    <Card style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 650 }}>Defect Analysis & Visual Assessment</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Objective defect identification generated directly by the computer vision model.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {complaint.category && <Badge variant="category" category={complaint.category}>{complaint.category}</Badge>}
          {complaint.severity && <Badge variant="severity" severity={complaint.severity}>Severity: {complaint.severity}</Badge>}
        </div>
      </div>

      <div className="defect-details-grid">
        {/* Left: Defect Photograph */}
        <div>
          <AuthenticatedImage
            src={complaint.image_url}
            alt={`Infrastructure defect photograph for ${complaint.name_snapshot}`}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: 280,
              objectFit: 'cover',
              borderRadius: 'var(--radius-sm)',
            }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
            Submitted photograph &bull; Stored securely
          </div>
        </div>

        {/* Right: Technical Identification Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Detected Defect Name */}
          <div className="paper-card-subtle" style={{ padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 2 }}>
              Detected Defect Type
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {complaint.detected_defect ? (
                <>
                  <ShieldAlert size={20} style={{ color: 'var(--accent-primary)' }} />
                  <span>{complaint.detected_defect.replace('_', ' ')}</span>
                </>
              ) : (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '1rem', fontWeight: 500 }}>
                  {isPending ? 'Processing inference...' : 'Unclassified'}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Autonomous classification &bull; Non-editable system field
            </div>
          </div>

          {/* Metric Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            {/* Confidence */}
            <div className="paper-card-subtle" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} />
                Confidence
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>
                {complaint.confidence !== null && complaint.confidence !== undefined
                  ? `${(complaint.confidence * 100).toFixed(1)}%`
                  : '—'}
              </div>
            </div>

            {/* Visible Extent */}
            <div className="paper-card-subtle" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Ruler size={12} />
                Visible Extent
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>
                {complaint.visible_extent_percentage !== null && complaint.visible_extent_percentage !== undefined
                  ? `${complaint.visible_extent_percentage.toFixed(1)}%`
                  : '—'}
              </div>
              {complaint.extent_label && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {complaint.extent_label} ({complaint.extent_score ?? 0}/3)
                </div>
              )}
            </div>

            {/* Severity Score */}
            <div className="paper-card-subtle" style={{ padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Eye size={12} />
                Severity Score
              </div>
              <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>
                {complaint.severity_score !== null && complaint.severity_score !== undefined
                  ? complaint.severity_score.toFixed(1)
                  : '—'}
              </div>
              {complaint.severity && (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {complaint.severity} Level
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
