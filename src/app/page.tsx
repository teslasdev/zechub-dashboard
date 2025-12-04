"use client";

import MetricCard from "./components/Matrics";
import Chart from "./components/zcash/Chart";
import { useZcashStats } from "./hooks/useZcashStats";
import Layout from "./layouts/Layout";
import { DataTransformer } from "./lib/data-transformer";

// Define the metric type
interface Metric {
  title: string;
  value: string;
  change: number;
  icon: string;
}

const Page = () => {
  const { stats, loading, error, refresh } = useZcashStats();

  const metrics: Metric[] = stats ? DataTransformer.getMetricsFromStats(stats) : [];

  return (
    <Layout>
      <div className="container mx-auto space-y-6 sm:space-y-9 px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="">
            <h3 className="text-xl sm:text-2xl md:text-[28px] plus-jakarta-sans font-bold">
              Zcash Network Metrics
            </h3>
            <p className="text-sm sm:text-base text-[#B7B9BD]">
              Analyze Zcash network metrics and trends
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={refresh}
              disabled={loading}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-white rounded-lg button-ui disabled:opacity-50 transition-colors w-full sm:w-auto"
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <div className="text-red-600 shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-red-800 font-medium text-sm sm:text-base">Error loading data</h3>
                <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
          {loading && metrics.length === 0 ? (
            // Show loading state - you might want to create a proper skeleton loader
            <div className="text-white text-sm sm:text-base">Loading metrics...</div>
          ) : (
            // Show actual metrics
            metrics.map((metric: Metric, index: number) => (
              <MetricCard
                key={index}
                titleIcon={metric.icon}
                title={metric.title}
                value={metric.value}
                change={metric.change.toFixed(1) as unknown as number}
              />
            ))
          )}
        </div>

        {/* Chart Component */}
        <Chart  />
      </div>
    </Layout>
  );
};

export default Page;