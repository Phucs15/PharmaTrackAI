import Icon from '@/components/common/Icon';
import Card from '@/components/ui/Card';
import { formatDateTime, formatNumber, getUnitAbbreviation } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const TYPE_CONFIG = {
  IN: {
    title: 'Recent Receipts Log',
    icon: 'call_received',
    idPrefix: 'RCV',
    emptyMessage: 'No inbound receipts logged yet.',
    sign: '+',
  },
  OUT: {
    title: 'Recent Dispatches',
    icon: 'outbox',
    idPrefix: 'DSP',
    emptyMessage: 'No outbound dispatches logged yet.',
    sign: '-',
  },
};

function getTransactionCode(id, prefix) {
  const suffix = id.split('-').slice(1).join('-') || id;
  return `${prefix}-${suffix.toUpperCase()}`;
}

function getTag(transaction) {
  if (transaction.status === 'Rejected') {
    return { label: 'DAMAGED IN TRANSIT', className: 'bg-error/10 text-error border-error/20' };
  }
  if ((transaction.notes ?? '').toLowerCase().includes('cold chain')) {
    return { label: 'COLD CHAIN', className: 'bg-tertiary/10 text-tertiary border-tertiary/20' };
  }
  const label = transaction.source ?? transaction.destination;
  if (!label) return null;
  return { label: label.toUpperCase(), className: 'bg-surface-container-high text-on-surface-variant border-outline-variant' };
}

export default function TransactionLogCard({ type, transactions = [], className = '' }) {
  const config = TYPE_CONFIG[type];
  const visible = transactions.slice(0, 4);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b border-primary/10 bg-surface-container/30 p-6">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
          <Icon name={config.icon} className="text-primary" />
          {config.title}
        </h3>
      </div>
      <div className="divide-y divide-outline-variant/60">
        {visible.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-on-surface-variant">{config.emptyMessage}</p>
        ) : (
          visible.map((transaction) => {
            const isRejected = transaction.status === 'Rejected';
            const tag = getTag(transaction);

            return (
              <div key={transaction.id} className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon name="medication" className="text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    <span className="truncate">{transaction.medicineName}</span>
                    <span className="shrink-0 font-mono text-xs text-tertiary">
                      {getTransactionCode(transaction.id, config.idPrefix)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">
                    Batch <span className="font-mono">{transaction.batchId}</span> · {formatDateTime(transaction.date)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={cn('text-sm font-semibold', isRejected ? 'text-error' : 'text-primary')}>
                    {isRejected ? '+0' : `${config.sign}${formatNumber(transaction.quantity)}`}{' '}
                    {getUnitAbbreviation(transaction.unitType)}
                    {isRejected && ' (Rejected)'}
                  </p>
                  {tag && (
                    <span className={cn('mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide', tag.className)}>
                      {tag.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {visible.length > 0 && (
        <div className="border-t border-outline-variant p-4 text-center text-xs text-on-surface-variant">
          Showing last {visible.length} {type === 'IN' ? 'receipts' : 'dispatches'} · {transactions.length} total
        </div>
      )}
    </Card>
  );
}
