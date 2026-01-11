'use client';

import { useState } from 'react';
import { CATEGORIES, PRODUCTS, MODIFIERS } from '@/lib/mockData';
import { Trash2, ChevronDown, ChevronRight, Layers, List, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import ModifierModal from './components/ModifierModal';

// Helper for Roman Numerals
function toRoman(num: number): string {
  if (num < 1) return "";
  const lookup: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

// Translations
const UI_TEXT = {
  zh: {
    cartTitle: '目前點單',
    items: '項',
    emptyCartTitle: '尚未點餐',
    total: '總金額',
    checkout: '結帳 (Checkout)',
    grouping: '已合併',
    noGrouping: '不合併',
    customization: '客製化內容',
    noNotes: '無備註'
  },
  en: {
    cartTitle: 'Current Order',
    items: 'items',
    emptyCartTitle: 'Cart Empty',
    total: 'Total',
    checkout: 'Checkout',
    grouping: 'Grouped',
    noGrouping: 'List View',
    customization: 'Customizations',
    noNotes: 'No notes'
  }
};

type CartItem = {
  internalId: string; // unique id for cart item (timestamp)
  productId: string;
  name: string;
  nameEn?: string;
  basePrice: number;
  modifierIds: string[];
  totalPrice: number;
  type?: string; // product type for color coding
};

const ProductCard = ({ product, addToCart, lang }: { product: any, addToCart: (p: any) => void, lang: 'zh' | 'en' }) => {
  let colorClass = 'bg-white border-gray-200 hover:border-blue-400';
  if (product.type === 'meat') colorClass = 'bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-300 text-red-900';
  if (product.type === 'seafood') colorClass = 'bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-300 text-blue-900';
  if (product.type === 'cheese') colorClass = 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100 hover:border-yellow-300 text-yellow-900';
  if (product.type === 'special') colorClass = 'bg-purple-50 border-purple-100 hover:bg-purple-100 hover:border-purple-300 text-purple-900';
  if (product.type === 'side') colorClass = 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 text-gray-800';
  if (product.type === 'addon') colorClass = 'bg-green-50 border-green-100 hover:bg-green-100 hover:border-green-300 text-green-900';

  return (
    <button
      onClick={() => addToCart(product)}
      className={clsx(
        "flex flex-col items-center justify-center gap-1 rounded-xl border p-4 shadow-sm transition-all active:scale-95 active:shadow-inner hover:shadow-md h-32",
        colorClass
      )}
    >
      <span className="text-xl font-bold text-center leading-tight">
        {lang === 'en' ? (product.nameEn || product.name) : product.name}
      </span>
      <span className="text-lg font-medium opacity-80">${product.price}</span>
    </button>
  );
};

export default function PosPage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Dashboard State
  const [viewMode, setViewMode] = useState<'pos' | 'dashboard'>('pos');
  const [dailyOrders, setDailyOrders] = useState<{ id: string, items: CartItem[], total: number, date: string, timestamp: number }[]>([]);
  const [reportPeriod, setReportPeriod] = useState<'day' | 'month' | 'quarter' | 'year' | 'custom'>('day');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Language Preference
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = UI_TEXT[lang];

  // Load orders from local storage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dailyOrders');
      if (saved) {
        try {
          setDailyOrders(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse orders", e);
        }
      }
    }
  });

  // Calculate Dashboard Stats
  const today = new Date();
  const todayStr = today.toLocaleDateString();
  const currentQuarter = Math.floor(today.getMonth() / 3);

  // Filter orders based on selected period
  const filteredOrders = dailyOrders.filter(o => {
    const orderDate = o.timestamp ? new Date(o.timestamp) : new Date(o.date); // Handle legacy string date

    if (reportPeriod === 'day') {
      return orderDate.toLocaleDateString() === todayStr;
    }
    if (reportPeriod === 'month') {
      return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
    }
    if (reportPeriod === 'quarter') {
      const q = Math.floor(orderDate.getMonth() / 3);
      return q === currentQuarter && orderDate.getFullYear() === today.getFullYear();
    }
    if (reportPeriod === 'year') {
      return orderDate.getFullYear() === today.getFullYear();
    }
    if (reportPeriod === 'custom') {
      if (!customStart || !customEnd) return false;
      const start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      return orderDate >= start && orderDate <= end;
    }
    return false;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = filteredOrders.length;

  // Product Breakdown
  const productStats = filteredOrders.flatMap(o => o.items).reduce((acc, item: CartItem) => {
    const displayName = lang === 'en' ? (item.nameEn || item.name) : item.name;
    acc[displayName] = (acc[displayName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Hourly Statistics Analysis
  const hourlyStats = filteredOrders.reduce((acc, order) => {
    // If timestamp exists use it, otherwise fallback to parsing ID or date (for backward compatibility)
    const orderTime = order.timestamp ? new Date(order.timestamp) : new Date(parseInt(order.id) || Date.now());
    const hour = orderTime.getHours(); // 0-23

    if (!acc[hour]) {
      acc[hour] = { revenue: 0, count: 0, products: {} };
    }

    acc[hour].revenue += order.total;
    acc[hour].count += 1;

    order.items.forEach((item: CartItem) => {
      const displayName = lang === 'en' ? (item.nameEn || item.name) : item.name;
      acc[hour].products[displayName] = (acc[hour].products[displayName] || 0) + 1;
    });

    return acc;
  }, {} as Record<number, { revenue: number, count: number, products: Record<string, number> }>);

  // Find max revenue/count for chart scaling
  const maxHourlyRevenue = Math.max(...Object.values(hourlyStats).map(s => s.revenue), 1);

  // View Preference
  const [isGroupingEnabled, setIsGroupingEnabled] = useState(true);

  // Grouping State for Expansions
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempModifierIds, setTempModifierIds] = useState<string[]>([]);

  // Add to cart
  const addToCart = (product: any) => {
    const newItem: CartItem = {
      internalId: Date.now() + Math.random().toString(), // Ensure uniqueness
      productId: product.id,
      name: product.name,
      nameEn: product.nameEn,
      basePrice: product.price,
      modifierIds: [],
      totalPrice: product.price,
      type: product.type,
    };

    // Create new cart and sort it
    const newCart = [...cart, newItem];
    newCart.sort((a, b) => {
      const indexA = PRODUCTS.findIndex(p => p.id === a.productId);
      const indexB = PRODUCTS.findIndex(p => p.id === b.productId);
      // If same product, keep order based on when it was added (internalId)
      if (indexA === indexB) {
        return a.internalId.localeCompare(b.internalId);
      }
      return indexA - indexB;
    });

    setCart(newCart);
  };

  const removeFromCart = (internalId: string) => {
    setCart(cart.filter((item) => item.internalId !== internalId));
  };

  const toggleGroup = (productId: string) => {
    if (expandedGroups.includes(productId)) {
      setExpandedGroups(expandedGroups.filter(id => id !== productId));
    } else {
      setExpandedGroups([...expandedGroups, productId]);
    }
  };

  // Group cart items helper
  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.productId]) {
      acc[item.productId] = [];
    }
    acc[item.productId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  // Unique IDs for group iteration
  const uniqueProductIds = Array.from(new Set(cart.map(item => item.productId)));

  // Open modal for a specific cart item
  const openModifierModal = (item: CartItem) => {
    setEditingItemId(item.internalId);
    setTempModifierIds(item.modifierIds);
    setIsModalOpen(true);
  };

  const toggleModifier = (modId: string) => {
    if (tempModifierIds.includes(modId)) {
      setTempModifierIds(tempModifierIds.filter(id => id !== modId));
    } else {
      setTempModifierIds([...tempModifierIds, modId]);
    }
  };

  const confirmModifiers = () => {
    if (!editingItemId) return;

    setCart(cart.map(item => {
      if (item.internalId === editingItemId) {
        // Recalculate price
        const modifiersPrice = tempModifierIds.reduce((sum, modId) => {
          const mod = MODIFIERS.find(m => m.id === modId);
          return sum + (mod ? mod.price : 0);
        }, 0);

        return {
          ...item,
          modifierIds: tempModifierIds,
          totalPrice: item.basePrice + modifiersPrice
        };
      }
      return item;
    }));
    setIsModalOpen(false);
    setEditingItemId(null);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const total = cart.reduce((acc, item) => acc + item.totalPrice, 0);
    const newOrder = {
      id: Date.now().toString(),
      items: [...cart],
      total,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    const newDailyOrders = [...dailyOrders, newOrder];
    setDailyOrders(newDailyOrders);

    if (typeof window !== 'undefined') {
      localStorage.setItem('dailyOrders', JSON.stringify(newDailyOrders));
    }

    const message = lang === 'en'
      ? `Total: $${total}\nOrder Submitted!`
      : `總金額: $${total}\n\n訂單已送出！`;

    alert(message);
    setCart([]);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  // Helper to get product name for modal
  const editingCartItem = cart.find(i => i.internalId === editingItemId);
  const editingItemName = editingCartItem
    ? (lang === 'en' ? editingCartItem.nameEn || editingCartItem.name : editingCartItem.name)
    : '';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 text-gray-900 font-sans flex-col lg:flex-row">

      <ModifierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={editingItemName}
        selectedModifiers={tempModifierIds}
        onToggleModifier={toggleModifier}
        onConfirm={confirmModifiers}
        lang={lang}
      />

      {/* LEFT: Product Menu (or Dashboard) */}
      <div className={clsx(
        "flex w-full h-[60%] lg:h-full flex-col border-b lg:border-b-0 lg:border-r border-gray-300 bg-white transition-all duration-300",
        viewMode === 'dashboard' ? "lg:w-full" : "lg:w-[70%]"
      )}>

        {/* Category Tabs */}
        <div className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-gray-50 px-4 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Mode Toggle Button (Dashboard vs POS) */}
            <button
              onClick={() => setViewMode(viewMode === 'pos' ? 'dashboard' : 'pos')}
              className={clsx(
                'flex-shrink-0 rounded-full px-6 py-2 text-lg font-bold transition-all border-2 mb-0',
                viewMode === 'dashboard'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'
              )}
            >
              {lang === 'en' ? '📊 Report' : '📊 營收報表'}
            </button>

            <div className="w-px h-8 bg-gray-300 mx-1 flex-shrink-0"></div>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setViewMode('pos'); }}
                className={clsx(
                  'flex-shrink-0 rounded-full px-6 py-2 text-lg font-bold transition-all',
                  viewMode === 'pos' && activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                )}
              >
                {lang === 'en' ? cat.nameEn : cat.name}
              </button>
            ))}
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex flex-shrink-0 items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50 text-gray-700 ml-2"
          >
            <Globe size={16} />
            <span>{lang === 'zh' ? 'English' : '中文'}</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {viewMode === 'dashboard' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {lang === 'en' ? 'Sales Report' : '營收報表'}
                  <span className="text-base font-normal text-gray-500 ml-2">
                    ({reportPeriod === 'day' ? todayStr :
                      reportPeriod === 'month' ? `${today.getFullYear()}/${today.getMonth() + 1}` :
                        reportPeriod === 'quarter' ? `${today.getFullYear()} Q${currentQuarter + 1}` :
                          reportPeriod === 'year' ? today.getFullYear() :
                            `${customStart || '?'} ~ ${customEnd || '?'}`})
                  </span>
                </h2>

                {/* Period Toggles */}
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    {(['day', 'month', 'quarter', 'year', 'custom'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setReportPeriod(p)}
                        className={clsx(
                          "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                          reportPeriod === p ? "bg-purple-100 text-purple-700 shadow-sm" : "text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        {lang === 'en'
                          ? (p === 'day' ? 'Today' : p === 'month' ? 'Month' : p === 'quarter' ? 'Quarter' : p === 'year' ? 'Year' : 'Custom')
                          : (p === 'day' ? '本日' : p === 'month' ? '本月' : p === 'quarter' ? '本季' : p === 'year' ? '本年' : '自選')}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Inputs */}
                  {reportPeriod === 'custom' && (
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-2">
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-purple-500"
                      />
                      <span className="text-gray-400">~</span>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-purple-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <p className="text-gray-500 font-medium mb-1">
                    {lang === 'en'
                      ? (reportPeriod === 'day' ? "Today's Revenue" : reportPeriod === 'month' ? "Monthly Revenue" : reportPeriod === 'quarter' ? "Quarterly Revenue" : reportPeriod === 'year' ? "Yearly Revenue" : "Revenue (Custom)")
                      : (reportPeriod === 'day' ? "本日總營業額" : reportPeriod === 'month' ? "本月總營業額" : reportPeriod === 'quarter' ? "本季總營業額" : reportPeriod === 'year' ? "本年總營業額" : "指定期間總營業額")}
                  </p>
                  <p className="text-4xl font-bold text-blue-600">${totalRevenue}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <p className="text-gray-500 font-medium mb-1">
                    {lang === 'en'
                      ? (reportPeriod === 'day' ? "Today's Orders" : reportPeriod === 'month' ? "Monthly Orders" : reportPeriod === 'quarter' ? "Quarterly Orders" : reportPeriod === 'year' ? "Yearly Orders" : "Orders (Custom)")
                      : (reportPeriod === 'day' ? "本日訂單數" : reportPeriod === 'month' ? "本月訂單數" : reportPeriod === 'quarter' ? "本季訂單數" : reportPeriod === 'year' ? "本年訂單數" : "指定期間訂單數")}
                  </p>
                  <p className="text-4xl font-bold text-gray-800">{totalOrdersCount}</p>
                </div>
              </div>

              {/* Product Breakdown */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                  {lang === 'en' ? 'Product Sales' : '熱銷商品統計'}
                </h3>
                <div className="space-y-3">
                  {Object.keys(productStats).length === 0 ? (
                    <p className="text-gray-400 text-center py-4">{lang === 'en' ? 'No sales yet today.' : '尚無銷售資料'}</p>
                  ) : (
                    Object.entries(productStats)
                      .sort(([, a], [, b]) => b - a)
                      .map(([name, count]) => (
                        <div key={name} className="flex items-center justify-between">
                          <span className="text-gray-700 font-medium">{name}</span>
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">x {count}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Hourly Analysis (Peak Hours) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">
                  {lang === 'en' ? 'Hourly Sales (Peak Times)' : '熱銷時段分析'}
                </h3>

                {Object.keys(hourlyStats).length === 0 ? (
                  <p className="text-gray-400 text-center py-4">{lang === 'en' ? 'No sales yet today.' : '尚無時段資料'}</p>
                ) : (
                  <div className="space-y-6">
                    {/* Chart & Details */}
                    {Object.entries(hourlyStats)
                      .sort(([hourA], [hourB]) => parseInt(hourA) - parseInt(hourB))
                      .map(([hourStr, stats]) => {
                        const hour = parseInt(hourStr);
                        const listTime = `${hour}:00 - ${hour + 1}:00`;
                        const percentage = (stats.revenue / maxHourlyRevenue) * 100;
                        const topProducts = Object.entries(stats.products)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3); // Top 3

                        return (
                          <div key={hour} className="flex flex-col gap-2">
                            {/* Header row */}
                            <div className="flex justify-between items-end">
                              <span className="font-bold text-gray-700 w-32">{listTime}</span>
                              <div className="flex gap-4 text-sm">
                                <span className="text-blue-600 font-bold">${stats.revenue}</span>
                                <span className="text-gray-500">{stats.count} {lang === 'en' ? 'orders' : '單'}</span>
                              </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 overflow-hidden">
                              <div
                                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>

                            {/* Detailed Product Breakdown for this hour */}
                            <div className="pl-2 border-l-2 border-gray-200 ml-1">
                              <div className="flex flex-wrap gap-2 mt-1">
                                {topProducts.map(([pName, pCount]) => (
                                  <span key={pName} className="text-xs bg-orange-50 text-orange-800 px-2 py-0.5 rounded border border-orange-100">
                                    {pName} <span className="font-bold opacity-70">x{pCount}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="text-center pt-8">
                <button
                  onClick={() => {
                    if (confirm(lang === 'en' ? 'Clear all history?' : '確定要清除所有紀錄嗎？')) {
                      setDailyOrders([]);
                      localStorage.removeItem('dailyOrders');
                    }
                  }}
                  className="text-red-500 text-sm hover:underline opacity-60"
                >
                  {lang === 'en' ? 'Reset Data' : '清除所有資料'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile View: Single Grid (Sorted) */}
              <div className="grid grid-cols-2 gap-4 lg:hidden">
                {PRODUCTS
                  .filter((p) => p.category_id === activeCategory)
                  .sort((a, b) => {
                    const typeOrder: Record<string, number> = { meat: 1, seafood: 2, cheese: 3, special: 4, side: 5, addon: 6 };
                    return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
                  })
                  .map((product: any) => (
                    <ProductCard key={product.id} product={product} addToCart={addToCart} lang={lang} />
                  ))}
              </div>

              {/* Desktop View: Separated Rows by Type */}
              <div className="hidden lg:block space-y-8">
                {['meat', 'seafood', 'cheese', 'special', 'side', 'addon'].map((type) => {
                  const items = PRODUCTS.filter(p => p.category_id === activeCategory && p.type === type);
                  if (items.length === 0) return null;

                  return (
                    <div key={type} className="space-y-3">
                      <div className="grid grid-cols-4 gap-4">
                        {items.map((product: any) => (
                          <ProductCard key={product.id} product={product} addToCart={addToCart} lang={lang} />
                        ))}
                      </div>
                      <div className="h-px bg-gray-200 w-full"></div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className={clsx(
        "flex-col bg-gray-50 h-[40%] lg:h-full transition-all duration-300",
        viewMode === 'dashboard' ? "hidden" : "flex w-full lg:w-[30%]"
      )}>
        {/* Cart Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 shadow-sm bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">{t.cartTitle}</h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">
              {cart.length} {t.items}
            </span>
          </div>

          {/* View Toggle */}
          <button
            onClick={() => setIsGroupingEnabled(!isGroupingEnabled)}
            className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {isGroupingEnabled ? <Layers size={16} /> : <List size={16} />}
            <span>{isGroupingEnabled ? t.grouping : t.noGrouping}</span>
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400 opacity-50">
              <span className="text-6xl">🛒</span>
              <p className="mt-4 text-lg">{t.emptyCartTitle}</p>
            </div>
          ) : (
            // RENDER LOGIC
            isGroupingEnabled ? (
              // --- IS GROUPED MODE ---
              uniqueProductIds.map((productId) => {
                const items = groupedCart[productId];
                const firstItem = items[0];
                const count = items.length;
                const isExpanded = expandedGroups.includes(productId);

                // Color map
                let groupColor = 'border-gray-100 hover:border-blue-300';
                let bgColor = 'bg-white';
                if (firstItem.type === 'meat') { groupColor = 'border-red-100 hover:border-red-300 text-red-900'; bgColor = 'bg-red-50'; }
                if (firstItem.type === 'seafood') { groupColor = 'border-blue-100 hover:border-blue-300 text-blue-900'; bgColor = 'bg-blue-50'; }
                if (firstItem.type === 'cheese') { groupColor = 'border-yellow-100 hover:border-yellow-300 text-yellow-900'; bgColor = 'bg-yellow-50'; }
                if (firstItem.type === 'special') { groupColor = 'border-purple-100 hover:border-purple-300 text-purple-900'; bgColor = 'bg-purple-50'; }

                const displayName = lang === 'en' ? (firstItem.nameEn || firstItem.name) : firstItem.name;

                // Single item render (Standard)
                if (count === 1) {
                  const item = firstItem;
                  const product = PRODUCTS.find(p => p.id === item.productId);
                  const isSide = product?.category_id === 'cat_sides';

                  return (
                    <div
                      key={item.internalId}
                      onClick={isSide ? undefined : () => openModifierModal(item)}
                      className={clsx(
                        "group relative flex items-center justify-between rounded-lg p-4 shadow-sm border-2 transition-all",
                        !isSide && "cursor-pointer",
                        bgColor, groupColor
                      )}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-lg font-bold leading-tight truncate">{displayName}</h3>
                        {item.modifierIds.length > 0 && (
                          <p className="text-sm opacity-80 mt-1 truncate">
                            {item.modifierIds.map(mid => {
                              const m = MODIFIERS.find(mod => mod.id === mid);
                              return m ? (lang === 'en' ? (m.nameEn || m.name) : m.name) : null;
                            }).filter(Boolean).join(', ')}
                          </p>
                        )}
                        <p className="text-md font-medium mt-1">${item.totalPrice}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item.internalId); }}
                        className={clsx(
                          "flex-shrink-0 rounded-full p-4 transition-colors",
                          "text-gray-400 hover:text-red-600 hover:bg-black/5 active:bg-red-100"
                        )}
                      >
                        <Trash2 size={28} />
                      </button>
                    </div>
                  );
                }

                // Multiple items render (Group)
                return (
                  <div key={productId} className="rounded-lg shadow-sm overflow-hidden border border-gray-200 bg-white">
                    {/* Group Header */}
                    <div
                      onClick={() => toggleGroup(productId)}
                      className={clsx(
                        "flex cursor-pointer items-center justify-between p-4 transition-colors",
                        bgColor
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? <ChevronDown size={20} className="flex-shrink-0" /> : <ChevronRight size={20} className="flex-shrink-0" />}
                        <h3 className={clsx("text-lg font-bold leading-tight truncate", groupColor.replace('border-', 'text-').split(' ')[0])}>
                          {displayName}
                          <span className="ml-2 rounded-full bg-black/80 px-2 py-0.5 text-sm text-white">x{count}</span>
                        </h3>
                      </div>
                      <div className="text-right pl-2 flex-shrink-0">
                        <p className="font-bold text-gray-700">${items.reduce((sum, i) => sum + i.totalPrice, 0)}</p>
                      </div>
                    </div>

                    {/* Expanded Items */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/50 p-2 space-y-2">
                        {items.map((item, idx) => {
                          const product = PRODUCTS.find(p => p.id === item.productId);
                          const isSide = product?.category_id === 'cat_sides';

                          return (
                            <div
                              key={item.internalId}
                              onClick={isSide ? undefined : () => openModifierModal(item)}
                              className={clsx(
                                "flex items-center justify-between rounded-md bg-white p-3 shadow-sm border border-gray-100 ml-4",
                                !isSide && "cursor-pointer hover:border-blue-300"
                              )}
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <span className={clsx("font-serif font-bold opacity-50 w-8 text-center flex-shrink-0", groupColor.replace('border-', 'text-').split(' ')[0])}>{toRoman(idx + 1)}.</span>
                                  <span className="text-gray-700 font-medium">{t.customization} ({item.modifierIds.length})</span>
                                </div>
                                {item.modifierIds.length > 0 ? (
                                  <p className="text-sm text-blue-600 mt-1 truncate">
                                    {item.modifierIds.map(mid => {
                                      const m = MODIFIERS.find(mod => mod.id === mid);
                                      return m ? (lang === 'en' ? (m.nameEn || m.name) : m.name) : '';
                                    }).join(', ')}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 mt-1">{t.noNotes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className="text-sm font-medium">${item.totalPrice}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); removeFromCart(item.internalId); }}
                                  className="rounded-full p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={24} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // --- NOT GROUPED MODE (FLAT LIST) ---
              cart.map((item) => {
                // Color map
                let cartItemColor = 'bg-white border-gray-100 hover:border-blue-300';
                if (item.type === 'meat') cartItemColor = 'bg-red-50 border-red-100 hover:border-red-300 text-red-900';
                if (item.type === 'seafood') cartItemColor = 'bg-blue-50 border-blue-100 hover:border-blue-300 text-blue-900';
                if (item.type === 'cheese') cartItemColor = 'bg-yellow-50 border-yellow-100 hover:border-yellow-300 text-yellow-900';
                if (item.type === 'special') cartItemColor = 'bg-purple-50 border-purple-100 hover:border-purple-300 text-purple-900';

                // Logic for numbering (#I, #II) same as flat approach
                const sameProductItems = cart.filter(c => c.productId === item.productId);
                const myIndex = sameProductItems.findIndex(c => c.internalId === item.internalId);
                const showIndex = sameProductItems.length > 1;

                const displayName = lang === 'en' ? (item.nameEn || item.name) : item.name;

                return (
                  <div
                    key={item.internalId}
                    onClick={() => openModifierModal(item)}
                    className={clsx(
                      "group relative flex cursor-pointer items-center justify-between rounded-lg p-4 shadow-sm border-2 transition-all",
                      cartItemColor
                    )}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-lg font-bold flex items-center leading-tight">
                        <span className="truncate">{displayName}</span>
                        {showIndex && (
                          <span className="ml-2 flex-shrink-0 rounded-md bg-black/5 px-2 py-0.5 text-sm font-bold opacity-80 font-serif">
                            {toRoman(myIndex + 1)}
                          </span>
                        )}
                      </h3>
                      {item.modifierIds.length > 0 && (
                        <p className="text-sm opacity-80 mt-1 truncate">
                          {item.modifierIds.map(mid => {
                            const m = MODIFIERS.find(mod => mod.id === mid);
                            return m ? (lang === 'en' ? (m.nameEn || m.name) : m.name) : null;
                          }).filter(Boolean).join(', ')}
                        </p>
                      )}
                      <p className="text-md font-medium mt-1">${item.totalPrice}</p>
                    </div>
                    {/* Actions */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.internalId);
                      }}
                      className={clsx(
                        "flex-shrink-0 rounded-full p-4 transition-colors",
                        "text-gray-400 hover:text-red-600 hover:bg-black/5 active:bg-red-100"
                      )}
                    >
                      <Trash2 size={28} />
                    </button>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Cart Footer / Checkout */}
        <div className="border-t border-gray-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-shrink-0 flex items-center gap-3">
          <div className="flex flex-col items-start w-24 flex-shrink-0">
            <span className="text-sm text-gray-500 font-medium">{t.total}</span>
            <span className="text-2xl font-bold text-blue-600 truncate w-full">${cartTotal}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="flex-1 rounded-xl bg-blue-600 py-3 text-xl font-bold text-white shadow-lg transition-all hover:bg-blue-700 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={cart.length === 0}
          >
            {t.checkout}
          </button>
        </div>
      </div>
    </div>
  );
}
