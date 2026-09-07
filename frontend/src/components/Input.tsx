import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes } from 'react';

interface FieldWrapperProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-ink">{label}</span>}
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <FieldWrapper label={label} error={error}>
      <input
        ref={ref}
        className={`w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-pine-500 ${className}`}
        {...props}
      />
    </FieldWrapper>
  ),
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <FieldWrapper label={label} error={error}>
      <textarea
        ref={ref}
        className={`w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-pine-500 ${className}`}
        {...props}
      />
    </FieldWrapper>
  ),
);
Textarea.displayName = 'Textarea';
