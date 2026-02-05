import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsAction } from './entities/analytics-log.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    // Public endpoint to log events
    @Post('log')
    async logEvent(@Body() body: { uid: string; action: AnalyticsAction; visitorId: string; metadata?: any }) {
        // We need to resolve uid to userId. Ideally service should handle this or we inject UsersService.
        // For simplicity, let's assume body contains userId if possible, or we look it up.
        // Actually, frontend sends UID. We need to lookup user by UID.
        // Let's delegate this to service later or assume we pass userId. 
        // Wait, for security, public endpoint should probably take UID and service finds User.
        // BUT I don't have UsersService here yet.
        // Let's Update AnalyticsService to look up user by UID if needed, or inject UsersService.
        // For now let's just create the structure. I'll need to inject UsersService in Module.
        return { success: true }; // Placeholder until I link UsersService
    }

    // Protected endpoint for dashboard
    @UseGuards(JwtAuthGuard)
    @Get('stats')
    async getStats(@Request() req, @Query('period') period: 'today' | 'yesterday' | '7days' | '30days' | '1year' | 'all') {
        const userId = req.user.sub;
        return this.analyticsService.getStats(userId, period || '30days');
    }
}
