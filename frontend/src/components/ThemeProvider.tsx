"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'pastel' | 'midnight';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // กำหนดค่าเริ่มต้นเป็น 'light' ทันที
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        const initialTheme = savedTheme || 'light';
        
        setThemeState(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
        setMounted(true);
    }, []);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div className="transition-colors duration-500 min-h-screen bg-background text-foreground">
                {children}
            </div>
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
