import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  full_name?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  mobile?: string;
}
