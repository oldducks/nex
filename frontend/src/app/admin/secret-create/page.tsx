'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { UserPlus, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, ShieldAlert, LogIn } from 'lucide-react';

type UserRole = 'super_admin' | 'group_admin' | 'user';

interface UserData {
    role: UserRole;
    email: string;
    uid: string;
    group_id?: number;
}

export default function SecretCreateUser() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        uid: '',
        role: 'user' as UserRole,
        group_id: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; profileUrl?: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Check authentication and authorization
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

                    // Only super_admin and group_admin can access
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
                email: formData.email,
                password: formData.password,
                uid: formData.uid,
                role: formData.role
            };

            // group_admin can only create users in their group
            if (currentUser?.role === 'group_admin') {
                payload.group_id = currentUser.group_id;
                payload.role = 'user'; // group_admin can only create users
            } else if (formData.group_id) {
                payload.group_id = parseInt(formData.group_id);
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
                setResult({
                    success: true,
                    message: `สร้างผู้ใช้ ${formData.email} สำเร็จ!`,
                    profileUrl: `/${formData.uid}`
                });
                setFormData({ email: '', password: '', uid: '', role: 'user', group_id: '' });
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

    const generateUid = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let uid = 'user_';
        for (let i = 0; i < 8; i++) {
            uid += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, uid }));
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    // Not logged in
    if (!Cookies.get('token')) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
                <div className="text-center">
                    <LogIn size={64} className="text-gray-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">กรุณาเข้าสู่ระบบ</h1>
                    <p className="text-gray-400 mb-6">คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้านี้</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl transition-all"
                    >
                        ไปหน้าเข้าสู่ระบบ
                    </button>
                </div>
            </div>
        );
    }

    // Not authorized (not admin)
    if (!authorized) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
                <div className="text-center">
                    <ShieldAlert size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
                    <p className="text-gray-400 mb-2">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
                    <p className="text-xs text-gray-600 mb-6">สิทธิ์ปัจจุบัน: {currentUser?.role || 'ไม่ทราบ'}</p>
                    <button
                        onClick={() => router.push('/manage/profile')}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl transition-all"
                    >
                        กลับหน้าโปรไฟล์
                    </button>
                </div>
            </div>
        );
    }

    const isSuperAdmin = currentUser?.role === 'super_admin';

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">สร้างผู้ใช้ใหม่</h1>
                    <p className="text-gray-400 text-sm mt-2">
                        {isSuperAdmin ? '🔑 Super Admin - สร้างได้ทุกระดับ' : '👥 Group Admin - สร้างได้เฉพาะ User ในกลุ่ม'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">อีเมล *</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="user@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">รหัสผ่าน * (ขั้นต่ำ 6 ตัวอักษร)</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* UID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">รหัสผู้ใช้ (UID) *</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                pattern="[a-zA-Z0-9_]+"
                                value={formData.uid}
                                onChange={e => setFormData(prev => ({ ...prev, uid: e.target.value }))}
                                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="user_001"
                            />
                            <button
                                type="button"
                                onClick={generateUid}
                                className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                            >
                                สุ่ม
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">ใช้เป็น URL: /prefix/{formData.uid || 'uid'}</p>
                    </div>

                    {/* Role - Only for Super Admin */}
                    {isSuperAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">บทบาท</label>
                            <select
                                value={formData.role}
                                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                                <option value="user">👤 User (ผู้ใช้ทั่วไป)</option>
                                <option value="group_admin">👥 Group Admin (ผู้ดูแลกลุ่ม)</option>
                                <option value="super_admin">🔑 Super Admin (ผู้ดูแลสูงสุด)</option>
                            </select>
                        </div>
                    )}

                    {/* Group ID - Only for Super Admin */}
                    {isSuperAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Group ID (ถ้ามี)</label>
                            <input
                                type="number"
                                value={formData.group_id}
                                onChange={e => setFormData(prev => ({ ...prev, group_id: e.target.value }))}
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                placeholder="เช่น 1, 2, 3"
                            />
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                กำลังสร้าง...
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                สร้างผู้ใช้
                            </>
                        )}
                    </button>
                </form>

                {/* Result Message */}
                {result && (
                    <div className={`mt-4 p-4 rounded-xl border ${result.success ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        <div className="flex items-center gap-2">
                            {result.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{result.message}</span>
                        </div>
                        {result.profileUrl && (
                            <p className="text-sm mt-2">
                                Profile URL: <code className="bg-black/30 px-2 py-1 rounded">{result.profileUrl}</code>
                            </p>
                        )}
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-gray-600 text-xs mt-6">
                    🔒 หน้านี้ต้องมีสิทธิ์ผู้ดูแลระบบ
                </p>
            </div>
        </div>
    );
}
