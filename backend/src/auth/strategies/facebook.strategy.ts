import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(private configService: ConfigService) {
        super({
            clientID: configService.get('FACEBOOK_APP_ID') || '',
            clientSecret: configService.get('FACEBOOK_APP_SECRET') || '',
            callbackURL: `${configService.get('API_URL') || 'http://localhost:4000'}/auth/facebook/callback`,
            scope: ['email'],
            profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
            passReqToCallback: false,
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (err: any, user: any) => void,
    ): Promise<any> {
        const { id, name, emails, photos } = profile;
        const user = {
            provider: 'facebook',
            providerId: id,
            email: emails?.[0]?.value,
            firstName: name?.givenName,
            lastName: name?.familyName,
            picture: photos?.[0]?.value,
        };
        done(null, user);
    }
}
