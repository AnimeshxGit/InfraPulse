import React from 'react';
import { AppHeader } from './AppHeader';
import { Footer } from './Footer';

export interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  maxWidth?: string | number;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  action,
  breadcrumbs,
  maxWidth = 'var(--max-content-width)',
}) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)' }}>
      <AppHeader />
      <main
        className="animate-fade-in"
        style={{
          flex: 1,
          width: '100%',
          maxWidth,
          margin: '0 auto',
          padding: 'clamp(1rem, 3vw, 2rem) clamp(0.85rem, 2.5vw, 1.5rem) 3.5rem clamp(0.85rem, 2.5vw, 1.5rem)',
        }}
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                {b.href ? (
                  <a href={b.href} style={{ color: 'var(--text-muted)' }}>
                    {b.label}
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-primary)', fontWeight: 550 }}>{b.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {(title || action) && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.75rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              {title && <h1 style={{ wordBreak: 'break-word' }}>{title}</h1>}
              {subtitle && <p style={{ marginTop: '0.25rem', fontSize: '0.92rem', wordBreak: 'break-word' }}>{subtitle}</p>}
            </div>
            {action && <div style={{ flexShrink: 0 }}>{action}</div>}
          </div>
        )}

        {children}
      </main>
      <Footer />
    </div>
  );
};
