import {
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { promises as fsp } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { existsSync, mkdirSync } from 'fs';
import { R2StorageService } from './r2-storage.service';

@Processor('upload-processing')
export class UploadsProcessor extends WorkerHost {
  private readonly logger = new Logger(UploadsProcessor.name);
  private readonly tempDir = join(process.cwd(), 'uploads', 'temp');

  constructor(private readonly r2: R2StorageService) {
    super();
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { type, tempFilePath, sourceR2Key, userId } = job.data;

    if (type === 'image') {
      return this.processImage(job, tempFilePath, userId);
    } else if (type === 'video') {
      return this.processVideo(job, tempFilePath, sourceR2Key, userId);
    }
  }

  private async processImage(job: Job, tempFilePath: string, userId: number) {
    const baseName = tempFilePath.split('/').pop()?.split('.')[0] || 'img';
    const filename = `${baseName}.webp`;
    const thumbFilename = `thumb_${filename}`;

    try {
      await job.updateProgress(10);

      const [imageBuffer, thumbBuffer] = await Promise.all([
        sharp(tempFilePath)
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer(),
        sharp(tempFilePath)
          .resize(200, 200, { fit: 'cover' })
          .webp({ quality: 70 })
          .toBuffer(),
      ]);

      await job.updateProgress(60);

      const [url, thumbnailUrl] = await Promise.all([
        this.r2.upload(`${userId}/${filename}`, imageBuffer, 'image/webp'),
        this.r2.upload(`${userId}/${thumbFilename}`, thumbBuffer, 'image/webp'),
      ]);

      await job.updateProgress(90);
      await fsp.unlink(tempFilePath).catch(() => undefined);
      await job.updateProgress(100);

      return {
        url,
        thumbnailUrl,
        filename,
        size: imageBuffer.length,
        mimetype: 'image/webp',
      };
    } catch (error) {
      await fsp.unlink(tempFilePath).catch(() => undefined);
      throw error;
    }
  }

  private async processVideo(job: Job, tempFilePath: string | undefined, sourceR2Key: string | undefined, userId: number) {
    const sourceName = sourceR2Key || tempFilePath || 'video';
    const baseName = sourceName.split('/').pop()?.split('.')[0] || 'video';
    const filename = `${baseName}_compressed.mp4`;
    const thumbFilename = `${filename}.png`;

    // ffmpeg ต้องการ output path จริง ใช้ temp dir
    const tempOutputPath = join(this.tempDir, filename);
    const tempThumbPath = join(this.tempDir, thumbFilename);

    return new Promise((resolve, reject) => {
      const startProcessing = (localInputPath: string, cleanupSource: () => Promise<void>) => {
        ffmpeg(localInputPath)
          .size('?x720')
          .videoCodec('libx264')
          .outputOptions(['-crf 28', '-preset faster', '-movflags +faststart'])
          .on('progress', (progress) => {
            job.updateProgress(Math.floor((progress.percent || 0) * 0.7));
          })
          .on('end', async () => {
            try {
              // Screenshot thumbnail
              await new Promise<void>((res, rej) => {
                ffmpeg(tempOutputPath)
                  .screenshots({
                    timestamps: ['00:00:01'],
                    filename: thumbFilename,
                    folder: this.tempDir,
                    size: '320x240',
                  })
                  .on('end', () => res())
                  .on('error', rej);
              });

              await job.updateProgress(80);

              const [videoBuffer, thumbBuffer] = await Promise.all([
                fsp.readFile(tempOutputPath),
                fsp.readFile(tempThumbPath),
              ]);

              const [url, thumbnailUrl] = await Promise.all([
                this.r2.upload(`${userId}/videos/${filename}`, videoBuffer, 'video/mp4'),
                this.r2.upload(`${userId}/videos/${thumbFilename}`, thumbBuffer, 'image/png'),
              ]);

              await Promise.all([
                cleanupSource(),
                fsp.unlink(tempOutputPath).catch(() => undefined),
                fsp.unlink(tempThumbPath).catch(() => undefined),
              ]);

              await job.updateProgress(100);
              resolve({
                url,
                thumbnailUrl,
                filename,
                size: videoBuffer.length,
                mimetype: 'video/mp4',
              });
            } catch (err) {
              reject(err);
            }
          })
          .on('error', async (err) => {
            await cleanupSource().catch(() => undefined);
            reject(err);
          })
          .save(tempOutputPath);
      };

      const prepareSource = async () => {
        let localInputPath: string | null = tempFilePath || null;
        const cleanupTasks: Array<() => Promise<void>> = [];

        if (sourceR2Key) {
          const r2TempPath = join(this.tempDir, `${Date.now()}-${baseName}-source`);
          await this.r2.downloadToFile(sourceR2Key, r2TempPath);
          localInputPath = r2TempPath;
          cleanupTasks.push(() => fsp.unlink(r2TempPath).catch(() => undefined));
          cleanupTasks.push(() => this.r2.delete(sourceR2Key));
          await job.updateProgress(5);
        } else if (tempFilePath) {
          cleanupTasks.push(() => fsp.unlink(tempFilePath).catch(() => undefined));
        } else {
          throw new Error('Missing video source');
        }

        const cleanupSource = async () => {
          await Promise.all(cleanupTasks.map((task) => task()));
        };

        if (!localInputPath) {
          throw new Error('Missing prepared video source');
        }

        startProcessing(localInputPath, cleanupSource);
      };

      prepareSource().catch(reject);
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} has been completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed: ${err.message}`);
  }
}
