import { cn } from '@/utils/cn';

const SIZE_CLASSES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

export default function LoadingSpinner({ size = 'md', className = '', label = 'Loading...' }) {
  return (
    <div role="status" className={cn('flex items-center justify-center', className)}>
      <span
        className={cn(
          'inline-block animate-spin rounded-full border-primary/20 border-t-primary',
          SIZE_CLASSES[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
