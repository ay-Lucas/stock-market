"use client";

import { useRouter } from "next/navigation";
import TickerSearch from "@/components/stocks/TickerSearch";

export default function HomeTickerSearch() {
  const router = useRouter();

  return (
    <TickerSearch
      placeholder="Search symbols and jump to dashboard (AAPL, BRK.B, JPM)"
      onSelect={(symbol) => router.push(`/${encodeURIComponent(symbol.toUpperCase())}`)}
    />
  );
}
