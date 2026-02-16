'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
    Users, UserPlus, Eye, Download, Trash2, ToggleLeft, ToggleRight,
    Loader2, ShieldAlert, LogIn, AlertTriangle, CheckCircle, XCircle,
    Calendar, Clock, TrendingUp, Activity, Edit3, RefreshCw, Settings2,
    BookOpen, BarChart3, Smartphone, Layout, UserCircle, ListChecks
} from 'lucide-react';

interface UserStats {
    viewCount: number;
    downloadVcf: number;
    viewCatalog: number;
    downloadPdf: number;
    lastActivity: string | null;
}

interface FeatureConfig {
    catalog: boolean;
    leads: boolean;
    namecard: boolean;
    'landing-pages': boolean;
    analytics: boolean;
    profile: boolean;
}

const FEATURE_LABELS: Record<keyof FeatureConfig, { label: string; icon: React.ReactNode }> = {
    catalog: { label: 'แคตตาล็อก', icon: <BookOpen size={14} /> },
    leads: { label: 'ลูกค้า', icon: <Users size={14} /> },
    namecard: { label: 'นามบัตร', icon: <Smartphone size={14} /> },
    'landing-pages': { label: 'เพจ', icon: <Layout size={14} /> },
    analytics: { label: 'สถิติ', icon: <BarChart3 size={14} /> },
    profile: { label: 'โปรไฟล์', icon: <UserCircle size={14} /> },
};

const DEFAULT_FEATURE_CONFIG: FeatureConfig = {
    catalog: true,
    leads: true,
    namecard: true,
    'landing-pages': true,
    analytics: true,
    profile: true,
};

interface DashboardUser {
    id: number;
    uid: string;
    email: string;
    role: 'super_admin' | 'group_admin' | 'user';
    group_id: number | null;
    is_active: boolean;
    expiration_date: string | null;
    created_at: string;
    stats: UserStats;
    feature_config?: FeatureConfig;
}

interface DashboardData {
    totalUsers: number;
    activeUsers: number;
    users: DashboardUser[];
}

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [editExpiration, setEditExpiration] = useState<{ userId: number; date: string } | null>(null);
    const [editFeatures, setEditFeatures] = useState<{ userId: number; config: FeatureConfig } | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Check authorization and fetch data
    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Check if user is super_admin first
                const profileRes = await fetch(`${API_URL}/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    if (profileData.user?.role !== 'super_admin') {
                        setLoading(false);
                        return;
                    }
                    setAuthorized(true);
                }

                // Fetch admin dashboard data
                const res = await fetch(`${API_URL}/users/admin/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDashboardData(data);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [API_URL]);

    const toggleUserActive = async (userId: number) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}/toggle-active`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const updated = await res.json();
                setDashboardData(prev => prev ? {
                    ...prev,
                    users: prev.users.map(u => u.id === userId ? { ...u, is_active: updated.is_active } : u),
                    activeUsers: prev.users.filter(u => u.id === userId ? updated.is_active : u.is_active).length
                } : null);
            }
        } catch (error) {
            console.error('Toggle failed:', error);
        }
        setActionLoading(null);
    };

    const deleteUser = async (userId: number) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setDashboardData(prev => prev ? {
                    ...prev,
                    totalUsers: prev.totalUsers - 1,
                    users: prev.users.filter(u => u.id !== userId)
                } : null);
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
        setDeleteConfirm(null);
        setActionLoading(null);
    };

    const updateExpiration = async (userId: number, date: string | null) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}/expiration`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ expiration_date: date })
            });
            if (res.ok) {
                setDashboardData(prev => prev ? {
                    ...prev,
                    users: prev.users.map(u => u.id === userId ? { ...u, expiration_date: date } : u)
                } : null);
            }
        } catch (error) {
            console.error('Update expiration failed:', error);
        }
        setEditExpiration(null);
        setActionLoading(null);
    };

    const checkExpiredUsers = async () => {
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/check-expired`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const result = await res.json();
                alert(`ปิดการใช้งาน ${result.disabledCount} บัญชีที่หมดอายุ`);
                // Refresh data
                window.location.reload();
            }
        } catch (error) {
            console.error('Check expired failed:', error);
        }
    };

    const updateFeatureConfig = async (userId: number, config: FeatureConfig) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}/feature-config`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                const updated = await res.json();
                setDashboardData(prev => prev ? {
                    ...prev,
                    users: prev.users.map(u => u.id === userId ? { ...u, feature_config: updated.feature_config } : u)
                } : null);
            }
        } catch (error) {
            console.error('Update feature config failed:', error);
        }
        setEditFeatures(null);
        setActionLoading(null);
    };

    const getResolvedFeatureConfig = (config?: FeatureConfig): FeatureConfig => {
        if (!config || Object.keys(config).length === 0) {
            return DEFAULT_FEATURE_CONFIG;
        }
        return {
            catalog: config.catalog ?? true,
            leads: config.leads ?? true,
            namecard: config.namecard ?? true,
            'landing-pages': config['landing-pages'] ?? true,
            analytics: config.analytics ?? true,
            profile: config.profile ?? true,
        };
    };

    const countEnabledFeatures = (config?: FeatureConfig): number => {
        const resolved = getResolvedFeatureConfig(config);
        return Object.values(resolved).filter(Boolean).length;
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getDaysRemaining = (dateStr: string | null): { days: number; text: string; color: string } | null => {
        if (!dateStr) return null;
        const now = new Date();
        const exp = new Date(dateStr);
        const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diff < 0) return { days: diff, text: `หมดอายุ ${Math.abs(diff)} วัน`, color: 'text-red-400' };
        if (diff === 0) return { days: 0, text: 'หมดอายุวันนี้!', color: 'text-red-400' };
        if (diff <= 7) return { days: diff, text: `เหลือ ${diff} วัน`, color: 'text-yellow-400' };
        if (diff <= 30) return { days: diff, text: `เหลือ ${diff} วัน`, color: 'text-orange-400' };
        return { days: diff, text: `เหลือ ${diff} วัน`, color: 'text-green-400' };
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin': return <span className="px-2 py-1 text-xs font-bold bg-purple-500/20 text-purple-400 rounded-full">🔑 Super Admin</span>;
            case 'group_admin': return <span className="px-2 py-1 text-xs font-bold bg-blue-500/20 text-blue-400 rounded-full">👥 Group Admin</span>;
            default: return <span className="px-2 py-1 text-xs font-bold bg-gray-500/20 text-gray-400 rounded-full">👤 User</span>;
        }
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
                    <button onClick={() => router.push('/login')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-xl">
                        ไปหน้าเข้าสู่ระบบ
                    </button>
                </div>
            </div>
        );
    }

    // Not authorized
    if (!authorized) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
                <div className="text-center">
                    <ShieldAlert size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
                    <p className="text-gray-400 mb-6">หน้านี้สำหรับ Super Admin เท่านั้น</p>
                    <button onClick={() => router.push('/manage/profile')} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl">
                        กลับหน้าโปรไฟล์
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Users size={32} className="text-primary" />
                            Super Admin Dashboard
                        </h1>
                        <p className="text-gray-400 mt-1">จัดการผู้ใช้ทั้งหมดในระบบ</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={checkExpiredUsers}
                            className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-medium py-3 px-5 rounded-xl flex items-center gap-2 transition-all"
                            title="ปิดบัญชีที่หมดอายุ"
                        >
                            <RefreshCw size={18} /> ตรวจหมดอายุ
                        </button>
                        <Link
                            href="/admin/secret-create"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all"
                        >
                            <UserPlus size={20} /> สร้างผู้ใช้ใหม่
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Users size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">ผู้ใช้ทั้งหมด</p>
                                <p className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <CheckCircle size={24} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">ใช้งานอยู่</p>
                                <p className="text-2xl font-bold">{dashboardData?.activeUsers || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Eye size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">การเข้าชมรวม</p>
                                <p className="text-2xl font-bold">{dashboardData?.users.reduce((sum, u) => sum + u.stats.viewCount, 0) || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                <Download size={24} className="text-pink-400" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">ดาวน์โหลดรวม</p>
                                <p className="text-2xl font-bold">{dashboardData?.users.reduce((sum, u) => sum + u.stats.downloadVcf + u.stats.downloadPdf, 0) || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-lg font-bold">รายชื่อผู้ใช้</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-black/30">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ผู้ใช้</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">บทบาท</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">สถานะ</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">ฟีเจอร์</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">การเข้าชม</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">ดาวน์โหลด</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">กิจกรรมล่าสุด</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">วันหมดอายุ</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {dashboardData?.users.map(user => (
                                    <tr key={user.id} className={`hover:bg-white/5 ${!user.is_active ? 'opacity-50' : ''}`}>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="font-medium">{user.uid}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                                        <td className="px-4 py-4 text-center">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                                                    <CheckCircle size={14} /> ใช้งาน
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                                                    <XCircle size={14} /> ปิด
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => setEditFeatures({
                                                    userId: user.id,
                                                    config: getResolvedFeatureConfig(user.feature_config)
                                                })}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors text-xs font-medium"
                                                title="จัดการฟีเจอร์"
                                            >
                                                <Settings2 size={12} />
                                                {countEnabledFeatures(user.feature_config)}/6
                                            </button>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-purple-400 font-medium">{user.stats.viewCount}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-pink-400 font-medium">{user.stats.downloadVcf + user.stats.downloadPdf}</span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-400">
                                            {formatDateTime(user.stats.lastActivity)}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col">
                                                    {user.expiration_date ? (
                                                        <>
                                                            <span className={new Date(user.expiration_date) < new Date() ? 'text-red-400' : 'text-gray-400'}>
                                                                {formatDate(user.expiration_date)}
                                                            </span>
                                                            {getDaysRemaining(user.expiration_date) && (
                                                                <span className={`text-xs font-medium ${getDaysRemaining(user.expiration_date)!.color}`}>
                                                                    {getDaysRemaining(user.expiration_date)!.text}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-600">ไม่จำกัด</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setEditExpiration({ userId: user.id, date: user.expiration_date ? user.expiration_date.split('T')[0] : '' })}
                                                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                                                    title="แก้ไขวันหมดอายุ"
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Toggle Active */}
                                                <button
                                                    onClick={() => toggleUserActive(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className={`p-2 rounded-lg transition-colors ${user.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'}`}
                                                    title={user.is_active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                                                >
                                                    {actionLoading === user.id ? <Loader2 size={16} className="animate-spin" /> : (user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />)}
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => setDeleteConfirm(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                    title="ลบผู้ใช้"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
                            <div className="text-center mb-6">
                                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">ยืนยันการลบ</h3>
                                <p className="text-gray-400">คุณต้องการลบผู้ใช้นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => deleteUser(deleteConfirm)}
                                    disabled={actionLoading === deleteConfirm}
                                    className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    {actionLoading === deleteConfirm ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                    ลบผู้ใช้
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Expiration Modal */}
                {editExpiration && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
                            <div className="text-center mb-6">
                                <Calendar size={48} className="text-blue-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">แก้ไขวันหมดอายุ</h3>
                                <p className="text-gray-400">เลือกวันหมดอายุใหม่หรือเว้นว่างเพื่อไม่จำกัด</p>
                            </div>
                            <div className="mb-6">
                                <input
                                    type="date"
                                    value={editExpiration.date}
                                    onChange={(e) => setEditExpiration({ ...editExpiration, date: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditExpiration(null)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => updateExpiration(editExpiration.userId, null)}
                                    disabled={actionLoading === editExpiration.userId}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-xl font-medium"
                                >
                                    ไม่จำกัด
                                </button>
                                <button
                                    onClick={() => updateExpiration(editExpiration.userId, editExpiration.date || null)}
                                    disabled={actionLoading === editExpiration.userId || !editExpiration.date}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading === editExpiration.userId ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Features Modal */}
                {editFeatures && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
                            <div className="text-center mb-6">
                                <ListChecks size={48} className="text-indigo-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">จัดการฟีเจอร์</h3>
                                <p className="text-gray-400">เลือกฟีเจอร์ที่ต้องการเปิด/ปิดสำหรับผู้ใช้นี้</p>
                            </div>
                            <div className="space-y-3 mb-6">
                                {(Object.keys(FEATURE_LABELS) as Array<keyof FeatureConfig>).map((key) => (
                                    <label
                                        key={key}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                                            editFeatures.config[key]
                                                ? 'bg-indigo-500/20 border-indigo-500/50'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={editFeatures.config[key] ? 'text-indigo-400' : 'text-gray-500'}>
                                                {FEATURE_LABELS[key].icon}
                                            </span>
                                            <span className={`font-medium ${editFeatures.config[key] ? 'text-white' : 'text-gray-400'}`}>
                                                {FEATURE_LABELS[key].label}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={editFeatures.config[key]}
                                            onChange={(e) => setEditFeatures({
                                                ...editFeatures,
                                                config: { ...editFeatures.config, [key]: e.target.checked }
                                            })}
                                            className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                                        />
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-3 mb-4">
                                <button
                                    onClick={() => setEditFeatures({
                                        ...editFeatures,
                                        config: { catalog: true, leads: true, namecard: true, 'landing-pages': true, analytics: true, profile: true }
                                    })}
                                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-xl text-sm font-medium"
                                >
                                    เปิดทั้งหมด
                                </button>
                                <button
                                    onClick={() => setEditFeatures({
                                        ...editFeatures,
                                        config: { catalog: false, leads: false, namecard: false, 'landing-pages': false, analytics: false, profile: false }
                                    })}
                                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-xl text-sm font-medium"
                                >
                                    ปิดทั้งหมด
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditFeatures(null)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => updateFeatureConfig(editFeatures.userId, editFeatures.config)}
                                    disabled={actionLoading === editFeatures.userId}
                                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    {actionLoading === editFeatures.userId ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
