"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Plus, FileText, Settings, LogOut, Package, ExternalLink, Loader2, User, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Catalog {
    id: number;
    title: string;
    description: string;
    pdf_url?: string;
    created_at: string;
    products: any[];
}

export default function Dashboard() {
    const router = useRouter();
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newCatalog, setNewCatalog] = useState({ title: '', description: '' });
    const [generatingId, setGeneratingId] = useState<number | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = Cookies.get('token');

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchCatalogs();
    }, [token]);

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
            const res = await fetch(`${API_URL}/catalogs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newCatalog)
            });
            if (res.ok) {
                setShowModal(false);
                setNewCatalog({ title: '', description: '' });
                fetchCatalogs();
            }
        } catch (error) {
            console.error(error);
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
            // Ideally use polling or socket here
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

    if (loading) return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            {/* Navbar */}
            <nav className="border-b border-foreground/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight">NAMECARD<span className="text-primary">.AI</span> <span className="text-foreground/40 font-normal text-sm ml-2 hidden sm:inline">/ Catalogs</span></div>
                    <div className="flex items-center gap-2 sm:gap-6">
                        <Link
                            href="/manage/dashboard"
                            className="text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 text-sm"
                        >
                            <LayoutDashboard size={16} /> <span className="hidden md:inline">สถิติ</span>
                        </Link>
                        <Link
                            href="/manage/profile"
                            className="text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 text-sm"
                        >
                            <User size={16} /> <span className="hidden md:inline">แก้ไขโปรไฟล์</span>
                        </Link>
                        <Link
                            href={`/${Cookies.get('uid') || ''}`}
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

            {/* Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight">แคตตาล็อกของฉัน</h1>
                        <p className="text-foreground/60">จัดการคอลเลกชันสินค้าและไฟล์ PDF สำหรับลูกค้า</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        <Plus size={18} /> สร้างแคตตาล็อกใหม่
                    </button>
                </div>

                {catalogs.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-foreground/10 rounded-[32px] bg-foreground/5">
                        <div className="bg-foreground/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} className="text-foreground/20" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">ยังไม่มีแคตตาล็อก</h3>
                        <p className="text-foreground/40 mb-8 max-w-sm mx-auto">เริ่มสร้างแคตตาล็อกแรกของคุณเพื่อเพิ่มรายการสินค้าและแชร์กับลูกค้าของคุณ</p>
                        <button onClick={() => setShowModal(true)} className="bg-foreground text-background px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">สร้างแคตตาล็อกตอนนี้</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {catalogs.map(catalog => (
                            <div key={catalog.id} className="glass-card bg-foreground/5 border border-foreground/10 p-8 rounded-[32px] hover:border-primary/30 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
                                
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                                        <FileText size={28} />
                                    </div>
                                    {catalog.pdf_url && (
                                        <a
                                            href={`${API_URL}${catalog.pdf_url}`}
                                            target="_blank"
                                            className="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 hover:bg-green-500/20 transition-colors"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            PDF เผยแพร่แล้ว
                                        </a>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{catalog.title}</h3>
                                <p className="text-foreground/60 text-sm mb-8 line-clamp-2 h-10 leading-relaxed">{catalog.description || 'ไม่มีคำอธิบาย'}</p>

                                <div className="flex gap-3 mt-auto relative z-10">
                                    <Link
                                        href={`/manage/catalogs/${catalog.id}`}
                                        className="flex-1 bg-foreground text-background py-3.5 rounded-2xl text-center font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        จัดการสินค้า
                                    </Link>
                                    <button
                                        onClick={() => generatePdf(catalog.id)}
                                        disabled={generatingId === catalog.id}
                                        className="bg-foreground/5 hover:bg-foreground/10 border border-foreground/5 p-3.5 rounded-2xl text-foreground/60 hover:text-foreground transition-all"
                                        title="ตั้งค่า/สร้าง PDF ใหม่"
                                    >
                                        {generatingId === catalog.id ? <Loader2 size={20} className="animate-spin" /> : <Settings size={20} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
                    <div className="bg-card-bg border border-glass-border rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <h2 className="text-2xl font-black mb-6 tracking-tight">สร้างแคตตาล็อกใหม่</h2>
                        <form onSubmit={createCatalog} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">หัวข้อแคตตาล็อก</label>
                                <input
                                    required
                                    className="w-full bg-foreground/5 border border-glass-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/20"
                                    value={newCatalog.title}
                                    placeholder="เช่น คอลเลกชันฤดูร้อน 2024"
                                    onChange={e => setNewCatalog({ ...newCatalog, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">คำอธิบาย</label>
                                <textarea
                                    className="w-full bg-foreground/5 border border-glass-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all h-32 resize-none placeholder:text-foreground/20"
                                    value={newCatalog.description}
                                    placeholder="เพิ่มรายละเอียดเกี่ยวกับแคตตาล็อกนี้..."
                                    onChange={e => setNewCatalog({ ...newCatalog, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-foreground/60 hover:text-foreground font-bold py-4 transition-colors">
                                    ยกเลิก
                                </button>
                                <button className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                                    สร้างแคตตาล็อก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
