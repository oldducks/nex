import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FormFieldConfigDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  type: string; // text, email, phone, dropdown, textarea

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  options?: string[];
}

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldConfigDto)
  fields: FormFieldConfigDto[];
}

