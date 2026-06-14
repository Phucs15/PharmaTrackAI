import StatCard from '@/components/common/StatCard';

export default function ConfidenceScoreCard({ score, trend = '+1.2% from last epoch', className = '' }) {
  return (
    <StatCard
      icon="trending_up"
      iconColor="tertiary"
      label="Confidence Score"
      value={`${score}%`}
      trend={trend}
      className={className}
    />
  );
}
