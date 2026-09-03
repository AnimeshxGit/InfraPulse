import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useRealtime } from '../../hooks/useRealtime';
import { useTheme } from '../../theme/ThemeContext';
import { Badge } from '../ui/Badge';
import {
  LogOut,
  PlusCircle,
  LayoutList,
  History,
  Shield,
  Building2,
  Sun,
  Moon,
  Menu,
  X,
  User,
} from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { principal, role, category, logout, isAuthenticated } = useAuth();
  const { status: wsStatus } = useRealtime();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const isStaff = role === 'STAFF';

  return (
    <header
      style={{
        backgroundColor: 'var(--surface-paper)',
        borderBottom: '1px solid var(--border-neutral)',
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand Identity & Staff Category */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to={isStaff ? '/staff' : '/app'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                backgroundColor: 'var(--surface-paper-inset)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              <Building2 size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                InfraPulse
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Operational Defect Registry
              </div>
            </div>
          </Link>

          {/* Prominent Category Banner for Staff (Desktop) */}
          {isStaff && category && (
            <div
              className="hide-on-mobile"
              style={{
                display: 'flex',
                alignItems: 'center',
                borderLeft: '1px solid var(--border-neutral)',
                paddingLeft: '1rem',
              }}
            >
              <Badge variant="category" category={category} style={{ fontSize: '0.78rem', padding: '0.22rem 0.6rem' }}>
                <Shield size={12} style={{ marginRight: 4 }} />
                {category} Queue
              </Badge>
            </div>
          )}
        </div>

        {/* Center: Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isStaff ? (
              <>
                <Link
                  to="/staff"
                  className={`btn btn-sm ${location.pathname === '/staff' ? 'btn-secondary' : 'btn-subtle'}`}
                  style={location.pathname === '/staff' ? { borderColor: 'var(--border-focus)' } : {}}
                >
                  <LayoutList size={15} />
                  Live Queue
                </Link>
                <Link
                  to="/staff/history"
                  className={`btn btn-sm ${location.pathname === '/staff/history' ? 'btn-secondary' : 'btn-subtle'}`}
                  style={location.pathname === '/staff/history' ? { borderColor: 'var(--border-focus)' } : {}}
                >
                  <History size={15} />
                  Resolved History
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/app"
                  className={`btn btn-sm ${location.pathname === '/app' ? 'btn-secondary' : 'btn-subtle'}`}
                  style={location.pathname === '/app' ? { borderColor: 'var(--border-focus)' } : {}}
                >
                  <LayoutList size={15} />
                  My Complaints
                </Link>
                <Link to="/app/new" className="btn btn-sm btn-primary">
                  <PlusCircle size={15} />
                  Report Defect
                </Link>
              </>
            )}
          </nav>
        )}

        {/* Right: Controls (Theme Toggle, Connection, User, Hamburger) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* WebSocket Status Indicator (Desktop) */}
          {isAuthenticated && (
            <div
              className="hide-on-mobile"
              title={`Realtime event bus: ${wsStatus}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--surface-paper-muted)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor:
                    wsStatus === 'connected'
                      ? 'var(--status-resolved-text)'
                      : wsStatus === 'connecting' || wsStatus === 'reconnecting'
                      ? 'var(--priority-medium-text)'
                      : 'var(--text-muted)',
                }}
              />
              <span style={{ textTransform: 'capitalize' }}>
                {wsStatus === 'connected' ? 'Live' : wsStatus}
              </span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-subtle btn-icon"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Desktop User Logout */}
          {isAuthenticated && principal ? (
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  borderLeft: '1px solid var(--border-neutral)',
                  paddingLeft: '0.65rem',
                }}
              >
                {principal.name.split(' ')[0]}
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-sm btn-subtle"
                title="Logout session"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-sm btn-secondary hide-on-mobile">
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            className="show-on-mobile btn btn-subtle btn-icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            style={{
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Overlay Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="animate-fade-in"
            style={{
              backgroundColor: 'var(--surface-paper)',
              borderBottom: '1px solid var(--border-neutral)',
              padding: '1.25rem 1.5rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Category / Role Info for Mobile */}
            {isStaff && category ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Assigned Department</div>
                <Badge variant="category" category={category}>
                  <Shield size={12} style={{ marginRight: 4 }} />
                  {category} Division
                </Badge>
              </div>
            ) : isAuthenticated && principal ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <User size={16} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{principal.name}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({principal.role})</span>
              </div>
            ) : null}

            {/* Mobile Navigation Links */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {isStaff ? (
                  <>
                    <Link
                      to="/staff"
                      className={`btn ${location.pathname === '/staff' ? 'btn-secondary' : 'btn-subtle'}`}
                      style={{ justifyContent: 'flex-start', padding: '0.7rem 1rem' }}
                    >
                      <LayoutList size={17} />
                      Live Priority Queue
                    </Link>
                    <Link
                      to="/staff/history"
                      className={`btn ${location.pathname === '/staff/history' ? 'btn-secondary' : 'btn-subtle'}`}
                      style={{ justifyContent: 'flex-start', padding: '0.7rem 1rem' }}
                    >
                      <History size={17} />
                      Resolved History Archive
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/app"
                      className={`btn ${location.pathname === '/app' ? 'btn-secondary' : 'btn-subtle'}`}
                      style={{ justifyContent: 'flex-start', padding: '0.7rem 1rem' }}
                    >
                      <LayoutList size={17} />
                      My Reported Complaints
                    </Link>
                    <Link
                      to="/app/new"
                      className="btn btn-primary"
                      style={{ justifyContent: 'flex-start', padding: '0.7rem 1rem' }}
                    >
                      <PlusCircle size={17} />
                      Report a New Defect
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Sign In to InfraPulse
              </Link>
            )}

            {/* Mobile Realtime Status & Logout Footer */}
            {isAuthenticated && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.85rem',
                  marginTop: '0.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor:
                        wsStatus === 'connected'
                          ? 'var(--status-resolved-text)'
                          : 'var(--priority-medium-text)',
                    }}
                  />
                  <span>Event Bus: {wsStatus}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-subtle"
                  style={{ color: 'var(--priority-critical-text)', gap: 6 }}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
