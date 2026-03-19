"use client";

import { useEffect, useState } from 'react';
import { 
  Globe, ExternalLink, Share2, Facebook, Twitter, 
  ChevronRight, MessageSquare, Package, Layout, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { LeadForm } from '@/components/LeadForm';
import { LogoInline, LogoFooter } from '@/components/Logo';
import Cookies from 'js-cookie';
import { getEmbedUrl } from '@/lib/videoUtils';

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
    // Use NEX brand colors as default
    const primary = theme.primary_color || '#050579';
    const accent = '#F97316';
    const bg = theme.bg_color || '#EFF6FF';
    const isLight = bg === '#ffffff' || bg === '#EFF6FF';

    console.log('LandingPageClient rendering, content_blocks count:', page.content_blocks?.length);
    console.log('Content blocks types:', page.content_blocks?.map((b: Block) => b.type));

    return (
        <div className="relative min-h-screen overflow-hidden transition-colors duration-500" style={{ fontFamily: theme.font_family || 'inherit', backgroundColor: '#EFF6FF', color: '#0F172A' }}>
            {/* Background gradients matching homepage */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.45),transparent_42%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_48%,#e0f2fe_100%)]" />
            </div>
            <div className="pointer-events-none absolute left-[-8rem] top-16 h-80 w-80 rounded-full bg-sky-300/25 blur-[120px]" />
            <div className="pointer-events-none absolute right-[-6rem] top-32 h-72 w-72 rounded-full bg-sky-200/30 blur-[110px]" />
            
            <nav className="fixed top-0 left-0 w-full h-16 backdrop-blur-xl flex items-center justify-between px-6 z-50" style={{ backgroundColor: 'rgba(255,255,255,0.75)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <LogoInline />
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-28 pb-20 md:pt-40 md:pb-32 flex flex-col gap-2.5">
                {page.content_blocks.map(block => (
                    <div key={block.id} style={{ opacity: 1, visibility: 'visible' }}>
                        <PublicBlock 
                            block={block} 
                            theme={theme} 
                            isLight={theme.bg_color === '#ffffff'} 
                            ownerUid={page.owner_uid}
                            pageId={page.id}
                            pageSlug={page.slug}
                            contentBlocks={page.content_blocks}
                        />
                    </div>
                ))}

                {/* Lead Form - ฝากข้อมูลติดต่อกลับ (Disabled/Removed to use block-based form instead) */}
                {/* {page.owner_uid && page.theme_config?.show_lead_form !== false && (
                    <LeadForm targetUid={page.owner_uid} />
                )} */}

                {/* Footer / Social Sharing */}
                <footer className="pt-16 text-center" style={{ borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}` }}>
                   <p className="font-semibold uppercase tracking-widest text-xs mb-6" style={{ color: isLight ? '#6b7280' : '#6b7280' }}>Share this campaign</p>
                   <div className="flex items-center justify-center gap-3">
                        <ShareButton 
                            icon={Facebook} 
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} 
                            isLight={isLight}
                        />
                        <ShareButton 
                            icon={Twitter} 
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(page.title)}`} 
                            isLight={isLight}
                        />
                   </div>
                   <div className="mt-16 opacity-30 hover:opacity-80 transition-opacity">
                        <Link href="/" className="font-semibold text-xs uppercase tracking-tight">
                            Powered by <LogoFooter />
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

function ShareButton({ icon: Icon, href, isLight }: { icon: any, href: string, isLight: boolean }) {
    return (
        <a 
            href={href} 
            target="_blank" 
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ 
                backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                color: isLight ? '#374151' : '#9ca3af'
            }}
        >
            <Icon size={20} />
        </a>
    );
}

function PublicBlock({ block, theme, isLight, ownerUid, pageId, pageSlug, contentBlocks }: { block: Block, theme: any, isLight: boolean, ownerUid?: string, pageId: number, pageSlug: string, contentBlocks: Block[] }) {
    console.log('PublicBlock rendering block.type:', block.type, 'block.id:', block.id);
    const primary = theme.primary_color || '#050579';
    const accent = '#F97316';
    
    switch (block.type) {
        case 'text':
            return (
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 
                        className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]"
                        style={{ color: '#050579' }}
                    >
                        {block.content.title}
                    </h2>
                    <p
                        className="text-lg md:text-xl lg:text-2xl leading-relaxed whitespace-pre-wrap font-medium max-w-2xl mx-auto"
                        style={{ color: '#475569' }}
                    >
                        {block.content.body}
                    </p>
                </div>
            );
        case 'image':
            const imageUrl = block.content.url;
            const hasImage = imageUrl && imageUrl.length > 0;
            
            return (
                <div className="max-w-4xl mx-auto relative z-10">
                    <div
                        className="rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 bg-white"
                        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
                    >
                        {hasImage ? (
                            block.content.link ? (
                                <a href={block.content.link} target="_blank" rel="noopener noreferrer" className="block">
                                    <img src={imageUrl} alt="Campaign visual" className="w-full h-auto hover:scale-[1.02] transition-transform duration-500" />
                                </a>
                            ) : (
                                <img src={imageUrl} alt="Campaign visual" className="w-full h-auto" />
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-8" style={{ minHeight: '300px' }}>
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${primary}20` }}>
                                    <ImageIcon size={40} style={{ color: primary }} />
                                </div>
                                <p className="text-sm font-medium" style={{ color: isLight ? '#6b7280' : '#6b7280' }}>
                                    ยังไม่มีรูปภาพ
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'video': {
            const videoConfig = block.content.video_config;
            const sourceType = block.content.source_type || 'embed';
            const embedUrl = getEmbedUrl(block.content.url);
            const hasVideo = (sourceType === 'upload' && videoConfig?.url) || (sourceType === 'embed' && embedUrl);

            const isLastBlock = contentBlocks[contentBlocks.length - 1]?.id === block.id;
            
            return (
                <div key={block.id} suppressHydrationWarning style={{ width: '100%', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', marginBottom: isLastBlock ? '-4rem' : undefined }}>
                    <div suppressHydrationWarning style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', backgroundColor: '#000', borderRadius: '3rem', overflow: 'hidden' }}>
                        {!hasVideo ? (
                            <div suppressHydrationWarning style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem' }}>
                                <span>ยังไม่มีวิดีโอ</span>
                            </div>
                        ) : sourceType === 'upload' && videoConfig?.url ? (
                            <video
                                src={videoConfig.url.startsWith('http') ? videoConfig.url : videoConfig.url.startsWith('/api') ? videoConfig.url : `${API_URL}${videoConfig.url}`}
                                autoPlay={videoConfig.autoplay}
                                muted={videoConfig.autoplay}
                                loop
                                playsInline
                                controls
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <iframe
                                src={embedUrl}
                                title="Video content"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            />
                        )}
                    </div>
                </div>
            );
        }
        case 'button':
            return (
                <div className="text-center relative z-10">
                    <a 
                        href={block.content.url} 
                        target="_blank"
                        className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-300"
                        style={{ backgroundColor: accent, color: '#fff', boxShadow: `0 10px 40px ${accent}40` }}
                    >
                        {block.content.label} <ChevronRight size={24} />
                    </a>
                </div>
            );
        case 'form':
            // Debug logging
            console.log('Form block detected:', block.content);
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
    console.log('InternalLandingForm rendering, block.content:', block.content);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formFields, setFormFields] = useState<any[]>([]);
    const [loadingForm, setLoadingForm] = useState(false);

    useEffect(() => {
        if (block.content.mode === 'internal' && block.content.form_id) {
            fetchFormFields();
        }
    }, [block.content.form_id]);

    const fetchFormFields = async () => {
        setLoadingForm(true);
        try {
            const res = await fetch(`${API_URL}/public/forms/${block.content.form_id}`);
            if (res.ok) {
                const data = await res.json();
                setFormFields(data.fields || []);
            }
        } catch (err) {
            console.error('Failed to fetch form fields:', err);
        } finally {
            setLoadingForm(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ownerUid) return;

        // สำหรับโหมด internal ต้องเลือกฟอร์มก่อน
        if (block.content.mode === 'internal' && !block.content.form_id) {
            setError('ฟอร์มนี้ยังไม่ได้กำหนดค่า (ยังไม่ได้เลือกฟอร์มจากระบบ)');
            return;
        }

        if (!consent) {
            setError('กรุณายืนยันการยินยอมให้จัดเก็บข้อมูล (PDPA)');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const endpoint = block.content.mode === 'internal' 
                ? `${API_URL}/public/forms/${block.content.form_id}/submit`
                : `${API_URL}/contact/${ownerUid}`;

            const submissionData = block.content.mode === 'internal'
                ? {
                    data: {
                        name,
                        email,
                        phone,
                        message,
                    },
                    source: {
                        referrer: pageSlug,
                        utm_source: 'landing_page',
                    }
                  }
                : {
                    name,
                    email,
                    phone,
                    message,
                    pdpa_consent: true,
                    source_type: 'landing_page',
                    source_id: pageId,
                    source_url: pageSlug,
                };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
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

    console.log('InternalLandingForm: checking condition, mode=', block.content?.mode, 'form_id=', block.content?.form_id);

    if (block.content.mode === 'internal' && !block.content.form_id) {
        console.log('InternalLandingForm: returning "not configured" message');
        return (
            <div className="max-w-3xl mx-auto">
                <div className={`p-12 md:p-16 rounded-[56px] border text-center ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#0a0a0a] border-white/5'}`}>
                    <MessageSquare size={40} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 font-medium">ฟอร์มนี้ยังไม่ได้เลือกรายการจากระบบ</p>
                </div>
            </div>
        );
    }

    console.log('InternalLandingForm: returning form UI');
    return (
        <div className="max-w-3xl mx-auto relative z-20">
            <div className={`p-12 md:p-20 rounded-[56px] border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0a0a0a] border-white/5'}`}>
                <MessageSquare size={48} className="mx-auto mb-8 text-[#050579]" />
                <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-center text-gray-900">ติดต่อเราทันที</h3>
                {success ? (
                    <p className={`text-lg md:text-xl text-center ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>
                        {success}
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>ชื่อ-นามสกุล *</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#050579]/40 text-sm text-gray-900 placeholder-gray-500"
                                    placeholder="กรอกชื่อ-นามสกุล"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>อีเมล *</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#050579]/40 text-sm text-gray-900 placeholder-gray-500"
                                    placeholder="กรอกอีเมล"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>เบอร์โทรศัพท์</label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#050579]/40 text-sm text-gray-900 placeholder-gray-500"
                                placeholder="กรอกเบอร์โทรศัพท์"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className={`text-xs font-semibold ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>รายละเอียดที่ต้องการสอบถาม *</label>
                            <textarea
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#050579]/40 text-sm text-gray-900 placeholder-gray-500 resize-none"
                                placeholder="กรอกรายละเอียดที่ต้องการสอบถาม"
                            />
                        </div>
                        <div className="flex items-start gap-2">
                            <input
                                id="pdpa-consent"
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="mt-1 w-4 h-4 accent-[#050579]"
                            />
                            <label htmlFor="pdpa-consent" className={`text-xs ${isLight ? 'text-gray-800' : 'text-gray-300'}`}>
                                ฉันยินยอมให้จัดเก็บและใช้ข้อมูลนี้เพื่อการติดต่อกลับ ตามนโยบายความเป็นส่วนตัว (PDPA)
                            </label>
                        </div>
                        {error && (
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        )}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting || !ownerUid}
                                className={`w-full inline-flex items-center justify-center gap-3 px-12 py-4 font-black rounded-[32px] text-lg transition-all ${
                                    isLight ? 'bg-[#050579] text-white hover:bg-[#04045f]' : 'bg-white text-black hover:bg-gray-200'
                                } disabled:opacity-60 shadow-lg`}
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
