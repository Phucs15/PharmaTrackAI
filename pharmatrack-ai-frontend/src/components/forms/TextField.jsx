import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

export default function TextField({
  label,
  id,
  icon,
  suffix,
  error,
  helperText,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      <div
        className={cn(
          'flex items-center rounded-lg border bg-surface-container-highest/60 backdrop-blur-md transition-all duration-200 focus-within:ring-2',
          error
            ? 'border-error/50 focus-within:border-error focus-within:ring-error/30'
            : 'border-outline-variant focus-within:border-primary/50 focus-within:ring-primary/40'
        )}
      >
        {icon && (
          <div className="pl-3 text-on-surface-variant">
            <Icon name={icon} className="text-lg" />
          </div>
        )}
        <input
          id={id}
          className={cn(
            'w-full border-none bg-transparent py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0',
            icon ? 'pl-2' : 'pl-3',
            suffix ? 'pr-2' : 'pr-3',
            className
          )}
          {...props}
        />
        {suffix && <div className="pr-3 text-xs text-on-surface-variant">{suffix}</div>}
      </div>
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-on-surface-variant">{helperText}</p>
      ) : null}
    </div>
  );
}
