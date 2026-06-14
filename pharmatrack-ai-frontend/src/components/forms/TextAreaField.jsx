import { cn } from '@/utils/cn';

export default function TextAreaField({
  label,
  id,
  error,
  helperText,
  required = false,
  rows = 4,
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
      <textarea
        id={id}
        rows={rows}
        className={cn(
          'glass-input resize-none px-3 py-2.5 text-sm',
          error && 'border-error/50 focus:border-error focus:ring-error/30',
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-on-surface-variant">{helperText}</p>
      ) : null}
    </div>
  );
}
