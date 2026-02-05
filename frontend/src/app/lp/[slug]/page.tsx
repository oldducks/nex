"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Globe, ExternalLink, Share2, Facebook, Twitter, 
  ChevronRight, MessageSquare, Package, Layout
} from 'lucide-react';
import Link from 'next/link';

interface Block {
    id: string;
    type: 'text' | 'image' | 'video' | 'button' | 'form';
    content: any;
}

interface LandingPage {
    id: number;
    title: string;
    slug: string;
    description: string;
    content_blocks: Block[];
    theme_config: any;
    seo_metadata: any;
}

export default function PublicLandingPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [page, setPage] = useState<LandingPage | null>(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    useEffect(() => {
        fetchPage();
    }, [slug]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`${API_URL}/landing-pages/public/${slug}`);
            if (res.ok) {
                setPage(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!page) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Layout size={40} className="text-gray-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Campaign Expired</h1>
            <p className="text-gray-400 mb-8">ขออภัย หน้าแคมเปญนี้อาจจะยังไม่เปิดใช้งาน หรือสิ้นระยะเวลาโปรโมชั่นแล้ว</p>
            <button onClick={() => window.history.back()} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                กลับหน้าก่อนหน้า
            </button>
        </div>
    );

    const theme = page.theme_config || {};
    const primary = theme.primary_color || '#6366F1';
    const bg = theme.bg_color || '#000000';
    const isLight = bg === '#ffffff';

    return (
        <div className="min-h-screen selection:bg-primary/30" style={{ backgroundColor: bg, color: isLight ? '#000' : '#fff', fontFamily: theme.font_family || 'inherit' }}>
            <main className="max-w-5xl mx-auto px-6 py-20 md:py-32 space-y-24 md:space-y-40">
                {page.content_blocks.map(block => (
                    <div key={block.id} className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <PublicBlock block={block} theme={theme} isLight={isLight} />
                    </div>
                ))}

                {/* Footer / Social Sharing */}
                <footer className="pt-20 border-t border-white/5 text-center">
                   <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Share this campaign</p>
                   <div className="flex items-center justify-center gap-4">
                        <ShareButton 
                            icon={Facebook} 
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} 
                        />
                        <ShareButton 
                            icon={Twitter} 
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(page.title)}`} 
                        />
                   </div>
                   <div className="mt-20 opacity-20 hover:opacity-100 transition-opacity">
                        <Link href="/" className="font-bold text-xs uppercase tracking-tighter">
                            Powered by NAMECARD<span className="text-primary">.AI</span>
                        </Link>
                   </div>
                </footer>
            </main>

            <style jsx global>{`
                ::selection {
                   background: ${primary};
                   color: white;
                }
            `}</style>
        </div>
    );
}

function ShareButton({ icon: Icon, href }: { icon: any, href: string }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/5"
        >
            <Icon size={20} />
        </a>
    );
}

function PublicBlock({ block, theme, isLight }: { block: Block, theme: any, isLight: boolean }) {
    switch (block.type) {
        case 'text':
            return (
                <div className="max-w-3xl mx-auto text-center md:text-left">
                    <h2 className={`text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-tight animate-gradient ${isLight ? 'text-black' : 'text-white'}`}>
                        {block.content.title}
                    </h2>
                    <p className={`text-xl md:text-2xl leading-relaxed whitespace-pre-wrap ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {block.content.body}
                    </p>
                </div>
            );
        case 'image':
            return (
                <div className="max-w-6xl mx-auto">
                    <div className="rounded-[48px] overflow-hidden shadow-2xl border border-white/5">
                        <img src={block.content.url} alt="Campaign visual" className="w-full h-auto hover:scale-105 transition-transform duration-1000" />
                    </div>
                </div>
            );
        case 'video':
            return (
                <div className="max-w-5xl mx-auto">
                    <div className="aspect-video rounded-[48px] overflow-hidden bg-black border border-white/10 shadow-2xl">
                         <iframe 
                            className="w-full h-full"
                            src={block.content.url?.replace('watch?v=', 'embed/')} 
                            title="Video content"
                            frameBorder="0" 
                            allowFullScreen
                         ></iframe>
                    </div>
                </div>
            );
        case 'button':
            return (
                <div className="text-center">
                    <a 
                        href={block.content.url} 
                        target="_blank"
                        className="inline-flex items-center gap-4 px-12 py-7 rounded-[32px] font-black text-2xl md:text-4xl shadow-2xl shadow-primary/40 hover:scale-105 transition-transform transition-colors"
                        style={{ backgroundColor: theme.primary_color, color: '#fff' }}
                    >
                        {block.content.label} <ChevronRight size={32} />
                    </a>
                </div>
            );
        case 'form':
            return (
                <div className="max-w-3xl mx-auto">
                    <div className={`p-12 md:p-20 rounded-[56px] text-center border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0a0a0a] border-white/5'}`}>
                        <MessageSquare size={48} className="mx-auto mb-8 text-primary" />
                        <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">ติดต่อเราทันที</h3>
                        <p className={`text-lg md:text-xl mb-12 ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>เราพร้อมเป็นส่วนหนึ่งในความสำเร็จของคุณ กรุณากรอกรายละเอียดเพื่อรับข้อเสนอพิเศษ</p>
                        <a 
                            href={block.content.url} 
                            target="_blank"
                            className={`inline-flex items-center gap-3 px-12 py-6 font-black rounded-[32px] text-xl transition-all ${isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'}`}
                        >
                            Open Contact Form <ExternalLink size={24} />
                        </a>
                    </div>
                </div>
            );
        default:
            return null;
    }
}
