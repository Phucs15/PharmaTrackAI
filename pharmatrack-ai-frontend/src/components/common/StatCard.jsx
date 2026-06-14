import Icon from './Icon';
import { cn } from '@/utils/cn';

const ICON_COLOR_CLASSES = {
  primary: 'bg-primary/10 border-primary/20 text-primary',
  secondary: 'bg-secondary/10 border-secondary/20 text-secondary',
  tertiary: 'bg-tertiary/10 border-tertiary/20 text-tertiary',
  error: 'bg-error/10 border-error/20 text-error',
};

const VARIANT_CLASSES = {
  default: 'border-outline/10 hover:border-primary/30',
  warning: 'border-tertiary/30 hover:border-tertiary/50 shadow-[0_0_20px_rgb(var(--color-tertiary)/0.05)]',
  critical: 'border-error/30 hover:border-error/50 shadow-[0_0_20px_rgb(var(--color-error)/0.05)]',
};

const LABEL_CLASSES = {
  default: 'text-on-surface-variant',
  warning: 'font-medium text-tertiary',
  critical: 'font-medium text-error',
};

export default function StatCard({
  icon,
  iconColor = 'primary',
  label,
  value,
  unit,
  trend,
  variant = 'default',
  className = '',
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-surface p-6 shadow-sm transition-colors dark:glass-panel',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      <div className="ambient-glow -right-20 -top-20" />
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl border',
            ICON_COLOR_CLASSES[iconColor]
          )}
        >
          <Icon name={icon} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
            <Icon name="trending_up" className="text-[10px]" />
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className={cn('mb-1 text-sm', LABEL_CLASSES[variant])}>{label}</h3>
        <p className="font-display text-3xl font-semibold tracking-tight text-on-surface">
          {value} {unit && <span className="text-base font-normal text-on-surface-variant">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
