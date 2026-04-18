import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpsertTemplateFieldDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  @MaxLength(120)
  field_key: string;

  @IsString()
  @MaxLength(180)
  field_label: string;

  @IsString()
  @IsIn(['text', 'textarea', 'image', 'select', 'color'])
  field_type: 'text' | 'textarea' | 'image' | 'select' | 'color';

  @IsOptional()
  @IsString()
  @MaxLength(220)
  placeholder?: string;

  @IsOptional()
  @IsString()
  help_text?: string;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsString()
  default_value?: string;

  @IsOptional()
  @IsArray()
  options_json?: Array<{ label: string; value: string }>;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}
