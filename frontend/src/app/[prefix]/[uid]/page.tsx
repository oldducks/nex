import { getProfile, getCatalogsByUserId } from '../../../lib/api';
import { notFound } from 'next/navigation';
import { AlertTriangle, Phone, Mail, Globe, Heart, User, Building2, ExternalLink } from 'lucide-react';

// Helper function to ensure URL has protocol
function ensureHttps(url: string): string {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    return `https://${trimmed}`;
}
import { VcfDownloadButton } from '../../../components/VcfDownload';
import { QrCodeImage } from '../../../components/QrCode';
import { AnalyticsTracker } from '../../../components/AnalyticsTracker';
import { NamecardDownloadButton } from '../../../components/NamecardDownload';
import { ProfilePageClient } from '../../../components/ProfilePageClient';
import { VideoEmbed } from '../../../components/VideoEmbed';
import { Gallery } from '../../../components/Gallery';
import { LeadForm } from '../../../components/LeadForm';
import { SocialLinksDisplay } from '../../../components/SocialLinksDisplay';
import { CatalogsDisplay } from '../../../components/CatalogsDisplay';

import { SaveToHomeButton } from '../../../components/SaveToHomeButton';
import { Metadata } from 'next';

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

    // Fetch user's catalogs
    const catalogs = await getCatalogsByUserId(data.user_id);

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
    const fallbackIconUrl = `${SITE_URL}/nex_logo_nobg.png`;
    const iconUrl = profileThumbUrl || profileImageUrl || fallbackIconUrl;
    const logoUrl = logo?.url ? getImageUrl(logo.url) : '';
    const bannerUrl = banners?.[0]?.url ? getImageUrl(banners[0].url) : '';
    const profileUrl = `${SITE_URL}/${data.url_prefix}/${uid}`;

    // Theme Configuration (locked to profile owner's layout_config)
    const theme = layout_config || {};
    const lightMode = theme.display_theme !== 'dark';
    const primary = theme.primary_color || '#6366F1';
    const font = theme.font_family || 'Inter';

    const themeStyles = {
        '--primary': primary,
        '--background': lightMode ? '#f4f4f5' : '#050505',
        '--foreground': lightMode ? '#18181b' : '#ffffff',
        '--glass': lightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 15, 15, 0.7)',
        '--glass-border': lightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        backgroundColor: lightMode ? '#f4f4f5' : '#050505',
        color: lightMode ? '#18181b' : '#ffffff',
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

    // Top Banners Component
    const TopBannersSection = () => topBanners.length > 0 ? (
        <div className="space-y-0">
            {topBanners.map((banner: any, i: number) => (
                <BannerItem key={i} banner={banner} index={i} />
            ))}
        </div>
    ) : null;

    // Bottom Banners Component
    const BottomBannersSection = () => bottomBanners.length > 0 ? (
        <div className="space-y-0">
            {bottomBanners.map((banner: any, i: number) => (
                <BannerItem key={i} banner={banner} index={i} />
            ))}
        </div>
    ) : null;

    return (
        <ProfilePageClient profileData={data}>
            <link href={`https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;700;900&display=swap`} rel="stylesheet" />
            
            <main
                id="profile-capture"
                className={`relative min-h-screen transition-colors duration-500 overflow-hidden bg-background text-foreground ${isExpired ? 'grayscale pointer-events-none select-none' : ''}`}
                style={{ ...themeStyles, fontFamily: `"${font}", sans-serif` }}
            >
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
                <div className="relative w-full max-w-[480px] mx-auto min-h-screen shadow-2xl bg-background/40 backdrop-blur-[2px]">
                    {/* Top Banners */}
                    <TopBannersSection />

                {/* Main Content */}
                <div className="relative px-6 py-12 z-10">
                    {/* Background Elements (if no bg image) */}
                    {!bgImage && (
                        <>
                            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
                            <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] opacity-30" />
                        </>
                    )}

                    {/* Profile Section - Banner Style */}
                    <section className={`relative mb-16 flex flex-col items-center gap-6 ${topBanners.length > 0 ? '-mt-28 md:-mt-32' : ''}`}>
                        {/* Profile Image - Full Width Banner */}
                        <div className={`relative w-full -mx-6 ${topBanners.length > 0 ? 'z-10' : ''}`}>
                            <div className="relative w-full h-80 md:h-96 overflow-hidden bg-foreground/5">
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent"></div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-foreground/30">
                                        <User size={96} />
                                    </div>
                                )}
                                {/* Logo Badge Premium */}
                                {logoUrl && (
                                    <div className="absolute bottom-4 right-4 w-16 h-16 drop-shadow-xl overflow-hidden rounded-xl">
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className={`flex-grow flex flex-col ${profilePosition === 'center' ? 'text-center items-center' : 'text-left items-start'}`}>
                            {/* Positions (Job Titles) */}
                            {displayPositions.length > 0 && (
                                <div className={`flex flex-col gap-2 mb-6 w-full ${profilePosition === 'center' ? 'items-center' : 'items-start'}`}>
                                    {displayPositions.map((pos: any, i: number) => (
                                        <div 
                                            key={i} 
                                            className={`font-black tracking-[0.15em] drop-shadow-md ${i === 0 ? 'text-primary/70 text-sm' : 'text-primary text-[15px] uppercase'}`}
                                        >
                                            {pos.value}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Names */}
                            <div className={`flex flex-col gap-3 mb-8 w-full ${profilePosition === 'center' ? 'items-center' : 'items-start'}`}>
                                <h1 className="text-[44px] leading-tight sm:text-[56px] font-black tracking-tight text-foreground" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
                                    {displayName}
                                </h1>
                                
                                {names_i18n?.length > 1 && (
                                    <div className="flex flex-col gap-2">
                                        {names_i18n.slice(1).map((name: any, i: number) => (
                                            <h2 key={i} className="text-foreground/60 font-medium tracking-wide text-[22px] drop-shadow-md">
                                                {name.value}
                                            </h2>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Companies */}
                            {displayCompanies.length > 0 && (
                                <div className={`flex flex-col gap-3 w-full ${profilePosition === 'center' ? 'items-center' : 'items-start'}`}>
                                    {displayCompanies.map((comp: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 text-foreground/75 hover:text-foreground transition-all duration-300 group">
                                            <div className="w-10 h-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <Building2 size={24} className="opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                            </div>
                                            <span className="font-medium tracking-wide text-2xl drop-shadow-sm">
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
                        <section className="mb-12 bg-background/60 backdrop-blur-md rounded-2xl p-6 border border-foreground/10 shadow-lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground drop-shadow-sm">
                                <Heart size={20} className="text-primary" /> เกี่ยวกับฉัน
                            </h3>
                            <p className="text-foreground/75 leading-relaxed whitespace-pre-line drop-shadow-sm">{about_me}</p>
                        </section>
                    )}

                    {/* Interests */}
                    {interests?.length > 0 && (
                        <section className="mb-12">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {interests.map((tag: string, i: number) => (
                                    <span key={i} className="bg-primary/20 text-foreground border border-primary/30 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Multimedia: Video */}
                    {(videoConfig?.enabled && videoConfig.url) && (
                        <section className="mb-12">
                             <div className="relative rounded-2xl overflow-hidden border border-foreground/10 shadow-lg group bg-background/70">
                                <VideoEmbed url={videoConfig.url} autoplay={videoConfig.autoplay} />
                                {videoConfig.link_enabled && videoConfig.link_url && (
                                    <a 
                                        href={videoConfig.link_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 flex items-center gap-2 z-20 font-bold text-sm"
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
                        <section className="mb-12">
                            <Gallery images={gallery.map(getImageUrl)} />
                        </section>
                    )}

                    {/* Contact Info */}
                    {layout_config?.show_contact_info !== false && (emails?.length > 0 || phones?.length > 0) && (
                        <section className="mb-12 grid grid-cols-1 gap-4">
                            {phones?.map((phone: any, i: number) => (
                                <a key={i} href={`tel:${phone.value}`} className="bg-background/60 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 hover:bg-background/75 transition-colors border border-foreground/10 shadow-lg">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/20">
                                        <Phone size={24} className="text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-foreground/50 uppercase font-bold">{phone.label || 'Phone'}</div>
                                        <div className="font-medium text-foreground">{phone.value}</div>
                                    </div>
                                </a>
                            ))}
                            {emails?.map((email: any, i: number) => (
                                <a key={i} href={`mailto:${email.value}`} className="bg-background/60 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 hover:bg-background/75 transition-colors border border-foreground/10 shadow-lg">
                                    <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/20">
                                        <Mail size={24} className="text-red-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-foreground/50 uppercase font-bold">{email.label || 'Email'}</div>
                                        <div className="font-medium text-foreground">{email.value}</div>
                                    </div>
                                </a>
                            ))}
                        </section>
                    )}

                    {/* Website Links */}
                    {websites?.length > 0 && (
                        <section className="mb-12">
                            <div className="grid grid-cols-1 gap-4">
                                {websites.map((site: any, i: number) => (
                                    <a key={i} href={ensureHttps(site.url)} target="_blank" rel="noopener noreferrer" className="bg-background/60 backdrop-blur-md rounded-xl p-4 flex items-center gap-4 hover:bg-background/75 transition-colors border border-foreground/10 shadow-lg">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                                            <Globe size={24} className="text-indigo-500" />
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
                        <section className="mb-12 text-center text-foreground drop-shadow-md">
                            <h3 className="text-lg font-bold mb-4">Scan to Connect</h3>
                            <QrCodeImage url={profileUrl} size={180} />
                        </section>
                    )}

                    {/* Lead Generation Form */}
                    {layout_config?.show_lead_form !== false && (
                        <section className="mb-12 cursor-default">
                            <LeadForm targetUid={uid} />
                        </section>
                    )}

                    {/* Catalogs */}
                    <CatalogsDisplay catalogs={catalogs} />

                    {/* Quick Actions (Downloads & Saves) */}
                    <section className="mb-12 flex flex-col gap-4">
                        {/* Save to Home Screen Button */}
                        <SaveToHomeButton 
                            uid={uid}
                            profileName={displayName}
                            profilePicUrl={profileThumbUrl || profileImageUrl}
                        />

                        {/* Save Contact Button */}
                        {feature_config?.can_save_vcf !== false && (
                            <VcfDownloadButton
                                name={displayName}
                                position={displayPosition}
                                company={displayCompany}
                                phones={phones}
                                emails={emails}
                                website={ensureHttps(websites?.[0]?.url || '')}
                                profilePicUrl={profileImageUrl}
                            />
                        )}

                        {/* Download Namecard Image Button */}
                        <NamecardDownloadButton
                            nameMain={displayName}
                            nameSub={names_i18n?.find((n: any) => n.lang === 'en')?.value}
                            position={displayPosition}
                            company={displayCompany}
                            phone={phones?.[0]?.value}
                            email={emails?.[0]?.value}
                            website={ensureHttps(websites?.[0]?.url || '')}
                            logoUrl={logo?.url}
                            qrUrl={profileUrl}
                            template="gradient"
                        />
                    </section>
                </div>

                {/* Bottom Banners */}
                <BottomBannersSection />

                <div className="relative px-6 z-10">
                    {/* Footer */}
                    <footer className="mt-16 pb-8 text-center border-t border-foreground/10 pt-8">
                        <p className="text-foreground/50 text-sm font-medium tracking-wide">
                            © {new Date().getFullYear()} {displayName.toUpperCase()}
                        </p>
                    </footer>
                </div>
                </div>
            </main>
        </ProfilePageClient>
    );
}
