'use client';

import { BookOpen, Dumbbell, Palette, ShoppingBag, Utensils, Car, Home, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Catalog {
    id: number;
    title: string;
    description?: string;
    custom_slug?: string;
    category?: string;
    products?: any[];
}

interface CatalogsDisplayProps {
    catalogs: Catalog[];
}

// Category to icon mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    fitness: <Dumbbell size={32} />,
    education: <Palette size={32} />,
    food: <Utensils size={32} />,
    shopping: <ShoppingBag size={32} />,
    automotive: <Car size={32} />,
    home: <Home size={32} />,
    health: <Heart size={32} />,
    beauty: <Sparkles size={32} />,
};

// Category to gradient mapping
const CATEGORY_GRADIENTS: Record<string, string> = {
    fitness: 'from-orange-500 to-red-500',
    education: 'from-purple-500 to-pink-500',
    food: 'from-yellow-500 to-orange-500',
    shopping: 'from-blue-500 to-cyan-500',
    automotive: 'from-gray-600 to-gray-800',
    home: 'from-green-500 to-teal-500',
    health: 'from-red-400 to-pink-500',
    beauty: 'from-pink-400 to-purple-500',
};

export function CatalogsDisplay({ catalogs }: CatalogsDisplayProps) {
    if (!catalogs || catalogs.length === 0) return null;

    return (
        <section className="mb-12">
            <h3 className="text-lg font-bold mb-6 text-center flex items-center justify-center gap-2">
                <BookOpen size={24} className="text-primary" />
                แคตตาล็อกสินค้า
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {catalogs.map((catalog) => {
                    const icon = CATEGORY_ICONS[catalog.category || ''] || <BookOpen size={32} />;
                    const gradient = CATEGORY_GRADIENTS[catalog.category || ''] || 'from-indigo-500 to-purple-500';
                    const productCount = catalog.products?.length || 0;
                    const catalogUrl = catalog.custom_slug
                        ? `/catalog/${catalog.custom_slug}?view=book`
                        : `/catalog/${catalog.id}?view=book`;

                    return (
                        <Link
                            key={catalog.id}
                            href={catalogUrl}
                            className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

                            {/* Content */}
                            <div className="relative p-4 text-white text-center">
                                {/* Icon */}
                                <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                    {icon}
                                </div>

                                {/* Title */}
                                <h4 className="font-bold text-sm md:text-base line-clamp-2 mb-1">
                                    {catalog.title}
                                </h4>

                                {/* Product Count */}
                                <p className="text-xs text-white/70">
                                    {productCount} รายการ
                                </p>

                                {/* View Button */}
                                <div className="mt-3 py-1.5 px-3 bg-white/20 rounded-full text-xs font-medium inline-flex items-center gap-1 group-hover:bg-white/30 transition-colors">
                                    <BookOpen size={12} />
                                    ดูแคตตาล็อก
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
