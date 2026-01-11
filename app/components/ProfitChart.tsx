'use client';

import { useMemo } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

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

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px] w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                {lang === 'en' ? 'Profit Trend' : '營收與成本趨勢圖'}
            </h3>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend iconType="circle" />

                    <Bar dataKey="revenue" name={lang === 'en' ? 'Revenue' : '營收'} barSize={20} fill="#60A5FA" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cost" name={lang === 'en' ? 'Cost' : '成本'} barSize={20} fill="#F87171" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="profit" name={lang === 'en' ? 'Net Profit' : '實際淨利'} stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
