import { Controller, Post, Get, Body, Query, UseGuards, Request, Param, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsAction } from './entities/analytics-log.entity';
import { MarketingAnalyticsEvent } from './entities/marketing-analytics-log.entity';
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

    @Post('marketing/log')
    async logMarketingEvent(
        @Body()
        body: {
            pageKey: string;
            eventType: MarketingAnalyticsEvent;
            visitorId?: string;
            videoKey?: string;
            metadata?: any;
        },
    ) {
        if (!body?.pageKey || !body?.eventType) {
            return { success: false, message: 'pageKey and eventType are required' };
        }

        await this.analyticsService.logMarketingEvent({
            pageKey: body.pageKey,
            eventType: body.eventType,
            visitorId: body.visitorId,
            videoKey: body.videoKey,
            metadata: body.metadata,
        });

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

    @UseGuards(JwtAuthGuard)
    @Get('admin/marketing-dashboard')
    async getMarketingDashboard(@Request() req) {
        if (req.user?.role !== 'super_admin') {
            throw new ForbiddenException('เฉพาะ super admin เท่านั้น');
        }
        return this.analyticsService.getMarketingDashboard();
    }
}
