'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, LayoutDashboard, Monitor, Settings } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingRole, setPendingRole] = useState<'pos' | 'dashboard' | null>(null);

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

  const initiateSetRole = (role: 'pos' | 'dashboard') => {
    setPendingRole(role);
    setShowPasswordModal(true);
    setPassword('');
  };

  const confirmSetRole = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded PIN for MVP - In real app, verify against API or env
    if (password === '8888') {
      if (pendingRole) {
        localStorage.setItem('porridge_device_role', pendingRole);
        router.push(pendingRole === 'pos' ? '/pos' : '/dashboard');
      }
    } else {
      alert('密碼錯誤 (Wrong Password)');
      setPassword('');
    }
    setShowPasswordModal(false);
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-8 gap-8 font-sans relative">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm mb-4">
          <Monitor size={48} className="text-slate-700" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">裝置設定 (Device Setup)</h1>
        <p className="text-slate-500 text-lg">請選擇此裝置的用途 (需輸入管理員密碼)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <button
          onClick={() => initiateSetRole('pos')}
          className="flex flex-col items-center justify-center gap-6 bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-blue-500 group cursor-pointer"
        >
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
            <ShoppingBag size={40} className="text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-slate-700 group-hover:text-blue-600">設定為「點餐機」</h2>
            <p className="text-slate-400 group-hover:text-slate-500">POS Client</p>
          </div>
        </button>

        <button
          onClick={() => initiateSetRole('dashboard')}
          className="flex flex-col items-center justify-center gap-6 bg-white p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-purple-500 group cursor-pointer"
        >
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
            <LayoutDashboard size={40} className="text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold text-slate-700 group-hover:text-purple-600">設定為「管理後台」</h2>
            <p className="text-slate-400 group-hover:text-slate-500">Admin Dashboard</p>
          </div>
        </button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-xs text-slate-400">
        <Settings size={12} />
        <span>System ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        <span>•</span>
        <span>若需重置設定，請清除瀏覽器快取或聯繫技術支援。</span>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={confirmSetRole} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                ⚠️ 安全驗證 (Security Check)
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                請輸入管理員密碼以設定裝置角色
              </p>
            </div>
            <div className="p-8 space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入密碼 (預設: 8888)"
                className="w-full text-center text-3xl font-bold tracking-widest p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-1 p-2 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-4 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="p-4 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                確認設定
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
