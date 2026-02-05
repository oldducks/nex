'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface VcfDownloadProps {
    uid?: string;
    name: string;
    position?: string;
    company?: string;
    phones?: { label: string; value: string }[];
    emails?: { label: string; value: string }[];
    website?: string;
    address?: string;
    profilePicUrl?: string;
}

export function VcfDownloadButton({
    uid,
    name,
    position,
    company,
    phones = [],
    emails = [],
    website,
    address,
    profilePicUrl
}: VcfDownloadProps) {
    const [downloading, setDownloading] = useState(false);

    const generateVcf = async () => {
        setDownloading(true);

        // Log analytics
        if (uid) {
            try {
                const vid = Cookies.get('vid') || 'unknown';
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                await fetch(`${API_URL}/analytics/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid,
                        action: 'DOWNLOAD_VCF',
                        visitorId: vid
                    })
                });
            } catch (err) {
                console.error('Analytics error:', err);
            }
        }

        try {
            // Parse name
            const nameParts = name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Build VCF content
            let vcf = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${name}
`;

            if (company) {
                vcf += `ORG:${company}\n`;
            }

            if (position) {
                vcf += `TITLE:${position}\n`;
            }

            // Add Profile Picture
            if (profilePicUrl) {
                try {
                    const imgRes = await fetch(profilePicUrl);
                    if (imgRes.ok) {
                        const blob = await imgRes.blob();
                        const base64 = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const result = reader.result as string;
                                // Remove prefix (data:image/xyz;base64,)
                                resolve(result.split(',')[1]);
                            };
                            reader.readAsDataURL(blob);
                        });
                        // vCard 3.0 standard
                        vcf += `PHOTO;ENCODING=b;TYPE=JPEG:${base64}\n`;
                    }
                } catch (e) {
                    console.error('Failed to encode image for VCF', e);
                }
            }

            // Add phones
            phones.forEach((phone, i) => {
                const type = phone.label?.toLowerCase().includes('mobile') ? 'CELL' :
                    phone.label?.toLowerCase().includes('work') || phone.label?.toLowerCase().includes('office') ? 'WORK' : 'HOME';
                vcf += `TEL;TYPE=${type}:${phone.value}\n`;
            });

            // Add emails
            emails.forEach((email, i) => {
                const type = email.label?.toLowerCase().includes('work') ? 'WORK' : 'HOME';
                vcf += `EMAIL;TYPE=${type}:${email.value}\n`;
            });

            if (website) {
                vcf += `URL:${website}\n`;
            }

            if (address) {
                vcf += `ADR;TYPE=WORK:;;${address};;;;\n`;
            }

            vcf += 'END:VCARD';

            // Create download
            const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name.replace(/\s+/g, '_')}.vcf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating VCF:', error);
            alert('Failed to generate contact file');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button
            onClick={generateVcf}
            disabled={downloading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
            {downloading ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
            บันทึกข้อมูลติดต่อ
        </button>
    );
}
