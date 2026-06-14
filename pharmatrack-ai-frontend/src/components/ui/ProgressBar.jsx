import { cn } from '@/utils/cn';

const FILL_CLASSES = {
  primary: 'bg-primary shadow-glow',
  tertiary: 'bg-tertiary',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  error: 'bg-error',
};

export default function ProgressBar({ value = 0, max = 100, color = 'primary', className = '', trackClassName = '' }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-container-highest', trackClassName, className)}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', FILL_CLASSES[color])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
