"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Plus, Layout, Globe, ArrowLeft, Trash2,
  ExternalLink, Eye, EyeOff,
  Calendar, Loader2, Sparkles, QrCode as QrIcon, Share2, Twitter, MessageCircle, Facebook
} from 'lucide-react';
import Link from 'next/link';
import { QrCodeImage } from '@/components/QrCode';

const LineIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

interface LandingPage {
    id: number;
    title: string;
    slug: string;
    description: string;
    is_published: boolean;
    created_at: string;
}

export default function LandingPagesListPage() {
    const router = useRouter();
    const [pages, setPages] = useState<LandingPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
    const [newPage, setNewPage] = useState({ title: '', slug: '' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = Cookies.get('token');

    const [viewCounts, setViewCounts] = useState<Record<number, number>>({});

    const fetchPages = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/landing-pages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data: LandingPage[] = await res.json();
                setPages(data);

                // ดึง view count ต่อหน้าแบบขนาน
                const results = await Promise.all(
                    data.map(async (page) => {
                        try {
                            const r = await fetch(`${API_URL}/analytics/landing-pages/${page.id}/views`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!r.ok) return { id: page.id, views: 0 };
                            const json = await r.json();
                            return { id: page.id, views: json.views ?? 0 };
                        } catch {
                            return { id: page.id, views: 0 };
                        }
                    })
                );
                const map: Record<number, number> = {};
                results.forEach((item) => {
                    map[item.id] = item.views;
                });
                setViewCounts(map);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [API_URL, token]);

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchPages();
    }, [fetchPages, router, token]);

    const createPage = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/landing-pages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newPage)
            });
            if (res.ok) {
                const data = await res.json();
                router.push(`/manage/landing-pages/${data.id}`);
            } else {
                alert('เกิดข้อผิดพลาดในการสร้าง หรือ Slug อาจซ้ำกัน');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deletePage = async (id: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหน้าแคมเปญนี้?')) return;
        try {
            const res = await fetch(`${API_URL}/landing-pages/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchPages();
        } catch (error) {
            console.error(error);
        }
    };

    const toggleVisibility = async (page: LandingPage) => {
        try {
            const res = await fetch(`${API_URL}/landing-pages/${page.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ is_published: !page.is_published })
            });
            if (res.ok) fetchPages();
        } catch {}
    };

    if (loading) return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#F97316]" size={32} />
        </div>
    );

    return (
        <div className="relative min-h-screen bg-[#EEF0FF] text-[#0F172A]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%),linear-gradient(180deg,#f8faff_0%,#eef0ff_50%,#e8eeff_100%)]" />
                <div className="absolute left-[-7rem] top-10 h-80 w-80 rounded-full bg-sky-300/16 blur-[120px]" />
                <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-[#050579]/8 blur-[120px]" />
                <div className="absolute inset-x-0 top-0 mx-auto h-[24rem] max-w-6xl rounded-full bg-white/28 blur-[120px]" />
            </div>
            {/* Navbar */}
            <nav className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex h-20 items-center justify-between rounded-[28px] border border-[#D9E1F2] bg-white/84 px-5 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <Link href="/manage/control-center" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] transition-colors hover:bg-white">
                            <ArrowLeft size={18} className="text-[#64748B] group-hover:text-[#050579] transition-colors" />
                        </Link>
                        <div>
                            <div className="hidden text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B] sm:block">NEX Solution</div>
                            <h1 className="font-black text-lg tracking-tight text-[#050579]">จัดการ Landing Page</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowModal(true)}
                            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_18px_40px_-26px_rgba(249,115,22,0.45)] active:scale-95"
                        >
                            <Plus size={18} /> <span className="hidden sm:inline">สร้างใหม่</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 md:py-10">
                <section className="relative mb-10 overflow-hidden rounded-[36px] border border-[#D9E1F2] bg-white/92 p-6 shadow-[0_34px_100px_-54px_rgba(15,23,42,0.24)] backdrop-blur-sm md:p-8">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(5,5,121,0.06),transparent_32%)]" />
                    <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-2xl space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#050579]">
                                    Landing Pages
                                </span>
                                <span className="rounded-full border border-[#F6D5BF] bg-[#FFF7F1] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#C2410C]">
                                    {pages.length} แคมเปญทั้งหมด
                                </span>
                            </div>
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter text-[#050579]">จัดการแคมเปญ</h2>
                                <p className="mt-3 max-w-xl text-base leading-7 text-[#475569]">
                                    สร้าง เปิดเผยแพร่ และติดตามหน้า Landing Page ของคุณจากแดชบอร์ดเดียวในภาษาเดียวกับระบบ NEX
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:w-auto">
                            <div className="flex min-h-[88px] min-w-[180px] items-center gap-3 rounded-[24px] border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#050579]">
                                    <Layout size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">ทั้งหมด</div>
                                    <div className="text-xl font-black leading-tight text-[#050579]">{pages.length}</div>
                                    <div className="mt-1 text-xs text-[#64748B]">หน้าแคมเปญในระบบ</div>
                                </div>
                            </div>
                            <div className="flex min-h-[88px] min-w-[180px] items-center gap-3 rounded-[24px] border border-[#CFE9D6] bg-[#F3FCF5] px-4 py-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEFBEF] text-[#16A34A]">
                                    <Eye size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">เผยแพร่แล้ว</div>
                                    <div className="text-xl font-black leading-tight text-[#166534]">{pages.filter((page) => page.is_published).length}</div>
                                    <div className="mt-1 text-xs text-[#64748B]">พร้อมใช้งานทันที</div>
                                </div>
                            </div>
                            <div className="flex min-h-[88px] min-w-[180px] items-center gap-3 rounded-[24px] border border-[#F6D5BF] bg-[#FFF7F1] px-4 py-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316]">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">ยอดรวมวิว</div>
                                    <div className="text-xl font-black leading-tight text-[#C2410C]">{Object.values(viewCounts).reduce((sum, count) => sum + count, 0)}</div>
                                    <div className="mt-1 text-xs text-[#78716C]">รวมทุกหน้าแคมเปญ</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {pages.length === 0 ? (
                    <div className="text-center py-28 border-2 border-dashed border-[#D9E1F2] rounded-[40px] bg-white/86 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.18)]">
                        <div className="w-24 h-24 bg-[#F6F8FF] rounded-full flex items-center justify-center mx-auto mb-8">
                            <Layout size={40} className="text-[#CBD5E1]" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 tracking-tight text-[#050579]">ยังไม่มีหน้าแคมเปญ</h3>
                        <p className="text-[#64748B] max-w-sm mx-auto mb-10 font-medium">เริ่มต้นสร้าง Landing Page แรกของคุณเพื่อเพิ่มยอดขาย เก็บ lead และวัดผลได้ใน workflow เดียว</p>
                        <button onClick={() => setShowModal(true)} className="bg-[#F97316] text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-[#EA580C] transition-all shadow-[0_18px_40px_-24px_rgba(249,115,22,0.42)]">สร้างหน้าเพจใหม่ตอนนี้</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pages.map((page) => {
                            const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/lp/${page.slug}`;
                            return (
                                <div key={page.id} className="group overflow-hidden rounded-[32px] border border-[#D9E1F2] bg-white shadow-[0_24px_70px_-44px_rgba(15,23,42,0.18)] transition-all duration-500 hover:-translate-y-1 hover:border-[#C7D2E5]">
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="flex-1 p-8">
                                            <div className="flex justify-between items-start mb-8">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${page.is_published ? 'bg-[#EEFBEF] text-[#16A34A]' : 'bg-[#F6F8FF] text-[#94A3B8]'}`}>
                                                    <Layout size={28} />
                                                </div>
                                                <div className="flex items-center gap-2 rounded-2xl bg-[#F6F8FF] border border-[#E7ECF7] px-2 py-2">
                                                    <button
                                                        onClick={() => toggleVisibility(page)}
                                                        className={`p-2.5 rounded-xl transition-all ${page.is_published ? 'text-[#16A34A] bg-[#EEFBEF]' : 'text-[#94A3B8] bg-white hover:bg-[#F6F8FF]'}`}
                                                        title={page.is_published ? 'ซ่อนหน้า' : 'เผยแพร่'}
                                                    >
                                                        {page.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => deletePage(page.id)}
                                                        className="p-2.5 text-[#94A3B8] bg-white hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="ลบ"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black mb-3 text-[#050579] truncate tracking-tight">{page.title}</h3>
                                            <p className="text-[#64748B] text-sm mb-8 line-clamp-2 h-10 font-medium">{page.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
                                            <div className="grid grid-cols-2 gap-4 mb-10">
                                                <div className="p-4 bg-[#F6F8FF] border border-[#E7ECF7] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                                                    <Calendar size={14} className="text-[#050579]/70" />
                                                    {new Date(page.created_at).toLocaleDateString('th-TH')}
                                                </div>
                                                <div className="p-4 bg-[#F6F8FF] border border-[#E7ECF7] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#64748B] flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <Globe size={14} className="text-[#050579]/70 shrink-0" />
                                                        <span className="truncate">{page.slug}</span>
                                                    </div>
                                                    <div className="text-[9px] text-[#94A3B8]">{viewCounts[page.id] ?? 0} views</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <Link
                                                    href={`/manage/landing-pages/${page.id}`}
                                                    className="flex-1 bg-[#F97316] text-white hover:bg-[#EA580C] py-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest transition-all shadow-[0_18px_40px_-24px_rgba(249,115,22,0.42)] active:scale-95"
                                                >
                                                    แก้ไขดีไซน์
                                                </Link>
                                                <Link
                                                    href={`/lp/${page.slug}`}
                                                    target="_blank"
                                                    className="w-14 flex items-center justify-center bg-[#F6F8FF] text-[#050579] hover:bg-white py-4 rounded-2xl border border-[#D9E1F2] transition-all active:scale-95"
                                                    title="ดูหน้าเพจ"
                                                >
                                                    <ExternalLink size={20} />
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="border-t border-[#E7ECF7] bg-[#FBFCFF] p-6 flex flex-col items-center justify-between gap-5 lg:w-[240px] lg:border-t-0 lg:border-l">
                                            <div className="w-full flex flex-col items-center">
                                                <QrCodeImage url={shareUrl} size={172} className="p-0 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.35)]" />
                                                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">แชร์แคมเปญนี้</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="w-10 h-10 bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white rounded-full flex items-center justify-center transition-all" title="แชร์ไป Facebook">
                                                    <Facebook size={18} />
                                                </a>
                                                <a href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="w-10 h-10 bg-[#00B900]/10 hover:bg-[#00B900] text-[#00B900] hover:text-white rounded-full flex items-center justify-center transition-all" title="แชร์ไป LINE">
                                                    <LineIcon />
                                                </a>
                                                <a href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} target="_blank" className="w-10 h-10 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-full flex items-center justify-center transition-all" title="แชร์ไป WhatsApp">
                                                    <WhatsAppIcon />
                                                </a>
                                                <button onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(shareUrl);
                                                        alert('คัดลอกลิงก์แล้ว!');
                                                    } catch {}
                                                }} className="w-10 h-10 bg-[#0F172A]/5 hover:bg-[#0F172A] text-[#64748B] hover:text-white rounded-full flex items-center justify-center transition-all" title="คัดลอกลิงก์">
                                                    <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/28 backdrop-blur-xl animate-in fade-in transition-all" onClick={() => setShowModal(false)} />
                    <div className="bg-white border border-[#D9E1F2] rounded-[36px] p-8 w-full max-w-md relative z-10 shadow-[0_34px_100px_-48px_rgba(15,23,42,0.32)] animate-in zoom-in-95 duration-300">
                        <div className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tight text-[#050579]">สร้างแคมเปญใหม่</h2>
                            <p className="text-[#64748B] text-sm mt-2 font-medium">เริ่มต้นด้วยการตั้งชื่อและ URL สำหรับเพจตัวใหม่ของคุณ</p>
                        </div>

                        <form onSubmit={createPage} className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">ชื่อแคมเปญ</label>
                                <input
                                    required
                                    className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all font-bold text-lg text-[#0F172A]"
                                    placeholder="เช่นโปรโมชั่นลดราคา..."
                                    value={newPage.title}
                                    onChange={e => {
                                        const newTitle = e.target.value;
                                        setNewPage({ 
                                            title: newTitle, 
                                            slug: newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') 
                                        });
                                    }}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] ml-1">Slug URL (สำหรับเข้าถึงหน้าเว็บ)</label>
                                <div className="flex items-center gap-2 bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-6 py-4 group focus-within:ring-2 focus-within:ring-[#F97316]/20 transition-all">
                                    <span className="text-[#64748B] text-sm font-bold">/lp/</span>
                                    <input
                                        required
                                        className="bg-transparent border-none focus:ring-0 text-lg w-full outline-none font-bold placeholder:font-normal text-[#0F172A]"
                                        placeholder="your-url-slug"
                                        value={newPage.slug}
                                        onChange={e => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] text-[#0F172A] font-black uppercase tracking-widest text-xs hover:bg-white transition-colors">ยกเลิก</button>
                                <button className="flex-[2] bg-[#F97316] hover:bg-[#EA580C] text-white font-black py-4 rounded-2xl shadow-[0_18px_40px_-24px_rgba(249,115,22,0.42)] transition-all active:scale-95 uppercase tracking-widest text-xs">สร้างโปรเจกต์ใหม่</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* QR Code Modal */}
            {showQrModal && selectedPage && (
                <QrCodeModal 
                    url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/lp/${selectedPage.slug}`}
                    title={selectedPage.title}
                    onClose={() => {
                        setShowQrModal(false);
                        setSelectedPage(null);
                    }}
                />
            )}

            {/* Share Modal */}
            {showShareModal && selectedPage && (
                <ShareModal 
                    url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/lp/${selectedPage.slug}`}
                    title={selectedPage.title}
                    onClose={() => {
                        setShowShareModal(false);
                        setSelectedPage(null);
                    }}
                />
            )}
        </div>
    );
}

function QrCodeModal({ url, title, onClose }: { url: string, title: string, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="bg-white border border-[#D9E1F2] rounded-[40px] w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500">
                <button onClick={onClose} className="absolute top-6 right-6 z-20 w-12 h-12 bg-[#F6F8FF] hover:bg-white rounded-full flex items-center justify-center text-[#050579] transition-colors border border-[#D9E1F2]">
                    <ArrowLeft size={24} />
                </button>

                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-[#F6F8FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <QrIcon size={40} className="text-[#050579]" />
                    </div>
                    
                    <h3 className="text-2xl font-black mb-4 text-[#050579]">QR Code</h3>
                    <p className="text-[#64748B] mb-8">สแกนเพื่อเปิด Landing Page นี้บนมือถือ</p>
                    
                    <div className="bg-white p-6 rounded-2xl mb-6 border border-[#D9E1F2]">
                        <QrCodeImage 
                            url={url}
                            size={256}
                            className="w-full h-auto"
                        />
                    </div>
                    
                    <p className="text-sm text-[#64748B] mb-2">{title}</p>
                    <p className="text-xs text-[#94A3B8]">{url}</p>
                </div>
            </div>
        </div>
    );
}

function ShareModal({ url, title, onClose }: { url: string, title: string, onClose: () => void }) {
    const shareText = `ดู Landing Page ${title} สินค้าและบริการน่าสนใจมากมาย!`;

    const shareLinks = [
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-blue-600',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        },
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'bg-sky-500',
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
        },
        {
            name: 'LINE',
            icon: MessageCircle,
            color: 'bg-green-500',
            href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
        }
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(url);
            alert('คัดลอกลิงก์แล้ว!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="bg-white border border-[#D9E1F2] rounded-[40px] w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500">
                <button onClick={onClose} className="absolute top-6 right-6 z-20 w-12 h-12 bg-[#F6F8FF] hover:bg-white rounded-full flex items-center justify-center text-[#050579] transition-colors border border-[#D9E1F2]">
                    <ArrowLeft size={24} />
                </button>

                <div className="p-8">
                    <div className="w-20 h-20 bg-[#F6F8FF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Share2 size={40} className="text-[#050579]" />
                    </div>
                    
                    <h3 className="text-2xl font-black mb-4 text-[#050579]">แชร์ Landing Page</h3>
                    <p className="text-[#64748B] mb-8">เชิญเพื่อนๆ มาชม Landing Page ของคุณ</p>
                    
                    <div className="space-y-3 mb-6">
                        {shareLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                className="w-full flex items-center gap-4 p-4 bg-[#F6F8FF] hover:bg-white rounded-2xl transition-all group border border-[#D9E1F2]"
                            >
                                <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center text-white`}>
                                    <link.icon size={20} />
                                </div>
                                <span className="font-medium group-hover:text-[#050579] transition-colors text-[#0F172A]">{link.name}</span>
                            </a>
                        ))}
                    </div>
                    
                    <button
                        onClick={copyToClipboard}
                        className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
                    >
                        <ExternalLink size={20} />
                        คัดลอกลิงก์
                    </button>
                </div>
            </div>
        </div>
    );
}
