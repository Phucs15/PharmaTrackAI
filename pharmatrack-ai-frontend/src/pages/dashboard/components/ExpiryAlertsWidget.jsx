import { Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import Card from '@/components/ui/Card';
import { daysUntil, formatNumber } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export default function ExpiryAlertsWidget({ batches = [], className = '' }) {
  const visible = batches.slice(0, 4);

  return (
    <Card variant="elevated" className={cn('relative flex flex-col overflow-hidden', className)}>
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-full bg-gradient-to-b from-tertiary/10 to-transparent" />
      <div className="relative z-10 flex items-center justify-between border-b border-tertiary/10 p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
          <Icon name="history_toggle_off" className="text-tertiary" />
          Expiry Alerts
        </h3>
        <span className="rounded-full border border-tertiary/30 bg-tertiary/20 px-2 py-0.5 text-xs font-bold text-tertiary">
          {batches.length}
        </span>
      </div>
      <div className="relative z-10 flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-on-surface-variant">No batches are nearing expiry.</p>
        )}
        {visible.map((batch) => {
          const remaining = daysUntil(batch.expDate);
          const isExpired = batch.status === 'Expired';

          return (
            <div
              key={batch.id}
              className={cn(
                'group relative flex flex-col gap-2 overflow-hidden rounded-xl border bg-surface-container/50 p-4 transition-colors',
                isExpired ? 'border-error/20 hover:border-error/40' : 'border-tertiary/20 hover:border-tertiary/40'
              )}
            >
              <div className={cn('absolute left-0 top-0 h-full w-1', isExpired ? 'bg-error' : 'bg-tertiary')} />
              <div className="flex items-start justify-between gap-2">
                <h4
                  className={cn(
                    'text-sm font-medium text-on-surface transition-colors',
                    isExpired ? 'group-hover:text-error' : 'group-hover:text-tertiary'
                  )}
                >
                  {batch.medicineName}
                </h4>
                <span className={cn('flex shrink-0 items-center gap-1 text-xs font-medium', isExpired ? 'text-error' : 'text-tertiary')}>
                  <Icon name="timer" className="text-sm" />
                  {isExpired ? 'Expired' : `${remaining} Days`}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Batch: <span className="font-mono text-on-surface">{batch.batchNumber}</span> · Qty: {formatNumber(batch.quantity)}
              </p>
              <div className="mt-2 flex gap-2">
                {isExpired && (
                  <button
                    type="button"
                    className="flex-1 rounded-md border border-error/20 bg-error/10 py-1.5 text-xs text-error transition-colors hover:bg-error/20"
                  >
                    Isolate
                  </button>
                )}
                <Link
                  to="/expiry-monitoring"
                  className="flex-1 rounded-md border border-outline/20 bg-surface-bright py-1.5 text-center text-xs text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  {isExpired ? 'Details' : 'Review Batch'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <div className="relative z-10 mt-auto border-t border-outline/10 bg-surface-container/30 p-4">
        <Link
          to="/expiry-monitoring"
          className="block w-full rounded-lg py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          View All Expiring ({batches.length})
        </Link>
      </div>
    </Card>
  );
}
