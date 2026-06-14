/**
 * Color variants for <StatusBadge>. Tailwind's built-in palettes are used
 * directly (not M3 tokens) since they already work in both themes.
 */
export const STATUS_VARIANTS = {
  emerald: {
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  amber: {
    dot: 'bg-amber-500 dark:bg-amber-400',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  red: {
    dot: 'bg-red-500 dark:bg-error',
    text: 'text-red-700 dark:text-error',
    bg: 'bg-red-500/10 dark:bg-error/10',
    border: 'border-red-500/20 dark:border-error/20',
  },
  primary: {
    dot: 'bg-primary',
    text: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  tertiary: {
    dot: 'bg-tertiary',
    text: 'text-tertiary',
    bg: 'bg-tertiary/10',
    border: 'border-tertiary/20',
  },
  gray: {
    dot: 'bg-outline',
    text: 'text-on-surface-variant',
    bg: 'bg-outline/10',
    border: 'border-outline/20',
  },
};

/** Maps domain status strings (as shown in the UI) to a STATUS_VARIANTS key. */
export const STATUS_MAP = {
  Safe: 'emerald',
  Good: 'emerald',
  Optimal: 'emerald',
  Active: 'emerald',
  Healthy: 'emerald',

  'Near Expiry': 'amber',
  'Reorder Soon': 'amber',
  'Expiring Soon': 'amber',
  'Low Stock': 'amber',
  Pending: 'amber',

  Expired: 'red',
  'Critical Low': 'red',
  Rejected: 'red',
  'Out of Stock': 'red',

  Received: 'emerald',
  Dispatched: 'emerald',

  Inactive: 'gray',
  Draft: 'gray',

  Beta: 'tertiary',
  Info: 'primary',
};

/** Statuses that should pulse to draw attention. */
export const PULSE_STATUSES = new Set(['Critical Low', 'Near Expiry', 'Expired']);

export function getStatusVariant(status) {
  return STATUS_VARIANTS[STATUS_MAP[status] ?? 'gray'];
}
