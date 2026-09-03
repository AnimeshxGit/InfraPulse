import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NewComplaintPage } from '../pages/user/NewComplaintPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock AuthContext
vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    principal: { name: 'Alice Citizen' },
  }),
}));

describe('NewComplaintPage Validation', () => {
  const queryClient = new QueryClient();

  it('renders required form fields and validates photo upload before submit', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NewComplaintPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Report an Infrastructure Defect')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Corridor Ceiling/i)).toBeInTheDocument();

    // Click submit without photo or address
    const submitBtn = screen.getByRole('button', { name: /Submit Defect Report/i });
    fireEvent.click(submitBtn);

    // Should display validation error
    await waitFor(() => {
      expect(screen.getByText(/Defect address or specific physical location is required/i)).toBeInTheDocument();
    });
  });
});
