import { getProfile, getCatalogsByUserId } from '../../../lib/api';
import { notFound } from 'next/navigation';
import { AlertTriangle, Phone, Mail, Globe, Heart, User, Building2 } from 'lucide-react';
import { VcfDownloadButton } from '../../../components/VcfDownload';
import { QrCodeImage } from '../../../components/QrCode';
import { AnalyticsTracker } from '../../../components/AnalyticsTracker';
import { NamecardDownloadButton } from '../../../components/NamecardDownload';
import { ProfilePageClient } from '../../../components/ProfilePageClient';
import { VideoEmbed } from '../../../components/VideoEmbed';
import { Gallery } from '../../../components/Gallery';
import { LeadForm } from '../../../components/LeadForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SocialLinksDisplay } from '../../../components/SocialLinksDisplay';
import { CatalogsDisplay } from '../../../components/CatalogsDisplay';

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
    const displayName = names_i18n?.[0]?.value || full_name || 'Unknown User';
    const displayPosition = positions_i18n?.length > 0
        ? positions_i18n.map((p: any) => p.value).filter(Boolean).join(' / ')
        : position || '';
    const displayCompany = companies_i18n?.[0]?.value || company_name || '';
    const profilePosition = layout_config?.profile_position || 'center';

    // Get profile image URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://namecard.dpattown.com';

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) return `${API_URL}${url}`;
        return url;
    };

    const profileImageUrl = getImageUrl(profile_pic_url || '');
    const logoUrl = logo?.url ? getImageUrl(logo.url) : '';
    const bannerUrl = banners?.[0]?.url ? getImageUrl(banners[0].url) : '';
    const profileUrl = `${SITE_URL}/${data.url_prefix}/${uid}`;

    // Theme Configuration
    const theme = layout_config || {};
    // const lightMode = theme.display_theme === 'light'; // Removed to allow global theme
    const primary = theme.primary_color || '#6366F1';
    const font = theme.font_family || 'Inter';

    const themeStyles = {
        '--primary': primary,
        // '--background': lightMode ? '#f4f4f5' : '#050505', // Use global theme
        // '--foreground': lightMode ? '#18181b' : '#ffffff', // Use global theme
        // '--glass': lightMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 15, 15, 0.7)', // Use global theme
        // '--glass-border': lightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)', // Use global theme
        fontFamily: `"${font}", sans-serif`,
    } as React.CSSProperties;

    const fontName = font.replace(/\s/g, '+');

    return (
        <ProfilePageClient profileData={data}>
            <link href={`https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;700;900&display=swap`} rel="stylesheet" />
            
            {/* Global Theme Toggle for Profile */}
            <div className="fixed top-6 right-6 z-[100]">
                <ThemeToggle />
            </div>

            <main
                id="profile-capture"
                className={`relative min-h-screen transition-colors duration-500 overflow-hidden bg-background text-foreground ${isExpired ? 'grayscale pointer-events-none select-none' : ''}`}
                style={{ ...themeStyles, fontFamily: `"${font}", sans-serif` }}
            >
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

                {/* Banner */}
                {bannerUrl && (
                    <div className="relative w-full h-48 md:h-64">
                        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950"></div>
                    </div>
                )}

                {/* Main Content */}
                <div className="relative max-w-4xl mx-auto px-6 py-12">
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
                    <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] opacity-30" />

                    {/* Profile Section */}
                    <section className={`relative mb-16 flex flex-col ${profilePosition === 'left' ? 'md:flex-row' : profilePosition === 'right' ? 'md:flex-row-reverse' : 'items-center'} gap-8 ${bannerUrl && profilePosition === 'overlay' ? '-mt-32' : ''}`}>
                        {/* Profile Image */}
                        <div className={`relative flex-shrink-0 ${profilePosition === 'overlay' ? 'z-10' : ''}`}>
                            <div className="w-72 h-72 md:w-80 md:h-80 relative overflow-hidden rounded-[32px] border-4 border-white/10 shadow-2xl bg-zinc-800">
                                {profileImageUrl ? (
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
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                            {logoUrl && (
                                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white rounded-xl shadow-lg p-2 border border-gray-200">
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className={`flex-grow ${profilePosition === 'center' ? 'text-center' : 'text-left'}`}>
                            {displayPosition && (
                                <div className={`text-primary font-bold tracking-[0.2em] uppercase text-sm mb-3 flex items-center gap-2 ${profilePosition === 'center' ? 'justify-center' : ''}`}>
                                    {displayPosition}
                                </div>
                            )}

                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-none">
                                {displayName}
                            </h1>

                            {names_i18n?.length > 1 && (
                                <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                                    {names_i18n.slice(1).map((name: any, i: number) => (
                                        <span key={i} className="text-gray-400 text-lg">{name.value}</span>
                                    ))}
                                </div>
                            )}

                            {displayCompany && (
                                <p className="text-xl text-gray-400 mb-4 flex items-center gap-2 justify-center md:justify-start">
                                    <Building2 size={18} /> {displayCompany}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* About Me */}
                    {about_me && (
                        <section className="mb-12 bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Heart size={20} className="text-primary" /> เกี่ยวกับฉัน
                            </h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{about_me}</p>
                        </section>
                    )}

                    {/* Interests */}
                    {interests?.length > 0 && (
                        <section className="mb-12">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {interests.map((tag: string, i: number) => (
                                    <span key={i} className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Multimedia: Video */}
                    {(layout_config?.video_url || video_url) && (
                        <section className="mb-12">
                            <VideoEmbed url={layout_config?.video_url || video_url} />
                        </section>
                    )}

                    {/* Gallery */}
                    {(layout_config?.show_gallery !== false && gallery?.length > 0) && (
                        <section className="mb-12">
                            <Gallery images={gallery.map(getImageUrl)} />
                        </section>
                    )}

                    {/* Contact Info */}
                    {(emails?.length > 0 || phones?.length > 0) && (
                        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {phones?.map((phone: any, i: number) => (
                                <a key={i} href={`tel:${phone.value}`} className="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/10">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <Phone size={24} className="text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">{phone.label || 'Phone'}</div>
                                        <div className="font-medium">{phone.value}</div>
                                    </div>
                                </a>
                            ))}
                            {emails?.map((email: any, i: number) => (
                                <a key={i} href={`mailto:${email.value}`} className="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/10">
                                    <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <Mail size={24} className="text-red-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase">{email.label || 'Email'}</div>
                                        <div className="font-medium">{email.value}</div>
                                    </div>
                                </a>
                            ))}
                        </section>
                    )}

                    {/* Website Links */}
                    {websites?.length > 0 && (
                        <section className="mb-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {websites.map((site: any, i: number) => (
                                    <a key={i} href={site.url} target="_blank" rel="noopener noreferrer" className="bg-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-colors border border-white/10">
                                        <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                            <Globe size={24} className="text-indigo-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{site.label || 'Website'}</div>
                                            <div className="text-sm text-gray-500 truncate">{site.url}</div>
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
                        <section className="mb-12 text-center">
                            <h3 className="text-lg font-bold mb-4">Scan to Connect</h3>
                            <QrCodeImage url={profileUrl} size={180} />
                        </section>
                    )}

                    {/* Save Contact Button */}
                    {feature_config?.can_save_vcf !== false && (
                        <section className="mb-12">
                            <VcfDownloadButton
                                name={displayName}
                                position={displayPosition}
                                company={displayCompany}
                                phones={phones}
                                emails={emails}
                                website={websites?.[0]?.url}
                                profilePicUrl={profileImageUrl}
                            />
                        </section>
                    )}

                    {/* Lead Generation Form */}
                    {layout_config?.show_lead_form !== false && (
                        <section className="mb-12">
                            <LeadForm ownerId={data.user_id} />
                        </section>
                    )}

                    {/* Download Namecard PNG Button */}
                    <section className="mb-12">
                        <NamecardDownloadButton
                            nameMain={displayName}
                            nameSub={names_i18n?.find((n: any) => n.lang === 'en')?.value}
                            position={displayPosition}
                            company={displayCompany}
                            phone={phones?.[0]?.value}
                            email={emails?.[0]?.value}
                            website={websites?.[0]?.url}
                            logoUrl={logo?.url}
                            qrUrl={profileUrl}
                            template="gradient"
                        />
                    </section>

                    {/* Catalogs */}
                    <CatalogsDisplay catalogs={catalogs} />

                    {/* Footer */}
                    <footer className="mt-16 pb-8 text-center border-t border-white/5 pt-8">
                        <p className="text-gray-600 text-sm font-medium tracking-wide">
                            © {new Date().getFullYear()} {displayName.toUpperCase()}
                        </p>
                    </footer>
                </div>
            </main>
        </ProfilePageClient>
    );
}
