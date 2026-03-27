"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Plus, Layout, Globe, Trash2,
  ExternalLink, Eye, EyeOff,
  Calendar, Loader2, Sparkles, QrCode as QrIcon, Share2, Twitter, MessageCircle, Facebook,
  Edit2, Share as ShareIcon, Copy
} from 'lucide-react';
import Link from 'next/link';
import { QrCodeImage } from '@/components/QrCode';
import ManageTopBar from '@/components/ManageTopBar';

const LineIcon = ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
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

const sanitizeSlug = (value: string): string =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');

const generateSlugFallback = (): string => {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randomPart = Math.random().toString(36).slice(2, 6);
    return `lp-${datePart}-${randomPart}`;
};

const createSmartSlug = (value: string): string => {
    const sanitized = sanitizeSlug(value);
    return sanitized || generateSlugFallback();
};

export default function LandingPagesListPage() {
    const router = useRouter();
    const [pages, setPages] = useState<LandingPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newPage, setNewPage] = useState({ title: '', slug: '' });
    const [slugEdited, setSlugEdited] = useState(false);

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
        if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหน้าร้านนี้?')) return;
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
        <div className="relative min-h-screen bg-[#EEF0FF] text-[#0F172A] pb-20 font-sans">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%)]" />
            </div>

            <ManageTopBar
                backHref="/manage/control-center"
                subtitle="ระบบจัดการหน้าร้านดิจิทัล"
                title="จัดการหน้าร้านดิจิทัล"
                actions={(
                    <button
                        onClick={() => {
                            setNewPage({ title: '', slug: '' });
                            setSlugEdited(false);
                            setShowModal(true);
                        }}
                        className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md"
                    >
                        <Plus size={18} /> <span>สร้างใหม่</span>
                    </button>
                )}
            />

            <main className="max-w-7xl mx-auto px-6 mt-8">
                <div className="flex flex-col gap-4">
                    {pages.map((page) => {
                        const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/lp/${page.slug}`;
                        return (
                            <div key={page.id} className="bg-white rounded-[30px] border border-[#D9E1F2] shadow-sm overflow-hidden flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_300px] group">
                                {/* Left Content */}
                                <div className="p-6 md:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D9E1F2]">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-[#16A34A] shadow-inner">
                                                <Layout size={28} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-[2rem] font-black text-[#050579] tracking-tight leading-tight">{page.title}</h3>
                                                    <span className="bg-[#F0FDF4] text-[#16A34A] text-[10px] font-black uppercase px-3 py-1 rounded-full border border-[#DCFCE7]">
                                                        • Active
                                                    </span>
                                                </div>
                                                <p className="text-[#64748B] font-medium">{page.description || 'สร้างหน้าร้านดิจิทัลสำหรับขายสินค้าและเก็บข้อมูลลูกค้า'}</p>
                                                <div className="mt-2 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                                                    {viewCounts[page.id] ?? 0} views • สร้างเมื่อ {new Date(page.created_at).toLocaleDateString('th-TH')}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap items-center gap-2.5 mt-5">
                                            <Link 
                                                href={`/manage/landing-pages/${page.id}`}
                                                className="bg-[#050579] text-white px-6 py-3 rounded-2xl font-black text-sm tracking-wide hover:bg-[#0a0a8f] transition-all shadow-md active:scale-95"
                                            >
                                                จัดการหน้าร้าน
                                            </Link>
                                            <Link 
                                                href={`/lp/${page.slug}`} 
                                                target="_blank"
                                                className="border border-[#D9E1F2] bg-[#F6F8FF] text-[#050579] px-4 py-3 rounded-2xl font-bold text-sm tracking-wide flex items-center gap-2 hover:bg-white transition-all"
                                            >
                                                <ExternalLink size={16} /> ดูหน้าสาธารณะ
                                            </Link>
                                            <button 
                                                onClick={() => toggleVisibility(page)}
                                                className="w-10 h-10 rounded-2xl border border-[#D9E1F2] flex items-center justify-center text-[#64748B] hover:bg-gray-50 transition-all active:scale-95"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deletePage(page.id)}
                                                className="w-10 h-10 rounded-2xl border border-[#F6D5BF] flex items-center justify-center text-red-500 hover:bg-red-50 transition-all active:scale-95"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right QR & Social */}
                                <div className="w-full bg-[#F8FAFC] p-6 flex flex-col items-center justify-center text-center">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-[#E2E8F0] mb-3">
                                        <QrCodeImage url={shareUrl} size={150} />
                                    </div>
                                    <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.14em] mb-4">สแกนเพื่อเข้าชมหน้าร้าน</p>
                                    
                                    {/* Social Icons */}
                                    <div className="flex items-center gap-2.5">
                                        <a 
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
                                            target="_blank" 
                                            className="w-10 h-10 bg-[#1877F2]/10 text-[#1877F2] rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all transform hover:-translate-y-1"
                                        >
                                            <Facebook size={18} fill="currentColor" />
                                        </a>
                                        <a 
                                            href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`} 
                                            target="_blank" 
                                            className="w-10 h-10 bg-[#00B900]/10 text-[#00B900] rounded-full flex items-center justify-center hover:bg-[#00B900] hover:text-white transition-all transform hover:-translate-y-1"
                                        >
                                            <LineIcon size={20} />
                                        </a>
                                        <a 
                                            href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} 
                                            target="_blank" 
                                            className="w-10 h-10 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all transform hover:-translate-y-1"
                                        >
                                            <WhatsAppIcon size={20} />
                                        </a>
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(shareUrl);
                                                    alert('คัดลอกลิงก์แล้ว!');
                                                } catch {}
                                            }}
                                            className="w-10 h-10 bg-gray-200 text-[#64748B] rounded-full flex items-center justify-center hover:bg-[#050579] hover:text-white transition-all transform hover:-translate-y-1"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
                    <div className="bg-white border border-[#D9E1F2] rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl">
                        <h2 className="text-2xl font-black text-[#050579] mb-2">สร้างหน้าร้านใหม่</h2>
                        <p className="text-[#64748B] text-sm mb-8 font-medium">เริ่มต้นสร้างหน้า NEX Sale Page สำหรับโปรเจกต์ของคุณ</p>
                        
                        <form onSubmit={createPage} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-[#64748B] uppercase mb-2 ml-1 tracking-widest">ชื่อหน้าร้าน</label>
                                <input
                                    required
                                    className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all font-bold text-[#050579]"
                                    placeholder="เช่น หน้าร้านโปรโมชันเปิดตัว..."
                                    value={newPage.title}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setNewPage((prev) => ({
                                            title: val,
                                            slug: slugEdited ? prev.slug : createSmartSlug(val),
                                        }));
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[#64748B] uppercase mb-2 ml-1 tracking-widest">URL SLUG</label>
                                <div className="flex items-center gap-2 bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#F97316]/20 transition-all">
                                    <span className="text-[#94A3B8] font-bold text-sm">/lp/</span>
                                    <input
                                        required
                                        className="bg-transparent border-none focus:ring-0 w-full outline-none font-bold text-[#050579]"
                                        placeholder="url-slug"
                                        value={newPage.slug}
                                        onChange={e => {
                                            setSlugEdited(true);
                                            setNewPage({ ...newPage, slug: createSmartSlug(e.target.value) });
                                        }}
                                    />
                                </div>
                                <p className="mt-2 ml-1 text-[11px] font-medium text-[#94A3B8]">
                                    ระบบรองรับเฉพาะอังกฤษ ตัวเลข และขีด ถ้าชื่อเป็นภาษาไทยจะสร้าง slug อัตโนมัติแบบปลอดภัยให้
                                </p>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl border border-[#D9E1F2] font-black text-xs uppercase tracking-widest text-[#64748B] hover:bg-gray-50 transition-colors">ยกเลิก</button>
                                <button className="flex-[2] bg-[#F97316] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-[#EA580C] transition-all active:scale-95">สร้างหน้าร้าน</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
