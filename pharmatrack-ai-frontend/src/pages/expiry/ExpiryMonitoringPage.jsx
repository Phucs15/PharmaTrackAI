import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import SearchInput from '@/components/common/SearchInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import BarChartCard from '@/components/charts/BarChartCard';
import DataTable from '@/components/tables/DataTable';
import TableRowActions from '@/components/tables/TableRowActions';
import ExpirySummaryCards from './components/ExpirySummaryCards';
import * as batchService from '@/services/batchService';
import { daysUntil, formatDate, formatNumber, getUnitAbbreviation } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const PAGE_SIZE = 5;
const TIMELINE_MONTHS = 6;

const SEVERITY_FILTERS = {
  all: 'All Critical Batches',
  expired: 'Expired',
  within30: 'Expiring within 30 days',
  within90: 'Expiring within 90 days',
};

function getExpiryPill(batch) {
  const remaining = daysUntil(batch.expDate);

  if (batch.status === 'Expired') {
    return {
      label: `Expired (${Math.abs(remaining)} days)`,
      dotClass: 'bg-error',
      textClass: 'text-error',
      bgClass: 'bg-error/10',
      borderClass: 'border-error/20',
    };
  }
  if (remaining <= 30) {
    return {
      label: `${remaining} Days`,
      dotClass: 'bg-orange-500',
      textClass: 'text-orange-500',
      bgClass: 'bg-orange-500/10',
      borderClass: 'border-orange-500/20',
    };
  }
  return {
    label: `${remaining} Days`,
    dotClass: 'bg-yellow-500',
    textClass: 'text-yellow-500',
    bgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/20',
  };
}

function buildTimeline(batches) {
  const months = [];
  const now = new Date();

  for (let i = 0; i < TIMELINE_MONTHS; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ name: date.toLocaleString('en-US', { month: 'short' }), key: `${date.getFullYear()}-${date.getMonth()}`, Units: 0 });
  }

  batches.forEach((batch) => {
    const expDate = new Date(batch.expDate);
    const key = `${expDate.getFullYear()}-${expDate.getMonth()}`;
    const bucket = months.find((month) => month.key === key);
    if (bucket) bucket.Units += batch.quantity;
  });

  return months;
}

export default function ExpiryMonitoringPage() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await batchService.getAll();
      if (!cancelled) {
        setBatches(data);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const criticalBatches = useMemo(
    () =>
      batches
        .filter((batch) => batch.status === 'Near Expiry' || batch.status === 'Expired')
        .sort((a, b) => daysUntil(a.expDate) - daysUntil(b.expDate)),
    [batches]
  );

  const counts = useMemo(() => {
    let expired = 0;
    let within30 = 0;
    let within90 = 0;

    criticalBatches.forEach((batch) => {
      const remaining = daysUntil(batch.expDate);
      if (batch.status === 'Expired') expired += 1;
      else if (remaining <= 30) within30 += 1;
      else within90 += 1;
    });

    return { expired, within30, within90 };
  }, [criticalBatches]);

  const timeline = useMemo(() => buildTimeline(batches), [batches]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return criticalBatches.filter((batch) => {
      const remaining = daysUntil(batch.expDate);
      const matchesSeverity =
        severityFilter === 'all' ||
        (severityFilter === 'expired' && batch.status === 'Expired') ||
        (severityFilter === 'within30' && batch.status !== 'Expired' && remaining <= 30) ||
        (severityFilter === 'within90' && batch.status !== 'Expired' && remaining > 30);
      const matchesSearch =
        !query ||
        batch.batchNumber.toLowerCase().includes(query) ||
        batch.medicineName.toLowerCase().includes(query);
      return matchesSeverity && matchesSearch;
    });
  }, [criticalBatches, severityFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilter = (key) => {
    setSeverityFilter((prev) => (prev === key ? 'all' : key));
    setPage(1);
  };

  const columns = useMemo(
    () => [
      { key: 'batchNumber', header: 'Batch No.', className: 'font-mono text-primary', render: (row) => `#${row.batchNumber}` },
      { key: 'medicineName', header: 'Medicine Name', className: 'font-medium text-on-surface' },
      { key: 'facility', header: 'Facility', className: 'text-on-surface-variant' },
      {
        key: 'quantity',
        header: 'Quantity',
        render: (row) => (
          <span>
            {formatNumber(row.quantity)} <span className="text-xs text-on-surface-variant">{getUnitAbbreviation(row.unitType)}</span>
          </span>
        ),
      },
      { key: 'expDate', header: 'Expiry Date', className: 'text-on-surface-variant', render: (row) => formatDate(row.expDate) },
      {
        key: 'pill',
        header: 'Status / Days',
        render: (row) => {
          const pill = getExpiryPill(row);
          return (
            <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium', pill.bgClass, pill.textClass, pill.borderClass)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', pill.dotClass)} />
              {pill.label}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        render: (row) => (
          <div onClick={(event) => event.stopPropagation()}>
            <TableRowActions onView={() => navigate(`/medicines/${row.medicineId}`)} />
          </div>
        ),
      },
    ],
    [navigate]
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-semibold tracking-tight text-on-surface">Expiry Monitoring</h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            AI-driven shelf-life tracking. Critical alerts and predictive timelines for proactive inventory management.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Icon name="filter_list" className="text-sm" />
            Filter
          </Button>
          <Button variant="outline">
            <Icon name="download" className="text-sm" />
            Export
          </Button>
        </div>
      </div>

      <ExpirySummaryCards expired={counts.expired} within30={counts.within30} within90={counts.within90} onFilter={handleFilter} />

      <BarChartCard
        title="Expiry Timeline"
        subtitle="Projected volume of expiring stock over the next 6 months."
        data={timeline}
        xKey="name"
        bars={[{ dataKey: 'Units', name: 'Expiring Units', color: 'rgb(var(--color-primary))' }]}
        valueFormatter={(value) => formatNumber(value)}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-primary/10 bg-surface-container/30 p-6 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
            <Icon name="warning" className="text-primary" />
            Critical Batches List
            {severityFilter !== 'all' && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {SEVERITY_FILTERS[severityFilter]}
              </span>
            )}
          </h3>
          <SearchInput
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search batch or medicine..."
            className="w-full sm:w-64"
          />
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          emptyMessage="No batches are nearing expiry."
          emptyIcon="history_toggle_off"
        />
        {filtered.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-on-surface-variant">
              Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} critical batches
            </p>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
