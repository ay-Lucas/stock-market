"use client";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-md sticky text-gray-800 dark:text-gray-100">
      <div className="container mx-auto flex items-center justify-between py-4 px-6 sm:px-12">
        <div className="text-2xl font-bold">
          <Link href="/">Stock-Matic</Link>
        </div>
        <nav className="flex gap-4 items-center">
          <Link
            href="/stocks"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Stocks
          </Link>
          <Link
            href="/crypto"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Crypto
          </Link>
          <Link
            href="/news"
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            News
          </Link>
          <button
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label={mounted ? (resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
            title={mounted ? (resolvedTheme === "dark" ? "Light mode" : "Dark mode") : "Toggle theme"}
            className="ml-2 inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
