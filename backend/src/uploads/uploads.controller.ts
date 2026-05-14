import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { promises as fsp } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadsService } from './uploads.service';

const tempUploadPath = join(process.cwd(), 'uploads', 'temp');

const ensureTempDir = () => {
  if (!existsSync(tempUploadPath)) {
    mkdirSync(tempUploadPath, { recursive: true });
  }
};

const tempStorage = diskStorage({
  destination: (req, file, cb) => {
    ensureTempDir();
    cb(null, tempUploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${timestamp}-${randomStr}${ext}`);
  },
});

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: tempStorage,
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed (jpg, png, gif, webp)'), false);
        }
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user?.sub;
    if (!userId) {
      await fsp.unlink(file.path).catch(() => undefined);
      throw new BadRequestException('User not authenticated');
    }

    return await this.uploadsService.enqueueImage(file.path, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: tempStorage,
      limits: {
        fileSize: 200 * 1024 * 1024, // 200MB for background queue
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only video files are allowed (mp4, webm, ogg, mov, avi)'), false);
        }
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user?.sub;
    if (!userId) {
      await fsp.unlink(file.path).catch(() => undefined);
      throw new BadRequestException('User not authenticated');
    }

    return await this.uploadsService.enqueueVideo(file.path, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('video/direct/init')
  async initDirectVideoUpload(
    @Body() body: { fileName?: string; contentType?: string; fileSize?: number },
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const fileName = body?.fileName?.trim();
    const contentType = body?.contentType?.trim();
    const fileSize = Number(body?.fileSize || 0);
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];

    if (!fileName || !contentType || !allowedTypes.includes(contentType)) {
      throw new BadRequestException('Invalid video metadata');
    }

    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > 200 * 1024 * 1024) {
      throw new BadRequestException('Video file size must be between 1 byte and 200MB');
    }

    return await this.uploadsService.createDirectVideoUpload(fileName, contentType, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('video/direct/complete')
  async completeDirectVideoUpload(
    @Body() body: { objectKey?: string },
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const objectKey = body?.objectKey?.trim();
    if (!objectKey) {
      throw new BadRequestException('Missing uploaded object key');
    }

    return await this.uploadsService.enqueueVideoFromR2(objectKey, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('video/chunked/init')
  async initChunkedVideoUpload(
    @Body() body: { fileName?: string; contentType?: string; fileSize?: number; totalChunks?: number },
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return await this.uploadsService.createChunkedVideoUploadSession(
      body?.fileName || '',
      body?.contentType || '',
      Number(body?.fileSize || 0),
      Number(body?.totalChunks || 0),
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('video/chunked/:uploadId/chunk')
  @UseInterceptors(
    FileInterceptor('chunk', {
      storage: memoryStorage(),
      limits: {
        fileSize: 12 * 1024 * 1024,
      },
    }),
  )
  async uploadChunkedVideoChunk(
    @Param('uploadId') uploadId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { index?: string | number },
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException('Missing upload chunk');
    }

    const index = Number(body?.index);
    if (!Number.isInteger(index) || index < 0) {
      throw new BadRequestException('Invalid chunk index');
    }

    return await this.uploadsService.storeChunkedVideoChunk(uploadId, userId, index, file.buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Post('video/chunked/:uploadId/complete')
  async completeChunkedVideoUpload(
    @Param('uploadId') uploadId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return await this.uploadsService.completeChunkedVideoUpload(uploadId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('job/:id')
  async getJobStatus(@Param('id') id: string) {
    const status = await this.uploadsService.getJobStatus(id);
    if (!status) {
      throw new BadRequestException('Job not found');
    }
    return status;
  }
}
