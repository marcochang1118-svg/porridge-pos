'use client';

import { X, Banknote } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onConfirm: (method: 'cash' | 'linepay') => void;
    lang: 'zh' | 'en';
}

export default function CheckoutModal({ isOpen, onClose, total, onConfirm, lang }: CheckoutModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div
                ref={dialogRef}
                className="w-full max-w-sm rounded-[32px] bg-white dark:bg-zinc-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transform transition-all scale-100 animate-in zoom-in-95 duration-200 overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 p-5 bg-gray-50/50 dark:bg-zinc-800/50">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lang === 'en' ? 'Select Payment' : '選擇付款方式'}</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-200/80 dark:hover:bg-zinc-700 transition-colors">
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="text-center mb-10">
                        <p className="text-gray-500 dark:text-gray-400 font-semibold mb-2 tracking-wide uppercase text-xs">{lang === 'en' ? 'Total Amount' : '應收金額'}</p>
                        <p className="text-5xl font-black text-blue-600 tracking-tight">${total}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onConfirm('cash')}
                            className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-amber-500 p-6 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 hover:shadow-amber-500/40 transition-all active:scale-95 border-2 border-transparent"
                        >
                            <div className="relative w-[66px] h-[66px] flex items-center justify-center">
                                <img
                                    src="/flat_dollar_coin.png"
                                    alt="Cash"
                                    className="w-[62px] h-[62px] object-contain drop-shadow-sm brightness-110 contrast-125"
                                />
                            </div>
                            <span className="font-bold text-lg">{lang === 'en' ? 'Cash' : '現金'}</span>
                        </button>

                        <button
                            onClick={() => onConfirm('linepay')}
                            className="group flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#06C755] p-6 text-white shadow-lg shadow-[#06C755]/20 hover:bg-[#05B64D] hover:shadow-[#06C755]/40 transition-all active:scale-95 border-2 border-transparent"
                        >
                            <div className="relative w-14 h-14 flex items-center justify-center">
                                {/* Real "Brown" Bear Image */}
                                <img
                                    src="/line_bear_custom.png"
                                    alt="LINE Pay Brown"
                                    className="w-12 h-12 object-contain drop-shadow-md"
                                />
                            </div>
                            <span className="font-bold text-lg">LINE Pay</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
