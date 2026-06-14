import { getStatusVariant, PULSE_STATUSES } from '@/constants/statusColors';
import { cn } from '@/utils/cn';

export default function StatusBadge({ status, className = '' }) {
  const variant = getStatusVariant(status);
  const pulse = PULSE_STATUSES.has(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold',
        variant.bg,
        variant.text,
        variant.border,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', variant.dot, pulse && 'animate-pulse')} />
      {status}
    </span>
  );
}
