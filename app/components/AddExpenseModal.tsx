'use client';

import { X, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { currentInventoryList, currentInventoryListEn, EXPENSE_ITEMS, EXPENSE_ITEMS_EN } from '@/lib/mockData';

type AddExpenseModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { type: 'cogs' | 'opex', name: string, amount: number }) => void;
    defaultType?: 'cogs' | 'opex';
    initialData?: { name: string, amount: number };
    lockType?: boolean;
    lang?: 'zh' | 'en';
};

export default function AddExpenseModal({
    isOpen,
    onClose,
    onConfirm,
    defaultType = 'cogs',
    initialData,
    lockType = false,
    lang = 'zh',
}: AddExpenseModalProps) {
    if (!isOpen) return null;

    const [type, setType] = useState<'cogs' | 'opex'>(defaultType);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);

    const activeList = type === 'cogs'
        ? (lang === 'en' ? currentInventoryListEn : currentInventoryList)
        : (lang === 'en' ? EXPENSE_ITEMS_EN : EXPENSE_ITEMS);

    // Update internal state when opening
    useEffect(() => {
        if (isOpen) {
            setType(defaultType);
            if (initialData) {
                setName(initialData.name);
                setAmount(initialData.amount.toString());
            } else {
                setName('');
                setAmount('');
            }
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [isOpen, defaultType, initialData]);

    // Handle Search Logic
    useEffect(() => {
        if (name) {
            const filtered = activeList.filter(item =>
                item.toLowerCase().includes(name.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            // Show full list on empty focus
            setSuggestions(activeList);
        }
    }, [name, type]);

    // Click outside to close suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSubmit = () => {
        const value = parseInt(amount);
        if (!name || isNaN(value) || value <= 0) {
            alert(lang === 'en' ? 'Please enter valid name and amount' : '請輸入正確的名稱與金額');
            return;
        }
        onConfirm({ type, name, amount: value });
        // Reset and close
        setName('');
        setAmount('');
        onClose();
    };

    const t = {
        title: lang === 'en' ? 'Quick Expense Entry' : '快速記帳',
        typeLabel: lang === 'en' ? 'Type' : '類型',
        cogs: lang === 'en' ? 'Purchase (COGS)' : '進貨成本 (食材/包材)',
        opex: lang === 'en' ? 'Expense (OpEx)' : '營業費用 (租金/水電/人事)',
        nameLabel: lang === 'en' ? 'Description' : '項目名稱',
        namePlaceholder: lang === 'en' ? 'e.g. Pork, Rice, Utils' : '例如：豬肉 5斤、換燈泡',
        amountLabel: lang === 'en' ? 'Amount ($)' : '金額 ($)',
        confirm: lang === 'en' ? 'Confirm' : '確認新增',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 p-4 bg-gray-50 dark:bg-zinc-900">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        💰 {t.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-white dark:bg-zinc-800 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 shadow-sm"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Type Toggle - Hidden if Locked */}
                    {!lockType && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.typeLabel}</label>
                            <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setType('cogs')}
                                    className={`py-2 rounded-md text-sm font-bold transition-all ${type === 'cogs' ? 'bg-white dark:bg-zinc-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    {t.cogs}
                                </button>
                                <button
                                    onClick={() => setType('opex')}
                                    className={`py-2 rounded-md text-sm font-bold transition-all ${type === 'opex' ? 'bg-white dark:bg-zinc-700 text-yellow-600 dark:text-yellow-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                >
                                    {t.opex}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Name Input with Suggestions */}
                    <div ref={wrapperRef} className="relative">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.nameLabel}</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    setSuggestions(activeList);
                                    setShowSuggestions(true);
                                }}
                                placeholder={t.namePlaceholder}
                                className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
                                autoComplete="off" // Disable browser history
                            />
                            <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                {suggestions.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent bubble up
                                            e.preventDefault(); // Prevent default
                                            setName(item);
                                            setShowSuggestions(false);
                                            // Focus amount input next tick
                                            setTimeout(() => amountInputRef.current?.focus(), 0);
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-50 dark:border-zinc-700 last:border-0 text-gray-700 dark:text-gray-300 font-medium"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.amountLabel}</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-500 font-bold">$</span>
                            <input
                                ref={amountInputRef}
                                type="number"
                                inputMode="numeric"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-xl pl-9 pr-4 py-3 text-2xl font-bold text-gray-800 dark:text-white bg-white dark:bg-zinc-800 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                    <button
                        onClick={handleSubmit}
                        className="w-full rounded-xl bg-blue-600 py-3 text-xl font-bold text-white shadow-lg transition-transform active:scale-95 hover:bg-blue-700"
                    >
                        {t.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
}
