'use client';

import { useMemo, useState, useEffect } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { useTheme } from './ThemeProvider';

type CartItem = {
    totalPrice: number;
};

type Order = {
    items: CartItem[];
    total: number;
    timestamp: number;
};

type Expense = {
    amount: number;
    type: string;
    timestamp: number;
};

interface ProfitChartProps {
    orders: Order[];
    expenses: Expense[];
    startDate: Date;
    endDate: Date;
    period: 'day' | 'month' | 'quarter' | 'year' | 'custom';
    lang: 'zh' | 'en';
}

export default function ProfitChart({ orders, expenses, startDate, endDate, period, lang }: ProfitChartProps) {
    const { theme } = useTheme();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (theme === 'system') {
            const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(systemIsDark);
        } else {
            setIsDark(theme === 'dark');
        }
    }, [theme]);

    // 1. Process Data into Buckets
    const chartData = useMemo(() => {
        const data: any[] = [];
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Determine resolution
        let resolution: 'hour' | 'day' | 'month' = 'day';
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (period === 'day' || (period === 'custom' && diffDays <= 1)) {
            resolution = 'hour';
        } else if (period === 'year' || (period === 'custom' && diffDays > 60)) {
            resolution = 'month'; // Show months for year view or long custom ranges
        } else {
            resolution = 'day'; // Default for Month/Quarter/Mid-range
        }

        // Generate buckets
        const buckets = new Map();
        const current = new Date(start);

        // Adjust start to beginning of unit
        if (resolution === 'hour') current.setMinutes(0, 0, 0);
        if (resolution === 'day') current.setHours(0, 0, 0, 0);
        if (resolution === 'month') current.setDate(1);

        while (current <= end) {
            let key = '';
            let label = '';

            if (resolution === 'hour') {
                key = current.toISOString().slice(0, 13); // YYYY-MM-DDTHH
                label = current.getHours() + ':00';
                current.setHours(current.getHours() + 1);
            } else if (resolution === 'day') {
                key = current.toISOString().slice(0, 10); // YYYY-MM-DD
                label = `${current.getMonth() + 1}/${current.getDate()}`;
                current.setDate(current.getDate() + 1);
            } else {
                key = current.toISOString().slice(0, 7); // YYYY-MM
                label = `${current.getMonth() + 1}月`;
                current.setMonth(current.getMonth() + 1);
            }

            buckets.set(key, { name: label, revenue: 0, cost: 0, profit: 0, fullDate: key });
        }

        // Aggregate Orders (Revenue)
        orders.forEach(order => {
            let d: Date;
            if (typeof order.timestamp === 'number') {
                d = new Date(order.timestamp);
            } else if (typeof order.timestamp === 'string') {
                const parsed = Date.parse(order.timestamp);
                d = isNaN(parsed) ? new Date() : new Date(parsed);
            } else {
                d = new Date();
            }

            if (isNaN(d.getTime())) {
                d = new Date();
            }

            let key = '';
            if (resolution === 'hour') key = d.toISOString().slice(0, 13);
            else if (resolution === 'day') key = d.toISOString().slice(0, 10);
            else key = d.toISOString().slice(0, 7);

            if (buckets.has(key)) {
                const b = buckets.get(key);
                b.revenue += order.total;
                // Profit initally = revenue, minus cost later
                b.profit += order.total;
                buckets.set(key, b);
            }
        });

        // Aggregate Expenses (Cost)
        expenses.forEach(exp => {
            let d: Date;
            if (typeof exp.timestamp === 'number') {
                d = new Date(exp.timestamp);
            } else if (typeof exp.timestamp === 'string') {
                const parsed = Date.parse(exp.timestamp);
                d = isNaN(parsed) ? new Date() : new Date(parsed);
            } else {
                d = new Date();
            }

            if (isNaN(d.getTime())) {
                d = new Date();
            }

            let key = '';
            if (resolution === 'hour') key = d.toISOString().slice(0, 13);
            else if (resolution === 'day') key = d.toISOString().slice(0, 10);
            else key = d.toISOString().slice(0, 7);

            if (buckets.has(key)) {
                const b = buckets.get(key);
                b.cost += exp.amount;
                b.profit -= exp.amount; // Profit = Rev - Cost
                buckets.set(key, b);
            }
        });

        return Array.from(buckets.values());
    }, [orders, expenses, startDate, endDate, period]);

    const colors = {
        text: isDark ? '#E5E7EB' : '#374151', // gray-200 : gray-700
        grid: isDark ? '#374151' : '#E5E7EB', // gray-700 : gray-200
        revenue: '#60A5FA', // blue-400
        cost: '#F87171', // red-400
        profit: '#10B981', // emerald-500
        tooltipBg: isDark ? '#18181B' : '#FFFFFF', // zinc-900 : white
        tooltipText: isDark ? '#FFFFFF' : '#000000',
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 h-[400px] w-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {lang === 'en' ? 'Profit Trend' : '營收與成本趨勢圖'}
                </h3>
                {/* Custom HTML Legend for perfect alignment and visibility */}
                <div className="flex items-center gap-4 text-xs md:text-sm">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-gray-600 dark:text-gray-400">{lang === 'en' ? 'Net Profit' : '實際淨利'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-t-sm" style={{ backgroundColor: '#F87171' }}></span>
                        <span className="text-gray-600 dark:text-gray-400">{lang === 'en' ? 'Cost' : '成本'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-t-sm" style={{ backgroundColor: '#60A5FA' }}></span>
                        <span className="text-gray-600 dark:text-gray-400">{lang === 'en' ? 'Revenue' : '營收'}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: colors.text, fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: colors.text, fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                backgroundColor: colors.tooltipBg,
                                color: colors.tooltipText
                            }}
                        />

                        <Bar dataKey="revenue" name={lang === 'en' ? 'Revenue' : '營收'} barSize={20} fill={colors.revenue} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cost" name={lang === 'en' ? 'Cost' : '成本'} barSize={20} fill={colors.cost} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="profit" name={lang === 'en' ? 'Net Profit' : '實際淨利'} stroke={colors.profit} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
