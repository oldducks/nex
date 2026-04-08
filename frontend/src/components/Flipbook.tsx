'use client';

import React, { useState, useRef, useCallback, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, Home, Grid3X3, Copy, Check, QrCode, X, Search, MoreHorizontal, Expand, Minimize2, Share2 } from 'lucide-react';
import { QrCodeImage } from '@/components/QrCode';
import { QrCodeDownloadActions } from '@/components/QrCodeDownloadActions';

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
    catalogName?: string;
    products?: any[]; // To enable search by product name
    promoHref?: string;
    promoText?: string;
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
            <div ref={ref} className="page bg-[#faf8f5] shadow-lg overflow-hidden relative" style={{ willChange: 'transform' }}>
                {/* Spine Shadow Effect */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/5 to-transparent z-10 pointer-events-none" />
                
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

export default function Flipbook({
    pages,
    coverPage,
    onPageChange,
    onExit,
    shareUrl,
    shareTitle,
    catalogName,
    products,
    promoHref,
    promoText = 'สนใจระบบแบบที่คุณเห็นอยู่นี้ คลิกที่นี่',
}: FlipbookProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [viewportSize, setViewportSize] = useState({ width: 390, height: 844 });
    const bookRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initial and resize check for mobile
    React.useEffect(() => {
        setMounted(true);
        const checkViewport = () => {
            setIsMobile(window.innerWidth < 768);
            setIsLandscape(window.innerWidth > window.innerHeight);
            setViewportSize({ width: window.innerWidth, height: window.innerHeight });
        };
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        checkViewport();
        handleFullscreenChange();
        window.addEventListener('resize', checkViewport);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            window.removeEventListener('resize', checkViewport);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const isMobileLandscape = isMobile && isLandscape;
    const isMobileViewport = isMobile;
    const mobileBookWidth = Math.max(300, viewportSize.width - 4);
    const mobileBookHeight = Math.max(220, viewportSize.height - 4);
    const mobileBookMinWidth = Math.max(280, viewportSize.width - 20);
    const mobileBookMinHeight = Math.max(200, viewportSize.height - 20);
    const landscapePageHeight = Math.max(220, viewportSize.height - 4);
    const landscapePageWidth = Math.max(180, Math.floor(landscapePageHeight * 0.66));

    const clearControlsTimer = useCallback(() => {
        if (controlsTimerRef.current) {
            clearTimeout(controlsTimerRef.current);
            controlsTimerRef.current = null;
        }
    }, []);

    const revealControls = useCallback(() => {
        setControlsVisible(true);
        clearControlsTimer();
        if (isMobileViewport && !showSearch && !showQrModal && !showShareMenu) {
            controlsTimerRef.current = setTimeout(() => {
                setControlsVisible(false);
            }, 2500);
        }
    }, [clearControlsTimer, isMobileViewport, showQrModal, showSearch, showShareMenu]);

    React.useEffect(() => {
        if (isMobileViewport) {
            revealControls();
            return;
        }

        clearControlsTimer();
        setControlsVisible(true);
    }, [clearControlsTimer, isMobileViewport, revealControls]);

    React.useEffect(() => {
        if (showSearch || showQrModal || showShareMenu) {
            clearControlsTimer();
            setControlsVisible(true);
            return;
        }

        if (isMobileViewport) {
            revealControls();
        }
    }, [clearControlsTimer, isMobileViewport, revealControls, showQrModal, showSearch, showShareMenu]);

    React.useEffect(() => () => clearControlsTimer(), [clearControlsTimer]);

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
            setShowShareMenu(false);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleNativeShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: currentShareTitle,
                    url: currentShareUrl,
                });
                setShowShareMenu(false);
                return;
            } catch (error) {
                if ((error as Error)?.name === 'AbortError') return;
            }
        }

        await copyLink();
    };

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
            revealControls();
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    const totalPages = pages.length + 1; // +1 for cover

    const onFlip = useCallback((e: any) => {
        playFlipSound();
        setCurrentPage(e.data);
        onPageChange?.(e.data);
        revealControls();
    }, [onPageChange, playFlipSound, revealControls]);

    const goNext = () => {
        bookRef.current?.pageFlip()?.flipNext();
    };

    const goPrev = () => {
        bookRef.current?.pageFlip()?.flipPrev();
    };

    const goToPage = (pageNum: number) => {
        bookRef.current?.pageFlip()?.flip(pageNum);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        // 1. Search by page number
        const pageNum = parseInt(searchQuery);
        if (!isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
            goToPage(pageNum);
            setShowSearch(false);
            setSearchQuery('');
            return;
        }

        // 2. Search by product name
        if (products) {
            const index = products.findIndex(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (index !== -1) {
                // index + 1 because of cover page
                goToPage(index + 1);
                setShowSearch(false);
                setSearchQuery('');
                return;
            }
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-[#1a1a1a] flex flex-col"
            onPointerDown={revealControls}
            onPointerMove={isMobileViewport ? revealControls : undefined}
        >
            {/* Top Bar */}
            <div className={`flex items-center justify-between bg-black/50 border-b border-white/5 transition-all duration-300 ${isMobileLandscape ? 'h-10 px-2.5' : isMobile ? 'h-12 px-3' : 'h-16 px-6 backdrop-blur-xl'} ${isMobileViewport ? `absolute inset-x-0 top-0 z-30 ${controlsVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}` : ''}`}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={() => {
                            revealControls();
                            onExit?.();
                        }}
                        className={`flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl transition-colors font-semibold shadow-sm ${isMobileLandscape ? 'px-2 py-1 text-[11px]' : isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm gap-2'}`}
                    >
                        <Grid3X3 size={isMobile ? 14 : 18} />
                        <span className="hidden sm:inline">มุมมองกริด</span>
                    </button>

                    {/* Search Trigger */}
                    <button
                        onClick={() => {
                            revealControls();
                            setShowSearch(!showSearch);
                        }}
                        className={`flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl transition-colors font-semibold shadow-sm ${isMobileLandscape ? 'px-2 py-1 text-[11px]' : isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm gap-2'} ${showSearch ? 'bg-primary border-primary' : ''}`}
                    >
                        <Search size={isMobile ? 14 : 18} />
                        <span className="hidden sm:inline">ค้นหา</span>
                    </button>
                </div>

                {/* Desktop Search Bar (shown when showSearch is true) */}
                {showSearch && (
                    <div className={`absolute top-[4.5rem] left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md animate-in slide-in-from-top-4 ${isMobile ? 'top-[3.5rem]' : ''}`}>
                        <form onSubmit={handleSearch} className="relative group">
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ค้นหาชื่อสินค้า หรือเลขหน้า..."
                                className="w-full bg-[#111827] text-white border-2 border-primary/50 focus:border-primary px-5 py-3 rounded-2xl shadow-2xl transition-all focus:outline-none placeholder:text-white/30"
                            />
                            <button 
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary p-2 rounded-xl"
                            >
                                <Search size={18} className="text-white" />
                            </button>
                        </form>
                    </div>
                )}

                <div className={`flex items-center gap-2 text-white/60 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    <span className="font-bold text-white">{Math.floor(currentPage / 2) + 1}</span>
                    <span>/</span>
                    <span>{Math.ceil(totalPages / 2)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={toggleFullscreen}
                        className={`flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl transition-colors font-semibold shadow-sm ${isMobileLandscape ? 'px-2 py-1 text-[11px]' : isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm gap-2'}`}
                        title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'เต็มจอ'}
                    >
                        {isFullscreen ? <Minimize2 size={isMobile ? 14 : 18} /> : <Expand size={isMobile ? 14 : 18} />}
                        <span className="hidden sm:inline">{isFullscreen ? 'ออกเต็มจอ' : 'เต็มจอ'}</span>
                    </button>

                    <button
                        onClick={() => {
                            revealControls();
                            setShowQrModal(true);
                        }}
                        className={`flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl transition-colors font-semibold shadow-sm ${isMobileLandscape ? 'px-2 py-1 text-[11px]' : isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm gap-2'}`}
                        title="QR Code"
                    >
                        <QrCode size={isMobile ? 14 : 18} />
                        <span className="hidden sm:inline">QR Code</span>
                    </button>

                    <button
                        onClick={copyLink}
                        className={`flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl transition-colors font-semibold shadow-sm ${isMobileLandscape ? 'px-2 py-1 text-[11px]' : isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm gap-2'}`}
                        title="คัดลอกลิงก์ Book View"
                    >
                        {copied ? <Check size={isMobile ? 14 : 18} /> : <Copy size={isMobile ? 14 : 18} />}
                        <span className="hidden sm:inline">{copied ? 'คัดลอกแล้ว' : 'แชร์ลิงก์'}</span>
                    </button>

                    <button
                        onClick={() => {
                            revealControls();
                            goToPage(0);
                        }}
                        className={`flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl transition-colors font-semibold shadow-sm ${isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm gap-2'}`}
                    >
                        <Home size={isMobile ? 14 : 18} />
                        <span className="hidden sm:inline">หน้าปก</span>
                    </button>
                </div>
            </div>

            {/* Book Container */}
            <div className={`flex-1 overflow-hidden ${isMobileViewport ? 'flex items-center justify-center p-0' : 'flex items-center justify-center p-8'}`}>
                <div className="relative w-full max-w-5xl">
                    {isMobileViewport && !controlsVisible && (
                        <button
                            type="button"
                            onClick={revealControls}
                            className="absolute right-3 top-3 z-20 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur"
                        >
                            แสดงเมนู
                        </button>
                    )}

                    {/* Book Shadow */}
                    <div className="absolute inset-x-0 -bottom-4 h-16 bg-black/60 blur-2xl rounded-full scale-90" />

                    {/* HTMLFlipBook - Render only when mounted to avoid hydration issues */}
                    {mounted ? (
                        <HTMLFlipBook
                            ref={bookRef}
                            width={isMobileLandscape ? landscapePageWidth : isMobile ? mobileBookWidth : 550}
                            height={isMobileLandscape ? landscapePageHeight : isMobile ? mobileBookHeight : 733}
                            size={isMobileLandscape ? 'fixed' : 'stretch'}
                            minWidth={isMobileLandscape ? landscapePageWidth : isMobile ? mobileBookMinWidth : 280}
                            maxWidth={isMobileLandscape ? landscapePageWidth : isMobile ? mobileBookWidth : 1000}
                            minHeight={isMobileLandscape ? landscapePageHeight : isMobile ? mobileBookMinHeight : 300}
                            maxHeight={isMobileLandscape ? landscapePageHeight : isMobile ? mobileBookHeight : 1533}
                            maxShadowOpacity={isMobile ? 0.25 : 0.8}
                            showCover={!isMobileLandscape}
                            mobileScrollSupport={true}
                            onFlip={onFlip}
                            className="flipbook-container mx-auto"
                            style={{}}
                            startPage={0}
                            drawShadow={!isMobileLandscape}
                            flippingTime={isMobile ? 380 : 800}
                            usePortrait={!isMobileLandscape && isMobile}
                            startZIndex={0}
                            autoSize={true}
                            clickEventForward={true}
                            useMouseEvents={true}
                            swipeDistance={isMobile ? 15 : 30}
                            showPageCorners={!isMobile}
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
                    ) : (
                        <div className="mx-auto flex items-center justify-center p-20">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>

            {promoHref && !isMobileLandscape && (
                <div className="flex justify-center px-4 pb-3 pt-1">
                    <a
                        href={promoHref}
                        className="text-center text-sm font-semibold text-white/90 underline underline-offset-4 transition-opacity hover:opacity-80"
                    >
                        {promoText}
                    </a>
                </div>
            )}

            {/* Bottom Navigation */}
            <div className={`flex flex-col items-center justify-center px-4 bg-black/50 border-t border-white/5 transition-all duration-300 ${isMobileLandscape ? 'py-1 px-2.5' : isMobile ? 'py-2' : 'h-24 px-6 gap-2 backdrop-blur-xl'} ${isMobileViewport ? `absolute inset-x-0 bottom-0 z-30 ${isMobileLandscape ? 'gap-1' : 'gap-1.5'} ${controlsVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}` : 'gap-1.5'}`}>
                {/* Navigation Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={goPrev}
                        disabled={currentPage === 0}
                        className={`bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}
                    >
                        <ChevronLeft size={isMobile ? 16 : 20} />
                    </button>

                    {/* Page Dots */}
                    <div className={`flex items-center gap-1.5 px-2 overflow-x-auto scrollbar-hide py-1 ${isMobileLandscape ? 'max-w-[42vw]' : 'max-w-[60vw]'}`}>
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
                        className={`bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}
                    >
                        <ChevronRight size={isMobile ? 16 : 20} />
                    </button>

                    {isMobileViewport && (
                        <button
                            type="button"
                            onClick={() => {
                                revealControls();
                                setShowShareMenu(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white"
                            title="แชร์เพิ่มเติม"
                        >
                            <MoreHorizontal size={16} />
                        </button>
                    )}
                </div>

                {/* Social Share Buttons */}
                <div className={`flex items-center gap-1 ${isMobileViewport ? 'hidden' : ''}`}>
                    <span className="text-white/40 text-xs mr-2 hidden sm:block">แชร์:</span>

                    <button
                        onClick={shareToFacebook}
                        className={`bg-[#1877F2]/20 hover:bg-[#1877F2] text-[#1877F2] hover:text-white rounded-full flex items-center justify-center transition-all ${isMobile ? 'w-7 h-7' : 'w-9 h-9'}`}
                        title="แชร์ไป Facebook"
                    >
                        <FacebookIcon />
                    </button>

                    <button
                        onClick={shareToMessenger}
                        className={`bg-[#0099FF]/20 hover:bg-[#0099FF] text-[#0099FF] hover:text-white rounded-full flex items-center justify-center transition-all ${isMobile ? 'w-7 h-7' : 'w-9 h-9'}`}
                        title="แชร์ไป Messenger"
                    >
                        <MessengerIcon />
                    </button>

                    <button
                        onClick={shareToInstagram}
                        className={`bg-[#E4405F]/20 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#E4405F] hover:to-[#FCAF45] text-[#E4405F] hover:text-white rounded-full flex items-center justify-center transition-all ${isMobile ? 'w-7 h-7' : 'w-9 h-9'}`}
                        title="แชร์ไป Instagram"
                    >
                        <InstagramIcon />
                    </button>

                    <button
                        onClick={shareToLine}
                        className={`bg-[#00B900]/20 hover:bg-[#00B900] text-[#00B900] hover:text-white rounded-full flex items-center justify-center transition-all ${isMobile ? 'w-7 h-7' : 'w-9 h-9'}`}
                        title="แชร์ไป Line"
                    >
                        <LineIcon />
                    </button>

                    <button
                        onClick={shareToTikTok}
                        className={`bg-white/10 hover:bg-black text-white/70 hover:text-white rounded-full flex items-center justify-center transition-all ${isMobile ? 'w-7 h-7' : 'w-9 h-9'}`}
                        title="แชร์ไป TikTok"
                    >
                        <TikTokIcon />
                    </button>

                    <button
                        onClick={shareToWhatsApp}
                        className={`bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-full flex items-center justify-center transition-all ${isMobile ? 'w-7 h-7' : 'w-9 h-9'}`}
                        title="แชร์ไป WhatsApp"
                    >
                        <WhatsAppIcon />
                    </button>

                    <div className="w-px h-5 bg-white/10 mx-0.5" />

                    <button
                        onClick={copyLink}
                        className={`rounded-full flex items-center justify-center transition-all ${isMobile ? 'w-7 h-7' : 'w-9 h-9'} ${
                            copied
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                        }`}
                        title="คัดลอกลิงก์"
                    >
                        {copied ? <Check size={isMobile ? 14 : 18} /> : <Copy size={isMobile ? 14 : 18} />}
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
                    background: #faf8f5;
                }
                .page-content {
                    position: relative;
                }
                /* Page texture overlay - only on larger screens for stability */
                @media (min-width: 768px) {
                    .page::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmFmOGY1Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiNlOGU2ZTIiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=');
                        opacity: 0.3;
                        pointer-events: none;
                        z-index: 1;
                    }
                }
            `}</style>

            {showQrModal && (
                <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-[#111827] text-white shadow-2xl p-5 relative">
                        <button
                            type="button"
                            onClick={() => setShowQrModal(false)}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="Close QR modal"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-lg font-black tracking-tight mb-1">QR Code Catalog</h3>
                        <p className="text-sm text-white/70 mb-4">สแกนเพื่อเปิด Book View หน้านี้</p>
                        {catalogName && (
                            <p className="text-xs text-white/70 mb-4">
                                แคตตาล็อก: <span className="font-semibold text-white">{catalogName}</span>
                            </p>
                        )}
                        <div className="rounded-[28px] border border-white/10 bg-white p-4 flex flex-col items-center">
                            <div className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">QR Code</div>
                            <QrCodeImage url={currentShareUrl} size={220} />
                            {catalogName ? <div className="mt-3 text-sm font-semibold text-[#475569] text-center">{catalogName}</div> : null}
                            <div className="mt-1 break-all text-[11px] leading-5 text-[#64748B] text-center">{currentShareUrl}</div>
                            <QrCodeDownloadActions
                                qrValue={currentShareUrl}
                                fileBaseName={`catalog-book-${(catalogName || 'qr').replace(/\s+/g, '-').toLowerCase()}`}
                                titleLine="QR Code"
                                nameLine={catalogName || 'Catalog'}
                                bottomLabel="URL"
                                bottomLine={currentShareUrl}
                                className="mt-4"
                            />
                        </div>
                    </div>
                </div>
            )}

            {showShareMenu && (
                <div className="fixed inset-0 z-[72] bg-black/70 backdrop-blur-sm flex items-end justify-center p-3 sm:items-center">
                    <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#111827] text-white shadow-2xl p-5 relative">
                        <button
                            type="button"
                            onClick={() => setShowShareMenu(false)}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label="Close share menu"
                        >
                            <X size={18} />
                        </button>
                        <h3 className="text-lg font-black tracking-tight mb-1">แชร์แคตตาล็อก</h3>
                        <p className="text-sm text-white/70 mb-4">โหมดแนวนอนจะเก็บปุ่มแชร์ไว้ในเมนูนี้เพื่อให้พื้นที่อ่านกว้างขึ้น</p>

                        <div className="grid grid-cols-4 gap-3 mb-4">
                            <button onClick={shareToFacebook} className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                                <FacebookIcon />
                                <span className="text-[11px] text-white/80">Facebook</span>
                            </button>
                            <button onClick={shareToMessenger} className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                                <MessengerIcon />
                                <span className="text-[11px] text-white/80">Messenger</span>
                            </button>
                            <button onClick={shareToLine} className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                                <LineIcon />
                                <span className="text-[11px] text-white/80">LINE</span>
                            </button>
                            <button onClick={shareToWhatsApp} className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                                <WhatsAppIcon />
                                <span className="text-[11px] text-white/80">WhatsApp</span>
                            </button>
                            <button onClick={shareToInstagram} className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                                <InstagramIcon />
                                <span className="text-[11px] text-white/80">Instagram</span>
                            </button>
                            <button onClick={shareToTikTok} className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                                <TikTokIcon />
                                <span className="text-[11px] text-white/80">TikTok</span>
                            </button>
                            <button onClick={copyLink} className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                <span className="text-[11px] text-white/80">{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                            </button>
                            <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-3 hover:bg-white/10 transition-colors">
                                <Share2 size={18} />
                                <span className="text-[11px] text-white/80">แชร์</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowShareMenu(false)}
                            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 transition-colors"
                        >
                            ปิดเมนู
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DefaultCover() {
    return (
        <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center p-8">
            <div className="text-center text-white">
                <div className="text-4xl md:text-6xl font-black tracking-tighter mb-4">CATALOG</div>
            </div>
        </div>
    );
}
