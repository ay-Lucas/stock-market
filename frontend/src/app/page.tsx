import StockDashboard from "@/components/stocks/StockDashboard";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 gap-12 bg-gray-50 font-sans">
      <main className="w-full flex flex-col items-center gap-8">
        <StockDashboard />
      </main>
    </div>
  );
}
