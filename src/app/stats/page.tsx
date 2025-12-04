"use client";

import { useEffect, useState } from "react";
import MetricCard from "../components/Matrics";
import Chart from "../components/stats/Chart";
import Layout from "../layouts/Layout";
import { DATA_URL } from "../lib/chart/data-url";

const page = () => {
  const [metrics, setMetrics] = useState({
    price: 0,
    totalTransactions: 0,
    shieldedTxPercentage: 0,
    totalNodes: 0,
    priceChange: 0,
    transactionsChange: 0,
    shieldedPercentageChange: 0,
    nodesChange: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllData = async () => {
      setLoading(true);

      try {
        const response = await fetch(DATA_URL.zcashShieldedStatsUrl, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (data && Array.isArray(data) && data.length > 1) {
          // Get the latest data and previous data
          const latestData = data[data.length - 1]; // or data[data.length - 1] if chronological
          const previousData = data[data.length - 2]; // or data[data.length - 2] if chronological
          console.log("Latest Data:", latestData);

          // Calculate percentage changes
          const calculateChange = (current: any, previous: any) => {
            if (!previous || previous === 0) return 0;
            return ((current - previous) / previous) * 100;
          };

          const priceChange = calculateChange(
            latestData.Closing_Price,
            previousData.Closing_Price
          );
          const transactionsChange = calculateChange(
            latestData.Transactions,
            previousData.Transactions
          );
          const shieldedPercentageChange = calculateChange(
            latestData.Shielded_Transaction_Percentage,
            previousData.Shielded_Transaction_Percentage
          );
          const nodesChange = calculateChange(
            latestData.Total_Node_Count,
            previousData.Total_Node_Count
          );

          // Update metrics with latest data and calculated changes
          setMetrics({
            price: latestData.Closing_Price || 0,
            totalTransactions: latestData.Transactions || 0,
            shieldedTxPercentage:
              latestData.Shielded_Transaction_Percentage || 0,
            totalNodes: latestData.Total_Node_Count || 0,
            priceChange: Math.round(priceChange),
            transactionsChange: Math.round(transactionsChange),
            shieldedPercentageChange: Math.round(shieldedPercentageChange),
            nodesChange: Math.round(nodesChange),
          });
        } else if (data && Array.isArray(data) && data.length === 1) {
          // Only one data point available, set metrics without changes
          const latestData = data[0];
          setMetrics({
            price: latestData.Closing_Price || 0,
            totalTransactions: latestData.Total_Transfer_TXs || 0,
            shieldedTxPercentage:
              latestData.Shielded_Transaction_Percentage || 0,
            totalNodes: latestData.Total_Node_Count || 0,
            priceChange: 0,
            transactionsChange: 0,
            shieldedPercentageChange: 0,
            nodesChange: 0,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      controller.abort();
    };
  }, []);
  return (
    <Layout>
      <div className="container mx-auto space-y-6 sm:space-y-9 px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="">
            <h3 className="text-xl sm:text-2xl md:text-[28px] plus-jakarta-sans font-bold">
              Shielded Statistics
            </h3>
          </div>

          <div className="w-full sm:w-auto">
            <span className="button-ui text-sm sm:text-base block text-center sm:inline-block">Shielded Networks</span>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 w-full">
          {/* Metrics Component */}
          <MetricCard
            titleIcon={require("../../assets/market_cap.png")}
            title="Price"
            value={`$${metrics.price.toFixed(2)}`}
            change={metrics.priceChange}
          />
          <MetricCard
            titleIcon={require("../../assets/transparency.png")}
            title="Total Transactions"
            value={`${(metrics.totalTransactions / 1000).toFixed(1)}k`}
            change={metrics.transactionsChange}
          />
          <MetricCard
            titleIcon={require("../../assets/market_price.png")}
            title="Shielded Tx %"
            value={`${(metrics.shieldedTxPercentage * 100).toFixed(1)}%`}
            change={metrics.shieldedPercentageChange}
          />
          <MetricCard
            titleIcon={require("../../assets/shielded.png")}
            title="Total Nodes"
            value={metrics.totalNodes.toString()}
            change={metrics.nodesChange}
          />
        </div>
        <Chart />
      </div>
    </Layout>
  );
};

export default page;
