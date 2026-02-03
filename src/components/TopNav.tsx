'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navItems = [
    { href: '/', label: 'To Do' },
    { href: '/quests', label: 'Quests' },
    { href: '/tracker', label: 'Tracker' },
    { href: '/inventory', label: 'Inventory' },
    { href: '/profile', label: 'Profile' },
];

export default function TopNav() {
    const pathname = usePathname();

    return (
        <header
            className="hidden md:block fixed top-0 left-0 right-0 backdrop-blur-lg border-b z-40"
            style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
            }}
        >
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-lg"
                    style={{ color: 'var(--foreground)' }}
                >
                    <span className="text-xl">⚔️</span>
                    <span>1% Better</span>
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
                                        ? 'text-indigo-400 bg-indigo-500/10'
                                        : ''
                                    }
                `}
                                style={!isActive ? { color: 'var(--foreground-muted)' } : undefined}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                    <div className="ml-2 flex items-center gap-2">
                        <ThemeToggle />
                        <Link
                            href="/new"
                            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            New
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}
