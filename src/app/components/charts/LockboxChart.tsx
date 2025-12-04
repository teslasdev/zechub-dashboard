import { ErrorBoundary } from "@/app/components/ErrorBoundary/ErrorBoundary";
import { useResponsiveFontSize } from "@/app/hooks/useResponsiveFontSize";
import { DATA_URL } from "@/app/lib/chart/data-url";
import { formatNumberShort, getLockboxData } from "@/app/lib/chart/helpers";
import { LockBox } from "@/app/lib/chart/types";
import { RefObject, useEffect, useState } from "react";
import * as dateFns from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartContainer from "../zcash/ChartContainer";

type LockboxChartProps = {
  chartRef?: RefObject<HTMLDivElement | null>;
};
export default function LockboxChart(props: LockboxChartProps) {
  const [loading, setLoading] = useState(false);
  const [lockboxData, setLockboxData] = useState<LockBox[]>([]);
  const fontSize = useResponsiveFontSize(); // optional: pass min/max

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllData = async () => {
      setLoading(true);

      try {
        const [lockboxData] = await Promise.all([
          getLockboxData(DATA_URL.lockboxUrl, controller.signal),
        ]);

        if (lockboxData) {
          setLockboxData(lockboxData);
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
    <ErrorBoundary fallback={"Failed to load Lockbox Chart"}>
      <ChartContainer ref={props.chartRef} loading={loading}>
        <AreaChart data={lockboxData}>
          {/* Gradients */}
          <defs>
            <linearGradient id="lockboxGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.25} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis dataKey="Date" tickFormatter={(date) => dateFns.format(new Date(date), "MMM yyyy")} tick={{ fontSize, fill: "#94a3b8" }} />
          <YAxis tick={{ fontSize, fill: "#94a3b8" }} />
          {/* Tooltip */}
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white dark:bg-slate-800 p-2 rounded shadow text-sm border border-slate-200 dark:border-slate-600">
                    <p className="text-gray-600 dark:text-gray-300">
                      {dateFns.format(new Date(label!), "PPP")}
                    </p>
                    <p className="font-semibold text-blue-600 dark:text-blue-300">
                      {formatNumberShort(payload[0].value as number)} LockBox
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          <Area
            type="monotone"
            dataKey="lockbox"
            stroke="hsl(var(--chart-1))"
            fill="url(#lockboxGradient)"
            fillOpacity={1}
            strokeWidth={2}
            dot={({ index, cx, cy }) =>
              index % 7 === 0 ? (
                <circle
                  key={index + 4}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill="hsl(var(--chart-1))"
                  stroke="white"
                  strokeWidth={1}
                />
              ) : (
                <span key={index + 4} />
              )
            }
          />
        </AreaChart>
      </ChartContainer>
    </ErrorBoundary>
  );
}
