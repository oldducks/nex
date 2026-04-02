import { IsEmail, IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { IsBasicPassword, IsStrongPassword } from '../../common/validators/password.validator';

export class LoginDto {
    @IsOptional()
    @IsString()
    identifier?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'phone must contain only digits and phone symbols' })
    phone?: string;

    @IsNotEmpty()
    password: string;
}

export class RegisterDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9+\-\s()]+$/, { message: 'phoneNumber must contain only digits and phone symbols' })
    phoneNumber?: string;

    @IsBasicPassword()
    password: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    referralCode?: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsStrongPassword()
    password: string;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    currentPassword: string;

    @IsStrongPassword()
    newPassword: string;
}
