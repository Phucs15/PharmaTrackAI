import { getInitials } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
};

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full border border-primary/30 object-cover', SIZE_CLASSES[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border border-outline-variant bg-surface-container-high font-bold text-on-surface-variant',
        SIZE_CLASSES[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
