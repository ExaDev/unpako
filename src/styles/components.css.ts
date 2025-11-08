import { style } from '@vanilla-extract/css';

export const container = style({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

export const header = style({
  textAlign: 'center',
  marginBottom: '3rem',
});

export const title = style({
  fontSize: '3rem',
  fontWeight: 'bold',
  color: '#1c7ed6',
  marginBottom: '0.5rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});

export const subtitle = style({
  fontSize: '1.2rem',
  color: '#495057',
  marginBottom: '1rem',
});

export const mainContent = style({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
});

export const card = style({
  background: 'white',
  borderRadius: '12px',
  padding: '2rem',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e9ecef',
});

export const uploadArea = style({
  border: '2px dashed #cbd5e1',
  borderRadius: '8px',
  padding: '3rem',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: '#f8fafc',
  ':hover': {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
});

export const uploadAreaActive = style({
  borderColor: '#3b82f6',
  backgroundColor: '#dbeafe',
  transform: 'scale(1.02)',
});

export const button = style({
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  border: 'none',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
});

export const primaryButton = style([
  button,
  {
    backgroundColor: '#3b82f6',
    color: 'white',
    ':hover': {
      backgroundColor: '#2563eb',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
    },
    ':active': {
      transform: 'translateY(0)',
    },
  },
]);

export const secondaryButton = style([
  button,
  {
    backgroundColor: '#6b7280',
    color: 'white',
    ':hover': {
      backgroundColor: '#4b5563',
      transform: 'translateY(-1px)',
    },
  },
]);

export const dangerButton = style([
  button,
  {
    backgroundColor: '#ef4444',
    color: 'white',
    ':hover': {
      backgroundColor: '#dc2626',
      transform: 'translateY(-1px)',
    },
  },
]);

export const input = style({
  width: '100%',
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '1rem',
  transition: 'border-color 0.2s ease',
  ':focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
});

export const textarea = style([
  input,
  {
    minHeight: '120px',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
]);

export const formGroup = style({
  marginBottom: '1.5rem',
});

export const label = style({
  display: 'block',
  marginBottom: '0.5rem',
  fontWeight: '500',
  color: '#374151',
});

export const grid = style({
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
});

export const historyItem = style({
  padding: '1rem',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  backgroundColor: 'white',
  transition: 'all 0.2s ease',
  ':hover': {
    borderColor: '#d1d5db',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
});

export const historyItemHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
});

export const fileName = style({
  fontWeight: '600',
  color: '#1f2937',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '300px',
});

export const fileSize = style({
  fontSize: '0.875rem',
  color: '#6b7280',
});

export const compressionRatio = style({
  fontSize: '0.875rem',
  fontWeight: '500',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  backgroundColor: '#dcfce7',
  color: '#16a34a',
});

export const compressionRatioBad = style([
  compressionRatio,
  {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
]);

export const stats = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '1rem',
  marginBottom: '2rem',
});

export const statCard = style({
  textAlign: 'center',
  padding: '1rem',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
});

export const statValue = style({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#1f2937',
});

export const statLabel = style({
  fontSize: '0.875rem',
  color: '#6b7280',
  marginTop: '0.25rem',
});

export const urlDisplay = style({
  padding: '1rem',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  wordBreak: 'break-all',
  maxHeight: '200px',
  overflowY: 'auto',
});

export const buttonGroup = style({
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap',
  marginTop: '1rem',
});

export const loading = style({
  display: 'inline-block',
  width: '20px',
  height: '20px',
  border: '3px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '50%',
  borderTopColor: 'white',
  animation: 'spin 1s ease-in-out infinite',
});

export const error = style({
  color: '#dc2626',
  backgroundColor: '#fee2e2',
  padding: '1rem',
  borderRadius: '6px',
  border: '1px solid #fecaca',
  marginBottom: '1rem',
});

export const success = style({
  color: '#16a34a',
  backgroundColor: '#dcfce7',
  padding: '1rem',
  borderRadius: '6px',
  border: '1px solid #bbf7d0',
  marginBottom: '1rem',
});