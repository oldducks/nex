"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Plus, ArrowLeft, Trash2, GripVertical, Image as ImageIcon,
  Package, Settings, Globe, ShoppingCart, Facebook,
  Palette, Type, RefreshCw, Eye, Save, QrCode as QrIcon,
  ExternalLink, Download, FileJson, Layers, Sparkles, Loader2, X, Pencil
} from 'lucide-react';
import Link from 'next/link';
import { QrCodeImage } from '../../../../components/QrCode';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VideoUpload } from '@/components/VideoUpload';
import ProductImageUpload from '@/components/ProductImageUpload';
import { Video } from 'lucide-react';

interface VideoConfig {
    url: string;
    autoplay: boolean;
    link_url?: string;
    link_enabled: boolean;
    enabled: boolean;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    order: number;
    images_json: string[];
    interactive_links?: any;
}

interface Catalog {
    id: number;
    title: string;
    description: string;
    custom_slug?: string;
    layout_config?: any;
    interactive_links?: any;
    pdf_url?: string;
    video_config?: VideoConfig;
}

export default function CatalogDetail() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [catalog, setCatalog] = useState<Catalog | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [newProduct, setNewProduct] = useState({
        name: '', description: '', price: '', images: [] as string[],
        website: '', order_form: '', facebook: ''
    });

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editProduct, setEditProduct] = useState({
        name: '', description: '', price: '', images: [] as string[],
        website: '', order_form: '', facebook: ''
    });
    
    const [settings, setSettings] = useState({
        title: '', description: '', custom_slug: '',
        primary_color: '#6366F1', font_family: 'Inter',
        catalog_ws: '', catalog_fb: '', catalog_order: '',
        template_id: 'standard', stickers: [] as string[],
        video_config: null as VideoConfig | null
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://namecard.dpattown.com';
    const token = Cookies.get('token');

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
            const [catRes, prodRes] = await Promise.all([
                fetch(`${API_URL}/catalogs/user/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/products?catalog_id=${id}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            if (catRes.ok) {
                const cat = await catRes.json();
                setCatalog(cat);
                setSettings({
                    title: cat.title,
                    description: cat.description || '',
                    custom_slug: cat.custom_slug || '',
                    primary_color: cat.layout_config?.primary_color || '#6366F1',
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
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
                    name: '', description: '', price: '', images: [],
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
            name: '', description: '', price: '', images: [],
            website: '', order_form: '', facebook: ''
        });
    };

    const updateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        try {
            const payload = {
                name: editProduct.name,
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
        if (!confirm('ยืนยันหน้าการลบสินค้าชิ้นนี้?')) return;
        try {
            await fetch(`${API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const generatePdf = async () => {
        try {
            await fetch(`${API_URL}/catalogs/${id}/generate-pdf`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('ระบบได้รับคำสั่งสร้างไฟล์ PDF แล้ว... กรุณารอสักครู่ (ประมาณ 30-60 วินาที) ลิงก์ดาวน์โหลดจะปรากฏที่หน้าหลักของแคตตาล็อกนี้');
        } catch (error) {}
    };

    if (loading) return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
             <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
             <p className="text-foreground/40 font-black uppercase tracking-[0.3em] text-[10px]">Processing Database...</p>
        </div>
    );

    const publicUrl = `${SITE_URL}/catalog/${catalog?.custom_slug || catalog?.id}`;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            {/* Header / Navbar */}
            <nav className="border-b border-foreground/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/manage" className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-all group">
                            <ArrowLeft size={18} className="text-foreground/40 group-hover:text-foreground transition-all" />
                        </Link>
                        <div className="hidden sm:block">
                            <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] leading-none mb-1">Catalog Manager</div>
                            <h1 className="font-black text-lg tracking-tight truncate max-w-[200px]">{catalog?.title}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />
                        <div className="h-6 w-[1px] bg-foreground/10 mx-1 hidden md:block"></div>
                        <Link 
                            href={`/catalog/${catalog?.custom_slug || catalog?.id}`} 
                            target="_blank"
                            className="bg-foreground/5 hover:bg-foreground/10 px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground/60 hover:text-foreground"
                        >
                            <Eye size={16} />
                            <span className="hidden lg:block">ดูหน้าสาธารณะ</span>
                        </Link>
                        <button 
                            onClick={() => setShowSettingsModal(true)}
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 text-xs font-black uppercase tracking-widest active:scale-95"
                        >
                            <Settings size={16} />
                            <span className="hidden lg:block">ปรับแต่งธีม</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Stats & Tools Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-card-bg border border-glass-border p-8 rounded-[32px] flex items-center gap-6 glass-card shadow-2xl">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            <Layers size={28} />
                        </div>
                        <div>
                            <div className="text-3xl font-black">{products.length}</div>
                            <div className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.2em]">Total Products</div>
                        </div>
                    </div>
                    
                    <div className="bg-card-bg border border-glass-border p-8 rounded-[32px] flex items-center gap-6 glass-card shadow-2xl">
                        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
                            <Globe size={28} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-black truncate text-foreground/60">/{catalog?.custom_slug || catalog?.id}</div>
                            <div className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.2em]">Digital Link Mapping</div>
                        </div>
                        <button 
                            onClick={() => {navigator.clipboard.writeText(publicUrl); alert('ลิ้งก์ถูกคัดลอกลงคลิปบอร์ดแล้ว!');}}
                            className="w-10 h-10 hover:bg-foreground/5 rounded-xl text-foreground/20 hover:text-foreground transition-all flex items-center justify-center bg-foreground/[0.02]"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>

                    <div className="bg-card-bg border border-glass-border p-8 rounded-[32px] flex items-center justify-between glass-card shadow-2xl group">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                                <QrIcon size={28} />
                            </div>
                            <div>
                                <div className="text-sm font-black tracking-tight">QR Access Point</div>
                                <div className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.2em]">Instant Share</div>
                            </div>
                         </div>
                         <div className="w-14 h-14 bg-white rounded-xl p-1.5 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                            <QrCodeImage url={publicUrl} size={50} />
                         </div>
                    </div>
                </div>

                {/* Products List Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter">สินค้าในเล่ม</h2>
                        <p className="text-foreground/40 text-lg font-medium">จัดการรายการ Multimedia และปุ่ม Interactive สำหรับสินค้าแต่ละชิ้น</p>
                    </div>
                    <button
                        onClick={() => setShowProductModal(true)}
                        className="bg-foreground text-background px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-foreground/5 uppercase tracking-widest text-xs"
                    >
                        <Plus size={20} /> เพิ่มสินค้าใหม่
                    </button>
                </div>

                {/* Products List */}
                {products.length === 0 ? (
                    <div className="text-center py-40 border-2 border-dashed border-foreground/10 rounded-[48px] bg-foreground/5 glass-card">
                        <div className="w-28 h-28 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-10">
                            <Package size={56} className="text-foreground/10" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 tracking-tight">ยังไม่พบรายการสินค้า</h3>
                        <p className="text-foreground/30 max-w-md mx-auto mb-12 text-lg font-medium leading-relaxed">
                            เริ่มต้นสร้างประสบการณ์ช้อปปิ้งออนไลน์ด้วยการเพิ่มสินค้าชิ้นแรก พร้อมปุ่มคำสั่งอัจฉริยะ (Interactive Buttons)
                        </p>
                        <button 
                            onClick={() => setShowProductModal(true)} 
                            className="bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-[24px] font-black shadow-2xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm"
                        >
                            <Plus size={24} className="inline-block mr-2" /> เข้าสู่โหมดพรีเซนต์สินค้า
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="group bg-card-bg border border-foreground/5 p-6 rounded-[32px] hover:border-primary/20 hover:bg-foreground/[0.02] transition-all flex items-center gap-8 glass-card">
                                <div className="text-foreground/10 cursor-grab group-hover:text-primary transition-colors active:cursor-grabbing">
                                    <GripVertical size={24} />
                                </div>
                                <div className="w-24 h-24 bg-background rounded-[24px] flex items-center justify-center overflow-hidden border border-foreground/5 shadow-inner">
                                    {product.images_json?.[0] ? (
                                        <img src={product.images_json[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <ImageIcon size={40} className="text-foreground/5" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-black text-2xl mb-2 group-hover:text-primary transition-colors tracking-tight">{product.name}</h3>
                                    <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-primary bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">฿{parseFloat(product.price).toLocaleString()}</span>
                                        {product.interactive_links?.order_form && (
                                            <span className="flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10"><ShoppingCart size={14} /> Order Mode Enabled</span>
                                        )}
                                        {product.interactive_links?.website && (
                                            <span className="flex items-center gap-2 text-indigo-500 bg-indigo-500/5 px-3 py-1 rounded-lg border border-indigo-500/10"><Globe size={14} /> Web Link Active</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="w-12 h-12 flex items-center justify-center text-foreground/20 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all bg-foreground/[0.02]"
                                        title="แก้ไขสินค้า"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="w-12 h-12 flex items-center justify-center text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all bg-foreground/[0.02]"
                                        title="ลบสินค้า"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* PDF Generation Tool */}
                <div className="mt-20 p-10 bg-gradient-to-br from-primary/5 via-indigo-500/5 to-purple-500/5 border border-primary/10 rounded-[48px] flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
                    <div className="relative z-10">
                        <h3 className="text-3xl font-black mb-4 flex items-center gap-4 tracking-tighter">
                            <Download className="text-primary" size={32} /> การประมวลผล PDF
                        </h3>
                        <p className="text-foreground/40 text-lg max-w-xl leading-relaxed font-medium">
                            สร้างไฟล์แคตตาล็อกรูปแบบทางการ เพื่อให้ลูกค้าสามารถเปิดดูได้ทุกที่แม้ไม่มีอินเทอร์เน็ต ระบบรองรับปุ่มกดใน PDF อย่างสมบูรณ์
                        </p>
                    </div>
                    <button 
                        onClick={generatePdf}
                        className="relative z-10 bg-foreground text-background px-10 py-5 rounded-[24px] font-black flex items-center gap-4 hover:opacity-90 transition-all shadow-3xl shadow-foreground/5 active:scale-95 uppercase tracking-widest text-sm"
                    >
                        Generate Digital Catalog (PDF)
                    </button>
                </div>
            </main>

            {/* PRODUCT MODAL */}
            {showProductModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in transition-all" onClick={() => setShowProductModal(false)} />
                    <div className="bg-card-bg border border-glass-border rounded-[48px] p-12 w-full max-w-3xl relative z-10 shadow-3xl animate-in zoom-in-95 duration-300 glass-card">
                        <button onClick={() => setShowProductModal(false)} className="absolute top-8 right-8 w-12 h-12 rounded-full hover:bg-foreground/5 flex items-center justify-center transition-all bg-foreground/[0.02] text-foreground/20 hover:text-foreground">
                            <X size={24} />
                        </button>
                        
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter">เพิ่มสินค้าใหม่</h2>
                                <p className="text-foreground/40 text-lg mt-2 font-medium">ป้อนข้อมูลพื้นฐานสินค้าและตั้งค่าระบบอัจฉริยะ</p>
                            </div>
                            <div className="w-20 h-20 bg-primary/5 rounded-[32px] flex items-center justify-center text-primary border border-primary/10">
                                <Package size={40} />
                            </div>
                        </div>

                        <form onSubmit={createProduct} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">ชื่อสินค้าและรุ่น</label>
                                        <input
                                            required
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                                            placeholder="Ex. Rolex Submariner..."
                                            value={newProduct.name}
                                            onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">ราคาสินค้า (บาท)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-primary font-black text-2xl tracking-tight"
                                            placeholder="0.00"
                                            value={newProduct.price}
                                            onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">แคปชั่น / รายละเอียด</label>
                                        <textarea
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all h-32 resize-none font-medium leading-relaxed"
                                            placeholder="อธิบายสรรพสินค้าของคุณ..."
                                            value={newProduct.description}
                                            onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <ProductImageUpload
                                        images={newProduct.images}
                                        onChange={(images) => setNewProduct({ ...newProduct, images })}
                                        maxImages={5}
                                    />

                                    <div className="pt-6 border-t border-foreground/5 space-y-6">
                                        <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2rem] ml-1">Interactive Command Buttons</label>
                                        <div className="space-y-4">
                                            <div className="flex items-center bg-background border border-foreground/10 rounded-2xl px-5 py-3 hover:border-primary transition-all focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
                                                <ShoppingCart size={18} className="text-foreground/20 mr-4" />
                                                <input 
                                                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold" 
                                                    placeholder="ลิงก์สั่งซื้อตรง / Add to cart"
                                                    value={newProduct.order_form}
                                                    onChange={e => setNewProduct({...newProduct, order_form: e.target.value})}
                                                />
                                            </div>
                                            <div className="flex items-center bg-background border border-foreground/10 rounded-2xl px-5 py-3 hover:border-primary transition-all focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
                                                <Globe size={18} className="text-foreground/20 mr-4" />
                                                <input 
                                                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold" 
                                                    placeholder="ลิงก์เว็บไซต์ดูรายละเอียด"
                                                    value={newProduct.website}
                                                    onChange={e => setNewProduct({...newProduct, website: e.target.value})}
                                                />
                                            </div>
                                            <div className="flex items-center bg-background border border-foreground/10 rounded-2xl px-5 py-3 hover:border-primary transition-all focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
                                                <Facebook size={18} className="text-blue-500/50 mr-4" />
                                                <input 
                                                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold" 
                                                    placeholder="ลิงก์ Social Media"
                                                    value={newProduct.facebook}
                                                    onChange={e => setNewProduct({...newProduct, facebook: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-6 pt-6">
                                <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-5 text-foreground/30 font-black uppercase tracking-widest text-xs hover:text-foreground transition-all">Cancel</button>
                                <button className="flex-[2] bg-primary hover:opacity-90 text-white font-black py-5 rounded-[24px] shadow-3xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest text-xs">Deploy Product To Catalog</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT PRODUCT MODAL */}
            {editingProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in transition-all" onClick={closeEditModal} />
                    <div className="bg-card-bg border border-glass-border rounded-[48px] p-12 w-full max-w-3xl relative z-10 shadow-3xl animate-in zoom-in-95 duration-300 glass-card">
                        <button onClick={closeEditModal} className="absolute top-8 right-8 w-12 h-12 rounded-full hover:bg-foreground/5 flex items-center justify-center transition-all bg-foreground/[0.02] text-foreground/20 hover:text-foreground">
                            <X size={24} />
                        </button>

                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter">แก้ไขสินค้า</h2>
                                <p className="text-foreground/40 text-lg mt-2 font-medium">อัพเดทข้อมูลสินค้าและตั้งค่าระบบ</p>
                            </div>
                            <div className="w-20 h-20 bg-amber-500/5 rounded-[32px] flex items-center justify-center text-amber-500 border border-amber-500/10">
                                <Pencil size={40} />
                            </div>
                        </div>

                        <form onSubmit={updateProduct} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">ชื่อสินค้าและรุ่น</label>
                                        <input
                                            required
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                                            placeholder="Ex. Rolex Submariner..."
                                            value={editProduct.name}
                                            onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">ราคาสินค้า (บาท)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-primary font-black text-2xl tracking-tight"
                                            placeholder="0.00"
                                            value={editProduct.price}
                                            onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">แคปชั่น / รายละเอียด</label>
                                        <textarea
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all h-32 resize-none font-medium leading-relaxed"
                                            placeholder="อธิบายสรรพสินค้าของคุณ..."
                                            value={editProduct.description}
                                            onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <ProductImageUpload
                                        images={editProduct.images}
                                        onChange={(images) => setEditProduct({ ...editProduct, images })}
                                        maxImages={5}
                                    />

                                    <div className="pt-6 border-t border-foreground/5 space-y-6">
                                        <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2rem] ml-1">Interactive Command Buttons</label>
                                        <div className="space-y-4">
                                            <div className="flex items-center bg-background border border-foreground/10 rounded-2xl px-5 py-3 hover:border-primary transition-all focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
                                                <ShoppingCart size={18} className="text-foreground/20 mr-4" />
                                                <input
                                                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold"
                                                    placeholder="ลิงก์สั่งซื้อตรง / Add to cart"
                                                    value={editProduct.order_form}
                                                    onChange={e => setEditProduct({...editProduct, order_form: e.target.value})}
                                                />
                                            </div>
                                            <div className="flex items-center bg-background border border-foreground/10 rounded-2xl px-5 py-3 hover:border-primary transition-all focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
                                                <Globe size={18} className="text-foreground/20 mr-4" />
                                                <input
                                                    className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold"
                                                    placeholder="ลิงก์เว็บไซต์ดูรายละเอียด"
                                                    value={editProduct.website}
                                                    onChange={e => setEditProduct({...editProduct, website: e.target.value})}
                                                />
                                            </div>
                                            <div className="flex items-center bg-background border border-foreground/10 rounded-2xl px-5 py-3 hover:border-primary transition-all focus-within:ring-2 focus-within:ring-primary/20 shadow-sm">
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

                            <div className="flex gap-6 pt-6">
                                <button type="button" onClick={closeEditModal} className="flex-1 py-5 text-foreground/30 font-black uppercase tracking-widest text-xs hover:text-foreground transition-all">Cancel</button>
                                <button className="flex-[2] bg-amber-500 hover:opacity-90 text-white font-black py-5 rounded-[24px] shadow-3xl shadow-amber-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs">Update Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SETTINGS MODAL */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-3xl animate-in fade-in transition-all" onClick={() => setShowSettingsModal(false)} />
                    <div className="bg-card-bg border border-glass-border rounded-[48px] p-12 w-full max-w-xl relative z-10 shadow-3xl animate-in slide-in-from-right-10 duration-500 glass-card">
                        <div className="flex items-center justify-between mb-10">
                             <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
                                <Palette className="text-primary" size={32} /> การออกแบบ
                             </h2>
                             <button onClick={() => setShowSettingsModal(false)} className="w-12 h-12 rounded-full hover:bg-foreground/5 flex items-center justify-center bg-foreground/[0.02] text-foreground/20 hover:text-foreground"><X size={24} /></button>
                        </div>

                        <div className="space-y-10 max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">TITLE & BRANDING</label>
                                <input
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-2xl font-black tracking-tight"
                                    value={settings.title}
                                    onChange={e => setSettings({ ...settings, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">THEME ARCHITECTURE</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'standard', name: 'ธุรกิจทั่วไป', icon: Package },
                                        { id: 'jewelry', name: 'ความงามหรูหรา', icon: Sparkles },
                                        { id: 'cosmetic', name: 'สายคลีน-มินิมอล', icon: Palette },
                                        { id: 'resort', name: 'Lifestyle & Travel', icon: Globe }
                                    ].map(temp => (
                                        <button 
                                            key={temp.id}
                                            onClick={() => setSettings({...settings, template_id: temp.id})}
                                            className={`p-6 rounded-[24px] border-2 transition-all flex flex-col items-center gap-4 group ${settings.template_id === temp.id ? 'bg-primary/5 border-primary text-primary shadow-xl shadow-primary/5' : 'bg-background border-foreground/5 text-foreground/30 hover:border-foreground/10 hover:text-foreground/50'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${settings.template_id === temp.id ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'bg-foreground/5 group-hover:bg-foreground/10'}`}>
                                                <temp.icon size={24} />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-center leading-tight">{temp.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">EMPHASIS STICKERS</label>
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
                                            className={`px-4 py-2 rounded-xl border text-[10px] font-black tracking-widest transition-all ${settings.stickers.includes(sticker) ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20 scale-105' : 'bg-foreground/5 border-transparent text-foreground/30 hover:border-foreground/10'}`}
                                        >
                                            {sticker}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">PRIMARY COLOR</label>
                                    <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-2xl border border-foreground/10">
                                        <input
                                            type="color"
                                            className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer p-0 sr-only"
                                            id="accent-color-set"
                                            value={settings.primary_color}
                                            onChange={e => setSettings({ ...settings, primary_color: e.target.value })}
                                        />
                                        <label htmlFor="accent-color-set" className="w-10 h-10 rounded-xl border-4 border-background cursor-pointer shadow-xl" style={{ backgroundColor: settings.primary_color }} />
                                        <input
                                            className="flex-1 bg-transparent border-none text-[10px] font-black font-mono uppercase tracking-[0.2rem] focus:ring-0 outline-none"
                                            value={settings.primary_color}
                                            onChange={e => setSettings({ ...settings, primary_color: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">CUSTOM SLUG URL</label>
                                    <div className="flex items-center bg-foreground/5 p-4 rounded-2xl border border-foreground/10 focus-within:ring-2 focus-within:ring-primary/20 transition-all font-black text-sm">
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

                            <div className="space-y-6 pt-6 border-t border-foreground/5">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1 flex items-center gap-2">
                                    <Video size={16} className="text-primary" /> VIDEO SHOWCASE
                                </label>
                                <p className="text-xs text-foreground/40 -mt-2">อัพโหลดวิดีโอแนะนำแคตตาล็อก สามารถตั้งค่าเล่นอัตโนมัติและแนบลิงก์ได้</p>
                                <VideoUpload
                                    value={settings.video_config}
                                    onChange={(config) => setSettings({ ...settings, video_config: config })}
                                />
                            </div>

                            <div className="space-y-6 pt-6 border-t border-foreground/5">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2rem] ml-1">CATALOG MASTER LINKS</label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center bg-foreground/[0.02] border border-foreground/10 rounded-[20px] px-5 py-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all group">
                                        <Globe size={20} className="text-foreground/20 group-focus-within:text-primary transition-colors mr-4" />
                                        <input className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold" placeholder="Official Website" value={settings.catalog_ws} onChange={e => setSettings({...settings, catalog_ws: e.target.value})} />
                                    </div>
                                    <div className="flex items-center bg-foreground/[0.02] border border-foreground/10 rounded-[20px] px-5 py-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all group">
                                        <ShoppingCart size={20} className="text-foreground/20 group-focus-within:text-primary transition-colors mr-4" />
                                        <input className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-bold" placeholder="Main Checkout Form" value={settings.catalog_order} onChange={e => setSettings({...settings, catalog_order: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10">
                                <button 
                                    onClick={saveSettings}
                                    disabled={saving}
                                    className="w-full bg-primary hover:opacity-90 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-3xl shadow-primary/20 uppercase tracking-[0.2rem] text-xs"
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
                Namecard.ai Production Engineering © 2024
            </footer>

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
