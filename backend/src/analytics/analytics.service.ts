import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsLog, AnalyticsAction } from './entities/analytics-log.entity';
import { MarketingAnalyticsEvent, MarketingAnalyticsLog } from './entities/marketing-analytics-log.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AnalyticsService implements OnModuleInit {
    constructor(
        @InjectRepository(AnalyticsLog)
        private analyticsRepository: Repository<AnalyticsLog>,
        @InjectRepository(MarketingAnalyticsLog)
        private marketingAnalyticsRepository: Repository<MarketingAnalyticsLog>,
        private usersService: UsersService,
    ) { }

    async onModuleInit() {
        try {
            await this.analyticsRepository.query(`
                DO $$
                BEGIN
                    CREATE TYPE marketing_analytics_logs_event_type_enum AS ENUM (
                        'PAGE_VIEW',
                        'VIDEO_IMPRESSION',
                        'VIDEO_PLAY',
                        'VIDEO_AUTOPLAY',
                        'VIDEO_COMPLETE'
                    );
                EXCEPTION
                    WHEN duplicate_object THEN NULL;
                END
                $$;
            `);

            await this.analyticsRepository.query(`
                CREATE TABLE IF NOT EXISTS marketing_analytics_logs (
                    id SERIAL PRIMARY KEY,
                    page_key VARCHAR(120) NOT NULL,
                    video_key VARCHAR(160),
                    visitor_id VARCHAR(255),
                    event_type marketing_analytics_logs_event_type_enum NOT NULL,
                    metadata JSONB,
                    created_at TIMESTAMP NOT NULL DEFAULT now()
                );
            `);

            await this.analyticsRepository.query(`
                CREATE INDEX IF NOT EXISTS idx_marketing_analytics_page_created_at
                ON marketing_analytics_logs (page_key, created_at DESC);
            `);

            await this.analyticsRepository.query(`
                CREATE INDEX IF NOT EXISTS idx_marketing_analytics_video_created_at
                ON marketing_analytics_logs (video_key, created_at DESC);
            `);

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
            for (const eventLabel of Object.values(MarketingAnalyticsEvent)) {
                await this.analyticsRepository.query(`
                    DO $$
                    BEGIN
                        IF EXISTS (
                            SELECT 1
                            FROM pg_type
                            WHERE typname = 'marketing_analytics_logs_event_type_enum'
                        ) THEN
                            IF NOT EXISTS (
                                SELECT 1
                                FROM pg_enum e
                                JOIN pg_type t ON e.enumtypid = t.oid
                                WHERE t.typname = 'marketing_analytics_logs_event_type_enum'
                                  AND e.enumlabel = '${eventLabel}'
                            ) THEN
                                ALTER TYPE marketing_analytics_logs_event_type_enum ADD VALUE '${eventLabel}';
                            END IF;
                        END IF;
                    END
                    $$;
                `);
            }
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

    async logMarketingEvent(payload: {
        pageKey: string;
        eventType: MarketingAnalyticsEvent;
        visitorId?: string | null;
        videoKey?: string | null;
        metadata?: Record<string, any> | null;
    }) {
        if (!payload.pageKey || !payload.eventType) return null;

        const log = this.marketingAnalyticsRepository.create({
            page_key: payload.pageKey,
            video_key: payload.videoKey || null,
            visitor_id: payload.visitorId || null,
            event_type: payload.eventType,
            metadata: payload.metadata || null,
        });
        return this.marketingAnalyticsRepository.save(log);
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

    async getMarketingDashboard() {
        const pageDefinitions = [
            { key: 'start', label: 'หน้าเริ่มต้น NEX', path: '/start' },
            { key: 'nex-control-your-future-preview', label: 'NEX Control Your Future Preview', path: '/nex-control-your-future-preview' },
            { key: 'what-is-nex-preview', label: 'What is NEX Preview', path: '/what-is-nex-preview' },
            { key: 'nex-digital-asset-partner-preview', label: 'NEX Digital Asset Partner Preview', path: '/nex-digital-asset-partner-preview' },
            { key: 'enterprise-mos-preview', label: 'Enterprise MOS Preview', path: '/enterprise-mos-preview' },
        ] as const;

        const videoDefinitions = [
            { pageKey: 'start', videoKey: 'catalog-demo', label: 'วิดีโอ NEX Catalog' },
            { pageKey: 'start', videoKey: 'salepage-demo', label: 'วิดีโอ NEX Sale Page' },
            { pageKey: 'nex-control-your-future-preview', videoKey: 'hero-preview', label: 'วิดีโอพรีวิวหลัก' },
            { pageKey: 'what-is-nex-preview', videoKey: 'hero-preview', label: 'วิดีโอพรีวิวหลัก' },
            { pageKey: 'nex-digital-asset-partner-preview', videoKey: 'hero-preview', label: 'วิดีโอพรีวิวหลัก' },
            { pageKey: 'enterprise-mos-preview', videoKey: 'hero-preview', label: 'วิดีโอพรีวิวหลัก' },
        ] as const;

        const periods = {
            day: this.getMarketingPeriodStart('day'),
            week: this.getMarketingPeriodStart('week'),
            month: this.getMarketingPeriodStart('month'),
            year: this.getMarketingPeriodStart('year'),
            all: null,
        } as const;

        const counts = await Promise.all(
            Object.entries(periods).map(async ([periodKey, startDate]) => {
                const pageKeys = pageDefinitions.map((page) => page.key);
                const qb = this.marketingAnalyticsRepository
                    .createQueryBuilder('log')
                    .select('log.page_key', 'pageKey')
                    .addSelect('log.video_key', 'videoKey')
                    .addSelect('log.event_type', 'eventType')
                    .addSelect('COUNT(log.id)', 'count')
                    .where('log.page_key IN (:...pageKeys)', { pageKeys });

                if (startDate) {
                    qb.andWhere('log.created_at >= :startDate', { startDate });
                }

                qb.groupBy('log.page_key')
                    .addGroupBy('log.video_key')
                    .addGroupBy('log.event_type');

                const rows = await qb.getRawMany<{ pageKey: string; videoKey: string | null; eventType: MarketingAnalyticsEvent; count: string }>();
                return [periodKey, rows] as const;
            }),
        );

        const rowsByPeriod = new Map(counts);

        const pageStats = pageDefinitions.map((page) => {
            const videos = videoDefinitions
                .filter((video) => video.pageKey === page.key)
                .map((video) => ({
                    key: video.videoKey,
                    label: video.label,
                    counts: this.buildMarketingCounts(rowsByPeriod, page.key, video.videoKey),
                }));

            return {
                key: page.key,
                label: page.label,
                path: page.path,
                pageViews: this.buildMarketingCounts(rowsByPeriod, page.key, null)[MarketingAnalyticsEvent.PAGE_VIEW],
                videos,
            };
        });

        const totals = {
            pageViews: this.sumMarketingCounts(pageStats.map((page) => page.pageViews)),
            videoImpressions: this.sumMarketingCounts(pageStats.flatMap((page) => page.videos.map((video) => video.counts[MarketingAnalyticsEvent.VIDEO_IMPRESSION]))),
            videoPlays: this.sumMarketingCounts(pageStats.flatMap((page) => page.videos.map((video) => video.counts[MarketingAnalyticsEvent.VIDEO_PLAY]))),
            videoAutoplays: this.sumMarketingCounts(pageStats.flatMap((page) => page.videos.map((video) => video.counts[MarketingAnalyticsEvent.VIDEO_AUTOPLAY]))),
            videoCompletions: this.sumMarketingCounts(pageStats.flatMap((page) => page.videos.map((video) => video.counts[MarketingAnalyticsEvent.VIDEO_COMPLETE]))),
        };

        return {
            generatedAt: new Date().toISOString(),
            periods: {
                day: 'วันนี้',
                week: 'สัปดาห์นี้',
                month: 'เดือนนี้',
                year: 'ปีนี้',
                all: 'ทั้งหมด',
            },
            pages: pageStats,
            totals,
        };
    }

    private getMarketingPeriodStart(period: 'day' | 'week' | 'month' | 'year') {
        const now = new Date();
        const startDate = new Date(now);

        if (period === 'day') {
            startDate.setHours(0, 0, 0, 0);
            return startDate;
        }

        if (period === 'week') {
            startDate.setHours(0, 0, 0, 0);
            const weekdayIndex = (startDate.getDay() + 6) % 7;
            startDate.setDate(startDate.getDate() - weekdayIndex);
            return startDate;
        }

        if (period === 'month') {
            startDate.setHours(0, 0, 0, 0);
            startDate.setDate(1);
            return startDate;
        }

        startDate.setHours(0, 0, 0, 0);
        startDate.setMonth(0, 1);
        return startDate;
    }

    private buildMarketingCounts(
        rowsByPeriod: Map<string, { pageKey: string; videoKey: string | null; eventType: MarketingAnalyticsEvent; count: string }[]>,
        pageKey: string,
        videoKey: string | null,
    ) {
        const periodKeys = ['day', 'week', 'month', 'year', 'all'] as const;
        const eventKeys = [
            MarketingAnalyticsEvent.PAGE_VIEW,
            MarketingAnalyticsEvent.VIDEO_IMPRESSION,
            MarketingAnalyticsEvent.VIDEO_PLAY,
            MarketingAnalyticsEvent.VIDEO_AUTOPLAY,
            MarketingAnalyticsEvent.VIDEO_COMPLETE,
        ] as const;

        const result = eventKeys.reduce((acc, eventKey) => {
            acc[eventKey] = periodKeys.reduce((periodAcc, periodKey) => {
                const rows = rowsByPeriod.get(periodKey) || [];
                const matched = rows.find((row) =>
                    row.pageKey === pageKey &&
                    (row.videoKey || null) === (videoKey || null) &&
                    row.eventType === eventKey,
                );
                periodAcc[periodKey] = matched ? Number(matched.count || 0) : 0;
                return periodAcc;
            }, {} as Record<typeof periodKeys[number], number>);
            return acc;
        }, {} as Record<typeof eventKeys[number], Record<typeof periodKeys[number], number>>);

        return result;
    }

    private sumMarketingCounts(items: Record<'day' | 'week' | 'month' | 'year' | 'all', number>[]) {
        return items.reduce(
            (acc, item) => {
                acc.day += item.day || 0;
                acc.week += item.week || 0;
                acc.month += item.month || 0;
                acc.year += item.year || 0;
                acc.all += item.all || 0;
                return acc;
            },
            { day: 0, week: 0, month: 0, year: 0, all: 0 },
        );
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
