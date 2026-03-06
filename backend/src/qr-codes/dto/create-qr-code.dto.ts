import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// 创建 QRCode 时使用的 DTO，负责 basic validation
export class CreateQrCodeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsIn(['landing_page', 'form', 'external_url'])
  qr_type: string;

  // 对于 landing_page / form 可以选择性传入 target_id 以便后续追溯
  @IsOptional()
  @IsInt()
  target_id?: number;

  // 最终要被编码进 QR 的 URL（ระยะนี้ให้ frontend ส่งมาโดยตรงก่อน）
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  target_url: string;

  @IsOptional()
  @IsString()
  @IsIn(['small', 'medium', 'large'])
  size?: string;
}

