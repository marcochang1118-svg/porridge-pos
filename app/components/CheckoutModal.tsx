'use client';

import { X, DollarSign, Smartphone } from 'lucide-react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div
                ref={dialogRef}
                className="w-full max-w-sm rounded-2xl bg-white shadow-xl transform transition-all scale-100 animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-xl font-bold text-gray-800">{lang === 'en' ? 'Select Payment' : '選擇付款方式'}</h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-8">
                        <p className="text-gray-500 font-medium mb-1">{lang === 'en' ? 'Total Amount' : '應收金額'}</p>
                        <p className="text-4xl font-extrabold text-blue-600">${total}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onConfirm('cash')}
                            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-green-100 bg-green-50 p-6 text-green-700 hover:bg-green-100 hover:border-green-300 transition-all active:scale-95"
                        >
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <DollarSign size={32} className="text-green-600" />
                            </div>
                            <span className="font-bold text-lg">{lang === 'en' ? 'Cash' : '現金'}</span>
                        </button>

                        <button
                            onClick={() => onConfirm('linepay')}
                            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-green-100 bg-[#06C755]/10 p-6 text-[#06C755] hover:bg-[#06C755]/20 hover:border-[#06C755]/50 transition-all active:scale-95"
                        >
                            <div className="p-3 bg-white rounded-full shadow-sm">
                                <Smartphone size={32} />
                            </div>
                            <span className="font-bold text-lg">LINE Pay</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
