import { getProfile } from '../../../../lib/api';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ prefix: string; uid: string }> }
) {
    const { prefix, uid } = await params;
    const data = await getProfile(uid);

    if (!data) {
        return new NextResponse('Profile not found', { status: 404 });
    }

    const displayName = data.names_i18n?.find((n: any) => n.value?.trim())?.value || data.full_name || 'NEX Digital Card';
    const shortName = displayName.length > 12 ? displayName.substring(0, 12) : displayName;
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const toAbsoluteUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) return `${API_URL}${url}`;
        return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    // Detect MIME type from file extension
    const getMimeType = (url: string): string => {
        const lower = url.toLowerCase();
        if (lower.endsWith('.webp')) return 'image/webp';
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
        if (lower.endsWith('.svg')) return 'image/svg+xml';
        return 'image/png';
    };

    // Use full-size image for better icon quality on home screen
    const iconUrl = data.profile_pic_url
        ? toAbsoluteUrl(data.profile_pic_url)
        : `${SITE_URL}/icons/icon-512.png`;

    const iconMimeType = getMimeType(iconUrl);
    const fallbackIconUrl = `${SITE_URL}/icons/icon-512.png`;

    const manifest = {
        id: `/${prefix}/${uid}`,
        name: displayName,
        short_name: shortName,
        description: data.about_me || `Digital card for ${displayName}`,
        start_url: `/${prefix}/${uid}`,
        scope: `/${prefix}/${uid}`,
        display: 'standalone',
        orientation: 'portrait',
        background_color: data.layout_config?.display_theme === 'dark' ? '#06111f' : '#EEF0FF',
        theme_color: data.layout_config?.primary_color || '#050579',
        lang: 'th',
        categories: ['business', 'social'],
        icons: [
            // Profile pic icons with correct MIME type
            {
                src: iconUrl,
                sizes: '192x192',
                type: iconMimeType,
                purpose: 'any',
            },
            {
                src: iconUrl,
                sizes: '512x512',
                type: iconMimeType,
                purpose: 'any',
            },
            {
                src: iconUrl,
                sizes: '192x192',
                type: iconMimeType,
                purpose: 'maskable',
            },
            {
                src: iconUrl,
                sizes: '512x512',
                type: iconMimeType,
                purpose: 'maskable',
            },
            // Fallback PNG icons (guaranteed valid format)
            {
                src: fallbackIconUrl,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
    };

    return new NextResponse(JSON.stringify(manifest), {
        headers: {
            'Content-Type': 'application/manifest+json',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
