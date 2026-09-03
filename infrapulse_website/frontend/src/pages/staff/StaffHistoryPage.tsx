import React from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { useStaffHistory, useStaffMe } from '../../hooks/useStaffQueue';
import { Badge } from '../../components/ui/Badge';
import { AuthenticatedImage } from '../../components/ui/AuthenticatedImage';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorBanner } from '../../components/feedback/ErrorBanner';
import { Button } from '../../components/ui/Button';
import { History, RefreshCw, ArrowUpRight, MapPin } from 'lucide-react';

export const StaffHistoryPage: React.FC = () => {
  const { data: staffMe } = useStaffMe();
  const { data: historyItems, isLoading, error, refetch, isFetching } = useStaffHistory();

  const category = staffMe?.category || 'Category';

  return (
    <PageLayout
      title={`${category} Resolved History`}
      subtitle={`Archive of completed and verified ${category} remediation operations.`}
      breadcrumbs={[
        { label: 'Live Queue', href: '/staff' },
        { label: 'Resolved History' },
      ]}
      action={
        <Button
          size="sm"
          variant="secondary"
          onClick={() => refetch()}
          isLoading={isFetching}
          icon={<RefreshCw size={14} />}
        >
          Refresh Archive
        </Button>
      }
    >
      {error && (
        <ErrorBanner
          title="Could not load history archive"
          message={error.message}
          onRetry={() => refetch()}
        />
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton height={50} />
          <Skeleton height={64} />
          <Skeleton height={64} />
        </div>
      ) : !historyItems || historyItems.length === 0 ? (
        <EmptyState
          title="No Resolved Cases Yet"
          description={`No ${category} complaints have been resolved yet. When cases reach the Resolved status, they exit the live priority queue and appear in this permanent record.`}
          icon={<History size={24} />}
        />
      ) : (
        <div>
          {/* Desktop & Tablet Table (>= 769px) */}
          <div className="paper-card hide-on-mobile" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
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
                    <th style={{ padding: '0.85rem 1.25rem', width: '70px' }}>Image</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Defect Type</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Location</th>
                    <th style={{ padding: '0.85rem 1rem', width: '140px' }}>Priority Score</th>
                    <th style={{ padding: '0.85rem 1rem', width: '160px' }}>Resolved At</th>
                    <th style={{ padding: '0.85rem 1rem', width: '120px' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.25rem', width: '90px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((item) => {
                    const resolvedDate = item.resolved_at
                      ? new Date(item.resolved_at).toLocaleString()
                      : new Date(item.updated_at).toLocaleString();

                    return (
                      <tr
                        key={item.id}
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
                        <td style={{ padding: '0.85rem 1.25rem' }}>
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

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 650, color: 'var(--text-primary)' }}>
                            {item.detected_defect ? item.detected_defect.replace('_', ' ') : 'Defect'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Reporter: {item.name_snapshot}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              color: 'var(--text-secondary)',
                              maxWidth: 240,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <MapPin size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.address}</span>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div className="tabular-nums" style={{ fontWeight: 650 }}>
                            {item.priority_score !== null && item.priority_score !== undefined
                              ? item.priority_score.toFixed(1)
                              : '—'}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div className="tabular-nums" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {resolvedDate}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <Badge variant="status" status={item.status}>
                            Resolved
                          </Badge>
                        </td>

                        <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                          <Link
                            to={`/staff/complaints/${item.id}`}
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '0.3rem 0.6rem' }}
                          >
                            Record
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
            {historyItems.map((item) => {
              const resolvedDate = item.resolved_at
                ? new Date(item.resolved_at).toLocaleString()
                : new Date(item.updated_at).toLocaleString();

              return (
                <div
                  key={item.id}
                  className="paper-card paper-card-interactive"
                  style={{
                    padding: '1.15rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {item.detected_defect ? item.detected_defect.replace('_', ' ') : 'Resolved Defect'}
                    </div>
                    <Badge variant="status" status="RESOLVED" style={{ fontSize: '0.72rem' }}>
                      Resolved
                    </Badge>
                  </div>

                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <AuthenticatedImage
                      src={item.image_url}
                      alt={item.detected_defect || 'Defect'}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-xs)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.82rem',
                          color: 'var(--text-muted)',
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

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Priority Score: <strong style={{ color: 'var(--text-primary)' }}>{item.priority_score?.toFixed(1) ?? '—'}</strong>
                      </div>
                      <div className="tabular-nums" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {resolvedDate}
                      </div>
                    </div>

                    <Link
                      to={`/staff/complaints/${item.id}`}
                      className="btn btn-sm btn-secondary"
                      style={{ padding: '0.35rem 0.85rem' }}
                    >
                      Audit Record
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageLayout>
  );
};
