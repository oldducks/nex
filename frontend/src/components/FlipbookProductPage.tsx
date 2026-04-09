'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FlipbookProductPageProps {
    product: {
        id: number;
        name: string;
        brand?: string;
        description?: string;
        price?: number;
        images_json?: string[];
        interactive_links?: {
            order_form?: string;
            website?: string;
        };
    };
    showName?: boolean;
    showPrice?: boolean;
    showActionButton?: boolean;
}

export function FlipbookProductPage({
    product,
    showName = true,
    showPrice = true,
    showActionButton = true,
}: FlipbookProductPageProps) {
    const DEFAULT_REFERRAL_URL = 'https://nexsolution.cloud/manage/referrals';
    const linkUrl = product.interactive_links?.order_form || product.interactive_links?.website || DEFAULT_REFERRAL_URL;
    const isDocumentMode = !showName && !showPrice && !showActionButton;

    const getImageUrl = (url: string | undefined) => {
        if (!url) return 'https://via.placeholder.com/400x500';
        const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        if (url.startsWith('http')) {
            if (url.includes('localhost:') && SITE_URL.includes('https://nexsolution.cloud')) {
                try {
                    const parsedUrl = new URL(url);
                    if (parsedUrl.pathname.startsWith('/uploads')) {
                        return `${API_URL}${parsedUrl.pathname}`;
                    }
                } catch {}
            }
            return url;
        }
        if (url.startsWith('/uploads')) return `${API_URL}${url}`;
        return url;
    };

    if (isDocumentMode) {
        return (
            <div className="flipbook-product-page w-full h-full bg-white relative z-10">
                <img
                    src={getImageUrl(product.images_json?.[0])}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    decoding="async"
                />
            </div>
        );
    }

    return (
        <>
        <div className="flipbook-product-page w-full h-full bg-[#faf8f5] text-gray-900 p-4 md:p-6 flex flex-col relative z-10">
            {/* Product Image */}
            <div className="flipbook-product-media flex-1 relative rounded-xl overflow-hidden bg-white shadow-lg mb-3 group min-h-0">
                <img
                    src={getImageUrl(product.images_json?.[0])}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    decoding="async"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-xl text-sm">
                            <ShoppingCart size={16} className="text-primary" />
                            <span className="font-bold text-gray-900">กดปุ่มด้านล่างเพื่อสั่งซื้อ</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Info */}
            <div className="flipbook-product-copy space-y-1">
                {product.brand && (
                    <p className="flipbook-product-brand text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 line-clamp-1">
                        แบรนด์: {product.brand}
                    </p>
                )}
                {showName ? (
                    <h3 className="flipbook-product-title text-base md:text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                ) : null}

                {/* Price Badge - Below title */}
                {showPrice ? (
                    <div className="flipbook-product-price inline-block px-3 py-1 bg-primary text-white font-bold rounded-full shadow-lg text-sm">
                        ฿{product.price?.toLocaleString()}
                    </div>
                ) : null}

                <p className="flipbook-product-description text-gray-600 text-xs leading-relaxed line-clamp-2">
                    {product.description}
                </p>
            </div>

            {/* Quick Action Button */}
            {showActionButton ? (
                <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flipbook-product-action mt-2 w-full py-2 bg-primary hover:bg-primary/90 text-white text-center rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingCart size={14} />
                    {product.interactive_links?.order_form ? 'สั่งซื้อสินค้า' : 'ดูรายละเอียด'}
                </a>
            ) : null}
        </div>
        <style jsx>{`
            @media (max-width: 767px) and (orientation: landscape) {
                .flipbook-product-page {
                    padding: 0;
                    display: grid;
                    grid-template-rows: minmax(0, 1fr) auto;
                }

                .flipbook-product-media {
                    margin-bottom: 0;
                    border-radius: 0;
                    box-shadow: none;
                }

                .flipbook-product-copy {
                    padding: 8px 8px 6px;
                    gap: 2px;
                }

                .flipbook-product-brand {
                    font-size: 9px;
                    letter-spacing: 0.12em;
                }

                .flipbook-product-title {
                    font-size: 14px;
                    line-height: 1.15;
                }

                .flipbook-product-price {
                    padding: 4px 10px;
                    font-size: 12px;
                }

                .flipbook-product-description {
                    font-size: 11px;
                    line-height: 1.25;
                    -webkit-line-clamp: 1;
                }

                .flipbook-product-action {
                    margin-top: 6px;
                    min-height: 32px;
                    padding-top: 6px;
                    padding-bottom: 6px;
                    font-size: 12px;
                }
            }
        `}</style>
        </>
    );
}
