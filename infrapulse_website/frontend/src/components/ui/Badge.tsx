import React from 'react';
import {
  CategoryType,
  PriorityLevelType,
  ComplaintStatusType,
  AIStatusType,
  SeverityType,
} from '../../types/complaint';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'neutral'
    | 'category'
    | 'priority'
    | 'status'
    | 'ai'
    | 'severity';
  category?: CategoryType | string | null;
  priority?: PriorityLevelType | string | null;
  status?: ComplaintStatusType | string | null;
  aiStatus?: AIStatusType | string | null;
  severity?: SeverityType | string | null;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant: _variant = 'neutral',
  category,
  priority,
  status,
  aiStatus,
  severity,
  className = '',
  style: customStyle,
}) => {
  let badgeStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-paper-muted)',
    color: 'var(--text-secondary)',
    borderColor: 'var(--border-subtle)',
  };

  if (category) {
    const catLower = category.toLowerCase();
    if (catLower === 'structural') {
      badgeStyle = {
        backgroundColor: 'var(--cat-structural-bg)',
        color: 'var(--cat-structural-text)',
        borderColor: 'var(--cat-structural-border)',
      };
    } else if (catLower === 'functional') {
      badgeStyle = {
        backgroundColor: 'var(--cat-functional-bg)',
        color: 'var(--cat-functional-text)',
        borderColor: 'var(--cat-functional-border)',
      };
    } else if (catLower === 'performance') {
      badgeStyle = {
        backgroundColor: 'var(--cat-performance-bg)',
        color: 'var(--cat-performance-text)',
        borderColor: 'var(--cat-performance-border)',
      };
    }
  } else if (priority) {
    const prioUpper = priority.toUpperCase();
    if (prioUpper === 'CRITICAL') {
      badgeStyle = {
        backgroundColor: 'var(--priority-critical-bg)',
        color: 'var(--priority-critical-text)',
        borderColor: 'var(--priority-critical-border)',
      };
    } else if (prioUpper === 'HIGH') {
      badgeStyle = {
        backgroundColor: 'var(--priority-high-bg)',
        color: 'var(--priority-high-text)',
        borderColor: 'var(--priority-high-border)',
      };
    } else if (prioUpper === 'MEDIUM') {
      badgeStyle = {
        backgroundColor: 'var(--priority-medium-bg)',
        color: 'var(--priority-medium-text)',
        borderColor: 'var(--priority-medium-border)',
      };
    } else {
      badgeStyle = {
        backgroundColor: 'var(--priority-low-bg)',
        color: 'var(--priority-low-text)',
        borderColor: 'var(--priority-low-border)',
      };
    }
  } else if (severity) {
    const sevUpper = severity.toUpperCase();
    if (sevUpper === 'HIGH') {
      badgeStyle = {
        backgroundColor: 'var(--priority-high-bg)',
        color: 'var(--priority-high-text)',
        borderColor: 'var(--priority-high-border)',
      };
    } else if (sevUpper === 'MEDIUM') {
      badgeStyle = {
        backgroundColor: 'var(--priority-medium-bg)',
        color: 'var(--priority-medium-text)',
        borderColor: 'var(--priority-medium-border)',
      };
    } else {
      badgeStyle = {
        backgroundColor: 'var(--priority-low-bg)',
        color: 'var(--priority-low-text)',
        borderColor: 'var(--priority-low-border)',
      };
    }
  } else if (status) {
    const statusUpper = status.toUpperCase();
    if (statusUpper === 'RESOLVED') {
      badgeStyle = {
        backgroundColor: 'var(--status-resolved-bg)',
        color: 'var(--status-resolved-text)',
        borderColor: 'var(--status-resolved-border)',
      };
    } else if (statusUpper === 'IN_PROGRESS') {
      badgeStyle = {
        backgroundColor: 'var(--status-progress-bg)',
        color: 'var(--status-progress-text)',
        borderColor: 'var(--status-progress-border)',
      };
    } else if (statusUpper === 'ASSIGNED') {
      badgeStyle = {
        backgroundColor: 'var(--status-assigned-bg)',
        color: 'var(--status-assigned-text)',
        borderColor: 'var(--status-assigned-border)',
      };
    } else {
      badgeStyle = {
        backgroundColor: 'var(--status-submitted-bg)',
        color: 'var(--status-submitted-text)',
        borderColor: 'var(--status-submitted-border)',
      };
    }
  } else if (aiStatus) {
    const aiUpper = aiStatus.toUpperCase();
    if (aiUpper === 'COMPLETED') {
      badgeStyle = {
        backgroundColor: 'var(--status-resolved-bg)',
        color: 'var(--status-resolved-text)',
        borderColor: 'var(--status-resolved-border)',
      };
    } else if (aiUpper === 'PROCESSING' || aiUpper === 'PENDING') {
      badgeStyle = {
        backgroundColor: 'var(--priority-medium-bg)',
        color: 'var(--priority-medium-text)',
        borderColor: 'var(--priority-medium-border)',
      };
    } else {
      badgeStyle = {
        backgroundColor: 'var(--priority-critical-bg)',
        color: 'var(--priority-critical-text)',
        borderColor: 'var(--priority-critical-border)',
      };
    }
  }

  return (
    <span
      className={`badge ${className}`.trim()}
      style={{ ...badgeStyle, ...customStyle }}
    >
      {children}
    </span>
  );
};
