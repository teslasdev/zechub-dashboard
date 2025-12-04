// Transaction Volume Chart
import * as dateFns from "date-fns";
import { DATA_URL } from "@/app/lib/chart/data-url";
import { RefObject, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { ErrorBoundary } from "../ErrorBoundary/ErrorBoundary";
import { useResponsiveFontSize } from "@/app/hooks/useResponsiveFontSize";
import { useInMobile } from "@/app/hooks/useInMobile";

export default function ShieldedMetrics() {
  const [transactions, setTransactions] = useState<
    {
      date: string;
      totalShieldedSupply: number;
        totalLockboxSupply: number;
        shieldedMarketCap: number;
        closingPrice: number;
        totalTransferTxs: number;
        totalTransparentTxs: number;
        totalSaplingTxs: number;
        totalOrchardTxs: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const fontSize = useResponsiveFontSize();
  const isMobile = useInMobile();

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllData = async () => {
      setLoading(true);

      try {
        const response = await fetch(DATA_URL.zcashShieldedStatsUrl, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (data && Array.isArray(data)) {
          // Extract both Dates and Transactions into an array of objects
          const transactionData = data.map((item) => ({
            date: item.Dates,
            totalShieldedSupply : item.Total_Shielded_Supply,
            totalLockboxSupply : item.Total_Lockbox_Supply,
            shieldedMarketCap: item.Shielded_Market_Cap,
            closingPrice: item.Closing_Price,
            totalTransferTxs: item.Total_Transfer_TXs,
            totalTransparentTxs: item.Total_Transparent_TXs,
            totalSaplingTxs: item.Total_Sapling_TXs,
            totalOrchardTxs: item.Total_Orchard_TXs,
          }));
          setTransactions(transactionData);
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

  const formatValue = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toFixed(2)}`;
  };
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${
                entry.value instanceof Number
                  ? formatValue(entry.value)
                  : entry.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const parsedData = useMemo(() => {
    return transactions.map((d) => ({
      date: dateFns.format(
        dateFns.parse(d.date, "yyyy/MM/dd", new Date()),
        "MMM yyyy"
      ),
        totalShieldedSupply: d.totalShieldedSupply,
        totalLockboxSupply: d.totalLockboxSupply,
        totalTransferTxs: d.totalTransferTxs,
        totalTransparentTxs: d.totalTransparentTxs,
        totalSaplingTxs: d.totalSaplingTxs,
        totalOrchardTxs: d.totalOrchardTxs,
        shieldedMarketCap: d.shieldedMarketCap,
        closingPrice: d.closingPrice,

    }));
  }, [transactions]);
  return (
    <ErrorBoundary fallback={"Failed to load Transaction Chart"}>
     <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={parsedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          stroke="#64748b"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />

        {/* Left Y-Axis for Shielded Supply (millions) */}
        <YAxis
          yAxisId="left"
          stroke="#64748b"
          fontSize={12}
          tickFormatter={formatValue}
          orientation="left"
        />

        {/* Right Y-Axis for Transactions (thousands) */}
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#64748b"
          fontSize={12}
          tickFormatter={formatValue}
        />

        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {/* Shielded Supply - Use left axis */}
        <Area
          yAxisId="left"
          dataKey="totalShieldedSupply"
          name="Total Shielded Supply"
          fill="hsl(var(--chart-2))"
          stroke="hsl(var(--chart-2))"
          fillOpacity={0.3}
        />

        {/* Lockbox Supply - Use left axis (also higher values) */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="totalLockboxSupply"
          name="Total Lockbox Supply"
          stroke="hsl(var(--chart-5))"
          strokeWidth={2}
          dot={false}
        />

        {/* Transactions - Use right axis */}
        <Area
          yAxisId="right"
          dataKey="totalTransferTxs"
          name="Total Transfer TXs"
          fill="hsl(var(--chart-1))"
          stroke="hsl(var(--chart-1))"
          fillOpacity={0.4}
        />

        <Area
          yAxisId="right"
          dataKey="totalTransparentTxs"
          name="Total Transparent TXs"
          fill="hsl(var(--chart-6))"
          stroke="hsl(var(--chart-6))"
          fillOpacity={0.4}
        />

        {/* Pool Transactions - Use right axis */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="totalSaplingTxs"
          name="Total Sapling TXs"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          dot={false}
        />

        <Line
          yAxisId="right"
          type="monotone"
          dataKey="totalOrchardTxs"
          name="Total Orchard TXs"
          stroke="hsl(var(--chart-4))"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
    </ErrorBoundary>
  );
}
