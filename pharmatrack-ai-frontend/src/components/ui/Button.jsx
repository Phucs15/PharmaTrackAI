import { cn } from '@/utils/cn';

const VARIANT_CLASSES = {
  primary: 'bg-primary text-on-primary hover:brightness-110 shadow-glow',
  secondary: 'bg-secondary-container text-on-secondary-container hover:brightness-105',
  outline: 'border border-outline-variant text-on-surface hover:bg-surface-container-high',
  ghost: 'text-on-surface-variant hover:bg-primary/10 hover:text-primary',
  danger: 'bg-error/10 text-error border border-error/20 hover:bg-error/20',
  glass: 'glass-button text-on-surface',
};

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
