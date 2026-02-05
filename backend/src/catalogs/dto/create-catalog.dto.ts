import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCatalogDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    custom_slug?: string;

    @IsOptional()
    layout_config?: any;

    @IsOptional()
    interactive_links?: any;

    @IsString()
    @IsOptional()
    category?: string;
}
