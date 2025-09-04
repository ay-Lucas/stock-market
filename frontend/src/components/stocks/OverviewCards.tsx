"use client";
import type { StockData } from "@shared/types/stock";
import type {
  QuoteSummaryMinimal,
  MaybeRawNumber,
} from "@shared/types/yahoo";

type Props = {
  ticker: string;
  quote?: StockData;
  summary?: QuoteSummaryMinimal;
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

  // Helpers to safely extract numbers
  const num = (v?: MaybeRawNumber) =>
    typeof v === "number" ? v : v?.raw ?? undefined;

  // Yahoo summaryDetail fields (best-effort; optional)
  type SummaryDetailLike = {
    marketCap?: MaybeRawNumber;
    trailingPE?: MaybeRawNumber;
    dividendYield?: MaybeRawNumber;
    fiftyTwoWeekLow?: MaybeRawNumber;
    fiftyTwoWeekHigh?: MaybeRawNumber;
  };
  type DefaultKeyStatisticsLike = { trailingEps?: MaybeRawNumber };

  const root = summary?.quoteSummary?.result?.[0] ?? summary;
  const sd = (root?.summaryDetail ?? {}) as SummaryDetailLike;
  const dks = (root?.defaultKeyStatistics ?? {}) as DefaultKeyStatisticsLike;

  const mc = num(sd.marketCap);
  const pe = num(sd.trailingPE);
  const eps = num(dks.trailingEps);
  const dy = (num(sd.dividendYield) ?? NaN) * 100;
  const weekLow = num(sd.fiftyTwoWeekLow);
  const weekHigh = num(sd.fiftyTwoWeekHigh);

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-black dark:text-gray-100">
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
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {title}
      </div>
      {children}
    </div>
  );
}
