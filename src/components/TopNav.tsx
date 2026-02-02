'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', label: 'Today' },
    { href: '/tracker', label: 'Tracker' },
    { href: '/new', label: 'New Habit' },
    { href: '/account', label: 'Account' },
];

export default function TopNav() {
    const pathname = usePathname();

    return (
        <header
            className="hidden md:block fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-40"
        >
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="font-bold text-lg text-gray-900">
                    1% Better
                </Link>

                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                                        ? 'text-indigo-600 bg-indigo-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }
                `}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
