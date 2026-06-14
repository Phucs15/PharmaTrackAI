import Icon from '@/components/common/Icon';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/formatters';

export default function ReorderSuggestionCard({ units, coveragePercent = 75, className = '' }) {
  return (
    <Card className={cn('flex flex-1 flex-col p-5', className)}>
      <div className="mb-2 flex items-center gap-3 text-on-surface-variant">
        <Icon name="inventory_2" className="text-secondary" />
        <span className="text-sm font-medium">Suggested Reorder</span>
      </div>
      <p className="text-2xl font-bold text-on-surface">
        {formatNumber(units)} <span className="text-sm font-normal text-on-surface-variant">units</span>
      </p>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-secondary" style={{ width: `${coveragePercent}%` }} />
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">Recommended within the next 7 days</p>
    </Card>
  );
}
