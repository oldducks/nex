"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Plus, ArrowLeft, Trash2, GripVertical, Image as ImageIcon,
  Package, Settings, Globe, ShoppingCart, Facebook,
  Palette, RefreshCw, Eye, Save, QrCode as QrIcon,
  ExternalLink, Download, FileJson, Sparkles, Loader2, X, Pencil, Share2, Twitter, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { QrCodeImage } from '../../../../components/QrCode';
import { QrCodeDownloadActions } from '../../../../components/QrCodeDownloadActions';
import { VideoUpload } from '@/components/VideoUpload';
import ProductImageUpload from '@/components/ProductImageUpload';
import { Toast, type ToastType } from '@/components/Toast';
import { Video } from 'lucide-react';

interface VideoConfig {
    url: string;
    autoplay: boolean;
    link_url?: string;
    link_enabled: boolean;
    enabled: boolean;
}

interface InteractiveLinks {
    website?: string;
    order_form?: string;
    facebook?: string;
}

interface CatalogLayoutConfig {
    primary_color?: string;
    font_family?: string;
    template_id?: string;
    stickers?: string[];
}

interface Product {
    id: number;
    name: string;
    brand?: string;
    description: string;
    price: string;
    order: number;
    images_json: string[];
    interactive_links?: InteractiveLinks;
}

interface Catalog {
    id: number;
    title: string;
    description: string;
    custom_slug?: string;
    layout_config?: CatalogLayoutConfig;
    interactive_links?: InteractiveLinks;
    pdf_url?: string;
    video_config?: VideoConfig;
}

interface MeProfile {
    subscription_tier?: string;
}

interface FormOption {
    id: number;
    name: string;
}

export default function CatalogDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [forms, setForms] = useState<FormOption[]>([]);
    const [currentPlanLabel, setCurrentPlanLabel] = useState('แผนพื้นฐาน');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [importingCsv, setImportingCsv] = useState(false);
    const [imageLoadErrorIds, setImageLoadErrorIds] = useState<Record<number, boolean>>({});
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false,
    });
    const csvInputRef = useRef<HTMLInputElement | null>(null);
    
    const [newProduct, setNewProduct] = useState({
        name: '', brand: '', description: '', price: '', images: [] as string[],
        website: '', order_form: '', facebook: ''
    });

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editProduct, setEditProduct] = useState({
        name: '', brand: '', description: '', price: '', images: [] as string[],
        website: '', order_form: '', facebook: ''
    });
    
    const [settings, setSettings] = useState({
        title: '', description: '', custom_slug: '',
        primary_color: '#050579', font_family: 'Inter',
        catalog_ws: '', catalog_fb: '', catalog_order: '',
        template_id: 'standard', stickers: [] as string[],
        video_config: null as VideoConfig | null
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
    const token = Cookies.get('token');

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const openSettingsModal = () => {
        setShowAdvancedSettings(false);
        setShowSettingsModal(true);
    };

    const closeSettingsModal = () => {
        setShowSettingsModal(false);
        setShowAdvancedSettings(false);
    };

    const resolvePlanLabel = (tier?: string) => {
        if (tier === 'premium') return 'แผนพรีเมียม';
        return 'แผนพื้นฐาน';
    };

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchData();
    }, [token, id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const profileRes = await fetch(`${API_URL}/profile/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const profileData: MeProfile = await profileRes.json();
                setCurrentPlanLabel(resolvePlanLabel(profileData.subscription_tier));
            }

            const [catRes, prodRes, formsRes] = await Promise.all([
                fetch(`${API_URL}/catalogs/user/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/products?catalog_id=${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/forms`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            if (catRes.ok) {
                const cat = await catRes.json();
                setCatalog(cat);
                setSettings({
                    title: cat.title,
                    description: cat.description || '',
                    custom_slug: cat.custom_slug || '',
                    primary_color: cat.layout_config?.primary_color || '#050579',
                    font_family: cat.layout_config?.font_family || 'Inter',
                    template_id: cat.layout_config?.template_id || 'standard',
                    stickers: cat.layout_config?.stickers || [],
                    catalog_ws: cat.interactive_links?.website || '',
                    catalog_fb: cat.interactive_links?.facebook || '',
                    catalog_order: cat.interactive_links?.order_form || '',
                    video_config: cat.video_config || null
                });
            }
            if (prodRes.ok) {
                setProducts(await prodRes.json());
                setImageLoadErrorIds({});
            }
            if (formsRes.ok) {
                setForms(await formsRes.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) {
            // Fix locally saved hardcoded wrong API_URL during dev
            if (url.includes('localhost:') && SITE_URL.includes('https://nexsolution.cloud')) {
                try {
                    const parsedUrl = new URL(url);
                    if (parsedUrl.pathname.startsWith('/uploads')) {
                        return `${API_URL}${parsedUrl.pathname}`;
                    }
                } catch {
                    // Ignore URL parsing errors
                }
            }
            return url;
        }
        if (url.startsWith('/uploads')) return `${API_URL}${url}`;
        return url;
    };

    const formatPrice = (priceValue: string | number | null | undefined) => {
        const numericPrice = typeof priceValue === 'number'
            ? priceValue
            : Number.parseFloat(`${priceValue ?? ''}`);
        if (!Number.isFinite(numericPrice)) return '-';

        const hasDecimal = numericPrice % 1 !== 0;
        return numericPrice.toLocaleString('th-TH', {
            minimumFractionDigits: hasDecimal ? 2 : 0,
            maximumFractionDigits: 2
        });
    };

    const getShortDescription = (description: string | null | undefined) => {
        const normalized = (description || '').trim();
        return normalized || 'ไม่มีรายละเอียดสินค้า';
    };

    const getDisplayOrder = (product: Product, index: number) => {
        const numericOrder = Number(product.order);
        if (Number.isFinite(numericOrder) && numericOrder > 0) {
            return Math.floor(numericOrder);
        }
        return index + 1;
    };

    const getPublicFormUrl = (formId: number | string) => `${SITE_URL}/forms/${formId}`;

    const saveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/catalogs/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: settings.title,
                    description: settings.description,
                    custom_slug: settings.custom_slug,
                    layout_config: {
                        primary_color: settings.primary_color,
                        font_family: settings.font_family,
                        template_id: settings.template_id,
                        stickers: settings.stickers
                    },
                    interactive_links: {
                        website: settings.catalog_ws,
                        facebook: settings.catalog_fb,
                        order_form: settings.catalog_order
                    },
                    video_config: settings.video_config
                })
            });
            if (res.ok) {
                setShowSettingsModal(false);
                fetchData();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const createProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                catalog_id: parseInt(id),
                name: newProduct.name,
                brand: newProduct.brand || undefined,
                description: newProduct.description,
                price: parseFloat(newProduct.price) || 0,
                images_json: newProduct.images,
                interactive_links: {
                    website: newProduct.website,
                    order_form: newProduct.order_form,
                    facebook: newProduct.facebook
                }
            };

            const res = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowProductModal(false);
                setNewProduct({
                    name: '', brand: '', description: '', price: '', images: [],
                    website: '', order_form: '', facebook: ''
                });
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setEditProduct({
            name: product.name,
            brand: product.brand || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            images: product.images_json || [],
            website: product.interactive_links?.website || '',
            order_form: product.interactive_links?.order_form || '',
            facebook: product.interactive_links?.facebook || ''
        });
    };

    const closeEditModal = () => {
        setEditingProduct(null);
        setEditProduct({
            name: '', brand: '', description: '', price: '', images: [],
            website: '', order_form: '', facebook: ''
        });
    };

    const updateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            const payload = {
                name: editProduct.name,
                brand: editProduct.brand || undefined,
                description: editProduct.description,
                price: parseFloat(editProduct.price) || 0,
                images_json: editProduct.images,
                interactive_links: {
                    website: editProduct.website,
                    order_form: editProduct.order_form,
                    facebook: editProduct.facebook
                }
            };

            const res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                closeEditModal();
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteProduct = async (productId: number) => {
        try {
            await fetch(`${API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeletingProduct(null);
            fetchData();
        } catch (error) {
            console.error(error);
            showToast('ลบสินค้าไม่สำเร็จ กรุณาลองใหม่', 'error');
        }
    };

    const openCsvPicker = () => {
        csvInputRef.current?.click();
    };

    const importCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImportingCsv(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('catalog_id', id);

            const res = await fetch(`${API_URL}/products/import-csv`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const result = await res.json().catch(() => ({}));
            if (!res.ok) {
                const message = Array.isArray(result?.message)
                    ? result.message.join(', ')
                    : (result?.message || 'ไม่สามารถนำเข้า CSV ได้');
                throw new Error(message);
            }

            showToast(`นำเข้าสินค้าสำเร็จ ${result.imported || 0} รายการ${result.skipped ? ` (ข้าม ${result.skipped} แถว)` : ''}`, 'success');
            fetchData();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'ไม่สามารถนำเข้า CSV ได้';
            showToast(message, 'error');
        } finally {
            setImportingCsv(false);
            event.target.value = '';
        }
    };

    const generatePdf = async () => {
        setGenerating(true);
        try {
            await fetch(`${API_URL}/catalogs/${id}/generate-pdf`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('ระบบได้รับคำสั่งสร้างไฟล์ PDF แล้ว กรุณารอสักครู่ ลิงก์ดาวน์โหลดจะปรากฏเมื่อไฟล์สร้างเสร็จ', 'info');
            // Poll for updates every 5 seconds for a bit
            const interval = setInterval(async () => {
               const res = await fetch(`${API_URL}/catalogs/user/${id}`, { headers: { Authorization: `Bearer ${token}` } });
               if (res.ok) {
                   const data = await res.json();
                   if (data.pdf_url) {
                       setCatalog(prev => ({ ...prev!, pdf_url: data.pdf_url }));
                       setGenerating(false);
                       clearInterval(interval);
                   }
               }
            }, 5000);
            setTimeout(() => { clearInterval(interval); setGenerating(false); }, 60000);
        } catch {
            setGenerating(false);
            showToast('เริ่มสร้าง PDF ไม่สำเร็จ กรุณาลองใหม่', 'error');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex flex-col items-center justify-center">
             <Loader2 className="w-12 h-12 text-[#F97316] animate-spin mb-6" />
             <p className="text-[#64748B] font-black uppercase tracking-[0.3em] text-[10px]">กำลังโหลดข้อมูลแคตตาล็อก...</p>
        </div>
    );

    const publicUrl = `${SITE_URL}/catalog/${catalog?.custom_slug || catalog?.id}`;
    const publicBookUrl = `${publicUrl}?view=book`;
    return (
        <div className="relative min-h-screen bg-[#EEF0FF] pb-16 text-[#0F172A]">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%)]" />
            </div>

            <nav className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/85 backdrop-blur-md">
                <div className="relative mx-auto flex h-24 w-full max-w-md items-center px-4 md:max-w-6xl md:px-6">
                    <Link
                        href="/manage"
                        className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] group md:left-6"
                        title="ย้อนกลับ"
                    >
                        <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
                    </Link>

                    <div className="mx-auto flex min-w-0 flex-col items-center text-center">
                        <div className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">
                            NEX Catalog
                        </div>
                        <div className="flex max-w-[250px] items-center justify-center gap-2 md:max-w-xl">
                            <div className="truncate text-base font-black text-[#050579]">
                                {catalog?.title || 'Catalog'}
                            </div>
                            <button
                                onClick={openSettingsModal}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] text-[#64748B] transition-colors hover:border-[#BCCBE8] hover:text-[#050579]"
                                title="แก้ชื่อแคตตาล็อก"
                            >
                                <Pencil size={14} />
                            </button>
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-1 text-xs font-bold text-[#64748B]">
                            <span className="mr-1.5 text-[#94A3B8]">แผนปัจจุบัน</span>
                            <span className="text-[#050579]">{currentPlanLabel}</span>
                        </div>
                    </div>

                </div>
            </nav>

            <main className="relative z-10 mx-auto mt-6 w-full max-w-md px-4 pb-8 md:max-w-6xl md:px-6">
                <section className="mb-6 rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)] md:p-6">
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setShowProductModal(true)}
                            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#F97316] px-7 py-4 text-base font-black text-white shadow-[0_20px_45px_-20px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C] active:scale-95"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/22">
                                <Plus size={22} strokeWidth={3} />
                            </span>
                            <span>เพิ่มสินค้าใหม่</span>
                        </button>

                        <div className="rounded-[28px] border border-[#D9E1F2] bg-[#F6F8FF] p-4 md:p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-sm font-black text-[#050579]">เครื่องมือแคตตาล็อก</div>
                                    <div className="mt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">นำเข้า แชร์ ตั้งค่า และสร้าง PDF จากหน้าเดียว</div>
                                </div>
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#F97316] shadow-[0_10px_24px_-20px_rgba(249,115,22,0.22)]">
                                    <QrIcon size={20} />
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                                <div className="space-y-3">
                                    <input
                                        ref={csvInputRef}
                                        type="file"
                                        accept=".csv,text/csv"
                                        className="hidden"
                                        onChange={importCsv}
                                    />
                                    <button
                                        onClick={openCsvPicker}
                                        disabled={importingCsv}
                                        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#D1DBEF] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#334155] transition-colors hover:border-[#BCCBE8] disabled:opacity-60"
                                    >
                                        <FileJson size={18} className={importingCsv ? 'animate-pulse' : ''} />
                                        {importingCsv ? 'กำลังนำเข้า...' : 'Import CSV'}
                                    </button>

                                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                        <Link
                                            href={publicBookUrl}
                                            target="_blank"
                                            className="flex items-center justify-between rounded-2xl border border-[#D1DBEF] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:border-[#BCCBE8]"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Eye size={15} className="text-[#64748B]" />
                                                ดูหน้าสาธารณะ
                                            </span>
                                            <ExternalLink size={15} className="text-[#475569]" />
                                        </Link>
                                        <button
                                            onClick={() => setShowQrModal(true)}
                                            className="flex items-center justify-between rounded-2xl border border-[#D1DBEF] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:border-[#BCCBE8]"
                                        >
                                            <span className="flex items-center gap-2">
                                                <QrIcon size={15} className="text-[#64748B]" />
                                                QR
                                            </span>
                                            <ExternalLink size={15} className="text-[#475569]" />
                                        </button>
                                        <button
                                            onClick={() => setShowShareModal(true)}
                                            className="flex items-center justify-between rounded-2xl border border-[#D1DBEF] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:border-[#BCCBE8]"
                                        >
                                            <span className="flex items-center gap-2">
                                                <Share2 size={15} className="text-[#64748B]" />
                                                แชร์
                                            </span>
                                            <ExternalLink size={15} className="text-[#475569]" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    {catalog?.pdf_url && !generating ? (
                                        <a
                                            href={getImageUrl(catalog.pdf_url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex min-h-11 items-center justify-center gap-3 rounded-2xl bg-[#050579] px-4 py-3 text-sm font-black text-white transition-all hover:bg-[#07079A] active:scale-95"
                                        >
                                            <Download size={18} />
                                            ดาวน์โหลด PDF
                                        </a>
                                    ) : (
                                        <button
                                            onClick={generatePdf}
                                            disabled={generating}
                                            className="flex min-h-11 w-full items-center justify-center gap-3 rounded-2xl bg-[#050579] px-4 py-3 text-sm font-black text-white transition-all hover:bg-[#07079A] active:scale-95 disabled:opacity-50"
                                        >
                                            <RefreshCw size={18} className={generating ? "animate-spin" : ""} />
                                            {generating ? 'กำลังประมวลผล...' : 'สร้างแคตตาล็อก PDF'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Products List Header */}
                <section className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.12)] md:p-6">
                <div className="flex flex-col md:flex-row items-start justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-[#050579] md:text-3xl">สินค้าในเล่ม</h2>
                        <p className="mt-2 text-sm leading-6 text-[#64748B]">จัดการรายการสินค้า พร้อมลิงก์ Interactive และข้อมูลสำคัญของแต่ละชิ้น</p>
                    </div>
                </div>

                {/* Products List */}
                {products.length === 0 ? (
                    <div className="rounded-[28px] border-2 border-dashed border-[#D9E1F2] bg-[#F9FBFF] px-6 py-16 text-center">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF4FF]">
                            <Package size={36} className="text-[#94A3B8]" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-[#050579]">ยังไม่พบรายการสินค้า</h3>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#64748B]">
                            เริ่มต้นสร้างแคตตาล็อกที่พร้อมแชร์ ด้วยการเพิ่มสินค้าชิ้นแรกของคุณในหน้านี้
                        </p>
                        <button 
                            onClick={() => setShowProductModal(true)} 
                            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#F97316] px-6 py-3 text-sm font-black text-white shadow-[0_18px_40px_-26px_rgba(249,115,22,0.45)] transition-colors hover:bg-[#EA580C]"
                        >
                            เพิ่มสินค้าแรกตอนนี้
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {products.map((product, index) => (
                            <div key={product.id} className="group flex items-stretch gap-3 md:gap-5">
                                <div className="hidden md:flex flex-col items-center justify-center min-w-[64px] rounded-[24px] bg-white/80 border border-[#D9E1F2] shadow-sm px-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">No.</span>
                                    <span className="text-2xl leading-none font-black text-[#050579] mt-1">
                                        {getDisplayOrder(product, index)}
                                    </span>
                                </div>

                                <div className="flex flex-1 flex-col gap-4 rounded-[28px] border border-[#C7D2E5] bg-[#F3F6FF] p-4 transition-all hover:border-[#B8C7E6] md:flex-row md:items-center md:gap-6 md:p-5">
                                    <div className="hidden cursor-grab text-[#CBD5E1] transition-colors group-hover:text-[#050579] active:cursor-grabbing md:block">
                                        <GripVertical size={24} />
                                    </div>

                                    <div className="flex items-start gap-3 md:flex-1 md:items-center md:gap-6">
                                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] border border-[#D9E1F2] bg-white shadow-[0_10px_24px_-20px_rgba(5,5,121,0.22)] flex items-center justify-center md:h-24 md:w-24">
                                            {product.images_json?.[0] && !imageLoadErrorIds[product.id] ? (
                                                <img
                                                    src={getImageUrl(product.images_json[0])}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                    onError={() => setImageLoadErrorIds((prev) => ({ ...prev, [product.id]: true }))}
                                                />
                                            ) : (
                                                <ImageIcon size={32} className="text-[#CBD5E1]" />
                                            )}
                                            <div className="absolute left-2 top-2 rounded-full bg-white/92 px-2 py-1 text-[10px] font-black text-[#050579] shadow-sm md:hidden">
                                                #{getDisplayOrder(product, index)}
                                            </div>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-3">
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div className="min-w-0">
                                                        {product.brand && (
                                                            <p className="mb-1 line-clamp-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">
                                                                แบรนด์: {product.brand}
                                                            </p>
                                                        )}
                                                        <h3 className="mb-1 line-clamp-2 text-lg font-black leading-tight tracking-tight text-[#050579] md:text-2xl">
                                                            {product.name}
                                                        </h3>
                                                        <p className="line-clamp-2 max-w-2xl text-sm font-medium leading-6 text-[#64748B]">
                                                            {getShortDescription(product.description)}
                                                        </p>
                                                    </div>

                                                    <div className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 md:min-w-[150px] md:w-auto md:shrink-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">ราคา</p>
                                                        <p className="mt-1 text-2xl font-black leading-none text-[#050579] md:text-3xl">฿{formatPrice(product.price)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                                                    {product.interactive_links?.order_form && (
                                                        <span className="flex items-center gap-2 rounded-lg border border-[#16A34A]/15 bg-[#16A34A]/5 px-3 py-1 text-[#16A34A]"><ShoppingCart size={14} /> Order</span>
                                                    )}
                                                    {product.interactive_links?.website && (
                                                        <span className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-1 text-primary"><Globe size={14} /> Website</span>
                                                    )}
                                                    {product.interactive_links?.facebook && (
                                                        <span className="flex items-center gap-2 rounded-lg border border-[#1D4ED8]/15 bg-[#1D4ED8]/5 px-3 py-1 text-[#1D4ED8]"><Facebook size={14} /> Facebook</span>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 md:hidden">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#CBD5E1] bg-white px-4 py-3 text-sm font-semibold text-[#050579] shadow-sm transition-all hover:bg-[#050579] hover:text-white"
                                                        title="แก้ไขสินค้า"
                                                    >
                                                        <Pencil size={16} />
                                                        แก้ไข
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingProduct(product)}
                                                        className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#FECACA] bg-white px-4 py-3 text-sm font-semibold text-[#DC2626] shadow-sm transition-all hover:bg-[#DC2626] hover:text-white"
                                                        title="ลบสินค้า"
                                                    >
                                                        <Trash2 size={16} />
                                                        ลบ
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden items-center gap-2 self-end md:flex md:self-center">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#CBD5E1] bg-white text-[#050579] shadow-sm transition-all hover:bg-[#050579] hover:text-white"
                                            title="แก้ไขสินค้า"
                                        >
                                            <Pencil size={20} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingProduct(product)}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FECACA] bg-white text-[#DC2626] shadow-sm transition-all hover:bg-[#DC2626] hover:text-white"
                                            title="ลบสินค้า"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </section>

            </main>

            {/* PRODUCT MODAL */}
            {showProductModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
                    <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={() => setShowProductModal(false)} />
                    <div className="relative z-10 w-full max-w-md rounded-[26px] border border-[#D9E1F2] bg-white p-4 shadow-2xl sm:max-w-3xl sm:rounded-[32px] sm:p-8">
                        <button onClick={() => setShowProductModal(false)} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F8FF] text-[#94A3B8] transition-all hover:bg-white hover:text-[#64748B] sm:right-6 sm:top-6 sm:h-12 sm:w-12">
                            <X size={20} />
                        </button>
                        
                        <div className="mb-4 flex items-start justify-between gap-3 pr-10 sm:mb-8 sm:gap-4 sm:pr-14">
                            <div>
                                <h2 className="text-[1.85rem] font-black leading-none tracking-tight text-[#050579] sm:text-3xl">เพิ่มสินค้าใหม่</h2>
                                <p className="mt-2 text-[13px] font-medium leading-6 text-[#64748B] sm:text-base sm:leading-7">ป้อนข้อมูลพื้นฐานสินค้าให้พร้อมใช้งานบนมือถือ</p>
                            </div>
                            <div className="hidden h-16 w-16 items-center justify-center rounded-[24px] bg-[#F97316]/8 text-[#F97316] sm:flex">
                                <Package size={28} />
                            </div>
                        </div>

                        <form onSubmit={createProduct} className="space-y-4 sm:space-y-6">
                            <div className="custom-scrollbar max-h-[70vh] overflow-y-auto pr-1 sm:max-h-[72vh] sm:pr-2">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="space-y-2">
                                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">ชื่อสินค้าและรุ่น</label>
                                        <input
                                            required
                                            className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3.5 text-[15px] font-bold text-[#050579] outline-none transition-all placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#F97316]/20 sm:px-5 sm:py-4 sm:text-base"
                                            placeholder="Ex. Rolex Submariner..."
                                            value={newProduct.name}
                                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">แบรนด์ (ไม่บังคับ)</label>
                                        <input
                                            className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3.5 text-[15px] font-semibold text-[#334155] outline-none transition-all placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#F97316]/20 sm:px-5 sm:py-4 sm:text-base"
                                            placeholder="Ex. Samsung, Apple, Xiaomi..."
                                            value={newProduct.brand}
                                            onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">ราคาสินค้า (บาท)</label>
                                        <input
                                            type="number"
                                            className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3.5 text-[2rem] font-black leading-none tracking-tight text-[#050579] outline-none transition-all placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#F97316]/20 sm:px-5 sm:py-4"
                                            placeholder="0.00"
                                            value={newProduct.price}
                                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">แคปชั่น / รายละเอียด</label>
                                        <textarea
                                            className="h-24 w-full resize-none rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3.5 text-[15px] font-medium leading-6 text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#F97316]/20 sm:h-32 sm:px-5 sm:py-4 sm:text-base sm:leading-relaxed"
                                            placeholder="อธิบายสรรพสินค้าของคุณ..."
                                            value={newProduct.description}
                                            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 sm:space-y-6">
                                    <ProductImageUpload
                                        images={newProduct.images}
                                        onChange={(images) => setNewProduct({ ...newProduct, images })}
                                        maxImages={5}
                                    />

                                    <div className="space-y-4 border-t border-foreground/5 pt-4 sm:space-y-6 sm:pt-6">
                                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-primary">Interactive Command Buttons</label>
                                        <div className="space-y-3">
                                            <div className="flex items-center rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-[#F97316]/20 sm:px-5">
                                                <ShoppingCart size={18} className="mr-4 text-[#94A3B8]" />
                                                <input 
                                                    className="w-full border-none bg-transparent text-[13px] font-bold outline-none focus:ring-0 sm:text-sm" 
                                                    placeholder="ลิงก์สั่งซื้อตรง / Add to cart"
                                                    value={newProduct.order_form}
                                                    onChange={e => setNewProduct({...newProduct, order_form: e.target.value})}
                                                />
                                            </div>
                                            {forms.length > 0 && (
                                                <div className="rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3">
                                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">เลือกฟอร์มจากระบบ</div>
                                                    <select
                                                        className="w-full rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-sm font-bold outline-none"
                                                        defaultValue=""
                                                        onChange={e => {
                                                            const value = e.target.value;
                                                            if (!value) return;
                                                            setNewProduct({ ...newProduct, order_form: getPublicFormUrl(value) });
                                                        }}
                                                    >
                                                        <option value="">เลือกฟอร์มเพื่อใส่ลิงก์อัตโนมัติ</option>
                                                        {forms.map((form) => (
                                                            <option key={form.id} value={form.id}>{form.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="flex items-center rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-[#F97316]/20 sm:px-5">
                                                <Globe size={18} className="mr-4 text-[#94A3B8]" />
                                                <input 
                                                    className="w-full border-none bg-transparent text-[13px] font-bold outline-none focus:ring-0 sm:text-sm" 
                                                    placeholder="ลิงก์เว็บไซต์ดูรายละเอียด"
                                                    value={newProduct.website}
                                                    onChange={e => setNewProduct({...newProduct, website: e.target.value})}
                                                />
                                            </div>
                                            <div className="flex items-center rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-[#F97316]/20 sm:px-5">
                                                <Facebook size={18} className="mr-4 text-[#94A3B8]" />
                                                <input 
                                                    className="w-full border-none bg-transparent text-[13px] font-bold outline-none focus:ring-0 sm:text-sm" 
                                                    placeholder="ลิงก์ Social Media"
                                                    value={newProduct.facebook}
                                                    onChange={e => setNewProduct({...newProduct, facebook: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                            
                            <div className="flex gap-3 pt-2 sm:gap-4 sm:pt-4">
                                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 rounded-2xl border border-[#D9E1F2] py-3.5 text-[11px] font-black uppercase tracking-[0.14rem] text-[#64748B] transition-colors hover:bg-gray-50 sm:py-4 sm:text-xs sm:tracking-widest">ยกเลิก</button>
                                <button className="flex-[1.8] rounded-2xl bg-[#F97316] py-3.5 text-[11px] font-black uppercase tracking-[0.14rem] text-white shadow-md transition-all hover:bg-[#EA580C] active:scale-95 sm:py-4 sm:text-xs sm:tracking-widest">บันทึกสินค้าเข้ารายการ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT PRODUCT MODAL */}
            {editingProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in transition-all" onClick={closeEditModal} />
                    <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[32px] border border-glass-border bg-card-bg p-5 shadow-3xl animate-in zoom-in-95 duration-300 glass-card sm:rounded-[40px] sm:p-8 md:p-10">
                        <button onClick={closeEditModal} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-foreground/[0.02] text-foreground/20 transition-all hover:bg-foreground/5 hover:text-foreground sm:right-6 sm:top-6 sm:h-12 sm:w-12">
                            <X size={22} />
                        </button>

                        <div className="mb-6 flex items-start justify-between gap-4 pr-12 sm:mb-8 sm:pr-14">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">แก้ไขสินค้า</h2>
                                <p className="mt-2 text-sm font-medium text-[#475569] sm:text-base md:text-lg">อัพเดทข้อมูลสินค้าให้พร้อมแสดงผลบนมือถือ</p>
                            </div>
                            <div className="hidden h-16 w-16 items-center justify-center rounded-[28px] border border-[#F97316]/15 bg-[#F97316]/5 text-[#F97316] sm:flex md:h-20 md:w-20 md:rounded-[32px]">
                                <Pencil size={32} className="md:h-10 md:w-10" />
                            </div>
                        </div>

                        <form onSubmit={updateProduct} className="custom-scrollbar max-h-[78vh] space-y-6 overflow-y-auto pr-1 sm:max-h-[74vh] sm:space-y-8 sm:pr-3">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                                <div className="space-y-5 sm:space-y-6">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-[0.2rem] ml-1">ชื่อสินค้าและรุ่น</label>
                                        <input
                                            required
                                            className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-4 text-base font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 sm:px-6 sm:text-lg"
                                            placeholder="Ex. Rolex Submariner..."
                                            value={editProduct.name}
                                            onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-[0.2rem] ml-1">แบรนด์ (ไม่บังคับ)</label>
                                        <input
                                            className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-4 text-base font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 sm:px-6"
                                            placeholder="Ex. Samsung, Apple, Xiaomi..."
                                            value={editProduct.brand}
                                            onChange={e => setEditProduct({ ...editProduct, brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-[0.2rem] ml-1">ราคาสินค้า (บาท)</label>
                                        <input
                                            type="number"
                                            className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-4 text-2xl font-black tracking-tight text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 sm:px-6"
                                            placeholder="0.00"
                                            value={editProduct.price}
                                            onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-[0.2rem] ml-1">แคปชั่น / รายละเอียด</label>
                                        <textarea
                                            className="h-28 w-full resize-none rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-4 font-medium leading-relaxed transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-32 sm:px-6"
                                            placeholder="อธิบายสรรพสินค้าของคุณ..."
                                            value={editProduct.description}
                                            onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-5 sm:space-y-6">
                                    <ProductImageUpload
                                        images={editProduct.images}
                                        onChange={(images) => setEditProduct({ ...editProduct, images })}
                                        maxImages={5}
                                    />

                                    <div className="space-y-5 border-t border-foreground/5 pt-5 sm:space-y-6 sm:pt-6">
                                        <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2rem] ml-1">Interactive Command Buttons</label>
                                        <div className="space-y-4">
                                            <div className="flex items-center rounded-2xl border border-foreground/10 bg-background px-4 py-3 shadow-sm transition-all hover:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:px-5">
                                                <ShoppingCart size={18} className="text-foreground/20 mr-4" />
                                                <input
                                                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold"
                                                    placeholder="ลิงก์สั่งซื้อตรง / Add to cart"
                                                    value={editProduct.order_form}
                                                    onChange={e => setEditProduct({...editProduct, order_form: e.target.value})}
                                                />
                                            </div>
                                            {forms.length > 0 && (
                                                <div className="rounded-2xl border border-foreground/10 bg-background px-4 py-3 shadow-sm">
                                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">เลือกฟอร์มจากระบบ</div>
                                                    <select
                                                        className="w-full rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-sm font-bold outline-none"
                                                        defaultValue=""
                                                        onChange={e => {
                                                            const value = e.target.value;
                                                            if (!value) return;
                                                            setEditProduct({ ...editProduct, order_form: getPublicFormUrl(value) });
                                                        }}
                                                    >
                                                        <option value="">เลือกฟอร์มเพื่อใส่ลิงก์อัตโนมัติ</option>
                                                        {forms.map((form) => (
                                                            <option key={form.id} value={form.id}>{form.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            <div className="flex items-center rounded-2xl border border-foreground/10 bg-background px-4 py-3 shadow-sm transition-all hover:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:px-5">
                                                <Globe size={18} className="text-foreground/20 mr-4" />
                                                <input
                                                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold"
                                                    placeholder="ลิงก์เว็บไซต์ดูรายละเอียด"
                                                    value={editProduct.website}
                                                    onChange={e => setEditProduct({...editProduct, website: e.target.value})}
                                                />
                                            </div>
                                            <div className="flex items-center rounded-2xl border border-foreground/10 bg-background px-4 py-3 shadow-sm transition-all hover:border-primary focus-within:ring-2 focus-within:ring-primary/20 sm:px-5">
                                                <Facebook size={18} className="text-blue-500/50 mr-4" />
                                                <input
                                                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold"
                                                    placeholder="ลิงก์ Social Media"
                                                    value={editProduct.facebook}
                                                    onChange={e => setEditProduct({...editProduct, facebook: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 flex gap-3 border-t border-foreground/5 bg-card-bg/95 pt-4 backdrop-blur sm:gap-4 sm:pt-5">
                                <button type="button" onClick={closeEditModal} className="flex-1 rounded-[20px] border border-[#D9E1F2] bg-white px-4 py-4 text-xs font-black uppercase tracking-[0.16rem] text-[#64748B] transition-all hover:text-foreground sm:py-5">ยกเลิก</button>
                                <button className="flex-[1.4] rounded-[20px] bg-[#F97316] px-4 py-4 text-xs font-black uppercase tracking-[0.16rem] text-white shadow-3xl shadow-[#F97316]/20 transition-all hover:bg-[#EA580C] active:scale-95 sm:py-5">อัพเดทสินค้า</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SETTINGS MODAL */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl animate-in fade-in transition-all" onClick={closeSettingsModal} />
                    <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[32px] border border-glass-border bg-card-bg p-5 shadow-3xl animate-in slide-in-from-right-10 duration-500 glass-card sm:rounded-[40px] sm:p-8 md:p-10">
                        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
                             <h2 className="flex items-center gap-3 text-2xl font-black leading-none tracking-tight sm:gap-4 sm:text-3xl">
                                <Pencil className="text-primary" size={24} /> แก้ชื่อแคตตาล็อก
                             </h2>
                             <button
                                onClick={closeSettingsModal}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-foreground/[0.02] text-foreground/20 transition-colors hover:bg-foreground/5 hover:text-foreground sm:h-12 sm:w-12"
                             >
                                <X size={22} />
                             </button>
                        </div>

                        <div className="custom-scrollbar max-h-[78vh] space-y-7 overflow-y-auto pr-1 sm:max-h-[72vh] sm:space-y-9 sm:pr-3">
                            <div className="space-y-3">
                                <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">CATALOG NAME</label>
                                <input
                                    className="w-full rounded-[24px] border border-foreground/10 bg-foreground/5 px-5 py-4 text-xl font-black tracking-tight transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 sm:px-6 sm:py-5 sm:text-2xl"
                                    value={settings.title}
                                    onChange={e => setSettings({ ...settings, title: e.target.value })}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAdvancedSettings((prev) => !prev)}
                                className="flex w-full items-center justify-between rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 text-left text-sm font-black text-[#050579] transition-colors hover:border-[#BCCBE8]"
                            >
                                <span className="flex items-center gap-2">
                                    <Settings size={16} />
                                    ตั้งค่าขั้นสูง
                                </span>
                                <span className="text-xs font-black uppercase tracking-[0.16rem] text-[#64748B]">
                                    {showAdvancedSettings ? 'ซ่อน' : 'แสดง'}
                                </span>
                            </button>

                            {showAdvancedSettings && (
                                <>
                                    <div className="space-y-4 sm:space-y-5">
                                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">THEME ARCHITECTURE</label>
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                            {[
                                                { id: 'standard', name: 'ธุรกิจทั่วไป', icon: Package },
                                                { id: 'jewelry', name: 'ความงามหรูหรา', icon: Sparkles },
                                                { id: 'cosmetic', name: 'สายคลีน-มินิมอล', icon: Palette },
                                                { id: 'resort', name: 'Lifestyle & Travel', icon: Globe }
                                            ].map(temp => (
                                                <button 
                                                    key={temp.id}
                                                    onClick={() => setSettings({...settings, template_id: temp.id})}
                                                    className={`group flex min-h-[168px] flex-col items-center justify-center gap-3 rounded-[24px] border-2 px-3 py-5 text-center transition-all sm:min-h-[190px] sm:gap-4 sm:p-6 ${settings.template_id === temp.id ? 'bg-primary/5 border-primary text-primary shadow-xl shadow-primary/5' : 'bg-background border-foreground/5 text-[#64748B] hover:border-foreground/10 hover:text-[#475569]'}`}
                                                >
                                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all sm:h-14 sm:w-14 ${settings.template_id === temp.id ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-foreground/5 group-hover:bg-foreground/10'}`}>
                                                        <temp.icon size={22} />
                                                    </div>
                                                    <span className="text-sm font-black leading-tight sm:text-xs sm:uppercase sm:tracking-widest">{temp.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">EMPHASIS STICKERS</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['🔥 HOT DEAL', '✨ NEW ARRIVAL', '💎 PREMIUM', '🚀 SALE', '🎯 RECOMMENDED'].map(sticker => (
                                                <button 
                                                    key={sticker}
                                                    type="button"
                                                    onClick={() => {
                                                        const exists = settings.stickers.includes(sticker);
                                                        setSettings({
                                                            ...settings, 
                                                            stickers: exists 
                                                                ? settings.stickers.filter(s => s !== sticker) 
                                                                : [...settings.stickers, sticker]
                                                        });
                                                    }}
                                                    className={`rounded-xl border px-4 py-2 text-[10px] font-black tracking-widest transition-all ${settings.stickers.includes(sticker) ? 'scale-105 border-[#F97316] bg-[#F97316] text-white shadow-xl shadow-[#F97316]/20' : 'border-transparent bg-foreground/5 text-[#64748B] hover:border-foreground/10'}`}
                                                >
                                                    {sticker}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-8">
                                        <div className="space-y-3 sm:space-y-4">
                                            <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">PRIMARY COLOR</label>
                                            <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-foreground/5 p-4 sm:gap-4">
                                                <input
                                                    type="color"
                                                    className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer p-0 sr-only"
                                                    id="accent-color-set"
                                                    value={settings.primary_color}
                                                    onChange={e => setSettings({ ...settings, primary_color: e.target.value })}
                                                />
                                                <label htmlFor="accent-color-set" className="w-10 h-10 rounded-xl border-4 border-background cursor-pointer shadow-xl" style={{ backgroundColor: settings.primary_color }} />
                                                <input
                                                    className="flex-1 bg-transparent border-none text-[10px] font-black font-mono uppercase tracking-[0.16rem] outline-none focus:ring-0"
                                                    value={settings.primary_color}
                                                    onChange={e => setSettings({ ...settings, primary_color: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 sm:space-y-4">
                                            <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">CUSTOM SLUG URL</label>
                                            <div className="flex items-center rounded-2xl border border-foreground/10 bg-foreground/5 p-4 text-sm font-black transition-all focus-within:ring-2 focus-within:ring-primary/20">
                                                <span className="opacity-20 mr-1 font-mono">/</span>
                                                <input
                                                    className="bg-transparent border-none focus:ring-0 w-full outline-none font-black text-primary"
                                                    placeholder="Ex. 2026-special"
                                                    value={settings.custom_slug}
                                                    onChange={e => setSettings({ ...settings, custom_slug: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5 border-t border-foreground/5 pt-5 sm:space-y-6 sm:pt-6">
                                        <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">
                                            <Video size={16} className="text-primary" /> VIDEO SHOWCASE
                                        </label>
                                        <p className="text-xs text-[#475569] -mt-2">อัพโหลดวิดีโอแนะนำแคตตาล็อก สามารถตั้งค่าเล่นอัตโนมัติและแนบลิงก์ได้</p>
                                        <VideoUpload
                                            value={settings.video_config}
                                            onChange={(config) => setSettings({ ...settings, video_config: config })}
                                        />
                                    </div>

                                    <div className="space-y-5 border-t border-foreground/5 pt-5 sm:space-y-6 sm:pt-6">
                                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.18rem] text-[#64748B]">CATALOG MASTER LINKS</label>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="group flex items-center rounded-[20px] border border-foreground/10 bg-foreground/[0.02] px-4 py-4 transition-all focus-within:ring-2 focus-within:ring-primary/20 sm:px-5">
                                                <Globe size={20} className="text-foreground/20 group-focus-within:text-primary transition-colors mr-4" />
                                                <input className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold" placeholder="Official Website" value={settings.catalog_ws} onChange={e => setSettings({...settings, catalog_ws: e.target.value})} />
                                            </div>
                                            <div className="group flex items-center rounded-[20px] border border-foreground/10 bg-foreground/[0.02] px-4 py-4 transition-all focus-within:ring-2 focus-within:ring-primary/20 sm:px-5">
                                                <ShoppingCart size={20} className="text-foreground/20 group-focus-within:text-primary transition-colors mr-4" />
                                                <input className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold" placeholder="Main Checkout Form" value={settings.catalog_order} onChange={e => setSettings({...settings, catalog_order: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-6 sm:pt-8">
                                <button 
                                    onClick={saveSettings}
                                    disabled={saving}
                                    className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-primary py-4 text-xs font-black uppercase tracking-[0.16rem] text-white shadow-3xl shadow-primary/20 transition-all hover:opacity-90 active:scale-95 sm:gap-4 sm:py-5"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    {saving ? 'Synchronizing...' : 'Save Catalog Architecture'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <footer className="py-24 text-center opacity-10 font-black uppercase tracking-[0.5rem] text-[10px]">
                NEX Solution © 2024
            </footer>

            {/* QR Code Modal */}
            {showQrModal && (
                <QrCodeModal 
                    url={publicUrl}
                    title={catalog?.title || 'Catalog'}
                    onClose={() => setShowQrModal(false)}
                />
            )}

            {/* Share Modal */}
            {showShareModal && (
                <ShareModal 
                    url={publicUrl}
                    title={catalog?.title || 'Catalog'}
                    onClose={() => setShowShareModal(false)}
                    onCopySuccess={() => showToast('คัดลอกลิงก์แล้ว!', 'success')}
                    onCopyError={() => showToast('คัดลอกลิงก์ไม่สำเร็จ', 'error')}
                />
            )}

            {deletingProduct && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0F172A]/32 backdrop-blur-xl" onClick={() => setDeletingProduct(null)} />
                    <div className="relative z-10 w-full max-w-md rounded-[32px] border border-[#FECACA] bg-white p-8 shadow-2xl">
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]">
                            <Trash2 size={24} />
                        </div>
                        <h2 className="mb-2 text-2xl font-black text-[#991B1B]">ยืนยันการลบสินค้า</h2>
                        <p className="mb-2 text-sm leading-relaxed text-[#7F1D1D]">คุณกำลังจะลบสินค้านี้:</p>
                        <p className="mb-6 break-words font-bold text-[#0F172A]">{deletingProduct.name}</p>
                        <p className="mb-8 text-sm font-semibold text-[#B91C1C]">การลบนี้ไม่สามารถย้อนกลับได้</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingProduct(null)}
                                className="flex-1 rounded-2xl border border-[#D9E1F2] px-5 py-3 text-sm font-black text-[#64748B] transition-colors hover:bg-[#F8FAFF]"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteProduct(deletingProduct.id)}
                                className="flex-1 rounded-2xl bg-[#DC2626] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#B91C1C]"
                            >
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

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--foreground-rgb), 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(var(--primary-rgb), 0.2);
                }
            `}</style>
        </div>
    );
}

function QrCodeModal({ url, title, onClose }: { url: string, title: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-[#D9E1F2] bg-white p-5 text-[#0F172A] shadow-2xl sm:rounded-[32px] sm:p-8">
        <button onClick={onClose} className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] text-[#64748B] transition-colors hover:bg-white sm:right-6 sm:top-6 sm:h-12 sm:w-12">
          <ArrowLeft size={22} />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 sm:mb-5 sm:h-16 sm:w-16 sm:rounded-2xl">
            <QrIcon size={28} className="text-primary sm:h-8 sm:w-8" />
          </div>
          
          <h3 className="text-2xl font-black leading-tight text-[#111B3A] sm:text-3xl">QR Code</h3>
          <p className="mx-auto mt-3 max-w-xs text-sm font-medium leading-6 text-[#64748B] sm:mt-4 sm:max-w-sm sm:text-base sm:leading-7">
            สแกนเพื่อเปิดแคตตาล็อกนี้บนมือถือ
          </p>
          
          <div className="mx-auto mt-5 w-full max-w-[320px] rounded-[28px] border border-[#D9E1F2] bg-[#F8FAFF] p-4 shadow-[0_18px_34px_-24px_rgba(15,23,42,0.24)] sm:mt-6 sm:p-5">
            <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">QR Code</div>
            <QrCodeImage 
              url={url}
              size={220}
              className="w-full h-auto"
            />
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-[#475569] sm:text-base">{title}</p>
              <p className="break-all text-[11px] leading-5 text-[#64748B] sm:text-xs sm:leading-6">{url}</p>
            </div>
            <QrCodeDownloadActions
              qrValue={url}
              fileBaseName={`catalog-${title.replace(/\s+/g, '-').toLowerCase() || 'qr'}`}
              titleLine="QR Code"
              nameLine={title}
              bottomLabel="URL"
              bottomLine={url}
              className="mt-5 sm:mt-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareModal({
  url,
  title,
  onClose,
  onCopySuccess,
  onCopyError,
}: {
  url: string,
  title: string,
  onClose: () => void,
  onCopySuccess: () => void,
  onCopyError: () => void,
}) {
  const shareText = `ดูแคตตาล็อก ${title} สินค้าน่าสนใจมากมาย!`;

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
      onCopySuccess();
    } catch (err) {
      console.error('Failed to copy:', err);
      onCopyError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-[#D9E1F2] bg-white p-5 text-[#0F172A] shadow-2xl sm:rounded-[32px] sm:p-8">
        <button onClick={onClose} className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] text-[#64748B] transition-colors hover:bg-white sm:right-6 sm:top-6 sm:h-12 sm:w-12">
            <ArrowLeft size={22} />
        </button>

        <div>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 sm:mb-5 sm:h-16 sm:w-16 sm:rounded-2xl">
            <Share2 size={28} className="text-primary sm:h-8 sm:w-8" />
          </div>
          
          <div className="text-center">
            <h3 className="text-2xl font-black leading-tight text-[#111B3A] sm:text-3xl">แชร์แคตตาล็อก</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm font-medium leading-6 text-[#64748B] sm:mt-4 sm:max-w-sm sm:text-base sm:leading-7">
              เชิญเพื่อนๆ มาชมสินค้าในแคตตาล็อกของคุณ
            </p>
          </div>
          
          <div className="mt-5 space-y-3 sm:mt-6">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center gap-4 rounded-[22px] border border-[#D9E1F2] bg-[#F7FAFF] px-4 py-4 transition-all hover:border-[#BCCBE8] hover:bg-white"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${link.color} text-white shadow-sm sm:h-12 sm:w-12 sm:rounded-[16px]`}>
                  <link.icon size={20} />
                </div>
                <span className="min-w-0 flex-1 text-lg font-semibold text-[#0F172A] transition-colors group-hover:text-primary">{link.name}</span>
                <ExternalLink size={18} className="text-[#64748B] transition-transform group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
          
          <div className="mt-5 sm:mt-6">
            <button
              onClick={copyToClipboard}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-[20px] bg-primary px-6 py-4 text-base font-black text-white shadow-[0_20px_45px_-24px_rgba(5,5,121,0.42)] transition-all hover:bg-primary/90"
            >
              <ExternalLink size={20} />
              คัดลอกลิงก์
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
