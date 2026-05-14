import { Controller, Get, Post, Param, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('referrals')
export class ReferralsController {
    constructor(private readonly referralsService: ReferralsService) { }

    // Get or create my referral code
    @Get('my-code')
    @UseGuards(JwtAuthGuard)
    async getMyCode(@Request() req) {
        const code = await this.referralsService.getOrCreateReferralCode(req.user.sub);
        return { referralCode: code };
    }

    // Get my referral stats
    @Get('stats')
    @UseGuards(JwtAuthGuard)
    async getStats(@Request() req) {
        return this.referralsService.getReferralStats(req.user.sub);
    }

    // Get my referral tree
    @Get('tree')
    @UseGuards(JwtAuthGuard)
    async getTree(@Request() req) {
        return this.referralsService.getReferralTree(req.user.sub);
    }

    // Get who referred me
    @Get('my-referrer')
    @UseGuards(JwtAuthGuard)
    async getMyReferrer(@Request() req) {
        const referrer = await this.referralsService.getMyReferrer(req.user.sub);
        return { referrer };
    }

    // Validate a referral code (public endpoint)
    @Get('validate/:code')
    async validateCode(@Param('code') code: string) {
        return this.referralsService.validateReferralCode(code);
    }

    // Admin: Generate codes for existing users
    @Post('generate-existing')
    @UseGuards(JwtAuthGuard)
    async generateForExisting(@Request() req) {
        if (req.user.role !== 'super_admin') {
            throw new ForbiddenException('Only super admin can generate codes');
        }
        return this.referralsService.generateCodesForExistingUsers();
    }

    // Admin: Get all referrals
    @Get('admin/all')
    @UseGuards(JwtAuthGuard)
    async getAllReferrals(@Request() req, @Query('page') page: string = '1', @Query('limit') limit: string = '50') {
        if (req.user.role !== 'super_admin') {
            throw new ForbiddenException('Only super admin can view all referrals');
        }
        return this.referralsService.getAllReferrals(parseInt(page), parseInt(limit));
    }

    @Get('admin/tree/:userId')
    @UseGuards(JwtAuthGuard)
    async getAdminTree(@Request() req, @Param('userId') userId: string) {
        if (req.user.role !== 'super_admin') {
            throw new ForbiddenException('Only super admin can view referral tree');
        }
        return this.referralsService.getReferralTree(parseInt(userId, 10));
    }
}
