'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface DownloadProfileButtonProps {
    targetId: string;
    fileName?: string;
    label?: string;
}

export function DownloadProfileButton({
    targetId,
    fileName = 'profile',
    label = 'Download PNG'
}: DownloadProfileButtonProps) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const element = document.getElementById(targetId);
            if (!element) {
                console.error('Target element not found:', targetId);
                setDownloading(false);
                return;
            }

            const canvas = await html2canvas(element, {
                backgroundColor: null,
                scale: 2, // Higher quality
                useCORS: true, // Allow cross-origin images
                logging: false,
            });

            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to generate PNG:', error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {downloading ? (
                <>
                    <Loader2 size={24} className="animate-spin" />
                    กำลังสร้างรูป...
                </>
            ) : (
                <>
                    <Download size={24} />
                    {label}
                </>
            )}
        </button>
    );
}
