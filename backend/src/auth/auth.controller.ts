import { Controller, Post, Body, UseGuards, Request, UnauthorizedException, Get, Res, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LineAuthService } from './strategies/line.strategy';
import { ReferralsService } from '../referrals/referrals.service';

@Controller('auth')
export class AuthController {
    private frontendUrl: string;

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly lineAuthService: LineAuthService,
        private readonly referralsService: ReferralsService,
    ) {
        this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    }

    private setAuthCookies(res: Response, payload: { access_token: string; uid?: string }) {
        const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
        const secure = isProd;
        const sameSite: 'lax' | 'none' = isProd ? 'none' : 'lax';

        res.cookie('token', payload.access_token, {
            httpOnly: true,
            secure,
            sameSite,
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
        });

        if (payload.uid) {
            res.cookie('uid', payload.uid, {
                httpOnly: false,
                secure,
                sameSite,
                path: '/',
                maxAge: 24 * 60 * 60 * 1000,
            });
        }
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const result = await this.authService.login(user);
        this.setAuthCookies(res, result);
        return result;
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(registerDto.email, registerDto.password, registerDto.referralCode);
        this.setAuthCookies(res, result);
        return result;
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
        const secure = isProd;
        const sameSite: 'lax' | 'none' = isProd ? 'none' : 'lax';

        res.clearCookie('token', { path: '/', secure, sameSite });
        res.clearCookie('uid', { path: '/', secure, sameSite });

        return { success: true };
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.password);
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Post('force-change-password')
    async forceChangePassword(@Request() req, @Body() body: { newPassword: string }) {
        return this.authService.forceChangePassword(req.user.sub, body.newPassword);
    }

    // Google OAuth
    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {
        // Initiates the Google OAuth flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Request() req, @Res() res: Response) {
        const user = await this.authService.validateOAuthUser(req.user);
        if (user) {
            try {
                await this.referralsService.getOrCreateReferralCode(user.id);
            } catch (error) {
                console.error('Failed to generate referral code for Google OAuth user:', error);
            }
        }
        const result = await this.authService.oauthLogin(user);
        this.setAuthCookies(res, result);
        res.redirect(`${this.frontendUrl}/oauth-callback?status=success`);
    }

    // Facebook OAuth
    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth() {
        // Initiates the Facebook OAuth flow
    }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuthCallback(@Request() req, @Res() res: Response) {
        const user = await this.authService.validateOAuthUser(req.user);
        if (user) {
            try {
                await this.referralsService.getOrCreateReferralCode(user.id);
            } catch (error) {
                console.error('Failed to generate referral code for Facebook OAuth user:', error);
            }
        }
        const result = await this.authService.oauthLogin(user);
        this.setAuthCookies(res, result);
        res.redirect(`${this.frontendUrl}/oauth-callback?status=success`);
    }

    // LINE OAuth (custom implementation)
    @Get('line')
    async lineAuth(@Res() res: Response) {
        const state = Math.random().toString(36).substring(7);
        const authUrl = this.lineAuthService.getAuthorizationUrl(state);
        res.redirect(authUrl);
    }

    @Get('line/callback')
    async lineAuthCallback(@Query('code') code: string, @Res() res: Response) {
        try {
            const { access_token, id_token } = await this.lineAuthService.getAccessToken(code);
            const profile = await this.lineAuthService.getProfile(access_token);

            let email: string | undefined;
            if (id_token) {
                const emailData = await this.lineAuthService.verifyAndDecode(id_token);
                email = emailData.email;
            }

            const oauthData = {
                provider: 'line' as const,
                providerId: profile.providerId,
                email,
                displayName: profile.displayName,
                picture: profile.picture,
            };

            const user = await this.authService.validateOAuthUser(oauthData);

            if (user) {
                try {
                    await this.referralsService.getOrCreateReferralCode(user.id);
                } catch (error) {
                    console.error('Failed to generate referral code for LINE OAuth user:', error);
                }
            }

            const result = await this.authService.oauthLogin(user);
            this.setAuthCookies(res, result);
            res.redirect(`${this.frontendUrl}/oauth-callback?status=success`);
        } catch (error) {
            console.error('LINE auth error:', error);
            res.redirect(`${this.frontendUrl}/login?error=line_auth_failed`);
        }
    }
}
