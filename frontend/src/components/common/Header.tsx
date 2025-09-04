"use client";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header className="w-full bg-white dark:bg-gray-900 shadow-md sticky text-gray-800 dark:text-gray-100">
      <div className="container mx-auto flex items-center justify-between py-4 px-6 sm:px-12">
        <div className="text-2xl font-bold">
          <Link href="/">Stock-Matic</Link>
        </div>
        <nav className="flex gap-4 items-center">
          <Link href="/stocks" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Stocks
          </Link>
          <Link href="/crypto" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Crypto
          </Link>
          <Link href="/news" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            News
          </Link>
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            className="ml-2 inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
