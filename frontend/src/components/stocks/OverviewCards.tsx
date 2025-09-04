"use client";
import type { StockData } from "@shared/types/stock";

type Props = {
  ticker: string;
  quote?: StockData;
  summary?: any;
};

const formatCurrency = (n?: number) =>
  n == null
    ? "–"
    : new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(n);

const formatNumberCompact = (n?: number) =>
  n == null
    ? "–"
    : new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(n);

const pct = (v?: number) =>
  v == null || !isFinite(v) ? "–" : `${v.toFixed(2)}%`;

export default function OverviewCards({ ticker, quote, summary }: Props) {
  const current = quote?.currentPrice ?? null;
  const prevClose = quote?.previousClose ?? null;
  const change =
    current != null && prevClose != null ? current - prevClose : null;
  const changePct =
    current != null && prevClose ? (change! / prevClose) * 100 : null;

  // Yahoo summaryDetail fields (best-effort; optional)
  const sd =
    summary?.quoteSummary?.result?.[0]?.summaryDetail ??
    summary?.summaryDetail ??
    {};
  const mc = sd.marketCap?.raw ?? sd.marketCap ?? undefined;
  const pe = sd.trailingPE?.raw ?? sd.trailingPE ?? undefined;
  const eps =
    summary?.quoteSummary?.result?.[0]?.defaultKeyStatistics?.trailingEps
      ?.raw ??
    summary?.defaultKeyStatistics?.trailingEps ??
    undefined;
  const dy = (sd.dividendYield?.raw ?? sd.dividendYield ?? undefined) * 100;
  const weekLow = sd.fiftyTwoWeekLow?.raw ?? sd.fiftyTwoWeekLow ?? undefined;
  const weekHigh = sd.fiftyTwoWeekHigh?.raw ?? sd.fiftyTwoWeekHigh ?? undefined;

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-black">
      <Card title={`${ticker} Price`}>
        <div className="text-xl font-semibold">
          {current != null ? formatCurrency(current) : "–"}
        </div>
        <div
          className={`text-sm ${change != null ? (change >= 0 ? "text-green-600" : "text-red-600") : "text-gray-500"}`}
        >
          {change != null
            ? `${change >= 0 ? "+" : ""}${formatCurrency(Math.abs(change))} (${pct(changePct ?? 0)})`
            : "–"}
        </div>
      </Card>

      <Card title="52W Range">
        <div className="text-sm">
          Low: {weekLow != null ? formatCurrency(weekLow) : "–"}
        </div>
        <div className="text-sm">
          High: {weekHigh != null ? formatCurrency(weekHigh) : "–"}
        </div>
      </Card>

      <Card title="Market Cap">
        <div className="text-lg font-medium">{formatNumberCompact(mc)}</div>
      </Card>

      <Card title="Valuation">
        <div className="text-sm">P/E (TTM): {pe ?? "–"}</div>
        <div className="text-sm">EPS (TTM): {eps ?? "–"}</div>
        <div className="text-sm">
          Div. Yield: {dy != null && !isNaN(dy) ? pct(dy) : "–"}
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}
