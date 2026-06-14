import { useEffect, useState } from 'react';
import Icon from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import BarChartCard from '@/components/charts/BarChartCard';
import AreaChartCard from '@/components/charts/AreaChartCard';
import DonutChartCard from '@/components/charts/DonutChartCard';
import ReportCard from './components/ReportCard';
import * as reportService from '@/services/reportService';
import * as aiService from '@/services/aiService';
import { formatNumber } from '@/utils/formatters';

const EXPIRY_COLORS = {
  Safe: '#10b981',
  'Near Expiry': '#f59e0b',
  Expired: 'rgb(var(--color-error))',
};

export default function ReportsPage() {
  const [inventory, setInventory] = useState(null);
  const [expiry, setExpiry] = useState(null);
  const [stockMovement, setStockMovement] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [inventoryData, expiryData, stockData, forecastData] = await Promise.all([
        reportService.getInventorySummary(),
        reportService.getExpiryReport(),
        reportService.getStockMovement(),
        aiService.getForecast(),
      ]);

      if (!cancelled) {
        setInventory(inventoryData);
        setExpiry(expiryData);
        setStockMovement(stockData);
        setForecast(forecastData);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleExport = async (reportType, format) => {
    const result = await reportService.exportReport(reportType, format);
    window.alert(result.message);
  };

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
          <h1 className="font-headline text-3xl font-semibold tracking-tight text-on-surface">Reports</h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            Consolidated analytics across inventory, expiry, stock movement, and AI-driven forecasts.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Icon name="date_range" className="text-sm" />
            Filter Range
          </Button>
          <Button variant="outline">
            <Icon name="download" className="text-sm" />
            Export All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReportCard
          icon="inventory_2"
          iconClassName="text-primary border-primary/20"
          title="Inventory Summary"
          subtitle="Stock distribution by category"
          onExport={(format) => handleExport('inventory-summary', format)}
          footer={
            <>
              <span>
                Total SKUs <span className="font-semibold text-on-surface">{inventory.totalSkus}</span>
              </span>
              <span>
                Total Units <span className="font-semibold text-on-surface">{formatNumber(inventory.totalUnits)}</span>
              </span>
            </>
          }
        >
          <BarChartCard
            bare
            data={inventory.byCategory}
            xKey="label"
            height={220}
            bars={[{ dataKey: 'value', name: 'Units', color: 'rgb(var(--color-primary))' }]}
            valueFormatter={(value) => formatNumber(value)}
          />
        </ReportCard>

        <ReportCard
          icon="event_busy"
          iconClassName="text-error border-error/20"
          title="Expiry Report"
          subtitle="Batch status breakdown"
          onExport={(format) => handleExport('expiry', format)}
          footer={
            <>
              <span>
                Total Batches <span className="font-semibold text-on-surface">{expiry.totalBatches}</span>
              </span>
              <span>
                At Risk <span className="font-semibold text-error">{expiry.atRiskCount}</span>
              </span>
            </>
          }
        >
          <DonutChartCard
            bare
            data={expiry.breakdown.map((item) => ({
              name: item.label,
              value: item.value,
              color: EXPIRY_COLORS[item.label],
            }))}
            height={180}
            centerLabel="At Risk"
            centerValue={expiry.atRiskCount}
          />
        </ReportCard>

        <ReportCard
          icon="swap_horiz"
          iconClassName="text-secondary border-secondary/20"
          title="Stock Movement"
          subtitle="Inbound vs outbound activity"
          onExport={(format) => handleExport('stock-movement', format)}
          footer={
            <>
              <span>
                Inbound <span className="font-semibold text-emerald-500">{formatNumber(stockMovement.totalInbound)}</span>
              </span>
              <span>
                Outbound <span className="font-semibold text-error">{formatNumber(stockMovement.totalOutbound)}</span>
              </span>
            </>
          }
        >
          <AreaChartCard
            bare
            data={stockMovement.series}
            xKey="period"
            height={220}
            areas={[
              { dataKey: 'inbound', name: 'Inbound', color: 'rgb(var(--color-primary))' },
              { dataKey: 'outbound', name: 'Outbound', color: 'rgb(var(--color-tertiary))' },
            ]}
            valueFormatter={(value) => formatNumber(value)}
          />
        </ReportCard>

        <ReportCard
          icon="auto_awesome"
          iconClassName="text-tertiary border-tertiary/20"
          title="AI Forecast"
          badge="Beta"
          subtitle="Predicted vs actual demand"
          onExport={(format) => handleExport('ai-forecast', format)}
          footer={
            <>
              <span>
                Confidence <span className="font-semibold text-on-surface">{forecast.confidenceScore}%</span>
              </span>
              <span>
                Suggested Reorder <span className="font-semibold text-on-surface">{formatNumber(forecast.suggestedReorder)}</span>
              </span>
            </>
          }
        >
          <AreaChartCard
            bare
            data={forecast.predictionVsReality}
            xKey="period"
            height={220}
            areas={[
              { dataKey: 'actual', name: 'Actual', color: 'rgb(var(--color-primary))' },
              { dataKey: 'predicted', name: 'AI Predicted', color: 'rgb(var(--color-tertiary))', dashed: true },
            ]}
            valueFormatter={(value) => formatNumber(value)}
          />
        </ReportCard>
      </div>

      <Card className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <Icon name="auto_awesome" filled className="text-2xl" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-on-surface">Need a Custom Report?</h3>
          <p className="mt-1 max-w-md text-sm text-on-surface-variant">
            Combine any date range, category, and facility into a tailored export for stakeholders.
          </p>
        </div>
        <Button variant="primary">
          <Icon name="add" className="text-sm" />
          Generate Custom Report
        </Button>
      </Card>
    </div>
  );
}
