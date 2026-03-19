'use client';

import { Globe, ExternalLink } from 'lucide-react';
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
        <section className="mb-8">
            <div className="mb-3 text-center">
                <h3 className="text-lg font-bold text-foreground">Social & Channel</h3>
                <p className="mt-1 text-sm text-foreground/55">เลือกช่องทางที่สะดวกเพื่อเชื่อมต่อหรือดูผลงานเพิ่มเติม</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {links.map((link, i) => {
                    const platform = link.type || link.platform || '';
                    const IconComponent = SOCIAL_ICONS[platform] || Globe;
                    const color = SOCIAL_COLORS[platform] || '#6366F1';
                    const label = platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Link';

                    return (
                        <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-[22px] border border-[#D9E1F2] bg-white/80 px-4 py-3 text-left shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:bg-white"
                        >
                            <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                                style={{ backgroundColor: `${color}18`, color }}
                            >
                                <IconComponent size={22} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-[#0F172A]">{label}</div>
                                <div className="truncate text-sm text-[#475569]">{link.url}</div>
                            </div>
                            <ExternalLink size={16} className="shrink-0 text-[#94A3B8]" />
                        </a>
                    );
                })}
            </div>
        </section>
    );
}
