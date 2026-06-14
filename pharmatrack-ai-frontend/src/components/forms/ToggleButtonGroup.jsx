import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

export default function ToggleButtonGroup({ label, options = [], value, onChange, className = '' }) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="block text-sm font-medium text-on-surface-variant">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const isActive = optionValue === value;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange?.(optionValue)}
              aria-pressed={isActive}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all active:scale-95',
                isActive
                  ? 'border-primary/50 bg-primary/10 text-primary shadow-glow'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary/30 hover:text-primary'
              )}
            >
              {option.icon && <Icon name={option.icon} className="text-base" />}
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
