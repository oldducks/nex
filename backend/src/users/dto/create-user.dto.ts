import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    uid: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
