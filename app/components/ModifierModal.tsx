'use client';

import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { MODIFIERS } from '@/lib/mockData';

// Translations
const MODAL_TEXT = {
    zh: {
        subtitle: '請選擇客製化項目',
        free: '免費',
        confirm: '確認',
    },
    en: {
        subtitle: 'Select customizations',
        free: 'Free',
        confirm: 'Confirm',
    }
};

type ModifierModalProps = {
    isOpen: boolean;
    onClose: () => void;
    productName: string;
    basePrice: number;
    selectedModifiers: string[]; // List of modifier IDs
    onToggleModifier: (modId: string) => void;
    onConfirm: () => void;
    lang?: 'zh' | 'en'; // Default to 'zh' if not provided
    productId?: string;
};

export default function ModifierModal({
    isOpen,
    onClose,
    productName,
    basePrice,
    selectedModifiers,
    onToggleModifier,
    onConfirm,
    lang = 'zh',
    productId,
}: ModifierModalProps) {
    if (!isOpen) return null;

    const t = MODAL_TEXT[lang];

    // Calculate Total Price
    const modifiersTotal = selectedModifiers.reduce((sum, modId) => {
        const mod = MODIFIERS.find((m: any) => m.id === modId);
        return sum + (mod ? mod.price : 0);
    }, 0);

    // Dynamic Discount Logic: 2nd item onwards gets -$5
    // Filter selected modifiers to only add-ons to establish "order"
    const selectedAddons = selectedModifiers.filter(id => {
        const m = MODIFIERS.find((mod: any) => mod.id === id);
        return m?.category === 'addon';
    });

    // Calculate total discount: (Count - 1) * 5, min 0
    const volumeDiscount = Math.max(0, (selectedAddons.length - 1) * 5);

    const totalPrice = basePrice + modifiersTotal - volumeDiscount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                {/* ... (Header) ... */}

                {/* Modifiers Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>🛠️ {lang === 'en' ? 'Customizations & Add-ons' : '客製化與加購'}</span>
                            <span className="text-sm font-normal text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                                {lang === 'en' ? '2nd Add-on -$5' : '加購第二件折$5'}
                            </span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {MODIFIERS
                                .sort((a: any, b: any) => {
                                    // 1. Separate by Category (Option vs Addon)
                                    if (a.category !== 'addon' && b.category === 'addon') return -1;
                                    if (a.category === 'addon' && b.category !== 'addon') return 1;

                                    // 2. Free items first within category
                                    if (a.price === 0 && b.price !== 0) return -1;
                                    if (a.price !== 0 && b.price === 0) return 1;

                                    // 3. Price Low to High
                                    return a.price - b.price;
                                })
                                .map((mod: any) => {
                                    const isSelected = selectedModifiers.includes(mod.id);
                                    const isAddon = mod.category === 'addon';
                                    const displayName = lang === 'en' ? (mod.nameEn || mod.name) : mod.name;

                                    return (
                                        <button
                                            key={mod.id}
                                            onClick={() => onToggleModifier(mod.id)}
                                            className={clsx(
                                                'flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all min-h-[100px] gap-1',
                                                isSelected
                                                    ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-600/20'
                                                    : isAddon
                                                        ? 'border-green-200 bg-white text-gray-700 hover:border-green-400'
                                                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                                            )}
                                        >
                                            <span className="text-xl font-bold text-center leading-tight">
                                                {displayName}
                                            </span>
                                            <span className={clsx("text-lg font-medium", isSelected ? "text-blue-600" : (isAddon ? "text-green-600" : "text-gray-500"))}>
                                                {mod.price > 0 ? `+$${mod.price}` : t.free}
                                            </span>
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-gray-50 p-6 flex items-center justify-between gap-6">
                    <div className="flex flex-col w-32 flex-shrink-0">
                        <span className="text-sm font-medium text-gray-500">
                            {lang === 'en' ? 'Total' : '總金額'}
                        </span>
                        <span className="text-3xl font-bold text-blue-600">
                            ${totalPrice}
                        </span>
                    </div>
                    <button
                        onClick={onConfirm}
                        className="flex-1 rounded-xl bg-blue-600 py-4 text-3xl font-bold text-white shadow-lg transition-transform active:scale-95 hover:bg-blue-700"
                    >
                        {t.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
}
