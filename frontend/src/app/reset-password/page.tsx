"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff, Check, X } from 'lucide-react';
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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/20 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 relative z-10">
                <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={18} />
                    กลับไปหน้าเข้าสู่ระบบ
                </Link>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">ตั้งรหัสผ่านใหม่</h1>
                    <p className="text-gray-400">สร้างรหัสผ่านที่ปลอดภัยสำหรับบัญชีของคุณ</p>
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center font-medium flex items-center justify-center gap-2">
                        <CheckCircle size={18} />
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">รหัสผ่านใหม่</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-500"
                                placeholder="ตั้งรหัสผ่านใหม่"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Strength Bar */}
                        {password && (
                            <div className="mt-3 space-y-2">
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                        style={{ width: `${passwordStrength.percentage}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">
                                    ความแข็งแรง: {passwordStrength.passed}/{passwordStrength.total}
                                </p>
                            </div>
                        )}

                        {/* Password Rules Checklist */}
                        {password && (
                            <div className="mt-4 space-y-2">
                                {passwordRules.map(rule => {
                                    const passed = rule.test(password);
                                    return (
                                        <div key={rule.id} className={`flex items-center gap-2 text-sm ${passed ? 'text-green-400' : 'text-gray-500'}`}>
                                            {passed ? <Check size={16} /> : <X size={16} />}
                                            <span>{rule.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">ยืนยันรหัสผ่าน</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-500"
                                placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                                <X size={14} /> รหัสผ่านไม่ตรงกัน
                            </p>
                        )}
                        {confirmPassword && password === confirmPassword && (
                            <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                                <Check size={14} /> รหัสผ่านตรงกัน
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token || !passwordStrength.isValid || password !== confirmPassword}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'กำลังดำเนินการ...' : 'ตั้งรหัสผ่านใหม่'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <div className="text-gray-400">กำลังโหลด...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
