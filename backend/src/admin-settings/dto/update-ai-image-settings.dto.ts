import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAiImageSettingsDto {
  @IsOptional()
  @IsIn(['vertex'])
  provider?: 'vertex';

  @IsOptional()
  @IsIn(['cloud_run_proxy', 'api_key'])
  connection_mode?: 'cloud_run_proxy' | 'api_key';

  @IsOptional()
  @IsString()
  provider_url?: string;

  @IsOptional()
  @IsString()
  account_label?: string;

  @IsOptional()
  @IsString()
  promotion_ends_at?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  project_id?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  video_model?: string;

  @IsOptional()
  @IsString()
  api_key?: string;

  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;
}
