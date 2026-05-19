import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GenerateFromTemplateDto } from './dto/generate-from-template.dto';
import { GenerateImageDirectDto } from './dto/generate-image-direct.dto';
import { DigitalMediaService } from './digital-media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, parse } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { promises as fsPromises } from 'fs';
import sharp from 'sharp';

const digitalMediaUploadPath = join(process.cwd(), 'uploads', 'digital-media');
const compressibleMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_EDGE = 1600;
const WEBP_QUALITY = 80;
const THUMB_MAX_EDGE = 420;
const THUMB_WEBP_QUALITY = 72;

const ensureDigitalMediaUploadDir = () => {
  if (!existsSync(digitalMediaUploadPath)) {
    mkdirSync(digitalMediaUploadPath, { recursive: true });
  }
};

const imageStorage = diskStorage({
  destination: (req, file, cb) => {
    ensureDigitalMediaUploadDir();
    cb(null, digitalMediaUploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `dm-${timestamp}-${random}${ext}`);
  },
});

async function writeThumbnailFromSource(sourcePath: string, thumbnailPath: string): Promise<void> {
  await sharp(sourcePath, { failOn: 'none' })
    .rotate()
    .resize({
      width: THUMB_MAX_EDGE,
      height: THUMB_MAX_EDGE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: THUMB_WEBP_QUALITY, effort: 4 })
    .toFile(thumbnailPath);
}

async function optimizeUploadedImage(file: Express.Multer.File): Promise<{ filename: string; thumbnailFilename?: string }> {
  if (!compressibleMimeTypes.has(file.mimetype)) {
    return { filename: file.filename };
  }

  const originalPath = file.path;
  const parsed = parse(file.filename);
  const optimizedFilename = `${parsed.name}.webp`;
  const optimizedPath = join(digitalMediaUploadPath, optimizedFilename);
  const thumbFilename = `${parsed.name}-thumb.webp`;
  const thumbPath = join(digitalMediaUploadPath, thumbFilename);

  try {
    const originalStat = await fsPromises.stat(originalPath);

    await sharp(originalPath, { failOn: 'none' })
      .rotate()
      .resize({
        width: MAX_IMAGE_EDGE,
        height: MAX_IMAGE_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(optimizedPath);

    const optimizedStat = await fsPromises.stat(optimizedPath);

    if (file.mimetype === 'image/webp' && optimizedStat.size >= originalStat.size) {
      await fsPromises.unlink(optimizedPath).catch(() => undefined);
      await writeThumbnailFromSource(originalPath, thumbPath).catch(() => undefined);
      return {
        filename: file.filename,
        thumbnailFilename: thumbFilename,
      };
    }

    await writeThumbnailFromSource(optimizedPath, thumbPath).catch(() => undefined);
    await fsPromises.unlink(originalPath).catch(() => undefined);
    return {
      filename: optimizedFilename,
      thumbnailFilename: thumbFilename,
    };
  } catch {
    await fsPromises.unlink(optimizedPath).catch(() => undefined);
    return { filename: file.filename };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('digital-media')
export class DigitalMediaController {
  constructor(private readonly digitalMediaService: DigitalMediaService) {}

  @Get('categories')
  getCategories(@Query('all') all?: string) {
    return this.digitalMediaService.getCategories(all !== '1');
  }

  @Get('templates')
  listTemplates(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('media_type') mediaType?: 'image' | 'video',
    @Query('include_details') includeDetails?: string,
  ) {
    return this.digitalMediaService.listPublicTemplates(
      { category, search, media_type: mediaType },
      { includeDetails: includeDetails === '1' },
    );
  }

  @Get('templates/:slug')
  getTemplate(@Param('slug') slug: string) {
    return this.digitalMediaService.getPublicTemplateBySlug(slug);
  }

  @Get('daily-quota')
  getDailyQuota(@Request() req: { user?: { sub?: number; role?: string } }) {
    return this.digitalMediaService.getDailyQuotaStatus({
      userId: req.user?.sub,
      role: req.user?.role,
    });
  }

  @Post('generate')
  generate(@Request() req: { user?: { sub?: number; role?: string } }, @Body() dto: GenerateFromTemplateDto) {
    return this.digitalMediaService.generateFromTemplate(dto, {
      userId: req.user?.sub,
      role: req.user?.role,
    });
  }

  @Post('generate-async')
  generateAsync(@Request() req: { user?: { sub?: number; role?: string } }, @Body() dto: GenerateFromTemplateDto) {
    return this.digitalMediaService.startGenerateFromTemplate(dto, {
      userId: req.user?.sub,
      role: req.user?.role,
    });
  }

  @Get('jobs/:jobId')
  getGenerationJob(@Param('jobId') jobId: string) {
    return this.digitalMediaService.getGenerationJob(Number(jobId));
  }

  @Post('video/generate')
  generateVideoDirect(
    @Request() req: { user?: { sub?: number; role?: string } },
    @Body()
    body: {
      reference_image_url?: string;
      prompt?: string;
      aspect_ratio?: '9:16' | '16:9';
    },
  ) {
    if (req.user?.role !== 'super_admin') {
      throw new ForbiddenException('Coming soon');
    }

    return this.digitalMediaService.generateVideoDirect(
      {
        reference_image_url: String(body.reference_image_url || '').trim(),
        prompt: String(body.prompt || '').trim(),
        aspect_ratio: body.aspect_ratio === '16:9' ? '16:9' : '9:16',
      },
      {
        userId: req.user?.sub,
        role: req.user?.role,
      },
    );
  }

  @Post('video/generate-async')
  generateVideoDirectAsync(
    @Request() req: { user?: { sub?: number; role?: string } },
    @Body()
    body: {
      reference_image_url?: string;
      prompt?: string;
      aspect_ratio?: '9:16' | '16:9';
      resolution?: '720p' | '1080p';
    },
  ) {
    if (!['super_admin', 'group_admin'].includes(req.user?.role || '')) {
      throw new ForbiddenException('Coming soon');
    }

    return this.digitalMediaService.startGenerateVideoDirect(
      {
        reference_image_url: String(body.reference_image_url || '').trim(),
        prompt: String(body.prompt || '').trim(),
        aspect_ratio: body.aspect_ratio === '16:9' ? '16:9' : '9:16',
        resolution: body.resolution === '1080p' ? '1080p' : '720p',
      },
      {
        userId: req.user?.sub,
        role: req.user?.role,
      },
    );
  }

  @Post('image/generate-async')
  generateImageDirectAsync(
    @Request() req: { user?: { sub?: number; role?: string } },
    @Body() body: GenerateImageDirectDto,
  ) {
    return this.digitalMediaService.startGenerateImageDirect(
      {
        prompt: String(body.prompt || '').trim(),
        reference_image_urls: Array.isArray(body.reference_image_urls) ? body.reference_image_urls : [],
        aspect_ratio: body.aspect_ratio,
      },
      {
        userId: req.user?.sub,
        role: req.user?.role,
      },
    );
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only image files are allowed (jpg, png, webp, gif)'), false);
        }
      },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user?: { sub?: number | string } },
  ) {
    if (!req.user?.sub) {
      throw new BadRequestException('User not authenticated');
    }
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return optimizeUploadedImage(file).then((result) => ({
      url: `/api/uploads/digital-media/${result.filename}`,
      filename: result.filename,
      thumbnail_url: result.thumbnailFilename ? `/api/uploads/digital-media/${result.thumbnailFilename}` : null,
    }));
  }
}
