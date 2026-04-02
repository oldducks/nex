'use client';

import { useState, useEffect } from 'react';
import { Smartphone, X, Share, MoreVertical, PlusSquare, ArrowUp, ArrowDown } from 'lucide-react';

interface SaveToHomeButtonProps {
    uid?: string;
    profileName: string;
    profilePicUrl?: string;
}

export function SaveToHomeButton({ uid, profileName, profilePicUrl }: SaveToHomeButtonProps) {
    const [showInstructions, setShowInstructions] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
        }
    }, []);

    const openInstructions = () => {
        setShowInstructions(true);
        
        // Potential analytics log here later?
    };

    return (
        <>
            <button
                onClick={openInstructions}
                className="w-full bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 backdrop-blur-md text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all border border-cyan-300/40 shadow-[0_14px_36px_-18px_rgba(6,182,212,0.9)] hover:shadow-[0_20px_42px_-20px_rgba(14,165,233,0.95)] active:scale-[0.98]"
            >
                <Smartphone size={24} className="text-cyan-50" />
                เพิ่มไอคอนที่หน้าจอโฮม
            </button>

            {showInstructions && (
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
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Smartphone className="text-primary" /> เลือก "เพิ่มไปยังหน้าจอโฮม"
                                </h3>
                                <button 
                                    onClick={() => setShowInstructions(false)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
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
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary">1</div>
                                            <p className="text-white/80">กดที่ปุ่ม <span className="inline-flex bg-zinc-800 p-1 rounded-md text-white"><Share size={16} /></span> (แชร์) ที่แถบด้านล่างของบราวเซอร์</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary">2</div>
                                            <p className="text-white/80">เลื่อนลงมาและเลือกเมนู <span className="font-bold text-white">"เพิ่มไปยังหน้าจอโฮม"</span> (Add to Home Screen)</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary">3</div>
                                            <p className="text-white/80">กด <span className="font-bold text-white">"เพิ่ม"</span> (Add) ที่มุมขวาบนเพื่อเสร็จสิ้น</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-center animate-bounce">
                                            <div className="flex flex-col items-center gap-1">
                                                <ArrowDown size={24} className="text-primary" />
                                                <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Share Button</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary">1</div>
                                            <p className="text-white/80">กดที่ปุ่ม <span className="inline-flex bg-zinc-800 p-1 rounded-md text-white"><MoreVertical size={16} /></span> (เมนู) ที่มุมบนขวาหรือใช้เมนูของบราวเซอร์</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary">2</div>
                                            <p className="text-white/80">เลือกเมนู <span className="font-bold text-white">"เพิ่มไปยังหน้าจอโฮม"</span> (Add to Home Screen) หรือ <span className="font-bold text-white">"ติดตั้งแอป"</span> (Install App)</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-bold text-primary">3</div>
                                            <p className="text-white/80">กด <span className="font-bold text-white">"เพิ่ม"</span> (Add) เพื่อยืนยัน</p>
                                        </div>
                                        {/* Optional: Visual aid arrow depending on where the menu usually is */}
                                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                                            <div className="text-xs text-white/40 italic">ไอคอนจะปรากฏบนหน้าจอหลักของคุณเหมือนแอปทั่วไป</div>
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
                </div>
            )}
        </>
    );
}
