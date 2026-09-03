import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  children,
  className = '',
}) => {
  return (
    <div className={`paper-form-group ${className}`.trim()}>
      {label && (
        <label className="paper-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{hint}</span>}
      {error && <span className="paper-error-text">{error}</span>}
    </div>
  );
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`paper-input ${error ? 'border-red' : ''} ${className}`.trim()}
        style={error ? { borderColor: 'var(--priority-critical-border)' } : undefined}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, rows = 4, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`paper-textarea ${error ? 'border-red' : ''} ${className}`.trim()}
        style={error ? { borderColor: 'var(--priority-critical-border)' } : undefined}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
