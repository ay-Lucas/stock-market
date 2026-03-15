"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export type ExplorerRow = {
  symbol: string;
  name?: string;
  price?: number;
  changePct?: number;
  volume?: number;
  marketCap?: number;
  sources: string[];
};

type SortKey = "symbol" | "price" | "changePct" | "volume" | "marketCap";
type SortDir = "asc" | "desc";
type SourceFilter =
  | "all"
  | "most_active"
  | "gainers"
  | "losers"
  | "undervalued"
  | "trending";

const formatCurrency = (value?: number) =>
  value == null
    ? "–"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(value);

const formatPct = (value?: number) =>
  typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(2)}%` : "–";

const formatCompact = (value?: number) =>
  value == null
    ? "–"
    : new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(value);

const toNumberOrUndefined = (value: string | null) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "symbol", label: "Symbol" },
  { key: "price", label: "Price" },
  { key: "changePct", label: "Change %" },
  { key: "volume", label: "Volume" },
  { key: "marketCap", label: "Market Cap" },
];

const sourceLabels: Record<SourceFilter, string> = {
  all: "All Sources",
  most_active: "Most Active",
  gainers: "Top Gainers",
  losers: "Top Losers",
  undervalued: "Undervalued",
  trending: "Trending",
};

export default function StocksExplorer({ rows }: { rows: ExplorerRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minChange, setMinChange] = useState<string>("");
  const [maxChange, setMaxChange] = useState<string>("");
  const [minVolume, setMinVolume] = useState<string>("");
  const [minMarketCap, setMinMarketCap] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("changePct");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setSource((searchParams.get("source") as SourceFilter) ?? "all");
    setMinPrice(searchParams.get("minPrice") ?? "");
    setMaxPrice(searchParams.get("maxPrice") ?? "");
    setMinChange(searchParams.get("minChange") ?? "");
    setMaxChange(searchParams.get("maxChange") ?? "");
    setMinVolume(searchParams.get("minVolume") ?? "");
    setMinMarketCap(searchParams.get("minMarketCap") ?? "");
    setSortBy((searchParams.get("sortBy") as SortKey) ?? "changePct");
    setSortDir((searchParams.get("sortDir") as SortDir) ?? "desc");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (source !== "all") params.set("source", source);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minChange) params.set("minChange", minChange);
    if (maxChange) params.set("maxChange", maxChange);
    if (minVolume) params.set("minVolume", minVolume);
    if (minMarketCap) params.set("minMarketCap", minMarketCap);
    if (sortBy !== "changePct") params.set("sortBy", sortBy);
    if (sortDir !== "desc") params.set("sortDir", sortDir);
    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [
    maxChange,
    maxPrice,
    minChange,
    minMarketCap,
    minPrice,
    minVolume,
    pathname,
    query,
    router,
    searchParams,
    sortBy,
    sortDir,
    source,
  ]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toUpperCase();
    const minP = toNumberOrUndefined(minPrice);
    const maxP = toNumberOrUndefined(maxPrice);
    const minC = toNumberOrUndefined(minChange);
    const maxC = toNumberOrUndefined(maxChange);
    const minV = toNumberOrUndefined(minVolume);
    const minMC = toNumberOrUndefined(minMarketCap);

    const filtered = rows.filter((row) => {
      if (q) {
        const symbol = row.symbol.toUpperCase();
        const name = (row.name ?? "").toUpperCase();
        if (!symbol.includes(q) && !name.includes(q)) return false;
      }
      if (source !== "all" && !row.sources.includes(source)) return false;
      if (minP != null && (row.price == null || row.price < minP)) return false;
      if (maxP != null && (row.price == null || row.price > maxP)) return false;
      if (minC != null && (row.changePct == null || row.changePct < minC)) return false;
      if (maxC != null && (row.changePct == null || row.changePct > maxC)) return false;
      if (minV != null && (row.volume == null || row.volume < minV)) return false;
      if (minMC != null && (row.marketCap == null || row.marketCap < minMC)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const get = (row: ExplorerRow): string | number => {
        if (sortBy === "symbol") return row.symbol;
        return row[sortBy] ?? Number.NEGATIVE_INFINITY;
      };
      const av = get(a);
      const bv = get(b);
      if (typeof av === "string" && typeof bv === "string") {
        const cmp = av.localeCompare(bv);
        return sortDir === "asc" ? cmp : -cmp;
      }
      const cmp = (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [
    maxChange,
    maxPrice,
    minChange,
    minMarketCap,
    minPrice,
    minVolume,
    query,
    rows,
    sortBy,
    sortDir,
    source,
  ]);

  return (
    <section className="mt-8 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-900/80 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Advanced Screener
        </h2>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {filteredRows.length} matches
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Symbol or name"
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        />
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as SourceFilter)}
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        >
          {(Object.keys(sourceLabels) as SourceFilter[]).map((key) => (
            <option key={key} value={key}>
              {sourceLabels[key]}
            </option>
          ))}
        </select>
        <input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          type="number"
          step="0.01"
          placeholder="Min Price"
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          type="number"
          step="0.01"
          placeholder="Max Price"
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        />
        <input
          value={minVolume}
          onChange={(e) => setMinVolume(e.target.value)}
          type="number"
          step="1"
          placeholder="Min Volume"
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        />
        <input
          value={minChange}
          onChange={(e) => setMinChange(e.target.value)}
          type="number"
          step="0.01"
          placeholder="Min Change %"
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        />
        <input
          value={maxChange}
          onChange={(e) => setMaxChange(e.target.value)}
          type="number"
          step="0.01"
          placeholder="Max Change %"
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        />
        <input
          value={minMarketCap}
          onChange={(e) => setMinMarketCap(e.target.value)}
          type="number"
          step="1"
          placeholder="Min Market Cap"
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        >
          {sortOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
        <select
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as SortDir)}
          className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-800 dark:text-slate-100"
        >
          <option value="desc">Direction: Desc</option>
          <option value="asc">Direction: Asc</option>
        </select>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
          <thead className="bg-slate-100/80 dark:bg-slate-800/80">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Symbol</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Name</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Price</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Change %</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Volume</th>
              <th className="px-3 py-2 text-right font-semibold text-slate-700 dark:text-slate-200">Market Cap</th>
              <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Sources</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/70 dark:bg-slate-900/70">
            {filteredRows.map((row) => {
              const up = typeof row.changePct === "number" && row.changePct >= 0;
              return (
                <tr key={row.symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/70">
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
                    <Link href={`/${encodeURIComponent(row.symbol)}`}>{row.symbol}</Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300 max-w-56 truncate">
                    {row.name ?? "—"}
                  </td>
                  <td className="price-nums px-3 py-2 text-right text-slate-900 dark:text-slate-100">{formatCurrency(row.price)}</td>
                  <td className={`price-nums px-3 py-2 text-right ${up ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatPct(row.changePct)}
                  </td>
                  <td className="price-nums px-3 py-2 text-right text-slate-900 dark:text-slate-100">{formatCompact(row.volume)}</td>
                  <td className="price-nums px-3 py-2 text-right text-slate-900 dark:text-slate-100">{formatCompact(row.marketCap)}</td>
                  <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                    {row.sources.join(", ")}
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-6 text-center text-slate-500 dark:text-slate-400"
                >
                  No stocks match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
