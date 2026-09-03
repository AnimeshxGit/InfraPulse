import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { UserDashboard } from '../pages/user/UserDashboard';
import { NewComplaintPage } from '../pages/user/NewComplaintPage';
import { ComplaintDetailPage } from '../pages/user/ComplaintDetailPage';
import { StaffDashboard } from '../pages/staff/StaffDashboard';
import { StaffComplaintPage } from '../pages/staff/StaffComplaintPage';
import { StaffHistoryPage } from '../pages/staff/StaffHistoryPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RequireRole, RedirectIfAuth } from '../auth/guards';
import { useAuth } from '../auth/AuthContext';

function RootRedirect() {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="animate-spin"
          style={{
            width: 32,
            height: 32,
            border: '2px solid var(--border-neutral)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'STAFF') {
    return <Navigate to="/staff" replace />;
  }

  return <Navigate to="/app" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  // Public Auth Routes
  {
    path: '/login',
    element: (
      <RedirectIfAuth>
        <LoginPage />
      </RedirectIfAuth>
    ),
  },
  {
    path: '/register',
    element: (
      <RedirectIfAuth>
        <RegisterPage />
      </RedirectIfAuth>
    ),
  },
  // Citizen / User Routes (Protected: USER only)
  {
    path: '/app',
    element: (
      <RequireRole role="USER">
        <UserDashboard />
      </RequireRole>
    ),
  },
  {
    path: '/app/new',
    element: (
      <RequireRole role="USER">
        <NewComplaintPage />
      </RequireRole>
    ),
  },
  {
    path: '/app/complaints/:id',
    element: (
      <RequireRole role="USER">
        <ComplaintDetailPage />
      </RequireRole>
    ),
  },
  // Staff Routes (Protected: STAFF only)
  {
    path: '/staff',
    element: (
      <RequireRole role="STAFF">
        <StaffDashboard />
      </RequireRole>
    ),
  },
  {
    path: '/staff/complaints/:id',
    element: (
      <RequireRole role="STAFF">
        <StaffComplaintPage />
      </RequireRole>
    ),
  },
  {
    path: '/staff/history',
    element: (
      <RequireRole role="STAFF">
        <StaffHistoryPage />
      </RequireRole>
    ),
  },
  // 404 Catch-all
  {
    path: '*',
    element: <NotFoundPage />,
  },
], {
  basename: import.meta.env.BASE_URL,
});

