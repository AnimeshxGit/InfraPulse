import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../components/ui/Badge';

describe('Badge Component', () => {
  it('renders category badge correctly', () => {
    render(<Badge variant="category" category="Structural">Structural</Badge>);
    const badge = screen.getByText('Structural');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge');
  });

  it('renders priority badge correctly for CRITICAL', () => {
    render(<Badge variant="priority" priority="CRITICAL">Critical Priority</Badge>);
    const badge = screen.getByText('Critical Priority');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge');
  });

  it('renders status badge correctly for RESOLVED', () => {
    render(<Badge variant="status" status="RESOLVED">Resolved</Badge>);
    const badge = screen.getByText('Resolved');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('badge');
  });
});
