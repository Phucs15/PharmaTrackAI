import { Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import StatusBadge from '@/components/common/StatusBadge';
import Card from '@/components/ui/Card';
import DataTable from '@/components/tables/DataTable';
import { formatDateTime, formatNumber } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const TYPE_CONFIG = {
  IN: { label: 'Inbound', icon: 'arrow_downward', className: 'text-emerald-600 dark:text-emerald-400' },
  OUT: { label: 'Outbound', icon: 'arrow_upward', className: 'text-tertiary' },
};

const COLUMNS = [
  {
    key: 'id',
    header: 'Transaction ID',
    className: 'font-mono text-on-surface-variant transition-colors group-hover:text-primary',
    render: (row) => row.id.toUpperCase(),
  },
  { key: 'medicineName', header: 'Medicine', className: 'font-medium text-on-surface' },
  {
    key: 'type',
    header: 'Type',
    render: (row) => {
      const config = TYPE_CONFIG[row.type];
      return (
        <span className={cn('flex items-center gap-1', config.className)}>
          <Icon name={config.icon} className="text-sm" />
          {config.label}
        </span>
      );
    },
  },
  { key: 'quantity', header: 'Quantity', render: (row) => formatNumber(row.quantity) },
  { key: 'date', header: 'Date', className: 'text-on-surface-variant', render: (row) => formatDateTime(row.date) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

export default function RecentTransactionsTable({ transactions = [], className = '' }) {
  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b border-primary/10 bg-surface-container/30 p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
          <Icon name="receipt_long" className="text-primary" />
          Recent Transactions
        </h3>
        <Link to="/inventory/in" className="text-xs tracking-wide text-primary hover:underline">
          View All
        </Link>
      </div>
      <DataTable columns={COLUMNS} data={transactions} emptyMessage="No recent transactions." emptyIcon="receipt_long" />
    </Card>
  );
}
