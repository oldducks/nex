"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEmbed = searchParams.get('embed') === '1';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        // Check for OAuth error
        const oauthError = searchParams.get('error');
        if (oauthError) {
            setError('การเข้าสู่ระบบผ่านโซเชียลล้มเหลว กรุณาลองใหม่');
        }

        // Check if already logged in
        const token = Cookies.get('token');
        if (token) {
            router.push('/manage/control-center');
        }
    }, [searchParams, router]);

    useEffect(() => {
        if (!isEmbed) return;

        const htmlEl = document.documentElement;
        const bodyEl = document.body;
        const ambientEl = document.querySelector('.ambient-light') as HTMLElement | null;

        const prevHtmlBg = htmlEl.style.background;
        const prevBodyBg = bodyEl.style.background;
        const prevAmbientDisplay = ambientEl?.style.display;

        htmlEl.style.background = 'transparent';
        bodyEl.style.background = 'transparent';
        if (ambientEl) ambientEl.style.display = 'none';

        return () => {
            htmlEl.style.background = prevHtmlBg;
            bodyEl.style.background = prevBodyBg;
            if (ambientEl) ambientEl.style.display = prevAmbientDisplay || '';
        };
    }, [isEmbed]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
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

    const handleSocialLogin = (provider: 'google' | 'facebook' | 'line') => {
        window.location.href = `${API_URL}/auth/${provider}`;
    };

    const handleClose = () => {
        if (isEmbed) {
            window.parent?.postMessage({ type: 'NEX_LOGIN_CLOSE' }, '*');
            return;
        }
        if (window.history.length > 1) {
            router.back();
            return;
        }
        router.push('/');
    };

    return (
        <div className={`${isEmbed ? 'min-h-0 p-3 bg-transparent' : 'min-h-screen p-6'} text-[#f6f2ea] flex flex-col items-center justify-center relative overflow-hidden bg-[#030818] transition-colors duration-500`}>
            {!isEmbed && (
                <>
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,214,142,0.24),transparent_38%),radial-gradient(circle_at_86%_16%,rgba(122,88,255,0.22),transparent_40%),radial-gradient(circle_at_50%_95%,rgba(246,187,95,0.14),transparent_44%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(3,8,24,0.98)_0%,rgba(9,17,42,0.95)_45%,rgba(6,12,32,0.98)_100%)]" />
                    </div>
                    <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-amber-300/15 blur-[90px]" />
                    <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-violet-300/20 blur-[95px]" />
                </>
            )}

            <div className={`w-full max-w-md rounded-[32px] border border-amber-100/30 bg-[linear-gradient(180deg,rgba(24,14,36,0.97)_0%,rgba(15,10,28,0.97)_100%)] p-8 relative z-10 shadow-[0_30px_90px_rgba(0,0,0,0.68)] ${isEmbed ? 'my-2' : ''}`}>
                {!isEmbed && (
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="ปิดหน้าล็อกอิน"
                        title="ปิด"
                        className="absolute top-4 right-4 h-9 w-9 rounded-full border border-amber-100/25 bg-white/5 hover:bg-white/10 text-amber-100/70 hover:text-amber-50 transition-colors flex items-center justify-center"
                    >
                        <X size={18} />
                    </button>
                )}

                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-2xl border border-amber-100/25 bg-amber-100/10 text-amber-200 mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-black mb-2 tracking-tight">ยินดีต้อนรับกลับมา</h1>
                    <p className="text-[#f3e8d2]/75">เข้าสู่ระบบเพื่อจัดการนามบัตรดิจิทัลของคุณ</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm text-center font-medium animate-in fade-in slide-in-from-top-1 flex items-center justify-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-amber-100/20 rounded-2xl font-medium text-[#f6ead2] flex items-center justify-center gap-3 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 5.09c1.69 0 3.22.59 4.42 1.56l3.54-3.54C17.75 1.19 15.06 0 12 0 7.27 0 3.2 2.7 1.24 6.65l4.03 3.11Z" />
                            <path fill="#34A853" d="M16.04 18.01A6.9 6.9 0 0 1 12 19.32a7.08 7.08 0 0 1-6.73-4.67l-4.03 3.11A11.95 11.95 0 0 0 12 24c2.93 0 5.55-1.02 7.63-2.69l-3.59-3.3Z" />
                            <path fill="#4A90E2" d="M19.63 21.31C21.95 19.25 24 15.93 24 12c0-.82-.1-1.7-.29-2.51H12v5.02h6.74a5.87 5.87 0 0 1-2.7 3.8l3.59 3Z" />
                            <path fill="#FBBC05" d="M5.27 14.65a7.18 7.18 0 0 1 0-5.3l-4.03-3.1a11.97 11.97 0 0 0 0 11.5l4.03-3.1Z" />
                        </svg>
                        ดำเนินการด้วย Google
                    </button>

                    {/* ปิดการใช้งาน Facebook Login ชั่วคราว */}
                    {/* <button
                        onClick={() => handleSocialLogin('facebook')}
                        className="w-full py-3 px-4 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 rounded-2xl font-medium flex items-center justify-center gap-3 transition-colors text-[#1877F2]"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        ดำเนินการด้วย Facebook
                    </button> */}

                    <button
                        onClick={() => handleSocialLogin('line')}
                        className="w-full py-3 px-4 bg-[#00B900]/10 hover:bg-[#00B900]/20 border border-[#00B900]/20 rounded-2xl font-medium flex items-center justify-center gap-3 transition-colors text-[#00B900]"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254ล2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        ดำเนินการด้วย LINE
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-amber-100/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-background text-foreground/40">หรือ</span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">อีเมล</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full bg-foreground/5 border border-amber-100/20 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/20"
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
                                className="w-full bg-foreground/5 border border-amber-100/20 rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/20"
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

                <div className="mt-6 text-center space-y-3">
                    <Link href="/forgot-password" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors inline-block">
                        ลืมรหัสผ่านใช่หรือไม่?
                    </Link>
                    <div className="h-px bg-glass-border w-1/2 mx-auto" />
                    <p className="text-foreground/40 text-sm">
                        ยังไม่มีบัญชี?{' '}
                        <Link href="/register" className="text-primary hover:text-primary/80 font-bold transition-colors">
                            สมัครสมาชิก
                        </Link>
                    </p>
                </div>
            </div>

            {!isEmbed && (
                <footer className="mt-12 text-foreground/20 text-xs text-center">
                    © {new Date().getFullYear()} NAMECARD.AI All rights reserved.
                </footer>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
