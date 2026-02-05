import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
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
