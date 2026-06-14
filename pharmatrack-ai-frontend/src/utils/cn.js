/**
 * Joins class names, filtering out falsy values.
 * Usage: cn('px-2', isActive && 'bg-primary', className)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
