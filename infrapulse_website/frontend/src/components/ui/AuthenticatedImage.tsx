import React, { useState, useEffect } from 'react';
import { fetchAuthenticatedBlob } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { ImageOff, Loader2 } from 'lucide-react';

export interface AuthenticatedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackText?: string;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  fallbackText = 'Photograph unavailable',
  containerClassName = '',
  containerStyle,
  className = '',
  style,
  ...props
}) => {
  const { token } = useAuth();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    let isCurrent = true;
    let createdUrl: string | null = null;

    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    // If src is already a data URL or blob URL (e.g. from local file preview)
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      setBlobUrl(src);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    fetchAuthenticatedBlob(src)
      .then((blob) => {
        if (!isCurrent) return;
        createdUrl = URL.createObjectURL(blob);
        setBlobUrl(createdUrl);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isCurrent) return;
        setHasError(true);
        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [src, token]);

  if (isLoading) {
    return (
      <div
        className={`paper-card-subtle ${containerClassName}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 140,
          backgroundColor: 'var(--surface-paper-inset)',
          ...containerStyle,
        }}
      >
        <Loader2
          className="animate-spin"
          size={22}
          style={{ color: 'var(--text-muted)' }}
        />
      </div>
    );
  }

  if (hasError || !blobUrl) {
    return (
      <div
        className={`paper-card-subtle ${containerClassName}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 140,
          backgroundColor: 'var(--surface-paper-inset)',
          color: 'var(--text-muted)',
          gap: 6,
          padding: '1rem',
          textAlign: 'center',
          ...containerStyle,
        }}
      >
        <ImageOff size={24} style={{ strokeWidth: 1.5 }} />
        <span style={{ fontSize: '0.8rem' }}>{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className={containerClassName} style={containerStyle}>
      <img
        src={blobUrl}
        alt={alt}
        className={className}
        style={{
          display: 'block',
          maxWidth: '100%',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-neutral)',
          ...style,
        }}
        {...props}
      />
    </div>
  );
};
