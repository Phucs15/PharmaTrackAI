import { cn } from '@/utils/cn';

export default function ChartLegend({ items = [], className = '' }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant', className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.dashed ? (
            <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: item.color }} />
          ) : (
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: item.color }} />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
