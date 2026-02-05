"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token
            Cookies.set('token', data.access_token, { expires: 1 }); // 1 day
            Cookies.set('uid', data.uid || 'admin_01', { expires: 1 });

            // Check if user must change password
            if (data.must_change_password) {
                router.push('/force-change-password');
            } else {
                router.push('/manage/control-center');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
            {/* Theme Toggle in Login Page */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none opacity-50" />

            <div className="w-full max-w-md glass-card p-8 rounded-[32px] border border-glass-border bg-glass relative z-10 shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-block p-3 rounded-2xl bg-primary/10 text-primary mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-black mb-2 tracking-tight">ยินดีต้อนรับกลับมา</h1>
                    <p className="text-foreground/60">เข้าสู่ระบบเพื่อจัดการนามบัตรดิจิทัลของคุณ</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">อีเมล</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full bg-foreground/5 border border-glass-border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/20"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">รหัสผ่าน</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-foreground/5 border border-glass-border rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/20"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'กำลังเข้าสู่ระบบ...' : <>เข้าสู่ระบบ <ArrowRight size={20} /></>}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-4">
                    <Link href="/forgot-password" intermediate-link="true" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors inline-block">
                        ลืมรหัสผ่านใช่หรือไม่?
                    </Link>
                    <div className="h-px bg-glass-border w-1/2 mx-auto" />
                    <p className="text-foreground/40 text-sm">
                        ยังไม่มีบัญชี? <a href="#" className="text-primary hover:text-primary/80 font-bold transition-colors">ติดต่อฝ่ายขาย</a>
                    </p>
                </div>
            </div>
            
            <footer className="mt-12 text-foreground/20 text-xs text-center">
                © {new Date().getFullYear()} NAMECARD.AI All rights reserved.
            </footer>
        </div>
    );
}
