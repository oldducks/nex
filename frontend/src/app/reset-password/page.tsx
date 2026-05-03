"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Password validation rules (Gmail standard)
const passwordRules = [
    { id: 'length', label: 'อย่างน้อย 8 ตัวอักษร', test: (p: string) => p.length >= 8 },
    { id: 'uppercase', label: 'มีตัวพิมพ์ใหญ่ (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: 'มีตัวพิมพ์เล็ก (a-z)', test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: 'มีตัวเลข (0-9)', test: (p: string) => /[0-9]/.test(p) },
    { id: 'symbol', label: 'มีสัญลักษณ์ (!@#$%^&*)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Password strength calculation
    const passwordStrength = useMemo(() => {
        const passed = passwordRules.filter(rule => rule.test(password)).length;
        return {
            passed,
            total: passwordRules.length,
            isValid: passed === passwordRules.length,
            percentage: (passed / passwordRules.length) * 100
        };
    }, [password]);

    const getStrengthColor = () => {
        if (passwordStrength.passed <= 1) return 'bg-red-500';
        if (passwordStrength.passed <= 2) return 'bg-orange-500';
        if (passwordStrength.passed <= 3) return 'bg-yellow-500';
        if (passwordStrength.passed <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!passwordStrength.isValid) {
            setError('รหัสผ่านไม่ผ่านเกณฑ์ที่กำหนด');
            return;
        }

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        setLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้');
            }

            setMessage('รีเซ็ตรหัสผ่านสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
            <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
                <section className="w-full rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_24px_60px_-42px_rgba(5,5,121,0.2)] md:p-7">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#475569] transition-colors hover:text-[#050579]"
                    >
                        <ArrowLeft size={18} />
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>

                    <div className="mt-6">
                        <h1 className="text-2xl font-black tracking-tight text-[#050579]">ตั้งรหัสผ่านใหม่</h1>
                        <p className="mt-2 text-sm leading-relaxed text-[#475569]">สร้างรหัสผ่านที่ปลอดภัยสำหรับบัญชีของคุณ</p>
                    </div>

                    {message ? (
                        <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-[#BCE2C4] bg-[#F2FBF4] px-4 py-3 text-sm font-semibold text-[#166534]">
                            <CheckCircle size={18} />
                            {message}
                        </div>
                    ) : null}

                    {error ? (
                        <div className="mt-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
                            {error}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div className="space-y-2">
                            <label className="ml-1 block text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">รหัสผ่านใหม่</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="h-12 w-full rounded-xl border border-[#D9E1F2] bg-white pl-11 pr-12 text-sm text-[#0F172A] outline-none transition focus:border-[#A7B7E6] focus:ring-2 focus:ring-[#EEF0FF]"
                                    placeholder="ตั้งรหัสผ่านใหม่"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#050579]"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {password ? (
                                <div className="mt-3 space-y-2">
                                    <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                                        <div
                                            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                            style={{ width: `${passwordStrength.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-[#64748B]">
                                        ความแข็งแรง: {passwordStrength.passed}/{passwordStrength.total}
                                    </p>
                                </div>
                            ) : null}

                            {password ? (
                                <div className="mt-4 space-y-2">
                                    {passwordRules.map((rule) => {
                                        const passed = rule.test(password);
                                        return (
                                            <div key={rule.id} className={`flex items-center gap-2 text-sm ${passed ? 'text-[#166534]' : 'text-[#64748B]'}`}>
                                                {passed ? <Check size={16} /> : <X size={16} />}
                                                <span>{rule.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <label className="ml-1 block text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">ยืนยันรหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="h-12 w-full rounded-xl border border-[#D9E1F2] bg-white pl-11 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#A7B7E6] focus:ring-2 focus:ring-[#EEF0FF]"
                                    placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword ? (
                                <p className="mt-2 flex items-center gap-1 text-sm text-[#B91C1C]">
                                    <X size={14} /> รหัสผ่านไม่ตรงกัน
                                </p>
                            ) : null}
                            {confirmPassword && password === confirmPassword ? (
                                <p className="mt-2 flex items-center gap-1 text-sm text-[#166534]">
                                    <Check size={14} /> รหัสผ่านตรงกัน
                                </p>
                            ) : null}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token || !passwordStrength.isValid || password !== confirmPassword}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 text-sm font-bold text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    กำลังดำเนินการ...
                                </>
                            ) : (
                                'ตั้งรหัสผ่านใหม่'
                            )}
                        </button>
                    </form>
                </section>
            </main>
            <footer className="px-4 pb-6 text-center text-xs font-medium text-[#64748B]">
                © NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด KHRAM INTELLIGENT AI Co., Ltd.
            </footer>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF] text-[#475569]">
                <div>กำลังโหลด...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
