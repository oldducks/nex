import { IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateFromTemplateDto {
  @IsString()
  template_slug: string;

  @IsObject()
  input: Record<string, any>;

  @IsOptional()
  @IsString()
  @IsIn(['1:1', '4:5', '9:16', '16:9'])
  aspect_ratio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  prompt_override?: string;
}
