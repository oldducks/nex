import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const createStorage = (subFolder: string = '') => diskStorage({
    destination: (req: any, file, cb) => {
        const userId = req.user?.sub || 'anonymous';
        const uploadPath = join(process.cwd(), 'uploads', String(userId), subFolder);

        if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `${timestamp}-${randomStr}${ext}`);
    }
});

@Controller('uploads')
export class UploadsController {
    @UseGuards(JwtAuthGuard)
    @Post('image')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req: any, file, cb) => {
                const userId = req.user?.sub || 'anonymous';
                const uploadPath = join(process.cwd(), 'uploads', String(userId));

                // Create directory if it doesn't exist
                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true });
                }

                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const timestamp = Date.now();
                const randomStr = Math.random().toString(36).substring(2, 8);
                const ext = extname(file.originalname).toLowerCase();
                cb(null, `${timestamp}-${randomStr}${ext}`);
            }
        }),
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Only image files are allowed (jpg, png, gif, webp)'), false);
            }
        }
    }))
    uploadImage(@UploadedFile() file: any, @Request() req) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const userId = req.user?.sub || 'anonymous';
        const relativePath = `/uploads/${userId}/${file.filename}`;

        return {
            url: relativePath,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('video')
    @UseInterceptors(FileInterceptor('file', {
        storage: createStorage('videos'),
        limits: {
            fileSize: 100 * 1024 * 1024, // 100MB for videos
        },
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Only video files are allowed (mp4, webm, ogg, mov, avi)'), false);
            }
        }
    }))
    uploadVideo(@UploadedFile() file: any, @Request() req) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const userId = req.user?.sub || 'anonymous';
        const relativePath = `/uploads/${userId}/videos/${file.filename}`;

        return {
            url: relativePath,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype
        };
    }
}
