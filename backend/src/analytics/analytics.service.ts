import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AnalyticsLog, AnalyticsAction } from './entities/analytics-log.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AnalyticsService implements OnModuleInit {
    constructor(
        @InjectRepository(AnalyticsLog)
        private analyticsRepository: Repository<AnalyticsLog>,
        private usersService: UsersService,
    ) { }

    async onModuleInit() {
        try {
            await this.analyticsRepository.query(`
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM pg_type
                        WHERE typname = 'analytics_logs_action_enum'
                    ) THEN
                        IF NOT EXISTS (
                            SELECT 1
                            FROM pg_enum e
                            JOIN pg_type t ON e.enumtypid = t.oid
                            WHERE t.typname = 'analytics_logs_action_enum'
                              AND e.enumlabel = 'LOGIN_SUCCESS'
                        ) THEN
                            ALTER TYPE analytics_logs_action_enum ADD VALUE 'LOGIN_SUCCESS';
                        END IF;
                    END IF;
                END
                $$;
            `);
        } catch (error) {
            // Non-blocking: service can still run with existing action set.
            console.warn('Analytics enum patch skipped:', (error as Error)?.message || error);
        }
    }

    async logEvent(uid: string, action: AnalyticsAction, visitorId: string, metadata?: any) {
        const user = await this.usersService.findOneByUid(uid);
        if (!user) return null;

        const log = this.analyticsRepository.create({
            user_id: (user as any).id || user['id'], // TypeORM returns entity, ensuring ID access
            action,
            visitor_id: visitorId,
            metadata
        });
        return this.analyticsRepository.save(log);
    }

    /**
     * Log analytics event when we already know userId (ใช้ในกรณี internal service เช่น QR scan)
     */
    async logEventByUserId(userId: number, action: AnalyticsAction, visitorId: string, metadata?: any) {
        const log = this.analyticsRepository.create({
            user_id: userId,
            action,
            visitor_id: visitorId,
            metadata,
        });
        return this.analyticsRepository.save(log);
    }

    async getStats(userId: number, period: 'today' | 'yesterday' | '7days' | '30days' | '1year' | 'all') {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(endDate.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case '7days':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30days':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '1year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            case 'all':
                startDate = new Date(0); // Epoch
                break;
        }

        // Aggregate counts by action
        const stats = await this.analyticsRepository
            .createQueryBuilder('log')
            .select('log.action', 'action')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.user_id = :userId', { userId })
            .andWhere('log.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
            .groupBy('log.action')
            .getRawMany();

        // Format as object
        const result: Record<string, number> = {
            [AnalyticsAction.VIEW_PROFILE]: 0,
            [AnalyticsAction.DOWNLOAD_VCF]: 0,
            [AnalyticsAction.VIEW_CATALOG]: 0,
            [AnalyticsAction.DOWNLOAD_PDF]: 0,
            [AnalyticsAction.VIEW_LANDING_PAGE]: 0,
            [AnalyticsAction.SUBMIT_LANDING_FORM]: 0,
            [AnalyticsAction.SCAN_QR]: 0,
            [AnalyticsAction.LOGIN_SUCCESS]: 0,
        };

        stats.forEach(item => {
            result[item.action] = parseInt(item.count, 10);
        });

        return result;
    }

    async getDailyStats(userId: number, period: '7days' | '30days' = '30days') {
        const now = new Date();
        const startDate = new Date();
        
        if (period === '7days') {
            startDate.setDate(now.getDate() - 7);
        } else {
            startDate.setDate(now.getDate() - 30);
        }
        startDate.setHours(0, 0, 0, 0);

        const stats = await this.analyticsRepository
            .createQueryBuilder('log')
            .select("DATE_TRUNC('day', log.created_at)", 'date')
            .addSelect('COUNT(log.id)', 'count')
            .where('log.user_id = :userId', { userId })
            .andWhere('log.created_at >= :startDate', { startDate })
            .groupBy("DATE_TRUNC('day', log.created_at)")
            .orderBy("DATE_TRUNC('day', log.created_at)", 'ASC')
            .getRawMany();

        // Fill missing dates with 0
        const result: { date: string; count: number }[] = [];
        const current = new Date(startDate);
        while (current <= now) {
            const dateStr = current.toISOString().split('T')[0];
            const found = stats.find(s => {
                const sDate = new Date(s.date).toISOString().split('T')[0];
                return sDate === dateStr;
            });
            result.push({
                date: dateStr,
                count: found ? parseInt(found.count, 10) : 0
            });
            current.setDate(current.getDate() + 1);
        }

        return result;
    }

    async getLandingPageViews(userId: number, pageId: number) {
        const count = await this.analyticsRepository
            .createQueryBuilder('log')
            .where('log.user_id = :userId', { userId })
            .andWhere('log.action = :action', { action: AnalyticsAction.VIEW_LANDING_PAGE })
            .andWhere("log.metadata->>'pageId' = :pageId", { pageId: String(pageId) })
            .getCount();

        return { pageId, views: count };
    }

    async getAllUsersStats() {
        // Get aggregated stats for all users
        const stats = await this.analyticsRepository
            .createQueryBuilder('log')
            .select('log.user_id', 'userId')
            .addSelect('log.action', 'action')
            .addSelect('COUNT(log.id)', 'count')
            .addSelect('MAX(log.created_at)', 'lastActivity')
            .groupBy('log.user_id')
            .addGroupBy('log.action')
            .getRawMany();

        // Group by user
        const userStats: Record<number, any> = {};
        stats.forEach(item => {
                if (!userStats[item.userId]) {
                    userStats[item.userId] = {
                        userId: item.userId,
                        viewCount: 0,
                        downloadVcf: 0,
                        viewCatalog: 0,
                        downloadPdf: 0,
                        loginSuccess: 0,
                        lastActivity: null
                    };
                }
            userStats[item.userId][this.actionToKey(item.action)] = parseInt(item.count, 10);
            if (!userStats[item.userId].lastActivity || new Date(item.lastActivity) > new Date(userStats[item.userId].lastActivity)) {
                userStats[item.userId].lastActivity = item.lastActivity;
            }
        });

        return Object.values(userStats);
    }

    async getExecutiveActivity(days: number) {
        const now = new Date();
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - Math.max(0, days - 1));

        const [summary, activeUsersRaw, dailyRaw] = await Promise.all([
            this.analyticsRepository
                .createQueryBuilder('log')
                .select('log.action', 'action')
                .addSelect('COUNT(log.id)', 'count')
                .where('log.created_at >= :startDate', { startDate })
                .andWhere('log.created_at <= :now', { now })
                .groupBy('log.action')
                .getRawMany<{ action: AnalyticsAction; count: string }>(),
            this.analyticsRepository
                .createQueryBuilder('log')
                .select('COUNT(DISTINCT log.user_id)', 'count')
                .where('log.created_at >= :startDate', { startDate })
                .andWhere('log.created_at <= :now', { now })
                .getRawOne<{ count: string }>(),
            this.analyticsRepository
                .createQueryBuilder('log')
                .select("TO_CHAR(log.created_at::date, 'YYYY-MM-DD')", 'date')
                .addSelect('log.action', 'action')
                .addSelect('COUNT(log.id)', 'count')
                .where('log.created_at >= :startDate', { startDate })
                .andWhere('log.created_at <= :now', { now })
                .groupBy('log.created_at::date')
                .addGroupBy('log.action')
                .orderBy('log.created_at::date', 'ASC')
                .getRawMany<{ date: string; action: AnalyticsAction; count: string }>(),
        ]);

        const summaryMap = new Map(summary.map((item) => [item.action, Number(item.count || 0)]));

        return {
            activeUsersInPeriod: Number(activeUsersRaw?.count || 0),
            loginSuccessInPeriod: summaryMap.get(AnalyticsAction.LOGIN_SUCCESS) || 0,
            viewProfileInPeriod: summaryMap.get(AnalyticsAction.VIEW_PROFILE) || 0,
            viewCatalogInPeriod: summaryMap.get(AnalyticsAction.VIEW_CATALOG) || 0,
            downloadVcfInPeriod: summaryMap.get(AnalyticsAction.DOWNLOAD_VCF) || 0,
            downloadPdfInPeriod: summaryMap.get(AnalyticsAction.DOWNLOAD_PDF) || 0,
            viewLandingPageInPeriod: summaryMap.get(AnalyticsAction.VIEW_LANDING_PAGE) || 0,
            dailyActivity: dailyRaw.map((item) => ({
                date: item.date,
                action: item.action,
                count: Number(item.count || 0),
            })),
        };
    }

    private actionToKey(action: AnalyticsAction): string {
        switch (action) {
            case AnalyticsAction.VIEW_PROFILE: return 'viewCount';
            case AnalyticsAction.DOWNLOAD_VCF: return 'downloadVcf';
            case AnalyticsAction.VIEW_CATALOG: return 'viewCatalog';
            case AnalyticsAction.DOWNLOAD_PDF: return 'downloadPdf';
            case AnalyticsAction.SCAN_QR: return 'scanQr';
            case AnalyticsAction.LOGIN_SUCCESS: return 'loginSuccess';
            default: return 'viewCount';
        }
    }
}
