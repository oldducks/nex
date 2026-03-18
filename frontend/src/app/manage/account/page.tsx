'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
    Lock, 
    ArrowLeft, 
    Save, 
    Settings, 
    Eye, 
    EyeOff, 
    Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AccountSettingsPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | undefined>(undefined);
    const [uid, setUid] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = Cookies.get('token');
        const storedUid = Cookies.get('uid');
        
        if (!storedToken) {
            router.push('/login');
            return;
        }

        setToken(storedToken);
        setUid(storedUid || '');
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="animate-spin text-primary" />
                    <p className="font-mono text-sm tracking-widest uppercase opacity-50">Loading Settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 transition-colors duration-500">
             {/* Header */}
             <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-glass-border">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/manage/control-center" className="w-10 h-10 rounded-xl bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter flex items-center gap-3">
                                <Settings size={20} className="text-primary" /> ACCOUNT SETTINGS
                            </h1>
                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mt-1">จัดการบัญชีและความปลอดภัย</p>
                        </div>
                    </div>
                    
                     <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
                 <div className="space-y-8">
                     {/* UID Section */}
                     <section className="bg-card-bg border border-glass-border rounded-[40px] p-10 glass-card">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter">
                                <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Settings size={20} />
                                </span>
                                ข้อมูลบัญชี
                            </h2>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">รหัสผู้ใช้ (UID)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    value={uid}
                                    disabled
                                    className="flex-1 bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 text-foreground/40 font-mono text-sm cursor-not-allowed select-all"
                                />
                                <span className="text-[10px] font-black text-foreground/20 uppercase bg-foreground/5 px-4 py-4 rounded-2xl border border-foreground/5 shrink-0">RO-ONLY</span>
                            </div>
                        </div>
                    </section>

                    {/* Password Section */}
                    <section className="bg-card-bg border border-glass-border rounded-[40px] p-10 glass-card">
                         <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter">
                                <span className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                    <Lock size={20} />
                                </span>
                                ความปลอดภัย
                            </h2>
                        </div>
                        
                         <div className="bg-foreground/[0.02] p-8 rounded-[32px] border border-foreground/5">
                            <PasswordChangeForm token={token} />
                        </div>
                    </section>
                </div>
            </main>

            <footer className="py-20 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.3em]">
                NEX Solution © 2024 • THE PREMIUM DIGITAL EXPERIENCE
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
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {message.text}
                </div>
            )}
            
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                    <input
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        className="w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground">
                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">รหัสผ่านใหม่</label>
                <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">ยืนยันรหัสผ่านใหม่</label>
                <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'บันทึกการเปลี่ยนรหัสผ่าน'}
            </button>
        </form>
    );
}
