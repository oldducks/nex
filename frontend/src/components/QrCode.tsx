import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface QrCodeProps {
    url: string;
    size?: number;
    className?: string;
    fgColor?: string;
    bgColor?: string;
    logoDataUrl?: string;
    level?: 'L' | 'M' | 'Q' | 'H'; // Error correction level
    id?: string;
    useCanvas?: boolean;
}

// Advanced QR code component using qrcode.react for best support of colors and logos
export function QrCodeImage({ 
    url, 
    size = 200, 
    className = '', 
    fgColor = '#000000', 
    bgColor = '#FFFFFF', 
    logoDataUrl,
    level = 'H', // Higher level is better when using logos
    id,
    useCanvas = false
}: QrCodeProps) {
    if (!url) return null;

    const commonProps = {
        value: url,
        size: size,
        fgColor: fgColor,
        bgColor: bgColor,
        level: level,
        includeMargin: false,
        imageSettings: logoDataUrl ? {
            src: logoDataUrl,
            x: undefined,
            y: undefined,
            height: size * 0.25,
            width: size * 0.25,
            excavate: true,
        } : undefined,
        style: { display: 'block' }
    };

    return (
        <div className={`inline-block p-4 rounded-2xl shadow-xl drop-shadow-md border border-foreground/5 hover:scale-105 transition-transform duration-300 ${className}`} style={{ backgroundColor: bgColor }}>
            {useCanvas ? (
                <QRCodeCanvas id={id} {...commonProps} />
            ) : (
                <QRCodeSVG id={id} {...commonProps} />
            )}
        </div>
    );
}

// Keep QrCodeWithFallback as an alternative (though now less needed)
export function QrCodeWithFallback(props: QrCodeProps) {
    return <QrCodeImage {...props} />;
}

// Alias exports
export const QrCode = QrCodeImage;
