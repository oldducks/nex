"use client";

import React, { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  Globe, ShoppingCart, Facebook, MessageCircle,
  Download, ArrowLeft, ExternalLink, QrCode as QrIcon,
  ChevronLeft, ChevronRight, Info, Package, BookOpen, Share2, Twitter, Search
} from 'lucide-react';
import { QrCodeImage } from '../../../components/QrCode';
import { QrCodeDownloadActions } from '../../../components/QrCodeDownloadActions';
import dynamic from 'next/dynamic';
import { getEmbedUrl } from '@/lib/videoUtils';

const Flipbook = dynamic(() => import('@/components/Flipbook'), { ssr: false });
import { FlipbookProductPage } from '@/components/FlipbookProductPage';

const DEFAULT_REFERRAL_URL = 'https://nexsolution.cloud/manage/referrals';

interface Product {
  id: number;
  name: string;
  brand?: string;
  description: string;
  price: number;
  images_json: string[];
  interactive_links?: {
    website?: string;
    order_form?: string;
    facebook?: string;
  };
}

interface InteractiveLinks {
  website?: string;
  order_form?: string;
  facebook?: string;
}

interface CatalogLayoutConfig {
  primary_color?: string;
  font_family?: string;
  brand_logo?: string;
}

interface Catalog {
  id: number;
  owner_uid?: string | null;
  referral_code?: string | null;
  title: string;
  description: string;
  layout_config?: CatalogLayoutConfig;
  interactive_links?: InteractiveLinks;
  pdf_url?: string;
  video_config?: {
    url: string;
    autoplay: boolean;
    link_url?: string;
    link_enabled: boolean;
    enabled: boolean;
  };
  products: Product[];
}

export default function PublicCatalog() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const viewParam = searchParams.get('view');
  const initialViewMode = viewParam === 'book' ? 'flipbook' : 'grid';
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'flipbook'>(initialViewMode);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const nexPageVars = {
    '--background': '#EEF0FF',
    '--foreground': '#0F172A',
    '--primary': '#050579',
    '--glass-border': 'rgba(15,23,42,0.08)',
    '--card': '#FFFFFF',
  } as React.CSSProperties;

  useEffect(() => {
    fetchCatalog();
  }, [slug]);

  useEffect(() => {
    if (!catalog?.owner_uid) return;
    void logCatalogEvent('VIEW_CATALOG');
  }, [catalog?.id, catalog?.owner_uid, slug, viewMode]);

  useEffect(() => {
    const nextViewMode = searchParams.get('view') === 'book' ? 'flipbook' : 'grid';
    setViewMode(nextViewMode);
  }, [searchParams]);

  const setCatalogViewMode = (mode: 'grid' | 'flipbook') => {
    setViewMode(mode);
    const nextParams = new URLSearchParams(searchParams.toString());
    if (mode === 'flipbook') {
      nextParams.set('view', 'book');
    } else {
      nextParams.delete('view');
    }
    const query = nextParams.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  const fetchCatalog = async () => {
    try {
      // Try by slug first, then by ID
      let res = await fetch(`${API_URL}/catalogs/public/${slug}`);
      if (!res.ok) {
        res = await fetch(`${API_URL}/catalogs/view/${slug}`);
      }
      
      if (res.ok) {
        setCatalog(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getVisitorId = () => {
    let vid = Cookies.get('vid');
    if (!vid) {
      vid = Math.random().toString(36).substring(2) + Date.now().toString(36);
      Cookies.set('vid', vid, { expires: 365 });
    }
    return vid;
  };

  const logCatalogEvent = async (action: 'VIEW_CATALOG' | 'DOWNLOAD_PDF') => {
    if (!catalog?.owner_uid) return;

    try {
      await fetch(`${API_URL}/analytics/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          uid: catalog.owner_uid,
          action,
          visitorId: getVisitorId(),
          metadata: {
            catalogId: catalog.id,
            slug,
            viewMode,
          },
        }),
      });
    } catch (error) {
      console.error('Catalog analytics error:', error);
    }
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return 'https://via.placeholder.com/400x500';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
    if (url.startsWith('http')) {
        if (url.includes('localhost:') && SITE_URL.includes('https://nexsolution.cloud')) {
            try {
                const parsedUrl = new URL(url);
                if (parsedUrl.pathname.startsWith('/uploads')) {
                    return `${API_URL}${parsedUrl.pathname}`;
                }
            } catch (e) {}
        }
        return url;
    }
    if (url.startsWith('/uploads')) return `${API_URL}${url}`;
    return url;
  };

  if (loading) return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!catalog) return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
        <Package size={40} className="text-foreground/40" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Catalog Not Found</h1>
      <p className="text-foreground/40 mb-8">ขออภัย ไม่พบหน้าที่คุณต้องการ หรือแคตตาล็อกนี้ถูกระงับการใช้งาน</p>
      <button onClick={() => window.history.back()} className="px-6 py-3 bg-foreground/10 hover:bg-foreground/20 rounded-xl transition-colors">
        กลับหน้าก่อนหน้า
      </button>
    </div>
  );

  const theme = catalog.layout_config || {};
  const primary = theme.primary_color || '#050579';
  const referralCode = catalog.referral_code?.trim() || 'ZXQ0KPCR';
  const referralRegisterUrl = `https://nexsolution.cloud/register?ref=${encodeURIComponent(referralCode)}`;
  const selectedProductIndex = selectedProduct
    ? catalog.products.findIndex((item) => item.id === selectedProduct.id)
    : -1;
  const canGoPrevProduct = selectedProductIndex > 0;
  const canGoNextProduct =
    selectedProductIndex >= 0 && selectedProductIndex < catalog.products.length - 1;

  const styles = {
    '--primary': primary,
    fontFamily: theme.font_family ? `"${theme.font_family}", sans-serif` : 'inherit',
  } as React.CSSProperties;

  // Flipbook View
  if (viewMode === 'flipbook') {
    const flipbookPages = catalog.products.map(product => ({
      id: product.id,
      content: <FlipbookProductPage product={product} />
    }));

    const brandLogoUrl = catalog.layout_config?.brand_logo
      ? getImageUrl(catalog.layout_config.brand_logo)
      : '';

    const coverPage = (
      <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center p-8" style={{ '--primary': primary } as React.CSSProperties}>
        <div className="text-center text-white w-full max-w-[420px]">
          {brandLogoUrl && (
            <div className="mb-8 flex justify-center">
              <div className="h-24 md:h-28 w-full rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm p-3 flex items-center justify-center">
                <img
                  src={brandLogoUrl}
                  alt={`Brand logo ${catalog.title}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}
          <div className="text-4xl md:text-6xl font-black tracking-tighter mb-4">{catalog.title}</div>
          <div className="text-lg opacity-80">{catalog.description || 'Digital Collection'}</div>
          <div className="mt-8 text-sm opacity-60">{catalog.products.length} Products</div>
        </div>
      </div>
    );

    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
    const shareUrl = `${SITE_URL}/catalog/${slug}?view=book`;

    return (
      <div style={styles}>
        <Flipbook
          pages={flipbookPages}
          coverPage={coverPage}
          onExit={() => setCatalogViewMode('grid')}
          shareUrl={shareUrl}
          shareTitle={`${catalog.title} - Digital Catalog`}
          catalogName={catalog.title}
          products={catalog.products}
          promoHref={referralRegisterUrl}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-500 bg-background text-foreground" style={{ ...nexPageVars, ...styles }}>
      <div className="min-h-screen">
        
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-foreground/10">
          <div className="mx-auto flex h-20 w-full max-w-md items-center justify-between px-4 md:max-w-6xl md:px-6">
            <h1 className="max-w-[132px] text-2xl font-black leading-none tracking-tight text-[#050579] md:max-w-none md:text-xl md:uppercase">
              {catalog.title}
            </h1>
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => setCatalogViewMode('flipbook')}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white md:h-auto md:w-auto md:gap-2 md:px-4 md:py-2.5 md:text-sm md:font-bold"
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">Book View</span>
              </button>
              <div className="mx-1 hidden h-6 w-px bg-foreground/10 md:block" />
              <button
                onClick={() => setShowQrModal(true)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5 transition-colors hover:bg-foreground/10"
                title="QR Code"
              >
                <QrIcon size={20} />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5 transition-colors hover:bg-foreground/10"
                title="Share"
              >
                <Share2 size={20} />
              </button>
              {catalog.pdf_url && (
                <a 
                  href={getImageUrl(catalog.pdf_url)} 
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    void logCatalogEvent('DOWNLOAD_PDF');
                  }}
                  className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5 transition-colors hover:bg-foreground/10 md:flex"
                >
                  <Download size={20} />
                </a>
              )}
              <div className="hidden md:block">
                 <CatalogLinks links={catalog.interactive_links} />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-md px-4 py-6 md:max-w-6xl md:px-6 md:py-12">
          {/* Welcome Section */}
          <div className="mb-8 rounded-[32px] border border-white/60 bg-white/55 p-6 shadow-[0_24px_70px_-50px_rgba(5,5,121,0.26)] md:mb-12 md:p-8">
            <h2 className="text-xl font-black leading-[1.2] text-[#050579] md:max-w-4xl md:text-6xl md:leading-[0.95] md:tracking-tighter">
              {catalog.title}
            </h2>
            {catalog.description && (
              <p className="mt-3 text-sm font-medium leading-7 text-[#64748B] md:mt-4 md:max-w-3xl md:text-lg md:leading-8">
                {catalog.description}
              </p>
            )}
          </div>

          {/* Hero Video Section if enabled */}
          {catalog.video_config?.enabled && (
             <div className="mb-10 md:mb-20">
                <div className="relative w-full aspect-video rounded-[40px] overflow-hidden shadow-2xl bg-black group">
                    {catalog.video_config.url ? (
                        <a href={catalog.video_config.link_url || DEFAULT_REFERRAL_URL} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                            <video 
                                src={catalog.video_config.url.startsWith('http') ? catalog.video_config.url : `${API_URL}${catalog.video_config.url}`}
                                autoPlay={catalog.video_config.autoplay}
                                muted={catalog.video_config.autoplay}
                                loop
                                playsInline
                                controls
                                className="w-full h-full object-cover"
                            />
                        </a>
                    ) : (
                        <a href={catalog.video_config.link_url || DEFAULT_REFERRAL_URL} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                            <iframe
                                src={getEmbedUrl(catalog.video_config.link_url || '')}
                                className="w-full h-full"
                                allow="autoplay; fullscreen"
                            />
                        </a>
                    )}
                </div>
             </div>
          )}

          {/* Search bar for grid view */}
          <div className="mb-8 md:mb-10 md:max-w-xl">
            <div className="relative group">
               <input
                 type="text"
                 placeholder="ค้นหาชื่อสินค้า..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full rounded-2xl border-2 border-transparent bg-white/65 px-12 py-4 text-base transition-all outline-none focus:border-primary/30 focus:bg-white"
               />
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={20} />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {catalog.products
              .filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="group relative cursor-pointer overflow-hidden rounded-[30px] border border-white/50 bg-[var(--card)] transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
              >
                {/* Image */}
                <div className="relative aspect-[4/4.5] overflow-hidden md:aspect-[4/5]">
                  <img
                    src={getImageUrl(product.images_json?.[0])}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none"></div>
                </div>

                {/* Content Overlay/Bar */}
                <div className="p-5 sm:p-8">
                  {product.brand && (
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B] mb-2 line-clamp-1">
                      แบรนด์: {product.brand}
                    </p>
                  )}
                  <h3 className="mb-3 text-2xl font-black leading-tight tracking-tight text-[#050579] transition-colors group-hover:text-primary">{product.name}</h3>

                  {/* Price Badge - Below title */}
                  <div className="mb-4 inline-block rounded-full bg-primary px-4 py-2 text-base font-black text-white shadow-lg">
                    ฿{product.price.toLocaleString()}
                  </div>

                  <p className="mb-5 text-sm leading-7 text-[#475569] line-clamp-2 md:line-clamp-3">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">ดูรายละเอียด</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF0FF] transition-all group-hover:bg-primary group-hover:text-white">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pb-10 text-center">
            <a
              href={referralRegisterUrl}
              className="text-sm font-semibold text-[#050579] underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              สนใจระบบแบบที่คุณเห็นอยู่นี้ คลิกที่นี่
            </a>
          </div>
        </main>

        {/* Footer Links (Mobile) */}
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl border border-white/10 bg-[var(--background)]/85 px-6 py-3 shadow-2xl backdrop-blur-2xl md:hidden">
           <CatalogLinks links={catalog.interactive_links} />
        </div>

        {/* Product Modal */}
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            getImageUrl={getImageUrl}
            onClose={() => setSelectedProduct(null)}
            onPrev={
              canGoPrevProduct
                ? () => setSelectedProduct(catalog.products[selectedProductIndex - 1])
                : undefined
            }
            onNext={
              canGoNextProduct
                ? () => setSelectedProduct(catalog.products[selectedProductIndex + 1])
                : undefined
            }
            hasPrev={canGoPrevProduct}
            hasNext={canGoNextProduct}
          />
        )}

        {/* QR Code Modal */}
        {showQrModal && (
          <QrCodeModal 
            url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/catalog/${slug}`}
            title={catalog.title}
            onClose={() => setShowQrModal(false)}
          />
        )}

        {/* Share Modal */}
        {showShareModal && (
          <ShareModal 
            url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/catalog/${slug}`}
            title={catalog.title}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </div>
  );
}

function CatalogLinks({ links }: { links?: InteractiveLinks }) {
  if (!links) return null;
  return (
    <div className="flex items-center gap-3">
      {links.website && (
        <a href={links.website} target="_blank" className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
          <Globe size={18} />
        </a>
      )}
      {links.facebook && (
        <a href={links.facebook} target="_blank" className="p-3 bg-blue-600/10 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
          <Facebook size={18} />
        </a>
      )}
      {links.order_form && (
        <a href={links.order_form} target="_blank" className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
          <ShoppingCart size={18} />
        </a>
      )}
    </div>
  );
}

function QrCodeModal({ url, title, onClose }: { url: string, title: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/32 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white border border-[#D9E1F2] text-[#0F172A] rounded-[40px] w-full max-w-md relative z-10 overflow-hidden shadow-[0_34px_100px_-48px_rgba(15,23,42,0.32)] animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-12 h-12 bg-[#F6F8FF] hover:bg-[#EEF0FF] rounded-full flex items-center justify-center text-[#64748B] transition-colors border border-[#D9E1F2]">
          <ArrowLeft size={24} />
        </button>

        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <QrIcon size={40} className="text-primary" />
          </div>
          
          <h3 className="text-2xl font-black mb-4">QR Code</h3>
          <p className="text-[#475569] mb-8">สแกนเพื่อเปิดแคตตาล็อกนี้บนมือถือ</p>
          
          <div className="bg-[#F8FAFF] border border-[#D9E1F2] p-6 rounded-[28px] mb-6">
            <p className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">QR Code</p>
            <QrCodeImage 
              url={url}
              size={256}
              className="w-full h-auto"
            />
            <p className="mt-4 text-sm font-semibold text-[#475569]">{title}</p>
            <p className="mt-1 break-all text-xs text-[#64748B]">{url}</p>
            <QrCodeDownloadActions
              qrValue={url}
              fileBaseName={`catalog-${title.replace(/\s+/g, '-').toLowerCase() || 'qr'}`}
              titleLine="QR Code"
              nameLine={title}
              bottomLabel="URL"
              bottomLine={url}
              className="mt-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ url, title, onClose }: { url: string, title: string, onClose: () => void }) {
  const shareText = `ดูแคตตาล็อก ${title} สินค้าน่าสนใจมากมาย!`;

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'LINE',
      icon: MessageCircle,
      color: 'bg-green-500',
      href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('คัดลอกลิงก์แล้ว!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/32 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white border border-[#D9E1F2] text-[#0F172A] rounded-[40px] w-full max-w-md relative z-10 overflow-hidden shadow-[0_34px_100px_-48px_rgba(15,23,42,0.32)] animate-in zoom-in slide-in-from-bottom-10 duration-500">
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-12 h-12 bg-[#F6F8FF] hover:bg-[#EEF0FF] rounded-full flex items-center justify-center text-[#64748B] transition-colors border border-[#D9E1F2]">
          <ArrowLeft size={24} />
        </button>

        <div className="p-8">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Share2 size={40} className="text-primary" />
          </div>
          
          <h3 className="text-2xl font-black mb-4">แชร์แคตตาล็อก</h3>
          <p className="text-[#475569] mb-8">เชิญเพื่อนๆ มาชมสินค้าในแคตตาล็อกของคุณ</p>
          
          <div className="space-y-3 mb-6">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                className="w-full flex items-center gap-4 p-4 bg-[#F6F8FF] hover:bg-[#EEF0FF] rounded-2xl transition-all group"
              >
                <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center text-white`}>
                  <link.icon size={20} />
                </div>
                <span className="font-medium group-hover:text-primary transition-colors">{link.name}</span>
              </a>
            ))}
          </div>
          
          <button
            onClick={copyToClipboard}
            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
          >
            <ExternalLink size={20} />
            คัดลอกลิงก์
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({
  product,
  onClose,
  getImageUrl,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}: {
  product: Product;
  onClose: () => void;
  getImageUrl: (url: string | undefined) => string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-[#0F172A]/32 backdrop-blur-xl animate-in fade-in duration-300" onClick={onClose} />

      <button
        type="button"
        onClick={onPrev}
        disabled={!hasPrev}
        aria-label="สินค้าก่อนหน้า"
        className={`hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full border items-center justify-center transition-all ${
          hasPrev
            ? 'bg-white/95 border-[#D9E1F2] text-[#334155] hover:text-[#050579] hover:bg-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.35)]'
            : 'bg-white/50 border-[#E2E8F0] text-[#94A3B8] opacity-50 cursor-not-allowed'
        }`}
      >
        <ChevronLeft size={34} />
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="สินค้าถัดไป"
        className={`hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full border items-center justify-center transition-all ${
          hasNext
            ? 'bg-white/95 border-[#D9E1F2] text-[#334155] hover:text-[#050579] hover:bg-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.35)]'
            : 'bg-white/50 border-[#E2E8F0] text-[#94A3B8] opacity-50 cursor-not-allowed'
        }`}
      >
        <ChevronRight size={34} />
      </button>
      
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[32px] border border-[#D9E1F2] bg-white text-[#0F172A] shadow-[0_34px_100px_-48px_rgba(15,23,42,0.32)] animate-in zoom-in slide-in-from-bottom-10 duration-500 sm:rounded-[40px]">
        <button onClick={onClose} className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] text-[#64748B] transition-colors hover:bg-[#EEF0FF] sm:right-6 sm:top-6 sm:h-12 sm:w-12">
          <ArrowLeft size={24} />
        </button>

        <div className="flex max-h-[92vh] flex-col md:flex-row">
          {/* Gallery Sidebar/Image */}
          <div className="p-3 md:w-1/2 md:p-8">
            <div className="group relative aspect-[4/4.5] overflow-hidden rounded-[28px] bg-black sm:aspect-[4/5] sm:rounded-[32px]">
              <img src={getImageUrl(product.images_json?.[0])} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 bg-white/90 text-primary px-4 py-2 rounded-full font-bold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                        รูปสินค้า
                    </div>
                </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="overflow-y-auto px-5 pb-6 pt-2 md:w-1/2 md:p-12">
            <div className="mb-8">
              {product.brand && (
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B] mb-2">แบรนด์: {product.brand}</p>
              )}
              <h2 className="mb-4 text-2xl font-black leading-tight tracking-tighter md:text-4xl">{product.name}</h2>
              <div className="mb-5 inline-block rounded-full bg-primary/10 px-4 py-2 text-base font-bold text-primary md:text-lg">
                ฿{product.price.toLocaleString()}
              </div>
              <p className="text-base leading-8 text-[#475569] md:text-lg">
                {product.description}
              </p>
            </div>

            {/* Interactive Links for Product */}
            <div className="space-y-4">
               <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Info size={14} /> Actions & Links
               </h4>
               
               <div className="grid grid-cols-1 gap-3">
                  <a 
                    href={product.interactive_links?.order_form || product.interactive_links?.website || DEFAULT_REFERRAL_URL} 
                    target="_blank"
                    className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-base font-bold text-white transition-all hover:bg-primary/90 md:py-5"
                  >
                    {product.interactive_links?.order_form ? 'Order Now' : 'Check Details'} 
                    <ShoppingCart size={20} className="group-hover:translate-x-1 transition-transform" />
                  </a>

                  <div className="grid grid-cols-2 gap-3">
                    {product.interactive_links?.website && (
                      <a href={product.interactive_links.website} target="_blank" className="flex items-center justify-center gap-2 rounded-2xl bg-[#F6F8FF] py-4 transition-all hover:bg-[#EEF0FF] md:py-5">
                        <Globe size={18} /> Website
                      </a>
                    )}
                    {product.interactive_links?.facebook && (
                      <a href={product.interactive_links.facebook} target="_blank" className="flex items-center justify-center gap-2 rounded-2xl bg-[#F6F8FF] py-4 transition-all hover:bg-[#EEF0FF] md:py-5">
                        <Facebook size={18} /> Facebook
                      </a>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
