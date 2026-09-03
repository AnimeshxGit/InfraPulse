import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireRole, RequireAuth } from '../auth/guards';
import * as AuthContextModule from '../auth/AuthContext';

describe('Route Guards', () => {
  it('redirects unauthenticated users to /login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      token: null,
      principal: null,
      role: null,
      category: null,
      isLoading: false,
      isAuthenticated: false,
      loginUser: vi.fn(),
      loginStaff: vi.fn(),
      registerUser: vi.fn(),
      logout: vi.fn(),
      refreshPrincipal: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route
            path="/app"
            element={
              <RequireAuth>
                <div>User Content</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('User Content')).not.toBeInTheDocument();
  });

  it('prevents a normal citizen user from accessing staff routes', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      token: 'jwt-token',
      principal: {
        id: 'u1',
        name: 'Citizen Jane',
        email_or_username: 'jane@example.com',
        role: 'USER',
      },
      role: 'USER',
      category: null,
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginStaff: vi.fn(),
      registerUser: vi.fn(),
      logout: vi.fn(),
      refreshPrincipal: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/staff']}>
        <Routes>
          <Route
            path="/staff"
            element={
              <RequireRole role="STAFF">
                <div>Staff Restricted Area</div>
              </RequireRole>
            }
          />
          <Route path="/app" element={<div>User Dashboard Redirect</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('User Dashboard Redirect')).toBeInTheDocument();
    expect(screen.queryByText('Staff Restricted Area')).not.toBeInTheDocument();
  });

  it('allows staff with STAFF role to access staff route', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      token: 'jwt-staff-token',
      principal: {
        id: 's1',
        name: 'Staff Alice',
        email_or_username: 'alice_structural',
        role: 'STAFF',
        category: 'Structural',
      },
      role: 'STAFF',
      category: 'Structural',
      isLoading: false,
      isAuthenticated: true,
      loginUser: vi.fn(),
      loginStaff: vi.fn(),
      registerUser: vi.fn(),
      logout: vi.fn(),
      refreshPrincipal: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/staff']}>
        <Routes>
          <Route
            path="/staff"
            element={
              <RequireRole role="STAFF">
                <div>Staff Queue Authorized</div>
              </RequireRole>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Staff Queue Authorized')).toBeInTheDocument();
  });
});
