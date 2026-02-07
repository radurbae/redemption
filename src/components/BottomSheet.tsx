'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Latar belakang */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel bawah */}
            <div
                ref={sheetRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl sheet-enter md:hidden"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
                {/* Pegangan */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {title && (
                    <div className="px-6 pb-2">
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    </div>
                )}

                <div className="px-6 pb-6">
                    {children}
                </div>
            </div>

            {/* Di desktop: modal di tengah */}
            <div className="hidden md:flex items-center justify-center absolute inset-0 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm pointer-events-auto animate-scale-in"
                    role="dialog"
                    aria-modal="true"
                >
                    {title && (
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 -m-2 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
}
