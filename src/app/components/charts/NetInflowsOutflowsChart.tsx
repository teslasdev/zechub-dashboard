"use client";

import { ErrorBoundary } from "@/app/components/ErrorBoundary/ErrorBoundary";
import { useResponsiveFontSize } from "@/app/hooks/useResponsiveFontSize";
import { DATA_URL } from "@/app/lib/chart/data-url";
import { formatNumberShort, getNetInOutflowData } from "@/app/lib/chart/helpers";
import { NetInOutflow } from "@/app/lib/chart/types";
import * as dateFns from "date-fns";
import { RefObject, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartContainer from "../zcash/ChartContainer";


interface NetInflowsOutflowsChartProps {
  color?: string;
  chartRef?: RefObject<HTMLDivElement | null>;
}

export default function NetInflowsOutflowsChart(
  props: NetInflowsOutflowsChartProps
) {
  const [loading, setLoading] = useState(false);
  const [dataFlow, setDataFlow] = useState<NetInOutflow[]>([]);
  const [error, setError] = useState(false);

  const fontSize = 12;

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllData = async () => {
      setLoading(true);

      try {
        const [netInOutflow] = await Promise.all([
          getNetInOutflowData(
            DATA_URL.netInflowsOutflowsUrl,
            controller.signal
          ),
        ]);

        setDataFlow(netInOutflow);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();

    return () => controller.abort();
  }, []);

  const parsedData = dataFlow.map((item) => ({
    date: item.Date,
    netSaplingFlow: -parseFloat(item["Net Sapling Flow"]),
    netOrchardFlow: -parseFloat(item["Net Orchard Flow"]),
  }));

  console.log(parsedData);

  return (
    <ErrorBoundary fallback={"Failed to load Net Inflows"}>
      <ChartContainer ref={props.chartRef} loading={loading}>
        <BarChart
          data={parsedData}
          margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="saplingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="orchardGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />

          <XAxis
            dataKey="date"
            tickFormatter={(date) => dateFns.format(new Date(date), "MMM yyyy")}
            tick={{ fontSize, fill: "#94a3b8" }}
          />
          <YAxis
            tickFormatter={(v) => formatNumberShort(v)}
            tick={{ fontSize, fill: "#94a3b8" }}
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
            dataKey="netSaplingFlow"
            name="Net Sapling Flow"
            fill="url(#saplingGradient)"
            stroke="#3b82f6"
            strokeWidth={1.5}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="netOrchardFlow"
            name="Net Orchard Flow"
            fill="url(#orchardGradient)"
            stroke="#ec4899"
            strokeWidth={1.5}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ErrorBoundary>
  );
}
