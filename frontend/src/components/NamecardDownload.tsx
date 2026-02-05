'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface NamecardDownloadProps {
    nameMain: string;
    nameSub?: string;
    position?: string;
    company?: string;
    phone?: string;
    email?: string;
    website?: string;
    logoUrl?: string;
    qrUrl?: string;
    template?: 'classic' | 'modern' | 'blue' | 'gradient';
}

const TEMPLATES = {
    classic: { bg: '#ffffff', text: '#000000', subText: '#666666' },
    modern: { bg: '#1a1a2e', text: '#ffffff', subText: 'rgba(255,255,255,0.8)' },
    blue: { bg: '#1e3a5f', text: '#ffffff', subText: 'rgba(255,255,255,0.8)' },
    gradient: { bg: 'gradient', text: '#ffffff', subText: 'rgba(255,255,255,0.8)' },
};

export function NamecardDownloadButton({
    nameMain,
    nameSub,
    position,
    company,
    phone,
    email,
    website,
    logoUrl,
    qrUrl,
    template = 'gradient'
}: NamecardDownloadProps) {
    const [downloading, setDownloading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const drawCard = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Card dimensions (standard business card 3.5:2)
        canvas.width = 1050;
        canvas.height = 600;

        const tpl = TEMPLATES[template];
        const textMaxWidth = 650; // Limit text width to avoid overlapping logo/QR

        // Background
        if (template === 'gradient') {
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

        // Name Main (larger, bold)
        ctx.font = 'bold 42px Sarabun, sans-serif';
        ctx.fillText(nameMain || '', 50, 50, textMaxWidth);

        // Name Sub (English name)
        let textY = 105;
        if (nameSub) {
            ctx.font = '28px Arial, sans-serif';
            ctx.fillStyle = tpl.subText;
            ctx.fillText(nameSub, 50, textY, textMaxWidth);
            textY += 45;
        }

        // Position
        if (position) {
            ctx.font = '22px Arial, sans-serif';
            ctx.fillStyle = tpl.subText;
            ctx.fillText(position, 50, textY, textMaxWidth);
            textY += 35;
        }

        // Company
        if (company) {
            ctx.font = 'bold 24px Arial, sans-serif';
            ctx.fillStyle = tpl.text;
            ctx.fillText(company, 50, textY, textMaxWidth);
            textY += 40;
        }

        // Divider line
        textY += 20;
        ctx.strokeStyle = template === 'classic' ? '#dddddd' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, textY);
        ctx.lineTo(650, textY);
        ctx.stroke();
        textY += 30;

        // Contact Info
        ctx.font = '20px Arial, sans-serif';
        ctx.fillStyle = template === 'classic' ? '#333333' : 'rgba(255,255,255,0.9)';
        if (phone) { ctx.fillText(`📱 ${phone}`, 50, textY, textMaxWidth); textY += 35; }
        if (email) { ctx.fillText(`✉️ ${email}`, 50, textY, textMaxWidth); textY += 35; }
        if (website) { ctx.fillText(`🌐 ${website}`, 50, textY, textMaxWidth); }

        // Right side area (Logo on top, QR on bottom)
        const rightX = canvas.width - 220;

        // Load and draw logo (top right)
        if (logoUrl) {
            try {
                const logo = await loadImage(logoUrl);
                // Draw logo with white background for better visibility
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.roundRect(rightX, 40, 180, 180, 16);
                ctx.fill();
                ctx.drawImage(logo, rightX + 15, 55, 150, 150);
            } catch (e) { console.log('Logo load failed'); }
        }

        // Load and draw QR Code (bottom right)
        if (qrUrl) {
            try {
                const encodedUrl = encodeURIComponent(qrUrl);
                const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodedUrl}&format=png&margin=5`;
                const qrImg = await loadImage(qrApiUrl);
                ctx.drawImage(qrImg, rightX + 10, 380, 160, 160);
            } catch (e) {
                // Fallback placeholder
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(rightX + 10, 380, 160, 160);
                ctx.fillStyle = '#000000';
                ctx.font = '12px Arial';
                ctx.fillText('QR Code', rightX + 50, 460);
            }
        }

        return canvas;
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const canvas = await drawCard();
            if (!canvas) {
                setDownloading(false);
                return;
            }

            const link = document.createElement('a');
            link.download = `${nameMain.replace(/\s/g, '_')}_namecard.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to generate namecard:', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
            {/* Hidden canvas for drawing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {downloading ? (
                    <>
                        <Loader2 size={24} className="animate-spin" />
                        กำลังสร้างนามบัตร...
                    </>
                ) : (
                    <>
                        <Download size={24} />
                        ดาวน์โหลดนามบัตร PNG
                    </>
                )}
            </button>
        </>
    );
}
