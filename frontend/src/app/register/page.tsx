'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Loader2, UserPlus, Mail, Lock, ArrowRight, Sparkles, Gift } from 'lucide-react';

function RegisterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        // Check if already logged in
        const token = Cookies.get('token');
        if (token) {
            router.push('/manage/control-center');
            return;
        }

        // Get referral code from URL
        const ref = searchParams.get('ref');
        if (ref) {
            setReferralCode(ref);
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate
        if (!email || !password) {
            setError('กรุณากรอกอีเมลและรหัสผ่าน');
            return;
        }

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 8) {
            setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, referralCode: referralCode || undefined }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'การลงทะเบียนล้มเหลว');
            }

            // Save token and redirect
            Cookies.set('token', data.access_token, { expires: 1 });
            Cookies.set('uid', data.uid, { expires: 1 });
            router.push('/manage/control-center');
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: 'google' | 'facebook' | 'line') => {
        window.location.href = `${API_URL}/auth/${provider}`;
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 opacity-50" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -z-10 opacity-50" />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        NAMECARD<span className="text-primary">.AI</span>
                    </Link>
                </div>

                {/* Register Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <UserPlus size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">สมัครสมาชิก</h1>
                        <p className="text-gray-400 text-sm">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
                    </div>

                    {/* Referral Code Banner */}
                    {referralCode && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <Gift size={24} className="text-green-400" />
                            <div>
                                <p className="text-green-400 text-sm font-medium">มีรหัสแนะนำ!</p>
                                <p className="text-gray-400 text-xs">คุณได้รับการแนะนำจากเพื่อน</p>
                            </div>
                        </div>
                    )}

                    {/* Social Login Buttons */}
                    <div className="space-y-3 mb-6">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 5.09c1.69 0 3.22.59 4.42 1.56l3.54-3.54C17.75 1.19 15.06 0 12 0 7.27 0 3.2 2.7 1.24 6.65l4.03 3.11Z" />
                                <path fill="#34A853" d="M16.04 18.01A6.9 6.9 0 0 1 12 19.32a7.08 7.08 0 0 1-6.73-4.67l-4.03 3.11A11.95 11.95 0 0 0 12 24c2.93 0 5.55-1.02 7.63-2.69l-3.59-3.3Z" />
                                <path fill="#4A90E2" d="M19.63 21.31C21.95 19.25 24 15.93 24 12c0-.82-.1-1.7-.29-2.51H12v5.02h6.74a5.87 5.87 0 0 1-2.7 3.8l3.59 3Z" />
                                <path fill="#FBBC05" d="M5.27 14.65a7.18 7.18 0 0 1 0-5.3l-4.03-3.1a11.97 11.97 0 0 0 0 11.5l4.03-3.1Z" />
                            </svg>
                            ดำเนินการด้วย Google
                        </button>

                        <button
                            onClick={() => handleSocialLogin('facebook')}
                            className="w-full py-3 px-4 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors text-[#1877F2]"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            ดำเนินการด้วย Facebook
                        </button>

                        <button
                            onClick={() => handleSocialLogin('line')}
                            className="w-full py-3 px-4 bg-[#00B900]/10 hover:bg-[#00B900]/20 border border-[#00B900]/20 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors text-[#00B900]"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                            ดำเนินการด้วย LINE
                        </button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-zinc-950 text-gray-500">หรือ</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">อีเมล</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">รหัสผ่าน</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">อย่างน้อย 8 ตัวอักษร</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">ยืนยันรหัสผ่าน</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        {!referralCode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">รหัสแนะนำ (ถ้ามี)</label>
                                <div className="relative">
                                    <Gift size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type="text"
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                        placeholder="XXXXXXXX"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all uppercase"
                                        maxLength={8}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    สมัครสมาชิก
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        มีบัญชีอยู่แล้ว?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            เข้าสู่ระบบ
                        </Link>
                    </p>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    การสมัครสมาชิกหมายความว่าคุณยอมรับ
                    <Link href="/terms" className="text-gray-500 hover:text-white mx-1">เงื่อนไขการใช้งาน</Link>
                    และ
                    <Link href="/privacy" className="text-gray-500 hover:text-white mx-1">นโยบายความเป็นส่วนตัว</Link>
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
