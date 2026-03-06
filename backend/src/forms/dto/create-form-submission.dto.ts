import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class CreateFormSubmissionDto {
  // 提交的数据必须是非空对象，确保不会收到空 payload
  @IsObject()
  @IsNotEmpty()
  data: Record<string, any>;

  @IsOptional()
  @IsObject()
  source?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    referrer?: string;
  };
}

