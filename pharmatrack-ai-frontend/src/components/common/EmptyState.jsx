import Icon from './Icon';
import { cn } from '@/utils/cn';

export default function EmptyState({ icon = 'inbox', title, description, action, className = '' }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant px-6 py-16 text-center',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name={icon} className="text-3xl" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-on-surface">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>}
      </div>
      {action}
    </div>
  );
}
