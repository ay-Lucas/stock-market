"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Timeframe = "1d" | "1w" | "1m";
type SortMode = "performance" | "size" | "symbol";
type FilterMode = "all" | "defensive" | "cyclical";

export type SectorHeatmapItem = {
  symbol: string;
  name: string;
  category: "defensive" | "cyclical";
  sizeWeight: number;
  price?: number;
  volume?: number;
  change1d?: number;
  change1w?: number;
  change1m?: number;
  sparkline: number[];
};

const formatCurrency = (value?: number) =>
  value == null
    ? "–"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value);

const formatPct = (value?: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? `${value.toFixed(2)}%`
    : "–";

const formatCompact = (value?: number) =>
  value == null
    ? "–"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);

const VOL_BASELINE_DAILY: Record<string, number> = {
  XLK: 1.45,
  XLY: 1.35,
  XLC: 1.3,
  XLF: 1.15,
  XLI: 1.0,
  XLB: 1.05,
  XLV: 0.85,
  XLP: 0.65,
  XLU: 0.75,
  XLRE: 0.95,
  XLE: 1.9,
};

const PERIOD_DAYS: Record<Timeframe, number> = { "1d": 1, "1w": 5, "1m": 21 };

const getChangeByTimeframe = (item: SectorHeatmapItem, tf: Timeframe) => {
  if (tf === "1d") return item.change1d;
  if (tf === "1w") return item.change1w;
  return item.change1m;
};

const getNormalizedScore = (item: SectorHeatmapItem, tf: Timeframe) => {
  const change = getChangeByTimeframe(item, tf);
  if (typeof change !== "number") return undefined;
  const dailyVol = VOL_BASELINE_DAILY[item.symbol] ?? 1;
  const periodVol = dailyVol * Math.sqrt(PERIOD_DAYS[tf]);
  if (!periodVol) return undefined;
  return change / periodVol;
};

const getHeatClass = (score?: number) => {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  }
  if (score >= 1.75) return "bg-green-600/35 border-green-500/50";
  if (score >= 0.9) return "bg-green-500/25 border-green-500/40";
  if (score > 0.15) return "bg-green-500/15 border-green-500/30";
  if (score <= -1.75) return "bg-red-600/35 border-red-500/50";
  if (score <= -0.9) return "bg-red-500/25 border-red-500/40";
  if (score < -0.15) return "bg-red-500/15 border-red-500/30";
  return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
};

const getTileSizeClass = (weight: number) => {
  if (weight >= 14) return "lg:col-span-2 lg:row-span-2";
  if (weight >= 10) return "lg:col-span-2";
  return "lg:col-span-1";
};

function Sparkline({
  values,
  positive,
}: {
  values: number[];
  positive: boolean;
}) {
  if (!values.length) return <div className="h-8" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-8 w-full opacity-90">
      <polyline
        fill="none"
        stroke={positive ? "#16a34a" : "#dc2626"}
        strokeWidth="3"
        points={points}
      />
    </svg>
  );
}

export default function SectorHeatmap({
  sectors,
  defaultTimeframe = "1d",
}: {
  sectors: SectorHeatmapItem[];
  defaultTimeframe?: Timeframe;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>(defaultTimeframe);
  const [sortMode, setSortMode] = useState<SortMode>("performance");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const visibleSectors = useMemo(() => {
    const filtered = sectors.filter((sector) =>
      filterMode === "all" ? true : sector.category === filterMode,
    );
    const sorted = [...filtered].sort((a, b) => {
      if (sortMode === "size") return b.sizeWeight - a.sizeWeight;
      if (sortMode === "symbol") return a.symbol.localeCompare(b.symbol);
      const aChange = getChangeByTimeframe(a, timeframe) ?? -Infinity;
      const bChange = getChangeByTimeframe(b, timeframe) ?? -Infinity;
      return bChange - aChange;
    });
    return sorted;
  }, [filterMode, sectors, sortMode, timeframe]);

  return (
    <section className="mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Sector Heatmap
        </h2>
        <div className="flex flex-wrap gap-2">
          {(["1d", "1w", "1m"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                timeframe === tf
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="performance">Sort: Performance</option>
            <option value="size">Sort: Size</option>
            <option value="symbol">Sort: Symbol</option>
          </select>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="all">Filter: All</option>
            <option value="defensive">Defensive</option>
            <option value="cyclical">Cyclical</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        <span>Legend</span>
        <span className="rounded px-1.5 py-0.5 bg-red-600/35 border border-red-500/50">
          Strong -
        </span>
        <span className="rounded px-1.5 py-0.5 bg-red-500/20 border border-red-500/30">
          -
        </span>
        <span className="rounded px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          Neutral
        </span>
        <span className="rounded px-1.5 py-0.5 bg-green-500/20 border border-green-500/30">
          +
        </span>
        <span className="rounded px-1.5 py-0.5 bg-green-600/35 border border-green-500/50">
          Strong +
        </span>
        <span className="ml-2 text-gray-500 dark:text-gray-400">
          (volatility-adjusted color)
        </span>
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        1D reflects the last completed market session.
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[128px]">
        {visibleSectors.map((sector, index) => {
          const change = getChangeByTimeframe(sector, timeframe);
          const score = getNormalizedScore(sector, timeframe);
          const up = typeof change === "number" && change >= 0;
          const tooltip = `${sector.name} (${sector.symbol})\n${timeframe.toUpperCase()} ${formatPct(change)}\nPrice ${formatCurrency(sector.price)}\nVolume ${formatCompact(sector.volume)}`;
          return (
            <Link
              key={`${sector.symbol}-${timeframe}`}
              href={`/${sector.symbol}`}
              title={tooltip}
              className={`flex flex-col justify-between overflow-hidden rounded-lg border py-1 px-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-400/60 dark:hover:border-slate-500/60 ${getTileSizeClass(
                sector.sizeWeight,
              )} ${getHeatClass(score)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {sector.name}
                  </div>
                  <div className="truncate text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    {sector.symbol}
                  </div>
                </div>
                <div
                  className={`shrink-0 text-xs font-semibold ${up ? "text-green-700" : "text-red-700"}`}
                >
                  {typeof change === "number"
                    ? `${up ? "▲" : "▼"} ${formatPct(Math.abs(change))}`
                    : "–"}
                </div>
              </div>

              <div className="mt-1 truncate text-sm text-gray-800 dark:text-gray-100">
                {formatCurrency(sector.price)}
              </div>
              <Sparkline values={sector.sparkline} positive={up} />

              <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
                <span>Vol {formatCompact(sector.volume)}</span>
                <span className="rounded bg-black/5 px-1.5 py-0.5 dark:bg-white/10">
                  #{index + 1}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
