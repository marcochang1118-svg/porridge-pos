'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

type AddExpenseModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { type: 'cogs' | 'opex', name: string, amount: number }) => void;
    defaultType?: 'cogs' | 'opex'; // 'cogs' = 進貨(Cost of Goods), 'opex' = 費用(Operating Expense)
    lang?: 'zh' | 'en';
};

export default function AddExpenseModal({
    isOpen,
    onClose,
    onConfirm,
    defaultType = 'cogs',
    lang = 'zh',
}: AddExpenseModalProps) {
    if (!isOpen) return null;

    const [type, setType] = useState<'cogs' | 'opex'>(defaultType);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

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
            <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-4 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        💰 {t.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-white p-2 text-gray-500 hover:bg-gray-100 shadow-sm"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {/* Type Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.typeLabel}</label>
                        <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setType('cogs')}
                                className={`py-2 rounded-md text-sm font-bold transition-all ${type === 'cogs' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t.cogs}
                            </button>
                            <button
                                onClick={() => setType('opex')}
                                className={`py-2 rounded-md text-sm font-bold transition-all ${type === 'opex' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {t.opex}
                            </button>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.nameLabel}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.namePlaceholder}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
                        />
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.amountLabel}</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-gray-800 focus:border-blue-500 focus:ring-blue-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
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
