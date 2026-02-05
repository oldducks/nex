import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateProductDto {
    @IsNumber()
    @IsNotEmpty()
    catalog_id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsArray()
    @IsOptional()
    images_json?: string[];

    @IsNumber()
    @IsOptional()
    order?: number;

    @IsOptional()
    interactive_links?: any;
}
