import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComplaintTimeline } from '../components/complaint/ComplaintTimeline';

describe('ComplaintTimeline Component', () => {
  it('renders all four predefined lifecycle steps', () => {
    render(<ComplaintTimeline currentStatus="ASSIGNED" />);

    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();
  });

  it('renders status history timestamp when available', () => {
    const mockHistory = [
      {
        id: 'h1',
        complaint_id: 'c1',
        from_status: 'SUBMITTED',
        to_status: 'ASSIGNED',
        changed_by_id: 's1',
        changed_by_role: 'STAFF',
        changed_at: '2026-09-03T01:30:00Z',
      },
    ];

    render(<ComplaintTimeline currentStatus="ASSIGNED" statusHistory={mockHistory} />);
    expect(screen.getByText(/Sep 3/)).toBeInTheDocument();
  });
});
