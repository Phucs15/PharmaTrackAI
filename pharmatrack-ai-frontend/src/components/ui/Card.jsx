import { cn } from '@/utils/cn';

const VARIANT_CLASSES = {
  panel: 'glass-panel',
  elevated: 'glass-elevated',
  plain: 'bg-surface border border-outline/10 shadow-sm dark:glass-panel',
};

export default function Card({ variant = 'panel', className = '', children, ...props }) {
  return (
    <div className={cn('rounded-2xl', VARIANT_CLASSES[variant], className)} {...props}>
      {children}
    </div>
  );
}
