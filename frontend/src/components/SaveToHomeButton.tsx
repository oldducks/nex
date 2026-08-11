'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, X, Share, MoreVertical, ArrowDown, Download, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

interface SaveToHomeButtonProps {
    uid?: string;
    profileName: string;
    profilePicUrl?: string;
    variant?: 'button' | 'link';
}

export function SaveToHomeButton({ uid, profileName, profilePicUrl, variant = 'button' }: SaveToHomeButtonProps) {
    const [showInstructions, setShowInstructions] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
    const [installOutcome, setInstallOutcome] = useState<'idle' | 'installing' | 'installed'>('idle');
    const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
    const [canInstallNative, setCanInstallNative] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
        }

        // Check if already running as installed app (standalone mode)
        const isRunningStandalone = 
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        
        if (isRunningStandalone) {
            setIsStandalone(true);
            setInstallOutcome('installed');
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            deferredPromptRef.current = e;
            setCanInstallNative(true);
            console.log('[PWA] beforeinstallprompt captured');
        };

        // Listen for successful install
        const handleAppInstalled = () => {
            console.log('[PWA] App installed successfully');
            setInstallOutcome('installed');
            deferredPromptRef.current = null;
            setCanInstallNative(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const triggerNativeInstall = useCallback(async () => {
        if (!deferredPromptRef.current) return false;

        setInstallOutcome('installing');
        try {
            await deferredPromptRef.current.prompt();
            const choiceResult = await deferredPromptRef.current.userChoice;
            if (choiceResult.outcome === 'accepted') {
                setInstallOutcome('installed');
                return true;
            } else {
                setInstallOutcome('idle');
                return false;
            }
        } catch {
            setInstallOutcome('idle');
            return false;
        } finally {
            deferredPromptRef.current = null;
        }
    }, []);

    const handleInstallClick = async () => {
        // Try native install prompt first
        if (deferredPromptRef.current) {
            await triggerNativeInstall();
            return;
        }

        // Fallback: show manual instructions
        setShowInstructions(true);
    };

    const renderInstructions = () => {
        if (typeof document === 'undefined') return null;
        return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowInstructions(false)}
            />

            {/* Modal Content */}
            <div className="relative bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            <Smartphone className="text-cyan-400" /> เพิ่มไอคอนที่หน้าจอโฮม
                        </h3>
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* App Preview */}
                    <div className="bg-black/40 rounded-2xl p-4 flex items-center gap-4 border border-white/5 mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                            {profilePicUrl ? (
                                <img src={profilePicUrl} alt={profileName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Smartphone size={32} className="text-zinc-600" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-white truncate">{profileName}</div>
                            <div className="text-xs text-white/40 truncate">nexsolution.cloud</div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-6">
                        {platform === 'ios' ? (
                            <>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 font-bold text-cyan-400">1</div>
                                    <p className="text-white/80">กดที่ปุ่ม <span className="inline-flex bg-zinc-800 p-1 rounded-md text-white"><Share size={16} /></span> (แชร์) ที่แถบด้านล่างของ Safari</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 font-bold text-cyan-400">2</div>
                                    <p className="text-white/80">เลื่อนลงมาและเลือก <span className="font-bold text-white">&quot;เพิ่มไปยังหน้าจอโฮม&quot;</span> (Add to Home Screen)</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 font-bold text-cyan-400">3</div>
                                    <p className="text-white/80">กด <span className="font-bold text-white">&quot;เพิ่ม&quot;</span> (Add) ที่มุมขวาบน</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-center animate-bounce">
                                    <div className="flex flex-col items-center gap-1">
                                        <ArrowDown size={24} className="text-cyan-400" />
                                        <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Share Button</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-2">
                                    <p className="text-amber-300 text-sm font-medium">⚠️ ต้องเปิดหน้านี้ใน Chrome Browser (ไม่ใช่ภายใน App อื่น)</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 font-bold text-cyan-400">1</div>
                                    <p className="text-white/80">กดที่ปุ่ม <span className="inline-flex bg-zinc-800 p-1 rounded-md text-white"><MoreVertical size={16} /></span> (เมนู) ที่มุมบนขวาของ Chrome</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 font-bold text-cyan-400">2</div>
                                    <p className="text-white/80">เลือก <span className="font-bold text-white">&quot;ติดตั้งแอป&quot;</span> (Install app) หรือ <span className="font-bold text-white">&quot;เพิ่มไปยังหน้าจอโฮม&quot;</span></p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 font-bold text-cyan-400">3</div>
                                    <p className="text-white/80">กด <span className="font-bold text-white">&quot;ติดตั้ง&quot;</span> (Install) เพื่อยืนยัน</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                                    <div className="text-xs text-white/40 italic text-center">
                                        ไอคอนรูป <span className="text-white font-medium">{profileName}</span> จะปรากฏบนหน้าจอหลักของคุณ
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-0">
                    <button
                        onClick={() => setShowInstructions(false)}
                        className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-colors"
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        </div>,
        document.body,
        );
    };

    // Already installed state
    if (installOutcome === 'installed' && !isStandalone) {
        if (variant === 'link') {
            return (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <Check size={16} />
                    เพิ่มไอคอนที่หน้าจอโฮมแล้ว
                </span>
            );
        }
        return (
            <div className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 border border-emerald-300/40 shadow-[0_14px_36px_-18px_rgba(16,185,129,0.7)]">
                <Check size={24} className="text-emerald-50" />
                เพิ่มไอคอนสำเร็จแล้ว ✓
            </div>
        );
    }

    // Don't show button if already running as standalone app
    if (isStandalone) {
        return null;
    }

    // Compact link variant — secondary action at the bottom of the card
    if (variant === 'link') {
        return (
            <>
                <button
                    type="button"
                    onClick={handleInstallClick}
                    disabled={installOutcome === 'installing'}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] underline underline-offset-4 transition-opacity hover:opacity-80 disabled:opacity-60"
                >
                    <Smartphone size={16} />
                    {installOutcome === 'installing' ? 'กำลังติดตั้ง...' : 'เพิ่มไอคอนนามบัตรนี้ที่หน้าจอโฮม'}
                </button>
                {showInstructions && renderInstructions()}
            </>
        );
    }

    return (
        <>
            <button
                onClick={handleInstallClick}
                disabled={installOutcome === 'installing'}
                className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 backdrop-blur-md text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all border border-cyan-300/40 shadow-[0_14px_36px_-18px_rgba(6,182,212,0.9)] hover:shadow-[0_20px_42px_-20px_rgba(14,165,233,0.95)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
            >
                {installOutcome === 'installing' ? (
                    <>
                        <Download size={24} className="text-cyan-50 animate-bounce" />
                        กำลังติดตั้ง...
                    </>
                ) : canInstallNative ? (
                    <>
                        <Download size={24} className="text-cyan-50" />
                        ติดตั้งไอคอนที่หน้าจอโฮม
                    </>
                ) : (
                    <>
                        <Smartphone size={24} className="text-cyan-50" />
                        เพิ่มไอคอนที่หน้าจอโฮม
                    </>
                )}
            </button>

            {showInstructions && renderInstructions()}
        </>
    );
}
