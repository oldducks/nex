'use client';

import { useState } from 'react';

interface QrCodeDownloadActionsProps {
  qrValue: string;
  fileBaseName: string;
  className?: string;
  lightMode?: boolean;
}

const getQrImageUrl = (value: string, format: 'png' | 'jpg') =>
  `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&format=${format}&data=${encodeURIComponent(value)}`;

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

async function pngToJpgBlob(pngBlob: Blob): Promise<Blob> {
  const imageUrl = URL.createObjectURL(pngBlob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('ไม่สามารถแปลงภาพเป็น JPG ได้'));
      image.src = imageUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('ไม่สามารถเตรียมภาพสำหรับดาวน์โหลดได้');

    // JPG has no transparency; fill a white background first.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0);

    const jpgBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
    if (!jpgBlob) throw new Error('สร้างไฟล์ JPG ไม่สำเร็จ');
    return jpgBlob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export function QrCodeDownloadActions({ qrValue, fileBaseName, className = '', lightMode = true }: QrCodeDownloadActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!qrValue || isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await fetch(getQrImageUrl(qrValue, 'png'));
      if (!response.ok) throw new Error('ดาวน์โหลด QR code ไม่สำเร็จ');
      const pngBlob = await response.blob();

      if (format === 'png') {
        triggerDownload(pngBlob, `${fileBaseName}.png`);
      } else {
        const jpgBlob = await pngToJpgBlob(pngBlob);
        triggerDownload(jpgBlob, `${fileBaseName}.jpg`);
      }
    } catch (error) {
      console.error('QR download failed:', error);
      window.alert('ไม่สามารถดาวน์โหลด QR code ได้ กรุณาลองใหม่');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`mt-4 flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => handleDownload('png')}
        disabled={isDownloading}
        className={`inline-flex items-center rounded-xl border px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${lightMode ? 'hover:bg-white/70 text-[#050579] border-[#D9E1F2]' : 'hover:bg-white/10 text-[#93C5FD] border-[#334155]'}`}
      >
        {isDownloading ? 'กำลังดาวน์โหลด...' : 'กดเพื่อ download qr code ลงในโทรศัพท์'}
      </button>
      <button
        type="button"
        onClick={() => handleDownload('jpg')}
        disabled={isDownloading}
        className={`text-xs font-semibold underline underline-offset-4 transition-opacity hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 ${lightMode ? 'text-[#334155] opacity-80' : 'text-[#93C5FD] opacity-90'}`}
      >
        หรือดาวน์โหลดเป็น JPG
      </button>
    </div>
  );
}
