import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateLeadDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    occupation?: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsBoolean()
    @IsNotEmpty()
    pdpa_consent: boolean;

    @IsOptional()
    @IsString()
    source_type?: string;

    @IsOptional()
    source_id?: number;

    @IsOptional()
    @IsString()
    source_url?: string;
}
