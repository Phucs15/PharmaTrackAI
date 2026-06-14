import TableEmptyRow from './TableEmptyRow';
import { cn } from '@/utils/cn';

export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  onRowClick,
  emptyMessage = 'No records found.',
  emptyIcon,
  className = '',
}) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="sticky top-0 z-10 bg-surface-container/80 backdrop-blur-md">
          <tr className="border-b border-outline-variant">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant',
                  column.headerClassName
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/60">
          {data.length === 0 ? (
            <TableEmptyRow colSpan={columns.length} message={emptyMessage} icon={emptyIcon} />
          ) : (
            data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn('group transition-colors hover:bg-primary/5', onRowClick && 'cursor-pointer')}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('whitespace-nowrap px-4 py-3 text-on-surface', column.className)}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
