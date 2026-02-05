import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    package_name: string;

    @IsOptional()
    @IsString()
    slip_url?: string;
}

export class ApproveOrderDto {
    // No body needed, action comes from endpoint
}

export class RejectOrderDto {
    @IsNotEmpty()
    @IsString()
    reason: string;
}
