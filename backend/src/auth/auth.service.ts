import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
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

