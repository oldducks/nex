import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
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
            await fsp.unlink(filePath);
            count++;
          }
        } catch (err) {
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
