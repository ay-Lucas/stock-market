"use client";
import type { NewsItem } from "@/lib/stockData";

function formatTime(ts: Date | number | string): string {
  try {
    const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short", // no seconds
    }).format(d);
  } catch {
    return "";
  }
}

export default function NewsList({ items }: { items: NewsItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.slice(0, 8).map((n) => (
        <a
          key={n.uuid}
          href={n.link}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {n.thumbnail?.resolutions?.[0]?.url ? (
            <img
              src={n.thumbnail.resolutions[0].url}
              alt="thumbnail"
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {n.publisher} • {formatTime(n.providerPublishTime)}
            </div>
            <div className="text-base font-medium text-gray-900 dark:text-gray-100 truncate">
              {n.title}
            </div>
            {n.relatedTickers && n.relatedTickers.length > 0 && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {n.relatedTickers.slice(0, 4).join(" • ")}
              </div>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
