'use client';

import React, { useState, useRef, useCallback, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Home, Grid3X3, ExternalLink, ShoppingCart, Copy, Check } from 'lucide-react';

interface FlipbookPage {
    id: number;
    content: React.ReactNode;
}

interface FlipbookProps {
    pages: FlipbookPage[];
    coverPage?: React.ReactNode;
    onPageChange?: (page: number) => void;
    onExit?: () => void;
    shareUrl?: string;
    shareTitle?: string;
}

// Social Media Icons as SVG components
const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const MessengerIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
    </svg>
);

const InstagramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
);

const LineIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
);

const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

// Page component for react-pageflip (must use forwardRef)
const Page = forwardRef<HTMLDivElement, { children: React.ReactNode; number?: number }>(
    ({ children, number }, ref) => {
        return (
            <div ref={ref} className="page bg-[#faf8f5] shadow-lg overflow-hidden">
                <div className="page-content w-full h-full">
                    {children}
                </div>
                {number !== undefined && (
                    <div className="absolute bottom-2 right-4 text-xs text-gray-400 font-serif italic">
                        {number}
                    </div>
                )}
            </div>
        );
    }
);
Page.displayName = 'Page';

export default function Flipbook({ pages, coverPage, onPageChange, onExit, shareUrl, shareTitle }: FlipbookProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [copied, setCopied] = useState(false);
    const bookRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Get current page URL for sharing
    const currentShareUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const currentShareTitle = shareTitle || 'Check out this catalog!';

    // Play page flip sound (paper sound)
    const playFlipSound = useCallback(() => {
        if (typeof window !== 'undefined') {
            if (!audioRef.current) {
                audioRef.current = new Audio('/sounds/page-flip-custom.mp3');
                audioRef.current.volume = 0.7;
            }
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
    }, []);

    // Share functions
    const shareToFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentShareUrl)}`, '_blank', 'width=600,height=400');
    };

    const shareToMessenger = () => {
        window.open(`fb-messenger://share?link=${encodeURIComponent(currentShareUrl)}`, '_blank');
    };

    const shareToLine = () => {
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(currentShareUrl)}`, '_blank', 'width=600,height=400');
    };

    const shareToWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(currentShareTitle + ' ' + currentShareUrl)}`, '_blank');
    };

    const shareToTikTok = () => {
        copyLink();
        alert('ลิงก์ถูกคัดลอกแล้ว! วางลิงก์ใน TikTok เพื่อแชร์');
    };

    const shareToInstagram = () => {
        copyLink();
        alert('ลิงก์ถูกคัดลอกแล้ว! วางลิงก์ใน Instagram Story หรือ DM เพื่อแชร์');
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(currentShareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const totalPages = pages.length + 1; // +1 for cover

    const onFlip = useCallback((e: any) => {
        playFlipSound();
        setCurrentPage(e.data);
        onPageChange?.(e.data);
    }, [playFlipSound, onPageChange]);

    const goNext = () => {
        bookRef.current?.pageFlip()?.flipNext();
    };

    const goPrev = () => {
        bookRef.current?.pageFlip()?.flipPrev();
    };

    const goToPage = (pageNum: number) => {
        bookRef.current?.pageFlip()?.flip(pageNum);
    };

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a] flex flex-col">
            {/* Top Bar */}
            <div className="h-16 flex items-center justify-between px-6 bg-black/50 backdrop-blur-xl border-b border-white/5">
                <button
                    onClick={onExit}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium"
                >
                    <Grid3X3 size={18} />
                    <span className="hidden sm:inline">Grid View</span>
                </button>

                <div className="flex items-center gap-2 text-sm text-white/60">
                    <span className="font-bold text-white">{Math.floor(currentPage / 2) + 1}</span>
                    <span>/</span>
                    <span>{Math.ceil(totalPages / 2)}</span>
                </div>

                <button
                    onClick={() => goToPage(0)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-sm font-medium"
                >
                    <Home size={18} />
                    <span className="hidden sm:inline">Cover</span>
                </button>
            </div>

            {/* Book Container */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden">
                <div className="relative w-full max-w-5xl">
                    {/* Book Shadow */}
                    <div className="absolute inset-x-0 -bottom-4 h-16 bg-black/60 blur-2xl rounded-full scale-90" />

                    {/* HTMLFlipBook */}
                    <HTMLFlipBook
                        ref={bookRef}
                        width={550}
                        height={733}
                        size="stretch"
                        minWidth={315}
                        maxWidth={1000}
                        minHeight={400}
                        maxHeight={1533}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={onFlip}
                        className="flipbook-container mx-auto"
                        style={{}}
                        startPage={0}
                        drawShadow={true}
                        flippingTime={600}
                        usePortrait={true}
                        startZIndex={0}
                        autoSize={true}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        showPageCorners={true}
                        disableFlipByClick={false}
                    >
                        {/* Cover Page */}
                        <Page>
                            <div className="w-full h-full">
                                {coverPage || <DefaultCover />}
                            </div>
                        </Page>

                        {/* Content Pages */}
                        {pages.map((page, index) => (
                            <Page key={page.id} number={index + 1}>
                                {page.content}
                            </Page>
                        ))}

                        {/* Back Cover */}
                        <Page>
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                <div className="text-center text-white/60">
                                    <p className="text-lg font-medium mb-2">Thank you!</p>
                                    <p className="text-sm">ขอบคุณที่เข้าชมแคตตาล็อก</p>
                                </div>
                            </div>
                        </Page>
                    </HTMLFlipBook>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="h-24 flex flex-col items-center justify-center gap-2 px-6 bg-black/50 backdrop-blur-xl border-t border-white/5">
                {/* Navigation Controls */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={goPrev}
                        disabled={currentPage === 0}
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Page Dots */}
                    <div className="flex items-center gap-1.5 px-2 overflow-x-auto max-w-[40vw]">
                        {Array.from({ length: Math.ceil(totalPages / 2) + 1 }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToPage(i * 2)}
                                className={`h-2 rounded-full transition-all flex-shrink-0 ${
                                    Math.floor(currentPage / 2) === i
                                        ? 'bg-primary w-6'
                                        : 'bg-white/20 hover:bg-white/40 w-2'
                                }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={goNext}
                        disabled={currentPage >= totalPages}
                        className="w-10 h-10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-1">
                    <span className="text-white/40 text-xs mr-2 hidden sm:block">แชร์:</span>

                    <button
                        onClick={shareToFacebook}
                        className="w-9 h-9 bg-[#1877F2]/20 hover:bg-[#1877F2] text-[#1877F2] hover:text-white rounded-full flex items-center justify-center transition-all"
                        title="แชร์ไป Facebook"
                    >
                        <FacebookIcon />
                    </button>

                    <button
                        onClick={shareToMessenger}
                        className="w-9 h-9 bg-[#0099FF]/20 hover:bg-[#0099FF] text-[#0099FF] hover:text-white rounded-full flex items-center justify-center transition-all"
                        title="แชร์ไป Messenger"
                    >
                        <MessengerIcon />
                    </button>

                    <button
                        onClick={shareToInstagram}
                        className="w-9 h-9 bg-[#E4405F]/20 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#E4405F] hover:to-[#FCAF45] text-[#E4405F] hover:text-white rounded-full flex items-center justify-center transition-all"
                        title="แชร์ไป Instagram"
                    >
                        <InstagramIcon />
                    </button>

                    <button
                        onClick={shareToLine}
                        className="w-9 h-9 bg-[#00B900]/20 hover:bg-[#00B900] text-[#00B900] hover:text-white rounded-full flex items-center justify-center transition-all"
                        title="แชร์ไป Line"
                    >
                        <LineIcon />
                    </button>

                    <button
                        onClick={shareToTikTok}
                        className="w-9 h-9 bg-white/10 hover:bg-black text-white/70 hover:text-white rounded-full flex items-center justify-center transition-all"
                        title="แชร์ไป TikTok"
                    >
                        <TikTokIcon />
                    </button>

                    <button
                        onClick={shareToWhatsApp}
                        className="w-9 h-9 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-full flex items-center justify-center transition-all"
                        title="แชร์ไป WhatsApp"
                    >
                        <WhatsAppIcon />
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-1" />

                    <button
                        onClick={copyLink}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                            copied
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                        }`}
                        title="คัดลอกลิงก์"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </div>

            {/* Styles for flipbook */}
            <style jsx global>{`
                .flipbook-container {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                    border-radius: 4px;
                }
                .flipbook-container .stf__wrapper {
                    margin: 0 auto;
                }
                .page {
                    background: linear-gradient(to right, #faf8f5 0%, #f5f3ef 100%);
                }
                .page-content {
                    position: relative;
                }
                /* Page texture overlay */
                .page::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmFmOGY1Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiNlOGU2ZTIiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=');
                    opacity: 0.3;
                    pointer-events: none;
                    z-index: 1;
                }
            `}</style>
        </div>
    );
}

function DefaultCover() {
    return (
        <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center p-8">
            <div className="text-center text-white">
                <div className="text-4xl md:text-6xl font-black tracking-tighter mb-4">CATALOG</div>
                <div className="text-lg opacity-80">Digital Collection</div>
            </div>
        </div>
    );
}

// Product Page Component for Flipbook with Clickable Image
export function FlipbookProductPage({ product }: { product: any }) {
    const linkUrl = product.interactive_links?.order_form || product.interactive_links?.website;
    const hasLink = !!linkUrl;

    const getImageUrl = (url: string | undefined) => {
        if (!url) return 'https://via.placeholder.com/400x500';
        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        if (url.startsWith('http')) {
            if (url.includes('localhost:') && SITE_URL.includes('https://nexsolution.cloud')) {
                try {
                    const parsedUrl = new URL(url);
                    if (parsedUrl.pathname.startsWith('/uploads')) {
                        return `${API_URL}${parsedUrl.pathname}`;
                    }
                } catch (e) {}
            }
            return url;
        }
        if (url.startsWith('/uploads')) return `${API_URL}${url}`;
        return url;
    };

    return (
        <div className="w-full h-full bg-[#faf8f5] text-gray-900 p-4 md:p-6 flex flex-col relative z-10">
            {/* Product Image - Clickable if has link */}
            <div className="flex-1 relative rounded-xl overflow-hidden bg-white shadow-lg mb-3 group min-h-0">
                {hasLink ? (
                    <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full relative"
                    >
                        <img
                            src={getImageUrl(product.images_json?.[0])}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-xl text-sm">
                                    <ShoppingCart size={16} className="text-primary" />
                                    <span className="font-bold text-gray-900">สั่งซื้อเลย</span>
                                    <ExternalLink size={14} className="text-gray-500" />
                                </div>
                            </div>
                        </div>
                        {/* Click indicator */}
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={12} className="text-primary" />
                        </div>
                    </a>
                ) : (
                    <img
                        src={getImageUrl(product.images_json?.[0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>

            {/* Product Info */}
            <div className="space-y-1">
                <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>

                {/* Price Badge - Below title */}
                <div className="inline-block px-3 py-1 bg-primary text-white font-bold rounded-full shadow-lg text-sm">
                    ฿{product.price?.toLocaleString()}
                </div>

                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                    {product.description}
                </p>
            </div>

            {/* Quick Action Button */}
            {hasLink && (
                <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full py-2 bg-primary hover:bg-primary/90 text-white text-center rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingCart size={14} />
                    {product.interactive_links?.order_form ? 'สั่งซื้อสินค้า' : 'ดูรายละเอียด'}
                </a>
            )}
        </div>
    );
}
