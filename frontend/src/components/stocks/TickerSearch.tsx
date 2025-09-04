"use client";
import { useEffect, useRef, useState } from "react";
import { SearchResult, SearchQuote } from "@shared/types/yahoo";

type TickerSearchProps = {
  onSelect: (symbol: string) => void;
  placeholder?: string;
};

export default function TickerSearch({ onSelect, placeholder }: TickerSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchQuote[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSelected, setLastSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 200);

  useEffect(() => {
    const search = async () => {
      if (!debouncedQuery || debouncedQuery.length < 1) {
        setResults([]);
        return;
      }

      // If the user just selected this exact ticker, don't reopen suggestions
      if (lastSelected && debouncedQuery.toUpperCase() === lastSelected.toUpperCase()) {
        setResults([]);
        setOpen(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(debouncedQuery)}`);
        const data: SearchResult = await res.json();
        setResults(data.quotes?.slice(0, 8) ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [debouncedQuery, lastSelected]);

  // Close on outside click or Escape key
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleSelect = (symbol: string) => {
    onSelect(symbol);
    setQuery(symbol);
    setLastSelected(symbol);
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl text-black dark:text-gray-100">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder={placeholder ?? "Search ticker (e.g., AAPL, MSFT)"}
        className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-gray-100"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-md max-h-80 overflow-auto">
          {results.map((r, idx) => (
            <li
              key={`${r.symbol}-${idx}`}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-black dark:text-gray-100"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(r.symbol!)}
            >
              <span className="font-semibold mr-2">{r.symbol}</span>
              <span className="text-gray-600 dark:text-gray-400">{r.shortname ?? r.longname}</span>
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <div className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-400">Searching…</div>
      )}
    </div>
  );
}

function useDebounce<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
