import { SelectHTMLAttributes, forwardRef } from 'react';
import { FieldWrapper } from './Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => (
    <FieldWrapper label={label} error={error}>
      <select
        ref={ref}
        className={`w-full rounded border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-pine-500 ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  ),
);
Select.displayName = 'Select';
