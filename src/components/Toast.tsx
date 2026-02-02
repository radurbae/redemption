'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Start exit animation after delay
        setTimeout(() => {
            setExitingIds(prev => new Set(prev).add(id));
            // Remove from DOM after animation
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
                setExitingIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }, 200);
        }, 2500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none md:bottom-8">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
              pointer-events-auto px-5 py-3 rounded-full shadow-lg font-medium text-sm
              ${exitingIds.has(toast.id) ? 'toast-exit' : 'toast-enter'}
              ${toast.type === 'success' ? 'bg-gray-900 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-600 text-white' : ''}
              ${toast.type === 'info' ? 'bg-indigo-600 text-white' : ''}
            `}
                    >
                        <div className="flex items-center gap-2">
                            {toast.type === 'success' && (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                            {toast.message}
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
