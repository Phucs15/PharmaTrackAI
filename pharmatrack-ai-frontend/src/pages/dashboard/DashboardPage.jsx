import { useEffect, useState } from 'react';
import Icon from '@/components/common/Icon';
import IconButton from '@/components/common/IconButton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatCard from '@/components/common/StatCard';
import Button from '@/components/ui/Button';
import LineChartCard from '@/components/charts/LineChartCard';
import BarChartCard from '@/components/charts/BarChartCard';
import RecentTransactionsTable from './components/RecentTransactionsTable';
import ExpiryAlertsWidget from './components/ExpiryAlertsWidget';
import * as medicineService from '@/services/medicineService';
import * as batchService from '@/services/batchService';
import * as inventoryService from '@/services/inventoryService';
import * as reportService from '@/services/reportService';
import { formatNumber } from '@/utils/formatters';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expiryReport, setExpiryReport] = useState(null);
  const [stockMovement, setStockMovement] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const [meds, batchList, txns, inventorySummary, expiry, movement] = await Promise.all([
        medicineService.getAll(),
        batchService.getAll(),
        inventoryService.getTransactionHistory(),
        reportService.getInventorySummary(),
        reportService.getExpiryReport(),
        reportService.getStockMovement(),
      ]);

      if (cancelled) return;

      setMedicines(meds);
      setBatches(batchList);
      setTransactions(txns);
      setSummary(inventorySummary);
      setExpiryReport(expiry);
      setStockMovement(movement);
      setLoading(false);
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalInventoryUnits = medicines.reduce((sum, med) => sum + med.totalStock, 0);
  const lowStockCount = medicines.filter(
    (med) => med.status === 'Critical Low' || med.status === 'Reorder Soon'
  ).length;

  const inOutData = stockMovement.series.map((point) => ({
    name: point.period.replace(/, \d{4}$/, ''),
    In: point.inbound,
    Out: point.outbound,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-headline text-3xl font-semibold tracking-tight text-on-surface">
            Dashboard Overview
            <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-normal text-primary shadow-glow">
              <Icon name="sync" className="text-xs" /> Live
            </span>
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            System status is optimal. AI predictions updated 2 mins ago.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Icon name="calendar_month" className="text-sm" />
            Last 30 Days
          </Button>
          <Button>
            <Icon name="download" className="text-sm" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard icon="medication" iconColor="primary" label="Total Medicines" value={formatNumber(medicines.length)} trend="+2.4%" />
        <StatCard
          icon="inventory_2"
          iconColor="secondary"
          label="Total Inventory"
          value={formatNumber(totalInventoryUnits)}
          unit="units"
          trend="+8.1%"
        />
        <StatCard icon="layers" iconColor="tertiary" label="Total Batches" value={formatNumber(batches.length)} />
        <StatCard
          icon="warning"
          iconColor="tertiary"
          label="Expiring Soon"
          value={formatNumber(expiryReport.atRiskCount)}
          variant="warning"
        />
        <StatCard
          icon="error"
          iconColor="error"
          label="Low Stock Alerts"
          value={formatNumber(lowStockCount)}
          variant="critical"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <LineChartCard
          className="lg:col-span-2"
          title="Monthly Inventory Trend"
          subtitle="Units over the last 6 months"
          data={summary.monthlyTrend}
          xKey="month"
          lines={[{ dataKey: 'units', name: 'Units in Stock', color: 'rgb(var(--color-primary))' }]}
          valueFormatter={(value) => formatNumber(value)}
          action={<IconButton icon="more_horiz" label="Chart options" />}
        />
        <BarChartCard
          title="In vs Out"
          subtitle="Recent activity"
          data={inOutData}
          bars={[
            { dataKey: 'In', name: 'In', color: 'rgb(var(--color-primary))' },
            { dataKey: 'Out', name: 'Out', color: 'rgb(var(--color-outline))' },
          ]}
          valueFormatter={(value) => formatNumber(value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentTransactionsTable transactions={transactions.slice(0, 4)} className="lg:col-span-2" />
        <ExpiryAlertsWidget batches={expiryReport.atRiskBatches} />
      </div>
    </div>
  );
}
