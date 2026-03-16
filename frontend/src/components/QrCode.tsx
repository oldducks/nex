'use client';

interface QrCodeProps {
    url: string;
    size?: number;
    className?: string;
}

// QR code component using Google Charts API
export function QrCodeImage({ url, size = 200, className = '' }: QrCodeProps) {
    // Encode URL properly
    const encodedUrl = encodeURIComponent(url);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&format=png&margin=0`;

    return (
        <div className={`inline-block bg-white p-2 rounded-2xl shadow-xl drop-shadow-md border border-foreground/5 hover:scale-105 transition-transform duration-300 ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={qrUrl}
                alt="QR Code"
                width={size}
                height={size}
                style={{ display: 'block' }}
            />
        </div>
    );
}

// Alternative with fallback
export function QrCodeWithFallback({ url, size = 200, className = '' }: QrCodeProps) {
    const encodedUrl = encodeURIComponent(url);

    // Primary: qrserver.com (free, no API key needed)
    const primaryUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&format=png&margin=0`;

    // Fallback: Google Charts (being deprecated but still works)
    const fallbackUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodedUrl}&chld=M|0`;

    return (
        <div className={`inline-block bg-white p-2 rounded-2xl shadow-xl drop-shadow-md border border-foreground/5 hover:scale-105 transition-transform duration-300 ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={primaryUrl}
                alt="QR Code"
                width={size}
                height={size}
                style={{ display: 'block' }}
                onError={(e) => {
                    // Fallback to Google Charts if primary fails
                    (e.target as HTMLImageElement).src = fallbackUrl;
                }}
            />
        </div>
    );
}

// Alias exports
export const QrCode = QrCodeImage;
