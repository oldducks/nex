import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';

interface CatalogMeta {
  id: number;
  title: string;
  description?: string;
  custom_slug?: string;
  layout_config?: {
    brand_logo?: string;
  };
  products?: Array<{
    images_json?: string[];
  }>;
}

function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || '/api';
  if (configured.startsWith('http')) return configured.replace(/\/$/, '');
  const normalized = configured.startsWith('/') ? configured : `/${configured}`;
  return `${SITE_URL}${normalized}`.replace(/\/$/, '');
}

function resolveImageUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  const apiBase = getApiBase();

  if (raw.startsWith('http')) return raw;
  if (raw.startsWith('/uploads')) return `${apiBase}${raw}`;
  if (raw.startsWith('/api/uploads')) return `${SITE_URL}${raw}`;
  if (raw.startsWith('/')) return `${SITE_URL}${raw}`;
  return raw;
}

async function getCatalogForMetadata(slug: string): Promise<CatalogMeta | null> {
  const apiBase = getApiBase();
  const encodedSlug = encodeURIComponent(slug);
  const endpoints = [`${apiBase}/catalogs/public/${encodedSlug}`, `${apiBase}/catalogs/view/${encodedSlug}`];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      if (res.ok) {
        return (await res.json()) as CatalogMeta;
      }
    } catch {
      // try fallback endpoint
    }
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalogForMetadata(slug);

  if (!catalog) {
    return {
      title: 'Catalog Not Found | NEX Solution',
      description: 'ไม่พบข้อมูลแคตตาล็อกที่ต้องการ',
    };
  }

  const title = `${catalog.title} | NEX Catalog`;
  const description =
    (catalog.description || '').trim() ||
    `แคตตาล็อกสินค้า ${catalog.products?.length || 0} รายการ จาก NEX Solution`;

  const firstProductImage = catalog.products?.find((item) => item.images_json?.[0])?.images_json?.[0];
  const ogImageRaw = catalog.layout_config?.brand_logo || firstProductImage || '/nex_logo_nobg.png';
  const ogImage = resolveImageUrl(ogImageRaw) || `${SITE_URL}/nex_logo_nobg.png`;

  const slugOrId = catalog.custom_slug || slug;
  const canonical = `${SITE_URL}/catalog/${slugOrId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
  };
}

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return children;
}
