import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional, IsNumberString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    uid: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @IsOptional()
    @IsNumberString()
    group_id?: string;
}
