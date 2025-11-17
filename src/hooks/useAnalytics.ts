import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  analyticsService, 
  AnalyticsOverview, 
  TopPipeline, 
  ExecutionTrend,
  TimePeriod 
} from '@/services/analyticsService';

interface UseAnalyticsResult {
  overview: AnalyticsOverview | null;
  topPipelines: TopPipeline[];
  trends: ExecutionTrend[];
  loading: boolean;
  error: string | null;
  period: TimePeriod;
  setPeriod: (period: TimePeriod) => void;
  refresh: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsResult {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [topPipelines, setTopPipelines] = useState<TopPipeline[]>([]);
  const [trends, setTrends] = useState<ExecutionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<TimePeriod>('30d');

  const fetchData = async (currentPeriod: TimePeriod) => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, pipelinesData, trendsData] = await Promise.all([
        analyticsService.getOverview(currentPeriod),
        analyticsService.getTopPipelines(currentPeriod, 5),
        analyticsService.getTrends(currentPeriod),
      ]);

      setOverview(overviewData);
      setTopPipelines(pipelinesData);
      setTrends(trendsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const handleSetPeriod = (newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
  };

  const refresh = async () => {
    await fetchData(period);
  };

  return {
    overview,
    topPipelines,
    trends,
    loading,
    error,
    period,
    setPeriod: handleSetPeriod,
    refresh,
  };
}
