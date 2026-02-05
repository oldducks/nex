"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Plus, Layout, Globe, ArrowLeft, Trash2, 
  Settings, ExternalLink, Eye, EyeOff, 
  Search, Package, Calendar, MoreVertical, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    const [newPage, setNewPage] = useState({ title: '', slug: '' });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://namecard.dpattown.com';
    const token = Cookies.get('token');

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchPages();
    }, [token]);

    const fetchPages = async () => {
        try {
            const res = await fetch(`${API_URL}/landing-pages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setPages(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
        } catch (error) {}
    };

    if (loading) return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            {/* Navbar */}
            <nav className="border-b border-foreground/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/manage/control-center" className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-all group">
                            <ArrowLeft size={18} className="text-foreground/40 group-hover:text-foreground transition-colors" />
                        </Link>
                        <h1 className="font-bold text-lg tracking-tight">จัดการ Landing Page</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button 
                            onClick={() => setShowModal(true)}
                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
                        >
                            <Plus size={18} /> <span className="hidden sm:inline">สร้างใหม่</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="mb-12">
                    <h2 className="text-4xl font-black mb-2 tracking-tighter">จัดการแคมเปญ</h2>
                    <p className="text-foreground/50 text-lg">สร้างและจัดการ Landing Page สำหรับธุรกิจของคุณได้ไม่จำกัด</p>
                </div>

                {pages.length === 0 ? (
                    <div className="text-center py-32 border-2 border-dashed border-foreground/10 rounded-[40px] bg-foreground/5 glass-card">
                        <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Layout size={40} className="text-foreground/10" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 tracking-tight">ยังไม่มีหน้าแคมเปญ</h3>
                        <p className="text-foreground/30 max-w-sm mx-auto mb-10 font-medium">เริ่มต้นสร้างหน้าเซลล์เพจแรกของคุณเพื่อเพิ่มยอดขายและติดตามผลลัพธ์ผ่านระบบอัจฉริยะ</p>
                        <button onClick={() => setShowModal(true)} className="bg-foreground text-background font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-foreground/5">สร้างหน้าเพจใหม่ตอนนี้</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pages.map(page => (
                            <div key={page.id} className="group bg-card-bg border border-foreground/5 rounded-[40px] overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-2xl hover:-translate-y-2 glass-card">
                                <div className="p-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${page.is_published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-foreground/5 text-foreground/20'}`}>
                                            <Layout size={28} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => toggleVisibility(page)}
                                                className={`p-2.5 rounded-xl transition-all ${page.is_published ? 'text-emerald-500 bg-emerald-500/10' : 'text-foreground/20 bg-foreground/5 hover:bg-foreground/10'}`}
                                            >
                                                {page.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <button 
                                                onClick={() => deletePage(page.id)}
                                                className="p-2.5 text-foreground/20 bg-foreground/5 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors truncate tracking-tight">{page.title}</h3>
                                    <p className="text-foreground/40 text-sm mb-8 line-clamp-2 h-10 font-medium">{page.description || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        <div className="p-4 bg-foreground/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/30 flex items-center gap-2">
                                            <Calendar size={14} className="text-primary/50" />
                                            {new Date(page.created_at).toLocaleDateString('th-TH')}
                                        </div>
                                        <div className="p-4 bg-foreground/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground/30 flex items-center gap-2 truncate">
                                            <Globe size={14} className="text-primary/50 shrink-0" />
                                            {page.slug}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <Link 
                                            href={`/manage/landing-pages/${page.id}`}
                                            className="flex-1 bg-foreground text-background hover:opacity-90 py-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                        >
                                            แก้ไขดีไซน์
                                        </Link>
                                        <Link 
                                            href={`/lp/${page.slug}`}
                                            target="_blank"
                                            className="w-14 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white py-4 rounded-2xl transition-all active:scale-95"
                                        >
                                            <ExternalLink size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in transition-all" onClick={() => setShowModal(false)} />
                    <div className="bg-card-bg border border-glass-border rounded-[40px] p-10 w-full max-w-md relative z-10 shadow-3xl animate-in zoom-in-95 duration-300 glass-card">
                        <div className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl font-black tracking-tight">สร้างแคมเปญใหม่</h2>
                            <p className="text-foreground/40 text-sm mt-2 font-medium">เริ่มต้นด้วยการตั้งชื่อและ URL สำหรับเพจตัวใหม่ของคุณ</p>
                        </div>

                        <form onSubmit={createPage} className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">ชื่อแคมเปญ</label>
                                <input
                                    required
                                    className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
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
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Slug URL (สำหรับเข้าถึงหน้าเว็บ)</label>
                                <div className="flex items-center gap-2 bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                    <span className="text-foreground/20 text-sm font-bold">/lp/</span>
                                    <input
                                        required
                                        className="bg-transparent border-none focus:ring-0 text-lg w-full outline-none font-bold placeholder:font-normal"
                                        placeholder="your-url-slug"
                                        value={newPage.slug}
                                        onChange={e => setNewPage({ ...newPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-') })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-foreground/30 font-black uppercase tracking-widest text-xs hover:text-foreground transition-colors">ยกเลิก</button>
                                <button className="flex-[2] bg-primary hover:opacity-90 text-white font-black py-4 rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest text-xs">สร้างโปรเจกต์ใหม่</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
