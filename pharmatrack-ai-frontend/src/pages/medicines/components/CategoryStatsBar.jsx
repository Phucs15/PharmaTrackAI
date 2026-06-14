import { Link } from 'react-router-dom';
import StatCard from '@/components/common/StatCard';
import Card from '@/components/ui/Card';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const BAR_COLOR_CLASSES = ['bg-primary', 'bg-tertiary'];

export default function CategoryStatsBar({ medicines = [], className = '' }) {
  const totalValue = medicines.reduce((sum, med) => sum + med.totalStock * (med.unitPrice ?? 0), 0);
  const lowStockCount = medicines.filter(
    (med) => med.status === 'Critical Low' || med.status === 'Reorder Soon'
  ).length;

  let totalUnits = 0;
  const unitsByCategory = new Map();
  medicines.forEach((med) => {
    totalUnits += med.totalStock;
    unitsByCategory.set(med.category, (unitsByCategory.get(med.category) ?? 0) + med.totalStock);
  });

  const topCategories = Array.from(unitsByCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([category, units]) => ({
      category,
      percent: totalUnits > 0 ? Math.round((units / totalUnits) * 100) : 0,
    }));

  return (
    <div className={cn('grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4', className)}>
      <StatCard
        icon="inventory_2"
        iconColor="primary"
        label="Total Stock Value"
        value={formatCurrency(totalValue)}
        trend="+12%"
      />
      <StatCard
        icon="warning"
        iconColor="error"
        label="Low Stock Alerts"
        value={`${formatNumber(lowStockCount)} Items`}
        variant={lowStockCount > 0 ? 'critical' : 'default'}
      />
      <Card className="relative overflow-hidden p-6 lg:col-span-2">
        <div className="ambient-glow -right-16 -top-16" />
        <div className="relative z-10 mb-5 flex items-center justify-between">
          <h3 className="text-sm font-medium text-on-surface-variant">Top Categories by Volume</h3>
          <Link to="/reports" className="text-xs font-medium text-primary hover:underline">
            View All
          </Link>
        </div>
        <div className="relative z-10 space-y-4">
          {topCategories.length === 0 && (
            <p className="text-sm text-on-surface-variant">No category data available.</p>
          )}
          {topCategories.map(({ category, percent }, index) => (
            <div key={category}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-on-surface">{category}</span>
                <span className="text-on-surface-variant">{percent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className={cn('h-full rounded-full', BAR_COLOR_CLASSES[index] ?? 'bg-primary')}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
