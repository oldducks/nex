'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Lock, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle, ShieldAlert, Check, X } from 'lucide-react';

// Password validation rules (Gmail standard)
const passwordRules = [
    { id: 'length', label: 'อย่างน้อย 8 ตัวอักษร', test: (p: string) => p.length >= 8 },
    { id: 'uppercase', label: 'มีตัวพิมพ์ใหญ่ (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: 'มีตัวพิมพ์เล็ก (a-z)', test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: 'มีตัวเลข (0-9)', test: (p: string) => /[0-9]/.test(p) },
    { id: 'symbol', label: 'มีสัญลักษณ์ (!@#$%^&*)', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

export default function ForceChangePasswordPage() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [checking, setChecking] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Password strength calculation
    const passwordStrength = useMemo(() => {
        const passed = passwordRules.filter(rule => rule.test(newPassword)).length;
        return {
            passed,
            total: passwordRules.length,
            isValid: passed === passwordRules.length,
            percentage: (passed / passwordRules.length) * 100
        };
    }, [newPassword]);

    // Check if user needs to change password
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }
        setChecking(false);
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validate all rules
        if (!passwordStrength.isValid) {
            setMessage({ type: 'error', text: 'รหัสผ่านไม่ผ่านเกณฑ์ที่กำหนด' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'รหัสผ่านไม่ตรงกัน' });
            return;
        }

        setLoading(true);
        const token = Cookies.get('token');

        try {
            const res = await fetch(`${API_URL}/auth/force-change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จ! กำลังพาไปหน้า Control Center...' });
                setTimeout(() => {
                    router.push('/manage/control-center');
                }, 1500);
            } else {
                const error = await res.text();
                setMessage({ type: 'error', text: `เกิดข้อผิดพลาด: ${error}` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `เกิดข้อผิดพลาด: ${error}` });
        } finally {
            setLoading(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength.passed <= 1) return 'bg-red-500';
        if (passwordStrength.passed <= 2) return 'bg-orange-500';
        if (passwordStrength.passed <= 3) return 'bg-yellow-500';
        if (passwordStrength.passed <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    if (checking) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={40} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">ต้องเปลี่ยนรหัสผ่าน</h1>
                    <p className="text-gray-400">เพื่อความปลอดภัย กรุณาตั้งรหัสผ่านใหม่ของคุณ</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                    {message && (
                        <div className={`flex items-center gap-3 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            <span className="text-sm">{message.text}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            รหัสผ่านใหม่
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="ตั้งรหัสผ่านใหม่"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Password Strength Bar */}
                        {newPassword && (
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
                        {newPassword && (
                            <div className="mt-4 space-y-2">
                                {passwordRules.map(rule => {
                                    const passed = rule.test(newPassword);
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

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            ยืนยันรหัสผ่านใหม่
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                            required
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                                <X size={14} /> รหัสผ่านไม่ตรงกัน
                            </p>
                        )}
                        {confirmPassword && newPassword === confirmPassword && (
                            <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                                <Check size={14} /> รหัสผ่านตรงกัน
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !passwordStrength.isValid || newPassword !== confirmPassword}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                กำลังเปลี่ยน...
                            </>
                        ) : (
                            <>
                                <Lock size={20} />
                                เปลี่ยนรหัสผ่าน
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        รหัสผ่านต้องมีความยาว 8 ตัวอักษรขึ้นไป มีตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ ตัวเลข และสัญลักษณ์
                    </p>
                </form>
            </div>
        </div>
    );
}
