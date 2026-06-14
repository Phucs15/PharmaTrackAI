import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

const VARIANT_CLASSES = {
  default: 'bg-surface-container-high text-on-surface-variant',
  primary: 'bg-primary/10 text-primary',
  outline: 'border border-outline-variant text-on-surface-variant',
};

export default function Chip({ label, icon, onRemove, variant = 'default', className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {icon && <Icon name={icon} className="text-sm" />}
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="ml-0.5 flex items-center rounded-full transition-colors hover:text-error"
        >
          <Icon name="close" className="text-sm" />
        </button>
      )}
    </span>
  );
}
