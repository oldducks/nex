import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsLog, AnalyticsAction } from './entities/analytics-log.entity';
import { MarketingAnalyticsLog } from './entities/marketing-analytics-log.entity';
import { UsersService } from '../users/users.service';

type MockRepo<T extends object = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

function createMockRepo(): MockRepo {
  return {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let repo: MockRepo<AnalyticsLog>;
  let marketingRepo: MockRepo<MarketingAnalyticsLog>;
  let usersService: { findOneByUid: jest.Mock };

  beforeEach(async () => {
    repo = createMockRepo();
    marketingRepo = createMockRepo();
    usersService = {
      findOneByUid: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getRepositoryToken(AnalyticsLog), useValue: repo },
        { provide: getRepositoryToken(MarketingAnalyticsLog), useValue: marketingRepo },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('logEventByUserId', () => {
    it('should create and save log using userId directly', async () => {
      (repo.create as jest.Mock).mockImplementation((data) => data);
      (repo.save as jest.Mock).mockImplementation(async (data) => ({
        id: 1,
        ...data,
      }));

      const result = await service.logEventByUserId(42, AnalyticsAction.SCAN_QR, 'visitor-123', {
        qrId: 9,
      });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 42,
          action: AnalyticsAction.SCAN_QR,
          visitor_id: 'visitor-123',
          metadata: { qrId: 9 },
        }),
      );
      expect(repo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('getStats', () => {
    it('should aggregate stats and include SCAN_QR and landing events', async () => {
      const qb: any = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { action: AnalyticsAction.VIEW_LANDING_PAGE, count: '5' },
          { action: AnalyticsAction.SUBMIT_LANDING_FORM, count: '2' },
          { action: AnalyticsAction.SCAN_QR, count: '7' },
        ]),
      };
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.getStats(10, '7days');

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('log');
      expect(result[AnalyticsAction.VIEW_LANDING_PAGE]).toBe(5);
      expect(result[AnalyticsAction.SUBMIT_LANDING_FORM]).toBe(2);
      expect(result[AnalyticsAction.SCAN_QR]).toBe(7);
    });
  });

  describe('getLandingPageViews', () => {
    it('should query by userId, action and pageId metadata', async () => {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(12),
      };
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.getLandingPageViews(55, 101);

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('log');
      expect(qb.where).toHaveBeenCalledWith('log.user_id = :userId', { userId: 55 });
      expect(qb.andWhere).toHaveBeenCalledWith('log.action = :action', {
        action: AnalyticsAction.VIEW_LANDING_PAGE,
      });
      expect(qb.andWhere).toHaveBeenCalledWith("log.metadata->>'pageId' = :pageId", {
        pageId: '101',
      });
      expect(result).toEqual({ pageId: 101, views: 12 });
    });
  });
});
