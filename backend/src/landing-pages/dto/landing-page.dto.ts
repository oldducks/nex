import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateLandingPageDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    content_blocks?: any[];

    @IsOptional()
    theme_config?: any;

    @IsOptional()
    seo_metadata?: any;

    @IsBoolean()
    @IsOptional()
    is_published?: boolean;
}

export class UpdateLandingPageDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    content_blocks?: any[];

    @IsOptional()
    theme_config?: any;

    @IsOptional()
    seo_metadata?: any;

    @IsBoolean()
    @IsOptional()
    is_published?: boolean;
}
