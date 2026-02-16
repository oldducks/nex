import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFeatureConfigDto {
    @IsBoolean()
    @IsOptional()
    catalog?: boolean;

    @IsBoolean()
    @IsOptional()
    leads?: boolean;

    @IsBoolean()
    @IsOptional()
    namecard?: boolean;

    @IsBoolean()
    @IsOptional()
    'landing-pages'?: boolean;

    @IsBoolean()
    @IsOptional()
    analytics?: boolean;

    @IsBoolean()
    @IsOptional()
    profile?: boolean;
}
