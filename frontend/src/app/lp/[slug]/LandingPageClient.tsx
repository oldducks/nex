"use client";

import { useEffect, useRef, useState } from 'react';
import { 
  Globe, ExternalLink, Share2, Facebook, Twitter, 
  ChevronRight, MessageSquare, Package, Layout, Image as ImageIcon,
  Copy, Mail, MapPin, Play
} from 'lucide-react';
import ManageTopBar from '@/components/ManageTopBar';
import Cookies from 'js-cookie';
import { getEmbedUrl, isEmbedableVideo } from '@/lib/videoUtils';
import { QrCodeImage } from '@/components/QrCode';
import { QrCodeDownloadActions } from '@/components/QrCodeDownloadActions';

interface Block {
    id: string;
    type: 'text' | 'image' | 'video' | 'button' | 'form' | 'location';
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
    referral_code?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';

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

export default function LandingPageClient({ page }: { page: LandingPage }) {
    useEffect(() => {
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
    const primary = theme.primary_color || '#050579';
    const accent = theme.accent_color || '#F97316';
    const shareUrl = `${SITE_URL}/lp/${page.id}`;
    const referralCode = page.referral_code?.trim() || 'ZXQ0KPCR';
    const referralRegisterUrl = `https://nexsolution.cloud/register?ref=${encodeURIComponent(referralCode)}`;
    const baseSans = "var(--font-sans), 'Noto Sans Thai', 'Segoe UI', system-ui, -apple-system, sans-serif";

    return (
        <div style={{ 
            minHeight: '100vh',
            fontFamily: baseSans,
            backgroundColor: '#EFF6FF', 
            color: '#0F172A'
        }}>
            {/* Background decorations */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: 'radial-gradient(circle at top left, rgba(96,165,250,0.22), transparent 34%), radial-gradient(circle at top center, rgba(191,219,254,0.45), transparent 42%), radial-gradient(circle at top right, rgba(249,115,22,0.08), transparent 26%), linear-gradient(180deg, #f8fbff 0%, #eef6ff 48%, #e0f2fe 100%)'
                }} />
                <div style={{ 
                    position: 'absolute', 
                    left: '-8rem', 
                    top: '4rem', 
                    width: '20rem', 
                    height: '20rem', 
                    borderRadius: '9999px', 
                    backgroundColor: 'rgba(125, 211, 252, 0.25)', 
                    filter: 'blur(120px)' 
                }} />
                <div style={{ 
                    position: 'absolute', 
                    right: '-6rem', 
                    top: '8rem', 
                    width: '18rem', 
                    height: '18rem', 
                    borderRadius: '9999px', 
                    backgroundColor: 'rgba(186, 230, 253, 0.3)', 
                    filter: 'blur(110px)' 
                }} />
            </div>

            <div style={{ fontFamily: baseSans }}>
                <ManageTopBar
                    backHref="/manage/landing-pages"
                    subtitle="ระบบจัดการหน้าร้านดิจิทัล"
                    title={page.title || `หน้าร้าน /lp/${page.slug}`}
                />
            </div>

            {/* Main Content */}
            <main style={{ 
                position: 'relative',
                zIndex: 10,
                maxWidth: '56rem',
                margin: '0 auto',
                padding: '7rem 1.5rem 2rem'
            }}>
                {page.content_blocks.map(block => (
                    <div key={block.id} style={{ marginBottom: '2.5rem' }}>
                        <PublicBlock 
                            block={block} 
                            theme={theme} 
                            isLight={true} 
                            ownerUid={page.owner_uid}
                            pageId={page.id}
                            pageSlug={page.slug}
                            contentBlocks={page.content_blocks}
                        />
                    </div>
                ))}

                {/* QR Code and Social Sharing Section - ALWAYS VISIBLE */}
                <div style={{ 
                    marginTop: '5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    paddingBottom: '3rem'
                }}>
                    {/* QR Code Box */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem 1.5rem 1.25rem',
                        borderRadius: '32px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                        border: '1px solid #dbe4ff',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: '#94A3B8',
                            marginBottom: '0.85rem'
                        }}>
                            QR Code
                        </div>
                        <QrCodeImage url={shareUrl} size={180} />
                        <div style={{
                            marginTop: '1rem',
                            fontSize: '12px',
                            lineHeight: 1.65,
                            color: '#64748B',
                            maxWidth: '15rem',
                            wordBreak: 'break-word'
                        }}>
                            {shareUrl}
                        </div>
                        <QrCodeDownloadActions
                            qrValue={shareUrl}
                            fileBaseName={`landing-page-${page.slug}`}
                            titleLine="QR Code"
                            nameLine={page.title}
                            className="mt-4"
                        />
                    </div>
                    
                    {/* QR Label */}
                    <p style={{
                        fontSize: '14px',
                        fontWeight: 900,
                        color: '#94A3B8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '2rem'
                    }}>
                        สแกนเพื่อเข้าชมหน้าร้าน
                    </p>

                    {/* Share Button */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4rem'
                    }}>
                        {/* Share / Copy Link */}
                        <button 
                            onClick={async () => {
                                try {
                                    if (navigator.share) {
                                        await navigator.share({
                                            title: page.title,
                                            url: shareUrl
                                        });
                                    } else {
                                        await navigator.clipboard.writeText(shareUrl);
                                        alert('คัดลอกลิงก์แล้ว!');
                                    }
                                } catch (err) {}
                            }}
                            style={{
                                height: '3.5rem',
                                padding: '0 1.5rem',
                                backgroundColor: '#FFFFFF',
                                color: '#050579',
                                borderRadius: '9999px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            <Share2 size={20} />
                            <span>แชร์หน้านี้</span>
                        </button>
                    </div>

                    {/* Footer - ALWAYS VISIBLE */}
                    <footer style={{
                        width: '100%',
                        paddingTop: '2.5rem',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        opacity: 1
                    }}>
                        <p style={{
                            margin: 0,
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '1.75rem',
                            color: '#64748B'
                        }}>
                            © NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด KHRAM INTELLIGENT AI Co., Ltd.
                        </p>
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <a
                                href={referralRegisterUrl}
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: '#050579',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '4px',
                                }}
                            >
                                สนใจระบบแบบที่คุณเห็นอยู่นี้ คลิกที่นี่
                            </a>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}

function PublicBlock({ block, theme, isLight, ownerUid, pageId, pageSlug, contentBlocks }: { block: Block, theme: any, isLight: boolean, ownerUid?: string, pageId: number, pageSlug: string, contentBlocks: Block[] }) {
    const primary = theme.primary_color || '#050579';
    const accent = theme.accent_color || '#F97316';
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const normalizeUrl = (value?: unknown): string | null => {
        if (typeof value !== 'string') return null;
        let trimmed = value.trim();
        if (trimmed.length === 0) return null;
        
        // If it looks like a domain but doesn't have a protocol, add https://
        // Don't add for relative paths starting with / or # or common protocols
        if (!trimmed.startsWith('http://') && 
            !trimmed.startsWith('https://') && 
            !trimmed.startsWith('mailto:') && 
            !trimmed.startsWith('tel:') && 
            !trimmed.startsWith('/') && 
            !trimmed.startsWith('#')) {
            trimmed = 'https://' + trimmed;
        }
        
        return trimmed;
    };
    
    switch (block.type) {
        case 'text':
            return (
                <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                    <h2 style={{ 
                        fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.025em',
                        marginBottom: '1.5rem',
                        lineHeight: 1.1,
                        color: '#050579'
                    }}>
                        {block.content.title}
                    </h2>
                    <p style={{
                        fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                        lineHeight: 1.625,
                        whiteSpace: 'pre-wrap',
                        fontWeight: 500,
                        maxWidth: '42rem',
                        margin: '0 auto',
                        color: '#475569'
                    }}>
                        {block.content.body}
                    </p>
                </div>
            );
        case 'image':
            const imageUrl = block.content.url;
            const hasImage = imageUrl && imageUrl.length > 0;
            const imageLink = normalizeUrl(block.content.link);
            
            return (
                <div style={{ maxWidth: '56rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        backgroundColor: 'white'
                    }}>
                        {hasImage ? (
                            imageLink ? (
                                <a href={imageLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                    <img src={imageUrl} alt="Campaign visual" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                </a>
                            ) : (
                                <img src={imageUrl} alt="Campaign visual" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            )
                        ) : (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                padding: '5rem 2rem',
                                minHeight: '300px'
                            }}>
                                <div style={{
                                    width: '5rem',
                                    height: '5rem',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    backgroundColor: `${primary}10`
                                }}>
                                    <ImageIcon size={40} style={{ color: primary }} />
                                </div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#9CA3AF' }}>
                                    ยังไม่มีรูปภาพ
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'video': {
            const videoConfig = block.content.video_config || {};
            const url = block.content.url || videoConfig.url;
            const autoplay = block.content.autoplay ?? videoConfig.autoplay ?? false;
            
            const isEmbed = isEmbedableVideo(url);
            const embedUrl = isEmbed ? getEmbedUrl(url) : '';
            
            const getFullUrl = (val?: string) => {
                if (!val) return '';
                if (val.startsWith('http')) return val;
                if (val.startsWith('/api')) return val;
                return `${API_URL}${val}`;
            };

            const videoUrl = getFullUrl(url);
            const hasVideo = !!url;
            const videoLink = normalizeUrl((block.content as any).link) || normalizeUrl(videoConfig?.link_url);
            const showCenteredPlayButton = hasVideo && !isEmbed && !autoplay && !isVideoPlaying;

            const handlePlayClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                event.stopPropagation();
                if (!videoRef.current) return;
                try {
                    await videoRef.current.play();
                    setIsVideoPlaying(true);
                } catch (error) {
                    console.error('Unable to start video playback:', error);
                }
            };
            
            return (
                <div style={{ width: '100%', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
                    <div style={{ 
                        position: 'relative', 
                        width: '100%',
                        backgroundColor: '#000', 
                        borderRadius: '24px', 
                        overflow: 'hidden', 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        aspectRatio: isEmbed ? '16/9' : 'auto'
                    }}>
                        {!hasVideo ? (
                            <div style={{ 
                                paddingBottom: '56.25%',
                                position: 'relative',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: '#fff', 
                                fontSize: '1.25rem',
                                textDecoration: 'none'
                             }}>
                                <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>ยังไม่มีวิดีโอ</span>
                            </div>
                        ) : !isEmbed ? (
                            videoLink ? (
                                <a href={videoLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                    <video
                                        ref={videoRef}
                                        src={videoUrl}
                                        autoPlay={autoplay}
                                        muted={autoplay}
                                        loop
                                        playsInline
                                        controls={autoplay ? false : isVideoPlaying}
                                        onPlay={() => setIsVideoPlaying(true)}
                                        onPause={() => setIsVideoPlaying(false)}
                                        onEnded={() => setIsVideoPlaying(false)}
                                        style={{ 
                                            width: '100%', 
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                </a>
                            ) : (
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    autoPlay={autoplay}
                                    muted={autoplay}
                                    loop
                                    playsInline
                                    controls={autoplay ? false : isVideoPlaying}
                                    onPlay={() => setIsVideoPlaying(true)}
                                    onPause={() => setIsVideoPlaying(false)}
                                    onEnded={() => setIsVideoPlaying(false)}
                                    style={{ 
                                        width: '100%', 
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                            )
                        ) : (
                            <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
                                {videoLink ? (
                                    <a href={videoLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                        <iframe
                                            src={embedUrl}
                                            title="Video content"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ 
                                                position: 'absolute', 
                                                top: 0, 
                                                left: 0, 
                                                width: '100%', 
                                                height: '100%' 
                                            }}
                                        />
                                    </a>
                                ) : (
                                    <iframe
                                        src={embedUrl}
                                        title="Video content"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ 
                                            position: 'absolute', 
                                            top: 0, 
                                            left: 0, 
                                            width: '100%', 
                                            height: '100%' 
                                        }}
                                    />
                                )}
                            </div>
                        )}
                        {showCenteredPlayButton && (
                            <button
                                type="button"
                                aria-label="Play video"
                                onClick={handlePlayClick}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '86px',
                                    height: '86px',
                                    borderRadius: '9999px',
                                    border: 'none',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    color: '#0F172A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 16px 35px rgba(15, 23, 42, 0.35)',
                                    zIndex: 20
                                }}
                            >
                                <Play size={36} style={{ marginLeft: '4px' }} />
                            </button>
                        )}
                    </div>
                </div>
            );
        }
        case 'location':
            return (
                <div style={{ maxWidth: '48rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        {block.content.embed_url ? (
                            <div style={{ 
                                width: '100%', 
                                height: '350px', 
                                borderRadius: '25px', 
                                overflow: 'hidden',
                                border: '1px solid #F1F5F9'
                            }}>
                                <iframe
                                    src={block.content.embed_url}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            <div style={{ 
                                width: '100%', 
                                height: '200px', 
                                backgroundColor: '#F8FAFC', 
                                borderRadius: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed #E2E8F0'
                            }}>
                                <MapPin size={40} style={{ color: '#CBD5E1' }} />
                            </div>
                        )}
                        
                        {(block.content.address || block.content.map_url) && (
                            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                                {block.content.address && (
                                    <h3 style={{ 
                                        fontSize: '20px', 
                                        fontWeight: 900, 
                                        color: '#050579', 
                                        marginBottom: '1rem',
                                        lineHeight: 1.4
                                    }}>
                                        {block.content.address}
                                    </h3>
                                )}
                                {block.content.map_url && (
                                    <a
                                        href={block.content.map_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '1.25rem 2.5rem',
                                            backgroundColor: '#050579',
                                            color: 'white',
                                            borderRadius: '18px',
                                            fontWeight: 900,
                                            fontSize: '1rem',
                                            textDecoration: 'none',
                                            boxShadow: '0 10px 20px rgba(5,5,121,0.2)'
                                        }}
                                    >
                                        <MapPin size={20} /> กดที่นี่เพื่อเข้าสู่การนำทาง
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'button':
            const btnUrl = normalizeUrl(block.content.link) || normalizeUrl(block.content.url);
            const buttonLabel = block.content.text || block.content.label || 'ดูรายละเอียด';
            return (
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, padding: '1rem 0' }}>
                    {btnUrl ? (
                        <a 
                            href={btnUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.5rem 3rem',
                                borderRadius: '20px',
                                fontWeight: 900,
                                fontSize: '1.25rem',
                                boxShadow: '0 20px 40px rgba(249,115,22,0.3)',
                                backgroundColor: accent,
                                color: '#fff',
                                textDecoration: 'none'
                            }}
                        >
                            {buttonLabel} <ChevronRight size={28} />
                        </a>
                    ) : (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.5rem 3rem',
                                borderRadius: '20px',
                                fontWeight: 900,
                                fontSize: '1.25rem',
                                boxShadow: '0 20px 40px rgba(249,115,22,0.18)',
                                backgroundColor: accent,
                                color: '#fff',
                                opacity: 0.8
                            }}
                        >
                            {buttonLabel} <ChevronRight size={28} />
                        </div>
                    )}
                </div>
            );
        case 'form':
            if (block.content?.mode === 'external') {
                const externalUrl = typeof block.content?.url === 'string' ? block.content.url.trim() : '';
                return (
                    <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
                        <div style={{
                            padding: '3rem 2rem',
                            borderRadius: '28px',
                            textAlign: 'center',
                            border: '1px solid rgba(0,0,0,0.05)',
                            backgroundColor: 'white',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                        }}>
                            <MessageSquare size={48} style={{ margin: '0 auto 2rem', color: '#050579' }} />
                            <h3 style={{ 
                                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                                fontWeight: 900,
                                marginBottom: '1.5rem',
                                letterSpacing: '-0.025em',
                                color: '#050579'
                            }}>ติดต่อเราทันที</h3>
                            <p style={{ 
                                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                                marginBottom: '3rem',
                                color: '#6B7280'
                            }}>เราพร้อมเป็นส่วนหนึ่งในความสำเร็จของคุณ กรุณากรอกรายละเอียดเพื่อรับข้อเสนอพิเศษ</p>
                            {externalUrl ? (
                                <a 
                                    href={externalUrl} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1.5rem 3rem',
                                        fontWeight: 900,
                                        borderRadius: '20px',
                                        fontSize: '1.25rem',
                                        backgroundColor: '#050579',
                                        color: 'white',
                                        textDecoration: 'none'
                                    }}
                                >
                                    Open Contact Form <ExternalLink size={24} />
                                </a>
                            ) : (
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1.5rem 3rem',
                                        fontWeight: 900,
                                        borderRadius: '20px',
                                        fontSize: '1.25rem',
                                        backgroundColor: '#94A3B8',
                                        color: 'white',
                                        opacity: 0.8
                                    }}
                                >
                                    กรุณาตั้งค่า URL ฟอร์ม <ExternalLink size={24} />
                                </div>
                            )}
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
                    data: { name, email, phone, message },
                    source: { referrer: pageSlug, utm_source: 'landing_page' }
                  }
                : {
                    name, email, phone, message,
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
            if (!res.ok) throw new Error('ส่งข้อมูลไม่สำเร็จ');
            
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
                        uid: ownerUid, action: 'SUBMIT_LANDING_FORM', visitorId: vid,
                        metadata: { type: 'landing_page_form', pageId, slug: pageSlug },
                    }),
                });
            } catch {}

            setSuccess(block.content.thank_you_message || 'ขอบคุณสำหรับการติดต่อ ทีมงานจะติดต่อกลับโดยเร็วที่สุด');
            setName(''); setEmail(''); setPhone(''); setMessage(''); setConsent(false);

            if (block.content.redirect_url) {
                const delaySec = typeof block.content.redirect_delay === 'number' ? block.content.redirect_delay : 3;
                setTimeout(() => { window.location.href = block.content.redirect_url; }, delaySec * 1000);
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setSubmitting(false);
        }
    };

    if (block.content.mode === 'internal' && !block.content.form_id) {
        return (
            <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
                <div style={{
                    padding: '3rem 2rem',
                    borderRadius: '28px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}>
                    <MessageSquare size={40} style={{ margin: '0 auto 1rem', color: '#D1D5DB' }} />
                    <p style={{ color: '#9CA3AF', fontWeight: 500 }}>ฟอร์มนี้ยังไม่ได้เลือกรายการจากระบบ</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '48rem', margin: '0 auto', position: 'relative', zIndex: 20 }}>
            <div style={{
                padding: '3rem 2rem',
                borderRadius: '28px',
                border: '1px solid rgba(0,0,0,0.05)',
                backgroundColor: 'white',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                <MessageSquare size={48} style={{ margin: '0 auto 2rem', color: '#050579' }} />
                <h3 style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                    fontWeight: 900,
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.025em',
                    textAlign: 'center',
                    color: '#050579'
                }}>ติดต่อเราทันที</h3>
                {success ? (
                    <p style={{ 
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        textAlign: 'center',
                        color: '#16A34A',
                        fontWeight: 700
                    }}>
                        {success}
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginLeft: '4px' }}>ชื่อ-นามสกุล *</label>
                                <input
                                    required value={name} onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem',
                                        borderRadius: '16px',
                                        backgroundColor: '#F9FAFB',
                                        border: '1px solid #F3F4F6',
                                        fontWeight: 500,
                                        fontSize: '16px',
                                        lineHeight: 1.5,
                                        color: '#111827',
                                        outline: 'none'
                                    }}
                                    placeholder="กรอกชื่อ-นามสกุล"
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginLeft: '4px' }}>อีเมล *</label>
                                <input
                                    required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem',
                                        borderRadius: '16px',
                                        backgroundColor: '#F9FAFB',
                                        border: '1px solid #F3F4F6',
                                        fontWeight: 500,
                                        fontSize: '16px',
                                        lineHeight: 1.5,
                                        color: '#111827',
                                        outline: 'none'
                                    }}
                                    placeholder="กรอกอีเมล"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginLeft: '4px' }}>เบอร์โทรศัพท์</label>
                            <input
                                value={phone} onChange={(e) => setPhone(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '16px',
                                    backgroundColor: '#F9FAFB',
                                    border: '1px solid #F3F4F6',
                                    fontWeight: 500,
                                    fontSize: '16px',
                                    lineHeight: 1.5,
                                    color: '#111827',
                                    outline: 'none'
                                }}
                                placeholder="กรอกเบอร์โทรศัพท์"
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <label style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginLeft: '4px' }}>รายละเอียด *</label>
                            <textarea
                                required value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '16px',
                                    backgroundColor: '#F9FAFB',
                                    border: '1px solid #F3F4F6',
                                    fontWeight: 500,
                                    fontSize: '16px',
                                    lineHeight: 1.5,
                                    color: '#111827',
                                    outline: 'none',
                                    resize: 'none'
                                }}
                                placeholder="กรอกรายละเอียดที่ต้องการสอบถาม"
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem' }}>
                            <input
                                id="pdpa-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                                style={{ marginTop: '4px', width: '1.25rem', height: '1.25rem', accentColor: '#050579' }}
                            />
                            <label htmlFor="pdpa-consent" style={{ fontSize: '13px', fontWeight: 500, color: '#475569', lineHeight: 1.5 }}>
                                ฉันยินยอมให้จัดเก็บและใช้ข้อมูลนี้เพื่อการติดต่อกลับตามนโยบายความเป็นส่วนตัว (PDPA)
                            </label>
                        </div>
                        {error && <p style={{ fontSize: '14px', color: '#DC2626', fontWeight: 700, textAlign: 'center' }}>{error}</p>}
                        <div style={{ paddingTop: '1rem' }}>
                            <button
                                type="submit" disabled={submitting || !ownerUid}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    fontWeight: 900,
                                    borderRadius: '32px',
                                    fontSize: '1.25rem',
                                    backgroundColor: '#050579',
                                    color: 'white',
                                    border: 'none',
                                    cursor: submitting || !ownerUid ? 'not-allowed' : 'pointer',
                                    opacity: submitting || !ownerUid ? 0.5 : 1,
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                                }}
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
