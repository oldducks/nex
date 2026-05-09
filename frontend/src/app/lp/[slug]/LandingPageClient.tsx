"use client";

import { useEffect, useRef, useState } from 'react';
import { 
  Globe, ExternalLink, Share2, Facebook, Twitter, Phone,
  ChevronRight, MessageSquare, Package, Layout, Image as ImageIcon,
  Copy, Mail, MapPin, Play, Loader2, X
} from 'lucide-react';
import ManageTopBar from '@/components/ManageTopBar';
import Cookies from 'js-cookie';
import { getEmbedUrl, isEmbedableVideo } from '@/lib/videoUtils';
import { QrCodeImage } from '@/components/QrCode';
import { QrCodeDownloadActions } from '@/components/QrCodeDownloadActions';

interface Block {
    id: string;
    type: 'text' | 'image' | 'video' | 'button' | 'form' | 'location' | 'contact';
    content: any;
}

interface LandingPage {
    id: number;
    title: string;
    slug: string;
    description: string;
    content_blocks: Block[];
    theme_config: any;
    seo_metadata: any;
    owner_uid?: string;
    referral_code?: string | null;
}

interface FormFieldConfig {
    id: string;
    type: 'text' | 'email' | 'phone' | 'dropdown' | 'textarea' | 'checkbox';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
}

interface PublicFormConfig {
    id: number;
    name: string;
    description?: string;
    fields: FormFieldConfig[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';

function renderLandingFormField(
    field: FormFieldConfig,
    value: any,
    onChange: (id: string, value: any) => void,
) {
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '1rem 1.25rem',
        borderRadius: '16px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #F3F4F6',
        fontWeight: 500,
        fontSize: '16px',
        lineHeight: 1.5,
        color: '#111827',
        outline: 'none',
    };

    switch (field.type) {
        case 'textarea':
            return (
                <textarea
                    style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                    placeholder={field.placeholder || field.label}
                    value={value || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            );
        case 'dropdown':
            return (
                <select
                    style={inputStyle}
                    value={value || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                >
                    <option value="">-- กรุณาเลือก --</option>
                    {(field.options || []).map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            );
        case 'checkbox':
            return (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(field.id, e.target.checked)}
                        style={{ marginTop: '0.2rem', width: '18px', height: '18px', accentColor: '#050579' }}
                    />
                    <span>
                        {field.label}
                        {field.required ? ' *' : ''}
                    </span>
                </label>
            );
        default: {
            const inputType =
                field.type === 'email'
                    ? 'email'
                    : field.type === 'phone'
                    ? 'tel'
                    : 'text';
            return (
                <input
                    type={inputType}
                    style={inputStyle}
                    placeholder={field.placeholder || field.label}
                    value={value || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            );
        }
    }
}

const LineIcon = ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
);

const TelegramIcon = ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M21.944 4.665c.263-.943-.273-1.314-1.02-1.043L2.832 10.79c-.91.36-.896.867-.166 1.091l4.644 1.45 1.795 5.562c.222.612.112.854.756.854.498 0 .718-.228.996-.498l2.388-2.32 4.965 3.665c.915.506 1.575.245 1.802-.847L21.944 4.665zM9.09 12.987l9.081-5.732c.454-.276.87-.127.529.176l-7.773 7.02-.303 3.27-1.534-4.734z" />
    </svg>
);

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
        <path d="M20.317 4.369A19.791 19.791 0 0015.438 3c-.211.375-.444.88-.608 1.28a18.27 18.27 0 00-5.66 0A12.64 12.64 0 008.56 3a19.736 19.736 0 00-4.88 1.37C.533 9.13-.32 13.768.099 18.35a19.91 19.91 0 005.993 3.03c.48-.65.907-1.338 1.273-2.058-.698-.264-1.364-.59-1.986-.97.166-.122.328-.248.485-.379 3.835 1.8 7.998 1.8 11.788 0 .16.132.322.258.488.38-.624.38-1.293.706-1.992.97.366.719.793 1.407 1.273 2.057a19.873 19.873 0 005.995-3.03c.49-5.31-.839-9.906-3.099-13.981zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.334.95-2.418 2.157-2.418 1.216 0 2.181 1.093 2.157 2.418 0 1.334-.95 2.419-2.157 2.419zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.334.95-2.418 2.157-2.418 1.216 0 2.181 1.093 2.157 2.418 0 1.334-.941 2.419-2.157 2.419z" />
    </svg>
);

type ContactLink = {
    name: string;
    href: string;
    icon: React.ReactNode;
};

function normalizeUrl(value?: unknown): string | null {
    if (typeof value !== 'string') return null;
    let trimmed = value.trim();
    if (trimmed.length === 0) return null;
    if (!trimmed.startsWith('http://') &&
        !trimmed.startsWith('https://') &&
        !trimmed.startsWith('mailto:') &&
        !trimmed.startsWith('tel:') &&
        !trimmed.startsWith('/') &&
        !trimmed.startsWith('#')) {
        trimmed = 'https://' + trimmed;
    }
    return trimmed;
}

function normalizePhone(value?: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const digits = trimmed.replace(/[^\d+]/g, '');
    return digits || null;
}

function buildLineHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://line.me/R/ti/p/${encodeURIComponent(trimmed.startsWith('@') ? trimmed : `@${trimmed}`)}`;
}

function buildFacebookHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://facebook.com/${trimmed.replace(/^@/, '')}`;
}

function buildWhatsAppHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const phone = normalizePhone(trimmed);
    return phone ? `https://wa.me/${phone.replace(/^\+/, '')}` : null;
}

function buildTelegramHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://t.me/${trimmed.replace(/^@/, '')}`;
}

function buildDiscordHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://discord.gg/${trimmed}`;
}

function buildXHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://x.com/${trimmed.replace(/^@/, '')}`;
}

function buildInstagramHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://instagram.com/${trimmed.replace(/^@/, '')}`;
}

function buildTikTokHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const normalized = trimmed.replace(/^@/, '');
    return `https://www.tiktok.com/@${normalized}`;
}

function buildYouTubeHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('@')) return `https://www.youtube.com/${trimmed}`;
    return `https://www.youtube.com/${trimmed.replace(/^\//, '')}`;
}

function buildLinkedInHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    const trimmed = value.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://www.linkedin.com/${trimmed.replace(/^\//, '')}`;
}

function buildEmailHref(value?: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) return null;
    return `mailto:${value.trim()}`;
}

function buildContactLinks(content: any): ContactLink[] {
    const items: Array<ContactLink | null> = [
        buildLineHref(content?.line) ? {
            name: 'LINE',
            href: buildLineHref(content?.line)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#06C755', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><LineIcon size={28} /></div>,
        } : null,
        buildFacebookHref(content?.facebook) ? {
            name: 'Facebook',
            href: buildFacebookHref(content?.facebook)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#1877F2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Facebook size={28} fill="currentColor" /></div>,
        } : null,
        normalizePhone(content?.phone) ? {
            name: 'โทรศัพท์',
            href: `tel:${normalizePhone(content?.phone)}`,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#0F766E', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Phone size={24} /></div>,
        } : null,
        buildWhatsAppHref(content?.whatsapp) ? {
            name: 'WhatsApp',
            href: buildWhatsAppHref(content?.whatsapp)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#25D366', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><WhatsAppIcon size={26} /></div>,
        } : null,
        buildTelegramHref(content?.telegram) ? {
            name: 'Telegram',
            href: buildTelegramHref(content?.telegram)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#229ED9', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><TelegramIcon size={26} /></div>,
        } : null,
        buildDiscordHref(content?.discord) ? {
            name: 'Discord',
            href: buildDiscordHref(content?.discord)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#5865F2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><DiscordIcon size={24} /></div>,
        } : null,
        buildXHref(content?.x) ? {
            name: 'X',
            href: buildXHref(content?.x)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#000000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Twitter size={24} fill="currentColor" /></div>,
        } : null,
        buildInstagramHref(content?.instagram) ? {
            name: 'Instagram',
            href: buildInstagramHref(content?.instagram)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#E1306C', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><ImageIcon size={24} /></div>,
        } : null,
        buildTikTokHref(content?.tiktok) ? {
            name: 'TikTok',
            href: buildTikTokHref(content?.tiktok)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#111827', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '19px', fontWeight: 900 }}>TT</div>,
        } : null,
        buildYouTubeHref(content?.youtube) ? {
            name: 'YouTube',
            href: buildYouTubeHref(content?.youtube)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#FF0000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Play size={22} fill="currentColor" /></div>,
        } : null,
        buildLinkedInHref(content?.linkedin) ? {
            name: 'LinkedIn',
            href: buildLinkedInHref(content?.linkedin)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#0A66C2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '22px', fontWeight: 900 }}>in</div>,
        } : null,
        normalizeUrl(content?.website) ? {
            name: 'เว็บไซต์',
            href: normalizeUrl(content?.website)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#334155', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Globe size={24} /></div>,
        } : null,
        buildEmailHref(content?.email) ? {
            name: 'อีเมล',
            href: buildEmailHref(content?.email)!,
            icon: <div style={{ width: '48px', height: '48px', backgroundColor: '#F97316', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Mail size={24} /></div>,
        } : null,
    ];

    return items.filter((item): item is ContactLink => Boolean(item));
}

export default function LandingPageClient({ page }: { page: LandingPage }) {
    const [showShareModal, setShowShareModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    
    useEffect(() => {
        if (page.owner_uid) {
            logLandingPageView(page.owner_uid, page.id, page.slug);
        }
    }, [page.id]);

    const logLandingPageView = async (ownerUid: string, pageId: number, pageSlug: string) => {
        try {
            let vid = Cookies.get('vid');
            if (!vid) {
                vid = Math.random().toString(36).substring(2) + Date.now().toString(36);
                Cookies.set('vid', vid, { expires: 365 });
            }

            await fetch(`${API_URL}/analytics/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: ownerUid,
                    action: 'VIEW_LANDING_PAGE',
                    visitorId: vid,
                    metadata: {
                        type: 'landing_page',
                        pageId,
                        slug: pageSlug,
                        referrer: typeof document !== 'undefined' ? document.referrer : '',
                        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                    },
                }),
            });
        } catch (err) {
            console.error('Landing page analytics error:', err);
        }
    };

    const theme = page.theme_config || {};
    const primary = theme.primary_color || '#050579';
    const accent = theme.accent_color || '#F97316';
    const shareUrl = typeof window !== 'undefined'
        ? window.location.href
        : `${SITE_URL}/lp/${page.slug}${page.referral_code ? `?ref=${encodeURIComponent(page.referral_code)}` : ''}`;
    const referralCode = page.referral_code?.trim() || 'ZXQ0KPCR';
    const referralRegisterUrl = `https://nexsolution.cloud/register?ref=${encodeURIComponent(referralCode)}`;
    const baseSans = "var(--font-sans), 'Noto Sans Thai', 'Segoe UI', system-ui, -apple-system, sans-serif";
    const contactBlock = page.content_blocks.find((block) => block.type === 'contact');
    const contactLinks = buildContactLinks(contactBlock?.content);

    return (
        <div style={{ 
            minHeight: '100vh',
            fontFamily: baseSans,
            backgroundColor: '#EFF6FF', 
            color: '#0F172A'
        }}>
            {/* Background decorations */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: 'radial-gradient(circle at top left, rgba(96,165,250,0.22), transparent 34%), radial-gradient(circle at top center, rgba(191,219,254,0.45), transparent 42%), radial-gradient(circle at top right, rgba(249,115,22,0.08), transparent 26%), linear-gradient(180deg, #f8fbff 0%, #eef6ff 48%, #e0f2fe 100%)'
                }} />
                <div style={{ 
                    position: 'absolute', 
                    left: '-8rem', 
                    top: '4rem', 
                    width: '20rem', 
                    height: '20rem', 
                    borderRadius: '9999px', 
                    backgroundColor: 'rgba(125, 211, 252, 0.25)', 
                    filter: 'blur(120px)' 
                }} />
                <div style={{ 
                    position: 'absolute', 
                    right: '-6rem', 
                    top: '8rem', 
                    width: '18rem', 
                    height: '18rem', 
                    borderRadius: '9999px', 
                    backgroundColor: 'rgba(186, 230, 253, 0.3)', 
                    filter: 'blur(110px)' 
                }} />
            </div>

            <div style={{ fontFamily: baseSans }}>
                <ManageTopBar
                    backHref="/manage/landing-pages"
                    subtitle="ระบบจัดการหน้าร้านดิจิทัล"
                    title={page.title || `หน้าร้าน /lp/${page.slug}`}
                />
            </div>

            {/* Main Content */}
            <main style={{ 
                position: 'relative',
                zIndex: 10,
                maxWidth: '56rem',
                margin: '0 auto',
                padding: '7rem 1.5rem 2rem'
            }}>
                {page.content_blocks.filter((block) => block.type !== 'contact').map(block => (
                    <div key={block.id} style={{ marginBottom: '2.5rem' }}>
                        <PublicBlock 
                            block={block} 
                            theme={theme} 
                            isLight={true} 
                            ownerUid={page.owner_uid}
                            pageId={page.id}
                            pageSlug={page.slug}
                            contentBlocks={page.content_blocks}
                            referralCode={referralCode}
                        />
                    </div>
                ))}

                {/* QR Code and Social Sharing Section - ALWAYS VISIBLE */}
                <div style={{ 
                    marginTop: '5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    paddingBottom: '3rem'
                }}>
                    {/* QR Code Box */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem 1.5rem 1.25rem',
                        borderRadius: '32px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                        border: '1px solid #dbe4ff',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: '#94A3B8',
                            marginBottom: '0.85rem'
                        }}>
                            QR Code
                        </div>
                        <QrCodeImage url={shareUrl} size={180} />
                        <QrCodeDownloadActions
                            qrValue={shareUrl}
                            fileBaseName={`landing-page-${page.slug}`}
                            titleLine="QR Code"
                            nameLine={page.title}
                            className="mt-4"
                        />
                    </div>
                    
                    {/* QR Label */}
                    <p style={{
                        fontSize: '14px',
                        fontWeight: 900,
                        color: '#94A3B8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        marginBottom: '2rem'
                    }}>
                        สแกนเพื่อเข้าชมหน้าร้าน
                    </p>

                    {contactLinks.length > 0 ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            <button 
                                onClick={() => setShowContactModal(true)}
                                style={{
                                    height: '3.5rem',
                                    padding: '0 1.5rem',
                                    backgroundColor: '#FFFFFF',
                                    color: '#050579',
                                    borderRadius: '9999px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <MessageSquare size={20} />
                                <span>{contactBlock?.content?.title || 'ช่องทางติดต่อ'}</span>
                            </button>
                        </div>
                    ) : null}

                    {/* Share Button */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '4rem'
                    }}>
                        {/* Share / Copy Link */}
                        <button 
                            onClick={() => setShowShareModal(true)}
                            style={{
                                height: '3.5rem',
                                padding: '0 1.5rem',
                                backgroundColor: '#FFFFFF',
                                color: '#050579',
                                borderRadius: '9999px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(0,0,0,0.05)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            <Share2 size={20} />
                            <span>แชร์หน้านี้</span>
                        </button>
                    </div>

                    {/* Footer - ALWAYS VISIBLE */}
                    <footer style={{
                        width: '100%',
                        paddingTop: '2.5rem',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        opacity: 1
                    }}>
                        <p style={{
                            margin: 0,
                            textAlign: 'center',
                            fontSize: '14px',
                            fontWeight: 400,
                            lineHeight: '1.75rem',
                            color: '#64748B'
                        }}>
                            © NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด KHRAM INTELLIGENT AI Co., Ltd.
                        </p>
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <a
                                href={referralRegisterUrl}
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: '#050579',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '4px',
                                }}
                            >
                                สนใจระบบแบบที่คุณเห็นอยู่นี้ คลิกที่นี่
                            </a>
                        </div>
                    </footer>
                </div>
            </main>

            <ShareModal 
                isOpen={showShareModal} 
                onClose={() => setShowShareModal(false)} 
                url={shareUrl} 
                title={page.title} 
            />
            <ContactModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                title={contactBlock?.content?.title || 'ช่องทางติดต่อ'}
                description={contactBlock?.content?.description}
                links={contactLinks}
            />
        </div>
    );
}

function ContactModal({
    isOpen,
    onClose,
    title,
    description,
    links,
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    links: ContactLink[];
}) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '32px',
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem 2rem',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                animation: 'modalFadeIn 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem', color: '#050579', textAlign: 'center' }}>{title}</h3>
                {description ? (
                    <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#64748B', textAlign: 'center', marginBottom: '1.75rem' }}>
                        {description}
                    </p>
                ) : null}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    {links.map(link => (
                        <a
                            key={link.name}
                            href={link.href}
                            target={link.href.startsWith('tel:') || link.href.startsWith('mailto:') ? undefined : '_blank'}
                            rel={link.href.startsWith('tel:') || link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
                        >
                            {link.icon}
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', textAlign: 'center' }}>{link.name}</span>
                        </a>
                    ))}
                </div>

                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '12px', cursor: 'pointer', color: '#64748B', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}

function ShareModal({ isOpen, onClose, url, title }: { isOpen: boolean, onClose: () => void, url: string, title: string }) {
    if (!isOpen) return null;

    const shareLinks = [
        {
            name: 'LINE',
            icon: (
                <div style={{ width: '48px', height: '48px', backgroundColor: '#06C755', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <LineIcon size={28} />
                </div>
            ),
            href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
        },
        {
            name: 'Facebook',
            icon: (
                <div style={{ width: '48px', height: '48px', backgroundColor: '#1877F2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Facebook size={28} fill="currentColor" />
                </div>
            ),
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        },
        {
            name: 'Twitter',
            icon: (
                <div style={{ width: '48px', height: '48px', backgroundColor: '#000000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Twitter size={24} fill="currentColor" />
                </div>
            ),
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        }
    ];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '32px',
                width: '100%',
                maxWidth: '420px',
                padding: '2.5rem 2rem',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                animation: 'modalFadeIn 0.3s ease-out'
            }} onClick={e => e.stopPropagation()}>
                <style>{`
                    @keyframes modalFadeIn {
                        from { opacity: 0; transform: translateY(20px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem', color: '#050579', textAlign: 'center' }}>แชร์หน้านี้</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    {shareLinks.map(link => (
                        <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                            {link.icon}
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>{link.name}</span>
                        </a>
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 0.75rem 0.75rem 1.25rem',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '20px',
                    border: '1px solid #E2E8F0'
                }}>
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                        {url}
                    </div>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(url);
                            alert('คัดลอกลิงก์สำเร็จ!');
                        }}
                        style={{ 
                            backgroundColor: '#050579', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '14px', 
                            padding: '0.6rem 1.2rem', 
                            fontSize: '12px', 
                            fontWeight: 800, 
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        คัดลอก
                    </button>
                </div>

                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#F1F5F9', border: 'none', borderRadius: '12px', cursor: 'pointer', color: '#64748B', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}

function PublicBlock({ block, theme, isLight, ownerUid, pageId, pageSlug, contentBlocks, referralCode }: { block: Block, theme: any, isLight: boolean, ownerUid?: string, pageId: number, pageSlug: string, contentBlocks: Block[], referralCode?: string }) {
    const primary = theme.primary_color || '#050579';
    const accent = theme.accent_color || '#F97316';
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    switch (block.type) {
        case 'text':
            return (
                <div style={{ maxWidth: '48rem', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                    <h2 style={{ 
                        fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.025em',
                        marginBottom: '1.5rem',
                        lineHeight: 1.1,
                        color: '#050579'
                    }}>
                        {block.content.title}
                    </h2>
                    <p style={{
                        fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                        lineHeight: 1.625,
                        whiteSpace: 'pre-wrap',
                        fontWeight: 500,
                        maxWidth: '42rem',
                        margin: '0 auto',
                        color: '#475569'
                    }}>
                        {block.content.body}
                    </p>
                </div>
            );
        case 'image':
            const imageUrl = block.content.url;
            const hasImage = imageUrl && imageUrl.length > 0;
            const imageLink = normalizeUrl(block.content.link);
            
            return (
                <div style={{ maxWidth: '56rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        backgroundColor: 'white'
                    }}>
                        {hasImage ? (
                            imageLink ? (
                                <a href={imageLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                    <img src={imageUrl} alt="Campaign visual" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                </a>
                            ) : (
                                <img src={imageUrl} alt="Campaign visual" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            )
                        ) : (
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                padding: '5rem 2rem',
                                minHeight: '300px'
                            }}>
                                <div style={{
                                    width: '5rem',
                                    height: '5rem',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    backgroundColor: `${primary}10`
                                }}>
                                    <ImageIcon size={40} style={{ color: primary }} />
                                </div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#9CA3AF' }}>
                                    ยังไม่มีรูปภาพ
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'video': {
            const videoConfig = block.content.video_config || {};
            const url = block.content.url || videoConfig.url;
            // Force disable autoplay for all videos to ensure sound is available and browser policies don't block audio
            const autoplay = false;
            
            const isEmbed = isEmbedableVideo(url);
            const embedUrl = isEmbed ? getEmbedUrl(url) : '';
            
            const getFullUrl = (val?: string) => {
                if (!val) return '';
                if (val.startsWith('http')) return val;
                if (val.startsWith('/api')) return val;
                return `${API_URL}${val}`;
            };

            const videoUrl = getFullUrl(url);
            const hasVideo = !!url;
            const videoLink = normalizeUrl((block.content as any).link) || normalizeUrl(videoConfig?.link_url);
            const showCenteredPlayButton = hasVideo && !isEmbed && !autoplay && !isVideoPlaying;

            const handlePlayClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
                event.preventDefault();
                event.stopPropagation();
                if (!videoRef.current) return;
                try {
                    await videoRef.current.play();
                    setIsVideoPlaying(true);
                } catch (error) {
                    console.error('Unable to start video playback:', error);
                }
            };
            
            return (
                <div style={{ width: '100%', maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto' }}>
                    <div style={{ 
                        position: 'relative', 
                        width: '100%',
                        backgroundColor: '#000', 
                        borderRadius: '24px', 
                        overflow: 'hidden', 
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        aspectRatio: isEmbed ? '16/9' : 'auto'
                    }}>
                        {!hasVideo ? (
                            <div style={{ 
                                paddingBottom: '56.25%',
                                position: 'relative',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: '#fff', 
                                fontSize: '1.25rem',
                                textDecoration: 'none'
                             }}>
                                <span style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>ยังไม่มีวิดีโอ</span>
                            </div>
                        ) : !isEmbed ? (
                            videoLink ? (
                                <a href={videoLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                    <video
                                        ref={videoRef}
                                        src={videoUrl}
                                        autoPlay={false}
                                        muted={false}
                                        loop
                                        playsInline
                                        controls={true}
                                        onPlay={() => setIsVideoPlaying(true)}
                                        onPause={() => setIsVideoPlaying(false)}
                                        onEnded={() => setIsVideoPlaying(false)}
                                        style={{ 
                                            width: '100%', 
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                </a>
                            ) : (
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    autoPlay={false}
                                    muted={false}
                                    loop
                                    playsInline
                                    controls={true}
                                    onPlay={() => setIsVideoPlaying(true)}
                                    onPause={() => setIsVideoPlaying(false)}
                                    onEnded={() => setIsVideoPlaying(false)}
                                    style={{ 
                                        width: '100%', 
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                            )
                        ) : (
                            <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
                                {videoLink ? (
                                    <a href={videoLink} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                        <iframe
                                            src={embedUrl}
                                            title="Video content"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ 
                                                position: 'absolute', 
                                                top: 0, 
                                                left: 0, 
                                                width: '100%', 
                                                height: '100%' 
                                            }}
                                        />
                                    </a>
                                ) : (
                                    <iframe
                                        src={embedUrl}
                                        title="Video content"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={{ 
                                            position: 'absolute', 
                                            top: 0, 
                                            left: 0, 
                                            width: '100%', 
                                            height: '100%' 
                                        }}
                                    />
                                )}
                            </div>
                        )}
                        {showCenteredPlayButton && (
                            <button
                                type="button"
                                aria-label="Play video"
                                onClick={handlePlayClick}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '86px',
                                    height: '86px',
                                    borderRadius: '9999px',
                                    border: 'none',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    color: '#0F172A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 16px 35px rgba(15, 23, 42, 0.35)',
                                    zIndex: 20
                                }}
                            >
                                <Play size={36} style={{ marginLeft: '4px' }} />
                            </button>
                        )}
                    </div>
                    
                    {/* Add "Try system" button specifically for page ID 42 */}
                    {pageId === 42 && (
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <a 
                                href={`https://nexsolution.cloud/register?ref=${encodeURIComponent(referralCode || 'ZXQ0KPCR')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1.25rem 2.5rem',
                                    backgroundColor: '#F97316',
                                    color: 'white',
                                    borderRadius: '24px',
                                    fontWeight: 900,
                                    fontSize: '1.25rem',
                                    textDecoration: 'none',
                                    boxShadow: '0 20px 40px rgba(249,115,22,0.3)',
                                    border: '2px solid rgba(255,255,255,0.1)'
                                }}
                            >
                                ทดลองใช้ระบบ <ChevronRight size={24} />
                            </a>
                        </div>
                    )}
                </div>
            );
        }
        case 'location':
            return (
                <div style={{ maxWidth: '48rem', margin: '0 auto', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '24px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        {block.content.embed_url ? (
                            <div style={{ 
                                width: '100%', 
                                height: '350px', 
                                borderRadius: '25px', 
                                overflow: 'hidden',
                                border: '1px solid #F1F5F9'
                            }}>
                                <iframe
                                    src={block.content.embed_url}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </div>
                        ) : (
                            <div style={{ 
                                width: '100%', 
                                height: '200px', 
                                backgroundColor: '#F8FAFC', 
                                borderRadius: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed #E2E8F0'
                            }}>
                                <MapPin size={40} style={{ color: '#CBD5E1' }} />
                            </div>
                        )}
                        
                        {(block.content.address || block.content.map_url) && (
                            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                                {block.content.address && (
                                    <h3 style={{ 
                                        fontSize: '20px', 
                                        fontWeight: 900, 
                                        color: '#050579', 
                                        marginBottom: '1rem',
                                        lineHeight: 1.4
                                    }}>
                                        {block.content.address}
                                    </h3>
                                )}
                                {block.content.map_url && (
                                    <a
                                        href={block.content.map_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '1.25rem 2.5rem',
                                            backgroundColor: '#050579',
                                            color: 'white',
                                            borderRadius: '18px',
                                            fontWeight: 900,
                                            fontSize: '1rem',
                                            textDecoration: 'none',
                                            boxShadow: '0 10px 20px rgba(5,5,121,0.2)'
                                        }}
                                    >
                                        <MapPin size={20} /> กดที่นี่เพื่อเข้าสู่การนำทาง
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        case 'button':
            const btnUrl = normalizeUrl(block.content.link) || normalizeUrl(block.content.url);
            const buttonLabel = block.content.text || block.content.label || 'ดูรายละเอียด';
            return (
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 10, padding: '1rem 0' }}>
                    {btnUrl ? (
                        <a 
                            href={btnUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.5rem 3rem',
                                borderRadius: '20px',
                                fontWeight: 900,
                                fontSize: '1.25rem',
                                boxShadow: '0 20px 40px rgba(249,115,22,0.3)',
                                backgroundColor: accent,
                                color: '#fff',
                                textDecoration: 'none'
                            }}
                        >
                            {buttonLabel} <ChevronRight size={28} />
                        </a>
                    ) : (
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.5rem 3rem',
                                borderRadius: '20px',
                                fontWeight: 900,
                                fontSize: '1.25rem',
                                boxShadow: '0 20px 40px rgba(249,115,22,0.18)',
                                backgroundColor: accent,
                                color: '#fff',
                                opacity: 0.8
                            }}
                        >
                            {buttonLabel} <ChevronRight size={28} />
                        </div>
                    )}
                </div>
            );
        case 'form':
            if (block.content?.mode === 'external') {
                const externalUrl =
                    typeof block.content?.external_url === 'string' && block.content.external_url.trim()
                        ? block.content.external_url.trim()
                        : typeof block.content?.url === 'string'
                        ? block.content.url.trim()
                        : '';
                return (
                    <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
                        <div style={{
                            padding: '3rem 2rem',
                            borderRadius: '28px',
                            textAlign: 'center',
                            border: '1px solid rgba(0,0,0,0.05)',
                            backgroundColor: 'white',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                        }}>
                            <MessageSquare size={48} style={{ margin: '0 auto 2rem', color: '#050579' }} />
                            <h3 style={{ 
                                fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                                fontWeight: 900,
                                marginBottom: '1.5rem',
                                letterSpacing: '-0.025em',
                                color: '#050579'
                            }}>{block.content?.title || 'ติดต่อเราทันที'}</h3>
                            <p style={{ 
                                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                                marginBottom: '3rem',
                                color: '#6B7280'
                            }}>{block.content?.description || 'เราพร้อมเป็นส่วนหนึ่งในความสำเร็จของคุณ กรุณากรอกรายละเอียดเพื่อรับข้อเสนอพิเศษ'}</p>
                            {externalUrl ? (
                                <a 
                                    href={externalUrl} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1.5rem 3rem',
                                        fontWeight: 900,
                                        borderRadius: '20px',
                                        fontSize: '1.25rem',
                                        backgroundColor: '#050579',
                                        color: 'white',
                                        textDecoration: 'none'
                                    }}
                                >
                                    Open Contact Form <ExternalLink size={24} />
                                </a>
                            ) : (
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '1.5rem 3rem',
                                        fontWeight: 900,
                                        borderRadius: '20px',
                                        fontSize: '1.25rem',
                                        backgroundColor: '#94A3B8',
                                        color: 'white',
                                        opacity: 0.8
                                    }}
                                >
                                    กรุณาตั้งค่า URL ฟอร์ม <ExternalLink size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            return (
                <InternalLandingForm 
                    block={block} 
                    isLight={isLight} 
                    ownerUid={ownerUid} 
                    pageId={pageId} 
                    pageSlug={pageSlug} 
                />
            );
        case 'contact':
            return null;
        default:
            return null;
    }
}

function InternalLandingForm({ block, isLight, ownerUid, pageId, pageSlug }: { block: Block, isLight: boolean, ownerUid?: string, pageId: number, pageSlug: string }) {
    const [formConfig, setFormConfig] = useState<PublicFormConfig | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [values, setValues] = useState<Record<string, any>>({});
    const [consent, setConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        const loadFormConfig = async () => {
            if (block.content.mode !== 'internal' || !block.content.form_id) {
                setFormConfig(null);
                setValues({});
                return;
            }

            try {
                setFormLoading(true);
                const res = await fetch(`${API_URL}/public/forms/${block.content.form_id}`);
                if (!res.ok) {
                    throw new Error('ไม่สามารถโหลดฟอร์มได้');
                }
                const data = await res.json();
                if (ignore) return;
                setFormConfig(data);

                const nextValues: Record<string, any> = {};
                (data.fields || []).forEach((field: FormFieldConfig) => {
                    nextValues[field.id] = field.type === 'checkbox' ? false : '';
                });
                setValues(nextValues);
            } catch {
                if (ignore) return;
                setFormConfig(null);
                setValues({});
            } finally {
                if (!ignore) setFormLoading(false);
            }
        };

        void loadFormConfig();
        return () => {
            ignore = true;
        };
    }, [block.content.form_id, block.content.mode]);

    const handleValueChange = (fieldId: string, value: any) => {
        setValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const visibleFields: FormFieldConfig[] = formConfig?.fields?.length
        ? formConfig.fields
        : [
            { id: 'name', type: 'text', label: 'ชื่อ-นามสกุล', placeholder: 'กรอกชื่อ-นามสกุล', required: true },
            { id: 'email', type: 'email', label: 'อีเมล', placeholder: 'กรอกอีเมล', required: false },
            { id: 'phone', type: 'phone', label: 'เบอร์โทรศัพท์', placeholder: 'กรอกเบอร์โทรศัพท์', required: false },
            { id: 'message', type: 'textarea', label: 'รายละเอียด', placeholder: 'กรอกรายละเอียดที่ต้องการสอบถาม', required: false },
        ];

    const validateDynamicFields = () => {
        for (const field of visibleFields) {
            const currentValue = values[field.id];
            if (field.required) {
                if (field.type === 'checkbox') {
                    if (!currentValue) return `กรุณายืนยัน "${field.label}"`;
                } else if (currentValue === undefined || currentValue === null || String(currentValue).trim() === '') {
                    return `กรุณากรอก "${field.label}" ให้ครบถ้วน`;
                }
            }

            if (field.type === 'email' && currentValue) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(String(currentValue))) {
                    return 'รูปแบบอีเมลไม่ถูกต้อง';
                }
            }
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ownerUid) return;

        if (block.content.mode === 'internal' && !block.content.form_id) {
            setError('ฟอร์มนี้ยังไม่ได้กำหนดค่า (ยังไม่ได้เลือกฟอร์มจากระบบ)');
            return;
        }

        const validationError = validateDynamicFields();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!consent) {
            setError('กรุณายืนยันการยินยอมให้จัดเก็บข้อมูล (PDPA)');
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const endpoint = `${API_URL}/public/forms/${block.content.form_id}/submit`;
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: values,
                    source: { referrer: pageSlug, utm_source: 'landing_page' },
                }),
            });
            if (!res.ok) throw new Error('ส่งข้อมูลไม่สำเร็จ');

            try {
                let vid = Cookies.get('vid');
                if (!vid) {
                    vid = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    Cookies.set('vid', vid, { expires: 365 });
                }
                await fetch(`${API_URL}/analytics/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid: ownerUid,
                        action: 'SUBMIT_LANDING_FORM',
                        visitorId: vid,
                        metadata: { type: 'landing_page_form', pageId, slug: pageSlug },
                    }),
                });
            } catch {}

            setSuccess(block.content.thank_you_message || 'ขอบคุณสำหรับการติดต่อ ทีมงานจะติดต่อกลับโดยเร็วที่สุด');
            const resetValues: Record<string, any> = {};
            visibleFields.forEach((field) => {
                resetValues[field.id] = field.type === 'checkbox' ? false : '';
            });
            setValues(resetValues);
            setConsent(false);

            if (block.content.redirect_url) {
                const delaySec = typeof block.content.redirect_delay === 'number' ? block.content.redirect_delay : 3;
                setTimeout(() => { window.location.href = block.content.redirect_url; }, delaySec * 1000);
            }
        } catch (err: any) {
            setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        } finally {
            setSubmitting(false);
        }
    };

    if (block.content.mode === 'internal' && !block.content.form_id) {
        return (
            <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
                <div style={{
                    padding: '3rem 2rem',
                    borderRadius: '28px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    backgroundColor: 'white',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}>
                    <MessageSquare size={40} style={{ margin: '0 auto 1rem', color: '#D1D5DB' }} />
                    <p style={{ color: '#9CA3AF', fontWeight: 500 }}>ฟอร์มนี้ยังไม่ได้เลือกรายการจากระบบ</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '48rem', margin: '0 auto', position: 'relative', zIndex: 20 }}>
            <div style={{
                padding: '3rem 2rem',
                borderRadius: '28px',
                border: '1px solid rgba(0,0,0,0.05)',
                backgroundColor: 'white',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                <MessageSquare size={48} style={{ margin: '0 auto 2rem', color: '#050579' }} />
                <h3 style={{
                    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                    fontWeight: 900,
                    marginBottom: '1.5rem',
                    letterSpacing: '-0.025em',
                    textAlign: 'center',
                    color: '#050579'
                }}>{block.content.title || formConfig?.name || 'ติดต่อเราทันที'}</h3>
                {(block.content.description || formConfig?.description) ? (
                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                        marginBottom: '1.5rem',
                        color: '#6B7280',
                        textAlign: 'center',
                        lineHeight: 1.7
                    }}>
                        {block.content.description || formConfig?.description}
                    </p>
                ) : null}

                {success ? (
                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        textAlign: 'center',
                        color: '#16A34A',
                        fontWeight: 700
                    }}>
                        {success}
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {formLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: '#64748B', padding: '2rem 0' }}>
                                <Loader2 className="animate-spin" size={18} />
                                <span>กำลังโหลดฟอร์ม...</span>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {visibleFields.map((field) => (
                                    <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                        {field.type !== 'checkbox' ? (
                                            <label style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginLeft: '4px' }}>
                                                {field.label}
                                                {field.required ? ' *' : ''}
                                            </label>
                                        ) : null}
                                        {renderLandingFormField(field, values[field.id], handleValueChange)}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.5rem' }}>
                            <input
                                id={`pdpa-consent-${block.id}`}
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                style={{ marginTop: '4px', width: '1.25rem', height: '1.25rem', accentColor: '#050579' }}
                            />
                            <label htmlFor={`pdpa-consent-${block.id}`} style={{ fontSize: '13px', fontWeight: 500, color: '#475569', lineHeight: 1.5 }}>
                                ฉันยินยอมให้จัดเก็บและใช้ข้อมูลนี้เพื่อการติดต่อกลับตามนโยบายความเป็นส่วนตัว (PDPA)
                            </label>
                        </div>
                        {error ? <p style={{ fontSize: '14px', color: '#DC2626', fontWeight: 700, textAlign: 'center' }}>{error}</p> : null}
                        <div style={{ paddingTop: '1rem' }}>
                            <button
                                type="submit"
                                disabled={submitting || formLoading || !ownerUid}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    fontWeight: 900,
                                    borderRadius: '32px',
                                    fontSize: '1.25rem',
                                    backgroundColor: '#050579',
                                    color: 'white',
                                    border: 'none',
                                    cursor: submitting || formLoading || !ownerUid ? 'not-allowed' : 'pointer',
                                    opacity: submitting || formLoading || !ownerUid ? 0.5 : 1,
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                                }}
                            >
                                {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อมูลให้ทีมงานติดต่อกลับ'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
