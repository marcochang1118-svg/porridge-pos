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
    selectedModifiers: string[]; // List of modifier IDs
    onToggleModifier: (modId: string) => void;
    onConfirm: () => void;
    lang?: 'zh' | 'en'; // Default to 'zh' if not provided
};

export default function ModifierModal({
    isOpen,
    onClose,
    productName,
    selectedModifiers,
    onToggleModifier,
    onConfirm,
    lang = 'zh',
}: ModifierModalProps) {
    if (!isOpen) return null;

    const t = MODAL_TEXT[lang];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{productName}</h2>
                        <p className="text-lg text-gray-500">{t.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-gray-100 p-3 text-gray-500 transition-colors hover:bg-gray-200"
                    >
                        <X size={32} />
                    </button>
                </div>

                {/* Modifiers Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-4">
                        {MODIFIERS.map((mod: any) => {
                            const isSelected = selectedModifiers.includes(mod.id);
                            const displayName = lang === 'en' ? (mod.nameEn || mod.name) : mod.name;

                            return (
                                <button
                                    key={mod.id}
                                    onClick={() => onToggleModifier(mod.id)}
                                    className={clsx(
                                        'flex items-center justify-between rounded-xl border-2 p-6 transition-all',
                                        isSelected
                                            ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-600/20'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                                    )}
                                >
                                    <span className="text-2xl font-bold">{displayName}</span>
                                    <span className={clsx("text-xl font-medium", isSelected ? "text-blue-600" : "text-gray-500")}>
                                        {mod.price > 0 ? `+$${mod.price}` : t.free}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 bg-gray-50 p-6">
                    <button
                        onClick={onConfirm}
                        className="w-full rounded-xl bg-blue-600 py-4 text-3xl font-bold text-white shadow-lg transition-transform active:scale-95 hover:bg-blue-700"
                    >
                        {t.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
}
