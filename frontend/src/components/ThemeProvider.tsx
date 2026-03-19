"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'pastel' | 'midnight' | 'brand-cog';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const variant = process.env.NEXT_PUBLIC_THEME_VARIANT;
const defaultTheme: Theme = variant === 'cyan-orange-green' ? 'brand-cog' : 'light';
const supportedThemes: Theme[] = variant === 'cyan-orange-green'
    ? ['dark', 'light', 'pastel', 'midnight', 'brand-cog']
    : ['dark', 'light', 'pastel', 'midnight'];

const normalizeTheme = (value: string | null): Theme => {
    if (!value) return defaultTheme;
    return (supportedThemes as string[]).includes(value) ? (value as Theme) : defaultTheme;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') return defaultTheme;
        return normalizeTheme(window.localStorage.getItem('theme'));
    });

    useEffect(() => {
        // Run once on mount
        document.documentElement.setAttribute('data-theme', theme);

        // Listen for storage events (cross-tab sync)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'theme') {
                const newTheme = normalizeTheme(e.newValue);
                setThemeState(newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        const safeTheme = normalizeTheme(newTheme);
        setThemeState(safeTheme);
        localStorage.setItem('theme', safeTheme);
        document.documentElement.setAttribute('data-theme', safeTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
