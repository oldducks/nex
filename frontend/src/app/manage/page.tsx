"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Plus, FileText, Settings, LogOut, Package, ExternalLink, Loader2, Pencil, Share2, Copy, Check, X, Download, Trash2, AlertTriangle, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { QrCodeImage } from '@/components/QrCode';
import ManageTopBar from '@/components/ManageTopBar';

interface Catalog {
    id: number;
    title: string;
    description: string;
    pdf_url?: string;
    layout_config?: {
        brand_logo?: string;
        [key: string]: unknown;
    } | null;
    created_at: string;
    products: Array<{
        id: number;
        name?: string;
        images_json?: string[];
    }>;
}

// Social Media Icons
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

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

export default function Dashboard() {
    const router = useRouter();
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newCatalog, setNewCatalog] = useState({ title: '', description: '', brand_logo: '' });
    const [generatingId, setGeneratingId] = useState<number | null>(null);
    const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
    const [editCatalog, setEditCatalog] = useState({ title: '', description: '', brand_logo: '' });
    const [shareModalCatalog, setShareModalCatalog] = useState<Catalog | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [deletingCatalog, setDeletingCatalog] = useState<Catalog | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [uploadingLogoTarget, setUploadingLogoTarget] = useState<'create' | 'edit' | null>(null);
    const createLogoInputRef = useRef<HTMLInputElement | null>(null);
    const editLogoInputRef = useRef<HTMLInputElement | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
        const token = Cookies.get('token');

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchCatalogs();
    }, [token]);

    const getImageUrl = (url: string | undefined) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) return `${API_URL}${url}`;
        return url;
    };

    const getCatalogPreviewImages = (catalog: Catalog) => {
        const images = (catalog.products || [])
            .map((product) => ({
                src: product.images_json?.[0] ? getImageUrl(product.images_json[0]) : '',
                alt: product.name || 'Product image',
            }))
            .filter((item) => Boolean(item.src))
            .slice(0, 4);

        return images;
    };

    const uploadLogoImage = async (file: File, target: 'create' | 'edit') => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('รองรับเฉพาะไฟล์รูปภาพ jpg, png, gif, webp');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('ไฟล์มีขนาดเกิน 5MB');
            return;
        }

        setUploadingLogoTarget(target);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/uploads/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                throw new Error('อัปโหลดโลโก้ไม่สำเร็จ');
            }

            const data = await res.json();
            let imageUrl = data.url as string | undefined;

            if (data.jobId) {
                imageUrl = await new Promise<string>((resolve, reject) => {
                    const started = Date.now();
                    const interval = setInterval(async () => {
                        try {
                            const jobRes = await fetch(`${API_URL}/uploads/job/${data.jobId}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            if (!jobRes.ok) return;
                            const status = await jobRes.json();
                            if (status.state === 'completed' && status.result?.url) {
                                clearInterval(interval);
                                resolve(status.result.url);
                                return;
                            }

                            if (status.state === 'failed') {
                                clearInterval(interval);
                                reject(new Error(status.failedReason || 'ประมวลผลรูปโลโก้ไม่สำเร็จ'));
                                return;
                            }

                            if (Date.now() - started > 60_000) {
                                clearInterval(interval);
                                reject(new Error('อัปโหลดโลโก้ใช้เวลานานเกินไป กรุณาลองใหม่'));
                            }
                        } catch {
                            // keep polling
                        }
                    }, 1000);
                });
            }

            if (!imageUrl) {
                throw new Error('ไม่พบ URL รูปหลังอัปโหลด');
            }

            if (target === 'create') {
                setNewCatalog((prev) => ({ ...prev, brand_logo: imageUrl || '' }));
            } else {
                setEditCatalog((prev) => ({ ...prev, brand_logo: imageUrl || '' }));
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'อัปโหลดโลโก้ไม่สำเร็จ';
            alert(message);
        } finally {
            setUploadingLogoTarget(null);
            if (target === 'create' && createLogoInputRef.current) {
                createLogoInputRef.current.value = '';
            }
            if (target === 'edit' && editLogoInputRef.current) {
                editLogoInputRef.current.value = '';
            }
        }
    };

    const fetchCatalogs = async () => {
        try {
            const res = await fetch(`${API_URL}/catalogs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setCatalogs(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const createCatalog = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: Record<string, unknown> = {
                title: newCatalog.title,
                description: newCatalog.description,
            };
            if (newCatalog.brand_logo) {
                payload.layout_config = { brand_logo: newCatalog.brand_logo };
            }

            const res = await fetch(`${API_URL}/catalogs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowModal(false);
                setNewCatalog({ title: '', description: '', brand_logo: '' });
                fetchCatalogs();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openEditModal = (catalog: Catalog) => {
        setEditingCatalog(catalog);
        setEditCatalog({
            title: catalog.title,
            description: catalog.description || '',
            brand_logo: catalog.layout_config?.brand_logo || '',
        });
    };

    const closeEditModal = () => {
        setEditingCatalog(null);
        setEditCatalog({ title: '', description: '', brand_logo: '' });
    };

    const updateCatalog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCatalog) return;
        try {
            const nextLayoutConfig: Record<string, unknown> = {
                ...(editingCatalog.layout_config || {}),
            };
            if (editCatalog.brand_logo) {
                nextLayoutConfig.brand_logo = editCatalog.brand_logo;
            } else {
                delete nextLayoutConfig.brand_logo;
            }

            const res = await fetch(`${API_URL}/catalogs/${editingCatalog.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: editCatalog.title,
                    description: editCatalog.description,
                    layout_config: nextLayoutConfig,
                })
            });
            if (res.ok) {
                closeEditModal();
                fetchCatalogs();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openDeleteModal = (catalog: Catalog) => {
        setDeletingCatalog(catalog);
    };

    const closeDeleteModal = () => {
        if (deleting) return;
        setDeletingCatalog(null);
    };

    const deleteCatalog = async () => {
        if (!deletingCatalog) return;

        setDeleting(true);
        try {
            const res = await fetch(`${API_URL}/catalogs/${deletingCatalog.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error?.message || 'ไม่สามารถลบแคตตาล็อกได้');
            }

            setDeletingCatalog(null);
            fetchCatalogs();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'ไม่สามารถลบแคตตาล็อกได้';
            alert(message);
        } finally {
            setDeleting(false);
        }
    };

    const generatePdf = async (id: number) => {
        setGeneratingId(id);
        try {
            await fetch(`${API_URL}/catalogs/${id}/generate-pdf`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('PDF generation started! Refresh in a few seconds to see the link.');
            setTimeout(fetchCatalogs, 5000);
        } catch (error) {
            console.error(error);
        } finally {
            setGeneratingId(null);
        }
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('uid');
        router.push('/login');
    };

    const getCatalogUrl = (catalogId: number) => `${SITE_URL}/catalog/${catalogId}`;

    const copyLink = async (catalogId: number) => {
        try {
            await navigator.clipboard.writeText(getCatalogUrl(catalogId));
            setCopiedId(catalogId);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareToFacebook = (catalogId: number) => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getCatalogUrl(catalogId))}`, '_blank', 'width=600,height=400');
    };

    const shareToLine = (catalogId: number) => {
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(getCatalogUrl(catalogId))}`, '_blank', 'width=600,height=400');
    };

    const shareToWhatsApp = (catalogId: number, title: string) => {
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + getCatalogUrl(catalogId))}`, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#F97316]" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] transition-colors duration-500">
            <ManageTopBar
                backHref="/manage/control-center"
                title="แคตตาล็อกสินค้า"
                actions={(
                    <>
                        <div className="h-6 w-px bg-[#D9E1F2] mx-1" />
                        <button onClick={handleLogout} className="w-10 h-10 rounded-xl hover:bg-red-50 hover:text-red-600 text-[#64748B] transition-all flex items-center justify-center" title="ออกจากระบบ">
                            <LogOut size={20} />
                        </button>
                    </>
                )}
            />

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight text-[#050579]">แคตตาล็อกของฉัน</h1>
                        <p className="text-[#475569]">จัดการคอลเลกชันสินค้าและไฟล์ PDF สำหรับลูกค้า</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-[0_18px_40px_-26px_rgba(249,115,22,0.5)] transition-all active:scale-95"
                    >
                        <Plus size={18} /> สร้างแคตตาล็อกใหม่
                    </button>
                </div>

                {catalogs.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-[#D9E1F2] rounded-[32px] bg-white">
                        <div className="bg-[#F6F8FF] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} className="text-[#94A3B8]" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-[#050579]">ยังไม่มีแคตตาล็อก</h3>
                        <p className="text-[#64748B] mb-8 max-w-sm mx-auto">เริ่มสร้างแคตตาล็อกแรกของคุณเพื่อเพิ่มรายการสินค้าและแชร์กับลูกค้าของคุณ</p>
                        <button onClick={() => setShowModal(true)} className="bg-[#F97316] hover:bg-[#EA580C] text-white px-8 py-3 rounded-xl font-bold transition-colors">สร้างแคตตาล็อกตอนนี้</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {catalogs.map(catalog => {
                            const previewImages = getCatalogPreviewImages(catalog);

                            return (
                            <div key={catalog.id} className="bg-white border border-[#D9E1F2] rounded-[24px] hover:border-[#C7D2E5] shadow-[0_18px_46px_-34px_rgba(15,23,42,0.14)] transition-all group relative overflow-hidden">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Left Side - Catalog Info */}
                                    <div className="flex-1 p-6 lg:p-8">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="bg-[#EEF2FF] p-3 rounded-xl text-[#050579] flex-shrink-0 w-[52px] h-[52px] flex items-center justify-center overflow-hidden">
                                                {catalog.layout_config?.brand_logo ? (
                                                    <img
                                                        src={getImageUrl(catalog.layout_config.brand_logo)}
                                                        alt={`Brand logo ${catalog.title}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <FileText size={24} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#050579] transition-colors truncate">{catalog.title}</h3>
                                                    {catalog.pdf_url && (
                                                        <a
                                                            href={`${API_URL}${catalog.pdf_url}`}
                                                            target="_blank"
                                                            className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-green-500/20 transition-colors flex-shrink-0"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                            PDF
                                                        </a>
                                                    )}
                                                </div>
                                                <p className="text-[#475569] text-sm line-clamp-2">{catalog.description || 'ไม่มีคำอธิบาย'}</p>
                                                <p className="text-[#94A3B8] text-xs mt-2">{catalog.products?.length || 0} สินค้า</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2 mt-4">
                                                <Link
                                                href={`/manage/catalogs/${catalog.id}`}
                                                className="bg-[#050579] hover:bg-[#07079A] text-white px-4 py-2.5 rounded-xl text-center font-bold text-sm transition-colors"
                                            >
                                                จัดการสินค้า
                                            </Link>
                                            <Link
                                                href={`/catalog/${catalog.id}`}
                                                target="_blank"
                                                className="border border-[#D9E1F2] bg-[#F6F8FF] hover:bg-white px-4 py-2.5 rounded-xl font-bold text-sm text-[#0F172A] transition-colors flex items-center gap-2"
                                            >
                                                <ExternalLink size={16} /> ดูหน้าสาธารณะ
                                            </Link>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditModal(catalog); }}
                                                className="border border-[#D9E1F2] bg-[#F6F8FF] hover:bg-white p-2.5 rounded-xl text-[#64748B] hover:text-[#050579] transition-colors"
                                                title="แก้ไขแคตตาล็อก"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openDeleteModal(catalog); }}
                                                className="border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] p-2.5 rounded-xl text-[#DC2626] hover:text-[#B91C1C] transition-colors"
                                                title="ลบแคตตาล็อก"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => generatePdf(catalog.id)}
                                                disabled={generatingId === catalog.id}
                                                className="border border-[#D9E1F2] bg-[#F6F8FF] hover:bg-white p-2.5 rounded-xl text-[#64748B] hover:text-[#0F172A] transition-colors flex items-center gap-2 px-4"
                                                title="สร้าง PDF ใหม่"
                                            >
                                                {generatingId === catalog.id ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />}
                                                <span className="text-sm font-bold">{generatingId === catalog.id ? 'Processing...' : 'Generate PDF'}</span>
                                            </button>
                                            
                                            {catalog.pdf_url && (
                                                <a
                                                    href={getImageUrl(catalog.pdf_url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-[0_18px_40px_-26px_rgba(249,115,22,0.5)]"
                                                >
                                                    <Download size={18} /> Download PDF
                                                </a>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-[10px] font-black tracking-[0.18em] uppercase text-[#64748B]">
                                                    Product Preview
                                                </p>
                                                <p className="text-xs font-semibold text-[#94A3B8]">
                                                    สูงสุด 4 รูป
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {Array.from({ length: 4 }).map((_, index) => {
                                                    const preview = previewImages[index];
                                                    if (!preview) {
                                                        return (
                                                            <div
                                                                key={`placeholder-${catalog.id}-${index}`}
                                                                className="aspect-[4/3] rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex items-center justify-center"
                                                            >
                                                                <Package size={18} className="text-[#CBD5E1]" />
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={`preview-${catalog.id}-${index}`}
                                                            className="aspect-[4/3] rounded-xl overflow-hidden border border-[#D9E1F2] bg-[#EEF2FF]"
                                                        >
                                                            <img
                                                                src={preview.src}
                                                                alt={preview.alt}
                                                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side - QR Code & Share */}
                                    <div className="lg:w-72 p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-[#D9E1F2] bg-[#F6F8FF] flex flex-col items-center justify-center">
                                        <QrCodeImage url={getCatalogUrl(catalog.id)} size={120} className="mb-4" />

                                        <p className="text-xs text-[#64748B] mb-3 text-center">สแกนเพื่อดูแคตตาล็อก</p>

                                        {/* Share Buttons */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <button
                                                onClick={() => shareToFacebook(catalog.id)}
                                                className="w-10 h-10 bg-[#1877F2]/20 hover:bg-[#1877F2] text-[#1877F2] hover:text-white rounded-full flex items-center justify-center transition-all"
                                                title="แชร์ไป Facebook"
                                            >
                                                <FacebookIcon />
                                            </button>
                                            <button
                                                onClick={() => shareToLine(catalog.id)}
                                                className="w-10 h-10 bg-[#00B900]/20 hover:bg-[#00B900] text-[#00B900] hover:text-white rounded-full flex items-center justify-center transition-all"
                                                title="แชร์ไป Line"
                                            >
                                                <LineIcon />
                                            </button>
                                            <button
                                                onClick={() => shareToWhatsApp(catalog.id, catalog.title)}
                                                className="w-10 h-10 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-full flex items-center justify-center transition-all"
                                                title="แชร์ไป WhatsApp"
                                            >
                                                <WhatsAppIcon />
                                            </button>
                                            <button
                                                onClick={() => copyLink(catalog.id)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                                    copiedId === catalog.id
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-white border border-[#D9E1F2] hover:bg-[#EEF0FF] text-[#64748B] hover:text-[#0F172A]'
                                                }`}
                                                title="คัดลอกลิงก์"
                                            >
                                                {copiedId === catalog.id ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>

                                        {/* More Share Options Button */}
                                        <button
                                            onClick={() => setShareModalCatalog(catalog)}
                                            className="text-xs text-[#050579] hover:underline flex items-center gap-1"
                                        >
                                            <Share2 size={14} /> แชร์เพิ่มเติม
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                )}
            </main>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/32 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
                    <div className="bg-white border border-[#D9E1F2] rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-[0_34px_100px_-48px_rgba(15,23,42,0.32)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <h2 className="text-2xl font-black mb-6 tracking-tight text-[#050579]">สร้างแคตตาล็อกใหม่</h2>
                        <form onSubmit={createCatalog} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest ml-1">หัวข้อแคตตาล็อก</label>
                                <input
                                    required
                                    className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all placeholder:text-[#94A3B8]"
                                    value={newCatalog.title}
                                    placeholder="เช่น คอลเลกชันฤดูร้อน 2024"
                                    onChange={e => setNewCatalog({ ...newCatalog, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest ml-1">คำอธิบาย</label>
                                <textarea
                                    className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all h-32 resize-none placeholder:text-[#94A3B8]"
                                    value={newCatalog.description}
                                    placeholder="เพิ่มรายละเอียดเกี่ยวกับแคตตาล็อกนี้..."
                                    onChange={e => setNewCatalog({ ...newCatalog, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest ml-1">โลโก้แบรนด์สินค้า</label>
                                <input
                                    ref={createLogoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadLogoImage(file, 'create');
                                    }}
                                />

                                <div className="flex items-center gap-3">
                                    <div className="w-20 h-20 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] flex items-center justify-center overflow-hidden">
                                        {newCatalog.brand_logo ? (
                                            <img
                                                src={getImageUrl(newCatalog.brand_logo)}
                                                alt="Brand logo preview"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <ImageIcon size={24} className="text-[#94A3B8]" />
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => createLogoInputRef.current?.click()}
                                            disabled={uploadingLogoTarget === 'create'}
                                            className="border border-[#D9E1F2] bg-[#F6F8FF] hover:bg-white px-3 py-2 rounded-xl text-sm font-bold text-[#334155] transition-colors disabled:opacity-60 flex items-center gap-2"
                                        >
                                            {uploadingLogoTarget === 'create' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                            {uploadingLogoTarget === 'create' ? 'กำลังอัปโหลด...' : 'อัปโหลดโลโก้'}
                                        </button>
                                        {newCatalog.brand_logo && (
                                            <button
                                                type="button"
                                                onClick={() => setNewCatalog((prev) => ({ ...prev, brand_logo: '' }))}
                                                disabled={uploadingLogoTarget === 'create'}
                                                className="border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-3 py-2 rounded-xl text-sm font-bold text-[#B91C1C] transition-colors disabled:opacity-60"
                                            >
                                                ลบรูป
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-[#94A3B8]">รองรับ JPG, PNG, GIF, WebP ขนาดไม่เกิน 5MB</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-[#64748B] hover:text-[#0F172A] font-bold py-4 transition-colors">
                                    ยกเลิก
                                </button>
                                <button className="flex-[2] bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-4 rounded-2xl shadow-[0_18px_40px_-26px_rgba(249,115,22,0.5)] transition-colors active:scale-95">
                                    สร้างแคตตาล็อก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingCatalog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/32 backdrop-blur-md animate-in fade-in duration-300" onClick={closeEditModal} />
                    <div className="bg-white border border-[#D9E1F2] rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-[0_34px_100px_-48px_rgba(15,23,42,0.32)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <h2 className="text-2xl font-black mb-6 tracking-tight text-[#050579]">แก้ไขแคตตาล็อก</h2>
                        <form onSubmit={updateCatalog} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest ml-1">หัวข้อแคตตาล็อก</label>
                                <input
                                    required
                                    className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all placeholder:text-[#94A3B8]"
                                    value={editCatalog.title}
                                    placeholder="เช่น คอลเลกชันฤดูร้อน 2024"
                                    onChange={e => setEditCatalog({ ...editCatalog, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest ml-1">คำอธิบาย</label>
                                <textarea
                                    className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 transition-all h-32 resize-none placeholder:text-[#94A3B8]"
                                    value={editCatalog.description}
                                    placeholder="เพิ่มรายละเอียดเกี่ยวกับแคตตาล็อกนี้..."
                                    onChange={e => setEditCatalog({ ...editCatalog, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest ml-1">โลโก้แบรนด์สินค้า</label>
                                <input
                                    ref={editLogoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) uploadLogoImage(file, 'edit');
                                    }}
                                />

                                <div className="flex items-center gap-3">
                                    <div className="w-20 h-20 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] flex items-center justify-center overflow-hidden">
                                        {editCatalog.brand_logo ? (
                                            <img
                                                src={getImageUrl(editCatalog.brand_logo)}
                                                alt="Brand logo preview"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <ImageIcon size={24} className="text-[#94A3B8]" />
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => editLogoInputRef.current?.click()}
                                            disabled={uploadingLogoTarget === 'edit'}
                                            className="border border-[#D9E1F2] bg-[#F6F8FF] hover:bg-white px-3 py-2 rounded-xl text-sm font-bold text-[#334155] transition-colors disabled:opacity-60 flex items-center gap-2"
                                        >
                                            {uploadingLogoTarget === 'edit' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                            {uploadingLogoTarget === 'edit' ? 'กำลังอัปโหลด...' : 'อัปโหลดโลโก้'}
                                        </button>
                                        {editCatalog.brand_logo && (
                                            <button
                                                type="button"
                                                onClick={() => setEditCatalog((prev) => ({ ...prev, brand_logo: '' }))}
                                                disabled={uploadingLogoTarget === 'edit'}
                                                className="border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] px-3 py-2 rounded-xl text-sm font-bold text-[#B91C1C] transition-colors disabled:opacity-60"
                                            >
                                                ลบรูป
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-[#94A3B8]">รองรับ JPG, PNG, GIF, WebP ขนาดไม่เกิน 5MB</p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeEditModal} className="flex-1 text-[#64748B] hover:text-[#0F172A] font-bold py-4 transition-colors">
                                    ยกเลิก
                                </button>
                                <button className="flex-[2] bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-4 rounded-2xl shadow-[0_18px_40px_-26px_rgba(249,115,22,0.5)] transition-colors active:scale-95">
                                    บันทึกการแก้ไข
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {shareModalCatalog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/32 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShareModalCatalog(null)} />
                    <div className="bg-white border border-[#D9E1F2] rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-[0_34px_100px_-48px_rgba(15,23,42,0.32)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <button
                            onClick={() => setShareModalCatalog(null)}
                            className="absolute top-4 right-4 w-10 h-10 bg-[#F6F8FF] hover:bg-[#EEF0FF] rounded-full flex items-center justify-center transition-colors text-[#64748B]"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-black mb-2 tracking-tight text-[#050579]">แชร์แคตตาล็อก</h2>
                        <p className="text-[#475569] text-sm mb-6">{shareModalCatalog.title}</p>

                        {/* QR Code */}
                        <div className="flex justify-center mb-6">
                            <QrCodeImage url={getCatalogUrl(shareModalCatalog.id)} size={180} />
                        </div>

                        {/* Link Display */}
                        <div className="bg-[#F6F8FF] border border-[#D9E1F2] rounded-xl p-4 mb-6">
                            <p className="text-xs text-[#64748B] mb-1">ลิงก์แคตตาล็อก</p>
                            <p className="text-sm font-mono break-all text-[#0F172A]">{getCatalogUrl(shareModalCatalog.id)}</p>
                        </div>

                        {/* Share Buttons */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <button
                                onClick={() => shareToFacebook(shareModalCatalog.id)}
                                className="flex flex-col items-center gap-2 p-4 bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white rounded-xl transition-all"
                            >
                                <FacebookIcon />
                                <span className="text-xs font-medium">Facebook</span>
                            </button>
                            <button
                                onClick={() => shareToLine(shareModalCatalog.id)}
                                className="flex flex-col items-center gap-2 p-4 bg-[#00B900]/10 hover:bg-[#00B900] text-[#00B900] hover:text-white rounded-xl transition-all"
                            >
                                <LineIcon />
                                <span className="text-xs font-medium">Line</span>
                            </button>
                            <button
                                onClick={() => shareToWhatsApp(shareModalCatalog.id, shareModalCatalog.title)}
                                className="flex flex-col items-center gap-2 p-4 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-xl transition-all"
                            >
                                <WhatsAppIcon />
                                <span className="text-xs font-medium">WhatsApp</span>
                            </button>
                            <button
                                onClick={() => copyLink(shareModalCatalog.id)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                                    copiedId === shareModalCatalog.id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-[#F6F8FF] hover:bg-[#EEF0FF] text-[#475569]'
                                }`}
                            >
                                {copiedId === shareModalCatalog.id ? <Check size={20} /> : <Copy size={20} />}
                                <span className="text-xs font-medium">{copiedId === shareModalCatalog.id ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deletingCatalog && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md animate-in fade-in duration-300" onClick={closeDeleteModal} />
                    <div className="bg-white border border-[#FECACA] rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-[0_34px_100px_-48px_rgba(15,23,42,0.32)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mb-5">
                            <AlertTriangle size={28} />
                        </div>

                        <h2 className="text-2xl font-black mb-2 tracking-tight text-[#991B1B]">ยืนยันการลบแคตตาล็อก</h2>
                        <p className="text-[#7F1D1D] text-sm leading-relaxed mb-2">
                            คุณกำลังจะลบแคตตาล็อกนี้:
                        </p>
                        <p className="font-bold text-[#0F172A] mb-6 break-words">{deletingCatalog.title}</p>
                        <p className="text-[#B91C1C] text-sm font-semibold mb-8">
                            การลบนี้ไม่สามารถย้อนกลับได้ และสินค้าภายในแคตตาล็อกจะถูกลบทั้งหมด
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="flex-1 text-[#64748B] hover:text-[#0F172A] font-bold py-4 transition-colors disabled:opacity-60"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={deleteCatalog}
                                disabled={deleting}
                                className="flex-[2] bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-4 rounded-2xl shadow-[0_18px_40px_-26px_rgba(220,38,38,0.45)] transition-colors active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                {deleting ? 'กำลังลบ...' : 'ยืนยันลบแคตตาล็อก'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
