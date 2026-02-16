'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
    Users, Copy, CheckCircle, Gift, TrendingUp, DollarSign,
    ArrowLeft, Loader2, Share2, QrCode, ChevronDown, ChevronRight
} from 'lucide-react';

interface ReferralStats {
    referralCode: string | null;
    directReferrals: number;
    totalReferrals: number;
    totalCommission: number;
    pendingCommission: number;
}

interface ReferralTree {
    id: number;
    level: number;
    referredUser: {
        id: number;
        email: string;
        uid: string;
    };
    commission: number;
    status: 'pending' | 'confirmed' | 'paid';
    createdAt: string;
}

export default function ReferralsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [tree, setTree] = useState<ReferralTree[]>([]);
    const [copied, setCopied] = useState(false);
    const [expandedLevels, setExpandedLevels] = useState<number[]>([1]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://namecard.dpattown.com';

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch stats
                const statsRes = await fetch(`${API_URL}/referrals/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch tree
                const treeRes = await fetch(`${API_URL}/referrals/tree`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (treeRes.ok) {
                    const treeData = await treeRes.json();
                    setTree(treeData);
                }
            } catch (error) {
                console.error('Failed to fetch referral data:', error);
            }
            setLoading(false);
        };

        fetchData();
    }, [API_URL, router]);

    const generateCode = async () => {
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/referrals/my-code`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStats(prev => prev ? { ...prev, referralCode: data.referralCode } : null);
            }
        } catch (error) {
            console.error('Failed to generate code:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLink = stats?.referralCode ? `${SITE_URL}/register?ref=${stats.referralCode}` : '';

    const toggleLevel = (level: number) => {
        setExpandedLevels(prev =>
            prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">ยืนยันแล้ว</span>;
            case 'paid':
                return <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">จ่ายแล้ว</span>;
            default:
                return <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">รอดำเนินการ</span>;
        }
    };

    const groupedByLevel = tree.reduce((acc, ref) => {
        if (!acc[ref.level]) acc[ref.level] = [];
        acc[ref.level].push(ref);
        return acc;
    }, {} as Record<number, ReferralTree[]>);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/manage/control-center" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            <Gift size={28} className="text-primary" />
                            ระบบแนะนำสมาชิก
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">แชร์ลิงก์และรับค่าคอมมิชชั่น</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Users size={20} className="text-blue-400" />
                            <span className="text-gray-400 text-sm">แนะนำโดยตรง</span>
                        </div>
                        <p className="text-3xl font-bold">{stats?.directReferrals || 0}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp size={20} className="text-green-400" />
                            <span className="text-gray-400 text-sm">ทั้งหมด</span>
                        </div>
                        <p className="text-3xl font-bold">{stats?.totalReferrals || 0}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign size={20} className="text-yellow-400" />
                            <span className="text-gray-400 text-sm">คอมมิชชั่นรวม</span>
                        </div>
                        <p className="text-3xl font-bold">{stats?.totalCommission?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign size={20} className="text-orange-400" />
                            <span className="text-gray-400 text-sm">รอจ่าย</span>
                        </div>
                        <p className="text-3xl font-bold">{stats?.pendingCommission?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                {/* Referral Code Section */}
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-3xl p-8 mb-8">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <QrCode size={20} className="text-primary" />
                        รหัสแนะนำของคุณ
                    </h2>

                    {stats?.referralCode ? (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 bg-black/30 rounded-2xl p-4 font-mono text-2xl md:text-3xl text-center tracking-widest">
                                    {stats.referralCode}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(stats.referralCode!)}
                                    className={`p-4 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                                >
                                    {copied ? <CheckCircle size={24} /> : <Copy size={24} />}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-gray-400">ลิงก์สำหรับแชร์:</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="flex-1 bg-black/30 border border-white/10 rounded-xl p-3 text-sm font-mono"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(shareLink)}
                                        className="p-3 bg-primary hover:bg-primary/80 rounded-xl transition-colors"
                                    >
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 mb-4">คุณยังไม่มีรหัสแนะนำ</p>
                            <button
                                onClick={generateCode}
                                className="bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                            >
                                สร้างรหัสแนะนำ
                            </button>
                        </div>
                    )}
                </div>

                {/* How it works */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    <h3 className="text-lg font-bold mb-4">วิธีการทำงาน</h3>
                    <div className="space-y-4 text-sm text-gray-400">
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                            <p>แชร์ลิงก์หรือรหัสแนะนำให้เพื่อนของคุณ</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                            <p>เพื่อนสมัครสมาชิกโดยใช้รหัสของคุณ</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                            <p>รับค่าคอมมิชชั่น 10% จากค่าสมัคร และ 10% ต่อเนื่องสูงสุด 10 ชั้น</p>
                        </div>
                    </div>
                </div>

                {/* Referral Tree */}
                {tree.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <h2 className="text-lg font-bold">รายชื่อสมาชิกที่แนะนำ</h2>
                        </div>
                        <div className="divide-y divide-white/5">
                            {Object.keys(groupedByLevel).sort((a, b) => Number(a) - Number(b)).map(levelKey => {
                                const level = Number(levelKey);
                                const referrals = groupedByLevel[level];
                                const isExpanded = expandedLevels.includes(level);

                                return (
                                    <div key={level}>
                                        <button
                                            onClick={() => toggleLevel(level)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                <span className="font-medium">ชั้นที่ {level}</span>
                                                <span className="text-gray-500 text-sm">({referrals.length} คน)</span>
                                            </div>
                                            <span className="text-green-400 font-medium">
                                                {referrals.reduce((sum, r) => sum + Number(r.commission), 0).toFixed(2)} ฿
                                            </span>
                                        </button>

                                        {isExpanded && (
                                            <div className="bg-black/20 px-4 pb-4">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="text-xs text-gray-500 uppercase">
                                                            <th className="text-left py-2">ผู้ใช้</th>
                                                            <th className="text-center py-2">สถานะ</th>
                                                            <th className="text-right py-2">คอมมิชชั่น</th>
                                                            <th className="text-right py-2">วันที่</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {referrals.map(ref => (
                                                            <tr key={ref.id}>
                                                                <td className="py-3">
                                                                    <p className="font-medium">{ref.referredUser?.uid || '-'}</p>
                                                                    <p className="text-xs text-gray-500">{ref.referredUser?.email || '-'}</p>
                                                                </td>
                                                                <td className="py-3 text-center">{getStatusBadge(ref.status)}</td>
                                                                <td className="py-3 text-right text-green-400 font-medium">{Number(ref.commission).toFixed(2)} ฿</td>
                                                                <td className="py-3 text-right text-gray-500 text-sm">
                                                                    {new Date(ref.createdAt).toLocaleDateString('th-TH')}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {tree.length === 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                        <Users size={48} className="text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">ยังไม่มีการแนะนำ</h3>
                        <p className="text-gray-500">เริ่มแชร์ลิงก์ของคุณเพื่อรับค่าคอมมิชชั่น!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
