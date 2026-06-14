import { cn } from '@/utils/cn';

export default function Icon({ name, filled = false, className = '', ...props }) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'icon-filled', className)}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}
