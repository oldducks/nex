import {
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { BadRequestException, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { promises as fsp } from 'fs';
import { join, extname } from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { existsSync, mkdirSync } from 'fs';

@Processor('upload-processing')
export class UploadsProcessor extends WorkerHost {
  private readonly logger = new Logger(UploadsProcessor.name);
  private readonly uploadsBaseDir = join(process.cwd(), 'uploads');
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  private getUserUploadDir(userId: number | string, subFolder = ''): string {
    const dir = join(this.uploadsBaseDir, String(userId), subFolder);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { type, tempFilePath, userId } = job.data;

    if (type === 'image') {
      return this.processImage(job, tempFilePath, userId);
    } else if (type === 'video') {
      return this.processVideo(job, tempFilePath, userId);
    }
  }

  private async processImage(job: Job, tempFilePath: string, userId: number) {
    const userDir = this.getUserUploadDir(userId);
    const baseName = tempFilePath.split('/').pop()?.split('.')[0] || 'img';
    const filename = `${baseName}.webp`;
    const finalPath = join(userDir, filename);

    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = join(userDir, thumbnailFilename);

    try {
      await job.updateProgress(10);
      
      // 1. Process original
      await sharp(tempFilePath)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(finalPath);
        
      await job.updateProgress(60);

      // 2. Thumbnail
      await sharp(tempFilePath)
        .resize(200, 200, { fit: 'cover' })
        .webp({ quality: 70 })
        .toFile(thumbnailPath);

      await job.updateProgress(90);

      const stat = await fsp.stat(finalPath);
      await fsp.unlink(tempFilePath).catch(() => undefined);

      await job.updateProgress(100);

      return {
        url: `/uploads/${userId}/${filename}`,
        thumbnailUrl: `/uploads/${userId}/${thumbnailFilename}`,
        filename,
        size: stat.size,
        mimetype: 'image/webp',
      };
    } catch (error) {
      await fsp.unlink(tempFilePath).catch(() => undefined);
      throw error;
    }
  }

  private async processVideo(job: Job, tempFilePath: string, userId: number) {
    const userDir = this.getUserUploadDir(userId, 'videos');
    const baseName = tempFilePath.split('/').pop()?.split('.')[0] || 'video';
    const filename = `${baseName}_compressed.mp4`;
    const finalPath = join(userDir, filename);
    const thumbnailFilename = `${filename}.png`;

    return new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .size('?x720')
        .videoCodec('libx264')
        .outputOptions(['-crf 28', '-preset faster', '-movflags +faststart'])
        .on('progress', (progress) => {
            // progress.percent is from 0 to 100
            job.updateProgress(Math.floor(progress.percent || 0));
        })
        .on('end', async () => {
          try {
            ffmpeg(finalPath)
              .screenshots({
                timestamps: ['00:00:01'],
                filename: thumbnailFilename,
                folder: userDir,
                size: '320x240',
              })
              .on('end', async () => {
                const stat = await fsp.stat(finalPath);
                await fsp.unlink(tempFilePath).catch(() => undefined);
                await job.updateProgress(100);
                resolve({
                  url: `/uploads/${userId}/videos/${filename}`,
                  thumbnailUrl: `/uploads/${userId}/videos/${thumbnailFilename}`,
                  filename,
                  size: stat.size,
                  mimetype: 'video/mp4',
                });
              })
              .on('error', (err) => reject(err));
          } catch (err) {
            reject(err);
          }
        })
        .on('error', async (err) => {
          await fsp.unlink(tempFilePath).catch(() => undefined);
          reject(err);
        })
        .save(finalPath);
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
