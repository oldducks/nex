import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

const cookieTokenExtractor = (req: Request): string | null => {
    if (!req?.headers?.cookie) return null;
    const parts = req.headers.cookie.split(';').map((p) => p.trim());
    const tokenPair = parts.find((p) => p.startsWith('token='));
    if (!tokenPair) return null;
    const raw = tokenPair.slice('token='.length);
    return decodeURIComponent(raw);
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                cookieTokenExtractor,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'secretKey',
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, sub: payload.sub, email: payload.email, role: payload.role, uid: payload.uid, group_id: payload.group_id };
    }
}
