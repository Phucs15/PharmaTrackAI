import AreaChartCard from '@/components/charts/AreaChartCard';
import { formatNumber } from '@/utils/formatters';

export default function PredictionVsRealityChart({ data = [], className = '' }) {
  return (
    <AreaChartCard
      title="Prediction vs Reality"
      subtitle="Global supply chain aggregate"
      data={data}
      xKey="period"
      areas={[
        { dataKey: 'actual', name: 'Actual Demand', color: 'rgb(var(--color-primary))' },
        { dataKey: 'predicted', name: 'AI Predicted', color: 'rgb(var(--color-tertiary))', dashed: true },
      ]}
      valueFormatter={(value) => `${formatNumber(value)} units`}
      className={className}
    />
  );
}
