import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import type {
    I18nField,
    ContactField,
    ImageWithPosition,
    ProfilePicConfig,
    WebsiteLink,
    LayoutConfig,
    ThemeConfig,
    VideoConfig
} from '../types/profile.types';

@Entity('profiles')
export class Profile {
    @PrimaryColumn()
    user_id: number;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    // Legacy single-language fields (kept for backward compatibility)
    @Column({ length: 100, nullable: true })
    full_name: string;

    @Column({ length: 100, nullable: true })
    position: string;

    @Column({ length: 100, nullable: true })
    company_name: string;

    // Multi-language fields
    @Column({ type: 'jsonb', default: [] })
    names_i18n: I18nField[];

    @Column({ type: 'jsonb', default: [] })
    positions_i18n: I18nField[];

    @Column({ type: 'jsonb', default: [] })
    companies_i18n: I18nField[];

    // Multiple contacts
    @Column({ type: 'jsonb', default: [] })
    emails: ContactField[];

    @Column({ type: 'jsonb', default: [] })
    phones: ContactField[];

    // Legacy single contact fields
    @Column({ length: 20, nullable: true })
    mobile: string;

    @Column({ length: 100, nullable: true })
    email_contact: string;

    @Column({ length: 50, nullable: true })
    line_id: string;

    @Column({ length: 255, nullable: true })
    website: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    // Images with positioning
    @Column({ type: 'jsonb', nullable: true })
    profile_pic: ProfilePicConfig;

    @Column({ type: 'text', nullable: true })
    profile_pic_url: string; // Legacy

    @Column({ type: 'jsonb', nullable: true })
    logo: ImageWithPosition;

    @Column({ type: 'jsonb', default: [] })
    backgrounds: ImageWithPosition[];

    @Column({ type: 'jsonb', default: [] })
    banners: ImageWithPosition[];

    @Column({ type: 'text', nullable: true })
    cover_pic_url: string; // Legacy

    // Website links (multiple)
    @Column({ type: 'jsonb', default: [] })
    websites: WebsiteLink[];

    // About Me / Interests
    @Column({ type: 'text', nullable: true })
    about_me: string;

    @Column({ type: 'jsonb', default: [] })
    interests: string[];

    // Layout Configuration
    @Column({ type: 'jsonb', nullable: true })
    layout_config: LayoutConfig;

    // Theme & Design
    @Column({ length: 10, nullable: true })
    theme_color: string;

    @Column({ type: 'jsonb', nullable: true })
    card_design_json: Record<string, any>;

    @Column({ type: 'jsonb', default: [] })
    social_links_json: Record<string, any>[];

    // Theme customization (light/dark, colors, fonts)
    @Column({ type: 'jsonb', nullable: true })
    theme_config: ThemeConfig;

    @Column({ type: 'jsonb', nullable: true, default: { x: 50, y: 50, scale: 1 } })
    profile_pic_position: { x: number; y: number; scale: number };

    @Column({ type: 'text', nullable: true })
    video_url: string;

    // Video configuration with autoplay, link, enabled settings
    @Column({ type: 'jsonb', nullable: true })
    video_config: VideoConfig;

    @Column({ type: 'jsonb', default: [] })
    gallery: string[];
}
