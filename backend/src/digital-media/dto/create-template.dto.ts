import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';
import { UpsertTemplateFieldDto } from './upsert-template-field.dto';

export class CreateTemplateDto {
  @IsString()
  @MaxLength(180)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  category_name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cover_image_url?: string;

  @IsOptional()
  @IsString()
  preview_video_url?: string;

  @IsOptional()
  @IsString()
  @IsIn(['image', 'video'])
  media_type?: 'image' | 'video';

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  enable_product_replace?: boolean;

  @IsOptional()
  @IsString()
  product_mask_url?: string;

  @IsString()
  prompt_template: string;

  @IsOptional()
  @IsString()
  negative_prompt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  style_preset?: string;

  @IsOptional()
  @IsString()
  @IsIn(['1:1', '4:5', '9:16'])
  aspect_ratio?: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'active', 'inactive'])
  status?: 'draft' | 'active' | 'inactive';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertTemplateFieldDto)
  fields?: UpsertTemplateFieldDto[];
}
