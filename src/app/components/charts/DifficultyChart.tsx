import * as dateFns from "date-fns";
import { RefObject, useEffect, useMemo, useState } from "react";
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
import { Difficulty } from "@/app/lib/chart/types";
import { formatNumberShort, getDifficultyData } from "@/app/lib/chart/helpers";
import { DATA_URL } from "@/app/lib/chart/data-url";
import { ErrorBoundary } from "../ErrorBoundary/ErrorBoundary";
import { useInMobile } from "@/app/hooks/useInMobile";



type DifficultyChartProps = {
  chartRef?: RefObject<HTMLDivElement | null>;
};

export default function DifficultyChart(props: DifficultyChartProps) {
  const [difficulty, setDifficulty] = useState<Difficulty[]>([]);
  const [loading, setLoading] = useState(false);
  const fontSize = 12;
  const isMobile = useInMobile();

  useEffect(() => {
    const controller = new AbortController();

    const fetchAllData = async () => {
      setLoading(true);

      try {
        const [difficultyData] = await Promise.all([
          getDifficultyData(DATA_URL.difficultyUrl, controller.signal),
        ]);

        if (difficultyData) {
          setDifficulty(difficultyData);
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

  const parsedData = useMemo(() => {
    return difficulty.map((d) => ({
      date: dateFns.format(
        dateFns.parse(d.Date, "MM/dd/yyyy", new Date()),
        "MMM yyyy"
      ),
      difficulty: parseFloat(d.Difficulty),
    }));
  }, [difficulty]);

  return (
    <ErrorBoundary fallback={"Failed to load Difficulty Chart"}>
      <ChartContainer ref={props.chartRef} loading={loading}>
         <AreaChart data={parsedData}>
          <defs>
            <linearGradient id="diffGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--chart-7))"
                stopOpacity={0.6}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--chart-7))"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis
            dataKey="date"
            tick={{ fontSize, fill: "#94a3b8" }}
            interval={isMobile ? 10 : "preserveStartEnd"}
            minTickGap={isMobile ? 10 : 30}
            tickCount={isMobile ? 4 : 8}
          />
          <YAxis
            tick={{ fontSize, fill: "#94a3b8" }}
            tickFormatter={(val) => formatNumberShort(val)}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;

              return (
                <div
                  className="rounded-md px-3 py-2 shadow-md border text-sm"
                  style={{
                    backgroundColor: "#1e293b",
                    borderColor: "#334155",
                    color: "#f1f5f9",
                  }}
                >
                  <p className="text-slate-100 font-semibold mb-2">{label}</p>
                  <div
                    className="flex justify-between gap-4"
                    style={{ color: "hsl(var(--chart-7))" }}
                  >
                    <span>Difficulty</span>
                    <span className="text-slate-50">
                      {payload[0]?.value?.toLocaleString()} ZEC
                    </span>
                  </div>
                </div>
              );
            }}
          />

          <Area
            type="monotone"
            dataKey="difficulty"
            stroke="hsl(var(--chart-7))"
            fill="url(#diffGradient)"
            name="Difficulty"
          />
        </AreaChart>
      </ChartContainer>
    </ErrorBoundary>
  );
}
