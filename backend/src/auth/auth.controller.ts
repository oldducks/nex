import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        return this.authService.login(user);
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
}
