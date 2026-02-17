import { IsString, IsOptional, IsArray, IsObject, MaxLength, ArrayMaxSize } from 'class-validator';
import type {
    I18nField,
    ContactField,
    ImageWithPosition,
    ProfilePicConfig,
    WebsiteLink,
    LayoutConfig,
    VideoConfig
} from '../types/profile.types';

export class CreateProfileDto {
    // Legacy single-language fields
    @IsString()
    @IsOptional()
    @MaxLength(100)
    full_name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    position?: string;

    @IsString()
    @IsOptional()
    @MaxLength(100)
    company_name?: string;

    // Multi-language fields
    @IsArray()
    @IsOptional()
    @ArrayMaxSize(10)
    names_i18n?: I18nField[];

    @IsArray()
    @IsOptional()
    @ArrayMaxSize(10)
    positions_i18n?: I18nField[];

    @IsArray()
    @IsOptional()
    @ArrayMaxSize(10)
    companies_i18n?: I18nField[];

    // Multiple contacts
    @IsArray()
    @IsOptional()
    @ArrayMaxSize(10)
    emails?: ContactField[];

    @IsArray()
    @IsOptional()
    @ArrayMaxSize(10)
    phones?: ContactField[];

    // Legacy contact fields
    @IsString()
    @IsOptional()
    mobile?: string;

    @IsString()
    @IsOptional()
    email_contact?: string;

    @IsString()
    @IsOptional()
    line_id?: string;

    @IsString()
    @IsOptional()
    website?: string;

    @IsString()
    @IsOptional()
    address?: string;

    // Images with positioning
    @IsObject()
    @IsOptional()
    profile_pic?: ProfilePicConfig;

    @IsString()
    @IsOptional()
    profile_pic_url?: string;

    @IsObject()
    @IsOptional()
    profile_pic_position?: { x: number; y: number; scale: number };

    @IsObject()
    @IsOptional()
    logo?: ImageWithPosition;

    @IsArray()
    @IsOptional()
    @ArrayMaxSize(10)
    backgrounds?: ImageWithPosition[];

    @IsArray()
    @IsOptional()
    @ArrayMaxSize(10)
    banners?: ImageWithPosition[];

    @IsString()
    @IsOptional()
    cover_pic_url?: string;

    // Website links (multiple)
    @IsArray()
    @IsOptional()
    @ArrayMaxSize(10)
    websites?: WebsiteLink[];

    // About Me / Interests
    @IsString()
    @IsOptional()
    about_me?: string;

    @IsArray()
    @IsOptional()
    @ArrayMaxSize(50)
    interests?: string[];

    // Layout Configuration
    @IsObject()
    @IsOptional()
    layout_config?: LayoutConfig;

    // Theme & Design
    @IsString()
    @IsOptional()
    theme_color?: string;

    @IsObject()
    @IsOptional()
    card_design_json?: Record<string, any>;

    @IsArray()
    @IsOptional()
    social_links_json?: Record<string, any>[];

    @IsObject()
    @IsOptional()
    video_config?: VideoConfig;
}
