"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Moon, Sun, Sparkles, Cloud, Check } from "lucide-react";
import { useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'light', name: 'Apple Light', icon: <Sun size={16} />, color: 'bg-[#fbfbfd]' },
        { id: 'dark', name: 'Dark Mode', icon: <Moon size={16} />, color: 'bg-[#050505]' },
        { id: 'pastel', name: 'Kids Pastel', icon: <Cloud size={16} />, color: 'bg-[#fff9f2]' },
        { id: 'midnight', name: 'Midnight Berry', icon: <Sparkles size={16} />, color: 'bg-[#0f172a]' },
    ] as const;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-all border border-foreground/5 hover:border-foreground/10"
                title="สลับธีมสี"
            >
                <span className="text-foreground/70 group-hover:text-foreground transition-colors transform group-hover:scale-110 duration-300">
                    {themes.find(t => t.id === theme)?.icon || <Sun size={16} />}
                </span>
                <span className="text-xs font-medium text-foreground/70 group-hover:text-foreground hidden md:inline">
                    {themes.find(t => t.id === theme)?.name || 'Apple Light'}
                </span>
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-52 bg-card-bg backdrop-blur-2xl border border-glass-border rounded-[24px] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-2 space-y-1">
                            <div className="px-3 py-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                                เลือกโทนสีที่ชอบ
                            </div>
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setTheme(t.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                                        theme === t.id 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'hover:bg-foreground/5 text-foreground/70 hover:text-foreground'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.color} border border-foreground/10 shadow-sm`}>
                                            <span className={theme === t.id ? 'text-primary' : 'text-foreground/60'}>
                                                {t.icon}
                                            </span>
                                        </div>
                                        <span className={theme === t.id ? 'font-bold' : 'font-medium'}>{t.name}</span>
                                    </div>
                                    {theme === t.id && <Check size={16} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
