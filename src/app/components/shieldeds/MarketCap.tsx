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

export default function MarketCapChart() {
  const [transactions, setTransactions] = useState<
    {
      date: string;
      shieldedMarketCap: number;
      closingPrice: number;
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
            shieldedMarketCap: item.Shielded_Market_Cap,
            closingPrice: item.Closing_Price,
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
      shieldedMarketCap: d.shieldedMarketCap,
      closingPrice: d.closingPrice,
    }));
  }, [transactions]);
  return (
    <ErrorBoundary fallback={"Failed to load Transaction Chart"}>
      <ResponsiveContainer width="100%">
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
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="closingPrice"
            name="Closing Price"
            stroke="hsl(var(--chart-1))"
            strokeWidth={3}
            dot={false}
          />
          <Area
            dataKey="shieldedMarketCap"
            name="Shielded Market Cap"
            fill="hsl(var(--chart-2))"
            stroke="hsl(var(--chart-2))"
            fillOpacity={0.3}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ErrorBoundary>
  );
}
