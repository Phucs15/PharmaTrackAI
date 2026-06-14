import IconButton from '@/components/common/IconButton';
import { cn } from '@/utils/cn';

export default function TableRowActions({ onView, onEdit, onDelete, className = '' }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100',
        className
      )}
    >
      {onView && <IconButton icon="visibility" label="View details" onClick={onView} />}
      {onEdit && <IconButton icon="edit" label="Edit" onClick={onEdit} />}
      {onDelete && (
        <IconButton icon="delete" label="Delete" onClick={onDelete} className="hover:bg-error/10 hover:text-error" />
      )}
    </div>
  );
}
