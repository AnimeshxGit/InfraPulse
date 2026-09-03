import React from 'react';
import { Link } from 'react-router-dom';
import { QueueItemResponse } from '../../types/queue';
import { Badge } from '../ui/Badge';
import { AuthenticatedImage } from '../ui/AuthenticatedImage';
import { ArrowUpRight, Clock, MapPin } from 'lucide-react';

export interface QueueTableProps {
  items: QueueItemResponse[];
  category: string;
}

export const QueueTable: React.FC<QueueTableProps> = ({ items, category: _category }) => {
  return (
    <div>
      {/* Desktop & Tablet Table View (>= 769px) */}
      <div
        className="paper-card hide-on-mobile"
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--surface-paper-muted)',
                  borderBottom: '1px solid var(--border-neutral)',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '0.85rem 1.25rem', width: '70px' }}>Rank</th>
                <th style={{ padding: '0.85rem 1rem', width: '70px' }}>Image</th>
                <th style={{ padding: '0.85rem 1rem' }}>Detected Defect</th>
                <th style={{ padding: '0.85rem 1rem' }}>Location</th>
                <th style={{ padding: '0.85rem 1rem', width: '130px' }}>Priority</th>
                <th style={{ padding: '0.85rem 1rem', width: '100px' }}>Severity</th>
                <th style={{ padding: '0.85rem 1rem', width: '130px' }}>Submitted</th>
                <th style={{ padding: '0.85rem 1rem', width: '120px' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', width: '90px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const date = new Date(item.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={item.complaint_id || item.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-paper-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Authoritative Rank */}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div
                        className="tabular-nums"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--radius-xs)',
                          fontWeight: 750,
                          fontSize: '1rem',
                          backgroundColor: item.rank === 1 ? 'var(--accent-subtle)' : 'var(--surface-paper-inset)',
                          color: item.rank === 1 ? 'var(--accent-primary)' : 'var(--text-primary)',
                          border: item.rank === 1 ? '1px solid var(--accent-border)' : '1px solid var(--border-neutral)',
                        }}
                      >
                        {item.rank}
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <AuthenticatedImage
                        src={item.image_url}
                        alt={item.detected_defect || 'Defect'}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-xs)',
                        }}
                      />
                    </td>

                    {/* Detected Defect */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 650, color: 'var(--text-primary)' }}>
                        {item.detected_defect ? (
                          item.detected_defect.replace('_', ' ')
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending AI</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span>Reporter: {item.name_snapshot}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: 'var(--text-secondary)',
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <MapPin size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.address}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div className="tabular-nums" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {item.priority_score !== null && item.priority_score !== undefined ? item.priority_score.toFixed(1) : '—'}
                        </div>
                        {item.priority_level && (
                          <div>
                            <Badge variant="priority" priority={item.priority_level} style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                              {item.priority_level}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Severity */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {item.severity ? (
                        <Badge variant="severity" severity={item.severity} style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                          {item.severity}
                        </Badge>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>

                    {/* Submitted Time */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div
                        className="tabular-nums"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Clock size={12} />
                        <span>{date}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <Badge variant="status" status={item.status} style={{ fontSize: '0.7rem' }}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </td>

                    {/* Review Action */}
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <Link
                        to={`/staff/complaints/${item.complaint_id || item.id}`}
                        className="btn btn-sm btn-secondary"
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        Review
                        <ArrowUpRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Stacked Card View (<= 768px) */}
      <div
        className="show-on-mobile"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {items.map((item) => {
          const date = new Date(item.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={item.complaint_id || item.id}
              className="paper-card paper-card-interactive"
              style={{
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {/* Header: Rank + Status + Priority */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    className="tabular-nums"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 'var(--radius-xs)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      backgroundColor: item.rank === 1 ? 'var(--accent-subtle)' : 'var(--surface-paper-inset)',
                      color: item.rank === 1 ? 'var(--accent-primary)' : 'var(--text-primary)',
                      border: item.rank === 1 ? '1px solid var(--accent-border)' : '1px solid var(--border-neutral)',
                    }}
                  >
                    #{item.rank}
                  </div>
                  <Badge variant="status" status={item.status} style={{ fontSize: '0.72rem' }}>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {item.priority_level && (
                    <Badge variant="priority" priority={item.priority_level} style={{ fontSize: '0.7rem' }}>
                      {item.priority_level}
                    </Badge>
                  )}
                  {item.severity && (
                    <Badge variant="severity" severity={item.severity} style={{ fontSize: '0.7rem' }}>
                      {item.severity}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Main Content: Thumbnail + Details */}
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <AuthenticatedImage
                  src={item.image_url}
                  alt={item.detected_defect || 'Defect'}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-xs)',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 650, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {item.detected_defect ? item.detected_defect.replace('_', ' ') : 'Pending AI'}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      marginTop: 3,
                    }}
                  >
                    <MapPin size={13} style={{ flexShrink: 0 }} />
                    <span style={{ wordBreak: 'break-word' }}>{item.address}</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Reporter: {item.name_snapshot}
                  </div>
                </div>
              </div>

              {/* Footer: Priority score + date + Action Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  marginTop: '0.2rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Priority Score
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {item.priority_score !== null && item.priority_score !== undefined ? item.priority_score.toFixed(1) : '—'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    {date}
                  </div>
                  <Link
                    to={`/staff/complaints/${item.complaint_id || item.id}`}
                    className="btn btn-sm btn-primary"
                    style={{ padding: '0.35rem 0.85rem' }}
                  >
                    Review Case
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
