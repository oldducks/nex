import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { promises as fsp } from 'fs';
import { join } from 'path';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import TelegramBot from 'node-telegram-bot-api';
import { nanoid } from 'nanoid';
import { R2StorageService } from './r2-storage.service';

const execAsync = promisify(exec);

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadsBaseDir = join(process.cwd(), 'uploads');
  private readonly tempDir = join(process.cwd(), 'uploads', 'temp');
  private readonly chunkedDir = join(process.cwd(), 'uploads', 'temp', 'chunked');
  private bot: TelegramBot | null = null;

  constructor(
    @InjectQueue('upload-processing') private uploadQueue: Queue,
    private readonly configService: ConfigService,
    private readonly r2StorageService: R2StorageService,
  ) {}

  onModuleInit() {
    this.initTelegramBot();
  }

  private initTelegramBot() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const expectedChatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    
    if (!token) {
      this.logger.warn('Telegram bot token not configured, skipping bot initialization.');
      return;
    }

    this.bot = new TelegramBot(token, { polling: true });

    this.bot?.onText(/\/(status|clean)/, async (msg, match) => {
      const chatId = msg.chat.id;
      
      // Ensure only authorized user/chat can trigger these
      if (expectedChatId && String(chatId) !== expectedChatId) {
        return;
      }

      const command = match ? match[1] : null;

      if (command === 'status') {
        await this.bot!.sendMessage(chatId, "⏳ *กำลังตรวจสอบระบบ...*", { parse_mode: 'Markdown' });
        const reportMsg = await this.generateSystemReport(null);
        await this.bot!.sendMessage(chatId, reportMsg, { parse_mode: 'Markdown' });
      } 
      else if (command === 'clean') {
        await this.bot!.sendMessage(chatId, "🧹 *กำลังเริ่มลล้างไฟล์ขยะแบบทันที...*", { parse_mode: 'Markdown' });
        const count = await this.performCleanup(true); // true = force delete all
        const reportMsg = await this.generateSystemReport(count);
        await this.bot!.sendMessage(chatId, reportMsg, { parse_mode: 'Markdown' });
      }
    });

    this.bot?.on('polling_error', (error) => {
      // Ignore polling errors to prevent log spam
    });
  }

  async enqueueImage(tempFilePath: string, userId: number) {
    const job = await this.uploadQueue.add('process-image', {
      type: 'image',
      tempFilePath,
      userId,
    });
    return { jobId: job.id };
  }

  async enqueueVideo(tempFilePath: string, userId: number) {
    const job = await this.uploadQueue.add('process-video', {
      type: 'video',
      tempFilePath,
      userId,
    });
    return { jobId: job.id };
  }

  async createDirectVideoUpload(fileName: string, contentType: string, userId: number) {
    const safeExtension = this.getSafeVideoExtension(fileName, contentType);
    const objectKey = `${userId}/incoming-videos/${Date.now()}-${nanoid(10)}${safeExtension}`;
    const uploadUrl = await this.r2StorageService.createSignedUploadUrl(objectKey, contentType);

    return {
      objectKey,
      uploadUrl,
    };
  }

  async enqueueVideoFromR2(objectKey: string, userId: number) {
    const exists = await this.r2StorageService.exists(objectKey);
    if (!exists) {
      throw new BadRequestException('Uploaded R2 object not found');
    }

    const job = await this.uploadQueue.add('process-video', {
      type: 'video',
      sourceR2Key: objectKey,
      userId,
    });

    return { jobId: job.id };
  }

  async createChunkedVideoUploadSession(
    fileName: string,
    contentType: string,
    fileSize: number,
    totalChunks: number,
    userId: number,
  ) {
    const safeExtension = this.getSafeVideoExtension(fileName, contentType);
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!fileName?.trim() || !contentType?.trim() || !allowedTypes.includes(contentType)) {
      throw new BadRequestException('Invalid video metadata');
    }
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > 200 * 1024 * 1024) {
      throw new BadRequestException('Video file size must be between 1 byte and 200MB');
    }
    if (!Number.isInteger(totalChunks) || totalChunks <= 0 || totalChunks > 200) {
      throw new BadRequestException('Invalid chunk count');
    }

    const uploadId = `${Date.now()}-${nanoid(10)}`;
    const sessionDir = join(this.chunkedDir, uploadId);
    await fsp.mkdir(sessionDir, { recursive: true });
    await fsp.writeFile(
      join(sessionDir, 'meta.json'),
      JSON.stringify({
        uploadId,
        fileName,
        contentType,
        fileSize,
        totalChunks,
        userId,
        extension: safeExtension,
        createdAt: new Date().toISOString(),
      }),
      'utf8',
    );

    return { uploadId, chunkSize: 8 * 1024 * 1024 };
  }

  async storeChunkedVideoChunk(uploadId: string, userId: number, index: number, buffer: Buffer) {
    const meta = await this.readChunkedUploadMeta(uploadId);
    if (meta.userId !== userId) {
      throw new BadRequestException('Upload session does not belong to this user');
    }
    if (index >= meta.totalChunks) {
      throw new BadRequestException('Chunk index out of range');
    }

    const sessionDir = join(this.chunkedDir, uploadId);
    await fsp.writeFile(join(sessionDir, `${index}.part`), buffer);
    return { ok: true, index };
  }

  async completeChunkedVideoUpload(uploadId: string, userId: number) {
    const meta = await this.readChunkedUploadMeta(uploadId);
    if (meta.userId !== userId) {
      throw new BadRequestException('Upload session does not belong to this user');
    }

    const sessionDir = join(this.chunkedDir, uploadId);
    const outputPath = join(this.tempDir, `chunked-${uploadId}${meta.extension}`);
    const writer = createWriteStream(outputPath);

    try {
      let totalBytes = 0;
      for (let index = 0; index < meta.totalChunks; index += 1) {
        const chunkPath = join(sessionDir, `${index}.part`);
        const stats = await fsp.stat(chunkPath).catch(() => null);
        if (!stats?.isFile()) {
          throw new BadRequestException(`Missing chunk ${index + 1}/${meta.totalChunks}`);
        }
        totalBytes += stats.size;
        const chunkBuffer = await fsp.readFile(chunkPath);
        const canContinue = writer.write(chunkBuffer);
        if (!canContinue) {
          await new Promise<void>((resolve, reject) => {
            writer.once('drain', () => resolve());
            writer.once('error', reject);
          });
        }
      }
      writer.end();
      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      if (Math.abs(totalBytes - meta.fileSize) > 0) {
        this.logger.warn(`Chunked upload size mismatch for ${uploadId}: expected ${meta.fileSize}, got ${totalBytes}`);
      }

      await fsp.rm(sessionDir, { recursive: true, force: true }).catch(() => undefined);
      return this.enqueueVideo(outputPath, userId);
    } catch (error) {
      writer.destroy();
      await fsp.unlink(outputPath).catch(() => undefined);
      throw error;
    }
  }

  async getJobStatus(jobId: string) {
    const job = await this.uploadQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    return {
      id: job.id,
      state,
      progress,
      result,
      failedReason,
    };
  }

  private getSafeVideoExtension(fileName: string, contentType: string): string {
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith('.mp4') || contentType === 'video/mp4') return '.mp4';
    if (lowerName.endsWith('.webm') || contentType === 'video/webm') return '.webm';
    if (lowerName.endsWith('.ogg') || contentType === 'video/ogg') return '.ogg';
    if (lowerName.endsWith('.mov') || contentType === 'video/quicktime') return '.mov';
    if (lowerName.endsWith('.avi') || contentType === 'video/x-msvideo') return '.avi';
    return '.mp4';
  }

  private async readChunkedUploadMeta(uploadId: string): Promise<{
    uploadId: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    totalChunks: number;
    userId: number;
    extension: string;
    createdAt: string;
  }> {
    const sessionDir = join(this.chunkedDir, uploadId);
    const metaPath = join(sessionDir, 'meta.json');
    const raw = await fsp.readFile(metaPath, 'utf8').catch(() => null);
    if (!raw) {
      throw new BadRequestException('Upload session not found');
    }
    return JSON.parse(raw);
  }

  private async performCleanup(forceAll = false): Promise<number> {
    let count = 0;
    if (existsSync(this.tempDir)) {
      const files = await fsp.readdir(this.tempDir);
      const now = Date.now();
      const mask = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = join(this.tempDir, file);
        try {
          const stats = await fsp.stat(filePath);
          if (forceAll || now - stats.mtimeMs > mask) {
            if (stats.isDirectory()) {
              await fsp.rm(filePath, { recursive: true, force: true });
            } else {
              await fsp.unlink(filePath);
            }
            count++;
          }
        } catch (err: any) {
          this.logger.error(`Failed to delete temp file ${file}: ${err.message}`);
        }
      }
    }
    return count;
  }

  private async generateSystemReport(deletedCount: number | null): Promise<string> {
    let diskInfo = 'N/A';
    let ramInfo = 'N/A';
    let systemStatus = 'Normal ✅';
    let diskPercent = 0;
    let memPercent = 0;
    
    try {
      const { stdout: dfOut } = await execAsync("df -h / | awk 'NR==2 {print $3\"/\"$2\" (\"$5\")\"}'");
      diskInfo = dfOut.trim();
      const match = diskInfo.match(/\((\d+)%\)/);
      if (match) diskPercent = parseInt(match[1], 10);
    } catch (e) {
      this.logger.error(`Failed to get disk info: ${e.message}`);
    }

    try {
      const { stdout: freeOut } = await execAsync("free -m | awk 'NR==2 {printf \"%sMB / %sMB (%.0f%%)\", $3, $2, $3*100/$2}'");
      ramInfo = freeOut.trim();
      const match = ramInfo.match(/\((\d+)%\)/);
      if (match) memPercent = parseInt(match[1], 10);
    } catch (e) {
      this.logger.error(`Failed to get RAM info: ${e.message}`);
    }

    const cpuCount = os.cpus().length;
    const cpuLoadNum = Math.round((os.loadavg()[0] / cpuCount) * 100);
    const cpuLoad = `${cpuLoadNum}%`;

    if (diskPercent > 80 || memPercent > 90 || cpuLoadNum > 80) systemStatus = 'Warning ⚠️';
    if (diskPercent > 90 || memPercent > 95 || cpuLoadNum > 90) systemStatus = 'Critical 🚨';

    const hostName = os.hostname() || 'Nex';
    let reportMsg = `📊 *[DAILY REPORT] dpat02(${hostName})*\n- DISK: ${diskInfo} (Limit: 80%)\n- RAM: ${ramInfo} (Limit: 90%)\n- CPU: ${cpuLoad} (Limit: 80%)\n- Status: ${systemStatus}`;
    
    if (deletedCount !== null) {
        reportMsg += `\n- ลบไฟล์ขยะไป: ${deletedCount} ไฟล์`;
    }

    return reportMsg;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupTempFiles() {
    this.logger.log('Starting cleanup of old temporary upload files...');
    const count = await this.performCleanup(false);
    this.logger.log(`Cleanup finished. Deleted ${count} files.`);

    const reportMsg = await this.generateSystemReport(count);
    await this.notifyTelegram(reportMsg);
  }

  private async notifyTelegram(message: string) {
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');
    
    // Attempt sending via bot instance if possible
    if (this.bot && chatId) {
       this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
       return;
    }

    // Fallback to fetch
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken || !chatId) {
      return;
    }
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (err) {
      this.logger.error(`Failed to send Telegram notification: ${err.message}`);
    }
  }
}
