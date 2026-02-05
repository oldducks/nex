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

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsBoolean()
    pdpa_consent: boolean;
}
