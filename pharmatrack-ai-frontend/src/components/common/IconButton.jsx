import Icon from './Icon';
import { cn } from '@/utils/cn';

export default function IconButton({ icon, label, badge = false, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className
      )}
      {...props}
    >
      <Icon name={icon} />
      {badge && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error shadow-[0_0_8px_rgb(var(--color-error)/0.8)]" />
      )}
    </button>
  );
}
