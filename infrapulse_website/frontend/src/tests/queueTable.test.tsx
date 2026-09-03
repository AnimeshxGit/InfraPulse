import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueueTable } from '../components/queue/QueueTable';
import { QueueItemResponse } from '../types/queue';

const mockQueueItems: QueueItemResponse[] = [
  {
    id: 'item-1',
    complaint_id: 'c-1',
    rank: 1,
    priority_score: 91.2,
    priority_level: 'CRITICAL',
    category: 'Structural',
    detected_defect: 'Spalling',
    severity: 'HIGH',
    status: 'SUBMITTED',
    user_id: 'u-1',
    description: 'Concrete detachment on ceiling',
    address: 'Block A, Floor 2',
    image_url: 'http://localhost:8000/image1.jpg',
    name_snapshot: 'John Doe',
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-2',
    complaint_id: 'c-2',
    rank: 2,
    priority_score: 72.5,
    priority_level: 'HIGH',
    category: 'Structural',
    detected_defect: 'Cracking',
    severity: 'MEDIUM',
    status: 'ASSIGNED',
    user_id: 'u-2',
    description: 'Vertical wall crack',
    address: 'Pillar 4B',
    image_url: 'http://localhost:8000/image2.jpg',
    name_snapshot: 'Jane Smith',
    created_at: new Date().toISOString(),
  },
];

describe('QueueTable Component', () => {
  it('renders table headers and ranked items accurately', () => {
    render(
      <MemoryRouter>
        <QueueTable items={mockQueueItems} category="Structural" />
      </MemoryRouter>
    );

    // Check headers
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(screen.getByText('Detected Defect')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();

    // Check items (present in desktop table and mobile card views)
    expect(screen.getAllByText('1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('2')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Block A, Floor 2')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Pillar 4B')[0]).toBeInTheDocument();
    expect(screen.getAllByText('91.2')[0]).toBeInTheDocument();
    expect(screen.getAllByText('72.5')[0]).toBeInTheDocument();
  });
});
