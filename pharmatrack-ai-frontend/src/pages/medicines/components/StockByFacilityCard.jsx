import Icon from '@/components/common/Icon';
import Card from '@/components/ui/Card';
import { formatNumber } from '@/utils/formatters';
import { cn } from '@/utils/cn';

export default function StockByFacilityCard({ stockByFacility = [], totalStock = 0, className = '' }) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
          <Icon name="warehouse" className="text-primary" />
          Stock Levels per Facility
        </h3>
        <div className="text-right">
          <p className="text-xs text-on-surface-variant">Total System Stock</p>
          <p className="font-display text-xl font-semibold text-on-surface">{formatNumber(totalStock)}</p>
        </div>
      </div>
      {stockByFacility.length === 0 ? (
        <p className="text-sm text-on-surface-variant">No facility-level stock data available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stockByFacility.map((facility) => {
            const isLow = facility.status === 'Low Stock' || facility.status === 'Critical Low';
            return (
              <div
                key={facility.facility}
                className={cn(
                  'rounded-xl border p-4',
                  isLow ? 'border-tertiary/30 bg-tertiary/5' : 'border-outline/10 bg-surface-container/40'
                )}
              >
                <p className="text-sm text-on-surface-variant">{facility.facility}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-on-surface">
                  {formatNumber(facility.stock)}
                </p>
                <span
                  className={cn(
                    'mt-2 inline-flex items-center gap-1 text-xs font-medium',
                    isLow ? 'text-tertiary' : 'text-emerald-600 dark:text-emerald-400'
                  )}
                >
                  <Icon name={isLow ? 'warning' : 'check_circle'} className="text-sm" />
                  {facility.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
