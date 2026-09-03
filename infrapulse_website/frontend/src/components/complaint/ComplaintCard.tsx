import React from 'react';
import { Link } from 'react-router-dom';
import { ComplaintResponse } from '../../types/complaint';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AuthenticatedImage } from '../ui/AuthenticatedImage';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';

export interface ComplaintCardProps {
  complaint: ComplaintResponse;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  const isPending = complaint.ai_status === 'PENDING' || complaint.ai_status === 'PROCESSING';
  const createdDate = new Date(complaint.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      className="paper-card-interactive"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div>
        {/* Top: Status Badges and ID */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.85rem',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <Badge variant="status" status={complaint.status}>
              {complaint.status.replace('_', ' ')}
            </Badge>
            {complaint.category && (
              <Badge variant="category" category={complaint.category}>
                {complaint.category}
              </Badge>
            )}
          </div>

          {complaint.priority_level && (
            <Badge variant="priority" priority={complaint.priority_level}>
              {complaint.priority_level}
            </Badge>
          )}
        </div>

        {/* Thumbnail & Defect Title */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <AuthenticatedImage
            src={complaint.image_url}
            alt={complaint.name_snapshot}
            style={{
              width: 72,
              height: 72,
              objectFit: 'cover',
              borderRadius: 'var(--radius-sm)',
              flexShrink: 0,
            }}
          />

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '1rem', fontWeight: 650, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {complaint.detected_defect ? (
                complaint.detected_defect.replace('_', ' ')
              ) : (
                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 500 }}>
                  {isPending ? 'AI Analyzing defect...' : 'Pending identification'}
                </span>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <MapPin size={13} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{complaint.address}</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {complaint.description}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metadata & Link */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={13} />
          <span className="tabular-nums">{createdDate}</span>
        </div>

        <Link
          to={`/app/complaints/${complaint.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 600,
            color: 'var(--accent-primary)',
          }}
        >
          View Standing
          <ArrowRight size={14} />
        </Link>
      </div>
    </Card>
  );
};
