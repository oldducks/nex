'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, LineChart as ReLineChart, Line } from 'recharts';
import { Eye, Download, FileText, Calendar, ExternalLink, User, Database, Loader2, LineChart, QrCode } from 'lucide-react';
import ManageTopBar from '@/components/ManageTopBar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AnalyticsDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30days');
    const [profile, setProfile] = useState<any>(null);
    const [landingPages, setLandingPages] = useState<any[]>([]);
    const [landingViews, setLandingViews] = useState<Record<number, number>>({});
    const [forms, setForms] = useState<any[]>([]);
    const [landingLoading, setLandingLoading] = useState(false);
    const [dailyStats, setDailyStats] = useState<any[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    const token = Cookies.get('token');

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchData();
    }, [token, period]);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 768px)');
        const update = () => setIsMobile(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

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
            const [lpRes, formsRes] = await Promise.all([
                fetch(`${API_URL}/landing-pages`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/forms`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            if (lpRes.ok) {
                const pages = await lpRes.json();
                setLandingPages(pages || []);

                const viewMap: Record<number, number> = {};
                await Promise.all(
                    (pages || []).map(async (page: any) => {
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
            if (formsRes.ok) {
                setForms(await formsRes.json());
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setLandingLoading(false);
        }
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
        { name: 'ยอดเข้าดูนามบัตร', shortName: 'นามบัตร', value: stats.VIEW_PROFILE, color: '#050579' },
        { name: 'บันทึก VCF', shortName: 'VCF', value: stats.DOWNLOAD_VCF, color: '#050579' },
        { name: 'ยอดดูแคตตาล็อก', shortName: 'แคตตาล็อก', value: stats.VIEW_CATALOG, color: '#050579' },
        { name: 'ดาวน์โหลด PDF', shortName: 'PDF', value: stats.DOWNLOAD_PDF, color: '#050579' },
        { name: 'ยอดดูหน้าร้านออนไลน์', shortName: 'หน้าร้าน', value: stats.VIEW_LANDING_PAGE, color: '#050579' },
        { name: 'จำนวนคนที่กรอกฟอร์ม', shortName: 'กรอกฟอร์ม', value: stats.SUBMIT_LANDING_FORM, color: '#050579' },
        { name: 'สแกน QR', shortName: 'QR', value: stats.SCAN_QR, color: '#050579' },
    ] : [];

    const totalFormSubmissions = forms.reduce((sum, form) => sum + Number(form.submission_count || 0), 0);

    const remainingDays = getRemainingDays();


    return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.28),transparent_42%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_55%,#e8eeff_100%)]" />
            <ManageTopBar
                backHref="/manage/control"
                subtitle="ระบบวิเคราะห์ผล"
                title="แดชบอร์ดสถิติการใช้งาน"
            />

            <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-10">
                {/* Header & Filter */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-7 md:mb-10 gap-4 md:gap-6">
                    <div>
                        <h1 className="mb-2 text-2xl md:text-3xl font-black tracking-tight text-[#050579]">ภาพรวมแดชบอร์ด</h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[#475569] text-sm md:text-base">
                            <Calendar size={16} />
                            <span>สมาชิก: <strong className="text-[#F97316]">เหลืออีก {remainingDays} วัน</strong></span>
                            {profile?.expiration_date && (
                                <span className="text-xs text-[#64748B]">
                                    (หมดอายุ: {new Date(profile.expiration_date).toLocaleDateString('th-TH')})
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:flex w-full rounded-2xl border border-[#D9E1F2] bg-white p-1 md:w-auto gap-1 md:gap-0">
                        {['today', '7days', '30days', 'all'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`whitespace-nowrap rounded-xl px-3 md:px-4 py-2 text-xs md:text-sm font-bold transition-all ${period === p ? 'bg-[#F6F8FF] text-[#050579] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
                            >
                                {p === 'today' ? 'วันนี้' : p === '7days' ? '7 วันที่ผ่านมา' : p === '30days' ? '30 วันที่ผ่านมา' : 'ทั้งหมด'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-24">
                            <Loader2 className="animate-spin text-[#F97316]" size={32} />
                            <span className="font-medium tracking-wide text-[#64748B]">กำลังโหลดข้อมูล...</span>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-10">
                            <StatCard
                                title="ยอดเข้าดูนามบัตร"
                                mobileTitle="ดูนามบัตร"
                                value={stats?.VIEW_PROFILE || 0}
                                icon={<Eye size={18} className="text-[#050579]" />}
                                color="bg-[#050579]/[0.06] border-[#050579]/15"
                                compact
                            />
                            <StatCard
                                title="บันทึกผู้ติดต่อ"
                                mobileTitle="บันทึกติดต่อ"
                                value={stats?.DOWNLOAD_VCF || 0}
                                icon={<User size={18} className="text-[#050579]" />}
                                color="bg-[#050579]/[0.06] border-[#050579]/15"
                                compact
                            />
                            <StatCard
                                title="ยอดดูแคตตาล็อก"
                                mobileTitle="ดูแคตตาล็อก"
                                value={stats?.VIEW_CATALOG || 0}
                                icon={<Database size={18} className="text-[#050579]" />}
                                color="bg-[#050579]/[0.06] border-[#050579]/15"
                                compact
                            />
                            <StatCard
                                title="ดาวน์โหลด PDF"
                                mobileTitle="ดาวน์โหลด PDF"
                                value={stats?.DOWNLOAD_PDF || 0}
                                icon={<FileText size={18} className="text-[#050579]" />}
                                color="bg-[#050579]/[0.06] border-[#050579]/15"
                                compact
                            />
                        </div>

                        {/* Funnel Stats Grid */}
                        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 mb-6 md:mb-10">
                            <StatCard
                                title="ยอดดูหน้าร้านออนไลน์"
                                mobileTitle="ดูหน้าร้าน"
                                value={stats?.VIEW_LANDING_PAGE || 0}
                                icon={<LineChart size={16} className="text-[#050579]" />}
                                color="bg-[#050579]/[0.06] border-[#050579]/15"
                                compact
                            />
                            <StatCard
                                title="จำนวนคนที่กรอกฟอร์ม"
                                mobileTitle="กรอกฟอร์ม"
                                value={totalFormSubmissions || stats?.SUBMIT_LANDING_FORM || 0}
                                icon={<Download size={16} className="text-[#050579]" />}
                                color="bg-[#050579]/[0.06] border-[#050579]/15"
                                compact
                            />
                            <StatCard
                                title="สแกน QR ทั้งหมด"
                                mobileTitle="สแกน QR"
                                value={stats?.SCAN_QR || 0}
                                icon={<QrCode size={16} className="text-[#050579]" />}
                                color="bg-[#050579]/[0.06] border-[#050579]/15"
                                compact
                            />
                        </div>

                        <div className="mb-7 rounded-[28px] border border-[#D9E1F2] bg-white p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.16)] md:rounded-[32px] md:p-8">
                            <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
                                <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-[#050579] md:text-xl">
                                    <FileText size={20} className="text-[#050579]" />
                                    สถิติแบบฟอร์ม
                                </h3>
                                <Link href="/manage/forms" className="text-[11px] font-black uppercase tracking-[0.18em] text-[#F97316]">
                                    จัดการฟอร์ม
                                </Link>
                            </div>
                            {forms.length === 0 ? (
                                <p className="text-sm text-[#64748B]">ยังไม่มีแบบฟอร์มในระบบ คุณสามารถเริ่มสร้างได้จากเมนูฟอร์มบันทึกข้อมูล</p>
                            ) : (
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {forms.map((form: any) => (
                                        <div key={form.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#E7ECF7] bg-[#F8FAFF] p-3 md:p-4">
                                            <div className="min-w-0">
                                                <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#64748B]">แบบฟอร์ม</p>
                                                <p className="truncate text-sm font-semibold">{form.name || '(ไม่มีชื่อฟอร์ม)'}</p>
                                                <p className="text-xs text-[#64748B]">{form.fields?.length || 0} ช่องข้อมูล</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black">{Number(form.submission_count || 0).toLocaleString()}</div>
                                                <div className="text-[10px] uppercase tracking-widest text-[#64748B]">คนกรอกฟอร์ม</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-7 md:mb-10">
                            {/* Bar Chart */}
                            <div className="group relative overflow-hidden rounded-[28px] md:rounded-[36px] border border-[#D9E1F2] bg-white p-4 md:p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.16)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#EEF2FF] via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                                <div className="flex items-center justify-between mb-4 md:mb-8 relative z-10">
                                    <h3 className="text-base md:text-xl font-bold tracking-tight text-[#050579]">แยกตามประเภทการใช้งาน</h3>
                                    <div className="hidden sm:flex gap-4">
                                        {chartData.slice(0, 3).map((item, i) => (
                                            <div key={i} className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-[10px] font-medium text-[#64748B]">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-64 md:h-80 w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 12, right: isMobile ? 8 : 30, left: 0, bottom: 0 }}>
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
                                                tick={{ fill: 'currentColor', fontSize: isMobile ? 9 : 10, opacity: 0.5 }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                                dy={8}
                                                tickFormatter={(_, index) => chartData[index]?.shortName || ''}
                                            />
                                            <YAxis 
                                                stroke="currentColor" 
                                                tick={{ fill: 'currentColor', fontSize: isMobile ? 9 : 10, opacity: 0.5 }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                                width={isMobile ? 26 : 34}
                                            />
                                            <Tooltip
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.96)', 
                                                    borderColor: '#D9E1F2', 
                                                    borderRadius: '20px',
                                                    border: '1px solid #D9E1F2',
                                                    boxShadow: '0 20px 40px -24px rgba(15,23,42,0.18)'
                                                }}
                                                itemStyle={{ color: '#0F172A', fontSize: '12px', fontWeight: '800' }}
                                                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                                            />
                                            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={isMobile ? 20 : 32} animationDuration={1500} animationEasing="ease-out">
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`url(#colorBar-${index})`} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Line Chart */}
                            <div className="group relative overflow-hidden rounded-[28px] md:rounded-[36px] border border-[#D9E1F2] bg-white p-4 md:p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.16)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#EAF4FF] via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                                <div className="mb-4 md:mb-8 relative z-10">
                                    <h3 className="text-base md:text-xl font-bold tracking-tight text-[#050579]">การเติบโตของผู้เข้าชม (Engagement)</h3>
                                    <p className="mt-1 text-xs text-[#64748B]">จำนวนการใช้งานรวมในแต่ละวัน</p>
                                </div>
                                <div className="h-64 md:h-80 w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ReLineChart data={dailyStats} margin={{ top: 12, right: isMobile ? 8 : 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#050579" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#050579" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} opacity={0.03} />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke="currentColor" 
                                                tick={{ fill: 'currentColor', fontSize: isMobile ? 9 : 10, opacity: 0.5 }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                                dy={8}
                                                tickFormatter={(str) => {
                                                    const d = new Date(str);
                                                    return d.toLocaleDateString('th-TH', { day: 'numeric', month: isMobile ? 'numeric' : 'short' });
                                                }}
                                            />
                                            <YAxis 
                                                stroke="currentColor" 
                                                tick={{ fill: 'currentColor', fontSize: isMobile ? 9 : 10, opacity: 0.5 }} 
                                                axisLine={false} 
                                                tickLine={false} 
                                                width={isMobile ? 26 : 34}
                                            />
                                            <Tooltip
                                                labelFormatter={(label) => new Date(label).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                                                contentStyle={{ 
                                                    backgroundColor: 'rgba(255,255,255,0.96)', 
                                                    borderColor: '#D9E1F2', 
                                                    borderRadius: '20px',
                                                    border: '1px solid #D9E1F2',
                                                    boxShadow: '0 20px 40px -24px rgba(15,23,42,0.18)'
                                                }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="count" 
                                                stroke="#050579" 
                                                strokeWidth={isMobile ? 3 : 5} 
                                                dot={{ r: isMobile ? 4 : 6, fill: '#050579', strokeWidth: 3, stroke: '#FFFFFF' }}
                                                activeDot={{ r: isMobile ? 5 : 8, strokeWidth: 4, stroke: '#FFFFFF' }}
                                                animationDuration={2000}
                                            />
                                        </ReLineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Landing pages performance */}
                        <div className="rounded-[28px] md:rounded-[32px] border border-[#D9E1F2] bg-white p-4 md:p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.16)]">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-2">
                                <h3 className="flex items-center gap-2 text-base md:text-xl font-bold tracking-tight text-[#050579]">
                                    <LineChart size={20} className="text-[#050579]" />
                                    สถิติหน้าร้านออนไลน์
                                </h3>
                                {landingLoading && (
                                    <span className="flex items-center gap-2 text-xs text-[#64748B]">
                                        <Loader2 className="animate-spin" size={14} />
                                        กำลังโหลดสถิติหน้าเพจ...
                                    </span>
                                )}
                            </div>
                            {landingPages.length === 0 ? (
                                <p className="text-sm text-[#64748B]">
                                    ยังไม่มีหน้าร้านออนไลน์ในระบบ คุณสามารถเริ่มสร้างได้จากเมนูหน้าร้านออนไลน์
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    {landingPages.map((page: any) => {
                                        const views = landingViews[page.id] ?? 0;
                                        return (
                                            <div
                                                key={page.id}
                                                className="flex items-center justify-between gap-3 rounded-2xl border border-[#E7ECF7] bg-[#F8FAFF] p-3 md:p-4"
                                            >
                                                <div className="min-w-0">
                                                    <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#64748B]">
                                                        หน้าร้านออนไลน์
                                                    </p>
                                                    <p className="text-xs md:text-sm font-semibold truncate mb-1">
                                                        {page.title || '(ไม่มีชื่อเพจ)'}
                                                    </p>
                                                    <p className="truncate text-xs text-[#64748B]">
                                                        /lp/{page.slug}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl md:text-2xl font-black">{views.toLocaleString()}</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-[#64748B]">
                                                        จำนวนผู้เข้าชม
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

function StatCard({ title, mobileTitle, value, icon, color, compact = false }: any) {
    return (
        <div
            className={`flex cursor-default items-center justify-between border transition-all hover:scale-[1.02] ${color} shadow-[0_20px_50px_-36px_rgba(15,23,42,0.14)] ${
                compact
                    ? 'min-h-[84px] rounded-[18px] p-2.5 md:min-h-[148px] md:rounded-[32px] md:p-8'
                    : 'min-h-[108px] rounded-[22px] p-3 md:min-h-[148px] md:rounded-[32px] md:p-8'
            }`}
        >
            <div>
                <p className={`mb-1 md:mb-2 font-black uppercase text-[#64748B] leading-tight ${compact ? 'text-[8px] tracking-[0.05em] md:text-xs md:tracking-widest' : 'text-[9px] tracking-[0.08em] md:text-xs md:tracking-widest'}`}>
                    <span className="md:hidden">{mobileTitle || title}</span>
                    <span className="hidden md:inline">{title}</span>
                </p>
                <h3 className={`${compact ? 'text-xl md:text-4xl' : 'text-2xl md:text-4xl'} font-black tracking-tighter text-[#050579]`}>{value.toLocaleString()}</h3>
            </div>
            <div className={`${compact ? 'w-8 h-8 rounded-lg md:w-14 md:h-14 md:rounded-2xl' : 'w-10 h-10 rounded-xl md:w-14 md:h-14 md:rounded-2xl'} flex items-center justify-center ${color.split(' ')[0]} shadow-inner`}>
                {icon}
            </div>
        </div>
    );
}
