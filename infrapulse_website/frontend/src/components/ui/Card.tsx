import React, { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  style,
  ...props
}) => {
  const cardClass = variant === 'subtle' ? 'paper-card-subtle' : 'paper-card';

  return (
    <div className={`${cardClass} ${className}`.trim()} style={style} {...props}>
      {children}
    </div>
  );
};
