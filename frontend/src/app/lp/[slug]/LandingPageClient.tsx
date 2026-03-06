"use client";

import { useEffect, useState } from 'react';
import { 
  Globe, ExternalLink, Share2, Facebook, Twitter, 
  ChevronRight, MessageSquare, Package, Layout
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import Cookies from 'js-cookie';

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
    owner_uid?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';

export default function LandingPageClient({ page }: { page: LandingPage }) {
    useEffect(() => {
        // Log landing page view on mount
        if (page.owner_uid) {
            logLandingPageView(page.owner_uid, page.id, page.slug);
        }
    }, [page.id]);

    const logLandingPageView = async (ownerUid: string, pageId: number, pageSlug: string) => {
        try {
            let vid = Cookies.get('vid');
            if (!vid) {
                vid = Math.random().toString(36).substring(2) + Date.now().toString(36);
                Cookies.set('vid', vid, { expires: 365 });
            }

            await fetch(`${API_URL}/analytics/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: ownerUid,
                    action: 'VIEW_LANDING_PAGE',
                    visitorId: vid,
                    metadata: {
                        type: 'landing_page',
                        pageId,
                        slug: pageSlug,
                        referrer: typeof document !== 'undefined' ? document.referrer : '',
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                    },
                }),
            });
        } catch (err) {
            console.error('Landing page analytics error:', err);
        }
    };

    const theme = page.theme_config || {};
    const primary = theme.primary_color || '#6366F1';
    const bg = theme.bg_color || '#000000';
    const isLight = bg === '#ffffff';

    return (
        <div className="min-h-screen selection:bg-primary/30 bg-background text-foreground transition-colors duration-500" style={{ fontFamily: theme.font_family || 'inherit' }}>
            <nav className="fixed top-0 left-0 w-full h-16 border-b border-foreground/5 bg-background/50 backdrop-blur-md flex items-center justify-between px-6 z-50">
                <Link href="/" className="font-bold text-xl tracking-tight">NAMECARD<span className="text-primary">.AI</span></Link>
                <ThemeToggle />
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-20 md:py-32 space-y-24 md:space-y-40">
                {page.content_blocks.map(block => (
                    <div key={block.id} className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        <PublicBlock 
                            block={block} 
                            theme={theme} 
                            isLight={theme.bg_color === '#ffffff'} 
                            ownerUid={page.owner_uid}
                            pageId={page.id}
                            pageSlug={page.slug}
                        />
                    </div>
                ))}

                {/* Footer / Social Sharing */}
                <footer className="pt-20 border-t border-white/5 text-center">
                   <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-8">Share this campaign</p>
                   <div className="flex items-center justify-center gap-4">
                        <ShareButton 
                            icon={Facebook} 
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} 
                        />
                        <ShareButton 
                            icon={Twitter} 
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(page.title)}`} 
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

function PublicBlock({ block, theme, isLight, ownerUid, pageId, pageSlug }: { block: Block, theme: any, isLight: boolean, ownerUid?: string, pageId: number, pageSlug: string }) {
    switch (block.type) {
        case 'text':
            return (
                <div className="max-w-3xl mx-auto text-center md:text-left">
                    <h2 className={`text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-tight animate-gradient ${isLight ? 'text-black' : 'text-white'}`}>
                        {block.content.title}
                    </h2>
                    <p
                        className={`text-xl md:text-2xl leading-relaxed whitespace-pre-wrap ${isLight ? 'text-gray-600' : 'text-gray-400'}`}
                    >
                        {block.content.body}
                    </p>
                </div>
            );
        case 'image':
            return (
                <div className="max-w-6xl mx-auto">
                    <div
                        className={`
                            rounded-[48px] overflow-hidden shadow-2xl border border-white/5
                            ${block.content.align === 'left' ? 'mx-0 mr-auto' : ''}
                            ${block.content.align === 'right' ? 'ml-auto mr-0' : ''}
                            ${!block.content.align || block.content.align === 'center' ? 'mx-auto' : ''}
                            ${block.content.size === 'small' ? 'max-w-md' : ''}
                            ${block.content.size === 'medium' || !block.content.size ? 'max-w-3xl' : ''}
                            ${block.content.size === 'large' ? 'max-w-5xl' : ''}
                        `}
                    >
                        {block.content.link ? (
                            <a href={block.content.link} target="_blank" rel="noopener noreferrer">
                                <img src={block.content.url} alt="Campaign visual" className="w-full h-auto hover:scale-105 transition-transform duration-1000" />
                            </a>
                        ) : (
                            <img src={block.content.url} alt="Campaign visual" className="w-full h-auto hover:scale-105 transition-transform duration-1000" />
                        )}
                    </div>
                </div>
            );
        case 'video': {
            const videoConfig = block.content.video_config;
            const sourceType = block.content.source_type || 'external';

            return (
                <div className="max-w-5xl mx-auto">
                    <div className="aspect-video rounded-[48px] overflow-hidden bg-black border border-white/10 shadow-2xl">
                        {sourceType === 'upload' && videoConfig?.url ? (
                            videoConfig.link_enabled && videoConfig.link_url ? (
                                <a href={videoConfig.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                                    <video
                                        src={videoConfig.url.startsWith('http') ? videoConfig.url : `${API_URL}${videoConfig.url}`}
                                        autoPlay={videoConfig.autoplay}
                                        muted={videoConfig.autoplay}
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-black px-4 py-2 rounded-full text-sm font-bold transition-opacity">คลิกเพื่อเปิดลิงก์</span>
                                    </div>
                                </a>
                            ) : (
                                <video
                                    src={videoConfig.url.startsWith('http') ? videoConfig.url : `${API_URL}${videoConfig.url}`}
                                    autoPlay={videoConfig.autoplay}
                                    muted={videoConfig.autoplay}
                                    loop
                                    playsInline
                                    controls
                                    className="w-full h-full object-cover"
                                />
                            )
                        ) : (
                            <iframe
                                className="w-full h-full"
                                src={block.content.url?.replace('watch?v=', 'embed/')}
                                title="Video content"
                                frameBorder="0"
                                allowFullScreen
                            />
                        )}
                    </div>
                </div>
            );
        }
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
            // โหมดดั้งเดิม: ปุ่มเปิด external form
            if (!block.content?.mode || block.content.mode === 'external') {
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
            }
            return (
                <InternalLandingForm 
                    block={block} 
                    isLight={isLight} 
                    ownerUid={ownerUid} 
                    pageId={pageId} 
                    pageSlug={pageSlug} 
                />
            );
        default:
            return null;
    }
}

function InternalLandingForm({ block, isLight, ownerUid, pageId, pageSlug }: { block: Block, isLight: boolean, ownerUid?: string, pageId: number, pageSlug: string }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ownerUid) return;
        if (!consent) {
            setError('กรุณายืนยันการยินยอมให้จัดเก็บข้อมูล (PDPA)');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/contact/${ownerUid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    message,
                    pdpa_consent: true,
                    source_type: 'landing_page',
                    source_id: pageId,
                    source_url: pageSlug,
                }),
            });
            if (!res.ok) {
                throw new Error('ส่งข้อมูลไม่สำเร็จ');
            }
            
            // log analytics for form submission
            try {
                let vid = Cookies.get('vid');
                if (!vid) {
                    vid = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    Cookies.set('vid', vid, { expires: 365 });
                }
                await fetch(`${API_URL}/analytics/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: ownerUid,
                        action: 'SUBMIT_LANDING_FORM',
                        visitorId: vid,
                        metadata: {
                            type: 'landing_page_form',
                            pageId,
                            slug: pageSlug,
                        },
                    }),
                });
            } catch (err) {
                console.error('Landing form analytics error:', err);
            }

            const thankYouText = block.content.thank_you_message || 'ขอบคุณสำหรับการติดต่อ ทีมงานจะติดต่อกลับโดยเร็วที่สุด';
            setSuccess(thankYouText);
            setName('');
            setEmail('');
            setPhone('');
            setMessage('');
            setConsent(false);

            if (block.content.redirect_url) {
                const delaySec = typeof block.content.redirect_delay === 'number' ? block.content.redirect_delay : 3;
                setTimeout(() => {
                    window.location.href = block.content.redirect_url;
                }, Math.max(0, delaySec) * 1000);
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className={`p-12 md:p-20 rounded-[56px] border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0a0a0a] border-white/5'}`}>
                <MessageSquare size={48} className="mx-auto mb-8 text-primary" />
                <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-center">ติดต่อเราทันที</h3>
                {success ? (
                    <p className={`text-lg md:text-xl text-center ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                        {success}
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className={`text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>ชื่อ-นามสกุล *</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl bg-black/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className={`text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>อีเมล *</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl bg-black/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>เบอร์โทรศัพท์</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-black/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>รายละเอียดที่ต้องการสอบถาม *</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-2xl bg-black/10 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
                            />
                        </div>
                        <div className="flex items-start gap-2">
                            <input
                                id="pdpa-consent"
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="mt-1"
                            />
                            <label htmlFor="pdpa-consent" className={`text-xs ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                ฉันยินยอมให้จัดเก็บและใช้ข้อมูลนี้เพื่อการติดต่อกลับ ตามนโยบายความเป็นส่วนตัว (PDPA)
                            </label>
                        </div>
                        {error && (
                            <p className="text-xs text-red-400">{error}</p>
                        )}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting || !ownerUid}
                                className={`w-full inline-flex items-center justify-center gap-3 px-12 py-4 font-black rounded-[32px] text-lg transition-all ${
                                    isLight ? 'bg-black text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-200'
                                } disabled:opacity-60`}
                            >
                                {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลให้ทีมงานติดต่อกลับ'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
