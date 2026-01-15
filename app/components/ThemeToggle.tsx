'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" />; // Placeholder
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={clsx(
                "p-2 rounded-full transition-all duration-300",
                theme === 'dark'
                    ? "bg-zinc-800 text-yellow-400 hover:bg-zinc-700 hover:text-yellow-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-orange-500"
            )}
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
