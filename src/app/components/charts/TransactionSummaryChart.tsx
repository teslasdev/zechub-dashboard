"use client";

import { ErrorBoundary } from "@/app/components/ErrorBoundary/ErrorBoundary";
import { useResponsiveFontSize } from "@/app/hooks/useResponsiveFontSize";
import { DATA_URL } from "@/app/lib/chart/data-url";
import { fetchTransactionData } from "@/app/lib/chart/helpers";
import { ShieldedTransactionDatum } from "@/app/lib/chart/types";
import { RefObject, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartContainer from "../zcash/ChartContainer";

const BLOCKS_PERIOD = 8064;
const ORCHARD_ACTIVATION = 1687104;
const MIN_GAP_BTW_SLIDER = 100;

interface TransactionsSummaryChartProps {
  chartRef?: RefObject<HTMLDivElement | null>;
}
export default function TransactionsSummaryChart(
  props: TransactionsSummaryChartProps
) {
  const [chartData, setChartData] = useState<ShieldedTransactionDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [pool, setPool] = useState<"default" | "orchard" | "sapling">(
    "default"
  );
  const [cumulative, setCumulative] = useState(true);
  const [filter, setFilter] = useState(true);

  const [startHeight, setStartHeight] = useState(0);
  const [endHeight, setEndHeight] = useState(Infinity);
  const [minHeight, setMinHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(Infinity);

  const fontSize = useResponsiveFontSize();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetchTransactionData(DATA_URL.txsummaryUrl)
      .then((data) => {
        setChartData(data);
        const heights = data.map((d) => d.height);

        setMinHeight(Math.min(...heights));
        setMaxHeight(Math.max(...heights));
        setEndHeight(Math.max(...heights));
      })
      .catch(setError)
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const processData = () => {
    let saplingSum = 0;
    let saplingFilterSum = 0;
    let orchardSum = 0;
    let orchardFilterSum = 0;

    const cumData = chartData.map((d) => {
      saplingSum += d.sapling;
      saplingFilterSum += d.sapling_filter;
      orchardSum += d.orchard;
      orchardFilterSum += d.orchard_filter;

      return {
        height: d.height,
        sapling: saplingSum,
        sapling_filter: saplingFilterSum,
        orchard: orchardSum || null,
        orchard_filter: orchardFilterSum || null,
      };
    });

    const last = cumData[cumData.length - 1];

    let filteredData: any[] = [];

    if (cumulative) {
      filteredData = cumData.filter(
        (d) =>
          (d.height >= startHeight &&
            d.height <= endHeight &&
            d.height % BLOCKS_PERIOD === 0) ||
          d.height === last.height
      );
    } else {
      saplingSum = 0;
      saplingFilterSum = 0;
      orchardSum = 0;
      orchardFilterSum = 0;

      chartData.forEach((d) => {
        saplingSum += d.sapling;
        saplingFilterSum += d.sapling_filter;
        orchardSum += d.orchard;
        orchardFilterSum += d.orchard_filter;

        if (
          (d.height >= startHeight &&
            d.height <= endHeight &&
            d.height % BLOCKS_PERIOD === 0) ||
          d.height === last.height
        ) {
          filteredData.push({
            height: d.height,
            sapling: saplingSum,
            sapling_filter: saplingSum - saplingFilterSum,
            orchard: orchardSum || null,
            orchard_filter:
              orchardFilterSum > 0 ? orchardSum - orchardFilterSum : null,
          });

          saplingSum = 0;
          saplingFilterSum = 0;
          orchardSum = 0;
          orchardFilterSum = 0;
        }
      });
    }

    if (pool === "orchard") {
      filteredData = filteredData.filter((d) => d.height >= ORCHARD_ACTIVATION);
    }

    return filteredData;
  };

  const chartDataset = processData();

  const handleStartChange = (val: number) => {
    // Prevent start from meeting or exceeding end
    if (val >= endHeight - MIN_GAP_BTW_SLIDER) {
      setStartHeight(endHeight - MIN_GAP_BTW_SLIDER); // or a safe MIN_GAP
    } else {
      setStartHeight(val);
    }
  };

  const handleEndChange = (val: number) => {
    // Prevent end from meeting or being lower than start
    if (val <= startHeight + MIN_GAP_BTW_SLIDER) {
      setEndHeight(startHeight + MIN_GAP_BTW_SLIDER); // or a safe MIN_GAP
    } else {
      setEndHeight(val);
    }
  };

  return (
    <ErrorBoundary fallback={"Failed to load Transaction Summary Chart"}>
      <ChartContainer ref={props.chartRef} loading={loading}>
        {cumulative ? (
          <AreaChart data={chartDataset}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="height"
              tick={{ fontSize, fill: "#94a3b8" }}
              tickFormatter={(v) => `#${v}`}
            />
            <YAxis tick={{ fontSize, fill: "#94a3b8" }} />
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

            <Legend
              verticalAlign="bottom"
              align="center"
              content={({ payload }) => (
                <div className="flex justify-center gap-6 mt-6 text-sm text-slate-600 dark:text-slate-300">
                  {payload?.map((entry, index) => (
                    <div
                      key={`item-${index}`}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="w-3 h-3 inline-block rounded-sm"
                        style={{ background: entry.color }}
                      />
                      <p style={{ color: entry.color }}>{entry.value}</p>
                    </div>
                  ))}
                </div>
              )}
            />

            {(pool === "default" || pool === "sapling") && (
              <>
                {filter && (
                  <Area
                    type="monotone"
                    dataKey="sapling_filter"
                    name="Sapling Filter"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="sapling"
                  name="Sapling"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.3}
                />
              </>
            )}
            {(pool === "default" || pool === "orchard") && (
              <>
                {filter && (
                  <Area
                    type="monotone"
                    dataKey="orchard_filter"
                    name="Orchard Filter"
                    stroke="#f87171"
                    fill="#f87171"
                    fillOpacity={0.2}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="orchard"
                  name="Orchard"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
              </>
            )}
          </AreaChart>
        ) : (
          <BarChart data={chartDataset}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="height"
              tick={{ fontSize, fill: "#94a3b8" }}
              tickFormatter={(v) => `#${v}`}
            />
            <YAxis tick={{ fontSize, fill: "#94a3b8" }} />
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="center"
              content={({ payload }) => (
                <div className="flex justify-center gap-6 mt-6 text-sm text-slate-600 dark:text-slate-300">
                  {payload?.map((entry, index) => (
                    <div
                      key={`item-${index}`}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="w-3 h-3 inline-block rounded-sm"
                        style={{ background: entry.color }}
                      />
                      <p>{entry.value}</p>
                    </div>
                  ))}
                </div>
              )}
            />

            {(pool === "default" || pool === "sapling") && (
              <>
                {filter && (
                  <Bar
                    dataKey="sapling_filter"
                    name="Sapling Filter"
                    fill="#60a5fa"
                    stackId="stack"
                  />
                )}
                <Bar
                  dataKey="sapling"
                  name="Sapling"
                  fill="#3b82f6"
                  stackId="stack"
                />
              </>
            )}
            {(pool === "default" || pool === "orchard") && (
              <>
                {filter && (
                  <Bar
                    dataKey="orchard_filter"
                    name="Orchard Filter"
                    fill="#fb7185"
                    stackId="stack"
                  />
                )}
                <Bar
                  dataKey="orchard"
                  name="Orchard"
                  fill="#f43f5e"
                  stackId="stack"
                />
              </>
            )}
          </BarChart>
        )}
      </ChartContainer>
    </ErrorBoundary>
  );
}
