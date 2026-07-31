import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCodesService } from './qr-codes.service';
import { QRCode } from './entities/qr-code.entity';
import { AnalyticsAction } from '../analytics/entities/analytics-log.entity';
import { AnalyticsService } from '../analytics/analytics.service';

type MockRepo<T extends object = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

function createMockRepo(): MockRepo<QRCode> {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };
}

describe('QrCodesService', () => {
  let service: QrCodesService;
  let repo: MockRepo<QRCode>;
  let analyticsService: { logEventByUserId: jest.Mock };

  beforeEach(async () => {
    repo = createMockRepo();
    analyticsService = {
      logEventByUserId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrCodesService,
        { provide: getRepositoryToken(QRCode), useValue: repo },
        { provide: AnalyticsService, useValue: analyticsService },
      ],
    }).compile();

    service = module.get<QrCodesService>(QrCodesService);
  });

  describe('buildQrDataUrl', () => {
    it('should build png url with medium size by default', () => {
      const url = service.buildQrDataUrl('https://example.com');
      expect(url).toContain('size=250x250');
      expect(url).toContain('format=png');
      expect(url).toContain('data=https%3A%2F%2Fexample.com');
    });

    it('should build svg url with large size when specified', () => {
      const url = service.buildQrDataUrl('https://example.com/a?b=1', 'large', 'svg');
      expect(url).toContain('size=400x400');
      expect(url).toContain('format=svg');
      expect(url).toContain('data=https%3A%2F%2Fexample.com%2Fa%3Fb%3D1');
    });
  });

  describe('create', () => {
    it('should create and save qr code for owner', async () => {
      const dto: any = {
        name: 'Landing QR',
        qr_type: 'landing_page',
        target_id: 11,
        target_url: 'https://nexsolution.cloud/lp/test',
        size: 'small',
      };

      const created = {
        id: 1,
        ...dto,
        user_id: 99,
        qr_data: 'mock',
      } as QRCode;

      (repo.create as jest.Mock).mockReturnValue(created);
      (repo.save as jest.Mock).mockResolvedValue(created);

      const result = await service.create(99, dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 99,
          name: dto.name,
          qr_type: dto.qr_type,
          target_id: dto.target_id,
          target_url: dto.target_url,
          size: 'small',
          qr_data: expect.stringContaining('format=png'),
        }),
      );
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toBe(created);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when qr does not exist', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(1, 10)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw ForbiddenException when owner mismatch', async () => {
      (repo.findOne as jest.Mock).mockResolvedValue({ id: 1, user_id: 20 });
      await expect(service.findOne(1, 10)).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should regenerate qr_data when target_url or size changed', async () => {
      const existing: any = {
        id: 1,
        user_id: 10,
        name: 'Old',
        qr_type: 'external_url',
        target_id: null,
        target_url: 'https://old.example',
        size: 'medium',
        qr_data: 'old-url',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existing);
      (repo.save as jest.Mock).mockImplementation(async (value) => value);

      const updated = await service.update(1, 10, {
        name: 'New Name',
        target_url: 'https://new.example',
        size: 'large',
      } as any);

      expect(updated.name).toBe('New Name');
      expect(updated.target_url).toBe('https://new.example');
      expect(updated.size).toBe('large');
      expect(updated.qr_data).toContain('size=400x400');
      expect(updated.qr_data).toContain('format=png');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('getPublicQrData', () => {
    it('should increase scan_count and write analytics when visitorId exists', async () => {
      const qr: any = {
        id: 9,
        user_id: 77,
        qr_type: 'form',
        target_id: 33,
        target_url: 'https://nexsolution.cloud/forms/33',
        scan_count: 4,
      };

      (repo.findOne as jest.Mock).mockResolvedValue(qr);
      (repo.save as jest.Mock).mockResolvedValue({ ...qr, scan_count: 5 });

      const result = await service.getPublicQrData(9, 'visitor-1');

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ scan_count: 5 }));
      expect(analyticsService.logEventByUserId).toHaveBeenCalledWith(
        77,
        AnalyticsAction.SCAN_QR,
        'visitor-1',
        {
          qrId: 9,
          qrType: 'form',
          targetId: 33,
          targetUrl: 'https://nexsolution.cloud/forms/33',
        },
      );
      expect(result.scan_count).toBe(5);
    });

    it('should not write analytics when visitorId is missing', async () => {
      const qr: any = {
        id: 3,
        user_id: 12,
        qr_type: 'external_url',
        target_id: null,
        target_url: 'https://example.com',
        scan_count: 1,
      };

      (repo.findOne as jest.Mock).mockResolvedValue(qr);

      const result = await service.getPublicQrData(3, undefined);

      expect(repo.save).not.toHaveBeenCalled();
      expect(analyticsService.logEventByUserId).not.toHaveBeenCalled();
      expect(result).toBe(qr);
    });
  });
});
