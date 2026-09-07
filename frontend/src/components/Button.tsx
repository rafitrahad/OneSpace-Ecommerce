import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: 'bg-pine-500 text-white hover:bg-pine-600 disabled:bg-pine-300',
  secondary: 'bg-copper-500 text-white hover:bg-copper-600 disabled:bg-copper-300',
  ghost: 'bg-transparent text-pine-700 border border-line hover:bg-pine-50',
  danger: 'bg-transparent text-red-700 border border-red-200 hover:bg-red-50',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
