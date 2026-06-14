import { cn } from '@/utils/cn';

export default function ToggleSwitch({ id, label, description, checked, onChange, className = '' }) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3', className)}>
      <div>
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-on-surface">
            {label}
          </label>
        )}
        {description && <p className="mt-0.5 text-xs text-on-surface-variant">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
          checked ? 'border-primary bg-primary' : 'border-outline-variant bg-surface-container-highest'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}
