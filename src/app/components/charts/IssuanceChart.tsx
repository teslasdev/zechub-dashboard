import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as dateFns from "date-fns";
import { ErrorBoundary } from "@/app/components/ErrorBoundary/ErrorBoundary";
import { useIssuanceData } from "@/app/hooks/useIssuanceData";
import { useResponsiveFontSize } from "@/app/hooks/useResponsiveFontSize";
import { DATA_URL } from "@/app/lib/chart/data-url";
import { RefObject } from "react";
import ChartContainer from "../zcash/ChartContainer";

type IssuanceChartProps = {
  chartRef?: RefObject<HTMLDivElement | null>;
};

export default function IssuanceChart(props: IssuanceChartProps) {
  const { data, loading } = useIssuanceData(DATA_URL.issuanceUrl);
  const fontSize = useResponsiveFontSize(); // optional: pass min/max

  return (
    <ErrorBoundary fallback={"Failed to load Issuance Chart"}>
      <ChartContainer ref={props.chartRef} loading={loading}>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="inflationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="#ff6b6b" // vivid red
                stopOpacity={0.9}
              />
              <stop
                offset="100%"
                stopColor="#ff6b6b" // vivid red
                stopOpacity={0.3}
              />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis dataKey="date" tickFormatter={(date) => dateFns.format(new Date(date), "MMM yyyy")} tick={{ fontSize, fill: "#94a3b8" }} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize, fill: "#94a3b8" }}
            width={60}
            label={{
              value: "Issuance",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize, fill: "#94a3b8" }}
            width={60}
            label={{
              value: "Inflation (%)",
              angle: 90,
              position: "insideRight",
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;

              return (
                <div
                  className="rounded-md px-3 py-2 shadow-md border text-sm"
                  style={{
                    backgroundColor: "#1e293b", // dark bg
                    borderColor: "#334155",
                    color: "#f1f5f9", // default text
                  }}
                >
                  <p className="text-slate-100 font-semibold mb-2">{label}</p>
                  {payload.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between gap-4"
                      style={{ color: entry.color }}
                    >
                      <span>{entry.name}</span>
                      <span className="text-slate-50">
                        {entry.value?.toLocaleString()} ZEC
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />

      
          <Bar
            yAxisId="left"
            dataKey="issuance"
            fill="hsl(var(--chart-1))"
            radius={[4, 4, 0, 0]}
          />

          <Area
            yAxisId="right"
            type="monotone"
            dataKey="inflation"
            stroke="hsl(var(--chart-5))"
            fill="url(#inflationGradient)"
            fillOpacity={1} // max fill visibility
            strokeWidth={2}
          />
        </ComposedChart>
      </ChartContainer>
    </ErrorBoundary>
  );
}
