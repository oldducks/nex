import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LineProfile {
    provider: string;
    providerId: string;
    email?: string;
    displayName: string;
    picture?: string;
}

@Injectable()
export class LineAuthService {
    private readonly channelId: string;
    private readonly channelSecret: string;
    private readonly callbackURL: string;

    constructor(private configService: ConfigService) {
        this.channelId = configService.get('LINE_CHANNEL_ID') || '';
        this.channelSecret = configService.get('LINE_CHANNEL_SECRET') || '';
        this.callbackURL = `${configService.get('API_URL') || 'http://localhost:4000'}/auth/line/callback`;
    }

    getAuthorizationUrl(state: string): string {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.channelId,
            redirect_uri: this.callbackURL,
            state,
            scope: 'profile openid email',
        });
        return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
    }

    async getAccessToken(code: string): Promise<{ access_token: string; id_token?: string }> {
        const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.callbackURL,
                client_id: this.channelId,
                client_secret: this.channelSecret,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to get LINE access token');
        }

        return response.json();
    }

    async getProfile(accessToken: string): Promise<LineProfile> {
        const response = await fetch('https://api.line.me/v2/profile', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get LINE profile');
        }

        const profile = await response.json();

        return {
            provider: 'line',
            providerId: profile.userId,
            displayName: profile.displayName,
            picture: profile.pictureUrl,
        };
    }

    async verifyAndDecode(idToken: string): Promise<{ email?: string }> {
        const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                id_token: idToken,
                client_id: this.channelId,
            }),
        });

        if (!response.ok) {
            return {};
        }

        const data = await response.json();
        return { email: data.email };
    }
}
