import { cn } from '@/utils/cn';

export default function FormSection({ title, description, children, className = '' }) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && <h3 className="text-base font-semibold text-on-surface">{title}</h3>}
          {description && <p className="mt-1 text-sm text-on-surface-variant">{description}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
