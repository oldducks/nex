'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart as ReLineChart, Line } from 'recharts';
import { Eye, Download, FileText, Calendar, LogOut, ExternalLink, User, LayoutDashboard, Database, Loader2, LineChart, QrCode } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AnalyticsDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30days');
    const [profile, setProfile] = useState<any>(null);
    const [landingPages, setLandingPages] = useState<any[]>([]);
    const [landingViews, setLandingViews] = useState<Record<number, number>>({});
    const [landingLoading, setLandingLoading] = useState(false);
    const [dailyStats, setDailyStats] = useState<any[]>([]);

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

            // Fetch Daily Stats
            const dailyRes = await fetch(`${API_URL}/analytics/stats/daily?period=${period === '7days' ? '7days' : '30days'}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (dailyRes.ok) {
                setDailyStats(await dailyRes.json());
            }

            // Fetch landing pages + views (for owner dashboard)
            setLandingLoading(true);
            const lpRes = await fetch(`${API_URL}/landing-pages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (lpRes.ok) {
                const pages = await lpRes.json();
                setLandingPages(pages || []);

                const viewMap: Record<number, number> = {};
                await Promise.all(
                    (pages || []).slice(0, 5).map(async (page: any) => {
                        try {
                            const viewRes = await fetch(`${API_URL}/analytics/landing-pages/${page.id}/views`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (viewRes.ok) {
                                const data = await viewRes.json();
                                viewMap[page.id] = data.views ?? 0;
                            }
                        } catch {
                            // ignore single-page error
                        }
                    })
                );
                setLandingViews(viewMap);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setLandingLoading(false);
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
        { name: 'ดู Landing Page', value: stats.VIEW_LANDING_PAGE, color: '#22C55E' },
        { name: 'ส่งฟอร์ม Landing', value: stats.SUBMIT_LANDING_FORM, color: '#0EA5E9' },
        { name: 'สแกน QR', value: stats.SCAN_QR, color: '#A855F7' },
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

                        {/* Funnel Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <StatCard
                                title="ยอดดู Landing Page"
                                value={stats?.VIEW_LANDING_PAGE || 0}
                                icon={<LineChart size={24} className="text-emerald-500" />}
                                color="bg-emerald-500/10 border-emerald-500/20"
                            />
                            <StatCard
                                title="ส่งฟอร์ม Landing"
                                value={stats?.SUBMIT_LANDING_FORM || 0}
                                icon={<Download size={24} className="text-sky-500" />}
                                color="bg-sky-500/10 border-sky-500/20"
                            />
                            <StatCard
                                title="สแกน QR ทั้งหมด"
                                value={stats?.SCAN_QR || 0}
                                icon={<QrCode size={24} className="text-violet-500" />}
                                color="bg-violet-500/10 border-violet-500/20"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                            {/* Bar Chart */}
                            <div className="bg-foreground/5 border border-foreground/10 rounded-[40px] p-8 glass-card overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <h3 className="text-xl font-bold tracking-tight">แยกตามประเภทการใช้งาน</h3>
                                    <div className="hidden sm:flex gap-4">
                                        {chartData.slice(0, 3).map((item, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-[10px] text-foreground/40 font-medium">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-80 w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <defs>
                                                {chartData.map((item, i) => (
                                                    <linearGradient key={`grad-${i}`} id={`colorBar-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor={item.color} stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor={item.color} stopOpacity={0.2}/>
                                                    </linearGradient>
                                                ))}
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} opacity={0.03} />
                                            <XAxis 
                                                dataKey="name" 
                                                stroke="currentColor" 
                                                tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                                dy={10}
                                            />
                                            <YAxis 
                                                stroke="currentColor" 
                                                tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                            />
                                            <Tooltip
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                                                    borderColor: 'rgba(255, 255, 255, 0.1)', 
                                                    borderRadius: '20px',
                                                    backdropFilter: 'blur(30px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                                }}
                                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '800' }}
                                                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                                            />
                                            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={32} animationDuration={1500} animationEasing="ease-out">
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`url(#colorBar-${index})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Line Chart */}
                            <div className="bg-foreground/5 border border-foreground/10 rounded-[40px] p-8 glass-card overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="mb-8 relative z-10">
                                    <h3 className="text-xl font-bold tracking-tight">การเติบโตของผู้เข้าชม (Engagement)</h3>
                                    <p className="text-xs text-foreground/40 mt-1">จำนวนการใช้งานรวมในแต่ละวัน</p>
                                </div>
                                <div className="h-80 w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ReLineChart data={dailyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} opacity={0.03} />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke="currentColor" 
                                                tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                                dy={10}
                                                tickFormatter={(str) => {
                                                    const d = new Date(str);
                                                    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
                                                }}
                                            />
                                            <YAxis 
                                                stroke="currentColor" 
                                                tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.5 }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                            />
                                            <Tooltip
                                                labelFormatter={(label) => new Date(label).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                                                    borderColor: 'rgba(255, 255, 255, 0.1)', 
                                                    borderRadius: '20px',
                                                    backdropFilter: 'blur(30px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                                }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="count" 
                                                stroke="#8B5CF6" 
                                                strokeWidth={5} 
                                                dot={{ r: 6, fill: '#8B5CF6', strokeWidth: 3, stroke: 'var(--background)' }}
                                                activeDot={{ r: 8, strokeWidth: 4, stroke: 'var(--background)' }}
                                                animationDuration={2000}
                                            />
                                        </ReLineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Landing pages performance */}
                        <div className="bg-foreground/5 border border-foreground/10 rounded-[32px] p-8 glass-card">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <LineChart size={20} className="text-primary" />
                                    สถิติ Landing Page (สูงสุด 5 หน้าแรก)
                                </h3>
                                {landingLoading && (
                                    <span className="flex items-center gap-2 text-xs text-foreground/50">
                                        <Loader2 className="animate-spin" size={14} />
                                        กำลังโหลดสถิติหน้าเพจ...
                                    </span>
                                )}
                            </div>
                            {landingPages.length === 0 ? (
                                <p className="text-sm text-foreground/50">
                                    ยังไม่มี Landing Page ในระบบ คุณสามารถเริ่มสร้างได้จากเมนู Landing Pages
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {landingPages.slice(0, 5).map((page: any) => {
                                        const views = landingViews[page.id] ?? 0;
                                        return (
                                            <div
                                                key={page.id}
                                                className="p-4 rounded-2xl border border-foreground/10 bg-background/40 flex items-center justify-between gap-4"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-xs text-foreground/40 uppercase font-black tracking-widest mb-1">
                                                        Landing Page
                                                    </p>
                                                    <p className="text-sm font-semibold truncate mb-1">
                                                        {page.title || '(ไม่มีชื่อเพจ)'}
                                                    </p>
                                                    <p className="text-xs text-foreground/40 truncate">
                                                        /lp/{page.slug}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black">{views.toLocaleString()}</div>
                                                    <div className="text-[10px] text-foreground/40 uppercase tracking-widest">
                                                        Views รวม
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
