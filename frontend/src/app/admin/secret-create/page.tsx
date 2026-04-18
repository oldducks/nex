'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import {
    UserPlus,
    Loader2,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff,
    ShieldAlert,
    LogIn,
    Mail,
    Lock,
    ArrowRight,
    Sparkles,
    Shield,
    Users,
    User,
    Smartphone,
} from 'lucide-react';

type UserRole = 'super_admin' | 'group_admin' | 'user';

interface UserData {
    role: UserRole;
    email: string;
    uid: string;
    group_id?: number;
}

function Shell({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#EEF0FF] p-6 text-[#0F172A]">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_30%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_100%)]" />
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
                {children}
            </div>
        </div>
    );
}

export default function SecretCreateUser() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'user' as UserRole,
        group_id: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; profileUrl?: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const userRole = data.user?.role || 'user';
                    setCurrentUser({
                        role: userRole,
                        email: data.user?.email,
                        uid: data.user?.uid,
                        group_id: data.user?.group_id
                    });

                    if (userRole === 'super_admin' || userRole === 'group_admin') {
                        setAuthorized(true);
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
            setLoading(false);
        };
        checkAuth();
    }, [API_URL]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);

        const token = Cookies.get('token');

        try {
            const payload: any = {
                fullName: formData.fullName || undefined,
                email: formData.email || undefined,
                phoneNumber: formData.phoneNumber || undefined,
                password: formData.password,
                role: formData.role
            };

            if (currentUser?.role === 'group_admin') {
                payload.group_id = currentUser.group_id;
                payload.role = 'user';
            } else if (formData.group_id) {
                payload.group_id = parseInt(formData.group_id, 10);
            }

            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const createdUser = await res.json();
                setResult({
                    success: true,
                    message: `สร้างผู้ใช้ ${formData.email || formData.phoneNumber} สำเร็จ!`,
                    profileUrl: createdUser?.uid ? `/${createdUser.uid}` : undefined
                });
                setFormData({ fullName: '', email: '', phoneNumber: '', password: '', role: 'user', group_id: '' });
            } else {
                const error = await res.text();
                setResult({
                    success: false,
                    message: `เกิดข้อผิดพลาด: ${error}`
                });
            }
        } catch (error) {
            setResult({
                success: false,
                message: `เกิดข้อผิดพลาด: ${error}`
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Shell>
                <div className="flex items-center justify-center rounded-[32px] border border-[#D9E1F2] bg-white px-10 py-12 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
                    <Loader2 size={32} className="animate-spin text-[#F97316]" />
                </div>
            </Shell>
        );
    }

    if (!Cookies.get('token')) {
        return (
            <Shell>
                <div className="w-full max-w-md rounded-[32px] border border-[#D9E1F2] bg-white p-8 text-center shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF7ED] text-[#F97316]">
                        <LogIn size={30} />
                    </div>
                    <h1 className="text-2xl font-black text-[#050579]">กรุณาเข้าสู่ระบบ</h1>
                    <p className="mt-3 text-sm text-[#64748B]">คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-opacity hover:opacity-90"
                    >
                        ไปหน้าเข้าสู่ระบบ
                    </button>
                </div>
            </Shell>
        );
    }

    if (!authorized) {
        return (
            <Shell>
                <div className="w-full max-w-md rounded-[32px] border border-[#D9E1F2] bg-white p-8 text-center shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                        <ShieldAlert size={30} />
                    </div>
                    <h1 className="text-2xl font-black text-[#050579]">ไม่มีสิทธิ์เข้าถึง</h1>
                    <p className="mt-3 text-sm text-[#64748B]">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                        สิทธิ์ปัจจุบัน: {currentUser?.role || 'ไม่ทราบ'}
                    </p>
                    <button
                        onClick={() => router.push('/manage/profile')}
                        className="mt-6 inline-flex items-center justify-center rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-8 py-3.5 text-sm font-black uppercase tracking-widest text-[#050579] transition-colors hover:bg-white"
                    >
                        กลับหน้าโปรไฟล์
                    </button>
                </div>
            </Shell>
        );
    }

    const isSuperAdmin = currentUser?.role === 'super_admin';

    return (
        <Shell>
            <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.88fr_1.12fr]">
                <div className="rounded-[32px] border border-[#D9E1F2] bg-white p-8 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
                    <div className="mb-8">
                        <Link href="/" className="inline-flex items-center gap-3 text-2xl font-black text-[#050579]">
                            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white p-1">
                                <Image src="/nex_logo_nobg.png" alt="NEX" fill className="object-contain" unoptimized />
                            </div>
                            <span className="tracking-tighter">NEX SOLUTION<span className="text-[#F97316]">.</span></span>
                        </Link>
                    </div>

                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FDBA74] bg-[#FFF7ED] px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-[#C2410C]">
                        <Sparkles size={14} />
                        Admin Secret Create
                    </div>

                    <h1 className="text-3xl font-black text-[#050579]">สร้างผู้ใช้ใหม่</h1>
                    <p className="mt-3 text-sm leading-6 text-[#64748B]">
                        ใช้หน้าสำหรับผู้ดูแลระบบในการเปิดบัญชีใหม่แบบรวดเร็ว โดยยังคงใช้โทนเดียวกับหน้าสมัครสมาชิกหลักของระบบ
                    </p>

                    <div className="mt-8 space-y-4">
                        <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF0FF] text-[#050579]">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#94A3B8]">สิทธิ์ปัจจุบัน</p>
                                    <p className="text-lg font-black text-[#050579]">
                                        {isSuperAdmin ? 'Super Admin' : 'Group Admin'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#94A3B8]">คำอธิบาย</p>
                            <p className="mt-2 text-sm font-semibold text-[#334155]">
                                {isSuperAdmin
                                    ? 'สร้างได้ทุกระดับ รวมทั้ง Group Admin และ Super Admin'
                                    : 'สร้างได้เฉพาะ User ภายในกลุ่มของคุณเท่านั้น'}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#94A3B8]">บัญชีที่ใช้อยู่</p>
                            <p className="mt-2 text-sm font-semibold text-[#334155]">{currentUser?.email || '-'}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[32px] border border-[#D9E1F2] bg-white p-8 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-[#050579]">ข้อมูลสำหรับสร้างบัญชี</h2>
                        <p className="mt-2 text-sm text-[#64748B]">กรอกข้อมูลให้ครบแล้วกดสร้างผู้ใช้ใหม่ได้ทันที</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full rounded-2xl border border-[#D9E1F2] bg-white py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF]"
                                placeholder="ชื่อ - นามสกุล (ไม่บังคับ)"
                            />
                        </div>

                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full rounded-2xl border border-[#D9E1F2] bg-white py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF]"
                                placeholder="user@example.com"
                            />
                        </div>

                        <div className="relative">
                            <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                            <input
                                type="text"
                                value={formData.phoneNumber}
                                onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                className="w-full rounded-2xl border border-[#D9E1F2] bg-white py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF]"
                                placeholder="เบอร์โทรศัพท์"
                            />
                        </div>

                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                            กรอกอีเมลหรือเบอร์โทรศัพท์อย่างใดอย่างหนึ่ง ระบบจะสุ่ม UID ให้อัตโนมัติ
                        </p>

                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full rounded-2xl border border-[#D9E1F2] bg-white py-3.5 pl-12 pr-12 outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF]"
                                placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#050579]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {isSuperAdmin && (
                            <div className="relative">
                                <Users size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                                    className="w-full appearance-none rounded-2xl border border-[#D9E1F2] bg-white py-3.5 pl-12 pr-4 outline-none transition-all focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF]"
                                >
                                    <option value="user">User (ผู้ใช้ทั่วไป)</option>
                                    <option value="group_admin">Group Admin (ผู้ดูแลกลุ่ม)</option>
                                    <option value="super_admin">Super Admin (ผู้ดูแลสูงสุด)</option>
                                </select>
                            </div>
                        )}

                        {isSuperAdmin && (
                            <input
                                type="number"
                                value={formData.group_id}
                                onChange={e => setFormData(prev => ({ ...prev, group_id: e.target.value }))}
                                className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3.5 outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF]"
                                placeholder="Group ID (ถ้ามี)"
                            />
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-orange-500/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    กำลังสร้าง...
                                </>
                            ) : (
                                <>
                                    สร้างผู้ใช้
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {result && (
                        <div className={`mt-5 rounded-2xl border p-4 text-sm ${result.success ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                            <div className="flex items-center gap-2 font-bold">
                                {result.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                <span>{result.message}</span>
                            </div>
                            {result.profileUrl && (
                                <p className="mt-2 font-semibold">
                                    Profile URL: <code className="rounded-lg bg-white/80 px-2 py-1">{result.profileUrl}</code>
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-8 text-center text-sm text-[#64748B]">
                        <span className="font-bold text-[#050579]">🔒</span> หน้านี้ต้องมีสิทธิ์ผู้ดูแลระบบ
                    </div>
                </div>
            </div>
        </Shell>
    );
}
