"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Loader2, X } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEmbed = searchParams.get('embed') === '1';
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ identifier: '', password: '' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        // Check for OAuth error
        const oauthError = searchParams.get('error');
        if (oauthError) {
            setError('การเข้าสู่ระบบผ่านโซเชียลล้มเหลว กรุณาลองใหม่');
        }

        // middleware จะจัดการ redirect หาก login แล้ว
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
                credentials: 'include',
                body: JSON.stringify({ identifier: formData.identifier, password: formData.password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // session cookie ถูก set โดย backend (httpOnly)

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
        const cameFromForgotPassword = document.referrer.includes('/forgot-password');
        if (cameFromForgotPassword) {
            router.push('/');
            return;
        }
        if (window.history.length > 1) {
            router.back();
            return;
        }
        router.push('/');
    };

    return (
        <div className={`${isEmbed ? 'min-h-0 bg-transparent p-3' : 'min-h-screen px-6 py-10'} relative flex flex-col items-center justify-center overflow-hidden bg-[#EEF0FF] text-[#0F172A] transition-colors duration-500`}>
            {!isEmbed && (
                <>
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(249,115,22,0.16),transparent_32%),radial-gradient(circle_at_88%_14%,rgba(5,5,121,0.12),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(148,163,184,0.14),transparent_42%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(238,240,255,0.96)_0%,rgba(244,247,255,0.98)_46%,rgba(238,240,255,1)_100%)]" />
                    </div>
                    <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#F97316]/12 blur-[95px]" />
                    <div className="pointer-events-none absolute -right-24 top-28 h-80 w-80 rounded-full bg-[#050579]/10 blur-[110px]" />
                </>
            )}

            <div className={`relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-[#D9E1F2] bg-white/95 p-8 shadow-[0_24px_60px_-36px_rgba(5,5,121,0.35)] backdrop-blur-sm ${isEmbed ? 'my-2' : ''}`}>
                <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 translate-x-10 -translate-y-10 rounded-full bg-[#EEF2FF] blur-3xl" />
                {!isEmbed && (
                    <button
                        type="button"
                        onClick={handleClose}
                        aria-label="ปิดหน้าล็อกอิน"
                        title="ปิด"
                        className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] text-[#64748B] transition-colors hover:bg-white hover:text-[#050579]"
                    >
                        <X size={18} />
                    </button>
                )}

                <div className="relative mb-8 text-center">
                    <div className="mb-4 inline-flex rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] p-3 text-[#050579] shadow-[0_18px_40px_-32px_rgba(5,5,121,0.4)]">
                        <Lock size={32} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#475569]">NEX Control</p>
                    <h1 className="mb-2 mt-2 text-3xl font-black tracking-tight text-[#050579]">ยินดีต้อนรับกลับมา</h1>
                    <p className="text-sm leading-relaxed text-[#475569]">เข้าสู่ระบบเพื่อจัดการนามบัตรดิจิทัลและเครื่องมือในระบบ NEX</p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-[#F3C3C3] bg-[#FEF2F2] p-4 text-center text-sm font-medium text-[#B91C1C] animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Social Login Buttons */}
                <div className="space-y-3 mb-6">
                    <button
                        onClick={() => handleSocialLogin('google')}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 font-semibold text-[#0F172A] transition-colors hover:border-[#C7D2E5] hover:bg-white"
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
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#BCE3C0] bg-[#F3FFF4] px-4 py-3 font-semibold text-[#15803D] transition-colors hover:bg-[#E9FBEA]"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254ล2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        ดำเนินการด้วย LINE
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#D9E1F2]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-[#94A3B8]">หรือ</span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="ml-1 text-xs font-black uppercase tracking-[0.16em] text-[#64748B]">อีเมลหรือเบอร์โทรศัพท์</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#050579]" size={18} />
                            <input
                                type="text"
                                required
                                className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] py-3.5 pl-12 pr-4 text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#050579]/15 focus:border-[#BFD0EA]"
                                placeholder="name@example.com หรือ 0812345678"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="ml-1 text-xs font-black uppercase tracking-[0.16em] text-[#64748B]">รหัสผ่าน</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors group-focus-within:text-[#050579]" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] py-3.5 pl-12 pr-12 text-[#0F172A] placeholder:text-[#94A3B8] transition-all focus:outline-none focus:ring-2 focus:ring-[#050579]/15 focus:border-[#BFD0EA]"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-colors hover:text-[#050579]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F97316] py-4 font-black text-white shadow-[0_18px_36px_-24px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> กำลังเข้าสู่ระบบ...</> : <>เข้าสู่ระบบ <ArrowRight size={20} /></>}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                    <Link href="/forgot-password" className="inline-block text-sm font-bold text-[#050579] transition-colors hover:text-[#1D4ED8]">
                        ลืมรหัสผ่านใช่หรือไม่?
                    </Link>
                    <div className="mx-auto h-px w-1/2 bg-[#D9E1F2]" />
                    <p className="text-sm text-[#64748B]">
                        ยังไม่มีบัญชี?{' '}
                        <Link href="/register" className="font-black text-[#F97316] transition-colors hover:text-[#EA580C]">
                            ทดลองใช้ระบบฟรี
                        </Link>
                    </p>
                </div>
            </div>

            {!isEmbed && (
                <footer className="mt-10 text-center text-xs leading-6 text-[#94A3B8]">
                    © {new Date().getFullYear()} NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด KHRAM INTELLIGENT AI Co., Ltd.
                </footer>
            )}
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF]">
                <Loader2 className="animate-spin text-[#050579]" size={32} />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
