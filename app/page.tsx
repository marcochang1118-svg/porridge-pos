'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Monitor, Settings } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);

  useEffect(() => {
    // Check for existing device binding
    const savedRole = localStorage.getItem('porridge_device_role');

    // Quick secret to reset: URL param ?reset=true
    const urlParams = new URLSearchParams(window.location.search);
    const isReset = urlParams.get('reset') === 'true';

    if (savedRole && !isReset) {
      router.push(savedRole === 'pos' ? '/pos' : '/dashboard');
    } else {
      if (isReset) localStorage.removeItem('porridge_device_role');
      setIsLoading(false);
    }
  }, [router]);

  const handleSetRole = (role: 'pos' | 'dashboard') => {
    if (confirm(`確定要將此設備設定為「${role === 'pos' ? '點餐機' : '管理後台'}」嗎？\n(設定後將自動進入，如需重設請聯繫管理員)`)) {
      localStorage.setItem('porridge_device_role', role);
      router.push(role === 'pos' ? '/pos' : '/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-300"></div>
          <div className="h-4 w-32 rounded bg-gray-300"></div>
          <p className="text-gray-400 text-sm">Checking device authorization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-8 gap-8 font-sans">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm mb-4">
          <Monitor size={48} className="text-slate-700" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">裝置設定 (Device Setup)</h1>
        <p className="text-slate-500 text-lg">初次使用，請設定此裝置的用途</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <button
          onClick={() => handleSetRole('pos')}
          className="flex flex-col items-center justify-center gap-6 bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-500 group cursor-pointer"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
            <ShoppingBag size={40} className="text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-slate-700 group-hover:text-blue-600">這是「點餐機」</h2>
            <p className="text-slate-400 group-hover:text-slate-500">POS Client</p>
          </div>
          <p className="text-sm text-slate-400 px-8 leading-relaxed">
            設定為前台點餐專用，直接進入點餐畫面，隱藏後台管理功能。
          </p>
        </button>

        <button
          onClick={() => handleSetRole('dashboard')}
          className="flex flex-col items-center justify-center gap-6 bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-purple-500 group cursor-pointer"
        >
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
            <LayoutDashboard size={40} className="text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-slate-700 group-hover:text-purple-600">這是「管理後台」</h2>
            <p className="text-slate-400 group-hover:text-slate-500">Admin Dashboard</p>
          </div>
          <p className="text-sm text-slate-400 px-8 leading-relaxed">
            設定為管理員專用，可查看營收報表、修改菜單與成本。
          </p>
        </button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-xs text-slate-400">
        <Settings size={12} />
        <span>System ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        <span>•</span>
        <span>若需重置設定，請清除瀏覽器快取或聯繫技術支援。</span>
      </div>
    </div>
  );
}
