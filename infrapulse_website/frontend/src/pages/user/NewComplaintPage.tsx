import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { useCreateComplaint } from '../../hooks/useComplaint';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, FormField } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/feedback/ErrorBanner';
import { Upload, X, Send, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const NewComplaintPage: React.FC = () => {
  const { principal } = useAuth();
  const navigate = useNavigate();
  const createComplaintMutation = useCreateComplaint();

  const [name, setName] = useState(principal?.name || '');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setFormError('Only JPEG, PNG, or WebP photographs are permitted');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormError('Photograph size must not exceed 10 MB');
      return;
    }

    setFormError(null);
    setPhoto(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Reporter name is required');
      return;
    }
    if (!address.trim()) {
      setFormError('Defect address or specific physical location is required');
      return;
    }
    if (!description.trim()) {
      setFormError('A short problem description is required');
      return;
    }
    if (!photo) {
      setFormError('A clear photograph of the defect is required for autonomous vision assessment');
      return;
    }

    try {
      const created = await createComplaintMutation.mutateAsync({
        name: name.trim(),
        address: address.trim(),
        description: description.trim(),
        photo,
      });

      // Immediate redirect to complaint details to observe AI inference
      navigate(`/app/complaints/${created.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Could not submit complaint. Please check your network connection.');
      }
    }
  };

  return (
    <PageLayout
      title="Report an Infrastructure Defect"
      subtitle="Submit photographic evidence and location details. Our autonomous computer vision model will classify the defect and assign objective priority."
      breadcrumbs={[
        { label: 'My Complaints', href: '/app' },
        { label: 'New Defect Report' },
      ]}
      maxWidth="800px"
    >
      <Card style={{ padding: 'clamp(1.15rem, 3vw, 2rem)' }}>
        {formError && (
          <ErrorBanner
            title="Form Validation Error"
            message={formError}
            onRetry={() => setFormError(null)}
          />
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <FormField label="Reporter Name Snapshot" required hint="Your full name as record holder">
              <Input
                type="text"
                placeholder="e.g. Maya Lin"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormField>

            <FormField label="Location / Physical Address" required hint="Building, wing, floor, or street coordinates">
              <Input
                type="text"
                placeholder="e.g. Block C, 3rd Floor Corridor Ceiling"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Problem Description" required hint="Describe visible conditions, potential causes, or hazards">
            <Textarea
              rows={3}
              placeholder="e.g. Noticeable concrete detachment and exposed reinforcement bar overhead..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          {/* Photograph Upload & Preview */}
          <div className="paper-form-group">
            <label className="paper-label">
              Defect Photograph <span className="required-star">*</span>
            </label>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
              Upload an unedited photo showing the defect in clear lighting (JPEG, PNG, or WebP, up to 10MB).
            </span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              style={{ display: 'none' }}
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />

            {!photoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-paper-muted)',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-paper-inset)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-paper-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: 'var(--surface-paper)',
                    border: '1px solid var(--border-neutral)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    margin: '0 auto 0.75rem auto',
                  }}
                >
                  <Upload size={20} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Click to select or drag and drop photograph
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Supports high-resolution civil inspection images
                </div>
              </div>
            ) : (
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-neutral)',
                  overflow: 'hidden',
                  maxHeight: 340,
                  backgroundColor: 'var(--surface-paper-inset)',
                }}
              >
                <img
                  src={photoPreview}
                  alt="Defect Preview"
                  style={{ width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(28, 30, 33, 0.75)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Remove photograph"
                  aria-label="Remove photograph"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: 'var(--surface-paper-inset)',
              borderRadius: 'var(--radius-xs)',
              padding: '0.85rem 1rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <AlertCircle size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <span>
              <strong>Autonomous Routing Notice:</strong> Defect type and maintenance department (Structural, Functional, or Performance) are classified objectively by our AI pipeline. No manual category selection is required.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/app" className="btn btn-secondary" style={{ flex: '1 1 auto', minWidth: 90, textAlign: 'center' }}>
              Cancel
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={createComplaintMutation.isPending}
              icon={<Send size={15} />}
              style={{ flex: '2 1 auto', minWidth: 160 }}
            >
              Submit Defect Report
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  );
};
