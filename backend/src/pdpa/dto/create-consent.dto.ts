import { IsBoolean, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateConsentDto {
  @IsString()
  @IsOptional()
  visitor_id?: string;

  @IsBoolean()
  accepted_all: boolean;

  @IsObject()
  consents: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}
