import { getProfile } from '../../../lib/api';
import { notFound } from 'next/navigation';
import { AlertTriangle, Phone, Mail, Globe, Heart, User, Building2, ExternalLink, Briefcase } from 'lucide-react';

// Helper function to ensure URL has protocol
function ensureHttps(url: string): string {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    return `https://${trimmed}`;
}
import { QrCodeImage } from '../../../components/QrCode';
import { ProfilePageClient } from '../../../components/ProfilePageClient';
import { VideoEmbed } from '../../../components/VideoEmbed';
import { Gallery } from '../../../components/Gallery';
import { SocialLinksDisplay } from '../../../components/SocialLinksDisplay';
import { AnalyticsTracker } from '../../../components/AnalyticsTracker';
import { VcfDownloadButton } from '../../../components/VcfDownload';

import { SaveToHomeButton } from '../../../components/SaveToHomeButton';
import { QrCodeDownloadActions } from '../../../components/QrCodeDownloadActions';
import { Metadata } from 'next';
import { formatPhoneNumber } from '../../../lib/phone-utils';

// Helper function for metadata since we can't share it easily with the component
const getImageUrlBase = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return url;
};

const getThumbUrlBase = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    if (url.startsWith('/uploads')) {
        const parts = url.split('/');
        const filename = parts.pop();
        return `${API_URL}${parts.join('/')}/thumb_${filename}`;
    }
    return url;
};

export async function generateMetadata({ params }: { params: Promise<{ prefix: string; uid: string }> }): Promise<Metadata> {
    const { prefix, uid } = await params;
    const data = await getProfile(uid);
    if (!data) return { title: 'Not Found | NEX Solution' };

    const displayName = data.names_i18n?.find((n: any) => n.value?.trim())?.value || data.full_name || 'NEX Digital Card';
    const profileImageUrl = getImageUrlBase(data.profile_pic_url);
    const thumbUrl = getThumbUrlBase(data.profile_pic_url);
    const fallbackIconUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/nex_logo_nobg.png`;
    const iconUrl = thumbUrl || profileImageUrl || fallbackIconUrl;

    return {
        title: displayName,
        description: data.about_me || `Digital card for ${displayName}`,
        manifest: `/${prefix}/${uid}/manifest`,
        icons: {
            icon: [
                { url: '/favicon.ico' },
                { url: iconUrl, sizes: '192x192', type: 'image/png' },
            ],
            apple: [
                { url: iconUrl, sizes: '180x180', type: 'image/png' },
            ],
        },
        openGraph: {
            title: displayName,
            description: data.about_me || `Digital card for ${displayName}`,
            images: profileImageUrl ? [{ url: profileImageUrl }] : [],
        },
        other: {
            'mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'black-translucent',
            'apple-mobile-web-app-title': displayName,
        }
    };
}

export default async function ProfilePage({ params }: { params: Promise<{ prefix: string; uid: string }> }) {
    const { prefix, uid } = await params;
    const data = await getProfile(uid);

    if (!data) {
        notFound();
    }

    // Validate URL Prefix for security
    // Only enforced if user has a prefix set (legacy support or strict?)
    // User requested "prevent guessing", so strict.
    if (data.url_prefix && data.url_prefix !== prefix) {
        notFound();
    }
    // If data.url_prefix is empty/null, and user navigated to /someprefix/uid, what then?
    // If user has NO prefix, maybe accept any? Or fail?
    // Best to enforce. I will populate prefixes.
    // If data.url_prefix is missing, we might 404.
    if (!data.url_prefix && prefix) {
        // Allow for now or generate one?
        // Let's assume all users will have one.
    }

    // Extract data - handle both old and new schema
    const {
        is_active,
        expiration_date,
        feature_config,
        names_i18n = [],
        positions_i18n = [],
        companies_i18n = [],
        emails = [],
        phones = [],
        profile_pic_url,
        logo,
        banners = [],
        websites = [],
        about_me,
        interests = [],
        layout_config,
        social_links_json = [],
        video_url,
        backgrounds = [],
        gallery = [],
        full_name,
        position,
        company_name,
        profile_pic_position,
        qr_enabled,
    } = data;

    // Calculate Expiry
    const now = new Date();
    const expDate = expiration_date ? new Date(expiration_date) : null;
    const isExpired = !is_active || (expDate && expDate < now);

    // Get display values
    // Get display values
    const displayName = names_i18n?.find((n: any) => n.value?.trim())?.value || full_name || 'Unknown User';
    const displayPositions = positions_i18n?.filter((p: any) => p.value?.trim()) || [];
    if (displayPositions.length === 0 && position) {
        displayPositions.push({ value: position });
    }
    const displayPosition = displayPositions[0]?.value || '';
    const displayCompanies = companies_i18n?.filter((c: any) => c.value?.trim()) || [];
    if (displayCompanies.length === 0 && company_name) {
        displayCompanies.push({ value: company_name });
    }
    const displayCompany = displayCompanies[0]?.value || '';
    const profilePosition = layout_config?.profile_position || 'center';

    // Get profile image URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) return `${API_URL}${url}`;
        return url;
    };

    const getThumbUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        if (url.startsWith('/uploads')) {
            const parts = url.split('/');
            const filename = parts.pop();
            return `${API_URL}${parts.join('/')}/thumb_${filename}`;
        }
        return url;
    };

    const profileImageUrl = getImageUrl(profile_pic_url || '');
    const profileThumbUrl = getThumbUrl(profile_pic_url || '');
    const logoUrl = logo?.url ? getImageUrl(logo.url) : '';
    const profileUrl = `${SITE_URL}/${data.url_prefix}/${uid}`;
    const primaryPhone = formatPhoneNumber(
        phones?.find((phone: any) => phone?.value?.trim())?.value || ''
    );
    const referralCode = typeof data.referral_code === 'string' && data.referral_code.trim()
        ? data.referral_code.trim()
        : 'ZXQ0KPCR';
    const referralRegisterUrl = `https://nexsolution.cloud/register?ref=${encodeURIComponent(referralCode)}`;

    // Theme Configuration (locked to profile owner's layout_config)
    const theme = layout_config || {};
    const lightMode = theme.display_theme !== 'dark';
    const primary = theme.primary_color || '#6366F1';
    const font = theme.font_family || 'Inter';

    const backgroundBase = lightMode ? '#EEF0FF' : '#06111f';
    const surfaceColor = lightMode ? 'rgba(255,255,255,0.84)' : 'rgba(8,22,39,0.82)';
    const borderColor = lightMode ? 'rgba(5,5,121,0.08)' : 'rgba(191,219,254,0.14)';
    const mutedText = lightMode ? 'rgba(15,23,42,0.68)' : 'rgba(226,232,240,0.72)';

    const themeStyles = {
        '--primary': primary,
        '--background': backgroundBase,
        '--foreground': lightMode ? '#0F172A' : '#F8FAFC',
        '--glass': surfaceColor,
        '--glass-border': borderColor,
        backgroundColor: backgroundBase,
        color: lightMode ? '#0F172A' : '#F8FAFC',
        fontFamily: `"${font}", sans-serif`,
    } as React.CSSProperties;

    const fontName = font.replace(/\s/g, '+');

    // Extract video config
    const videoConfig = data.video_config || (video_url ? { url: video_url, enabled: true, autoplay: false, link_enabled: false } : null);

    // Background Image Logic
    const bgImage = backgrounds?.[0]?.url ? getImageUrl(backgrounds[0].url) : null;

    // Filter banners by position
    const topBanners = (banners?.filter((b: any) => (b.display_position || 'top') === 'top') || []).slice(0, 1);
    const bottomBanners = (banners?.filter((b: any) => b.display_position === 'bottom') || []).slice(0, 1);

    // Single Banner Component
    const BannerItem = ({ banner, index }: { banner: any; index: number }) => {
        const imgUrl = getImageUrl(banner.url);
        const height = banner.height || '320px';
        const hasLink = banner.link_url && banner.link_url.trim() !== '';

        const content = (
            <>
                <img
                    src={imgUrl}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                        objectPosition: `center ${banner.position?.y ?? 50}%`,
                        transform: `scale(${(banner.scale ?? 1) + 0.05})`,
                        transformOrigin: 'center center'
                    }}
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent"></div>
                {/* Vignette Effect */}
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]"></div>
            </>
        );

        if (hasLink) {
            return (
                <a
                    href={banner.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-full z-10 overflow-hidden block cursor-pointer hover:opacity-95 transition-opacity"
                    style={{ height }}
                >
                    {content}
                </a>
            );
        }

        return (
            <div
                className="relative w-full z-10 overflow-hidden"
                style={{ height }}
            >
                {content}
            </div>
        );
    };

    const topBannersSection = topBanners.length > 0 ? (
        <div className="space-y-0">
            {topBanners.map((banner: any, i: number) => (
                <BannerItem key={i} banner={banner} index={i} />
            ))}
        </div>
    ) : null;

    const bottomBannersSection = bottomBanners.length > 0 ? (
        <div className="space-y-0">
            {bottomBanners.map((banner: any, i: number) => (
                <BannerItem key={i} banner={banner} index={i} />
            ))}
        </div>
    ) : null;

    return (
        <ProfilePageClient profileData={data}>
            <AnalyticsTracker uid={uid} />
            <link href={`https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;700;900&display=swap`} rel="stylesheet" />
            
            <main
                id="profile-capture"
                className={`relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-500 ${isExpired ? 'grayscale pointer-events-none select-none' : ''}`}
                style={{ ...themeStyles, fontFamily: `"${font}", sans-serif` }}
            >
                <div className="pointer-events-none absolute inset-0">
                    {bgImage ? (
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,17,31,0.28)_0%,rgba(6,17,31,0.78)_100%)]" />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.1),transparent_22%),linear-gradient(180deg,#f7f9ff_0%,#eef0ff_46%,#e8eefc_100%)]" />
                            <div className="absolute left-[-6rem] top-10 h-64 w-64 rounded-full bg-sky-300/20 blur-[110px]" />
                            <div className="absolute right-[-6rem] top-32 h-72 w-72 rounded-full bg-orange-200/25 blur-[120px]" />
                            <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#050579]/8 blur-[140px]" />
                        </>
                    )}
                </div>

                {/* Background Image Layer */}
                {bgImage && (
                    <div className="fixed inset-0 z-0">
                        <img
                            src={bgImage}
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                        {/* Stronger overlay for better text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90"></div>
                    </div>
                )}

                {/* Expiry Overlay */}
                {isExpired && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
                        <div className="bg-black/80 absolute inset-0 backdrop-blur-sm"></div>
                        <div className="bg-zinc-900 border border-red-500/50 p-8 rounded-2xl relative z-10 max-w-md text-center shadow-2xl shadow-red-900/20">
                            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">Account Suspended</h2>
                            <p className="text-gray-400 mb-6">บัญชีนี้หมดอายุการใช้งานหรือถูกระงับ กรุณาติดต่อเจ้าหน้าที่เพื่อต่ออายุ</p>
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all w-full">
                                ต่ออายุทันที (Renewal)
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile View Wrapper */}
                <div className="relative mx-auto min-h-screen w-full max-w-[560px]">
                    {/* Top Banners */}
                    {topBannersSection}

                {/* Main Content */}
                <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10">
                    <div className="rounded-[34px] border px-4 py-5 shadow-[0_35px_80px_-55px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:px-5" style={{ backgroundColor: surfaceColor, borderColor }}>

                    {/* Profile Section - Banner Style */}
                    <section className={`relative mb-10 flex flex-col items-center gap-6 ${topBanners.length > 0 ? '-mt-20 sm:-mt-24' : ''}`}>
                        {/* Profile Image - Full Width Banner */}
                        <div className={`relative w-full ${topBanners.length > 0 ? 'z-10' : ''}`}>
                            <div className="relative w-full aspect-square max-w-[360px] mx-auto rounded-[28px] bg-foreground/5 overflow-hidden sm:max-w-full sm:h-auto">
                                {profileImageUrl ? (
                                    <>
                                        <img
                                            src={profileImageUrl}
                                            alt={displayName}
                                            className="w-full h-full object-cover"
                                            style={{
                                                objectPosition: `${profile_pic_position?.x ?? 50}% ${profile_pic_position?.y ?? 50}%`,
                                                transform: `scale(${profile_pic_position?.scale ?? 1})`,
                                                transformOrigin: 'center center'
                                            }}
                                        />
                                        {/* Gradient Overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,17,31,0.78)] via-[rgba(6,17,31,0.18)] to-transparent"></div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.18)] via-transparent to-transparent"></div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-foreground/30">
                                        <User size={96} />
                                    </div>
                                )}
                                {/* Logo Badge Premium */}
                                {logoUrl && (
                                    <div className="absolute left-[83.333%] top-[16.667%] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-transparent p-1.5 sm:h-24 sm:w-24">
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain scale-110" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className={`flex w-full flex-col ${profilePosition === 'center' ? 'items-center text-center' : 'items-start text-left'}`}>
                            {/* Positions (Job Titles) */}
                            {displayPositions.length > 0 && (
                                <div className={`mb-4 flex w-full flex-col gap-2 ${profilePosition === 'center' ? 'items-center' : 'items-start'}`}>
                                    {displayPositions.map((pos: any, i: number) => (
                                        <div 
                                            key={i} 
                                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] ${i === 0 ? 'text-[#050579]' : 'text-[#F97316]'}`}
                                            style={{ backgroundColor: lightMode ? 'rgba(255,255,255,0.72)' : 'rgba(8,22,39,0.74)', borderColor }}
                                        >
                                            <Briefcase size={14} />
                                            {pos.value}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Names */}
                            <div className={`mb-5 flex w-full flex-col gap-3 ${profilePosition === 'center' ? 'items-center' : 'items-start'}`}>
                                <h1 className="text-[38px] font-black leading-tight tracking-tight text-foreground sm:text-[48px]">
                                    {displayName}
                                </h1>
                                
                                {names_i18n?.length > 1 && (
                                    <div className="flex flex-col gap-2">
                                        {names_i18n.slice(1).map((name: any, i: number) => (
                                            <h2 key={i} className="text-lg font-medium tracking-wide text-foreground/65 sm:text-xl">
                                                {name.value}
                                            </h2>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Companies */}
                            {displayCompanies.length > 0 && (
                                <div className={`flex w-full flex-col gap-3 ${profilePosition === 'center' ? 'items-center' : 'items-start'}`}>
                                    {displayCompanies.map((comp: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 text-foreground/75">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border" style={{ backgroundColor: lightMode ? 'rgba(5,5,121,0.05)' : 'rgba(191,219,254,0.08)', borderColor }}>
                                                <Building2 size={22} className="text-[#050579]" />
                                            </div>
                                            <span className="text-xl font-semibold tracking-wide sm:text-2xl">
                                                {comp.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* About Me */}
                    {about_me && (
                        <section className="mb-8 rounded-[28px] border p-6 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]" style={{ backgroundColor: lightMode ? 'rgba(246,248,255,0.9)' : 'rgba(8,22,39,0.92)', borderColor }}>
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                                <Heart size={20} className="text-primary" /> เกี่ยวกับฉัน
                            </h3>
                            <p className="whitespace-pre-line leading-relaxed" style={{ color: mutedText }}>{about_me}</p>
                        </section>
                    )}

                    {/* Interests */}
                    {interests?.length > 0 && (
                        <section className="mb-8">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {interests.map((tag: string, i: number) => (
                                    <span key={i} className="rounded-full border px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm" style={{ backgroundColor: lightMode ? 'rgba(255,255,255,0.72)' : 'rgba(8,22,39,0.72)', borderColor }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Multimedia: Video */}
                    {(videoConfig?.enabled && videoConfig.url) && (
                        <section className="mb-8">
                             <div className="group relative overflow-hidden rounded-[28px] border shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]" style={{ backgroundColor: lightMode ? 'rgba(246,248,255,0.9)' : 'rgba(8,22,39,0.92)', borderColor }}>
                                <VideoEmbed url={videoConfig.url} autoplay={videoConfig.autoplay} />
                                {videoConfig.link_enabled && videoConfig.link_url && (
                                    <a 
                                        href={videoConfig.link_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl bg-[#F97316] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#EA580C]"
                                    >
                                        <ExternalLink size={16} />
                                        ดูรายละเอียดเพิ่มเติม
                                    </a>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Gallery */}
                    {(layout_config?.show_gallery !== false && gallery?.length > 0) && (
                        <section className="mb-8">
                            <Gallery images={gallery.slice(0, 20).map(getImageUrl)} />
                        </section>
                    )}

                    {/* Contact Info */}
                    {layout_config?.show_contact_info !== false && (emails?.length > 0 || phones?.length > 0) && (
                        <section className="mb-8 grid grid-cols-1 gap-4">
                            {phones?.map((phone: any, i: number) => (
                                <a key={i} href={`tel:${phone.value}`} className="flex items-center gap-4 rounded-[24px] border p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] transition-colors hover:bg-white/70" style={{ backgroundColor: lightMode ? 'rgba(255,255,255,0.82)' : 'rgba(8,22,39,0.84)', borderColor }}>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/15">
                                        <Phone size={24} className="text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-foreground/50">{phone.label || 'Phone'}</div>
                                        <div className="font-medium text-foreground">{formatPhoneNumber(phone.value)}</div>
                                    </div>
                                </a>
                            ))}
                            {emails?.map((email: any, i: number) => (
                                <a key={i} href={`mailto:${email.value}`} className="flex items-center gap-4 rounded-[24px] border p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] transition-colors hover:bg-white/70" style={{ backgroundColor: lightMode ? 'rgba(255,255,255,0.82)' : 'rgba(8,22,39,0.84)', borderColor }}>
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/15">
                                        <Mail size={24} className="text-red-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-foreground/50">{email.label || 'Email'}</div>
                                        <div className="font-medium text-foreground">{email.value}</div>
                                    </div>
                                </a>
                            ))}
                        </section>
                    )}

                    {/* Website Links */}
                    {websites?.length > 0 && (
                        <section className="mb-8">
                            <div className="grid grid-cols-1 gap-4">
                                {websites.map((site: any, i: number) => (
                                    <a key={i} href={ensureHttps(site.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-[24px] border p-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] transition-colors hover:bg-white/70" style={{ backgroundColor: lightMode ? 'rgba(255,255,255,0.82)' : 'rgba(8,22,39,0.84)', borderColor }}>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border bg-[#050579]/8" style={{ borderColor: lightMode ? 'rgba(5,5,121,0.12)' : 'rgba(147,197,253,0.18)' }}>
                                            <Globe size={24} className="text-[#050579]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate text-foreground">{site.label || 'Website'}</div>
                                            <div className="text-sm text-foreground/55 truncate">{site.url}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Social Links */}
                    <SocialLinksDisplay links={social_links_json} />

                    {/* QR Code */}
                    {qr_enabled !== false && (
                        <section className="mb-8 rounded-[28px] border px-5 py-8 text-center shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)]" style={{ backgroundColor: lightMode ? 'rgba(246,248,255,0.9)' : 'rgba(8,22,39,0.92)', borderColor }}>
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <h3 className="text-lg font-bold">Scan to Connect</h3>
                                    <p className="text-sm" style={{ color: mutedText }}>
                                        บันทึกคอนแทกต์หรือเปิดหน้านี้บนอุปกรณ์อื่นได้ทันที
                                    </p>
                                </div>
                                <QrCodeImage url={profileUrl} size={180} />
                                <QrCodeDownloadActions
                                    qrValue={profileUrl}
                                    fileBaseName={`${uid}-qr-code`}
                                    lightMode={lightMode}
                                    className="mt-0"
                                    titleLine="qrcode นี้ เป็นนามบัตรดิจิทัลของ"
                                    nameLine={displayName}
                                    phoneLine={primaryPhone}
                                />
                            </div>
                        </section>
                    )}

                    {/* Quick Actions (Downloads & Saves) */}
                    <section className="mb-2 flex flex-col gap-4">
                        {/* Save to Home Screen Button */}
                        <SaveToHomeButton 
                            uid={uid}
                            profileName={displayName}
                            profilePicUrl={profileThumbUrl || profileImageUrl}
                        />
                        
                        {feature_config?.can_save_vcf !== false && (
                            <VcfDownloadButton
                                uid={uid}
                                name={displayName}
                                position={displayPosition}
                                company={displayCompany}
                                phones={phones}
                                emails={emails}
                                website={ensureHttps(websites?.[0]?.url || '')}
                                profilePicUrl={profileImageUrl}
                            />
                        )}

                        <a
                            href={referralRegisterUrl}
                            className="pt-2 text-center text-sm font-semibold underline underline-offset-4 transition-opacity hover:opacity-80"
                            style={{ color: lightMode ? '#050579' : '#93C5FD' }}
                        >
                            สนใจระบบแบบที่คุณเห็นอยู่นี้ คลิกที่นี่
                        </a>
                    </section>
                    </div>
                </div>

                {/* Bottom Banners */}
                {bottomBannersSection}

                <div className="relative z-10 px-6">
                    {/* Footer */}
                    <footer className="mt-10 border-t border-foreground/10 pb-8 pt-8 text-center">
                        <p className="text-sm font-medium tracking-wide text-foreground/50">
                            © {new Date().getFullYear()} {displayName.toUpperCase()}
                        </p>
                    </footer>
                </div>
                </div>
            </main>
        </ProfilePageClient>
    );
}
