'use client';

import { Globe } from 'lucide-react';
import { SOCIAL_ICONS, SOCIAL_COLORS } from './SocialIcons';

interface SocialLink {
    url: string;
    type?: string;
    platform?: string;
}

interface SocialLinksDisplayProps {
    links: SocialLink[];
}

export function SocialLinksDisplay({ links }: SocialLinksDisplayProps) {
    if (!links || links.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
                {links.map((link, i) => {
                    const platform = link.type || link.platform || '';
                    const IconComponent = SOCIAL_ICONS[platform] || Globe;
                    const color = SOCIAL_COLORS[platform] || '#6366F1';
                    return (
                        <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                        >
                            <IconComponent size={24} className="text-white" />
                        </a>
                    );
                })}
            </div>
        </section>
    );
}
