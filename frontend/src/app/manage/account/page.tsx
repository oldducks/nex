'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
    Lock,
    Settings,
    Eye,
    EyeOff,
    Loader2
} from 'lucide-react';
import ManageTopBar from '@/components/ManageTopBar';

export default function AccountSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const token = Cookies.get('token');
    const uid = Cookies.get('uid') || '';

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        setLoading(false);
    }, [token, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#EEF0FF] text-[#0F172A]">
                <Loader2 size={48} className="animate-spin text-[#F97316]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EEF0FF] font-sans text-[#0F172A] selection:bg-[#F97316]/20">
             <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.32),transparent_42%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_55%,#e8eeff_100%)]" />
            <ManageTopBar
                backHref="/manage/control"
                subtitle="Account Settings"
                title="ตั้งค่าบัญชี"
            />

            <main className="max-w-3xl mx-auto px-6 py-6 md:py-10 pb-20">
                 <div className="space-y-6">
                     {/* UID Section */}
                     <section className="rounded-[28px] border border-[#D9E1F2] bg-white p-6 md:p-8 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.14)]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black flex items-center gap-3 text-[#050579]">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#050579]">
                                    <Settings size={20} />
                                </span>
                                ข้อมูลบัญชี
                            </h2>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#64748B]">รหัสผู้ใช้ (UID)</label>
                            <input
                                type="text"
                                value={uid}
                                disabled
                                className="w-full cursor-not-allowed select-all rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-6 py-4 font-mono text-sm text-[#64748B]"
                            />
                        </div>
                    </section>

                    {/* Password Section */}
                    <section className="rounded-[28px] border border-[#D9E1F2] bg-white p-6 md:p-8 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.14)]">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black flex items-center gap-3 text-[#050579]">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#050579]">
                                    <Lock size={20} />
                                </span>
                                ความปลอดภัย
                            </h2>
                        </div>

                        <PasswordChangeForm token={token} />
                    </section>
                </div>
            </main>

            <footer className="py-12 text-center text-xs font-medium text-[#94A3B8]">
                NEX Solution
            </footer>
        </div>
    );
}

// Password change form component
function PasswordChangeForm({ token }: { token: string | undefined }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validation
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: error.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
            }
        } catch {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {message.text}
                </div>
            )}
            
            <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#64748B]">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                    <input
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-5 py-4 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                    />
                    <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]">
                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#64748B]">รหัสผ่านใหม่</label>
                <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-5 py-4 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                />
            </div>

            <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#64748B]">ยืนยันรหัสผ่านใหม่</label>
                <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-5 py-4 text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#F97316] py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#EA580C] active:scale-[0.98] disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'บันทึกการเปลี่ยนรหัสผ่าน'}
            </button>
        </form>
    );
}
