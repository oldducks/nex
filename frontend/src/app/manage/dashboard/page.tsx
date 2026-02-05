'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Eye, Download, FileText, Calendar, LogOut, ExternalLink, User, LayoutDashboard, Database, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AnalyticsDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30days');
    const [profile, setProfile] = useState<any>(null);

    const token = Cookies.get('token');

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchData();
    }, [token, period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Stats
            const statsRes = await fetch(`${API_URL}/analytics/stats?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (statsRes.ok) {
                setStats(await statsRes.json());
            }

            // Fetch Profile for Exp Date
            if (!profile) {
                const profileRes = await fetch(`${API_URL}/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    setProfile(await profileRes.json());
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('uid');
        router.push('/login');
    };

    // Calculate remaining days
    const getRemainingDays = () => {
        if (!profile?.expiration_date) return 0;
        const exp = new Date(profile.expiration_date);
        const now = new Date();
        const diff = exp.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const chartData = stats ? [
        { name: 'ยอดดูโปรไฟล์', value: stats.VIEW_PROFILE, color: '#6366F1' },
        { name: 'บันทึก VCF', value: stats.DOWNLOAD_VCF, color: '#10B981' },
        { name: 'ยอดดูแคตตาล็อก', value: stats.VIEW_CATALOG, color: '#F59E0B' },
        { name: 'ดาวน์โหลด PDF', value: stats.DOWNLOAD_PDF, color: '#EC4899' },
    ] : [];

    const remainingDays = getRemainingDays();


    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            {/* Navbar */}
            <nav className="border-b border-foreground/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                        <LayoutDashboard size={24} className="text-primary" />
                        <span className="hidden sm:inline">สถิติการใช้งาน</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-6">
                        <Link
                            href="/manage"
                            className="text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 text-sm"
                        >
                            <Database size={16} /> <span className="hidden md:inline">แคตตาล็อก</span>
                        </Link>
                        <Link
                            href="/manage/profile"
                            className="text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 text-sm"
                        >
                            <User size={16} /> <span className="hidden md:inline">โปรไฟล์</span>
                        </Link>
                        <Link
                            href={profile?.url_prefix ? `/${profile.url_prefix}/${profile.uid}` : '#'}
                            target="_blank"
                            className="text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 text-sm"
                        >
                            <ExternalLink size={16} /> <span className="hidden md:inline">ดูเว็บ</span>
                        </Link>
                        <div className="h-6 w-px bg-foreground/10 mx-1" />
                        <ThemeToggle />
                        <button onClick={handleLogout} className="text-foreground/60 hover:text-red-500 transition-colors ml-2">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Header & Filter */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight">ภาพรวมแดชบอร์ด</h1>
                        <div className="flex items-center gap-2 text-foreground/60">
                            <Calendar size={16} />
                            <span>สมาชิก: <strong className="text-primary">เหลืออีก {remainingDays} วัน</strong></span>
                            {profile?.expiration_date && (
                                <span className="text-xs opacity-50">
                                    (หมดอายุ: {new Date(profile.expiration_date).toLocaleDateString('th-TH')})
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="bg-foreground/5 p-1 rounded-2xl flex border border-foreground/5 w-full md:w-auto overflow-x-auto">
                        {['today', '7days', '30days', 'all'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${period === p ? 'bg-background text-foreground shadow-md' : 'text-foreground/40 hover:text-foreground'}`}
                            >
                                {p === 'today' ? 'วันนี้' : p === '7days' ? '7 วันที่ผ่านมา' : p === '30days' ? '30 วันที่ผ่านมา' : 'ทั้งหมด'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <span className="text-foreground/40 font-medium tracking-wide">กำลังโหลดข้อมูล...</span>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <StatCard
                                title="ยอดดูโปรไฟล์"
                                value={stats?.VIEW_PROFILE || 0}
                                icon={<Eye size={24} className="text-indigo-500" />}
                                color="bg-indigo-500/10 border-indigo-500/20"
                            />
                            <StatCard
                                title="บันทึกผู้ติดต่อ"
                                value={stats?.DOWNLOAD_VCF || 0}
                                icon={<User size={24} className="text-emerald-500" />}
                                color="bg-emerald-500/10 border-emerald-500/20"
                            />
                            <StatCard
                                title="ยอดดูแคตตาล็อก"
                                value={stats?.VIEW_CATALOG || 0}
                                icon={<Database size={24} className="text-amber-500" />}
                                color="bg-amber-500/10 border-amber-500/20"
                            />
                            <StatCard
                                title="ดาวน์โหลด PDF"
                                value={stats?.DOWNLOAD_PDF || 0}
                                icon={<FileText size={24} className="text-pink-500" />}
                                color="bg-pink-500/10 border-pink-500/20"
                            />
                        </div>

                        {/* Chart */}
                        <div className="bg-foreground/5 border border-foreground/10 rounded-[32px] p-8 glass-card">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold tracking-tight">กราฟแสดงการใช้งาน</h3>
                                <div className="flex gap-4">
                                    {chartData.map((item, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-foreground/40 font-medium">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} opacity={0.05} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="currentColor" 
                                            tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.5 }} 
                                            axisLine={false} 
                                            tickLine={false} 
                                            dy={10}
                                        />
                                        <YAxis 
                                            stroke="currentColor" 
                                            tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.5 }} 
                                            axisLine={false} 
                                            tickLine={false} 
                                        />
                                        <Tooltip
                                            contentStyle={{ 
                                                backgroundColor: 'var(--card-bg)', 
                                                borderColor: 'var(--glass-border)', 
                                                borderRadius: '16px',
                                                backdropFilter: 'blur(20px)',
                                                border: '1px solid var(--glass-border)',
                                                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
                                            }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                            cursor={{ fill: 'currentColor', opacity: 0.05 }}
                                        />
                                        <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className={`p-8 rounded-[32px] border ${color} flex items-center justify-between hover:scale-[1.02] transition-all cursor-default group`}>
            <div>
                <p className="text-foreground/40 text-xs font-black uppercase tracking-widest mb-2">{title}</p>
                <h3 className="text-4xl font-black tracking-tighter group-hover:text-primary transition-colors">{value.toLocaleString()}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color.split(' ')[0]} shadow-inner`}>
                {icon}
            </div>
        </div>
    );
}
