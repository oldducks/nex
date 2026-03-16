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
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const toAbsoluteUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        if (url.startsWith('/uploads')) return `${API_URL}${url}`;
        return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const getThumbUrl = (url: string) => {
        if (!url) return `${SITE_URL}/favicon.ico`;
        if (url.startsWith('/uploads')) {
            const parts = url.split('/');
            const filename = parts.pop();
            return `${API_URL}${parts.join('/')}/thumb_${filename}`;
        }
        return toAbsoluteUrl(url);
    };

    const iconUrl = data.profile_pic_url ? getThumbUrl(data.profile_pic_url) : `${SITE_URL}/favicon.ico`;

    const manifest = {
        name: displayName,
        short_name: displayName,
        description: data.about_me || `Digital card for ${displayName}`,
        start_url: `${SITE_URL}/${prefix}/${uid}`,
        display: 'standalone',
        background_color: '#050505',
        theme_color: data.layout_config?.primary_color || '#6366F1',
        icons: [
            {
                src: iconUrl,
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: iconUrl,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: iconUrl,
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: iconUrl,
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            }
        ],
    };

    return new NextResponse(JSON.stringify(manifest), {
        headers: {
            'Content-Type': 'application/manifest+json',
        },
    });
}
