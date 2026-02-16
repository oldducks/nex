// Type definitions for Profile JSONB fields
export interface I18nField {
    lang: string;
    value: string;
}

export interface ContactField {
    label: string;
    value: string;
}

export interface ImageWithPosition {
    url: string;
    position: { x: number; y: number };
    scale?: number;
    objectPosition?: string; // CSS object-position, e.g., "center top"
}

export interface ProfilePicConfig {
    url: string;
    position: 'left' | 'center' | 'right' | 'overlay';
    crop?: { x: number; y: number; width: number; height: number };
    objectPosition?: string; // e.g., "center 20%"
}

export interface WebsiteLink {
    label: string;
    url: string;
    position?: string;
}

export interface LayoutConfig {
    sections: string[];
    profile_position: 'left' | 'center' | 'right' | 'overlay';
    theme: string;
    display_theme?: 'dark' | 'light';
    primary_color?: string;
    background_color?: string;
    font_family?: string;
    card_style?: 'glass' | 'solid' | 'outline';
    video_url?: string;
    show_gallery?: boolean;
    show_lead_form?: boolean;
}

// Theme customization
export interface ThemeConfig {
    mode: 'light' | 'dark';
    backgroundColor: string;
    backgroundGradient?: string;
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large';
    textColor: string;
    accentColor: string;
}

// Video configuration
export interface VideoConfig {
    url: string;
    autoplay: boolean;
    link_url?: string;
    link_enabled: boolean;
    enabled: boolean;
}
