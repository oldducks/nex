import { Controller, Post, Get, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsAction } from './entities/analytics-log.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    // Public endpoint to log events
    @Post('log')
    async logEvent(@Body() body: { uid: string; action: AnalyticsAction; visitorId: string; metadata?: any }) {
        if (!body?.uid || !body?.action || !body?.visitorId) {
            return { success: false, message: 'uid, action, and visitorId are required' };
        }

        await this.analyticsService.logEvent(body.uid, body.action, body.visitorId, body.metadata);
        return { success: true };
    }

    // Protected endpoint for dashboard
    @UseGuards(JwtAuthGuard)
    @Get('stats')
    async getStats(@Request() req, @Query('period') period: 'today' | 'yesterday' | '7days' | '30days' | '1year' | 'all') {
        const userId = req.user.sub;
        return this.analyticsService.getStats(userId, period || '30days');
    }

    @UseGuards(JwtAuthGuard)
    @Get('stats/daily')
    async getDailyStats(@Request() req, @Query('period') period: '7days' | '30days') {
        const userId = req.user.sub;
        return this.analyticsService.getDailyStats(userId, period || '30days');
    }

    // View count per landing page (for owner dashboard)
    @UseGuards(JwtAuthGuard)
    @Get('landing-pages/:id/views')
    async getLandingPageViews(@Request() req, @Param('id') id: string) {
        const userId = req.user.sub;
        return this.analyticsService.getLandingPageViews(userId, Number(id));
    }
}
