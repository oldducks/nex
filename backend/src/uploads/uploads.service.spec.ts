import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { UploadsService } from './uploads.service';
import { R2StorageService } from './r2-storage.service';

describe('UploadsService', () => {
  let service: UploadsService;
  let queueMock: { add: jest.Mock; getJob: jest.Mock };

  beforeEach(async () => {
    queueMock = {
      add: jest.fn(),
      getJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: getQueueToken('upload-processing'),
          useValue: queueMock,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: R2StorageService,
          useValue: {
            createSignedUploadUrl: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  describe('enqueueImage', () => {
    it('should enqueue image processing job', async () => {
      queueMock.add.mockResolvedValue({ id: 'job-image-1' });

      const result = await service.enqueueImage('/tmp/test-image.jpg', 1);

      expect(queueMock.add).toHaveBeenCalledWith('process-image', {
        type: 'image',
        tempFilePath: '/tmp/test-image.jpg',
        userId: 1,
      });
      expect(result).toEqual({ jobId: 'job-image-1' });
    });
  });

  describe('enqueueVideo', () => {
    it('should enqueue video processing job', async () => {
      queueMock.add.mockResolvedValue({ id: 'job-video-1' });

      const result = await service.enqueueVideo('/tmp/test-video.mp4', 2);

      expect(queueMock.add).toHaveBeenCalledWith('process-video', {
        type: 'video',
        tempFilePath: '/tmp/test-video.mp4',
        userId: 2,
      });
      expect(result).toEqual({ jobId: 'job-video-1' });
    });
  });

  describe('getJobStatus', () => {
    it('should return null if job not found', async () => {
      queueMock.getJob.mockResolvedValue(null);

      const result = await service.getJobStatus('missing-job');

      expect(result).toBeNull();
    });

    it('should return job status payload', async () => {
      const jobMock = {
        id: 'job-1',
        progress: 80,
        returnvalue: { ok: true },
        failedReason: null,
        getState: jest.fn().mockResolvedValue('active'),
      };
      queueMock.getJob.mockResolvedValue(jobMock);

      const result = await service.getJobStatus('job-1');

      expect(result).toEqual({
        id: 'job-1',
        state: 'active',
        progress: 80,
        result: { ok: true },
        failedReason: null,
      });
    });
  });
});
