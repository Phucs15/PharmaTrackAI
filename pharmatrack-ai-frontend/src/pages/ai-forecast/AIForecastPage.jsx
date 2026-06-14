import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import * as aiService from '@/services/aiService';
import PredictionVsRealityChart from './components/PredictionVsRealityChart';
import ConfidenceScoreCard from './components/ConfidenceScoreCard';
import ReorderSuggestionCard from './components/ReorderSuggestionCard';
import ActionableInsights from './components/ActionableInsights';
import LogisticsCopilot from './components/LogisticsCopilot';

export default function AIForecastPage() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const data = await aiService.getForecast();
      if (!cancelled) {
        setForecast(data);
        setLoading(false);
      }
    })();

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-semibold tracking-tight text-on-surface">AI Forecast</h1>
        <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
          AI-driven predictive analytics for Amoxicillin, Ibuprofen, and other critical supply lines.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <PredictionVsRealityChart data={forecast.predictionVsReality} className="lg:col-span-2" />
            <div className="flex flex-col gap-6">
              <ConfidenceScoreCard score={forecast.confidenceScore} />
              <ReorderSuggestionCard units={forecast.suggestedReorder} />
            </div>
          </div>
          <ActionableInsights insights={forecast.insights} />
        </div>

        <LogisticsCopilot className="min-h-[32rem] xl:col-span-1" />
      </div>
    </div>
  );
}
