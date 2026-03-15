"use client";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import TickerSearch from "@/components/stocks/TickerSearch";
import { useRouter } from "next/navigation";

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();
  const handleSelect = (symbol: string) => {
    const s = symbol.toUpperCase();
    router.push(`/${s}`);
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-700 bg-white/85 dark:bg-slate-900/85 text-slate-800 dark:text-slate-100 shadow-md backdrop-blur">
      <div className="container mx-auto flex w-full items-center justify-between px-6 py-4 sm:px-12">
        <div className="text-2xl font-bold whitespace-nowrap tracking-tight">
          <Link
            href="/"
            className="rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Stock-Matic
          </Link>
        </div>
        <div className="flex gap-4 items-center w-full">
          <div className="hidden sm:flex flex-1 items-center justify-center">
            <TickerSearch
              onSelect={handleSelect}
              placeholder="Search ticker (e.g., AAPL, MSFT)"
            />
          </div>
        </div>
        <nav className="flex gap-4 items-center">
          <Link
            href="/stocks"
            className="rounded-md px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Stocks
          </Link>
          <Link
            href="/news"
            className="rounded-md px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            News
          </Link>
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label={
              mounted
                ? resolvedTheme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
                : "Toggle theme"
            }
            title={
              mounted
                ? resolvedTheme === "dark"
                  ? "Light mode"
                  : "Dark mode"
                : "Toggle theme"
            }
            className="ml-2 inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )
            ) : (
              // Stable placeholder to avoid hydration mismatch
              <span className="h-5 w-5 inline-block" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
