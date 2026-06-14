import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

export default function SelectField({
  label,
  id,
  options = [],
  placeholder,
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
      <div className="relative">
        <select
          id={id}
          className={cn(
            'glass-input appearance-none px-3 py-2.5 pr-10 text-sm',
            error && 'border-error/50 focus:border-error focus:ring-error/30',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        <Icon
          name="expand_more"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
      </div>
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-on-surface-variant">{helperText}</p>
      ) : null}
    </div>
  );
}
