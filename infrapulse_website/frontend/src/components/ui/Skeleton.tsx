import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-xs)',
  className = '',
  style,
}) => {
  return (
    <div
      className={`animate-pulse ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--surface-paper-inset)',
        ...style,
      }}
    />
  );
};
