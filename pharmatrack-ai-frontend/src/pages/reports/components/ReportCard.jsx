import Icon from '@/components/common/Icon';
import IconButton from '@/components/common/IconButton';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export default function ReportCard({
  icon,
  iconClassName = 'text-primary border-primary/20',
  title,
  badge,
  subtitle,
  onExport,
  footer,
  children,
  className = '',
}) {
  return (
    <Card className={cn('group flex flex-col p-6', className)}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg border bg-surface-container-high', iconClassName)}>
            <Icon name={icon} />
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-lg font-medium text-on-surface">
              {title}
              {badge && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {badge}
                </span>
              )}
            </h3>
            <p className="text-xs text-on-surface-variant">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-60 transition-opacity group-hover:opacity-100">
          <IconButton icon="picture_as_pdf" label="Download PDF" className="h-8 w-8" onClick={() => onExport?.('pdf')} />
          <IconButton icon="table_chart" label="Export Excel" className="h-8 w-8" onClick={() => onExport?.('xlsx')} />
          <IconButton icon="print" label="Print" className="h-8 w-8" onClick={() => onExport?.('print')} />
        </div>
      </div>
      <div className="mb-6 flex-1">{children}</div>
      {footer && <div className="flex items-center justify-between text-sm text-on-surface-variant">{footer}</div>}
    </Card>
  );
}
