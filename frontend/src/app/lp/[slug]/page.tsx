import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LandingPageClient from './LandingPageClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';

// For SSR, we need absolute URL
function getApiUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    // If it's a relative path (starts with /), prepend the site URL
    if (apiUrl.startsWith('/')) {
        return process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
    }
    return apiUrl;
}

interface LandingPage {
    id: number;
    title: string;
    slug: string;
    description: string;
    content_blocks: any[];
    theme_config: any;
    seo_metadata: any;
    owner_uid?: string;
    is_published: boolean;
}

async function getLandingPage(slug: string): Promise<LandingPage | null> {
    try {
        const baseUrl = getApiUrl();
        const res = await fetch(`${baseUrl}/api/landing-pages/public/${slug}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const page = await getLandingPage(slug);

    if (!page) {
        return {
            title: 'Page Not Found',
        };
    }

    const seo = page.seo_metadata || {};
    const title = seo.title || page.title;
    const description = seo.description || page.description;
    let ogImage = seo.og_image || '';

    // Use first image block if OG image is not manually specified
    if (!ogImage && page.content_blocks && Array.isArray(page.content_blocks)) {
        const imageBlock = page.content_blocks.find(block => block.type === 'image' && block.content?.url);
        if (imageBlock) {
            ogImage = imageBlock.content.url;
        }
    }

    // Ensure OG Image is absolute
    if (ogImage && ogImage.startsWith('/')) {
        ogImage = `${SITE_URL}${ogImage}`;
    }

    const canonical = `${SITE_URL}/lp/${slug}`;

    return {
        title,
        description,
        keywords: seo.keywords,
        openGraph: {
            title,
            description,
            url: canonical,
            images: ogImage ? [{ url: ogImage }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ogImage ? [ogImage] : [],
        },
        alternates: {
            canonical,
        },
    };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = await getLandingPage(slug);

    if (!page || !page.is_published) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-bold mb-2">Campaign Not Found</h1>
                <p className="text-gray-400 mb-8">ขออภัย หน้าแคมเปญนี้อาจจะยังไม่เปิดใช้งาน หรือสิ้นระยะเวลาโปรโมชั่นแล้ว</p>
                <a href="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                    กลับหน้าหลัก
                </a>
            </div>
        );
    }

    return <LandingPageClient page={page} />;
}
