'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Download, Loader2, Palette, Type } from 'lucide-react';
import { QrCodeImage } from '../../../components/QrCode';
import ManageTopBar from '@/components/ManageTopBar';

interface NamecardData {
    name_th: string;
    name_en: string;
    position_th: string;
    position_en: string;
    company_th: string;
    company_en: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
    profile_pic_url: string;
    qr_url: string;
    show_qr: boolean;
    show_logo: boolean;
}

const CARD_TEMPLATES = [
    { id: 'classic', name: 'Classic', bg: '#ffffff', text: '#000000' },
    { id: 'modern', name: 'Modern Dark', bg: '#1a1a2e', text: '#ffffff' },
    { id: 'blue', name: 'Corporate Blue', bg: '#1e3a5f', text: '#ffffff' },
    { id: 'gradient', name: 'Gradient', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff' },
];

export default function NamecardEditor() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [template, setTemplate] = useState('classic');
    const [data, setData] = useState<NamecardData>({
        name_th: '', name_en: '', position_th: '', position_en: '',
        company_th: '', company_en: '', phone: '', email: '', website: '',
        logo_url: '', profile_pic_url: '', qr_url: '',
        show_qr: true, show_logo: true
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
    const token = Cookies.get('token');
    const uid = Cookies.get('uid');

    useEffect(() => {
        if (!token) { router.push('/login'); return; }
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/profile/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const p = await res.json();
                setData({
                    name_th: p.names_i18n?.find((n: any) => n.lang === 'th')?.value || p.full_name || '',
                    name_en: p.names_i18n?.find((n: any) => n.lang === 'en')?.value || '',
                    position_th: p.positions_i18n?.find((n: any) => n.lang === 'th')?.value || p.position || '',
                    position_en: p.positions_i18n?.find((n: any) => n.lang === 'en')?.value || '',
                    company_th: p.companies_i18n?.find((n: any) => n.lang === 'th')?.value || p.company_name || '',
                    company_en: p.companies_i18n?.find((n: any) => n.lang === 'en')?.value || '',
                    phone: p.phones?.[0]?.value || p.mobile || '',
                    email: p.emails?.[0]?.value || p.email_contact || '',
                    website: p.websites?.[0]?.url || p.website || '',
                    logo_url: p.logo?.url || '',
                    profile_pic_url: p.profile_pic_url || '',
                    qr_url: `${SITE_URL}/${uid}`,
                    show_qr: true,
                    show_logo: true
                });
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const drawCard = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Card dimensions (standard business card ratio 3.5:2)
        canvas.width = 1050;
        canvas.height = 600;

        const tpl = CARD_TEMPLATES.find(t => t.id === template) || CARD_TEMPLATES[0];

        // Background
        if (tpl.bg.startsWith('linear-gradient')) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = tpl.bg;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text settings
        ctx.fillStyle = tpl.text;
        ctx.textBaseline = 'top';

        // Name TH
        ctx.font = 'bold 48px Sarabun, sans-serif';
        ctx.fillText(data.name_th, 40, 40);

        // Name EN
        ctx.font = '32px Arial, sans-serif';
        ctx.fillText(data.name_en, 40, 100);

        // Position
        ctx.font = '24px Arial, sans-serif';
        ctx.fillStyle = tpl.id === 'classic' ? '#666666' : 'rgba(255,255,255,0.8)';
        ctx.fillText(`${data.position_th} | ${data.position_en}`, 40, 160);

        // Company
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillStyle = tpl.text;
        ctx.fillText(data.company_th, 40, 220);
        ctx.font = '22px Arial, sans-serif';
        ctx.fillText(data.company_en, 40, 260);

        // Divider
        ctx.strokeStyle = tpl.id === 'classic' ? '#dddddd' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 320);
        ctx.lineTo(600, 320);
        ctx.stroke();

        // Contact Info
        ctx.font = '22px Arial, sans-serif';
        ctx.fillStyle = tpl.id === 'classic' ? '#333333' : 'rgba(255,255,255,0.9)';
        let y = 350;
        if (data.phone) { ctx.fillText(`📱 ${data.phone}`, 40, y); y += 40; }
        if (data.email) { ctx.fillText(`✉️ ${data.email}`, 40, y); y += 40; }
        if (data.website) { ctx.fillText(`🌐 ${data.website}`, 40, y); }

        // Load and draw logo
        if (data.logo_url && data.show_logo) {
            try {
                const logo = await loadImage(data.logo_url);
                ctx.drawImage(logo, canvas.width - 200, 40, 150, 150);
            } catch (e) { console.log('Logo load failed'); }
        }

        // QR Code (right side) - actual QR image
        if (data.show_qr && data.qr_url) {
            try {
                const encodedUrl = encodeURIComponent(data.qr_url);
                const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodedUrl}&format=png&margin=5`;
                const qrImg = await loadImage(qrApiUrl);
                ctx.drawImage(qrImg, canvas.width - 200, 350, 160, 160);
            } catch (e) {
                // Fallback: draw placeholder if QR fails
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(canvas.width - 200, 350, 160, 160);
                ctx.fillStyle = '#000000';
                ctx.font = '12px Arial';
                ctx.fillText('QR Code', canvas.width - 160, 430);
            }
        }
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const downloadCard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `namecard-${data.name_en || 'card'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    useEffect(() => {
        if (!loading) drawCard();
    }, [loading, template, data]);

    if (loading) return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            <ManageTopBar
                backHref="/manage/control-center"
                subtitle="ระบบจัดการนามบัตร"
                title="เครื่องมือสร้างนามบัตร"
                actions={(
                    <button onClick={downloadCard} className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_18px_40px_-26px_rgba(249,115,22,0.55)] transition-colors active:scale-95">
                        <Download size={18} /> <span className="hidden sm:inline">ดาวน์โหลด PNG</span>
                    </button>
                )}
            />

            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Preview */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black mb-2 tracking-tight text-[#050579]">Preview</h3>
                        <div className="bg-card-bg p-8 rounded-[32px] border border-glass-border shadow-2xl glass-card">
                            <canvas ref={canvasRef} className="w-full rounded-xl shadow-2xl border border-[#D9E1F2]" style={{ aspectRatio: '3.5/2' }} />
                        </div>

                        {/* Template Selector */}
                        <div className="bg-[#F6F8FF] p-8 rounded-[32px] border border-[#D9E1F2]">
                            <h4 className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.16em] mb-6 flex items-center gap-2">
                                <Palette size={16} className="text-primary" /> Choose Template
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {CARD_TEMPLATES.map(tpl => (
                                    <button 
                                        key={tpl.id} 
                                        onClick={() => setTemplate(tpl.id)}
                                        className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${template === tpl.id ? 'bg-[#050579] text-white shadow-[0_18px_36px_-24px_rgba(5,5,121,0.45)] scale-105' : 'bg-white text-[#64748B] border border-[#D9E1F2] hover:border-[#C7D2E5] hover:text-[#475569]'}`}>
                                        {tpl.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="space-y-6">
                        <div className="bg-card-bg border border-glass-border rounded-[32px] p-8 glass-card">
                            <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight">
                                <Type size={22} className="text-[#050579]" /> ข้อมูลบนนามบัตร
                            </h3>

                            {/* Toggles */}
                            <div className="flex gap-6 mb-8 bg-[#F6F8FF] p-4 rounded-2xl border border-[#D9E1F2]">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={data.show_logo} 
                                        onChange={e => setData({ ...data, show_logo: e.target.checked })} 
                                        className="w-5 h-5 accent-[#050579] rounded-lg cursor-pointer" 
                                    />
                                    <span className="text-sm font-bold text-[#475569] group-hover:text-[#0F172A] transition-colors">แสดงโลโก้</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={data.show_qr} 
                                        onChange={e => setData({ ...data, show_qr: e.target.checked })} 
                                        className="w-5 h-5 accent-[#050579] rounded-lg cursor-pointer" 
                                    />
                                    <span className="text-sm font-bold text-[#475569] group-hover:text-[#0F172A] transition-colors">แสดง QR Code</span>
                                </label>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">ชื่อ (TH)</label>
                                        <input type="text" value={data.name_th} onChange={e => setData({ ...data, name_th: e.target.value })} className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Name (EN)</label>
                                        <input type="text" value={data.name_en} onChange={e => setData({ ...data, name_en: e.target.value })} className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30 transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">ตำแหน่ง (TH)</label>
                                        <input type="text" value={data.position_th} onChange={e => setData({ ...data, position_th: e.target.value })} className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Position (EN)</label>
                                        <input type="text" value={data.position_en} onChange={e => setData({ ...data, position_en: e.target.value })} className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30 transition-all" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">บริษัท (TH)</label>
                                        <input type="text" value={data.company_th} onChange={e => setData({ ...data, company_th: e.target.value })} className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">Company (EN)</label>
                                        <input type="text" value={data.company_en} onChange={e => setData({ ...data, company_en: e.target.value })} className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30 transition-all" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">เบอร์โทร</label>
                                    <input type="text" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30 transition-all" />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">อีเมล</label>
                                    <input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30 transition-all" />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest ml-1">เว็บไซต์</label>
                                    <input type="url" value={data.website} onChange={e => setData({ ...data, website: e.target.value })} className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* QR Preview */}
                        <div className="bg-[#F6F8FF] border border-[#D9E1F2] rounded-[32px] p-8 text-center group">
                            <h4 className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.16em] mb-6">QR Code สำหรับนามบัตร</h4>
                            <div className="bg-white p-4 rounded-[24px] inline-block shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                <QrCodeImage url={data.qr_url} size={150} />
                            </div>
                            <p className="text-[10px] font-mono text-[#050579] mt-6 overflow-hidden text-ellipsis px-4">{data.qr_url}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
