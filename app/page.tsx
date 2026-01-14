import Link from 'next/link';
import { ShoppingBag, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8 gap-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Porridge POS V2.0</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link
          href="/pos"
          className="flex flex-col items-center justify-center gap-4 bg-white p-12 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500 group"
        >
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <ShoppingBag size={48} className="text-blue-600 group-hover:text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-700 group-hover:text-blue-600">POS Client</h2>
          <p className="text-gray-500 text-center">Take orders, manage cart, and checkout.</p>
        </Link>

        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center gap-4 bg-white p-12 rounded-3xl shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-purple-500 group"
        >
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
            <LayoutDashboard size={48} className="text-purple-600 group-hover:text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-700 group-hover:text-purple-600">Dashboard</h2>
          <p className="text-gray-500 text-center">View revenue, expenses, and manage menu.</p>
        </Link>
      </div>

      <div className="mt-8 text-sm text-gray-400">
        System Status: <span className="text-green-500 font-bold">Online</span>
      </div>
    </div>
  );
}
