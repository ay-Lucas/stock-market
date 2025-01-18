import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white shadow-md sticky">
      <div className="container mx-auto flex items-center justify-between py-4 px-6 sm:px-12">
        <div className="text-2xl font-bold text-gray-800">
          <Link href="/">Stock-Matic</Link>
        </div>
        <nav className="flex gap-6">
          <Link href="/stocks" className="text-gray-600 hover:text-gray-900">
            Stocks
          </Link>
          <Link href="/crypto" className="text-gray-600 hover:text-gray-900">
            Crypto
          </Link>
          <Link href="/news" className="text-gray-600 hover:text-gray-900">
            News
          </Link>
        </nav>
      </div>
    </header>
  );
}
