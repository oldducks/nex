'use client';

import { useState } from 'react';

interface QrCodeDownloadActionsProps {
  qrValue: string;
  fileBaseName: string;
  className?: string;
  lightMode?: boolean;
  titleLine?: string;
  nameLine?: string;
  phoneLine?: string;
  bottomLabel?: string;
  bottomLine?: string;
  buttonLabel?: string;
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

async function loadImageFromBlob(imageBlob: Blob): Promise<HTMLImageElement> {
  const imageUrl = URL.createObjectURL(imageBlob);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('ไม่สามารถเตรียมภาพสำหรับดาวน์โหลดได้'));
      image.src = imageUrl;
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

async function composeQrCardBlob({
  qrBlob,
  format,
  titleLine,
  nameLine,
  phoneLine,
  bottomLabel,
  bottomLine,
}: {
  qrBlob: Blob;
  format: 'png' | 'jpg';
  titleLine?: string;
  nameLine?: string;
  phoneLine?: string;
  bottomLabel?: string;
  bottomLine?: string;
}): Promise<Blob> {
  const qrImage = await loadImageFromBlob(qrBlob);
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 1800;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('ไม่สามารถเตรียมภาพสำหรับดาวน์โหลดได้');

  context.fillStyle = '#eef2ff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.shadowColor = 'rgba(15, 23, 42, 0.16)';
  context.shadowBlur = 48;
  context.shadowOffsetY = 18;
  roundedRect(context, 90, 90, 1220, 1620, 54);
  context.fillStyle = '#ffffff';
  context.fill();
  context.restore();

  const titleY = 250;
  context.textAlign = 'center';
  if (titleLine) {
    context.fillStyle = '#64748b';
    context.font = '600 38px sans-serif';
    context.fillText(titleLine, canvas.width / 2, titleY);
  }

  if (nameLine) {
    context.fillStyle = '#0f172a';
    context.font = '700 68px sans-serif';
    context.fillText(nameLine, canvas.width / 2, titleY + (titleLine ? 92 : 36));
  }

  const qrCardX = 250;
  const qrCardY = 430;
  const qrCardSize = 900;

  roundedRect(context, qrCardX, qrCardY, qrCardSize, qrCardSize, 40);
  context.fillStyle = '#f8fafc';
  context.fill();
  context.strokeStyle = '#dbe4ff';
  context.lineWidth = 6;
  context.stroke();

  const qrPadding = 90;
  context.drawImage(
    qrImage,
    qrCardX + qrPadding,
    qrCardY + qrPadding,
    qrCardSize - qrPadding * 2,
    qrCardSize - qrPadding * 2,
  );

  const resolvedBottomLabel = bottomLabel || (phoneLine ? 'โทรศัพท์' : '');
  const resolvedBottomLine = bottomLine || phoneLine || '';

  if (resolvedBottomLine) {
    context.fillStyle = '#475569';
    context.font = '600 36px sans-serif';
    if (resolvedBottomLabel) {
      context.fillText(resolvedBottomLabel, canvas.width / 2, 1490);
    }

    context.fillStyle = '#050579';
    context.font = '700 42px sans-serif';
    const maxWidth = 980;
    const words = resolvedBottomLine.split(/(\s+)/).filter(Boolean);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = `${currentLine}${word}`;
      if (context.measureText(testLine).width > maxWidth && currentLine.trim()) {
        lines.push(currentLine.trim());
        currentLine = word.trimStart();
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }

    lines.slice(0, 3).forEach((line, index) => {
      context.fillText(line, canvas.width / 2, 1570 + index * 56);
    });
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`สร้างไฟล์ ${format.toUpperCase()} ไม่สำเร็จ`));
          return;
        }
        resolve(blob);
      },
      format === 'png' ? 'image/png' : 'image/jpeg',
      format === 'png' ? undefined : 0.94,
    );
  });
}

export function QrCodeDownloadActions({
  qrValue,
  fileBaseName,
  className = '',
  lightMode = true,
  titleLine,
  nameLine,
  phoneLine,
  bottomLabel,
  bottomLine,
  buttonLabel,
}: QrCodeDownloadActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (format: 'png' | 'jpg') => {
    if (!qrValue || isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await fetch(getQrImageUrl(qrValue, 'png'));
      if (!response.ok) throw new Error('ดาวน์โหลด QR code ไม่สำเร็จ');
      const pngBlob = await response.blob();
      const outputBlob = await composeQrCardBlob({
        qrBlob: pngBlob,
        format,
        titleLine,
        nameLine,
        phoneLine,
        bottomLabel,
        bottomLine,
      });
      triggerDownload(outputBlob, `${fileBaseName}.${format}`);
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
        {isDownloading ? 'กำลังดาวน์โหลด...' : buttonLabel || 'กดเพื่อ download qr code ลงในโทรศัพท์'}
      </button>
    </div>
  );
}
