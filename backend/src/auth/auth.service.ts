import { Injectable, UnauthorizedException, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, OAuthUserData } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { ReferralsService } from '../referrals/referrals.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
        @Inject(forwardRef(() => ReferralsService))
        private referralsService: ReferralsService,
    ) { }

    // OAuth login/registration
    async validateOAuthUser(data: OAuthUserData) {
        // Check if user exists with this provider ID
        let user = await this.usersService.findByProviderId(data.provider, data.providerId);

        if (user) {
            // Existing OAuth user - just log them in
            return user;
        }

        // Check if email exists (to link accounts)
        if (data.email) {
            const existingUser = await this.usersService.findOneByEmail(data.email);
            if (existingUser) {
                // Link this OAuth provider to existing account
                user = await this.usersService.linkOAuthProvider(existingUser.id, data.provider, data.providerId);
                return user;
            }
        }

        // Create new user
        user = await this.usersService.createOAuthUser(data);
        
        // Process referral if code provided
        if (data.referralCode) {
            try {
                await this.referralsService.processReferral(user.id, data.referralCode, 0);
                console.log('Referral processed for OAuth user:', user.id, 'with code:', data.referralCode);
            } catch (error) {
                console.error('Failed to process OAuth referral:', error);
            }
        }
        
        return user;
    }

    async oauthLogin(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role, uid: user.uid, group_id: user.group_id };
        return {
            access_token: this.jwtService.sign(payload),
            uid: user.uid,
            is_new_user: !user.profile, // Check if profile exists
        };
    }

    // Self-registration
    async register(email: string | undefined, phoneNumber: string | undefined, password: string, fullName?: string, referralCode?: string) {
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedPhone = phoneNumber?.trim();

        if (!normalizedEmail && !normalizedPhone) {
            throw new BadRequestException('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์อย่างใดอย่างหนึ่ง');
        }

        if (normalizedEmail) {
            const existingEmail = await this.usersService.findOneByEmail(normalizedEmail);
            if (existingEmail) {
                throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
            }
        }

        if (normalizedPhone) {
            const existingPhone = await this.usersService.findOneByPhone(normalizedPhone);
            if (existingPhone) {
                throw new ConflictException('เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว');
            }
        }

        // Create user
        const user = await this.usersService.createSelfRegisteredUser(normalizedEmail, password, fullName, normalizedPhone, referralCode);

        // Always ensure new user has their own referral code for sharing
        try {
            await this.referralsService.getOrCreateReferralCode(user.id);
        } catch (error) {
            console.error('Failed to generate referral code for new user:', error);
            // ไม่ให้ registration ล้มแม้จะสร้างโค้ดแนะนำไม่สำเร็จ
        }

        // Process referral if code provided (เชื่อมสาย ref ถ้ามี)
        if (referralCode) {
            try {
                await this.referralsService.processReferral(user.id, referralCode, 0); // 0 = no registration fee yet
            } catch (error) {
                console.error('Failed to process referral:', error);
                // Don't fail registration if referral processing fails
            }
        }

        // Log them in
        return this.login(user);
    }

    async validateUser(identifier: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmailOrPhone(identifier);
        if (user && user.password_hash && (await bcrypt.compare(pass, user.password_hash))) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role, uid: user.uid, group_id: user.group_id };
        return {
            access_token: this.jwtService.sign(payload),
            uid: user.uid,
            must_change_password: user.must_change_password || false,
        };
    }

    async forgotPassword(email: string) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not for security
            return { message: 'หากอีเมลนี้มีอยู่ในระบบ ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปแล้ว' };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await this.usersService.setResetToken(user.id, hashedToken, expires);

        // Send email with reset link
        await this.mailService.sendPasswordResetEmail(email, resetToken);

        return { message: 'หากอีเมลนี้มีอยู่ในระบบ ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปแล้ว' };
    }

    async resetPassword(token: string, newPassword: string) {
        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await this.usersService.findByResetToken(hashedToken);

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        if (user.reset_token_expires < new Date()) {
            throw new BadRequestException('Reset token has expired');
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(user.id, hashedPassword);
        // Clear must_change_password flag
        await this.usersService.clearMustChangePassword(user.id);

        return { message: 'Password reset successfully' };
    }

    async changePassword(userId: number, currentPassword: string, newPassword: string) {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(user.id, hashedPassword);
        // Clear must_change_password flag
        await this.usersService.clearMustChangePassword(user.id);

        return { message: 'Password changed successfully' };
    }

    async forceChangePassword(userId: number, newPassword: string) {
        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(user.id, hashedPassword);
        await this.usersService.clearMustChangePassword(user.id);

        return { message: 'Password changed successfully' };
    }
}
