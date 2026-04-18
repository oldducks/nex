import { IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class GenerateImageDirectDto {
  @IsString()
  @MaxLength(6000)
  prompt: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reference_image_urls?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['1:1', '4:5', '9:16', '16:9'])
  aspect_ratio?: '1:1' | '4:5' | '9:16' | '16:9';
}
