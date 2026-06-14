import { cn } from '@/utils/cn';

export default function Checkbox({ label, id, description, className = '', ...props }) {
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline-variant bg-surface-container-highest/60 text-primary focus:ring-2 focus:ring-primary/40 focus:ring-offset-0"
        {...props}
      />
      {(label || description) && (
        <span>
          {label && <span className="text-sm font-medium text-on-surface">{label}</span>}
          {description && <span className="block text-xs text-on-surface-variant">{description}</span>}
        </span>
      )}
    </label>
  );
}
