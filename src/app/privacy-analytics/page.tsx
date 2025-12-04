"use client";

import { useEffect, useState } from "react";
import { getNillionService } from "@/app/lib/nillion/client";
import { AggregatedAnalytics } from "@/app/lib/nillion/types";

export default function PrivacyAnalyticsPage() {
  const [serviceInitialized, setServiceInitialized] = useState(false);
  const [initError, setInitError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [aggregatedData, setAggregatedData] = useState<AggregatedAnalytics | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeMessage, setStoreMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    initializeService();
  }, []);

  const initializeService = async () => {
    setLoading(true);

    // Initialize Nillion service (happens server-side via API route)
    const service = getNillionService();
    const result = await service.initialize();

    if (result.success) {
      setServiceInitialized(true);
      loadAggregatedData();
    } else {
      setInitError(result.error || "Failed to initialize");
    }

    setLoading(false);
  };

  const loadAggregatedData = async () => {
    const service = getNillionService();
    const result = await service.computeAggregatedAnalytics();

    if (result.success && result.data) {
      setAggregatedData(result.data);
    }
  };

  const handleStoreAnalytics = async () => {
    setStoreLoading(true);
    setStoreMessage(null);

    const service = getNillionService();
    const result = await service.storePrivateAnalytics({
      userId: `user-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      pageViews: { '%allot': Math.floor(Math.random() * 100) + 10 },
      sessionDuration: { '%allot': Math.floor(Math.random() * 600) + 60 },
      interactions: { '%allot': Math.floor(Math.random() * 50) + 5 },
      category: 'dashboard',
      platform: 'web',
    });

    if (result.success) {
      setStoreMessage({ type: 'success', text: `Analytics stored privately! ID: ${result.id?.substring(0, 8)}...` });
      loadAggregatedData();
    } else {
      setStoreMessage({ type: 'error', text: result.error || 'Failed to store data' });
    }

    setStoreLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-400">Connecting to Nillion network...</p>
        </div>
      </div>
    );
  }

  if (!serviceInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-2xl w-full bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-orange-400 mb-2">Initialization Error</h2>
          <p className="text-sm sm:text-base text-gray-300">{initError}</p>
          <button
            onClick={initializeService}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Privacy-Preserving Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Powered by Nillion's nilDB (Private Storage) & nilCC (Confidential Compute)
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm sm:text-base text-green-400 font-semibold">Privacy Layer Active</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-400 sm:ml-auto">All data encrypted & distributed</span>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
          <div className="flex items-start gap-2 sm:gap-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs sm:text-sm">
              <p className="text-blue-400 font-semibold mb-1">Production Implementation</p>
              <p className="text-gray-400">
                This uses the actual Nillion SDK with Node.js 23+ in API routes. 
                Data is encrypted, secret-shared, and computed confidentially.
              </p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-linear-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold">nilDB Storage</h3>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              User data encrypted and secret-shared across multiple nodes. No single party can access raw data.
            </p>
          </div>

          <div className="bg-linear-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold">nilCC Compute</h3>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              Confidential computation on encrypted data. Aggregates computed without exposing individual records.
            </p>
          </div>

          <div className="bg-linear-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold">User Control</h3>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              Users own their data. They can grant, revoke, or delete access at any time with fine-grained permissions.
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Store Private Analytics</h2>
          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
            Simulate storing user analytics data privately. The data is automatically encrypted and distributed across the Nillion network.
          </p>

          <button
            onClick={handleStoreAnalytics}
            disabled={storeLoading}
            className="w-full sm:w-auto bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {storeLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="hidden sm:inline">Encrypting & Storing...</span>
                <span className="sm:hidden">Storing...</span>
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">Store Sample Analytics Data</span>
                <span className="sm:hidden">Store Analytics</span>
              </>
            )}
          </button>

          {storeMessage && (
            <div className={`mt-4 p-4 rounded-lg ${
              storeMessage.type === 'success' 
                ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
                : 'bg-red-900/20 border border-red-500/30 text-red-400'
            }`}>
              {storeMessage.text}
            </div>
          )}
        </div>

        {/* Aggregated Analytics Dashboard */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Confidential Aggregated Analytics</h2>
          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
            These aggregates are computed on encrypted data without exposing individual user information.
          </p>

          {aggregatedData ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-linear-to-br from-blue-900/20 to-blue-800/10 border border-blue-500/20 rounded-lg p-4 sm:p-6">
                <div className="text-blue-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Total Users</div>
                <div className="text-2xl sm:text-3xl font-bold">{aggregatedData.totalUsers}</div>
              </div>

              <div className="bg-linear-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/20 rounded-lg p-4 sm:p-6">
                <div className="text-purple-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Page Views</div>
                <div className="text-2xl sm:text-3xl font-bold">{aggregatedData.totalPageViews.toLocaleString()}</div>
              </div>

              <div className="bg-linear-to-br from-green-900/20 to-green-800/10 border border-green-500/20 rounded-lg p-4 sm:p-6">
                <div className="text-green-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Avg Session (sec)</div>
                <div className="text-2xl sm:text-3xl font-bold">{aggregatedData.averageSessionDuration}</div>
              </div>

              <div className="bg-linear-to-br from-orange-900/20 to-orange-800/10 border border-orange-500/20 rounded-lg p-4 sm:p-6">
                <div className="text-orange-400 text-xs sm:text-sm font-semibold mb-1 sm:mb-2">Interactions</div>
                <div className="text-2xl sm:text-3xl font-bold">{aggregatedData.totalInteractions.toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
              No aggregated data available yet. Store some analytics data to see results.
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="mt-6 sm:mt-8 bg-gray-900/30 border border-gray-700/50 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">How It Works</h3>
          <ul className="space-y-2 sm:space-y-3 text-gray-400 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 shrink-0">1.</span>
              <span><strong className="text-gray-300">Private Storage:</strong> User data is encrypted client-side and secret-shared across multiple Nillion nodes using nilDB</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 shrink-0">2.</span>
              <span><strong className="text-gray-300">Access Control:</strong> Fine-grained permissions (read/write/execute) managed through ACLs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 shrink-0">3.</span>
              <span><strong className="text-gray-300">Confidential Compute:</strong> Aggregations computed on encrypted shares using nilCC without decryption</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1 shrink-0">4.</span>
              <span><strong className="text-gray-300">User Sovereignty:</strong> Users maintain full control and can revoke access or delete data at any time</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
