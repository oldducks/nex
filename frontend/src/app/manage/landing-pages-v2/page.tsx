"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  ArrowLeft, Plus, Layout, Trash2,
  ExternalLink, Loader2, Facebook, Copy, ChevronDown, ChevronUp, QrCode as QrIcon, Share2
} from 'lucide-react';
import Link from 'next/link';
import { QrCodeImage } from '@/components/QrCode';
import { Toast, type ToastType } from '@/components/Toast';

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

interface MeProfile {
    subscription_tier?: string;
}

const sanitizeSlug = (value: string): string =>
    value
        .trim()
        .replace(/[^a-zA-Z0-9ก-๙\u0E00-\u0E7F]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-')
        .toLowerCase();

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
    const pathname = usePathname();
    const [pages, setPages] = useState<LandingPage[]>([]);
    const [currentPlanLabel, setCurrentPlanLabel] = useState('แผนพื้นฐาน');
    const [expandedPanel, setExpandedPanel] = useState<{ pageId: number | null; type: 'qr' | 'share' | null }>({
        pageId: null,
        type: null,
    });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newPage, setNewPage] = useState({ title: '', slug: '' });
    const [slugEdited, setSlugEdited] = useState(false);
    const [deletingPage, setDeletingPage] = useState<LandingPage | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = Cookies.get('token');
    const editorBasePath = pathname?.startsWith('/manage/landing-pages-v2')
        ? '/manage/landing-pages-v2'
        : '/manage/landing-pages';

    const [viewCounts, setViewCounts] = useState<Record<number, number>>({});

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const resolvePlanLabel = (tier?: string) => {
        if (tier === 'premium') return 'แผนพรีเมียม';
        return 'แผนพื้นฐาน';
    };

    const fetchPages = useCallback(async () => {
        try {
            const profileRes = await fetch(`${API_URL}/profile/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const profileData: MeProfile = await profileRes.json();
                setCurrentPlanLabel(resolvePlanLabel(profileData.subscription_tier));
            }

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
                router.push(`${editorBasePath}/${data.id}`);
            } else {
                showToast('เกิดข้อผิดพลาดในการสร้าง หรือ Slug อาจซ้ำกัน', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('สร้างหน้าร้านไม่สำเร็จ กรุณาลองใหม่', 'error');
        }
    };

    const deletePage = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/landing-pages/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setDeletingPage(null);
                showToast('ลบหน้าร้านสำเร็จ', 'success');
                fetchPages();
            } else {
                showToast('ลบหน้าร้านไม่สำเร็จ กรุณาลองใหม่', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('ลบหน้าร้านไม่สำเร็จ กรุณาลองใหม่', 'error');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#F97316]" size={32} />
        </div>
    );

    return (
        <div className="relative min-h-screen bg-[#EEF0FF] pb-20 font-sans text-[#0F172A]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%)]" />
            </div>

            <nav className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/80 backdrop-blur-md">
                <div className="relative mx-auto flex h-20 w-full max-w-md items-center px-4">
                    <Link
                        href="/manage/control-center"
                        className="absolute left-6 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] group"
                        title="ย้อนกลับ"
                    >
                        <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
                    </Link>

                    <div className="mx-auto flex min-w-0 flex-col items-center text-center">
                        <div className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">
                            NEX Sale Page
                        </div>
                        <div className="text-sm font-bold text-[#050579]">
                            สถานะ : {currentPlanLabel}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 mx-auto mt-6 w-full max-w-md px-4 pb-8">
                <div className="mb-8 flex justify-center">
                    <button
                        onClick={() => {
                            setNewPage({ title: '', slug: '' });
                            setSlugEdited(false);
                            setShowModal(true);
                        }}
                        className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#F97316] px-7 py-4 text-lg font-black text-white shadow-[0_20px_45px_-20px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C] active:scale-95"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/22">
                            <Plus size={22} strokeWidth={3} />
                        </span>
                        <span>สร้างร้านค้าออนไลน์</span>
                    </button>
                </div>

                <section className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)]">
                    <h2 className="text-sm font-bold text-[#050579]">หน้าร้านออนไลน์</h2>
                    <div className="mt-3 space-y-3">
                        {pages.map((page) => {
                            const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/lp/${encodeURIComponent(page.slug)}`;
                            const expandedType = expandedPanel.pageId === page.id ? expandedPanel.type : null;
                            const isQrExpanded = expandedType === 'qr';
                            const isShareExpanded = expandedType === 'share';

                            return (
                                <div key={page.id} className="overflow-hidden rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF]">
                                    <div className="px-4 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#16A34A]">
                                                <Layout size={22} strokeWidth={2.4} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="line-clamp-2 text-xl font-bold leading-tight text-[#050579]">
                                                            {page.title}
                                                        </h3>
                                                        <div className="mt-1 text-sm font-semibold text-[#94A3B8]">
                                                            {(viewCounts[page.id] ?? 0).toLocaleString('th-TH')} views • {new Date(page.created_at).toLocaleDateString('th-TH')}
                                                        </div>
                                                    </div>
                                                    <span className="shrink-0 rounded-full border border-[#D9E1F2] bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-[#16A34A]">
                                                        {page.is_published ? 'Active' : 'Draft'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-2 md:grid-cols-2">
                                            <Link
                                                href={`${editorBasePath}/${page.id}`}
                                                className="flex items-center justify-between rounded-2xl border border-[#D9E1F2] bg-white px-3 py-3 text-[#0F172A] transition hover:border-[#C7D2E5]"
                                            >
                                                <span className="text-sm font-semibold">จัดการร้าน</span>
                                                <ChevronDown size={16} className="rotate-[-90deg] text-[#475569]" />
                                            </Link>
                                            <Link
                                                href={`/lp/${encodeURIComponent(page.slug)}`}
                                                target="_blank"
                                                className="flex items-center justify-between rounded-2xl border border-[#D9E1F2] bg-white px-3 py-3 text-[#0F172A] transition hover:border-[#C7D2E5]"
                                            >
                                                <span className="flex items-center gap-2 text-sm font-semibold">
                                                    <ExternalLink size={16} className="text-[#050579]" />
                                                    ดูหน้าสาธารณะ
                                                </span>
                                                <ChevronDown size={16} className="rotate-[-90deg] text-[#475569]" />
                                            </Link>
                                        </div>

                                        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_48px] gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedPanel(isQrExpanded ? { pageId: null, type: null } : { pageId: page.id, type: 'qr' })
                                                }
                                                className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                                                    isQrExpanded
                                                        ? 'border-[#C7D2E5] bg-white text-[#050579]'
                                                        : 'border-[#D9E1F2] bg-[#F8FAFF] text-[#64748B] hover:border-[#C7D2E5]'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <QrIcon size={16} />
                                                    QR
                                                </span>
                                                {isQrExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedPanel(isShareExpanded ? { pageId: null, type: null } : { pageId: page.id, type: 'share' })
                                                }
                                                className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                                                    isShareExpanded
                                                        ? 'border-[#C7D2E5] bg-white text-[#050579]'
                                                        : 'border-[#D9E1F2] bg-[#F8FAFF] text-[#64748B] hover:border-[#C7D2E5]'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Share2 size={15} />
                                                    แชร์
                                                </span>
                                                {isShareExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                            </button>
                                            <button
                                                onClick={() => setDeletingPage(page)}
                                                className="flex items-center justify-center rounded-2xl border border-[#F6D5BF] bg-white text-red-500 transition hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {isQrExpanded && (
                                        <div className="border-t border-[#D9E1F2] bg-white px-4 py-4">
                                            <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4 text-center">
                                                <div className="mx-auto mb-3 w-fit rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
                                                    <QrCodeImage url={shareUrl} size={150} />
                                                </div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">สแกนเพื่อเข้าชมหน้าร้าน</p>
                                            </div>
                                        </div>
                                    )}

                                    {isShareExpanded && (
                                        <div className="border-t border-[#D9E1F2] bg-white px-4 py-4">
                                            <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3">
                                                <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                                                    <Share2 size={14} />
                                                    <span>แชร์และข้อมูลเพิ่มเติม</span>
                                                </div>
                                                <p className="truncate text-sm font-semibold text-[#050579]">/lp/{page.slug}</p>
                                                {page.description ? (
                                                    <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{page.description}</p>
                                                ) : null}
                                            </div>

                                            <div className="mt-3 flex items-center justify-center gap-2.5">
                                                <a
                                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                                    target="_blank"
                                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] transition-all hover:bg-[#1877F2] hover:text-white"
                                                >
                                                    <Facebook size={18} fill="currentColor" />
                                                </a>
                                                <a
                                                    href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`}
                                                    target="_blank"
                                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00B900]/10 text-[#00B900] transition-all hover:bg-[#00B900] hover:text-white"
                                                >
                                                    <LineIcon size={20} />
                                                </a>
                                                <a
                                                    href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`}
                                                    target="_blank"
                                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white"
                                                >
                                                    <WhatsAppIcon size={20} />
                                                </a>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await navigator.clipboard.writeText(shareUrl);
                                                            showToast('คัดลอกลิงก์แล้ว!', 'success');
                                                        } catch {
                                                            showToast('คัดลอกลิงก์ไม่สำเร็จ', 'error');
                                                        }
                                                    }}
                                                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 text-[#64748B] transition-all hover:bg-[#050579] hover:text-white"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
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
                                    ระบบรองรับภาษาไทย ภาษาอังกฤษ ตัวเลข และขีด เพื่อให้ URL อ่านง่ายและเป็นมิตรกับ SEO
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
            {deletingPage && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={() => setDeletingPage(null)} />
                    <div className="bg-white border border-[#FECACA] rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl">
                        <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mb-5">
                            <Trash2 size={26} />
                        </div>
                        <h2 className="text-2xl font-black text-[#991B1B] mb-2">ยืนยันการลบหน้าร้าน</h2>
                        <p className="text-[#7F1D1D] text-sm leading-relaxed mb-2">คุณกำลังจะลบหน้าร้านนี้:</p>
                        <p className="font-bold text-[#0F172A] mb-6 break-words">{deletingPage.title}</p>
                        <p className="text-[#B91C1C] text-sm font-semibold mb-8">การลบนี้ไม่สามารถย้อนกลับได้</p>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setDeletingPage(null)} className="flex-1 py-4 rounded-2xl border border-[#D9E1F2] font-black text-xs uppercase tracking-widest text-[#64748B] hover:bg-gray-50 transition-colors">
                                ยกเลิก
                            </button>
                            <button type="button" onClick={() => deletePage(deletingPage.id)} className="flex-[2] bg-[#DC2626] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-[#B91C1C] transition-all active:scale-95">
                                ยืนยันลบ
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}
