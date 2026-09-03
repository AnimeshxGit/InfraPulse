import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, message, type, title };
      setToasts((prev) => [...prev.slice(-3), newToast]); // Keep at most 4 active

      window.setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 360,
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          let Icon = Info;
          let borderColor = 'var(--border-neutral)';
          let accentColor = 'var(--accent-primary)';

          if (t.type === 'success') {
            Icon = CheckCircle2;
            borderColor = 'var(--status-resolved-border)';
            accentColor = 'var(--status-resolved-text)';
          } else if (t.type === 'error') {
            Icon = AlertCircle;
            borderColor = 'var(--priority-critical-border)';
            accentColor = 'var(--priority-critical-text)';
          } else if (t.type === 'warning') {
            Icon = AlertCircle;
            borderColor = 'var(--priority-medium-border)';
            accentColor = 'var(--priority-medium-text)';
          }

          return (
            <div
              key={t.id}
              className="paper-card"
              style={{
                pointerEvents: 'auto',
                padding: '0.85rem 1rem',
                borderLeft: `4px solid ${accentColor}`,
                borderColor,
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                backgroundColor: 'var(--surface-paper)',
              }}
            >
              <Icon size={18} style={{ color: accentColor, flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                    {t.title}
                  </div>
                )}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {t.message}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 2,
                }}
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
